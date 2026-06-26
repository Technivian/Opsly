/**
 * Opsly integration catalogue with explicit, evidence-based status.
 *
 * Status meaning:
 *  - "available": a working implementation is verified in the repository.
 *  - "pilot":     implemented but offered under pilot / early-access conditions.
 *  - "planned":   listed in the product UI but not yet implemented in the backend.
 *
 * Evidence (as of this phase):
 *  - Only `server/connectors/gmail.ts` contains a real connector implementation
 *    (GmailConnector + OAuth wiring). It is offered under pilot conditions.
 *  - Outlook, Slack, HubSpot, Salesforce, Exact Online and AFAS are present in
 *    the connections UI but have NO backend connector implementation. The
 *    automation templates that reference Slack are explicitly marked as
 *    simulated in server/routes.ts. They are therefore "planned".
 *
 * Do NOT mark an integration "available" unless its working implementation is
 * verified.
 */

export type IntegrationStatus = "available" | "pilot" | "planned";

export interface Integration {
  key: string;
  name: string;
  /** Short, factual description of what the integration is for. */
  category: "email" | "communication" | "crm" | "accounting";
  status: IntegrationStatus;
}

export const integrations: Integration[] = [
  { key: "gmail", name: "Gmail / Google Workspace", category: "email", status: "pilot" },
  { key: "outlook", name: "Microsoft 365 / Outlook", category: "email", status: "planned" },
  { key: "slack", name: "Slack", category: "communication", status: "planned" },
  { key: "hubspot", name: "HubSpot", category: "crm", status: "planned" },
  { key: "salesforce", name: "Salesforce", category: "crm", status: "planned" },
  { key: "exact", name: "Exact Online", category: "accounting", status: "planned" },
  { key: "afas", name: "AFAS", category: "accounting", status: "planned" },
];
