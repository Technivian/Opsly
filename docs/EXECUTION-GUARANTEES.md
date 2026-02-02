# Automation Execution Engine - Technical Guarantees

**Last Updated:** February 2, 2026  
**Owner:** Platform Engineering  
**Audience:** Operations Managers, Technical Support, Platform Engineers

---

## Overview

Opsly's automation execution engine is designed with **determinism, auditability, and safety** as core principles. Every decision is visible in logs, every state transition is tracked, and every failure is explainable.

**Design Philosophy:**
> "If something goes wrong, an ops manager must understand *why* without calling support."

---

## Execution Guarantees

### 1. Concurrency Control

**Guarantee:** Maximum 5 runs execute simultaneously. Excess runs queue automatically.

**Implementation:**
```typescript
export const MAX_CONCURRENT_RUNS = 5;
```

**Visible Behavior:**
- Run enters queue: `"Queued for execution (position 3, priority 0)"`
- Queue processes: `"QUEUED → RUNNING (2 active, 4 queued)"`
- Run completes: Next queued run starts automatically

**Operational Impact:**
- No resource exhaustion under load
- Predictable system behavior
- Fair scheduling (FIFO with priority override)

**Monitoring:**
- `GET /api/queue/status` - Current queue state
- Run logs show exact queue position and wait time

---

### 2. Retry Behavior

**Guarantee:** Failed runs retry up to 3 times with exponential backoff.

**Retry Schedule:**
| Attempt | Delay    | Total Wait |
|---------|----------|------------|
| 1       | 0ms      | 0s         |
| 2       | 1000ms   | 1s         |
| 3       | 2000ms   | 3s         |
| 4       | 4000ms   | 7s         |

**Implementation:**
```typescript
export const MAX_RETRY_ATTEMPTS = 3;
export const INITIAL_RETRY_DELAY_MS = 1000;
export const RETRY_BACKOFF_MULTIPLIER = 2;
```

**Non-Retryable Errors** (fail immediately):
- `400 Bad Request` - Invalid automation configuration
- `401 Unauthorized` - OAuth token expired or invalid
- `403 Forbidden` - Insufficient permissions

**Visible Behavior:**
```
[12:34:56] INFO  → RUNNING: Starting automation run...
[12:34:57] WARN  ✗ Attempt 1 failed: Network timeout. Retrying in 1000ms...
[12:34:58] INFO  → RETRYING (attempt 2/4)
[12:34:59] WARN  ✗ Attempt 2 failed: Network timeout. Retrying in 2000ms...
[12:35:01] INFO  → RETRYING (attempt 3/4)
[12:35:02] INFO  ✓ Retry successful on attempt 3
[12:35:02] INFO  → SUCCESS: Processed 15 items in 6.2s
```

**Database Tracking:**
- `attemptCount`: Total attempts made (visible in UI)
- `lastError`: Most recent error message (visible in run details)

---

### 3. State Transitions

**Guarantee:** All runs follow explicit state machine. Every transition is logged.

**State Machine:**
```
QUEUED → RUNNING → SUCCESS
              ↓
           RETRYING → RUNNING → SUCCESS
              ↓           ↓
           FAILED      FAILED
```

**Transition Rules:**
1. **QUEUED → RUNNING**: When execution slot available
2. **RUNNING → RETRYING**: On retryable error (not 4xx)
3. **RETRYING → RUNNING**: Before each retry attempt
4. **RUNNING → SUCCESS**: Execution completes without error
5. **RUNNING → FAILED**: Non-retryable error OR all retries exhausted
6. **RETRYING → FAILED**: All retries exhausted

**Visible Behavior:**
Every transition appears in logs with `→` prefix:
- `→ QUEUED → RUNNING (2 active, 4 queued)`
- `→ RETRYING (attempt 2/4)`
- `→ SUCCESS: Processed 15 items in 2.3s`
- `→ FAILED: All 4 attempts exhausted`

---

### 4. Audit Trail

**Guarantee:** Every execution decision is logged with timestamp and context.

**What Gets Logged:**

| Event | Level | Example Message |
|-------|-------|-----------------|
| Queue entry | INFO | `Queued for execution (position 3, priority 0)` |
| Start | INFO | `→ RUNNING: Starting automation run...` |
| Template | INFO | `Executing template: Email Task Triage` |
| Retry | WARN | `✗ Attempt 1 failed: Network timeout. Retrying in 1000ms...` |
| Success | INFO | `→ SUCCESS: Processed 15 items in 2.3s` |
| Failure | ERROR | `→ FAILED: OAuth token expired` |

**Metadata Included:**
- Attempt count and max attempts
- Retry delay in milliseconds
- Queue position and active run count
- Execution duration
- Items processed and tasks created
- Full error messages and stack traces

**Access:**
- `GET /api/runs/:id/logs` - Retrieve all logs for a run
- `WebSocket /ws/runs/:id` - Real-time log streaming
- Database table: `run_logs` (permanent retention)

---

## Operational Scenarios

### Scenario 1: Normal Execution

**Input:** Trigger automation with 5 runs already active

**Behavior:**
1. Run enters queue position 1
2. Wait for active run to complete (~30s average)
3. Execute immediately when slot available
4. Process items successfully
5. Complete in SUCCESS state

**Logs:**
```
[12:00:00] INFO  Queued for execution (position 1, priority 0)
           meta: { activeRuns: 5, maxConcurrent: 5 }
[12:00:32] INFO  → QUEUED → RUNNING (4 active, 0 queued)
[12:00:32] INFO  → RUNNING: Starting automation run...
[12:00:33] INFO  Executing template: Lead Follow-up
[12:00:35] INFO  → SUCCESS: Processed 12 items in 2.8s
           meta: { itemsProcessed: 12, tasksCreated: 12, durationMs: 2834 }
```

---

### Scenario 2: Transient Failure with Recovery

**Input:** Network hiccup causes API timeout

**Behavior:**
1. Attempt 1 fails (network timeout)
2. Wait 1 second, retry
3. Attempt 2 succeeds
4. Complete in SUCCESS state

**Logs:**
```
[12:00:00] INFO  → RUNNING: Starting automation run...
[12:00:02] WARN  ✗ Attempt 1 failed: ETIMEDOUT. Retrying in 1000ms...
           meta: { attempt: 1, delayMs: 1000, error: "ETIMEDOUT" }
[12:00:03] INFO  → RETRYING (attempt 2/4)
[12:00:04] INFO  ✓ Retry successful on attempt 2
[12:00:04] INFO  → SUCCESS: Processed 8 items in 4.1s
```

**Database:**
```json
{
  "status": "SUCCESS",
  "attemptCount": 2,
  "lastError": "ETIMEDOUT"
}
```

---

### Scenario 3: Permanent Failure

**Input:** OAuth token expired (401 Unauthorized)

**Behavior:**
1. Attempt 1 fails with 401
2. Non-retryable error detected
3. Immediately fail (no retries)
4. Complete in FAILED state

**Logs:**
```
[12:00:00] INFO  → RUNNING: Starting automation run...
[12:00:01] ERROR ✗ Non-retryable error (401): OAuth token expired
           meta: { error: "OAuth token expired" }
[12:00:01] ERROR → FAILED: OAuth token expired
           meta: { error: "OAuth token expired", stack: "..." }
```

**Database:**
```json
{
  "status": "FAILED",
  "attemptCount": 1,
  "lastError": "OAuth token expired"
}
```

**Ops Manager Action:**
1. Check run details page
2. See `attemptCount: 1` and `lastError: "OAuth token expired"`
3. Navigate to Connections page
4. Reconnect Gmail OAuth
5. Retry run manually

---

### Scenario 4: All Retries Exhausted

**Input:** Persistent service outage (e.g., CRM API down)

**Behavior:**
1. Attempt 1 fails (503 Service Unavailable)
2. Wait 1s, retry (fails again)
3. Wait 2s, retry (fails again)
4. Wait 4s, retry (fails again)
5. Mark as FAILED after 4 attempts

**Logs:**
```
[12:00:00] INFO  → RUNNING: Starting automation run...
[12:00:01] WARN  ✗ Attempt 1 failed: Service Unavailable. Retrying in 1000ms...
[12:00:02] INFO  → RETRYING (attempt 2/4)
[12:00:03] WARN  ✗ Attempt 2 failed: Service Unavailable. Retrying in 2000ms...
[12:00:05] INFO  → RETRYING (attempt 3/4)
[12:00:06] WARN  ✗ Attempt 3 failed: Service Unavailable. Retrying in 4000ms...
[12:00:10] INFO  → RETRYING (attempt 4/4)
[12:00:11] ERROR ✗ All 4 attempts exhausted. Marking as FAILED.
           meta: { totalAttempts: 4, finalError: "Service Unavailable" }
[12:00:11] ERROR → FAILED: Service Unavailable
```

**Database:**
```json
{
  "status": "FAILED",
  "attemptCount": 4,
  "lastError": "Service Unavailable"
}
```

**Total Wait Time:** 7 seconds (1s + 2s + 4s)

---

## Configuration

### Environment Variables

None required. All behavior is hardcoded for predictability.

### Runtime Constants

Located in `server/execution/executor.ts`:

```typescript
// Concurrency
export const MAX_CONCURRENT_RUNS = 5;

// Retry
export const MAX_RETRY_ATTEMPTS = 3;
export const INITIAL_RETRY_DELAY_MS = 1000;
export const RETRY_BACKOFF_MULTIPLIER = 2;
```

**To modify:** Update constants and redeploy. No configuration files or environment variables.

---

## Monitoring & Debugging

### Real-Time Monitoring

**Queue Status:**
```bash
GET /api/queue/status
```

Response:
```json
{
  "queued": 3,
  "active": 5,
  "maxConcurrent": 5
}
```

**Run Logs (Polling):**
```bash
GET /api/runs/:id/logs
```

Response:
```json
[
  {
    "id": 123,
    "runId": 45,
    "ts": "2026-02-02T12:00:00Z",
    "level": "INFO",
    "message": "→ RUNNING: Starting automation run...",
    "metaJson": {}
  }
]
```

**WebSocket (Real-Time):**
```javascript
const ws = new WebSocket('/ws/runs/45');
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'log') {
    console.log(data.message);
  }
};
```

### Debugging Failed Runs

**Step 1: Check Run Details**
```bash
GET /api/runs/:id
```

Look for:
- `status`: Should be "FAILED"
- `attemptCount`: How many times it tried
- `lastError`: Most recent error message

**Step 2: Read Full Logs**
```bash
GET /api/runs/:id/logs
```

Filter for:
- `level: "ERROR"` - Final failure reason
- `level: "WARN"` - Retry attempts and reasons
- `metaJson` - Structured error data

**Step 3: Identify Root Cause**

| Last Error | Root Cause | Fix |
|------------|------------|-----|
| "OAuth token expired" | Token expired | Reconnect in Connections page |
| "Network timeout" | Transient network issue | Retry run manually |
| "Service Unavailable" | External service down | Wait and retry later |
| "Invalid config" | Bad automation config | Edit config, fix validation |

**Step 4: Retry Run**
```bash
POST /api/automations/configs/:configId/run
```

---

## System Limits

| Resource | Limit | Behavior When Exceeded |
|----------|-------|------------------------|
| Concurrent runs | 5 | Queue additional runs (FIFO) |
| Retry attempts | 3 | Mark as FAILED |
| Max retry delay | 4s | No further increase |
| Log retention | Indefinite | Stored in `run_logs` table |
| Queue size | Unlimited | Accept all runs (no rejection) |

---

## Error Categories

### Retryable Errors
- Network timeouts
- 5xx server errors
- Temporary service unavailability
- Rate limiting (429)

**Behavior:** Retry with exponential backoff

### Non-Retryable Errors
- 400 Bad Request (invalid config)
- 401 Unauthorized (auth failure)
- 403 Forbidden (permission denied)
- 404 Not Found (missing resource)

**Behavior:** Fail immediately, no retries

---

## Future Enhancements

**Not Implemented (but considered):**
- Configurable retry limits per template
- Dead letter queue for permanent failures
- Automatic retry on specific error codes
- Priority escalation for aged queue items
- Scheduled/recurring runs

**Philosophy:** Only add complexity when ops managers request it. Current design serves 95% of use cases.

---

## Technical Implementation Notes

### Database Schema

**runs table:**
```sql
CREATE TABLE runs (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL,
  automation_config_id INTEGER NOT NULL,
  status run_status DEFAULT 'QUEUED',
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  attempt_count INTEGER DEFAULT 0,    -- NEW: Retry tracking
  last_error TEXT,                    -- NEW: Error persistence
  stats_json JSONB
);
```

**run_status enum:**
```sql
CREATE TYPE run_status AS ENUM (
  'QUEUED',   -- Waiting in queue
  'RUNNING',  -- Currently executing
  'RETRYING', -- NEW: Between retry attempts
  'SUCCESS',  -- Completed successfully
  'FAILED'    -- Permanent failure
);
```

### Concurrency Model

**In-Memory State:**
- `activeRuns: Set<number>` - Currently executing run IDs
- `runQueue: QueuedRun[]` - Waiting runs (sorted by priority)

**Thread Safety:** Single-threaded Node.js event loop (no race conditions)

**Persistence:** Queue state is not persisted (lost on restart). Runs remain in QUEUED status in database.

### Retry Algorithm

```typescript
for (attempt = 1; attempt <= 4; attempt++) {
  try {
    result = await executor(ctx);
    return result; // Success
  } catch (error) {
    if (isNonRetryable(error)) {
      throw error; // Fail immediately
    }
    if (attempt < 4) {
      await updateStatus('RETRYING');
      await delay(1000 * 2^(attempt-1));
      await updateStatus('RUNNING');
    }
  }
}
throw lastError; // All retries exhausted
```

---

## Support Escalation

**For Ops Managers:**
1. Check run details (`attemptCount`, `lastError`)
2. Read run logs (filter ERROR and WARN)
3. Identify error category (retryable vs. non-retryable)
4. Take corrective action (reconnect, fix config, wait)
5. Retry run manually

**Escalate to Support If:**
- `lastError` is unclear or generic
- Same automation fails repeatedly (>10 runs)
- Error message contains "Internal Server Error"
- Retry behavior seems incorrect (wrong attempt count)

**Do Not Escalate For:**
- "OAuth token expired" → Reconnect in UI
- "Service Unavailable" → External service issue
- "Invalid config" → Fix configuration

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2, 2026 | Initial release with retry tracking and RETRYING status |

---

**Questions?** See `/server/execution/executor.ts` for implementation details.
