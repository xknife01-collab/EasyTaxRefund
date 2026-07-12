"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/components/LanguageContext";
import { Percent } from "lucide-react";
import Link from "next/link";

export default function YouthTaxPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center pt-[96px] w-full">
        {/* Hero Section */}
        <div className="relative w-full h-[400px] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/70 z-10" />
          <img
            src="/serene-light-wood-office-interior-ai-generation.jpg"
            alt="Youth Tax Reduction Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center space-y-3 px-4">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-headline">
              {t("청년 소득세 90% 감면 제도안내")}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300 font-bold">
              <Link href="/" className="hover:text-white transition-colors">{t("홈")}</Link>
              <span>/</span>
              <span className="text-[#b88c30]">{t("청년 소득세 감면 안내")}</span>
            </div>
          </div>
        </div>

        {/* Content Container (Waiting for User's Content) */}
        <div className="w-full max-w-4xl mx-auto px-6 py-24">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 sm:p-16 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] text-center space-y-8">
            <div className="mx-auto w-20 h-20 bg-[#b88c30]/10 rounded-3xl flex items-center justify-center text-[#b88c30] animate-pulse">
              <Percent className="w-10 h-10" />
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("제도 상세 안내 준비 중")}
              </h2>
              <p className="text-slate-500 text-base leading-relaxed">
                {t("이곳에 제공해 주실 청년 소득세 90% 감면 제도안내 상세 콘텐츠가 채워질 예정입니다. 텍스트나 레이아웃 요구사항을 전달해 주시면 즉시 가독성 높은 최고급 화면으로 디자인해 드리겠습니다.")}
              </p>
            </div>
            
            <div className="pt-6">
              <Link href="/estimate">
                <button className="bg-[#b88c30] hover:bg-[#b88c30]/90 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#b88c30]/20">
                  {t("나의 소득세 감면 여부 확인하기")}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
