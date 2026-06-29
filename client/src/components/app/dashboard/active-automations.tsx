import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, AlertCircle, Clock, Sparkles } from "lucide-react";
import { CompactEmptyState } from "./compact-empty-state";
import type { Run } from "@shared/schema";

function runStatusLabel(status: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    SUCCESS: t("runs.status.success"),
    FAILED: t("runs.status.failed"),
    RUNNING: t("runs.status.running"),
    QUEUED: t("runs.status.queued"),
  };
  return map[status] ?? status;
}

interface ActiveAutomationsProps {
  runs: Run[];
  locale: string;
}

/** Compact "active automations" section (Level 3): the latest runs with their
 *  result, or a small helpful empty state. */
export function ActiveAutomations({ runs, locale }: ActiveAutomationsProps) {
  const { t } = useTranslation();
  const recent = runs.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          {t("dashboard.activeAutomationsSection.title")}
        </CardTitle>
        <Link href="/app/runs">
          <Button variant="ghost" size="sm" data-testid="link-view-all-runs">
            {t("dashboard.viewAll")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length ? (
          <div className="space-y-2">
            {recent.map((run) => (
              <Link key={run.id} href="/app/runs">
                <div
                  className="flex items-center justify-between gap-3 rounded-lg p-3 hover-elevate cursor-pointer"
                  data-testid={`run-item-${run.id}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {run.status === "SUCCESS" ? (
                      <CheckCircle className="h-5 w-5 shrink-0 text-chart-3" aria-hidden="true" />
                    ) : run.status === "FAILED" ? (
                      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                    ) : (
                      <Clock className="h-5 w-5 shrink-0 text-chart-4" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">#{run.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.startedAt
                          ? new Date(run.startedAt).toLocaleString(locale)
                          : t("runs.status.queued")}
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
                    {runStatusLabel(run.status, t)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <CompactEmptyState
            icon={Sparkles}
            title={t("dashboard.activeAutomationsSection.empty")}
            description={t("dashboard.activeAutomationsSection.emptyDesc")}
            actionLabel={t("dashboard.nextStep.automate.action")}
            actionHref="/app/automations"
            actionTestId="button-configure-automation"
          />
        )}
      </CardContent>
    </Card>
  );
}
