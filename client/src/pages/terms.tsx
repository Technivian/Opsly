import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ArrowLeft, Layers, FileText, AlertTriangle, Mail } from "lucide-react";

export default function Terms() {
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
              <span className="font-semibold tracking-tight">Opsly</span>
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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground text-sm mt-1">Last updated: February 2, 2026</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            These terms govern your use of Opsly. By using our service, you agree to these terms.
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing and using Opsly ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. You are responsible for reviewing these Terms regularly. Continued use of Opsly after modifications constitutes your acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>2. Use License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We grant you a limited, non-exclusive, non-transferable, revocable license to:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Access and use Opsly for legitimate business purposes</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Configure automations for your organization</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Store process data and automation configurations</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>View reports and ROI metrics</span></li>
              </ul>
              <div className="mt-4">
                <p className="text-foreground font-medium mb-2">You may NOT:</p>
                <ul className="space-y-2.5">
                  <li className="flex gap-2"><span className="text-destructive mt-1">×</span><span>Reverse engineer, decompile, or disassemble the Service</span></li>
                  <li className="flex gap-2"><span className="text-destructive mt-1">×</span><span>Attempt to gain unauthorized access to systems or networks</span></li>
                  <li className="flex gap-2"><span className="text-destructive mt-1">×</span><span>Use the Service for illegal purposes or in violation of laws</span></li>
                  <li className="flex gap-2"><span className="text-destructive mt-1">×</span><span>Transmit malware, viruses, or harmful code</span></li>
                  <li className="flex gap-2"><span className="text-destructive mt-1">×</span><span>Spam, phish, or attempt social engineering attacks</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                3. Feature Limitations (Current Beta Status)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-foreground font-medium">
                Opsly is currently in beta. Some features are simulated demos or placeholders:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">DEMO</Badge>
                  <div>
                    <p className="text-foreground font-medium text-sm">Email Task Triage</p>
                    <p className="text-sm">Uses simulated emails unless Gmail connected. Tasks are logged, not created in external tools.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">DEMO</Badge>
                  <div>
                    <p className="text-foreground font-medium text-sm">CRM Integrations</p>
                    <p className="text-sm">Salesforce, HubSpot, Pipedrive connections are simulated. No real CRM writes occur.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">DEMO</Badge>
                  <div>
                    <p className="text-foreground font-medium text-sm">Slack Notifications</p>
                    <p className="text-sm">Messages are logged in run outputs, not sent to actual Slack channels.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5">PLACEHOLDER</Badge>
                  <div>
                    <p className="text-foreground font-medium text-sm">Invoice Intake & Data Entry Templates</p>
                    <p className="text-sm">Template executors not yet implemented. Runs will fail.</p>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-4">
                We are transparent about these limitations. Live integrations and full functionality are coming in Q2 2026.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>4. Account & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You are responsible for:</p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Maintaining the confidentiality of your password</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>All activities that occur under your account</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Notifying us immediately of any unauthorized access</span></li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or pose security risks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>5. Pricing & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Free Tier:</strong> Currently available with limited features. We reserve the right to introduce paid tiers in the future.
              </p>
              <p>
                <strong className="text-foreground">Future Paid Plans:</strong> If you upgrade to a paid plan, you agree to pay the fees displayed at the time of purchase. Fees are billed monthly in EUR.
              </p>
              <p>
                <strong className="text-foreground">Refunds:</strong> No refunds for partial months. You may cancel anytime; access continues until the end of the billing period.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Our IP:</strong> Opsly owns all rights to the Service, including code, design, trademarks, and AI models. You may not copy, modify, or distribute our IP.
              </p>
              <p>
                <strong className="text-foreground">Your Data:</strong> You retain ownership of your process data, configurations, and files. By using Opsly, you grant us a license to process your data solely to provide the Service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>7. Disclaimers & Warranties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
                <p>We do not guarantee:</p>
                <ul className="space-y-2 mt-2">
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Uninterrupted or error-free service</span></li>
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Accuracy of AI-generated blueprints</span></li>
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Compatibility with all third-party tools</span></li>
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Specific ROI outcomes</span></li>
                </ul>
              </div>
              <p className="text-sm">
                AI-generated content (blueprints, automation suggestions) is advisory only. You are responsible for reviewing and validating automation logic before deployment.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
                <p className="font-medium text-foreground mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                <p>
                  Opsly and its affiliates shall not be liable for:
                </p>
                <ul className="space-y-2 mt-2">
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Indirect, incidental, or consequential damages</span></li>
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Loss of profits, data, or business opportunities</span></li>
                  <li className="flex gap-2"><span className="mt-1">•</span><span>Damages exceeding the lesser of $100 USD or amounts paid in the last 12 months</span></li>
                </ul>
              </div>
              <p className="text-sm">
                Some jurisdictions do not allow liability limitations, so the above may not apply to you.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>9. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You agree to indemnify and hold harmless Opsly from any claims, damages, or expenses arising from:
              </p>
              <ul className="space-y-2.5">
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Your use of the Service</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Your violation of these Terms</span></li>
                <li className="flex gap-2"><span className="text-primary mt-1">•</span><span>Your violation of third-party rights</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">By You:</strong> You may delete your account at any time via account settings. Data is retained per our Privacy Policy (30 days, then purged).
              </p>
              <p>
                <strong className="text-foreground">By Us:</strong> We may suspend or terminate your account if you violate these Terms, engage in abusive behavior, or for non-payment (if applicable).
              </p>
              <p className="text-sm mt-4">
                Upon termination, your license to use the Service ends immediately. Provisions that should survive (IP, liability, governing law) remain in effect.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>11. Governing Law & Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Governing Law:</strong> These Terms are governed by the laws of the Netherlands, without regard to conflict of law principles.
              </p>
              <p>
                <strong className="text-foreground">Jurisdiction:</strong> Any disputes shall be resolved in the courts of Amsterdam, Netherlands.
              </p>
              <p>
                <strong className="text-foreground">EU Online Dispute Resolution:</strong> EU consumers may use the EU ODR platform: <a href="https://ec.europa.eu/consumers/odr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>12. Changes to These Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update these Terms from time to time. We will notify you of material changes by email or prominent notice in the app.
              </p>
              <p>
                Continued use after modifications constitutes your acceptance. If you do not agree to the new Terms, you must stop using the Service.
              </p>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                13. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                For questions about these Terms or the Service:
              </p>
              <div className="bg-background border border-primary/20 rounded-lg p-4 space-y-2">
                <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@aurivian.nl" className="text-primary hover:underline">support@aurivian.nl</a></p>
                <p><strong className="text-foreground">Legal:</strong> <a href="mailto:legal@aurivian.nl" className="text-primary hover:underline">legal@aurivian.nl</a></p>
                <p><strong className="text-foreground">Company:</strong> Aurivian B.V., Netherlands</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 Aurivian B.V. All rights reserved. Opsly is a product of Aurivian B.V.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
