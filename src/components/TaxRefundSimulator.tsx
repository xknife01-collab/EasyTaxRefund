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
  Info
} from 'lucide-react';
import { useTranslation } from "@/components/LanguageContext";
import { Language } from '@/lib/translations/config';

import { PERSONAS } from '@/lib/personas';
export { PERSONAS };

export default function TaxRefundSimulator() {
  const { language, t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number | 'done'>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    <section className="w-full py-10 md:py-16 px-4 sm:px-6 md:px-8 bg-slate-950 text-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden mb-12 md:mb-20 max-w-[1600px] mx-auto">
      {/* 웅장한 백그라운드 그라디언트 글로우 */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* 왼쪽: 베젤이 들어간 가상 스마트폰 목업 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none w-full gap-4">
          
          <div className="relative w-full max-w-[385px] h-[680px] sm:h-[780px] bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] p-[8px] sm:p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_0_1px_rgba(255,255,255,0.15)] border-4 border-slate-800 flex flex-col overflow-hidden">
            
            {/* 상단 다이나믹 아일랜드 노치 */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end px-4 gap-1">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              <div className="w-1 h-1 bg-slate-950 rounded-full" />
            </div>

            {/* 상태 표시줄 */}
            <div className="w-full h-8 flex justify-between items-center px-6 pt-1 text-[10px] font-bold text-white/95 z-40 bg-slate-950/60 backdrop-blur-sm">
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
        <div className="lg:col-span-7 space-y-8 text-left">
          
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-primary" /> Live Code Orchestration
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {t("sim_title")} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                {t("실시간 리얼 인터랙티브")}
              </span>
            </h2>
            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xl break-keep">
              {t("sim_desc")}
            </p>
          </div>

          {/* 10단계 콤팩트 타임라인 리스트 */}
          <div className="grid grid-cols-2 gap-2 max-w-xl">
            {/* Step 0 */}
            <div 
              onClick={() => handleStepJump(0)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 0 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 0 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>00</div>
              <span className="text-[10px] font-black">{t("step_0")}</span>
            </div>

            {/* Step 0.5 & 1 */}
            <div 
              onClick={() => handleStepJump(0.5)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                (activeStep === 0.5 || activeStep === 1) ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${(activeStep === 0.5 || activeStep === 1) ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>01</div>
              <span className="text-[10px] font-black">{t("step_1")}</span>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => handleStepJump(2)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 2 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 2 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>02</div>
              <span className="text-[10px] font-black">{t("step_2")}</span>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => handleStepJump(3)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 3 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 3 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>03</div>
              <span className="text-[10px] font-black">{t("step_3")}</span>
            </div>

            {/* Step 4 & 5 */}
            <div 
              onClick={() => handleStepJump(4)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                (activeStep === 4 || activeStep === 5) ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${(activeStep === 4 || activeStep === 5) ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>04</div>
              <span className="text-[10px] font-black">{t("step_4")}</span>
            </div>

            {/* Step 6 */}
            <div 
              onClick={() => handleStepJump(6)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 6 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 6 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>05</div>
              <span className="text-[10px] font-black">{t("step_5")}</span>
            </div>

            {/* Step 7 */}
            <div 
              onClick={() => handleStepJump(7)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 7 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 7 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>06</div>
              <span className="text-[10px] font-black">{t("step_6")}</span>
            </div>

            {/* Step 8 */}
            <div 
              onClick={() => handleStepJump(8)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 8 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 8 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>07</div>
              <span className="text-[10px] font-black">{t("step_7")}</span>
            </div>

            {/* Step 9 */}
            <div 
              onClick={() => handleStepJump(9)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 9 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 9 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>08</div>
              <span className="text-[10px] font-black">{t("step_8")}</span>
            </div>

            {/* Done */}
            <div 
              onClick={() => handleStepJump('done')}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 'done' ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 'done' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>09</div>
              <span className="text-[10px] font-black">{t("step_9")}</span>
            </div>
          </div>

          {/* 재생 제어 컨트롤 버튼 */}
          <div className="flex items-center gap-4 border-t border-slate-800 pt-6">
            <button
              onClick={handleTogglePlay}
              className={`px-5 py-3 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                isPlaying 
                  ? 'bg-slate-800 text-white hover:bg-slate-750 border border-slate-700' 
                  : 'bg-primary text-white hover:bg-primary/80'
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
              className="px-5 py-3 bg-slate-800 border border-slate-700 text-slate-350 hover:text-white hover:bg-slate-750 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw size={12} /> {t("restart_btn")}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
