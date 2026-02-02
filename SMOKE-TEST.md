# Smoke Test Checklist: First Customer Ready

**Date**: 2 February 2026  
**Duration**: ~30-40 minutes  
**Environment**: Local dev (localhost:5000) or staging  
**Tester**: [Name]

---

## PRE-TEST SETUP

- [ ] Server running (`npm run dev` or `npm start`)
- [ ] Database seeded with templates
- [ ] Fresh browser session (no cookies)
- [ ] Incognito/Private window recommended

---

## SECTION 1: LEGAL PAGES

### Test 1.1: Privacy Policy Page Accessible
**Steps:**
1. Navigate to `http://localhost:5000/privacy`
2. Page loads without error
3. Can scroll through full content

**Expected:**
- Page title: "Privacy Policy"
- Last updated date shown
- Sections visible: Introduction, GDPR rights, Data retention, Security, Contact
- No broken links

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 1.2: Terms of Service Page Accessible
**Steps:**
1. Navigate to `http://localhost:5000/terms`
2. Page loads without error
3. Can scroll through full content

**Expected:**
- Page title: "Terms of Service"
- Last updated date shown
- Sections visible: Feature limitations, Demo mode disclaimers, Liability cap, Dispute resolution
- No broken links

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 1.3: Privacy/Terms Accessible from Landing Page
**Steps:**
1. Navigate to `http://localhost:5000`
2. Scroll to footer (or find links)
3. Click "Privacy Policy" link
4. Page loads correctly
5. Click back, click "Terms of Service" link
6. Page loads correctly

**Expected:**
- Links present on landing page
- Links navigate to correct pages
- No 404 errors

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 2: CONSENT & SIGNUP FLOW

### Test 2.1: Terms Checkbox Blocks Signup
**Steps:**
1. Navigate to `http://localhost:5000/auth/signup`
2. Fill in form:
   - Email: `test-consent-check@example.com`
   - Password: `TestPass123`
   - Confirm: `TestPass123`
   - First Name: `Test`
   - Last Name: `User`
3. **DO NOT** check Terms checkbox
4. Click "Create account" button

**Expected:**
- Button is disabled (grayed out) while checkbox unchecked
- Clicking disabled button does nothing
- No error message yet

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 2.2: Checking Checkbox Enables Signup
**Steps:**
1. From previous form, check the Terms checkbox
2. Read the checkbox label (should say "I accept the Terms of Service and Privacy Policy")
3. Click the links in the label

**Expected:**
- Checkbox can be checked
- Button becomes enabled when checked
- Links open Privacy/Terms pages in new tabs
- Can return to signup form after

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 2.3: Successful Signup with Consent
**Steps:**
1. Fill form (from Test 2.1)
2. Check Terms checkbox
3. Click "Create account"
4. Wait for redirect

**Expected:**
- Form submitted successfully
- Redirected to `/app` (dashboard)
- User logged in
- No error messages

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 3: DATA EXPORT

### Test 3.1: Export Endpoint Works (Authenticated)
**Steps:**
1. From logged-in session, open browser console
2. Execute:
   ```javascript
   fetch('/api/account/data-export', { method: 'POST', credentials: 'include' })
     .then(r => r.blob())
     .then(blob => {
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'export.csv';
       a.click();
     });
   ```
3. File should download

**Expected:**
- File downloads as CSV
- Filename: `opsly-export-YYYY-MM-DD.csv`
- File not empty (has data headers at minimum)
- CSV readable in text editor

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 3.2: Export Contains Expected Data
**Steps:**
1. Open downloaded CSV in text editor
2. Check structure

**Expected:**
- Header: "OpsLy Data Export"
- Generated timestamp
- Organization ID
- Sections: INTAKES, BLUEPRINTS, AUTOMATION CONFIGS, RUNS, TEAM MEMBERS
- CSV properly formatted (no corrupt rows)

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 3.3: Export Blocked if Not Authenticated
**Steps:**
1. Open new incognito window
2. Try to POST to `/api/account/data-export`
3. Example via curl:
   ```bash
   curl -X POST http://localhost:5000/api/account/data-export
   ```

**Expected:**
- Response: 401 Unauthorized (or redirect to login)
- No data exported
- No error page

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 4: ACCOUNT DELETION

### Test 4.1: Delete Endpoint Requires Confirmation
**Steps:**
1. From logged-in session, console:
   ```javascript
   fetch('/api/account/delete', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ confirmation: 'WRONG_STRING' })
   })
   .then(r => r.json())
   .then(d => console.log(d));
   ```

**Expected:**
- Response: `{ message: "Invalid confirmation string" }` (400 status)
- Account NOT deleted
- User still logged in

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 4.2: Delete with Correct Confirmation
**Steps:**
1. Create new test account (e.g., `delete-test@example.com`)
2. Note the org ID (check browser storage or network tab)
3. From console:
   ```javascript
   fetch('/api/account/delete', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ confirmation: 'DELETE_ALL_DATA' })
   })
   .then(r => r.json())
   .then(d => console.log(d));
   ```

**Expected:**
- Response includes `success: true`
- Message: "Account and all data deleted successfully..."
- User session invalidated
- Redirected to login or home

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 4.3: Deleted Data Cannot Be Accessed
**Steps:**
1. Try to log in with deleted account from Test 4.2
2. Email: `delete-test@example.com`
3. Password: (same as before)

**Expected:**
- Login fails
- Error: "Invalid email or password" (or similar)
- Account truly deleted

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 5: TEMPLATE STATUS SYSTEM (REMINDER TEST)

### Test 5.1: Demo Templates Show Warning
**Steps:**
1. Sign up as new user (or use existing account)
2. Complete intake wizard (pick any pain area, describe problem, etc.)
3. Wait for blueprint to generate
4. Go to Automations page
5. Click "Configure" on "Email to Task Triage" or "Lead Follow-up"
6. Run the automation (click "Run")
7. Check the run logs

**Expected:**
- Demo template shows orange ⚠️ badge next to name
- Disclaimer: "This automation uses simulated data"
- On run, logs show `[DEMO]` prefix
- Logs show "No real emails will be sent"
- Run completes successfully with DEMO indicator

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 5.2: Placeholder Templates Are Blocked
**Steps:**
1. On Automations page, look for "Invoice Intake and Coding" or "Data Entry Automation"
2. Try to click "Configure" button

**Expected:**
- Button is disabled (grayed out)
- Red 🚫 badge shows "Not Available"
- Tooltip or disclaimer: "This template is under development"
- Cannot configure or run

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 6: EXISTING FLOWS STILL WORK

### Test 6.1: Intake → Blueprint Flow
**Steps:**
1. Log in as new user
2. Click "New Intake"
3. Complete wizard:
   - Step 1: Select pain area (e.g., "Sales")
   - Step 2: Describe problem (min 20 chars)
   - Step 3: Select tools
   - Step 4: Enter metrics
   - Step 5: Upload file (optional)
   - Step 6: Submit
4. Wait 30 seconds for blueprint generation
5. Navigate to Blueprints page

**Expected:**
- Intake submits successfully
- Status shows "PROCESSING"
- Within 30 seconds, blueprint appears
- Blueprint has generated process steps, bottlenecks, backlog
- No errors in console

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 6.2: Automation Config → Run Flow
**Steps:**
1. From Blueprints, click on blueprint
2. Scroll to "Suggested Automations"
3. Click "Configure" on an automation (e.g., "Email Task Triage")
4. Fill in any required fields
5. Click "Save & Run"
6. Check run status

**Expected:**
- Config saves successfully
- Run starts immediately
- Status shows in runs page
- Logs are visible
- Run completes with SUCCESS or DEMO indicator

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 6.3: Multi-User RBAC Works
**Steps:**
1. Create org owner account (already done in previous tests)
2. Go to Settings → Team
3. Invite team member: `team-member@example.com`
4. New window: Invite link (check email or get from support)
5. Team member logs in
6. Check permissions:
   - Can view automations? ✓
   - Can run automations? ✓
   - Can create new automation? (depends on role, but should be limited)

**Expected:**
- Invite works
- Team member can see org data
- Team member has correct permissions
- No cross-org data visible

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 7: ERROR HANDLING

### Test 7.1: Missing Email Validation
**Steps:**
1. Go to signup
2. Try to submit with:
   - Email: (empty)
   - Other fields: filled

**Expected:**
- Browser validation prevents submit
- Error message shown

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 7.2: Weak Password Rejected
**Steps:**
1. Go to signup
2. Try password: `abc` (too short)

**Expected:**
- Button shows password too short
- Submit blocked
- Clear error message: "Password must be at least 8 characters"

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 7.3: Duplicate Email Rejected
**Steps:**
1. Sign up with: `dupe@example.com`
2. Log out
3. Try to sign up again with same email

**Expected:**
- Submit fails
- Error: "Email already in use" or similar
- No duplicate account created

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SECTION 8: UI/UX CHECKS

### Test 8.1: No Console Errors
**Steps:**
1. Open DevTools Console (F12)
2. Run through all above tests
3. Check for errors

**Expected:**
- No red error messages
- No 404s
- No uncaught exceptions
- Warnings OK (may see TypeScript/build warnings)

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 8.2: Mobile Responsive
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at viewport: 375px (iPhone)
4. Test signup, privacy/terms pages

**Expected:**
- All pages readable on mobile
- Text doesn't overflow
- Buttons clickable (not too small)
- Layout adapts

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

### Test 8.3: No Dead Links
**Steps:**
1. Visit all public pages:
   - `/` (landing)
   - `/privacy`
   - `/terms`
   - `/pricing`
   - `/docs`
   - `/security`
2. Check all internal links work
3. Check all external links valid

**Expected:**
- No 404 pages
- All links go to correct destination
- No "Page not found"

**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________

---

## SIGN-OFF

**Tester Name**: _______________  
**Date**: _______________  
**Environment**: ☐ Local Dev ☐ Staging ☐ Production  

**Overall Result**: 
- ☐ ALL PASS — Ready for customer
- ☐ PARTIAL PASS — Fix issues, retest
- ☐ FAIL — Do not ship

**Critical Issues Found**:
```
[List any blockers here]
```

**Minor Issues** (nice-to-have fixes):
```
[List cosmetic/minor issues here]
```

**Approver Sign-Off**:  
Name: _______________  
Signature: _______________  
Date: _______________

---

## Quick Reference: Test Accounts

| Email | Password | Purpose |
|-------|----------|---------|
| `test-consent@example.com` | `TestPass123` | Consent checkbox test |
| `test-export@example.com` | `TestPass123` | Data export test |
| `test-delete@example.com` | `TestPass123` | Account deletion test |
| `test-intake@example.com` | `TestPass123` | Full flow test |
| `team-member@example.com` | `TeamPass123` | RBAC test |

---

**Post-Test Actions:**
- [ ] Document any failures
- [ ] Fix bugs (retest after each fix)
- [ ] Get approver sign-off
- [ ] Deploy to production
- [ ] Notify customer
