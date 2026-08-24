import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
  Camera,
  MessageSquare
} from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
import { EmbeddedAuthGuide } from "@/components/EmbeddedAuthGuide";

interface Step5AuthWaitingViewProps {
  onPrev: () => void;
  authMethod: 'hana' | 'app' | 'kakao';
  authSession: any;
  language: string;
  preFilterEstimate: number;
  setIsVipChatOpen: (open: boolean) => void;
  ocrResult: any;
  setOcrResult: (res: any) => void;
  isOcrLoading: boolean;
  handleCarrierOcrUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyOcrName: () => void;
  handleFinalVerifyAndAnalyze: () => void;
  loading: boolean;
}

export function Step5AuthWaitingView({
  onPrev,
  authMethod,
  authSession,
  language,
  preFilterEstimate,
  setIsVipChatOpen,
  ocrResult,
  setOcrResult,
  isOcrLoading,
  handleCarrierOcrUpload,
  applyOcrName,
  handleFinalVerifyAndAnalyze,
  loading
}: Step5AuthWaitingViewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#b88c30] rounded-tl-3xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b88c30] rounded-tr-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#b88c30] rounded-bl-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#b88c30] rounded-br-3xl z-10 pointer-events-none" />

      <Card className="rounded-3xl border border-[#b88c30]/30 shadow-2xl overflow-hidden bg-[#0b192c]">
        <CardHeader id="step5-top-anchor" className="text-center py-8 sm:py-10 bg-[#0b192c] border-b border-[#b88c30]/15 relative overflow-hidden">
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
          <div className="mx-auto h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg overflow-hidden p-3 bg-white border border-[#b88c30]/30 relative z-10">
            <Image
              src={authMethod === 'app' ? "/images/logo/pass.png" : authMethod === 'hana' ? "/images/logo/hana_1q.png" : "/images/logo/kakao.png"}
              alt="Auth Method"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-black text-white relative z-10">
            {t('Step 5: 인증 확인')}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-10 bg-[#0d1e30]">
          <div className="text-center space-y-8 py-4">
            {!authSession ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-12 gap-6 bg-white/5 rounded-3xl border border-dashed border-[#b88c30]/30">
                  <Loader2 className="h-16 w-16 animate-spin text-[#b88c30]" />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">
                      {authMethod === 'app' ? t("PASS 앱 인증 요청 중...") : authMethod === 'hana' ? t("하나은행 인증 요청 중...") : t("카카오톡 인증 요청 중...")}
                    </h2>
                    <p className="text-slate-400 font-bold">{t("잠시만 기다려 주세요.")}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-white">{t("휴대폰에서 '확인'을 눌러주세요")}</h2>
                <p className="text-lg font-bold text-slate-450 whitespace-pre-line">
                  {authMethod === 'app' ? t("PASS 앱 알림 또는 문자를 확인한 뒤\n아래 버튼을 눌러주세요.") : authMethod === 'hana' ? t("하나은행 앱(하나원큐) 알림을 확인한 뒤\n아래 버튼을 눌러주세요.") : t("카카오 지갑 알림을 확인한 뒤\n아래 버튼을 눌러주세요.")}
                </p>
              </div>
            )}
          </div>

          {authSession && (
            <div className="space-y-6">
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <h4 className="text-lg font-black text-white">{t('인증 알림이 오지 않나요?')}</h4>
                </div>
                <p className="text-sm font-bold text-slate-400 leading-relaxed text-left">
                  {t('외국 국적자는 통신사에 등록된 이름이 신분증과 다른 경우가 많습니다. 알림이 오지 않는다면 AI가 제안해 준 추천 성명을 하나씩 시도해 보세요.')}
                </p>

                <div id="step5-auth-guide-container" className="pt-2 space-y-4">
                  <div className="space-y-4">
                    <EmbeddedAuthGuide authMethod={authMethod} />
                    {language !== 'ko' && preFilterEstimate >= 400000 && (
                      <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-800/30 text-left">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">{t('VIP 전용 라이브 헬프')}</p>
                        <p className="text-sm font-bold text-amber-350">
                          {t('예상 환급액이 {amount}원이나 됩니다! 인증이 막히셨다면 전문 상담원이 즉시 도와드려요.', { amount: preFilterEstimate.toLocaleString() })}
                        </p>
                      </div>
                    )}
                    {preFilterEstimate >= 400000 && (
                      <Button
                        onClick={() => setIsVipChatOpen(true)}
                        className="w-full h-16 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-lg font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
                      >
                        <MessageSquare className="h-6 w-6 text-[#0b192c] animate-bounce" />
                        {t('실시간 전문 상담원 채팅 시작')}
                      </Button>
                    )}
                  </div>

                  {/* AI OCR 이름 추출 섹션 */}
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mt-4 space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#e2b659]" />
                      <h4 className="font-black text-[#e2b659]">{t('ai_name_check_title')}</h4>
                    </div>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">
                      {t('ai_name_check_desc')}
                    </p>

                    {!ocrResult ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCarrierOcrUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={isOcrLoading}
                        />
                        <Button
                          variant="outline"
                          className="w-full h-14 border-[#b88c30]/30 text-[#e2b659] hover:bg-[#b88c30]/10 rounded-2xl flex items-center justify-center gap-2"
                          disabled={isOcrLoading}
                        >
                          {isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                          {isOcrLoading ? t('analyzing_screenshot') : t('upload_screenshot')}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#0d1e30] rounded-2xl border border-[#b88c30]/30 space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-1">
                          <p className="text-xs font-black text-[#b88c30] uppercase tracking-widest">{t('ocr_result_title')}</p>
                          <p className="text-xl font-black text-white">"{ocrResult.extractedName}"</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 text-center">
                          {ocrResult.recommendation}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="ghost" onClick={() => setOcrResult(null)} className="rounded-xl h-12 font-bold text-slate-450 hover:text-white">
                            {t('다시 인증')}
                          </Button>
                          <Button onClick={applyOcrName} className="bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] rounded-xl h-12 font-black shadow-lg">
                            {t('use_this_name')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            id="step5-submit-btn"
            onClick={handleFinalVerifyAndAnalyze}
            className="w-full min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0b192c] text-2xl font-black rounded-3xl shadow-xl shadow-[#b88c30]/20 whitespace-normal break-words flex items-center justify-center text-center leading-tight"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 완료 및 데이터 분석')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
