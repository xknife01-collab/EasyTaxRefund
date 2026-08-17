'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  ArrowRight, 
  Lock, 
  Shield, 
  Activity, 
  FileText, 
  Check, 
  HelpCircle, 
  Trophy, 
  CreditCard, 
  Banknote, 
  PenTool,
  ChevronRight,
  RefreshCw,
  Info,
  Sliders
} from 'lucide-react';
import { useTranslation } from "@/components/LanguageContext";
import { Language } from '@/lib/translations/config';

import { PERSONAS } from '@/lib/personas';
export { PERSONAS };

export const STEP_DETAILED_GUIDES: Record<number, {
  title: string;
  badge: string;
  summary: string;
  steps: string[];
  securityNote: string;
}> = {
  0: {
    title: "Step 0: 예상 환급액 모의 조회",
    badge: "자격 가조회",
    summary: "근무 기간과 평균 월급을 선택하여 0.1초 만에 예상 소득세 감면액을 계산하는 단계입니다.",
    steps: [
      "한국 중소기업 근무 개월 수(예: 36개월)를 선택하세요.",
      "대략적인 월평균 급여(예: 250만 원)를 설정해 주세요.",
      "하단의 [예상 환급금 조회하기] 버튼을 누르면 1차 계산 결과가 나옵니다."
    ],
    securityNote: "🔒 회원가입 없이 바로 확인 가능하며 입력한 숫자는 어디에도 저장되지 않습니다."
  },
  1: {
    title: "Step 1: 신청 전 안내 및 준비사항 확인",
    badge: "본인 확인 준비",
    summary: "국세청 소득세 감면 신청을 위해 본인 명의 휴대폰 및 신분증 준비를 확인하는 단계입니다.",
    steps: [
      "본인 명의의 휴대폰과 신분증(외국인등록증)을 준비해 주세요.",
      "인증서가 없으셔도 카카오톡, 하나은행 등으로 1분 만에 쉽게 진행할 수 있습니다.",
      "하단의 [시작하기] 버튼을 눌러 다음 단계로 진행하세요."
    ],
    securityNote: "🔒 모든 개인정보는 은행급 보안 프로토콜로 안전하게 보호됩니다."
  },
  2: {
    title: "Step 2: 외국인등록증 정보 입력",
    badge: "인적사항 확인",
    summary: "국세청 소득세 감면 신청서 작성을 위한 외국인등록증(ARC) 정보를 입력하는 단계입니다.",
    steps: [
      "외국인등록증에 적힌 영문 성명(또는 한글 성명)을 정확히 입력하세요.",
      "외국인등록번호 13자리를 차례대로 입력하세요.",
      "필요 시 신분증 사진을 업로드하시면 자동 인식(OCR)으로 편리하게 처리됩니다."
    ],
    securityNote: "🔒 모든 신분증 이미지 및 개인정보는 조회 완료 즉시 영구 파기됩니다."
  },
  3: {
    title: "Step 3: 휴대폰 본인 정보 입력",
    badge: "SMS 인증 요청",
    summary: "국세청 세금 기록을 안전하게 확인하기 위해 휴대폰 본인인증 문자를 발송하는 단계입니다.",
    steps: [
      "본인 명의의 통신사(SKT, KT, LGU+, 알뜰폰)를 선택하세요.",
      "휴대폰 번호를 입력하고 [인증번호 발송]을 클릭하세요.",
      "문자로 도착한 6자리 인증번호를 입력창에 정확히 입력해 주세요."
    ],
    securityNote: "🔒 인증 정보는 암호화 전송되며 국세청 본인 확인 직후 영구 파기됩니다."
  },
  4: {
    title: "Step 4: 간편인증 진행 및 승인",
    badge: "간편인증 승인",
    summary: "카카오톡, PASS, 하나은행 등 간편인증 앱에서 승인 요청을 확인하고 비밀번호를 입력하는 단계입니다.",
    steps: [
      "휴대폰으로 도착한 카카오톡 / PASS / 하나은행 인증 알림을 열어주세요.",
      "화면의 안내에 따라 간편 비밀번호 6자리 또는 지문 인증을 완료하세요.",
      "인증 완료 후 본 화면으로 돌아오시면 자동으로 국세청 연동이 시작됩니다."
    ],
    securityNote: "🔒 인증번호는 3분간 유효하며 타인에게 절대 공유하지 마세요."
  },
  5: {
    title: "Step 5: 국세청 API 연동 및 세액 연산",
    badge: "자동 세액 산출",
    summary: "국세청 데이터베이스와 실시간 연동하여 지난 5년간 납부한 근로소득세와 90% 감면액을 정밀 계산하는 단계입니다.",
    steps: [
      "약 5~10초간 정밀 조회가 진행되니 화면을 닫지 마시고 잠시 기다려 주세요.",
      "국세청 전산망에서 최근 5개년 근로소득 원천징수 내역을 안전하게 불러옵니다.",
      "연산이 완료되면 즉시 환급 보고서 화면으로 자동 전환됩니다."
    ],
    securityNote: "🔒 국가 공인 세무법인 시스템이 표준 세법 규정에 맞춰 정확하게 계산합니다."
  },
  6: {
    title: "Step 6: AI 환급금 정밀 분석 보고서",
    badge: "환급액 확인",
    summary: "국세청 정밀 분석 결과 산출된 연도별 실제 세금 환급 가능액을 투명하게 확인하는 단계입니다.",
    steps: [
      "화면에 표시된 최종 예상 환급액(예: 3,240,000원)을 확인하세요.",
      "연도별 감면 대상 기간과 실제 돌려받으실 세액 명세를 검토하세요.",
      "하단의 [환급 신청 계속하기] 버튼을 눌러 다음 단계로 진행하세요."
    ],
    securityNote: "💡 산출된 환급액은 국세청에서 고객님 통장으로 직접 전액 입금됩니다."
  },
  7: {
    title: "Step 7: 환급액 확인 및 수수료 동의",
    badge: "후불 정산 동의",
    summary: "100% 후불 정산 원칙(미환급 시 0원)에 동의하고 국세청 가입 대행을 진행하는 단계입니다.",
    steps: [
      "환급 성공 시에만 발생하는 22% 후불 수수료 정책을 확인하세요.",
      "환급금이 없거나 거절될 경우 수수료는 0원(고객 부담 0%)입니다.",
      "약관 확인 후 [동의하고 계좌 등록하기] 버튼을 눌러주세요."
    ],
    securityNote: "🔒 100% 후불 정산 정책으로, 지금 결제되는 금액은 0원입니다."
  },
  8: {
    title: "Step 8: 환급금 수령 계좌 등록",
    badge: "본인 계좌 입력",
    summary: "국세청에서 환급금을 직접 입금받으실 본인 명의의 한국 은행 계좌를 입력하고 1원 인증을 진행하는 단계입니다.",
    steps: [
      "입금받으실 한국 은행(카카오뱅크, 토스, 국민, 신한, 농협 등)을 선택하세요.",
      "하이픈(-) 없이 본인 명의의 계좌번호를 입력해 주세요.",
      "1원 송금 인증 또는 예금주 일치 확인을 완료하세요."
    ],
    securityNote: "🔒 국세청에서 회원님 계좌로 직접 입금하며, 계좌 비밀번호나 인출 권한을 절대 요구하지 않습니다."
  },
  9: {
    title: "Step 9: 세무사 위임 및 전자서명 완료",
    badge: "최종 접수 완료",
    summary: "국가 공인 세무사가 국세청에 대신 환급 서류를 제출할 수 있도록 정식 위임 서명하고 최종 접수하는 단계입니다.",
    steps: [
      "전자 서명란에 손가락이나 마우스로 본인의 서명을 작성하세요.",
      "세무사 경정청구 위임 약관 동의 체크박스에 체크해 주세요.",
      "[환급 신청 완료하기] 버튼을 누르면 접수가 완료되고 신청 확인서가 발급됩니다."
    ],
    securityNote: "🎉 관할 세무서 심사 기간(약 45~60일) 동안 언제든 진행 상황을 조회하실 수 있습니다."
  }
};

export function getGuideForStep(step: number | 'done') {
  if (step === 0) return STEP_DETAILED_GUIDES[0];
  if (step === 0.5 || step === 1) return STEP_DETAILED_GUIDES[1];
  if (step === 2) return STEP_DETAILED_GUIDES[2];
  if (step === 3) return STEP_DETAILED_GUIDES[3];
  if (step === 4 || step === 5) return STEP_DETAILED_GUIDES[4];
  if (step === 6) return STEP_DETAILED_GUIDES[5];
  if (step === 7) return STEP_DETAILED_GUIDES[6];
  if (step === 8) return STEP_DETAILED_GUIDES[7];
  if (step === 9) return STEP_DETAILED_GUIDES[8];
  return STEP_DETAILED_GUIDES[9]; // step 10, 11, 'done'
}

interface TaxRefundSimulatorProps {
  initialStep?: number | 'done';
}

export default function TaxRefundSimulator({ initialStep = 0 }: TaxRefundSimulatorProps) {
  const { language, t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number | 'done'>(initialStep);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync initialStep when changed from outside
  useEffect(() => {
    setActiveStep(initialStep);
    const targetStep = initialStep === 'done' ? 10 : initialStep;
    postControlMessage({ type: 'JUMP_STEP', step: targetStep });
  }, [initialStep]);

  // Virtual Pointer States
  const [pointer, setPointer] = useState({ top: '50%', left: '50%', opacity: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [pointerEventsEnabled, setPointerEventsEnabled] = useState(false);

  

  const selectedPersona = useMemo(() => {
    const langKey = language as Language;
    if (PERSONAS[langKey]) return langKey;
    return 'en';
  }, [language]);

  // Bi-directional message communication: Host listens to Child events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'STEP_CHANGED') {
        const stepNum = data.step;
        if (stepNum === 10) {
          setActiveStep('done');
        } else {
          setActiveStep(stepNum);
        }
      } else if (data.type === 'UPDATE_POINTER') {
        setPointer({ 
          top: data.top, 
          left: data.left, 
          opacity: data.opacity !== undefined ? data.opacity : 1 
        });
        if (data.click) {
          setIsClicking(true);
          setTimeout(() => setIsClicking(false), 200);
        }
      } else if (data.type === 'SET_POINTER_EVENTS') {
        setPointerEventsEnabled(data.enabled);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Hide social proof popups on mount while simulator is shown
    window.dispatchEvent(new CustomEvent("hide-social-proof"));
    return () => {
      window.dispatchEvent(new CustomEvent("show-social-proof"));
    };
  }, []);

  // Post control message helper
  const postControlMessage = (msg: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  };

  // Sync parent playing status to child iframe
  useEffect(() => {
    postControlMessage({ type: 'SET_PLAYING', isPlaying });
  }, [isPlaying]);

  // Handle timeline step jump
  const handleStepJump = (stepNum: number | 'done') => {
    setActiveStep(stepNum);
    const targetStep = stepNum === 'done' ? 10 : stepNum;
    postControlMessage({ type: 'JUMP_STEP', step: targetStep });
  };

  const handleTogglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    postControlMessage({ type: 'SET_PLAYING', isPlaying: nextPlaying });
  };

  const handleRestart = () => {
    setActiveStep(0);
    postControlMessage({ type: 'JUMP_STEP', step: 0 });
    postControlMessage({ type: 'SET_PLAYING', isPlaying: true });
    setIsPlaying(true);
  };

  // Animate Virtual Mouse Pointer based on activeStep
  useEffect(() => {
    // Let the child iframe control the pointer updates via postMessage to ensure perfect sync
    return;
  }, [activeStep]);

  return (
    <section className="w-full py-6 md:py-8 px-4 sm:px-6 md:px-8 bg-[#0b192c] text-white relative overflow-hidden mb-8 md:mb-12 max-w-[1600px] mx-auto rounded-3xl">
      {/* 상단/하단 골드 라인 */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e2b659] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e2b659] to-transparent" />
      {/* 배경 장식 글로우 */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#b88c30]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
        
        {/* 왼쪽: 베젤이 들어간 가상 스마트폰 목업 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none w-full gap-4">
          
          <div className="relative w-full max-w-[385px] h-[650px] sm:h-[740px] bg-[#0f1e36] rounded-[2.5rem] sm:rounded-[3rem] p-[8px] sm:p-[10px] shadow-[0_32px_80px_-10px_rgba(15,30,54,0.45),_0_0_0_2px_rgba(184,140,48,0.3)] border-4 border-[#0f1e36] flex flex-col overflow-hidden">
            
            {/* 상단 다이나믹 아일랜드 노치 */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end px-4 gap-1">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              <div className="w-1 h-1 bg-slate-950 rounded-full" />
            </div>

            {/* 상태 표시줄 */}
            <div className="w-full h-8 flex justify-between items-center px-6 pt-1 text-[10px] font-bold text-white/95 z-40 bg-[#0a1525]/80 backdrop-blur-sm">
              <span>12:09</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="flex items-end gap-0.5 h-2">
                  <div className="w-0.5 h-1 bg-white rounded-full" />
                  <div className="w-0.5 h-1.5 bg-white rounded-full" />
                  <div className="w-0.5 h-2 bg-white rounded-full" />
                </div>
                <div className="w-5 h-2.5 border border-white/60 rounded-[3px] p-[1px] flex items-center">
                  <div className="h-full w-4 bg-primary rounded-[1px] animate-pulse" />
                </div>
              </div>
            </div>

            {/* 웹 뷰포트 영역 */}
            <div className="w-full flex-1 bg-white rounded-[2.2rem] overflow-hidden flex flex-col relative text-slate-800 font-sans">
              
              {/* 브라우저 URL 바 */}
              <div className="w-full bg-slate-100 border-b border-slate-200/60 p-2 flex items-center gap-2 z-10 shrink-0">
                <div className="flex gap-1 pl-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-0.5 px-3 text-[9px] text-slate-500 font-medium text-center truncate flex items-center justify-center gap-1">
                  <span className="text-emerald-500">🔒</span> easy-tax-refund.co.kr/estimate
                </div>
              </div>

              {/* 실제 콘텐츠 뷰포트 (아이프레임 연동) */}
              <div className="w-full flex-1 flex flex-col overflow-hidden relative bg-slate-50 text-[11px] text-left">
                <iframe
                  ref={iframeRef}
                  src={`/estimate?simulation=true&persona=${selectedPersona}&lang=${language}`}
                  className="w-full h-full border-0 select-none bg-white"
                  style={{ pointerEvents: pointerEventsEnabled ? 'auto' : 'none' }}
                />

                {/* 가상 마우스 포인터 */}
                <div 
                  className="absolute pointer-events-none z-50 rounded-full flex items-center justify-center transition-all duration-700 ease-in-out"
                  style={{ 
                    top: pointer.top, 
                    left: pointer.left, 
                    opacity: pointer.opacity,
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  {/* 포인터 서클 */}
                  <div className={`w-6 h-6 rounded-full border-2 border-white bg-amber-400/80 shadow-lg flex items-center justify-center transition-transform ${isClicking ? 'scale-75 bg-amber-500' : 'scale-100'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* 오른쪽: 설명 글 및 10단계 시뮬레이터 타임라인 (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <div className="space-y-3">
            {/* 아이브로우 */}
            <div className="flex items-center gap-3">
              <div className="h-[3px] w-8 bg-[#e2b659]" />
              <span className="inline-flex items-center gap-1.5 text-[#e2b659] text-xs font-black uppercase tracking-[0.3em]">
                <Sparkles size={11} /> Live Process Showcase & Guide
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white border-l-4 border-[#e2b659] pl-4">
              {t("sim_title")}
            </h2>
          </div>

          {/* 🌟 AI 매니저 김준현 1:1 상세 가이드 박스 */}
          {(() => {
            const guide = getGuideForStep(activeStep);
            return (
              <div className="bg-[#0f2442] border-2 border-[#e2b659]/50 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e2b659] text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                      {t("김준현")}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base flex items-center gap-2">
                        {t(guide.title)}
                        <span className="text-[10px] bg-[#e2b659]/20 text-[#e2b659] px-2 py-0.5 rounded-full border border-[#e2b659]/30 font-semibold">
                          {t(guide.badge)}
                        </span>
                      </h4>
                      <p className="text-xs text-amber-200/80">{t("공식 가이드 매니저의 1:1 친절 설명")}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  💡 {t(guide.summary)}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-amber-300">{t("📌 단계별 가이드:")}</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {guide.steps.map((st, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#e2b659] font-bold shrink-0">{i + 1}.</span>
                        <span>{t(st)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 border-t border-white/10">
                  <span>{t(guide.securityNote)}</span>
                </div>
              </div>
            );
          })()}

          {/* 🌟 15개국어 10단계 콤팩트 타임라인 및 자유 점프 네비게이터 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#e2b659] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#e2b659]" /> {t("15개국어 단계별 자유 점프 & 탐색")}
              </span>
              <span className="text-[10px] text-amber-200/90 font-medium">{t("환급 단계에서 어느 부분을 눌러야 하는지 보여주는 가상 화면입니다.")}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-w-xl">
            {[
              { step: 0, label: t('step_0'), num: '01' },
              { step: 0.5, label: t('step_1'), num: '02', alt: 1 },
              { step: 2, label: t('step_2'), num: '03' },
              { step: 3, label: t('step_3'), num: '04' },
              { step: 4, label: t('step_4'), num: '05', alt: 5 },
              { step: 6, label: t('step_5'), num: '06' },
              { step: 7, label: t('step_6'), num: '07' },
              { step: 8, label: t('step_7'), num: '08' },
              { step: 9, label: t('step_8'), num: '09' },
              { step: 'done' as const, label: t('step_9'), num: '10' },
            ].map(({ step, label, num, alt }) => {
              const isActive = activeStep === step || (alt !== undefined && activeStep === alt);
              return (
                <div
                  key={String(step)}
                  onClick={() => handleStepJump(step)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 group ${
                    isActive
                      ? 'bg-[#e2b659] border-[#e2b659] shadow-lg shadow-[#e2b659]/20'
                      : 'bg-white/5 border-white/10 hover:border-[#e2b659]/40 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 ${
                    isActive ? 'bg-[#0b192c] text-[#e2b659]' : 'bg-white/10 text-[#e2b659]'
                  }`}>{num}</div>
                  <span className={`text-[10px] font-black leading-tight ${
                    isActive ? 'text-[#0b192c]' : 'text-slate-300 group-hover:text-white'
                  }`}>{label}</span>
                </div>
              );
            })}
            </div>
          </div>

          {/* 재생 제어 컨트롤 버튼 */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-6">
            <button
              onClick={handleTogglePlay}
              className={`px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                isPlaying 
                  ? 'bg-[#e2b659] text-[#0b192c] hover:bg-[#c9a040]' 
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={12} fill="currentColor" /> {t("pause_btn")}
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" /> {t("play_btn")}
                </>
              )}
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/15 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw size={12} /> {t("restart_btn")}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
