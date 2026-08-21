"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, AlertTriangle, X } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export function InAppBrowserBanner() {
  const { t, language } = useTranslation();
  const [isInApp, setIsInApp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    
    // Detect In-App Browsers (Facebook, Instagram, KakaoTalk, Line, etc.)
    const isFb = /FBAV|FBAN|FB_IAB|FB4A/i.test(ua);
    const isInsta = /Instagram/i.test(ua);
    const isKakao = /KAKAOTALK/i.test(ua);
    const isLine = /Line\//i.test(ua);
    const isGeneralInApp = /wv|WebView/i.test(ua) && !/Chrome\/[.0-9]* Mobile/i.test(ua);

    const inAppDetected = isFb || isInsta || isKakao || isLine || isGeneralInApp;
    const androidDetected = /Android/i.test(ua);
    const iosDetected = /iPhone|iPad|iPod/i.test(ua);

    setIsInApp(inAppDetected);
    setIsAndroid(androidDetected);
    setIsIos(iosDetected);

    // Auto-escape on Android if inside Facebook/Instagram WebView
    if (inAppDetected && androidDetected) {
      try {
        const currentUrl = window.location.href.replace(/^https?:\/\//, "");
        // Only trigger intent if not already bypassed
        const hasTriedIntent = sessionStorage.getItem("has_tried_intent_escape");
        if (!hasTriedIntent) {
          sessionStorage.setItem("has_tried_intent_escape", "true");
          const chromeIntentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
          window.location.href = chromeIntentUrl;
        }
      } catch (err) {
        console.warn("[InAppBrowser] Intent redirect failed:", err);
      }
    }
  }, []);

  const handleOpenExternal = () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href.replace(/^https?:\/\//, "");

    if (isAndroid) {
      const chromeIntentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = chromeIntentUrl;
    } else {
      // For iOS, copy URL and prompt
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isInApp || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-xl border-b border-amber-400/40 p-3 sm:p-4 animate-in slide-in-from-top duration-300">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-black/20 rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>{t("인증서(PASS/카카오) 연결을 위해 외부 브라우저를 권장합니다")}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-100/90 leading-tight mt-0.5">
              {isIos
                ? t("우측 상단 [•••] 또는 [공유] 버튼을 누르고 'Safari로 열기'를 선택하시면 인증이 훨씬 빠르고 안전합니다.")
                : t("크롬(Chrome) 기본 브라우저에서 실행하시면 본인인증 앱이 원활하게 연결됩니다.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {isAndroid ? (
            <button
              onClick={handleOpenExternal}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-white text-amber-900 rounded-lg text-xs font-black hover:bg-amber-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t("크롬 브라우저로 열기")}</span>
            </button>
          ) : (
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-white text-amber-900 rounded-lg text-xs font-black hover:bg-amber-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t("복사완료! Safari에 붙여넣기") : t("링크 복사하기")}</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-200 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
