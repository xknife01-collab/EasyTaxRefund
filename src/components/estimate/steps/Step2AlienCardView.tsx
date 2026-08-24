import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Camera,
  Loader2,
  Lock,
  Database,
  Shield
} from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface Step2AlienCardViewProps {
  onPrev: () => void;
  formData: {
    officialName: string;
    registrationNumber: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  prefetchNameOptimization: (name: string) => void;
  isCameraActive: boolean;
  setIsCameraActive: (active: boolean) => void;
  startCamera: () => void;
  captureAndScan: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleOcrConfirm: (e: React.FormEvent) => void;
  loading: boolean;
}

export function Step2AlienCardView({
  onPrev,
  formData,
  setFormData,
  prefetchNameOptimization,
  isCameraActive,
  setIsCameraActive,
  startCamera,
  captureAndScan,
  videoRef,
  canvasRef,
  handleOcrConfirm,
  loading
}: Step2AlienCardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#b88c30] rounded-tl-3xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b88c30] rounded-tr-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#b88c30] rounded-bl-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#b88c30] rounded-br-3xl z-10 pointer-events-none" />

      <Card className="rounded-3xl border border-[#b88c30]/30 shadow-2xl overflow-hidden bg-[#0b192c]">
        {/* Header */}
        <CardHeader className="text-center py-8 sm:py-10 bg-[#0b192c] text-white relative overflow-hidden">
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
            className="absolute top-5 left-5 text-[#b88c30]/60 hover:text-[#b88c30] font-bold flex items-center z-10"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('이전')}
          </Button>

          {/* Step Badge */}
          <div className="relative z-10 flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#b88c30]" />
            <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/30 rounded-full px-4 py-1.5">
              <span className="text-[#b88c30] text-[10px] font-black tracking-[0.2em] uppercase">
                {t('Step 02 — 신분증 인증')}
              </span>
            </div>
            <div className="h-px w-8 bg-[#b88c30]" />
          </div>

          {/* NTS 로고 */}
          <div className="relative z-10 mx-auto mb-5 flex flex-col items-center gap-3">
            <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-[#b88c30]/20 overflow-hidden">
              <img src="/nts-logo.jpg" alt={t("국세청")} className="h-16 w-16 object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-5 bg-[#b88c30]/40" />
              <span className="text-[9px] font-black text-[#b88c30]/60 uppercase tracking-widest">National Tax Service</span>
              <div className="h-px w-5 bg-[#b88c30]/40" />
            </div>
          </div>

          <CardTitle className="relative z-10 text-2xl sm:text-3xl font-black tracking-tight px-4 leading-tight text-white">
            {t('Step 2: 외국인등록증 인증')}
          </CardTitle>
          <p className="relative z-10 text-slate-400 font-bold text-sm mt-2">
            {t('신분증 정보를 확인하여 감면 대상을 판별합니다.')}
          </p>
          <div className="relative z-10 h-px w-16 bg-[#b88c30] mx-auto mt-4" />
        </CardHeader>

        <CardContent className="space-y-5 p-5 sm:p-8 bg-[#0d1e30]">
          {/* 보안 인증 씰 + 3가지 약속 */}
          <div className="p-5 bg-white/5 rounded-2xl border border-[#b88c30]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b88c30]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-center gap-5">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-[#b88c30]/20 rounded-full blur-xl animate-pulse" />
                <Image
                  src="/certified_security_seal_premium_1774150786685.png"
                  alt="Certified Security"
                  width={72}
                  height={72}
                  className="relative"
                />
              </div>
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base font-black text-white">{t('security_card_title')}</h4>
                  <Badge className="bg-[#b88c30]/10 text-[#b88c30] border border-[#b88c30]/30 text-[9px] font-black">
                    {t('security_certified')}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-400">{t('security_card_subtitle')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { icon: Lock, title: t('security_item_encryption_title'), desc: t('security_item_encryption_desc') },
                    { icon: Database, title: t('security_item_no_storage_title'), desc: t('security_item_no_storage_desc') },
                    { icon: Shield, title: t('security_item_pippa_title'), desc: t('security_item_pippa_desc') },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#b88c30]">
                        <Icon className="h-3 w-3" />
                        {title}
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 leading-tight">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ★ 김준현 매니저의 안심 가이드 & 직접 입력 선택 안내 */}
          <div className="p-5 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-2xl border-2 border-[#b88c30]/50 shadow-lg relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 mt-1">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
                  <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
              </div>
              <div className="space-y-2 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                    {t('김준현 공식 매니저 안심 가이드')}
                  </span>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                    {t('조회 즉시 영구 파기')}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-200 leading-relaxed">
                  {t('신분증 사진 촬영이 불안하시거나 카메라가 불편하신가요? 걱정 마세요! 촬영하신 사진은 국세청 조회 즉시 영구 파기(저장 NO!)됩니다.')}
                </p>
                <p className="text-xs font-black text-[#e2b659] leading-relaxed">
                  {t('👉 사진 촬영이 부담스러우시면 아래에 [영문 이름]과 [외국인등록번호]를 직접 손으로 타이핑하여 입력하셔도 100% 안전하게 조회가 가능합니다!')}
                </p>
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const inputElem = document.getElementById('step2-name-input');
                      if (inputElem) {
                        inputElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        inputElem.focus();
                      }
                    }}
                    className="text-[11px] font-black text-[#0b192c] bg-[#b88c30] hover:bg-[#cfa54c] px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span>✍️ {t('사진 대신 직접 타이핑해서 입력하기')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 카메라 / 촬영 영역 */}
          {!isCameraActive ? (
            <div
              onClick={startCamera}
              className="border-2 border-dashed border-[#b88c30]/30 rounded-2xl p-10 text-center bg-[#b88c30]/5 cursor-pointer hover:bg-[#b88c30]/10 transition-all group"
            >
              <Camera className="h-12 w-12 text-[#b88c30] mx-auto mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-black text-white text-base">{t('외국인등록증 촬영하여 자동 입력')}</h3>
              <p className="text-xs font-bold text-slate-500 mt-2">
                {t('되도록 외국인 등록증을 촬영 해주세요. 그래야 정확한 정보가 입력 됩니다.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[85%] aspect-[1.58] border-4 border-dashed border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                    <span className="text-white text-xs font-black bg-black/60 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm animate-pulse">
                      {t('신분증을 점선에 맞춰주세요')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
                    setIsCameraActive(false);
                  }}
                  className="h-14 w-1/3 rounded-2xl font-bold bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
                  disabled={loading}
                >
                  {t('취소')}
                </Button>
                <Button
                  type="button"
                  onClick={captureAndScan}
                  className="flex-1 h-14 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-base font-black rounded-2xl shadow-xl"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : t('촬영 및 정보 추출')}
                </Button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* 비자 안심 + 암호화 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/30">
              <div className="h-8 w-8 bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-[12px] font-black text-emerald-400 leading-relaxed">
                {t('본 환급은 합법적 권리로, 비자(E-9, E-7, F-2 등) 연장이나 체류 자격에 어떠한 불이익도 없습니다.')}
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="h-8 w-8 bg-[#b88c30]/10 rounded-xl flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-[#b88c30]" />
              </div>
              <div>
                <p className="text-[12px] font-black text-white">
                  {t('입력하신 정보는 은행 수준(AES-256)으로 암호화됩니다.')}
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-1 leading-tight">
                  {t('국세청 환급금 조회를 위해서만 1회 사용되며 서버에 절대 저장되지 않습니다. (평가 후 즉시 파기)')}
                </p>
              </div>
            </div>
          </div>

          {/* 입력 폼 */}
          <form onSubmit={handleOcrConfirm} className="space-y-5">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-black text-[#b88c30] uppercase tracking-widest">
                    {t('영문 성명 (NAME)')}
                  </Label>
                  <p className="text-[10px] text-amber-400 font-bold">
                    {t('* 정확한 조회를 위해 성과 이름을 꼭 띄어서 입력해 주세요.')}
                  </p>
                </div>
                <input
                  id="step2-name-input"
                  placeholder={t("예: HONG GIL DONG")}
                  value={formData.officialName}
                  onChange={(e) => {
                    const newName = e.target.value.toUpperCase();
                    setFormData({ ...formData, officialName: newName });
                    if (newName.length > 3) {
                      prefetchNameOptimization(newName);
                    }
                  }}
                  className="h-14 px-5 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-base w-full outline-none focus:ring-2 focus:ring-[#b88c30]/50 focus:border-[#b88c30]/50 placeholder:text-slate-600 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-[#b88c30] uppercase tracking-widest">
                  {t('외국인 등록번호')}
                </Label>
                <input
                  id="step2-reg-input"
                  value={formData.registrationNumber}
                  maxLength={13}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="h-14 px-5 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-base w-full outline-none focus:ring-2 focus:ring-[#b88c30]/50 focus:border-[#b88c30]/50 placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* 법령 근거 */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-[#b88c30]/10" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                {t('소득세법 제59조의 4 · 합법적 세금 환급')}
              </span>
              <div className="h-px flex-1 bg-[#b88c30]/10" />
            </div>

            <Button
              id="step2-submit-btn"
              type="submit"
              className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-xl font-black rounded-2xl shadow-2xl shadow-[#b88c30]/20 flex items-center justify-center flex-wrap gap-3 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.02] active:scale-[0.98] group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  <span className="flex-1 text-left">{t('다음 단계로 이동')}</span>
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2 shrink-0" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
