# Internal Checklist: Onboarding First Dutch SME Customer

**Document Version:** 1.0  
**Last Updated:** January 29, 2026

---

## Pre-Onboarding (Before Customer Access)

### Account Setup
- [ ] Create customer organization in Ops Copilot
- [ ] Set organization name to customer's company name
- [ ] Create OWNER account for primary contact (use their work email)
- [ ] Verify email domain for authentication

### Language & Locale
- [ ] Confirm customer language preference (Dutch/English)
- [ ] Set default locale to nl-NL if Dutch preferred
- [ ] Verify pricing displays in EUR (€)

### Integration Prep
- [ ] Identify which connectors customer needs:
  - [ ] Gmail / Google Workspace
  - [ ] Microsoft Outlook / 365
  - [ ] Slack
  - [ ] HubSpot / Salesforce (CRM)
  - [ ] Exact Online / AFAS (Dutch accounting)
- [ ] Prepare OAuth credentials for required integrations
- [ ] Test integration flows in staging environment

---

## Day 1: Initial Setup

### Account Onboarding
- [ ] Send welcome email with login instructions
- [ ] Schedule kickoff call (30 min)
- [ ] Share documentation link: /docs

### First Intake
- [ ] Guide customer through first intake wizard
- [ ] Help identify a suitable process to document (low complexity)
- [ ] Explain 6 pain areas: Sales, Support, Finance, Ops
- [ ] Complete intake together
- [ ] Show blueprint generation (wait ~60 seconds for AI)

### Blueprint Review
- [ ] Walk through generated blueprint sections:
  - Process map with steps
  - Identified bottlenecks
  - Prioritized backlog
- [ ] Explain editing capabilities
- [ ] Demo PDF export and share links

---

## Day 2-5: Configuration

### Automation Templates
- [ ] Review available templates with customer:
  1. Email to Task Triage
  2. Lead Follow-up
  3. Form to CRM Sync
  4. Lead Assignment Slack Notification
  5. Invoice Intake and Coding
  6. Data Entry Automation
- [ ] Configure first automation based on blueprint recommendations
- [ ] Execute test run
- [ ] Review run logs together

### Team Setup
- [ ] Invite additional team members
- [ ] Assign appropriate roles:
  - OWNER: Primary account owner
  - ADMIN: IT/Operations managers
  - OPERATOR: Team members who run automations
  - VIEWER: Stakeholders (read-only access)
- [ ] Explain permission levels

### Integrations
- [ ] Connect required services
- [ ] Test OAuth flows
- [ ] Verify data sync

---

## Week 2: Go-Live

### Production Use
- [ ] Customer runs automations independently
- [ ] Monitor ROI dashboard for metrics
- [ ] Address any issues promptly

### ROI Tracking
- [ ] Review ROI dashboard with customer
- [ ] Explain metrics:
  - Hours Saved
  - Cycle Time Reduction
  - Confidence Score
- [ ] Show 7-day activity trend chart
- [ ] Set expectations for ROI accumulation

---

## Ongoing Support

### Weekly Check-ins (First Month)
- [ ] Week 1: Review initial usage, address blockers
- [ ] Week 2: Optimize configurations, add more automations
- [ ] Week 3: Review ROI metrics, gather feedback
- [ ] Week 4: Transition to monthly check-ins

### Documentation
- [ ] Ensure customer knows how to access:
  - /docs - Getting started
  - /docs - Integration setup guides
  - /docs - FAQ
- [ ] Provide contact email for support

### Escalation Path
- [ ] Technical issues: support@opscopilot.com
- [ ] Account/billing: sales@opscopilot.com
- [ ] Security concerns: security@opscopilot.com

---

## GDPR Compliance Checklist

- [ ] Cookie consent banner active
- [ ] Data Processing Agreement (DPA) signed
- [ ] Customer confirms EU data residency requirements
- [ ] Explain data retention policy (active + 30 days, purge within 90 days)
- [ ] Provide data export/deletion request process

---

## Success Metrics

Track these KPIs during onboarding:

| Metric | Target | Actual |
|--------|--------|--------|
| Time to first blueprint | < 1 hour | |
| Time to first automation run | < 1 day | |
| Automations configured | 2+ by week 2 | |
| Team members onboarded | 3+ by week 1 | |
| Customer satisfaction | 8+/10 | |

---

## Notes

- Dutch customers prefer EUR pricing (already configured)
- AFAS and Exact Online are common in Dutch SME market
- Security page available at /security for compliance questions
