# Ops Copilot - Release Notes for First Dutch SME Customer

**Release Date:** January 29, 2026

## Summary

This release prepares Ops Copilot for handover to the first Dutch SME customer. All critical release blockers have been addressed, localization is complete, and security features are enforced.

---

## Critical Fixes

### 1. Intake to Blueprint Generation Pipeline (FIXED)
- **Problem:** New accounts could submit intakes, but status stayed "SUBMITTED" with no blueprint generated.
- **Solution:** 
  - Fixed status transitions: SUBMITTED → PROCESSING → COMPLETED/FAILED
  - Blueprint generation now triggers for ALL new organizations (not just demo orgs)
  - Added fallback blueprint generation on AI failure
  - Intakes list polls every 2 seconds while processing
  - Users see a spinning loader next to "Processing..." status

### 2. Automation Templates (FIXED)
- **Problem:** UI only showed 2 templates, but product claims 6.
- **Solution:** Seeded all 6 automation templates in the database:
  1. Email to Task Triage
  2. Lead Follow-up
  3. Form to CRM Sync
  4. Lead Assignment Slack Notification
  5. Invoice Intake and Coding
  6. Data Entry Automation
- Added proper icons for all templates

---

## Localization (Dutch Ready)

### EUR Pricing
- All pricing pages now show EUR (€0, €49) instead of USD
- Pricing is clearly labeled for Dutch customers

### Dutch Translations
- Complete Dutch translations for:
  - Landing page (hero, features, how it works, CTA)
  - Pricing page
  - Security page
  - Documentation navigation
  - Settings page
  - Dashboard, Intakes, Blueprints, Automations, Runs, ROI pages
  - All status labels (Ingediend, Verwerken, Voltooid, Mislukt)

### Locale-Aware Formatting
- Dates displayed in nl-NL format for Dutch users
- 7-Day Activity Trend chart uses Dutch weekday abbreviations (ma, di, wo, etc.)
- Language switcher visible on all public pages (pricing, security, docs)

---

## Role-Based Access Control (RBAC)

### Server-Side Enforcement
- **OWNER/ADMIN:** Full access (create configs, run automations, edit blueprints, invite members)
- **OPERATOR:** Can run automations and edit blueprints (cannot create configs or invite)
- **VIEWER:** Read-only access (cannot run, edit, or configure anything)
- All endpoints return 403 with clear error message for insufficient permissions

### Client-Side RBAC
- UI components hidden/disabled based on user role
- Clear permission messaging in UI

---

## Connectors

### Available Connectors
- Gmail / Google Workspace
- Microsoft Outlook / 365
- Slack
- HubSpot
- Salesforce
- Exact Online (Dutch accounting)
- AFAS Software (Dutch accounting)

### Consistency
- Same connector list appears in both /connections and Settings → Connections
- Each connector links to setup guide in documentation

---

## Quality Improvements

### Real-Time Updates
- Runs page polls every 2 seconds while runs are QUEUED or RUNNING
- ROI dashboard auto-refreshes every 5 seconds
- Intakes list polls while processing

### PDF Export
- Blueprint export to PDF available (alongside Markdown)

### Share Links
- Blueprints can be shared via public link
- Shows latest published version

---

## Known Limitations

- Demo accounts are read-only (by design)
- SOC 2 compliance is "In Progress"
- ISO 27001 is "Planned"

---

## How to Verify

1. Create a new account (not demo)
2. Complete an intake using the 6-step wizard
3. Wait for status to change from "Submitted" → "Processing" → "Completed"
4. View the generated blueprint
5. Check that 6 automation templates are visible
6. Switch language to Dutch and verify UI is fully translated
7. Check pricing page shows EUR
