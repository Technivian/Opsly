# Opsly - AI Agent Instructions

## Architecture Overview

**Full-Stack SaaS**: Express + Vite + React + PostgreSQL, designed for operations automation (intake → AI blueprint → automation).

### Core Flow
1. **Intake Wizard** → User describes operational pain (forms in `client/src/pages/intake-wizard.tsx`)
2. **Blueprint Generation** → OpenAI GPT-4 analyzes and generates process maps (`server/blueprint.ts`)
3. **Status Transitions**: SUBMITTED → PROCESSING → COMPLETED/FAILED (critical: polling UI updates)
4. **Automation Templates** → 6 pre-seeded templates enable config and execution (`automationTemplates` table)

### Directory Structure
- **`/server`**: Express API, auth, DB, blueprint AI, routes
- **`/server/execution`**: Automation execution engine (orchestrator + template executors)
- **`/client/src`**: React SPA with wouter routing, TanStack Query, shadcn/ui components
- **`/shared/schema.ts`**: Drizzle ORM schemas (single source of truth for types)
- **`/server/replit_integrations`**: Audio, auth, batch, chat, image integrations (Replit-specific)

## Critical Patterns

### Multi-Tenancy & RBAC
- **Org-scoped data**: Every entity references `orgId` (cascade deletes)
- **Auto-org creation**: `ensureOrgMember()` in `server/routes.ts` creates org on first auth
- **Role hierarchy**: OWNER > ADMIN > OPERATOR > MEMBER > VIEWER
- **Dual enforcement**: 
  - Server: `checkRole()` in routes (returns 403 on violation)
  - Client: `useRbac()` hook hides/disables UI elements
- **Permissions model**: See `client/src/hooks/use-rbac.ts` for granular permissions (e.g., `can('createAutomations')`)

### Authentication Flow
- **Passport Local Strategy** with bcrypt (10 rounds)
- **Session store**: PostgreSQL via `connect-pg-simple` (7-day TTL)
- **Route guards**: 
  - Server: `isAuthenticated` middleware on all `/api/*` routes
  - Client: `<ProtectedRoute>` wrapper redirects to `/` if not authed
- **Demo mode**: `isDemoReadOnly` middleware blocks mutations for demo orgs

### Database & Migrations
- **Drizzle ORM**: Schema in `shared/schema.ts`, config in `drizzle.config.ts`
- **Push changes**: `npm run db:push` (no migration files in dev, caution in prod)
- **Enums**: Postgres enums for status/role fields (e.g., `intakeStatusEnum`, `orgRoleEnum`)
- **JSONB fields**: `processJson`, `bottlenecksJson`, `backlogJson` store complex AI outputs
- **Connection**: `DATABASE_URL` env var required (throws on missing)

### API Conventions
- **TanStack Query keys**: `["/api/intakes"]` matches endpoint path
- **Error format**: `{ message: string }` with HTTP status codes
- **Polling**: Intake list polls every 2s while any status === "PROCESSING"
- **File uploads**: Multer middleware with 10MB limit, stored in `uploads/` dir

### Blueprint AI Generation
- **Model**: GPT-4.1 via OpenAI SDK (env: `AI_INTEGRATIONS_OPENAI_API_KEY`)
- **Prompt engineering**: See `buildPrompt()` in `server/blueprint.ts` for JSON schema
- **Fallback strategy**: If AI fails, create default blueprint + set status to FAILED (still usable)

### Automation Execution Engine
- **Orchestrator**: `server/execution/executor.ts` manages run lifecycle (QUEUED → RUNNING → SUCCESS/FAILED)
- **Template registry**: `registerExecutor()` maps template keys to implementation functions
- **Template structure**: Each executor receives `ExecutionContext` and returns `ExecutionResult`
- **Logging**: Use `log()` helper to write to run logs during execution
- **Error handling**: Executor catches errors, updates run status to FAILED, logs exceptions
- **Active templates**: `email_task_triage`, `lead_followup` (others TODO)
- **Validation**: `validateProcessSteps()`, `validateBottlenecks()`, `validateBacklog()` ensure schema compliance

### i18n & Localization
- **i18next + react-i18next**: Translations in `client/src/i18n/locales/{en,nl}.json`
- **Language switcher**: Visible on public pages (`<LanguageSwitcher>`)
- **Locale-aware formatting**: `formatCurrency()` respects nl-NL (EUR) vs en-US (USD)
- **Date formatting**: `date-fns` with locale from user preferences
- **Design target**: Dutch SME customers (EUR pricing, Dutch translations complete)

## Development Workflows

### Running Locally
```bash
npm run dev          # Starts Express + Vite dev server (port 5000)
npm run build        # Vite build (client) + esbuild (server) to dist/
npm run start        # Production mode from dist/index.cjs
npm run check        # TypeScript type checking
```

### Path Aliases (Vite config)
- `@/`: Resolves to `client/src/`
- `@shared`: Resolves to `shared/`
- `@assets`: Resolves to `attached_assets/`

### Adding Database Tables
1. Define table in `shared/schema.ts` (use Drizzle's `pgTable`, enums, types)
2. Export Insert/Select types via `createInsertSchema` + `$inferSelect`

### Adding New Automation Templates
1. Create executor function in `server/execution/templates/{template-name}.ts`
2. Implement signature: `(ctx: ExecutionContext) => Promise<ExecutionResult>`
3. Use `log()` helper to write progress updates to run logs
4. Register in `server/execution/templates/index.ts` via `registerExecutor()`
5. Add template metadata to database seed in `server/routes.ts` (`seedAutomationTemplates()`)
6. Test by creating config and triggering run via `/api/automations/run`
3. Add CRUD methods to `server/storage.ts`
4. Run `npm run db:push` to sync schema

### Adding New Routes
1. Define in `server/routes.ts` with `isAuthenticated` middleware
2. Add RBAC check if needed: `const canCreate = await checkRole(userId, orgId, ["OWNER", "ADMIN"])`
3. Client query: `useQuery({ queryKey: ["/api/your-endpoint"] })`
4. Follow REST conventions: GET list, GET :id, POST create, PUT/PATCH update

### Styling Guidelines
- **Design doc**: `design_guidelines.md` - REQUIRED reading for UI work
- **Dark-first**: Design for dark mode primarily (gray-950 backgrounds, indigo accents)
- **Component library**: shadcn/ui in `client/src/components/ui/`
- **Spacing**: Tailwind primitives (p-6, space-y-6, never arbitrary values)
- **Status badges**: `rounded-full px-2.5 py-0.5 text-xs` with semantic colors

## IRun execution**: Runs execute asynchronously via `executeRun()` - don't block HTTP response
- **Org isolation**: Always filter queries by `orgId` from authenticated user's org membership
- **RBAC server-side**: UI hiding is UX; server MUST enforce with 403 responses
- **JSONB typing**: Use `.$type<YourInterface>()` for type safety on JSONB columns
- **File uploads**: Files go to `uploads/` (not gitignored, needs manual cleanup)
- **Build externals**: Only allowlisted deps bundled (see `script/build.ts`), rest assumed in node_modules
- **Vite dev mode**: Only in development; production serves from `dist/public/`
- **Template executors**: Must be registered in `registerAllTemplates()` on startup
- **Batch**: Background job processing
- Files are auto-registered in `server/routes.ts` via `registerRoutes()`

### External Services
- **OpenAI**: Blueprint generation (GPT-4.1, JSON mode)
- **Connectors**: Gmail, Outlook, Slack, HubSpot, Salesforce, Exact Online (config UI only, no live integrations)

## Cerver/execution/executor.ts](server/execution/executor.ts) - Automation run orchestrator
- [server/execution/templates/](server/execution/templates/) - Template implementations
- [sommon Gotchas

- **Status transitions**: MUST update intake status to PROCESSING before async work, COMPLETED/FAILED after
- **Org isolation**: Always filter queries by `orgId` from authenticated user's org membership
- **RBAC server-side**: UI hiding is UX; server MUST enforce with 403 responses
- **JSONB typing**: Use `.$type<YourInterface>()` for type safety on JSONB columns
- **File uploads**: Files go to `uploads/` (not gitignored, needs manual cleanup)
- **Build externals**: Only allowlisted deps bundled (see `script/build.ts`), rest assumed in node_modules
- **Vite dev mode**: Only in development; production serves from `dist/public/`

## Testing & Quality

⚠️ **No test suite exists** - write tests when adding critical features. Consider Vitest for client, Supertest for API.

## Key Files Reference

- [server/routes.ts](server/routes.ts) - All API endpoints, RBAC enforcement
- [server/blueprint.ts](server/blueprint.ts) - AI blueprint generation logic
- [shared/schema.ts](shared/schema.ts) - Database schema & TypeScript types
- [client/src/hooks/use-rbac.ts](client/src/hooks/use-rbac.ts) - Client-side permissions
- [design_guidelines.md](design_guidelines.md) - UI/UX standards and patterns
