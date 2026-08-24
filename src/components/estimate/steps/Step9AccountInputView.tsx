import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step9AccountInputViewProps {
  onPrev: () => void;
  result: any;
  formData: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    authName: string;
    officialName: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  bankSelectOpen: boolean;
  setBankSelectOpen: (open: boolean) => void;
  BANK_LOGOS: Record<string, React.ReactNode>;
  is1WonSent: boolean;
  onNext: () => void;
  onReAuth: () => void;
}

export function Step9AccountInputView({
  onPrev,
  result,
  formData,
  setFormData,
  bankSelectOpen,
  setBankSelectOpen,
  BANK_LOGOS,
  is1WonSent,
  onNext,
  onReAuth
}: Step9AccountInputViewProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-[#0b192c] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <CardHeader className="text-center py-6 sm:py-12 bg-[#0b192c] border-b border-[#b88c30]/20 relative overflow-hidden">
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
        <CardTitle className="text-3xl font-black font-headline text-white relative z-10">
          {t('Step 9: 환급 계좌 등록 및 1원 인증')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-10 p-4 sm:p-10 bg-[#0d1e30]">
        {/* 환급 예정액 요약 */}
        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-[#b88c30]/20 shadow-inner space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-400">{t('총 환급 예정액')}</span>
            <span className="text-2xl font-black text-white">₩ {result?.refundEstimate?.toLocaleString() || 0}</span>
          </div>
          <Separator className="bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="font-black text-slate-300 text-xl">{t('환급액 입금후 수수료(성과보수 22%)')}</span>
            <span className="text-3xl font-black text-[#b88c30]">
              ₩ {(Math.floor((result?.refundEstimate || 0) * 0.22)).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 법적 안내 */}
        <Alert className="bg-amber-950/20 border-amber-800/30 rounded-3xl p-8 shadow-sm">
          <AlertCircle className="h-6 w-6 text-amber-400 shrink-0" />
          <div className="ml-4">
            <AlertTitle className="text-amber-400 font-black text-lg mb-2">{t('Legal Policy (후불 정산 및 CMS 자동 출금 동의)')}</AlertTitle>
            <AlertDescription className="text-amber-500/80 font-bold text-base leading-relaxed">
              {t("지금 결제되는 금액은 0원입니다. 22% 이용료는 고객님 통장으로 국세청 환급금이 입금된 것이 확인된 이후에만 등록하신 이 계좌에서 출금(정산)됩니다. 환급금이 없거나 거절되는 경우 청구 금액은 0원이며 수수료는 발생하지 않습니다. 국세청 환급계좌 유효성 검증 및 CMS 출금 동의를 위해 본인 계좌 1원 송금 인증이 필요합니다.")}
            </AlertDescription>
          </div>
        </Alert>

        {/* 계좌 정보 입력 */}
        <div className="space-y-8">
          <Label className="text-xl font-black text-white">{t('계좌 정보 입력')}</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs font-black text-[#b88c30] uppercase tracking-widest ml-1">{t('은행명')}</Label>
              <Select open={bankSelectOpen} onOpenChange={setBankSelectOpen} onValueChange={(v) => setFormData((prev: any) => ({ ...prev, bankName: v }))} value={formData.bankName}>
                <SelectTrigger id="step9-bank-select" className="h-16 rounded-2xl font-bold bg-white/5 border border-white/10 text-white px-6 text-lg w-full outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30]">
                  <SelectValue placeholder={t("은행 선택")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(BANK_LOGOS).map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      <div className="flex items-center gap-3">
                        {BANK_LOGOS[bank]}
                        <span className="font-bold">{t(bank)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('계좌번호')}</Label>
              <input
                id="step9-account-input"
                placeholder={t('계좌번호를 입력하세요')}
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, accountNumber: e.target.value }))}
                disabled={is1WonSent}
                className="h-16 rounded-2xl font-bold bg-white/5 border border-white/10 text-white px-6 text-lg w-full outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30] disabled:opacity-50 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('예금주명')}</Label>
              <button
                type="button"
                onClick={onReAuth}
                className="text-xs font-bold text-[#b88c30] hover:underline"
              >
                {t('본인인증 다시 하기')} &rarr;
              </button>
            </div>
            <input
              id="step9-holder-input"
              placeholder={t('계좌의 예금주 성함을 입력하세요')}
              value={formData.accountHolder}
              readOnly
              disabled={is1WonSent}
              className="h-16 rounded-2xl font-bold bg-white/5 border border-white/10 text-slate-400 px-6 text-lg w-full outline-none cursor-not-allowed opacity-80"
            />
            <p className="text-xs font-bold text-slate-500 ml-1">
              {t('* 타인 계좌 무단 도용 방지를 위해 본인인증 성명({name})과 동일한 예금주의 계좌만 등록 가능합니다.', { name: formData.authName || formData.officialName || '' })}
            </p>
          </div>
        </div>

        <Button
          id="step9-next-btn"
          onClick={onNext}
          disabled={!formData.bankName || !formData.accountNumber.trim()}
          className="w-full h-20 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-[2rem] shadow-xl shadow-[#b88c30]/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
        >
          {t('확인 완료 및 다음 단계')}
        </Button>
      </CardContent>
    </Card>
  );
}
