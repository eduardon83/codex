import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import pt from './locales/pt/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
] as const;

export const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions & { locale: string }> = {
  en: { locale: 'en-US', year: 'numeric', month: '2-digit', day: '2-digit' },
  pt: { locale: 'pt-PT', year: 'numeric', month: '2-digit', day: '2-digit' },
  es: { locale: 'es-ES', year: 'numeric', month: '2-digit', day: '2-digit' },
  fr: { locale: 'fr-FR', year: 'numeric', month: '2-digit', day: '2-digit' },
};

export function formatDate(date: Date | string, lang?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const currentLang = lang || i18n.language || 'en';
  const fmt = DATE_FORMATS[currentLang] || DATE_FORMATS.en;
  return d.toLocaleDateString(fmt.locale, { year: fmt.year, month: fmt.month, day: fmt.day });
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: localStorage.getItem('i18nextLng') || 'pt',
    fallbackLng: 'pt',
    supportedLngs: ['en', 'pt', 'es', 'fr'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Keep <html lang> in sync with the active language for a11y (WCAG 3.1.1)
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'pt';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;
