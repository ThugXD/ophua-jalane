import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, getTranslation } from '@/config/i18n';
import { STORAGE_KEYS } from '@/lib/constants';

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from storage on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.language);
        if (savedLanguage === 'pt' || savedLanguage === 'en') {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error('[LanguageProvider] Error loading language:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  const t = useCallback(
    (key: string) => getTranslation(language, key),
    [language]
  );

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
    } catch (error) {
      console.error('[LanguageProvider] Error setting language:', error);
    }
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
