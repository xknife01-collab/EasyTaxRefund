/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ShieldCheck, 
  BadgeCheck,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  ScanSearch,
  UserCheck,
  Lock,
  Plane,
  Home,
  Coins,
  Trophy,
  Globe,
  Database,
  Shield,
  X,
  Minimize2,
  Banknote
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { useToast } from "@/hooks/use-toast";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";
import { logLanguageVisit } from "@/lib/tracking";

import { useRouter } from "next/navigation";
import { languages } from '@/lib/translations/config';
import Image from 'next/image';
import DaisoEventPopup from "@/components/DaisoEventPopup";

const TaxRefundSimulator = dynamic(
  () => import("@/components/TaxRefundSimulator"),
  { ssr: false }
);

export default function HomePage() {
  const router = useRouter();
  const { t, isReady, setLanguage, language } = useTranslation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiVisible, setIsAiVisible] = useState(true);

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  // 방문 여부 확인 및 초기화
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      const welcomeSeen = localStorage.getItem("welcome_seen");
      
      if (urlLang) {
        localStorage.setItem("welcome_seen", "true");
        setHasSeenWelcome(true);
      } else {
        setHasSeenWelcome(!!welcomeSeen);
      }
    } catch (e) {
      console.error('LocalStorage failed:', e);
      setHasSeenWelcome(false);
    }

    // Extremely aggressive safety fallback: force loading screen to hide after 100ms
    const welcomeFallback = setTimeout(() => {
      setHasSeenWelcome(prev => prev === null ? false : prev);
    }, 100);

    return () => clearTimeout(welcomeFallback);
  }, []);

  const handleLanguageSelect = (langCode: any) => {
    localStorage.setItem('welcome_seen', 'true');
    setLanguage(langCode as any);
    logLanguageVisit(langCode);
    setHasSeenWelcome(true);
  };



  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setAiAnswer(null);
    
    try {
      const result = await askFaqQuestion({ question, language });
      setAiAnswer(result.answer);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("AI 비서 연결 실패"),
        description: t("현재 AI 비서가 응답할 수 없습니다. 잠시 후 다시 시도해 주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const faqData = [
    {
      category: t('1. 비자 및 체류 자격 (Visa & Status)'),
      items: [
        { q: t('비자 종류(E-7, E-9, F-2 등)에 상관없이 신청할 수 있나요?'), a: t("네, 비자 종류보다는 '거주자(183일 이상 한국 거주)' 여부와 '중소기업 근무' 여부가 중요합니다. 요건만 충족한다면 대부분의 취업 비자 소지자가 혜택 대상입니다.") },
        { q: t('지금은 회사를 그만두고 구직 중(D-10)이거나 본국으로 돌아갈 예정인데 가능한가요?'), a: t("과거 5년 이내에 한국 중소기업에서 일하며 세금을 냈던 기록이 있다면, 현재 무직 상태이거나 출국 예정이라도 지난 세금을 돌려받을 수 있습니다.") },
        { q: t('이 신청이 내 비자 연장이나 영주권 신청에 불이익을 주지 않나요?'), a: t('전혀 그렇지 않습니다. 이것은 정부가 법적으로 보장하는 정당한 세제 혜택이며, 세금을 체납하는 것이 아니라 이미 낸 세금을 법에 따라 환급받는 것이므로 비자 상태에 아무런 영향을 주지 않습니다.') },
      ]
    },
    {
      category: t('2. 회사와의 관계 (Relationship with Company)'),
      items: [
        { q: t('회사 몰래 신청할 수 있나요? 사장님이 알면 싫어하실까 봐 걱정돼요.'), a: t("과거의 세금을 돌려받는 '경정청구'는 회사를 통하지 않고 본인이 직접 세무서에 신청하는 것입니다. 회사에는 어떠한 통보도 가지 않으며, 회사가 비용을 부담하는 것도 아니니 안심하고 신청하셔도 됩니다.") },
        { q: t('회사가 중소기업인지 어떻게 확인하나요?'), a: t(`저희 앱에 접속하여 사업자 번호만 입력하시면, 저희 AI 시스템이 해당 기업이 감면 대상인 '중소기업 기본법'상의 중소기업인지 즉시 판별해 드립니다.`) },
      ]
    },
    {
      category: t('3. 환급 및 세금 (Refund & Tax)'),
      items: [
        { q: t('이미 연말정산을 했는데 또 받을 수 있는 게 있나요?'), a: t(`네, 연말정산 때 이 감면 혜택(90% 감면)을 적용받지 못했다면, 놓친 금액만큼을 '경정청구'라는 절차를 통해 별도로 돌려받을 수 있습니다.`) },
        { q: t('돈은 언제, 어디로 들어오나요?'), a: t('신청 후 세무서의 검토를 거쳐 보통 1~2개월 이내에 신청 시 입력하신 본인 명의의 한국 은행 계좌로 국세청에서 직접 입금됩니다.') },
        { q: t('환급금이 없으면 수수료를 안 내도 되나요?'), a: t("네, 저희 서비스는 '성공 보수' 원칙입니다. 예상 환급액을 확인하는 것은 무료이며, 실제 환급액이 발생하지 않으면 어떠한 수수료도 청구되지 않습니다.") },
      ]
    },
    {
      category: t('4. 본인 인증 및 오류 (Authentication)'),
      items: [
        { q: t('이름이 외국인 등록증(ARC)이랑 통신사에 등록된 게 다른데 어떡하죠?'), a: t("외국인들이 가장 많이 겪는 문제입니다. 저희 앱의 'AI 이름 최적화' 기능을 사용하면, 다양한 이름 조합을 자동으로 테스트하여 인증에 성공할 수 있도록 도와드립니다.") },
        { q: t('한국 핸드폰 번호가 없으면 신청이 불가능한가요?'), a: t("앱을 통한 자동 조회를 위해서는 본인 명의의 휴대폰 인증이 필수입니다. 만약 본인 명의의 휴대폰이 없으시다면, 가까운 주민센터(동사무소)나 세무서에 방문하여 발급받으신 '원천징수영수증' 사진을 촬영하여 실시간 상담원 채팅으로 보내주세요. 전문 세무사가 안전하게 개별 환급 신청을 도와드립니다.") },
      ]
    },
    {
      category: t('5. 연령 및 기간 (Age & Period)'),
      items: [
        { q: t('저는 만 34세가 넘었는데 아예 방법이 없나요?'), a: t("현재 나이가 만 34세가 넘었더라도, '취업 당시' 나이가 만 34세 이하였다면 그 시점부터 5년 동안의 세금은 환급받을 수 있습니다. 포기하기 전에 꼭 확인해 보세요.") },
        { q: t('한국에 온 지 1년밖에 안 됐는데 신청 가능한가요?'), a: t('네, 입사한 날로부터 바로 혜택이 시작됩니다. 작년에 냈던 세금을 지금 바로 환급 신청하세요.') }
      ]
    }
  ];

  // 로딩 중인 경우에만 렌더링
  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex flex-col items-center gap-8 animate-fade-in">
          <div className="flex items-center gap-4 group">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary via-primary/90 to-indigo-700 text-white shadow-[0_15px_35px_-5px_rgba(99,102,241,0.4)]">
              <Globe className="h-9 w-9 animate-pulse" />
            </div>
            <span className="text-4xl font-black tracking-tighter text-slate-900 font-headline">Easy Tax Refund</span>
          </div>
          <div className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress-indefinite" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      <main className="flex-1">
        
        {/* 디자인 섹션 1: 히어로 섹션 */}
        <section className="relative h-[750px] overflow-hidden bg-white flex items-center">
          {/* Full-width background image */}
          <div className="absolute inset-0 z-0 select-none">
            <img
              src="/MAIN.png?v=1"
              alt="National Assembly Background"
              className="absolute inset-0 w-full h-full object-cover object-right"
            />
          </div>
          
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 text-left space-y-6 md:space-y-8">
                
                {/* Main Heading */}
                <div className="space-y-3">
                  <h2 className="text-[#0b192c] text-xl md:text-2xl lg:text-[2.2rem] font-black tracking-tight font-headline uppercase leading-none">
                    FOREIGNER INCOME TAX REFUND
                  </h2>
                  <h3 className="text-[#b88c30] text-lg md:text-xl lg:text-2xl font-black font-headline uppercase leading-none">
                    - GOVERNMENT SUPPORTED PROGRAM
                  </h3>
                  <h1 className="text-3xl md:text-5xl lg:text-[3.2rem] font-black text-slate-900 tracking-tight leading-[1.15] break-keep pt-2">
                    외국인 중소기업 소득세 환급 - 정부 공식 제도 안내
                  </h1>

                  {/* Subtitle text only */}
                  <div className="space-y-1 pt-2">
                    <p className="text-base md:text-lg font-black text-slate-700">{t('Verify your eligibility in 1 minute.')}</p>
                    <p className="text-sm md:text-base font-bold text-slate-500">{t('Our service is securely linked with the National Tax Service (Hometax).')}</p>
                  </div>
                </div>

              </div>
              <div className="hidden lg:block lg:col-span-5">
                {/* Space reserved for image background display on large screens */}
              </div>
            </div>
          </div>
        </section>

        {/* Navy Trust Banner */}
        <section className="bg-[#0b192c] text-white py-10 border-y-4 border-[#e2b659]">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
              
              {/* Col 1: Certified Partners */}
              <div className="space-y-4 pb-6 md:pb-0">
                <div className="text-[#e2b659] text-xs font-black tracking-wider uppercase">{t('Certified Partners')}</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <img src="/nts-logo.jpg" alt="국세청 로고" className="h-full w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-900">NTS Hometax Connected</div>
                      <div className="text-xs text-slate-500 font-bold">국세청 홈택스 공식 실시간 연동</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <img src="/certified_security_seal_premium_1774150786685.png" alt="보안 인증" className="h-full w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-900">Certified Secure Platform</div>
                      <div className="text-xs text-slate-500 font-bold">개인정보 보안 인증 플랫폼</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Visas Supported */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-10 text-left">
                <div className="text-[#e2b659] text-xs font-black tracking-wider uppercase">{t('Real Visas Supported')}</div>
                <div className="text-xl lg:text-2xl font-black text-white">{t('E-7, E-9, D-10, etc.')}</div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {languages.map((lang) => (
                    <div key={lang.code} className="flex flex-col items-center gap-1 group cursor-default">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 text-lg shadow-sm group-hover:bg-white/25 group-hover:scale-110 transition-all">
                        {lang.flag}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors leading-none">{lang.countryCode.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===== 청년 외국인 세무 지원 섹션 — 에디토리얼 프리미엄 ===== */}
        <section className="bg-white overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30]" />

          <div className="container mx-auto max-w-7xl px-6 py-16 lg:py-24">
            {/* 상단: 2열 구조 (왼쪽: 사진, 오른쪽: 헤드라인/수치/타임라인) */}
            <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-12 lg:gap-16 items-start">

              {/* ─── 왼쪽: 매니저 사진 ─── */}
              <div className="relative w-full max-w-[480px] mx-auto lg:mx-0">
                {/* 뒤 골드 장식 */}
                <div className="absolute top-4 -left-3 w-full h-full rounded-3xl border-2 border-[#b88c30]/20 bg-[#f5f0e8]/50 -z-0" />

                <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(15,30,54,0.18)]">
                  <img
                    src="/images/manager.png"
                    alt="김준현 공식 매니저"
                    className="w-full object-cover object-top"
                    style={{ height: '520px' }}
                  />
                  {/* 하단 페이드 */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0f1e36]/90 to-transparent" />
                  {/* 상단 Official Manager 라인 */}
                  <div className="absolute top-5 left-5 right-5 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#b88c30]/40" />
                    <span className="text-[#b88c30] text-[10px] font-black uppercase tracking-[0.3em]">Official Manager</span>
                    <div className="h-px flex-1 bg-[#b88c30]/40" />
                  </div>
                  {/* 하단 이름 */}
                  <div className="absolute bottom-0 left-0 right-0 px-6 py-4 text-center">
                    <div className="text-white font-black text-xl">김준현 공식 매니저</div>
                    <div className="text-slate-300 font-bold text-xs mt-0.5">외국인 중소기업 청년 소득세 환급 전문</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs font-black">지금 상담 가능 · 010-325-9953</span>
                    </div>
                  </div>
                </div>

                {/* 90% 플로팅 배지 */}
                <div className="absolute top-8 -right-4 z-20 bg-[#b88c30] rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(184,140,48,0.40)] text-center">
                  <div className="text-[#0f1e36] font-black text-3xl leading-none">90%</div>
                  <div className="text-[#0f1e36]/70 font-black text-xs mt-0.5">소득세 감면</div>
                </div>
              </div>

              {/* ─── 오른쪽: 헤드라인 + 수치 + 타임라인 ─── */}
              <div className="flex flex-col gap-8 lg:pt-2">

                {/* 아이브로우 */}
                <div className="flex items-center gap-3">
                  <div className="h-[3px] w-8 bg-[#b88c30]" />
                  <span className="text-[#b88c30] text-xs font-black tracking-[0.35em] uppercase">조세특례제한법 제30조 · 정부 공식 제도</span>
                </div>

                {/* 헤드라인 */}
                <div className="space-y-3 border-l-4 border-[#b88c30] pl-6">
                  <h2 className="text-4xl sm:text-5xl font-black text-[#0f1e36] tracking-tight leading-[1.1] break-keep font-headline">
                    월급에서 이미 낸 세금<br />
                    <span className="text-[#b88c30]">90%</span>를 돌려받을 권리
                  </h2>
                  <p className="text-slate-500 font-bold text-base leading-relaxed break-keep">
                    {t('대한민국 정부가 중소기업 청년 근로자에게 보장하는 법정 세제 혜택입니다. 외국인 근로자도 동일하게 적용됩니다.')}
                  </p>
                </div>

                {/* 핵심 수치 3개 */}
                <div className="grid grid-cols-3 gap-3">
                   {[
                     { value: '90%', label: '소득세 감면율', sub: '취업일부터 5년간', dark: true },
                     { value: '200만원', label: '연간 최대 환급', sub: '과세연도 한도', dark: false },
                     { value: '1,000만원', label: '5년 누적 총액', sub: '평균 실수령 300만+', dark: false },
                   ].map((item) => (
                     <div key={item.value} className={`rounded-xl p-5 text-center border ${item.dark ? 'bg-[#0f1e36] border-[#0f1e36]' : 'bg-[#f5f0e8] border-[#b88c30]/20'}`}>
                       <div className={`font-black text-2xl sm:text-3xl leading-none ${item.dark ? 'text-[#b88c30]' : 'text-[#0f1e36]'}`}>{item.value}</div>
                       <div className={`font-black text-xs mt-2 ${item.dark ? 'text-white' : 'text-[#0f1e36]'}`}>{item.label}</div>
                       <div className={`font-bold text-xs mt-0.5 ${item.dark ? 'text-slate-400' : 'text-slate-500'}`}>{item.sub}</div>
                     </div>
                   ))}
                 </div>

                 {/* 5년 타임라인 */}
                 <div className="bg-[#f5f0e8] rounded-xl p-6 space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-[#0f1e36] font-black text-base">5년 환급 타임라인</span>
                     <span className="text-[#b88c30] font-black text-sm">누적 최대 1,000만원</span>
                   </div>
                   <div className="flex gap-2">
                     {['1년차', '2년차', '3년차', '4년차', '5년차'].map((yr, i) => (
                       <div key={yr} className="flex-1 space-y-1.5">
                         <div className="h-7 rounded bg-[#b88c30] transition-all hover:h-9" style={{ opacity: 0.35 + i * 0.13 }} />
                         <div className="text-center text-[10px] text-slate-500 font-black">{yr}</div>
                         <div className="text-center text-[10px] text-[#b88c30] font-black">+200만</div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* 법적 대행 안내 */}
                 <div className="flex items-start gap-4 bg-[#f5f0e8] border border-[#b88c30]/20 rounded-xl px-5 py-4">
                   <BadgeCheck className="h-6 w-6 text-[#b88c30] shrink-0 mt-0.5" />
                   <div>
                     <div className="text-[#0f1e36] font-black text-base">공인 세무사 직접 대행</div>
                     <div className="text-slate-500 font-bold text-sm mt-0.5 break-keep">비자 불이익 없음 · 조세특례제한법 제30조 기반 정당한 법적 혜택</div>
                   </div>
                 </div>
              </div>
            </div>

            {/* 웅장한 가로 구분선 */}
            <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-[#b88c30]/30 to-transparent" />

            {/* ─── 하단: 세금 감면 상세 정보 및 신청 자격 요약 (2열 프리미엄 레이아웃) ─── */}
            <div className="max-w-5xl mx-auto space-y-12">
                  
                  {/* 섹션 소제목 */}
                  <div className="space-y-4">
                    <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">01 — Benefit Details</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f1e36] leading-tight break-keep font-headline">
                      파격적인 세금 감면 제도, 알고 계셨나요?
                    </h2>
                    <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
                  </div>

                  {/* 2열 상세 구조 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* 1) 왼쪽: 친절한 제도 설명 및 환급 예시 */}
                    <div className="space-y-8">
                      {/* 핵심 설명 */}
                      <p className="text-slate-600 text-base sm:text-lg font-bold leading-relaxed break-keep">
                        대한민국 정부는 중소기업에 취업한 청년 근로자들에게 매우 큰 세금 감면 혜택을 제공하고 있으며, 이는 외국인 근로자(베트남 등 모든 국적)에게도 동일하게 적용되는 정당한 권리입니다.
                      </p>

                      {/* 어떤 세금을 돌려받는가 */}
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                          <span className="text-sm font-black text-[#0f1e36] uppercase tracking-wider">어떤 세금을 돌려받나요?</span>
                        </div>
                        <p className="text-slate-600 text-sm font-bold leading-relaxed break-keep">
                          매달 월급을 받을 때 회사가 급여에서 미리 떼어 가는 '근로소득세 (원천징수세)'가 그 대상입니다. 예를 들어 월급이 250만원이라면 회사가 매월 약 3~8만원의 소득세를 자동으로 공제한 후 지급합니다. 이 세금의 90%를 돌려받는 제도입니다.
                        </p>
                      </div>

                      {/* 실제 환급 계산 예시 */}
                      <div className="p-6 bg-[#0f1e36]/3 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                          <span className="text-sm font-black text-[#0f1e36] uppercase tracking-wider">실제 환급 계산 예시</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200">
                            <span className="text-slate-500 font-bold">연간 소득세 100만원인 경우</span>
                            <span className="font-black text-emerald-600">→ 90만원 환급</span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200">
                            <span className="text-slate-500 font-bold">연간 소득세 200만원인 경우</span>
                            <span className="font-black text-emerald-600">→ 180만원 환급</span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-2">
                            <span className="text-slate-500 font-bold">연간 소득세 300만원인 경우</span>
                            <span className="font-black text-emerald-600">→ 200만원 환급 (한도 적용)</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-bold">※ 연간 최대 감면 한도 200만원. 5년 적용 시 최대 1,000만원</p>
                      </div>

                      {/* 과거 환급 + 현실적 문제 */}
                      <div className="space-y-4">
                        <div className="flex gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-black text-[#0f1e36] mb-1">과거 5년치 환급 가능 (경정청구)</div>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">
                              제도를 몰라서 신청하지 못했어도, '경정청구'를 통해 최대 5년치 이미 납부한 세금을 전액 일시에 돌려받을 수 있습니다. 퇴사 후에도 신청 가능합니다.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 p-5 bg-red-50 rounded-2xl border border-red-100">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-black text-[#0f1e36] mb-1">현실적인 문제</div>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">
                              대부분의 중소기업은 외국인 근로자를 위한 감면 신청서를 별도로 챙겨주지 않습니다. 회사가 처리해주지 않으면 근로자 본인이 놓치게 되며, 수년치 세금을 그냥 납부하는 경우가 대부분입니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2) 오른쪽: 다크 네이비 "신청 자격 요약" 카드 */}
                    <div className="bg-[#0f1e36] rounded-3xl p-8 sm:p-10 space-y-6 text-white shadow-2xl shadow-slate-900/20 border border-[#b88c30]/20">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                        <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                        <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">신청 자격 요약</span>
                      </div>
                      {[
                        { label: "신청 대상", value: "만 15 ~ 34세 외국인" },
                        { label: "근무지 요건", value: "중소기업 재직자" },
                        { label: "거주 요건", value: "183일 이상 국내 거소" },
                        { label: "감면율", value: "소득세 90%" },
                        { label: "연간 한도", value: "200만원 / 년" },
                        { label: "최대 한도", value: "누적 1,000만원" },
                        { label: "적용 기간", value: "최대 5년" },
                        { label: "과거 환급", value: "경정청구로 5년치 가능" },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-800 last:border-0">
                          <span className="text-slate-400 text-sm font-bold">{row.label}</span>
                          <span className="text-white text-sm font-black">{row.value}</span>
                        </div>
                      ))}
                      
                      <Button asChild className="w-full premium-btn-shimmer bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30] hover:from-[#e2b659] hover:to-[#b88c30] text-[#0f1e36] font-black rounded-2xl py-6 text-base mt-4 shadow-xl shadow-[#b88c30]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer">
                        <Link href="/estimate" className="flex items-center justify-center gap-2">
                          <span>예상 환급액 무료 조회</span>
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 shrink-0 text-[#0f1e36]" />
                        </Link>
                      </Button>
                    </div>

                  </div>

                  {/* ─── 하단 추가: 자격 요건 + 후불제 ─── */}

                  {/* ↓↓↓ ORIGINAL VERSION (되돌리려면 이 주석 블록을 복원하세요) ↓↓↓
                  <div className="bg-slate-50 rounded-3xl p-8 lg:p-12 border border-[#b88c30]/15 shadow-[0_16px_48px_rgba(15,30,54,0.06)]">
                    <div className="text-center mb-10">
                      <div className="inline-block text-[#b88c30] text-xs font-black uppercase tracking-[0.2em] mb-2">ELIGIBILITY & PROCESS</div>
                      <h3 className="text-[#0f1e36] text-2xl lg:text-3xl font-black tracking-tight">소득세 감면 신청 자격 요건</h3>
                      <p className="text-slate-500 font-bold text-sm mt-1">아래 요건을 모두 충족하거나 해당하는 경우 지난 5년간의 세금을 소급 환급받으실 수 있습니다.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { icon: '🎂', title: '만 15~34세 취업 (군복무 최대 6년 차감 → 최대 만 40세)', sub: '취업 계약 체결일 기준 · 병적증명서 제출 시 연장 인정' },
                        { icon: '🏢', title: '중소기업기본법상 중소기업 재직 (감면 대상 업종)', sub: '제조·IT·서비스업 등 · 수의업·부동산임대업·가상자산업 제외' },
                        { icon: '🛂', title: '한국 세법상 거주자 — 183일 이상 국내 거소', sub: 'E-7, E-9, D-10, F-2 등 합법 취업 비자 소지자 동일 적용' },
                        { icon: '📋', title: '과거 5년 이내 경정청구 소급 신청 가능', sub: '퇴직 후 · 출국 예정자도 지난 세금 환급 신청 가능' },
                      ].map((item) => (
                        <div key={item.title} className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl px-6 py-5 hover:border-[#b88c30]/40 transition-all shadow-sm group">
                          <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                          <div className="flex-1">
                            <div className="text-[#0f1e36] font-black text-base leading-snug group-hover:text-[#b88c30] transition-colors">{item.title}</div>
                            <div className="text-slate-400 font-bold text-xs mt-1 leading-normal break-keep">{item.sub}</div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-[#b88c30] shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-200">
                      <div className="flex items-center gap-4 bg-[#0f1e36] rounded-2xl px-6 py-5 shadow-sm">
                        <CheckCircle2 className="h-6 w-6 text-[#b88c30] shrink-0" />
                        <div>
                          <div className="text-[#b88c30] font-black text-base">선결제 0원</div>
                          <div className="text-slate-400 font-bold text-xs mt-1">환급 성공 시에만 수수료 발생 · 실패 시 전액 무료</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#f5f0e8] border border-[#b88c30]/20 rounded-2xl px-6 py-5 shadow-sm">
                        <ShieldCheck className="h-6 w-6 text-[#b88c30] shrink-0" />
                        <div>
                          <div className="text-[#0f1e36] font-black text-base">성과 기반 후불 정산 (No Win, No Fee)</div>
                          <div className="text-slate-500 font-bold text-xs mt-1">착수금이나 선결제 없이 환급 후 정산합니다.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  ↑↑↑ ORIGINAL VERSION END ↑↑↑ */}

                  {/* ── 정리된 새 버전 ── */}
                  <div className="bg-slate-50 rounded-3xl p-8 lg:p-10 border border-[#b88c30]/15 shadow-[0_16px_48px_rgba(15,30,54,0.06)]">

                    {/* 타이틀 */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-[3px] w-8 bg-[#b88c30]" />
                      <div>
                        <div className="text-[#b88c30] text-xs font-black uppercase tracking-[0.25em]">신청 자격 · 4가지 조건</div>
                        <div className="text-slate-400 text-xs font-bold mt-0.5">4가지 중 하나라도 해당되면 환급 신청 가능합니다</div>
                      </div>
                    </div>

                    {/* 자격 카드 - 핵심어 압축 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: '🎂', title: '만 15~34세 외국인', sub: '군복무 시 최대 만 40세까지 · 비자 종류 무관' },
                        { icon: '🏢', title: '중소기업 재직자', sub: '제조·IT·서비스업 등 감면 대상 업종 근무' },
                        { icon: '🛂', title: '183일 이상 국내 거주', sub: 'E-7, E-9, D-10, F-2 등 합법 취업 비자 동일 적용' },
                        { icon: '📋', title: '5년 이내 소급 환급 가능', sub: '퇴사 후 · 출국 예정자도 경정청구로 신청 가능' },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-[#b88c30]/40 transition-all shadow-sm group">
                          <span className="text-xl shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#0f1e36] font-black text-sm group-hover:text-[#b88c30] transition-colors">{item.title}</div>
                            <div className="text-slate-400 font-bold text-xs mt-0.5 break-keep">{item.sub}</div>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-[#b88c30] shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>

                    {/* 후불제 카드는 하단 섹션에 중복 존재하므로 제거됨 */}

                  </div>



                  {/* 제도안내 자세히 알아보기 CTA */}
                  <div className="flex justify-center pt-4">
                    <Button size="lg" asChild className="premium-btn-shimmer w-full sm:w-auto text-lg font-black px-12 py-7 h-auto bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30] hover:from-[#e2b659] hover:to-[#b88c30] text-[#0f1e36] rounded-2xl shadow-xl shadow-[#b88c30]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer">
                      <Link href="/youth-tax" className="flex items-center justify-center gap-3">
                        <span>청년 소득세 90% 감면 제도안내 자세히 알아보기</span>
                        <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1.5 shrink-0" />
                      </Link>
                    </Button>
                  </div>

            </div>

          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#b88c30]/40 to-transparent" />
        </section>
        {/* 임팩트 신뢰 슬로건 배너 */}
        <div className="h-[5px] w-full bg-gradient-to-r from-transparent via-[#b88c30] to-transparent" />
        <section className="w-full bg-[#0f1e36] py-20 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-7">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-widest uppercase">
                {t('대한민국 국세청(NTS) 조세특례제한법 제30조 법적 근거')}
              </span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug break-keep">
              {t('그냥 지나치기 쉬운 세금 감면 혜택,')}{' '}
              <span className="text-[#b88c30]">{t('외국인 근로자도 동일하게 보장받는 법적 권리입니다.')}</span>
            </h2>
            <div className="h-px w-20 bg-[#b88c30] mx-auto" />
            <p className="text-slate-300 text-base sm:text-lg font-bold leading-relaxed max-w-4xl mx-auto break-keep">
              {t('본 제도는 대한민국 조세특례제한법에 근거한 공식 세제 지원책입니다. 대한민국 세법은 내·외국인 간 세무상 차별을 두지 않으므로, 납세 의무를 다한 외국인 근로자라면 누구나 안전하게 국세청을 통해 정당한 소득세 환급을 청구할 수 있습니다.')}
            </p>
          </div>
        </section>
        <div className="h-[5px] w-full bg-gradient-to-r from-transparent via-[#b88c30] to-transparent" />

        {/* 안심 보장 카드 섹션 */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* 헤더 */}
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-[2px] w-8 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black uppercase tracking-[0.3em]">3-Tier Guarantee · No Win, No Fee</span>
              </div>
              <h2
                className="text-3xl md:text-5xl font-black text-[#0f1e36] leading-tight tracking-tight break-keep mb-4"
                dangerouslySetInnerHTML={{ __html: t('수수료 선결제 0원, 오직 환급 성공 시에만 정산받는 3대 안심 보장제도') }}
              />
              <p className="text-slate-500 font-bold text-base md:text-lg leading-relaxed break-keep max-w-2xl">
                {t('0.1초 만에 조회하고, 환급금이 통장에 안전하게 입금된 것을 직접 확인한 후에 정산하세요.')}
              </p>
            </div>

            {/* 3열 카드 */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* 카드 01 */}
              <div className="group relative bg-white border-t-4 border-t-[#b88c30] border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                  <Coins className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#0f1e36] leading-snug break-keep">
                  {t('초기 비용 0원, 완전 무료 시작')}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">
                  {t('서비스 신청 시 필요한 비용은 전혀 없습니다. 예상 환급액 조회부터 전문 세무사의 전담 검토 단계까지, 신청 시점에 고객님이 내야 할 돈은 단 1원도 없습니다.')}
                </p>
              </div>

              {/* 카드 02 — 가운데 다크 네이비 대신 깔끔한 화이트 + 네이비 상단 포인트 */}
              <div className="group relative bg-white border-t-4 border-t-[#0f1e36] border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#0f1e36] leading-snug break-keep">
                  {t('환급 거절/실패 시 수수료 0원')}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">
                  {t('세무서 심사 결과 환급액이 나오지 않으면 서비스 수수료도 청구되지 않습니다. 고객님은 비용 손실이나 리스크가 0%이므로 안심하고 권리를 찾으세요.')}
                </p>
              </div>

              {/* 카드 03 */}
              <div className="group relative bg-white border-t-4 border-t-[#b88c30] border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                  <Banknote className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#0f1e36] leading-snug break-keep">
                  {t('환급금 입금된 후 후불 정산')}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">
                  {t('국세청에서 고객님 명의의 은행 계좌로 환급금을 직접 입금해 드리면, 나중에 후불 정산합니다.')}
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* 디자인 섹션 2: 신뢰 지표 */}
        <section className="py-8 bg-slate-50/60 border-y border-slate-100/80 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
              
              {/* 공인 세무사 직접 대행 */}
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-6 w-6 text-[#b88c30] shrink-0" />
                <span className="font-black text-base md:text-lg text-[#2b4c7e] tracking-tight whitespace-nowrap">
                  {t('공인 세무사 직접 대행')}
                </span>
              </div>
              
              <div className="hidden md:block h-8 w-px bg-slate-200" />
              
              {/* 국세청 로고 */}
              <div className="flex items-center h-12 md:h-14">
                <Image
                  src="/nts-logo.jpg"
                  alt="국세청"
                  width={110}
                  height={44}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </div>
              
              <div className="hidden md:block h-8 w-px bg-slate-200" />
              
              {/* NTS Badge */}
              <div className="flex items-center h-12 md:h-14">
                <Image
                  src="/official_nts_carrier_badge_v2_1774141326494.png"
                  alt="NTS Badge"
                  width={48}
                  height={48}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </div>
              
              <div className="hidden md:block h-8 w-px bg-slate-200" />
              
              {/* Security Seal */}
              <div className="flex items-center h-12 md:h-14">
                <Image
                  src="/certified_security_seal_premium_1774150786685.png"
                  alt="Security Seal"
                  width={48}
                  height={48}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </div>
              
              <div className="hidden md:block h-8 w-px bg-slate-200" />
              
              {/* 개인정보 보호 인증 */}
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                <span className="font-black text-base md:text-lg text-[#2b4c7e] tracking-tight whitespace-nowrap">
                  {t('개인정보 보호 인증')}
                </span>
              </div>
              
            </div>
          </div>
        </section>

        {/* 디자인 섹션 3: 정부 공인 상세 안내 */}
        <section className="py-24 bg-[#faf6f0] relative overflow-hidden">
          {/* Subtle elegant legal patterns */}
          <div className="absolute inset-0 bg-[#0b192c]/[0.01] pointer-events-none" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#b88c30]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10 max-w-5xl">
            <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-16 p-10 md:p-14 bg-[#0f1e36] rounded-[2.5rem] shadow-[0_24px_60px_rgba(15,30,54,0.35)] border-2 border-[#b88c30]/35 overflow-hidden">
              
              {/* Decorative corner borders for classic official feel */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#b88c30]/50 rounded-tl-xl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#b88c30]/50 rounded-tr-xl" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#b88c30]/50 rounded-bl-xl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#b88c30]/50 rounded-br-xl" />
              
              {/* Left Column: Official Stamp Frame */}
              <div className="shrink-0 relative group mx-auto md:mx-0">
                {/* Elegant outer glow */}
                <div className="absolute -inset-4 bg-[#b88c30]/15 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Double-bordered luxury frame for the partner badge */}
                <div className="relative p-2.5 rounded-[2rem] bg-[#0b192c] border border-[#b88c30]/35 shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
                  <div className="rounded-[1.5rem] overflow-hidden bg-white p-5 border border-[#b88c30]/20">
                    <Image 
                      src="/official_nts_carrier_badge_v2_1774141326494.png"
                      alt="Official NTS & Carrier Badge" 
                      width={160}
                      height={160}
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Text & Detailed Grid */}
              <div className="flex-1 space-y-6 text-left">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#b88c30]/40 text-[#e2b659] bg-[#b88c30]/10">
                  <ShieldCheck className="h-4 w-4 text-[#e2b659] animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] leading-none">{t('safe_and_secure')}</span>
                </div>
                
                {/* Title */}
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight font-headline">
                    {t('nts_trust_title')}
                  </h2>
                  {/* Decorative line under title */}
                  <div className="h-0.5 w-16 bg-gradient-to-r from-[#b88c30] to-transparent" />
                </div>
                
                {/* Message */}
                <p className="text-slate-300 font-bold text-base md:text-lg leading-relaxed max-w-2xl">
                  {t('nts_trust_message')}
                </p>
                
                {/* Clean data blocks matching law firm style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-700/60 w-full">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 transition-all hover:bg-white/10 hover:border-[#b88c30]/30 group">
                    <div className="h-10 w-10 bg-[#b88c30]/10 border border-[#b88c30]/35 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-[#e2b659]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">database portal</div>
                      <div className="text-white text-sm font-black transition-colors group-hover:text-[#e2b659]">{t('nts_hometax')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 transition-all hover:bg-white/10 hover:border-[#b88c30]/30 group">
                    <div className="h-10 w-10 bg-[#b88c30]/10 border border-[#b88c30]/35 rounded-xl flex items-center justify-center shrink-0">
                      <UserCheck className="h-5 w-5 text-[#e2b659]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">carrier auth</div>
                      <div className="text-white text-sm font-black transition-colors group-hover:text-[#e2b659]">{t('SKT / KT / LGU+')}</div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* 10단계 시뮬레이터 쇼케이스 */}
        <section className="py-12 bg-slate-50/50">
          <div className="container mx-auto px-4">
            <TaxRefundSimulator />
          </div>
        </section>

        {/* 디자인 섹션 5: 문제 제기 */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-red-500 border-red-100 bg-red-50 px-4 py-1.5 font-bold uppercase tracking-widest">{t('실제 문제')}</Badge>
                  <h2 className="text-4xl lg:text-6xl font-black font-headline text-slate-900 leading-tight whitespace-pre-line">
                    {t("Why didn't I know\nthis before?")}
                  </h2>
                  <p className="text-2xl font-bold text-slate-400">{t('외국인 근로자 10명 중 9명이 환급을 받지 못하는 이유')}</p>
                </div>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">{t(`대한민국 정부는 중소기업에서 활약하는 젊은 인재들을 위해 강력한 세제 혜택를 제공합니다. 하지만 정작 혜택를 받아야 할 외국인 근로자들은 정보 부족과 까다로운 본인 인증 절차 때문에 매년 수백만 원을 국가에 남겨두고 있습니다.`)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('매년 최대 환급액')}</div>
                    <div className="text-2xl font-black text-primary">{t('200만 원')}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('최대 환급액')}</div>
                    <div className="text-2xl font-black text-primary">{t('1,000만 원')}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-2">
                    <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('과거 내역 소급')}</div>
                    <div className="text-2xl font-black text-primary">{t('과거 5년치')}</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#0b192c]/5 rounded-[4rem] -rotate-3" />
                <Card className="relative premium-card rounded-[3.5rem] border-none p-10 lg:p-16 space-y-12 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary"><AlertCircle className="h-48 w-48" /></div>
                  <h3 className="text-2xl font-black text-slate-900 relative z-10">{t('왜 지금까지 못 받았을까요?')}</h3>
                  <div className="space-y-6 relative z-10">
                    {[t('복잡한 조세특례제한법 법률 용어'), t('통신사와 ARC 명의 불일치로 인한 인증 실패'), t('회사 인사팀에 직접 물어보기 껄끄러운 상황'), t('외국인 전문 상담 창구의 부재')].map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-50 shadow-sm transition-all hover:border-primary/20">
                        <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center shrink-0"><AlertCircle className="h-5 w-5 text-red-500" /></div>
                        <span className="text-lg font-bold text-slate-600">{reason}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 4: 해결책 */}
        <section className="py-32 bg-slate-50/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-6xl font-black font-headline text-slate-900">
                {t('가장 까다로운 인증을')}<br /><span className="text-primary">{t('가장 확실하게 해결합니다')}</span>
              </h2>
              <p className="text-xl text-slate-500 font-bold">{t('Easy Tax Refund만의 독자적인 기술력과 전문성을 경험하세요.')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="premium-card rounded-[2.5rem] border-none p-8 space-y-6 bg-white shadow-xl">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center"><ScanSearch className="h-8 w-8 text-primary" /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{t('외국인 전용 성명 매칭 알고리즘')}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('ARC와 통신사 정보의 이름 형식이 달라 발생하는 고질적인 인증 오류를 저희만의 독자적인 알고리즘으로 해결했습니다.')}</p>
                </div>
              </Card>
              <Card className="premium-card rounded-[2.5rem] border-none p-8 space-y-6 bg-white shadow-xl">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center"><UserCheck className="h-8 w-8 text-primary" /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{t('국가 공인 세무 전문가의 검토')}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('단순한 자동화 프로그램이 아닙니다. 모든 신청은 대한민국 공인 세무사의 철저한 검토를 거쳐 진행됩니다.')}</p>
                </div>
              </Card>
              <Card className="premium-card rounded-[2.5rem] border-none p-8 space-y-6 bg-white shadow-xl">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Lock className="h-8 w-8 text-primary" /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900">{t('금융권 수준의 데이터 보안')}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{t('당신의 소중한 개인정보는 은행급 암호화 프로토콜로 보호됩니다. 환급 목적 외 데이터 사용은 절대 금지됩니다.')}</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 7: CTA */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6 max-w-5xl text-center space-y-12">
            <h2 className="text-4xl lg:text-7xl font-black font-headline text-slate-900 text-gradient break-keep">
              {t('단 30초의 확인으로, 선결제 없이')}<br />{t('지난 5년의 권리를 찾으세요.')}
            </h2>
            <div className="flex flex-col items-center gap-8 pt-8">
              <Button size="lg" asChild className="w-full sm:w-auto text-xl sm:text-3xl px-8 sm:px-12 py-8 sm:py-12 h-auto bg-[#0b192c] hover:bg-[#152a45] text-white border-2 border-[#e2b659] shadow-xl rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-normal break-words">
                <Link href="/estimate" className="flex items-center justify-center flex-wrap gap-4 text-center leading-tight py-4 w-full text-white">
                  <span className="flex-1 min-w-[200px] flex flex-wrap items-center justify-center gap-1.5 font-black text-white">
                    <span className="text-[#e2b659] font-black">{t('대한민국 국세청 공식 연동')}</span>
                    {language !== 'ko' && <span className="text-white font-medium">•</span>}
                    <span className="text-white font-black">{t('30초 만에 잠자는 내 숨은 돈 찾기')}</span>
                  </span> <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 text-white" />
                </Link>
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-black"><ShieldCheck className="h-6 w-6 text-primary" />{t('전문적인 서비스')}</div>
                <div className="hidden sm:block h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-900 font-black"><RotateCcw className="h-6 w-6 text-primary" />{t('리스크 제로')}</div>
              </div>
              <p className="text-slate-400 font-bold max-lg">{t('우리는 단순히 계산기만 돌리는 앱이 아닙니다. 전문적인 서비스, 리스크는 제로. 환급 성공 시에만 수수료가 청구되며 실패 시 수수료는 0원입니다.')}</p>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 8: 보안 안심 보증서 */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-slate-50 rounded-[4rem] p-10 md:p-20 relative overflow-hidden border border-slate-100 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] group-hover:bg-primary/10 transition-colors duration-1000 pointer-events-none" />
                
                <div className="relative flex flex-col lg:flex-row items-center gap-16">
                  <div className="shrink-0 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
                    <Image 
                      src="/certified_security_seal_premium_1774150786685.png" 
                      alt="Certified Security" 
                      width={220} 
                      height={220} 
                      className="relative transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-10 text-center lg:text-left">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/10 shadow-sm">
                        <Badge variant="outline" className="border-none bg-primary p-1 rounded-full"><Lock className="h-3 w-3 text-white" /></Badge>
                        <span className="text-sm font-black text-primary tracking-widest leading-none">{t('security_certified')}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight break-keep">
                        {t('security_card_title')}
                      </h2>
                      <p className="text-xl text-slate-500 font-bold max-xl mx-auto lg:mx-0 leading-relaxed">
                        {t('security_card_subtitle')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-black text-slate-800">{t('security_item_encryption_title')}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">{t('security_item_encryption_desc')}</p>
                      </div>
                      
                      <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Database className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-black text-slate-800">{t('security_item_no_storage_title')}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">{t('security_item_no_storage_desc')}</p>
                      </div>

                      <div className="space-y-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-black text-slate-800">{t('security_item_pippa_title')}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">{t('security_item_pippa_desc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 6: 미래 가치 */}
        <section className="py-32 bg-slate-900 text-white overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="absolute top-0 right-0 p-24 opacity-10"><Trophy className="h-96 w-96 text-primary" /></div>
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest">{t('당신의 미래 가치')}</Badge>
                  <h2 className="text-4xl lg:text-6xl font-black font-headline leading-tight">
                    {t('연간 200만 원,')}<br />{t('당신의 한국 생활이 달라집니다')}
                  </h2>
                </div>
                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">{t('매년 한 달 치 월급을 보너스로 받는다고 상상해 보세요. Easy Tax Refund가 찾아드리는 환급금은 단순한 숫자가 아닌 당신의 미래를 위한 소중한 자산입니다.')}</p>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4">
                  <p className="text-lg font-bold text-slate-300">{t(`"절차가 어렵다는 이유만으로 당신의 소중한 돈을 포기하지 마세요. 저희가 그 과정을 쉽고 완벽하게 만들어 드립니다."`)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors">
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center"><Plane className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-xl font-black text-white">{t('고향 방문 왕복 항공권')}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t('가족들을 만나러 가는 비행기 표, 이제 부담 없이 예약하세요.')}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors">
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center"><Home className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-xl font-black text-white">{t('수개월 치의 월세 및 생활비')}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t('고정 지출의 부담을 줄이고 여유 있는 한국 생활을 즐기세요.')}</p>
                </Card>
                <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors sm:col-span-2">
                  <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center"><Coins className="h-6 w-6 text-primary" /></div>
                  <h4 className="text-xl font-black text-white">{t('당신의 미래를 위한 종잣돈')}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t('더 큰 꿈을 향한 투자의 시작, 환급금이 든든한 기반이 됩니다.')}</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 사회적 증거(Social Proof) 리뷰 섹션 */}
        <section className="py-20 bg-slate-50/50 overflow-hidden border-t border-slate-100">
          <div className="container mx-auto px-4 mb-12 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-4 border-[#e2b659] text-slate-800 bg-[#e2b659]/5 rounded-full font-bold">
              {t('함께하는 동료들의 리얼 후기')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
              {t('이미 많은 외국인 동료들이 권리를 찾았습니다')}
            </h2>
          </div>
          
          <div className="relative flex gap-8 py-4">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-8">
                  {[
                    { 
                      name: "Nguyen", country: "베트남", flag: "🇻🇳", amount: "3,100,000", image: "/reviews/nguyen.png",
                      text: "맨 처음에는 한국어를 몰라서 인증앱을 어떻게 깔아야 하나 걱정부터 앞섰어요. 그런데 이지텍스리펀드의 자세한 안내를 하나하나 따라하다 보니 인증에 성공했구요. 결과는 대박! 제가 받을 수 있는 금액이 310만원이나 되더라구요. 신청 후 2달 뒤에 어김없이 국세청에서 입금되었습니다. 여러분 두려워 마세요!" 
                    },
                    { 
                      name: "Chen", country: "중국", flag: "🇨🇳", amount: "2,250,000", image: "/reviews/chen.png",
                      text: "솔직히 처음엔 사기인 줄 알고 의심했어요. 하지만 국세청 공식 데이터를 안전하게 가져온다는 설명을 보고 용기를 냈죠. SMS 인증이 조금 복잡했지만 그림 가이드 덕분에 성공했고, 정확히 8주 뒤에 225만원이 통장으로 들어왔습니다. 정말 믿을 수 있는 서비스예요." 
                    },
                    { 
                      name: "Hassan", country: "우즈베키스탄", flag: "🇺🇿", amount: "1,850,000", image: "/reviews/hassan.png",
                      text: "이름 대소문자랑 띄어쓰기 때문에 항상 실패했는데, 여기서 알려준 대로 하니까 바로 통과됐어요! 한국어가 서툴러도 그림만 보면 누구나 할 수 있습니다. 185만원이라는 큰 돈이 생겨서 너무 행복합니다. 우즈벡 친구들에게도 다 추천하고 있어요." 
                    },
                    { 
                      name: "Maria", country: "필리핀", flag: "🇵🇭", amount: "2,780,000", image: "/reviews/maria.png",
                      text: "인증앱 설치가 외국인에겐 제일 큰 장벽인데, 이 앱은 그걸 아주 쉽게 풀어서 알려줍니다. 보안도 확실해서 개인정보 유출 걱정도 없었어요. 한 달 반 만에 278만원 환급받았습니다. 포기하지 마시고 꼭 도전해 보세요!" 
                    },
                    { 
                      name: "Aris", country: "Indonesia", flag: "🇮🇩", amount: "1,420,000", image: "/reviews/aris.png",
                      text: "처음엔 내 정보를 넣는 게 무서웠어요. 하지만 암호화 기술과 무저장 원칙을 보고 신뢰가 생겼습니다. 인증 성공하고 조회해보니 142만원이나 있었네요! 실제로 돈이 입금되는 걸 확인하니 정말 감격스러웠습니다. 이지텍스리펀드 팀 감사합니다." 
                    },
                    { 
                      name: "Sita", country: "네팔", flag: "🇳🇵", amount: "3,000,000", image: "/reviews/sita.png",
                      text: "네팔 친구들은 세금을 돌려받을 수 있다는 사실조차 몰랐어요. 저도 긴가민가하면서 시작했는데 300만원 행운을 얻었습니다! 인증 과정이 조금 힘들 수 있지만 자세히 설명된 대로만 하면 저 같은 외국인도 충분히 성공할 수 있어요." 
                    },
                    { 
                      name: "Bat", country: "몽골", flag: "🇲🇳", amount: "950,000", image: "/reviews/bat.png",
                      text: "통신사 인증이 항상 문제였는데, 여기서 알려준 팁 덕분에 드디어 해결했습니다. 소액이라고 생각했는데 95만원이나 들어오니 기분 최고네요! 외국인을 위한 이런 서비스가 있어서 정말 다행입니다. 여러분도 본인의 권리를 찾으세요." 
                    },
                    { 
                      name: "Somchai", country: "태국", flag: "🇹🇭", amount: "2,120,000", image: "/reviews/somchai.png",
                      text: "신청하고 나서 정말 돈이 들어올까 매일 확인했어요. 정확히 약속한 날짜에 국세청에서 입금 알림이 왔을 때 소리를 질렀습니다! 212만원 환급 성공! 인증앱 때문에 포기하지 마세요. 차근차근 따라하다 보면 행운이 올 거예요." 
                    },
                    { 
                      name: "Vlad", country: "Russia", flag: "🇷🇺", amount: "1,680,000", image: "/reviews/vlad.png",
                      text: "보안이 제일 중요했는데 이 앱은 보안 보증서까지 있어서 안심하고 사용했습니다. SMS 인증 방법이 상세해서 외국인인 저도 5분 만에 끝냈어요. 168만원 환급금 받고 고향 부모님께 선물 보냈습니다. 정말 감사합니다!" 
                    },
                    { 
                      name: "Kyaw", country: "미얀마", flag: "🇲🇲", amount: "1,150,000", image: "/reviews/kyaw.png",
                      text: "미얀마 친구들이 사기 아니냐고 걱정했는데 제가 먼저 받고 증명했습니다! 115만원 통장에 찍히는 순간 다들 놀랐죠. 인증이 막힌다면 AI 비서에게 물어보세요. 정말 친절하게 알려줍니다. 모두 꼭 해보세요!" 
                    },
                  ].map((review, idx) => (
                    <Card key={idx} className="w-[450px] shrink-0 border-none shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08)] rounded-[2.5rem] bg-white border border-slate-50 transition-all hover:scale-[1.03] active:scale-95 group flex flex-col overflow-hidden">
                      <div className="relative h-[300px] w-full shrink-0">
                        <Image 
                          src={review.image} 
                          alt={review.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner leading-none group-hover:bg-primary/5 transition-colors">
                              {review.flag}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-lg tracking-tight">{review.name}</span>
                                <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] h-4 px-2 uppercase tracking-wider">VERIFIED</Badge>
                              </div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t(review.country)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                              <span className="text-primary font-black text-2xl tracking-tighter">+{review.amount}</span>
                              <span className="text-slate-400 font-black text-xs">{t('원')}</span>
                            </div>
                            <p className="text-[9px] text-green-500 font-black uppercase mt-1">Deposited ✓</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -top-3 -left-1 text-primary/10 text-5xl font-serif">"</div>
                          <p className="text-slate-600 font-bold leading-relaxed text-base pl-4 relative z-10 break-words whitespace-normal line-clamp-4">
                            {t(review.text)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
            {/* 측면 그래디언트 페이드 (고급스러움) */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50/100 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50/100 to-transparent z-10 pointer-events-none" />
          </div>
        </section>

        {/* 디자인 섹션 7: FAQ/AI Assistant & Contact Us Grid */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left/Middle Column (Col-span 2): FAQ List & AI assistant */}
              <div className="lg:col-span-2 space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight break-keep">
                    {t('궁금한 점이 있으신가요?')}
                  </h2>
                  <p className="text-slate-500 text-lg font-bold">{t('Easy Tax Refund AI 비서와 상세 FAQ가 도와드립니다.')}</p>
                </div>
                
                {/* AI Assistant Card */}
                {isAiVisible ? (
                  <Card className="border border-slate-200/60 shadow-lg relative overflow-hidden bg-white rounded-[2.5rem] p-6 lg:p-10 animate-in fade-in zoom-in duration-500">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[#e2b659] pointer-events-none">
                      <MessageCircle className="h-64 w-64" />
                    </div>
                    <button 
                      onClick={() => setIsAiVisible(false)}
                      className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all z-20 group"
                      title={t("AI 비서 숨기기")}
                    >
                      <Minimize2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <CardHeader className="relative z-10 px-0 pt-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Sparkles className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">{t('Easy Tax Refund AI 비서')}</CardTitle>
                          <CardDescription className="text-base font-medium">{t('어떤 질문이든 자유롭게 입력하세요. 365일 24시간 실시간 답변.')}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10 px-0 pb-0">
                      <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-4">
                        <input 
                          placeholder={t(`궁금한 점을 자유롭게 입력하세요.`)} 
                          className="h-16 text-base rounded-[1.2rem] border-slate-200 focus:ring-primary shadow-inner bg-slate-50/50 w-full sm:flex-1 px-6 outline-none transition-all focus:bg-white" 
                          value={question} 
                          onChange={(e) => setQuestion(e.target.value)} 
                        />
                        <button type="submit" className="h-16 px-8 rounded-[1.2rem] bg-[#0b192c] hover:bg-[#152a45] text-white flex items-center justify-center shadow-lg disabled:opacity-50 transition-all w-full sm:w-auto min-w-[120px] font-black" disabled={loading}>
                          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="flex items-center gap-2 text-base">{t('질문하기')} <Send className="h-5 w-5 text-[#e2b659]" /></div>}
                        </button>
                      </form>
                      {aiAnswer && (
                        <div className="p-8 bg-slate-900 text-white rounded-[2rem] border-none animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-2xl relative">
                          <div className="absolute top-6 right-8 flex items-center gap-4">
                            <Badge variant="outline" className="text-primary border-primary/30">AI Verified</Badge>
                            <button 
                              onClick={() => { setAiAnswer(null); setQuestion(""); }}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="flex gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/40">
                              <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div className="space-y-4">
                              <p className="font-bold text-primary tracking-widest uppercase text-xs">{t('AI Assistant Response')}</p>
                              <p className="text-lg text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{aiAnswer}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-500">
                    <Button 
                      onClick={() => setIsAiVisible(true)}
                      variant="outline" 
                      className="rounded-full px-8 py-4 border-primary/20 hover:bg-primary/5 text-primary font-bold gap-3 shadow-lg shadow-primary/5 group h-auto"
                    >
                      {t('Easy Tax Refund AI 비서 호출하기')}
                    </Button>
                  </div>
                )}

                {/* Accordion Questions */}
                <div className="space-y-12">
                  {faqData.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="space-y-6">
                      <div className="flex items-center gap-4 px-2">
                        <div className="h-8 w-1.5 bg-[#e2b659] rounded-full" />
                        <h2 className="text-xl lg:text-2xl font-black font-headline text-slate-900">{section.category}</h2>
                      </div>
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {section.items.map((item, itemIdx) => (
                          <AccordionItem key={itemIdx} value={`section-${sectionIdx}-item-${itemIdx}`} className="border-none rounded-[1.8rem] bg-slate-50 shadow-sm hover:shadow-md transition-all px-6 py-1">
                            <AccordionTrigger className="hover:no-underline font-bold text-base lg:text-lg py-5 text-left text-slate-800">
                              <div className="flex items-center gap-3 pr-3">
                                <HelpCircle className="h-5 w-5 text-slate-400 shrink-0" />
                                {item.q}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 text-sm pb-8 pl-8 leading-relaxed font-medium border-t border-slate-200/50 pt-6">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Contact Us & Map Widget */}
              <div className="space-y-8 lg:sticky lg:top-28 h-fit">
                
                {/* Contact Us Card */}
                <div className="bg-[#0b192c] text-white rounded-[2.5rem] p-8 border-t-4 border-[#e2b659] shadow-xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-[#e2b659] pointer-events-none">
                    <MessageCircle className="h-40 w-40" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-[#e2b659] tracking-tight">{t('Contact Us')}</h3>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">{t('궁금한 사항이 있으시면 공식 상담원 채널로 1:1 직접 대화해보세요.')}</p>
                  
                  <div className="space-y-4">
                    <a 
                      href="https://pf.kakao.com/_xxx" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-[#fef01b] text-slate-900 rounded-2xl p-4 font-black transition-all hover:scale-[1.03] active:scale-95 shadow-lg"
                    >
                      <span className="text-2xl shrink-0">💬</span>
                      <div className="text-left leading-tight">
                        <div className="text-[10px] font-bold opacity-70">{t('KakaoTalk Channel')}</div>
                        <div className="text-base font-black">{t('KakaoTalk')}</div>
                      </div>
                    </a>
                    
                    <a 
                      href="https://wa.me/82103259953" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-[#25d366] text-white rounded-2xl p-4 font-black transition-all hover:scale-[1.03] active:scale-95 shadow-lg"
                    >
                      <span className="text-2xl shrink-0">🟢</span>
                      <div className="text-left leading-tight">
                        <div className="text-[10px] font-bold opacity-80">{t('WhatsApp Channel')}</div>
                        <div className="text-base font-black">{t('WhatsApp')}</div>
                      </div>
                    </a>

                    <a 
                      href="tel:0103259953" 
                      className="flex items-center gap-4 bg-white/5 border border-white/10 text-white rounded-2xl p-4 font-black transition-all hover:scale-[1.03] active:scale-95 hover:bg-white/10"
                    >
                      <span className="text-2xl shrink-0">📞</span>
                      <div className="text-left leading-tight">
                        <div className="text-[10px] text-slate-400">{t('Official Customer Center')}</div>
                        <div className="text-base font-black">Official (010) 325-9953</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Map/Coverage Box */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-6 space-y-4">
                  <div className="text-slate-800 text-sm font-black tracking-tight">{t('Physical Locations Coverage')}</div>
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                    <Image 
                      src="/og-image.png" 
                      alt="Office Map Coverage"
                      fill
                      className="object-cover opacity-80"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-[#0b192c]/5 flex items-center justify-center">
                      <div className="bg-[#0b192c] text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-[#e2b659] shadow-md flex items-center gap-1.5 animate-bounce">
                        <span>📍</span>
                        <span>Seoul, Korea</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold leading-normal">{t('* 대한민국 전역(서울, 경기, 경남 등) 모든 관할 세무서와의 전산망 연계로 빠르고 정확한 처리가 실시간으로 보장됩니다.')}</p>
                </div>

              </div>

            </div>

            <div className="text-center pt-20 pb-10 border-t border-slate-200/60 mt-20">
              <div className="inline-flex flex-wrap justify-center items-center gap-6 px-10 py-5 rounded-3xl bg-white shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-6 w-6 text-primary" />
                  <span className="font-bold text-slate-700">{t('세무사 직접 검토')}</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                  <span className="font-bold text-slate-700">{t('금융권 수준 보안')}</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-10">
              <h3 className="text-2xl font-bold">{t('해결되지 않은 궁금증이 있나요?')}</h3>
              <AiChatDialog>
                <button className="inline-flex items-center justify-center rounded-2xl h-18 px-16 border-2 border-[#0b192c] text-[#0b192c] hover:bg-slate-50 text-xl font-black transition-all hover:scale-105 active:scale-95 shadow-sm">
                  {t('상담원과 실시간 채팅하기')}
                </button>
              </AiChatDialog>
            </div>

          </div>
        </section>
      </main>
      <Footer />
      <DaisoEventPopup />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 animate-fade-in-up delay-300">
        <Button size="lg" asChild className="w-full text-lg min-h-[4rem] h-auto bg-[#0b192c] hover:bg-[#152a45] text-white border border-[#e2b659] shadow-2xl rounded-2xl font-black py-4 px-6 whitespace-normal break-words">
          <Link href="/estimate" className="flex items-center justify-center flex-wrap gap-3 text-center leading-tight w-full text-white">
            <span className="flex-1 min-w-[150px] font-black text-white flex flex-wrap items-center justify-center gap-1">
              <span className="text-[#e2b659] font-black text-[15px] xs:text-base">{t('대한민국 국세청 공식 연동')}</span>
              {language !== 'ko' && <span className="text-white font-medium text-sm">•</span>}
              <span className="text-white font-black text-sm xs:text-base">{t('30초 만에 잠자는 내 숨은 돈 찾기')}</span>
            </span> <ArrowRight className="h-5 w-5 shrink-0 text-white" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
