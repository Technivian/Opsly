import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Zap, BarChart3, GitBranch, Clock, Target, Shield } from "lucide-react";

export default function Landing() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Ops Copilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover-elevate px-2 py-1 rounded-md">Features</a>
            <a href="#how-it-works" className="hover-elevate px-2 py-1 rounded-md">How It Works</a>
            <a href="#benefits" className="hover-elevate px-2 py-1 rounded-md">Benefits</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/api/login">
              <Button variant="outline" disabled={isLoading} data-testid="button-login">
                Sign In
              </Button>
            </a>
            <a href="/api/login">
              <Button disabled={isLoading} data-testid="button-get-started">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  AI-Powered Operations
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
                  Transform Your Operations with{" "}
                  <span className="text-primary">AI-Driven Automation</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Ops Copilot analyzes your workflows, identifies bottlenecks, and generates 
                  actionable automation blueprints. Save hours every week with intelligent process optimization.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/api/login">
                    <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-start">
                      Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-demo">
                    Watch Demo
                  </Button>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-chart-3" />
                    <span>Free forever plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-chart-3" />
                    <span>5 min setup</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-chart-2/20 to-chart-3/20 rounded-2xl blur-3xl" />
                <Card className="relative border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-chart-3" />
                      </div>
                      <div>
                        <p className="font-medium">ROI Dashboard</p>
                        <p className="text-sm text-muted-foreground">Real-time savings tracker</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-chart-3">127</p>
                        <p className="text-xs text-muted-foreground">Hours Saved</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-chart-2">42%</p>
                        <p className="text-xs text-muted-foreground">Faster Cycles</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">89</p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-chart-3" />
                        <span className="text-muted-foreground">Email Triage automated 234 tasks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-chart-2" />
                        <span className="text-muted-foreground">Lead Follow-up queued 89 messages</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need to Optimize Operations</h2>
              <p className="text-muted-foreground">
                From intake to automation, Ops Copilot guides you through the entire process improvement journey.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Guided Intake Wizard</h3>
                  <p className="text-sm text-muted-foreground">
                    Answer simple questions about your pain points and current tools. Upload relevant documents for deeper analysis.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <GitBranch className="w-6 h-6 text-chart-2" />
                  </div>
                  <h3 className="font-semibold text-lg">AI Process Blueprints</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a structured process map with identified bottlenecks and a prioritized automation backlog.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-chart-3" />
                  </div>
                  <h3 className="font-semibold text-lg">Ready-to-Use Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure and run pre-built automation templates for email triage, lead follow-up, and more.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-chart-4" />
                  </div>
                  <h3 className="font-semibold text-lg">ROI Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Track hours saved, cycle time improvements, and automation confidence scores in real-time.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-chart-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Run Logs & History</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor automation runs with detailed logs. Track what was processed and any exceptions.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Invite team members, manage roles, and collaborate on process improvements together.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Four simple steps from pain point to automated solution.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Complete Intake", desc: "Tell us about your operational challenges and upload relevant files." },
                { step: 2, title: "Get Blueprint", desc: "AI analyzes your input and generates a process blueprint with recommendations." },
                { step: 3, title: "Configure & Run", desc: "Set up automation templates and run them on your workflows." },
                { step: 4, title: "Track ROI", desc: "Monitor time saved and efficiency gains on your dashboard." },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="text-6xl font-bold text-muted/50 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Operations?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join hundreds of SMBs who have streamlined their workflows with Ops Copilot. 
              No credit card required to start.
            </p>
            <a href="/api/login">
              <Button size="lg" variant="secondary" data-testid="button-cta-final">
                Get Started for Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Ops Copilot</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Ops Copilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
