# Deployment — Northflank

Opsly runs as a single Node.js / Express container on **Northflank**. DNS, CDN and TLS are handled by **Cloudflare**. This document covers Northflank setup, environment variables and the Cloudflare configuration required to point `aurivian.nl` at the service.

> This is the only supported production deployment target. Render, Railway, Koyeb and Cloudflare Workers are not supported and are not documented here.

---

## Prerequisites

- Northflank account and project
- PostgreSQL database provisioned (Northflank managed database or external)
- `DATABASE_URL` and `SESSION_SECRET` ready
- Domain `aurivian.nl` on Cloudflare

---

## How the build and start work

```bash
npm run build   # script/build.ts → Vite (client) + esbuild (server → dist/index.cjs)
npm run start   # NODE_ENV=production node dist/index.cjs
```

On startup the server runs `npx drizzle-kit push` to sync the database schema automatically. **devDependencies must remain installed at runtime** — the Dockerfile runs `npm ci` (not `npm ci --omit=dev`) for this reason.

The Dockerfile:
- Base image: `node:22.12.0-slim`
- Exposes: port `8080`
- Default env: `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=8080`

---

## Northflank service configuration

| Field | Value |
|---|---|
| Build type | Dockerfile |
| Build context | `/` |
| Dockerfile path | `/Dockerfile` |
| Exposed internal port | `8080` (HTTP) |
| Health check | HTTP `GET /api/health` on port `8080` |
| Healthy response | `200 {"status":"ok","database":"connected"}` |

---

## Environment variables

Set these in the Northflank service's environment configuration. Never commit secrets to the repository.

### Required

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `HOST` | `0.0.0.0` | Required for container networking |
| `PORT` | `8080` | Must match the exposed port |
| `DATABASE_URL` | `postgresql://USER:PASS@HOST:5432/DB?sslmode=require` | Use `sslmode=no-verify` if the provider's chain is untrusted |
| `SESSION_SECRET` | (random 32+ char string) | `openssl rand -base64 32` |

### Recommended

| Variable | Value | Notes |
|---|---|---|
| `BASE_URL` | `https://aurivian.nl` | Used for Gmail OAuth callback URLs |

### Optional

| Variable | Notes |
|---|---|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Blueprint generation; has a fallback if absent |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Default: `https://api.openai.com/v1` |
| `GMAIL_CLIENT_ID` | Gmail integration in `/app` |
| `GMAIL_CLIENT_SECRET` | Gmail integration in `/app` |
| `GMAIL_REDIRECT_URI` | Must match the OAuth app's registered redirect URI |

Full variable reference: [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

---

## Database schema

Schema sync runs automatically on every startup via `drizzle-kit push`. No manual migration step is needed after deployment. The startup log will show Drizzle's output confirming the schema is up to date.

To run `drizzle-kit push` manually against the production database:
```bash
DATABASE_URL="postgresql://..." npx drizzle-kit push
```

---

## Health check

```bash
curl https://aurivian.nl/api/health
# 200 {"status":"ok","database":"connected"}

# If the database is unreachable:
# 503 {"status":"error","database":"disconnected"}
```

Configure Northflank's health check to call `GET /api/health` on port `8080`. A `503` response means the database connection is broken, not that the process is down.

---

## WebSocket

WebSocket connections upgrade on the same HTTP port:

```
wss://aurivian.nl/ws/runs?runId=<id>
```

No separate WebSocket port or service is required. Northflank's ingress must pass `Upgrade: websocket` headers through to the container. The CSP `connect-src 'self' wss://aurivian.nl` permits this origin.

---

## Cloudflare DNS configuration

`aurivian.nl` should be on Cloudflare for DNS, TLS and the `www` redirect. The application itself runs on Northflank.

### DNS records

| Type | Name | Content | Proxy status |
|---|---|---|---|
| `CNAME` | `@` (apex) | `<northflank-service-hostname>` | Proxied (orange cloud) |
| `CNAME` | `www` | `aurivian.nl` | Proxied (orange cloud) |

Replace `<northflank-service-hostname>` with the hostname Northflank assigns to the service (visible in the service's networking tab).

### SSL/TLS

- Mode: **Full (strict)**
- Always Use HTTPS: **On**

### Redirect rule (www → apex)

Add a Cloudflare Redirect Rule:
- **If**: `Hostname` equals `www.aurivian.nl`
- **Then**: Redirect to `https://aurivian.nl` (301, preserve path and query)

> **Known open item:** `www.aurivian.nl` currently returns HTTP 525 (SSL handshake error). This redirect rule resolves it.

### Do not modify

- Existing MX, SPF, DKIM and DMARC records must not be removed.

---

## HSTS

HSTS (`Strict-Transport-Security`) is applied by Cloudflare's ingress, not by the application. The Helmet configuration explicitly disables `strictTransportSecurity` to avoid a duplicate header. Do not re-enable it in the application without removing it from Cloudflare first.

---

## Cloudflare Workers — not a deployment target

An old Cloudflare Workers project (`opsly`) may still be Git-connected to this repository. Its build fails on every push (expected — a Node/Express server cannot run on the Workers runtime). This check is non-blocking but is noise.

To remove it: Cloudflare Dashboard → **Workers & Pages → `opsly` → Settings → Builds** → disconnect the repository.

---

## Rollback

Northflank supports deploying a previous image by selecting a prior build in the service's deploy history. Database schema changes made via `drizzle-kit push` are not automatically reverted — assess whether a schema rollback is needed before rolling back the image.

For an emergency rollback procedure see [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md).

---

## Verifying a deployment

After a new image is deployed:

```bash
# 1. Health
curl https://aurivian.nl/api/health

# 2. Security headers
curl -sI https://aurivian.nl/api/health | grep -E "content-security-policy|x-powered-by|x-content-type-options"

# 3. x-powered-by must be absent
curl -sI https://aurivian.nl/ | grep x-powered-by   # should return nothing

# 4. WebSocket (requires wscat or similar)
# Confirm wss://aurivian.nl/ws/runs?runId=1 returns HTTP 101
```

For the full smoke test checklist, see [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md).
