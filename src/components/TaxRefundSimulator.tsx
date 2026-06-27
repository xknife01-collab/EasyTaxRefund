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

const enBase = {
  sim_title: "10-Step Real-Time Simulation Showcase",
  sim_desc: "This is not just a mockup slideshow. We reproduce the entire business flow of the actual Easy Tax Refund app, from Step 0 (work info input) to Step 9 (tax agent delegation & electronic signature) with active front-end simulator logic.",
  pause_btn: "Pause",
  play_btn: "Auto Play",
  restart_btn: "Restart",
  step_0: "Eligibility Check (Months/Salary)",
  step_1: "Guideline & Requirements Check",
  step_2: "ARC Information Input",
  step_3: "Mobile Identity Input",
  step_4: "Authentication Choice & Wait",
  step_5: "NTS API Connection & Logic",
  step_6: "AI Refund Precision Report",
  step_7: "Fee (25%) Bank Payout",
  step_8: "Account Info & E-Signature",
  step_9: "Final Application Submission",
  waiting_banner_title: "💡 Direct Selection Pending (Simulation Paused)",
  waiting_banner_desc: "Please click one of the [two options] on the phone screen below! The simulation will resume based on your choice."
};

// 시뮬레이터 내부 단계별 번역 텍스트
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ko: {
    sim_title: "10단계 전과정 실시간 시뮬레이터",
    sim_desc: "단순히 그림을 넘겨보는 더미 애니메이션이 아닙니다. 실제 이지텍스 앱의 0단계 근무 기록 입력부터 9단계 세무사 위임 및 전자 서명 완료까지의 전체 플로우를 실제 작동하는 코드로 고스란히 재현합니다.",
    pause_btn: "일시 정지",
    play_btn: "자동 재생",
    restart_btn: "처음부터",
    step_0: "자격 가조회 (개월수/월급)",
    step_1: "안내 및 준비물 확인",
    step_2: "외국인등록증 정보 입력",
    step_3: "휴대폰 본인 정보 입력",
    step_4: "인증 수단 선택 및 대기",
    step_5: "국세청 API 연동 및 연산",
    step_6: "환급액 정밀 분석 보고서",
    step_7: "수수료(25%) 무통장 입금",
    step_8: "계좌 입력 및 계약 전자서명",
    step_9: "최종 신청 및 접수 완료",
    waiting_banner_title: "💡 직접 선택 대기 중 (시뮬레이션 일시정지)",
    waiting_banner_desc: "가상 핸드폰 화면 속의 [두 가지 선택지] 중 하나를 마우스로 클릭해 주세요! 선택에 따라 각기 다른 시나리오로 데모가 자동 재개됩니다."
  },
  vi: {
    sim_title: "Trình mô phỏng thời gian thực 10 bước",
    sim_desc: "Đây không phải là một hiệu ứng chuyển cảnh giả lập. Chúng tôi tái hiện hoàn chỉnh toàn bộ quy trình từ bước 0 (Nhập thông tin làm việc) đến bước 9 (Ủy quyền đại lý thuế và chữ ký điện tử) bằng mã chạy thực tế của ứng dụng Easy Tax Refund.",
    pause_btn: "Tạm dừng",
    play_btn: "Tự động chạy",
    restart_btn: "Bắt đầu lại",
    step_0: "Kiểm tra điều kiện (Tháng/Lương)",
    step_1: "Hướng dẫn & Chuẩn bị bắt buộc",
    step_2: "Nhập thông tin thẻ người nước ngoài",
    step_3: "Nhập thông tin xác thực điện thoại",
    step_4: "Chọn phương thức xác thực & Chờ",
    step_5: "Liên kết API Cục Thuế & Tính toán",
    step_6: "Báo cáo hoàn thuế chi tiết AI",
    step_7: "Nộp phí dịch vụ (25%)",
    step_8: "Nhập tài khoản & Chữ ký điện tử",
    step_9: "Hoàn tất đăng ký cuối cùng",
    waiting_banner_title: "💡 Đang chờ chọn trực tiếp (Tạm dừng mô phỏng)",
    waiting_banner_desc: "Vui lòng click chọn 1 trong [2 lựa chọn] trên màn hình điện thoại! Trình mô phỏng sẽ tự động tiếp tục theo từng kịch bản tương ứng."
  },
  zh: {
    sim_title: "10步全流程实时模拟器",
    sim_desc: "这并非简单的图片轮播。我们使用Easy Tax Refund应用程序的真实运行代码，完美再现从Step 0（工作记录输入）到Step 9（税务代理委托及电子签名）的全套业务流程。",
    pause_btn: "暂停",
    play_btn: "自动播放",
    restart_btn: "从头开始",
    step_0: "资格快速查询 (月数/工资)",
    step_1: "确认申请前必备事项",
    step_2: "外国人登录证信息输入",
    step_3: "手机实名认证信息输入",
    step_4: "认证方式选择及等待",
    step_5: "联接国税厅API及评估",
    step_6: "AI退税金额精算报告",
    step_7: "支付税务服务费 (25%)",
    step_8: "账户输入及电子签名",
    step_9: "最终申请提交成功",
    waiting_banner_title: "💡 等待手动选择 (模拟已暂停)",
    waiting_banner_desc: "请点击虚拟手机屏幕中的 [两个选项] 之一！模拟将根据选择的场景自动继续播放。"
  },
  en: enBase,
  th: {
    ...enBase,
    sim_title: "โปรแกรมจำลองเสมือนจริง 10 ขั้นตอน",
    sim_desc: "นี่ไม่ใช่การจำลองภาพแบบธรรมดา แต่รันจากโค้ดจริงเพื่อแสดงกระบวนการตั้งแต่ขั้นตอนที่ 0 (ป้อนข้อมูลทำงาน) ไปจนถึงขั้นตอนที่ 9 (มอบอำนาจตัวแทนภาษีและลงลายมือชื่อ)"
  },
  km: enBase,
  ne: enBase,
  uz: enBase,
  my: enBase,
  id: enBase,
  si: enBase,
  mn: enBase,
  bn: enBase,
  kk: enBase,
  ur: enBase
};

export default function TaxRefundSimulator() {
  const { language } = useTranslation();
  const [activeStep, setActiveStep] = useState<number | 'done'>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Virtual Pointer States
  const [pointer, setPointer] = useState({ top: '50%', left: '50%', opacity: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [pointerEventsEnabled, setPointerEventsEnabled] = useState(false);

  const tSim = TRANSLATIONS[language] || TRANSLATIONS['en'];

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

                  {/* 4단계 선택 대기 말풍선 툴팁 */}
                  {activeStep === 4 && pointerEventsEnabled && (
                    <div className="absolute left-8 top-0 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-bounce border border-slate-700">
                      <span>👈 클릭하여 시나리오 선택</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* 4단계 선택 대기 시각 가이드 배너 (핸드폰 외부 배치) */}
          {activeStep === 4 && pointerEventsEnabled && (
            <div className="w-full max-w-[385px] p-5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/80 rounded-3xl text-center space-y-2 animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.3)] z-10 relative">
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="text-sm font-black text-amber-300 tracking-wide uppercase">
                  {tSim.waiting_banner_title}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 leading-relaxed break-keep">
                {tSim.waiting_banner_desc}
              </p>
            </div>
          )}

        </div>

        {/* 오른쪽: 설명 글 및 10단계 시뮬레이터 타임라인 (7 cols) */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-primary" /> Live Code Orchestration
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {tSim.sim_title} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                실시간 리얼 인터랙티브
              </span>
            </h2>
            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xl break-keep">
              {tSim.sim_desc}
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
              <span className="text-[10px] font-black">{tSim.step_0}</span>
            </div>

            {/* Step 0.5 & 1 */}
            <div 
              onClick={() => handleStepJump(0.5)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                (activeStep === 0.5 || activeStep === 1) ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${(activeStep === 0.5 || activeStep === 1) ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>01</div>
              <span className="text-[10px] font-black">{tSim.step_1}</span>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => handleStepJump(2)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 2 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 2 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>02</div>
              <span className="text-[10px] font-black">{tSim.step_2}</span>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => handleStepJump(3)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 3 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 3 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>03</div>
              <span className="text-[10px] font-black">{tSim.step_3}</span>
            </div>

            {/* Step 4 & 5 */}
            <div 
              onClick={() => handleStepJump(4)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                (activeStep === 4 || activeStep === 5) ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${(activeStep === 4 || activeStep === 5) ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>04</div>
              <span className="text-[10px] font-black">{tSim.step_4}</span>
            </div>

            {/* Step 6 */}
            <div 
              onClick={() => handleStepJump(6)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 6 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 6 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>05</div>
              <span className="text-[10px] font-black">{tSim.step_5}</span>
            </div>

            {/* Step 7 */}
            <div 
              onClick={() => handleStepJump(7)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 7 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 7 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>06</div>
              <span className="text-[10px] font-black">{tSim.step_6}</span>
            </div>

            {/* Step 8 */}
            <div 
              onClick={() => handleStepJump(8)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 8 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 8 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>07</div>
              <span className="text-[10px] font-black">{tSim.step_7}</span>
            </div>

            {/* Step 9 */}
            <div 
              onClick={() => handleStepJump(9)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 9 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 9 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>08</div>
              <span className="text-[10px] font-black">{tSim.step_8}</span>
            </div>

            {/* Done */}
            <div 
              onClick={() => handleStepJump('done')}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 'done' ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 'done' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>09</div>
              <span className="text-[10px] font-black">{tSim.step_9}</span>
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
                  <Pause size={12} fill="currentColor" /> {tSim.pause_btn}
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" /> {tSim.play_btn}
                </>
              )}
            </button>
            <button
              onClick={handleRestart}
              className="px-5 py-3 bg-slate-800 border border-slate-700 text-slate-350 hover:text-white hover:bg-slate-750 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw size={12} /> {tSim.restart_btn}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
