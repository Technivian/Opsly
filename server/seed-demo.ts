import { db } from "./db";
import { orgs, orgMembers, intakes, blueprints, automationConfigs, runs, runLogs, metricSnapshots } from "@shared/schema";
import { storage } from "./storage";
import { eq } from "drizzle-orm";

const DEMO_USER_ID = "demo-user-id";
const DEMO_ORG_NAME = "Demo Organization";

export async function seedDemoOrganization(): Promise<void> {
  const existingMember = await db.select()
    .from(orgMembers)
    .where(eq(orgMembers.userId, DEMO_USER_ID))
    .limit(1);
  
  if (existingMember.length > 0) {
    console.log("Demo organization already seeded");
    return;
  }

  console.log("Seeding demo organization...");

  const org = await storage.createOrg({ name: DEMO_ORG_NAME });
  
  await storage.createOrgMember({
    orgId: org.id,
    userId: DEMO_USER_ID,
    role: "OWNER",
  });

  const templates = await storage.getAllAutomationTemplates();
  const emailTriageTemplate = templates.find(t => t.key === "email_task_triage");
  const leadFollowupTemplate = templates.find(t => t.key === "lead_followup");

  const intake1 = await storage.createIntake({
    orgId: org.id,
    createdByUserId: DEMO_USER_ID,
    title: "Customer Support Email Handling",
    status: "PROCESSED",
    painArea: "SUPPORT",
    answers: {
      problemDescription: "Our support team spends 3-4 hours daily manually sorting incoming emails. We receive about 150 emails per day and need to categorize them by urgency and topic, then assign them to the right team members. Currently this is done manually in Gmail and logged in a spreadsheet.",
      currentTools: ["Gmail", "Google Sheets", "Zendesk"],
      volumeMetrics: {
        emailsPerDay: 150,
        ticketsPerDay: 45,
      },
    },
  });

  const intake2 = await storage.createIntake({
    orgId: org.id,
    createdByUserId: DEMO_USER_ID,
    title: "Lead Qualification & Follow-up",
    status: "PROCESSED",
    painArea: "SALES",
    answers: {
      problemDescription: "Sales team struggles to follow up with all leads promptly. We get about 50 new leads per week from our website, and response time is critical. Currently reps manually check HubSpot and compose individual follow-up emails.",
      currentTools: ["HubSpot", "Gmail", "Calendly"],
      volumeMetrics: {
        leadsPerWeek: 50,
        emailsPerDay: 30,
      },
    },
  });

  const blueprint1 = await db.insert(blueprints).values({
    orgId: org.id,
    intakeId: intake1.id,
    title: "Customer Support Email Triage Automation",
    summary: "Automated email categorization and routing system to reduce manual sorting time by 85%. The solution uses AI to classify incoming emails by urgency and topic, automatically creates tickets in Zendesk, and routes to appropriate team members.",
    processJson: [
      {
        step: "Email arrives in support inbox",
        ownerRole: "System",
        tools: ["Gmail"],
        input: "Incoming email",
        output: "Raw email content",
        avgTimeMin: 0,
      },
      {
        step: "AI classifies email by category and urgency",
        ownerRole: "Automation",
        tools: ["OpenAI", "Custom Rules Engine"],
        input: "Email subject and body",
        output: "Category (billing, technical, general) + Urgency (high, medium, low)",
        avgTimeMin: 1,
      },
      {
        step: "Create ticket in Zendesk with classification",
        ownerRole: "Automation",
        tools: ["Zendesk API"],
        input: "Classified email data",
        output: "New Zendesk ticket",
        avgTimeMin: 1,
      },
      {
        step: "Route to appropriate team member based on skills and availability",
        ownerRole: "Automation",
        tools: ["Zendesk", "Team Availability Matrix"],
        input: "Ticket + Team availability",
        output: "Assigned ticket",
        avgTimeMin: 1,
      },
      {
        step: "Send auto-acknowledgment to customer",
        ownerRole: "Automation",
        tools: ["Gmail", "Template Engine"],
        input: "Ticket details + Customer email",
        output: "Confirmation email sent",
        avgTimeMin: 1,
      },
    ],
    bottlenecksJson: [
      {
        type: "Manual Process",
        description: "Support team manually reads and categorizes each email",
        impact: "3-4 hours/day of manual work, delayed responses during high volume",
        evidence: "150 emails/day with average 1.5 min processing time each",
      },
      {
        type: "Inconsistent Routing",
        description: "Emails sometimes assigned to wrong team members",
        impact: "Re-routing delays, customer frustration",
        evidence: "15% of tickets require reassignment",
      },
      {
        type: "Delayed Response Time",
        description: "High-priority emails not identified quickly",
        impact: "SLA breaches, customer churn risk",
        evidence: "Average first response time: 4 hours during peak times",
      },
    ],
    backlogJson: [
      {
        item: "Implement AI email classification system",
        type: "AUTOMATION",
        expectedImpact: "Reduce classification time from 1.5 min to 2 seconds per email",
        effort: "M",
        priorityScore: 95,
      },
      {
        item: "Create automated Zendesk ticket creation",
        type: "AUTOMATION",
        expectedImpact: "Eliminate manual ticket creation entirely",
        effort: "S",
        priorityScore: 90,
      },
      {
        item: "Build smart routing logic based on skills matrix",
        type: "AUTOMATION",
        expectedImpact: "Reduce mis-routes from 15% to under 3%",
        effort: "M",
        priorityScore: 85,
      },
      {
        item: "Document escalation procedures for edge cases",
        type: "SOP",
        expectedImpact: "Faster handling of unusual requests",
        effort: "S",
        priorityScore: 60,
      },
    ],
  }).returning();

  const blueprint2 = await db.insert(blueprints).values({
    orgId: org.id,
    intakeId: intake2.id,
    title: "Automated Lead Qualification & Outreach",
    summary: "AI-powered lead scoring and automated follow-up sequence to improve response time and conversion rates. System automatically qualifies leads based on company data and engagement, then sends personalized follow-up sequences.",
    processJson: [
      {
        step: "New lead captured from website form",
        ownerRole: "System",
        tools: ["Website Form", "HubSpot"],
        input: "Form submission",
        output: "New contact in HubSpot",
        avgTimeMin: 0,
      },
      {
        step: "Enrich lead data with company information",
        ownerRole: "Automation",
        tools: ["Clearbit", "LinkedIn API"],
        input: "Email and company name",
        output: "Enriched profile with company size, industry, revenue",
        avgTimeMin: 2,
      },
      {
        step: "Calculate lead score based on fit criteria",
        ownerRole: "Automation",
        tools: ["Custom Scoring Model"],
        input: "Enriched lead data",
        output: "Lead score (0-100) + qualification tier",
        avgTimeMin: 1,
      },
      {
        step: "Trigger appropriate follow-up sequence",
        ownerRole: "Automation",
        tools: ["HubSpot Sequences", "Gmail"],
        input: "Lead score + Contact info",
        output: "Personalized email sequence started",
        avgTimeMin: 1,
      },
      {
        step: "Notify sales rep for high-scoring leads",
        ownerRole: "Sales Rep",
        tools: ["Slack", "HubSpot"],
        input: "High-score lead alert",
        output: "Rep reviews and takes action",
        avgTimeMin: 5,
      },
    ],
    bottlenecksJson: [
      {
        type: "Slow Response Time",
        description: "Leads wait hours or days for initial contact",
        impact: "50% drop-off rate after 24 hours without response",
        evidence: "Average first response: 18 hours",
      },
      {
        type: "Manual Qualification",
        description: "Reps manually research each lead before reaching out",
        impact: "10-15 minutes per lead, limiting capacity",
        evidence: "Reps can only handle 15-20 leads/day",
      },
      {
        type: "Generic Messaging",
        description: "Same template used for all leads regardless of fit",
        impact: "Low engagement rates on outreach emails",
        evidence: "12% email open rate, 2% response rate",
      },
    ],
    backlogJson: [
      {
        item: "Implement real-time lead enrichment on form submission",
        type: "AUTOMATION",
        expectedImpact: "Reduce research time from 10 min to 2 seconds",
        effort: "M",
        priorityScore: 92,
      },
      {
        item: "Build automated lead scoring model",
        type: "AUTOMATION",
        expectedImpact: "Prioritize high-value leads automatically",
        effort: "M",
        priorityScore: 88,
      },
      {
        item: "Create personalized email sequence templates",
        type: "AUTOMATION",
        expectedImpact: "Increase response rate from 2% to 8%",
        effort: "S",
        priorityScore: 80,
      },
      {
        item: "Set up Slack alerts for hot leads",
        type: "AUTOMATION",
        expectedImpact: "Reduce response time to under 5 minutes for top leads",
        effort: "S",
        priorityScore: 75,
      },
    ],
  }).returning();

  if (emailTriageTemplate) {
    const config1 = await storage.createAutomationConfig({
      orgId: org.id,
      templateId: emailTriageTemplate.id,
      name: "Support Email Auto-Triage",
      configJson: {
        emailFolder: "Support Inbox",
        projectTool: "Asana",
        autoAssign: true,
        urgencyThreshold: 4,
      },
      isActive: true,
    });

    for (let i = 0; i < 5; i++) {
      const run = await storage.createRun({
        orgId: org.id,
        automationConfigId: config1.id,
        status: "SUCCESS",
        startedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 45000),
        statsJson: {
          itemsProcessed: 25 + Math.floor(Math.random() * 30),
          tasksCreated: 15 + Math.floor(Math.random() * 15),
          estimatedMinutesSaved: 45 + Math.floor(Math.random() * 30),
          exceptions: Math.random() > 0.8 ? 1 : 0,
        },
      });

      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Starting email triage automation..." });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Connected to Gmail API" });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: `Found ${run.statsJson?.itemsProcessed || 30} unprocessed emails` });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Classifying emails using AI..." });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: `Created ${run.statsJson?.tasksCreated || 20} tasks in Asana` });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Run completed successfully" });
    }
  }

  if (leadFollowupTemplate) {
    const config2 = await storage.createAutomationConfig({
      orgId: org.id,
      templateId: leadFollowupTemplate.id,
      name: "New Lead Auto-Followup",
      configJson: {
        crm: "HubSpot",
        followUpDelay: 1,
        messageTemplate: "Hi {firstName}, thanks for your interest in Ops Copilot...",
        autoSend: false,
      },
      isActive: true,
    });

    for (let i = 0; i < 3; i++) {
      const run = await storage.createRun({
        orgId: org.id,
        automationConfigId: config2.id,
        status: "SUCCESS",
        startedAt: new Date(Date.now() - (i + 1) * 48 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - (i + 1) * 48 * 60 * 60 * 1000 + 30000),
        statsJson: {
          itemsProcessed: 8 + Math.floor(Math.random() * 12),
          tasksCreated: 8 + Math.floor(Math.random() * 12),
          estimatedMinutesSaved: 20 + Math.floor(Math.random() * 20),
          exceptions: 0,
        },
      });

      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Starting lead follow-up automation..." });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Connected to HubSpot CRM" });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: `Found ${run.statsJson?.itemsProcessed || 10} new leads` });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Generating personalized messages..." });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: `Queued ${run.statsJson?.tasksCreated || 10} follow-up emails for review` });
      await storage.createRunLog({ runId: run.id, level: "INFO", message: "Run completed successfully" });
    }
  }

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const periodStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    await db.insert(metricSnapshots).values({
      orgId: org.id,
      periodStart,
      periodEnd,
      hoursSaved: 12 + Math.floor(Math.random() * 8) + (6 - i) * 2,
      cycleTimeReductionPct: 20 + Math.floor(Math.random() * 10) + (6 - i) * 3,
      confidenceScore: 70 + (6 - i) * 4 + Math.floor(Math.random() * 5),
    });
  }

  console.log("Demo organization seeded successfully!");
}
