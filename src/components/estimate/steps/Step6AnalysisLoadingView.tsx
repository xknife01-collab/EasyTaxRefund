import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  Database,
  SearchX,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  MessageCircle,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

interface Step6AnalysisLoadingViewProps {
  analysisError: any;
  setAnalysisError: (err: any) => void;
  loadProgress: number;
  formData: {
    officialName: string;
    authName: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  nameSuggestions: Array<{ name: string; label: string }>;
  setStep: (step: number) => void;
  setIsGuideOpen: (open: boolean) => void;
  toast: any;
}

export function Step6AnalysisLoadingView({
  analysisError,
  setAnalysisError,
  loadProgress,
  formData,
  setFormData,
  nameSuggestions,
  setStep,
  setIsGuideOpen,
  toast
}: Step6AnalysisLoadingViewProps) {
  const { t } = useTranslation();

  if (!analysisError) {
    return (
      <Card className="rounded-2xl sm:rounded-[3rem] border-none shadow-2xl py-12 sm:py-24 text-center bg-[#0b192c] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
          <div className="h-full bg-gradient-to-r from-[#b88c30] to-[#cfa54c] animate-[loading_3s_ease-in-out_infinite]" style={{ width: '60%' }} />
        </div>
        {/* 배경 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
            backgroundSize: "30px 30px"
          }}
        />
        <CardContent className="space-y-10 relative z-10">
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <div className="absolute -inset-4 bg-[#b88c30]/15 rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-3xl p-3 overflow-hidden shadow-2xl border border-[#b88c30]/30 flex items-center justify-center">
              <Image
                src="/nts-logo.jpg"
                alt="Official NTS Logo"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
                {t('데이터를 분석 중입니다.')}
              </h2>
              <p className="text-slate-400 text-sm font-bold">{t('잠시만 기다려 주세요.')}</p>
            </div>

            <div className="max-w-[380px] mx-auto space-y-5 text-left border-l border-[#b88c30]/20 pl-6 sm:pl-8 py-2">
              {/* Step 1: 국세청 홈택스 보안 터널 연결 */}
              <div className={cn(
                "flex items-center gap-3 font-bold transition-all duration-300",
                loadProgress > 0 ? "text-emerald-400" : "text-white animate-pulse"
              )}>
                {loadProgress > 0 ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-[#b88c30] shrink-0" />
                )}
                <span className="text-sm sm:text-base">{t('국세청 홈택스 보안 터널을 연결하는 중...')}</span>
              </div>

              {/* Step 2: 최근 5개년 근로소득 납부 세액 조회 */}
              <div className={cn(
                "flex items-center gap-3 font-bold transition-all duration-300",
                loadProgress > 1 ? "text-emerald-400" : loadProgress === 1 ? "text-white animate-pulse" : "text-slate-500"
              )}>
                {loadProgress > 1 ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : loadProgress === 1 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#b88c30] shrink-0" />
                ) : (
                  <div className="relative h-5 w-5 flex items-center justify-center shrink-0">
                    <div className="absolute h-full w-full bg-white/5 rounded-full" />
                    <Database className="h-3 w-3" />
                  </div>
                )}
                <span className="text-sm sm:text-base">{t('최근 5개년 근로소득 납부 세액 조회 중...')}</span>
              </div>

              {/* Step 3: 중소기업 취업자 감면 자격 조회 */}
              <div className={cn(
                "flex items-center gap-3 font-bold transition-all duration-300",
                loadProgress > 2 ? "text-emerald-400" : loadProgress === 2 ? "text-white animate-pulse" : "text-slate-500"
              )}>
                {loadProgress > 2 ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : loadProgress === 2 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#b88c30] shrink-0" />
                ) : (
                  <div className="relative h-5 w-5 flex items-center justify-center shrink-0">
                    <div className="absolute h-full w-full bg-white/5 rounded-full" />
                    <Database className="h-3 w-3" />
                  </div>
                )}
                <span className="text-sm sm:text-base">{t('중소기업 취업자 감면 자격(취업 당시 연령 및 기간) 조회 중...')}</span>
              </div>

              {/* Step 4: 최종 예상 환급금 보고서 분석 및 생성 */}
              <div className={cn(
                "flex items-center gap-3 font-bold transition-all duration-300",
                loadProgress > 3 ? "text-emerald-400" : loadProgress === 3 ? "text-white animate-pulse" : "text-slate-500"
              )}>
                {loadProgress > 3 ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : loadProgress === 3 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#b88c30] shrink-0" />
                ) : (
                  <div className="relative h-5 w-5 flex items-center justify-center shrink-0">
                    <div className="absolute h-full w-full bg-white/5 rounded-full" />
                    <Database className="h-3 w-3" />
                  </div>
                )}
                <span className="text-sm sm:text-base">{t('최종 예상 환급금 보고서 분석 및 생성 중...')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-[#0b192c] animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Header */}
      <CardHeader className="text-center py-8 sm:py-12 bg-[#0b192c] border-b border-[#b88c30]/20 relative overflow-hidden">
        {/* 배경 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
            backgroundSize: "40px 40px"
          }}
        />
        {/* 상단 골드 글로우 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 공식 배지 */}
        <div className="relative z-10 flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#b88c30]/60" />
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-400 text-[10px] font-black tracking-[0.25em] uppercase">
              {t('Step 06 — 오류 진단 리포트')}
            </span>
          </div>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#b88c30]/60" />
        </div>

        {/* 오류 아이콘 */}
        <div className="relative z-10 mx-auto mb-6 flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full border border-red-500/15 animate-pulse" />
            <div className="absolute -inset-2 rounded-full border border-red-500/25" />
            <div className="relative h-24 w-24 bg-[#1a0c0c] rounded-3xl overflow-hidden shadow-2xl border-2 border-red-500/40 flex items-center justify-center">
              <SearchX className="h-12 w-12 text-red-400" />
            </div>
          </div>
        </div>

        {/* 골드 구분선 */}
        <div className="relative z-10 flex items-center gap-3 px-6 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#b88c30]/30" />
          <div className="flex gap-1">
            <div className="h-1 w-1 rounded-full bg-red-400" />
            <div className="h-1 w-1 rounded-full bg-[#b88c30]/50" />
            <div className="h-1 w-1 rounded-full bg-red-400" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#b88c30]/30" />
        </div>

        <CardTitle className="text-2xl sm:text-3xl font-black text-white relative z-10">
          {t('AI 오류 진단 리포트')}
        </CardTitle>
        <p className="font-black text-red-400 text-sm mt-2 relative z-10">{analysisError.title}</p>
      </CardHeader>

      <CardContent className="p-4 sm:p-8 space-y-5 bg-[#0d1e30]">
        {/* NAME_MISMATCH: 이름 비교 */}
        {analysisError.code === "NAME_MISMATCH" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-[#b88c30] uppercase tracking-widest mb-2">{t('신분증상 성함')}</p>
              <p className="text-xl font-black text-white">{formData.officialName}</p>
            </div>
            <div className="p-4 bg-red-900/20 rounded-2xl border border-red-500/30 relative overflow-hidden">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">{t('현재 시도한 성함')}</p>
              <p className="text-xl font-black text-red-300">{formData.authName}</p>
              <div className="absolute top-2 right-2 opacity-20 rotate-12">
                <SearchX className="h-7 w-7 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* 원인 분석 */}
        <div className="p-5 bg-white/5 rounded-2xl border border-[#b88c30]/20 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <h4 className="font-black text-[#b88c30] text-sm tracking-wide uppercase">{t('분석된 원인 (Cause)')}</h4>
          </div>
          <div className="h-px bg-[#b88c30]/15" />
          <p className="text-slate-300 font-medium leading-relaxed text-sm">{analysisError.reason}</p>
        </div>

        {/* 해결책 */}
        <div className="p-5 bg-white/5 rounded-2xl border border-[#b88c30]/20 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#b88c30]/20 rounded-lg flex items-center justify-center shrink-0">
              <RotateCcw className="h-4 w-4 text-[#b88c30]" />
            </div>
            <h4 className="font-black text-[#b88c30] text-sm tracking-wide uppercase">{t('해결책 (Solution)')}</h4>
          </div>
          <div className="h-px bg-[#b88c30]/15" />
          <p className="text-slate-200 font-bold leading-relaxed text-sm">{analysisError.solution}</p>

          {analysisError.code === "NAME_MISMATCH" && nameSuggestions.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[#b88c30]/15 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t('다른 이름 조합으로 바로 시도하기')}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {nameSuggestions.filter(s => s.name !== formData.authName).map((s, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => {
                      setFormData((prev: any) => ({ ...prev, authName: s.name }));
                      setAnalysisError(null);
                      setStep(4);
                      navigator.clipboard.writeText(s.name);
                      toast({
                        title: t("이름 복사 완료"),
                        description: t("'{name}'이(가) 클립보드에 복사되었습니다. 다른 조합으로 다시 인증을 요청하세요.", { name: s.name })
                      });
                    }}
                    className="h-14 justify-between px-5 bg-white/5 border-[#b88c30]/30 hover:border-[#b88c30] hover:bg-[#b88c30]/10 text-slate-200 font-black rounded-xl group transition-all"
                  >
                    <span className="text-base text-white">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#b88c30]/70 group-hover:text-[#b88c30] transition-colors">{t(s.label)}</span>
                      <ArrowRight className="h-4 w-4 text-[#b88c30] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 pt-2">
          {analysisError.isHighValue && (
            <Button
              asChild
              className="w-full h-16 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-base font-black rounded-2xl shadow-xl shadow-[#b88c30]/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <a href="https://wa.me/821058648577" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-6 w-6" /> {t('전문 상담원에게 도움받기')}
              </a>
            </Button>
          )}

          {!analysisError.isHighValue && (
            <Button
              variant="outline"
              onClick={() => setIsGuideOpen(true)}
              className="w-full h-16 border-[#b88c30]/40 text-[#b88c30] hover:bg-[#b88c30]/10 hover:border-[#b88c30] text-base font-black rounded-2xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <Sparkles className="h-5 w-5" /> {t('AI 자가 해결 가이드 보기')}
            </Button>
          )}

          <Button
            onClick={() => setStep(3)}
            className={cn(
              "w-full h-16 text-base font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02]",
              analysisError.isHighValue
                ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                : "bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] shadow-[#b88c30]/20"
            )}
          >
            {t('이름 조합 다시 선택하기 (Step 3)')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setStep(4)}
            className="w-full h-12 font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('인증 방식 다시 선택하기')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
