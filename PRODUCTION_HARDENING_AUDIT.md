# Opsly Production Hardening Audit
**Date**: 2 February 2026  
**Auditor**: Senior Product Engineer & QA Lead  
**Objective**: Make Opsly safe, predictable, explainable, and testable for real SME usage

---

## Audit Methodology

This audit systematically reviews:
1. System Safety & Predictability
2. Error Handling
3. Logging & Observability
4. ROI & Metrics Integrity
5. Permissions & Guardrails
6. UX & Copy Clarity
7. Test Readiness

For each area, we:
- ✅ Identify what works correctly
- ⚠️ Flag what needs improvement
- 🔴 Highlight critical blockers

---

## 1. System Safety & Predictability

### ✅ CORRECT
- All automations require manual trigger via `/api/automations/configs/:id/run` POST
- Execution states follow clear path: QUEUED → RUNNING → SUCCESS/FAILED/RETRYING
- Placeholder templates (`status: "placeholder"`) are **blocked from execution** with clear error
- Demo mode templates show **explicit warnings** in logs before execution
- Retry logic uses exponential backoff (1s → 2s → 4s) with max 3 retries
- All state transitions are logged and persisted to database

### ⚠️ NEEDS IMPROVEMENT
1. **Demo mode runs create simulated success** - SME might confuse this with real work
   - **Impact**: User thinks automation worked, but nothing happened externally
   - **Fix**: Add prominent "DEMO RUN" marker in run results and UI

2. **No confirmation dialog before first run**
   - **Impact**: User might accidentally trigger automation
   - **Fix**: Add "Are you sure?" dialog on first run of each config

3. **Run button doesn't explain what will happen**
   - **Impact**: User unsure what "Run Now" does
   - **Fix**: Change to "Run Automation (Manual)" or add tooltip

### 🔴 CRITICAL BLOCKERS
**None** - Manual triggering is correctly enforced

---

## 2. Error Handling

### ✅ CORRECT
- Template executor errors are caught and logged with context
- Non-retryable errors (4xx) don't waste retries
- Database errors include operation context
- Run failures update `lastError` field with message
- RBAC violations return 403 with specific message

### ⚠️ NEEDS IMPROVEMENT
1. **Generic 500 errors in routes.ts** (22 instances)
   - Current: `res.status(500).json({ message: "Failed to fetch intakes" })`
   - Better: `res.status(500).json({ message: "Failed to fetch intakes", error: error.message, action: "Please refresh the page or contact support" })`

2. **Stack traces might leak to client** in some catch blocks
   - **Impact**: User sees technical jargon, no actionable info
   - **Fix**: Sanitize errors before sending to client

3. **Blueprint generation failure creates "FAILED" intake with fallback**
   - Current behavior: Intake shows FAILED status, fallback blueprint created
   - **Impact**: User confused - "I have a blueprint but intake failed?"
   - **Fix**: Clarify in UI that blueprint is partial/fallback

4. **No user-friendly error for missing config schema fields**
   - **Impact**: User submits config, gets validation error, unsure what's wrong
   - **Fix**: Return specific field errors: `{ field: "emailFolder", error: "This field is required" }`

### 🔴 CRITICAL BLOCKERS
**None** - Errors are caught and don't crash server

---

## 3. Logging & Observability

### ✅ CORRECT
- Run logs use structured format: timestamp, level (INFO/WARN/ERROR), message
- Every execution step is logged (queueing, retry attempts, completion)
- Template-specific logs explain what's happening (e.g., "Fetching 50 emails from Inbox")
- Logs are human-readable and chronological
- Real-time log streaming via WebSocket for RUNNING status

### ⚠️ NEEDS IMPROVEMENT
1. **Demo mode logs don't clearly distinguish simulation**
   - Example log: `"✓ Created task in Asana: Review lead #1234"`
   - **Impact**: Looks like real action, but it's simulated
   - **Fix**: Prefix with `[DEMO]` - `"[DEMO] ✓ Simulated task creation in Asana: Review lead #1234"`

2. **No execution summary at end of run**
   - Current: Logs end with final action, then status update in database
   - **Impact**: User must piece together what happened
   - **Fix**: Add summary log:
     ```
     ──────────────────────────
     RUN SUMMARY
     Status: SUCCESS
     Items Processed: 42
     Tasks Created: 38
     Time Saved: 63 minutes
     Exceptions: 4 (non-critical)
     ──────────────────────────
     ```

3. **ROI calculation logs missing**
   - ROI numbers appear in UI, but no audit trail
   - **Impact**: User asks "How did you get 63 minutes?" - no answer
   - **Fix**: Log ROI calculation steps

4. **No logs for RBAC decisions**
   - When user lacks permission, 403 sent, but no audit log
   - **Impact**: Admin can't see who tried what
   - **Fix**: Log permission checks: `"User john@example.com attempted to create config (DENIED: VIEWER role)"`

### 🔴 CRITICAL BLOCKERS
**None** - Basic logging exists and is readable

---

## 4. ROI & Metrics Integrity

### ✅ CORRECT
- ROI calculator uses **real execution data** from runs table
- Confidence score formula is **documented and explainable**:
  - 50% success rate (did runs complete?)
  - 30% consistency (do runs save similar time?)
  - 20% volume (enough runs to trust?)
- Time saved comes from `estimatedMinutesSaved` field (template-provided, not random)
- 30-day rolling window (recent performance matters most)
- All calculations are deterministic - same data = same result

### ⚠️ NEEDS IMPROVEMENT
1. **`estimatedMinutesSaved` is template self-reported**
   - Current: Template executor decides "this saved 5 minutes"
   - **Impact**: Templates could inflate numbers
   - **Fix**: Document calculation rationale in each template executor
     ```typescript
     // RATIONALE: Each triaged email saves 3 minutes vs manual categorization
     // Based on: Industry benchmark of 3-5 min per email triage task
     const minutesSaved = itemsProcessed * 3;
     ```

2. **Demo runs contribute to ROI metrics**
   - Current: Demo run with 10 simulated items → shows "30 minutes saved"
   - **Impact**: ROI numbers inflated by fake work
   - **Fix**: Exclude demo runs from ROI OR label metrics as "Demo (Not Real)"

3. **Confidence score not shown in UI**
   - ROI endpoint calculates `confidenceScore`, but UI doesn't display it
   - **Impact**: User sees "63 minutes saved" with no indication of reliability
   - **Fix**: Show confidence badge: `63 minutes saved (85% confidence ✓)`

4. **No metric for "what would have happened without automation"**
   - ROI shows time saved, but not baseline cost
   - **Impact**: User doesn't understand opportunity cost
   - **Fix**: Add "Manual Effort Avoided" metric

### 🔴 CRITICAL BLOCKERS
1. **Demo runs skew real ROI** - Must be excluded or clearly labeled
   - **Why critical**: Dutch SME making pilot decision based on fake numbers
   - **Fix**: Add `isDemo` flag to runs, filter in ROI calculator

---

## 5. Permissions & Guardrails

### ✅ CORRECT
- All API endpoints require `isAuthenticated` middleware
- RBAC enforced server-side via `checkRole()` function
- Write operations blocked for demo orgs via `isDemoReadOnly` middleware
- OWNER role auto-assigned on first org creation
- Multi-tenancy: All data filtered by `orgId` from user's membership

### ⚠️ NEEDS IMPROVEMENT
1. **Silent RBAC failures in some cases**
   - Example: VIEWER tries to create config → 403, but no UI feedback about why
   - **Impact**: User confused why button doesn't work
   - **Fix**: Client-side RBAC check + tooltip: "You need ADMIN role to create configurations"

2. **No permission check UI in automation config page**
   - Run button always visible, fails on click if insufficient permissions
   - **Impact**: User wastes time configuring, then blocked
   - **Fix**: Disable run button + tooltip if user lacks OPERATOR role

3. **Demo mode middleware returns generic "read-only" message**
   - Current: `res.status(403).json({ message: "Demo account is read-only" })`
   - **Impact**: User doesn't know demo mode = limited functionality
   - **Fix**: `"This is a demo account. Automations run in simulation mode only. Upgrade to run real automations."`

### 🔴 CRITICAL BLOCKERS
**None** - RBAC works, just needs UX polish

---

## 6. UX & Copy Clarity

### ✅ CORRECT
- Status badges use semantic colors (green=success, red=failed, yellow=warning)
- Timestamps formatted in user locale
- Empty states exist for zero-data views
- Template descriptions explain what automation does

### ⚠️ NEEDS IMPROVEMENT
1. **Ambiguous "Run Now" button**
   - Doesn't explain: What runs? How long? What happens?
   - **Fix**: "Run Automation (Manual Trigger)"

2. **"Demo Mode" badge doesn't explain consequences**
   - Badge says "⚠️ Demo Mode" but not what that means
   - **Fix**: Tooltip: "Simulated execution - no real external actions"

3. **Empty state says "No templates available"**
   - Implies something is broken
   - **Fix**: "Automation templates are loading..." (if loading) or "No templates configured yet"

4. **"Placeholder" status unclear**
   - Badge says "🚫 Not Available" - available when?
   - **Fix**: "🚫 Under Development (Q2 2026)"

5. **Run logs dialog has no context**
   - Opens with raw logs, no run metadata
   - **Fix**: Header should show: "Run #123 | Config: Email Triage | Status: SUCCESS | Duration: 42s"

6. **Retry status not visible in UI**
   - Database has "RETRYING" status, but UI treats it as "RUNNING"
   - **Impact**: User doesn't know automation is failing and retrying
   - **Fix**: Show "⟳ Retrying (Attempt 2/4)" badge

7. **No explanation for failed runs in table**
   - Run shows ❌ FAILED, but user must click logs to see why
   - **Fix**: Show `lastError` in tooltip or expandable row

### 🔴 CRITICAL BLOCKERS
1. **No demo vs. real distinction in run results**
   - Demo run shows "SUCCESS ✓ 10 items processed" same as real run
   - **Impact**: User thinks emails were sent, but they weren't
   - **Fix**: Demo runs must show "DEMO SUCCESS (Simulated)" badge

---

## 7. Test Readiness

### ✅ CORRECT
- Playwright e2e tests configured and working
- Test database setup script exists
- API routes follow RESTful conventions (predictable testing)
- Session-based auth (easy to test with cookies)

### ⚠️ NEEDS IMPROVEMENT
1. **No test data reset endpoint**
   - Testers must manually delete org data between test runs
   - **Fix**: Add `POST /api/test/reset` (only in non-production)

2. **No way to force failure scenarios**
   - Can't easily test retry logic, error handling, partial failures
   - **Fix**: Add debug flags in config: `{ _forceFailure: true }` (test env only)

3. **Demo runs treated same as real runs in database**
   - Hard to test "real run" behavior without external dependencies
   - **Fix**: Add `isDemoRun` flag to runs table, filter in queries

4. **No concurrency test helpers**
   - Multiple simultaneous runs hard to test
   - **Fix**: Document test procedure for concurrent runs

5. **Logs not easily parseable for assertion**
   - Logs are human-readable strings, hard to test programmatically
   - **Fix**: Consider JSON log format for machine parsing (optional)

### 🔴 CRITICAL BLOCKERS
**None** - Basic testing works, helpers would improve efficiency

---

## SUMMARY: PRODUCTION READINESS ASSESSMENT

### Ready for Pilot? **YES - with minor fixes**

### Critical Fixes Required Before Pilot (1)
1. **Demo runs must be excluded from ROI or clearly labeled**
   - Why: SME cannot make business decision on fake metrics
   - Effort: 2 hours (add isDemoRun flag, filter in ROI endpoint)

### High-Priority Improvements (Should Fix) (4)
1. Demo runs show "DEMO SUCCESS" badge in UI
2. Error responses include actionable next steps
3. Run logs include execution summary
4. Confidence score shown in ROI display

### Medium-Priority Improvements (Nice to Have) (6)
1. Confirmation dialog on first run
2. Permission tooltips when buttons disabled
3. Retry status visible in runs table
4. Failed run error shown in table tooltip
5. ROI calculation logs for transparency
6. RBAC decision audit logs

### Low-Priority Improvements (Post-Pilot) (5)
1. Test data reset endpoint
2. Force-failure debug flags
3. JSON log format option
4. "Manual effort avoided" metric
5. Longer template description tooltips

---

## Next Steps

1. ✅ **Audit Complete** - This document
2. 🔧 **Implement Critical Fixes** - Demo run labeling + ROI filtering
3. 🔧 **Implement High-Priority Fixes** - Error messages, UI clarity
4. 📋 **Create Testing Checklist** - "How to Break Opsly"
5. ✅ **Final Readiness Report** - Sign-off document

---

## Known Limitations (Honest Disclosure)

These are **by design** and acceptable for pilot:

1. **Most templates are demo mode** - Only email_task_triage has partial real execution
   - Impact: Limited real automation value in pilot
   - Mitigation: Clear "Demo Mode" labeling, user expectations set upfront

2. **No background scheduling** - All runs are manual trigger
   - Impact: User must remember to run automations
   - Mitigation: Documented as design choice (safety over automation)

3. **No webhook triggers** - Cannot react to external events
   - Impact: Automation is reactive (user-initiated), not proactive
   - Mitigation: Roadmap item for Q2 2026

4. **Connection management is UI-only** - No actual OAuth integration
   - Impact: User enters API keys manually, no validation
   - Mitigation: Clear labels: "Enter your API key (stored securely)"

5. **ROI metrics are estimates** - Not actual time tracking
   - Impact: "30 minutes saved" is calculated, not measured
   - Mitigation: Explain calculation in UI tooltip

6. **No rollback/undo** - Failed runs don't auto-revert external changes
   - Impact: User must manually fix errors (e.g., delete created tasks)
   - Mitigation: Run logs show all actions taken

---

## Final Decision

**Opsly is SAFE for pilot use** with the following conditions:

✅ Critical fix implemented (demo run labeling)
✅ User knows most templates are demos
✅ User expects manual triggering only
✅ User understands ROI numbers are estimates

**Question**: Would a cautious Dutch SME feel more in control after using Opsly for 30 days?

**Answer**: **YES** - if:
- They understand demo vs. real automation distinction
- They see transparent logs and clear error messages
- They have manual control over all automation triggers
- They can explain ROI numbers if their CFO asks

**Answer**: **NO** - if:
- Demo runs look identical to real runs
- Errors are vague "something went wrong"
- ROI numbers appear magical
- They're surprised by automated actions

**Our Commitment**: We will ensure the "YES" conditions are met before pilot launch.
