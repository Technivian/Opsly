# Comprehensive Testing Guide - Opsly

## Prerequisites

**Server must be running on port 3000** (not 5000 - macOS AirPlay conflicts)

```bash
cd /Users/haroonwahed/Desktop/Projects/Opsly
PORT=3000 DATABASE_URL="postgresql://user@localhost:5432/opscopilot" \
SESSION_SECRET="your-secret-key" \
GMAIL_CLIENT_ID="your-gmail-client-id.apps.googleusercontent.com" \
GMAIL_CLIENT_SECRET="your-gmail-client-secret" \
BASE_URL="http://localhost:3000" \
npm run dev
```

Server should output:
```
[Executor] Registered 4 template executors
[WebSocket] Server initialized on /ws/runs
serving on 127.0.0.1:3000
```

## 1. Authentication & User Management Testing

## 1. Authentication & User Management Testing

### Test 1.1: User Registration
**Endpoint:** POST `/api/auth/signup`
```bash
curl -s http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","firstName":"Test","lastName":"User"}' \
  -c /tmp/cookies.txt | jq
```

**Expected:** 
- 200 status
- Returns `{"success":true,"user":{...}}`
- User created in database
- Organization auto-created
- Session cookie set
- User added to org as OWNER

**Verify:**
```bash
psql postgresql://haroonwahed@localhost:5432/opscopilot -c "SELECT email, first_name FROM users WHERE email='test@example.com';"
psql postgresql://haroonwahed@localhost:5432/opscopilot -c "SELECT u.email, om.role FROM org_members om JOIN users u ON om.user_id = u.id WHERE u.email='test@example.com';"
```

### Test 1.2: User Sign In
**Endpoint:** POST `/api/auth/signin`
```bash
curl -s http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  -c /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Returns user object
- Session cookie set

### Test 1.3: Invalid Credentials
```bash
curl -s http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}' | jq
```

**Expected:**
- 401 status
- `{"message":"Invalid credentials"}`

### Test 1.4: Get Current User
```bash
curl -s http://localhost:3000/api/user -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Returns user object with email, firstName, lastName

### Test 1.5: Unauthenticated Access
```bash
curl -s http://localhost:3000/api/user | jq
```

**Expected:**
- 401 status
- `{"message":"Not authenticated"}`

### Test 1.6: Sign Out
```bash
curl -s http://localhost:3000/api/auth/signout -X POST -b /tmp/cookies.txt | jq
curl -s http://localhost:3000/api/user -b /tmp/cookies.txt | jq
```

**Expected:**
- First call: 200 `{"success":true}`
- Second call: 401 not authenticated

---

## 2. Intake & Blueprint Testing

### Test 2.1: Create Intake (via UI)
**Navigate to:** http://localhost:3000/app/intakes/new

**Steps:**
1. Sign in if not already
2. Select pain area (e.g., "Email Management")
3. Fill intake form with operational pain description
4. Upload optional files
5. Submit

**Expected:**
- Redirected to /app/intakes
- Intake status shows "PROCESSING"
- After ~5-10s, status changes to "COMPLETED"
- Blueprint auto-generated

### Test 2.2: Create Intake (via API)
```bash
curl -s http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{
    "title":"Test Intake",
    "painArea":"EMAIL_MANAGEMENT",
    "answers":{"description":"Testing automated blueprint generation"}
  }' | jq
```

**Expected:**
- 200 status
- Intake created with status "SUBMITTED"
- Blueprint generation starts asynchronously

### Test 2.3: List Intakes
```bash
curl -s http://localhost:3000/api/intakes -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Array of intakes for current org
- Each has: id, title, status, painArea, createdAt

### Test 2.4: Get Intake Detail
```bash
# Get ID from previous test
curl -s http://localhost:3000/api/intakes/1 -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Full intake object with answers

### Test 2.5: Blueprint Generation (without OpenAI)
**Current behavior:** If `AI_INTEGRATIONS_OPENAI_API_KEY` not set, uses fallback blueprint

**Verify:**
```bash
curl -s http://localhost:3000/api/blueprints -b /tmp/cookies.txt | jq
```

**Expected:**
- Blueprint created for intake
- Contains: processJson, bottlenecksJson, backlogJson
- Even without OpenAI key, fallback blueprint generated

### Test 2.6: Get Blueprint Detail
```bash
curl -s http://localhost:3000/api/blueprints/1 -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Full blueprint with process steps, bottlenecks, backlog items

---

## 3. Automation Templates Testing

### Test 3.1: List Templates
```bash
curl -s http://localhost:3000/api/automations/templates -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- 6 templates returned:
  1. `email_task_triage` - Email to Task Triage
  2. `lead_followup` - Lead Follow-up
  3. `form_crm_sync` - Form to CRM Sync
  4. `lead_slack_notify` - Lead Assignment Slack Notification
  5. `invoice_intake` - Invoice Intake and Coding
  6. `data_entry_automation` - Data Entry Automation

**Verify executors registered:**
Only templates 1-4 have active executors. Templates 5-6 are placeholders.

### Test 3.2: Get Template Detail
```bash
curl -s http://localhost:3000/api/automations/templates/1 -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Template with configSchema defining required fields

---

## 4. Automation Configuration Testing

### Test 4.1: Create Email Triage Config
```bash
curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{
    "templateId":1,
    "name":"Test Email Triage",
    "configJson":{"emailFolder":"Inbox","projectTool":"Jira","autoAssign":true}
  }' | jq
```

**Expected:**
- 200 status
- Config created with id, orgId, isActive=true

### Test 4.2: Create Lead Follow-up Config
```bash
curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{
    "templateId":2,
    "name":"Test Lead Follow-up",
    "configJson":{"crm":"Pipedrive","followUpDelay":7,"autoSend":false}
  }' | jq
```

**Expected:**
- 200 status
- Config created

### Test 4.3: List Configs
```bash
curl -s http://localhost:3000/api/automations/configs -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Array of configs for current org

### Test 4.4: Get Config Detail
```bash
curl -s http://localhost:3000/api/automations/configs/1 -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Config with configJson

### Test 4.5: Update Config
```bash
curl -s http://localhost:3000/api/automations/configs/1 \
  -X PUT \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"name":"Updated Email Triage","isActive":false}' | jq
```

**Expected:**
- 200 status
- Config updated

### Test 4.6: Delete Config
```bash
curl -s http://localhost:3000/api/automations/configs/1 \
  -X DELETE \
  -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Config deleted

---

## 5. Automation Execution Testing

### Test 5.1: Run Lead Follow-up (Simulated)
```bash
# Create config first
CONFIG_ID=$(curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"templateId":2,"name":"Lead Followup Test","configJson":{"crm":"Pipedrive","followUpDelay":7}}' | jq -r '.id')

# Trigger run
curl -s http://localhost:3000/api/automations/configs/$CONFIG_ID/run \
  -X POST \
  -b /tmp/cookies.txt | jq

# Wait 5 seconds for execution
sleep 5

# Check run status
curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt | jq
```

**Expected:**
- Run created with status "QUEUED"
- After 5s, status changes to "SUCCESS"
- Stats show:
  - itemsProcessed: 6
  - tasksCreated: 6
  - estimatedMinutesSaved: > 0

### Test 5.2: Run Email Triage (without Gmail)
```bash
CONFIG_ID=$(curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"templateId":1,"name":"Email Test","configJson":{"projectTool":"Asana"}}' | jq -r '.id')

curl -s http://localhost:3000/api/automations/configs/$CONFIG_ID/run -X POST -b /tmp/cookies.txt | jq
sleep 5
curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt | jq '.[0]'
```

**Expected:**
- Run succeeds using simulated emails
- Processes 5 simulated emails
- Creates 5 tasks

### Test 5.3: Run Form CRM Sync
```bash
CONFIG_ID=$(curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"templateId":3,"name":"Form Sync","configJson":{"formSource":"Typeform","targetCrm":"HubSpot"}}' | jq -r '.id')

curl -s http://localhost:3000/api/automations/configs/$CONFIG_ID/run -X POST -b /tmp/cookies.txt | jq
sleep 5
curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt | jq '.[0]'
```

**Expected:**
- Processes 3 simulated form submissions
- Creates 3 CRM contacts

### Test 5.4: Run Lead Slack Notify
```bash
CONFIG_ID=$(curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"templateId":4,"name":"Slack Test","configJson":{"crm":"HubSpot","scoreThreshold":50,"slackChannel":"#sales"}}' | jq -r '.id')

curl -s http://localhost:3000/api/automations/configs/$CONFIG_ID/run -X POST -b /tmp/cookies.txt | jq
sleep 5
curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt | jq '.[0]'
```

**Expected:**
- Processes 4 qualified leads
- Generates 4 Slack notifications (logged, not sent)

### Test 5.5: View Run Logs
```bash
RUN_ID=1
curl -s http://localhost:3000/api/runs/$RUN_ID/logs -b /tmp/cookies.txt | jq
```

**Expected:**
- Array of log entries with:
  - ts (timestamp)
  - level (INFO/WARN/ERROR)
  - message
  - metaJson (optional)

### Test 5.6: Concurrent Runs (Queue Management)
```bash
# Trigger 10 runs simultaneously
for i in {1..10}; do
  curl -s http://localhost:3000/api/automations/configs/2/run -X POST -b /tmp/cookies.txt &
done
wait

# Check queue status
sleep 2
curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt | jq 'length'
```

**Expected:**
- Max 5 runs RUNNING concurrently
- Others in QUEUED status
- All eventually complete

### Test 5.7: Retry Logic (Simulated Failure)
**Manual test:** Edit a template executor to throw an error, then:
```bash
curl -s http://localhost:3000/api/automations/configs/2/run -X POST -b /tmp/cookies.txt | jq
```

**Expected:**
- 3 retry attempts logged
- Delays: 1s → 2s → 4s (exponential backoff)
- Final status: FAILED
- Error logged

---

## 6. Gmail OAuth Testing

### Test 6.1: Initiate OAuth Flow
**Browser:** Navigate to http://localhost:3000/app/connections
Click "Connect Gmail"

**Expected:**
- Redirected to Google OAuth consent screen
- Scopes requested: gmail.readonly, gmail.modify

### Test 6.2: OAuth Callback
**After authorizing:**

**Expected:**
- Redirected back to /app/connections
- Connection created in database
- Token stored encrypted

**Verify:**
```bash
curl -s http://localhost:3000/api/connections -b /tmp/cookies.txt | jq
```

### Test 6.3: Run Email Triage with Gmail
```bash
# Ensure Gmail connected
curl -s http://localhost:3000/api/automations/configs/1/run -X POST -b /tmp/cookies.txt | jq
sleep 5
curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt | jq '.[0]'
```

**Expected:**
- Fetches real emails from Gmail
- Marks emails as read
- Creates tasks based on email content

### Test 6.4: Token Refresh
**Manual:** Expire access token, trigger run

**Expected:**
- Gmail connector auto-refreshes token
- Run succeeds without re-authorization

---

## 7. ROI Dashboard Testing

### Test 7.1: Calculate ROI Metrics
```bash
curl -s http://localhost:3000/api/roi -b /tmp/cookies.txt | jq
```

**Expected:**
- hoursSaved: Sum of estimatedMinutesSaved / 60
- totalRuns: Count of all runs
- successfulRuns: Count of SUCCESS runs
- totalItemsProcessed: Sum across runs
- cycleTimeReduction: Percentage
- confidenceScore: 0-100

**Verify calculation:**
- Run several automations
- Check that metrics update accordingly

---

## 8. Organization & RBAC Testing

### Test 8.1: Get Organization
```bash
curl -s http://localhost:3000/api/org -b /tmp/cookies.txt | jq
```

**Expected:**
- 200 status
- Org object with name, id

### Test 8.2: List Org Members
```bash
curl -s http://localhost:3000/api/org/members -b /tmp/cookies.txt | jq
```

**Expected:**
- Array of members with roles
- Current user has OWNER role

### Test 8.3: Invite Member (as OWNER)
```bash
curl -s http://localhost:3000/api/org/invite \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"email":"newmember@example.com","role":"OPERATOR"}' | jq
```

**Expected:**
- 200 status (if implemented)
- OR 501 "Not implemented" (current state)

### Test 8.4: RBAC Enforcement
**Test as non-OWNER:**
1. Create second user
2. Add to org as MEMBER
3. Try to delete automation config

**Expected:**
- 403 Forbidden
- `{"message":"Insufficient permissions"}`

---

## 9. WebSocket Real-time Logs Testing

### Test 9.1: Connect WebSocket Client
**JavaScript (browser console):**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws/runs?runId=1');
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Log:', data);
};
ws.onerror = (error) => console.error('WS Error:', error);
```

### Test 9.2: Trigger Run and Watch Logs
```javascript
// In browser console with WebSocket connected
fetch('/api/automations/configs/2/run', {method: 'POST'})
  .then(r => r.json())
  .then(run => console.log('Run created:', run.id));

// Logs should stream to console via WebSocket
```

**Expected:**
- Real-time log messages appear in console
- Status updates broadcast
- Connection closed when run completes

---

## 10. Error Handling & Edge Cases

### Test 10.1: Invalid Template ID
```bash
curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"templateId":999,"name":"Bad Template"}' | jq
```

**Expected:**
- 400 or 404 error
- Clear error message

### Test 10.2: Malformed JSON
```bash
curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{invalid json}' | jq
```

**Expected:**
- 400 Bad Request
- JSON parse error

### Test 10.3: Run Non-existent Config
```bash
curl -s http://localhost:3000/api/automations/configs/9999/run \
  -X POST \
  -b /tmp/cookies.txt | jq
```

**Expected:**
- 404 Not Found
- `{"message":"Config not found"}`

### Test 10.4: Database Connection Loss
**Manually stop PostgreSQL:**
```bash
brew services stop postgresql@18
curl -s http://localhost:3000/api/intakes -b /tmp/cookies.txt | jq
```

**Expected:**
- 500 Internal Server Error
- Logged error in server console

**Restore:**
```bash
brew services start postgresql@18
```

### Test 10.5: Large File Upload
```bash
# Create 15MB file (exceeds 10MB limit)
dd if=/dev/zero of=/tmp/large.pdf bs=1m count=15

curl -s http://localhost:3000/api/intakes \
  -F "title=Large Upload Test" \
  -F "painArea=DATA_ENTRY" \
  -F "files=@/tmp/large.pdf" \
  -b /tmp/cookies.txt | jq
```

**Expected:**
- 413 Payload Too Large
- OR request rejected by Multer middleware

---

## 11. Performance Testing

### Test 11.1: Response Time Baseline
```bash
time curl -s http://localhost:3000/api/automations/templates -b /tmp/cookies.txt > /dev/null
```

**Expected:**
- < 100ms response time

### Test 11.2: Concurrent Requests
```bash
ab -n 100 -c 10 -C "cookie-value" http://localhost:3000/api/automations/templates
```

**Expected:**
- All requests succeed
- Average response < 200ms

### Test 11.3: Database Query Performance
```bash
# Create 100 runs
for i in {1..20}; do
  curl -s http://localhost:3000/api/automations/configs/2/run -X POST -b /tmp/cookies.txt &
done
wait

# Query runs
time curl -s http://localhost:3000/api/runs -b /tmp/cookies.txt > /dev/null
```

**Expected:**
- Query completes in < 500ms even with 100+ runs

---

## 12. UI/UX Testing (Manual)

### Test 12.1: Navigation
- [ ] All sidebar links work
- [ ] Breadcrumbs accurate
- [ ] Back button functions correctly

### Test 12.2: Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)

### Test 12.3: Dark Mode
- [ ] Toggle theme switch
- [ ] All components render correctly in dark mode
- [ ] Contrast meets accessibility standards

### Test 12.4: Forms
- [ ] Intake wizard validates required fields
- [ ] Automation config saves correctly
- [ ] Error messages display inline

### Test 12.5: Real-time Updates
- [ ] Run status updates without refresh
- [ ] Logs stream in real-time on /app/runs
- [ ] Polling stops when all runs complete

---

## 13. Security Testing

### Test 13.1: SQL Injection
```bash
curl -s http://localhost:3000/api/intakes/1%27%20OR%20%271%27%3D%271 -b /tmp/cookies.txt | jq
```

**Expected:**
- No data leak
- Parameterized queries prevent injection

### Test 13.2: XSS Prevention
**Create intake with malicious title:**
```bash
curl -s http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d '{"title":"<script>alert(\"XSS\")</script>","painArea":"EMAIL_MANAGEMENT"}' | jq
```

**Expected:**
- Script tag escaped in UI
- No alert triggered

### Test 13.3: CSRF Protection
**Attempt request without session:**
```bash
curl -s http://localhost:3000/api/automations/configs \
  -H "Content-Type: application/json" \
  -d '{"templateId":1,"name":"CSRF Test"}' | jq
```

**Expected:**
- 401 Not authenticated
- Request rejected

### Test 13.4: Password Security
**Verify bcrypt hashing:**
```bash
psql postgresql://haroonwahed@localhost:5432/opscopilot -c "SELECT email, password FROM users LIMIT 1;"
```

**Expected:**
- Password is bcrypt hash (starts with `$2b$`)
- Not plaintext

---

## 14. Data Integrity Testing

### Test 14.1: Org Isolation
**Create two users in different orgs:**
```bash
# User 1
curl -s http://localhost:3000/api/auth/signup \
  -d '{"email":"user1@org1.com","password":"pass123","firstName":"User","lastName":"One"}' \
  -c /tmp/user1.txt | jq

# Create config as user1
curl -s http://localhost:3000/api/automations/configs \
  -d '{"templateId":1,"name":"User1 Config"}' \
  -b /tmp/user1.txt | jq

# User 2
curl -s http://localhost:3000/api/auth/signup \
  -d '{"email":"user2@org2.com","password":"pass123","firstName":"User","lastName":"Two"}' \
  -c /tmp/user2.txt | jq

# List configs as user2
curl -s http://localhost:3000/api/automations/configs -b /tmp/user2.txt | jq
```

**Expected:**
- User2 sees 0 configs
- Org isolation enforced

### Test 14.2: Cascade Deletes
**Verify database schema:**
```bash
psql postgresql://haroonwahed@localhost:5432/opscopilot -c "\d+ automation_configs"
```

**Expected:**
- Foreign keys with ON DELETE CASCADE
- Deleting org deletes all related data

---

## 15. Regression Testing Checklist

After any code changes, verify:

- [ ] Server starts without errors
- [ ] All 4 executors register
- [ ] WebSocket server initializes
- [ ] User can sign up/sign in
- [ ] Intakes can be created
- [ ] Blueprints generate (with/without OpenAI)
- [ ] Automation configs can be created
- [ ] Runs execute successfully
- [ ] Logs display correctly
- [ ] ROI metrics calculate
- [ ] Gmail OAuth flow works (if API key set)
- [ ] No console errors in browser
- [ ] Database migrations apply cleanly
- [ ] Environment variables loaded correctly

---

## Summary of Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Authentication | 6 | ✅ Core paths covered |
| Intakes & Blueprints | 6 | ✅ CRUD + generation |
| Automation Templates | 2 | ✅ List + detail |
| Automation Configs | 6 | ✅ Full CRUD |
| Execution Engine | 7 | ✅ All templates + edge cases |
| Gmail OAuth | 4 | ⚠️ Requires Google setup |
| ROI Metrics | 1 | ✅ Basic calculation |
| Organization & RBAC | 4 | ⚠️ Invite not implemented |
| WebSocket | 2 | ✅ Connection + streaming |
| Error Handling | 5 | ✅ Major edge cases |
| Performance | 3 | ✅ Baseline metrics |
| UI/UX | 5 | ⚠️ Manual testing required |
| Security | 4 | ✅ Core vulnerabilities |
| Data Integrity | 2 | ✅ Isolation verified |

**Total:** 57 test cases defined

---

## Known Limitations

1. **Templates 5-6 not implemented:** `invoice_intake` and `data_entry_automation` have no executors
2. **Gmail requires setup:** OAuth credentials must be configured in Google Cloud Console
3. **No real CRM/Slack integration:** All external APIs simulated
4. **No scheduled runs:** Cron functionality not implemented
5. **No user invitation flow:** Org member management incomplete
6. **No WebSocket UI:** Client-side WebSocket integration missing
7. **OpenAI fallback only:** Blueprint generation uses mock data without API key
8. **No automated tests:** No Jest/Vitest test suite exists

---

## Next Testing Priorities

1. **Add automated test suite** (Vitest + Supertest)
2. **Load testing** with k6 or Artillery
3. **End-to-end tests** with Playwright
4. **Security audit** with OWASP ZAP
5. **Accessibility testing** (WCAG 2.1 AA compliance)
6. **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
7. **Mobile device testing** (iOS Safari, Chrome Android)
8. **Performance profiling** with Lighthouse

---

## Success Criteria

✅ **All critical paths tested:**
- User can sign up and authenticate
- Automations can be configured and executed
- Runs complete successfully with logs
- ROI metrics calculated correctly
- Gmail OAuth flow functional (with setup)

✅ **Known issues documented:**
- Port 5000 conflicts with macOS AirPlay
- Template keys must match executor registration
- OpenAI API optional (fallback implemented)

✅ **Production readiness:**
- ⚠️ Not production-ready yet
- Needs: automated tests, monitoring, error alerting, rate limiting, backup strategy
1. Navigate to `/automations`
2. Click "New Automation"
3. Select a template:
   - **Email Task Triage** - Processes emails and creates tasks
   - **Lead Follow-up** - Automated lead nurturing
   - **Form → CRM Sync** - Webhook to CRM integration
   - **Lead → Slack Notify** - Qualified lead notifications
4. Configure settings (name, description, template-specific config)
5. Save configuration

### 3. Connect Gmail (for Email Triage)
1. Navigate to `/connections`
2. Click "Connect Gmail"
3. Authorize with Google (uses your OAuth credentials)
4. Verify connection shows as "Connected"

### 4. Run an Automation
1. Go to `/automations`
2. Click on your automation config
3. Click "Run Now" button
4. You'll be redirected to `/runs`

### 5. Watch Live Logs
1. On the runs page, see your run appear
2. Status transitions: QUEUED → RUNNING → SUCCESS/FAILED
3. Click "View Logs" to see execution details
4. Logs update in real-time via WebSocket

### 6. Verify Execution Results
Check run stats:
- Items processed
- Tasks created (if applicable)
- Estimated time saved
- Any exceptions/errors

## Test Each Template

### Email Task Triage
**Prerequisites**: Gmail connected
**What it does**: 
- Fetches unread emails from inbox
- Creates tasks for important emails
- Marks emails as read
- Simulates task creation in demo mode

**Test**:
1. Send yourself test emails
2. Run the automation
3. Check logs for email processing
4. Verify emails marked as read in Gmail

### Lead Follow-up
**What it does**:
- Simulates CRM lead query
- Generates personalized follow-up messages
- Tracks engagement

**Test**:
1. Configure with sample lead criteria
2. Run automation
3. Check logs for generated messages

### Form → CRM Sync
**What it does**:
- Simulates webhook from form submission
- Maps fields to CRM format
- Detects duplicates
- Creates/updates CRM records

**Test**:
1. Configure field mappings
2. Run automation
3. Check logs for form processing

### Lead → Slack Notify
**What it does**:
- Queries CRM for qualified leads
- Formats Slack message with lead details
- Simulates Slack notification

**Test**:
1. Configure qualification criteria
2. Run automation
3. Check logs for Slack message preview

## Advanced Testing

### Queue Management
1. Trigger multiple runs simultaneously
2. Observe concurrency limit (max 5 concurrent)
3. Additional runs queue until slots available

### Retry Logic
1. Simulate API failure (edit template to throw error)
2. Watch retry attempts in logs
3. Verify exponential backoff (1s → 2s → 4s)

### WebSocket Streaming
Open browser console on `/runs` page:
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/runs?runId=1');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## Known Limitations (Demo Mode)

- Gmail: Uses real API when connected, simulates otherwise
- CRM: All operations simulated (no real HubSpot/Salesforce)
- Slack: Messages logged but not sent
- Task creation: Logged but not persisted to task system

## Next Steps

After successful testing:
1. Add more connectors (HubSpot, Slack, Salesforce)
2. Build WebSocket UI components for live logs
3. Create scheduled run functionality
4. Add automation analytics dashboard
5. Implement webhook receivers
6. Add error alerting/monitoring
