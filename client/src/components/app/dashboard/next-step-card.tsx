import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface NextStep {
  title: string;
  description: string;
  action: string;
  href: string;
  icon: LucideIcon;
  /** 1-based index of the current step in the 4-step journey. */
  currentStep: number;
  /** How many of the 4 journey steps are completed. */
  completedSteps: number;
  /** Whether to show the "takes ~5–10 min" hint (only for the first analysis). */
  showDuration?: boolean;
}

/** The single most important card on the dashboard: the user's next valuable
 *  step. Visually dominant (Level 1) but calm — a subtle accent, not a shout. */
export function NextStepCard({ step }: { step: NextStep }) {
  const { t } = useTranslation();
  const { icon: Icon } = step;
  const total = 4;
  const progress = Math.min(step.completedSteps, total) / total;

  return (
    <Card className="border-primary/30 bg-primary/[0.04] shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary">
                {t("dashboard.nextStep.stepOf", {
                  current: step.currentStep,
                  total,
                })}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {step.title}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
            <Link href={step.href}>
              <Button className="w-full md:w-auto" data-testid="button-next-action">
                {step.action}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            {step.showDuration && (
              <p className="text-center text-xs text-muted-foreground md:text-right">
                {t("dashboard.nextStep.duration")}
              </p>
            )}
          </div>
        </div>

        {/* Progress through the 4-step journey */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("dashboard.nextStep.stepsCompleted", {
                done: step.completedSteps,
                total,
              })}
            </span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={step.completedSteps}
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
