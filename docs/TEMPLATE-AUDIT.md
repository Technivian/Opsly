# Automation Template Truthfulness Audit

**Date**: February 2, 2026  
**Auditor**: System Review  
**Product Principle**: "Honest limitations build more trust than fake power."

---

## Template Status Matrix

| Template Key | Name | Status | Implementation Level | User Label |
|--------------|------|--------|---------------------|------------|
| `email_task_triage` | Email to Task Triage | **SIMULATED** | Partial Gmail integration, simulated task creation | ⚠️ **Demo Mode** |
| `lead_followup` | Lead Follow-up | **SIMULATED** | No CRM integration, simulated email sending | ⚠️ **Demo Mode** |
| `form_crm_sync` | Form to CRM Sync | **SIMULATED** | No webhook listener, simulated CRM writes | ⚠️ **Demo Mode** |
| `lead_slack_notify` | Lead Slack Notification | **SIMULATED** | No Slack API, simulated notifications | ⚠️ **Demo Mode** |
| `invoice_intake` | Invoice Intake and Coding | **PLACEHOLDER** | No implementation, template metadata only | 🚫 **Not Available** |
| `data_entry_automation` | Data Entry Automation | **PLACEHOLDER** | No implementation, template metadata only | 🚫 **Not Available** |

---

## Detailed Findings

### ✅ Implemented Components

1. **Execution Framework** - Full implementation
   - Run orchestration with concurrency control (5 max concurrent)
   - Retry mechanism (3 attempts, exponential backoff)
   - State machine (QUEUED → RUNNING → SUCCESS/FAILED/RETRYING)
   - Database persistence and logging

2. **ROI Calculation** - Full implementation
   - Real confidence scoring (success rate + consistency + volume)
   - 30-day rolling window metrics
   - Per-automation and org-level aggregation
   - Explainable formulas

3. **Partial Gmail Integration** (email_task_triage only)
   - Gmail OAuth connection flow exists
   - Can fetch unread emails via Gmail API
   - Falls back to simulation if not connected

### ⚠️ Simulated Components

All 4 active templates (`email_task_triage`, `lead_followup`, `form_crm_sync`, `lead_slack_notify`) use simulated execution:

**What's Simulated**:
- Random item counts (e.g., "3-12 leads", "5-20 emails")
- Delays to mimic API calls (`await delay(300)`)
- Fake success states without actual external API calls
- Logs that say "Sent email" or "Created task" without doing so
- CRM reads/writes (HubSpot, Salesforce, Pipedrive)
- Slack message posting
- Task creation in project tools (Asana, Jira, Trello)

**What's Real**:
- Run status tracking (SUCCESS/FAILED)
- Exception counting (simulated random errors)
- Time saved calculations (based on simulated item counts)
- Database persistence of run results
- Log entries showing execution flow

**Current Honesty Level**: 3/10
- Templates have TODO comments acknowledging simulation
- Logs mention "simulated" in WARN messages sometimes
- UI shows no indication that execution is simulated
- Users see "Run Successful" without knowing nothing external happened

### 🚫 Placeholder Templates

2 templates exist in database but have **no executor implementation**:

1. **`invoice_intake`** - Registered in database, shows in UI, but has no code
2. **data_entry_automation`** - Registered in database, shows in UI, but has no code

**Current Behavior**: If user tries to run these, the system will:
- Accept the run request
- Create a run record with QUEUED status
- Fail with "No executor registered for template: invoice_intake"
- Log error and mark run as FAILED

**Honesty Level**: 2/10 (fails but doesn't prevent configuration)

---

## Truthfulness Violations

### Critical Issues

1. **UI Promises vs. Reality**
   - Template cards show "Active" badges for simulated templates
   - No visual distinction between real and simulated functionality
   - "Configure" button implies the automation will actually work
   - Run success messages imply external actions happened

2. **Misleading Logs**
   ```typescript
   await log(runId, "INFO", `Sent follow-up email to lead ${i}`);
   ```
   This log appears without actually sending an email. Users reading logs believe work was done.

3. **False Success States**
   ```typescript
   return {
     success: true,  // ← Misleading
     itemsProcessed: 10,
     estimatedMinutesSaved: 100,
   };
   ```
   Run marked successful even though no emails sent, no tasks created, no CRM updated.

4. **Hidden Placeholder Templates**
   - `invoice_intake` and `data_entry_automation` appear configurable
   - Users can create configs, but execution always fails
   - No warning that these are not implemented yet

### Medium Issues

5. **ROI Claims on Simulated Work**
   - Time saved calculations are accurate math
   - But the work being "saved" never actually happened
   - Confidence scores are real, but confidence in what?

6. **Connection Status Ambiguity**
   - Gmail connector exists but is optional
   - Template works (simulated) even without Gmail connected
   - Unclear when real Gmail API is being used vs. simulation

---

## Required Fixes

### 1. Add Template Status Field to Database

```sql
ALTER TABLE automation_templates ADD COLUMN status TEXT DEFAULT 'active';
-- Values: 'active', 'demo', 'placeholder'
```

### 2. Mark Templates Appropriately

```typescript
email_task_triage: status = 'demo'
lead_followup: status = 'demo'
form_crm_sync: status = 'demo'
lead_slack_notify: status = 'demo'
invoice_intake: status = 'placeholder'
data_entry_automation: status = 'placeholder'
```

### 3. UI Labels (Copy Changes Only)

**Template Cards**:
```tsx
{template.status === 'demo' && (
  <Badge variant="warning">⚠️ Demo Mode</Badge>
)}
{template.status === 'placeholder' && (
  <Badge variant="secondary">🚫 Not Available</Badge>
)}
```

**Template Description Suffix**:
```tsx
{template.status === 'demo' && (
  <p className="text-sm text-orange-600 mt-2">
    ⚠️ Currently runs in demo mode with simulated data. 
    Real integrations coming soon.
  </p>
)}
```

**Prevent Configuration for Placeholders**:
```tsx
{template.status === 'placeholder' ? (
  <Button disabled variant="ghost" size="sm">
    🚫 Not Available Yet
  </Button>
) : (
  <Link href={`/app/automations/${template.id}`}>
    <Button variant="outline" size="sm">
      <Settings /> Configure
    </Button>
  </Link>
)}
```

### 4. Backend Guardrails

**Prevent Run Execution for Placeholders**:
```typescript
// In server/execution/executor.ts
if (!executors.has(templateKey)) {
  const template = await storage.getAutomationTemplateByKey(templateKey);
  
  if (template?.status === 'placeholder') {
    await log(runId, "ERROR", "This template is not yet implemented");
    await storage.updateRun(runId, {
      status: "FAILED",
      endedAt: new Date(),
      lastError: "Template not available: This automation is under development",
    });
    return;
  }
  
  // Existing error for missing executors
  throw new Error(`No executor registered for template: ${templateKey}`);
}
```

**Add Simulation Warning to All Demo Templates**:
```typescript
// At start of each simulated template
if (template.status === 'demo') {
  await log(runId, "WARN", "⚠️ DEMO MODE: This run uses simulated data. No real external actions will be performed.");
}
```

**Update Success Logs to Be Honest**:
```typescript
// Instead of:
await log(runId, "INFO", `Sent follow-up email to lead ${i}`);

// Use:
await log(runId, "INFO", `[DEMO] Simulated sending follow-up email to lead ${i}`);
```

### 5. Run Results Clarity

**Add Demo Disclaimer to Run Stats**:
```tsx
{run.template?.status === 'demo' && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Demo Mode Execution</AlertTitle>
    <AlertDescription>
      This run was simulated for demonstration purposes. 
      No real emails were sent, tasks created, or external systems updated.
    </AlertDescription>
  </Alert>
)}
```

### 6. Documentation Updates

**Add to template descriptions**:
- Demo templates: "This template currently runs in demo mode..."
- Placeholder templates: "This template is planned for future release..."

---

## Implementation Priority

### P0 (Critical - Block Misleading Users)

1. ✅ Add `status` field to `automation_templates` schema
2. ✅ Update seed data to mark templates correctly
3. ✅ Prevent execution of placeholder templates (backend)
4. ✅ Add demo mode warning to simulated template logs

### P1 (High - Clear User-Facing Labels)

5. ✅ Add status badges to template cards (UI)
6. ✅ Update template descriptions with status disclaimers
7. ✅ Disable configuration for placeholder templates
8. ✅ Add demo disclaimer to run results page

### P2 (Medium - Improve Transparency)

9. ⏳ Prefix all simulated logs with `[DEMO]`
10. ⏳ Add connection status indicators (e.g., "Gmail: Connected" vs "Gmail: Demo Mode")
11. ⏳ Show real vs simulated execution mode in run details

### P3 (Low - Future Enhancements)

12. ⏳ Add "Upgrade to Real" button for demo templates (shows integration setup)
13. ⏳ Separate ROI for demo runs vs real runs
14. ⏳ Add template marketplace with clear status filters

---

## Success Metrics

**Before Audit**:
- 0% of templates show implementation status
- 100% of simulated templates appear as production-ready
- Users can configure placeholder templates (fail on run)
- Logs make false claims ("Sent email" when nothing sent)

**After P0+P1 Fixes**:
- 100% of templates show clear status (Demo / Not Available)
- 0% of placeholder templates are configurable
- All demo runs start with simulation warning
- Users understand limitations upfront

**Long-term Goal**:
- Replace demo implementations with real integrations
- Maintain honest labeling even as capabilities grow
- Build trust through transparency

---

## Product Philosophy

This audit embodies the principle: **"Honest limitations build more trust than fake power."**

Users respect systems that:
- Admit what they can't do
- Clearly label demo vs production features
- Don't pretend to have integrations they lack
- Provide roadmap transparency

Users distrust systems that:
- Show success for actions that didn't happen
- Hide simulation behind production UX
- Make capabilities appear broader than reality
- Require debugging to discover limitations

Opsly will differentiate by being the operations platform that **never lies to users**.
