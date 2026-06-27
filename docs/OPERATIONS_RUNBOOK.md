# Operations Runbook

Audience: anyone deploying, operating or incident-responding on the Aurivian / Opsly production service (`https://aurivian.nl`).

---

## Production smoke test

Run after every deployment to verify baseline functionality. All checks are **read-only** — no data is created or modified.

### 1. Health check

```bash
curl -s https://aurivian.nl/api/health
# Expected: 200 {"status":"ok","database":"connected"}
```

A `503` response means the database connection is broken. Check the Northflank service logs and the database status.

### 2. Security headers

```bash
curl -sI https://aurivian.nl/api/health
```

Verify:
- `content-security-policy` is present and contains `default-src 'self'`, `wss://aurivian.nl`, `fonts.googleapis.com`, `fonts.gstatic.com`
- `x-content-type-options: nosniff`
- `x-frame-options: SAMEORIGIN`
- `referrer-policy: no-referrer`
- `x-powered-by` is **absent**

### 3. Rate limiting

The signin limit is 10 requests per 15 minutes per IP. Hitting it 11 times should return 429:

```bash
for i in $(seq 1 11); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://aurivian.nl/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"smoke@test.invalid","password":"wrong"}')
  echo "Request $i: $STATUS"
done
```

Expected: requests 1–10 → `401`, request 11 → `429`.

On the `429` response, verify RFC 9110 headers:
```bash
curl -sI -X POST https://aurivian.nl/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"x@test.invalid","password":"w"}' | grep -E "ratelimit|retry-after"
# ratelimit-policy: 10;w=900
# ratelimit: limit=10, remaining=0, reset=...
# retry-after: ...
```

> **Note:** Running this test exhausts the rate-limit window for your IP. Wait 15 minutes before testing signin from the same IP, or use a different IP / VPN.

### 4. Signup rate limiting (5 / 60 min)

```bash
for i in $(seq 1 6); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://aurivian.nl/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"smoke${i}@test.invalid\",\"password\":\"password123\"}")
  echo "Request $i: $STATUS"
done
# Requests 1-5: 200, Request 6: 429
```

### 5. Magic-link rate limiting (5 / 15 min)

```bash
for i in $(seq 1 6); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://aurivian.nl/api/auth/magic-link \
    -H "Content-Type: application/json" \
    -d '{"email":"smoke@test.invalid"}')
  echo "Request $i: $STATUS"
done
# Requests 1-5: 200, Request 6: 429
```

### 6. Demo rate limiting (10 / 60 min)

```bash
for i in $(seq 1 11); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://aurivian.nl/api/auth/demo \
    -H "Content-Type: application/json" -d '{}')
  echo "Request $i: $STATUS"
done
# Requests 1-10: 200, Request 11: 429
```

### 7. Public routes

```bash
for ROUTE in "/" "/services" "/products" "/products/opsly" "/approach" "/experience" "/about" "/contact" "/pricing" "/privacy" "/terms"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://aurivian.nl${ROUTE}")
  echo "$ROUTE: $STATUS"
done
# All should return 200
```

### 8. Protected API (without session)

```bash
for ENDPOINT in "/api/auth/user" "/api/intakes" "/api/blueprints" "/api/automations" "/api/runs"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://aurivian.nl${ENDPOINT}")
  echo "$ENDPOINT: $STATUS"
done
# All should return 401
```

### 9. TLS

```bash
curl -sI https://aurivian.nl/ | grep -E "strict-transport|server"
# strict-transport-security: max-age=31536000; includeSubDomains  (from Cloudflare)
```

### 10. WebSocket (CSP canary)

From a browser console at `https://aurivian.nl`:
```javascript
const ws = new WebSocket('wss://aurivian.nl/ws/runs?runId=smoke');
ws.onopen = () => console.log('WS open, readyState:', ws.readyState);  // expect 1
ws.onerror = () => console.error('WS error — check CSP connect-src');
```

Expected: `readyState: 1 (OPEN)`. An error here means the CSP `connect-src` is blocking the WebSocket.

### 11. Fonts and browser CSP

Navigate to `https://aurivian.nl` in a browser. Open the Network tab and confirm:
- `fonts.googleapis.com` CSS → `200`
- `fonts.gstatic.com` woff2 files → `200`

Open the Console tab. **No CSP violation errors should appear.**

### 12. Frontend baseline

- Page loads with Dutch language (`lang="nl"`, Dutch navigation labels)
- Dark mode is default (`class="dark"` on `<html>`)
- Dark mode toggle switches the theme and restores it

---

## Deployment procedure

1. Push to `main` — Northflank auto-deploys via the connected Dockerfile build.
2. Watch the Northflank build log until the image is pushed and the service shows "Healthy".
3. Run the smoke test checklist above.
4. If any check fails, evaluate whether to roll back (see below).

**Schema changes** — `drizzle-kit push` runs automatically on startup. No manual step needed. There is no automatic rollback of schema changes; assess manually if rolling back a deployment that included schema changes.

---

## Rollback

### Triggers

Roll back if any of the following are observed within 30 minutes of a deployment:

- `/api/health` returns `503` for > 2 minutes
- More than 5% of API requests return `500`
- Any auth route returns `500` (not `401` or `429`)
- WebSocket connections fail to upgrade
- CSP violations appear in browser console for core functionality (fonts, API calls, WebSocket)

### Procedure

1. In Northflank: open the service → **Deployments** → select the previous healthy build → **Deploy**.
2. Wait for the new image to become healthy.
3. Verify `/api/health` returns `200`.
4. Re-run the full smoke test.
5. If the rollback itself fails: escalate, check database connectivity and environment variable changes.

**Schema rollback** — if the deployment that is being rolled back included schema changes, assess whether the previous image is compatible with the current schema. If not, a manual schema migration may be required before rolling back.

---

## Monitoring

### Health check cadence

Configure an external uptime monitor (e.g. UptimeRobot, Better Uptime) to poll `https://aurivian.nl/api/health` every 5 minutes. Alert on any response other than `200` or on response time > 10 seconds.

### Log inspection

Access logs via the Northflank service's log viewer. Key patterns to watch:

```
# Drizzle-kit push output (startup)
[✓] Changes applied

# Rate-limit events (these are normal; alert only if volume is extreme)
Too many sign-in attempts

# Database errors (investigate)
Error: Connection refused
ECONNREFUSED

# Unhandled errors (always investigate)
UnhandledPromiseRejection
```

### Daily checks (first week after deployment)

```bash
# Database record counts (run against production DB)
SELECT count(*) FROM users;
SELECT count(*) FROM orgs;
SELECT count(*) FROM intakes;
SELECT count(*) FROM runs;

# TLS certificate expiry
openssl s_client -connect aurivian.nl:443 -servername aurivian.nl 2>/dev/null | openssl x509 -noout -dates
```

---

## Incident response

### Database unreachable (`/api/health` → 503)

1. Check the Northflank service logs for connection errors.
2. Check the database service status in Northflank.
3. Verify `DATABASE_URL` in the service's environment variables.
4. If the database is healthy and the URL is correct, restart the service container.

### High 429 rate on signin

A spike in 429 responses on `/api/auth/signin` is expected behaviour — the rate limiter is working. If the rate is unusually high (sustained automated attack), consider temporarily increasing the blocking response to indicate service degradation or add IP-level blocking at the Cloudflare layer.

### WebSocket not connecting

1. Verify the Northflank ingress passes `Upgrade: websocket` headers.
2. Check the browser console for CSP `connect-src` violations.
3. Verify the production CSP contains `wss://aurivian.nl` in `connect-src`.

### CSP violation in browser

1. Identify the blocked resource URL from the browser console error message.
2. Determine whether the resource is intentional (trusted) or a sign of injection.
3. If trusted, update `server/security.ts` `configureHelmet` with the new directive.
4. If suspicious, treat as a potential XSS incident — investigate immediately.

---

## Known open items

| Item | Impact | Action required |
|---|---|---|
| `www.aurivian.nl` HTTP 525 | **P1 — launch blocker** | `www` returns HTTP 525 (Cloudflare SSL handshake error). Public launch is not ready until a Cloudflare Redirect Rule sends `www.aurivian.nl → https://aurivian.nl` (301). Apex `https://aurivian.nl` is unaffected. |
| Magic link email delivery | High | Token currently logged to console only; no email sent. Do not promote the magic-link flow to users until email delivery is implemented. |
| `SameSite` cookie attribute | Low | Not explicitly set |
| Rate-limit window reset | Informational | Signin window resets 15 min after first request in window; no manual action needed |
