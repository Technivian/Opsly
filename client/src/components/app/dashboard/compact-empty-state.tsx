import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface CompactEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionTestId?: string;
}

/** A compact, helpful empty state — deliberately small so the dashboard never
 *  feels unfinished or filled with large blank panels. */
export function CompactEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionTestId,
}: CompactEmptyStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-auto px-0 text-primary hover:bg-transparent hover:text-primary/80"
              data-testid={actionTestId}
            >
              {actionLabel}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
