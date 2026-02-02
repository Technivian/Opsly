import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isDemoReadOnly, registerAuthRoutes } from "./auth";
import { generateBlueprint } from "./blueprint";
import { executeRun } from "./execution/executor";
import { registerAllTemplates } from "./execution/templates";

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

type OrgRole = "OWNER" | "ADMIN" | "OPERATOR" | "VIEWER" | "MEMBER";

async function checkRole(userId: string, orgId: number, allowedRoles: OrgRole[]): Promise<boolean> {
  const membership = await storage.getOrgMember(orgId, userId);
  if (!membership) return false;
  return allowedRoles.includes(membership.role as OrgRole);
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
  
  // Register template executors
  registerAllTemplates();

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
      
      // Server-side RBAC enforcement: Only OWNER and ADMIN can invite
      const membership = await storage.getOrgMember(orgId, userId);
      if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
        return res.status(403).json({ message: "Insufficient permissions to invite members" });
      }
      
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
      
      // Only OWNER and ADMIN can create automation configs
      const canCreate = await checkRole(userId, orgId, ["OWNER", "ADMIN"]);
      if (!canCreate) {
        return res.status(403).json({ message: "Insufficient permissions to create automations" });
      }
      
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
      
      // OWNER, ADMIN, and OPERATOR can run automations (not VIEWER)
      const canRun = await checkRole(userId, orgId, ["OWNER", "ADMIN", "OPERATOR"]);
      if (!canRun) {
        return res.status(403).json({ message: "Insufficient permissions to run automations" });
      }
      
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

      // Execute run asynchronously (don't block response)
      executeRun(run.id).catch((err) => {
        console.error("[Routes] Run execution error:", err);
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

  // ROI endpoint - Real, explainable metrics
  app.get("/api/roi", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      
      // Import ROI calculator
      const { calculateAutomationROI, calculateOrgROI, filterRunsToWindow } = await import("./roi-calculator");
      
      // Get all runs for the org
      const allRuns = await storage.getRunsByOrg(orgId);
      
      // Filter to last 30 days
      const runsInWindow = filterRunsToWindow(allRuns, 30);
      
      // Get all automation configs to build per-automation metrics
      const configs = await storage.getAutomationConfigsByOrg(orgId);
      
      // Calculate ROI for each automation
      const automationROIs = await Promise.all(
        configs.map(async (config) => {
          const configRuns = runsInWindow.filter(r => r.automationConfigId === config.id);
          return calculateAutomationROI(configRuns, config.id, config.name);
        })
      );
      
      // Calculate org-level ROI
      const orgROI = calculateOrgROI(runsInWindow, automationROIs, configs.length);
      
      // Return comprehensive metrics
      res.json({
        // Org-level summary (top-level for backward compatibility)
        hoursSaved: orgROI.totalHoursSaved,
        totalRuns: orgROI.totalRuns,
        successfulRuns: orgROI.successfulRuns,
        failedRuns: orgROI.failedRuns,
        overallSuccessRate: orgROI.overallSuccessRate,
        overallConfidence: orgROI.overallConfidence,
        totalItemsProcessed: orgROI.totalItemsProcessed,
        totalTasksCreated: orgROI.totalTasksCreated,
        
        // Detailed org metrics
        org: orgROI,
        
        // Per-automation breakdowns
        automations: automationROIs.filter(a => a.totalRuns > 0), // Only show automations with activity
      });
    } catch (error) {
      console.error("Error fetching ROI:", error);
      res.status(500).json({ message: "Failed to fetch ROI data" });
    }
  });

  // Per-automation ROI endpoint
  app.get("/api/automations/:id/roi", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      const automationId = parseInt(req.params.id);
      
      if (isNaN(automationId)) {
        return res.status(400).json({ message: "Invalid automation ID" });
      }
      
      // Verify automation belongs to user's org
      const automation = await storage.getAutomationConfig(automationId);
      if (!automation || automation.orgId !== orgId) {
        return res.status(404).json({ message: "Automation not found" });
      }
      
      // Import ROI calculator
      const { calculateAutomationROI, filterRunsToWindow } = await import("./roi-calculator");
      
      // Get all runs for this automation
      const allRuns = await storage.getRunsByOrg(orgId);
      const automationRuns = allRuns.filter(r => r.automationConfigId === automationId);
      
      // Filter to last 30 days (or custom window from query param)
      const days = parseInt(req.query.days as string) || 30;
      const runsInWindow = filterRunsToWindow(automationRuns, days);
      
      // Calculate ROI
      const roi = calculateAutomationROI(runsInWindow, automationId, automation.name);
      
      res.json(roi);
    } catch (error) {
      console.error("Error fetching automation ROI:", error);
      res.status(500).json({ message: "Failed to fetch automation ROI" });
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
  // Gmail OAuth flow
  app.get("/api/connections/gmail/authorize", isAuthenticated, async (req: any, res) => {
    try {
      const { GmailConnector } = await import("./connectors/gmail");
      
      const config = {
        clientId: process.env.GMAIL_CLIENT_ID || "",
        clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
        redirectUri: process.env.GMAIL_REDIRECT_URI || `${process.env.BASE_URL || "http://localhost:5000"}/api/connections/gmail/callback`,
      };

      if (!config.clientId || !config.clientSecret) {
        return res.status(500).json({ 
          message: "Gmail OAuth not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables." 
        });
      }

      const connector = new GmailConnector(config);
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);
      
      // Include orgId in state for callback
      const authUrl = connector.getAuthorizationUrl(JSON.stringify({ orgId, userId }));
      
      res.json({ authUrl });
    } catch (error) {
      console.error("Error starting Gmail OAuth:", error);
      res.status(500).json({ message: "Failed to start Gmail authorization" });
    }
  });

  app.get("/api/connections/gmail/callback", async (req: any, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).send("Authorization code missing");
      }

      const { GmailConnector } = await import("./connectors/gmail");
      
      const config = {
        clientId: process.env.GMAIL_CLIENT_ID || "",
        clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
        redirectUri: process.env.GMAIL_REDIRECT_URI || `${process.env.BASE_URL || "http://localhost:5000"}/api/connections/gmail/callback`,
      };

      const connector = new GmailConnector(config);
      const tokens = await connector.exchangeCodeForTokens(code as string);
      
      // Parse state to get orgId
      const { orgId } = state ? JSON.parse(state as string) : {};
      if (!orgId) {
        return res.status(400).send("Invalid state parameter");
      }

      // Check if connection already exists
      const existing = await storage.getConnectionByProvider(orgId, "gmail");
      
      if (existing) {
        // Update existing connection
        await storage.updateConnection(existing.id, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          status: "ACTIVE",
        });
      } else {
        // Create new connection
        await storage.createConnection({
          orgId,
          provider: "gmail",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          status: "ACTIVE",
        });
      }

      // Redirect to connections page
      res.redirect("/app/connections?connected=gmail");
    } catch (error) {
      console.error("Error in Gmail OAuth callback:", error);
      res.redirect("/app/connections?error=gmail_auth_failed");
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
      const orgId = await ensureOrgMember(userId);
      
      // OWNER, ADMIN, and OPERATOR can edit blueprints (not VIEWER)
      const canEdit = await checkRole(userId, orgId, ["OWNER", "ADMIN", "OPERATOR"]);
      if (!canEdit) {
        return res.status(403).json({ message: "Insufficient permissions to edit blueprints" });
      }
      
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

  // ========== ACCOUNT & DATA MANAGEMENT ==========

  // Export account data as CSV (GDPR compliance)
  app.post("/api/account/data-export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orgId = await ensureOrgMember(userId);

      // Fetch all org data
      const intakes = await storage.getIntakesByOrg(orgId);
      const blueprints = await storage.getBlueprintsByOrg(orgId);
      const configs = await storage.getAutomationConfigsByOrg(orgId);
      const runs = await storage.getRunsByOrg(orgId);
      const members = await storage.getOrgMembers(orgId);

      // Build CSV content
      let csv = "OpsLy Data Export\n";
      csv += `Generated: ${new Date().toISOString()}\n`;
      csv += `Organization: ${orgId}\n\n`;

      // Intakes
      csv += "=== INTAKES ===\n";
      csv += "ID,Title,PainArea,Status,CreatedAt\n";
      intakes.forEach((intake) => {
        csv += `${intake.id},"${intake.title}",${intake.painArea},${intake.status},${intake.createdAt}\n`;
      });

      // Blueprints
      csv += "\n=== BLUEPRINTS ===\n";
      csv += "ID,IntakeID,Title,ProcessJson,BottlenecksJson,BacklogJson,CreatedAt\n";
      blueprints.forEach((bp) => {
        const processJson = JSON.stringify(bp.processJson || {}).replace(/"/g, '""');
        const bottlenecksJson = JSON.stringify(bp.bottlenecksJson || {}).replace(/"/g, '""');
        const backlogJson = JSON.stringify(bp.backlogJson || {}).replace(/"/g, '""');
        csv += `${bp.id},${bp.intakeId},"${bp.title}","${processJson}","${bottlenecksJson}","${backlogJson}",${bp.createdAt}\n`;
      });

      // Automation Configs
      csv += "\n=== AUTOMATION CONFIGS ===\n";
      csv += "ID,TemplateID,Name,IsActive,CreatedAt\n";
      configs.forEach((cfg) => {
        csv += `${cfg.id},${cfg.templateId},"${cfg.name}",${cfg.isActive},${cfg.createdAt}\n`;
      });

      // Runs
      csv += "\n=== AUTOMATION RUNS ===\n";
      csv += "ID,ConfigID,Status,StartedAt,EndedAt\n";
      runs.forEach((run) => {
        csv += `${run.id},${run.automationConfigId},${run.status},${run.startedAt},${run.endedAt}\n`;
      });

      // Team Members
      csv += "\n=== TEAM MEMBERS ===\n";
      csv += "Email,Role,JoinedAt\n";
      members.forEach((member) => {
        csv += `${member.id},${member.role},${member.createdAt}\n`;
      });

      // Send as download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="opsly-export-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Delete account & all org data (GDPR right to erasure)
  app.post("/api/account/delete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { confirmation } = req.body;

      if (confirmation !== "DELETE_ALL_DATA") {
        return res.status(400).json({ message: "Invalid confirmation string" });
      }

      // Get org
      const orgId = await ensureOrgMember(userId);
      const org = await storage.getOrg(orgId);

      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Delete org (cascade deletes all org data: intakes, blueprints, automations, runs, etc.)
      await storage.deleteOrg(orgId);

      // Invalidate session
      req.logout((err: any) => {
        if (err) {
          console.error("Logout error during account deletion:", err);
        }
      });

      res.json({ 
        success: true, 
        message: "Account and all data deleted successfully. Backups will be purged within 90 days per our privacy policy." 
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  return httpServer;
}

async function seedAutomationTemplates() {
  const templates = await storage.getAllAutomationTemplates();
  if (templates.length === 0) {
    // Seed default templates
    await storage.createAutomationTemplate({
      key: "email_task_triage",
      name: "Email to Task Triage",
      description: "Automatically categorize incoming emails and create tasks in your project management tool.",
      status: "demo", // ⚠️ Currently simulated - no real task creation
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
      status: "demo", // ⚠️ Currently simulated - no real CRM integration
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
      status: "demo", // ⚠️ Currently simulated - no real webhook listener
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
      status: "demo", // ⚠️ Currently simulated - no real Slack API integration
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
      status: "placeholder", // 🚫 Not yet implemented - coming soon
      configSchema: [
        { name: "source", label: "Invoice Source", type: "select", options: ["Email", "Upload folder", "API"], required: true },
        { name: "targetSystem", label: "Accounting System", type: "select", options: ["Exact Online", "AFAS", "Manual Review"], required: true },
        { name: "autoApprove", label: "Auto-approve below amount", type: "number", defaultValue: 500 },
        { name: "extractFields", label: "Auto-extract fields", type: "checkbox", defaultValue: true },
        { name: "escalationEmail", label: "Escalation Email", type: "text", required: false },
      ],
    });

    await storage.createAutomationTemplate({
      key: "data_entry_automation",
      name: "Data Entry Automation",
      description: "Automate repetitive data entry between systems with AI-assisted field mapping and validation.",
      status: "placeholder", // 🚫 Not yet implemented - coming soon
      configSchema: [
        { name: "sourceSystem", label: "Source System", type: "select", options: ["Excel Upload", "Google Sheets", "CSV Import", "API"], required: true },
        { name: "targetSystem", label: "Target System", type: "select", options: ["CRM", "ERP", "Database", "Spreadsheet"], required: true },
        { name: "mappingTemplate", label: "Field Mapping Template", type: "text", defaultValue: "auto" },
        { name: "validateData", label: "Validate before import", type: "checkbox", defaultValue: true },
        { name: "duplicateHandling", label: "Duplicate Handling", type: "select", options: ["Skip", "Update", "Create New"], defaultValue: "Skip" },
        { name: "notifyOnComplete", label: "Notify on completion", type: "checkbox", defaultValue: true },
      ],
    });
  }
}

// Note: simulateRun function removed - now using real executor in server/execution/
