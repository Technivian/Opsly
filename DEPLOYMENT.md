# Deployment

Opsly is a **Node.js / Express server** (`dist/index.cjs`, started with `node dist/index.cjs`)
that serves both the API and the built client, uses PostgreSQL via `pg`, and upgrades
WebSocket connections on the same HTTP port. It is **not** a static site and **not** a
Cloudflare Worker.

> Supported targets: **Northflank** (Dockerfile) or **Render** (`render.yaml`).
> **Cloudflare Workers is NOT a supported deploy target** for this app — see below.

---

## Requirements (all targets)

- **Node `22.12.0`** (pinned in `.nvmrc`; enforced via `package.json` `engines >=22.12.0`).
  Required because the repo uses Vite 7 / Vitest 4 (Node 20+).
- Build: `npm run build` → `dist/index.cjs` (server) + `dist/public/` (client).
- Start: `npm run start` (`NODE_ENV=production node dist/index.cjs`).
- The server **binds `process.env.HOST` / `process.env.PORT`** and defaults to
  `127.0.0.1:5000`. In any container/platform you **must set `HOST=0.0.0.0`**.
- On startup the server runs `npx drizzle-kit push` (no shell needed), so
  **devDependencies must remain available at runtime** (`drizzle-kit` is a devDependency).
- Health check: **`GET /api/health`** → `200` when the DB is reachable, `503` otherwise.
- WebSocket: `wss://<host>/ws/runs` (HTTP upgrade on the same port).

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `HOST` | ✅ (containers) | `0.0.0.0` |
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | the exposed port (e.g. `8080`) |
| `NODE_VERSION` | ✅ | `22.12.0` |
| `DATABASE_URL` | ✅ | `postgresql://USER:PASS@HOST:5432/DB?sslmode=require` (use `sslmode=no-verify` if the provider's chain is untrusted) |
| `SESSION_SECRET` | ✅ | strong random (`openssl rand -base64 32`) |
| `BASE_URL` | recommended | `https://aurivian.nl` (Gmail OAuth callback) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` / `_BASE_URL` | optional | `/app` blueprint generation (has fallback) |
| `GMAIL_CLIENT_ID` / `_SECRET` / `GMAIL_REDIRECT_URI` | optional | Gmail integration in `/app` |

The corporate website needs only `HOST`, `NODE_ENV`, `PORT`, `DATABASE_URL`, `SESSION_SECRET`.

---

## Northflank (Dockerfile) — recommended

Uses the repo `Dockerfile` (single stage, `node:22.12.0-slim`, keeps devDependencies).

- **Build type:** Dockerfile
- **Build context:** `/`
- **Dockerfile path:** `/Dockerfile`
- **Exposed internal port:** `8080` (HTTP)
- **Health check:** HTTP `GET /api/health` on `8080`
- **Environment variables:** see table above (set `HOST=0.0.0.0`, `PORT=8080`, `DATABASE_URL`, `SESSION_SECRET`, …)

> Note: the `buildContext` field expects a **path** (`/`), not a build command. The build
> command lives in the Dockerfile.

Verified locally: clean `npm ci`, `npm run build`, and a container run serving
`0.0.0.0:8080` with `/api/health` returning `200`.

## Render (`render.yaml`)

The repo includes `render.yaml` (web service `opsly-app`, branch `main`, Postgres
`opsly-db`, health `/api/health`). Render → New → Blueprint → connect the repo. Render
reads `render.yaml`; set `NODE_VERSION=22.12.0` (or it reads `.nvmrc`) and provide the
secrets that are `sync: false`.

---

## Cloudflare — DNS/CDN only, NOT the application host

The `aurivian.nl` DNS zone is on Cloudflare and should remain there for DNS, TLS and the
`www → apex` redirect. **Do not run the application on Cloudflare Workers/Pages.**

An old **Cloudflare Workers** project (`opsly`) is Git-connected to this repo and its build
**fails on every push** — expected, because a Node/Express server cannot run on the Workers
runtime and there is no `wrangler.toml`. This failing check is **non-blocking** (no branch
protection) but is noise.

**To remove it (manual — requires Cloudflare access):**
1. Cloudflare Dashboard → **Workers & Pages → `opsly` → Settings → Builds** → **disconnect**
   the `Technivian/Opsly` repository (or **delete** the Worker if it serves nothing).
   Account: `4ef24e2b71c28a8a0272e186db71f889`.
2. (Optional) GitHub → **Technivian org → Settings → GitHub Apps → "Cloudflare Workers and
   Pages" → Configure** → set repository access to "Only select repositories" and exclude
   `Opsly`. Do this **after** step 1. Do **not** uninstall the app org-wide — it is installed
   for all repos and may serve others.

### Point the domain at the app host (after deploy)
Cloudflare → `aurivian.nl` → DNS:

| Type | Name | Content | Proxy |
|---|---|---|---|
| `CNAME` | `@` (apex) | `<app-host-target>` (Northflank/Render hostname) | Proxied |
| `CNAME` | `www` | `aurivian.nl` | Proxied |

SSL/TLS: **Full (strict)** + **Always Use HTTPS**. Add a Redirect Rule `www.aurivian.nl` →
`https://aurivian.nl` (301). Do **not** remove existing MX / SPF / DKIM / DMARC records.

Reserved (documented only, not yet active): `opsly.aurivian.nl`, `app.opsly.aurivian.nl`.
