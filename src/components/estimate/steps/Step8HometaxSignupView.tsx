import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, BadgeCheck } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step8HometaxSignupViewProps {
  onPrev: () => void;
  hometaxId: string;
  isIdChecking: boolean;
  isIdDuplicateChecked: boolean;
  isSmsRequested: boolean;
  loading: boolean;
  handleRequestSignupSms: () => void;
  smsTimer: number;
  formatTimer: (seconds: number) => string;
  smsCode: string;
  setSmsCode: (code: string) => void;
  handleCompleteSignup: () => void;
  isVerifyingSms: boolean;
}

export function Step8HometaxSignupView({
  onPrev,
  hometaxId,
  isIdChecking,
  isIdDuplicateChecked,
  isSmsRequested,
  loading,
  handleRequestSignupSms,
  smsTimer,
  formatTimer,
  smsCode,
  setSmsCode,
  handleCompleteSignup,
  isVerifyingSms
}: Step8HometaxSignupViewProps) {
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
          {t('Step 8: 대한민국 국세청 회원가입 대행')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 p-4 sm:p-10 bg-[#0d1e30]">
        {/* ★ 김준현 매니저의 8단계 국세청 정식 접수 & 1분 SMS 인증 가이드 */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-3xl border-2 border-[#b88c30]/50 shadow-2xl relative overflow-hidden text-left">
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
                  {t('김준현 공식 매니저 1분 가이드')}
                </span>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                  {t('국세청 정식 접수 마지막 단계')}
                </Badge>
              </div>
              <p className="text-xs font-bold text-slate-200 leading-relaxed">
                🏛️ {t('국세청에 환급 신청서를 정식 접수하고 입금 현황을 실시간 추적하기 위해 국세청 보안 계정을 자동으로 생성해 드립니다. 🔒')}
              </p>
              <div className="p-3.5 bg-[#0a1523]/90 rounded-2xl border border-[#b88c30]/30 space-y-2 text-left">
                <div className="space-y-1">
                  <p className="text-[11.5px] font-black text-emerald-400 flex items-center gap-1.5">
                    <span>1️⃣</span>
                    <span>{t('아이디 자동 생성 완료')}</span>
                  </p>
                  <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                    {t('복잡한 회원가입 절차는 시스템이 안전하게 알아서 자동으로 처리해 드립니다.')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11.5px] font-black text-[#e2b659] flex items-center gap-1.5">
                    <span>2️⃣</span>
                    <span>{t('문자로 온 6자리 인증번호만 입력하면 끝!')}</span>
                  </p>
                  <p className="text-[11px] font-medium text-slate-300 pl-5 leading-relaxed">
                    {t('아래 [인증문자 발송하기]를 누르신 후, 휴대폰 문자로 도착한 6자리 번호만 넣어주세요.')}
                  </p>
                </div>
                <p className="text-[11px] font-bold text-[#e2b659] pt-1 border-t border-slate-800">
                  👉 {t('문자 6자리 입력 즉시 환급금을 입금받으실 통장 계좌 등록(9단계)으로 넘어갑니다! 👍')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-400">{t('국세청 자동 생성 ID')}</span>
            {isIdChecking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4 text-[#b88c30]" />
                <span className="text-xs font-bold text-[#b88c30]">{t('중복 확인 중...')}</span>
              </div>
            ) : isIdDuplicateChecked ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 text-sm rounded-lg flex items-center gap-1">
                <BadgeCheck className="h-4 w-4" /> {hometaxId}
              </Badge>
            ) : (
              <span className="text-sm font-bold text-red-400">{t('ID 미생성')}</span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {t('* 국세청 가입 정보는 당사 이용약관 및 개인정보 처리방침의 \'국세청 가입 대행 및 계정 관리\' 조항에 따라 안전하게 암호화 관리됩니다.')}
          </p>
        </div>

        {!isSmsRequested ? (
          <div className="space-y-6">
            <div className="p-4 bg-amber-950/20 border border-amber-800/30 rounded-2xl text-amber-400 text-sm font-semibold">
              {t('휴대폰 본인인증(SMS) 문자를 발송하여 회원가입을 완료합니다. 본인 명의의 휴대폰 번호로 인증을 시도해 주세요.')}
            </div>
            <Button
              id="step8-signup-request-btn"
              onClick={handleRequestSignupSms}
              disabled={loading || isIdChecking || !isIdDuplicateChecked}
              className="w-full h-20 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-[2rem] shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-8 w-8 text-[#0b192c]" /> : t('인증문자 발송하기')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-black text-slate-300 ml-1">{t('인증번호 6자리 입력')}</Label>
                <span className="text-sm font-black text-[#b88c30] mr-1">
                  {formatTimer(smsTimer)}
                </span>
              </div>
              <input
                id="step8-sms-code-input"
                placeholder={t('인증번호 6자리를 입력하세요')}
                maxLength={6}
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                className="h-16 rounded-2xl font-black bg-white/5 border border-white/10 text-white px-6 text-lg w-full text-center tracking-widest outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30]"
              />
            </div>

            <Button
              id="step8-signup-complete-btn"
              onClick={handleCompleteSignup}
              disabled={isVerifyingSms || smsCode.length !== 6}
              className="w-full h-20 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-[2rem] shadow-xl shadow-[#b88c30]/20 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {isVerifyingSms ? <Loader2 className="animate-spin h-8 w-8 text-[#0b192c]" /> : t('인증 완료 및 가입 대행')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleRequestSignupSms}
                disabled={loading}
                className="text-sm font-bold text-slate-400 hover:text-[#b88c30] hover:underline"
              >
                {t('인증문자 다시 받기')}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
