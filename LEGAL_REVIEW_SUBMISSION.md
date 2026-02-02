# Legal Review Submission Package

**Date**: 2 February 2026  
**Product**: Opsly - Operations Automation SaaS  
**Recipient**: External Legal Counsel  
**Turnaround Target**: 24-48 hours  
**Deployment**: Post-approval

---

## What We're Asking

Please review and sign off on our **Privacy Policy** and **Terms of Service** for a Dutch SME customer (30-day trial).

**Key Questions**:
1. Are Privacy Policy and Terms GDPR compliant for Dutch customers?
2. Are there any liability or jurisdiction issues with Dutch law?
3. Should we add/remove/modify anything before going live?

---

## Documents for Review

### 1. Privacy Policy
**File**: `client/src/pages/privacy.tsx`  
**Accessible at**: `http://127.0.0.1:5001/privacy` (or production URL)  
**Length**: ~400 lines  
**Key Sections**:
- Data collection and purposes
- GDPR Articles 13-14 (transparency)
- GDPR Articles 15-22 (data subject rights)
- Data retention
- Data security
- Breach notification
- Contact information

### 2. Terms of Service
**File**: `client/src/pages/terms.tsx`  
**Accessible at**: `http://127.0.0.1:5001/terms` (or production URL)  
**Length**: ~400 lines  
**Key Sections**:
- Acceptance and binding agreement
- Use license and restrictions
- Feature limitations (demo/placeholder status)
- Liability cap and disclaimers
- Acceptable use policy
- Intellectual property
- Governing law (Dutch)
- Termination

### 3. Implementation Reference
**Data Export API**: Implemented at `POST /api/account/data-export`  
- Returns: CSV file with all user data (intakes, blueprints, configs, runs, members)
- GDPR Article 15 & 20 compliance

**Account Deletion API**: Implemented at `POST /api/account/delete`  
- Requires confirmation string: "DELETE_ALL_DATA"
- Cascade deletes all org data
- GDPR Article 17 compliance

**Consent Checkbox**: Implemented on signup form  
- Blocks account creation without acceptance
- Links to Privacy Policy and Terms (new tabs)
- GDPR Article 7 compliance

---

## How to Review

### Option 1: Review in Browser (Easiest)
```bash
# Start dev server locally
npm install
npm run dev

# Visit at http://127.0.0.1:5001:
# - Privacy: http://127.0.0.1:5001/privacy
# - Terms: http://127.0.0.1:5001/terms
# - Signup: http://127.0.0.1:5001/auth/signup
```

### Option 2: Review Source Code (Fastest)
```bash
# Read Privacy Policy source
cat client/src/pages/privacy.tsx

# Read Terms source
cat client/src/pages/terms.tsx

# Read implementation
cat server/routes.ts | grep -A 100 "data-export"
cat server/routes.ts | grep -A 50 "account/delete"
```

### Option 3: Read Briefing Document
- See: `LEGAL_REVIEW_BRIEFING.md` for full context
- Includes: Product overview, data flow, compliance checklist

---

## What We're Committed To

✅ **GDPR Compliance**:
- Privacy Policy covers Articles 13-14, 15-22
- Data export API implemented (Article 20)
- Account deletion API implemented (Article 17)
- Consent checkbox on signup (Article 7)
- 72-hour breach notification timeline

✅ **Dutch Law Compliance**:
- Governing law: Dutch law (Burgerlijk Wetboek)
- Jurisdiction: Dutch courts
- Liability cap: Fair and reasonable

✅ **Honest Product Positioning**:
- Clear labeling of demo vs. real integrations
- No misleading claims about automation capabilities
- Explicit feature limitations in Terms
- Timeline for real integrations (Q2 2026)

✅ **Data Security**:
- Password hashing (bcrypt 10 rounds)
- Session management (7-day TTL)
- Role-based access control
- Database encryption (TLS in transit, at-rest TBD)
- No unnecessary data collection

---

## Timeline

| Phase | Date | Owner | Status |
|-------|------|-------|--------|
| Legal Review | Feb 2-4, 2026 | Counsel | 🔄 In Progress |
| Feedback Incorporation | Feb 4-5, 2026 | Engineering | 📋 Pending |
| Final Sign-Off | Feb 5, 2026 | Counsel | ⏳ Pending |
| Production Deployment | Feb 5-6, 2026 | DevOps | ⏳ Pending |
| Customer Onboarding | Feb 6-7, 2026 | Customer Success | ⏳ Pending |

---

## Known Limitations (Already Disclosed)

These are NOT blockers for release, but should be noted:

1. **No Real Integrations Yet**
   - Email/Slack/CRM integration are simulated
   - Real integrations planned for Q2 2026
   - Clearly labeled in UI and Terms

2. **Basic Encryption**
   - TLS in transit ✅
   - At-rest encryption TBD (not promised in Privacy Policy)
   - Rate limiting: Not yet implemented (recommend adding)

3. **Trial-Only Features**
   - Data export works
   - Account deletion works
   - But: No paid tier yet (all features free for 30 days)

4. **Audit Logging**
   - Execution logs recorded ✅
   - User action logging: Not yet implemented
   - Recommended for future (GDPR audit trail)

---

## Questions We Have for You

### High Priority
1. **GDPR Jurisdiction**: Should we specify ACM (Dutch DPA) or allow broader EU authority in Privacy Policy?
2. **Data Processing Agreement**: Do we need separate DPA with OpenAI, or is current Privacy Policy disclosure sufficient?
3. **Consent Granularity**: Is single checkbox on signup adequate, or should we implement granular consent management?
4. **Liability Cap**: Is €500 cap appropriate for Dutch SME market (or should it scale with subscription price)?

### Medium Priority
1. **Encryption Commitment**: Should we commit to database encryption at rest in Privacy Policy?
2. **Audit Trail**: Should we implement and promise audit logging of all data access?
3. **Auto-Delete**: Should trial data auto-delete after 30 days, or require manual deletion request?

### Low Priority
1. **Marketing Consent**: Can we email customers about new features (future feature)?
2. **Accessibility**: Are WCAG AA standards sufficient for Privacy/Terms pages?
3. **Localization**: Should we provide Dutch translation of Privacy Policy (currently English)?

---

## Contact Information

**For Questions**:
- Developer: Haroon Wahed
- Email: haroon.wahed@live.nl
- Available for calls during your review

**For Feedback**:
- Please respond via email with:
  1. Overall assessment (Pass / Fail / Changes Needed)
  2. Specific issues (if any)
  3. Recommended changes
  4. Timeline for sign-off

**For Sign-Off**:
- Email confirmation when ready
- Format: "I have reviewed the Privacy Policy and Terms of Service and approve them for Dutch SME customer deployment effective [date]"

---

## What Happens Next

### If Approved ✅
1. We deploy to production immediately
2. Customer onboarding call scheduled
3. 30-day trial begins

### If Changes Requested 🔄
1. We incorporate feedback
2. Send updated documents for final review
3. Iterate until approved

### If Rejected ❌
1. We discuss concerns and next steps
2. Potentially delay deployment
3. Plan revised approach

---

## Appendix: Product Architecture

**Full Stack**: Express + Vite + React + PostgreSQL  
**Deployment Target**: Production server (Replit or equivalent)  
**Data Location**: EU region (PostgreSQL)  
**Scale**: Small (under 100 users initially)

**Key Systems**:
- Authentication: Passport Local (bcrypt)
- Sessions: PostgreSQL session store
- AI: OpenAI GPT-4 for blueprint generation
- Automation: Template-based execution engine
- RBAC: Role-based access control (5 levels)

**Security**:
- TLS/HTTPS enabled
- Session timeout: 7 days
- Password minimum: 8 characters
- Rate limiting: TBD
- CORS: Configured per origin

---

## Legal Review Checklist (Use This)

As you review, please check off:

### GDPR Compliance
- [ ] Privacy Policy covers Articles 13-14
- [ ] Privacy Policy covers Articles 15-22
- [ ] Consent mechanism is explicit
- [ ] Data retention periods justified
- [ ] Third-party processors disclosed
- [ ] International transfers compliant
- [ ] Breach notification timeline appropriate

### Dutch Law
- [ ] Governing law is Dutch law
- [ ] Jurisdiction clause is valid
- [ ] Consumer protection addressed
- [ ] Liability cap is reasonable
- [ ] Termination rights are fair

### General Commercial
- [ ] Limitation of liability standard
- [ ] IP ownership clear
- [ ] Amendment procedures defined
- [ ] Force majeure clause included
- [ ] Entire agreement clause present

### Data Security & Privacy
- [ ] Security measures honestly described
- [ ] No overpromising about encryption
- [ ] User rights clearly stated
- [ ] Data retention policies justified
- [ ] Third-party sharing disclosed

### Feature Limitations
- [ ] Demo/placeholder status clear
- [ ] No misleading marketing
- [ ] Honest about integrations (Q2 2026)
- [ ] Trial period terms explicit
- [ ] Support SLA documented

---

**Ready to Review**: Yes ✅  
**Files Attached**: Privacy.tsx, Terms.tsx  
**Briefing Document**: LEGAL_REVIEW_BRIEFING.md  
**Deployment Runbook**: PRODUCTION_DEPLOYMENT_RUNBOOK.md  
**Timeline**: 24-48 hours preferred  

---

**Send This Package To**: [Your Counsel's Email]  
**With Message**:

> Hi [Counsel Name],
>
> We're deploying Opsly to our first customer (Dutch SME, 30-day trial) and need your review of our Privacy Policy and Terms of Service.
>
> Please review the attached documents and provide feedback on GDPR compliance, Dutch law enforceability, and any requested changes.
>
> See LEGAL_REVIEW_BRIEFING.md for full context and questions.
>
> Turnaround: 24-48 hours preferred. Available for calls.
>
> Thanks,  
> [Your Name]

---

**Version**: 1.0  
**Created**: 2 February 2026
