import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowLeft, BookOpen, Zap, HelpCircle, FileText, ArrowRight, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocsSEO } from "@/components/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const quickStartSteps = [
  {
    step: 1,
    title: "Create your account",
    description: "Sign up with your work email and create your organization. You can invite team members later.",
  },
  {
    step: 2,
    title: "Complete an intake",
    description: "Document a process you want to automate using our guided wizard. Describe the pain points, current tools, and volume metrics.",
  },
  {
    step: 3,
    title: "Review your blueprint",
    description: "Our AI analyzes your intake and generates a detailed blueprint with process maps, bottlenecks, and recommended automations.",
  },
  {
    step: 4,
    title: "Configure automation",
    description: "Choose an automation template and configure it for your specific needs. Connect your tools and set up triggers.",
  },
  {
    step: 5,
    title: "Run and monitor",
    description: "Execute your automation and track results in real-time. Monitor ROI and optimize based on performance data.",
  },
];

const faqs = [
  {
    question: "What types of processes can Ops Copilot automate?",
    answer: "Ops Copilot is designed for operational processes like email triage, lead follow-up, data entry, document processing, and workflow approvals. We focus on repetitive, rule-based tasks that consume significant time.",
  },
  {
    question: "How does the AI blueprint generation work?",
    answer: "When you submit an intake, our AI (powered by GPT-4) analyzes your process description, pain points, and current tools. It generates a structured blueprint with process steps, bottlenecks, and prioritized automation opportunities.",
  },
  {
    question: "Can I integrate with my existing tools?",
    answer: "Yes! Ops Copilot integrates with popular tools like Gmail, Slack, Salesforce, HubSpot, Asana, Jira, and more. We're constantly adding new integrations based on customer needs.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. Each organization's data is logically isolated, and we're GDPR compliant with EU data residency options available.",
  },
  {
    question: "How is pricing calculated?",
    answer: "Our Free tier includes basic features for individuals. Pro pricing is per organization per month with unlimited team members (up to 5) and runs. Enterprise pricing is custom based on your needs.",
  },
  {
    question: "Can I try before I buy?",
    answer: "Yes! We offer a free tier with limited features, and you can also try our interactive demo to explore the platform without creating an account.",
  },
];

const docSections = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Learn the basics and set up your first automation",
    href: "#quick-start",
  },
  {
    icon: BookOpen,
    title: "User Guide",
    description: "Detailed documentation for all features",
    href: "#",
    external: true,
  },
  {
    icon: FileText,
    title: "API Reference",
    description: "Integrate Ops Copilot with your systems",
    href: "#",
    external: true,
    comingSoon: true,
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Common questions and answers",
    href: "#faq",
  },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <DocsSEO />
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
              <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">Security</Link>
              <Link href="/docs" className="text-sm font-medium">Docs</Link>
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
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to get started with Ops Copilot and make the most of your automations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
          {docSections.map((section) => (
            <Card key={section.title} className="hover-elevate cursor-pointer">
              <a href={section.href}>
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {section.title}
                    {section.external && <ExternalLink className="w-3 h-3" />}
                    {section.comingSoon && (
                      <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">{section.description}</CardDescription>
                </CardHeader>
              </a>
            </Card>
          ))}
        </div>

        <div id="quick-start" className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6">Quick Start Guide</h2>
          <div className="space-y-4">
            {quickStartSteps.map((item) => (
              <Card key={item.step}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/auth/signup">
              <Button>
                Start Your First Automation <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div id="faq" className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="px-4 text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@opscopilot.com">Contact Support</a>
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
