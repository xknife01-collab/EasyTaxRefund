import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Stamp } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    officialName?: string;
    registrationNumber?: string;
    phone?: string;
    bankName?: string;
    accountNumber?: string;
  };
  signatureDataUrl?: string | null;
  handlePrint: (e: React.MouseEvent) => void;
  printRef: React.RefObject<HTMLDivElement | null>;
  formatDocumentDate: (d: string) => string;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  formData,
  signatureDataUrl,
  handlePrint,
  printRef,
  formatDocumentDate
}: DocumentViewerModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white z-[150]">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 print-hidden">
          <div>
            <DialogTitle className="text-2xl font-black text-white">
              {t('소득세 환급 자동 분석 솔루션 이용 및 후불 정산 계약서')}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              {t('플랫폼 서비스 이용 및 CMS 자동이체 출금 동의를 규정하는 법적 계약서입니다.')}
            </DialogDescription>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              <Printer className="mr-2 h-5 w-5" /> {t('PDF로 저장 / 인쇄')}
            </Button>
          </div>
        </div>

        <div className="bg-white p-12 lg:p-20 overflow-y-auto max-h-[70vh] font-serif text-slate-900">
          {/* 공식 문서 레이아웃 */}
          <div ref={printRef} className="space-y-12 border-2 border-slate-100 p-10 lg:p-16 rounded-xl relative">
            <div className="absolute top-10 right-10 opacity-10">
              <Stamp className="h-32 w-32 text-slate-900" />
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black underline underline-offset-8 text-slate-900">
                {t('소득세 환급 자동 분석 솔루션 이용 및 후불 정산 계약서')}
              </h1>
              <p className="text-sm text-slate-500 font-bold">
                {t('(중소기업 취업자 소득세 감면 및 경정청구 지원 서비스)')}
              </p>
            </div>

            <div className="space-y-8 pt-8 text-lg leading-relaxed text-justify text-slate-855">
              {/* 제1조 */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">
                  {t('제1조 (목적)')}
                </h3>
                <p>
                  {t("본 계약은 위임인(이하 '이용자')이 주식회사 펫에이앤씨(이하 '회사')가 제공하는 'Korea Tax Refund Service(Korea Tax Refund Service)' 세무 분석 솔루션 프로그램을 이용하고, 이에 따른 플랫폼 이용료(수수료)를 환급 성공 후 후불 정산 및 CMS 자동이체 방식으로 지불하기 위한 조항 및 출금 동의 사항을 규정함을 목적으로 합니다.")}
                </p>
              </div>

              {/* 제2조 */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">
                  {t('제2조 (계약 당사자 정보)')}
                </h3>
                
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">{t('1. 이용자 (고객) 정보')}</h4>
                  <div className="grid grid-cols-2 gap-y-2 pl-4 text-base">
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('성 명')}</span>
                      <span className="font-bold text-slate-900">{formData.officialName || t("정보 없음")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('외국인등록번호')}</span>
                      <span className="font-bold text-slate-900">{formData.registrationNumber || t("정보 확인 중")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('연락처')}</span>
                      <span className="font-bold text-slate-900">{formData.phone || t("정보 없음")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('환급 및 정산 계좌')}</span>
                      <span className="font-bold text-slate-900">
                        {formData.bankName ? `${t(formData.bankName)} / ${formData.accountNumber || ''}` : t("미지정")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900">{t('2. 서비스 제공자 (회사) 정보')}</h4>
                  <div className="grid grid-cols-2 gap-y-2 pl-4 text-base">
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('상 호')}</span>
                      <span className="font-bold text-slate-900">{t('주식회사 펫에이앤씨')}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('대표자')}</span>
                      <span className="font-bold text-slate-900">{t('전기창')}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1 col-span-2">
                      <span className="w-40 font-black text-slate-500">{t('사업자등록번호')}</span>
                      <span className="font-bold text-slate-900">229-86-03034 {t('(통신판매업 신고번호: 제 2023-진접오남-0680호)')}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1 col-span-2">
                      <span className="w-40 font-black text-slate-500">{t('소재지')}</span>
                      <span className="font-bold text-slate-900">{t('서울특별시 광진구 광나루로 436, 5층(화양동, 에듀킨빌딩)')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 제3조 */}
              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">
                  {t('제3조 (플랫폼 서비스 이용료 및 후불 정산 조건)')}
                </h3>
                <div className="space-y-2 pl-4 text-base text-slate-800">
                  <p>
                    <strong>{t('서비스 이용료')}:</strong> {t('이용자는 본 솔루션을 통해 국세청으로부터 최종 지급받는 환급 금액의 22% (부가세 포함)를 플랫폼 서비스 이용료로 회사에 지급합니다.')}
                  </p>
                  <p className="font-bold text-slate-900 mt-2">{t('후불 정산 방식:')}</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>{t('서비스 신청 및 분석 시점의 이용자 결제 금액은 0원(초기 비용 없음)입니다.')}</li>
                    <li>{t('이용료는 국세청이 이용자의 지정 계좌로 환급금을 입금 완료한 것이 확인된 이후에만 이용자가 등록한 본 계좌에서 출금(정산)됩니다.')}</li>
                    <li>{t('국세청 심사 결과 환급액이 발생하지 않거나 거절되는 경우, 이용자가 지불해야 할 금액은 0원이며 어떠한 수수료도 청구되지 않습니다.')}</li>
                  </ul>
                </div>
              </div>

              {/* 제4조 */}
              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">
                  {t('제4조 (CMS 자동이체 출금 동의)')}
                </h3>
                <p>
                  {t('이용자는 국세청 환급금 입금 확인 후, 회사가 제휴 CMS 대행기관(효성CMS 등) 및 금융결제원을 통해 등록된 본인 계좌에서 제3조에 따른 이용료(환급액의 22%)를 자동으로 인출(출금)하는 것에 동의합니다.')}
                </p>
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900">{t('출금 동의 내역:')}</h4>
                  <div className="grid grid-cols-2 gap-y-2 pl-4 text-base">
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('이용기관명')}</span>
                      <span className="font-bold text-slate-900">{t('주식회사 펫에이앤씨')}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('출금 대상 계좌')}</span>
                      <span className="font-bold text-slate-900">
                        {formData.bankName ? `${t(formData.bankName)} / ${formData.accountNumber || ''}` : t("미지정")}
                      </span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('예금주 성명')}</span>
                      <span className="font-bold text-slate-900">{formData.officialName || t("정보 없음")}</span>
                    </div>
                    <div className="flex border-b border-slate-100 py-1">
                      <span className="w-40 font-black text-slate-500">{t('출금 신청 금액')}</span>
                      <span className="font-bold text-slate-900">{t('국세청 실지급 환급액의 22% 상당액')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 제5조 */}
              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">
                  {t('제5조 (개인정보 수집 및 제3자 제공 동의)')}
                </h3>
                <p>
                  {t('회사는 CMS 자동이체 등록 및 출금 실행을 목적으로 금융결제원 및 제휴 CMS 기관(효성CMS 등)에 이용자의 개인정보(성명, 생년월일/외국인등록번호, 은행명, 계좌번호, 연락처)를 제공할 수 있으며, 이용자는 이에 동의합니다.')}
                </p>
                <p className="text-base text-slate-600">
                  {t('수집된 정보는 서비스 목적 달성 및 관련 법령(전자금융거래법 등)에 따른 의무 보관 기간(5년) 동안 안전하게 보관됩니다.')}
                </p>
              </div>

              {/* 제6조 */}
              <div className="space-y-2 pt-4">
                <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">
                  {t('제6조 (플랫폼의 역할 및 법적 책임 고지)')}
                </h3>
                <p>
                  {t('주식회사 펫에이앤씨는 세무 분석 솔루션 프로그램을 제공하는 플랫폼 제공업자(통신판매업)로서, 이용자의 실제 세무 신고 대리 업무는 제휴된 대한민국 국가공인 전문 세무법인 및 세무사와의 협력을 통해 적법하게 대행 처리됩니다.')}
                </p>
              </div>

              {/* 날짜 및 서명 */}
              <div className="pt-20 text-center space-y-10">
                <p className="text-2xl font-bold text-slate-900">{formatDocumentDate(new Date().toISOString())}</p>

                <div className="flex flex-col items-center gap-4">
                  <p className="text-xl font-bold text-slate-900">{t('이용자 (서명)')} : {formData.officialName || t("정보 없음")}</p>
                  {signatureDataUrl ? (
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-inner inline-block min-w-[240px]">
                      <img src={signatureDataUrl} alt="User Signature" className="h-16 object-contain mx-auto" />
                    </div>
                  ) : (
                    <div className="h-16 w-60 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-bold italic">
                      {t('서명 데이터 없음')}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-20 text-center">
                <h2 className="text-3xl font-black tracking-widest text-slate-900">{t('주식회사 펫에이앤씨 귀하')}</h2>
              </div>

            </div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-100 flex justify-end print-hidden">
          <Button
            variant="outline"
            className="rounded-xl h-12 px-8 font-black text-slate-900 border-slate-200"
            onClick={onClose}
          >
            {t('닫기')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
