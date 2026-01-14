# Ops Copilot - AI-Driven Operations Automation Platform

## Overview
Ops Copilot is a production-ready MVP SaaS application that helps SMBs document processes, identify bottlenecks, and generate automation blueprints using LLM analysis. Built with Vite + React + Express.

## Recent Changes
- January 14, 2026: Initial MVP implementation with complete frontend and backend

## Tech Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (Google, GitHub, email)
- **AI**: OpenAI via Replit AI Integrations (gpt-4.1 for blueprint generation)

## Project Structure
```
├── client/                     # Frontend React app
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── landing.tsx    # Public landing page
│   │   │   ├── dashboard.tsx  # Main dashboard
│   │   │   ├── intakes.tsx    # Intakes list
│   │   │   ├── intake-wizard.tsx  # 6-step intake form
│   │   │   ├── blueprints.tsx # Blueprints list
│   │   │   ├── blueprint-detail.tsx  # Blueprint with tabs
│   │   │   ├── automations.tsx  # Templates list
│   │   │   ├── automation-config.tsx  # Config form
│   │   │   ├── runs.tsx       # Runs list with log viewer
│   │   │   ├── roi.tsx        # ROI dashboard
│   │   │   └── settings.tsx   # Org/team management
│   │   ├── components/
│   │   │   ├── app/           # App shell components
│   │   │   │   ├── app-shell.tsx
│   │   │   │   └── app-sidebar.tsx
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── theme-toggle.tsx
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
1. **Intake Wizard**: 6-step guided process to document operational challenges
2. **AI Blueprints**: LLM-generated process maps, bottlenecks, and backlog
3. **Automation Templates**: Pre-built Email Triage and Lead Follow-up templates
4. **Run Execution**: Simulated automation runs with detailed logging
5. **ROI Dashboard**: Track hours saved, cycle time, and confidence scores
6. **Team Management**: Invite members, assign roles (Owner, Admin, Member)

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
