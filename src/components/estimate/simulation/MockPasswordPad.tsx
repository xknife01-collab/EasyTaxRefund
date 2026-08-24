import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

interface MockPasswordPadProps {
  isOpen: boolean;
  onClose: () => void;
  authMethod: string;
  pinCode: string;
  setPinCode: React.Dispatch<React.SetStateAction<string>>;
}

export function MockPasswordPad({
  isOpen,
  onClose,
  authMethod,
  pinCode,
  setPinCode
}: MockPasswordPadProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col h-[550px]">
        {/* Header */}
        <div className={cn(
          "p-6 text-white text-center flex flex-col items-center justify-center relative shrink-0",
          authMethod === 'hana' ? "bg-[#008485]" : authMethod === 'app' ? "bg-[#E1000E]" : "bg-[#FEE500] text-slate-900"
        )}>
          <div className="h-14 w-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md mb-3">
            <Image
              src={authMethod === 'hana' ? "/images/logo/hana_1q.png" : authMethod === 'app' ? "/images/logo/pass.png" : "/images/logo/kakao.png"}
              alt="Bank Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h3 className="text-xl font-black">
            {authMethod === 'hana' ? t('하나인증서 승인') : authMethod === 'app' ? t('PASS 인증 승인') : t('카카오톡 인증 승인')}
          </h3>
          <p className="text-xs opacity-80 mt-1 font-bold">
            {t('비밀번호 6자리를 입력하여 인증을 완료해 주세요.')}
          </p>
        </div>

        {/* Password Dot Indicators */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 bg-slate-50">
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-all duration-150",
                  idx < pinCode.length
                    ? (authMethod === 'hana' ? "bg-[#008485] border-[#008485] scale-110" : authMethod === 'app' ? "bg-[#E1000E] border-[#E1000E] scale-110" : "bg-slate-900 border-slate-900 scale-110")
                    : "border-slate-300 bg-white"
                )}
              />
            ))}
          </div>
          {pinCode.length === 6 && (
            <p className="text-emerald-500 font-black text-sm mt-6 flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="h-5 w-5" /> {t('인증 성공! 잠시만 기다려 주세요.')}
            </p>
          )}
        </div>

        {/* Numeric Keypad Grid */}
        <div className="bg-white p-4 border-t border-slate-100 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                id={`mock-keypad-${num}`}
                variant="ghost"
                onClick={() => {
                  if (pinCode.length < 6) setPinCode((prev) => prev + num);
                }}
                className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-slate-800 transition-colors"
              >
                {num}
              </Button>
            ))}
            {/* Empty spacer / Cancel */}
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-16 text-base font-bold text-slate-400 rounded-2xl hover:bg-slate-50 active:bg-slate-100"
            >
              {t('취소')}
            </Button>
            {/* 0 Key */}
            <Button
              id="mock-keypad-0"
              variant="ghost"
              onClick={() => {
                if (pinCode.length < 6) setPinCode((prev) => prev + "0");
              }}
              className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-slate-800"
            >
              0
            </Button>
            {/* Backspace Key */}
            <Button
              variant="ghost"
              onClick={() => {
                setPinCode((prev) => prev.slice(0, -1));
              }}
              className="h-16 text-base font-bold text-slate-400 rounded-2xl hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
