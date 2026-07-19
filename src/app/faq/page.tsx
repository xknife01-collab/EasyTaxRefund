/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { Sparkles, Send, Loader2, HelpCircle, BadgeCheck, ShieldCheck, X, ChevronRight, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";
import Link from "next/link";

export default function FAQPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAiAnswer(null);
    try {
      const result = await askFaqQuestion({ question, language });
      setAiAnswer(result.answer);
    } catch {
      toast({ variant: "destructive", title: t("AI 비서 연결 실패"), description: t("잠시 후 다시 시도해 주세요.") });
    } finally {
      setLoading(false);
    }
  };

  const faqSections = [
    {
      category: t("비자 및 체류 자격"),
      subtitle: t("비자 종류와 체류 상태에 따른 신청 가능 여부를 확인하세요."),
      items: [
        { q: t("비자 종류(E-7, E-9, F-2 등)에 상관없이 신청할 수 있나요?"), a: t("네, 비자 종류보다는 '거주자(183일 이상 한국 거주)' 여부와 '중소기업 근무' 여부가 중요합니다. 요건만 충족한다면 대부분의 취업 비자 소지자가 혜택 대상입니다.") },
        { q: t("지금은 회사를 그만두고 구직 중(D-10)이거나 본국으로 돌아갈 예정인데 가능한가요?"), a: t("과거 5년 이내에 한국 중소기업에서 일하며 세금을 냈던 기록이 있다면, 현재 무직 상태이거나 출국 예정이라도 지난 세금을 돌려받을 수 있습니다.") },
        { q: t("이 신청이 내 비자 연장이나 영주권 신청에 불이익을 주지 않나요?"), a: t("전혀 그렇지 않습니다. 이것은 정부가 법적으로 보장하는 정당한 세제 혜택이며, 세금을 체납하는 것이 아니라 이미 낸 세금을 법에 따라 환급받는 것이므로 비자 상태에 아무런 영향을 주지 않습니다.") }
      ]
    },
    {
      category: t("회사와의 관계"),
      subtitle: t("사장님 몰래, 회사를 통하지 않고 신청할 수 있는지 확인하세요."),
      items: [
        { q: t("회사 몰래 신청할 수 있나요? 사장님이 알면 싫어하실까 봐 걱정돼요."), a: t("과거의 세금을 돌려받는 '경정청구'는 회사를 통하지 않고 본인이 직접 세무서에 신청하는 것입니다. 회사에는 어떠한 통보도 가지 않으며, 회사가 비용을 부담하는 것도 아니니 안심하고 신청하셔도 됩니다.") },
        { q: t("회사가 중소기업인지 어떻게 확인하나요?"), a: t("저희 앱에 접속하여 사업자 번호만 입력하시면, 저희 AI 시스템이 해당 기업이 감면 대상인 '중소기업 기본법'상의 중소기업인지 즉시 판별해 드립니다.") }
      ]
    },
    {
      category: t("환급 및 세금"),
      subtitle: t("환급 금액, 입금 시기, 수수료 구조에 대한 모든 궁금증을 해결합니다."),
      items: [
        { q: t("이미 연말정산을 했는데 또 받을 수 있는 게 있나요?"), a: t("네, 연말정산 때 이 감면 혜택(90% 감면)을 적용받지 못했다면, 놓친 금액만큼을 '경정청구'라는 절차를 통해 별도로 돌려받을 수 있습니다.") },
        { q: t("돈은 언제, 어디로 들어오나요?"), a: t("신청 후 세무서의 검토를 거쳐 보통 1~2개월 이내에 신청 시 입력하신 본인 명의의 한국 은행 계좌로 국세청에서 직접 입금됩니다.") },
        { q: t("환급금이 없으면 수수료를 안 내도 되나요?"), a: t("네, 저희 서비스는 '성공 보수' 원칙입니다. 예상 환급액을 확인하는 것은 무료이며, 실제 환급액이 발생하지 않으면 어떠한 수수료도 청구되지 않습니다.") }
      ]
    },
    {
      category: t("본인 인증 및 오류"),
      subtitle: t("외국인 이름 불일치나 휴대폰 인증 문제를 해결하는 방법을 안내합니다."),
      items: [
        { q: t("이름이 외국인 등록증(ARC)이랑 통신사에 등록된 게 다른데 어떡하죠?"), a: t("외국인들이 가장 많이 겪는 문제입니다. 저희 앱의 'AI 이름 최적화' 기능을 사용하면, 다양한 이름 조합을 자동으로 테스트하여 인증에 성공할 수 있도록 도와드립니다.") },
        { q: t("한국 핸드폰 번호가 없으면 신청이 불가능한가요?"), a: t("앱을 통한 자동 조회를 위해서는 본인 명의의 휴대폰 인증이 필수입니다. 만약 본인 명의의 휴대폰이 없으시다면, 가까운 주민센터나 세무서에서 원천징수영수증을 발급받아 실시간 상담원 채팅으로 보내주세요.") }
      ]
    },
    {
      category: t("연령 및 기간"),
      subtitle: t("나이 제한과 신청 가능 기간에 대한 오해를 바로잡습니다."),
      items: [
        { q: t("저는 만 34세가 넘었는데 아예 방법이 없나요?"), a: t("현재 나이가 만 34세가 넘었더라도, '취업 당시' 나이가 만 34세 이하였다면 그 시점부터 5년 동안의 세금은 환급받을 수 있습니다. 포기하기 전에 꼭 확인해 보세요.") },
        { q: t("한국에 온 지 1년밖에 안 됐는데 신청 가능한가요?"), a: t("네, 입사한 날로부터 바로 혜택이 시작됩니다. 작년에 냈던 세금을 지금 바로 환급 신청하세요.") }
      ]
    }
  ];

  const reviews = [
    { name: "Nguyen T.H.", country: "🇻🇳 " + t("베트남"), text: t("회사에 말도 안 했는데 3개월치 세금을 돌려받았어요. 진짜 신기했습니다."), amount: t("약 142만원 환급") },
    { name: "Ahmad R.", country: "🇮🇩 " + t("인도네시아"), text: t("한국어 모르는데 세무사님이 다 도와주셔서 정말 편했어요. 수수료도 입금 후에 냈습니다."), amount: t("약 198만원 환급") },
  ];

  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-[#0f1e36]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full pt-[96px]">

        {/* ─── HERO ─── */}
        <div className="relative w-full bg-[#0f1e36] py-28 px-6 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)", backgroundSize: "40px 40px" }}
          />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-[0.3em] uppercase">EASY TAX REFUND</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
              {t("당신의 궁금증을")}<br />
              <span className="text-[#b88c30]">{t("명쾌하게 해결해 드립니다")}</span>
            </h1>
            <div className="h-px w-20 bg-[#b88c30] mx-auto" />
            <p className="text-slate-300 text-base sm:text-xl font-bold max-w-2xl mx-auto leading-relaxed break-keep">
              {t("외국인 근로자의 권리, 이제는 전문가와 AI에게 물어보세요.")}
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold pt-4">
              <Link href="/" className="hover:text-[#b88c30] transition-colors">{t("홈")}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#b88c30]">{t("자주 묻는 질문")}</span>
            </div>
          </div>
        </div>


        {/* ─── CERTIFICATION STRIP ─── */}
        <section className="w-full bg-white border-b border-slate-100 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <img src="/nts-logo.jpg" alt={t("국세청")} className="h-16 object-contain" />
              <span className="text-xs font-black text-slate-400 tracking-wide">{t("대한민국 국세청")}</span>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center gap-2">
              <img src="/official_nts_carrier_badge_v2_1774141326494.png" alt={t("국세청 공식 연동")} className="h-16 object-contain" />
              <span className="text-xs font-black text-slate-400 tracking-wide">{t("공인 세무사 직접 대행")}</span>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center gap-2">
              <img src="/certified_security_seal_premium_1774150786685.png" alt={t("보안 인증")} className="h-16 object-contain" />
              <span className="text-xs font-black text-slate-400 tracking-wide">{t("개인정보 보호 인증")}</span>
            </div>
          </div>
        </section>

        {/* ─── IMPACT NUMBERS STRIP ─── */}
        <section className="w-full bg-[#b88c30] py-10 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[#0f1e36]/20">
            {[
              { value: t("5년치"), label: t("소급 환급 가능") },
              { value: t("180만원"), label: t("평균 환급액") },
              { value: t("1~2개월"), label: t("평균 입금 기간") },
              { value: t("0원"), label: t("실패 시 수수료") },
            ].map((s, i) => (
              <div key={i} className="space-y-1 px-4">
                <div className="text-2xl sm:text-3xl font-black text-[#0f1e36]">{s.value}</div>
                <div className="text-xs font-black text-[#0f1e36]/70 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── AI ASSISTANT ─── */}
        <section className="w-full py-20 px-6 bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 60px)", backgroundSize: "60px 60px" }}
          />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2 space-y-5">
                <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">AI Assistant</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  {t("AI 세무 비서에게")}<br />{t("바로 물어보세요")}
                </h2>
                <div className="h-1 w-10 bg-[#b88c30] rounded-full" />
                <p className="text-slate-400 font-bold text-base leading-relaxed break-keep">
                  {t("어떤 질문이든 자유롭게 입력하세요.")}<br />{t("365일 24시간 실시간 답변.")}
                </p>
                <div className="flex items-center gap-3 text-xs font-black text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {t("개인정보 암호화 처리")}
                </div>
              </div>
              <div className="lg:col-span-3 bg-[#0f1e36] border border-[#b88c30]/20 rounded-3xl p-8 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="h-10 w-10 bg-[#b88c30]/10 rounded-xl flex items-center justify-center text-[#b88c30]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black text-white">{t("Easy Tax Refund AI 비서")}</span>
                </div>
                <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder={t("예: E-7 비자인데 환급 신청할 수 있나요?")}
                    className="flex-1 h-14 px-5 rounded-2xl border border-slate-700 focus:outline-none focus:border-[#b88c30] focus:ring-2 focus:ring-[#b88c30]/20 bg-slate-800 text-white font-bold placeholder:text-slate-500 transition-all"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button type="submit" disabled={loading}
                    className="h-14 px-8 rounded-2xl bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
                {aiAnswer && (
                  <div className="p-6 bg-slate-800 rounded-2xl space-y-4 relative border border-[#b88c30]/20">
                    <button onClick={() => { setAiAnswer(null); setQuestion(""); }}
                      className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#b88c30] flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">AI Response</span>
                    </div>
                    <p className="text-slate-200 font-bold leading-relaxed text-base whitespace-pre-wrap">{aiAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ SECTIONS ─── */}
        <section className="w-full bg-slate-50 border-t border-slate-100 py-24 px-6">
          <div className="max-w-5xl mx-auto space-y-20">
            {faqSections.map((section, si) => (
              <div key={si}>
                {/* Gold divider */}
                {si > 0 && <div className="h-px bg-gradient-to-r from-transparent via-[#b88c30]/40 to-transparent mb-20" />}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                  <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-28">
                    <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">
                      {String(si + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl font-black text-[#0f1e36] leading-snug break-keep">{section.category}</h3>
                    <div className="h-1 w-8 bg-[#b88c30] rounded-full" />
                    <p className="text-slate-500 font-bold text-sm leading-relaxed break-keep">{section.subtitle}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                      {section.items.map((item, ii) => (
                        <AccordionItem key={ii} value={`s${si}-i${ii}`}
                          className="border-none bg-white rounded-2xl shadow-sm hover:shadow-md transition-all px-6 py-1">
                          <AccordionTrigger className="hover:no-underline font-black text-base sm:text-lg py-5 text-left text-[#0f1e36] gap-3">
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-black text-[#b88c30] bg-[#b88c30]/10 rounded-lg px-2 py-1 shrink-0 mt-0.5">
                                Q{ii + 1}
                              </span>
                              {item.q}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-500 font-bold text-sm sm:text-base pb-6 pl-10 leading-relaxed break-keep border-t border-slate-100 pt-5">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── REVIEWS ─── */}
        <section className="w-full bg-[#0f1e36] py-20 px-6 border-t border-slate-800">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">{t("실제 고객 후기")}</span>
              <h2 className="text-3xl font-black text-white">{t("4.9점 고객 만족도")}</h2>
              <div className="flex justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((r, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-slate-200 font-bold text-base leading-relaxed break-keep">"{r.text}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div>
                      <div className="text-white font-black text-sm">{r.name}</div>
                      <div className="text-slate-400 text-xs font-bold">{r.country}</div>
                    </div>
                    <div className="text-[#b88c30] font-black text-sm">{r.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST BADGES ─── */}
        <section className="w-full bg-white border-t border-slate-200 py-12 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: <BadgeCheck className="h-5 w-5 text-[#b88c30]" />, label: t("세무사 직접 검토") },
              { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, label: t("금융권 수준 보안") },
              { icon: <Sparkles className="h-5 w-5 text-[#b88c30]" />, label: t("AI 정밀 분석") },
              { icon: <HelpCircle className="h-5 w-5 text-[#0f1e36]" />, label: t("24시간 실시간 답변") },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-[#b88c30]/40 transition-all">
                {item.icon}
                <span className="text-sm font-black text-[#0f1e36]">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DARK CTA ─── */}
        <section className="w-full bg-[#0f1e36] py-20 px-6 border-t-4 border-[#b88c30]">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">{t("해결되지 않은 궁금증")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight break-keep">
                {t("아직 궁금하신 게 있으신가요?")}<br />{t("상담원과 직접 대화하세요")}
              </h2>
              <p className="text-slate-400 font-bold text-base break-keep">
                {t("전담 세무사와 1:1 실시간 채팅으로 빠르고 정확하게 해결해 드립니다.")}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {/* 카카오톡 */}
              <a 
                href="https://pf.kakao.com/_xxx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 rounded-full bg-[#fef01b] hover:bg-[#ebd905] text-[#0b192c] font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2.5"
              >
                <img src="/Kakao Talk.png" alt="KakaoTalk" className="h-9 w-9 object-contain shrink-0" />
                {t('카카오톡 실시간 상담')}
              </a>
              
              {/* 왓츠앱 */}
              <a 
                href="https://wa.me/82103259953" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 rounded-full bg-[#25d366] hover:bg-[#1ebd58] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2.5"
              >
                <img src="/WhatsApp.png" alt="WhatsApp" className="h-9 w-9 object-contain shrink-0" />
                {t('왓츠앱 실시간 상담')}
              </a>

              {/* 텔레그램 */}
              <a 
                href="https://t.me/easytaxrefund" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2.5"
              >
                <img src="/Telegram.png" alt="Telegram" className="h-9 w-9 object-contain shrink-0" />
                {t('텔레그램 실시간 상담')}
              </a>

              <Link href="/estimate"
                className="w-full h-14 border border-slate-700 hover:border-[#b88c30] text-white font-black rounded-full flex items-center justify-center gap-2 transition-all text-base mt-2">
                {t('예상 환급액 무료 조회하기')}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
