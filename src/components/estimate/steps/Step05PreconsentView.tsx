import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step05PreconsentViewProps {
  onPrev: () => void;
  onNext: () => void;
}

export function Step05PreconsentView({
  onPrev,
  onNext
}: Step05PreconsentViewProps) {
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
        <CardHeader className="text-center py-8 sm:py-10 bg-[#0b192c] text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
              backgroundSize: "40px 40px"
            }}
          />

          {/* 이전 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            className="absolute top-5 left-5 text-[#b88c30]/60 hover:text-[#b88c30] font-bold flex items-center z-10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('이전')}
          </Button>

          {/* Official Badge */}
          <div className="relative z-10 flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#b88c30]" />
            <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/30 rounded-full px-4 py-1.5">
              <span className="text-[#b88c30] text-[10px] font-black tracking-[0.2em] uppercase">
                {t('공식 절차 안내')}
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

          <CardTitle className="relative z-10 text-2xl sm:text-3xl font-black tracking-tight px-4 leading-tight text-white">
            {t('숨은 세금 환급 과정 안내')}
          </CardTitle>
          <p className="relative z-10 text-slate-400 font-bold text-sm mt-3 leading-relaxed max-w-[320px] mx-auto">
            {t('안녕하세요! 숨은 세금 환급금을 찾아 통장으로 받기까지의 전체 핵심 4단계 과정을 안내해 드릴게요.')}
          </p>
          <div className="relative z-10 h-px w-16 bg-[#b88c30] mx-auto mt-4" />
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 sm:p-8 space-y-4 bg-[#0d1e30]">
          {/* Step 1 */}
          <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-[#b88c30]/30 transition-all">
            <div className="flex-shrink-0 h-10 w-10 bg-[#b88c30] text-[#0b192c] rounded-xl flex items-center justify-center font-black text-base shadow-lg shadow-[#b88c30]/20">
              01
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white text-left">
                  {t('1️⃣ [정부 필수] 신분증 확인 및 번호 입력')}
                </h4>
                <span className="text-[10px] text-[#b88c30] font-black shrink-0">{t('(Step 1~3)')}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed text-left">
                {t('대한민국 국세청(NTS)에서 세금 환급 승인을 위해 법적으로 요구하는 필수 절차입니다. 제출하신 신분증 사진은 본인 확인 즉시 시스템에서 영구 파기(저장 NO!)되며, 금융권 수준의 강력한 암호화 보안 기술로 안전하게 보호되니 안심하고 촬영해 주세요.')}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-[#b88c30]/30 transition-all">
            <div className="flex-shrink-0 h-10 w-10 bg-[#b88c30] text-[#0b192c] rounded-xl flex items-center justify-center font-black text-base shadow-lg shadow-[#b88c30]/20">
              02
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white text-left">
                  {t('2️⃣ [가장 중요] 본인 인증서 설치 및 인증')}
                </h4>
                <span className="text-[10px] text-[#b88c30] font-black shrink-0">{t('(Step 4~5)')}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed text-left">
                {t('한국 국세청(NTS) 전산망과 안전하게 연결하기 위해 카카오톡, PASS, 하나은행 등의 인증서로 본인 인증을 완료합니다. (인증서가 없으시면 1분 만에 발급받는 법을 친절히 안내해 드립니다.)')}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-[#b88c30]/30 transition-all">
            <div className="flex-shrink-0 h-10 w-10 bg-[#b88c30] text-[#0b192c] rounded-xl flex items-center justify-center font-black text-base shadow-lg shadow-[#b88c30]/20">
              03
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white text-left">
                  {t('3️⃣ 정확한 환급금 확인 및 후불 정산 등록')}
                </h4>
                <span className="text-[10px] text-[#b88c30] font-black shrink-0">{t('(Step 6~8)')}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed text-left">
                {t('최근 5년 동안 한국에서 일하며 더 낸 세금이 얼마인지 즉시 확인합니다. 환급금이 확인되면, 국세청에서 고객님 통장으로 환급금이 입금된 후에만 출금되는 후불제 정산(플랫폼 이용료 22%) 등록을 진행합니다. 환급 거절/실패 시 청구되는 금액은 0원입니다.')}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-[#b88c30]/30 transition-all">
            <div className="flex-shrink-0 h-10 w-10 bg-[#b88c30] text-[#0b192c] rounded-xl flex items-center justify-center font-black text-base shadow-lg shadow-[#b88c30]/20">
              04
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white text-left">
                  {t('4️⃣ 계약서 서명 및 입금 신청')}
                </h4>
                <span className="text-[10px] text-[#b88c30] font-black shrink-0">{t('(Step 9)')}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 leading-relaxed text-left">
                {t('후불 정산 등록 완료 후, 모바일 서명을 통해 정식 세무대리 수임계약서가 투명하고 안전하게 작성되며 환급금을 입금받으실 본인 통장 계좌번호를 입력합니다. 이후 약 1~2개월 뒤 한국 국세청에서 고객님의 통장으로 환급금을 직접 송금해 드립니다.')}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 space-y-3">
            <Button
              id="step05-submit-btn"
              onClick={onNext}
              className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-2xl shadow-2xl shadow-[#b88c30]/20 flex items-center justify-center flex-wrap gap-3 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="flex-1 text-left">{t('확인했습니다. 시작하기')}</span>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2 shrink-0" />
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
