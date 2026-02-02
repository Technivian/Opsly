# SHIP READY - First Customer Deployment Checklist

**Status**: ✅ READY FOR LEGAL REVIEW  
**Date**: February 2, 2026  
**Deployment Target**: Production (TBD)  
**Customer**: Dutch SME (30-day trial)

---

## Phase 1: Legal Review (Pending ⏳)

All legal documents created, styled, and deployed locally. **Awaiting external legal counsel approval.**

### Documents for Review
- **Privacy Policy**: [client/src/pages/privacy.tsx](client/src/pages/privacy.tsx)
  - GDPR Articles 13-14 (information to provide)
  - GDPR Articles 15-22 (data subject rights)
  - Data retention policies
  - Security measures
  - Breach notification procedures
  - Contact information for DPA inquiries
  - **Status**: ✅ Complete, Opsly design system applied

- **Terms of Service**: [client/src/pages/terms.tsx](client/src/pages/terms.tsx)
  - Feature Limitations (with DEMO/PLACEHOLDER badges)
  - Liability disclaimers and caps
  - Acceptable Use Policy
  - No warranties clause
  - User acceptance flow (checkbox blocking signup)
  - **Status**: ✅ Complete, Opsly design system applied

### Legal Checklist for Counsel
- [ ] **GDPR Compliance**
  - [ ] Articles 13-14 coverage (data collection transparency)
  - [ ] Articles 15-22 implementation (data subject rights)
  - [ ] Data retention policies adequate
  - [ ] DPA contact information correct
  - [ ] Breach notification procedures compliant

- [ ] **Dutch Jurisdiction**
  - [ ] Terms enforceable under Dutch law
  - [ ] Liability language appropriate for NL courts
  - [ ] EUR vs USD pricing implications reviewed

- [ ] **Feature Disclaimers**
  - [ ] "Demo mode" and "placeholder" language clear
  - [ ] No misleading claims about integration status
  - [ ] Accurate representation of what customer can do in 30 days

- [ ] **Data Security**
  - [ ] Security measures described adequately
  - [ ] No overpromising on encryption/compliance
  - [ ] Honest about what's not yet implemented

---

## Phase 2: Deployment Ready (Pending Legal Sign-Off 🔒)

### Code Status: ✅ PRODUCTION READY

#### Completeness Checklist
- [x] **GDPR/Legal Compliance**
  - [x] Privacy Policy page created and styled
  - [x] Terms of Service page created and styled
  - [x] Signup consent checkbox (blocks form without acceptance)
  - [x] Data export API (`POST /api/account/data-export`) - TESTED ✅
  - [x] Account deletion API (`POST /api/account/delete`) - IMPLEMENTED
  - [x] Routes accessible: `/privacy`, `/terms`

- [x] **Code Quality**
  - [x] TypeScript compilation: 0 errors
  - [x] No console warnings (breadcrumb DOM nesting fixed)
  - [x] HMR WebSocket configured (host/port aligned with Express)
  - [x] All imports resolve correctly

- [x] **Testing**
  - [x] Manual smoke tests: 3/3 PASSING
    - [x] Privacy page loads with correct styling
    - [x] Terms page loads with correct styling
    - [x] Signup consent checkbox blocks form submission
  - [x] Automated e2e test: 1/1 PASSING
    - [x] Playwright test validates consent flow
    - [x] Links point to correct URLs with `target="_blank"`

- [x] **Automation Templates**
  - [x] 4 demo templates registered and functional
  - [x] Template status clearly marked: "demo" or "placeholder"
  - [x] Honest messaging about integration status
  - [x] Configuration UI works end-to-end

- [x] **Honest Product Messaging**
  - [x] Terms explicitly list feature limitations
  - [x] Demo badges visible on all simulated features
  - [x] No marketing language in legal docs
  - [x] Clear about what works vs what's placeholder

---

## Phase 2 Deployment Steps (Post-Legal-Approval)

### Pre-Deployment Verification
```bash
# 1. Production build
npm run build

# 2. Check build output
ls -lh dist/

# 3. Verify no build errors
npm run check
```

### Deployment
1. **Deploy code to production server** (Replit/cloud)
2. **Set production environment variables**:
   - `DATABASE_URL` (production database)
   - `AI_INTEGRATIONS_OPENAI_API_KEY` (GPT-4 API key)
   - `SESSION_SECRET` (random string, 32+ chars)
3. **Run migrations** (if any schema changes)
4. **Restart production server**

### Post-Deployment Smoke Tests (Production)
- [ ] Visit production URL: `https://opsly.com/privacy`
  - [ ] Page loads without errors
  - [ ] Styling matches design system
  - [ ] Links functional

- [ ] Visit production URL: `https://opsly.com/terms`
  - [ ] Page loads without errors
  - [ ] Styling matches design system
  - [ ] Links functional

- [ ] Test signup flow on production:
  - [ ] Navigate to `/auth/signup`
  - [ ] Form loads correctly
  - [ ] Consent checkbox works (unchecked = disabled, checked = enabled)
  - [ ] Submit creates account successfully
  - [ ] Check email verification (if enabled)

- [ ] Test data export on production:
  - [ ] Navigate to Settings
  - [ ] Click "Export my data"
  - [ ] CSV downloads successfully
  - [ ] Data format correct (intakes, blueprints, configs, runs, members)

- [ ] Verify no console errors in production browser
  - [ ] Open DevTools
  - [ ] No red error messages
  - [ ] No HMR WebSocket warnings

---

## Phase 3: Customer Onboarding (Post-Deployment)

### Pre-Call Preparation
- [ ] Create customer onboarding runbook
  - [ ] Common issues and solutions
  - [ ] How to submit intake
  - [ ] How to view blueprint
  - [ ] How to configure automation
  - [ ] Support contact information

- [ ] Set expectations document
  - [ ] 30-day trial terms
  - [ ] Demo integrations (real ones in Q2)
  - [ ] Support SLA (4-hour response, business hours)
  - [ ] Data security and GDPR compliance

### Onboarding Call (60-120 minutes)
1. **Welcome & Setup** (15 min)
   - Confirm account creation and access
   - Verify they can log in
   - Show sidebar navigation

2. **Core Workflow Demo** (45 min)
   - Walk through: Intake → Blueprint → Automation → ROI
   - Live demo of intake form
   - Show blueprint generation from their real use case
   - Demo automation configuration (email_task_triage or lead_followup)
   - Show runs and results

3. **Expectations Setting** (20 min)
   - "Integrations are currently demo/simulated"
   - "Real email/Slack/CRM integration in Q2"
   - "We support you, but expect occasional bugs"
   - "4-hour response during business hours"
   - "Data security: GDPR compliant, encrypted in transit"

4. **Q&A & Action Items** (15-20 min)
   - Answer customer questions
   - Set expectations on first tasks
   - Confirm support contact method (email/Slack)
   - Schedule 1-week check-in call

---

## Phase 4: 30-Day Monitoring

### Success Metrics
- [ ] **Support Load**: ≤ 2-3 calls total (not weekly)
- [ ] **Uptime**: 99%+ during business hours
- [ ] **Error Rate**: < 1% of API requests
- [ ] **Customer Satisfaction**: Qualitative feedback positive

### Daily Monitoring
- [ ] Check error logs (Sentry or equivalent)
- [ ] Monitor API response times
- [ ] Check database connection pool
- [ ] Monitor file upload storage (cleanup uploads dir)

### Weekly Check-Ins
- [ ] Email customer: "How's it going?"
- [ ] Note any feedback or feature requests
- [ ] Document issues encountered
- [ ] Update runbook based on support tickets

### Post-Trial Analysis
- [ ] Document all support requests
- [ ] Collect customer feedback
- [ ] Identify most-used features
- [ ] Plan Q2 development priorities (integrations, new templates)
- [ ] Decide: extend trial, close, convert to paid plan

---

## Risk Assessment & Mitigations

### Known Risks
1. **Data loss on account deletion**
   - No recovery after deletion confirmation
   - Mitigation: Clear UI warning, confirmation string required

2. **Demo mode confusion**
   - Customers might expect real integrations
   - Mitigation: Clear messaging on template cards, Terms document, onboarding call

3. **GDPR compliance not verified by lawyer**
   - Legal counsel review pending
   - Mitigation: External legal review before launch

4. **No real integrations yet**
   - Customer can't actually send emails/create CRM tasks
   - Mitigation: Honest Terms of Service, demo badges, onboarding expectations

5. **30-day trial pressure**
   - Customer might need more time to evaluate
   - Mitigation: Plan for 30-day extension or convert to minimal paid plan

### Rollback Plan
If critical issues found in production:
1. Scale back traffic to staging environment
2. Revert latest code changes
3. Investigate root cause
4. Fix and test locally
5. Redeploy to production

---

## Sign-Off

### Pre-Launch Review
- [ ] **Technical Lead**: Code compiles, no errors, tests passing
- [ ] **Legal Counsel**: Privacy Policy and Terms approved for Dutch market
- [ ] **Product**: Feature set honest and complete for demo
- [ ] **Customer Success**: Runbook prepared, support ready

### Actual Sign-Off
- [ ] Legal approval received
- [ ] Production deployment successful
- [ ] Smoke tests pass on production
- [ ] Customer onboarding scheduled
- [ ] Support team briefed

---

## Files Reference

**Legal Documents** (For external counsel review):
- [client/src/pages/privacy.tsx](client/src/pages/privacy.tsx) - Privacy Policy
- [client/src/pages/terms.tsx](client/src/pages/terms.tsx) - Terms of Service

**Code Implementation**:
- [server/routes.ts](server/routes.ts) - Data export and account deletion APIs
- [server/storage.ts](server/storage.ts) - Database delete operations
- [client/src/pages/auth/signup.tsx](client/src/pages/auth/signup.tsx) - Consent checkbox
- [client/src/App.tsx](client/src/App.tsx) - Routing for privacy/terms pages
- [tests/e2e/signup-consent.spec.ts](tests/e2e/signup-consent.spec.ts) - Playwright e2e test

**Configuration**:
- [vite.config.ts](vite.config.ts) - HMR configuration
- [server/vite.ts](server/vite.ts) - Server-side Vite setup
- [server/websocket.ts](server/websocket.ts) - WebSocket server
- [playwright.config.ts](playwright.config.ts) - E2E test configuration

**Documentation**:
- [design_guidelines.md](design_guidelines.md) - Design system reference
- [FIRST_CUSTOMER_READY.md](FIRST_CUSTOMER_READY.md) - Original audit checklist
- [CHANGELOG-FIRST-CUSTOMER.md](CHANGELOG-FIRST-CUSTOMER.md) - Change log

---

## Next Actions

**Immediate (Next 24 hours)**:
1. [ ] Export Privacy and Terms documents for external counsel
2. [ ] Schedule legal review with counsel (target: 24-48 hour turnaround)
3. [ ] Prepare production deployment checklist

**Upon Legal Approval**:
1. [ ] Deploy to production
2. [ ] Run smoke tests
3. [ ] Schedule customer onboarding call
4. [ ] Brief support team

**Week 1**:
1. [ ] Customer onboarding call
2. [ ] 1-week check-in call scheduled
3. [ ] Monitor logs daily

---

**Last Updated**: 2026-02-02  
**Next Review**: Upon legal approval or 48 hours (whichever is sooner)
