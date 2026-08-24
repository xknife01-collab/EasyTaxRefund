import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Lock,
  Database,
  Shield,
  Sparkles,
  UserCheck,
  HelpCircle,
  Info,
  CheckCircle2,
  Copy,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

interface Step3ContactInfoViewProps {
  onPrev: () => void;
  formData: {
    phone: string;
    carrier?: string;
    officialName: string;
    authName: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isOptimizing: boolean;
  setIsNameHelpOpen: (open: boolean) => void;
  nameSuggestions: Array<{ name: string; label: string }>;
  isSignUpAgreed: boolean;
  setIsSignUpAgreed: (agreed: boolean) => void;
  handleContactSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  toast: any;
}

export function Step3ContactInfoView({
  onPrev,
  formData,
  setFormData,
  isOptimizing,
  setIsNameHelpOpen,
  nameSuggestions,
  isSignUpAgreed,
  setIsSignUpAgreed,
  handleContactSubmit,
  loading,
  toast
}: Step3ContactInfoViewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Corner Golden Borders for Premium Official Look */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#b88c30] rounded-tl-3xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b88c30] rounded-tr-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#b88c30] rounded-bl-3xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#b88c30] rounded-br-3xl z-10 pointer-events-none" />

      <Card className="rounded-3xl border border-[#b88c30]/30 shadow-2xl overflow-hidden bg-[#0f1e36]">
        {/* Premium Header */}
        <CardHeader className="text-center py-8 sm:py-10 bg-[#0f1e36] text-white relative overflow-hidden">
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

          <div className="relative z-10 flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#b88c30]" />
            <div className="flex items-center gap-2 bg-[#b88c30]/10 border border-[#b88c30]/30 rounded-full px-4 py-1.5">
              <span className="text-[#b88c30] text-[10px] font-black tracking-[0.2em] uppercase">
                {t('Step 03 — 본인 인증')}
              </span>
            </div>
            <div className="h-px w-8 bg-[#b88c30]" />
          </div>

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
            {t('Step 3: 본인 인증 정보 입력')}
          </CardTitle>
          <p className="relative z-10 text-slate-400 font-bold text-sm mt-2">
            {t('통신사 인증을 위해 정확한 정보를 입력해 주세요.')}
          </p>
          <div className="relative z-10 h-px w-16 bg-[#b88c30] mx-auto mt-4" />
        </CardHeader>

        <CardContent className="p-5 sm:p-10 space-y-6 bg-[#0c182b] text-white">
          {/* Security Assurance Card - Styled for official look */}
          <div className="p-6 bg-[#0f2441] rounded-2xl border border-[#b88c30]/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b88c30]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#b88c30]/10 transition-colors" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-[#b88c30]/20 rounded-full blur-xl animate-pulse" />
                <Image
                  src="/certified_security_seal_premium_1774150786685.png"
                  alt="Certified Security"
                  width={72}
                  height={72}
                  className="relative transition-transform group-hover:scale-105"
                />
              </div>
              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
                    {t('security_card_title')}
                    <Badge className="bg-[#b88c30]/10 text-[#b88c30] border border-[#b88c30]/30 text-[9px] font-black py-0.5">
                      {t('security_certified')}
                    </Badge>
                  </h4>
                  <p className="text-xs font-bold text-slate-400">{t('security_card_subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#b88c30]">
                      <Lock className="h-3.5 w-3.5" />
                      {t('security_item_encryption_title')}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_encryption_desc')}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#b88c30]">
                      <Database className="h-3.5 w-3.5" />
                      {t('security_item_no_storage_title')}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_no_storage_desc')}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#b88c30]">
                      <Shield className="h-3.5 w-3.5" />
                      {t('security_item_pippa_title')}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_pippa_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visa / Immigration Safety Guarantee */}
          <div className="flex items-start gap-3 p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/30">
            <div className="h-8 w-8 bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-400/90 leading-relaxed">
              {t('본 환급은 합법적 권리로, 비자(E-9, E-7, F-2 등) 연장이나 체류 자격에 어떠한 불이익도 없습니다.')}
            </p>
          </div>

          {/* ★ 김준현 매니저의 3단계 안심 & 알뜰폰 선택 꿀팁 배너 */}
          <div className="p-5 bg-gradient-to-r from-[#0f1e36] to-[#152a45] rounded-2xl border-2 border-[#b88c30]/50 shadow-lg relative overflow-hidden text-left">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 mt-1">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#b88c30] bg-slate-800 shadow-md">
                  <img src="/images/manager.png" alt="Kim Jun-hyun Manager" className="h-full w-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#b88c30] font-black text-xs uppercase tracking-wider">
                    {t('김준현 공식 매니저 꿀팁 가이드')}
                  </span>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] font-black">
                    {t('스팸 0% 안심 인증')}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-slate-200 leading-relaxed">
                  {t('휴대폰 번호는 국세청 본인 인증을 위해서만 1회 사용되며 스팸이나 광고 연락은 절대 가지 않습니다. 🔒')}
                </p>
                <div className="p-3 bg-[#0a1523]/80 rounded-xl border border-[#b88c30]/30 space-y-1.5 text-left">
                  <p className="text-xs font-black text-[#e2b659] flex items-center gap-1.5">
                    <span>💡</span>
                    <span>{t('알뜰폰을 쓰고 계신가요?')}</span>
                  </p>
                  <p className="text-[11.5px] font-medium text-slate-300 leading-relaxed">
                    {t('통신사 선택 시 꼭 [알뜰폰]을 선택해 주셔야 다음 단계에서 국세청 인증이 막히지 않고 정상 도착합니다!')}
                  </p>
                  <p className="text-[11.5px] font-medium text-slate-400 leading-relaxed">
                    {t('이어서 진행할 국세청 인증 알림 누르는 법도 제가 옆에서 하나씩 짚어드릴 테니, 편하게 번호를 입력해 주세요! 👍')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-[#b88c30] uppercase tracking-widest ml-1">{t('휴대폰 번호')}</Label>
                  <input
                    id="step3-phone-input"
                    placeholder="01012345678"
                    className="h-14 px-5 rounded-xl bg-[#0f2441] border border-slate-700/60 text-white font-bold text-base w-full outline-none focus:ring-2 focus:ring-[#b88c30]/50 focus:border-[#b88c30]/50 placeholder:text-slate-500 transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-[#b88c30] uppercase tracking-widest ml-1">{t('통신사')}</Label>
                  <Select value={formData.carrier || ""} onValueChange={(v) => setFormData({ ...formData, carrier: v })}>
                    <SelectTrigger id="step3-carrier-select" className="h-14 px-5 rounded-xl bg-[#0f2441] border border-slate-700/60 text-white font-bold text-base focus:ring-2 focus:ring-[#b88c30]/50 focus:border-[#b88c30]/50">
                      <SelectValue placeholder={t('통신사 선택')} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c182b] border border-slate-800 text-white">
                      <SelectItem value="SKT">{t('SKT')}</SelectItem>
                      <SelectItem value="KT">{t('KT')}</SelectItem>
                      <SelectItem value="LGU+">{t('LGU+')}</SelectItem>
                      <SelectItem value="SKT 알뜰폰">{t('SKT 알뜰폰')}</SelectItem>
                      <SelectItem value="KT 알뜰폰">{t('KT 알뜰폰')}</SelectItem>
                      <SelectItem value="LGU+ 알뜰폰">{t('LGU+ 알뜰폰')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Name Optimization Box */}
              <div className="space-y-4 p-5 bg-[#0f2441] rounded-2xl border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles className="h-20 w-20 text-[#b88c30]" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#b88c30] rounded-xl flex items-center justify-center shadow-lg shadow-[#b88c30]/20">
                      <UserCheck className="h-4.5 w-4.5 text-[#0f1e36]" />
                    </div>
                    <h4 className="text-sm font-black text-white">
                      {isOptimizing ? t('AI 성명 최적화 분석 중...') : t('통신사 등록 성명 확인(필수)')}
                    </h4>
                  </div>
                  {!isOptimizing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNameHelpOpen(true)}
                      className="text-[11px] h-8 px-3 font-black text-[#b88c30] hover:bg-[#b88c30]/10 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t('정확한 등록 성함 확인 방법')}
                    </Button>
                  )}
                </div>

                {!isOptimizing && (
                  <div className="space-y-3">
                    <div className="p-4 bg-[#0a1523] rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('신분증상 성명')}</span>
                        <Badge className="bg-slate-800 text-slate-400 border-none font-black text-[9px]">{t('BASE')}</Badge>
                      </div>
                      <span className="text-lg font-black text-slate-400 line-through decoration-slate-600">{formData.officialName}</span>
                    </div>

                    <Alert className="bg-[#1c1815] border-amber-900/30 rounded-xl">
                      <Info className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-[11px] font-bold text-amber-400/90 leading-relaxed">
                        {t('외국인은 통신사마다 이름 형식이 다를 수 있습니다. 아래 추천된 형식 중 본인의 [통신사 앱]에 등록된 것과 "완벽히 똑같은" 것을 선택해 주세요.')}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 relative z-10">
                  {isOptimizing && nameSuggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 bg-[#0a1523]/50 rounded-2xl border border-dashed border-slate-800">
                      <Loader2 className="h-10 w-10 animate-spin text-[#b88c30]" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-black text-slate-300">{t('성공 확률이 가장 높은 이름을 찾는 중...')}</p>
                        <p className="text-[11px] font-bold text-slate-500">{t('통신사 전산망의 다양한 영문 표기법을 분석하고 있습니다.')}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {nameSuggestions.map((item, i) => (
                        <div
                          key={i}
                          id={`step3-suggestion-${i}`}
                          onClick={() => {
                            setFormData({ ...formData, authName: item.name });
                            navigator.clipboard.writeText(item.name);
                            toast({
                              title: t("성명 복사 완료"),
                              description: t("'{name}'이(가) 클립보드에 복사되었습니다. PASS 앱에 그대로 붙여넣으세요.", { name: item.name })
                            });
                          }}
                          className={`group p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 relative ${formData.authName === item.name ? 'bg-[#b88c30] border-[#b88c30] text-[#0f1e36] shadow-xl scale-[1.01] z-20' : 'bg-[#0a1523] border-slate-800 text-white hover:border-[#b88c30]/40'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-black text-lg tracking-tight">{item.name}</span>
                            {formData.authName === item.name ? (
                              <div className="h-5 w-5 bg-[#0f1e36] rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#b88c30]" />
                              </div>
                            ) : (
                              <div className="h-7 w-7 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-[#b88c30]/20 transition-colors">
                                <Copy className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#b88c30]" />
                              </div>
                            )}
                          </div>
                          <span className={cn("text-[9px] font-black uppercase tracking-wider", formData.authName === item.name ? "text-[#0f1e36]/75" : "text-[#b88c30]/75")}>
                            {t(item.label)}
                          </span>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-slate-800 mt-2 space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('직접 입력하기')}</Label>
                          <span className="text-[9px] text-slate-500 font-bold">{t('추천 목록에 없는 경우')}</span>
                        </div>
                        <div className="relative group">
                          <input
                            placeholder={t('통신사에 등록된 이름을 그대로 입력')}
                            value={formData.authName}
                            onChange={(e) => setFormData({ ...formData, authName: e.target.value.toUpperCase() })}
                            className="h-14 px-5 rounded-xl bg-[#0a1523] border border-slate-850 font-black text-base w-full outline-none focus:ring-2 focus:ring-[#b88c30]/30 focus:border-[#b88c30] transition-all pr-12 text-white"
                          />
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#b88c30] transition-colors" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Marketing / Notification consent checkbox */}
            <div className="p-5 bg-[#0f2441] border border-slate-700/50 rounded-2xl flex items-start gap-4 transition-all hover:border-[#b88c30]/20">
              <Checkbox id="signup" checked={isSignUpAgreed} onCheckedChange={(c) => setIsSignUpAgreed(c as boolean)} className="mt-1 h-5 w-5 border-slate-600" />
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Label htmlFor="signup" className="text-base font-black text-white cursor-pointer break-keep">{t('회원가입 및 환급 알림 받기')}</Label>
                  <Badge className="bg-[#b88c30]/10 text-[#b88c30] border border-[#b88c30]/20 text-[9px] font-bold h-5">{t('무료')}</Badge>
                </div>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">{t('환급금 결과 및 진행 상황을 안전하게 안내해 드립니다.')}</p>
              </div>
            </div>

            {/* NTS Legal Notice Link / Divider */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{t('소득세법 제59조의 4 · 합법적 세금 환급')}</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <Button
              id="step3-submit-btn"
              type="submit"
              className="w-full min-h-[4rem] sm:min-h-[5rem] h-auto py-4 px-6 bg-[#b88c30] hover:bg-[#cfa54c] text-[#0f1e36] text-lg sm:text-xl font-black rounded-2xl shadow-xl shadow-[#b88c30]/10 flex items-center justify-center flex-wrap gap-3 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.01] active:scale-[0.99] group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  <span className="flex-1 text-left pl-4">{t('조회 정보 확인 완료')}</span>
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1.5 shrink-0 pr-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
