import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList } from "lucide-react";
import { CompactEmptyState } from "./compact-empty-state";
import type { Intake, Blueprint } from "@shared/schema";

function intakeStatusLabel(status: string, t: (k: string) => string) {
  const key = `intakes.status.${status}`;
  const v = t(key);
  return v !== key ? v : status;
}

function painAreaLabel(painArea: string, t: (k: string) => string) {
  const key = `intakes.wizard.painAreas.${painArea}.label`;
  const v = t(key);
  return v !== key ? v : painArea;
}

interface RecentProcessesProps {
  intakes: Intake[];
  blueprints: Blueprint[];
  locale: string;
}

/** Compact "latest processes" section (Level 3). Shows up to five processes
 *  with their phase and a deep-link to the blueprint when ready. */
export function RecentProcesses({ intakes, blueprints, locale }: RecentProcessesProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("dashboard.recentProcesses.title")}</CardTitle>
        <Link href="/app/intakes">
          <Button variant="ghost" size="sm" data-testid="link-view-all-intakes">
            {t("dashboard.viewAll")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {intakes.length ? (
          <div className="space-y-2">
            {intakes.slice(0, 5).map((intake) => {
              const blueprint = blueprints.find((b) => b.intakeId === intake.id);
              const isClickable = intake.status === "PROCESSED" && blueprint;
              const inner = (
                <div
                  className={
                    "flex items-center justify-between gap-3 rounded-lg p-3 " +
                    (isClickable ? "hover-elevate cursor-pointer" : "bg-muted/30")
                  }
                  data-testid={`intake-item-${intake.id}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{intake.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {painAreaLabel(intake.painArea ?? "", t)} &middot;{" "}
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
                      {intakeStatusLabel(intake.status, t)}
                    </Badge>
                    {isClickable && <ArrowRight className="h-4 w-4 text-primary" />}
                  </div>
                </div>
              );
              return isClickable ? (
                <Link key={intake.id} href={`/app/blueprints/${blueprint.id}`}>
                  {inner}
                </Link>
              ) : (
                <div key={intake.id}>{inner}</div>
              );
            })}
          </div>
        ) : (
          <CompactEmptyState
            icon={ClipboardList}
            title={t("dashboard.recentProcesses.empty")}
            description={t("dashboard.recentProcesses.emptyDesc")}
            actionLabel={t("dashboard.nextStep.firstProcess.action")}
            actionHref="/app/intakes/new"
            actionTestId="button-create-first-intake"
          />
        )}
      </CardContent>
    </Card>
  );
}
