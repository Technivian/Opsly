import { CheckCircle2, CircleDashed, FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { IntegrationStatus } from "@/config/integrations";

/**
 * Status is communicated through an icon AND a text label, never colour alone,
 * to meet accessibility requirements.
 */
const statusConfig: Record<
  IntegrationStatus,
  { icon: typeof CheckCircle2; className: string }
> = {
  available: {
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400 border-emerald-600/30 bg-emerald-500/10",
  },
  pilot: {
    icon: FlaskConical,
    className: "text-amber-700 dark:text-amber-400 border-amber-600/30 bg-amber-500/10",
  },
  planned: {
    icon: CircleDashed,
    className: "text-muted-foreground border-border bg-muted",
  },
};

export function ProductStatusBadge({
  status,
  className,
}: {
  status: IntegrationStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
      data-testid={`status-${status}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {t(`corp.opsly.integrations.status.${status}`)}
    </span>
  );
}
