import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import nl from './locales/nl.json';

const resources = {
  en: { translation: en },
  nl: { translation: nl },
};

// localStorage keys
// - `i18nextLng`           : detector cache of the active language (library default)
// - `opsly_locale_explicit`: set to "1" only when the user explicitly picks a
//                            language via the in-app switcher (see usePreferences.setLocale)
export const LANG_CACHE_KEY = 'i18nextLng';
export const LANG_EXPLICIT_KEY = 'opsly_locale_explicit';

/**
 * Migration rule (Dutch-first):
 * Dutch is the default for everyone EXCEPT users who explicitly chose another
 * language. If no explicit choice was recorded, any cached language value
 * (including stale `i18nextLng=en` left over from development) is removed so the
 * detector falls back to Dutch. Authenticated users with a server-stored locale
 * still get it re-applied by usePreferences after login.
 */
function migrateLocaleCache() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const explicit = window.localStorage.getItem(LANG_EXPLICIT_KEY) === '1';
    if (!explicit) {
      window.localStorage.removeItem(LANG_CACHE_KEY);
    }
  } catch {
    // localStorage may be unavailable (private mode / blocked) — default to Dutch.
  }
}

migrateLocaleCache();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Dutch is the default for new visitors. A saved preference is only honoured
    // when the user explicitly chose it (see migrateLocaleCache above).
    // Authenticated users keep their server-stored locale, applied by
    // usePreferences. We intentionally do not detect the browser language so
    // that new visitors default to Dutch.
    fallbackLng: 'nl',
    supportedLngs: ['en', 'nl'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: LANG_CACHE_KEY,
    },
  });

export default i18n;

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];
