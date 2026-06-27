# Product context

This document defines the relationship between Aurivian and Opsly, the rules for naming, tone and legal attribution, and the product's current status and positioning. It is the source of truth for brand and copy decisions. See also [BRAND_ARCHITECTURE.md](../BRAND_ARCHITECTURE.md) for the original brand architecture document.

---

## Aurivian B.V. — positioning

Aurivian is a consultancy and technology company that helps organisations improve operations through:
- quality engineering
- test strategy and test automation
- process improvement
- intelligent automation
- responsible AI adoption
- custom digital products and platforms

**Core positioning:**
- EN: Aurivian helps organisations improve operations through quality engineering, intelligent automation and responsible AI.
- NL: Aurivian helpt organisaties processen te verbeteren met quality engineering, slimme automatisering en verantwoord toegepaste AI.

Aurivian serves Dutch SMEs, public-sector organisations, and larger organisations with complex operational or quality challenges.

---

## Opsly — positioning

Opsly is Aurivian's flagship operations platform for small and medium-sized businesses.

**Proposition:**
> Opsly helps SMEs turn manual and fragmented work into clear processes, practical automation and measurable operational improvement.

Opsly turns operational pain points into process blueprints, automations and measurable ROI, across three stages: **Understand → Improve and automate → Measure**.

**Product status:** Pilot / early production.

---

## Brand relationship

- Aurivian B.V. is the parent company.
- Opsly is a product developed and owned by Aurivian.
- Opsly is one of potentially several products; the structure is extensible.
- The production URL for both the corporate site and the Opsly product is `https://aurivian.nl`.

---

## Naming rules

- The parent company is **Aurivian** (legal entity: **Aurivian B.V.**).
- The product is **Opsly**.
- When attributing the product to the company: **"Opsly by Aurivian"**.
- In legal contexts: **"Opsly is a product of Aurivian B.V."**
- Do **not** rename Opsly to Aurivian.
- Do **not** present Aurivian as only a test consultancy.
- The former name **"Ops Copilot"** is retired — all public-facing references use Opsly. Do not use `@opscopilot.com` addresses anywhere in the public application.
- Do **not** rename internal technical identifiers for branding alone unless they are exposed to users.
- The GitHub repository currently lives under `github.com/Technivian`. This is a known open item — Technivian is **not** the current parent organisation. Migrating the repository to an Aurivian GitHub organisation is a pending manual action.

---

## Tone of voice

Clear, confident, practical and grounded. Explain outcomes, not only capabilities. Use plain language; avoid empty consultancy jargon.

**Avoid:** revolutionary, world-class, game-changing, disruptive, cutting-edge, "transform your business overnight".

### Honesty rules

These rules are non-negotiable and apply to all copy, documentation and product text:

- Do **not** invent clients, testimonials, metrics, certifications, partnerships or results.
- Distinguish clearly between existing functionality, pilot functionality and roadmap items.
- Do **not** claim a feature or integration is live when it is only planned.
- Use explicit status labels: **Available / Pilot / Planned / In development**.
- `client/src/config/integrations.ts` is the authoritative integration catalogue. Never mark an integration `available` until a working implementation is verified in production.

---

## Legal attribution rules

- **Copyright:** © Aurivian B.V. All rights reserved.
- **Product attribution:** Opsly is a product of Aurivian B.V.
- **Data controller / company entity in legal pages:** Aurivian B.V.
- Public contact details are centralised in `client/src/config/site.ts` and use the `aurivian.nl` domain.
- Do **not** use `@opscopilot.com`, `@opsly.io` or Technivian contact details anywhere in the public application.
- The privacy policy and terms of service are pending external legal review. Entity and contact attribution have been updated to Aurivian B.V.; the substantive wording should be reviewed by counsel before broad public launch.

---

## Current product status (as of 2026-06-27)

| Area | Status | Notes |
|---|---|---|
| Corporate website (aurivian.nl) | Live | Dutch default, dark mode, i18n |
| Opsly product (/app) | Pilot / early production | Authenticated access only |
| Security (Helmet + rate limiting) | Live | Deployed in commit `67db573` |
| Gmail integration | Available | Only working connector |
| Other integrations | Planned/Pilot | Explicitly labelled in the UI |
| Background automation | Not implemented | All automations are manually triggered |
| Magic link email delivery | Incomplete | Token logged to console; no email sent |
| `www.aurivian.nl` redirect | Open | HTTP 525 — Cloudflare rule needed |

---

## Reserved — not yet active

The following subdomains are documented as future options and are not currently configured:

- `opsly.aurivian.nl` — potential dedicated Opsly subdomain
- `app.opsly.aurivian.nl` — potential dedicated application subdomain

Any domain split requires a dedicated migration — it cannot be done without updating authentication callbacks, session cookies and routing.
