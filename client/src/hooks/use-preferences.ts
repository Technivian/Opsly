import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

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
