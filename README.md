# Opsly

**Opsly** is a practical operations platform for small and medium-sized businesses.  
It helps teams turn messy, manual work into clear processes, automate where it makes sense, and track real operational ROI.

Built with a **Dutch SME mindset**: clarity over hype, control over chaos.

---

## What Opsly Does

Opsly guides organisations through three core steps:

1. **Understand**
   - Capture operational pain points through a guided intake
   - Automatically generate a structured process blueprint
   - Identify bottlenecks, manual work, and improvement opportunities

2. **Improve & Automate**
   - Use ready-made automation templates (sales, support, finance, operations)
   - Configure and test automations without engineering knowledge
   - Integrate with existing tools like email, CRM, Slack, and accounting software

3. **Measure**
   - Track time saved, cycle-time reduction, and confidence scores
   - See ROI per automation and over time
   - Make improvements measurable instead of “gut feel”

---

## Key Features

- Guided intake → automatic process blueprint
- Editable blueprints with version history
- Automation templates with test runs and logs
- ROI dashboard with trends and breakdowns
- Role-based access (Owner, Admin, Operator, Viewer)
- Dutch & English localisation
- GDPR-aware by design

---

## Supported Integrations

Opsly integrates with commonly used tools, including:

- Gmail / Google Workspace
- Microsoft Outlook / 365
- Slack
- HubSpot
- Salesforce
- **Exact Online**
- **AFAS Software**

Each integration includes setup documentation and secure OAuth-based authentication.

---

## Target Audience

Opsly is designed for:

- Dutch SMEs
- Operations managers
- Founders and managing directors
- Teams dealing with manual workflows, handovers, and operational friction

It is **not** an automation playground for engineers.  
It is a business tool for people who want clarity and results.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Node.js, Next.js API routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth
- **Infrastructure:** Replit (development), GitHub (source control)

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Install dependencies
```bash
npm install

Environment variables

Create a .env file based on .env.example and configure:

Database connection

Auth secrets

OAuth credentials (optional for local testing)

Run locally
npm run dev

Roles & Permissions

Opsly uses role-based access control:

Owner – full access

Admin – manage automations, blueprints, integrations

Operator – run automations, view results

Viewer – read-only access

Permissions are enforced both in the UI and backend.

Security & Privacy

Opsly is built with EU businesses in mind:

Tenant-level data isolation

Encryption at rest and in transit

GDPR-compliant cookie consent

Configurable data retention

No unnecessary data collection

See /security in the app for details.

Status

Opsly is currently in early production / pilot phase.

The focus is on:

Stability

Correctness

Real-world SME use cases

Roadmap (High Level)

Additional automation templates

Recurring automation scheduling

Advanced reporting & exports

International rollout beyond NL

Contributing

This repository is currently private/internal.
External contributions are not yet open.

License

All rights reserved.
© Technivian B.V.

Contact

For questions, pilots, or collaboration:

Technivian
https://github.com/Technivian


---

### Next optional steps
If you want, I can now:
- tighten this README for **open-source vs closed-source**
- write a **CUSTOMER-FACING README** (non-technical)
- create a **DEPLOYMENT.md** or **ONBOARDING.md**
- tailor the wording to be *even more Dutch-business-native*

Just tell me.
