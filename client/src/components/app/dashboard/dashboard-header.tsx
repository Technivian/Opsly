import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
  firstName?: string | null;
}

/** Personal page header with a time-of-day greeting. Falls back to a neutral
 *  title when the user's first name is unavailable. */
export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const { t } = useTranslation();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const title = firstName
    ? `${t(`dashboard.greeting.${greetingKey}`)}, ${firstName}`
    : t("dashboard.greeting.noName");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {t("dashboard.headerSubtitle")}
      </p>
    </div>
  );
}
