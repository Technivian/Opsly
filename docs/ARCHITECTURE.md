# Architecture

## Overview

The repository is a monorepo that builds into a single production artifact: one Node.js / Express process that serves the Aurivian corporate website, the authenticated Opsly product application, REST API endpoints, and WebSocket connections — all on the same port.

```
aurivian.nl (Cloudflare DNS/CDN/TLS)
     │
     ▼
Northflank (Docker container, node:22.12.0-slim)
     │
     ├── HTTP/HTTPS  →  Express (dist/index.cjs)
     │      ├── /            → corporate site (Vite SPA, dist/public/)
     │      ├── /app/*       → Opsly product (same SPA, auth-gated client-side)
     │      ├── /api/*       → REST API
     │      └── /assets/*    → static assets (Brotli, long-lived cache)
     │
     └── WebSocket  →  /ws/runs  (HTTP Upgrade on same port)
              │
              ▼
          PostgreSQL (Northflank managed)
```

---

## Directory structure

```
.
├── client/                  # Vite + React frontend
│   └── src/
│       ├── components/      # UI components (shadcn/ui, marketing, product)
│       ├── config/          # site.ts (identity), integrations.ts (catalogue)
│       ├── i18n/            # i18next translations (nl, en)
│       ├── pages/           # wouter page components
│       └── lib/             # utilities, hooks, query client
├── server/                  # Express backend
│   ├── index.ts             # entry point; mounts middleware, routes, WebSocket
│   ├── auth.ts              # Passport setup, auth routes, rate-limit wiring
│   ├── security.ts          # Helmet config, createRateLimiters() factory
│   ├── routes.ts            # all non-auth API routes
│   ├── db.ts                # Drizzle + pg pool
│   ├── execution/           # automation execution engine
│   └── seed-demo.ts         # demo org seeding
├── shared/
│   └── schema.ts            # Drizzle schema (single source of truth for DB types)
├── tests/
│   ├── api/                 # Vitest + Supertest API tests
│   └── e2e/                 # Playwright end-to-end tests
├── script/
│   └── build.ts             # esbuild bundler for server
├── docs/                    # canonical documentation (this directory)
├── Dockerfile               # single-stage, node:22.12.0-slim
└── dist/                    # build output (git-ignored)
    ├── index.cjs            # bundled server
    ├── index.cjs.map
    └── public/              # Vite client build
```

---

## Build pipeline

```
npm run build
  │
  ├─ Vite build (client/)
  │     → dist/public/index.html
  │     → dist/public/assets/index-<hash>.js   (code-split, Brotli at runtime)
  │     → dist/public/assets/index-<hash>.css
  │
  └─ esbuild build (server/index.ts)
        → dist/index.cjs
        → dist/index.cjs.map
```

The esbuild step bundles an allowlist of packages (see `script/build.ts`) directly into `dist/index.cjs` to reduce cold-start syscalls. All other `node_modules` are left external and must be present at runtime. `devDependencies` are kept in the Docker image because `drizzle-kit` (a devDep) runs on startup.

---

## Request flow

### Static assets
```
GET /assets/index-<hash>.js
  → Express static middleware (dist/public/)
  → Cache-Control: public, immutable, 1 year (hash in filename)
```

### SPA routing
```
GET /anything-not-matched
  → Express catchall → serves dist/public/index.html
  → React (wouter) handles client-side routing
```

### API
```
POST /api/auth/signin
  → configureHelmet() middleware (headers, CSP)
  → rate-limit middleware (express-rate-limit, 10/15min/IP)
  → Passport.authenticate('local')
  → PostgreSQL session created
  → 200 { user } or 401 / 429
```

### WebSocket
```
GET /ws/runs?runId=<id>   (HTTP Upgrade)
  → ws server upgrade handler
  → streams run log events to the browser
  → client CSP: connect-src 'self' wss://aurivian.nl  ✓
```

### Auth flow
```
1. POST /api/auth/signup   → bcrypt hash → INSERT users → req.login()
2. POST /api/auth/signin   → Passport local → bcrypt compare → req.login()
3. GET  /api/auth/user     → req.isAuthenticated() → serialized user
4. POST /api/logout        → req.logout()
5. POST /api/auth/magic-link   → token generated → (email delivery pending)
6. GET  /api/auth/magic-link/:token → verify + login + redirect /app
```

Session is stored in PostgreSQL (`sessions` table, via `connect-pg-simple`). Cookie: `httpOnly: true`, `secure: true` in production, `maxAge: 7 days`.

---

## Database

ORM: **Drizzle ORM** with **pg** driver.
Schema: `shared/schema.ts` — all table definitions live here.
Migrations: **push-based** (`drizzle-kit push` runs automatically on every startup). No separate migration files.

> Schema changes go into `shared/schema.ts` → commit → next deployment auto-applies them via `drizzle-kit push`.

---

## Multi-tenancy

All data is scoped to an `orgId`. The `isAuthenticated` middleware enforces session-level auth. API routes additionally check `req.user.orgId` on every query — data from other organisations is never returned. Demo accounts are read-only (`isDemoReadOnly` middleware blocks all write methods for demo users).

---

## Localisation

Frontend uses **i18next** with Dutch (`nl`) as default. Language preference is stored in `localStorage` and overridden by the server-stored user preference (`usePreferences`). Translation namespaces:
- `translation` — product (Opsly `/app/*`) copy
- `corp` — corporate website copy

---

## Security

See [docs/SECURITY.md](SECURITY.md) for the full security posture. In brief:

- **Helmet v8** — sets CSP, removes `X-Powered-By`, sets `nosniff`, `X-Frame-Options`, `Referrer-Policy`, etc.
- **express-rate-limit v8** — per-IP limits on all four auth endpoints; RFC 9110 draft-7 headers.
- **trust proxy: 1** — Northflank's load-balancer appends the real client IP as the last XFF entry; `req.ip` reads that entry.
- **bcrypt** (10 rounds) for password hashing.
- **HSTS** is applied by Cloudflare's ingress; Helmet's `strictTransportSecurity` is disabled to avoid a duplicate header.
