import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Sparkles, BarChart3, GitBranch, Clock, Target, Shield, Layers } from "lucide-react";

export default function Landing() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Ops Copilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a href="#features" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/api/login">
              <Button variant="ghost" size="sm" disabled={isLoading} data-testid="button-login">
                Sign In
              </Button>
            </a>
            <a href="/api/login">
              <Button size="sm" disabled={isLoading} data-testid="button-get-started">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">AI-Powered Operations</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
                  Automate operations with intelligent blueprints
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Document your workflows, identify bottlenecks, and generate actionable automation plans. Built for teams who want to move fast.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a href="/api/login">
                    <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-start">
                      Get started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-demo">
                    See how it works
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                    <span>No credit card</span>
                  </div>
                </div>
              </div>
              <div className="relative lg:pl-8">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 via-chart-2/5 to-transparent rounded-3xl blur-2xl" />
                <Card className="relative">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="w-9 h-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-chart-3" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">ROI Dashboard</p>
                        <p className="text-xs text-muted-foreground">Real-time savings</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-xl font-semibold">127</p>
                        <p className="text-xs text-muted-foreground">Hours Saved</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-xl font-semibold text-chart-3">42%</p>
                        <p className="text-xs text-muted-foreground">Faster</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-xl font-semibold">89</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                        <span>Email Triage automated 234 tasks</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                        <span>Lead Follow-up queued 89 messages</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 border-t">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-12">
              <h2 className="text-2xl font-semibold mb-3">Everything you need</h2>
              <p className="text-muted-foreground">
                From intake to automation, a complete toolkit for process improvement.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-lg border bg-card hover-elevate">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium mb-1.5">Guided Intake</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Step-by-step wizard to document pain points and upload relevant files.
                </p>
              </div>
              <div className="p-5 rounded-lg border bg-card hover-elevate">
                <div className="w-9 h-9 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <GitBranch className="w-4 h-4 text-chart-2" />
                </div>
                <h3 className="font-medium mb-1.5">AI Blueprints</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Process maps with bottlenecks identified and prioritized backlog.
                </p>
              </div>
              <div className="p-5 rounded-lg border bg-card hover-elevate">
                <div className="w-9 h-9 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-4 h-4 text-chart-3" />
                </div>
                <h3 className="font-medium mb-1.5">Automation Templates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pre-built templates for email triage, lead follow-up, and more.
                </p>
              </div>
              <div className="p-5 rounded-lg border bg-card hover-elevate">
                <div className="w-9 h-9 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-4 h-4 text-chart-4" />
                </div>
                <h3 className="font-medium mb-1.5">ROI Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track hours saved and efficiency gains in real-time.
                </p>
              </div>
              <div className="p-5 rounded-lg border bg-card hover-elevate">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1.5">Run History</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detailed logs and execution history for every run.
                </p>
              </div>
              <div className="p-5 rounded-lg border bg-card hover-elevate">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1.5">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Invite members and manage roles across your organization.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 border-t">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-xl mb-12">
              <h2 className="text-2xl font-semibold mb-3">How it works</h2>
              <p className="text-muted-foreground">
                Four steps from problem to automated solution.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Document", desc: "Describe your challenges and upload relevant files." },
                { step: "02", title: "Analyze", desc: "AI generates a blueprint with bottlenecks identified." },
                { step: "03", title: "Configure", desc: "Set up automation templates for your workflows." },
                { step: "04", title: "Track", desc: "Monitor time saved and efficiency improvements." },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="text-xs font-mono text-muted-foreground mb-3">{item.step}</div>
                  <h3 className="font-medium mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-t">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-xl border bg-card">
              <div>
                <h2 className="text-xl font-semibold mb-2">Ready to get started?</h2>
                <p className="text-muted-foreground">
                  Start documenting processes and generating blueprints today.
                </p>
              </div>
              <a href="/api/login">
                <Button size="lg" data-testid="button-cta-final">
                  Get started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Ops Copilot</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Ops Copilot</p>
        </div>
      </footer>
    </div>
  );
}
