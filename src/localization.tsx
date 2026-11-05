import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { LANGUAGES, translate, type Language, type TranslationKey } from './locales';

const LanguageContext = createContext<Language>('en');
export function LocalizationProvider({ language, children }: { language: Language; children: React.ReactNode }) {
  useEffect(() => { if (typeof document !== 'undefined') document.documentElement.lang = language; }, [language]);
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}
export function useI18n() {
  const language = useContext(LanguageContext);
  return useMemo(() => ({
    language,
    locale: LANGUAGES.find(item => item.id === language)!.locale,
    t: (key: TranslationKey, values?: Record<string, string | number>) => translate(language, key, values),
  }), [language]);
}
