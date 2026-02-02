# Customer Onboarding Runbook - Opsly First Customer

**Audience**: Customer Success / Founder  
**Customer**: Dutch SME (30-day trial)  
**Timeline**: 2-hour onboarding call + 1-week follow-up  
**Goal**: "Could they use Opsly for 30 days without calling us weekly?"

---

## Pre-Onboarding (24 hours before call)

### Preparation Checklist
- [ ] Customer account created and verified
- [ ] Email confirmation sent
- [ ] Customer can log in to dashboard
- [ ] Dashboard loads without errors
- [ ] Sample data visible (if demo mode)
- [ ] Slack channel created: #[customer-name]-support
- [ ] Email thread started with customer
- [ ] Calendar invite sent (confirm 2 hours)

### Materials Prepared
- [ ] Screen recording of intake → blueprint flow (backup if demo fails)
- [ ] Runbook PDF (printed or shared screen-ready)
- [ ] Support contact info (email, Slack, phone)
- [ ] 30-day trial agreement (for reference)
- [ ] Q2 2026 roadmap (for expectations setting)

### Technical Check (30 min before call)
```bash
# Verify production is healthy
curl https://opsly.com/api/health
# Should return 200 OK

# Verify customer can log in
# (Test with customer account)

# Verify AI blueprint generation works
# (Test with sample intake data)

# Check error logs
tail -f /var/log/opsly/production.log | grep ERROR
# Should be quiet
```

---

## Onboarding Call Flow (120 minutes)

### Phase 1: Welcome & Orientation (15 minutes)

**Your Opening**:
> "Hi [Name], thanks for choosing Opsly! Today we'll walk through how the platform works. You'll see how to submit an intake, generate a blueprint, and configure an automation. Questions anytime."

**Agenda**:
1. How Opsly works (3 min)
2. Live demo: Intake → Blueprint (10 min)
3. (Break for questions)

**Key Points to Cover**:
- Opsly is an intake → AI blueprint → automation tool
- You describe your operational problem
- We analyze it with AI (GPT-4)
- You get a process map and automation suggestions
- You can configure automations to run (but they're demo for now)

**Opsly Honest Positioning**:
- ✅ **What works**: Intake, blueprint generation, automation configuration
- ❌ **What doesn't work yet**: Real email/Slack/CRM integrations (Q2 2026)
- ✅ **What you can do**: Evaluate the process, plan for real automation later
- ❌ **What you can't do**: Actually send emails or create CRM tasks yet

**Set Expectations**:
- This is a demo/evaluation product
- Real integrations come in Q2 2026
- We support you, but expect occasional bugs
- 30-day trial = long evaluation period
- After 30 days: convert to paid, extend trial, or cancel

---

### Phase 2: Live Demo - Intake Submission (30 minutes)

**What You'll Show**:
1. Landing page → "Dashboard" navigation
2. Dashboard → "Intakes" section
3. Click "New Intake" button
4. Fill out intake form with their real use case (or sample)

**Intake Form Walkthrough**:

```
Title: (E.g., "Lead Follow-up Process")
Pain Area: Sales / Support / Finance / Ops (pick their main one)

Problem Description: 
  "We manually follow up with leads in Salesforce. 
   Takes 2+ hours/day. Inconsistent timing."

Current Tools: (Checkboxes)
  ☑ CRM (Salesforce / HubSpot / Pipedrive)
  ☑ Email (Gmail / Outlook)
  ☑ Other: Slack, Calendly

Volume Metrics:
  Leads per week: 50
  Emails per day: 200
  Tickets per day: 30
  Invoices per month: 100
```

**After Submission**:
- Show status: "Processing..." (AI generating blueprint)
- Wait for completion (takes 10-30 seconds)
- Show generated blueprint:
  - Process steps (e.g., "Lead intake → Qualification → Discovery call → Proposal → Follow-up")
  - Bottlenecks (e.g., "Manual data entry", "Inconsistent follow-up timing")
  - Backlog items (automation suggestions with effort & impact scores)

**Key Messaging**:
> "This blueprint came from AI analyzing your intake. It identifies your exact bottlenecks and suggests automations. These are recommendations, not constraints. You decide which ones matter."

---

### Phase 3: Live Demo - Automation Configuration (30 minutes)

**Scenario**: Configure the "Lead Follow-up" automation

**Navigation**:
1. Dashboard → "Automations"
2. Show "Available Templates" section
3. Click "Lead Follow-up" template
4. Point out "Demo Mode" badge (important!)
5. Click "Configure" button

**Configuration Flow**:

```
Lead Follow-up Configuration

CRM System: (dropdown)
  Select: Salesforce / HubSpot / Pipedrive
  
Follow-up Delay (days):
  Default: 2 days
  (Can adjust)

Message Template:
  Default: "Hi {{firstName}}, following up on your inquiry..."
  (Can customize)

Auto-send Messages:
  ☐ (Currently unchecked)
  
  ⚠️ IMPORTANT: "Currently runs in demo mode 
  with simulated data. Real integrations coming soon."
```

**Important Point**:
> "You can configure this automation fully. However, it won't actually send emails yet—we're simulating the execution. In Q2 2026, we'll connect to real Gmail/Outlook/Slack and it'll work live. For now, you're evaluating the logic and workflow."

**Show Results (if possible)**:
- Click "Create Configuration"
- Click "Run Now" (if available)
- Show simulated run results
- Show run logs (simulated execution)

**Set Expectations**:
> "You see how this automation would work with real data. Today, the results are simulated. But the workflow, configuration, and evaluation are real. You're testing if this automation makes sense for your business."

---

### Phase 4: ROI & Analytics View (15 minutes)

**What to Show**:
1. Dashboard → "ROI Dashboard"
2. Show metrics:
   - Hours saved (currently 0 = demo only)
   - Successful runs
   - Failed runs
   - Breakdown by automation

**Messaging**:
> "Once we have real integrations, this dashboard will show the actual impact. For now, it's empty since we're simulating. But imagine: you'd see that your lead follow-up automation saved 4 hours/week, with 95% success rate. That's what the ROI dashboard will display."

---

### Phase 5: Expectations & Timeline (20 minutes)

**Very Important**: Align expectations before they leave the call.

**Current Product (Feb 2026)**:
```
✅ What Works (30-day trial):
   - Intake submission
   - Blueprint generation (AI-powered)
   - Automation configuration UI
   - ROI dashboard (read-only)
   - Data export (CSV)
   - Account management

❌ What Doesn't Work Yet (Coming Q2 2026):
   - Email integration (Gmail, Outlook)
   - CRM sync (Salesforce, HubSpot, Pipedrive)
   - Slack notifications
   - Real automation execution (not simulated)
   - Exact Online / AFAS accounting integration
```

**30-Day Trial Terms**:
- No cost
- Full access to all features
- Simulated/demo automations only
- At end: convert to paid, extend trial, or cancel
- No credit card required to start
- Cancellation: Email us anytime

**Q2 2026 Roadmap** (Honest):
- Real email integration (Gmail/Outlook)
- Real CRM sync (Salesforce/HubSpot)
- Real Slack notifications
- Webhook-based automation execution
- Enhanced analytics

**Post-Trial Options** (Future):
- Starter Plan: $99/month (3 active automations)
- Pro Plan: $299/month (unlimited automations)
- Enterprise: Custom pricing
- (Exact pricing TBD)

**Support SLA** (Set Realistic):
- Email response: 4 hours (business hours)
- Slack channel: #[customer-name]-support (check daily)
- Bug fixes: 24 hours for critical, 1 week for minor
- Feature requests: Documented, prioritized quarterly
- Emergency: Call [your phone] during business hours

---

### Phase 6: Q&A & Action Items (10 minutes)

**Ask**:
> "What questions do you have?"

**Common Questions & Answers**:

**Q: When will email integration be ready?**  
A: "Q2 2026, probably April-June. We're prioritizing Salesforce/HubSpot first based on customer demand."

**Q: Can you export my data?**  
A: "Yes, absolutely. You can download a CSV of all your data anytime via Settings → Data Export. GDPR right-to-data-portability."

**Q: What if I delete my account?**  
A: "We permanently delete all your data within 30 days. You can request deletion anytime, and it's immediate in our system (right-to-erasure)."

**Q: Is my data secure?**  
A: "Yes. Encrypted in transit (HTTPS). Stored in EU PostgreSQL database. No third parties access your data except OpenAI for blueprint generation (with privacy policy disclosure)."

**Q: What if the automation breaks?**  
A: "In demo mode, it's simulated so no real damage. Once real integrations exist, we have rollback procedures and support."

**Q: Can I cancel anytime?**  
A: "Yes. 30-day trial ends [DATE]. You can cancel anytime before then with no penalty."

**Set Action Items**:
1. [ ] You submit your first intake this week
2. [ ] I'll review your blueprint and provide feedback
3. [ ] You configure 1-2 automations
4. [ ] We schedule 1-week check-in call (day [X])
5. [ ] You're our design partner for Q2 roadmap feedback

---

## After the Call (24 hours)

### Send Follow-Up Email
```
Subject: Opsly Onboarding - Next Steps

Hi [Name],

Thanks for joining! Here's what we covered:

✅ Intake → Blueprint → Automation workflow
✅ Live demo of blueprint generation
✅ Configuration of Lead Follow-up automation
✅ 30-day trial terms and Q2 roadmap
✅ Support contact: email / Slack / [phone]

YOUR ACTION ITEMS (by [DATE]):
1. Submit your first intake (https://opsly.com/intakes)
2. Review the generated blueprint
3. Configure one automation
4. Reply with feedback

MY ACTION ITEMS:
1. Review your intake blueprint (within 24 hours)
2. Provide optimization suggestions
3. Scheduled 1-week check-in call (see calendar)

Support:
- Email: support@opsly.com (4-hour response)
- Slack: #[customer-name]-support (daily check)
- Phone: [your number] (emergency only)

Questions? Reply to this email or ping Slack.

Thanks,
[Your Name]
Opsly
```

### Set 1-Week Check-In
- [ ] Calendar invite sent (30 minutes)
- [ ] Agenda: Review their intake/blueprint, discuss automation progress
- [ ] Reminder email sent 24 hours before

### Log Customer Feedback
- [ ] Which features interested them most?
- [ ] Any pain points with the UI?
- [ ] Integrations they want (for Q2 planning)?
- [ ] Likely to convert post-trial?

---

## Week 1-2: Active Support

### Daily Checklist
- [ ] Check Slack #[customer-name]-support for messages
- [ ] Check email for support requests
- [ ] Monitor error logs for their account
- [ ] Verify they've submitted intake (if not, send reminder)

### Proactive Outreach
**Day 2**: "Did you get a chance to try the intake yet? Happy to help if you have questions."  
**Day 5**: "Your blueprint is ready! Check it out and let me know what you think."  
**Day 7**: "1-week check-in call tomorrow at [TIME]. Excited to see how it's going!"

### Issue Resolution
If they encounter bugs:
1. Gather details: What they tried, what happened, error message
2. Reproduce locally
3. Fix in code or provide workaround
4. Deploy fix (if applicable)
5. Verify they can proceed

---

## Week 2-4: Regular Check-Ins

### Weekly Check-In Call (30 minutes)
- [ ] Schedule standing call (e.g., every Friday 10am CET)
- [ ] Review progress:
  - Intakes submitted: __
  - Blueprints generated: __
  - Automations configured: __
  - Issues encountered: __
  - Feedback for Q2: __

### Monitor Key Metrics
```
Week 1: Adoption
  - Intakes submitted: 1+
  - Blueprints generated: 1+
  - Automations configured: 1+
  - Success: Yes / No

Week 2: Engagement
  - Regular logins: 3+ per week
  - Feature exploration: Tried most major features
  - Support tickets: 0-2 (typical)
  - Sentiment: Positive / Neutral / Negative

Week 3: Expansion
  - Additional intakes: 2+
  - Exploring all templates: Yes / No
  - Q2 integration interest: High / Medium / Low

Week 4: Evaluation
  - Overall satisfaction: High / Medium / Low
  - Likely to convert post-trial: Yes / Maybe / No
  - Primary use case: [identified]
  - Feature requests: [documented]
```

### Keep Them Engaged
- [ ] Share your Q2 roadmap progress (if public)
- [ ] Ask for feedback on specific features
- [ ] Invite to product beta testing (future)
- [ ] Highlight success metrics from their usage

---

## 30-Day Trial Conclusion

### Week 4: Conversion Conversation

**Email** (Day 25):
```
Subject: What's Next for Opsly? (Your 30-day trial ends Feb 25)

Hi [Name],

Your 30-day trial with Opsly ends in 5 days. Time to decide what's next!

OPTIONS:
1. ✅ Keep Going: Convert to free tier (limited automations)
2. ⏱️ Extend Trial: Get another 30 days to evaluate further
3. 💰 Go Pro: Subscribe to Starter plan ($99/month) for full access
4. ❌ Cancel: No problem! Your data is yours (export anytime)

Here's your impact so far:
- Intakes submitted: __
- Blueprints generated: __
- Time saved (estimated): __

What are you thinking? Let's talk!

[Your Number]
Opsly
```

### Decision Outcomes

**If They Convert to Paid** ✅
- [ ] Send welcome email
- [ ] Set up billing
- [ ] Schedule monthly check-ins
- [ ] Prioritize their Q2 integration requests
- [ ] Case study opportunity?

**If They Extend Trial** 🔄
- [ ] Understand why
- [ ] Focus on unfinished evaluation areas
- [ ] Set concrete conversion criteria for week 8
- [ ] Plan demo of Q2 features

**If They Cancel** ❌
- [ ] Ask for feedback: "What was missing?"
- [ ] Keep in contact: "We're launching [feature] in Q2"
- [ ] Offer to reconnect: "Email us if you want to revisit"
- [ ] Document learnings: Improve next customer onboarding

---

## Common Issues & Solutions

### Issue: They Don't Submit First Intake
**Solution**: 
1. Day 3: Send email with screenshot guide
2. Day 5: Offer to submit intake together (screen share)
3. Day 7: Provide template: "Here's what a good intake looks like..."

### Issue: Confusion About Demo Status
**Solution**:
1. Reiterate: "Automations are simulated, not live"
2. Show: Run logs with "simulated" indicators
3. Confirm: "Q2 2026 for real integrations"
4. Check: "Does the workflow make sense regardless?"

### Issue: They Want Feature X
**Solution**:
1. Document: "I've added this to our Q2 roadmap"
2. Explain: "Here's why we're prioritizing [feature Y] first..."
3. Ask: "How important is [feature X] to your decision?"
4. Involve: "Would you beta test [feature X] when ready?"

### Issue: They Encounter a Bug
**Solution**:
1. **Immediate** (< 1 hour): Acknowledge and apologize
2. **Investigation** (< 2 hours): Understand root cause
3. **Workaround** (< 4 hours): Provide temporary solution or fix
4. **Fix** (next deploy): Push code fix to production
5. **Verification** (< 1 day): Confirm they can proceed
6. **Follow-up** (1 week): Check-in to ensure no recurrence

### Issue: They're Silent (No Activity)
**Solution**:
1. Day 10: "Haven't heard from you. Everything OK?"
2. Day 15: "We miss you! Questions on how to get started?"
3. Day 20: "Any blockers preventing you from trying Opsly?"
4. Day 25: "Your trial ends in 5 days. Let's chat before then."

---

## Success Definition

**Customer is succeeding if**:
- [ ] 1+ intake submitted by day 7
- [ ] Blueprint generated and reviewed by day 10
- [ ] 1+ automation configured by day 14
- [ ] Respond positively to "Would you recommend Opsly?" by day 28
- [ ] Willing to be case study / reference customer (bonus)

**You're succeeding if**:
- [ ] ≤ 2-3 total support calls (not weekly)
- [ ] No critical bugs found (or fixed within 1 day)
- [ ] Customer feels heard and supported
- [ ] Customer provides Q2 roadmap feedback
- [ ] Customer converts or extends trial

---

## Documentation & Scripts

### Presentation Slides (Use These)
1. **Welcome Slide**: "Opsly: Intake → Blueprint → Automation"
2. **How It Works**: Diagram showing user flow
3. **Demo Status**: "Demo Mode" + "Coming Q2 2026" badges
4. **Trial Terms**: Pricing (free), support, timeline
5. **Next Steps**: "Here's your onboarding plan"

### Email Templates (Copy-Paste)
- Welcome email (sent after account created)
- Post-call follow-up (sent same day)
- 1-week check-in reminder
- 30-day trial conclusion
- Conversion/extension/cancellation follow-up

### Runbook PDFs
- Print this runbook for reference during call
- Customer gets copy (optional)
- Shared via email for async reference

---

## Checklist for Onboarding Day

**30 Min Before**:
- [ ] Server health check (API responding)
- [ ] Test customer account login
- [ ] Test intake form submission
- [ ] Test blueprint generation
- [ ] Test automation configuration
- [ ] Clear calendar (no other meetings)
- [ ] Mute Slack notifications
- [ ] Have water/coffee ready
- [ ] Backup screen recording available
- [ ] Support contact info handy

**During Call**:
- [ ] Greet warmly and thank them
- [ ] Share screen and walk through demo
- [ ] Encourage questions throughout
- [ ] Take notes on their feedback
- [ ] Set expectations clearly
- [ ] Confirm next steps
- [ ] Get contact preference (email vs Slack)
- [ ] Send calendar invite for 1-week check-in

**After Call**:
- [ ] Send follow-up email within 2 hours
- [ ] Log call notes and feedback
- [ ] Add reminders for proactive check-ins
- [ ] Brief any support team on customer
- [ ] Monitor their account daily (week 1)

---

## Metrics to Track (Optional)

**Adoption**:
- Days to first intake: ___ (target: 3)
- Days to first blueprint: ___ (target: 3)
- Days to first automation config: ___ (target: 7)

**Engagement**:
- Logins per week: ___ (target: 3+)
- Features explored: ___ (target: 4/6)
- Support tickets: ___ (target: 0-2)

**Satisfaction**:
- NPS score: ___ (target: 7+/10)
- Willing to extend trial: Yes / No
- Willing to convert to paid: Yes / No
- Willing to be reference: Yes / No

---

**Version**: 1.0  
**Created**: 2 February 2026  
**Last Updated**: [Date]

---

## Sign-Off

- [ ] Materials printed and ready
- [ ] Presentation slides prepared
- [ ] Technical setup verified (dev server running)
- [ ] Support Slack channel created
- [ ] Email templates prepared
- [ ] Team briefed on customer name/background
- [ ] Calendar holds scheduled (onboarding + 1-week check-in)

**Onboarding Call Scheduled**: [Date/Time]  
**Customer**: [Name]  
**Your Name**: [Your Name]  
**Support Slack**: #[customer-name]-support
