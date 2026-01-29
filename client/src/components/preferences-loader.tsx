import { usePreferences } from "@/hooks/use-preferences";

export function PreferencesLoader({ children }: { children: React.ReactNode }) {
  usePreferences();
  return <>{children}</>;
}
