import OpenAI from "openai";
import { storage } from "./storage";
import type { Intake, ProcessStep, Bottleneck, BacklogItem } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generateBlueprint(intake: Intake, orgId: number): Promise<void> {
  console.log(`[Blueprint] Starting generation for intake ${intake.id}, org ${orgId}`);
  
  try {
    // Update status to PROCESSING
    await storage.updateIntake(intake.id, { status: "PROCESSING" });
    console.log(`[Blueprint] Intake ${intake.id} status set to PROCESSING`);
    
    const prompt = buildPrompt(intake);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are an operations analyst specializing in process optimization and automation for SMBs. 
You analyze business processes and generate structured blueprints with:
1. Process maps showing step-by-step workflows
2. Identified bottlenecks with impact assessment
3. Prioritized backlog of improvements

Always respond with valid JSON matching the requested schema.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const result = JSON.parse(content);
    
    // Create blueprint
    await storage.createBlueprint({
      orgId,
      intakeId: intake.id,
      title: result.title || `${intake.painArea} Process Blueprint`,
      summary: result.summary || "AI-generated process analysis and recommendations.",
      processJson: validateProcessSteps(result.processSteps || []),
      bottlenecksJson: validateBottlenecks(result.bottlenecks || []),
      backlogJson: validateBacklog(result.backlog || []),
    });

    // Update intake status to COMPLETED
    await storage.updateIntake(intake.id, { status: "COMPLETED" });
    
    console.log(`[Blueprint] Successfully generated blueprint for intake ${intake.id}`);
  } catch (error) {
    console.error("[Blueprint] Error generating blueprint:", error);
    
    try {
      // Mark as FAILED with error, but still create a fallback blueprint
      await storage.updateIntake(intake.id, { status: "FAILED" });
      console.log(`[Blueprint] Creating fallback blueprint for intake ${intake.id}`);
      
      // Create a default blueprint as fallback
      await storage.createBlueprint({
        orgId,
        intakeId: intake.id,
        title: `${intake.painArea} Process Blueprint`,
        summary: "Analysis based on provided intake information.",
        processJson: getDefaultProcessSteps(intake),
        bottlenecksJson: getDefaultBottlenecks(intake),
        backlogJson: getDefaultBacklog(intake),
      });
      
      console.log(`[Blueprint] Fallback blueprint created for intake ${intake.id}`);
    } catch (fallbackError) {
      console.error("[Blueprint] Failed to create fallback blueprint:", fallbackError);
    }
  }
}

function buildPrompt(intake: Intake): string {
  const answers = intake.answers || {};
  const tools = answers.currentTools?.join(", ") || "Not specified";
  const volumeInfo = answers.volumeMetrics 
    ? Object.entries(answers.volumeMetrics)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : "Not provided";

  return `Analyze this business process and generate a structured blueprint:

**Pain Area:** ${intake.painArea}
**Problem Description:** ${answers.problemDescription || "Not provided"}
**Current Tools:** ${tools}${answers.otherTools ? `, ${answers.otherTools}` : ""}
**Volume Metrics:** ${volumeInfo}

Generate a JSON response with this structure:
{
  "title": "Process Blueprint Title",
  "summary": "Brief 1-2 sentence summary of findings",
  "processSteps": [
    {
      "step": "Step name/action",
      "ownerRole": "Role responsible (e.g., Sales Rep, Support Agent)",
      "tools": ["Tool1", "Tool2"],
      "input": "What triggers/starts this step",
      "output": "What is produced/result",
      "avgTimeMin": 15
    }
  ],
  "bottlenecks": [
    {
      "type": "Category (e.g., Manual Process, Data Silos, Communication Gap)",
      "description": "What the bottleneck is",
      "impact": "High/Medium/Low",
      "evidence": "Why this is a bottleneck based on the intake"
    }
  ],
  "backlog": [
    {
      "item": "Description of improvement",
      "type": "AUTOMATION | SOP | DATA_FIX",
      "expectedImpact": "Estimated benefit",
      "effort": "S | M | L",
      "priorityScore": 85
    }
  ]
}

Include 4-8 process steps, 2-4 bottlenecks, and 3-6 backlog items. 
Prioritize automatable items and quick wins. 
Be specific and actionable based on the pain area and tools mentioned.`;
}

function validateProcessSteps(steps: any[]): ProcessStep[] {
  return steps.map((s) => ({
    step: s.step || "Unknown Step",
    ownerRole: s.ownerRole || "Team Member",
    tools: Array.isArray(s.tools) ? s.tools : [],
    input: s.input || "Process input",
    output: s.output || "Process output",
    avgTimeMin: typeof s.avgTimeMin === "number" ? s.avgTimeMin : 10,
  }));
}

function validateBottlenecks(bottlenecks: any[]): Bottleneck[] {
  return bottlenecks.map((b) => ({
    type: b.type || "Process Issue",
    description: b.description || "Identified bottleneck",
    impact: b.impact || "Medium",
    evidence: b.evidence || "Based on intake analysis",
  }));
}

function validateBacklog(items: any[]): BacklogItem[] {
  return items.map((i) => ({
    item: i.item || "Improvement item",
    type: ["AUTOMATION", "SOP", "DATA_FIX"].includes(i.type) ? i.type : "AUTOMATION",
    expectedImpact: i.expectedImpact || "Efficiency improvement",
    effort: ["S", "M", "L"].includes(i.effort) ? i.effort : "M",
    priorityScore: typeof i.priorityScore === "number" ? i.priorityScore : 50,
  }));
}

function getDefaultProcessSteps(intake: Intake): ProcessStep[] {
  const painArea = intake.painArea || "OPS";
  
  const templates: Record<string, ProcessStep[]> = {
    SALES: [
      { step: "Lead Intake", ownerRole: "Sales Rep", tools: ["CRM", "Email"], input: "New lead inquiry", output: "Lead record created", avgTimeMin: 5 },
      { step: "Lead Qualification", ownerRole: "Sales Rep", tools: ["CRM", "Phone"], input: "Lead record", output: "Qualified/Disqualified", avgTimeMin: 15 },
      { step: "Discovery Call", ownerRole: "Sales Rep", tools: ["Calendar", "Video Call"], input: "Qualified lead", output: "Needs assessment", avgTimeMin: 30 },
      { step: "Proposal Creation", ownerRole: "Sales Rep", tools: ["Doc Editor", "CRM"], input: "Needs assessment", output: "Proposal document", avgTimeMin: 60 },
      { step: "Follow-up", ownerRole: "Sales Rep", tools: ["Email", "CRM"], input: "Sent proposal", output: "Deal status update", avgTimeMin: 10 },
    ],
    SUPPORT: [
      { step: "Ticket Intake", ownerRole: "Support Agent", tools: ["Help Desk", "Email"], input: "Customer inquiry", output: "Ticket created", avgTimeMin: 3 },
      { step: "Categorization", ownerRole: "Support Agent", tools: ["Help Desk"], input: "New ticket", output: "Categorized ticket", avgTimeMin: 2 },
      { step: "Research", ownerRole: "Support Agent", tools: ["Knowledge Base", "Internal Docs"], input: "Categorized ticket", output: "Solution found", avgTimeMin: 15 },
      { step: "Response", ownerRole: "Support Agent", tools: ["Help Desk", "Email"], input: "Solution", output: "Customer response", avgTimeMin: 10 },
      { step: "Resolution", ownerRole: "Support Agent", tools: ["Help Desk"], input: "Customer confirmation", output: "Closed ticket", avgTimeMin: 5 },
    ],
    FINANCE: [
      { step: "Invoice Receipt", ownerRole: "Accountant", tools: ["Email", "Accounting Software"], input: "Vendor invoice", output: "Invoice logged", avgTimeMin: 5 },
      { step: "Validation", ownerRole: "Accountant", tools: ["Accounting Software", "Spreadsheet"], input: "Logged invoice", output: "Validated invoice", avgTimeMin: 15 },
      { step: "Approval Routing", ownerRole: "Accountant", tools: ["Email", "Approval System"], input: "Validated invoice", output: "Approval request", avgTimeMin: 5 },
      { step: "Payment Processing", ownerRole: "Accountant", tools: ["Banking", "Accounting Software"], input: "Approved invoice", output: "Payment initiated", avgTimeMin: 10 },
      { step: "Reconciliation", ownerRole: "Accountant", tools: ["Accounting Software", "Bank Statements"], input: "Payment record", output: "Reconciled entry", avgTimeMin: 10 },
    ],
    OPS: [
      { step: "Request Intake", ownerRole: "Ops Manager", tools: ["Email", "Task Tool"], input: "Internal request", output: "Task created", avgTimeMin: 5 },
      { step: "Assessment", ownerRole: "Ops Manager", tools: ["Spreadsheet", "Task Tool"], input: "New task", output: "Priority assigned", avgTimeMin: 10 },
      { step: "Resource Allocation", ownerRole: "Ops Manager", tools: ["Calendar", "Resource Planning"], input: "Prioritized task", output: "Resources assigned", avgTimeMin: 15 },
      { step: "Execution", ownerRole: "Team Member", tools: ["Various"], input: "Assigned task", output: "Task completed", avgTimeMin: 60 },
      { step: "Review", ownerRole: "Ops Manager", tools: ["Task Tool"], input: "Completed task", output: "Approved deliverable", avgTimeMin: 10 },
    ],
  };

  return templates[painArea] || templates.OPS;
}

function getDefaultBottlenecks(intake: Intake): Bottleneck[] {
  const painArea = intake.painArea || "OPS";
  
  const templates: Record<string, Bottleneck[]> = {
    SALES: [
      { type: "Manual Data Entry", description: "Lead information manually entered across multiple systems", impact: "High", evidence: "Multiple tools mentioned requiring duplicate data" },
      { type: "Follow-up Delays", description: "Inconsistent follow-up timing leads to lost opportunities", impact: "High", evidence: "No automated follow-up system in place" },
    ],
    SUPPORT: [
      { type: "Categorization Overhead", description: "Manual ticket categorization slows initial response", impact: "Medium", evidence: "Time spent on categorization before resolution" },
      { type: "Knowledge Fragmentation", description: "Information scattered across multiple sources", impact: "High", evidence: "Multiple tools used for research phase" },
    ],
    FINANCE: [
      { type: "Manual Validation", description: "Invoice validation requires manual cross-referencing", impact: "High", evidence: "Multiple data sources for validation" },
      { type: "Approval Delays", description: "Email-based approval routing causes bottlenecks", impact: "Medium", evidence: "Manual approval routing mentioned" },
    ],
    OPS: [
      { type: "Ad-hoc Prioritization", description: "Lack of systematic prioritization framework", impact: "Medium", evidence: "Manual assessment process" },
      { type: "Resource Visibility", description: "Limited visibility into resource availability", impact: "High", evidence: "Manual resource allocation" },
    ],
  };

  return templates[painArea] || templates.OPS;
}

function getDefaultBacklog(intake: Intake): BacklogItem[] {
  const painArea = intake.painArea || "OPS";
  
  const templates: Record<string, BacklogItem[]> = {
    SALES: [
      { item: "Implement automated lead capture from email to CRM", type: "AUTOMATION", expectedImpact: "Save 2+ hours/day on data entry", effort: "M", priorityScore: 90 },
      { item: "Set up automated follow-up email sequences", type: "AUTOMATION", expectedImpact: "20% improvement in response rates", effort: "S", priorityScore: 85 },
      { item: "Create proposal templates library", type: "SOP", expectedImpact: "50% faster proposal creation", effort: "S", priorityScore: 75 },
      { item: "Integrate CRM with email for activity sync", type: "DATA_FIX", expectedImpact: "Single source of truth for activities", effort: "M", priorityScore: 70 },
    ],
    SUPPORT: [
      { item: "Implement AI-powered ticket categorization", type: "AUTOMATION", expectedImpact: "70% reduction in categorization time", effort: "M", priorityScore: 88 },
      { item: "Create unified knowledge base", type: "DATA_FIX", expectedImpact: "40% faster resolution time", effort: "L", priorityScore: 82 },
      { item: "Set up auto-response for common inquiries", type: "AUTOMATION", expectedImpact: "Handle 30% of tickets automatically", effort: "M", priorityScore: 85 },
      { item: "Develop escalation SOP", type: "SOP", expectedImpact: "Consistent handling of complex issues", effort: "S", priorityScore: 65 },
    ],
    FINANCE: [
      { item: "Implement OCR for invoice data extraction", type: "AUTOMATION", expectedImpact: "80% reduction in manual entry", effort: "M", priorityScore: 92 },
      { item: "Set up automated approval workflows", type: "AUTOMATION", expectedImpact: "3x faster approvals", effort: "M", priorityScore: 88 },
      { item: "Implement automated bank reconciliation", type: "AUTOMATION", expectedImpact: "Save 5+ hours/week", effort: "L", priorityScore: 75 },
      { item: "Standardize vendor onboarding process", type: "SOP", expectedImpact: "Consistent data quality", effort: "S", priorityScore: 60 },
    ],
    OPS: [
      { item: "Implement task automation for common requests", type: "AUTOMATION", expectedImpact: "Handle 40% of requests automatically", effort: "M", priorityScore: 85 },
      { item: "Create resource capacity dashboard", type: "DATA_FIX", expectedImpact: "Real-time visibility into availability", effort: "M", priorityScore: 80 },
      { item: "Develop prioritization framework", type: "SOP", expectedImpact: "Consistent priority handling", effort: "S", priorityScore: 75 },
      { item: "Set up automated status updates", type: "AUTOMATION", expectedImpact: "Reduce status inquiry overhead", effort: "S", priorityScore: 70 },
    ],
  };

  return templates[painArea] || templates.OPS;
}
