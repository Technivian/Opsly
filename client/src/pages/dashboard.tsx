import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ClipboardList,
  GitBranch,
  Sparkles,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Intake, Blueprint, Run } from "@shared/schema";

function getIntakeStatusLabel(status: string, t: (key: string) => string): string {
  const key = `intakes.status.${status}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}

function getRunStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    SUCCESS: t("runs.status.success"),
    FAILED: t("runs.status.failed"),
    RUNNING: t("runs.status.running"),
    QUEUED: t("runs.status.queued"),
  };
  return map[status] ?? status;
}

function getPainAreaLabel(painArea: string, t: (key: string) => string): string {
  const key = `intakes.wizard.painAreas.${painArea}.label`;
  const translated = t(key);
  return translated !== key ? translated : painArea;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";

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
        title: t("dashboard.nextAction.firstIntake.title"),
        description: t("dashboard.nextAction.firstIntake.desc"),
        action: t("dashboard.nextAction.firstIntake.action"),
        href: "/app/intakes/new",
        icon: ClipboardList,
        color: "text-primary",
      };
    }
    if (pendingIntakes.length > 0) {
      return {
        title: t("dashboard.nextAction.processing.title"),
        description: t("dashboard.nextAction.processing.desc", { count: pendingIntakes.length }),
        action: t("dashboard.nextAction.processing.action"),
        href: "/app/intakes",
        icon: Clock,
        color: "text-chart-4",
      };
    }
    if (blueprints?.length && !runs?.length) {
      return {
        title: t("dashboard.nextAction.configureAutomation.title"),
        description: t("dashboard.nextAction.configureAutomation.desc"),
        action: t("dashboard.nextAction.configureAutomation.action"),
        href: "/app/automations",
        icon: Sparkles,
        color: "text-chart-3",
      };
    }
    return {
      title: t("dashboard.nextAction.anotherIntake.title"),
      description: t("dashboard.nextAction.anotherIntake.desc"),
      action: t("dashboard.nextAction.anotherIntake.action"),
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
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
      </div>

      <Card className="border-l-2 border-l-primary">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <nextAction.icon className={`w-5 h-5 ${nextAction.color}`} />
              </div>
              <div>
                <h3 className="font-medium">{nextAction.title}</h3>
                <p className="text-sm text-muted-foreground max-w-md">{nextAction.description}</p>
              </div>
            </div>
            <Link href={nextAction.href}>
              <Button size="sm" data-testid="button-next-action">
                {nextAction.action} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.hoursSaved")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {roiLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{roiData?.hoursSaved || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">{t("dashboard.hoursSavedDesc")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.cycleTime")}</CardTitle>
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
            <p className="text-xs text-muted-foreground">{t("dashboard.cycleTimeDesc")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.blueprintsCount")}</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {blueprintsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{blueprints?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">{t("dashboard.blueprintsDesc")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.successRate")}</CardTitle>
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
            <p className="text-xs text-muted-foreground">
              {totalRuns > 0
                ? t("dashboard.successRateDesc", { success: successfulRuns, total: totalRuns })
                : t("dashboard.successRateNone")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("dashboard.recentIntakes")}</CardTitle>
              <Link href="/app/intakes">
                <Button variant="ghost" size="sm" data-testid="link-view-all-intakes">
                  {t("dashboard.viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>{t("dashboard.recentIntakesDesc")}</CardDescription>
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
                {intakes.slice(0, 5).map((intake) => {
                  const blueprint = blueprints?.find(b => b.intakeId === intake.id);
                  const isClickable = intake.status === "PROCESSED" && blueprint;

                  const content = (
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isClickable
                          ? "bg-gradient-to-r from-primary/10 to-muted/50 border-l-2 border-l-primary/60 hover-elevate cursor-pointer"
                          : "bg-muted/50"
                      }`}
                      data-testid={`intake-item-${intake.id}`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{intake.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getPainAreaLabel(intake.painArea ?? "", t)} &middot;{" "}
                          {new Date(intake.createdAt).toLocaleDateString(locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            intake.status === "PROCESSED"
                              ? "default"
                              : intake.status === "SUBMITTED"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {getIntakeStatusLabel(intake.status, t)}
                        </Badge>
                        {isClickable && (
                          <ArrowRight className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                  );

                  return isClickable ? (
                    <Link key={intake.id} href={`/app/blueprints/${blueprint.id}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={intake.id}>{content}</div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>{t("dashboard.noIntakes")}</p>
                <Link href="/app/intakes/new">
                  <Button variant="ghost" size="sm" data-testid="button-create-first-intake">
                    {t("dashboard.createFirstIntake")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("dashboard.recentRuns")}</CardTitle>
              <Link href="/app/runs">
                <Button variant="ghost" size="sm" data-testid="link-view-all-runs">
                  {t("dashboard.viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>{t("dashboard.recentRunsDesc")}</CardDescription>
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
                  <Link key={run.id} href="/app/runs">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg hover-elevate cursor-pointer ${
                        run.status === "SUCCESS"
                          ? "bg-gradient-to-r from-chart-3/10 to-muted/50 border-l-2 border-l-chart-3/60"
                          : run.status === "FAILED"
                          ? "bg-gradient-to-r from-destructive/10 to-muted/50 border-l-2 border-l-destructive/60"
                          : "bg-gradient-to-r from-chart-4/10 to-muted/50 border-l-2 border-l-chart-4/60"
                      }`}
                      data-testid={`run-item-${run.id}`}
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
                              ? new Date(run.startedAt).toLocaleString(locale)
                              : t("runs.status.queued")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            run.status === "SUCCESS"
                              ? "default"
                              : run.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {getRunStatusLabel(run.status, t)}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>{t("dashboard.noRuns")}</p>
                <Link href="/app/automations">
                  <Button variant="ghost" size="sm" data-testid="button-configure-automation">
                    {t("dashboard.configureAutomation")}
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
