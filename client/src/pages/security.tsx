import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowLeft, Shield, Lock, Server, Globe, FileCheck, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SecuritySEO } from "@/components/seo";

const securityFeatures = [
  {
    icon: Lock,
    title: "Data Encryption",
    description: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your sensitive information never leaves our secure environment unprotected.",
  },
  {
    icon: Shield,
    title: "SOC 2 Compliance",
    description: "We follow SOC 2 Type II standards for security, availability, and confidentiality. Regular third-party audits ensure continuous compliance.",
    badge: "In Progress",
  },
  {
    icon: Server,
    title: "Data Isolation",
    description: "Each organization's data is logically isolated in our multi-tenant architecture. Strict access controls ensure no cross-tenant data leakage.",
  },
  {
    icon: Globe,
    title: "EU Data Residency",
    description: "For European customers, we offer data residency options ensuring your data never leaves EU jurisdiction, fully compliant with GDPR requirements.",
  },
  {
    icon: FileCheck,
    title: "GDPR Compliance",
    description: "Full compliance with General Data Protection Regulation. Right to access, portability, and deletion of your data. Data Processing Agreements available.",
  },
  {
    icon: Clock,
    title: "Data Retention",
    description: "Configurable data retention policies. By default, we retain active data for your subscription period plus 30 days. Deleted data is purged within 90 days.",
  },
];

const certifications = [
  { name: "GDPR", status: "Compliant" },
  { name: "SOC 2", status: "In Progress" },
  { name: "ISO 27001", status: "Planned" },
  { name: "HIPAA", status: "Planned" },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <SecuritySEO />
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Ops Copilot</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="/security" className="text-sm font-medium">Security</Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">Docs</Link>
            </nav>
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" data-testid="button-signin">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" data-testid="button-signup">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Security First</h1>
          <p className="text-lg text-muted-foreground">
            Your data security is our top priority. We implement industry-leading security measures to protect your information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {securityFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {feature.title}
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">{feature.badge}</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {certifications.map((cert) => (
                  <div key={cert.name} className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="font-medium">{cert.name}</p>
                    <Badge variant={cert.status === "Compliant" ? "default" : "secondary"} className="mt-2">
                      {cert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Have security questions or need a security assessment?
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:security@opscopilot.com">Contact Security Team</a>
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
