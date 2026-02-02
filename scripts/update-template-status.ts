#!/usr/bin/env npx tsx

/**
 * Update Template Status Script
 * 
 * This script updates existing templates to have the correct status values.
 * Run this once after adding the status field to the schema.
 */

import { db } from "../server/db";
import { automationTemplates } from "@shared/schema";
import { eq } from "drizzle-orm";

const STATUS_MAP: Record<string, "active" | "demo" | "placeholder"> = {
  email_task_triage: "demo",
  lead_followup: "demo",
  form_crm_sync: "demo",
  lead_slack_notify: "demo",
  invoice_intake: "placeholder",
  data_entry_automation: "placeholder",
};

async function updateTemplateStatuses() {
  console.log("\n🔄 Updating Template Statuses...\n");
  
  try {
    const templates = await db.select().from(automationTemplates);
    
    console.log(`Found ${templates.length} templates to update:\n`);
    
    for (const template of templates) {
      const newStatus = STATUS_MAP[template.key];
      
      if (!newStatus) {
        console.log(`⚠️  Unknown template key: ${template.key} - skipping`);
        continue;
      }
      
      if (template.status === newStatus) {
        console.log(`✅ ${template.name}: Already ${newStatus}`);
        continue;
      }
      
      await db
        .update(automationTemplates)
        .set({ status: newStatus })
        .where(eq(automationTemplates.id, template.id));
      
      console.log(`✅ ${template.name}: ${template.status} → ${newStatus}`);
    }
    
    console.log("\n✅ All template statuses updated successfully!\n");
    
  } catch (error) {
    console.error("\n❌ Error updating templates:", error);
    process.exit(1);
  }
}

updateTemplateStatuses();
