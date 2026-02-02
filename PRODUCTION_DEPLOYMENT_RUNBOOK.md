# Production Deployment Runbook

**Product**: Opsly (Operations Automation SaaS)  
**Audience**: DevOps / Deployment Engineer  
**Timeline**: Execute after legal approval (February 2026)  
**Rollback**: Within 30 minutes if critical issues detected

---

## Pre-Deployment Checklist

### 1. Code & Build Verification
```bash
# Test build locally
npm run build

# Verify no TypeScript errors
npm run check

# Run e2e tests
npm run test:e2e
```

**Status**: Must show:
- ✅ Build succeeds with no errors
- ✅ TypeScript type checking passes
- ✅ All e2e tests pass (signup-consent.spec.ts)
- ✅ No console warnings or deprecations

### 2. Environment Configuration
Prepare production `.env` file with:
```
NODE_ENV=production
PORT=3000 (or your production port)
HOST=0.0.0.0 (or specific IP)

# Database
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/opsly_prod

# Sessions & Security
SESSION_SECRET=<random 32+ char string>

# AI Integration
AI_INTEGRATIONS_OPENAI_API_KEY=sk-<your-key>

# Optional: Analytics & Monitoring
SENTRY_DSN=<sentry-dsn-if-using>
LOG_LEVEL=info
```

### 3. Database Backup
```bash
# Create pre-deployment backup
pg_dump $DATABASE_URL > opsly_prod_backup_$(date +%Y%m%d_%H%M%S).sql

# Store backup securely
# (preferably in S3 or backup service)
```

### 4. Health Check Preparation
Before deploying, know:
- [ ] Production database is running and accessible
- [ ] OpenAI API key is valid
- [ ] TLS certificate is configured (if using HTTPS)
- [ ] Load balancer / reverse proxy is ready
- [ ] Log aggregation (Sentry, DataDog, etc.) is configured

---

## Deployment Steps

### Step 1: Deploy Code
```bash
# Option A: Git deploy (if using git-based deployment)
cd /var/www/opsly/production
git pull origin main
npm ci --production
npm run build

# Option B: Direct upload (if using FTP/SFTP)
# Upload dist/ folder to production server
# Upload package.json, package-lock.json
# Run: npm ci --production
```

### Step 2: Set Environment Variables
```bash
# Copy .env to production
cp .env.production /var/www/opsly/production/.env

# Verify critical vars are set
grep DATABASE_URL .env
grep SESSION_SECRET .env
grep OPENAI_API_KEY .env
```

### Step 3: Database Migration (if needed)
```bash
# Check for pending migrations
npx drizzle-kit status

# If migrations needed:
npx drizzle-kit migrate

# Verify schema matches code
npm run check
```

### Step 4: Start Production Server
```bash
# Option A: Node process manager (PM2)
pm2 start dist/index.cjs --name "opsly-prod" --instances 2 --exec-mode cluster

# Option B: Systemd service
systemctl start opsly-prod
systemctl status opsly-prod

# Option C: Docker container
docker pull opsly:latest
docker run -d --name opsly-prod \
  -p 3000:3000 \
  --env-file .env \
  -v /data/uploads:/app/uploads \
  opsly:latest
```

### Step 5: Verify Server Health
```bash
# Check if server is listening
curl http://localhost:3000/api/health || echo "Server not responding"

# Check for errors in logs
tail -f /var/log/opsly/production.log

# Verify database connection
curl http://localhost:3000/api/auth/user
# Should return: {"message":"Not authenticated"} (since not logged in)
```

---

## Post-Deployment Smoke Tests

### Test 1: Privacy Policy Page
```bash
# Access via browser or curl
curl https://opsly.com/privacy

# Verify:
- [ ] Status code: 200 OK
- [ ] Page loads (no 404/500 errors)
- [ ] Styling matches design system (inspect in browser)
- [ ] All sections visible:
  - Privacy Policy heading
  - Data Collection section
  - GDPR Rights section (with 7 sub-items)
  - Data Retention section
  - Data Security section
  - etc.
```

### Test 2: Terms of Service Page
```bash
# Access via browser or curl
curl https://opsly.com/terms

# Verify:
- [ ] Status code: 200 OK
- [ ] Page loads (no 404/500 errors)
- [ ] Styling matches design system
- [ ] All sections visible:
  - Terms of Service heading
  - Acceptance section
  - Feature Limitations (with DEMO/PLACEHOLDER badges)
  - Liability section
  - etc.
```

### Test 3: Signup Consent Flow
```bash
# Manual test in browser:
1. Navigate to https://opsly.com/auth/signup
2. Verify page loads without errors
3. Verify "I accept Terms and Privacy Policy" checkbox visible
4. Verify "Create account" button is DISABLED (grayed out) initially
5. Click checkbox
6. Verify "Create account" button is now ENABLED
7. Click "Terms of Service" link
   - Should open in new tab: https://opsly.com/terms?ref=signup
8. Click "Privacy Policy" link
   - Should open in new tab: https://opsly.com/privacy?ref=signup
9. Return to signup tab, verify form still has data
10. Fill form:
    - Email: test@example.com (or your test domain)
    - Password: TestPassword123
    - First Name: Test
    - Last Name: User
11. Click "Create account"
12. Verify:
    - Account created successfully
    - Logged in to dashboard
    - Email confirmation (if enabled) sent
```

### Test 4: API Health
```bash
# Test public endpoints
curl https://opsly.com/api/health

# Test authenticated endpoint
# (Need to get session cookie from signup test above)
curl -b "cookie.txt" https://opsly.com/api/auth/user
# Should return your user object

# Test data export endpoint
curl -X POST -b "cookie.txt" \
  https://opsly.com/api/account/data-export \
  -o opsly-export.csv

# Verify CSV was downloaded
file opsly-export.csv
# Should show: "CSV text"
```

### Test 5: Browser Console Check
```bash
1. Open Firefox/Chrome/Safari DevTools (F12)
2. Go to Console tab
3. Navigate through key pages:
   - https://opsly.com/
   - https://opsly.com/privacy
   - https://opsly.com/terms
   - https://opsly.com/auth/signup
   - https://opsly.com/dashboard
4. Verify NO red errors:
   - No WebSocket connection errors
   - No 404s for missing resources
   - No TypeScript/compilation errors
```

### Test 6: Performance Check
```bash
# Check API response times
time curl https://opsly.com/api/auth/user

# Should respond in < 500ms for cold start
# Should respond in < 100ms for warm cache

# Check page load time (using DevTools Network tab)
# Lighthouse score should be:
# - Performance: > 80
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

---

## Monitoring & Alerts (Post-Launch)

### Set Up Monitoring
1. **Uptime Monitoring**
   - Provider: UptimeRobot or equivalent
   - URL: https://opsly.com/api/health
   - Frequency: Every 5 minutes
   - Alert: Email if down for 5 minutes

2. **Error Logging**
   - Provider: Sentry (recommended)
   - Capture: All 4xx and 5xx errors
   - Alert: Slack #opsly-errors if error rate > 1%

3. **Database Monitoring**
   - Provider: PostgreSQL built-in or DataDog
   - Metrics: Connection count, query time, disk usage
   - Alert: Email if connection pool exhausted

4. **Application Performance**
   - Provider: New Relic or DataDog
   - Metrics: Request duration, throughput, CPU/memory
   - Alert: Slack if response time > 1 second for > 5% of requests

### Daily Checks (First Week)
```bash
# Check error logs
tail -f /var/log/opsly/production.log | grep ERROR

# Check database health
SELECT count(*) FROM users;
SELECT count(*) FROM orgs;
SELECT count(*) FROM intakes;

# Check disk usage
df -h /data/uploads

# Check SSL certificate expiration
openssl s_client -connect opsly.com:443 | grep "notAfter"
```

### Weekly Checks
```bash
# Database backup verification
ls -lh /data/backups/ | head -5

# Update dependencies
npm audit

# Check for security patches
npm update --save-dev
```

---

## Rollback Plan

### If Critical Issue Occurs
```bash
# 1. Stop production server
systemctl stop opsly-prod
# or
pm2 stop opsly-prod

# 2. Identify issue from logs
tail -n 100 /var/log/opsly/production.log | grep ERROR

# 3. Revert code to previous version
git revert HEAD
npm ci --production
npm run build

# 4. Restart server
systemctl start opsly-prod

# 5. Verify health
curl https://opsly.com/api/health

# 6. If database was affected, restore from backup
# (Should not happen if no schema migrations failed)
```

### Rollback Triggers
- [ ] > 5% of API requests returning 500 errors
- [ ] Database connection pool exhausted
- [ ] Memory usage > 90% for > 5 minutes
- [ ] CPU usage > 95% for > 5 minutes
- [ ] Privacy/Terms pages returning 500 errors
- [ ] Signup flow broken (unable to create accounts)

### Post-Rollback Checklist
- [ ] Run all smoke tests again
- [ ] Check error logs for root cause
- [ ] Update status page (if public)
- [ ] Notify customer (if deployed)
- [ ] Schedule post-mortem review
- [ ] Fix issue and re-test in staging
- [ ] Re-deploy with fix

---

## Customer Communication Template

### Pre-Deployment (24 hours before)
```
Subject: Scheduled Maintenance - Opsly Platform Upgrade

Hi [Customer Name],

We're upgrading Opsly on [DATE] at [TIME] (CET).
Expected downtime: < 5 minutes
What's new: Privacy/Terms pages, data export feature, account deletion

No action needed from you. Please contact us if you have questions.

Thanks,
Opsly Team
```

### Post-Deployment Success
```
Subject: Opsly Production Deployment - Complete ✅

Hi [Customer Name],

We've successfully deployed the latest Opsly features:
✅ Privacy Policy page (GDPR compliant)
✅ Terms of Service page
✅ Data export API
✅ Account deletion

No action needed. Enjoy your 30-day trial!

Questions? Email us or schedule a 1-week check-in call.

Thanks,
Opsly Team
```

### Post-Deployment Issue
```
Subject: Opsly Incident Report - [Issue Description]

Hi [Customer Name],

We experienced a brief issue with [COMPONENT] at [TIME].
Status: [RESOLVED / INVESTIGATING]
Impact: [AFFECTED FEATURES]
Duration: [X minutes]

We've [taken action / investigating]. Apologies for any inconvenience.

Next update: [TIME]
Status page: https://opsly.statuspage.io/

Thanks for your patience,
Opsly Team
```

---

## Sign-Off

### Deployment Sign-Off
- [ ] Code builds successfully: _________________ (engineer)
- [ ] Environment configured: __________________ (devops)
- [ ] Database backup created: _________________ (devops)
- [ ] All smoke tests pass: _____________________ (qa/engineer)
- [ ] Monitoring configured: ___________________ (devops)
- [ ] Legal approval received: _________________ (legal)
- [ ] Customer notified: ______________________ (customer success)

### Deployment Date & Time
- **Scheduled**: [Date/Time]
- **Completed**: [Date/Time]
- **Status**: [Success / Rollback / Issues]

### Issues Encountered (if any)
```
[Document any issues, fixes applied, and lessons learned]
```

---

## Appendix: Production Server Checklist

### Infrastructure
- [ ] Server OS: [Ubuntu 22.04 / CentOS / other]
- [ ] Node.js version: 18.x or 20.x LTS
- [ ] PostgreSQL version: 14+ recommended
- [ ] TLS certificate: Valid for opsly.com (expires: ______)
- [ ] Firewall rules: Only 80/443/3000 open
- [ ] SSH access: Configured for team

### Application
- [ ] dist/ folder exists and built
- [ ] node_modules/ installed (npm ci --production)
- [ ] package.json and package-lock.json present
- [ ] .env file configured with secrets
- [ ] uploads/ directory exists and writable
- [ ] logs/ directory exists and writable

### Database
- [ ] PostgreSQL running
- [ ] DATABASE_URL connects successfully
- [ ] Schema matches Drizzle definitions
- [ ] Backups configured and tested
- [ ] pg_restore can restore from backup

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error logging (Sentry) configured
- [ ] Log rotation configured
- [ ] Disk space monitoring in place
- [ ] Email alerts working

### Security
- [ ] TLS/HTTPS enabled
- [ ] SESSION_SECRET set (not default)
- [ ] API keys not committed to git
- [ ] Database password not in logs
- [ ] Rate limiting configured
- [ ] CORS properly configured

---

**Version**: 1.0  
**Last Updated**: 2 February 2026  
**Next Review**: Upon first production deployment
