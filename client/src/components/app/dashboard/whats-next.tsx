import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

/** Compact explainer shown only to brand-new users in place of empty data
 *  panels: what Opsly does after the first process analysis. */
export function WhatsNext() {
  const { t } = useTranslation();
  const steps = ["step1", "step2", "step3", "step4"] as const;

  return (
    <Card className="bg-muted/20">
      <CardContent className="p-6">
        <h2 className="text-sm font-medium">{t("dashboard.whatsNext.title")}</h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary tabular-nums">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(`dashboard.whatsNext.${s}`)}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
