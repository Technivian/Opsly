import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isDemoReadOnly, registerAuthRoutes } from "./auth";
import { generateBlueprint } from "./blueprint";

// Configure file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

async function ensureOrgMember(userId: string): Promise<number> {
  let org = await storage.getOrgByUserId(userId);
  if (!org) {
    org = await storage.createOrg({ name: "My Organization" });
    await storage.createOrgMember({
      orgId: org.id,
      userId,
      role: "OWNER",
    });
  }
  return org.id;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (passport, sessions) first
  await setupAuth(app);
  
  // Register auth routes
  registerAuthRoutes(app);

  // Seed automation templates if not exist
  await seedAutomationTemplates();

  // Organization endpoints
  app.get("/api/org", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const org = await storage.getOrg(orgId);
      res.json(org);
    } catch (error) {
      console.error("Error fetching org:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.get("/api/org/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const members = await storage.getOrgMembers(orgId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/org/invite", isAuthenticated, isDemoReadOnly, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const { email, role } = req.body;
      // In MVP, just return success (actual email invites would require email service)
      res.json({ success: true, message: `Invitation sent to ${email}` });
    } catch (error) {
      console.error("Error sending invite:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  // Intakes endpoints
  app.get("/api/intakes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const intakes = await storage.getIntakesByOrg(orgId);
      res.json(intakes);
    } catch (error) {
      console.error("Error fetching intakes:", error);
      res.status(500).json({ message: "Failed to fetch intakes" });
    }
  });

  app.get("/api/intakes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const intake = await storage.getIntake(parseInt(req.params.id));
      if (!intake) {
        return res.status(404).json({ message: "Intake not found" });
      }
      res.json(intake);
    } catch (error) {
      console.error("Error fetching intake:", error);
      res.status(500).json({ message: "Failed to fetch intake" });
    }
  });

  app.post("/api/intakes", isAuthenticated, isDemoReadOnly, upload.array("files", 10), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const { title, painArea, answers } = req.body;

      const intake = await storage.createIntake({
        orgId,
        createdByUserId: userId,
        title: title || `${painArea} Process Intake`,
        status: "SUBMITTED",
        painArea: painArea as any,
        answers: answers ? JSON.parse(answers) : undefined,
      });

      // Handle file uploads
      if (req.files) {
        for (const file of req.files as Express.Multer.File[]) {
          await storage.createUpload({
            orgId,
            intakeId: intake.id,
            filename: file.originalname,
            path: file.path,
            mime: file.mimetype,
            size: file.size,
          });
        }
      }

      // Generate blueprint asynchronously
      generateBlueprint(intake, orgId).catch((err) => {
        console.error("Blueprint generation error:", err);
      });

      res.json(intake);
    } catch (error) {
      console.error("Error creating intake:", error);
      res.status(500).json({ message: "Failed to create intake" });
    }
  });

  // Blueprints endpoints
  app.get("/api/blueprints", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const blueprints = await storage.getBlueprintsByOrg(orgId);
      res.json(blueprints);
    } catch (error) {
      console.error("Error fetching blueprints:", error);
      res.status(500).json({ message: "Failed to fetch blueprints" });
    }
  });

  app.get("/api/blueprints/:id", isAuthenticated, async (req: any, res) => {
    try {
      const blueprint = await storage.getBlueprint(parseInt(req.params.id));
      if (!blueprint) {
        return res.status(404).json({ message: "Blueprint not found" });
      }
      res.json(blueprint);
    } catch (error) {
      console.error("Error fetching blueprint:", error);
      res.status(500).json({ message: "Failed to fetch blueprint" });
    }
  });

  // Automation templates endpoints
  app.get("/api/automations/templates", isAuthenticated, async (req: any, res) => {
    try {
      const templates = await storage.getAllAutomationTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/automations/templates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const template = await storage.getAutomationTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Automation configs endpoints
  app.get("/api/automations/configs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const configs = await storage.getAutomationConfigsByOrg(orgId);
      res.json(configs);
    } catch (error) {
      console.error("Error fetching configs:", error);
      res.status(500).json({ message: "Failed to fetch configs" });
    }
  });

  app.post("/api/automations/configs", isAuthenticated, isDemoReadOnly, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const { templateId, name, configJson, isActive } = req.body;

      const config = await storage.createAutomationConfig({
        orgId,
        templateId,
        name,
        configJson,
        isActive: isActive ?? true,
      });

      res.json(config);
    } catch (error) {
      console.error("Error creating config:", error);
      res.status(500).json({ message: "Failed to create config" });
    }
  });

  app.post("/api/automations/configs/:id/run", isAuthenticated, isDemoReadOnly, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const configId = parseInt(req.params.id);

      const config = await storage.getAutomationConfig(configId);
      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }

      // Create a run
      const run = await storage.createRun({
        orgId,
        automationConfigId: configId,
        status: "QUEUED",
      });

      // Simulate run execution asynchronously
      simulateRun(run.id).catch((err) => {
        console.error("Run execution error:", err);
      });

      res.json(run);
    } catch (error) {
      console.error("Error starting run:", error);
      res.status(500).json({ message: "Failed to start run" });
    }
  });

  // Runs endpoints
  app.get("/api/runs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const runs = await storage.getRunsByOrg(orgId);
      res.json(runs);
    } catch (error) {
      console.error("Error fetching runs:", error);
      res.status(500).json({ message: "Failed to fetch runs" });
    }
  });

  app.get("/api/runs/:id/logs", isAuthenticated, async (req: any, res) => {
    try {
      const runId = parseInt(req.params.id);
      const logs = await storage.getRunLogs(runId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching run logs:", error);
      res.status(500).json({ message: "Failed to fetch run logs" });
    }
  });

  // ROI endpoint
  app.get("/api/roi", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const runs = await storage.getRunsByOrg(orgId);
      
      const successfulRuns = runs.filter((r) => r.status === "SUCCESS");
      let totalMinutesSaved = 0;
      let totalItemsProcessed = 0;
      let totalTasksCreated = 0;

      for (const run of successfulRuns) {
        if (run.statsJson) {
          totalMinutesSaved += run.statsJson.estimatedMinutesSaved || 0;
          totalItemsProcessed += run.statsJson.itemsProcessed || 0;
          totalTasksCreated += run.statsJson.tasksCreated || 0;
        }
      }

      const hoursSaved = Math.round(totalMinutesSaved / 60);
      const cycleTimeReduction = successfulRuns.length > 0 ? Math.min(50, Math.round(successfulRuns.length * 5)) : 0;
      const confidenceScore = Math.min(100, Math.round((successfulRuns.length / Math.max(1, runs.length)) * 100));

      res.json({
        hoursSaved,
        cycleTimeReduction,
        confidenceScore,
        totalRuns: runs.length,
        successfulRuns: successfulRuns.length,
        totalItemsProcessed,
        totalTasksCreated,
      });
    } catch (error) {
      console.error("Error fetching ROI:", error);
      res.status(500).json({ message: "Failed to fetch ROI data" });
    }
  });

  // Connections endpoints
  app.get("/api/connections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const connections = await storage.getConnections(orgId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post("/api/connections", isAuthenticated, isDemoReadOnly, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const { provider, apiKey } = req.body;

      const connection = await storage.createConnection({
        orgId,
        provider,
        status: apiKey ? "connected" : "pending",
        accessToken: apiKey || null,
        accountName: apiKey ? `${provider} Account` : null,
      });

      res.json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.delete("/api/connections/:id", isAuthenticated, isDemoReadOnly, async (req: any, res) => {
    try {
      const connectionId = parseInt(req.params.id);
      await storage.deleteConnection(connectionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting connection:", error);
      res.status(500).json({ message: "Failed to delete connection" });
    }
  });

  // User preferences endpoints
  app.get("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let prefs = await storage.getUserPreferences(userId);
      if (!prefs) {
        prefs = await storage.upsertUserPreferences({ userId, locale: "en", theme: "system" });
      }
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.patch("/api/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { locale, theme } = req.body;
      const prefs = await storage.upsertUserPreferences({ userId, locale, theme });
      res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Blueprint editing and sharing
  app.patch("/api/blueprints/:id", isAuthenticated, isDemoReadOnly, async (req: any, res) => {
    try {
      const blueprintId = parseInt(req.params.id);
      const userId = req.user.id;
      const { title, summary, processJson, bottlenecksJson, backlogJson } = req.body;

      const existingBlueprint = await storage.getBlueprint(blueprintId);
      if (!existingBlueprint) {
        return res.status(404).json({ message: "Blueprint not found" });
      }

      const versions = await storage.getBlueprintVersions(blueprintId);
      const nextVersion = (versions[0]?.version || 0) + 1;

      await storage.createBlueprintVersion({
        blueprintId,
        version: nextVersion,
        title: existingBlueprint.title,
        summary: existingBlueprint.summary,
        processJson: existingBlueprint.processJson,
        bottlenecksJson: existingBlueprint.bottlenecksJson,
        backlogJson: existingBlueprint.backlogJson,
        editedByUserId: userId,
      });

      const updated = await storage.updateBlueprint(blueprintId, {
        title: title || existingBlueprint.title,
        summary: summary || existingBlueprint.summary,
        processJson: processJson || existingBlueprint.processJson,
        bottlenecksJson: bottlenecksJson || existingBlueprint.bottlenecksJson,
        backlogJson: backlogJson || existingBlueprint.backlogJson,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating blueprint:", error);
      res.status(500).json({ message: "Failed to update blueprint" });
    }
  });

  app.post("/api/blueprints/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const blueprintId = parseInt(req.params.id);
      const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const share = await storage.createBlueprintShare({
        blueprintId,
        shareToken,
        isActive: true,
      });

      res.json({ shareUrl: `/share/${share.shareToken}` });
    } catch (error) {
      console.error("Error creating share link:", error);
      res.status(500).json({ message: "Failed to create share link" });
    }
  });

  app.get("/api/share/:token", async (req: any, res) => {
    try {
      const { token } = req.params;
      const share = await storage.getBlueprintShare(token);

      if (!share || !share.isActive) {
        return res.status(404).json({ message: "Share link not found or expired" });
      }

      if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
        return res.status(410).json({ message: "Share link has expired" });
      }

      const blueprint = await storage.getBlueprint(share.blueprintId);
      res.json(blueprint);
    } catch (error) {
      console.error("Error fetching shared blueprint:", error);
      res.status(500).json({ message: "Failed to fetch shared blueprint" });
    }
  });

  return httpServer;
}

async function seedAutomationTemplates() {
  const templates = await storage.getAllAutomationTemplates();
  if (templates.length === 0) {
    // Seed default templates
    await storage.createAutomationTemplate({
      key: "email_to_task_triage",
      name: "Email to Task Triage",
      description: "Automatically categorize incoming emails and create tasks in your project management tool.",
      configSchema: [
        { name: "emailFolder", label: "Email Folder", type: "text", required: true, defaultValue: "Inbox" },
        { name: "projectTool", label: "Project Tool", type: "select", options: ["Asana", "Jira", "Trello", "Monday"], required: true },
        { name: "autoAssign", label: "Auto-assign to team", type: "checkbox", defaultValue: true },
        { name: "urgencyThreshold", label: "Urgency threshold (hours)", type: "number", defaultValue: 24 },
      ],
    });

    await storage.createAutomationTemplate({
      key: "lead_followup",
      name: "Lead Follow-up",
      description: "Generate and queue personalized follow-up messages for new leads in your CRM.",
      configSchema: [
        { name: "crm", label: "CRM System", type: "select", options: ["Salesforce", "HubSpot", "Pipedrive"], required: true },
        { name: "followUpDelay", label: "Follow-up delay (days)", type: "number", defaultValue: 2 },
        { name: "messageTemplate", label: "Message Template", type: "text", required: false },
        { name: "autoSend", label: "Auto-send messages", type: "checkbox", defaultValue: false },
      ],
    });

    await storage.createAutomationTemplate({
      key: "form_crm_sync",
      name: "Form to CRM Sync",
      description: "Automatically sync form submissions from Google Forms or Typeform to your CRM.",
      configSchema: [
        { name: "formSource", label: "Form Source", type: "select", options: ["Google Forms", "Typeform", "JotForm"], required: true },
        { name: "targetCrm", label: "Target CRM", type: "select", options: ["HubSpot", "Salesforce", "Exact Online"], required: true },
        { name: "fieldMapping", label: "Field Mapping Template", type: "text", defaultValue: "auto" },
        { name: "createContact", label: "Create new contacts", type: "checkbox", defaultValue: true },
        { name: "notifyOnSync", label: "Notify on sync", type: "checkbox", defaultValue: false },
      ],
    });

    await storage.createAutomationTemplate({
      key: "lead_slack_notify",
      name: "Lead Assignment Slack Notification",
      description: "Send a Slack message to the assigned salesperson when a lead reaches a certain score.",
      configSchema: [
        { name: "crm", label: "CRM System", type: "select", options: ["HubSpot", "Salesforce", "Pipedrive"], required: true },
        { name: "scoreThreshold", label: "Score Threshold", type: "number", defaultValue: 50 },
        { name: "slackChannel", label: "Slack Channel", type: "text", defaultValue: "#sales" },
        { name: "messageTemplate", label: "Custom Message", type: "text", defaultValue: "New qualified lead assigned to you!" },
        { name: "mentionUser", label: "Mention assigned user", type: "checkbox", defaultValue: true },
      ],
    });

    await storage.createAutomationTemplate({
      key: "invoice_intake",
      name: "Invoice Intake and Coding",
      description: "Capture invoice PDFs/emails, extract data using AI, and push to Exact Online or AFAS.",
      configSchema: [
        { name: "source", label: "Invoice Source", type: "select", options: ["Email", "Upload folder", "API"], required: true },
        { name: "targetSystem", label: "Accounting System", type: "select", options: ["Exact Online", "AFAS", "Manual Review"], required: true },
        { name: "autoApprove", label: "Auto-approve below amount", type: "number", defaultValue: 500 },
        { name: "extractFields", label: "Auto-extract fields", type: "checkbox", defaultValue: true },
        { name: "escalationEmail", label: "Escalation Email", type: "text", required: false },
      ],
    });
  }
}

async function simulateRun(runId: number) {
  // Simulate run execution
  await storage.updateRun(runId, { status: "RUNNING", startedAt: new Date() });
  
  await storage.createRunLog({ runId, level: "INFO", message: "Starting automation run..." });
  await delay(500);
  
  await storage.createRunLog({ runId, level: "INFO", message: "Connecting to data sources..." });
  await delay(800);
  
  await storage.createRunLog({ runId, level: "INFO", message: "Processing items..." });
  await delay(1000);

  const itemsProcessed = Math.floor(Math.random() * 20) + 5;
  const tasksCreated = Math.floor(itemsProcessed * 0.6);
  const minutesSaved = itemsProcessed * 5;

  for (let i = 1; i <= itemsProcessed; i++) {
    await storage.createRunLog({ 
      runId, 
      level: "INFO", 
      message: `Processed item ${i}/${itemsProcessed}`,
      metaJson: { itemId: i }
    });
    await delay(100);
  }

  // Random chance of warning
  if (Math.random() > 0.7) {
    await storage.createRunLog({ 
      runId, 
      level: "WARN", 
      message: "Some items required manual review" 
    });
  }

  await storage.createRunLog({ runId, level: "INFO", message: `Created ${tasksCreated} tasks` });
  await delay(300);
  
  await storage.createRunLog({ runId, level: "INFO", message: "Run completed successfully" });

  await storage.updateRun(runId, { 
    status: "SUCCESS", 
    endedAt: new Date(),
    statsJson: {
      itemsProcessed,
      tasksCreated,
      estimatedMinutesSaved: minutesSaved,
      exceptions: 0,
    }
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
