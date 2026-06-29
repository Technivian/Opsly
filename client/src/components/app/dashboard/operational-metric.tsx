import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface OperationalMetricProps {
  icon: LucideIcon;
  label: string;
  /** The headline value (e.g. "3" or "12 uur"). */
  value: string;
  /** Optional muted helper line under the value. */
  hint?: string;
  href?: string;
  testId?: string;
}

/** A single operational figure with context. Used (Level 3) only when real data
 *  exists — never to render a row of meaningless zeros. */
export function OperationalMetric({
  icon: Icon,
  label,
  value,
  hint,
  href,
  testId,
}: OperationalMetricProps) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-lg bg-muted/30 p-4",
        href && "hover-elevate cursor-pointer",
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
