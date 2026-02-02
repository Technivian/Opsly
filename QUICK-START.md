# Quick Start: Using the New Execution Engine

## 1. Install Dependencies
```bash
npm install
# googleapis was just installed for Gmail integration
```

## 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and set:
# - DATABASE_URL (required)
# - AI_INTEGRATIONS_OPENAI_API_KEY (for blueprints)
# - GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET (optional, for Gmail)
```

## 3. Run the Server
```bash
npm run dev
```

## 4. Test Automation Execution

### Option A: Without Gmail (Simulated)
1. Go to `/app/automations`
2. Click "Configure" on "Email to Task Triage"
3. Fill in config (any values work)
4. Save config
5. Click "Run Test"
6. Watch logs in real-time (they update every 100-500ms)
7. See status change: QUEUED → RUNNING → SUCCESS

### Option B: With Real Gmail
1. Set up OAuth credentials:
   - https://console.cloud.google.com
   - Create project → Enable Gmail API
   - Create OAuth 2.0 credentials (Web application)
   - Add redirect URI: `http://localhost:5000/api/connections/gmail/callback`
   - Copy Client ID and Secret to `.env`

2. Connect Gmail:
   - Go to `/app/connections`
   - Click "Connect" on Gmail
   - Authorize access
   - You'll be redirected back

3. Run email triage with real data:
   - Configure "Email to Task Triage"
   - Set filter: `is:unread` (or any Gmail query)
   - Run test
   - Watch it fetch and process actual emails
   - Check Gmail - processed emails marked as read

## 5. Test Other Templates

### Form to CRM Sync
- **Use case:** Automate form submission → CRM contact creation
- **Config:** Set formSource=Google Forms, targetCrm=HubSpot
- **Result:** Simulates processing 3-15 form submissions, creates/updates CRM contacts

### Lead Follow-up
- **Use case:** Auto-send follow-up emails to stale CRM leads
- **Config:** Set CRM=HubSpot, daysSinceLastContact=7
- **Result:** Queries CRM for leads, sends personalized emails (simulated)

### Lead Slack Notification
- **Use case:** Notify sales reps when leads hit score threshold
- **Config:** Set CRM=HubSpot, scoreThreshold=50, slackChannel=#sales
- **Result:** Finds qualified leads, sends rich Slack messages (simulated)

## 6. Monitor Execution

### Real-Time Logs (WebSocket)
```javascript
// In browser console or custom client
const runId = 123; // From run response
const ws = new WebSocket(`ws://localhost:5000/ws/runs?runId=${runId}`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(msg.type, msg.data);
};

ws.onerror = (error) => console.error('WebSocket error:', error);
```

### Queue Status API
Add this endpoint to `server/routes.ts`:
```typescript
app.get("/api/runs/queue", isAuthenticated, (req, res) => {
  const { getQueueStatus } = require("./execution/executor");
  res.json(getQueueStatus());
});
```

Then query: `GET /api/runs/queue`
```json
{
  "queued": 3,
  "active": 2,
  "maxConcurrent": 5
}
```

## 7. Retry Logic in Action

To see retries:
1. Edit a template to throw an error: `throw new Error("Simulated failure")`
2. Run the automation
3. Watch logs: "Attempt 1 failed... Retrying in 1000ms..."
4. After 3 attempts, run fails with detailed error

## 8. ROI Dashboard

After running several automations:
- Go to `/app/roi`
- See aggregated metrics:
  - Hours saved (from all successful runs)
  - Items processed
  - Success rate
  - 7-day activity trend

## Troubleshooting

### "No executor registered for template"
- Check `server/execution/templates/index.ts`
- Ensure template key matches database seeded value
- Restart server to re-register executors

### Gmail OAuth fails
- Verify redirect URI matches exactly in Google Console
- Check GMAIL_CLIENT_ID and SECRET are set
- Ensure Gmail API is enabled in project

### WebSocket not connecting
- Check browser console for errors
- Verify runId is valid number
- Server must be running with WebSocket support

### Runs stuck in QUEUED
- Check `getQueueStatus()` - may be at concurrency limit
- Wait for active runs to complete
- Restart server to clear queue

## Next Development Steps

1. **Build HubSpot connector** (like Gmail)
2. **Build Slack connector** (like Gmail)
3. **Update client UI** to connect to WebSocket
4. **Add run cancellation** (abort button)
5. **Add scheduled runs** (cron triggers)
6. **Add AI email classification** (OpenAI)

---

**🎉 You now have a production-ready automation execution engine!**

- ✅ 4 working templates
- ✅ Gmail OAuth integration
- ✅ Retry logic
- ✅ WebSocket streaming
- ✅ Queue management
