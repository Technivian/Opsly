# Brand architecture

This document defines the relationship between **Aurivian** and **Opsly**, and the rules for naming, tone and legal attribution.

---

## Aurivian B.V. — positioning

Aurivian is a consultancy and technology company that helps organisations improve operations through:

- quality engineering;
- test strategy and test automation;
- process improvement;
- intelligent automation;
- responsible AI adoption;
- custom digital products and platforms.

**Core positioning**

- **EN:** Aurivian helps organisations improve operations through quality engineering, intelligent automation and responsible AI.
- **NL:** Aurivian helpt organisaties processen te verbeteren met quality engineering, slimme automatisering en verantwoord toegepaste AI.

Aurivian combines strategic guidance, hands-on implementation and product development. It is **not** a generic AI agency or a testing freelancer brand — it is a credible, modern technology consultancy with its own products, delivery capability and practical business focus.

Aurivian serves Dutch SMEs, public-sector organisations, and larger organisations with complex operational or quality challenges.

---

## Opsly — positioning

Opsly is Aurivian's flagship operations platform for small and medium-sized businesses.

**Proposition**

> Opsly helps SMEs turn manual and fragmented work into clear processes, practical automation and measurable operational improvement.

Opsly turns operational pain points into process blueprints, automations and measurable ROI, across three stages: **Understand → Improve and automate → Measure**.

Opsly is a practical business platform, not an automation playground for developers.

**Product status:** Pilot / early production.

---

## Brand relationship

- Aurivian B.V. is the **parent company**.
- Opsly is a **product** developed and owned by Aurivian.
- Opsly is one of potentially several products; the structure is extensible. Confidential or unfinished products are not published.

---

## Naming rules

- The parent company is **Aurivian** (legal entity: **Aurivian B.V.**).
- The product is **Opsly**.
- When attributing the product to the company, use **"Opsly by Aurivian"**.
- In legal contexts, use **"Opsly is a product of Aurivian B.V."**
- Do **not** rename Opsly to Aurivian, or present Opsly as the whole company.
- Do **not** present Aurivian as only a test consultancy.
- The former name **"Ops Copilot"** is retired; all public-facing references use **Opsly**.
- Do **not** rename internal technical identifiers (database columns, env vars, API routes, migration history, internal export labels) for branding alone unless they are exposed to users.

---

## Tone of voice

Clear, confident, practical and grounded. Explain outcomes, not only capabilities. Use plain language; avoid empty consultancy jargon.

**Avoid** exaggerated language such as: revolutionary, world-class, game-changing, disruptive, cutting-edge, "transform your business overnight".

**Honesty rules**

- Do not invent clients, testimonials, metrics, certifications, partnerships or results.
- Distinguish clearly between existing functionality, pilot functionality and roadmap items.
- Do not claim a feature or integration is live when it is only planned. Use explicit status labels (Available / Pilot / Planned / In development).
- Where a claim cannot be verified from the repository, use restrained wording.

---

## Legal attribution rules

- Copyright: **© Aurivian B.V. All rights reserved.**
- Product attribution: **Opsly is a product of Aurivian B.V.**
- Data controller / company entity in legal pages: **Aurivian B.V.**
- Public contact details are centralised in `client/src/config/site.ts` and use the `aurivian.nl` domain.
- Do not use `@opscopilot.com`, `@opsly.io` or Technivian contact details anywhere in the public application.
- Repository / GitHub organisation ownership is not changed automatically; any migration from Technivian is a documented manual follow-up.
