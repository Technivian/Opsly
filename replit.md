# Ops Copilot - AI-Driven Operations Automation Platform

## Overview
Ops Copilot is a production-ready MVP SaaS application that helps SMBs document processes, identify bottlenecks, and generate automation blueprints using LLM analysis. Built with Vite + React + Express.

## Recent Changes
- January 29, 2026: Final hardening release for first Dutch SME customer
- January 29, 2026: Created CHANGELOG and internal onboarding checklist
- January 29, 2026: Added server-side RBAC for automation configs and runs (403 for unauthorized)
- January 29, 2026: Fixed intake status transitions (SUBMITTED → PROCESSING → COMPLETED/FAILED)
- January 29, 2026: Seeded all 6 automation templates in database
- January 29, 2026: Added i18n to pricing, security, and docs pages with EUR pricing
- January 29, 2026: Added server-side RBAC enforcement for invite endpoint (OWNER/ADMIN only)
- January 29, 2026: Completed i18n translations for runs.tsx and roi.tsx pages
- January 29, 2026: Added locale-aware day labels in ROI 7-day trend chart
- January 29, 2026: Fixed run status polling (2s interval when RUNNING/QUEUED)
- January 29, 2026: Added ROI dashboard auto-refresh (5s interval)
- January 29, 2026: Added OPERATOR and VIEWER roles with client-side RBAC hook
- January 29, 2026: Added PDF export option for blueprints (alongside Markdown)
- January 29, 2026: Added integration setup guides to documentation page
- January 29, 2026: Added locale-aware date/number formatting utilities
- January 29, 2026: Enhanced intake wizard with localStorage autosave and inline validation
- January 29, 2026: Added i18n framework with English/Dutch locales and language switcher
- January 29, 2026: Created OAuth connections page for Gmail, Outlook, Slack, HubSpot, Salesforce
- January 29, 2026: Added Dutch accounting connectors (Exact Online, AFAS)
- January 29, 2026: Implemented blueprint versioning, editing, and share links
- January 29, 2026: Enhanced ROI dashboard with 7-day activity trend chart
- January 29, 2026: Added GDPR cookie consent banner
- January 29, 2026: Created 3 new automation templates (Form→CRM, Lead Slack, Invoice AI)
- January 14, 2026: Initial MVP implementation with complete frontend and backend

## Tech Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (Google, GitHub, email)
- **AI**: OpenAI via Replit AI Integrations (gpt-4.1 for blueprint generation)
- **i18n**: react-i18next with English and Dutch locales

## Project Structure
```
├── client/                     # Frontend React app
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── landing.tsx    # Public landing page
│   │   │   ├── dashboard.tsx  # Main dashboard
│   │   │   ├── intakes.tsx    # Intakes list
│   │   │   ├── intake-wizard.tsx  # 6-step intake form with autosave
│   │   │   ├── blueprints.tsx # Blueprints list
│   │   │   ├── blueprint-detail.tsx  # Blueprint with editing/versioning/sharing
│   │   │   ├── automations.tsx  # Templates list
│   │   │   ├── automation-config.tsx  # Config form
│   │   │   ├── runs.tsx       # Runs list with log viewer
│   │   │   ├── roi.tsx        # ROI dashboard with trend charts
│   │   │   ├── settings.tsx   # Org/team management
│   │   │   └── connections.tsx # OAuth integrations page
│   │   ├── components/
│   │   │   ├── app/           # App shell components
│   │   │   │   ├── app-shell.tsx
│   │   │   │   └── app-sidebar.tsx
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── cookie-consent.tsx  # GDPR consent banner
│   │   │   ├── language-switcher.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── locales/           # i18n translation files
│   │   │   ├── en.json        # English translations
│   │   │   └── nl.json        # Dutch translations
│   │   └── hooks/
│   │       ├── use-auth.ts    # Authentication hook
│   │       └── use-theme.ts   # Dark mode hook
├── server/                     # Backend Express app
│   ├── routes.ts              # All API routes
│   ├── storage.ts             # Drizzle storage layer
│   ├── blueprint.ts           # OpenAI blueprint generation
│   ├── db.ts                  # Database connection
│   └── replit_integrations/   # Auth, chat, image, audio modules
├── shared/
│   ├── schema.ts              # Drizzle schema definitions
│   └── models/                # Auth and chat models
└── uploads/                    # File upload directory
```

## Key Features
1. **Intake Wizard**: 6-step guided process with localStorage autosave and inline validation
2. **AI Blueprints**: LLM-generated process maps, bottlenecks, backlog with versioning/sharing
3. **Automation Templates**: 6 pre-built templates including Form→CRM, Lead Slack, Invoice AI
4. **Run Execution**: Simulated automation runs with detailed logging
5. **ROI Dashboard**: Track hours saved, cycle time, confidence scores, and 7-day trend charts
6. **Team Management**: Invite members, assign roles (Owner, Admin, Member)
7. **Integrations**: OAuth connections for Gmail, Outlook, Slack, HubSpot, Salesforce, Exact Online, AFAS
8. **i18n**: Full English and Dutch language support with language switcher
9. **GDPR Compliance**: Cookie consent banner and data isolation

## API Endpoints
- `GET/POST /api/intakes` - Intake CRUD with file uploads
- `GET /api/blueprints` - List blueprints
- `GET /api/blueprints/:id` - Blueprint details
- `GET /api/automations/templates` - Automation templates
- `GET/POST /api/automations/configs` - User configurations
- `POST /api/automations/configs/:id/run` - Trigger run
- `GET /api/runs` - Run history
- `GET /api/runs/:id/logs` - Run logs
- `GET /api/roi` - ROI metrics
- `GET/POST /api/org` - Organization management
- `GET /api/org/members` - Team members
- `GET/POST /api/connections` - Integration connections

## Database Schema
Core tables: orgs, org_members, intakes, uploads, blueprints, automation_templates, automation_configs, runs, run_logs, metric_snapshots, connections, users, sessions

Additional tables for new features: blueprintVersions, userPreferences, blueprintShares, scheduledAutomations

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection (auto-configured)
- `SESSION_SECRET` - Express session secret
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base (auto-configured)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-configured)

## Running the App
```bash
npm run dev         # Start development server
npm run db:push     # Push schema to database
```

## User Preferences
- Professional B2B SaaS aesthetic (Linear, Notion inspired)
- Inter font for UI, JetBrains Mono for code/logs
- Dark mode support with theme toggle
