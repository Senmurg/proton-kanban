import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getStoredLanguage, setStoredLanguage } from '../../lib/storage';
import { appCopy, type AppCopy, type AppLanguage } from './i18n-copy';

interface I18nContextValue {
  language: AppLanguage;
  copy: AppCopy;
  setLanguage: (language: AppLanguage) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function normalizeLanguage(value: string | null): AppLanguage {
  return value === 'en' ? 'en' : 'ru';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => normalizeLanguage(getStoredLanguage()));

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setStoredLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    copy: appCopy[language],
    setLanguage,
  }), [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
