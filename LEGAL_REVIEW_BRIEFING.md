# Legal Review Briefing - Opsly SaaS

**Project**: Opsly (Operations Automation SaaS)  
**Jurisdiction**: Dutch SME customer, European operations  
**Target**: First customer deployment (30-day trial)  
**Legal Review Scope**: Privacy Policy and Terms of Service compliance  
**Review Timeline**: 24-48 hours preferred (deployment scheduled after approval)

---

## Executive Summary

Opsly is a production-ready SaaS platform for operations automation intake, AI-powered process blueprint generation, and workflow automation templates. We are deploying to our first customer—a Dutch SME—with a 30-day trial period.

**Documents for Your Review**:
1. **Privacy Policy** (`client/src/pages/privacy.tsx`)
2. **Terms of Service** (`client/src/pages/terms.tsx`)

Both documents are live on the application at:
- Production URL: `https://aurivian.nl/privacy` and `https://aurivian.nl/terms`

---

## Key Features & Legal Implications

### 1. User Data Flow
- **Intake Phase**: Customers describe operational processes (text, files, metrics)
- **Blueprint Phase**: OpenAI GPT-4 analyzes data, generates process maps (JSON stored in database)
- **Automation Phase**: Templates execute (currently simulated, real integrations Q2 2026)
- **Data Residency**: PostgreSQL database (EU region preferred, location TBD in env config)

### 2. Data Processing Activities
- **User account data**: Email, first/last name, password hash (bcrypt)
- **Organization data**: Org membership, roles (OWNER, ADMIN, OPERATOR, MEMBER, VIEWER)
- **Intake data**: Problem descriptions, tool lists, volume metrics, uploaded files
- **AI-generated blueprints**: Process steps, bottlenecks, backlog items (JSONB in database)
- **Automation configs**: User-defined settings for template execution
- **Run logs**: Execution results and debug information

### 3. Data Subject Rights Implementation
Our Terms and Privacy Policy commit to:
- **Right to Access** (Art. 15): Data export as CSV via `POST /api/account/data-export`
- **Right to Erasure** (Art. 17): Account deletion via `POST /api/account/delete` (cascade delete)
- **Right to Data Portability** (Art. 20): Export in CSV format
- **Right to Rectification** (Art. 16): Via account settings (UI TBD)
- **Right to Restrict Processing** (Art. 18): Via account settings (UI TBD)
- **Right to Object** (Art. 21): Via account settings (UI TBD)

### 4. Feature Limitations & Honest Disclosure
The product currently has:
- **4 Active Automation Templates**: Email triage, Lead follow-up, Form-to-CRM sync, Slack notifications
  - Status: `"demo"` (simulated, no real API integration)
- **2 Placeholder Templates**: Invoice intake, Data entry automation
  - Status: `"placeholder"` (under development, not usable)
- **No Live Integrations**: All external API connections (Gmail, Outlook, Slack, HubSpot, Salesforce) are stubbed for demo purposes
- **Timeline**: Real integrations planned for Q2 2026

**Design Choice**: We do NOT hide these limitations. Every template card shows a "Demo Mode" or "Not Available" badge with clear messaging.

---

## Privacy Policy - Review Checklist

### GDPR Articles 13-14 Coverage ✅
**Current Status**: Covered in Privacy Policy

- [x] Identity of controller (Opsly)
- [x] Purpose of processing (operational automation)
- [x] Legal basis for processing (legitimate interest + user consent)
- [x] Recipients of data (internal + OpenAI for blueprint generation)
- [x] Retention period (explicit: 30 days for trial, 1 year for active subscriptions, 90 days after deletion)
- [x] Rights of data subjects (Articles 15-22)
- [x] Right to lodge complaint with supervisory authority (ACM for NL)
- [x] Consent mechanism (checkbox on signup)
- [x] Data profiling/automated decisions (OpenAI GPT-4 analysis disclosed)

### GDPR Articles 15-22 Implementation ✅
**Current Status**: Committed in Privacy Policy, implemented in API

- [x] **Art. 15 - Right to Access**: `POST /api/account/data-export` returns CSV
- [x] **Art. 16 - Right to Rectification**: Email change via settings (UI TBD)
- [x] **Art. 17 - Right to Erasure**: `POST /api/account/delete` with confirmation
- [x] **Art. 18 - Right to Restrict**: Document references in Privacy Policy (UI TBD)
- [x] **Art. 19 - Notification Obligation**: Documented in Privacy Policy
- [x] **Art. 20 - Data Portability**: CSV export includes all org data
- [x] **Art. 21 - Right to Object**: Marketing emails (future feature, documented)
- [x] **Art. 22 - Right Not to Be Subject to Automated Decisions**: GPT-4 analysis is advisory, not binding

### Questions for Your Review
1. **Consent Mechanism**: Is a single checkbox on signup sufficient for EU users, or should we implement a more granular consent management UI?
2. **OpenAI Data Processing**: Should we include a specific Data Processing Agreement (DPA) with OpenAI in the Privacy Policy, or is the current disclosure adequate?
3. **Data Retention**: Is 30 days for trial data reasonable? Should we offer immediate deletion after trial ends?
4. **Supervisory Authority**: Should we specify ACM (Dutch DPA) or allow for EU-wide GDPR authority listing?

---

## Terms of Service - Review Checklist

### Feature Limitations & Disclaimers ✅
**Current Status**: Covered in Terms

- [x] Clear statement that templates are "demo" or "placeholder"
- [x] Liability cap: "Opsly not liable for indirect/consequential damages"
- [x] No warranties: "Provided as-is without warranty of merchantability"
- [x] Acceptable Use Policy (do not: reverse engineer, abuse, store private data)
- [x] Demo data: "Simulated. Real integrations coming in Q2 2026"
- [x] Data accuracy: "User responsible for input accuracy"
- [x] Trial period terms: "30-day evaluation, no paid features"

### Legal Protections ✅
**Current Status**: Covered

- [x] Limitation of liability cap
- [x] Indemnification clause
- [x] Termination clause (Opsly can terminate for abuse)
- [x] Governing law: Dutch law, Netherlands jurisdiction
- [x] Dispute resolution: Escalation to court if unresolved
- [x] Intellectual property: Opsly owns product, user owns submitted data

### Questions for Your Review
1. **Liability Cap**: Is the current cap (direct damages only, max 1x monthly subscription cost or €500) appropriate for Dutch SME?
2. **Governing Law**: Should we also offer EU-wide GDPR compliance assurances, or is Dutch law sufficient?
3. **Termination Rights**: Do we need to allow users to request data deletion before trial ends?
4. **Third-Party Services**: Should we list OpenAI and other third-party processors in the Terms?

---

## Data Processing & Security

### Data Flow Diagram
```
User Input (Intake) 
    ↓ [Encrypted in transit - TLS]
Database (PostgreSQL)
    ↓ [At rest - TBD encryption]
Opsly Application
    ↓ [Optional: OpenAI API for blueprint generation]
GPT-4 (OpenAI)
    ↓ [OpenAI Data Processing Agreement applies]
Back to Opsly
    ↓ [Stored in database]
User accessible via API (/api/blueprints, /api/automations)
```

### Security Measures (Current)
- **Authentication**: Passport Local strategy (bcrypt 10 rounds)
- **Session Management**: PostgreSQL session store with 7-day TTL
- **RBAC**: Role-based access control (OWNER, ADMIN, OPERATOR, MEMBER, VIEWER)
- **Data Encryption in Transit**: TLS (assumed production deployment)
- **Database**: PostgreSQL with cascade deletes for data subject rights
- **API Rate Limiting**: Not implemented (recommend adding)
- **Audit Logging**: Execution logs recorded, user action logging TBD

### Questions for Your Review
1. **Encryption at Rest**: Should we commit to database encryption in Privacy Policy?
2. **Audit Trail**: Should user data access be logged for compliance?
3. **Breach Notification**: Is the current 72-hour notification clause adequate for Dutch law?

---

## Compliance Checklist for Counsel

### GDPR (EU General Data Protection Regulation) ✅
- [ ] Privacy Policy covers Articles 13-14 (information provision)
- [ ] Privacy Policy covers Articles 15-22 (data subject rights)
- [ ] Consent mechanism is explicit and voluntary
- [ ] Data processing purposes are clearly stated
- [ ] Third-party data sharing (e.g., OpenAI) is disclosed
- [ ] Retention periods are specified and justified
- [ ] International data transfers are compliant (EU storage preferred)
- [ ] Breach notification timeline (72 hours) is documented

### Dutch Law Compliance 🇳🇱
- [ ] Governing law is Dutch law (Burgerlijk Wetboek)
- [ ] Terms are enforceable in Dutch courts
- [ ] Jurisdiction clause specifies Dutch courts (district courts)
- [ ] Consumer protection laws are considered (Dutch WCAG/consumer rights)
- [ ] VAT compliance is documented (if applicable)

### Standard Commercial Terms
- [ ] Limitation of liability is reasonable
- [ ] Indemnification clause is balanced
- [ ] Termination rights are fair to both parties
- [ ] Intellectual property ownership is clear
- [ ] Amendment procedures are documented
- [ ] Governing law and dispute resolution are specified

### Data Security & Privacy
- [ ] Security measures are described (without over-promising)
- [ ] Data retention policies are justified
- [ ] User rights to access, export, and delete are implemented
- [ ] No misleading claims about data protection
- [ ] Third-party processors (OpenAI) are disclosed
- [ ] Encryption and authentication measures are noted

---

## Key Decisions Needed from Counsel

### High Priority
1. **GDPR Jurisdiction**: Specify ACM (Dutch DPA) or allow broader EU authority?
2. **Data Processing Agreement**: Need separate DPA with OpenAI, or handle in Privacy Policy?
3. **Consent Mechanism**: Is checkbox sufficient, or need more granular UI?
4. **Liability Cap**: Is €500 or equivalent appropriate for Dutch SME target market?

### Medium Priority
1. **Encryption at Rest**: Commit in Privacy Policy or handle separately?
2. **Audit Logging**: Log all data access for compliance, or minimize logging?
3. **Trial Period**: Auto-delete data after 30 days, or ask user?
4. **Subscription Model**: Should Terms include pricing/billing terms (future feature)?

### Low Priority
1. **Consumer Protection Laws**: Dutch-specific consumer rights (standard for SaaS)
2. **Accessibility (WCAG)**: Privacy/Terms pages meet WCAG AA standard (current: yes)
3. **Marketing Clauses**: Can we email customers about new features? (TBD in future)

---

## Honest Product Positioning

Our unique position: **We tell customers exactly what works and what doesn't.**

- ✅ Intake → Blueprint generation works (uses GPT-4)
- ✅ Automation templates UI works (you can configure them)
- ❌ Automation execution is simulated (no real email/Slack/CRM integration yet)
- ❌ Real integrations planned for Q2 2026

**This is intentional**: We'd rather lose a customer who wants real integrations today than gain one who finds out after 30 days that we oversold. The Terms of Service are written to support this positioning.

---

## Timeline & Next Steps

### Phase 1: Legal Review (You are here 👈)
1. You review Privacy Policy and Terms (24-48 hours)
2. You provide feedback/requests for changes
3. We incorporate feedback and redeploy
4. You sign off ✅

### Phase 2: Production Deployment
1. Build and deploy to production server
2. Smoke test Privacy/Terms pages on production
3. Verify SMS/email signup flow works with consent checkbox
4. Schedule customer onboarding

### Phase 3: Customer Onboarding
1. 2-hour kickoff call (walk through intake → blueprint → automation)
2. Set expectations: demo integrations, Q2 roadmap
3. Provide runbook and support contact
4. 1-week check-in scheduled

### Phase 4: 30-Day Monitoring
1. Track support tickets and customer feedback
2. Monitor uptime and error rates
3. Document learnings for next customer

---

## Files for Your Review

### Public-Facing Legal Documents
1. **Privacy Policy**: [client/src/pages/privacy.tsx](client/src/pages/privacy.tsx)
   - Accessible at: `/privacy`
   - ~400 lines of React/TypeScript component

2. **Terms of Service**: [client/src/pages/terms.tsx](client/src/pages/terms.tsx)
   - Accessible at: `/terms`
   - ~400 lines of React/TypeScript component

### API Implementation (Reference)
- **Data Export**: [server/routes.ts](server/routes.ts#L653-L725) - `POST /api/account/data-export`
- **Account Deletion**: [server/routes.ts](server/routes.ts#L727-L755) - `POST /api/account/delete`
- **Consent Checkbox**: [client/src/pages/auth/signup.tsx](client/src/pages/auth/signup.tsx#L175-L183)

### Code Architecture (Reference)
- **User Model**: [shared/models/auth.ts](shared/models/auth.ts) - Database schema
- **Authentication**: [server/auth.ts](server/auth.ts) - Passport setup
- **Storage Layer**: [server/storage.ts](server/storage.ts) - Database operations
- **API Routes**: [server/routes.ts](server/routes.ts) - All API endpoints

---

## Contact & Questions

**For Counsel Review**:
- Send feedback/requested changes to: [your contact]
- Expected review time: 24-48 hours
- Sign-off email required for deployment

**For Technical Questions**:
- Haroon Wahed (founder/developer)
- Available for calls during review

---

## Appendix: Feature Matrix

| Feature | Status | Target Customer Can Use? | Real Integration? |
|---------|--------|--------------------------|-------------------|
| User Registration | ✅ Live | Yes | N/A |
| Privacy Policy | ✅ Live | View/Download | N/A |
| Terms of Service | ✅ Live | View/Download | N/A |
| Data Export | ✅ Live | Yes (CSV) | N/A |
| Account Deletion | ✅ Live | Yes | N/A |
| Intake Submission | ✅ Live | Yes | N/A |
| Blueprint Generation | ✅ Live | Yes | OpenAI GPT-4 ✅ |
| Automation Templates | ✅ Live | Config only | Simulated ❌ |
| Email Integration | ❌ Planned | No | Planned Q2 2026 |
| Slack Integration | ❌ Planned | No | Planned Q2 2026 |
| CRM Integration | ❌ Planned | No | Planned Q2 2026 |
| ROI Reporting | ✅ Live | Yes (read-only) | N/A |

---

**Document Version**: 1.0  
**Date**: 2 February 2026  
**Status**: READY FOR EXTERNAL LEGAL REVIEW
