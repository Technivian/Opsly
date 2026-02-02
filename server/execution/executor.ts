import { storage } from "../storage";
import type { AutomationConfig, AutomationTemplate, Run } from "@shared/schema";

export interface ExecutionContext {
  runId: number;
  orgId: number;
  config: AutomationConfig;
  template: AutomationTemplate;
}

export interface ExecutionResult {
  success: boolean;
  itemsProcessed: number;
  tasksCreated?: number;
  estimatedMinutesSaved: number;
  exceptions: number;
  error?: string;
  
  // Enhanced metrics for ROI confidence scoring
  actualProcessingTimeMs?: number;  // Wall-clock execution time
  totalActions?: number;             // Total actions attempted
  successfulActions?: number;        // Actions completed without error
  
  // Template-specific metrics (optional, varies by template)
  emailsSent?: number;
  slackMessagesSent?: number;
  crmRecordsCreated?: number;
  crmRecordsUpdated?: number;
}

type TemplateExecutor = (ctx: ExecutionContext) => Promise<ExecutionResult>;

// Registry of template executors
const executors = new Map<string, TemplateExecutor>();

// Active run queue with concurrency control
interface QueuedRun {
  runId: number;
  priority: number;
  queuedAt: Date;
}

const runQueue: QueuedRun[] = [];
const activeRuns = new Set<number>();

// Execution configuration constants
export const MAX_CONCURRENT_RUNS = 5; // Max concurrent runs
export const MAX_RETRY_ATTEMPTS = 3; // Max retries (4 total attempts)
export const INITIAL_RETRY_DELAY_MS = 1000; // 1 second
export const RETRY_BACKOFF_MULTIPLIER = 2; // Doubles each retry

/**
 * Retry wrapper with exponential backoff
 * Tracks attempts in database and logs all transitions
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  runId: number
): Promise<T> {
  let lastError: Error;
  let delayMs = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS + 1; attempt++) {
    try {
      // Update attempt count in database
      await storage.updateRun(runId, { attemptCount: attempt });
      
      if (attempt > 1) {
        await log(runId, "INFO", `→ RETRYING (attempt ${attempt}/${MAX_RETRY_ATTEMPTS + 1})`);
      }

      const result = await fn();
      
      if (attempt > 1) {
        await log(runId, "INFO", `✓ Retry successful on attempt ${attempt}`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || String(error);

      // Persist error to database
      await storage.updateRun(runId, { lastError: errorMessage });

      // Check if error is non-retryable (client errors)
      const isClientError = error.statusCode >= 400 && error.statusCode < 500;
      if (isClientError) {
        await log(runId, "ERROR", `✗ Non-retryable error (${error.statusCode}): ${errorMessage}`);
        throw error;
      }

      // If we have retries left, transition to RETRYING status
      if (attempt <= MAX_RETRY_ATTEMPTS) {
        await storage.updateRun(runId, { status: "RETRYING" });
        await log(runId, "WARN", `✗ Attempt ${attempt} failed: ${errorMessage}. Retrying in ${delayMs}ms...`);
        await delay(delayMs);
        
        // Transition back to RUNNING before next attempt
        await storage.updateRun(runId, { status: "RUNNING" });
        
        delayMs = delayMs * RETRY_BACKOFF_MULTIPLIER;
      } else {
        await log(runId, "ERROR", `✗ All ${MAX_RETRY_ATTEMPTS + 1} attempts exhausted. Marking as FAILED.`);
      }
    }
  }

  throw lastError!;
}

/**
 * Register a template executor
 */
export function registerExecutor(templateKey: string, executor: TemplateExecutor) {
  executors.set(templateKey, executor);
}

/**
 * Main execution orchestrator
 */
export async function executeRun(runId: number, priority: number = 0): Promise<void> {
  // Add to queue
  runQueue.push({ runId, priority, queuedAt: new Date() });
  runQueue.sort((a, b) => b.priority - a.priority); // Higher priority first

  // Process queue
  await processQueue();
}

/**
 * Process queued runs with concurrency control
 */
async function processQueue(): Promise<void> {
  // Check if we can start a new run
  if (activeRuns.size >= MAX_CONCURRENT_RUNS || runQueue.length === 0) {
    return;
  }

  // Get next run from queue
  const queuedRun = runQueue.shift();
  if (!queuedRun) return;

  const { runId } = queuedRun;
  activeRuns.add(runId);

  try {
    await executeRunInternal(runId);
  } finally {
    activeRuns.delete(runId);
    // Broadcast run completion to WebSocket clients
    broadcastRunUpdate(runId, "COMPLETED");
    // Process next item in queue
    setImmediate(() => processQueue());
  }
}

/**
 * Internal execution logic
 */
async function executeRunInternal(runId: number): Promise<void> {
  let run: Run | null = null;
  
  try {
    // 1. Get run details
    run = await storage.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    // 2. Update status to RUNNING and initialize tracking fields
    await storage.updateRun(runId, { 
      status: "RUNNING", 
      startedAt: new Date(),
      attemptCount: 0,
      lastError: null
    });
    await log(runId, "INFO", "→ RUNNING: Starting automation run...");

    // 3. Get config and template
    const config = await storage.getAutomationConfig(run.automationConfigId);
    if (!config) {
      throw new Error(`Automation config ${run.automationConfigId} not found`);
    }

    const template = await storage.getAutomationTemplate(config.templateId);
    if (!template) {
      throw new Error(`Template ${config.templateId} not found`);
    }

    // GUARDRAIL: Prevent execution of placeholder templates
    if (template.status === "placeholder") {
      await log(runId, "ERROR", "🚫 This automation template is not yet implemented");
      await log(runId, "ERROR", `Template "${template.name}" is under development and cannot be executed yet`);
      await storage.updateRun(runId, {
        status: "FAILED",
        endedAt: new Date(),
        lastError: `Template not available: ${template.name} is under development`,
        statsJson: {
          itemsProcessed: 0,
          estimatedMinutesSaved: 0,
          exceptions: 1,
        },
      });
      return; // Exit early, don't attempt execution
    }

    // TRANSPARENCY: Warn users about demo mode execution
    if (template.status === "demo") {
      await log(runId, "WARN", "⚠️ DEMO MODE: This automation uses simulated data for demonstration purposes.");
      await log(runId, "WARN", "⚠️ No real external actions will be performed (emails, CRM updates, Slack messages, etc.)");
    }

    await log(runId, "INFO", `Executing template: ${template.name}`);

    // 4. Find and execute the template handler
    const executor = executors.get(template.key);
    if (!executor) {
      throw new Error(`No executor registered for template: ${template.key}`);
    }

    const ctx: ExecutionContext = {
      runId,
      orgId: run.orgId,
      config,
      template,
    };

    // 5. Execute the automation with retry logic
    const result = await withRetry(
      () => executor(ctx),
      runId
    );

    // 6. Update run with results
    if (result.success) {
      await log(runId, "INFO", `→ SUCCESS: Processed ${result.itemsProcessed} items`);
      await storage.updateRun(runId, {
        status: "SUCCESS",
        endedAt: new Date(),
        statsJson: {
          itemsProcessed: result.itemsProcessed,
          tasksCreated: result.tasksCreated,
          estimatedMinutesSaved: result.estimatedMinutesSaved,
          exceptions: result.exceptions,
        },
      });
    } else {
      throw new Error(result.error || "Execution failed");
    }
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    console.error(`[Executor] Run ${runId} failed:`, error);
    await log(runId, "ERROR", `→ FAILED: ${errorMessage}`);
    
    if (run) {
      await storage.updateRun(runId, {
        status: "FAILED",
        endedAt: new Date(),
        lastError: errorMessage,
        statsJson: {
          itemsProcessed: 0,
          estimatedMinutesSaved: 0,
          exceptions: 1,
        },
      });
    }
  }
}

/**
 * Log a message to the run logs and broadcast to WebSocket clients
 */
export async function log(
  runId: number, 
  level: "INFO" | "WARN" | "ERROR", 
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await storage.createRunLog({
    runId,
    level,
    message,
    metaJson: meta,
  });

  // Broadcast log to WebSocket clients
  broadcastLogUpdate(runId, { level, message, meta, ts: new Date() });
}

/**
 * Utility to simulate delay (for testing/demo purposes)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// WebSocket broadcasting (stubs - will be implemented with actual WebSocket server)
const wsClients = new Map<number, Set<any>>(); // runId -> Set of WebSocket connections

function broadcastLogUpdate(runId: number, logData: any): void {
  const clients = wsClients.get(runId);
  if (clients) {
    const message = JSON.stringify({ type: "log", data: logData });
    clients.forEach((ws) => {
      try {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(message);
        }
      } catch (error) {
        console.error("[WebSocket] Error broadcasting log:", error);
      }
    });
  }
}

function broadcastRunUpdate(runId: number, status: string): void {
  const clients = wsClients.get(runId);
  if (clients) {
    const message = JSON.stringify({ type: "status", data: { runId, status } });
    clients.forEach((ws) => {
      try {
        if (ws.readyState === 1) {
          ws.send(message);
        }
      } catch (error) {
        console.error("[WebSocket] Error broadcasting status:", error);
      }
    });
  }
}

/**
 * Register a WebSocket client for run updates
 */
export function registerWebSocketClient(runId: number, ws: any): void {
  if (!wsClients.has(runId)) {
    wsClients.set(runId, new Set());
  }
  wsClients.get(runId)!.add(ws);
}

/**
 * Unregister a WebSocket client
 */
export function unregisterWebSocketClient(runId: number, ws: any): void {
  const clients = wsClients.get(runId);
  if (clients) {
    clients.delete(ws);
    if (clients.size === 0) {
      wsClients.delete(runId);
    }
  }
}

/**
 * Get queue status
 */
export function getQueueStatus(): {
  queued: number;
  active: number;
  maxConcurrent: number;
} {
  return {
    queued: runQueue.length,
    active: activeRuns.size,
    maxConcurrent: MAX_CONCURRENT_RUNS,
  };
}
