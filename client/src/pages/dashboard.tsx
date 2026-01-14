import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ClipboardList,
  GitBranch,
  Zap,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Intake, Blueprint, Run } from "@shared/schema";

export default function Dashboard() {
  const { data: intakes, isLoading: intakesLoading } = useQuery<Intake[]>({
    queryKey: ["/api/intakes"],
  });

  const { data: blueprints, isLoading: blueprintsLoading } = useQuery<Blueprint[]>({
    queryKey: ["/api/blueprints"],
  });

  const { data: runs, isLoading: runsLoading } = useQuery<Run[]>({
    queryKey: ["/api/runs"],
  });

  const { data: roiData, isLoading: roiLoading } = useQuery<{
    hoursSaved: number;
    cycleTimeReduction: number;
    confidenceScore: number;
  }>({
    queryKey: ["/api/roi"],
  });

  const pendingIntakes = intakes?.filter((i) => i.status === "SUBMITTED") || [];
  const recentRuns = runs?.slice(0, 5) || [];
  const successfulRuns = runs?.filter((r) => r.status === "SUCCESS").length || 0;
  const totalRuns = runs?.length || 0;

  const getNextAction = () => {
    if (!intakes?.length) {
      return {
        title: "Create Your First Intake",
        description: "Start by describing your operational challenges and let AI generate a process blueprint.",
        action: "Start Intake Wizard",
        href: "/app/intakes/new",
        icon: ClipboardList,
        color: "text-primary",
      };
    }
    if (pendingIntakes.length > 0) {
      return {
        title: "Processing Your Intake",
        description: `${pendingIntakes.length} intake(s) are being processed. Check back shortly for your blueprint.`,
        action: "View Intakes",
        href: "/app/intakes",
        icon: Clock,
        color: "text-chart-4",
      };
    }
    if (blueprints?.length && !runs?.length) {
      return {
        title: "Configure Your First Automation",
        description: "You have blueprints ready! Set up an automation template to start saving time.",
        action: "View Automations",
        href: "/app/automations",
        icon: Zap,
        color: "text-chart-3",
      };
    }
    return {
      title: "Create Another Intake",
      description: "Document more processes to discover additional automation opportunities.",
      action: "Start Intake",
      href: "/app/intakes/new",
      icon: ClipboardList,
      color: "text-primary",
    };
  };

  const nextAction = getNextAction();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Ops Copilot. Here's your operational overview.</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center ${nextAction.color}`}>
                <nextAction.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{nextAction.title}</h3>
                <p className="text-sm text-muted-foreground max-w-md">{nextAction.description}</p>
              </div>
            </div>
            <Link href={nextAction.href}>
              <Button data-testid="button-next-action">
                {nextAction.action} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {roiLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{roiData?.hoursSaved || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Total time saved through automation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycle Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {roiLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-chart-3">
                {roiData?.cycleTimeReduction || 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Reduction in process time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blueprints</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {blueprintsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{blueprints?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Process blueprints generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">{successfulRuns} of {totalRuns} runs successful</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Intakes</CardTitle>
              <Link href="/app/intakes">
                <Button variant="ghost" size="sm" data-testid="link-view-all-intakes">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your latest process intake submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {intakesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : intakes?.length ? (
              <div className="space-y-3">
                {intakes.slice(0, 5).map((intake) => (
                  <div
                    key={intake.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{intake.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {intake.painArea} &middot; {new Date(intake.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        intake.status === "PROCESSED"
                          ? "default"
                          : intake.status === "SUBMITTED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {intake.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No intakes yet</p>
                <Link href="/app/intakes/new">
                  <Button variant="link" size="sm" data-testid="button-create-first-intake">
                    Create your first intake
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Runs</CardTitle>
              <Link href="/app/runs">
                <Button variant="ghost" size="sm" data-testid="link-view-all-runs">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>Latest automation run results</CardDescription>
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentRuns.length ? (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {run.status === "SUCCESS" ? (
                        <CheckCircle className="w-5 h-5 text-chart-3 shrink-0" />
                      ) : run.status === "FAILED" ? (
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-chart-4 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">Run #{run.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {run.startedAt
                            ? new Date(run.startedAt).toLocaleString()
                            : "Queued"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        run.status === "SUCCESS"
                          ? "default"
                          : run.status === "FAILED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {run.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No runs yet</p>
                <Link href="/app/automations">
                  <Button variant="link" size="sm" data-testid="button-configure-automation">
                    Configure an automation
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
