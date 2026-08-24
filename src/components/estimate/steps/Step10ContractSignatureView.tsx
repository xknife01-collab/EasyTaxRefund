import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  Loader2,
  BadgeCheck,
  CreditCard,
  FileText,
  CheckCircle2
} from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step10ContractSignatureViewProps {
  onPrev: () => void;
  formData: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    authName: string;
    officialName: string;
    [key: string]: any;
  };
  BANK_LOGOS: Record<string, React.ReactNode>;
  handleOpenDocument: () => void;
  cmsConsentAll: boolean;
  cmsConsent1: boolean;
  cmsConsent2: boolean;
  cmsConsent3: boolean;
  setCmsModalOpen1: (open: boolean) => void;
  setCmsModalOpen2: (open: boolean) => void;
  setCmsModalOpen3: (open: boolean) => void;
  isSigned: boolean;
  clearSignature: () => void;
  signatureCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  handleFinalSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function Step10ContractSignatureView({
  onPrev,
  formData,
  BANK_LOGOS,
  handleOpenDocument,
  cmsConsentAll,
  cmsConsent1,
  cmsConsent2,
  cmsConsent3,
  setCmsModalOpen1,
  setCmsModalOpen2,
  setCmsModalOpen3,
  isSigned,
  clearSignature,
  signatureCanvasRef,
  startDrawing,
  draw,
  stopDrawing,
  handleFinalSubmit,
  loading
}: Step10ContractSignatureViewProps) {
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
        <CardTitle className="text-2xl sm:text-3xl font-black font-headline text-white relative z-10">
          {t('Step 10: 최종 수임 동의')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-10 p-4 sm:p-10 bg-[#0d1e30]">
        {/* ★ 김준현 매니저의 10단계 따뜻한 감사와 마무리 안심 배너 */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0f1e36] via-[#152a45] to-[#0f1e36] rounded-3xl border-2 border-[#b88c30]/50 shadow-2xl relative overflow-hidden text-left">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0 mt-1">
              <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
                <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                  {t('김준현 공식 매니저의 진심 어린 약속')}
                </span>
                <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                  {t('1:1 평생 전담 케어')}
                </Badge>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                🌟 {t('한국에서 땀 흘려 열심히 일하시느라 정말 고생 많으셨습니다!')}
              </p>
              <div className="p-4 bg-[#0a1523]/90 rounded-2xl border border-[#b88c30]/30 space-y-2 text-left">
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  {t('고객님의 소중한 땀방울이 헛되지 않도록, 국세청 환급 신청 접수부터 통장 입금 확인까지 제가 끝까지 곁에서 책임지고 안전하게 챙겨드리겠습니다.')}
                </p>
                <p className="text-xs font-bold text-[#e2b659] leading-relaxed pt-1 border-t border-slate-800">
                  👉 {t('아래 서명 상자에 손가락으로 서명해 주시면 모든 신청이 안전하게 완료됩니다. 대단히 감사합니다! 😊')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 환급 신청 안내 배너 */}
        <Alert className="bg-[#b88c30]/10 border-[#b88c30]/30 rounded-[2rem] p-8 shadow-sm">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-[#b88c30]/20 rounded-2xl flex items-center justify-center shrink-0">
              <BadgeCheck className="h-6 w-6 text-[#b88c30]" />
            </div>
            <div className="space-y-3">
              <AlertTitle className="text-xl font-black text-white">{t('환급 신청 완료 안내')}</AlertTitle>
              <AlertDescription className="text-slate-300 font-bold text-base leading-relaxed">
                {t('환급 신청 후 대한민국 국세청에 환급되기 까지는 45일에서 60일 정도 소요 될 수 있습니다.')}{' '}
                <span className="text-[#b88c30] font-black">
                  {t('환급 과정은 나의 환급 진행사항에서 실시간으로 확인하실 수 있으며, 필요에 따라 추가 증빙 서류가 필요할 수 있습니다.')}
                </span>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* 등록된 계좌 */}
        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-4 shadow-inner">
          <h3 className="font-black text-white text-lg">{t('등록된 환급 및 정산 계좌')}</h3>
          <div className="flex items-center gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm">
            {BANK_LOGOS[formData.bankName] || <CreditCard className="h-8 w-8 text-slate-400" />}
            <div>
              <p className="font-black text-white text-lg">{t(formData.bankName || '등록된 은행 없음')}</p>
              <p className="text-base font-bold text-slate-400">{formData.accountNumber} ({t("예금주")}: {formData.accountHolder})</p>
            </div>
          </div>
        </div>

        {/* 공식 수임 동의서 및 PDF */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-[#b88c30]/10 border border-[#b88c30]/30 p-6 rounded-3xl gap-4">
          <div>
            <h4 className="font-black text-white text-base">{t('공식 세무대리 수임 동의서 및 위임장')}</h4>
            <p className="text-xs text-slate-400 font-bold mt-1">{t('국세청 제출용 공식 양식으로, 기재된 정보와 서명이 자동으로 기입됩니다.')}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenDocument}
            className="w-full sm:w-auto border-[#b88c30] text-[#b88c30] hover:bg-[#b88c30]/10 font-black rounded-2xl h-14 px-6 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <FileText className="h-5 w-5" />
            {t('계약서 확인 및 PDF 다운로드')}
          </Button>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-10">
          {/* CMS 동의 체크박스 (숨김) */}
          <div className="hidden">
            <Checkbox id="cms-consent-all" checked={cmsConsentAll} onCheckedChange={() => {}} />
            <Checkbox id="cms-consent-1" checked={cmsConsent1} onCheckedChange={() => {}} />
            <Checkbox id="cms-consent-2" checked={cmsConsent2} onCheckedChange={() => {}} />
            <Checkbox id="cms-consent-3" checked={cmsConsent3} onCheckedChange={() => {}} />
          </div>

          {/* 동의 안내 */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold text-slate-400 leading-relaxed space-y-3 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#b88c30]/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-[#b88c30]" />
              </div>
              <p className="text-slate-300 font-bold">
                {t('아래 [서명 적용 및 환급 신청하기] 버튼을 누르시면, 개인정보 수집 및 이용 동의, 제3자 제공 동의, 금융거래정보 제공 및 CMS 자동이체 출금동의 약관에 모두 명시적으로 동의하시는 것으로 간주됩니다.')}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pl-9 pt-1 text-xs">
              <button type="button" onClick={() => setCmsModalOpen1(true)} className="text-[#b88c30] hover:underline font-bold">{t('개인정보 수집/이용 약관 보기')} &rarr;</button>
              <button type="button" onClick={() => setCmsModalOpen2(true)} className="text-[#b88c30] hover:underline font-bold">{t('제3자 제공 동의 약관 보기')} &rarr;</button>
              <button type="button" onClick={() => setCmsModalOpen3(true)} className="text-[#b88c30] hover:underline font-bold">{t('CMS 출금동의 약관 보기')} &rarr;</button>
            </div>
          </div>

          {/* 전자 서명 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-xl font-black text-white">{t('전자서명 (세무 대리 수임 동의)')}</Label>
              {isSigned && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                >
                  {t('다시 그리기')}
                </button>
              )}
            </div>
            <div
              id="step10-signature-canvas"
              className="border-2 border-dashed border-[#b88c30]/30 rounded-[2rem] p-4 bg-white shadow-inner relative overflow-hidden h-[200px]"
            >
              <canvas
                ref={signatureCanvasRef}
                width={500}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full bg-white cursor-crosshair touch-none"
              />
              {!isSigned && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-[0.15]">
                  <span className="text-3xl font-serif italic text-slate-400 tracking-wider font-semibold">
                    {formData.authName || formData.officialName || 'GILDONG HONG'}
                  </span>
                  <span className="text-xs font-bold text-slate-300 mt-2">{t('여기에 손가락으로 서명을 그려주세요')}</span>
                </div>
              )}
            </div>
            {!isSigned && (
              <p className="text-xs font-bold text-red-400 animate-pulse ml-1">
                {t('위 상자에 직접 서명을 완료해야 신청이 가능합니다.')}
              </p>
            )}
          </div>

          {/* 법적 고지 */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-slate-500 leading-relaxed space-y-2">
            <p>{t('본 서비스는 세무 분석 솔루션 프로그램을 제공하는 플랫폼으로, 실제 세무 신고 및 대행 업무는 제휴된 대한민국 국가공인 전문 세무법인/세무사를 통해 적법하게 처리됩니다.')}</p>
            <p>{t('Korea Tax Refund Service(Korea Tax Refund Service)은 세무대리 신고를 직접 수행하지 않으며, 본 플랫폼에서 작성된 신청 서류는 제휴 세무사를 통해 최종 검토 및 제출됩니다.')}</p>
          </div>

          <Button
            id="step10-submit-btn"
            type="submit"
            className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl lg:text-2xl font-black rounded-[2rem] shadow-2xl shadow-[#b88c30]/20 whitespace-normal break-words flex items-center justify-center text-center leading-tight transition-all hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-8 w-8 text-[#0b192c]" /> : t('서명 적용 및 환급 신청하기')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
