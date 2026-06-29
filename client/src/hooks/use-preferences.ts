import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { LANG_EXPLICIT_KEY } from "@/i18n";

interface UserPreferences {
  id: number;
  userId: string;
  locale: string;
  theme: string;
}

export function usePreferences() {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (preferences?.locale && preferences.locale !== i18n.language) {
      i18n.changeLanguage(preferences.locale);
    }
  }, [preferences?.locale, i18n]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<UserPreferences, "locale" | "theme">>) => {
      return apiRequest("PATCH", "/api/preferences", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
    },
  });

  const setLocale = (locale: string) => {
    // Record that the user made a deliberate language choice so the Dutch-first
    // migration in i18n/index.ts no longer resets it.
    try {
      window.localStorage.setItem(LANG_EXPLICIT_KEY, "1");
    } catch {
      // ignore unavailable localStorage
    }
    i18n.changeLanguage(locale);
    if (isAuthenticated) {
      updatePreferencesMutation.mutate({ locale });
    }
  };

  const setTheme = (theme: string) => {
    if (isAuthenticated) {
      updatePreferencesMutation.mutate({ theme });
    }
  };

  return {
    preferences,
    isLoading,
    setLocale,
    setTheme,
  };
}
