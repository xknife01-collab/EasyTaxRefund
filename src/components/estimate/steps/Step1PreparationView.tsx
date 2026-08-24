import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BadgeCheck,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step1PreparationViewProps {
  isNtsMaintenance: boolean;
  onNext: () => void;
}

export function Step1PreparationView({
  isNtsMaintenance,
  onNext
}: Step1PreparationViewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#b88c30] rounded-tl-3xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b88c30] rounded-tr-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#b88c30] rounded-bl-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#b88c30] rounded-br-3xl z-10 pointer-events-none" />

      <Card className="rounded-3xl border border-[#b88c30]/30 shadow-2xl overflow-hidden bg-[#0b192c]">
        {/* 상단 Header: NTS 배지 + 신뢰 문구 */}
        <CardHeader className="text-center py-6 sm:py-10 bg-[#0b192c] border-b border-[#b88c30]/15 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
              backgroundSize: "40px 40px"
            }}
          />
          <div className="mx-auto flex flex-col items-center gap-4 relative z-10">
            {/* Official Step Badge */}
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="h-px w-8 bg-[#b88c30]" />
              <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/30 rounded-full px-4 py-1.5">
                <span className="text-[#b88c30] text-[10px] font-black tracking-[0.2em] uppercase">
                  {t('Step 01 — 사전 준비')}
                </span>
              </div>
              <div className="h-px w-8 bg-[#b88c30]" />
            </div>

            {/* NTS 배지 이미지 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#b88c30]/10 rounded-full blur-xl opacity-50" />
              <Image
                src="/official_nts_carrier_badge_v2_1774141326494.png"
                alt="Official NTS & Carrier Badge"
                width={120}
                height={120}
                className="relative rounded-2xl shadow-md border border-[#b88c30]/20 transition-transform hover:scale-110"
              />
            </div>

            <div className="space-y-2">
              <Badge className="bg-[#b88c30]/10 text-[#b88c30] border border-[#b88c30]/30 text-[10px] font-black uppercase tracking-widest">
                {t('safe_and_secure')}
              </Badge>

              {/* 국세청 점검 시간 배너 */}
              {isNtsMaintenance && (
                <div className="flex items-start gap-3 bg-amber-950/50 border border-amber-700/40 rounded-2xl p-4 text-left mt-3 animate-in fade-in duration-500">
                  <div className="h-7 w-7 bg-amber-900/60 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-black text-amber-300 text-sm">{t('국세청 시스템 점검 중 (00:00 ~ 06:00)')}</p>
                    <p className="text-amber-400/80 text-xs font-bold mt-0.5">{t('오전 6시 이후에 조회하시면 정상적으로 이용하실 수 있습니다.')}</p>
                  </div>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-white">{t('nts_trust_title')}</h2>
              <p className="text-[13px] font-bold text-slate-400 leading-tight max-w-[280px] mx-auto">{t('nts_trust_message')}</p>
            </div>
          </div>
        </CardHeader>

        {/* 하단 Header: 아이콘 + 제목 */}
        <CardHeader className="text-center py-6 sm:py-10 bg-[#0d1e30] border-b border-[#b88c30]/10">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-[#b88c30]/10 border border-[#b88c30]/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-5 shadow-lg">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-[#b88c30]" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black text-white break-keep">
            {t('시작하기 전 필수 확인')}
          </CardTitle>
          <p className="font-bold text-slate-400 text-xs sm:text-sm mt-2">
            {t('성공적인 환급 조회를 위해 아래 사항을 준비해 주세요.')}
          </p>
          <div className="h-px w-16 bg-[#b88c30] mx-auto mt-4" />
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 sm:p-10 space-y-6 sm:space-y-8 bg-[#0d1e30]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:border-[#b88c30]/30 transition-all">
              <div className="h-11 w-11 bg-[#b88c30] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#b88c30]/20">
                <BadgeCheck className="h-6 w-6 text-[#0b192c]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-white text-sm">{t('외국인 등록증')}</p>
                <p className="text-[11px] text-slate-400 font-bold">{t('실물 신분증 준비')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:border-[#b88c30]/30 transition-all">
              <div className="h-11 w-11 bg-[#b88c30] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#b88c30]/20">
                <Phone className="h-6 w-6 text-[#0b192c]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-white text-sm">{t('본인 명의 휴대폰')}</p>
                <p className="text-[11px] text-slate-400 font-bold">{t('통신사 가입자 본인')}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#b88c30]/10" />

          <div className="space-y-4">
            <Button
              id="step1-submit-btn"
              onClick={onNext}
              className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-2xl shadow-2xl shadow-[#b88c30]/20 flex items-center justify-center flex-wrap gap-3 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <BadgeCheck className="h-6 w-6 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="flex-1 text-left">{t('시작하기')}</span>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2 shrink-0" />
            </Button>
            <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="h-3 w-3 text-[#b88c30]" /> {t('safe_and_secure')}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-950/40 rounded-2xl border border-amber-700/30">
            <div className="h-8 w-8 bg-amber-900/50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-[12px] font-bold text-amber-300 leading-relaxed">
              {t('중요: 통신사(핸드폰)에 등록된 영문 이름과 외국인 등록증의 이름이 단 한 글자라도 다르면 조회가 불가능합니다.')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
