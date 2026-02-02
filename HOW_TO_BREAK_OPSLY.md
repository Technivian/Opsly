# How to Break Opsly - Comprehensive Testing Checklist
**Purpose**: Find every way the system can fail before a real customer does  
**Mindset**: Assume adversarial testing + heavy production usage  
**Goal**: If it can break, break it now - not in 30 days

---

## Testing Philosophy

**DO NOT test the happy path.** 

Test for:
- Edge cases
- Concurrent operations  
- Permission abuse
- Data corruption scenarios
- Resource exhaustion
- User confusion moments

If a test passes but you're still unsure if the feature works - **add more tests**.

---

## 1. Authentication & Session Testing

### Test: Session Expiration
**Scenario**: User left tab open for 8+ hours (session expired)
- [ ] Open Opsly, log in successfully
- [ ] Wait for session to expire (or manually delete session cookie)
- [ ] Try to navigate to any protected page
- **Expected**: Redirect to login with message "Session expired. Please log in again."
- **Fail if**: 500 error, blank page, or stuck loading

### Test: Concurrent Sessions
**Scenario**: User logs in on laptop and phone simultaneously
- [ ] Log in on Browser A
- [ ] Log in on Browser B with same credentials
- [ ] Perform action on Browser A (e.g., create intake)
- [ ] Perform action on Browser B (e.g., view dashboard)
- **Expected**: Both sessions work independently, no conflicts
- **Fail if**: One session kicks out the other, or data corruption

### Test: Demo Account Restrictions
**Scenario**: Demo user tries to mutate data
- [ ] Log in to demo account
- [ ] Try to create automation config
- [ ] Try to run automation
- [ ] Try to delete org data
- **Expected**: 403 error with "Demo account is read-only" message
- **Fail if**: Mutation succeeds, or generic error

### Test: Password Reset Edge Cases
- [ ] Request password reset for non-existent email
- [ ] Use expired magic link (>24 hours old)
- [ ] Use same magic link twice
- **Expected**: Clear error messages, no security info leak
- **Fail if**: "User not found" reveals account existence

---

## 2. RBAC & Permission Abuse

### Test: Privilege Escalation Attempt
**Scenario**: VIEWER tries to perform ADMIN actions
- [ ] Log in as VIEWER role user
- [ ] Try to POST to `/api/automations/configs` (create config)
- [ ] Try to POST to `/api/org/invite` (invite member)
- [ ] Try to DELETE org data
- **Expected**: 403 errors with specific permission message
- **Fail if**: Action succeeds, or server crashes

### Test: Org Isolation Breach
**Scenario**: User tries to access another org's data
- [ ] Log in as User A (org 1)
- [ ] Get User B's automation config ID (org 2) via database or logs
- [ ] Try to GET `/api/automations/configs/{userB_configId}`
- [ ] Try to run User B's automation
- **Expected**: 404 or 403 error (never reveal other org's data exists)
- **Fail if**: User A sees User B's config

### Test: RBAC Bypass via Direct API
**Scenario**: User bypasses UI checks by calling API directly
- [ ] Disable JavaScript in browser (or use curl)
- [ ] POST to protected endpoints without checking UI permissions
- **Expected**: Server-side RBAC blocks request (UI is convenience only)
- **Fail if**: UI shows disabled button but API allows action

---

## 3. Automation Execution Stress Tests

### Test: Concurrent Runs (Max Queue Test)
**Scenario**: User triggers 10 automation runs simultaneously
- [ ] Create automation config
- [ ] Open 10 browser tabs
- [ ] Click "Run Now" on all tabs simultaneously (within 1 second)
- **Expected**: All runs queued, processed sequentially (max 5 concurrent), none lost
- **Fail if**: Runs lost, duplicate runs created, or deadlock

### Test: Placeholder Template Protection
**Scenario**: User tries to run unavailable template
- [ ] Find template with `status: "placeholder"`
- [ ] Try to run it via UI (should be disabled)
- [ ] Try to run via API: `POST /api/automations/configs/{id}/run`
- **Expected**: Immediate failure with "Template not yet implemented" error
- **Fail if**: Run queued, or vague error message

### Test: Demo Mode Clarity
**Scenario**: User runs demo automation and checks results
- [ ] Run automation with `template.status === "demo"`
- [ ] Check run logs - should clearly state "DEMO MODE" warnings
- [ ] Check run table - should show "DEMO SUCCESS" badge
- [ ] Check ROI dashboard - should NOT include this run's metrics
- **Expected**: User cannot confuse demo with real execution
- **Fail if**: Demo run looks identical to real run

### Test: Retry Logic Under Transient Failure
**Scenario**: Automation fails once, then succeeds on retry
- [ ] Create automation that fails intermittently (use test flag if available)
- [ ] Trigger run
- **Expected**: Run transitions QUEUED → RUNNING → RETRYING → RUNNING → SUCCESS
- **Expected**: Logs show retry attempt count and backoff delay
- **Fail if**: Retry gives up too early, or infinite retry loop

### Test: Non-Retryable Error Handling
**Scenario**: Automation fails with client error (4xx)
- [ ] Create config with invalid data (e.g., missing required field)
- [ ] Run automation
- **Expected**: Run fails immediately (status = FAILED) without retries
- **Expected**: Error message explains what's wrong and how to fix
- **Fail if**: System wastes retries on non-retryable error

---

## 4. ROI & Metrics Integrity

### Test: Demo Run Exclusion from ROI
**Scenario**: Org has both demo and real runs, ROI should only count real
- [ ] Run 3 demo automations (should create runs with isDemoRun = true)
- [ ] Run 2 real automations (should create runs with isDemoRun = false)
- [ ] Check ROI dashboard: GET `/api/roi`
- **Expected**: totalRuns = 2 (only real runs counted)
- **Expected**: Demo run metrics NOT included in hours saved
- **Fail if**: ROI shows 5 total runs or inflated time savings

### Test: Zero-Data ROI
**Scenario**: New org with no runs yet
- [ ] Log in to fresh org (no intakes, no configs, no runs)
- [ ] View ROI dashboard
- **Expected**: All metrics show 0, with message "No data yet"
- **Fail if**: Division by zero error, NaN values, or crash

### Test: ROI Confidence Score Calculation
**Scenario**: Run automation multiple times, verify confidence increases
- [ ] Run automation once → check `confidenceScore` (should be low, ~30-40)
- [ ] Run automation 5 more times → check `confidenceScore` (should increase to ~60-70)
- [ ] Run automation 10 more times → check `confidenceScore` (should be ~80-90)
- **Expected**: Confidence score rises with volume + consistency
- **Fail if**: Score stays same or decreases with more successful runs

### Test: ROI Window Filtering (30 days)
**Scenario**: Old runs don't pollute current ROI
- [ ] Create runs with `startedAt` 40 days ago (manually set in DB if needed)
- [ ] Create runs with `startedAt` today
- [ ] Check ROI metrics
- **Expected**: Only runs from last 30 days included
- **Fail if**: 40-day-old runs counted

---

## 5. Error Handling & User Experience

### Test: Network Interruption During Run
**Scenario**: User's internet drops mid-automation
- [ ] Start automation run
- [ ] Immediately disconnect Wi-Fi (or block network in dev tools)
- [ ] Wait 10 seconds
- [ ] Reconnect Wi-Fi
- **Expected**: UI shows loading state, then reconnects and shows current run status
- **Fail if**: UI freezes, shows stale data, or requires page refresh

### Test: Blueprint Generation Failure
**Scenario**: OpenAI API error during intake processing
- [ ] Submit intake form
- [ ] Simulate AI failure (remove API key or hit rate limit)
- **Expected**: Intake status → FAILED with clear error
- **Expected**: Fallback blueprint created (if implemented)
- **Expected**: User notified with actionable next step
- **Fail if**: Intake stuck in PROCESSING forever, or no error message

### Test: File Upload Edge Cases
**Scenario**: User uploads invalid/huge files
- [ ] Try to upload 15MB file (limit is 10MB)
- [ ] Try to upload .exe file
- [ ] Try to upload 0-byte file
- **Expected**: Clear validation errors before upload starts
- **Fail if**: Upload starts then fails, or server crashes

### Test: Form Validation Clarity
**Scenario**: User submits incomplete automation config
- [ ] Leave required fields empty
- [ ] Submit form
- **Expected**: Specific field errors: "Email Folder is required"
- **Fail if**: Generic "validation failed" with no field guidance

---

## 6. Data Integrity & Corruption Scenarios

### Test: Cascading Deletes
**Scenario**: Delete org, ensure all child data deleted
- [ ] Create org with intakes, blueprints, configs, runs
- [ ] Delete org (if endpoint exists, or via DB)
- [ ] Check that intakes, blueprints, configs, runs all deleted
- **Expected**: All org data removed, no orphaned records
- **Fail if**: Orphaned data remains, or foreign key errors

### Test: Concurrent Config Updates
**Scenario**: Two users edit same automation config simultaneously
- [ ] User A opens config edit page
- [ ] User B opens same config edit page
- [ ] User A saves changes
- [ ] User B saves changes
- **Expected**: Last write wins (User B's changes persist) OR conflict error
- **Fail if**: Data corruption (merged fields from both edits)

### Test: Run Log Ordering
**Scenario**: Logs must stay chronological even under concurrent writes
- [ ] Trigger automation run that logs 100+ entries rapidly
- [ ] View logs in UI
- **Expected**: Logs appear in timestamp order, no gaps or duplicates
- **Fail if**: Logs out of order, missing entries, or duplicates

---

## 7. Scalability & Resource Limits

### Test: Large Run Log Volume
**Scenario**: Automation processes 1000 items, logs every one
- [ ] Create automation that processes many items (or mock this)
- [ ] Run and generate 1000+ log entries
- [ ] View logs in UI
- **Expected**: Logs load (may paginate), UI remains responsive
- **Fail if**: Browser hangs, page crashes, or logs truncated without notice

### Test: Long-Running Automation
**Scenario**: Automation takes 5+ minutes to complete
- [ ] Create automation with long processing time (or add sleep)
- [ ] Trigger run
- [ ] Observe UI during execution
- **Expected**: Real-time log updates, status reflects RUNNING for full duration
- **Expected**: No timeout errors
- **Fail if**: Run marked FAILED prematurely, or UI shows stale status

### Test: API Rate Limiting (If Implemented)
- [ ] Make 100 rapid API requests
- **Expected**: Rate limit kicks in with 429 status + retry-after header
- **Fail if**: Server crashes or allows unlimited requests

---

## 8. Internationalization & Localization

### Test: Dutch Language Completeness
**Scenario**: Dutch user navigates full app in nl-NL
- [ ] Switch language to Dutch
- [ ] Navigate to every major page (dashboard, intakes, automations, runs, ROI)
- [ ] Look for untranslated text (English fallbacks)
- **Expected**: All UI text in Dutch, no missing translations
- **Fail if**: Any page shows English text or translation keys (e.g., "runs.title")

### Test: Currency & Number Formatting
**Scenario**: Dutch locale shows EUR not USD
- [ ] Set locale to nl-NL
- [ ] Check pricing page, ROI calculations, any monetary values
- **Expected**: Amounts formatted as "€1.234,56" (comma decimal, period thousands)
- **Fail if**: Shows "$1,234.56" (US format)

---

## 9. Security & Vulnerability Testing

### Test: SQL Injection Attempt
**Scenario**: Malicious user tries to inject SQL
- [ ] Submit intake form with title: `'; DROP TABLE intakes; --`
- [ ] Submit automation config with name containing SQL keywords
- **Expected**: Input treated as literal string, no SQL execution
- **Fail if**: Database error, or successful injection

### Test: XSS (Cross-Site Scripting)
**Scenario**: User injects JavaScript in user-controlled fields
- [ ] Create intake with title: `<script>alert('XSS')</script>`
- [ ] View intake list and detail pages
- **Expected**: Script rendered as text, not executed
- **Fail if**: Alert pops up

### Test: Session Fixation
**Scenario**: Attacker tries to reuse victim's session ID
- [ ] Log in, copy session cookie value
- [ ] Log out
- [ ] Try to restore old session cookie and access app
- **Expected**: Session invalid after logout, must re-authenticate
- **Fail if**: Old session still works

---

## 10. Real-World Usage Scenarios

### Test: First Customer Onboarding Flow
**Scenario**: New user signs up and tries to use Opsly (30-day pilot)
- [ ] Sign up with real email
- [ ] Complete intake wizard (realistic data)
- [ ] Wait for blueprint generation
- [ ] Review blueprint, create automation config
- [ ] Run automation (demo mode)
- [ ] Check ROI after 1 week of daily runs
- **Expected**: User can complete full workflow without confusion
- **Fail if**: User gets stuck, confused by demo vs real, or doubts ROI numbers

### Test: Heavy Daily Usage
**Scenario**: User runs 20 automations per day for 7 days
- [ ] Create 5 automation configs
- [ ] Run each config 4 times per day for 7 days
- [ ] Check that system remains responsive
- [ ] Check ROI metrics stay accurate
- **Expected**: App handles sustained load, data stays consistent
- **Fail if**: Performance degradation, out-of-memory errors, or corrupted metrics

### Test: Support Debugging Scenario
**Scenario**: User reports "automation failed, but I don't know why"
- [ ] Trigger automation run that fails
- [ ] User contacts support with run ID only (no other context)
- [ ] Support reviews run logs via API
- **Expected**: Logs contain enough detail to diagnose issue without asking user
- **Expected**: Error message is actionable (not "something went wrong")
- **Fail if**: Logs vague, or support must ask user many follow-up questions

---

## 11. Known Edge Cases (From Audit)

### Test: Failed Intake with Fallback Blueprint
**Scenario**: Intake fails but partial blueprint exists
- [ ] Submit intake, simulate AI failure
- [ ] Check intake status (should be FAILED)
- [ ] Check if blueprint was created
- **Expected**: UI clearly shows "Intake failed, partial blueprint available"
- **Fail if**: User confused by failed intake but successful blueprint

### Test: Disabled Connections Still Show in Config
**Scenario**: User disconnects Gmail, but automation config still references it
- [ ] Connect Gmail
- [ ] Create automation using Gmail
- [ ] Disconnect Gmail
- [ ] Try to run automation
- **Expected**: Run fails immediately with "Gmail not connected" error
- **Fail if**: Run attempts to use disconnected service

---

## 12. Destructive Testing (Nuclear Options)

⚠️ **WARNING**: These tests can corrupt data. Run on test environment only.

### Test: Database Connection Loss
- [ ] Start automation run
- [ ] Kill database connection mid-execution
- [ ] Restore database
- **Expected**: Run fails gracefully, no data corruption
- **Fail if**: Run stuck in RUNNING state forever, or partial data written

### Test: Server Restart During Run
- [ ] Start long-running automation
- [ ] Restart Express server mid-run
- [ ] Check run status after restart
- **Expected**: Run marked FAILED or resumes (if resumption implemented)
- **Fail if**: Run lost entirely, or orphaned in RUNNING state

### Test: Disk Full Scenario
- [ ] Fill disk to 99% capacity
- [ ] Try to create intake, upload files, run automation
- **Expected**: Clear "insufficient storage" errors
- **Fail if**: Silent failures or corrupted writes

---

## Pass/Fail Criteria

### Critical Failures (Must Fix Before Pilot)
- Security vulnerabilities (SQL injection, XSS, session hijacking)
- Data corruption or loss
- Org isolation breach (User A sees User B's data)
- Demo runs counted as real in ROI
- System crashes under normal usage

### High-Priority Failures (Fix Before Launch)
- Confusing error messages (generic 500s)
- Permission checks missing or wrong
- ROI calculations incorrect or inconsistent
- Demo runs look identical to real runs
- User can trigger unintended actions

### Medium-Priority Failures (Fix Soon)
- Missing translations
- Performance issues under load
- Logs too vague for debugging
- UI states unclear (loading, error, empty)

### Low-Priority Failures (Post-Pilot)
- Minor UX annoyances
- Edge cases requiring user education
- Non-critical feature gaps

---

## Testing Completion Checklist

Before signing off on production readiness:

- [ ] All critical failures resolved (0 remaining)
- [ ] All high-priority failures resolved or documented as known limitations
- [ ] At least 50% of tests in this checklist manually executed
- [ ] At least 3 destructive tests passed
- [ ] Real user scenario (first customer onboarding) completed successfully
- [ ] Support can debug any failure using logs alone
- [ ] Demo vs real runs are visually distinct in UI
- [ ] ROI numbers explainable in one sentence

---

## Post-Testing: What We Learned

**Instructions for Tester**: After completing testing, document:

1. **Bugs Found** (with severity ratings)
2. **Confusing UX Moments** (where you got stuck)
3. **Missing Features** (things you expected but didn't exist)
4. **Positive Surprises** (things that worked better than expected)
5. **Recommendations** (what to prioritize next)

This feedback will directly inform the final readiness decision.
