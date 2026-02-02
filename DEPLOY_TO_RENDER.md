# Deploy Opsly to Render

## Quick Start (15 minutes to production)

### 1. Push to GitHub

```bash
# Create GitHub repository at github.com/new
# Name: opsly (or your preferred name)
# Keep it private

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/opsly.git
git branch -M main
git push -u origin main
```

### 2. Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3. Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. **Name**: `opsly-db`
3. **Database**: `opsly`
4. **User**: `opsly`
5. **Region**: Frankfurt (or closest to your customers)
6. **Plan**: Free
7. Click **"Create Database"**
8. **⚠️ IMPORTANT**: Copy the **Internal Database URL** (starts with `postgresql://`)

### 4. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository (`opsly`)
3. Configure:
   - **Name**: `opsly-app`
   - **Region**: Frankfurt (same as database)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

### 5. Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Where to Get It |
|-----|-------|-----------------|
| `NODE_ENV` | `production` | (typed manually) |
| `PORT` | `10000` | (typed manually) |
| `HOST` | `0.0.0.0` | (typed manually) |
| `DATABASE_URL` | `postgresql://opsly:...` | From step 3 (Internal Database URL) |
| `SESSION_SECRET` | (generate it) | Run: `openssl rand -base64 32` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | `sk-proj-...` | Get from https://platform.openai.com/api-keys |

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy the key (starts with `sk-proj-` or `sk-`)

### 6. Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for initial build
3. Watch the logs for any errors

### 7. Migrate Database

Once deployed, run migration from Render Shell:

1. Go to your web service → **"Shell"** tab
2. Run:
```bash
npm run db:push
```

Expected output: `[✓] Changes applied`

### 8. Verify Deployment

Your app will be at: `https://opsly-app.onrender.com`

**Smoke Tests:**
```bash
# Health check
curl https://opsly-app.onrender.com/api/health

# Homepage
curl https://opsly-app.onrender.com/

# Database connection (should see login page)
open https://opsly-app.onrender.com/
```

---

## Free Tier Limits

✅ **What's Included (Free):**
- PostgreSQL: 256 MB storage, 1 GB RAM
- Web service: 512 MB RAM, 0.1 CPU
- Auto SSL certificate
- Custom domain support
- Auto-deploys from GitHub
- 750 hours/month (enough for 1 app 24/7)

⚠️ **Limitations:**
- **Sleeps after 15 min inactivity** (first request takes ~30 seconds to wake)
- Database connections limited (use connection pooling)
- No background workers on free tier

💡 **Prevent Sleep (Paid Plan Only):**
- Upgrade to $7/month Starter plan for always-on

---

## Custom Domain (Optional)

### Add Domain to Render:

1. Go to web service → **"Settings"** → **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `app.yourdomain.com`
4. Add DNS records at your domain provider:

```
Type: CNAME
Name: app
Value: opsly-app.onrender.com
```

5. Wait 5-60 minutes for DNS propagation
6. Render auto-provisions SSL certificate

---

## Monitoring Setup

### 1. Render Alerts (Built-in)

1. Go to web service → **"Settings"** → **"Alerts"**
2. Enable:
   - ✅ Deploy failures
   - ✅ Service down
3. Add email for notifications

### 2. UptimeRobot (Free External Monitoring)

1. Sign up at https://uptimerobot.com
2. **Add New Monitor**:
   - **Type**: HTTP(s)
   - **URL**: `https://opsly-app.onrender.com/api/health`
   - **Interval**: 5 minutes
   - **Alert Contacts**: Your email
3. Get SMS alerts when app is down

### 3. Sentry Error Tracking (Optional)

1. Sign up at https://sentry.io
2. Create project → Select "Express"
3. Copy DSN
4. Add to Render environment variables:
   ```
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```
5. See [server/index.ts](server/index.ts) - Sentry initialization already implemented

---

## Production Checklist

Before sharing with customer:

- [ ] Database migrated (`npm run db:push` in Shell)
- [ ] Health check returns 200: `https://opsly-app.onrender.com/api/health`
- [ ] Can sign up new account
- [ ] Privacy Policy accessible: `/privacy`
- [ ] Terms of Service accessible: `/terms`
- [ ] Demo automation runs successfully
- [ ] UptimeRobot monitoring configured
- [ ] Custom domain configured (if using)
- [ ] OpenAI API key has credits ($5+ balance)

---

## Troubleshooting

### Build Fails
```bash
# Check logs in Render dashboard
# Common issues:
# 1. Node version mismatch - add .nvmrc if needed
# 2. Missing dependencies - ensure package-lock.json is committed
```

### Database Connection Error
```bash
# Verify DATABASE_URL format:
# postgresql://user:password@host:port/database
# Must use Internal Database URL (not External)
```

### App Crashes on Start
```bash
# Check Render logs for errors
# Common issues:
# 1. SESSION_SECRET missing
# 2. PORT not set to 10000
# 3. HOST not set to 0.0.0.0
```

### Slow First Request
```
This is normal on free tier - app sleeps after 15 min inactivity.
First request wakes it up (~30 seconds).
Upgrade to paid plan for always-on.
```

---

## Upgrade to Paid (When Ready)

**Recommended for production customers:**

### Web Service ($7/month)
- ✅ Always-on (no sleep)
- 512 MB → 2 GB RAM
- Faster CPU
- Priority support

### Database ($7/month)
- 256 MB → 1 GB storage
- Better performance
- Automated backups

**Total: $14/month for production-ready infrastructure**

---

## Next Steps After Deployment

1. ✅ Test all features end-to-end
2. ✅ Create demo organization for customer
3. ✅ Schedule onboarding session (use [CUSTOMER_ONBOARDING_RUNBOOK.md](CUSTOMER_ONBOARDING_RUNBOOK.md))
4. ✅ Monitor for first 48 hours
5. ✅ Collect feedback during 30-day pilot

---

## Alternative: Deploy via render.yaml (Infrastructure as Code)

We've included `render.yaml` in the repo for one-click deployment:

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml`
5. Review services:
   - PostgreSQL database
   - Web service with auto-configured env vars
6. Click **"Apply"**
7. Add only `AI_INTEGRATIONS_OPENAI_API_KEY` manually

⚠️ **Note**: Blueprint deployment requires manual OpenAI key addition.

---

## Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Your Issues**: File issues in GitHub repo
