import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ArrowLeft, Layers, Shield, Mail } from "lucide-react";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight">Ops Copilot</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">{t('common.signIn')}</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">{t('common.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground text-sm mt-1">Last updated: February 2, 2026</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Your privacy matters. This policy explains how Opsly collects, uses, and protects your data in compliance with GDPR and Dutch law.
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Opsly ("we", "us", "our", or "Company") operates the Opsly platform ("Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
              <p>
                We use your data to provide and improve the Service. By using Opsly, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>2. Data Controller & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Opsly B.V.</strong> is the data controller responsible for your personal data. We are committed to GDPR compliance and respect your data rights.
              </p>
              <p>
                <strong className="text-foreground">Our Commitment:</strong> We process data only as necessary to provide the Service. We do not sell, rent, or lease your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>3. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">3.1 Information You Provide</h3>
                <ul className="space-y-2.5">
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Account Data:</strong> Email, password (hashed), first name, last name, phone number (optional)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Process Data:</strong> Business process descriptions, pain points, current tools, metrics</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Configuration Data:</strong> Automation configurations, process mappings, workflow definitions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">File Uploads:</strong> Process documentation, PDFs, spreadsheets (stored encrypted)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">3.2 Information Collected Automatically</h3>
                <ul className="space-y-2.5">
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Usage Data:</strong> Pages visited, features used, automations run, errors encountered</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Device Data:</strong> Browser type, OS, IP address (for security)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Session Data:</strong> Login times, session duration, authentication events</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">3.3 Third-Party Data</h3>
                <p>
                  We do NOT collect data from third-party services (Slack, Gmail, Salesforce) unless you explicitly authorize a connection. Even then, we only access data you request during automation execution.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>4. How We Use Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use collected data for:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Providing, maintaining, and improving the Service</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Processing and executing automations</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Generating AI blueprints for your processes</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Calculating ROI metrics and efficiency gains</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Communicating service updates, security alerts, policy changes</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Debugging issues and resolving support tickets</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Detecting fraud, abuse, and security incidents</span></li>
              </ul>
              <p className="mt-4">
                <strong className="text-foreground">Legal Basis (GDPR):</strong> Contract performance (service provision), legitimate interests (security, improvement), legal obligation (tax, fraud prevention).
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Active Account:</strong> Data retained while your account is active</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">After Deletion:</strong> User-facing data deleted within 30 days. Backups retained for 90 days</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Logs:</strong> Server logs retained for 30 days. Audit logs for 1 year</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We implement industry-standard security measures:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Encryption:</strong> HTTPS in transit, bcrypt password hashing, encrypted file storage</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Access Control:</strong> Role-based permissions, org-isolated data</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Authentication:</strong> Secure session tokens, 7-day TTL, httpOnly cookies</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Monitoring:</strong> Real-time error alerts, automated backups</span></li>
              </ul>
              <p className="mt-4 text-sm bg-muted/50 border border-border/50 rounded-lg p-3">
                <strong className="text-foreground">Limitation:</strong> No security is 100% guaranteed. While we take reasonable steps, we cannot guarantee absolute security. Keep your password confidential.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                7. Your Rights (GDPR & Data Protection)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You have the following rights under GDPR:</p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Access (Art. 15):</strong> Request a copy of your data via "Export Data" in settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Rectification (Art. 16):</strong> Correct inaccurate data in account settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Erasure (Art. 17):</strong> Delete your account via "Delete Account" in settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Data Portability (Art. 20):</strong> Export your data in CSV format</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Object (Art. 21):</strong> Opt out of specific processing</span>
                </li>
              </ul>
              <div className="bg-background border border-primary/20 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong className="text-foreground">To Exercise Your Rights:</strong> Use self-service options in your account settings, or email{" "}
                  <a href="mailto:privacy@opsly.io" className="text-primary hover:underline">privacy@opsly.io</a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>8. Data Sharing & Subprocessors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-foreground font-medium">
                We do NOT share your data with marketing companies, analytics providers, or advertisers.
              </p>
              <p>We may share data with:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Service Providers:</strong> Cloud infrastructure (Neon PostgreSQL), error tracking</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Legal Requirements:</strong> Law enforcement with court order or GDPR legal basis</span></li>
              </ul>
              <p className="mt-4">
                <strong className="text-foreground">Data Location:</strong> Data processed in EU with GDPR compliance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>9. Cookies & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use functional cookies only:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Session Cookie:</strong> Maintains your login session (httpOnly, secure)</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span><strong className="text-foreground">Preferences:</strong> Stores language, theme settings</span></li>
              </ul>
              <p className="mt-4 font-medium text-foreground">
                ✓ No tracking cookies. We do not use Google Analytics, Mixpanel, or third-party trackers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>10. Data Breach Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>If a security breach occurs involving your personal data, we will:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Notify you within 72 hours (GDPR requirement)</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Provide details: what was affected, what we're doing, who to contact</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Notify supervisory authorities if required by law</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>11. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or prominent notice in the app. Continued use after modifications constitutes acceptance.
              </p>
              <p>
                Check this page regularly for updates. The "Last updated" date at the top indicates the most recent revision.
              </p>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                12. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                For privacy-related questions, data requests, or concerns:
              </p>
              <div className="bg-background border border-primary/20 rounded-lg p-4 space-y-2">
                <p><strong className="text-foreground">Email:</strong> <a href="mailto:privacy@opsly.io" className="text-primary hover:underline">privacy@opsly.io</a></p>
                <p><strong className="text-foreground">Data Protection Officer:</strong> <a href="mailto:dpo@opsly.io" className="text-primary hover:underline">dpo@opsly.io</a></p>
                <p><strong className="text-foreground">Company:</strong> Opsly B.V., Netherlands</p>
              </div>
              <p className="text-sm mt-4">
                For security vulnerabilities, email <a href="mailto:security@opsly.io" className="text-primary hover:underline">security@opsly.io</a>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 Opsly B.V. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
