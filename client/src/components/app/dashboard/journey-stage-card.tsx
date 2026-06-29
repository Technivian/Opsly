import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StageStatus = "notStarted" | "busy" | "done" | "attention";

export interface JourneyStage {
  key: string;
  title: string;
  value: string;
  status: StageStatus;
  icon: LucideIcon;
}

/** Status styling. Colour is supportive only — the textual label always carries
 *  the meaning so it is never conveyed by colour alone. */
const STATUS_STYLES: Record<StageStatus, { dot: string; text: string }> = {
  notStarted: { dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  busy: { dot: "bg-chart-4", text: "text-chart-4" },
  done: { dot: "bg-chart-3", text: "text-chart-3" },
  attention: { dot: "bg-orange-500", text: "text-orange-500" },
};

interface JourneyStageCardProps {
  stage: JourneyStage;
  /** When true, this stage is the user's current focus and gets a subtle accent. */
  active?: boolean;
  /** Display index (1-based) shown as a step number. */
  index: number;
}

export function JourneyStageCard({ stage, active, index }: JourneyStageCardProps) {
  const { t } = useTranslation();
  const { icon: Icon, title, value, status } = stage;
  const styles = STATUS_STYLES[status];

  return (
    <div
      className={cn(
        "relative flex h-full flex-col gap-3 rounded-lg p-4 transition-colors",
        active
          ? "bg-primary/[0.06] ring-1 ring-inset ring-primary/30"
          : "bg-muted/30",
      )}
      data-testid={`journey-stage-${stage.key}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md",
            active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {index}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
      </div>

      <div className="mt-auto flex items-center gap-1.5">
        <span
          className={cn("h-1.5 w-1.5 rounded-full", styles.dot)}
          aria-hidden="true"
        />
        <span className={cn("text-xs font-medium", styles.text)}>
          {t(`dashboard.status.${status}`)}
        </span>
      </div>
    </div>
  );
}
