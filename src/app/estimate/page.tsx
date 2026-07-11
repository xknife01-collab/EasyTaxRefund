/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

import {
  initiateRefundAuth,
  completeAuthAndEstimate,
  checkHometaxIdDuplicate,
  requestHometaxSignupSms,
  completeHometaxSignup,
  findHometaxIdSms,
  verifyFindHometaxId,
  resetHometaxPasswordSms,
  verifyResetHometaxPassword,
  estimateRefundWithIdPw
} from "@/ai/flows/automated-refund-estimate";
import { extractIdInfo } from "@/ai/flows/ocr-id-flow";
import { Language } from "@/lib/translations/config";
import { PERSONAS } from "@/lib/personas";
import { optimizeName } from "@/ai/flows/name-optimization-flow";
import { translateChatMessage } from "@/ai/flows/chat-translation-flow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  AlertCircle,
  Scan,
  Camera,
  ArrowRight,
  Database,
  Trophy,
  Sliders,
  Smartphone,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  CreditCard,
  Building2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Phone,
  MessageSquare,
  MessageCircle,
  SearchX,
  RotateCcw,
  ArrowLeft,
  Banknote,
  FileText,
  BadgeCheck,
  Copy,
  User,
  UserPlus,
  Unlock,
  Mail,
  Lock,
  Shield,
  Lightbulb,
  Search,
  X,
  HelpCircle,
  Send,
  Download,
  Printer,
  Stamp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PassGuideModal } from "@/components/PassGuideModal";
import { KakaoGuideModal } from "@/components/KakaoGuideModal";
import { HanaGuideModal } from "@/components/HanaGuideModal";
import { EmbeddedAuthGuide } from "@/components/EmbeddedAuthGuide";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  increment
} from "firebase/firestore";
import { getStoredTrackingData, getEffectiveSource } from "@/lib/tracking";
import Image from "next/image";

function RefundCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 1500; // 1.5s
    const startTime = performance.now();
    
    let animationFrameId: number;
    
    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.floor(easeProgress * end);
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(end);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);
  
  return <>{displayValue.toLocaleString()}</>;
}

export default function EstimatePage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();



  const BANK_LOGOS: Record<string, React.ReactNode> = {
    "하나은행": (
      <div className="h-8 w-8 bg-[#008485] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
      </div>
    ),
    "KB국민은행": (
      <div className="h-8 w-8 bg-[#ffbc00] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10 overflow-hidden text-[#4b413a] font-black text-[10px]">
        <div className="flex flex-col items-center leading-none">
          <span>K</span>
          <span>B</span>
        </div>
      </div>
    ),
    "신한은행": (
      <div className="h-8 w-8 bg-[#0046ff] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20 p-1">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v7h-2z" />
        </svg>
      </div>
    ),
    "우리은행": (
      <div className="h-8 w-8 bg-[#0067ac] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <div className="h-5 w-5 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-[10px] font-black text-white">W</span>
        </div>
      </div>
    ),
    "NH농협은행": (
      <div className="h-8 w-8 bg-[#00a35c] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <div className="flex flex-col items-center leading-none text-white font-black text-[9px]">
          <span>N</span>
          <span>H</span>
        </div>
      </div>
    ),
    "카카오뱅크": (
      <div className="h-8 w-8 bg-[#fee500] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5">
        <span className="text-[14px] font-black text-black">B</span>
      </div>
    ),
    "토스뱅크": (
      <div className="h-8 w-8 bg-[#0064ff] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      </div>
    ),
    "IBK기업은행": (
      <div className="h-8 w-8 bg-[#0053a1] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <span className="text-[8px] font-black text-white">IBK</span>
      </div>
    ),
    "케이뱅크": (
      <div className="h-8 w-8 bg-[#00235a] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <span className="text-[10px] font-black text-white italic">K</span>
      </div>
    ),
    "우체국": (
      <div className="h-8 w-8 bg-[#ed1c24] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </div>
    )
  };


  const router = useRouter();

  const [step, setStep] = useState(0);

  // 국세청 홀택스 점검 시간 체크 (KST 00:00 ~ 06:00)
  const [isNtsMaintenance, setIsNtsMaintenance] = useState(false);
  useEffect(() => {
    const checkMaintenance = () => {
      const kstHour = parseInt(
        new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false })
      );
      setIsNtsMaintenance(kstHour >= 0 && kstHour < 6);
    };
    checkMaintenance();
    const timer = setInterval(checkMaintenance, 60000); // 1분마다 재확인
    return () => clearInterval(timer);
  }, []);
  const [isVipChatOpen, setIsVipChatOpen] = useState(false);
  const [isChatInputVisible, setIsChatInputVisible] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isSignUpAgreed, setIsSignUpAgreed] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthGuideOpen, setIsAuthGuideOpen] = useState(false);
  const [isKakaoGuideOpen, setIsKakaoGuideOpen] = useState(false);
  const [isKakaoAuthGuideOpen, setIsKakaoAuthGuideOpen] = useState(false);
  const [isHanaGuideOpen, setIsHanaGuideOpen] = useState(false);
  const [hanaGuideMode, setHanaGuideMode] = useState<'registration' | 'auth' | 'full'>('registration');
  const [isNameHelpOpen, setIsNameHelpOpen] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [showMockPasswordPad, setShowMockPasswordPad] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [showProactiveHelp, setShowProactiveHelp] = useState(false);

  // Step 0: Pre-filter Data
  const [preFilterData, setPreFilterData] = useState({
    workMonths: 36,
    avgSalary: 250
  });
  const [preFilterEstimate, setPreFilterEstimate] = useState(0);

  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isSim = searchParams.get('simulation') === 'true';

      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isInApp = /FBAN|FBAV|Instagram|KAKAOTALK|Line|Twitter/i.test(ua);

      if (isInApp && !isSim) {
        setIsInAppBrowser(true);
        // 자동 전환은 페이스북에 의해 차단되므로, 오버레이를 통해 사용자 클릭 유도
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      });
    }
  }, []);

  const handleInstallApp = () => {
    if (isInAppBrowser) {
      // 현재 URL에 언어 파라미터를 추가하여 전달
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('lang', language);
      const targetUrl = currentUrl.toString();

      if (navigator.userAgent.match(/Android/i)) {
        window.location.href = `intent://${targetUrl.replace(/^https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      } else {
        navigator.clipboard.writeText(targetUrl);
        toast({ title: t("in_app_browser_copy_done"), description: t("in_app_browser_copy_desc") });
      }
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    } else {
      toast({ title: t("앱 설치 안내"), description: t("안드로이드는 크롬 메뉴에서, 아이폰은 공유 버튼을 누르고 '홈 화면에 추가'를 선택해주세요.") });
    }
  };

  const [analysisError, setAnalysisError] = useState<{
    code: string;
    title: string;
    reason: string;
    solution: string;
    isHighValue?: boolean;
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [bankSelectOpen, setBankSelectOpen] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Language>('ko');
  const [isPlaying, setIsPlaying] = useState(true);

  const [authSession, setAuthSession] = useState<{ id: string, twoWayInfo: any } | null>(null);

  // Enforce session cookie/state persistence for authSession
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (authSession) {
        sessionStorage.setItem('authSession', JSON.stringify(authSession));
      } else {
        sessionStorage.removeItem('authSession');
      }
    }
  }, [authSession]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuthSession = sessionStorage.getItem('authSession');
      if (savedAuthSession) {
        try {
          const parsed = JSON.parse(savedAuthSession);
          setAuthSession(parsed);
          console.log("[Frontend] Restored authSession from sessionStorage:", parsed);
        } catch (e) {
          console.error("Failed to parse saved authSession:", e);
        }
      }
    }
  }, []);
  const [authMethod, setAuthMethod] = useState<'app' | 'kakao' | 'hana'>('hana');
  const [hasCertificate, setHasCertificate] = useState<boolean | null>(null);
  const [hadCertificateInitially, setHadCertificateInitially] = useState<boolean | null>(null);

  const [nameSuggestions, setNameSuggestions] = useState<{ name: string, label: string }[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const optimizationNameRef = useRef("");
  const [eligibilityRange, setEligibilityRange] = useState({ start: "", end: "" });

  const [formData, setFormData] = useState({
    officialName: "",
    authName: "",
    registrationNumber: "",
    issueDate: "",
    phone: "",
    carrier: "",
    otpCode: "",
    bankName: "",
    accountNumber: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    depositorName: "",
    accountHolder: ""
  });
  const [draftAppId, setDraftAppId] = useState<string | null>(null);
  const savingPromiseRef = useRef<Promise<string | void> | null>(null);

  // Personal Info Consent states for Step 2
  const [piConsent, setPiConsent] = useState(true);
  const [piConsentOpen, setPiConsentOpen] = useState(false);

  // Step 9 CMS Consent states
  const [cmsConsent1, setCmsConsent1] = useState(true);
  const [cmsConsent2, setCmsConsent2] = useState(true);
  const [cmsConsent3, setCmsConsent3] = useState(true);
  const [cmsConsentAll, setCmsConsentAll] = useState(true);
  const [cmsModalOpen1, setCmsModalOpen1] = useState(false);
  const [cmsModalOpen2, setCmsModalOpen2] = useState(false);
  const [cmsModalOpen3, setCmsModalOpen3] = useState(false);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const refundFee = result?.refundEstimate ? Math.floor(result.refundEstimate * 0.25) : 0;

  // --- New Hometax states ---
  const [authTab, setAuthTab] = useState<'signup' | 'login'>('signup');
  const [paymentTab, setPaymentTab] = useState<'card' | 'bank'>('card');
  const [hometaxId, setHometaxId] = useState("");
  const [hometaxPw, setHometaxPw] = useState("");
  const [hometaxPwConfirm, setHometaxPwConfirm] = useState("");
  const [hometaxEmail, setHometaxEmail] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [signupTransactionId, setSignupTransactionId] = useState("");
  const [signupStepData, setSignupStepData] = useState<any>(null);
  const [isIdDuplicateChecked, setIsIdDuplicateChecked] = useState(false);
  const [isIdChecking, setIsIdChecking] = useState(false);
  const [isIdGenerating, setIsIdGenerating] = useState(false);
  const [isSmsRequested, setIsSmsRequested] = useState(false);
  const [smsTimer, setSmsTimer] = useState(0);
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);

  // 1-Won Verification States
  const [is1WonSent, setIs1WonSent] = useState(false);
  const [is1WonVerified, setIs1WonVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [is1WonLoading, setIs1WonLoading] = useState(false);

  // Find ID states
  const [findIdOpen, setFindIdOpen] = useState(false);
  const [findIdStep, setFindIdStep] = useState<1 | 2>(1);
  const [findIdForm, setFindIdForm] = useState({
    name: "",
    regNo: "",
    telecom: "0",
    phone: "",
    smsCode: "",
    transactionId: "",
    stepData: null as any
  });
  const [findIdResult, setFindIdResult] = useState("");
  const [findIdLoading, setFindIdLoading] = useState(false);

  // Reset PW states
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [resetPwStep, setResetPwStep] = useState<1 | 2>(1);
  const [resetPwForm, setResetPwForm] = useState({
    hometaxId: "",
    name: "",
    regNo: "",
    telecom: "0",
    phone: "",
    newPw: "",
    smsCode: "",
    transactionId: "",
    stepData: null as any
  });
  const [resetPwLoading, setResetPwLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const sim = searchParams.get('simulation') === 'true';
      setIsSimulation(sim);
      if (sim && searchParams.get('play') === 'false') {
        setIsPlaying(false);
      }
      const p = searchParams.get('persona') as Language;
      if (p) setSelectedPersona(p);

      const isLocalHost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.hostname.includes('192.168.') ||
                          window.location.hostname.includes('10.');
      setIsLocal(isLocalHost || process.env.NODE_ENV === 'development');
    }
  }, []);

  // Suppress Firebase errors in the console and browser overlays during simulation mode
  useEffect(() => {
    if (isSimulation) {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        const message = args.map(arg => String(arg)).join(" ");
        if (
          message.includes("Firebase") || 
          message.includes("firestore") || 
          message.includes("database") || 
          message.includes("permission-denied") || 
          message.includes("FirebaseError") ||
          message.includes("FIRESTORE") ||
          message.includes("quota-exceeded")
        ) {
          return;
        }
        originalConsoleError.apply(console, args);
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.message || String(event.reason);
        if (
          reason.includes("Firebase") ||
          reason.includes("firestore") ||
          reason.includes("permission-denied") ||
          reason.includes("FirebaseError")
        ) {
          event.preventDefault();
        }
      };

      window.addEventListener("unhandledrejection", handleUnhandledRejection);

      // Override HTMLElement.prototype.focus to prevent browser-native focus-scrolling of the host page
      const originalFocus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function(options) {
        const newOptions = options ? { ...options, preventScroll: true } : { preventScroll: true };
        originalFocus.call(this, newOptions);
      };

      return () => {
        console.error = originalConsoleError;
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        HTMLElement.prototype.focus = originalFocus;
      };
    }
  }, [isSimulation]);

  // Autoplay and virtual pointer coordination for simulation mode
  useEffect(() => {
    if (!isSimulation || !isPlaying) return;

    let subTimers: NodeJS.Timeout[] = [];

    const runStepAnimation = () => {
      // Clear any previous timers
      subTimers.forEach(clearTimeout);
      subTimers = [];

      const simulateTyping = (
        field: keyof typeof formData | 'workMonths' | 'avgSalary' | 'hometaxId' | 'hometaxPw' | 'hometaxPwConfirm' | 'hometaxEmail' | 'smsCode' | 'verificationCode',
        text: string,
        startDelay: number,
        charInterval = 100
      ) => {
        const chars = Array.from(text);
        let currentText = "";
        chars.forEach((char, index) => {
          subTimers.push(setTimeout(() => {
            currentText += char;
            if (field === 'workMonths' || field === 'avgSalary') {
              setPreFilterData(prev => ({ ...prev, [field]: Number(currentText) }));
            } else if (field === 'hometaxId') {
              setHometaxId(currentText);
            } else if (field === 'hometaxPw') {
              setHometaxPw(currentText);
            } else if (field === 'hometaxPwConfirm') {
              setHometaxPwConfirm(currentText);
            } else if (field === 'hometaxEmail') {
              setHometaxEmail(currentText);
            } else if (field === 'smsCode') {
              setSmsCode(currentText);
            } else if (field === 'verificationCode') {
              setVerificationCode(currentText);
            } else {
              setFormData(prev => ({ ...prev, [field]: currentText }));
            }
          }, startDelay + index * charInterval));
        });
      };

      if (step === 0) {
        // Step 0: months selection & salary input simulation
        // Ensure we start scrolled to the absolute top of the iframe window
        scrollToTop()
        // The user wants Step 0 to start at the top of the viewport with a grand animation:
        // virtual cursor moves to Sparkles icon/Title first, clicks it, then smooth-scrolls to the slider/salary input.
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-sparkles");
        }, 1000));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-sparkles", true);
          // Highlight it/simulate click
          const sparkles = document.querySelector("#step0-sparkles");
          if (sparkles) {
            sparkles.classList.add("scale-125", "rotate-12");
            setTimeout(() => sparkles.classList.remove("scale-125", "rotate-12"), 500);
          }
        }, 2200));
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step0-months-slider");
        }, 3200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-months-slider");
        }, 4600)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-months-slider", true);
          // Set simulated value for months
          setPreFilterData(prev => ({ ...prev, workMonths: 12 }));
        }, 5600));
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step0-salary-container");
        }, 6800));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-salary-2"); // Click middle button (e.g. index 2 is 250)
        }, 8200)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-salary-2", true);
          setPreFilterData(prev => ({ ...prev, avgSalary: 250 }));
        }, 9200));
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step0-submit-btn");
        }, 10200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-submit-btn");
        }, 11600)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step0-submit-btn", true);
          const btn = document.querySelector("#step0-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 12600));

      } else if (step === 0.5) {
        // Step 0.5: Process Flow Guide
        scrollToTop()
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step05-submit-btn");
        }, 1500));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step05-submit-btn");
        }, 2900)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step05-submit-btn", true);
          const btn = document.querySelector("#step05-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 3900));

      } else if (step === 1) {
        // Step 1: Pre-requisites Checklist
        scrollToTop()
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step1-submit-btn");
        }, 1500));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step1-submit-btn");
        }, 2900)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step1-submit-btn", true);
          const btn = document.querySelector("#step1-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 3900));

      } else if (step === 2) {
        // Step 2: Alien Registration Card Scan / manual input fallback
        const persona = PERSONAS[selectedPersona] || PERSONAS['ko'];
        scrollToTop()
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step2-name-input");
        }, 1500));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step2-name-input");
        }, 2900)); // 1400ms delay after scroll start
        
        // Typing name starts at 3500ms. Since names are e.g. 10 chars, it takes ~1000ms.
        simulateTyping('officialName', persona.name, 3500, 100);

        subTimers.push(setTimeout(() => {
          scrollToSelector("#step2-reg-input");
        }, 5100)); // 600ms after name typing finished
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step2-reg-input");
        }, 6500)); // 1400ms delay after scroll start
        
        // Typing registration number starts at 7100ms. Since it has 14 chars, it takes ~1400ms.
        simulateTyping('registrationNumber', "950101-5123456", 7100, 100);

        subTimers.push(setTimeout(() => {
          scrollToSelector("#step2-submit-btn");
        }, 9100)); // 600ms after reg number typing finished
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step2-submit-btn");
        }, 10500)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step2-submit-btn", true);
          const btn = document.querySelector("#step2-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 11500));

      } else if (step === 3) {
        // Step 3: Identity & Telecom input
        const persona = PERSONAS[selectedPersona] || PERSONAS['ko'];
        scrollToTop()
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step3-phone-input");
        }, 1500));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-phone-input");
        }, 2900)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          setFormData(prev => ({ ...prev, phone: persona.phone }));
        }, 3500));
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step3-carrier-select");
        }, 4100));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-carrier-select");
        }, 5500)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-carrier-select", true);
          const trigger = document.querySelector("#step3-carrier-select") as HTMLButtonElement;
          if (trigger) trigger.click();
        }, 6300));
        subTimers.push(setTimeout(() => {
          // Point to carrier option inside the Radix select dropdown
          const carrierSelector = `[role="option"][data-value="${persona.carrier}"]`;
          sendPointerToElement(carrierSelector);
        }, 7100));
        subTimers.push(setTimeout(() => {
          const carrierSelector = `[role="option"][data-value="${persona.carrier}"]`;
          sendPointerToElement(carrierSelector, true);
          const option = document.querySelector(carrierSelector) as HTMLDivElement;
          if (option) {
            option.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
            option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            option.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
            option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            option.click();
          }
          setFormData(prev => ({ ...prev, carrier: persona.carrier }));
        }, 7900));
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step3-suggestion-0");
        }, 8700));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-suggestion-0");
        }, 10100)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-suggestion-0", true);
          setFormData(prev => ({ ...prev, authName: persona.name }));
        }, 10900));
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step3-submit-btn");
        }, 11700));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-submit-btn");
        }, 13100)); // 1400ms delay after scroll start
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step3-submit-btn", true);
          const btn = document.querySelector("#step3-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 14900));

      } else if (step === 4) {
        // Step 4: Certificate flow guide & Hometax signup/query simulation
        scrollToTop();

        if (hasCertificate === null) {
          // 1. Scroll to No Certificate card
          subTimers.push(setTimeout(() => {
            scrollToSelector("#step4-cert-no");
          }, 800));
          subTimers.push(setTimeout(() => {
            sendPointerToElement("#step4-cert-no");
          }, 2000));
          subTimers.push(setTimeout(() => {
            sendPointerToElement("#step4-cert-no", true);
            const noBtn = document.querySelector("#step4-cert-no") as HTMLElement;
            if (noBtn) noBtn.click();
          }, 2800));

        } else if (hasCertificate === false) {
          // 2. We are in the guide view. Show tabs switching (Hana -> PASS -> Kakao)
          // Hana is active by default. Let's switch to PASS after 2s.
          subTimers.push(setTimeout(() => {
            setAuthMethod('app'); // Switch to PASS
          }, 2000));
          // Switch to Kakao after 4s
          subTimers.push(setTimeout(() => {
            setAuthMethod('kakao'); // Switch to Kakao
          }, 4000));
          // Scroll down to the Done button
          subTimers.push(setTimeout(() => {
            scrollToSelector("#step4-cert-complete-btn");
          }, 5500));
          // Move pointer to the Done button
          subTimers.push(setTimeout(() => {
            sendPointerToElement("#step4-cert-complete-btn");
          }, 6800));
          // Click it to transition to hasCertificate = true
          subTimers.push(setTimeout(() => {
            sendPointerToElement("#step4-cert-complete-btn", true);
            setHasCertificate(true);
          }, 7600));

        } else if (hasCertificate === true) {
          // 3. Scroll down to the submit button on the certification selection screen
          subTimers.push(setTimeout(() => {
            scrollToSelector("#step4-submit-btn");
          }, 800));
          // Move virtual pointer to the button
          subTimers.push(setTimeout(() => {
            sendPointerToElement("#step4-submit-btn");
          }, 2000));
          // Click the button
          subTimers.push(setTimeout(() => {
            sendPointerToElement("#step4-submit-btn", true);
            const submitBtn = document.querySelector("#step4-submit-btn") as HTMLButtonElement;
            if (submitBtn) submitBtn.click();
          }, 2800));
        }

      } else if (step === 5) {
        // Step 5: Verification confirm wait state
        // 1. Scroll to top of Step 5 first to show verification request status
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step5-top-anchor");
        }, 200));
        
        // 2. Scroll down to the guide section
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step5-auth-guide-container");
        }, 1500));
        
        // 3. Scroll down to the submit button at the bottom
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step5-submit-btn");
        }, 3200));
        
        // 4. Move virtual cursor to the button
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step5-submit-btn");
        }, 4400));

        // 5. Click the button to trigger handleFinalVerifyAndAnalyze
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step5-submit-btn", true);
          const btn = document.querySelector("#step5-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 5200));

      } else if (step === 6) {
        // Step 6: Processing / loading screen
        sendPointerUpdate("50%", "50%", false, 0);
        
        // Scroll to top first
        scrollToTop()
        
        // Wait 1.5 seconds to show NTS Database animation at the top, then scroll down to checklist
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step6-loading-checklist");
        }, 1500));

      } else if (step === 7) {
        // Step 7: Expected Refund Report
        // 1. Scroll to top of report first to show results
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step7-top-anchor");
        }, 200));
        
        // 2. Scroll down to the refund amount counting up section
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step7-refund-counter");
        }, 1500));
        
        // 3. Scroll down to the submit button at the bottom
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step7-submit-btn");
        }, 3200));
        
        // 4. Move virtual cursor to the button
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step7-submit-btn");
        }, 4400));

        // 5. Click the button with fallback to direct setStep
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step7-submit-btn", true);
          const btn = document.querySelector("#step7-submit-btn") as HTMLButtonElement;
          if (btn) {
            btn.click();
          } else {
            setStep(8);
          }
        }, 5200));

      } else if (step === 8) {
        // Step 8: Hometax signup (2nd verification SMS)
        // 1. Scroll to request SMS button
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step8-signup-request-btn");
        }, 1000));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step8-signup-request-btn");
        }, 2200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step8-signup-request-btn", true);
          const btn = document.querySelector("#step8-signup-request-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 3200));

        // 2. Scroll to SMS input
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step8-sms-code-input");
        }, 4500));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step8-sms-code-input");
        }, 5700));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step8-sms-code-input", true);
        }, 6500));

        // Simulate typing SMS code (123456)
        simulateTyping('smsCode', '123456', 7000, 100);

        // 3. Scroll to complete button and click
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step8-signup-complete-btn");
        }, 9000));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step8-signup-complete-btn");
        }, 10200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step8-signup-complete-btn", true);
          const btn = document.querySelector("#step8-signup-complete-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 11200));

      } else if (step === 9) {
        // Step 9: Bank account entry & 1-won verification
        const persona = PERSONAS[selectedPersona] || PERSONAS['ko'];
        
        // 1. Scroll to bank dropdown
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step9-bank-select");
        }, 1000));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-bank-select");
        }, 2600));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-bank-select", true);
          setBankSelectOpen(true);
        }, 3600));
        
        // 2. Select Bank from dropdown
        subTimers.push(setTimeout(() => {
          setFormData(prev => ({ ...prev, bankName: persona.bank }));
          setBankSelectOpen(false);
        }, 4800));
        
        // 3. Scroll to account input
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step9-account-input");
        }, 5600));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-account-input");
        }, 7200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-account-input", true);
        }, 8000));
        
        // Simulate typing account number
        simulateTyping('accountNumber', persona.account, 8400, 100);
        
        // 4. Scroll to depositor name input
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step9-holder-input");
        }, 10600));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-holder-input");
        }, 12200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-holder-input", true);
        }, 13000));
        
        // Simulate typing account holder name
        simulateTyping('accountHolder', persona.name, 13400, 100);
        
        // 5. Scroll to next button and click
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step9-next-btn");
        }, 15200));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-next-btn");
        }, 16800));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step9-next-btn", true);
          const btn = document.querySelector("#step9-next-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 17800));

      } else if (step === 10) {
        // Step 10: Final consent - mobile signature
        // 1. Scroll to signature verification box
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step10-signature-canvas");
        }, 1000));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step10-signature-canvas");
        }, 2500));

        // Simulate drawing on canvas
        subTimers.push(setTimeout(() => {
          const canvas = signatureCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.lineWidth = 4;
              ctx.lineCap = 'round';
              ctx.strokeStyle = '#0f172a';
              ctx.beginPath();
              ctx.moveTo(50, 100);
              let x = 50;
              let y = 100;
              const drawInterval = setInterval(() => {
                x += 8;
                y = 100 + Math.sin(x * 0.04) * 25 + (x - 50) * 0.05;
                ctx.lineTo(x, y);
                ctx.stroke();
                if (x >= 450) {
                  clearInterval(drawInterval);
                  setIsSigned(true);
                }
              }, 15);
            }
          }
        }, 3000));

        // 2. Scroll to submit button
        subTimers.push(setTimeout(() => {
          scrollToSelector("#step10-submit-btn");
        }, 5000));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step10-submit-btn");
        }, 6500));
        subTimers.push(setTimeout(() => {
          sendPointerToElement("#step10-submit-btn", true);
          const btn = document.querySelector("#step10-submit-btn") as HTMLButtonElement;
          if (btn) btn.click();
        }, 7500));
      }
    };

    runStepAnimation();

    return () => {
      subTimers.forEach(clearTimeout);
    };
  }, [step, isPlaying, isSimulation, hasCertificate, selectedPersona]);

  // Simulated mobile password keypad typing animation
  useEffect(() => {
    if (!showMockPasswordPad || !isSimulation) return;

    const keypadTimers: any[] = [];
    const keysToPress = ["1", "2", "3", "4", "5", "6"];

    keysToPress.forEach((key, index) => {
      // 1. Move pointer to the key and show pointer
      keypadTimers.push(setTimeout(() => {
        const selector = `#mock-keypad-${key}`;
        scrollToSelector(selector);
        sendPointerToElement(selector);
      }, 800 + index * 600));

      // 2. Click the key (pointerdown/click effect)
      keypadTimers.push(setTimeout(() => {
        const selector = `#mock-keypad-${key}`;
        sendPointerToElement(selector, true);
        const button = document.querySelector(selector) as HTMLButtonElement;
        if (button) button.click();
      }, 1100 + index * 600));
    });

    return () => {
      keypadTimers.forEach(clearTimeout);
    };
  }, [showMockPasswordPad, isSimulation]);

  // Transition to step 5 when the simulated password entry is complete
  useEffect(() => {
    if (pinCode.length === 6) {
      const timer = setTimeout(() => {
        setShowMockPasswordPad(false);
        setStep(5);
        setAuthSession({ id: "sim-session-id", twoWayInfo: {} });
        toast({ title: t("인증 요청 성공"), description: t("인증 요청이 성공적으로 전송되었습니다.") });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pinCode]);

  // Enable/disable pointer events in simulator host based on interactive state
  useEffect(() => {
    if (!isSimulation || typeof window === 'undefined' || !window.parent) return;
    window.parent.postMessage({ type: 'SET_POINTER_EVENTS', enabled: false }, '*');
  }, [step, isSimulation]);

  const sendPointerUpdate = (left: string, top: string, click = false, opacity = 1) => {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'UPDATE_POINTER', left, top, click, opacity }, '*');
    }
  };

  const sendPointerToElement = (selector: string, click = false, opacity = 1) => {
    if (typeof window === 'undefined') return;
    const el = document.querySelector(selector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = `${((rect.left + rect.width / 2) / window.innerWidth) * 100}%`;
    const top = `${((rect.top + rect.height / 2) / window.innerHeight) * 100}%`;
    sendPointerUpdate(left, top, click, opacity);
  };

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    const container = document.getElementById("estimate-scroll-container");
    if (isSimulation && container) {
      container.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const scrollToSelector = (selector: string, block: ScrollIntoViewOptions['block'] = 'center') => {
    if (typeof window === 'undefined') return;
    if (isSimulation) {
      sendPointerUpdate("50%", "50%", false, 0);
    }
    const el = document.querySelector(selector);
    if (!el) return;
    
    const container = document.getElementById("estimate-scroll-container");
    const isSimScroll = isSimulation && container;
    
    const rect = el.getBoundingClientRect();
    const startY = isSimScroll ? container.scrollTop : window.scrollY;
    
    // Calculate top relative to the scroll container
    let elementTop = rect.top + startY;
    if (isSimScroll) {
      const containerRect = container.getBoundingClientRect();
      elementTop = rect.top - containerRect.top + startY;
    }
    
    let targetY = elementTop;
    const viewportHeight = isSimScroll ? container.clientHeight : window.innerHeight;
    
    if (block === 'center') {
      targetY = elementTop - viewportHeight / 2 + rect.height / 2;
    } else if (block === 'end') {
      targetY = elementTop - viewportHeight + rect.height;
    }
    
    const scrollHeight = isSimScroll ? container.scrollHeight : document.documentElement.scrollHeight;
    const maxScroll = scrollHeight - viewportHeight;
    targetY = Math.max(0, Math.min(targetY, maxScroll));
    
    const distance = targetY - startY;
    const duration = 1200; // 1.2 seconds for a premium, slower slide down
    let startTime: number | null = null;
    
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    
    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      
      const nextY = startY + distance * easedProgress;
      if (isSimScroll) {
        container.scrollTo(0, nextY);
      } else {
        window.scrollTo(0, nextY);
      }
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  };

  // Sync step change to parent
  useEffect(() => {
    if (isSimulation && typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'STEP_CHANGED', step }, '*');
    }
    if (step < 8) {
      setPaymentTab('card');
    }
  }, [step, isSimulation]);

  // Auto-prefill account holder name with verified identity name for step 8
  useEffect(() => {
    if (step === 8) {
      const verifiedName = formData.authName || formData.officialName;
      if (verifiedName) {
        setFormData(prev => ({ ...prev, accountHolder: verifiedName }));
      }
    }
  }, [step, formData.authName, formData.officialName]);

  // Listen to parent commands
  useEffect(() => {
    if (!isSimulation) return;
    const handleParentMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'SET_PLAYING') {
        setIsPlaying(data.isPlaying);
      } else if (data.type === 'JUMP_STEP') {
        setStep(data.step);
        if (data.step <= 4) {
          setHasCertificate(null);
          setAuthMethod('hana');
          setShowMockPasswordPad(false);
          setPinCode("");
          setIsHanaGuideOpen(false);
          setIsGuideOpen(false);
          setIsKakaoGuideOpen(false);
          setIsKakaoAuthGuideOpen(false);
          setIsAuthGuideOpen(false);
          
          // Reset Hometax signup states
          setAuthTab('signup');
          setHometaxId("");
          setHometaxPw("");
          setHometaxPwConfirm("");
          setHometaxEmail("");
          setSmsCode("");
          setIsIdDuplicateChecked(false);
          setIsSmsRequested(false);
        }
        if (data.step <= 7) {
          setPaymentTab('card');
          setFormData(prev => ({ ...prev, depositorName: "", bankName: "", accountNumber: "", accountHolder: "" }));
        }
      }
    };
    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [isSimulation]);

  const progressValue = (step / 10) * 100; // VIP 채팅 실시간 감시 및 동기화
  useEffect(() => {
    if (!draftAppId) return;

    // 유저가 읽지 않은 관리자 메시지 카운트 모니터링
    const unsubApp = onSnapshot(doc(db, 'applications', draftAppId), (doc) => {
      if (doc.exists()) {
        setUnreadCount(doc.data().unreadChatCountUser || 0);
      }
    });

    const q = query(
      collection(db, 'applications', draftAppId, 'chat_messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(msgs);
    });

    return () => {
      unsubApp();
      unsubChat();
    };
  }, [draftAppId]);

  // Session Persistence: Auto-save
  useEffect(() => {
    if (isSimulation) return; // Do not auto-save in simulation mode
    // Only save if we have at least started OCR or entered some info
    if (step > 0 || formData.officialName || formData.phone) {
      // Self-Healing: Do not overwrite localStorage with a null result if a valid result exists locally
      const savedPersistence = localStorage.getItem("easy_tax_refund_persistence");
      let activeResult = result;
      if (!activeResult && savedPersistence) {
        try {
          const parsed = JSON.parse(savedPersistence);
          // If the cached step and draft match the current ones, and we have a valid result cached, restore it.
          if (parsed.result && parsed.step === step && parsed.draftAppId === draftAppId) {
            activeResult = parsed.result;
            setResult(parsed.result);
          }
        } catch (e) {
          console.error("Failed to parse saved persistence:", e);
        }
      }

      const dataToSave = {
        step,
        formData,
        draftAppId,
        result: activeResult,
        lastSaved: Date.now()
      };
      localStorage.setItem("easy_tax_refund_persistence", JSON.stringify(dataToSave));

      // Also update remote DB for funnel tracking whenever step changes
      if (step > 0) {
        saveProgress(step, false, activeResult);
      }
    }
  }, [step, result, draftAppId]); // Trigger on step, result, or draftAppId change to keep them in sync

  // Session Persistence: Load on mount
  useEffect(() => {
    // Check URL parameters directly to avoid React state initialization lag
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('simulation') === 'true') return;
    }
    if (isSimulation) return;
    const saved = localStorage.getItem("easy_tax_refund_persistence");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Offer resume only if it was saved within the last 24 hours and has meaningful progress
        if (Date.now() - parsed.lastSaved < 24 * 60 * 60 * 1000 && (parsed.step > 0 || parsed.formData.officialName)) {
          setResumeData(parsed);
          setShowResumeDialog(true);
        }
      } catch (err) {
        console.error("Failed to parse resume data:", err);
      }
    }
  }, [isSimulation]);

  const handleResume = () => {
    if (resumeData) {
      setStep(resumeData.step);
      setFormData(resumeData.formData);
      if (resumeData.result) {
        setResult(resumeData.result);
      }
      if (resumeData.draftAppId) {
        setDraftAppId(resumeData.draftAppId);
        localStorage.setItem('currentDraftId', resumeData.draftAppId);
      }
    }
    setShowResumeDialog(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem("easy_tax_refund_persistence");
    setShowResumeDialog(false);
  };

  // 채팅 창 열 때 카운트 초기화
  useEffect(() => {
    if (isVipChatOpen && draftAppId && unreadCount > 0) {
      updateDoc(doc(db, 'applications', draftAppId), { unreadChatCountUser: 0 });
    }
    if (isVipChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isVipChatOpen, draftAppId, unreadCount]);

  // Auto-prefill account holder name with verified identity name for step 8
  useEffect(() => {
    if (step === 8) {
      const verifiedName = formData.authName || formData.officialName || "";
      if (verifiedName && formData.accountHolder !== verifiedName) {
        setFormData(prev => ({ ...prev, accountHolder: verifiedName }));
      }
    }
  }, [step, formData.authName, formData.officialName]);

  const handleSendVipMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    setIsChatLoading(true);
    let targetDraftId = draftAppId;

    try {
      // 사용자가 1단계 전에 채팅을 먼저 보내는 경우 빈 신청서라도 만들어서 세션을 연결
      if (!targetDraftId) {
        const newDoc = await addDoc(collection(db, 'applications'), {
          status: 'InquiryCompleted',
          lastStep: step,
          preFilterEstimate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isDraft: true,
          fullName: formData.officialName || '문의고객(익명)',
          userLanguage: language || 'ko'
        });
        targetDraftId = newDoc.id;
        setDraftAppId(targetDraftId);
        localStorage.setItem('currentDraftId', targetDraftId);
      }

      const text = chatInput.trim();
      setChatInput("");

      let translatedText = null;
      if (language && language !== 'ko') {
        try {
          const res = await translateChatMessage({
            message: text,
            sourceLanguage: language,
            targetLanguage: 'ko'
          });
          translatedText = res.translatedMessage;
        } catch (err) {
          console.error("Chat translation failed:", err);
        }
      }

      await addDoc(collection(db, 'applications', targetDraftId, 'chat_messages'), {
        text,
        sender: 'User',
        translatedText,
        timestamp: serverTimestamp()
      });

      // 관리자에게 알림
      await updateDoc(doc(db, 'applications', targetDraftId), {
        unreadChatCountAdmin: increment(1),
        lastMessageAt: serverTimestamp(),
        lastMessageText: text
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Recompile trigger for translations: 2026-05-29T21:28
  const FAQ_REPLIES = [
    {
      title: "환급은 어떻게 받나요?",
      content: "안녕하세요! 숨은 세금 환급금을 찾아 통장으로 받기까지의 전체 핵심 4단계 과정을 안내해 드릴게요. 🚀\n\n1️⃣ [정부 필수] 신분증 확인 및 번호 입력 (Step 1~3)\n대한민국 국세청(NTS)에서 세금 환급 승인을 위해 법적으로 요구하는 필수 절차입니다. 제출하신 신분증 사진은 본인 확인 즉시 시스템에서 영구 파기(저장 NO!)되며, 금융권 수준의 강력한 암호화 보안 기술로 안전하게 보호되니 안심하고 촬영해 주세요.\n\n2️⃣ [가장 중요] 홈택스 1분 가입 또는 로그인 (Step 4~5)\n한국 국세청(NTS) 전산망과 안전하게 연결하기 위해 홈택스 아이디/비밀번호로 로그인을 완료합니다. (아이디가 없으시면 1분 만에 바로 가입하실 수 있습니다.)\n\n3️⃣ 정확한 환급금 확인 및 후불제 계좌 등록 (Step 6~8)\n최근 5년 동안 한국에서 일하며 더 낸 세금이 얼마인지 즉시 확인합니다. 지금 신청하시는 단계에서는 단 1원도 결제하실 필요가 없습니다 (신청 수수료 0원). 환급금을 안전하게 돌려받으실 본인 명의의 은행 계좌를 등록합니다.\n\n4️⃣ 계약서 서명 및 입금 신청 (Step 9)\n결제 완료 후, 모바일 서명을 통해 정식 세무대리 수임계약서가 투명하고 안전하게 작성되며 환급금을 입금받으실 본인 통장 계좌번호를 입력합니다. 이후 약 1~2개월 뒤 한국 국세청에서 고객님의 통장으로 환급금을 직접 송금해 드립니다.\n\n💬 지금 해야 할 일!\n대화창을 닫고, 화면에 보이는 [로그인] 또는 [회원가입]을 진행해 보세요. 막히는 부분이 있다면 언제든 다시 질문해 주세요!"
    },
    {
      title: "홈택스 계정이 꼭 필요한가요?",
      content: "네, 선택이 아닌 필수입니다! 🚨\n\n한국 국세청(NTS)은 개인의 민감한 세금 및 금융 정보를 다루기 때문에, 보안이 가장 강력한 국세청 홈택스 계정 정보가 없으면 그 누구도 고객님의 세금 기록을 열람할 수 없습니다.\n\n홈택스 계정은 국세청 금고를 열어 고객님의 숨은 돈을 확인하는 유일한 '디지털 열쇠'입니다. 🔑\n계정이 없으면 전문 세무사조차도 고객님의 환급금이 얼마인지 확인하거나 환급을 신청할 방법이 전혀 없습니다. \n\n조금 번거로우시더라도, 소중한 내 돈을 안전하게 돌려받기 위한 필수 정부 보안 절차이니 꼭 안내에 따라 1분 회원가입을 완료하거나 로그인을 진행해 주시길 부탁드립니다!"
    },
    {
      title: "이지택스, 믿을 수 있나요?",
      content: "네, 안심하고 이용하셔도 좋습니다! 이지택스를 믿을 수 있는 3가지 확실한 이유를 말씀드릴게요. 🛡️\n\n1️⃣ 100% 한국 국세청(NTS)에서 직접 입금해 드립니다.\n가장 많이 걱정하시는 부분이죠! 저희는 고객님의 환급금에 절대 손대지 않습니다. 신고가 완료되면 환급금은 저희를 거치지 않고, 한국 국세청에서 고객님 본인 명의의 계좌로 직접 송금합니다.\n\n2️⃣ 국가 공인 전문 세무사가 전담합니다.\n모든 환급 절차는 엄격한 자격을 갖춘 대한민국 국가 공인 전문 세무사가 합법적이고 꼼꼼하게 처리합니다.\n\n3️⃣ 철저한 개인정보 보호\n본인 인증과 개인정보는 오직 정부(국세청) 시스템에 세금 환급을 신고하기 위한 목적으로만 사용되며, 철저한 보안 속에 안전하게 보호됩니다.\n\n매년 수많은 외국인 근로자분들이 잘 몰라서 놓치고 있는 '정당하게 돌려받아야 할 내 돈'을 안전하게 찾아드리고 있습니다. 안심하고 화면의 안내에 따라 조회를 시작해 보세요! 👍"
    },
    {
      title: "수수료는 왜 내야 하나요?",
      content: "수수료 25%는 고객님의 세금을 꼼꼼하게 다시 계산해서 국세청에 대신 신고해 주는 '전문 세무사'의 정당한 수임료(인건비)입니다. 👨‍💼💼\n\n세금 환급은 단순히 버튼만 누른다고 돈이 나오는 것이 아니라, 과거 5년 치의 복잡한 세금 기록을 세무사가 직접 분석하고 국세청에 신고 서류를 제출해야 하는 까다로운 법적 절차입니다.\n\n💎 신청 시 결제 금액 0원! 100% 후불 결제 원칙\n저희 이지택스는 \"선결제 0원 / 후불제 수수료\" 정책을 적용하고 있습니다. 신청 단계에서는 비용이 전혀 청구되지 않으며, 한국 국세청에서 고객님의 통장으로 환급금이 실제로 입금된 것이 확인된 후에만 수수료(25%) 결제가 진행됩니다.\n\n⚠️ 환급 실패 시 수수료 0원 (100% 안심 보장)\n세무사의 최종 검토 결과 환급이 불가능하거나 국세청에서 환급금이 나오지 않는 경우에는 수수료를 단 1원도 청구하지 않습니다. 고객님께는 어떠한 금전적 위험도 없으니 안심하고 신청하셔도 됩니다!"
    },
    {
      title: "언제 입금되나요?",
      content: "환급 신청을 완료하신 후, 실제 통장으로 돈이 입금되기까지는 보통 45일에서 최대 60일 정도 소요됩니다. ⏳\n\n시간이 꽤 걸리는 이유는, 한국 국세청(NTS)의 공무원들이 고객님의 지난 5년 치 세금 기록을 하나하나 꼼꼼히 확인하고 승인하는 심사 기간이 필요하기 때문입니다. (관할 세무서의 업무량에 따라 조금 더 빠르거나 늦어질 수 있습니다.)\n\n환급 진행 상황은 언제든지 이지택스의 [나의 환급 진행사항] 메뉴에서 실시간으로 확인하실 수 있으니 안심하고 기다려 주세요!"
    },
    {
      title: "신분증 사진, 안전한가요?",
      content: "네, 100% 안전합니다! 신분증 사진이 혹시라도 나쁜 곳에 쓰일까 걱정하시는 마음, 충분히 이해합니다. 이지택스의 철저한 보안 원칙 3가지를 약속드립니다. 🔒\n\n1️⃣ 전송 즉시 영구 삭제 (저장 NO!)\n촬영하신 신분증 사진은 저희 서버나 휴대폰에 절대 '저장'되지 않습니다. 오직 세무서에 본인 확인용으로 제출되는 즉시 영구적으로 파기됩니다.\n\n2️⃣ 국세청(정부) 필수 제출 서류\n한국 국세청(NTS)에서 세금 환급을 승인하려면, '이 사람이 진짜 본인이 맞는지' 확인하기 위해 반드시 신분증 사본을 요구합니다. 저희는 이 필수 서류를 국세청에 대신 내드리는 역할만 할 뿐, 대출이나 휴대폰 개통 등 다른 어떤 목적으로도 절대 사용할 수 없습니다.\n\n3️⃣ 은행급 암호화 보안\n고객님의 모든 정보는 한국의 대형 은행들과 동일한 수준의 강력한 암호화 시스템을 통해 국세청으로만 바로 전송됩니다. \n\n내 소중한 개인정보가 유출될 일은 절대 없으니, 안심하고 안내에 따라 신분증을 촬영해 주세요!"
    },
    {
      title: "환급액이 0원이라고 나오는데 왜 그런가요?",
      content: "조회 결과 환급액이 0원으로 나오셨나요? 이는 정상적인 결과일 수 있습니다. 📊\n\n세금 환급은 '내가 낸 세금' 중에서 '돌려받을 자격이 있는 세금'을 돌려받는 것입니다. 만약 과거에 다니던 회사에서 연말정산을 완벽하게 잘 처리해주었거나, 납부한 세금 자체가 적었다면 돌려받을 추가 금액(숨은 세금)이 없을 수 있습니다. \n\n이번에는 환급액이 0원이더라도, 내년이나 이직 후에 다시 조회해 보시면 환급금이 발생할 수 있으니 내년에 이지택스를 다시 꼭 찾아주세요!"
    },
    {
      title: "다른 사람 명의 은행 계좌로 받을 수 있나요?",
      content: "아니요, 절대 불가능합니다! 🚫\n\n금융 사기 및 명의 도용을 방지하기 위해 한국 국세청(NTS)은 '환급을 신청한 본인 이름'과 정확히 일치하는 은행 계좌로만 돈을 입금합니다. \n\n따라서 반드시 환급자 본인 명의로 된 한국 은행 계좌를 입력해 주셔야 하며, 다른 일체의 계좌 번호를 입력하시면 국세청에서 환급금 송금을 거절하게 됩니다."
    },
    {
      title: "이미 한국을 떠났는데 환급받을 수 있나요?",
      content: "네, 조건만 맞으면 가능합니다! ✈️\n\n비록 현재 한국에 없더라도, 아래 두 가지 조건만 충족하신다면 이지택스를 통해 환급 신청이 가능합니다.\n\n1. 본인 인증 통과: 현재 가입되어 있는 한국 통신사(알뜰폰 포함) 번호를 통해 본인 인증(PASS 문자 등)을 받을 수 있어야 합니다.\n2. 한국 은행 계좌 유지: 환급금을 입금받을 수 있는 본인 명의의 '한국 은행 계좌'가 아직 정지되지 않고 열려 있어야 합니다.\n\n위 두 가지가 가능하시다면 타국에서도 문제없이 앱을 통해 환급을 신청하실 수 있습니다!"
    }
  ];

  const handleQuickReply = (index: number) => {
    setExpandedFaqIndex(prev => prev === index ? null : index);
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 150);
  };

  const handleConnectAdmin = async () => {
    setIsChatInputVisible(true);
    let targetDraftId = draftAppId;
    try {
      if (!targetDraftId) {
        const newDoc = await addDoc(collection(db, 'applications'), {
          status: 'InquiryCompleted',
          lastStep: step,
          preFilterEstimate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isDraft: true,
          fullName: formData.officialName || '문의고객(익명)',
          userLanguage: language || 'ko'
        });
        targetDraftId = newDoc.id;
        setDraftAppId(targetDraftId);
        localStorage.setItem('currentDraftId', targetDraftId);
      }

      await addDoc(collection(db, 'applications', targetDraftId, 'chat_messages'), {
        text: "상담원과 직접 채팅하기",
        sender: 'User',
        isAutoReply: true,
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'applications', targetDraftId, 'chat_messages'), {
        text: "전문 상담원으로 연결합니다. 무엇을 도와드릴까요?",
        sender: 'System',
        isAutoReply: true,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 35, today.getMonth(), today.getDate() + 1);
    const endDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());

    const formatDate = (date: Date) => {
      return t("{year}년 {month}월 {day}일", {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    };

    setEligibilityRange({ start: formatDate(startDate), end: formatDate(endDate) });
  }, [t]);

  // 로딩 단계 타이머 (Step 6 분석 진행 연출)
  useEffect(() => {
    if (step !== 6) {
      setLoadProgress(0);
      return;
    }
    
    const t1 = setTimeout(() => setLoadProgress(1), 1200);
    const t2 = setTimeout(() => setLoadProgress(2), 2500);
    const t3 = setTimeout(() => setLoadProgress(3), 3800);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  // Proactive VIP Chat Timer for Step 1
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 1 && !isVipChatOpen) {
      timer = setTimeout(() => {
        setShowProactiveHelp(true);
      }, 8000);
    } else {
      setShowProactiveHelp(false);
    }
    return () => clearTimeout(timer);
  }, [step, isVipChatOpen, formData.officialName, formData.registrationNumber]);

  // Step 0 Estimate Calculation
  useEffect(() => {
    // 90% exemption rough calculation: Monthly Salary * 12 * 3.3% * 90%
    // Cap strictly at 2,000,000 KRW per year
    const yearlyGross = preFilterData.avgSalary * 10000 * 12;
    const yearlyPotential = yearlyGross * 0.033 * 0.9;
    const cappedYearly = Math.min(yearlyPotential, 2000000);

    // Total based on work months (up to 5 years / 60 months)
    const totalEstimate = (cappedYearly / 12) * preFilterData.workMonths;

    setPreFilterEstimate(Math.floor(totalEstimate / 1000) * 1000); // Round to thousands
  }, [preFilterData]);

  // 드래프트 재연결 (브라우저 종료 후 앱을 다시 켰을 때 메시지 내역 복구)
  useEffect(() => {
    if (isSimulation) return;

    const checkDraftAndSet = async (savedDraftId: string) => {
      try {
        const docRef = doc(db, 'applications', savedDraftId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDraftAppId(savedDraftId);
          const data = docSnap.data();
          if (data) {
            // Restore formData
            setFormData(prev => ({
              ...prev,
              officialName: data.fullName || prev.officialName,
              authName: data.fullName || prev.authName,
              registrationNumber: data.registrationNumber || prev.registrationNumber,
              phone: data.phone || prev.phone,
              bankName: data.bankName || prev.bankName,
              accountNumber: data.accountNumber || prev.accountNumber,
              accountHolder: data.accountHolder || prev.accountHolder,
            }));
            
            // Restore step
            if (data.lastStep !== undefined) {
              setStep(data.lastStep);
            }
            
            // Restore result
            if (data.estimatedRefundAmount !== undefined) {
              const caseType = data.caseType || 'D';
              const message = caseType === 'A' ? "축하합니다! {amount}을 찾았습니다." :
                              caseType === 'B' ? "이미 감면 혜택를 받고 계시네요!" :
                              caseType === 'C' ? "납부하신 세금이 없어 환급액이 0원입니다." : "조회된 데이터가 없습니다.";
              
              const restoredResult = {
                success: true,
                refundEstimate: data.estimatedRefundAmount,
                resIncomeTax: data.resIncomeTax || 0,
                resCompanyIdentityNo1: data.resCompanyIdentityNo1 || 'N/A',
                resAttrYear: data.resAttrYear || 'N/A',
                resIncomeSpecList: data.resIncomeSpecList || '',
                caseType: caseType,
                message: message,
                details: data.details || []
              };

              console.log("[Frontend] Restored result from Firestore draft:", JSON.stringify(restoredResult));
              setResult(restoredResult);
            }
          }
        } else {
          // Document was deleted from Firestore! Clear it from storage.
          console.log("Draft application document not found in database. Cleaning up stale local IDs.");
          localStorage.removeItem('currentDraftId');
          localStorage.removeItem('easy_tax_refund_persistence');
          sessionStorage.removeItem('currentDraftId');
        }
      } catch (err) {
        console.error("Failed to check draft in Firestore:", err);
      }
    };

    const savedDraftId = localStorage.getItem('currentDraftId');
    if (savedDraftId) {
      checkDraftAndSet(savedDraftId);
    } else {
      const savedPersistence = localStorage.getItem("easy_tax_refund_persistence");
      if (savedPersistence) {
        try {
          const parsed = JSON.parse(savedPersistence);
          if (parsed.draftAppId) {
            checkDraftAndSet(parsed.draftAppId);
          }
        } catch (e) { }
      }
    }
  }, [isSimulation]);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error: any) {
      setIsCameraActive(false);
      toast({ variant: 'destructive', title: t('카메라 접근 실패'), description: t('권한을 확인해 주세요.') });
    }
  };

  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setLoading(true);
    const context = canvas.getContext('2d');
    if (context) {
      // Set canvas dimensions to match actual video stream dimensions (high resolution)
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Compress to JPEG with 0.8 quality to keep size small but sharp (Vercel payload bypass)
      const dataUri = canvas.toDataURL('image/jpeg', 0.8);
      
      try {
        const ocrResult = await extractIdInfo({ photoDataUri: dataUri });
        setFormData(prev => ({
          ...prev,
          officialName: ocrResult.name,
          authName: ocrResult.name,
          registrationNumber: ocrResult.registrationNumber,
          issueDate: ocrResult.issueDate
        }));
        
        // OCR 결과가 나오면 즉시 최적화 시작
        if (ocrResult.name) {
          prefetchNameOptimization(ocrResult.name);
        }
        
        toast({ variant: "success", title: t("판독 완료"), description: t("신분증 정보가 자동 입력되었습니다.") });
        
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      } catch (error) {
        toast({ variant: "destructive", title: t("판독 실패"), description: t("다시 촬영해 주세요.") });
      } finally {
        setLoading(false);
      }
    }
  };

  const prefetchNameOptimization = async (name: string) => {
    if (!name || name === optimizationNameRef.current) return;
    optimizationNameRef.current = name;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeName({ name });
      setNameSuggestions(optimized.combinations);
      setFormData(prev => ({ ...prev, authName: optimized.recommendation }));
    } catch (error) {
      console.error("Name optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const saveProgress = async (nextStep: number, isFinal: boolean = false, resultOverride: any = null) => {
    if (isSimulation) return; // Do not save progress in simulation mode
    
    // If there is an active document creation promise, wait for it first to avoid duplicate calls
    if (savingPromiseRef.current) {
      try {
        await savingPromiseRef.current;
      } catch (e) {
        console.error("Previous save promise failed, continuing:", e);
      }
    }

    try {
      const trackingData = getStoredTrackingData();
      const activeResult = resultOverride || result;
      const appData = {
        fullName: formData.officialName,
        registrationNumber: formData.registrationNumber,
        phone: formData.phone,
        lastStep: nextStep,
        preFilterEstimate,
        utmSource: getEffectiveSource(),
        utmMedium: trackingData?.utmMedium || null,
        utmCampaign: trackingData?.utmCampaign || null,
        userLanguage: (typeof window !== 'undefined' ? localStorage.getItem('app_lang') || 'ko' : 'ko'),
        updatedAt: serverTimestamp(),
        isDraft: !isFinal,
        ...(activeResult ? {
          estimatedRefundAmount: activeResult.refundEstimate || 0,
          resIncomeTax: activeResult.resIncomeTax || 0,
          resCompanyIdentityNo1: activeResult.resCompanyIdentityNo1 || 'N/A',
          resAttrYear: activeResult.resAttrYear || 'N/A',
          resIncomeSpecList: activeResult.resIncomeSpecList || '',
          caseType: activeResult.caseType || 'D',
          details: activeResult.details || []
        } : {})
      };

      // Check current draft ID from state or stored storages in case state hasn't updated yet
      const currentDraftId = draftAppId || 
        (typeof window !== 'undefined' ? sessionStorage.getItem('currentDraftId') || localStorage.getItem('currentDraftId') : null);

      if (currentDraftId) {
        await setDoc(doc(db, 'applications', currentDraftId), appData, { merge: true });
      } else {
        // Create a new promise for creation to prevent concurrent addDoc calls
        const createPromise = (async () => {
          const docRef = await addDoc(collection(db, 'applications'), {
            ...appData,
            createdAt: serverTimestamp(),
            status: 'Draft'
          });
          setDraftAppId(docRef.id);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('currentDraftId', docRef.id);
            localStorage.setItem('currentDraftId', docRef.id);
          }
          return docRef.id;
        })();

        savingPromiseRef.current = createPromise;
        await createPromise;
        savingPromiseRef.current = null;
      }
    } catch (err) {
      console.error("Progress save error:", err);
      savingPromiseRef.current = null;
    }
  };

  const handleOcrConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.officialName || !formData.registrationNumber) {
      toast({ variant: "destructive", title: t("정보 부족"), description: t("성함과 외국인 등록번호를 확인해 주세요.") });
      return;
    }

    // Step 2로 즉시 전환 (낙관적 전환)
    setStep(3);
    saveProgress(3);

    // 아직 최적화가 실행되지 않았거나 이름이 바뀐 경우에만 호출
    if (formData.officialName !== optimizationNameRef.current) {
      prefetchNameOptimization(formData.officialName);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.carrier || !formData.authName) {
      toast({ variant: "destructive", title: t("정보 부족"), description: t("연락처와 통신사 정보를 모두 입력해 주세요.") });
      return;
    }
    setStep(4);
    saveProgress(4);
  };

  // --- Hometax Helper Functions and Event Handlers ---
  const getTelecomCode = (carrier: string) => {
    if (!carrier) return "0";
    if (carrier === "SKT") return "0";
    if (carrier === "KT") return "1";
    if (carrier === "LGU+") return "2";
    if (carrier.includes("SKT 알뜰폰")) return "3";
    if (carrier.includes("KT 알뜰폰")) return "4";
    if (carrier.includes("LGU+ 알뜰폰")) return "5";
    return "0"; // fallback
  };

  const openFindIdModal = () => {
    setFindIdForm({
      name: formData.authName || formData.officialName || "",
      regNo: formData.registrationNumber || "",
      telecom: getTelecomCode(formData.carrier),
      phone: formData.phone || "",
      smsCode: "",
      transactionId: "",
      stepData: null
    });
    setFindIdStep(1);
    setFindIdResult("");
    setFindIdOpen(true);
  };

  const openResetPwModal = () => {
    setResetPwForm({
      hometaxId: hometaxId || "",
      name: formData.authName || formData.officialName || "",
      regNo: formData.registrationNumber || "",
      telecom: getTelecomCode(formData.carrier),
      phone: formData.phone || "",
      newPw: "",
      smsCode: "",
      transactionId: "",
      stepData: null
    });
    setResetPwStep(1);
    setResetPwOpen(true);
  };

  // SMS Timer Count down
  useEffect(() => {
    if (smsTimer <= 0) return;
    const interval = setInterval(() => {
      setSmsTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [smsTimer]);

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Background Auto ID generation & Duplicate Check Loop
  const handleAutoGenerateAndCheckHometaxId = async () => {
    setIsIdChecking(true);
    try {
      const phoneTail = formData.phone ? formData.phone.replace(/[^0-9]/g, '').slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
      const birth = formData.registrationNumber ? formData.registrationNumber.replace(/[^0-9]/g, '').slice(0, 6) : "950101";
      
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let availableId = '';
      let generatedPw = '';
      
      // Try generating a unique ID and checking duplicate status
      for (let attempt = 0; attempt < 10; attempt++) {
        let randomStr = '';
        for (let i = 0; i < 3; i++) {
          randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        // Base ID matching: etr + phone4 + birth6 + rand3 (16 chars, meets 8-20 alphanumeric rule)
        const tempId = `etr${phoneTail}${birth}${randomStr}`.toLowerCase();
        
        console.log(`[AutoID Check] Attempt ${attempt + 1}: Checking ${tempId}`);
        const res = await checkHometaxIdDuplicate(tempId, isSimulation);
        if (res.success) {
          availableId = tempId;
          // Generate Password matching: Etr + phone4 + ! + rand3 (11 chars, satisfies complexity rule)
          let randPwStr = '';
          const pwChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          for (let i = 0; i < 3; i++) {
            randPwStr += pwChars.charAt(Math.floor(Math.random() * pwChars.length));
          }
          generatedPw = `Etr${phoneTail}!${randPwStr}`;
          break;
        }
      }
      
      if (availableId) {
        setHometaxId(availableId);
        setHometaxPw(generatedPw);
        setHometaxPwConfirm(generatedPw);
        setHometaxEmail(`etr_${phoneTail}_${birth}@easy-tax-refund.com`);
        setIsIdDuplicateChecked(true);
        console.log(`[AutoID Check] Success! Generated ID: ${availableId}, PW: ${generatedPw}`);
        return { success: true, id: availableId, pw: generatedPw };
      } else {
        throw new Error("사용 가능한 고유 국세청 아이디를 생성하지 못했습니다. 다시 시도해 주세요.");
      }
    } catch (err: any) {
      console.error("[AutoID Check Error]", err);
      toast({ variant: "destructive", title: t("계정 생성 오류"), description: t(err.message || "국세청 아이디 자동 생성 중 오류가 발생했습니다.") });
      return { success: false, error: err.message };
    } finally {
      setIsIdChecking(false);
    }
  };

  // ID Duplicate Check
  const handleCheckIdDuplicate = async () => {
    if (!hometaxId) {
      toast({ variant: "destructive", title: t("아이디 입력 필요"), description: t("아이디를 입력해 주세요.") });
      return;
    }
    // Validation: 8~20 alphanumeric characters
    const idRegex = /^[A-Za-z0-9]{8,20}$/;
    if (!idRegex.test(hometaxId)) {
      toast({
        variant: "destructive",
        title: t("아이디 형식 오류"),
        description: t("아이디는 8~20자리의 영문 및 숫자 조합이어야 합니다.")
      });
      return;
    }

    setIsIdChecking(true);
    try {
      const res = await checkHometaxIdDuplicate(hometaxId, isSimulation);
      if (res.success) {
        setIsIdDuplicateChecked(true);
        toast({ title: t("확인 완료"), description: t("사용 가능한 아이디입니다.") });
      } else {
        setIsIdDuplicateChecked(false);
        toast({ variant: "destructive", title: t("중복된 아이디"), description: t(res.message) });
      }
    } catch (err) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("아이디 확인 중 오류가 발생했습니다.") });
    } finally {
      setIsIdChecking(false);
    }
  };

  // Request Hometax Signup SMS
  const handleRequestSignupSms = async () => {
    if (!hometaxId || !hometaxPw || !hometaxPwConfirm || !hometaxEmail) {
      toast({ variant: "destructive", title: t("입력 확인"), description: t("모든 필드를 입력해 주세요.") });
      return;
    }
    if (!isIdDuplicateChecked) {
      toast({ variant: "destructive", title: t("아이디 중복 확인 필요"), description: t("아이디 중복 확인을 진행해 주세요.") });
      return;
    }
    if (hometaxPw !== hometaxPwConfirm) {
      toast({ variant: "destructive", title: t("비밀번호 불일치"), description: t("비밀번호와 비밀번호 확인이 일치하지 않습니다.") });
      return;
    }
    
    // Hometax Password Validation: 9-15 characters, combination of alphabet, number, special character
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{9,15}$/;
    if (!pwRegex.test(hometaxPw)) {
      toast({
        variant: "destructive",
        title: t("비밀번호 규칙 오류"),
        description: t("비밀번호는 영문, 숫자, 특수문자를 조합하여 9~15자리로 입력해야 합니다.")
      });
      return;
    }

    setLoading(true);
    try {
      const telecomCode = getTelecomCode(formData.carrier);
      const res = await requestHometaxSignupSms({
        userName: formData.authName || formData.officialName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        userId: hometaxId,
        userPw: hometaxPw,
        email: hometaxEmail,
        isSimulation
      });

      if (res.success) {
         setSignupTransactionId(res.id);
         setSignupStepData(res.twoWayInfo);
         setIsSmsRequested(true);
         setSmsTimer(180); // 3 minutes
         toast({ title: t("인증문자 발송 완료"), description: t("휴대폰으로 전송된 6자리 인증번호를 입력해 주세요.") });
      } else {
         toast({ variant: "destructive", title: t("인증문자 요청 실패"), description: t(res.message) });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("인증 요청 중 오류가 발생했습니다.") });
    } finally {
      setLoading(false);
    }
  };

  // Complete Hometax Signup & Query
  const handleCompleteSignup = async () => {
    if (!smsCode || smsCode.length !== 6) {
      toast({ variant: "destructive", title: t("인증번호 확인"), description: t("6자리 인증번호를 바르게 입력해 주세요.") });
      return;
    }

    setIsVerifyingSms(true);
    try {
      const telecomCode = getTelecomCode(formData.carrier);
      const res = await completeHometaxSignup({
        id: signupTransactionId,
        twoWayInfo: signupStepData,
        smsCode,
        userName: formData.authName || formData.officialName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        userId: hometaxId,
        userPw: hometaxPw,
        email: hometaxEmail,
        applicationId: draftAppId || "unknown-app-id",
        isSimulation
      });

      if (res.success) {
        toast({ title: t("회원가입 성공"), description: t("국세청 가입 대행이 정상적으로 완료되었습니다.") });
        setIsVerifyingSms(false);
        setStep(9);
        saveProgress(9);
      } else {
        if (res.message.includes("이미 등록") || res.message.includes("가입된") || res.message.includes("이미 회원")) {
          toast({
            variant: "destructive",
            title: t("이미 가입된 사용자"),
            description: t("이미 국세청에 가입된 정보입니다. 비밀번호를 알고 계시면 로그인해 주시고, 잊으셨다면 비밀번호 재설정을 해주세요.")
          });
          setAuthTab('login');
        } else {
          toast({ variant: "destructive", title: t("회원가입 완료 실패"), description: t(res.message) });
        }
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("회원가입 처리 중 오류가 발생했습니다.") });
    } finally {
      setIsVerifyingSms(false);
    }
  };

  // Direct ID/PW Login & Query
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hometaxId || !hometaxPw) {
      toast({ variant: "destructive", title: t("입력 확인"), description: t("아이디와 비밀번호를 모두 입력해 주세요.") });
      return;
    }

    await runRefundQuery(hometaxId, hometaxPw);
  };

  // Run Refund Query (Step 6 progress flow)
  const runRefundQuery = async (id: string, pw: string) => {
    setStep(6);
    setAnalysisError(null);
    setLoading(true);
    
    try {
      const analysisResult = await estimateRefundWithIdPw({
        hometaxId: id,
        hometaxPw: pw,
        userName: formData.authName || formData.officialName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        applicationId: draftAppId || "unknown-app-id",
        isSimulation
      });

      if (analysisResult.success) {
        // Wait at least 4 seconds for progress animations to look professional
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Save Hometax credentials to Firestore
        if (draftAppId && !isSimulation) {
          try {
            await updateDoc(doc(db, 'applications', draftAppId), {
              hometaxId: id,
              hometaxPw: pw,
              updatedAt: serverTimestamp()
            });
          } catch (fireErr) {
            console.error("Failed to save credentials to Firestore:", fireErr);
          }
        }

        setResult(analysisResult);
        setStep(7);
        saveProgress(7, false, analysisResult);
      } else {
        setAnalysisError({
          code: "HOMETAX_RETRIEVAL_FAILED",
          title: t("국세청 데이터 조회 실패"),
          reason: t(analysisResult.message || "홈택스 로그인 혹은 데이터 스크래핑에 실패했습니다."),
          solution: t("비밀번호가 올바른지 다시 확인해 주시거나, 비밀번호 재설정을 진행해 보세요.")
        });
      }
    } catch (error: any) {
      setAnalysisError({
        code: "HOMETAX_ERROR",
        title: t("시스템 오류"),
        reason: t(error.message || "데이터 수집 중 예기치 못한 오류가 발생했습니다."),
        solution: t("잠시 후 다시 시도해 주세요.")
      });
    } finally {
      setLoading(false);
    }
  };

  // Find ID Handlers
  const handleRequestFindIdSms = async () => {
    if (!findIdForm.name || !findIdForm.regNo || !findIdForm.phone) {
      toast({ variant: "destructive", title: t("입력 확인"), description: t("모든 항목을 입력해 주세요.") });
      return;
    }

    setFindIdLoading(true);
    try {
      const res = await findHometaxIdSms({
        userName: findIdForm.name,
        registrationNumber: findIdForm.regNo,
        phoneNo: findIdForm.phone,
        telecom: findIdForm.telecom,
        isSimulation
      });

      if (res.success) {
        setFindIdForm(prev => ({
          ...prev,
          transactionId: res.id,
          stepData: res.twoWayInfo
        }));
        setFindIdStep(2);
        toast({ title: t("인증문자 발송 완료"), description: t("인증번호가 발송되었습니다.") });
      } else {
        toast({ variant: "destructive", title: t("인증 요청 실패"), description: t(res.message) });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("인증번호 요청에 실패했습니다.") });
    } finally {
      setFindIdLoading(false);
    }
  };

  const handleVerifyFindIdSms = async () => {
    if (!findIdForm.smsCode || findIdForm.smsCode.length !== 6) {
      toast({ variant: "destructive", title: t("인증번호 확인"), description: t("6자리 인증번호를 바르게 입력해 주세요.") });
      return;
    }

    setFindIdLoading(true);
    try {
      const res = await verifyFindHometaxId({
        id: findIdForm.transactionId,
        twoWayInfo: findIdForm.stepData,
        smsCode: findIdForm.smsCode,
        userName: findIdForm.name,
        registrationNumber: findIdForm.regNo,
        phoneNo: findIdForm.phone,
        telecom: findIdForm.telecom,
        isSimulation
      });

      if (res.success) {
        setFindIdResult(res.userId);
        toast({ title: t("조회 성공"), description: t("아이디를 성공적으로 찾았습니다.") });
      } else {
        toast({ variant: "destructive", title: t("조회 실패"), description: t(res.message) });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("아이디 조회 중 오류가 발생했습니다.") });
    } finally {
      setFindIdLoading(false);
    }
  };

  // Reset PW Handlers
  const handleRequestResetPwSms = async () => {
    if (!resetPwForm.hometaxId || !resetPwForm.name || !resetPwForm.regNo || !resetPwForm.phone || !resetPwForm.newPw) {
      toast({ variant: "destructive", title: t("입력 확인"), description: t("모든 항목을 입력해 주세요.") });
      return;
    }
    
    // PW Validation
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{9,15}$/;
    if (!pwRegex.test(resetPwForm.newPw)) {
      toast({
        variant: "destructive",
        title: t("비밀번호 규칙 오류"),
        description: t("비밀번호는 영문, 숫자, 특수문자를 조합하여 9~15자리로 입력해야 합니다.")
      });
      return;
    }

    setResetPwLoading(true);
    try {
      const res = await resetHometaxPasswordSms({
        hometaxId: resetPwForm.hometaxId,
        userName: resetPwForm.name,
        registrationNumber: resetPwForm.regNo,
        phoneNo: resetPwForm.phone,
        telecom: resetPwForm.telecom,
        isSimulation
      });

      if (res.success) {
        setResetPwForm(prev => ({
          ...prev,
          transactionId: res.id,
          stepData: res.twoWayInfo
        }));
        setResetPwStep(2);
        toast({ title: t("인증문자 발송 완료"), description: t("인증번호가 발송되었습니다.") });
      } else {
        toast({ variant: "destructive", title: t("인증 요청 실패"), description: t(res.message) });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("인증번호 요청에 실패했습니다.") });
    } finally {
      setResetPwLoading(false);
    }
  };

  const handleVerifyResetPwSms = async () => {
    if (!resetPwForm.smsCode || resetPwForm.smsCode.length !== 6) {
      toast({ variant: "destructive", title: t("인증번호 확인"), description: t("6자리 인증번호를 바르게 입력해 주세요.") });
      return;
    }

    setResetPwLoading(true);
    try {
      const res = await verifyResetHometaxPassword({
        id: resetPwForm.transactionId,
        twoWayInfo: resetPwForm.stepData,
        smsCode: resetPwForm.smsCode,
        hometaxId: resetPwForm.hometaxId,
        newPw: resetPwForm.newPw,
        userName: resetPwForm.name,
        registrationNumber: resetPwForm.regNo,
        phoneNo: resetPwForm.phone,
        telecom: resetPwForm.telecom,
        applicationId: draftAppId || "unknown-app-id",
        isSimulation
      });

      if (res.success) {
        toast({ title: t("재설정 완료"), description: t("비밀번호가 재설정되었습니다. 이 비밀번호로 로그인 및 조회를 시작합니다.") });
        setResetPwOpen(false);
        setHometaxId(resetPwForm.hometaxId);
        setHometaxPw(resetPwForm.newPw);
        setAuthTab('login');
        
        setResetPwLoading(false);
        await runRefundQuery(resetPwForm.hometaxId, resetPwForm.newPw);
      } else {
        toast({ variant: "destructive", title: t("재설정 실패"), description: t(res.message) });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("비밀번호 재설정 중 오류가 발생했습니다.") });
    } finally {
      setResetPwLoading(false);
    }
  };

  const handleInitiateAuth = async () => {
    if (isSimulation) {
      if (hasCertificate === true) {
        setStep(5);
        setAuthSession({ id: "sim-session-id", twoWayInfo: {} });
        toast({ title: t("인증 요청 성공"), description: t("인증 요청이 성공적으로 전송되었습니다.") });
        return;
      }
      setPinCode("");
      setShowMockPasswordPad(true);
      return;
    }
    // Step 5로 즉시 전환하여 '요청 중' 상태를 보여줌
    setStep(5);
    setLoading(true);
    try {
      const telecomCode = formData.carrier.includes("SKT") ? "0" : formData.carrier.includes("KT") ? "1" : "2";

      const authRes = await initiateRefundAuth({
        userName: formData.authName,
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        method: authMethod // it can be 'app' (PASS) or 'kakao'
      });

      if (authRes.success) {
        setAuthSession({ id: authRes.id, twoWayInfo: authRes.twoWayInfo });
        toast({ title: t("인증 요청 성공"), description: t(authRes.message) });
      } else {
        toast({ variant: "destructive", title: t("인증 요청 실패"), description: t(authRes.message) });
        setStep(4); // 실패 시 다시 선택 단계로
      }
    } catch (error) {
      toast({ variant: "destructive", title: t("시스템 오류"), description: t("인증 요청 중 오류가 발생했습니다.") });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const { extractCarrierName } = await import('@/ai/flows/extract-carrier-name-flow');
        const result = await extractCarrierName({ photoDataUri: base64 });
        setOcrResult(result);
        setIsOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast({
        title: t('판독 실패'),
        description: t('다시 촬영해 주세요.'),
        variant: 'destructive',
      });
      setIsOcrLoading(false);
    }
  };

  const applyOcrName = () => {
    if (!ocrResult?.extractedName) return;
    setFormData(prev => ({
      ...prev,
      authName: ocrResult.extractedName,
      fullName: ocrResult.extractedName
    }));
    setOcrResult(null);
    setStep(3); // 성명 확인 단계로 돌아가서 확인 유도
    toast({
      title: t('성명 적용 완료'),
      description: t('통신사 등록 성함으로 수정되었습니다. 다시 인증을 시도해 보세요.'),
    });
  };
  const handleFinalVerifyAndAnalyze = async () => {
    if (isSimulation) {
      setStep(6);
      setAnalysisError(null);
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 3500));
      const persona = PERSONAS[selectedPersona || 'ko'] || PERSONAS['ko'];
      
      const simulatedResult = {
        success: true,
        refundEstimate: persona.refund,
        resIncomeTax: persona.refund / 1.1,
        resCompanyIdentityNo1: "123-45-67890",
        resAttrYear: "2024",
        resIncomeSpecList: JSON.stringify(persona.breakdown),
        caseType: persona.refund > 0 ? "A" : "D",
        message: persona.refund > 0 ? "축하합니다! {amount}을 찾았습니다." : "조회된 데이터가 없습니다.",
        details: persona.breakdown.map(b => ({
          year: b.year,
          company: "(주)가상상사",
          amount: b.amount,
          isEligible: true
        })),
        serviceFee: Math.floor(persona.refund * 0.25)
      };

      console.log("[Frontend] Simulated identity verification analysis completed:", JSON.stringify(simulatedResult));
      setResult(simulatedResult);
      setStep(7);
      saveProgress(7);
      setLoading(false);
      return;
    }
    if (!authSession) return;
    setStep(6);
    setAnalysisError(null);
    setLoading(true);

    // 브라우저가 Step 5 화면을 렌더링할 시간을 줌
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const telecomCode = formData.carrier.includes("SKT") ? "0" : formData.carrier.includes("KT") ? "1" : "2";
      console.log("[Frontend] Starting completeAuthAndEstimate at:", new Date().toLocaleTimeString());
      const startTime = Date.now();
      const analysisResult = await completeAuthAndEstimate({
        id: authSession.id,
        twoWayInfo: authSession.twoWayInfo,
        userName: formData.authName, // Using authName instead of officialName to maintain consistency with the successful auth
        registrationNumber: formData.registrationNumber,
        phoneNo: formData.phone,
        telecom: telecomCode,
        method: authMethod,
        otpCode: formData.otpCode
      });
      const endTime = Date.now();
      const elapsedMs = endTime - startTime;
      console.log(`[Frontend] completeAuthAndEstimate finished in ${(elapsedMs / 1000).toFixed(2)}s`);
      
      // 5초 최소 대기 시간을 적용하여 로딩 연출이 온전히 사용자에게 보이도록 함
      const minDurationMs = 5000;
      if (elapsedMs < minDurationMs) {
        await new Promise(resolve => setTimeout(resolve, minDurationMs - elapsedMs));
      }
      
      setResult(analysisResult);
      setStep(7);
      saveProgress(7, false, analysisResult);
      setLoading(false);
    } catch (error: any) {
      const isHighValue = preFilterEstimate >= 400000;
      let diag = {
        code: error.message,
        title: t("데이터 수집에 실패했습니다"),
        reason: t("알 수 없는 통신 오류가 발생했습니다."),
        solution: isHighValue
          ? t("고액 환급 대상자이시군요! 인증이 어려우시다면 전문 상담원을 연결해 드릴까요?")
          : t("AI 가이드의 그림을 보고 다시 한 번 시도해 보세요."),
        isHighValue: isHighValue
      };

      if (error.message === "NAME_MISMATCH") {
        diag = {
          ...diag,
          code: "NAME_MISMATCH",
          title: t("성명 정보가 일치하지 않습니다"),
          reason: t("외국인 등록증 성명({name})과 통신사(PASS) 등록 성명이 다릅니다.", { name: formData.officialName }),
          solution: isHighValue
            ? t("성공 확률이 높은 이름들을 AI가 찾았습니다. 해결이 안 된다면 VIP 상담원과 채팅해 보세요.")
            : t("Step 3로 돌아가 AI가 추천하는 다른 이름 조합을 선택해 보세요.")
        };
      } else if (error.message === "AUTH_TIMEOUT") {
        diag = {
          ...diag,
          code: "AUTH_TIMEOUT",
          title: t("인증 시간이 초과되었습니다"),
          reason: t("휴대폰에서 2분 이내에 '확인' 버튼을 누르지 않았습니다."),
          solution: t("Step 4로 돌아가 다시 인증을 요청해 주세요.")
        };
      }

      setAnalysisError(diag);
      setLoading(false);
    }
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    setIsSigned(true);
    draw(e);
  };
  const stopDrawing = () => { setIsDrawing(false); signatureCanvasRef.current?.getContext('2d')?.beginPath(); };
  const draw = (e: any) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    const ctx = signatureCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const rect = signatureCanvasRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
    setIsSigned(false);
    setSignatureDataUrl(null);
  };

  const handleSend1Won = async () => {
    if (!formData.bankName || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
      toast({ variant: "destructive", title: t("정보 입력 필요"), description: t("은행명, 계좌번호, 예금주명을 모두 입력해 주세요.") });
      return;
    }
    // Validate name matching
    const verifiedName = formData.authName || formData.officialName;
    if (verifiedName) {
      const normalizedHolder = formData.accountHolder.replace(/\s+/g, '').toUpperCase();
      const normalizedVerified = verifiedName.replace(/\s+/g, '').toUpperCase();
      if (normalizedHolder !== normalizedVerified) {
        toast({
          variant: "destructive",
          title: t("예금주 명의 불일치"),
          description: t("본인인증을 완료한 이름({name})과 계좌의 예금주명이 일치하지 않습니다. 본인 명의의 계좌만 등록이 가능합니다.", { name: verifiedName }),
        });
        return;
      }
    }
    setIs1WonLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIs1WonSent(true);
    setIs1WonLoading(false);
    toast({ title: t("1원 송금 완료"), description: t("입력하신 계좌로 1원을 보냈습니다. 입금자명 앞 4자리(예: 이지12)를 입력해 주세요.") });
  };

  const handleVerify1Won = async () => {
    if (verificationCode.trim().length !== 4) {
      toast({ variant: "destructive", title: t("인증코드 확인"), description: t("입금자명 앞 4자리를 정확히 입력해 주세요.") });
      return;
    }
    setIs1WonLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIs1WonVerified(true);
    setIs1WonLoading(false);
    toast({ title: t("계좌 인증 성공"), description: t("환급 계좌 및 후불 CMS 정산 수단 등록이 완료되었습니다.") });
  };

  const handleGoToStep10 = () => {
    if (!formData.bankName || !formData.accountNumber.trim()) {
      toast({ variant: "destructive", title: t("정보 입력 필요"), description: t("은행명과 계좌번호를 모두 입력해 주세요.") });
      return;
    }
    setStep(10);
    saveProgress(10);
  };

  const handleOpenDocument = () => {
    const dataUri = getSignatureDataUri();
    setSignatureDataUrl(dataUri);
    setIsDocumentOpen(true);
  };

  const getSignatureDataUri = () => {
    if (!signatureCanvasRef.current) return null;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    const hasDrawing = buffer.some(color => color !== 0);
    return hasDrawing ? canvas.toDataURL() : null;
  };

  const formatDocumentDate = (dateString: string) => {
    const date = new Date(dateString);
    return t("{year}년 {month}월 {day}일", {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    });
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!printRef.current) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (printWindow) {
      const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(s => s.outerHTML)
        .join('\n');

      const content = printRef.current.innerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
          <head>
            <meta charset="utf-8">
            <title>\${t('소득세 환급 자동 분석 솔루션 이용 및 후불 정산 계약서')} - Easy Tax Refund</title>
            \${headStyles}
            <style>
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 40px !important; 
                font-family: 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif !important; 
                color: #0f172a !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-wrapper { 
                display: block !important; 
                visibility: visible !important; 
                opacity: 1 !important; 
                width: 100% !important;
                max-width: 800px !important;
                margin: 0 auto !important;
              }
              .flex { display: flex !important; }
              .grid { display: grid !important; }
              .hidden { display: none !important; }
              img { display: inline-block !important; max-height: 120px; object-fit: contain; }
              .print-hidden, .no-print, button { display: none !important; }
              @page { margin: 1cm; size: A4; }
              [role="dialog"], [data-state] { 
                position: static !important; 
                transform: none !important; 
                box-shadow: none !important;
                border: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-wrapper">
              \${content}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast({
        variant: "destructive",
        title: t("팝업 차단됨"),
        description: t("인쇄창을 띄우기 위해 브라우저 설정에서 팝업을 허용해주세요.")
      });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsConsent1 || !cmsConsent2 || !cmsConsent3) {
      toast({ variant: "destructive", title: t("동의 필요"), description: t("모든 필수 약관에 동의해 주세요.") });
      return;
    }
    if (!isSigned) {
      toast({ variant: "destructive", title: t("서명 확인 필요"), description: t("전자서명 칸에 서명을 완료해 주세요.") });
      return;
    }
    if (!formData.bankName || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
      toast({ variant: "destructive", title: t("정보 입력 필요"), description: t("환급 받으실 은행명, 계좌번호, 예금주명을 모두 입력해 주세요.") });
      return;
    }
    if (isSimulation) {
      setStep(11);
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({ type: 'STEP_CHANGED', step: 11 }, '*');
      }
      return;
    }
    setLoading(true);
    try {
      const signatureDataUri = signatureCanvasRef.current?.toDataURL('image/png');
      const clientId = `user-${formData.registrationNumber.replace(/[^0-9]/g, '').slice(-6)}-${Date.now()}`;

      const trackingData = getStoredTrackingData();

      // Firestore에 신청 데이터 저장 (기존 드래프트 업데이트)
      const appData = {
        clientId,
        fullName: formData.officialName,
        registrationNumber: formData.registrationNumber,
        phone: formData.phone,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        signatureDataUri: signatureDataUri || null,
        cmsConsent1,
        cmsConsent2,
        cmsConsent3,
        cmsConsentAt: serverTimestamp(),
        estimatedRefundAmount: result?.refundEstimate || 0,
        preFilterEstimate,
        resIncomeTax: result?.resIncomeTax || 0,
        resCompanyIdentityNo1: result?.resCompanyIdentityNo1 || 'N/A',
        resAttrYear: result?.resAttrYear || 'N/A',
        resIncomeSpecList: result?.resIncomeSpecList || '',
        caseType: result?.caseType || 'D',
        details: result?.details || [],
        status: 'InquiryCompleted',
        lastStep: 10,
        utmSource: getEffectiveSource(),
        utmMedium: trackingData?.utmMedium || null,
        utmCampaign: trackingData?.utmCampaign || null,
        paymentStatus: 'pending',
        userLanguage: (typeof window !== 'undefined' ? localStorage.getItem('app_lang') || 'ko' : 'ko'),
        applicationDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDraft: false
      };

      let finalDocId = draftAppId;
      if (draftAppId) {
        await setDoc(doc(db, 'applications', draftAppId), appData, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...appData,
          createdAt: serverTimestamp()
        });
        finalDocId = docRef.id;
      }

      // 포털에서 내 신청 조회용 sessionStorage 저장
      sessionStorage.setItem('myApplicationId', finalDocId!);
      sessionStorage.setItem('myClientId', clientId);
      sessionStorage.setItem('myFullName', formData.officialName);

      toast({ title: t("신청 완료"), description: t("전문 세무사가 검토를 시작합니다.") });
      router.push("/portal");
    } catch (err) {
      console.error("Firestore 저장 오류:", err);
      toast({ variant: "destructive", title: t("제출 실패"), description: t("잠시 후 다시 시도해 주세요.") });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("복사 완료"), description: t("클립보드에 복사되었습니다.") });
  };

  return (
    <div 
      id="estimate-scroll-container" 
      className={`min-h-screen flex flex-col font-body bg-slate-50/50 ${isSimulation ? 'h-screen overflow-y-auto' : ''}`}
    >
      {isInAppBrowser && (
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-10 relative">
            <ShieldCheck className="w-12 h-12 text-primary" />
            <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 break-keep leading-tight">
            {/android/i.test(navigator.userAgent)
              ? t('in_app_browser_title_android')
              : t('in_app_browser_title_ios')}
          </h2>

          <p className="text-slate-500 font-bold mb-12 leading-relaxed break-keep max-w-sm mx-auto">
            {/android/i.test(navigator.userAgent)
              ? t('in_app_browser_desc_android')
              : t('in_app_browser_desc_ios')}
          </p>

          {/android/i.test(navigator.userAgent) ? (
            <Button
              onClick={handleInstallApp}
              className="w-full max-w-sm h-20 bg-primary text-xl font-black rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Smartphone className="w-7 h-7" />
              {t('in_app_browser_btn_android')}
            </Button>
          ) : (
            <div className="space-y-6 w-full max-w-sm">
              <Button
                onClick={() => {
                  const currentUrl = new URL(window.location.href);
                  currentUrl.searchParams.set('lang', language);
                  navigator.clipboard.writeText(currentUrl.toString());
                  toast({ title: t("in_app_browser_copy_done"), description: t("in_app_browser_copy_desc") });
                }}
                className="w-full h-20 bg-slate-900 text-xl font-black rounded-3xl shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Copy className="w-7 h-7" />
                {t('in_app_browser_btn_ios')}
              </Button>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('in_app_browser_ios_manual')}</p>
            </div>
          )}

          <button
            onClick={() => setIsInAppBrowser(false)}
            className="mt-12 text-slate-400 font-bold text-sm underline underline-offset-4 decoration-slate-200 hover:text-slate-600 transition-colors"
          >
            {t('in_app_browser_continue_anyway')}
          </button>
        </div>
      )}
      {!isSimulation && <Navbar />}
      <main className={`flex-1 container mx-auto ${isSimulation ? 'px-2 py-2' : 'px-4 py-8 lg:py-24'}`}>
        <div className={`max-w-2xl mx-auto ${isSimulation ? 'space-y-3' : 'space-y-6 sm:space-y-8'}`}>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {step === 0 
                  ? t('나의 환급금 사전 진단') 
                  : step === 0.5 
                    ? t('세금 환급 절차 안내') 
                    : t('Process {step} / {total}', { step, total: 10 })}
              </Badge>
              <span className="text-2xl font-black">
                {step === 0 ? '0%' : step === 0.5 ? '5%' : `${Math.round(progressValue)}%`}
              </span>
            </div>
            <Progress value={step === 0 ? 5 : step === 0.5 ? 8 : progressValue} className="h-3" />
          </div>

          <div className="relative">
            {step === 0 && (
              <Card className="premium-card rounded-2xl sm:rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><Banknote className="h-64 w-64 text-primary" /></div>
                  <div id="step0-sparkles" className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 transition-transform duration-500">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-black font-headline tracking-tight px-4 leading-tight">
                    {t('나의 잠재 환급액')}<br />{t('10초 만에 확인하기')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-12 space-y-6 sm:space-y-12">
                  {/* AI Real-time Age Eligibility Display */}
                  <div className="p-4 sm:p-6 bg-primary/5 rounded-2xl sm:rounded-[2.5rem] border border-primary/20 relative overflow-hidden animate-in fade-in zoom-in duration-700">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">{t('AI Live Tracker')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-5">
                      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-3 text-left">
                        <p className="font-black text-slate-800 text-lg sm:text-[22px] leading-tight">{t('대상 연령 안내 (실시간 업데이트)')}</p>
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-4">
                          <Badge className="bg-primary text-white border-none font-black text-sm sm:text-[18px] px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20">
                            {t('만 15세 ~ 34세')}
                          </Badge>
                          <div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-primary/10 shadow-sm">
                            <FileText className="h-6 w-6 text-primary/60" />
                            <p className="text-sm sm:text-[20px] font-black text-slate-700 leading-none mt-0.5">
                              {eligibilityRange.start} ~ {eligibilityRange.end}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-lg font-black text-slate-800">{t('최근 5년 한국 근무 기간')}</Label>
                        <span className="text-2xl font-black text-primary">{preFilterData.workMonths}{t('개월')}</span>
                      </div>
                      <input
                        type="range" min="1" max="60" step="1"
                        id="step0-months-slider" value={preFilterData.workMonths}
                        onChange={(e) => setPreFilterData({ ...preFilterData, workMonths: parseInt(e.target.value) })}
                        className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>1 {t('개월')}</span>
                        <span>30 {t('개월')}</span>
                        <span>60 {t('개월')}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-lg font-black text-slate-800">{t('평균 월 급여 (세전)')}</Label>
                        <span className="text-2xl font-black text-primary">{preFilterData.avgSalary}{t('만 원')}</span>
                      </div>
                      <div id="step0-salary-container" className="grid grid-cols-4 gap-2">
                        {[150, 200, 250, 300, 350, 400, 500, 600].map((val, idx) => (
                          <Button
                            key={val}
                            id={`step0-salary-${idx}`}
                            variant={preFilterData.avgSalary === val ? 'default' : 'outline'}
                            onClick={() => setPreFilterData({ ...preFilterData, avgSalary: val })}
                            className={cn(
                              "h-12 font-black rounded-xl text-sm transition-all",
                              preFilterData.avgSalary === val ? "bg-primary text-white scale-105 shadow-lg shadow-primary/20" : "border-slate-100 text-slate-400 hover:border-primary/20"
                            )}
                          >
                            {val === 600 ? '600+' : val}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{t('AI 예상 환급 가능 금액')}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-5xl font-black text-primary font-headline animate-in zoom-in-50 duration-500">
                        ₩ {preFilterEstimate.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed bg-white/50 py-2 px-4 rounded-full border border-slate-100 backdrop-blur-sm inline-block">
                      {t('* 실제 개인별 소득 공제 항목에 따라 차이가 발생할 수 있습니다.')}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    {/* Free Risk Reversal Alert */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                      <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-[13px] font-black text-emerald-800 leading-tight">
                        {t('예상 환급액을 확인하는 데는 비용이 전혀 들지 않습니다. 안심하고 확인해 보세요.')}
                      </p>
                    </div>

                    <Button
                      id="step0-submit-btn"
                      onClick={() => {
                        setStep(0.5);
                        saveProgress(0.5);
                      }}
                      className="w-full h-auto min-h-[6rem] py-4 px-6 bg-slate-900 text-2xl font-black rounded-3xl shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] group whitespace-normal break-words"
                    >
                      <span className="flex-1">{t('이어서 정밀 진단 시작하기')}</span> <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2 shrink-0" />
                    </Button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <ShieldCheck className="h-3 w-3" /> {t('9 step precision diagnostic flow initiated')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 0.5 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-5 sm:py-10 bg-slate-900 text-white relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(0); saveProgress(0); }}
                    className="absolute top-6 left-6 text-white/40 hover:text-white font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className="mx-auto h-20 w-20 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg border border-white/15">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black font-headline tracking-tight">
                    {t('숨은 세금 환급 과정 안내 🚀')}
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-sm mt-3 leading-relaxed max-w-[340px] mx-auto">
                    {t('안녕하세요! 숨은 세금 환급금을 찾아 통장으로 받기까지의 전체 핵심 4단계 과정을 안내해 드릴게요.')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-8 bg-slate-50/50">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01]">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-50 text-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-[15px] font-black text-slate-900 text-left">
                          {t('1️⃣ [정부 필수] 신분증 확인 및 번호 입력')} <span className="text-[10px] sm:text-xs text-red-500 font-black ml-1">{t('(Step 1~3)')}</span>
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-relaxed text-left whitespace-pre-line">
                          {t('대한민국 국세청(NTS)에서 세금 환급 승인을 위해 법적으로 요구하는 필수 절차입니다. 제출하신 신분증 사진은 본인 확인 즉시 시스템에서 영구 파기(저장 NO!)되며, 금융권 수준의 강력한 암호화 보안 기술로 안전하게 보호되니 안심하고 촬영해 주세요.')}
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01]">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-50 text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-[15px] font-black text-slate-900 text-left">
                          {t('2️⃣ [가장 중요] 본인 인증서 설치 및 인증')} <span className="text-[10px] sm:text-xs text-emerald-600 font-black ml-1">{t('(Step 4~5)')}</span>
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-relaxed text-left whitespace-pre-line">
                          {t('한국 국세청(NTS) 전산망과 안전하게 연결하기 위해 카카오톡, PASS, 하나은행 등의 인증서로 본인 인증을 완료합니다. (인증서가 없으시면 1분 만에 발급받는 법을 친절히 안내해 드립니다.)')}
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01]">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-50 text-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-[15px] font-black text-slate-900 text-left">
                          {t('3️⃣ 정확한 환급금 확인 및 후불 정산 등록')} <span className="text-[10px] sm:text-xs text-blue-600 font-black ml-1">{t('(Step 6~8)')}</span>
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-relaxed text-left whitespace-pre-line">
                          {t('최근 5년 동안 한국에서 일하며 더 낸 세금이 얼마인지 즉시 확인합니다. 환급금이 확인되면, 국세청에서 고객님 통장으로 환급금이 입금된 후에만 출금되는 후불제 정산(플랫폼 이용료 25%) 등록을 진행합니다. 환급 거절/실패 시 청구되는 금액은 0원입니다.')}
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm transition-all hover:scale-[1.01]">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-50 text-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-[15px] font-black text-slate-900 text-left">
                          {t('4️⃣ 계약서 서명 및 입금 신청')} <span className="text-[10px] sm:text-xs text-amber-600 font-black ml-1">{t('(Step 9)')}</span>
                        </h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-relaxed text-left whitespace-pre-line">
                          {t('후불 정산 등록 완료 후, 모바일 서명을 통해 정식 세무대리 수임계약서가 투명하고 안전하게 작성되며 환급금을 입금받으실 본인 통장 계좌번호를 입력합니다. 이후 약 1~2개월 뒤 한국 국세청에서 고객님의 통장으로 환급금을 직접 송금해 드립니다.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    id="step05-submit-btn"
                    onClick={() => { setStep(1); saveProgress(1); }}
                    className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-xl font-black rounded-3xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('확인했습니다. 시작하기')} <ArrowRight className="h-6 w-6" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-4 sm:py-10 bg-slate-50/50 border-b border-slate-100">
                  <div className="mx-auto flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl opacity-50" />
                      <Image
                        src="/official_nts_carrier_badge_v2_1774141326494.png"
                        alt="Official NTS & Carrier Badge"
                        width={120}
                        height={120}
                        className="relative rounded-2xl shadow-md border border-white transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 text-[10px] font-black uppercase tracking-widest">{t('safe_and_secure')}</Badge>
                      {/* 국세청 홉택스 점검 시간 배너 (KST 00:00~06:00) - Step 1 상단 */}
                      {isNtsMaintenance && (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left mt-3 animate-in fade-in duration-500">
                          <div className="h-7 w-7 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-black text-amber-800 text-sm">{t('국세청 시스템 점검 중 (00:00 ~ 06:00)')}</p>
                            <p className="text-amber-700 text-xs font-bold mt-0.5">{t('오전 6시 이후에 조회하시면 정상적으로 이용하실 수 있습니다.')}</p>
                          </div>
                        </div>
                      )}
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800">{t('nts_trust_title')}</h2>
                      <p className="text-[13px] font-bold text-slate-500 leading-tight max-w-[280px] mx-auto opacity-80">{t('nts_trust_message')}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardHeader className="text-center py-4 sm:py-12 bg-white">
                  <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-slate-900 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">
                    {t('시작하기 전 필수 확인')}
                  </CardTitle>
                  <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm">
                    {t('성공적인 환급 조회를 위해 아래 사항을 준비해 주세요.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                        <BadgeCheck className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-emerald-900 text-sm">{t('외국인 등록증')}</p>
                        <p className="text-[11px] text-emerald-700/70 font-bold">{t('실물 신분증 준비')}</p>
                      </div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-blue-900 text-sm">{t('본인 명의 휴대폰')}</p>
                        <p className="text-[11px] text-blue-700/70 font-bold">{t('통신사 가입자 본인')}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="space-y-6">
                    <div className="pt-2">
                      <Button
                        id="step1-submit-btn"
                        variant="default"
                        onClick={() => { setStep(2); saveProgress(2); }}
                        className="w-full h-16 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
                      >
                        <BadgeCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        {t('시작하기')}
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 rounded-3xl p-5">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertDescription className="text-[13px] font-bold text-amber-900 leading-relaxed ml-1">
                      {t('중요: 통신사(핸드폰)에 등록된 영문 이름과 외국인 등록증의 이름이 단 한 글자라도 다르면 조회가 불가능합니다.')}
                    </AlertDescription>
                  </Alert>

                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="text-center bg-slate-50/50 py-4 sm:py-10 border-b border-slate-100 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(1); saveProgress(1); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4"><Scan className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /></div>
                  <CardTitle className="text-2xl sm:text-3xl font-black break-keep">{t('Step 2: 외국인등록증 인증')}</CardTitle>
                  <CardDescription className="font-bold text-slate-400 text-xs sm:text-sm">{t('신분증 정보를 확인하여 감면 대상을 판별합니다.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-8 p-4 sm:p-10">
                  {/* Security Assurance Card - Embedded in Step 2 */}
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                      <div className="shrink-0 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <Image
                          src="/certified_security_seal_premium_1774150786685.png"
                          alt="Certified Security"
                          width={80}
                          height={80}
                          className="relative transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                            {t('security_card_title')}
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 leading-none py-0.5">{t('security_certified')}</Badge>
                          </h4>
                          <p className="text-sm font-bold text-slate-500">{t('security_card_subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Lock className="h-3 w-3 text-primary" />
                              {t('security_item_encryption_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_encryption_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Database className="h-3 w-3 text-primary" />
                              {t('security_item_no_storage_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_no_storage_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Shield className="h-3 w-3 text-primary" />
                              {t('security_item_pippa_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_pippa_desc')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isCameraActive ? (
                    <div onClick={startCamera} className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center bg-slate-50 cursor-pointer hover:bg-primary/5 transition-all group">
                      <Camera className="h-14 w-14 text-primary mx-auto mb-4 transition-transform group-hover:scale-110" />
                      <h3 className="font-black text-lg">{t('외국인등록증 촬영하여 자동 입력')}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-2">{t('되도록 외국인 등록증을 촬영 해주세요. 그래야 정확한 정보가 입력 됩니다.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        
                        {/* Dotted ID Card Guide Box Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {/* Dotted Box: aspect ratio ~1.58 (standard ID card) */}
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
                          variant="outline"
                          className="h-16 w-1/3 rounded-2xl font-bold border-slate-200 text-slate-500"
                          disabled={loading}
                        >
                          {t('취소')}
                        </Button>
                        <Button 
                          type="button"
                          onClick={captureAndScan} 
                          className="flex-1 h-16 bg-primary text-lg font-black rounded-2xl shadow-xl shadow-primary/20" 
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="animate-spin h-6 w-6" /> : t('촬영 및 정보 추출')}
                        </Button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* 추가된 신분증 입력뷰 Trust Indicators */}
                  <div className="space-y-4 mb-2 mt-4">
                    <Alert className="bg-emerald-50 border-emerald-200 rounded-2xl shadow-sm pb-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <AlertDescription className="text-sm font-black text-emerald-800 leading-relaxed ml-1">
                        {t('본 환급은 합법적 권리로, 비자(E-9, E-7, F-2 등) 연장이나 체류 자격에 어떠한 불이익도 없습니다.')}
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Lock className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-black text-slate-700">{t('입력하신 정보는 은행 수준(AES-256)으로 암호화됩니다.')}</p>
                        <p className="text-[11px] font-bold text-slate-500 mt-1 leading-tight">{t('국세청 환급금 조회를 위해서만 1회 사용되며 서버에 절대 저장되지 않습니다. (평가 후 즉시 파기)')}</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleOcrConfirm} className="space-y-8">
                    <div className="grid gap-6">
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1.5 mb-1">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('영문 성명 (NAME)')}</Label>
                          <p className="text-[10px] text-amber-600 font-bold ml-1">{t('* 정확한 조회를 위해 성과 이름을 꼭 띄어서 입력해 주세요.')}</p>
                        </div>
                        <input
                          id="step2-name-input"
                          placeholder={t("예: HONG GIL DONG")}
                          value={formData.officialName}
                          onChange={(e) => {
                            const newName = e.target.value.toUpperCase();
                            setFormData({ ...formData, officialName: newName });
                            // 실시간으로 미리 작업 시작 (최적화)
                            if (newName.length > 3) {
                              prefetchNameOptimization(newName);
                            }
                          }}
                          className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('외국인 등록번호')}</Label>
                        <input id="step2-reg-input" value={formData.registrationNumber} maxLength={13} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                    <Button id="step2-submit-btn" type="submit" className="w-full h-16 sm:h-20 bg-slate-900 text-lg sm:text-xl font-black rounded-2xl sm:rounded-3xl shadow-2xl" disabled={loading}>{t('다음 단계로 이동')}</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="text-center bg-slate-50/50 py-4 sm:py-10 border-b border-slate-100 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(2); saveProgress(2); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black break-keep">
                    {t('Step 3: 본인 인증 정보 입력')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-10 space-y-4 sm:space-y-8">
                  {/* Security Assurance Card - Embedded in Step 3 */}
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                      <div className="shrink-0 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <Image
                          src="/certified_security_seal_premium_1774150786685.png"
                          alt="Certified Security"
                          width={80}
                          height={80}
                          className="relative transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                            {t('security_card_title')}
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 leading-none py-0.5">{t('security_certified')}</Badge>
                          </h4>
                          <p className="text-sm font-bold text-slate-500">{t('security_card_subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Lock className="h-3 w-3 text-primary" />
                              {t('security_item_encryption_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_encryption_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Database className="h-3 w-3 text-primary" />
                              {t('security_item_no_storage_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_no_storage_desc')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                              <Shield className="h-3 w-3 text-primary" />
                              {t('security_item_pippa_title')}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{t('security_item_pippa_desc')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-8">
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('휴대폰 번호')}</Label>
                          <input
                            id="step3-phone-input" placeholder="01012345678"
                            className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg w-full outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('통신사')}</Label>
                          <Select value={formData.carrier || undefined} onValueChange={(v) => setFormData({ ...formData, carrier: v })}>
                            <SelectTrigger id="step3-carrier-select" className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg">
                              <SelectValue placeholder={t('통신사 선택')} />
                            </SelectTrigger>
                            <SelectContent>
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

                      <div className="space-y-4 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Sparkles className="h-24 w-24 text-primary" />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                              <UserCheck className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="text-base font-black text-slate-900">
                              {isOptimizing ? t('AI 성명 최적화 분석 중...') : t('통신사 등록 성명 확인(필수)')}
                            </h4>
                          </div>
                          {!isOptimizing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsNameHelpOpen(true)}
                              className="text-[11px] h-8 px-3 font-black text-primary hover:bg-primary/10 rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              {t('정확한 등록 성함 확인 방법')}
                            </Button>
                          )}
                        </div>

                        {!isOptimizing && (
                          <div className="mb-6 space-y-4">
                            <div className="p-5 bg-white rounded-2xl border border-primary/10 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('신분증상 성명')}</span>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[10px]">{t('BASE')}</Badge>
                              </div>
                              <span className="text-xl font-black text-slate-400 line-through decoration-slate-300">{formData.officialName}</span>
                            </div>

                            <Alert className="bg-white border-amber-200 rounded-2xl shadow-sm">
                              <Info className="h-4 w-4 text-amber-500" />
                              <AlertDescription className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                {t('외국인은 통신사마다 이름 형식이 다를 수 있습니다. 아래 추천된 형식 중 본인의 [통신사 앱]에 등록된 것과 "완벽히 똑같은" 것을 선택해 주세요.')}
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 relative z-10">
                          {isOptimizing && nameSuggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-6 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                              <Loader2 className="h-12 w-12 animate-spin text-primary" />
                              <div className="text-center space-y-2">
                                <p className="text-base font-black text-slate-600">{t('성공 확률이 가장 높은 이름을 찾는 중...')}</p>
                                <p className="text-xs font-bold text-slate-400">{t('통신사 전산망의 다양한 영문 표기법을 분석하고 있습니다.')}</p>
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
                                  className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 relative ${formData.authName === item.name ? 'bg-primary border-primary text-white shadow-xl scale-[1.02] z-20' : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-black text-xl tracking-tight">{item.name}</span>
                                    {formData.authName === item.name ? (
                                      <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                      </div>
                                    ) : (
                                      <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <Copy className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                                      </div>
                                    )}
                                  </div>
                                  <span className={cn("text-[11px] font-black uppercase tracking-wider", formData.authName === item.name ? "text-white/70" : "text-primary/70")}>
                                    {t(item.label)}
                                  </span>
                                </div>
                              ))}

                              <div className="pt-6 border-t border-slate-100 mt-4 space-y-4">
                                <div className="flex items-center justify-between px-1">
                                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('직접 입력하기')}</Label>
                                  <span className="text-[10px] text-slate-300 font-bold">{t('추천 목록에 없는 경우')}</span>
                                </div>
                                <div className="relative group">
                                  <input
                                    placeholder={t('통신사에 등록된 이름을 그대로 입력')}
                                    value={formData.authName}
                                    onChange={(e) => setFormData({ ...formData, authName: e.target.value.toUpperCase() })}
                                    className="h-16 px-6 rounded-2xl bg-white border-2 border-slate-100 font-black text-lg w-full outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-12"
                                  />
                                  <User className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex items-start gap-5 shadow-2xl transition-all hover:scale-[1.01]">
                      <Checkbox id="signup" checked={isSignUpAgreed} onCheckedChange={(c) => setIsSignUpAgreed(c as boolean)} className="mt-1.5 h-6 w-6 border-white/20" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="signup" className="text-lg lg:text-xl font-black cursor-pointer break-keep">{t('회원가입 및 환급 알림 받기')}</Label>
                          <Badge className="bg-primary text-[10px] font-bold border-none h-5">{t('무료')}</Badge>
                        </div>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed">{t('환급금 결과 및 진행 상황을 안전하게 안내해 드립니다.')}</p>
                      </div>
                    </div>
                    <Button id="step3-submit-btn" type="submit" className="w-full h-20 sm:h-24 bg-primary text-xl sm:text-2xl font-black rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('조회 정보 확인 완료')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                {hasCertificate === null ? (
                  <>
                    <CardHeader className="text-center py-4 sm:py-12 bg-slate-50/50 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setStep(3); saveProgress(3); }}
                        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('이전')}
                      </Button>
                      <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                        <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">
                        {t('인증서가 스마트폰에 설치되어 있나요?')}
                      </CardTitle>
                      <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm mt-4">
                        <div>
                          {t('국세청 조회를 위해서는 본인 명의의 인증서가 반드시 필요합니다. 현재 아래 인증서 중 가입된 인증서가 있으신가요?')}
                        </div>
                        <div className="mt-4 p-4 bg-white/80 backdrop-blur rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 shadow-sm">
                          <span className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider shrink-0">{t('💡 지원하는 인증서 종류')}</span>
                          <div className="flex gap-2.5 flex-wrap justify-center">
                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-[11px] sm:text-xs font-bold text-slate-700">
                              <Image src="/images/logo/hana_1q.png" alt="Hana" width={14} height={14} className="object-contain" />
                              {t('하나은행')}
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-[11px] sm:text-xs font-bold text-slate-700">
                              <Image src="/images/logo/pass.png" alt="PASS" width={14} height={14} className="object-contain" />
                              {t('PASS')}
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 text-[11px] sm:text-xs font-bold text-slate-700">
                              <Image src="/images/logo/kakao.png" alt="Kakao" width={14} height={14} className="object-contain" />
                              {t('카카오톡')}
                            </div>
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-10 space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div
                          id="step4-cert-yes" onClick={() => setHasCertificate(true)}
                          className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-primary/50 cursor-pointer transition-all flex items-center gap-5 bg-white hover:bg-slate-50/50 shadow-sm hover:shadow"
                        >
                          <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-black text-lg text-slate-950">
                              {t('네, 이미 가입된 인증서가 있습니다.')}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              {t('하나은행, PASS, 카카오톡 인증서 중 하나가 이미 휴대폰에 설치되어 있습니다.')}
                            </p>
                          </div>
                        </div>

                        <div
                          id="step4-cert-no" onClick={() => setHasCertificate(false)}
                          className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-amber-500/50 cursor-pointer transition-all flex items-center gap-5 bg-white hover:bg-slate-50/50 shadow-sm hover:shadow"
                        >
                          <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                            <AlertCircle className="h-8 w-8 text-amber-500 animate-pulse" />
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-black text-lg text-slate-950">
                              {t('아니오, 인증서가 없습니다 (설치/발급 필요)')}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              {t('인증서가 없으시다면, 먼저 설치 및 발급을 진행하셔야 환급 조회가 가능합니다.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : hasCertificate === false ? (
                  <>
                    <CardHeader className="text-center py-4 sm:py-12 bg-slate-50/50 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHasCertificate(null)}
                        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('이전')}
                      </Button>
                      <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-amber-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                        <Download className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">
                        {t('인증서가 없으신가요? (추천)')}
                      </CardTitle>
                      <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm">
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                          <p className="text-[12px] sm:text-[13px] font-black text-amber-900 leading-relaxed flex items-start gap-2">
                            <span className="shrink-0 mt-0.5 text-amber-500 italic">💡</span>
                            {t('국세청 조회를 하려면 아래 인증서 중 하나가 반드시 설치되어 있어야 합니다. 안내에 따라 설치 및 발급을 완료해 주세요.')}
                          </p>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-10 space-y-4 sm:space-y-8">
                      {/* Selection Tabs in Guide Mode */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Hana */}
                        <div
                          onClick={() => setAuthMethod('hana')}
                          className={cn(
                            "p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
                            authMethod === 'hana' ? "bg-emerald-50 border-[#008485]" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <Image src="/images/logo/hana_1q.png" alt="Hana" width={32} height={32} className="object-contain" />
                          <span className={cn("text-xs font-black", authMethod === 'hana' ? "text-[#008485]" : "text-slate-600")}>{t('하나은행')}</span>
                        </div>
                        {/* PASS */}
                        <div
                          onClick={() => setAuthMethod('app')}
                          className={cn(
                            "p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
                            authMethod === 'app' ? "bg-red-50 border-red-500" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <Image src="/images/logo/pass.png" alt="PASS" width={32} height={32} className="object-contain" />
                          <span className={cn("text-xs font-black", authMethod === 'app' ? "text-red-700" : "text-slate-600")}>{t('PASS')}</span>
                        </div>
                        {/* Kakao */}
                        <div
                          onClick={() => setAuthMethod('kakao')}
                          className={cn(
                            "p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
                            authMethod === 'kakao' ? "bg-yellow-50/50 border-[#FEE500]" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <Image src="/images/logo/kakao.png" alt="Kakao" width={32} height={32} className="object-contain" />
                          <span className={cn("text-xs font-black", authMethod === 'kakao' ? "text-[#191919]" : "text-slate-600")}>{t('카카오톡')}</span>
                        </div>
                      </div>

                      {/* Guide Component */}
                      {authMethod && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                          <EmbeddedAuthGuide
                            authMethod={authMethod}
                            mode="registration"
                            onClick={() => {
                              if (authMethod === 'hana') {
                                setHanaGuideMode('full');
                                setIsHanaGuideOpen(true);
                              } else if (authMethod === 'kakao') {
                                setIsKakaoGuideOpen(true);
                              } else {
                                setIsGuideOpen(true);
                              }
                            }}
                          />
                        </div>
                      )}

                      <Button
                        id="step4-cert-complete-btn"
                        onClick={() => setHasCertificate(true)}
                        className="w-full h-20 bg-primary text-xl sm:text-2xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        {t('인증서 설치 및 가입을 완료했습니다')}
                      </Button>

                      <div className="text-center">
                        <button
                          onClick={() => setHasCertificate(true)}
                          className="text-sm font-bold text-slate-400 hover:text-slate-600 underline transition-colors"
                        >
                          {t('인증서가 있습니다. 바로 시작하기')}
                        </button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader className="text-center py-4 sm:py-12 bg-slate-50/50 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHasCertificate(null)}
                        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('이전')}
                      </Button>
                      <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 shadow-lg"><UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" /></div>
                      <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 break-keep">{t('Step 4: 인증 방식 선택')}</CardTitle>
                      <CardDescription className="font-bold text-slate-500 text-xs sm:text-sm">
                        {t('가장 편리한 방법으로 본인을 인증해 주세요.')}
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                          <p className="text-[12px] sm:text-[13px] font-black text-amber-900 leading-relaxed text-left flex items-start gap-2">
                            <span className="shrink-0 mt-0.5 text-amber-500 italic">💡</span>
                            {t('한국국세청에 로그인하기 위해서는 꼭 아래의 인증서가 필요합니다. 인증서는 본인 인증을 위해서 사용되며, 인증서가 없으신 분들은 인증서를 꼭 발급받으신 후 시작해주세요.')}
                          </p>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-10 space-y-4 sm:space-y-8">
                      {/* Selection Cards (Middle of CardContent) */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Hana Bank Card */}
                        <div
                          id="step4-method-hana" onClick={() => setAuthMethod('hana')}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 relative overflow-hidden",
                            authMethod === 'hana' ? "bg-emerald-50 border-[#008485] shadow-lg shadow-emerald-500/10" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          {authMethod === 'hana' && (
                            <div className="absolute top-0 right-0 p-1 px-3 bg-[#008485] text-white text-[10px] font-black rounded-bl-xl uppercase">
                              {t('외국인 추천')}
                            </div>
                          )}
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", authMethod === 'hana' ? "bg-white p-2" : "bg-slate-100 text-slate-400 p-3")}>
                            <Image src="/images/logo/hana_1q.png" alt="Hana" width={40} height={40} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className={cn("font-black text-lg", authMethod === 'hana' ? "text-[#008485]" : "text-slate-900")}>{t('하나은행 인증서')}</h4>
                              {authMethod === 'hana' && <CheckCircle2 className="h-5 w-5 text-[#008485]" />}
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{t("하나은행 앱이 있다면 가장 간편해요")}</p>
                          </div>
                        </div>

                        {/* PASS Card */}
                        <div
                          id="step4-method-pass" onClick={() => setAuthMethod('app')}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 relative overflow-hidden",
                            authMethod === 'app' ? "bg-red-50 border-red-500 shadow-lg shadow-red-500/10" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", authMethod === 'app' ? "bg-white p-2" : "bg-slate-100 text-slate-400 p-3")}>
                            <Image src="/images/logo/pass.png" alt="PASS" width={40} height={40} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className={cn("font-black text-lg", authMethod === 'app' ? "text-red-700" : "text-slate-900")}>{t('PASS 앱 설치 유저')}</h4>
                              {authMethod === 'app' && <CheckCircle2 className="h-5 w-5 text-red-600" />}
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{t("SKT, KT, LG 유저 휴대폰인증")}</p>
                          </div>
                        </div>

                        {/* Kakao Card */}
                        <div
                          id="step4-method-kakao" onClick={() => setAuthMethod('kakao')}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 relative overflow-hidden",
                            authMethod === 'kakao' ? "bg-yellow-50/50 border-[#FEE500] shadow-lg shadow-yellow-500/10" : "bg-white border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", authMethod === 'kakao' ? "bg-white p-2" : "bg-slate-100 text-slate-400 p-3")}>
                            <Image src="/images/logo/kakao.png" alt="Kakao" width={40} height={40} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className={cn("font-black text-lg", authMethod === 'kakao' ? "text-[#191919]" : "text-slate-900")}>{t('카카오톡 인증')}</h4>
                              {authMethod === 'kakao' && <CheckCircle2 className="h-5 w-5 text-[#191919]" />}
                            </div>
                            <p className={cn("text-sm font-medium", authMethod === 'kakao' ? "text-slate-700" : "text-slate-500")}>{t("카카오페이 지갑 이용자 추천")}</p>
                          </div>
                        </div>
                      </div>

                      <Button id="step4-submit-btn" onClick={handleInitiateAuth} className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 요청하기')}
                      </Button>

                      <div className="text-center">
                        <button
                          onClick={() => setHasCertificate(false)}
                          className="text-sm font-bold text-slate-400 hover:text-slate-600 underline transition-colors"
                        >
                          {t('인증서가 없으신가요? (추천)')}
                        </button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            )}

            {step === 5 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                <CardHeader id="step5-top-anchor" className="text-center py-12 bg-slate-50/50 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(4); saveProgress(4); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className={cn("mx-auto h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg overflow-hidden p-3", authMethod === 'app' ? "bg-white border-2 border-red-500" : authMethod === 'hana' ? "bg-white border-2 border-[#008485]" : "bg-white border-2 border-[#FEE500]")}>
                    <Image
                      src={authMethod === 'app' ? "/images/logo/pass.png" : authMethod === 'hana' ? "/images/logo/hana_1q.png" : "/images/logo/kakao.png"}
                      alt="Auth Method"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900">{t('Step 5: 인증 확인')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-10">
                  <div className="text-center space-y-8 py-4">
                    {!authSession ? (
                      <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center py-12 gap-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <Loader2 className="h-16 w-16 animate-spin text-primary" />
                          <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">{authMethod === 'app' ? t("PASS 앱 인증 요청 중...") : authMethod === 'hana' ? t("하나은행 인증 요청 중...") : t("카카오톡 인증 요청 중...")}</h2>
                            <p className="text-slate-500 font-bold">{t("잠시만 기다려 주세요.")}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900">{t("휴대폰에서 '확인'을 눌러주세요")}</h2>
                        <p className="text-lg font-bold text-slate-500 whitespace-pre-line">{authMethod === 'app' ? t("PASS 앱 알림 또는 문자를 확인한 뒤\n아래 버튼을 눌러주세요.") : authMethod === 'hana' ? t("하나은행 앱(하나원큐) 알림을 확인한 뒤\n아래 버튼을 눌러주세요.") : t("카카오 지갑 알림을 확인한 뒤\n아래 버튼을 눌러주세요.")}</p>
                      </div>
                    )}
                  </div>

                  {authSession && (
                    <div className="space-y-6">
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-6 w-6 text-amber-500" />
                          <h4 className="text-lg font-black text-slate-900">{t('인증 알림이 오지 않나요?')}</h4>
                        </div>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                          {t('외국 국적자는 통신사에 등록된 이름이 신분증과 다른 경우가 많습니다. 알림이 오지 않는다면 AI가 제안해 준 추천 성명을 하나씩 시도해 보세요.')}
                        </p>

                        <div id="step5-auth-guide-container" className="pt-2 space-y-4">
                          {true ? (
                            <div className="space-y-4">
                              <EmbeddedAuthGuide authMethod={authMethod} />
                              {language !== 'ko' && preFilterEstimate >= 400000 && (
                                <div className="p-4 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t('VIP 전용 라이브 헬프')}</p>
                                  <p className="text-sm font-bold text-slate-600">
                                    {t('예상 환급액이 {amount}원이나 됩니다! 인증이 막히셨다면 전문 상담원이 즉시 도와드려요.', { amount: preFilterEstimate.toLocaleString() })}
                                  </p>
                                </div>
                              )}
                              {preFilterEstimate >= 400000 && (
                                <Button
                                  onClick={() => setIsVipChatOpen(true)}
                                  className="w-full h-16 bg-slate-900 text-white hover:bg-slate-800 text-lg font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
                                >
                                  <MessageSquare className="h-6 w-6 text-amber-400 animate-bounce" /> {t('실시간 전문 상담원 채팅 시작')}
                                </Button>
                              )}
                            </div>
                          ) : null}

                          {/* AI OCR 이름 추출 섹션 */}
                          <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-blue-500" />
                              <h4 className="font-black text-blue-900">{t('ai_name_check_title')}</h4>
                            </div>
                            <p className="text-xs font-bold text-blue-700/70 leading-relaxed">
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
                                  className="w-full h-14 border-blue-200 text-blue-600 hover:bg-blue-100/50 rounded-2xl flex items-center justify-center gap-2"
                                  disabled={isOcrLoading}
                                >
                                  {isOcrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                  {isOcrLoading ? t('analyzing_screenshot') : t('upload_screenshot')}
                                </Button>
                              </div>
                            ) : (
                              <div className="p-4 bg-white rounded-2xl border border-blue-200 space-y-4 animate-in zoom-in-95 duration-300">
                                <div className="text-center space-y-1">
                                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{t('ocr_result_title')}</p>
                                  <p className="text-xl font-black text-slate-900">"{ocrResult.extractedName}"</p>
                                </div>
                                <p className="text-xs font-bold text-slate-500 text-center">
                                  {ocrResult.recommendation}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button variant="ghost" onClick={() => setOcrResult(null)} className="rounded-xl h-12 font-bold text-slate-400">
                                    {t('다시 인증')}
                                  </Button>
                                  <Button onClick={applyOcrName} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-black shadow-lg shadow-blue-200">
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

                  <Button id="step5-submit-btn" onClick={handleFinalVerifyAndAnalyze} className="w-full h-20 bg-primary text-2xl font-black rounded-3xl shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 완료 및 데이터 분석')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 6 && !analysisError && (
              <Card className="premium-card rounded-2xl sm:rounded-[3rem] border-none shadow-2xl py-12 sm:py-32 text-center bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
                  <div className="h-full bg-primary animate-[loading_3s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
                <CardContent className="space-y-12">
                  <div className="relative mx-auto w-32 h-32">
                    <Database className="h-32 w-32 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-ping" />
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black font-headline text-primary tracking-tight">{t('데이터를 분석 중입니다.')}</h2>
                      <p className="text-slate-400 font-bold">{t('잠시만 기다려 주세요.')}</p>
                    </div>

                    <div className="max-w-[360px] mx-auto space-y-6 text-left border-l-2 border-primary/20 pl-8 py-2">
                      {/* Step 1: 국세청 홈택스 보안 터널 연결 */}
                      <div className={cn(
                        "flex items-center gap-4 font-bold transition-all duration-300",
                        loadProgress > 0 ? "text-emerald-400" : "text-white animate-pulse"
                      )}>
                        {loadProgress > 0 ? (
                          <CheckCircle2 className="h-6 w-6 shrink-0" />
                        ) : (
                          <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                        )}
                        <span className="text-lg">{t('국세청 홈택스 보안 터널을 연결하는 중...')}</span>
                      </div>

                      {/* Step 2: 최근 5개년 근로소득 납부 세액 조회 */}
                      <div className={cn(
                        "flex items-center gap-4 font-bold transition-all duration-300",
                        loadProgress > 1 ? "text-emerald-400" : loadProgress === 1 ? "text-white animate-pulse" : "text-slate-500"
                      )}>
                        {loadProgress > 1 ? (
                          <CheckCircle2 className="h-6 w-6 shrink-0" />
                        ) : loadProgress === 1 ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                        ) : (
                          <div className="relative h-6 w-6 flex items-center justify-center shrink-0">
                            <div className="absolute h-full w-full bg-white/5 rounded-full" />
                            <Database className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-lg">{t('최근 5개년 근로소득 납부 세액 조회 중...')}</span>
                      </div>

                      {/* Step 3: 중소기업 취업자 감면 자격 조회 */}
                      <div className={cn(
                        "flex items-center gap-4 font-bold transition-all duration-300",
                        loadProgress > 2 ? "text-emerald-400" : loadProgress === 2 ? "text-white animate-pulse" : "text-slate-500"
                      )}>
                        {loadProgress > 2 ? (
                          <CheckCircle2 className="h-6 w-6 shrink-0" />
                        ) : loadProgress === 2 ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                        ) : (
                          <div className="relative h-6 w-6 flex items-center justify-center shrink-0">
                            <div className="absolute h-full w-full bg-white/5 rounded-full" />
                            <Database className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-lg">{t('중소기업 취업자 감면 자격(취업 당시 연령 및 기간) 조회 중...')}</span>
                      </div>

                      {/* Step 4: 최종 예상 환급금 보고서 분석 및 생성 */}
                      <div className={cn(
                        "flex items-center gap-4 font-bold transition-all duration-300",
                        loadProgress > 3 ? "text-emerald-400" : loadProgress === 3 ? "text-white animate-pulse" : "text-slate-500"
                      )}>
                        {loadProgress > 3 ? (
                          <CheckCircle2 className="h-6 w-6 shrink-0" />
                        ) : loadProgress === 3 ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                        ) : (
                          <div className="relative h-6 w-6 flex items-center justify-center shrink-0">
                            <div className="absolute h-full w-full bg-white/5 rounded-full" />
                            <Database className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-lg">{t('최종 예상 환급금 보고서 분석 및 생성 중...')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 6 && analysisError && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-6 sm:py-12 bg-red-50/50 border-b border-red-100">
                  <div className="mx-auto h-20 w-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <SearchX className="h-10 w-10 text-red-500" />
                  </div>
                  <CardTitle className="text-3xl font-black text-slate-900">{t('AI 오류 진단 리포트')}</CardTitle>
                  <CardDescription className="font-bold text-red-500">{analysisError.title}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-10 space-y-6 sm:space-y-10">
                  <div className="space-y-8">
                    {analysisError.code === "NAME_MISMATCH" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('신분증상 성함')}</p>
                          <p className="text-xl font-black text-slate-900">{formData.officialName}</p>
                        </div>
                        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 relative overflow-hidden">
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">{t('현재 시도한 성함')}</p>
                          <p className="text-xl font-black text-red-600">{formData.authName}</p>
                          <div className="absolute top-2 right-2 opacity-20 rotate-12">
                            <SearchX className="h-8 w-8 text-red-500" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h4 className="font-black text-slate-900">{t('분석된 원인 (Cause)')}</h4>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">{analysisError.reason}</p>
                    </div>

                    <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-primary" />
                        <h4 className="font-black text-primary">{t('해결책 (Solution)')}</h4>
                      </div>
                      <p className="text-slate-700 font-bold leading-relaxed">{analysisError.solution}</p>

                      {analysisError.code === "NAME_MISMATCH" && nameSuggestions.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-primary/10 space-y-4">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('다른 이름 조합으로 바로 시도하기')}</p>
                          <div className="grid grid-cols-1 gap-3">
                            {nameSuggestions.filter(s => s.name !== formData.authName).map((s, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, authName: s.name }));
                                  setAnalysisError(null);
                                  setStep(4);
                                  navigator.clipboard.writeText(s.name);
                                  toast({
                                    title: t("이름 복사 완료"),
                                    description: t("'{name}'이(가) 클립보드에 복사되었습니다. 다른 조합으로 다시 인증을 요청하세요.", { name: s.name })
                                  });
                                }}
                                className="h-16 justify-between px-6 bg-white border-primary/20 hover:border-primary text-slate-700 font-black rounded-2xl group transition-all"
                              >
                                <span className="text-lg">{s.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-primary/60 group-hover:text-primary transition-colors">{t(s.label)}</span>
                                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {analysisError.isHighValue && (
                      <Button
                        asChild
                        className="w-full h-20 bg-primary text-xl font-black rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                      >
                        <a href="https://pf.kakao.com/_xxxx" target="_blank">
                          <MessageCircle className="h-7 w-7" /> {t('전문 상담원에게 도움받기')}
                        </a>
                      </Button>
                    )}

                    {!analysisError.isHighValue && (
                      <Button
                        variant="outline"
                        onClick={() => setIsGuideOpen(true)}
                        className="w-full h-20 border-primary text-primary hover:bg-primary/5 text-xl font-black rounded-3xl shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                      >
                        <Sparkles className="h-7 w-7" /> {t('AI 자가 해결 가이드 보기')}
                      </Button>
                    )}

                    <Button
                      onClick={() => setStep(3)}
                      variant={analysisError.isHighValue ? "outline" : "default"}
                      className={cn(
                        "w-full h-20 text-xl font-black rounded-3xl shadow-xl transition-all hover:scale-[1.02]",
                        analysisError.isHighValue ? "border-slate-200 text-slate-600" : "bg-slate-900 text-white"
                      )}
                    >
                      {t('이름 조합 다시 선택하기 (Step 3)')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setStep(4)}
                      className="w-full h-14 font-bold text-slate-400 hover:text-slate-600"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> {t('인증 방식 다시 선택하기')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 7 && !result && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white p-8 sm:p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                <h3 className="text-xl font-bold text-slate-800">{t('환급 결과를 복구하는 중입니다...')}</h3>
                <p className="text-sm text-slate-400 mt-2">{t('잠시만 기다려 주세요.')}</p>
              </Card>
            )}

            {step === 7 && result && (
              <Card className="premium-card rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center py-8 sm:py-16 bg-slate-50/50 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(4); saveProgress(4); }}
                    className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <div className={`mx-auto h-24 w-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl ${result.caseType === 'A' ? 'bg-yellow-400' : 'bg-slate-400'}`}>
                    {result.caseType === 'A' ? <Trophy className="h-12 w-12 text-white" /> : <Info className="h-12 w-12 text-white" />}
                  </div>
                  <CardTitle className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black font-headline text-slate-900 leading-tight">
                    {t(result.message, { amount: `₩${result.refundEstimate?.toLocaleString()}` })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 sm:space-y-16 py-8 sm:py-16 px-4 sm:px-10">
                  {result.caseType === 'A' && (
                    <div className="text-center space-y-10">
                      <div className="space-y-4">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t('최종 예상 환급액')}</p>
                        <h2 className="text-7xl font-black text-[#fbbf24] font-headline">₩ {result.refundEstimate?.toLocaleString()}</h2>
                      </div>
                      <div className="max-w-md mx-auto space-y-4 text-left p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('연도별 상세 내역 (적격 여부 검증 완료)')}</p>
                        <div className="space-y-3">
                          {result.details?.map((detail: any, i: number) => (
                            <div key={i} className="flex justify-between items-center group">
                              <span className="text-lg font-black text-slate-800">{detail.year}: ₩{detail.amount.toLocaleString()}</span>
                              <span className="text-[11px] font-bold text-slate-400">{detail.company}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {result.refundEstimate === 0 ? (
                    <div className="space-y-6 text-center">
                      <p className="text-lg lg:text-xl font-bold text-slate-500 py-8 px-4 bg-slate-50 rounded-3xl border border-slate-100 leading-relaxed shadow-sm">
                        {t('올해 한국에서 근로하며 세금을 더 납부하신 후, 내년에 이지택스를 통해 다시 조회해 보세요.')}
                      </p>
                      <Button onClick={() => {
                        if (draftAppId) {
                          updateDoc(doc(db, 'applications', draftAppId), { status: 'ZeroRefund', lastStep: 7 });
                        }
                        router.push('/');
                      }} className="w-full h-24 bg-slate-200 hover:bg-slate-300 text-slate-700 text-2xl lg:text-3xl font-black rounded-[2rem] shadow-sm flex items-center justify-center gap-4 transition-all hover:scale-[1.02]">
                        <ArrowLeft className="h-8 w-8 text-slate-500" /> {t('홈으로 돌아가기')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      id="step7-submit-btn"
                      onClick={async () => {
                        setIsIdGenerating(true);
                        const idRes = await handleAutoGenerateAndCheckHometaxId();
                        setIsIdGenerating(false);
                        if (idRes && idRes.success) {
                          setStep(8);
                          saveProgress(8);
                        }
                      }}
                      disabled={isIdGenerating}
                      className="w-full h-24 bg-slate-900 text-2xl lg:text-3xl font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {isIdGenerating ? (
                        <>
                          <Loader2 className="animate-spin h-10 w-10 text-white" />
                          <span>{t('보안 계정 생성 중...')}</span>
                        </>
                      ) : (
                        <>
                          {t('지금 환급 신청하기')} <ArrowRight className="h-10 w-10 text-white" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 8 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(7); saveProgress(7); }}
                    className="absolute top-6 left-6 text-white/40 hover:text-white font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <CardTitle className="text-3xl font-black font-headline">{t('Step 8: 대한민국 국세청 회원가입 대행')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-4 sm:p-10">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <p className="text-slate-600 font-bold text-base leading-relaxed">
                      {t('안전한 대한민국 국세청 회원가입 대행 및 환급금 지급 현황 모니터링을 위해 국세청 보안 계정을 생성합니다. 아래의 본인 확인 인증(SMS)을 완료하시면 가입 절차가 자동으로 완료됩니다.')}
                    </p>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">{t('국세청 자동 생성 ID')}</span>
                      {isIdChecking ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-primary">{t('중복 확인 중...')}</span>
                        </div>
                      ) : isIdDuplicateChecked ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 text-sm rounded-lg flex items-center gap-1">
                          <BadgeCheck className="h-4 w-4" /> {hometaxId}
                        </Badge>
                      ) : (
                        <span className="text-sm font-bold text-red-500">{t('ID 미생성')}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                      {t('* 국세청 가입 정보는 당사 이용약관 및 개인정보 처리방침의 \'국세청 가입 대행 및 계정 관리\' 조항에 따라 안전하게 암호화 관리됩니다.')}
                    </p>
                  </div>

                  {!isSmsRequested ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-semibold">
                        {t('휴대폰 본인인증(SMS) 문자를 발송하여 회원가입을 완료합니다. 본인 명의의 휴대폰 번호로 인증을 시도해 주세요.')}
                      </div>
                      <Button
                        id="step8-signup-request-btn"
                        onClick={handleRequestSignupSms}
                        disabled={loading || isIdChecking || !isIdDuplicateChecked}
                        className="w-full h-24 bg-slate-900 text-2xl font-black rounded-[2rem] shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증문자 발송하기')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-black text-slate-700 ml-1">{t('인증번호 6자리 입력')}</Label>
                          <span className="text-sm font-black text-primary mr-1">
                            {formatTimer(smsTimer)}
                          </span>
                        </div>
                        <input
                          id="step8-sms-code-input"
                          placeholder={t('인증번호 6자리를 입력하세요')}
                          maxLength={6}
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value)}
                          className="h-16 rounded-2xl font-black bg-slate-50 border-none px-6 text-lg w-full text-center tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <Button
                        id="step8-signup-complete-btn"
                        onClick={handleCompleteSignup}
                        disabled={isVerifyingSms || smsCode.length !== 6}
                        className="w-full h-24 bg-primary text-3xl font-black rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all disabled:opacity-50"
                      >
                        {isVerifyingSms ? <Loader2 className="animate-spin h-8 w-8" /> : t('인증 완료 및 가입 대행')}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleRequestSignupSms}
                          disabled={loading}
                          className="text-sm font-bold text-slate-400 hover:text-slate-600 hover:underline"
                        >
                          {t('인증문자 다시 받기')}
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 9 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(8); saveProgress(8); }}
                    className="absolute top-6 left-6 text-white/40 hover:text-white font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <CardTitle className="text-3xl font-black font-headline">{t('Step 9: 환급 계좌 등록 및 1원 인증')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-10 p-4 sm:p-10">
                  <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6">
                    <div className="flex justify-between items-center"><span className="font-bold text-slate-400">{t('총 환급 예정액')}</span><span className="text-2xl font-black text-slate-900">₩ {result?.refundEstimate?.toLocaleString() || 0}</span></div>
                    <Separator className="bg-slate-200" />
                    <div className="flex justify-between items-center"><span className="font-black text-slate-900 text-xl">{t('환급액 입금후 수수료(성과보수 25%)')}</span><span className="text-3xl font-black text-primary">₩ {(Math.floor((result?.refundEstimate || 0) * 0.25)).toLocaleString()}</span></div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 rounded-3xl p-8 shadow-sm">
                    <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                    <div className="ml-4">
                      <AlertTitle className="text-amber-800 font-black text-lg mb-2">{t('Legal Policy (후불 정산 및 CMS 자동 출금 동의)')}</AlertTitle>
                      <AlertDescription className="text-amber-700 font-bold text-base leading-relaxed">
                        {t("지금 결제되는 금액은 0원입니다. 25% 이용료는 고객님 통장으로 국세청 환급금이 입금된 것이 확인된 이후에만 등록하신 이 계좌에서 출금(정산)됩니다. 환급금이 없거나 거절되는 경우 청구 금액은 0원이며 수수료는 발생하지 않습니다. 국세청 환급계좌 유효성 검증 및 CMS 출금 동의를 위해 본인 계좌 1원 송금 인증이 필요합니다.")}
                      </AlertDescription>
                    </div>
                  </Alert>

                  <div className="space-y-8">
                    <Label className="text-xl font-black text-slate-900">{t('계좌 정보 입력')}</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-black text-primary uppercase tracking-widest ml-1">{t('은행명')}</Label>
                        <Select open={bankSelectOpen} onOpenChange={setBankSelectOpen} onValueChange={(v) => setFormData({ ...formData, bankName: v })} value={formData.bankName}>
                          <SelectTrigger id="step9-bank-select" className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder={t("은행 선택")} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(BANK_LOGOS).map((bank) => (
                              <SelectItem key={bank} value={bank}>
                                <div className="flex items-center gap-3">
                                  {BANK_LOGOS[bank]}
                                  <span className="font-bold">{t(bank)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('계좌번호')}</Label>
                        <input
                          id="step9-account-input"
                          placeholder={t('계좌번호를 입력하세요')}
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          disabled={is1WonSent}
                          className="h-16 rounded-2xl font-bold bg-slate-50 border-none px-6 text-lg w-full outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('예금주명')}</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(4);
                          }}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          {t('본인인증 다시 하기')} &rarr;
                        </button>
                      </div>
                      <input
                        id="step9-holder-input"
                        placeholder={t('계좌의 예금주 성함을 입력하세요')}
                        value={formData.accountHolder}
                        readOnly
                        disabled={is1WonSent}
                        className="h-16 rounded-2xl font-bold bg-slate-100 border-none px-6 text-lg w-full outline-none cursor-not-allowed opacity-80"
                      />
                      <p className="text-xs font-bold text-slate-400 ml-1">
                        {t('* 타인 계좌 무단 도용 방지를 위해 본인인증 성명({name})과 동일한 예금주의 계좌만 등록 가능합니다.', { name: formData.authName || formData.officialName || '' })}
                      </p>
                    </div>
                  </div>

                  <Button
                    id="step9-next-btn"
                    onClick={handleGoToStep10}
                    disabled={!formData.bankName || !formData.accountNumber.trim()}
                    className="w-full h-24 bg-primary text-3xl font-black rounded-[2rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {t('확인 완료 및 다음 단계')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 10 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStep(9); saveProgress(9); }}
                    className="absolute top-6 left-6 text-white/40 hover:text-white font-bold flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('이전')}
                  </Button>
                  <CardTitle className="text-2xl sm:text-3xl font-black font-headline">{t('Step 10: 최종 수임 동의')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-10 p-4 sm:p-10">
                  <Alert className="bg-primary/5 border-primary/20 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <BadgeCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <AlertTitle className="text-xl font-black text-slate-900">{t('환급 신청 완료 안내')}</AlertTitle>
                        <AlertDescription className="text-slate-600 font-bold text-base leading-relaxed">
                          {t('환급 신청 후 대한민국 국세청에 환급되기 까지는 45일에서 60일 정도 소요 될 수 있습니다.')} <span className="text-primary font-black">{t('환급 과정은 나의 환급 진행사항에서 실시간으로 확인하실 수 있으며, 필요에 따라 추가 증빙 서류가 필요할 수 있습니다.')}</span>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>

                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 shadow-inner">
                    <h3 className="font-black text-slate-800 text-lg">{t('등록된 환급 및 정산 계좌')}</h3>
                    <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      {BANK_LOGOS[formData.bankName] || <CreditCard className="h-8 w-8 text-slate-400" />}
                      <div>
                        <p className="font-black text-slate-900 text-lg">{t(formData.bankName || '등록된 은행 없음')}</p>
                        <p className="text-base font-bold text-slate-500">{formData.accountNumber} (예금주: {formData.accountHolder})</p>
                      </div>
                    </div>
                  </div>

                  {/* 공식 수임 동의서 및 PDF 다운로드 */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 border border-blue-100 p-6 rounded-3xl gap-4">
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{t('공식 세무대리 수임 동의서 및 위임장')}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">{t('국세청 제출용 공식 양식으로, 기재된 정보와 서명이 자동으로 기입됩니다.')}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenDocument}
                      className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5 font-black rounded-2xl h-14 px-6 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <FileText className="h-5 w-5" />
                      {t('계약서 확인 및 PDF 다운로드')}
                    </Button>
                  </div>

                  <form onSubmit={handleFinalSubmit} className="space-y-10">
                    {/* CMS 동의 체크박스 영역 (숨김 처리 및 일괄 안내 대체) */}
                    <div className="hidden">
                      <Checkbox id="cms-consent-all" checked={cmsConsentAll} onCheckedChange={() => {}} />
                      <Checkbox id="cms-consent-1" checked={cmsConsent1} onCheckedChange={() => {}} />
                      <Checkbox id="cms-consent-2" checked={cmsConsent2} onCheckedChange={() => {}} />
                      <Checkbox id="cms-consent-3" checked={cmsConsent3} onCheckedChange={() => {}} />
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold text-slate-600 leading-relaxed space-y-3 shadow-inner">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-slate-700 font-bold">
                          {t('아래 [서명 적용 및 환급 신청하기] 버튼을 누르시면, 개인정보 수집 및 이용 동의, 제3자 제공 동의, 금융거래정보 제공 및 CMS 자동이체 출금동의 약관에 모두 명시적으로 동의하시는 것으로 간주됩니다.')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pl-9 pt-1 text-xs">
                        <button type="button" onClick={() => setCmsModalOpen1(true)} className="text-primary hover:underline font-bold">{t('개인정보 수집/이용 약관 보기')} &rarr;</button>
                        <button type="button" onClick={() => setCmsModalOpen2(true)} className="text-primary hover:underline font-bold">{t('제3자 제공 동의 약관 보기')} &rarr;</button>
                        <button type="button" onClick={() => setCmsModalOpen3(true)} className="text-primary hover:underline font-bold">{t('CMS 출금동의 약관 보기')} &rarr;</button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-xl font-black text-slate-900">{t('전자서명 (세무 대리 수임 동의)')}</Label>
                        {isSigned && (
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                          >
                            {t('다시 그리기')}
                          </button>
                        )}
                      </div>
                      <div 
                        id="step10-signature-canvas"
                        className="border-2 border-dashed border-slate-200 rounded-[2rem] p-4 bg-white shadow-inner relative overflow-hidden h-[200px]"
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
                        <p className="text-xs font-bold text-red-500 animate-pulse ml-1">
                          {t('위 상자에 직접 서명을 완료해야 신청이 가능합니다.')}
                        </p>
                      )}
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 leading-relaxed space-y-2">
                      <p>{t('본 서비스는 세무 분석 솔루션 프로그램을 제공하는 플랫폼으로, 실제 세무 신고 및 대행 업무는 제휴된 대한민국 국가공인 전문 세무법인/세무사를 통해 적법하게 처리됩니다.')}</p>
                      <p>{t('이지택스환급(Easy Tax Refund)은 세무대리 신고를 직접 수행하지 않으며, 본 플랫폼에서 작성된 신청 서류는 제휴 세무사를 통해 최종 검토 및 제출됩니다.')}</p>
                    </div>

                    <Button id="step10-submit-btn" type="submit" className="w-full h-24 bg-slate-900 text-2xl lg:text-3xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02]" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin h-8 w-8" /> : t('서명 적용 및 환급 신청하기')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 11 && (
              <Card className="premium-card rounded-2xl sm:rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="text-center py-6 sm:py-12 bg-slate-900 text-white relative">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><ShieldCheck className="h-64 w-64 text-primary" /></div>
                  <div className="mx-auto h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl sm:text-4xl font-black font-headline tracking-tight px-4 leading-tight">
                    {t('신청이 성공적으로 접수되었습니다')}
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-sm mt-3">
                    {t('전문 세무사가 검토를 시작합니다. 1~2개월 이내에 환급금이 지급됩니다.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-12 text-center space-y-4 sm:space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-lg font-black text-slate-800">{t('환급금 신청 내역 확인')}</p>
                    <div className="mt-4 space-y-2 text-left text-sm text-slate-600 font-bold">
                      <div className="flex justify-between">
                        <span>{t('신청인')}</span>
                        <span>{formData.officialName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('지급 은행')}</span>
                        <span>{formData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('계좌 번호')}</span>
                        <span>{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('예상 환급금')}</span>
                        <span className="text-primary font-black">₩ {result?.refundEstimate?.toLocaleString() || preFilterEstimate.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setStep(0)} className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl">
                    {t('시뮬레이션 다시 하기')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 100% 안전 보장 안내 (Step >= 1) */}
            {step >= 1 && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-[1.8rem] p-5 flex items-start gap-4 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                  <ShieldCheck className="h-6 w-6 text-emerald-600 animate-pulse" />
                </div>
                <div className="space-y-1.5 text-left leading-normal">
                  <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <span>{t('🔒 100% 안전한 금융권 수준 개인정보 보안 보장')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-normal">
                    {t('이지택스환급은 정보보호 표준(ISO 27001)을 준수하며, 모든 데이터는 국세청 매칭 즉시 256-bit AES 암호화되어 전송됩니다. 입력하신 정보는 환급금 조회 목적 이외에 절대 사용되거나 서버에 저장되지 않습니다.')}
                  </p>
                </div>
              </div>
            )}

            {/* Global App Install / In-App Browser Escape Banner (Visible across all steps) */}
            <div className="flex flex-col gap-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 shadow-md w-full mx-auto relative overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="absolute -top-4 -right-4 p-4 opacity-5"><Smartphone className="h-32 w-32" /></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <p className="text-[15px] font-black text-blue-950 tracking-tight">
                    {isInAppBrowser
                      ? t("더 빠르고 편하게 환급받기 (기본 브라우저 권장)")
                      : t("더 빠르고 편하게 환급받기 (앱 바로 설치)")}
                  </p>
                  <p className="text-[11px] font-bold text-blue-800/80 leading-snug">
                    {isInAppBrowser
                      ? t("현재 화면에서는 환급 기능이 제한될 수 있습니다. 아래 버튼을 눌러 기본 브라우저로 쾌적하게 진행해 보세요.")
                      : t("1초 만에 앱을 설치하고 다음부터는 아이콘 터치 한 번으로 내 환급금을 확인하세요!")}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleInstallApp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-14 shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-1 relative z-10 text-base"
              >
                {isInAppBrowser ? (
                  <><ArrowRight className="h-5 w-5" /> {t("기본 브라우저 열기 (앱 설치)")}</>
                ) : (
                  <><Download className="h-5 w-5" /> {t("내 휴대폰에 이지텍스 앱 설치하기")}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* VIP 전용 플로팅 채팅 버튼 */}
      {(preFilterEstimate >= 400000 || showProactiveHelp) && !isVipChatOpen && !isGuideOpen && !isAuthGuideOpen && !isKakaoGuideOpen && !isKakaoAuthGuideOpen && !isHanaGuideOpen && (
        <div className="fixed bottom-6 right-6 z-[60] animate-bounce-subtle flex flex-col items-end gap-3">
          {showProactiveHelp && (
            <div className="bg-slate-900 text-white text-sm font-bold p-4 rounded-2xl rounded-br-none shadow-xl max-w-[260px] animate-in slide-in-from-bottom-2 fade-in duration-500 relative cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsVipChatOpen(true)}>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-amber-400 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/20">
                  <Lightbulb className="h-4 w-4 text-amber-950" />
                </div>
                <p className="leading-relaxed">{t('개인정보 입력이 망설여지시나요? 전담 세무 매니저와 먼저 대화해 보세요.')}</p>
              </div>
              <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-slate-900 border-r-[8px] border-r-transparent" />
            </div>
          )}
          <Button
            onClick={() => setIsVipChatOpen(true)}
            className="h-20 w-20 rounded-full bg-amber-400 text-amber-950 shadow-2xl flex items-center justify-center hover:bg-amber-500 hover:scale-110 transition-all border-4 border-white group relative"
          >
            <MessageSquare className="h-10 w-10 text-amber-950" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-7 w-7 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* VIP 실시간 1:1 채팅 다이얼로그 */}
      <Dialog open={isVipChatOpen} onOpenChange={setIsVipChatOpen}>
        <DialogContent className="sm:max-w-[450px] h-[650px] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white z-[120]">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <Button variant="ghost" size="icon" onClick={() => setIsVipChatOpen(false)} className="text-white/50 hover:text-white rounded-full">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                <Trophy className="h-8 w-8 text-amber-950" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black">{t('실시간 VIP 전문 세무사 상담')}</DialogTitle>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE • EXPERT CONNECTED</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-6 bg-slate-50">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <div className="flex justify-start">
                  <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-sm font-bold text-slate-700 max-w-[85%] leading-relaxed">
                    {t('안녕하세요! 예상 환급액이 매우 큰 고액 자산가님으로 감지되어 전문 상담원 채팅 세션이 열렸습니다. 인증이나 서류 접수에 어려움이 있다면 무엇이든 물어봐 주세요.')}
                  </div>
                </div>

                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.sender === 'User' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "relative p-5 rounded-2xl shadow-sm text-sm font-bold max-w-[85%] leading-relaxed whitespace-pre-wrap",
                      msg.sender === 'User'
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    )}>
                      {msg.sender === 'User' ? msg.text : (msg.translatedText || msg.text)}
                      {msg.sender === 'User' && msg.translatedText && (
                        <div className="mt-2 text-[10px] opacity-60 font-medium italic border-t border-white/20 pt-2">
                          Admin see: {msg.translatedText}
                        </div>
                      )}
                      {msg.sender !== 'User' && msg.translatedText && (
                        <div className="mt-2 text-[10px] text-slate-400 font-medium italic border-t border-slate-50 pt-2">
                          {t('원문')}: {msg.text}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {!isChatInputVisible && (
                  <div className="mt-8 flex flex-col gap-2 pb-4">
                    <div className="text-[11px] font-black text-slate-400 mb-1 px-2 uppercase tracking-wider">{t('자주 묻는 질문 (FAQ)')}</div>
                    {FAQ_REPLIES.map((faq, i) => (
                      <div key={i} className="flex flex-col">
                        <button
                          onClick={() => handleQuickReply(i)}
                          className={cn(
                            "bg-white border text-left p-4 text-sm font-bold shadow-sm transition-all flex justify-between items-center group w-full",
                            expandedFaqIndex === i 
                              ? "border-amber-400 text-amber-900 rounded-t-2xl rounded-b-none" 
                              : "border-slate-200 text-slate-700 rounded-2xl hover:border-amber-400 hover:shadow-md active:scale-95"
                          )}
                        >
                          <span className="flex-1 pr-4">{t(faq.title)}</span>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-300 shrink-0",
                            expandedFaqIndex === i ? "rotate-90 text-amber-500" : "text-slate-300 group-hover:text-amber-500"
                          )} />
                        </button>
                        {expandedFaqIndex === i && (
                          <div className="bg-slate-50 border border-t-0 border-amber-400 rounded-b-2xl p-5 text-sm font-bold text-slate-700 whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200 shadow-inner">
                            {t(faq.content)}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="pt-2">
                      <button
                        onClick={handleConnectAdmin}
                        className="bg-slate-900 border border-slate-900 text-white p-4 rounded-2xl text-left text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-95 flex justify-between items-center w-full"
                      >
                        <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-2" />{t('상담원과 직접 채팅하기')}</span>
                        <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                <div ref={chatScrollRef} />
              </div>
            </ScrollArea>
          </div>

          {isChatInputVisible && (
            <form onSubmit={handleSendVipMessage} className="p-6 bg-white border-t border-slate-100 flex gap-3 z-20 relative">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t('상담 내용을 입력하세요...')}
                className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold"
              />
              <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl bg-amber-400 hover:bg-amber-500 shadow-lg shadow-amber-200" disabled={isChatLoading}>
                <Send className="h-6 w-6 text-amber-950" />
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 수임 동의서 공식 문서 뷰어 */}
      <Dialog open={isDocumentOpen} onOpenChange={setIsDocumentOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white z-[150]">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 print-hidden">
            <div>
              <DialogTitle className="text-2xl font-black text-white">{t('소득세 환급 자동 분석 솔루션 이용 및 후불 정산 계약서')}</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">{t('플랫폼 서비스 이용 및 CMS 자동이체 출금 동의를 규정하는 법적 계약서입니다.')}</DialogDescription>
            </div>
            <div className="flex gap-4">
              <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95">
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
                <h1 className="text-4xl font-black underline underline-offset-8 text-slate-900">{t('소득세 환급 자동 분석 솔루션 이용 및 후불 정산 계약서')}</h1>
                <p className="text-sm text-slate-500 font-bold">{t('(중소기업 취업자 소득세 감면 및 경정청구 지원 서비스)')}</p>
              </div>

              <div className="space-y-8 pt-8 text-lg leading-relaxed text-justify text-slate-855">
                
                {/* 제1조 */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">{t('제1조 (목적)')}</h3>
                  <p>
                    {t("본 계약은 위임인(이하 '이용자')이 더윤컴퍼니(이하 '회사')가 제공하는 '이지택스환급(Easy Tax Refund)' 세무 분석 솔루션 프로그램을 이용하고, 이에 따른 플랫폼 이용료(수수료)를 환급 성공 후 후불 정산 및 CMS 자동이체 방식으로 지불하기 위한 조항 및 출금 동의 사항을 규정함을 목적으로 합니다.")}
                  </p>
                </div>

                {/* 제2조 */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">{t('제2조 (계약 당사자 정보)')}</h3>
                  
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
                        <span className="font-bold text-slate-900">{t('더윤컴퍼니')}</span>
                      </div>
                      <div className="flex border-b border-slate-100 py-1">
                        <span className="w-40 font-black text-slate-500">{t('대표자')}</span>
                        <span className="font-bold text-slate-900">{t('김홍일')}</span>
                      </div>
                      <div className="flex border-b border-slate-100 py-1 col-span-2">
                        <span className="w-40 font-black text-slate-500">{t('사업자등록번호')}</span>
                        <span className="font-bold text-slate-900">105-12-78126 {t('(통신판매업 신고번호: 제 2023-진접오남-0680호)')}</span>
                      </div>
                      <div className="flex border-b border-slate-100 py-1 col-span-2">
                        <span className="w-40 font-black text-slate-500">{t('소재지')}</span>
                        <span className="font-bold text-slate-900">{t('경기도 남양주시 부평로 48번길 140, 107-1102')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 제3조 */}
                <div className="space-y-2 pt-4">
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">{t('제3조 (플랫폼 서비스 이용료 및 후불 정산 조건)')}</h3>
                  <div className="space-y-2 pl-4 text-base text-slate-800">
                    <p>
                      <strong>{t('서비스 이용료')}:</strong> {t('이용자는 본 솔루션을 통해 국세청으로부터 최종 지급받는 환급 금액의 25% (부가세 포함)를 플랫폼 서비스 이용료로 회사에 지급합니다.')}
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
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">{t('제4조 (CMS 자동이체 출금 동의)')}</h3>
                  <p>
                    {t('이용자는 국세청 환급금 입금 확인 후, 회사가 제휴 CMS 대행기관(효성CMS 등) 및 금융결제원을 통해 등록된 본인 계좌에서 제3조에 따른 이용료(환급액의 25%)를 자동으로 인출(출금)하는 것에 동의합니다.')}
                  </p>
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-900">{t('출금 동의 내역:')}</h4>
                    <div className="grid grid-cols-2 gap-y-2 pl-4 text-base">
                      <div className="flex border-b border-slate-100 py-1">
                        <span className="w-40 font-black text-slate-500">{t('이용기관명')}</span>
                        <span className="font-bold text-slate-900">{t('더윤컴퍼니')}</span>
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
                        <span className="font-bold text-slate-900">{t('국세청 실지급 환급액의 25% 상당액')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 제5조 */}
                <div className="space-y-2 pt-4">
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">{t('제5조 (개인정보 수집 및 제3자 제공 동의)')}</h3>
                  <p>
                    {t('회사는 CMS 자동이체 등록 및 출금 실행을 목적으로 금융결제원 및 제휴 CMS 기관(효성CMS 등)에 이용자의 개인정보(성명, 생년월일/외국인등록번호, 은행명, 계좌번호, 연락처)를 제공할 수 있으며, 이용자는 이에 동의합니다.')}
                  </p>
                  <p className="text-base text-slate-600">
                    {t('수집된 정보는 서비스 목적 달성 및 관련 법령(전자금융거래법 등)에 따른 의무 보관 기간(5년) 동안 안전하게 보관됩니다.')}
                  </p>
                </div>

                {/* 제6조 */}
                <div className="space-y-2 pt-4">
                  <h3 className="text-xl font-bold border-b border-slate-200 pb-2 text-slate-900">{t('제6조 (플랫폼의 역할 및 법적 책임 고지)')}</h3>
                  <p>
                    {t('더윤컴퍼니는 세무 분석 솔루션 프로그램을 제공하는 플랫폼 제공업자(통신판매업)로서, 이용자의 실제 세무 신고 대리 업무는 제휴된 대한민국 국가공인 전문 세무법인 및 세무사와의 협력을 통해 적법하게 대행 처리됩니다.')}
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
                  <h2 className="text-3xl font-black tracking-widest text-slate-900">{t('더윤컴퍼니 귀하')}</h2>
                </div>

              </div>
            </div>
          </div>
          <div className="p-8 border-t border-slate-100 flex justify-end print-hidden">
            <Button variant="outline" className="rounded-xl h-12 px-8 font-black text-slate-900 border-slate-200" onClick={() => setIsDocumentOpen(false)}>{t('닫기')}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <PassGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        optimizedNames={nameSuggestions}
        currentAuthName={formData.authName}
        officialName={formData.officialName}
        mode="full"
      />
      <PassGuideModal
        isOpen={isAuthGuideOpen}
        onClose={() => setIsAuthGuideOpen(false)}
        optimizedNames={nameSuggestions}
        currentAuthName={formData.authName}
        officialName={formData.officialName}
        mode="auth"
      />
      <KakaoGuideModal isOpen={isKakaoGuideOpen} onClose={() => setIsKakaoGuideOpen(false)} mode="registration" />
      <KakaoGuideModal isOpen={isKakaoAuthGuideOpen} onClose={() => setIsKakaoAuthGuideOpen(false)} mode="full" />
      <HanaGuideModal isOpen={isHanaGuideOpen} onClose={() => setIsHanaGuideOpen(false)} mode={hanaGuideMode} />

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
                  <p>• {t("출금 신청 금액")}: {t("국세청 실지급 환급액의 25% 상당액 (미환급 시 0원)")} {refundFee > 0 && `(₩${refundFee.toLocaleString()})`}</p>
                  <p>• {t("1회 최대 출금 한도")}: {refundFee > 0 ? `₩${refundFee.toLocaleString()}` : t("국세청 실지급 환급액의 25% 상당액")} {t("한도 (실제 청구서 기준)")}</p>
                  <p>• {t("출금 계좌")}: {t("등록된 본인 지정 계좌")}</p>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {t("* 본 출금 한도는 법적 등록을 위한 최대 상한선일 뿐이며, 환급이 성공하기 전까지는 0원도 출금되지 않으며 오직 확정된 서비스 이용료(25%)만 단 1회 출금됩니다.")}
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

      {/* Floating Developer Control Panel */}
      {isLocal && (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
          {!devPanelOpen ? (
            <button
              onClick={() => setDevPanelOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl border border-slate-700/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Sliders className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>🛠️ 시뮬레이션 제어판</span>
            </button>
          ) : (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 w-[360px] sm:w-[380px] rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-400" />
                  <span className="font-black text-sm tracking-wide text-slate-200">DEV SIMULATOR PANEL</span>
                </div>
                <button
                  onClick={() => setDevPanelOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Force Jump to Step 9 */}
                <div>
                  <Button
                    onClick={() => {
                      setFormData({
                        officialName: "홍길동 (GILDONG HONG)",
                        authName: "홍길동",
                        registrationNumber: "900101-5123456",
                        issueDate: "2020-01-01",
                        phone: "010-1234-5678",
                        carrier: "SKT",
                        otpCode: "123456",
                        bankName: "KB국민은행",
                        accountNumber: "123-456789-01-012",
                        cardNumber: "1234-5678-1234-5678",
                        expiryDate: "12/28",
                        cvc: "123",
                        depositorName: "홍길동",
                        accountHolder: "홍길동"
                      });
                      setResult({
                        refundEstimate: 2350000,
                        resIncomeTax: 2136363,
                        resCompanyIdentityNo1: "123-45-67890",
                        resAttrYear: "2024",
                        resIncomeSpecList: "[]",
                        caseType: "D",
                        details: [
                          { year: "2024", companyName: "(주)가상상사", incomeAmount: 30000000, taxAmount: 1500000, deductedAmount: 1500000, isEligible: true }
                        ]
                      });
                      setIs1WonVerified(true);
                      setIsSimulation(true);
                      setCmsConsent1(true);
                      setCmsConsent2(true);
                      setCmsConsent3(true);
                      setCmsConsentAll(true);
                      setStep(9);
                      saveProgress(9);
                      toast({
                        title: "9단계 강제 이동 완료",
                        description: "0.1초 만에 모크 데이터 주입 및 CMS 동의 테스트 화면으로 이동했습니다."
                      });
                    }}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>환급 9단계 즉시 이동 (CMS 테스트)</span>
                  </Button>
                </div>

                {/* Step pills */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">단계별 빠른 이동</label>
                  <div className="grid grid-cols-6 gap-1.5 text-center">
                    {[0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setIsSimulation(true);
                          setStep(s);
                          saveProgress(s);
                          toast({
                            title: `Step ${s} 이동`,
                            description: `수동으로 ${s}단계 화면으로 변경되었습니다.`
                          });
                        }}
                        className={cn(
                          "h-8 text-xs font-black rounded-lg transition-colors",
                          step === s
                            ? "bg-primary text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* isSimulation Toggle */}
                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-200">시뮬레이션 모드 (isSimulation)</span>
                    <span className="text-[10px] text-slate-400">활성화 시 실명/본인인증을 모킹합니다.</span>
                  </div>
                  <Checkbox
                    id="dev-sim-toggle"
                    checked={isSimulation}
                    onCheckedChange={(val) => {
                      setIsSimulation(!!val);
                      toast({
                        title: `시뮬레이션 모드 ${!!val ? "활성화" : "비활성화"}`,
                        description: `인증 및 API 호출이 ${!!val ? "가상 시뮬레이션" : "실제 API"}으로 동작합니다.`
                      });
                    }}
                    className="h-5 w-5 border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                </div>

                <div className="text-[10px] text-slate-500 leading-normal text-center pt-2 border-t border-slate-800">
                  인증 프로세스 우회 및 최종 9단계 CMS 서명 동의서 규제 준수(보기 팝업, 서명 가두기 및 전송 기능) 테스트용 도구입니다.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hometax Find ID Modal */}
      <Dialog open={findIdOpen} onOpenChange={setFindIdOpen}>
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
                    onChange={(e) => setFindIdForm({ ...findIdForm, name: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("외국인 등록번호 (주민번호)")}</Label>
                  <Input
                    value={findIdForm.regNo}
                    onChange={(e) => setFindIdForm({ ...findIdForm, regNo: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                    placeholder="yymmdd-5xxxxxx"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-400">{t("통신사")}</Label>
                    <Select
                      value={findIdForm.telecom}
                      onValueChange={(val) => setFindIdForm({ ...findIdForm, telecom: val })}
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
                      onChange={(e) => setFindIdForm({ ...findIdForm, phone: e.target.value })}
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
                    onClick={() => {
                      setHometaxId(findIdResult);
                      setFindIdOpen(false);
                      setAuthTab('login');
                    }}
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
                      onChange={(e) => setFindIdForm({ ...findIdForm, smsCode: e.target.value })}
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

      {/* Hometax Reset PW Modal */}
      <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
        <DialogContent className="max-w-[440px] rounded-[2.5rem] p-6 sm:p-8 border-none shadow-2xl bg-white overflow-hidden text-slate-900">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
          <DialogHeader className="space-y-3 pt-2">
            <DialogTitle className="text-2xl font-black text-center text-slate-900">
              {t("국세청 비밀번호 재설정")}
            </DialogTitle>
          </DialogHeader>

          {resetPwStep === 1 ? (
            <div className="space-y-4 mt-4">
              <p className="text-slate-500 text-xs font-bold leading-relaxed text-center break-keep">
                {t("새로운 비밀번호를 입력하고 휴대폰 본인인증을 진행해 주세요.")}
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("홈택스 아이디")}</Label>
                  <Input
                    value={resetPwForm.hometaxId}
                    onChange={(e) => setResetPwForm({ ...resetPwForm, hometaxId: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("성명 (통신사 등록명)")}</Label>
                  <Input
                    value={resetPwForm.name}
                    onChange={(e) => setResetPwForm({ ...resetPwForm, name: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("외국인 등록번호 (주민번호)")}</Label>
                  <Input
                    value={resetPwForm.regNo}
                    onChange={(e) => setResetPwForm({ ...resetPwForm, regNo: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                    placeholder="yymmdd-5xxxxxx"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-400">{t("통신사")}</Label>
                    <Select
                      value={resetPwForm.telecom}
                      onValueChange={(val) => setResetPwForm({ ...resetPwForm, telecom: val })}
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
                      value={resetPwForm.phone}
                      onChange={(e) => setResetPwForm({ ...resetPwForm, phone: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-400">{t("새로운 비밀번호")}</Label>
                  <Input
                    type="password"
                    value={resetPwForm.newPw}
                    onChange={(e) => setResetPwForm({ ...resetPwForm, newPw: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                    placeholder={t("영문, 숫자, 특수문자 조합 9~15자")}
                  />
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    {t("💡 영문(A-Z, a-z), 숫자(0-9), 특수문자(!@#$%^&*)를 필수 포함하여 9~15자로 설정하세요.")}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleRequestResetPwSms}
                disabled={resetPwLoading}
                className="w-full h-14 mt-2 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                {resetPwLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                {t("비밀번호 변경 인증요청")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <p className="text-slate-500 text-xs font-bold leading-relaxed text-center break-keep">
                {t("휴대폰으로 전송된 6자리 인증번호를 입력해 주세요.")}
              </p>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400">{t("인증번호 입력")}</Label>
                <Input
                  value={resetPwForm.smsCode}
                  onChange={(e) => setResetPwForm({ ...resetPwForm, smsCode: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold text-center tracking-widest text-lg"
                  maxLength={6}
                  placeholder="000000"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setResetPwStep(1)}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-bold border-slate-100"
                >
                  {t("이전")}
                </Button>
                <Button
                  onClick={handleVerifyResetPwSms}
                  disabled={resetPwLoading}
                  className="flex-[2] h-14 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800"
                >
                  {resetPwLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> : null}
                  {t("비밀번호 변경 및 조회")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 성함 확인 가이드 모달 */}
      {isNameHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 sm:p-10 space-y-8 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {t('내 이름이 통신사에 어떻게 등록되어 있나요?')}
                  </h2>
                  <p className="text-sm font-bold text-amber-600">
                    {t('대부분의 외국인 이름 오류는 띄어쓰기 한 칸 차이로 발생합니다.')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsNameHelpOpen(false)} className="rounded-full shrink-0">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-8">
                {/* Visual Guide Screenshot Placeholder */}
                <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-inner bg-slate-50 aspect-[4/3] relative group">
                  <img
                    src="/images/guide/name_check_guide.png"
                    alt="Carrier App Name Check Guide"
                    className="w-full h-full object-cover"
                  />
                  {/* Tooltip Overlay */}
                  <div className="absolute top-[30%] right-[12%] animate-in slide-in-from-right-10 fade-in duration-1000">
                    <div className="bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                      <div className="bg-white/20 p-1 rounded-full">
                        <Smartphone className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="opacity-70 text-[8px] uppercase tracking-tighter">{t('확인됨')}</span>
                        <span>{t('영어 이름 (English Name)')}</span>
                      </div>
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-emerald-500 ml-4 shadow-xl" />
                  </div>

                  {/* Highlight Ring */}
                  <div className="absolute top-[40%] right-[35%] w-16 h-16 border-4 border-emerald-500/40 rounded-full animate-pulse blur-[1px]" />
                  <div className="absolute top-[40%] right-[35%] w-16 h-16 border border-emerald-500/60 rounded-full animate-ping" />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent p-4">
                    <p className="text-[10px] text-white font-bold opacity-80 uppercase tracking-widest">{t('통신사 앱(T world 등) 마이페이지 예시')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Building2 className="h-5 w-5" />
                      <h3 className="font-black italic">{t('은행 앱에서 확인하기')} (Pro Tip)</h3>
                    </div>
                    <p className="text-sm font-medium text-blue-600 leading-relaxed">
                      {t("카카오뱅크나 토스 등 은행 앱의 '내 정보'에 표시된 영문 성함이 통신사 등록 성함과 같을 확률이 매우 높습니다.")}
                    </p>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Smartphone className="h-5 w-5" />
                      <h3 className="font-black">{t('통신사 앱에서 확인하기')}</h3>
                    </div>
                    <p className="text-sm font-medium text-emerald-600 leading-relaxed">
                      {t("통신사 고객센터 앱(T world, My KT, U+)의 마이페이지에서 정확한 성함(띄어쓰기 포함)을 확인하실 수 있습니다.")}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsNameHelpOpen(false)} className="w-full h-18 bg-slate-900 text-xl font-black rounded-[1.5rem] shadow-xl hover:scale-[1.02] transition-all">
                {t('확인했습니다')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showResumeDialog && !isSimulation} onOpenChange={setShowResumeDialog}>
        <DialogContent className="max-w-[400px] rounded-[2.5rem] p-8 border-none shadow-2xl bg-white overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-500" />
          <DialogHeader className="space-y-4 pt-4">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-2">
              <RotateCcw className="h-8 w-8 animate-spin-slow" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">
              {t("이어서 진행할까요?")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <p className="text-slate-500 text-center font-bold leading-relaxed">
              {t("이전에 진행하던 정보가 있습니다. 아까 하던 곳부터 바로 이어서 할 수 있어요.")}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleStartFresh}
                variant="outline"
                className="h-14 rounded-2xl font-bold border-slate-100 hover:bg-slate-50 text-slate-400"
              >
                {t("새로 시작하기")}
              </Button>
              <Button
                onClick={handleResume}
                className="h-14 rounded-2xl font-black bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("이어서 하기")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simulated Mobile PIN/Password Keypad Overlay */}
      {showMockPasswordPad && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col h-[550px]">
            {/* Header */}
            <div className={cn(
              "p-6 text-white text-center flex flex-col items-center justify-center relative shrink-0",
              authMethod === 'hana' ? "bg-[#008485]" : authMethod === 'app' ? "bg-[#E1000E]" : "bg-[#FEE500] text-slate-900"
            )}>
              <div className="h-14 w-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md mb-3">
                <Image
                  src={authMethod === 'hana' ? "/images/logo/hana_1q.png" : authMethod === 'app' ? "/images/logo/pass.png" : "/images/logo/kakao.png"}
                  alt="Bank Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-black">
                {authMethod === 'hana' ? t('하나인증서 승인') : authMethod === 'app' ? t('PASS 인증 승인') : t('카카오톡 인증 승인')}
              </h3>
              <p className="text-xs opacity-80 mt-1 font-bold">
                {t('비밀번호 6자리를 입력하여 인증을 완료해 주세요.')}
              </p>
            </div>

            {/* Password Dot Indicators */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 bg-slate-50">
              <div className="flex justify-center gap-4">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-5 w-5 rounded-full border-2 transition-all duration-150",
                      idx < pinCode.length
                        ? (authMethod === 'hana' ? "bg-[#008485] border-[#008485] scale-110" : authMethod === 'app' ? "bg-[#E1000E] border-[#E1000E] scale-110" : "bg-slate-900 border-slate-900 scale-110")
                        : "border-slate-300 bg-white"
                    )}
                  />
                ))}
              </div>
              {pinCode.length === 6 && (
                <p className="text-emerald-500 font-black text-sm mt-6 flex items-center gap-1.5 animate-bounce">
                  <CheckCircle2 className="h-5 w-5" /> {t('인증 성공! 잠시만 기다려 주세요.')}
                </p>
              )}
            </div>

            {/* Numeric Keypad Grid */}
            <div className="bg-white p-4 border-t border-slate-100 shrink-0">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    id={`mock-keypad-${num}`}
                    variant="ghost"
                    onClick={() => {
                      if (pinCode.length < 6) setPinCode((prev) => prev + num);
                    }}
                    className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-slate-800 transition-colors"
                  >
                    {num}
                  </Button>
                ))}
                {/* Empty spacer / Cancel */}
                <Button
                  variant="ghost"
                  onClick={() => setShowMockPasswordPad(false)}
                  className="h-16 text-base font-bold text-slate-400 rounded-2xl hover:bg-slate-50 active:bg-slate-100"
                >
                  {t('취소')}
                </Button>
                {/* 0 Key */}
                <Button
                  id="mock-keypad-0"
                  variant="ghost"
                  onClick={() => {
                    if (pinCode.length < 6) setPinCode((prev) => prev + "0");
                  }}
                  className="h-16 text-2xl font-black rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-slate-800"
                >
                  0
                </Button>
                {/* Backspace Key */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPinCode((prev) => prev.slice(0, -1));
                  }}
                  className="h-16 text-base font-bold text-slate-400 rounded-2xl hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
