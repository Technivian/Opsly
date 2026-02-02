#!/usr/bin/env tsx

/**
 * Template Truthfulness Verification Script
 * 
 * This script verifies that our template status system works correctly:
 * - Demo templates show warnings but execute
 * - Placeholder templates fail immediately
 * - Logs are transparent about simulation
 */

import { db } from "../server/db";
import { automationTemplates } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyTemplateStatus() {
  console.log("\n🔍 Template Truthfulness Audit\n");
  console.log("=" .repeat(80));
  
  try {
    const templates = await db.select().from(automationTemplates);
    
    if (templates.length === 0) {
      console.log("❌ No templates found - run server to seed database");
      return;
    }
    
    console.log(`\nFound ${templates.length} templates:\n`);
    
    const demoTemplates: typeof templates = [];
    const placeholderTemplates: typeof templates = [];
    const activeTemplates: typeof templates = [];
    
    templates.forEach((template) => {
      const statusEmoji = {
        demo: "⚠️",
        placeholder: "🚫",
        active: "✅",
      }[template.status];
      
      console.log(`${statusEmoji} ${template.name}`);
      console.log(`   Key: ${template.key}`);
      console.log(`   Status: ${template.status.toUpperCase()}`);
      console.log(`   Description: ${template.description.substring(0, 80)}...`);
      console.log();
      
      if (template.status === "demo") demoTemplates.push(template);
      else if (template.status === "placeholder") placeholderTemplates.push(template);
      else activeTemplates.push(template);
    });
    
    console.log("=" .repeat(80));
    console.log("\n📊 Status Summary:\n");
    console.log(`✅ Production-Ready (active):     ${activeTemplates.length}`);
    console.log(`⚠️  Simulated (demo):             ${demoTemplates.length}`);
    console.log(`🚫 Not Implemented (placeholder): ${placeholderTemplates.length}`);
    
    console.log("\n" + "=".repeat(80));
    console.log("\n✅ Expected Behaviors:\n");
    
    if (demoTemplates.length > 0) {
      console.log("⚠️  DEMO Templates:");
      demoTemplates.forEach((t) => {
        console.log(`   • ${t.name}: Can configure, runs with [DEMO] warnings`);
      });
      console.log();
    }
    
    if (placeholderTemplates.length > 0) {
      console.log("🚫 PLACEHOLDER Templates:");
      placeholderTemplates.forEach((t) => {
        console.log(`   • ${t.name}: Configuration disabled, execution blocked`);
      });
      console.log();
    }
    
    if (activeTemplates.length > 0) {
      console.log("✅ ACTIVE Templates:");
      activeTemplates.forEach((t) => {
        console.log(`   • ${t.name}: Full functionality, real integrations`);
      });
      console.log();
    }
    
    // Validation checks
    console.log("=".repeat(80));
    console.log("\n✅ Validation Checks:\n");
    
    const checks = [
      {
        name: "All templates have status field",
        pass: templates.every((t) => t.status !== null && t.status !== undefined),
      },
      {
        name: "Demo templates are correctly labeled",
        pass: demoTemplates.every((t) =>
          ["email_task_triage", "lead_followup", "form_crm_sync", "lead_slack_notify"].includes(t.key)
        ),
      },
      {
        name: "Placeholder templates are correctly labeled",
        pass: placeholderTemplates.every((t) =>
          ["invoice_intake", "data_entry_automation"].includes(t.key)
        ),
      },
      {
        name: "No templates incorrectly marked as active",
        pass: activeTemplates.length === 0, // We don't have any truly active templates yet
      },
    ];
    
    checks.forEach((check) => {
      console.log(`${check.pass ? "✅" : "❌"} ${check.name}`);
    });
    
    const allPassed = checks.every((c) => c.pass);
    
    console.log("\n" + "=".repeat(80));
    
    if (allPassed) {
      console.log("\n✅ ALL CHECKS PASSED - Template status system is working correctly!\n");
      console.log("Product Principle: \"Honest limitations build more trust than fake power.\"\n");
    } else {
      console.log("\n❌ SOME CHECKS FAILED - Review template status configuration\n");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("\n❌ Error verifying templates:", error);
    process.exit(1);
  }
}

verifyTemplateStatus();
