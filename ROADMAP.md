# Ops Copilot - Product Roadmap

**Last Updated:** February 2, 2026  
**Version:** 1.0

---

## Product Vision

Transform operations automation for Dutch SMEs through AI-powered process discovery, intelligent automation templates, and measurable ROI tracking. Make enterprise-grade automation accessible to companies of 10-500 employees.

---

## Current Status (v1.0 - February 2026)

### ✅ Live & Production-Ready
- **Core Flow**: Intake Wizard → AI Blueprint Generation → Automation Configuration
- **Multi-tenancy**: Organization-scoped data with RBAC (5 roles)
- **i18n**: Full Dutch + English localization with EUR pricing
- **6 Automation Templates**: Email triage, lead follow-up, CRM sync, Slack notifications, invoice processing, data entry
- **ROI Dashboard**: Hours saved, cycle time reduction, 7-day activity tracking
- **Integrations**: UI for 7 connectors (Gmail, Outlook, Slack, HubSpot, Salesforce, Exact Online, AFAS)
- **Authentication**: Passport local strategy with PostgreSQL sessions
- **Design System**: Dark-mode-first, Linear/Notion-inspired UI

### ⚠️ Known Limitations
- Automation execution is **stubbed** (configs exist, runs are simulated)
- Connectors are **UI-only** (OAuth flows not implemented)
- No webhook/event triggers
- No test coverage
- SOC 2 compliance in progress
- Pro/Enterprise pricing plans marked "Coming Soon"

---

## Q1 2026 - Foundation Hardening

**Theme:** Make automations actually work + production stability

### 🎯 P0: Critical Path to Real Value

#### 1. Automation Execution Engine (4-6 weeks)
- [ ] **Run orchestrator**: Queue management, parallel execution, timeout handling
- [ ] **Template implementations**: Build actual logic for 2-3 core templates
  - Email to Task Triage (Gmail → create tasks in systems)
  - Form to CRM Sync (webhook → HubSpot/Salesforce)
  - Lead Assignment Slack Notification (CRM trigger → Slack)
- [ ] **Error handling**: Retries, circuit breakers, dead letter queue
- [ ] **Real-time logs**: WebSocket streaming to UI during run execution
- [ ] **Metrics collection**: Actual time saved calculations based on run stats

**Success Metric:** 1 customer running 100+ automations/month with 95%+ success rate

#### 2. Gmail Integration (2-3 weeks)
- [ ] OAuth 2.0 flow (Google Cloud Console setup)
- [ ] Gmail API integration: read emails, apply filters, mark as read
- [ ] Webhook notifications via Pub/Sub for real-time triggers
- [ ] Token refresh handling
- [ ] Rate limit management (respect Gmail quotas)

**Success Metric:** First customer automates email triage saving 5+ hours/week

#### 3. HubSpot CRM Integration (2-3 weeks)
- [ ] OAuth 2.0 flow
- [ ] Contact/Lead create/update operations
- [ ] Custom field mapping UI
- [ ] Webhook listener for CRM events (new lead, deal stage change)
- [ ] Deduplication logic

**Success Metric:** Bi-directional sync between intake forms and HubSpot

### 🔧 P1: Quality & Monitoring

#### 4. Testing Infrastructure (2 weeks)
- [ ] Vitest setup for client components
- [ ] Supertest for API integration tests
- [ ] Mock OpenAI API for blueprint generation tests
- [ ] CI/CD pipeline (GitHub Actions): lint, typecheck, test, build
- [ ] Target: 60%+ code coverage on critical paths

#### 5. Observability (1-2 weeks)
- [ ] Structured logging (Winston/Pino)
- [ ] Error tracking (Sentry or similar)
- [ ] Performance monitoring: API response times, DB query duration
- [ ] Uptime monitoring for production endpoints

#### 6. Blueprint Quality Improvements
- [ ] User feedback loop: thumbs up/down on AI blueprints
- [ ] Fine-tune GPT-4 prompts based on customer feedback
- [ ] "Regenerate blueprint" action if user unhappy
- [ ] Blueprint versioning (track edits over time)

---

## Q2 2026 - Scale & Expansion

**Theme:** More integrations + self-service growth

### 🚀 P0: Growth Drivers

#### 7. Slack Integration (1-2 weeks)
- [ ] OAuth flow
- [ ] Post message to channel
- [ ] Interactive message buttons (approve/reject workflows)
- [ ] Bot commands for triggering automations
- [ ] DM support for notifications

#### 8. Outlook/Microsoft 365 Integration (2-3 weeks)
- [ ] Microsoft Graph API OAuth
- [ ] Email operations (similar to Gmail)
- [ ] Calendar integration (schedule follow-ups)
- [ ] Teams notifications

#### 9. Exact Online Integration (3-4 weeks - critical for Dutch market)
- [ ] OAuth 2.0 flow
- [ ] Invoice create/update
- [ ] Customer/supplier sync
- [ ] Payment status checks
- [ ] VAT handling (Dutch rules)

#### 10. Self-Service Onboarding (2 weeks)
- [ ] Interactive product tour (onboarding checklist)
- [ ] Embedded video tutorials
- [ ] Sample blueprints/templates for common use cases
- [ ] "Clone demo automation" for new users
- [ ] In-app help widget (Intercom or similar)

### 🔧 P1: Paid Plans Launch

#### 11. Billing Infrastructure (2-3 weeks)
- [ ] Stripe integration
- [ ] Subscription management (Pro €49/mo)
- [ ] Usage metering (run count, automation limit enforcement)
- [ ] Upgrade/downgrade flows
- [ ] Invoicing for Dutch customers (comply with EU VAT)

#### 12. Pro Plan Features
- [ ] Unlimited automations (vs. 3 on Free)
- [ ] Unlimited runs (vs. 100/mo on Free)
- [ ] Priority support (email SLA)
- [ ] Custom branding (white-label blueprints)
- [ ] API access for custom integrations

---

## Q3 2026 - Intelligence & Automation

**Theme:** AI-first features + advanced workflows

### 🤖 P0: AI Enhancements

#### 13. Smart Trigger Suggestions
- [ ] AI analyzes blueprints to recommend triggers (e.g., "new email from *@vendor.com")
- [ ] Pre-fill automation configs based on blueprint context
- [ ] "1-click automation" for common patterns

#### 14. Process Mining
- [ ] Analyze historical run logs to identify new bottlenecks
- [ ] Auto-update blueprints with discovered patterns
- [ ] Anomaly detection (e.g., "Email response time 2x slower this week")

#### 15. Multi-Step Workflows (Zapier-style)
- [ ] Visual workflow builder (drag-and-drop)
- [ ] Conditional logic (if/then branches)
- [ ] Loops and delays
- [ ] Human-in-the-loop approvals
- [ ] Error paths and fallbacks

### 🌍 P1: International Expansion

#### 16. Multi-Language Support
- [ ] French translations
- [ ] German translations
- [ ] Spanish translations
- [ ] Locale-aware date/currency formatting for each market

#### 17. Additional Connectors
- [ ] Salesforce (finish implementation)
- [ ] AFAS Software (Dutch market)
- [ ] Asana/Monday.com (project management)
- [ ] Zendesk/Freshdesk (support ticketing)
- [ ] QuickBooks (accounting)

---

## Q4 2026 - Enterprise & Compliance

**Theme:** Security certifications + enterprise features

### 🏢 P0: Enterprise Readiness

#### 18. SOC 2 Type II Certification (3-6 months)
- [ ] Security audit preparation
- [ ] Compliance documentation
- [ ] Penetration testing
- [ ] Incident response plan
- [ ] Annual audit

#### 19. Single Sign-On (SSO) (2-3 weeks)
- [ ] SAML 2.0 support
- [ ] Azure AD integration
- [ ] Okta integration
- [ ] SCIM for user provisioning

#### 20. Advanced RBAC
- [ ] Custom roles (beyond 5 predefined)
- [ ] Resource-level permissions (per automation, per blueprint)
- [ ] Audit logs (who did what, when)
- [ ] 2FA/MFA enforcement option

#### 21. Data Residency & GDPR
- [ ] EU data hosting guarantees
- [ ] Data export API (customer data portability)
- [ ] Right to deletion workflows
- [ ] Consent management

### 📊 P1: Advanced Analytics

#### 22. Custom Dashboards
- [ ] User-defined metrics
- [ ] Custom date ranges
- [ ] Export to CSV/PDF
- [ ] Scheduled reports (weekly email digest)

#### 23. Team Collaboration
- [ ] Comments on blueprints/runs
- [ ] @mentions and notifications
- [ ] Shared workspaces
- [ ] Activity feed

---

## Future Considerations (2027+)

### 🔮 Exploratory Ideas
- **AI Agents**: Fully autonomous agents that discover, configure, and run automations
- **Mobile App**: iOS/Android for on-the-go approvals and monitoring
- **API-First Platform**: Public API for custom integrations
- **Marketplace**: Community-contributed automation templates
- **White-Label**: Ops Copilot as a service for consultancies
- **Voice Interface**: "Hey Ops, run my invoice automation"
- **Predictive Analytics**: "You'll receive 120 invoices next week, allocate resources accordingly"
- **No-Code Connectors**: Let users build custom integrations via UI
- **Version Control**: Git-like branching/merging for automation configs

---

## Release Cadence

- **Minor releases**: Every 2 weeks (bug fixes, small features)
- **Major releases**: Every quarter (new integrations, major features)
- **Hotfixes**: As needed for critical production issues

---

## Success Metrics by Quarter

### Q1 2026
- [ ] 10 paying customers
- [ ] 1,000 automation runs/month
- [ ] 95% uptime
- [ ] NPS > 40

### Q2 2026
- [ ] 50 paying customers
- [ ] €5,000 MRR
- [ ] 10,000 automation runs/month
- [ ] 3 case studies published

### Q3 2026
- [ ] 150 paying customers
- [ ] €15,000 MRR
- [ ] 50,000 automation runs/month
- [ ] <5% monthly churn

### Q4 2026
- [ ] 300 paying customers
- [ ] €30,000 MRR
- [ ] SOC 2 certified
- [ ] 5 enterprise customers (>€500/mo)

---

## How to Use This Roadmap

**For Product Team:**
- Review and update quarterly
- Prioritize based on customer feedback
- Track progress in GitHub Projects/Linear

**For Customers:**
- Check "Coming Soon" features
- Vote on priorities via feedback form
- Subscribe to release notes

**For Sales:**
- Reference when discussing future capabilities
- Set expectations on timeline (quarters, not dates)
- Flag urgent customer needs to product team

---

## Feedback

Have ideas or want to influence priorities? Contact: product@opscopilot.com

Last reviewed: February 2, 2026
