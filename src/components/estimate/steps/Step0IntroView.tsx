import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Banknote, Sparkles, FileText, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

interface Step0IntroViewProps {
  preFilterData: {
    workMonths: number;
    avgSalary: number;
  };
  setPreFilterData: React.Dispatch<React.SetStateAction<{
    workMonths: number;
    avgSalary: number;
  }>>;
  preFilterEstimate: number;
  eligibilityRange: {
    start: string | number;
    end: string | number;
  };
  RefundCounter: React.ComponentType<{ value: number }>;
  onNext: () => void;
}

export function Step0IntroView({
  preFilterData,
  setPreFilterData,
  preFilterEstimate,
  eligibilityRange,
  RefundCounter,
  onNext
}: Step0IntroViewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#b88c30] rounded-tl-3xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b88c30] rounded-tr-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#b88c30] rounded-bl-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#b88c30] rounded-br-3xl z-10 pointer-events-none" />

      <Card className="rounded-3xl border border-[#b88c30]/30 shadow-2xl overflow-hidden bg-[#0b192c]">
        {/* Header */}
        <CardHeader className="text-center py-8 sm:py-12 bg-[#0b192c] text-white relative overflow-hidden">
          {/* BG Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
              backgroundSize: "40px 40px"
            }}
          />
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Banknote className="h-48 w-48 text-[#b88c30]" />
          </div>

          {/* Official Badge Line */}
          <div className="relative z-10 flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#b88c30]" />
            <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/30 rounded-full px-4 py-1.5">
              <span className="text-[#b88c30] text-[10px] font-black tracking-[0.2em] uppercase">
                {t('대한민국 국세청 연동')}
              </span>
            </div>
            <div className="h-px w-8 bg-[#b88c30]" />
          </div>

          {/* 국세청 공식 로고 */}
          <div className="relative z-10 mx-auto mb-5 flex flex-col items-center gap-3">
            <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-[#b88c30]/20 overflow-hidden">
              <img src="/nts-logo.jpg" alt={t("국세청")} className="h-16 w-16 object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-5 bg-[#b88c30]/40" />
              <span className="text-[9px] font-black text-[#b88c30]/60 uppercase tracking-widest">National Tax Service</span>
              <div className="h-px w-5 bg-[#b88c30]/40" />
            </div>
          </div>

          <CardTitle className="relative z-10 text-3xl sm:text-4xl font-black tracking-tight px-4 leading-tight text-white">
            {t('나의 잠재 환급액')}<br />
            <span className="text-[#b88c30]">{t('10초 만에 확인하기')}</span>
          </CardTitle>
          <div className="relative z-10 h-px w-16 bg-[#b88c30] mx-auto mt-4" />
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 sm:p-10 space-y-6 sm:space-y-8 bg-[#0d1e30]">
          {/* AI Live Tracker */}
          <div className="p-5 sm:p-6 bg-[#b88c30]/5 rounded-2xl border border-[#b88c30]/20 relative overflow-hidden">
            <div className="absolute top-3 right-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#b88c30] animate-pulse" />
              <span className="text-[9px] font-black text-[#b88c30] uppercase tracking-widest">{t('AI Live Tracker')}</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-[#b88c30]/10 border border-[#b88c30]/20 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-[#b88c30]" />
              </div>
              <div className="space-y-2 text-left">
                <p className="font-black text-white text-base sm:text-lg leading-tight">{t('대상 연령 안내 (실시간 업데이트)')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#b88c30] text-[#0b192c] border-none font-black text-sm px-4 py-1 rounded-xl shadow-lg">
                    {t('만 15세 ~ 34세')}
                  </Badge>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">
                    <FileText className="h-4 w-4 text-[#b88c30]/60" />
                    <p className="text-sm font-black text-slate-200 leading-none">
                      {eligibilityRange.start} ~ {eligibilityRange.end}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-8">
            {/* 근무 기간 슬라이더 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-black text-slate-200">{t('최근 5년 한국 근무 기간')}</Label>
                <span className="text-2xl font-black text-[#b88c30]">{preFilterData.workMonths}{t('개월')}</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                id="step0-months-slider"
                value={preFilterData.workMonths}
                onChange={(e) => setPreFilterData({ ...preFilterData, workMonths: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#b88c30]"
              />
              <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <span>1 {t('개월')}</span>
                <span>30 {t('개월')}</span>
                <span>60 {t('개월')}</span>
              </div>
            </div>

            {/* 급여 선택 버튼 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-black text-slate-200">{t('평균 월 급여 (세전)')}</Label>
                <span className="text-2xl font-black text-[#b88c30]">{preFilterData.avgSalary}{t('만 원')}</span>
              </div>
              <div id="step0-salary-container" className="grid grid-cols-4 gap-2">
                {[150, 200, 250, 300, 350, 400, 500, 600].map((val, idx) => (
                  <Button
                    key={val}
                    id={`step0-salary-${idx}`}
                    onClick={() => setPreFilterData({ ...preFilterData, avgSalary: val })}
                    className={cn(
                      "h-12 font-black rounded-xl text-sm transition-all border",
                      preFilterData.avgSalary === val
                        ? "bg-[#b88c30] text-[#0b192c] border-[#b88c30] scale-105 shadow-lg"
                        : "bg-white/5 border-white/10 text-slate-400 hover:border-[#b88c30]/40 hover:text-white"
                    )}
                  >
                    {val === 600 ? '600+' : val}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 예상 환급 금액 박스 */}
          <div className="relative p-8 sm:p-10 rounded-2xl border border-[#b88c30]/20 text-center space-y-3 overflow-hidden bg-gradient-to-br from-[#b88c30]/10 to-transparent">
            <div className="absolute top-3 left-4 h-px w-6 bg-[#b88c30]/40" />
            <div className="absolute top-3 right-4 h-px w-6 bg-[#b88c30]/40" />
            <p className="text-xs font-black text-[#b88c30] uppercase tracking-[0.25em]">{t('AI 예상 환급 가능 금액')}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-black text-[#e2b659] font-headline animate-in zoom-in-50 duration-500">
                ₩ <RefundCounter value={preFilterEstimate} />
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed bg-white/5 py-2 px-4 rounded-full border border-white/10 inline-block">
              {t('* 실제 개인별 소득 공제 항목에 따라 차이가 발생할 수 있습니다.')}
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-4 pt-2">
            {/* 무료 안심 배지 */}
            <div className="flex items-center gap-3 p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/30">
              <div className="h-8 w-8 bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-[13px] font-black text-emerald-400 leading-tight">
                {t('예상 환급액을 확인하는 데는 비용이 전혀 들지 않습니다. 안심하고 확인해 보세요.')}
              </p>
            </div>

            {/* 메인 CTA 버튼 */}
            <Button
              id="step0-submit-btn"
              onClick={onNext}
              className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-2xl shadow-2xl shadow-[#b88c30]/20 flex items-center justify-center flex-wrap gap-4 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="flex-1 text-left">{t('이어서 정밀 진단 시작하기')}</span>
              <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-2 shrink-0" />
            </Button>

            <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="h-3 w-3 text-[#b88c30]" /> {t('9 step precision diagnostic flow initiated')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
