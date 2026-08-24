import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface FindHometaxIdModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  findIdStep: 1 | 2;
  setFindIdStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  findIdForm: {
    name: string;
    regNo: string;
    telecom: string;
    phone: string;
    smsCode: string;
    transactionId?: string;
    stepData?: any;
  };
  setFindIdForm: React.Dispatch<React.SetStateAction<any>>;
  findIdLoading: boolean;
  findIdResult: string;
  handleRequestFindIdSms: () => Promise<void>;
  handleVerifyFindIdSms: () => Promise<void>;
  onSelectFoundId: (id: string) => void;
}

export function FindHometaxIdModal({
  isOpen,
  onOpenChange,
  findIdStep,
  setFindIdStep,
  findIdForm,
  setFindIdForm,
  findIdLoading,
  findIdResult,
  handleRequestFindIdSms,
  handleVerifyFindIdSms,
  onSelectFoundId
}: FindHometaxIdModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-primary" />
        <DialogHeader className="space-y-3 pt-2">
          <DialogTitle className="text-2xl font-black text-center text-slate-900">
            {t("국세청 아이디 찾기")}
          </DialogTitle>
        </DialogHeader>

        {findIdStep === 1 ? (
          <div className="space-y-4 mt-4">
            <p className="text-slate-500 text-xs font-bold leading-relaxed text-center break-keep">
              {t("국세청 홈택스에 등록된 본인확인 정보와 휴대전화번호를 입력해 주세요.")}
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("성명 (통신사 등록명)")}</Label>
                <Input
                  value={findIdForm.name}
                  onChange={(e) => setFindIdForm((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("외국인 등록번호 (주민번호)")}</Label>
                <Input
                  value={findIdForm.regNo}
                  onChange={(e) => setFindIdForm((prev: any) => ({ ...prev, regNo: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  placeholder="yymmdd-5xxxxxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("통신사")}</Label>
                  <Select
                    value={findIdForm.telecom}
                    onValueChange={(val) => setFindIdForm((prev: any) => ({ ...prev, telecom: val }))}
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
                    value={findIdForm.phone}
                    onChange={(e) => setFindIdForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleRequestFindIdSms}
              disabled={findIdLoading}
              className="w-full h-14 mt-2 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              {findIdLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {t("인증문자 받기")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {findIdResult ? (
              <div className="space-y-6 text-center py-4">
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-2">
                  <p className="text-xs font-bold text-slate-400">{t("가입된 아이디 조회 결과")}</p>
                  <p className="text-3xl font-black text-emerald-600 tracking-wider select-all">{findIdResult}</p>
                </div>
                <p className="text-slate-500 text-xs font-bold leading-relaxed break-keep">
                  {t("위의 아이디를 복사해서 홈택스 로그인에 사용해 주세요.")}
                </p>
                <Button
                  onClick={() => onSelectFoundId(findIdResult)}
                  className="w-full h-14 rounded-2xl font-black bg-primary text-white hover:bg-primary/95"
                >
                  {t("아이디 자동 입력 후 로그인하기")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-500 text-xs font-bold leading-relaxed text-center break-keep">
                  {t("휴대폰으로 전송된 6자리 인증번호를 입력해 주세요.")}
                </p>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("인증번호 입력")}</Label>
                  <Input
                    value={findIdForm.smsCode}
                    onChange={(e) => setFindIdForm((prev: any) => ({ ...prev, smsCode: e.target.value }))}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold text-center tracking-widest text-lg"
                    maxLength={6}
                    placeholder="000000"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFindIdStep(1)}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-bold border-slate-100"
                  >
                    {t("이전")}
                  </Button>
                  <Button
                    onClick={handleVerifyFindIdSms}
                    disabled={findIdLoading}
                    className="flex-[2] h-14 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {findIdLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> : null}
                    {t("아이디 조회")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
