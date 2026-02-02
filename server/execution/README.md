# Automation Execution Engine

This directory contains the core automation execution infrastructure for Ops Copilot.

## Architecture

### Orchestrator (`executor.ts`)
- Manages the run lifecycle: QUEUED → RUNNING → SUCCESS/FAILED
- Maintains a registry of template executors
- Handles errors and logs all execution events
- Updates run statistics on completion

### Template Executors (`templates/`)
Each template is implemented as a separate module that:
1. Receives an `ExecutionContext` (run ID, org ID, config, template)
2. Executes the automation logic
3. Returns an `ExecutionResult` with metrics

## Creating a New Template

### 1. Create the executor file
```typescript
// server/execution/templates/my-template.ts
import type { ExecutionContext, ExecutionResult } from "../executor";
import { log, delay } from "../executor";

export async function executeMyTemplate(ctx: ExecutionContext): ExecutionResult {
  const { runId, config } = ctx;
  
  try {
    await log(runId, "INFO", "Starting execution...");
    
    // Your automation logic here
    const itemsProcessed = 10;
    const minutesSaved = itemsProcessed * 5;
    
    await log(runId, "INFO", "Execution completed");
    
    return {
      success: true,
      itemsProcessed,
      estimatedMinutesSaved: minutesSaved,
      exceptions: 0,
    };
  } catch (error: any) {
    await log(runId, "ERROR", error.message);
    return {
      success: false,
      itemsProcessed: 0,
      estimatedMinutesSaved: 0,
      exceptions: 1,
      error: error.message,
    };
  }
}
```

### 2. Register the executor
```typescript
// server/execution/templates/index.ts
import { executeMyTemplate } from "./my-template";

export function registerAllTemplates() {
  registerExecutor("my_template_key", executeMyTemplate);
  // ...
}
```

### 3. Add template metadata to database
```typescript
// server/routes.ts - in seedAutomationTemplates()
await storage.createAutomationTemplate({
  key: "my_template_key",
  name: "My Template Name",
  description: "What this template does",
  configSchema: [
    { name: "setting1", label: "Setting 1", type: "text", required: true },
  ],
});
```

## Current Templates

### ✅ Implemented
- **email_task_triage**: Processes emails and creates tasks (simulated)
- **lead_followup**: Sends follow-up emails to CRM leads (simulated)

### 🚧 TODO
- **form_crm_sync**: Sync form submissions to CRM
- **lead_slack_notify**: Notify Slack on qualified leads
- **invoice_intake**: Extract invoice data and push to accounting
- **data_entry_automation**: Automated data transfer between systems

## Testing

Run a template via the API:
```bash
POST /api/automations/run
{
  "configId": 1
}
```

Watch logs in real-time:
```bash
GET /api/runs/{runId}/logs
```

## Next Steps

1. **Implement real integrations** (Gmail, HubSpot, Slack OAuth)
2. **Add retry logic** with exponential backoff
3. **WebSocket streaming** for live log updates
4. **Queue management** for parallel execution limits
5. **Scheduled runs** (cron-based triggers)
