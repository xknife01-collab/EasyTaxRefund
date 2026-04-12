'use client';

/**
 * [보안 강화된 LanguageContext]
 * - 번역 데이터를 클라이언트 번들에 포함하지 않음
 * - 서버 API(/api/translations/[lang])를 통해서만 번역 데이터를 수신
 * - ko.ts를 포함한 모든 번역 파일은 서버에만 존재
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Language } from '@/lib/translations/config';
import { useRouter } from 'next/navigation';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language, shouldRedirect?: boolean) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const fetchTranslations = useCallback(async (lang: Language) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds

    try {
      const res = await fetch(`/api/translations/${lang}?v=${Date.now()}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        setTranslationMap(data);
        return true;
      }
      return false;
    } catch (error) {
      clearTimeout(timeoutId);
      setTranslationMap({});
      return false;
    }
  }, []);

  useEffect(() => {
    // Safety fallback: ensure loading screen is hidden after 500ms even if API hangs
    const safetyTimeout = setTimeout(() => {
      console.warn('Translation initialization timed out. Forcing isReady=true.');
      setIsReady(true);
    }, 2000);

    const initLanguage = async () => {
      try {
        let lang: Language = 'ko';
        try {
          const savedLang = localStorage.getItem('app_lang') as Language;
          if (savedLang) lang = savedLang;
        } catch (storageError) {
          console.error('LocalStorage access blocked:', storageError);
        }
        
        setLanguageState(lang);
        const success = await fetchTranslations(lang);
        
        if (!success && lang !== 'ko') {
          setLanguageState('ko');
          try {
            localStorage.setItem('app_lang', 'ko');
          } catch (e) {}
        }
      } catch (error) {
        console.error('Failed to initialize language:', error);
      } finally {
        setIsReady(true);
        setMounted(true);
        clearTimeout(safetyTimeout);
      }
    };

    initLanguage();
    return () => clearTimeout(safetyTimeout);
  }, [fetchTranslations]);


  const setLanguage = useCallback(async (lang: Language, shouldRedirect = true) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    await fetchTranslations(lang);
    if (shouldRedirect) {
      router.push('/');
    }
  }, [fetchTranslations, router]);

  const t = React.useCallback((key: string, variables?: Record<string, string | number>): string => {
    if (!key || typeof key !== 'string') return '';
    const trimmedKey = key.trim();
    let text = translationMap[trimmedKey] || key;
    
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = String(text).replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  }, [translationMap]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('app_title');
    // Also update meta description if possible (via DOM)
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('app_description'));
  }, [language, t]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
}
