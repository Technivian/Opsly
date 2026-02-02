# Production Deployment Checklist - Step-by-Step

**Date Started**: _____________  
**Deploying To**: _____________  
**Completed By**: _____________

---

## ✅ 1. Production Environment Configuration

### Database Setup
- [ ] PostgreSQL server provisioned (recommended: managed service like Railway, Supabase, or AWS RDS)
- [ ] Database created: `opsly_prod`
- [ ] Database user created with appropriate permissions
- [ ] Connection string tested: `psql $DATABASE_URL`
- [ ] Database backed up (if migrating from dev)

**Database Provider**: _________________ (e.g., Railway, Supabase, Render)  
**DATABASE_URL**: `postgresql://user:***@host:port/opsly_prod`

### Application Server
- [ ] Server provisioned (Node.js 18+ required)
- [ ] Domain name configured
- [ ] Firewall rules allow HTTP/HTTPS traffic
- [ ] SSH access configured

**Hosting Provider**: _________________ (e.g., Railway, Render, Fly.io, DigitalOcean)  
**Server IP/Domain**: _________________

### Environment Variables
- [ ] Create `.env` from `.env.production.example`
- [ ] Set `NODE_ENV=production`
- [ ] Set `DATABASE_URL` (from database setup above)
- [ ] Generate `SESSION_SECRET`: `openssl rand -base64 32`
- [ ] Set `AI_INTEGRATIONS_OPENAI_API_KEY` (from OpenAI account)
- [ ] Set `PORT` and `HOST` (default: 3000, 0.0.0.0)

**Command to generate session secret**:
```bash
openssl rand -base64 32
```

**OpenAI API Key**: Get from https://platform.openai.com/api-keys

---

## ✅ 2. Database Migration (isDemoRun column)

### Verify Schema is Up-to-Date
```bash
# On production server, after deploying code:
npm run db:push
```

**Expected output**: 
```
[✓] Changes applied
```

### Verify isDemoRun Column Exists
```bash
# Connect to production database
psql $DATABASE_URL

# Check schema
\d runs

# Should show:
# is_demo_run | boolean | not null | default false
```

- [ ] Schema pushed successfully
- [ ] `isDemoRun` column exists in `runs` table
- [ ] Default value is `false`

---

## ✅ 3. SSL Certificate Active

### Option A: Managed Hosting (Railway, Render, Vercel)
- [ ] Deploy to platform
- [ ] Platform auto-provisions SSL (usually automatic)
- [ ] Verify HTTPS works: `https://your-domain.com`

**Most platforms (Railway, Render, Fly.io) provide free SSL automatically.**

### Option B: Self-Hosted (DigitalOcean, AWS)
- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx`
- [ ] Run: `sudo certbot --nginx -d your-domain.com -d www.your-domain.com`
- [ ] Verify auto-renewal: `sudo certbot renew --dry-run`

### Option C: Cloudflare (Recommended for Any Hosting)
- [ ] Add domain to Cloudflare
- [ ] Point DNS to your server IP
- [ ] Enable "Full (Strict)" SSL mode
- [ ] Wait for DNS propagation (5-10 minutes)

**SSL Status**: 
- [ ] HTTPS enabled
- [ ] Certificate valid
- [ ] HTTP redirects to HTTPS

**Test**: Visit `https://your-domain.com` - should show 🔒 lock icon

---

## ✅ 4. Monitoring Setup (Recommended)

### Error Tracking: Sentry (Free Tier Available)
1. [ ] Sign up at https://sentry.io
2. [ ] Create new project: "Opsly Production"
3. [ ] Copy DSN: `https://abc123@o123.ingest.sentry.io/456`
4. [ ] Add to `.env`: `SENTRY_DSN=your-dsn-here`
5. [ ] Install: `npm install @sentry/node`
6. [ ] Add to `server/index.ts`:
```typescript
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
```

**Sentry DSN**: _________________ (or skip if not using)

### Uptime Monitoring: UptimeRobot (Free Tier Available)
1. [ ] Sign up at https://uptimerobot.com
2. [ ] Add monitor: `https://your-domain.com/api/health`
3. [ ] Set check interval: 5 minutes
4. [ ] Add alert email: _________________
5. [ ] Test alert: Temporarily stop server, verify email received

**UptimeRobot Status**: _________________ (or skip if not using)

### Simple Alternative: Healthchecks.io
1. [ ] Sign up at https://healthchecks.io (free)
2. [ ] Create check: "Opsly Production Health"
3. [ ] Get ping URL: `https://hc-ping.com/your-uuid`
4. [ ] Add cron job on server:
```bash
# Add to crontab (crontab -e)
*/5 * * * * curl -fsS https://hc-ping.com/your-uuid > /dev/null
```

**Healthchecks URL**: _________________ (or skip if not using)

---

## ✅ 5. Support Email/System Ready

### Email Setup (Choose One)

#### Option A: Simple Gmail Forwarding (Quick Start)
- [ ] Create Gmail: `support@your-domain.com` (or use existing)
- [ ] Set up forwarding to your personal email
- [ ] Add auto-reply: "Thanks! We'll respond within 4 hours during business hours."
- [ ] Test: Send email to `support@your-domain.com`, verify you receive it

**Support Email**: support@_________________.com

#### Option B: Help Desk Software (Recommended for Growth)
- [ ] Sign up for Zendesk, Intercom, or Help Scout (free trials available)
- [ ] Configure support email
- [ ] Set up auto-responses
- [ ] Add canned responses for common questions

**Help Desk**: _________________ (or skip if using Gmail)

### Support Documentation
- [ ] Create internal support doc with common issues:
  - "User can't log in" → Check email, reset password
  - "Automation failed" → Check run logs, verify connections
  - "ROI numbers seem wrong" → Explain demo runs excluded
  - "How do I...?" → Point to docs page

**Support SLA**: 4-hour response time during business hours (9 AM - 6 PM CET)

### Emergency Contact
- [ ] Designate on-call person for critical issues
- [ ] Set up phone alerts for downtime (via UptimeRobot)

**On-Call**: _________________ (name + phone)

---

## ✅ 6. Customer Onboarding Scheduled

### Pre-Onboarding Preparation
- [ ] Review CUSTOMER_ONBOARDING_RUNBOOK.md (500+ lines, 2-hour script)
- [ ] Prepare demo account with sample data
- [ ] Test full flow: Signup → Intake → Blueprint → Automation → ROI
- [ ] Prepare answers to FAQs

### Schedule Session
- [ ] Calendar invite sent to customer
- [ ] Date/Time: _________________
- [ ] Duration: 2 hours
- [ ] Video call link: _________________ (Zoom, Google Meet, etc.)
- [ ] Backup date scheduled (in case of reschedule)

### Session Agenda (From Runbook)
1. **Intro & Expectations** (15 min)
   - "Most features are demo mode, real integrations coming Q2"
   - "All automation is manual trigger for safety"
   - "ROI numbers are estimates based on benchmarks"

2. **Live Walkthrough** (45 min)
   - Create intake together
   - Review generated blueprint
   - Configure first automation
   - Run demo automation
   - Review logs and ROI

3. **Hands-On Practice** (45 min)
   - Customer creates their own intake
   - Customer configures automation
   - Customer interprets results

4. **Support & Next Steps** (15 min)
   - How to contact support
   - What to expect in 30-day pilot
   - Success criteria

**Onboarding Date**: _________________  
**Customer Name**: _________________  
**Customer Email**: _________________

---

## Post-Deployment Verification

### Smoke Tests (Run Immediately After Deploy)

#### 1. Health Check
```bash
curl https://your-domain.com/api/health
# Expected: {"status":"ok"}
```
- [ ] Health endpoint responds

#### 2. Homepage Loads
- [ ] Visit `https://your-domain.com`
- [ ] No console errors
- [ ] Styling loads correctly

#### 3. Signup Flow
- [ ] Create test account: `test@example.com`
- [ ] Consent checkbox required
- [ ] Privacy/Terms links work
- [ ] Account created successfully
- [ ] Redirects to dashboard

#### 4. Privacy & Terms Pages
- [ ] Visit `https://your-domain.com/privacy`
- [ ] Privacy policy displays correctly
- [ ] Visit `https://your-domain.com/terms`
- [ ] Terms display correctly

#### 5. Demo Automation Run
- [ ] Navigate to Automations
- [ ] Configure demo template
- [ ] Run automation
- [ ] Check logs show demo warnings
- [ ] Run table shows "DEMO" badge
- [ ] Check `/api/roi` - demo run NOT counted

#### 6. Database Verification
```bash
psql $DATABASE_URL

-- Verify demo run exclusion
SELECT isDemoRun, status, COUNT(*) FROM runs GROUP BY isDemoRun, status;

-- Should show:
-- isDemoRun | status  | count
-- -----------+---------+-------
-- t          | SUCCESS | 1     (demo runs)
-- f          | ...     | 0     (real runs - none yet)
```
- [ ] Database queries work
- [ ] isDemoRun column exists and populates correctly

---

## Rollback Plan (If Critical Issues Found)

### Within 30 Minutes of Deploy

1. **Identify Issue**
   - Check Sentry for errors
   - Check server logs: `pm2 logs` or `journalctl -u opsly`
   - Check UptimeRobot alerts

2. **Decision Point**
   - **Minor issue** (cosmetic, non-blocking): Document and fix post-deploy
   - **Major issue** (auth broken, data loss, crashes): ROLLBACK

3. **Rollback Procedure**
```bash
# Stop current deployment
pm2 stop opsly

# Restore previous version
cd /var/www/opsly
git checkout <previous-commit-hash>
npm ci --production
npm run build

# Restore database (if schema changed)
psql $DATABASE_URL < opsly_prod_backup_<timestamp>.sql

# Restart
pm2 start opsly
```

4. **Verify Rollback**
   - [ ] Health check passes
   - [ ] Homepage loads
   - [ ] User can log in
   - [ ] No console errors

5. **Post-Mortem**
   - Document what went wrong
   - Fix in dev environment
   - Test fix thoroughly
   - Re-deploy when ready

---

## Final Checklist Summary

Before marking deployment complete:

- [ ] ✅ Production environment configured (server, database, env vars)
- [ ] ✅ Database migrated (isDemoRun column verified)
- [ ] ✅ SSL certificate active (HTTPS working)
- [ ] ✅ Monitoring setup (Sentry + UptimeRobot OR alternative)
- [ ] ✅ Support email/system ready (tested and responding)
- [ ] ✅ Customer onboarding scheduled (date confirmed)
- [ ] ✅ All smoke tests passed
- [ ] ✅ Rollback plan tested (know how to revert if needed)

**Deployment Status**: 
- [ ] IN PROGRESS
- [ ] COMPLETE ✅
- [ ] ROLLED BACK (see post-mortem)

**Deployed By**: _________________  
**Deployment Date**: _________________  
**Production URL**: https://_________________

---

## Quick Command Reference

```bash
# Generate session secret
openssl rand -base64 32

# Database migration
npm run db:push

# Build for production
npm run build

# Start production server
npm run start

# Check logs (if using PM2)
pm2 logs opsly

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Test health endpoint
curl https://your-domain.com/api/health

# Check SSL certificate
curl -I https://your-domain.com
```

---

**Use this checklist during deployment to ensure nothing is missed. Check off items as you complete them.**
