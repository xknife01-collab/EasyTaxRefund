import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step7ResultViewProps {
  result: any;
  onPrev: () => void;
  onHome: () => void;
  onNext: () => void;
  isIdGenerating: boolean;
}

export function Step7ResultView({
  result,
  onPrev,
  onHome,
  onNext,
  isIdGenerating
}: Step7ResultViewProps) {
  const { t } = useTranslation();

  if (!result) {
    return (
      <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-[#0b192c] p-8 sm:p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 text-[#b88c30] animate-spin mb-6" />
        <h3 className="text-xl font-bold text-white">{t('환급 결과를 복구하는 중입니다...')}</h3>
        <p className="text-sm text-slate-400 mt-2">{t('잠시만 기다려 주세요.')}</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl sm:rounded-[3rem] border-none shadow-2xl overflow-hidden bg-[#0b192c]">
      <CardHeader className="text-center py-8 sm:py-16 bg-[#0b192c] border-b border-[#b88c30]/20 relative overflow-hidden">
        {/* 배경 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
            backgroundSize: "40px 40px"
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          className="absolute top-6 left-6 text-[#b88c30]/60 hover:text-[#b88c30] font-bold flex items-center z-10"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('이전')}
        </Button>
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-8 z-10">
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
        <CardTitle className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black font-headline text-white leading-tight relative z-10">
          {t(result.message, { amount: `₩${result.refundEstimate?.toLocaleString()}` })}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 sm:space-y-16 py-8 sm:py-16 px-4 sm:px-10 bg-[#0d1e30]">
        {result.caseType === 'A' && (
          <div className="text-center space-y-10">
            <div className="space-y-4">
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t('최종 예상 환급액')}</p>
              <h2 className="text-5xl sm:text-7xl font-black text-[#b88c30] font-headline">
                ₩ {result.refundEstimate?.toLocaleString()}
              </h2>
            </div>
            <div className="max-w-md mx-auto space-y-4 text-left p-8 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {t('연도별 상세 내역 (적격 여부 검증 완료)')}
              </p>
              <div className="space-y-3">
                {result.details?.map((detail: any, i: number) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-lg font-black text-slate-200">{detail.year}: ₩{detail.amount.toLocaleString()}</span>
                    <span className="text-[11px] font-bold text-[#b88c30]/80">{detail.company}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ★ 김준현 매니저의 100% 후불 정산 & 지금 0원 안심 배너 */}
            <div className="max-w-md mx-auto p-5 sm:p-6 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-3xl border-2 border-[#b88c30]/50 shadow-2xl relative overflow-hidden text-left">
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
                      {t('김준현 공식 매니저 안심 약속')}
                    </span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                      {t('지금 결제 0원 · 100% 후불제')}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-200 leading-relaxed">
                    🎉 {t('축하드립니다! 지금 신청하실 때 미리 입금하실 수수료는 전혀 없습니다 (0원!).')}
                  </p>
                  <div className="p-3.5 bg-[#0a1523]/90 rounded-2xl border border-[#b88c30]/30 space-y-2 text-left">
                    <div className="space-y-1">
                      <p className="text-[11.5px] font-black text-emerald-400 flex items-center gap-1.5">
                        <span>1️⃣</span>
                        <span>{t('선입금 0원! 통장에 돈 들어온 뒤에 정산')}</span>
                      </p>
                      <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                        {t('국세청에서 고객님 통장으로 환급금이 완전히 입금된 후에만 수수료가 정산됩니다.')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11.5px] font-black text-[#e2b659] flex items-center gap-1.5">
                        <span>2️⃣</span>
                        <span>{t('환급금 없으면 수수료 0원 (완전 무료)')}</span>
                      </p>
                      <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                        {t('만약 국세청에서 환급금이 승인되지 않으면 비용은 1원도 발생하지 않습니다.')}
                      </p>
                    </div>
                    <p className="text-[11px] font-bold text-[#e2b659] pt-1 border-t border-slate-800">
                      👉 {t('안심하시고 아래 버튼을 눌러 환급금을 입금받으실 통장 계좌를 등록해 주세요! 👍')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result.refundEstimate === 0 ? (
          <div className="space-y-6 text-center">
            <p className="text-lg lg:text-xl font-bold text-slate-300 py-8 px-4 bg-white/5 rounded-3xl border border-white/10 leading-relaxed shadow-sm">
              {t('올해 한국에서 근로하며 세금을 더 납부하신 후, 내년에 Korea Tax Refund Service를 통해 다시 조회해 보세요.')}
            </p>
            <Button
              onClick={onHome}
              className="w-full min-h-[5rem] h-auto py-4 px-6 bg-white/10 hover:bg-white/15 text-white text-xl lg:text-2xl font-black rounded-[2rem] shadow-sm flex items-center justify-center flex-wrap gap-4 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.02]"
            >
              <ArrowLeft className="h-6 w-6 text-slate-400" /> {t('홈으로 돌아가기')}
            </Button>
          </div>
        ) : (
          <Button
            id="step7-submit-btn"
            onClick={onNext}
            disabled={isIdGenerating}
            className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl lg:text-2xl font-black rounded-[2rem] shadow-2xl flex items-center justify-center flex-wrap gap-4 text-center leading-tight whitespace-normal break-words transition-transform active:scale-95 disabled:opacity-50"
          >
            {isIdGenerating ? (
              <>
                <Loader2 className="animate-spin h-8 w-8 text-[#0b192c]" />
                <span>{t('보안 계정 생성 중...')}</span>
              </>
            ) : (
              <>
                {t('지금 환급 신청하기')} <ArrowRight className="h-8 w-8 text-[#0b192c]" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
