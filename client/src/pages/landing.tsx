import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LandingSEO } from "@/components/seo";
import { ArrowRight, Sparkles, BarChart3, GitBranch, Clock, Target, Shield, Layers, Loader2, Zap, FileText, Settings, CheckCircle } from "lucide-react";

export default function Landing() {
  const { isLoading, startDemo, isStartingDemo } = useAuth();

  const handleTryDemo = async () => {
    try {
      await startDemo();
      window.location.href = "/app";
    } catch (error) {
      console.error("Failed to start demo:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingSEO />
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
            <Link href="/pricing" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/docs" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" disabled={isLoading} data-testid="button-login">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" disabled={isLoading} data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 lg:py-28 overflow-hidden">
          {/* Floating icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-[8%] w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div className="absolute top-32 right-[10%] w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute bottom-40 left-[5%] w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="absolute bottom-32 right-[8%] w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center animate-pulse">
              <Settings className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8">
              <span className="text-primary font-medium">For SMBs</span>
              <span className="text-muted-foreground">AI-powered automation</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Automate workflows smarter
              <br />
              <span className="text-primary">with AI blueprints</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              Document your processes, identify bottlenecks, and generate actionable automation plans—faster, easier, and smarter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 shadow-lg shadow-orange-500/25" 
                  data-testid="button-hero-start"
                >
                  Start for free
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto px-8 py-6 text-base" 
                data-testid="button-demo"
                onClick={handleTryDemo}
                disabled={isStartingDemo}
              >
                {isStartingDemo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Try Live Demo"
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>No time limits on free plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product screenshots section */}
        <section className="pb-20 lg:pb-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-chart-2/5 to-transparent rounded-3xl blur-3xl -z-10" />
              
              {/* Main product card */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left panel - Intake */}
                <Card className="relative -rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">Intake Wizard</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium mb-1">Process Name</p>
                        <p className="text-sm text-muted-foreground">Customer Onboarding</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-medium mb-1">Pain Area</p>
                        <p className="text-sm text-muted-foreground">Manual data entry</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-2 rounded-full bg-primary/20">
                          <div className="w-2/3 h-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Step 4/6</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Center panel - Blueprint */}
                <Card className="relative z-10 shadow-2xl border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-chart-2/10 flex items-center justify-center">
                          <GitBranch className="w-4 h-4 text-chart-2" />
                        </div>
                        <span className="font-medium text-sm">AI Blueprint</span>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">Generated</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-500">1</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Receive Request</p>
                          <p className="text-xs text-muted-foreground">Email trigger</p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-0.5 h-4 bg-border" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-medium text-orange-500">!</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Bottleneck</p>
                          <p className="text-xs text-muted-foreground">Manual approval delay</p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-0.5 h-4 bg-border" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-medium text-emerald-500">2</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Auto-route</p>
                          <p className="text-xs text-muted-foreground">AI classification</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right panel - ROI */}
                <Card className="relative rotate-2 hover:rotate-0 transition-transform duration-300 shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-chart-3/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-chart-3" />
                      </div>
                      <span className="font-medium text-sm">ROI Dashboard</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-2xl font-bold text-emerald-500">127</p>
                        <p className="text-xs text-muted-foreground">Hours Saved</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-2xl font-bold text-blue-500">42%</p>
                        <p className="text-xs text-muted-foreground">Faster</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Confidence Score</span>
                        <span className="font-medium">89%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="w-[89%] h-2 rounded-full bg-gradient-to-r from-chart-3 to-emerald-500" />
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
              <Link href="/auth/signup">
                <div className="p-5 rounded-lg border bg-gradient-to-br from-primary/10 to-card border-l-2 border-l-primary/50 hover-elevate cursor-pointer h-full">
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1.5 text-foreground">Guided Intake</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Step-by-step wizard to document pain points and upload relevant files.
                  </p>
                </div>
              </Link>
              <Link href="/auth/signup">
                <div className="p-5 rounded-lg border bg-gradient-to-br from-chart-2/10 to-card border-l-2 border-l-chart-2/50 hover-elevate cursor-pointer h-full">
                  <div className="w-9 h-9 rounded-lg bg-chart-2/20 flex items-center justify-center mb-4">
                    <GitBranch className="w-4 h-4 text-chart-2" />
                  </div>
                  <h3 className="font-medium mb-1.5 text-foreground">AI Blueprints</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Process maps with bottlenecks identified and prioritized backlog.
                  </p>
                </div>
              </Link>
              <Link href="/auth/signup">
                <div className="p-5 rounded-lg border bg-gradient-to-br from-chart-3/10 to-card border-l-2 border-l-chart-3/50 hover-elevate cursor-pointer h-full">
                  <div className="w-9 h-9 rounded-lg bg-chart-3/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-4 h-4 text-chart-3" />
                  </div>
                  <h3 className="font-medium mb-1.5 text-foreground">Automation Templates</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pre-built templates for email triage, lead follow-up, and more.
                  </p>
                </div>
              </Link>
              <Link href="/auth/signup">
                <div className="p-5 rounded-lg border bg-gradient-to-br from-chart-4/10 to-card border-l-2 border-l-chart-4/50 hover-elevate cursor-pointer h-full">
                  <div className="w-9 h-9 rounded-lg bg-chart-4/20 flex items-center justify-center mb-4">
                    <BarChart3 className="w-4 h-4 text-chart-4" />
                  </div>
                  <h3 className="font-medium mb-1.5 text-foreground">ROI Dashboard</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track hours saved and efficiency gains in real-time.
                  </p>
                </div>
              </Link>
              <Link href="/auth/signup">
                <div className="p-5 rounded-lg border bg-gradient-to-br from-blue-500/10 to-card border-l-2 border-l-blue-500/50 hover-elevate cursor-pointer h-full">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-1.5 text-foreground">Run History</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Detailed logs and execution history for every run.
                  </p>
                </div>
              </Link>
              <Link href="/auth/signup">
                <div className="p-5 rounded-lg border bg-gradient-to-br from-emerald-500/10 to-card border-l-2 border-l-emerald-500/50 hover-elevate cursor-pointer h-full">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-medium mb-1.5 text-foreground">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Invite members and manage roles across your organization.
                  </p>
                </div>
              </Link>
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
                <h2 className="text-xl font-semibold mb-2">Set up your first automation in minutes</h2>
                <p className="text-muted-foreground">
                  Document processes and generate AI-powered blueprints today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup">
                  <Button size="lg" data-testid="button-cta-final">
                    Get started free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  data-testid="button-cta-demo"
                  onClick={handleTryDemo}
                  disabled={isStartingDemo}
                >
                  {isStartingDemo ? "Starting..." : "Try Demo"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="font-medium">Ops Copilot</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-medium mb-3">Product</h4>
                <div className="space-y-2 text-muted-foreground">
                  <Link href="/#features" className="block hover:text-foreground">Features</Link>
                  <Link href="/pricing" className="block hover:text-foreground">Pricing</Link>
                  <Link href="/docs" className="block hover:text-foreground">Docs</Link>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Company</h4>
                <div className="space-y-2 text-muted-foreground">
                  <Link href="/security" className="block hover:text-foreground">Security</Link>
                  <a href="mailto:support@opscopilot.com" className="block hover:text-foreground">Support</a>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Get Started</h4>
                <div className="space-y-2 text-muted-foreground">
                  <Link href="/auth/signup" className="block hover:text-foreground">Sign up</Link>
                  <Link href="/auth/signin" className="block hover:text-foreground">Sign in</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Ops Copilot. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
