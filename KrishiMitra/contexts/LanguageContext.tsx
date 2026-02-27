import React, { createContext, useContext, useState } from 'react';
import { Locale, translations } from '@/constants/translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const setLocale = (l: Locale) => setLocaleState(l);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Use this hook anywhere to get translated strings and locale setter */
export function useLanguage() {
  return useContext(LanguageContext);
}
