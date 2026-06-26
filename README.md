# Aurivian — corporate website & Opsly product

This repository contains two things that share one deployment:

1. **The Aurivian corporate website** — the public marketing site for **Aurivian B.V.**, a consultancy and technology company.
2. **Opsly** — Aurivian's flagship operations platform for SMEs, an authenticated product application.

> **Aurivian B.V.** is the parent company.
> **Opsly is a product of Aurivian B.V.** ("Opsly by Aurivian").

See [BRAND_ARCHITECTURE.md](BRAND_ARCHITECTURE.md) for positioning, naming rules, tone of voice and legal attribution.

---

## Corporate website vs. product application

| | Corporate website (Aurivian) | Product application (Opsly) |
|---|---|---|
| Audience | Prospects, public | Authenticated customers |
| Routes | `/`, `/services`, `/products`, `/products/opsly`, `/approach`, `/experience`, `/about`, `/contact`, `/pricing` | `/app/*` |
| Auth | None (public) | Required (`ProtectedRoute`) |
| Design | Calm corporate identity | Existing Opsly product UI |

The corporate routes are **not** wrapped in `PublicRoute`, so authenticated users can still browse them. Only `/auth/signin` and `/auth/signup` redirect an already-authenticated user to `/app`.

### Routes

**Corporate (public)**
- `/` — Aurivian home
- `/services` — services overview (Quality Engineering, Test Management & Automation, Process Improvement & Automation, Responsible AI Adoption, Custom Digital Products)
- `/products` — products overview
- `/products/opsly` — Opsly product page
- `/approach` — delivery model
- `/experience` — industry-level experience
- `/about` — about + principles
- `/contact` — contact form (mailto) + contact channels
- `/pricing` — Opsly pilots and commercial options
- `/privacy`, `/terms`, `/security`, `/docs` — legal / product info

**Product (authenticated, `/app/*`)**
- `/app` (dashboard), `/app/intakes`, `/app/blueprints`, `/app/automations`, `/app/runs`, `/app/roi`, `/app/connections`, `/app/settings`
- `/auth/signin`, `/auth/signup`

---

## Domains and URLs

For the initial launch the corporate website and the authenticated application share **one deployment and one domain**.

- Corporate website: `https://aurivian.nl`
- Opsly product page: `https://aurivian.nl/products/opsly`
- Authenticated application: `https://aurivian.nl/app`

**Reserved for later (documented only — not yet wired):**
- Opsly product subdomain: `https://opsly.aurivian.nl`
- Dedicated application subdomain: `https://app.opsly.aurivian.nl`

A future domain split should not change authentication callbacks, cookies or routing without a dedicated migration.

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

The LinkedIn URL is optional (`site.social.linkedin`); no link is rendered unless a verified URL is set.

---

## Localisation

The site uses **i18next** with Dutch (`nl`) and English (`en`).

- **Dutch is the default** for new visitors.
- A saved preference (localStorage) is respected first.
- Authenticated users keep their server-stored locale (applied by `usePreferences`).
- Corporate copy lives under the `corp` namespace in `client/src/i18n/locales/{nl,en}.json`; product copy keeps its existing keys.

---

## Tech stack

- **Frontend:** Vite + React + TypeScript, Tailwind CSS, shadcn/ui, wouter (routing), react-helmet-async (metadata)
- **Backend:** Express.js + Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Passport.js (local strategy)
- **AI:** OpenAI (blueprint generation, with fallback)
- **Testing:** Vitest + Supertest (API), Playwright (e2e)

---

## Local development

### Prerequisites
- Node.js 18+ (see `.nvmrc`)
- PostgreSQL

### Install
```bash
npm install
```

### Environment variables
Create `.env` from `.env.example` and configure:
- `DATABASE_URL` — PostgreSQL connection
- `SESSION_SECRET`
- `AI_INTEGRATIONS_OPENAI_API_KEY` (optional — blueprint generation has a fallback)
- Gmail OAuth credentials (optional)
- `BASE_URL`

### Run
```bash
npm run dev
```

---

## Testing

```bash
# One-time test DB setup
chmod +x scripts/setup-test-db.sh
./scripts/setup-test-db.sh

# Unit + API tests (Vitest)
npm test

# End-to-end tests (Playwright) — includes corporate navigation smoke tests
npm run test:e2e
```

- `npm run check` — TypeScript typecheck
- `tests/e2e/marketing-nav.spec.ts` — corporate route rendering, navigation, CTA and contact-form validation.

---

## Build & deployment

```bash
npm run build   # bundles client + server into dist/
npm start       # runs the production server
```

Deployment uses `render.yaml` (single service, single domain). Database schema is pushed on production startup via `drizzle-kit push`. See [DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md) and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

### Node version (required)

This project uses **Vite 7** and **Vitest 4**, which require **Node 20+**. The pinned version is **Node 22.12.0** (`.nvmrc`), enforced via `package.json` `engines` (`node >=22.12.0`).

**Cloudflare** (Pages/Workers builds for both **Production** and **Preview**) must set:

```
NODE_VERSION=22.12.0
```

An older Node (e.g. Node 18) will fail the build under Vite 7 / Vitest 4. Do **not** downgrade Vite or Vitest to accommodate an older Node — upgrade the build's Node version instead.

---

## Remaining manual actions (brand & legal)

These are **not** performed automatically and require a human decision:

- [ ] **GitHub organisation / repository migration** — the repo currently lives under `github.com/Technivian`. Migrating ownership or the org name to Aurivian is a manual follow-up; it is intentionally not done here.
- [ ] **Verified LinkedIn URL** — set `site.social.linkedin` in `client/src/config/site.ts` once a verified company page exists.
- [ ] **DNS / domains** — point `aurivian.nl` (and later the `opsly.aurivian.nl` / `app.opsly.aurivian.nl` subdomains) at the deployment.
- [ ] **OG image** — replace `/og-image.png` with Aurivian-branded artwork.
- [ ] **Legal text review** — entity and contact attribution have been updated to Aurivian B.V.; the substantive privacy/terms wording should be reviewed by counsel.
- [ ] **Server-side contact form** — the contact form currently uses a `mailto:` transport. A future API endpoint should add server-side validation, rate limiting, spam protection, privacy handling, an email delivery provider, and delivery/error monitoring. The form component (`client/src/components/marketing/contact-form.tsx`) is structured so the transport can be swapped without rebuilding the UI.
- [ ] **Integration statuses** — `client/src/config/integrations.ts` reflects verified status today (only Gmail is implemented). Update as new connectors ship; never mark an integration `available` until its working implementation is verified.

---

## Status

Opsly is currently in **pilot / early-production** phase. The focus is on stability, correctness and real-world SME use cases.

---

## License

All rights reserved.
© Aurivian B.V.

Opsly is a product of Aurivian B.V.

## Contact

For questions, pilots or collaboration: `hello@aurivian.nl`
