"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/components/LanguageContext";
import { X, Gift, Sparkles, Check, ChevronRight } from "lucide-react";

export default function DaisoEventPopup() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);

  useEffect(() => {
    // Check if simulation mode is active
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("simulation") === "true") {
        setIsSimulation(true);
        return;
      }

      // Check localStorage for "don't show today" flag
      const hideUntil = localStorage.getItem("hide-daiso-popup-until");
      if (hideUntil) {
        const parsed = parseInt(hideUntil, 10);
        if (!isNaN(parsed) && Date.now() < parsed) {
          return;
        }
      }

      // Show popup after 2 seconds delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCloseToday = () => {
    localStorage.setItem("hide-daiso-popup-until", (Date.now() + 24 * 60 * 60 * 1000).toString());
    setIsOpen(false);
  };

  const handleScrollToEstimate = () => {
    setIsOpen(false);
    // Smooth scroll to the simulator section
    const element = document.getElementById("simulator-section") || document.querySelector("section.w-full.py-10");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (isSimulation || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* 팝업 컨테이너 */}
      <div className="relative w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_0_1px_rgba(255,255,255,0.05)] text-white animate-in zoom-in-95 duration-300">
        
        {/* 상단 장식 그라디언트 & 글로우 */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-red-600/30 to-transparent pointer-events-none" />
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-[40px] pointer-events-none" />
        
        {/* 닫기 버튼 */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 z-10 p-2 bg-slate-950/40 hover:bg-slate-800 border border-white/10 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-white" />
        </button>

        <div className="p-8 pt-10 text-center relative z-10 flex flex-col items-center">
          {/* 다이소 기프트카드 목업 데코레이션 */}
          <div className="relative w-[180px] h-[110px] bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-4 shadow-[0_15px_30px_rgba(229,26,36,0.3)] border border-red-400/30 flex flex-col justify-between overflow-hidden mb-6 group hover:scale-105 transition-transform duration-300">
            {/* 카드 내부 물결 데코 */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-400/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black tracking-widest text-red-100 uppercase bg-black/10 px-2 py-0.5 rounded-full border border-white/5">DAISO EVENT</span>
              <Gift className="w-5 h-5 text-red-100 animate-pulse" />
            </div>
            
            <div className="text-left space-y-1">
              <span className="text-[10px] font-bold text-red-200/80 tracking-tight block">GIFT CARD</span>
              <span className="text-xl font-black text-white tracking-wide">₩5,000</span>
            </div>
            
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-30">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* 팝업 텍스트 내용 */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-wider uppercase mb-4">
            <Sparkles size={10} /> {t("100% 증정 이벤트")}
          </span>

          <h3 className="text-2xl font-black tracking-tight leading-tight mb-3 break-keep">
            {t("100% 무료 다이소 상품권 증정 이벤트!")}
          </h3>

          <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 max-w-sm break-keep">
            {t("환급 완료 후 인증샷만 올리면 다이소 5,000원 상품권을 전원에게 보내드립니다.")} <br />
            <span className="text-red-400/90 mt-1 block">
              {t("지인에게 추천하고 함께 받으세요!")}
            </span>
          </p>

          {/* 환급금 조회 버튼 */}
          <button
            onClick={handleScrollToEstimate}
            className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] cursor-pointer mb-6"
          >
            {t("환급받고 상품권 받기")}
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* 하단 제어 필드 */}
          <div className="w-full flex justify-between items-center text-[10px] font-black text-slate-500 border-t border-slate-800/80 pt-4">
            <button 
              onClick={handleCloseToday}
              className="hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <div className="w-3.5 h-3.5 border border-slate-700 rounded flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover:opacity-100" />
              </div>
              {t("오늘 하루 그만 보기")}
            </button>
            <button 
              onClick={handleClose}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              {t("닫기")}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
