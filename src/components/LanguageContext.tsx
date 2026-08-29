'use client';

/**
 * [보안 강화된 LanguageContext]
 * - 번역 데이터를 클라이언트 번들에 포함하지 않음
 * - 서버 API(/api/translations/[lang])를 통해서만 번역 데이터를 수신
 * - ko.ts를 포함한 모든 번역 파일은 서버에만 존재
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, languages } from '@/lib/translations/config';
import { useRouter, usePathname } from 'next/navigation';
import { getBlogTranslation } from '@/lib/translations/blogTranslations';

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
  const pathname = usePathname();

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
        const normalizedData: Record<string, string> = {};
        Object.entries(data || {}).forEach(([k, v]) => {
          normalizedData[k.replace(/\r\n/g, '\n')] = v as string;
        });
        setTranslationMap(normalizedData);
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
        
        if (typeof window !== 'undefined') {
          // 0. URL Pathname 서브경로 우선 확인 (예: /vi/blog, /zh/blog, /id/blog 등)
          const pathSegments = window.location.pathname.split('/').filter(Boolean);
          const pathLang = pathSegments[0] as Language;
          if (pathLang && languages.some(l => l.code === pathLang)) {
            lang = pathLang;
            localStorage.setItem('app_lang', lang);
          } else {
            // 1. URL Query Parameter 확인 (?lang=vi 등)
            const params = new URLSearchParams(window.location.search);
            const urlLang = params.get('lang') as Language;
            if (urlLang && languages.some(l => l.code === urlLang)) {
              lang = urlLang;
              localStorage.setItem('app_lang', lang);
            } else {
              // 2. LocalStorage 확인
              const savedLang = localStorage.getItem('app_lang') as Language;
              if (savedLang && languages.some(l => l.code === savedLang)) {
                lang = savedLang;
              } else {
                // 3. 브라우저 설정 언어 감지 (첫 방문 시)
                const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
                const matchedLang = languages.find(l => {
                  if (l.code === 'ko') return false; // 한국어 외의 모국어 설정 매칭
                  return browserLang.startsWith(l.code);
                });
                if (matchedLang) {
                  lang = matchedLang.code;
                }
              }
            }
          }
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

  // URL 경로 변경 시 언어 동기화 (예: /vi/blog 이동 시 자동으로 vi 언어 로드)
  useEffect(() => {
    if (!pathname) return;
    const pathSegments = pathname.split('/').filter(Boolean);
    const pathLang = pathSegments[0] as Language;
    if (pathLang && languages.some(l => l.code === pathLang) && pathLang !== language) {
      setLanguageState(pathLang);
      localStorage.setItem('app_lang', pathLang);
      fetchTranslations(pathLang);
    }
  }, [pathname, language, fetchTranslations]);


  const setLanguage = useCallback(async (lang: Language, shouldRedirect = true) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    await fetchTranslations(lang);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url.toString());
      }
    }

    if (shouldRedirect) {
      router.push('/');
    }
  }, [fetchTranslations, router]);

  const t = React.useCallback((key: string, variables?: Record<string, string | number>): string => {
    if (!key || typeof key !== 'string') return '';
    const trimmedKey = key.trim().replace(/\r\n/g, '\n');
    let text = translationMap[trimmedKey];

    if (!text) {
      if (trimmedKey === '세무 가이드 & 칼럼' || trimmedKey === '세무 가이드') {
        text = getBlogTranslation(language).breadcrumbBlog;
      } else {
        text = key;
      }
    }
    
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = String(text).replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  }, [translationMap, language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('app_title');
    // Also update meta description if possible (via DOM)
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('app_description'));
  }, [language, t]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/admin') && !path.startsWith('/api')) {
        import('@/lib/tracking').then(({ captureTrackingData, logVisit }) => {
          captureTrackingData();
          logVisit();
        }).catch(err => console.error('Failed to load tracking:', err));
      }
    }
  }, []);

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
