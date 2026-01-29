import i18n from "@/i18n";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = i18n.language === "nl" ? "nl-NL" : "en-US";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = i18n.language === "nl" ? "nl-NL" : "en-US";
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  const locale = i18n.language === "nl" ? "nl-NL" : "en-US";
  return num.toLocaleString(locale);
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  const locale = i18n.language === "nl" ? "nl-NL" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  const locale = i18n.language === "nl" ? "nl-NL" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const locale = i18n.language === "nl" ? "nl-NL" : "en-US";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMins < 1) return i18n.language === "nl" ? "zojuist" : "just now";
  if (diffMins < 60) return rtf.format(-diffMins, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  return formatDate(d);
}
