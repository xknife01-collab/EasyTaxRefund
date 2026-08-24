import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/components/LanguageContext";

interface TermsConsentModalProps {
  piConsentOpen: boolean;
  setPiConsentOpen: (open: boolean) => void;
  cmsModalOpen1: boolean;
  setCmsModalOpen1: (open: boolean) => void;
  cmsModalOpen2: boolean;
  setCmsModalOpen2: (open: boolean) => void;
  cmsModalOpen3: boolean;
  setCmsModalOpen3: (open: boolean) => void;
  refundFee: number;
}

export function TermsConsentModal({
  piConsentOpen,
  setPiConsentOpen,
  cmsModalOpen1,
  setCmsModalOpen1,
  cmsModalOpen2,
  setCmsModalOpen2,
  cmsModalOpen3,
  setCmsModalOpen3,
  refundFee,
}: TermsConsentModalProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* 개인정보 수집 및 이용 동의 모달 */}
      <Dialog open={piConsentOpen} onOpenChange={setPiConsentOpen}>
        <DialogContent className="max-w-[480px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900 z-[160]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-primary" />
          <DialogHeader className="space-y-3 pt-2">
            <DialogTitle className="text-xl font-black text-slate-900">
              {t("개인정보 수집 및 이용 동의")}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-xs">
              {t("환급 대상 여부 조회를 위해 아래와 같이 개인정보를 수집 및 이용합니다.")}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[300px] my-6 pr-4 text-xs text-slate-600 font-medium leading-relaxed space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">1. {t("수집 및 이용 목적")}</p>
                <p>{t("소득세 경정청구 및 중소기업 취업자 감면 대상 여부 분석, 국세청 홈택스 자료 조회 연동")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">2. {t("수집하는 개인정보 항목")}</p>
                <p>{t("성명, 외국인등록번호, 휴대전화번호, 통신사 정보")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">3. {t("보유 및 이용 기간")}</p>
                <p className="font-bold text-red-500">{t("세무 분석 완료 후 즉시 파기 (단, 법령에 따른 보존 의무 발생 시 예외)")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">4. {t("동의 거부 권리 고지")}</p>
                <p>{t("이용자는 본 개인정보 수집 및 이용 동의를 거부할 권리가 있으며, 동의 거부 시 서비스 이용이 제한될 수 있습니다.")}</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={() => setPiConsentOpen(false)}
              className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800"
            >
              {t("확인")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CMS 개인정보 수집 및 이용 동의 모달 */}
      <Dialog open={cmsModalOpen1} onOpenChange={setCmsModalOpen1}>
        <DialogContent className="max-w-[480px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900 z-[160]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-primary" />
          <DialogHeader className="space-y-3 pt-2">
            <DialogTitle className="text-xl font-black text-slate-900">
              {t("개인정보 수집 및 이용 동의")}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-xs">
              {t("환급 대상 여부 조회를 위해 아래와 같이 개인정보를 수집 및 이용합니다.")}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[300px] my-6 pr-4 text-xs text-slate-600 font-medium leading-relaxed space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">1. {t("수집 및 이용 목적")}</p>
                <p>{t("소득세 경정청구 및 중소기업 취업자 감면 대상 여부 분석, 국세청 홈택스 자료 조회 연동")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">2. {t("수집하는 개인정보 항목")}</p>
                <p>{t("성명, 외국인등록번호, 휴대전화번호, 통신사 정보")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">3. {t("보유 및 이용 기간")}</p>
                <p className="font-bold text-red-500">{t("세무 분석 완료 후 즉시 파기 (단, 법령에 따른 보존 의무 발생 시 예외)")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">4. {t("동의 거부 권리 고지")}</p>
                <p>{t("이용자는 본 개인정보 수집 및 이용 동의를 거부할 권리가 있으며, 동의 거부 시 서비스 이용이 제한될 수 있습니다.")}</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={() => setCmsModalOpen1(false)}
              className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800"
            >
              {t("확인")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CMS 개인정보 제3자 제공 동의 모달 */}
      <Dialog open={cmsModalOpen2} onOpenChange={setCmsModalOpen2}>
        <DialogContent className="max-w-[480px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900 z-[160]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-primary" />
          <DialogHeader className="space-y-3 pt-2">
            <DialogTitle className="text-xl font-black text-slate-900">
              {t("개인정보 제3자 제공 동의")}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[300px] my-6 pr-4 text-xs text-slate-600 font-medium leading-relaxed space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 mb-2">{t("오직 CMS 자동이체 등록 및 출금 실행 목적을 위해 아래와 같이 개인정보를 제3자에게 제공합니다.")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">1. {t("제공받는 자")}</p>
                <p>{t("금융결제원, 효성CMS, 계좌 개설 금융기관(은행 및 카드사)")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">2. {t("제공받는 자의 이용 목적")}</p>
                <p>{t("CMS 자동이체 등록, 유효성 검증 및 플랫폼 서비스 이용료(수수료) 자동 출금 실행")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">3. {t("제공하는 개인정보 항목")}</p>
                <p>{t("성명, 생년월일/외국인등록번호, 은행명, 계좌번호, 휴대전화번호")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">4. {t("제공받는 자의 보유 및 이용 기간")}</p>
                <p className="font-bold text-red-500">{t("CMS 자동이체 등록 동의 해지 시까지 (단, 관계법령에 따른 보존 의무 발생 시 예외)")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">5. {t("동의 거부 권리 고지")}</p>
                <p>{t("이용자는 본 개인정보 제3자 제공 동의를 거부할 권리가 있으며, 동의 거부 시 자동이체 등록 및 서비스 최종 신청이 불가능합니다.")}</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={() => setCmsModalOpen2(false)}
              className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800"
            >
              {t("확인")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CMS 금융거래정보 제공 동의 모달 */}
      <Dialog open={cmsModalOpen3} onOpenChange={setCmsModalOpen3}>
        <DialogContent className="max-w-[480px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900 z-[160]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-primary" />
          <DialogHeader className="space-y-3 pt-2">
            <DialogTitle className="text-xl font-black text-slate-900">
              {t("금융거래정보 제공 및 CMS 자동이체 출금 동의")}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[300px] my-6 pr-4 text-xs text-slate-600 font-medium leading-relaxed space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 mb-2">{t("CMS 자동이체를 통한 플랫폼 서비스 이용료(수수료) 출금 신규 신청 및 해지를 위해 아래와 같이 출금에 동의합니다.")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
                <p className="font-black text-slate-800 mb-2">1. {t("출금 신청 정보")}</p>
                <div className="pl-4 space-y-1">
                  <p>• {t("이용기관")}: {t("더운컴퍼니")}</p>
                  <p>• {t("출금 신청 금액")}: {t("국세청 실지급 환급액의 22% 상당액 (미환급 시 0원)")} {refundFee > 0 && `(₩${refundFee.toLocaleString()})`}</p>
                  <p>• {t("1회 최대 출금 한도")}: {refundFee > 0 ? `₩${refundFee.toLocaleString()}` : t("국세청 실지급 환급액의 22% 상당액")} {t("한도 (실제 청구서 기준)")}</p>
                  <p>• {t("출금 계좌")}: {t("등록된 본인 지정 계좌")}</p>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {t("* 본 출금 한도는 법적 등록을 위한 최대 상한선일 뿐이며, 환급이 성공하기 전까지는 0원도 출금되지 않으며 오직 확정된 서비스 이용료(22%)만 단 1회 출금됩니다.")}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">2. {t("금융거래정보 제공 동의")}</p>
                <p>{t("본인 계좌로부터 자동이체 출금을 이행하기 위해, 예금주 성명, 생년월일/외국인등록번호, 금융기관명, 계좌번호 등의 정보가 금융결제원, 효성CMS, 은행/카드사에 제공되는 것에 동의합니다.")}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-2">3. {t("출금 동의 사항")}</p>
                <p>{t("본 동의는 이용자가 직접 서명한 내용에 기반하며, 추후 국세청 환급금 입금이 확인되는 시점에 별도의 추가 통지 없이 등록된 계좌에서 인출(출금)하는 것에 명시적으로 동의합니다.")}</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={() => setCmsModalOpen3(false)}
              className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800"
            >
              {t("확인")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
