import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface ResetHometaxPwModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resetPwStep: 1 | 2;
  setResetPwStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  resetPwForm: {
    hometaxId: string;
    name: string;
    regNo: string;
    telecom: string;
    phone: string;
    newPw: string;
    smsCode: string;
    transactionId?: string;
    stepData?: any;
  };
  setResetPwForm: React.Dispatch<React.SetStateAction<any>>;
  resetPwLoading: boolean;
  handleRequestResetPwSms: () => Promise<void>;
  handleVerifyResetPwSms: () => Promise<void>;
}

export function ResetHometaxPwModal({
  isOpen,
  onOpenChange,
  resetPwStep,
  setResetPwStep,
  resetPwForm,
  setResetPwForm,
  resetPwLoading,
  handleRequestResetPwSms,
  handleVerifyResetPwSms
}: ResetHometaxPwModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
        <DialogHeader className="space-y-3 pt-2">
          <DialogTitle className="text-2xl font-black text-center text-slate-900">
            {t("국세청 비밀번호 재설정")}
          </DialogTitle>
        </DialogHeader>

        {resetPwStep === 1 ? (
          <div className="space-y-4 mt-4">
            <p className="text-slate-500 text-xs font-bold leading-relaxed text-center break-keep">
              {t("새로운 비밀번호를 입력하고 휴대폰 본인인증을 진행해 주세요.")}
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("홈택스 아이디")}</Label>
                <Input
                  value={resetPwForm.hometaxId}
                  onChange={(e) => setResetPwForm((prev: any) => ({ ...prev, hometaxId: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("성명 (통신사 등록명)")}</Label>
                <Input
                  value={resetPwForm.name}
                  onChange={(e) => setResetPwForm((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("외국인 등록번호 (주민번호)")}</Label>
                <Input
                  value={resetPwForm.regNo}
                  onChange={(e) => setResetPwForm((prev: any) => ({ ...prev, regNo: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  placeholder="yymmdd-5xxxxxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("통신사")}</Label>
                  <Select
                    value={resetPwForm.telecom}
                    onValueChange={(val) => setResetPwForm((prev: any) => ({ ...prev, telecom: val }))}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                      <SelectValue placeholder={t("선택")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">SKT</SelectItem>
                      <SelectItem value="1">KT</SelectItem>
                      <SelectItem value="2">LGU+</SelectItem>
                      <SelectItem value="3">{t("SKT 알뜰폰")}</SelectItem>
                      <SelectItem value="4">{t("KT 알뜰폰")}</SelectItem>
                      <SelectItem value="5">{t("LGU+ 알뜰폰")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("휴대전화번호")}</Label>
                  <Input
                    value={resetPwForm.phone}
                    onChange={(e) => setResetPwForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("새로운 비밀번호")}</Label>
                <Input
                  type="password"
                  value={resetPwForm.newPw}
                  onChange={(e) => setResetPwForm((prev: any) => ({ ...prev, newPw: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  placeholder={t("영문, 숫자, 특수문자 조합 9~15자")}
                />
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {t("💡 영문(A-Z, a-z), 숫자(0-9), 특수문자(!@#$%^&*)를 필수 포함하여 9~15자로 설정하세요.")}
                </p>
              </div>
            </div>

            <Button
              onClick={handleRequestResetPwSms}
              disabled={resetPwLoading}
              className="w-full h-14 mt-2 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              {resetPwLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {t("비밀번호 변경 인증요청")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <p className="text-slate-500 text-xs font-bold leading-relaxed text-center break-keep">
              {t("휴대폰으로 전송된 6자리 인증번호를 입력해 주세요.")}
            </p>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">{t("인증번호 입력")}</Label>
              <Input
                value={resetPwForm.smsCode}
                onChange={(e) => setResetPwForm((prev: any) => ({ ...prev, smsCode: e.target.value }))}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold text-center tracking-widest text-lg"
                maxLength={6}
                placeholder="000000"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setResetPwStep(1)}
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-slate-100"
              >
                {t("이전")}
              </Button>
              <Button
                onClick={handleVerifyResetPwSms}
                disabled={resetPwLoading}
                className="flex-[2] h-14 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800"
              >
                {resetPwLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> : null}
                {t("비밀번호 변경 및 조회")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
