# Environment variables

All variables are read from `process.env` at runtime. In local development, copy `.env.example` to `.env`. In production (Northflank), set them in the service's environment configuration — never commit secrets to the repository.

---

## Required in production

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Set to `development` locally |
| `HOST` | `0.0.0.0` | Required in containers; defaults to `127.0.0.1` |
| `PORT` | `8080` | Northflank uses `8080`; defaults to `5000` in dev |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | PostgreSQL connection string. Use `sslmode=no-verify` if the provider's certificate chain is untrusted |
| `SESSION_SECRET` | _(random 44-char base64)_ | Generates with `openssl rand -base64 32`. Must be stable across restarts — changing it invalidates all existing sessions |

---

## Recommended in production

| Variable | Example | Notes |
|---|---|---|
| `BASE_URL` | `https://aurivian.nl` | Used to construct absolute URLs for OAuth redirect URIs (Gmail). In development: `http://localhost:5000` |

---

## Optional — AI / blueprint generation

| Variable | Example | Notes |
|---|---|---|
| `AI_INTEGRATIONS_OPENAI_API_KEY` | `sk-proj-…` | If absent, blueprint generation falls back to a rule-based approach |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` | Override to use a compatible API (e.g. Azure OpenAI) |

---

## Optional — Gmail integration

Required only if the Gmail connector in `/app/connections` is used.

| Variable | Example | Notes |
|---|---|---|
| `GMAIL_CLIENT_ID` | `…apps.googleusercontent.com` | From Google Cloud Console OAuth 2.0 credentials |
| `GMAIL_CLIENT_SECRET` | `GOCSPX-…` | From Google Cloud Console OAuth 2.0 credentials |
| `GMAIL_REDIRECT_URI` | `https://aurivian.nl/api/connections/gmail/callback` | Must exactly match the URI registered in the Google Cloud Console OAuth app |

---

## Local development example (`.env.example`)

```dotenv
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/opsly_dev

# Session
SESSION_SECRET=change-this-to-a-random-32-char-string

# OpenAI (optional)
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-api-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Gmail OAuth (optional)
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/connections/gmail/callback

# Base URL (for OAuth redirects)
BASE_URL=http://localhost:5000

# Node environment
NODE_ENV=development
```

---

## Notes

**DATABASE_URL database name** — the `.env.example` shipped in the repository uses the legacy database name `opscopilot`. When provisioning a new database, use a name of your choice (`opsly`, `aurivian`, etc.) and set `DATABASE_URL` accordingly. The application does not hard-code a database name.

**SESSION_SECRET stability** — the session secret is used to sign session cookies. If it changes, all active sessions are immediately invalidated and users are logged out. Treat it as a long-lived secret and rotate only intentionally.

**No NODE_VERSION variable needed** — the Dockerfile pins `node:22.12.0-slim` directly. If your platform reads `.nvmrc` instead, it will find `22.12.0` there. Setting `NODE_VERSION` as an env variable is not required and has no effect on the Dockerfile build.
