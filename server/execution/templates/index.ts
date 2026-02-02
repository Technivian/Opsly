import { registerExecutor } from "../executor";
import { executeEmailTriage } from "./email-triage";
import { executeLeadFollowup } from "./lead-followup";
import { executeFormCrmSync } from "./form-crm-sync";
import { executeLeadSlackNotify } from "./lead-slack-notify";

/**
 * Register all template executors
 * Call this on server startup
 */
export function registerAllTemplates() {
  registerExecutor("email_task_triage", executeEmailTriage);
  registerExecutor("lead_followup", executeLeadFollowup);
  registerExecutor("form_crm_sync", executeFormCrmSync);
  registerExecutor("lead_slack_notify", executeLeadSlackNotify);
  
  // TODO: Register remaining templates as they're implemented
  // registerExecutor("invoice_intake", executeInvoiceIntake);
  // registerExecutor("data_entry_automation", executeDataEntryAutomation);
  
  console.log("[Executor] Registered 4 template executors");
}
