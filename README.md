# Aurivian — corporate website & Opsly product

This repository contains two things that share one deployment:

1. **The Aurivian corporate website** — the public marketing site for **Aurivian B.V.**, a consultancy and technology company.
2. **Opsly** — Aurivian's flagship operations platform for SMEs, an authenticated product application.

> **Aurivian B.V.** is the parent company.
> **Opsly is a product of Aurivian B.V.** ("Opsly by Aurivian").

See [docs/PRODUCT_CONTEXT.md](docs/PRODUCT_CONTEXT.md) for positioning, naming rules, tone of voice and legal attribution.

---

## Corporate website vs. product application

| | Corporate website (Aurivian) | Product application (Opsly) |
|---|---|---|
| Audience | Prospects, public | Authenticated customers |
| Routes | `/`, `/services`, `/products`, `/products/opsly`, `/approach`, `/experience`, `/about`, `/contact`, `/pricing` | `/app/*` |
| Auth | None (public) | Required (`ProtectedRoute`) |
| Design | Calm corporate identity | Existing Opsly product UI |

Corporate routes are not wrapped in `PublicRoute`, so authenticated users can browse them. Only `/auth/signin` and `/auth/signup` redirect an already-authenticated user to `/app`.

### Routes

**Corporate (public)**
- `/` — Aurivian home
- `/services` — services overview
- `/products` — products overview
- `/products/opsly` — Opsly product page
- `/approach` — delivery model
- `/experience` — industry-level experience
- `/about` — about + principles
- `/contact` — contact form (`mailto:`) + contact channels
- `/pricing` — Opsly pilots and commercial options
- `/privacy`, `/terms`, `/security`, `/docs` — legal / product info

**Product (authenticated, `/app/*`)**
- `/app` (dashboard), `/app/intakes`, `/app/blueprints`, `/app/automations`, `/app/runs`, `/app/roi`, `/app/connections`, `/app/settings`
- `/auth/signin`, `/auth/signup`

---

## Production

| Item | Value |
|---|---|
| URL | `https://aurivian.nl` |
| Host | Northflank (Docker container) |
| DNS / CDN / TLS | Cloudflare |
| Health check | `GET /api/health` → `200 {"status":"ok","database":"connected"}` |
| WebSocket | `wss://aurivian.nl/ws/runs` |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, wouter, i18next, react-helmet-async |
| Backend | Express.js, Node.js 22.12.0 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Passport.js (local strategy), bcrypt, PostgreSQL sessions |
| Realtime | WebSockets (`ws`) |
| Security | Helmet v8, express-rate-limit v8, CSP, RFC 9110 RateLimit headers |
| AI | OpenAI (blueprint generation, optional) |
| Testing | Vitest + Supertest (unit/API), Playwright (e2e) |
| Build | esbuild (server → `dist/index.cjs`), Vite (client → `dist/public/`) |

---

## Configuration

All public contact details and company identity live in one place:

- [`client/src/config/site.ts`](client/src/config/site.ts) — company name, legal entity, domain, canonical URL, contact emails, optional LinkedIn, product attribution.
- [`client/src/config/integrations.ts`](client/src/config/integrations.ts) — Opsly integration catalogue with explicit, evidence-based status (`available` / `pilot` / `planned`).

Public contact addresses:

| Purpose | Address |
|---|---|
| General | `hello@aurivian.nl` |
| Support | `support@aurivian.nl` |
| Security | `security@aurivian.nl` |
| Privacy | `privacy@aurivian.nl` |
| Legal | `legal@aurivian.nl` |

---

## Localisation

The site uses **i18next** with Dutch (`nl`) and English (`en`).

- **Dutch is the default** for new visitors.
- A saved preference (localStorage) is respected first.
- Authenticated users keep their server-stored locale (applied by `usePreferences`).
- Corporate copy lives under the `corp` namespace in `client/src/i18n/locales/{nl,en}.json`.

---

## Local development

### Prerequisites
- Node.js 22.12.0 (see `.nvmrc`; enforced via `package.json` `engines >=22.12.0`)
- PostgreSQL

### Install
```bash
npm install
```

### Environment variables
Copy `.env.example` to `.env` and configure:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | Yes | `openssl rand -base64 32` |
| `BASE_URL` | Recommended | `http://localhost:5000` in dev |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Optional | Blueprint generation (has fallback) |
| `GMAIL_CLIENT_ID` / `_SECRET` / `GMAIL_REDIRECT_URI` | Optional | Gmail integration |

Full variable reference: [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md).

### Run
```bash
npm run dev
```

The development server starts on `http://localhost:5000` with HMR and `ws://localhost:*` allowed in the CSP.

---

## Testing

```bash
# Unit + API tests (Vitest)
npm test

# With file watching
npm run test:watch

# End-to-end tests (Playwright)
npm run test:e2e

# TypeScript typecheck
npm run check
```

Tests prove actual 429 rate-limit behaviour (no global skip in `NODE_ENV=test`). See [docs/SECURITY.md](docs/SECURITY.md) for the rate-limiter design.

---

## Build & deployment

```bash
npm run build   # bundles client + server into dist/
npm run start   # starts the production server (NODE_ENV=production)
```

The production server is a single Node/Express process that serves the API, the built client, and WebSocket connections on the same port. **Northflank** is the canonical host via the repo `Dockerfile`. See [docs/DEPLOYMENT_NORTHFLANK.md](docs/DEPLOYMENT_NORTHFLANK.md) for the full guide.

> **Cloudflare is DNS/CDN only — not the application host.** A Node/Express server cannot run on Cloudflare Workers/Pages.

### Node version

This project requires **Node 22.12.0** (pinned in `.nvmrc`, enforced via `engines` in `package.json`). Older versions will fail the Vite 7 / Vitest 4 build.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, request flow, build pipeline |
| [docs/DEPLOYMENT_NORTHFLANK.md](docs/DEPLOYMENT_NORTHFLANK.md) | Northflank setup, environment, Cloudflare DNS |
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | All environment variables, required vs. optional |
| [docs/SECURITY.md](docs/SECURITY.md) | Helmet CSP, rate limiting, auth security, trust proxy |
| [docs/OPERATIONS_RUNBOOK.md](docs/OPERATIONS_RUNBOOK.md) | Smoke tests, health checks, rollback, incident response |
| [docs/PRODUCT_CONTEXT.md](docs/PRODUCT_CONTEXT.md) | Brand architecture, naming rules, tone of voice, legal attribution |
| [docs/EXECUTION-GUARANTEES.md](docs/EXECUTION-GUARANTEES.md) | Automation execution model and guarantees |
| [docs/ROI-SYSTEM.md](docs/ROI-SYSTEM.md) | ROI calculation methodology |

---

## Remaining manual actions

These require a human decision and are not performed automatically:

- [ ] **GitHub organisation migration** — the repo currently lives under `github.com/Technivian`. Migrating ownership to Aurivian is a manual follow-up.
- [ ] **Verified LinkedIn URL** — set `site.social.linkedin` in `client/src/config/site.ts` once a verified company page exists.
- [x] **`www.aurivian.nl` redirect** — Cloudflare Redirect Rule `www.aurivian.nl → https://aurivian.nl` (301) is live. Path and query string are preserved.
- [ ] **OG image** — replace `/og-image.png` with Aurivian-branded artwork.
- [ ] **Legal text review** — entity and contact attribution have been updated to Aurivian B.V.; the substantive privacy/terms wording should be reviewed by counsel.
- [ ] **Server-side contact form** — the contact form uses `mailto:` transport. A future API endpoint should add server-side validation, rate limiting, spam protection and a delivery provider.
- [ ] **Integration statuses** — `client/src/config/integrations.ts` reflects verified status today (only Gmail is implemented). Never mark an integration `available` until its working implementation is verified.

---

## Status

Opsly is in **production**. Deployed at [aurivian.nl](https://aurivian.nl).

All launch blockers resolved as of 2026-06-27:
- Apex `https://aurivian.nl` — HTTP 200, TLS valid, CSP + rate limiting active
- `www.aurivian.nl` — Cloudflare 301 redirect to apex, path-preserving
- Database connected, WebSocket live, Dutch default locale, dark mode default

---

## License

All rights reserved.
© Aurivian B.V.

Opsly is a product of Aurivian B.V.

## Contact

`hello@aurivian.nl`
