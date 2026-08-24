import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";
import { EmbeddedAuthGuide } from "@/components/EmbeddedAuthGuide";

interface Step4AuthMethodViewProps {
  hasCertificate: boolean | null;
  setHasCertificate: (val: boolean | null) => void;
  authMethod: 'hana' | 'app' | 'kakao';
  setAuthMethod: (val: 'hana' | 'app' | 'kakao') => void;
  setHanaGuideMode: (mode: 'full' | 'registration' | 'auth') => void;
  setIsHanaGuideOpen: (open: boolean) => void;
  setIsKakaoGuideOpen: (open: boolean) => void;
  setIsGuideOpen: (open: boolean) => void;
  handleInitiateAuth: () => void;
  loading: boolean;
  onPrevFromRoot: () => void;
}

export function Step4AuthMethodView({
  hasCertificate,
  setHasCertificate,
  authMethod,
  setAuthMethod,
  setHanaGuideMode,
  setIsHanaGuideOpen,
  setIsKakaoGuideOpen,
  setIsGuideOpen,
  handleInitiateAuth,
  loading,
  onPrevFromRoot
}: Step4AuthMethodViewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#b88c30] rounded-tl-3xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b88c30] rounded-tr-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#b88c30] rounded-bl-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#b88c30] rounded-br-3xl z-10 pointer-events-none" />

      <Card className="rounded-3xl border border-[#b88c30]/30 shadow-2xl overflow-hidden bg-[#0b192c]">
        {hasCertificate === null ? (
          <>
            {/* ★ 프리미엄 관공서 스타일 Step 4 헤더 */}
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-[#b88c30]/15 rounded-full blur-3xl pointer-events-none" />

              {/* 이전 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevFromRoot}
                className="absolute top-6 left-6 text-[#b88c30]/60 hover:text-[#b88c30] font-bold flex items-center z-10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('이전')}
              </Button>

              {/* 공식 배지 */}
              <div className="relative z-10 flex items-center justify-center gap-3 mb-7">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#b88c30]/60" />
                <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/40 rounded-full px-5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b88c30] animate-pulse" />
                  <span className="text-[#b88c30] text-[10px] font-black tracking-[0.25em] uppercase">
                    {t('Step 04 — 본인 인증')}
                  </span>
                </div>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#b88c30]/60" />
              </div>

              {/* ★ 국세청 로고 — 중앙 크게 */}
              <div className="relative z-10 mx-auto mb-7 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-5 rounded-full border border-[#b88c30]/15 animate-pulse" />
                  <div className="absolute -inset-3 rounded-full border border-[#b88c30]/25" />
                  <div className="relative h-28 w-28 bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#b88c30]/50">
                    <img src="/nts-logo.jpg" alt={t("국세청")} className="w-full h-full object-contain p-3" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#b88c30] rounded-full flex items-center justify-center border-2 border-[#0b192c] shadow-xl">
                    <ShieldCheck className="h-4 w-4 text-[#0b192c]" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-[#b88c30]/50" />
                    <span className="text-[10px] font-black text-[#b88c30]/80 uppercase tracking-[0.3em]">
                      {t('국세청 / NTS')}
                    </span>
                    <div className="h-px w-8 bg-[#b88c30]/50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest">NATIONAL TAX SERVICE KOREA</span>
                </div>
              </div>

              {/* 골드 구분선 */}
              <div className="relative z-10 flex items-center gap-3 px-6 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#b88c30]/40" />
                <div className="flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]" />
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]/50" />
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#b88c30]/40" />
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-black text-white break-keep relative z-10">
                {t('인증서가 스마트폰에 설치되어 있나요?')}
              </CardTitle>
              <p className="font-bold text-slate-400 text-sm mt-3 relative z-10 max-w-md mx-auto leading-relaxed">
                {t('한국 사이트 로그인 시 카카오톡, PASS 앱 또는 하나 원큐인증서로 [인증 요청 알림]을 받아 승인해 보신 적이 있는지 확인해 주세요.')}
              </p>

              {/* 지원 인증서 배지 */}
              <div className="relative z-10 mt-5 flex flex-col items-center gap-3">
                <span className="text-[10px] font-black text-[#b88c30]/70 uppercase tracking-[0.2em]">{t('지원 인증서')}</span>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[
                    { src: "/images/logo/hana_1q.png", label: t("하나은행") },
                    { src: "/images/logo/pass.png", label: "PASS" },
                    { src: "/images/logo/kakao.png", label: t("카카오톡") },
                  ].map(({ src, label }) => (
                    <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-[#b88c30]/20 px-3 py-1.5 rounded-full">
                      <Image src={src} alt={label} width={14} height={14} className="object-contain" />
                      <span className="text-[11px] font-black text-slate-300">{t(label)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>

            {/* 선택 카드 */}
            <CardContent className="p-5 sm:p-8 space-y-4 bg-[#0d1e30]">
              {/* 김준현 매니저 안내 가이드 */}
              <div className="p-5 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-2xl border-2 border-[#b88c30]/50 shadow-lg relative overflow-hidden text-left">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
                      <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                        {t('김준현 공식 매니저 안심 가이드')}
                      </span>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                        {t('1:1 맞춤 지원')}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-relaxed">
                      💬 {t('한국 사이트 로그인할 때 카카오톡이나 PASS 앱 또는 하나 원큐인증서로 [인증 요청 알림]을 받아서 승인(전자서명)해 보신 적이 있나요? 🔐')}
                    </p>
                    <div className="p-3 bg-[#0a1523]/80 rounded-xl border border-[#b88c30]/30 space-y-1.5 text-left">
                      <p className="text-[11.5px] font-medium text-emerald-400 leading-relaxed">
                        👉 <strong>[{t('네')}]</strong>: {t('카카오페이 인증서, PASS 인증서, 하나 원큐인증서를 따로 발급받아 써보신 분만 선택해 주세요!')}
                      </p>
                      <p className="text-[11.5px] font-medium text-[#e2b659] leading-relaxed">
                        👉 <strong>[{t('아니오 (추천!)')}]</strong>: {t('통장 비밀번호와 다른 것입니다! 조금이라도 헷갈리거나 처음 들어보신다면 무조건 [아니오]를 눌러주세요. 인증서를 쉽게 발급받는 방법을 안내해 드릴게요! 👍')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* YES 카드 */}
                <div
                  id="step4-cert-yes"
                  onClick={() => setHasCertificate(true)}
                  className="group relative p-6 rounded-2xl border border-emerald-800/30 hover:border-emerald-500/60 cursor-pointer transition-all flex items-center gap-5 bg-emerald-950/20 hover:bg-emerald-950/40 shadow-sm hover:shadow-emerald-900/20 hover:shadow-lg"
                >
                  <div className="h-14 w-14 bg-emerald-900/40 border border-emerald-700/40 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-black text-lg text-white leading-tight">
                      {t('네, 이미 가입된 인증서가 있습니다.')}
                    </h4>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      {t('카카오페이, PASS, 하나 원큐인증서를 따로 발급받아 인증 알림을 받아본 적이 있습니다.')}
                    </p>
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-full border border-emerald-700/40 flex items-center justify-center group-hover:bg-emerald-800/30 transition-colors">
                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>

                {/* NO 카드 */}
                <div
                  id="step4-cert-no"
                  onClick={() => setHasCertificate(false)}
                  className="group relative p-6 rounded-2xl border border-amber-800/30 hover:border-amber-500/60 cursor-pointer transition-all flex items-center gap-5 bg-amber-950/20 hover:bg-amber-950/40 shadow-sm hover:shadow-amber-900/20 hover:shadow-lg"
                >
                  <div className="h-14 w-14 bg-amber-900/40 border border-amber-700/40 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <AlertCircle className="h-8 w-8 text-amber-400 animate-pulse" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg text-white leading-tight">
                        {t('아니오, 인증서가 없거나 잘 모르겠습니다 (추천)')}
                      </h4>
                      <Badge className="bg-[#b88c30]/20 text-[#e2b659] border border-[#b88c30]/40 text-[9px] font-black">
                        {t('추천')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      {t('통장 비밀번호와 다릅니다. 인증서를 쉽게 발급받는 방법을 친절히 안내해 드립니다.')}
                    </p>
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-full border border-amber-700/40 flex items-center justify-center group-hover:bg-amber-800/30 transition-colors">
                    <ArrowRight className="h-4 w-4 text-[#b88c30]" />
                  </div>
                </div>
              </div>

              {/* 하단 국세청 신뢰 배지 */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-[#b88c30]/15" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-[#b88c30]/20">
                    <img src="/nts-logo.jpg" alt="NTS" className="h-4 w-4 object-contain" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {t('국세청 공식 인증 연동')}
                  </span>
                </div>
                <div className="flex-1 h-px bg-[#b88c30]/15" />
              </div>
            </CardContent>
          </>
        ) : hasCertificate === false ? (
          <>
            <CardHeader className="text-center py-8 sm:py-12 bg-[#0b192c] border-b border-[#b88c30]/20 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
                  backgroundSize: "40px 40px"
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-[#b88c30]/15 rounded-full blur-3xl pointer-events-none" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasCertificate(null)}
                className="absolute top-6 left-6 text-[#b88c30]/60 hover:text-[#b88c30] font-bold flex items-center z-10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('이전')}
              </Button>

              {/* 공식 배지 */}
              <div className="relative z-10 flex items-center justify-center gap-3 mb-7">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#b88c30]/60" />
                <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/40 rounded-full px-5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b88c30] animate-pulse" />
                  <span className="text-[#b88c30] text-[10px] font-black tracking-[0.25em] uppercase">
                    {t('Step 04 — 인증서 발급')}
                  </span>
                </div>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#b88c30]/60" />
              </div>

              {/* 국세청 로고 */}
              <div className="relative z-10 mx-auto mb-7 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-5 rounded-full border border-[#b88c30]/15 animate-pulse" />
                  <div className="absolute -inset-3 rounded-full border border-[#b88c30]/25" />
                  <div className="relative h-28 w-28 bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#b88c30]/50">
                    <img src="/nts-logo.jpg" alt={t("국세청")} className="w-full h-full object-contain p-3" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#b88c30] rounded-full flex items-center justify-center border-2 border-[#0b192c] shadow-xl">
                    <ShieldCheck className="h-4 w-4 text-[#0b192c]" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-[#b88c30]/50" />
                    <span className="text-[10px] font-black text-[#b88c30]/80 uppercase tracking-[0.3em]">
                      {t('국세청 / NTS')}
                    </span>
                    <div className="h-px w-8 bg-[#b88c30]/50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest">NATIONAL TAX SERVICE KOREA</span>
                </div>
              </div>

              {/* 골드 구분선 */}
              <div className="relative z-10 flex items-center gap-3 px-6 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#b88c30]/40" />
                <div className="flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]" />
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]/50" />
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#b88c30]/40" />
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-black text-white break-keep relative z-10">
                {t('1분 만에 무료 인증서 발급받기')}
              </CardTitle>
              <p className="font-bold text-slate-400 text-sm mt-2 relative z-10 max-w-md mx-auto leading-relaxed">
                {t('아래 중 가장 편리한 앱을 선택하시면 사진과 함께 1분 발급 방법을 쉽게 안내해 드립니다.')}
              </p>
            </CardHeader>

            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-[#0d1e30]">
              {/* 김준현 매니저 가이드 */}
              <div className="p-5 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-2xl border-2 border-[#b88c30]/50 shadow-lg relative overflow-hidden text-left">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
                      <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                        {t('김준현 공식 매니저 안심 가이드')}
                      </span>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                        {t('100% 무료 · 1분 발급')}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-relaxed">
                      💬 {t('인증서 발급은 100% 무료이며 1분이면 끝납니다! 가장 편한 방법을 골라주세요. 🔐')}
                    </p>
                    <div className="p-3 bg-[#0a1523]/80 rounded-xl border border-[#b88c30]/30 space-y-2 text-left">
                      <div className="space-y-1">
                        <p className="text-[11.5px] font-black text-[#008485] flex items-center gap-1.5">
                          <span>🥇</span>
                          <span>{t('하나은행 추천 (외국어 지원 1등)')}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                          {t('하나은행 통장이나 앱을 쓰고 계시다면 [하나은행]을 가장 추천합니다!')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11.5px] font-black text-red-400 flex items-center gap-1.5">
                          <span>🥈</span>
                          <span>{t('PASS 추천 (통장 없을 때 차선책)')}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                          {t('하나은행이 없다면 [PASS]를 선택해 주세요! 통신사 번호로 1분 만에 발급됩니다.')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11.5px] font-black text-[#e2b659] flex items-center gap-1.5">
                          <span>🥉</span>
                          <span>{t('카카오톡')}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                          {t('카카오페이를 평소에 자주 쓰시는 분께 추천합니다.')}
                        </p>
                      </div>
                      <div className="p-2.5 bg-[#b88c30]/15 border border-[#b88c30]/40 rounded-xl space-y-1">
                        <p className="text-[11.5px] font-black text-white flex items-center gap-1.5">
                          <Maximize2 className="h-3.5 w-3.5 text-[#e2b659]" />
                          <span>{t('🔍 화면을 클릭(터치)하면 큰 전체화면으로 더 쉽게 보실 수 있습니다!')}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-300 leading-relaxed pl-5">
                          {t('선택 후 아래 가이드 이미지를 누르면 확대된 전체화면으로 편하게 따라 하실 수 있습니다.')}
                        </p>
                      </div>
                      <p className="text-[11px] font-bold text-[#e2b659] pt-1 border-t border-slate-800">
                        👉 {t('발급을 마치신 뒤, 맨 아래 [설치 및 가입 완료] 버튼을 눌러주세요! 👍')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Tabs in Guide Mode */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Hana */}
                <div
                  onClick={() => setAuthMethod('hana')}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative",
                    authMethod === 'hana' ? "bg-emerald-950/40 border-[#008485] shadow-lg shadow-[#008485]/10" : "bg-white/5 border-white/10 hover:border-slate-500 text-slate-400"
                  )}
                >
                  <span className="absolute -top-2.5 bg-[#008485] text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {t('1순위 추천')}
                  </span>
                  <Image src="/images/logo/hana_1q.png" alt="Hana" width={32} height={32} className="object-contain mt-1" />
                  <span className={cn("text-xs font-black", authMethod === 'hana' ? "text-[#008485]" : "text-slate-400")}>{t('하나은행')}</span>
                </div>
                {/* PASS */}
                <div
                  onClick={() => setAuthMethod('app')}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative",
                    authMethod === 'app' ? "bg-red-950/40 border-red-500 shadow-lg shadow-red-500/10" : "bg-white/5 border-white/10 hover:border-slate-500 text-slate-400"
                  )}
                >
                  <span className="absolute -top-2.5 bg-red-600 text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {t('2순위 추천')}
                  </span>
                  <Image src="/images/logo/pass.png" alt="PASS" width={32} height={32} className="object-contain mt-1" />
                  <span className={cn("text-xs font-black", authMethod === 'app' ? "text-red-400" : "text-slate-400")}>{t('PASS')}</span>
                </div>
                {/* Kakao */}
                <div
                  onClick={() => setAuthMethod('kakao')}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 relative",
                    authMethod === 'kakao' ? "bg-amber-950/30 border-[#b88c30] shadow-lg shadow-[#b88c30]/10" : "bg-white/5 border-white/10 hover:border-slate-500 text-slate-400"
                  )}
                >
                  <Image src="/images/logo/kakao.png" alt="Kakao" width={32} height={32} className="object-contain mt-1" />
                  <span className={cn("text-xs font-black", authMethod === 'kakao' ? "text-[#e2b659]" : "text-slate-400")}>{t('카카오톡')}</span>
                </div>
              </div>

              {/* Guide Component */}
              {authMethod && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-4 duration-500 space-y-2">
                  <div
                    onClick={() => {
                      if (authMethod === 'hana') {
                        setHanaGuideMode('full');
                        setIsHanaGuideOpen(true);
                      } else if (authMethod === 'kakao') {
                        setIsKakaoGuideOpen(true);
                      } else {
                        setIsGuideOpen(true);
                      }
                    }}
                    className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#0f2441] to-[#153258] hover:from-[#153258] hover:to-[#1b3f70] border border-[#b88c30]/50 rounded-2xl cursor-pointer transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-[#b88c30]/20 rounded-xl flex items-center justify-center text-[#e2b659] group-hover:scale-110 transition-transform">
                        <Maximize2 className="h-4 w-4 text-[#e2b659]" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-white group-hover:text-[#e2b659] transition-colors">
                          {t('화면을 클릭하면 큰 전체화면으로 볼 수 있어요!')}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {t('글씨와 이미지가 크게 확대되어 따라하기가 훨씬 쉽습니다.')}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#0b192c] bg-[#b88c30] group-hover:bg-[#cfa54c] px-3 py-1.5 rounded-full shrink-0 shadow-sm flex items-center gap-1">
                      <span>{t('전체화면')}</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>

                  <EmbeddedAuthGuide
                    authMethod={authMethod}
                    mode="registration"
                    onClick={() => {
                      if (authMethod === 'hana') {
                        setHanaGuideMode('full');
                        setIsHanaGuideOpen(true);
                      } else if (authMethod === 'kakao') {
                        setIsKakaoGuideOpen(true);
                      } else {
                        setIsGuideOpen(true);
                      }
                    }}
                  />
                </div>
              )}

              <Button
                id="step4-cert-complete-btn"
                onClick={() => setHasCertificate(true)}
                className="w-full h-[5rem] bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl sm:text-2xl font-black rounded-2xl shadow-xl shadow-[#b88c30]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {t('인증서 설치 및 가입을 완료했습니다')}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setHasCertificate(true)}
                  className="text-sm font-bold text-[#e2b659] hover:text-[#e2b659]/80 underline transition-colors"
                >
                  {t('인증서가 있습니다. 바로 시작하기')}
                </button>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center py-8 sm:py-12 bg-[#0b192c] border-b border-[#b88c30]/20 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
                  backgroundSize: "40px 40px"
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-[#b88c30]/15 rounded-full blur-3xl pointer-events-none" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHasCertificate(null)}
                className="absolute top-6 left-6 text-[#b88c30]/60 hover:text-[#b88c30] font-bold flex items-center z-10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('이전')}
              </Button>

              {/* 공식 배지 */}
              <div className="relative z-10 flex items-center justify-center gap-3 mb-7">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#b88c30]/60" />
                <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/40 rounded-full px-5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b88c30] animate-pulse" />
                  <span className="text-[#b88c30] text-[10px] font-black tracking-[0.25em] uppercase">
                    {t('Step 04 — 인증 방식 선택')}
                  </span>
                </div>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#b88c30]/60" />
              </div>

              {/* 국세청 로고 중앙 배치 */}
              <div className="relative z-10 mx-auto mb-7 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -inset-5 rounded-full border border-[#b88c30]/15 animate-pulse" />
                  <div className="absolute -inset-3 rounded-full border border-[#b88c30]/25" />
                  <div className="relative h-28 w-28 bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#b88c30]/50">
                    <img src="/nts-logo.jpg" alt={t("국세청")} className="w-full h-full object-contain p-3" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#b88c30] rounded-full flex items-center justify-center border-2 border-[#0b192c] shadow-xl">
                    <ShieldCheck className="h-4 w-4 text-[#0b192c]" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-[#b88c30]/50" />
                    <span className="text-[10px] font-black text-[#b88c30]/80 uppercase tracking-[0.3em]">
                      {t('국세청 / NTS')}
                    </span>
                    <div className="h-px w-8 bg-[#b88c30]/50" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest">NATIONAL TAX SERVICE KOREA</span>
                </div>
              </div>

              {/* 골드 구분선 */}
              <div className="relative z-10 flex items-center gap-3 px-6 mb-5">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#b88c30]/40" />
                <div className="flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]" />
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]/50" />
                  <div className="h-1 w-1 rounded-full bg-[#b88c30]" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#b88c30]/40" />
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-black text-white break-keep relative z-10">
                {t('Step 4: 인증 방식 선택')}
              </CardTitle>
              <p className="font-bold text-slate-400 text-sm mt-3 relative z-10 max-w-sm mx-auto">
                {t('가장 편리한 방법으로 본인을 인증해 주세요.')}
              </p>
            </CardHeader>

            <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-[#0d1e30]">
              {/* 김준현 매니저 안내 가이드 */}
              <div className="p-5 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-2xl border-2 border-[#b88c30]/50 shadow-lg relative overflow-hidden text-left">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
                      <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                        {t('김준현 공식 매니저 안심 가이드')}
                      </span>
                      <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                        {t('인증 요청 전 필독')}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-relaxed">
                      💬 {t('아래 [인증 요청하기]를 누르시기 전 꼭 확인해 주세요! 🔐')}
                    </p>
                    <div className="p-3.5 bg-[#0a1523]/90 rounded-xl border border-[#b88c30]/30 space-y-2 text-left">
                      <div className="space-y-1">
                        <p className="text-[11.5px] font-black text-emerald-400 flex items-center gap-1.5">
                          <span>1️⃣</span>
                          <span>{t('선택하신 스마트폰 앱으로 인증 알림이 도착합니다!')}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                          {t('[인증 요청하기]를 누르면 고객님의 휴대폰(하나은행/PASS/카카오톡)으로 인증 푸시 알림이 즉시 전송됩니다.')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11.5px] font-black text-[#e2b659] flex items-center gap-1.5">
                          <span>2️⃣</span>
                          <span>{t('해당 앱을 열어 비밀번호를 누르고 [승인]해 주세요!')}</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                          {t('알림을 누르고 앱에서 승인(전자서명)을 완료하셔야 국세청 실시간 환급금 조회가 정상 진행됩니다.')}
                        </p>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                          💡 {t('혹시 인증서가 없거나 오류가 난다면, 하단의 [인증서가 없으신가요? (추천)]을 눌러 1분 만에 무료로 발급받으실 수 있습니다! 👍')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Hana Bank Card */}
                <div
                  id="step4-method-hana"
                  onClick={() => setAuthMethod('hana')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 relative overflow-hidden",
                    authMethod === 'hana' ? "bg-emerald-950/40 border-[#008485] shadow-lg shadow-emerald-500/10" : "bg-white/5 border-white/10 hover:border-[#b88c30]/30"
                  )}
                >
                  {authMethod === 'hana' && (
                    <div className="absolute top-0 right-0 p-1 px-3 bg-[#008485] text-white text-[10px] font-black rounded-bl-xl uppercase">
                      {t('외국인 추천')}
                    </div>
                  )}
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", authMethod === 'hana' ? "bg-white p-2" : "bg-white/10 text-slate-400 p-3")}>
                    <Image src="/images/logo/hana_1q.png" alt="Hana" width={40} height={40} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={cn("font-black text-lg", authMethod === 'hana' ? "text-emerald-400" : "text-white")}>
                        {t('하나은행 인증서')}
                      </h4>
                      {authMethod === 'hana' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">{t("하나은행 앱이 있다면 가장 간편해요")}</p>
                  </div>
                </div>

                {/* PASS Card */}
                <div
                  id="step4-method-pass"
                  onClick={() => setAuthMethod('app')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 relative overflow-hidden",
                    authMethod === 'app' ? "bg-red-950/40 border-red-500 shadow-lg shadow-red-500/10" : "bg-white/5 border-white/10 hover:border-[#b88c30]/30"
                  )}
                >
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", authMethod === 'app' ? "bg-white p-2" : "bg-white/10 text-slate-400 p-3")}>
                    <Image src="/images/logo/pass.png" alt="PASS" width={40} height={40} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={cn("font-black text-lg", authMethod === 'app' ? "text-red-400" : "text-white")}>
                        {t('PASS 앱 설치 유저')}
                      </h4>
                      {authMethod === 'app' && <CheckCircle2 className="h-5 w-5 text-red-500" />}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">{t("SKT, KT, LG 유저 휴대폰인증")}</p>
                  </div>
                </div>

                {/* Kakao Card */}
                <div
                  id="step4-method-kakao"
                  onClick={() => setAuthMethod('kakao')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 relative overflow-hidden",
                    authMethod === 'kakao' ? "bg-amber-950/30 border-[#b88c30] shadow-lg shadow-amber-500/10" : "bg-white/5 border-white/10 hover:border-[#b88c30]/30"
                  )}
                >
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", authMethod === 'kakao' ? "bg-white p-2" : "bg-white/10 text-slate-400 p-3")}>
                    <Image src="/images/logo/kakao.png" alt="Kakao" width={40} height={40} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={cn("font-black text-lg", authMethod === 'kakao' ? "text-[#e2b659]" : "text-white")}>
                        {t('카카오톡 인증')}
                      </h4>
                      {authMethod === 'kakao' && <CheckCircle2 className="h-5 w-5 text-[#e2b659]" />}
                    </div>
                    <p className={cn("text-sm font-medium", authMethod === 'kakao' ? "text-slate-300" : "text-slate-400")}>{t("카카오페이 지갑 이용자 추천")}</p>
                  </div>
                </div>
              </div>

              <Button
                id="step4-submit-btn"
                onClick={handleInitiateAuth}
                className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-2xl font-black rounded-2xl shadow-xl shadow-[#b88c30]/20 hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-normal break-words flex items-center justify-center text-center leading-tight"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 요청하기')}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setHasCertificate(false)}
                  className="text-sm font-bold text-[#e2b659] hover:text-[#e2b659]/80 underline transition-colors"
                >
                  {t('인증서가 없으신가요? (추천)')}
                </button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
