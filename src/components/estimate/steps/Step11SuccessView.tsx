import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step11SuccessViewProps {
  formData: {
    officialName: string;
    bankName: string;
    accountNumber: string;
    [key: string]: any;
  };
  result: any;
  preFilterEstimate: number;
  onRestart: () => void;
}

export function Step11SuccessView({
  formData,
  result,
  preFilterEstimate,
  onRestart
}: Step11SuccessViewProps) {
  const { t } = useTranslation();

  return (
    <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
      <CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldCheck className="h-64 w-64 text-primary" />
        </div>
        <div className="mx-auto h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-3xl sm:text-4xl font-black font-headline tracking-tight px-4 leading-tight">
          {t('신청이 성공적으로 접수되었습니다')}
        </CardTitle>
        <CardDescription className="text-slate-400 font-bold text-sm mt-3">
          {t('전문 세무사가 검토를 시작합니다. 1~2개월 이내에 환급금이 지급됩니다.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-12 text-center space-y-4 sm:space-y-6">
        {/* 김준현 매니저의 감사 마무리 카드 */}
        <div className="p-6 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-3xl border border-[#b88c30]/40 text-left text-white shadow-xl flex items-start gap-4">
          <div className="relative shrink-0 mt-1">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
              <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                {t('김준현 공식 매니저의 감사 인사')}
              </span>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                {t('신청 접수 성공')}
              </Badge>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              🎉 {t('소중한 환급 신청이 안전하게 국세청에 접수되었습니다!')}
            </p>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {t('타국에서 성실히 일하시느라 고생 많으셨습니다. 국세청에서 통장으로 입금되는 마지막 순간까지 제가 꼼꼼하게 챙겨드리겠습니다. 궁금하신 점이 있으시면 언제든지 1:1 상담을 찾아주세요! 감사합니다. 😊')}
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-lg font-black text-slate-800">{t('환급금 신청 내역 확인')}</p>
          <div className="mt-4 space-y-2 text-left text-sm text-slate-600 font-bold">
            <div className="flex justify-between">
              <span>{t('신청인')}</span>
              <span>{formData.officialName}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('지급 은행')}</span>
              <span>{formData.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('계좌 번호')}</span>
              <span>{formData.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('예상 환급금')}</span>
              <span className="text-primary font-black">
                ₩ {result?.refundEstimate?.toLocaleString() || preFilterEstimate.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={onRestart}
          className="w-full min-h-[4rem] h-auto py-4 px-6 bg-slate-900 text-white font-black rounded-2xl whitespace-normal break-words flex items-center justify-center text-center leading-tight"
        >
          {t('시뮬레이션 다시 하기')}
        </Button>
      </CardContent>
    </Card>
  );
}
