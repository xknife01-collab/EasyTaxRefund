/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/
"use client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, ShieldCheck, UserCheck, Scale, RotateCcw, ArrowRight, AlertCircle, Coins, Sparkles, ChevronRight, X, Check } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageContext";

export default function PricingPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-[#0f1e36]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full pt-[96px]">

        {/* HERO */}
        <div className="relative w-full h-[70vh] overflow-hidden flex items-center justify-center">
          <img src="/asian-business-professionals-collaborating-office-meeting.jpg" alt="Pricing Hero" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="relative z-10 text-center px-6 space-y-5">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-[0.3em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">EASY TAX REFUND</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">{t('가격 정책')}</h1>
            <div className="flex items-center justify-center gap-2 text-white text-sm font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <Link href="/" className="hover:text-[#b88c30] transition-colors">{t('홈')}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#b88c30]">{t('가격 정책')}</span>
            </div>
          </div>
        </div>

        {/* CERTIFICATION STRIP */}
        <section className="w-full bg-white border-b border-slate-100 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <img src="/nts-logo.jpg" alt="국세청" className="h-16 object-contain" />
              <span className="text-xs font-black text-slate-400 tracking-wide">대한민국 국세청</span>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center gap-2">
              <img src="/official_nts_carrier_badge_v2_1774141326494.png" alt="공식연동" className="h-16 object-contain" />
              <span className="text-xs font-black text-slate-400 tracking-wide">공인 세무사 직접 대행</span>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center gap-2">
              <img src="/certified_security_seal_premium_1774150786685.png" alt="보안인증" className="h-16 object-contain" />
              <span className="text-xs font-black text-slate-400 tracking-wide">개인정보 보호 인증</span>
            </div>
          </div>
        </section>

        {/* DARK INTRO */}
        <section className="w-full bg-[#0f1e36] py-20 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-7">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-widest uppercase">가격 정책</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight break-keep">
              선결제 0원, 오직 환급 성공 시에만<br />
              <span className="text-[#b88c30]">후불제 자동 정산</span>
            </h2>
            <div className="h-px w-20 bg-[#b88c30] mx-auto" />
            <p className="text-slate-300 text-base sm:text-xl font-bold leading-relaxed max-w-4xl mx-auto break-keep">
              대한민국 국가공인 전문 세무법인 제휴 및 정밀 분석 솔루션으로 안전하고 확실하게 지난 세금을 돌려받으세요.
            </p>
          </div>
        </section>

        {/* 후불 FLOW TIMELINE */}
        <section className="w-full bg-white py-20 px-6 border-t border-slate-100">
          <div className="max-w-5xl mx-auto space-y-14">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black tracking-[0.3em] uppercase">후불 정산 순서</span>
                <div className="h-px w-10 bg-[#b88c30]" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0f1e36]">신청부터 환급까지, 3단계</h2>
            </div>

            {/* Steps */}
            <div className="relative">
              {/* connecting gold line */}
              <div className="hidden md:block absolute top-6 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-[#b88c30]" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {[
                  {
                    num: "01",
                    icon: "⏱",
                    tag: "무료 · 즉시",
                    title: "홈페이지 접속 및 조회",
                    desc: "홈페이지 주소(또는 QR코드)로 접속하여 이름·외국인등록번호만 입력하면 30초 안에 예상 환급액을 무료로 확인할 수 있습니다.",
                  },
                  {
                    num: "02",
                    icon: "%",
                    tag: "선결제 없음",
                    title: "전담 세무사 매칭 & 신청",
                    desc: "전담 공인 세무사가 1:1로 배정되어 경정청구 서류를 대신 준비하고 국세청에 직접 제출합니다. 수수료 선결제 없이 진행됩니다.",
                  },
                  {
                    num: "03",
                    icon: "💰",
                    tag: "NO WIN, NO FEE",
                    title: "환급금 입금 후 성공 보수",
                    desc: "국세청에서 환급금이 본인 통장에 직접 입금된 뒤, 성공 보수를 수취합니다. 환급이 되지 않으면 수수료도 없습니다.",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-5">
                    {/* Number circle */}
                    <div className="h-12 w-12 rounded-full bg-[#0f1e36] text-[#b88c30] font-black text-lg flex items-center justify-center shadow-lg ring-4 ring-white">
                      {step.num}
                    </div>
                    {/* Icon circle */}
                    <div className="h-14 w-14 rounded-full bg-[#f5f0e8] flex items-center justify-center text-xl shadow-sm">
                      {step.icon}
                    </div>
                    {/* Tag */}
                    <span className="text-xs font-black text-[#b88c30] italic tracking-wider border border-[#b88c30]/30 rounded-full px-3 py-1 bg-[#b88c30]/5">
                      {step.tag}
                    </span>
                    {/* Title */}
                    <h3 className="text-lg font-black text-[#0f1e36] leading-snug">{step.title}</h3>
                    {/* Desc */}
                    <p className="text-slate-500 font-bold text-sm leading-relaxed break-keep max-w-xs">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE CARDS */}
        <section className="w-full py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">01 — Core Benefits</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight">3가지 핵심 혜택</h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Sparkles className="h-7 w-7" />, bg: "bg-[#b88c30]/10 text-[#b88c30]", accent: "border-t-[#b88c30]", tag: "진행 리스크 0%", tagColor: "text-[#b88c30]", title: "초기 비용 0원, 완전 무료 시작", desc: "서비스 신청 시 필요한 비용은 전혀 없습니다. 예상 환급액 조회부터 전문 세무사의 전담 검토 단계까지, 신청 시점에 내야 할 돈은 단 1원도 없습니다." },
                { icon: <RotateCcw className="h-7 w-7" />, bg: "bg-red-50 text-red-500", accent: "border-t-[#0f1e36]", tag: "성공 보수 100%", tagColor: "text-red-500", title: "환급 거절/실패 시 수수료 0원", desc: "세무서 심사 결과 환급액이 나오지 않으면 서비스 수수료도 청구되지 않습니다. 고객님은 비용 손실이나 리스크가 0%이므로 안심하고 권리를 찾으세요." },
                { icon: <Coins className="h-7 w-7" />, bg: "bg-emerald-50 text-emerald-600", accent: "border-t-[#b88c30]", tag: "후불 자동 정산", tagColor: "text-emerald-600", title: "환급금 입금된 후 후불 정산", desc: "국세청에서 고객님 명의의 은행 계좌로 환급금을 직접 입금해 드리면, 그 이후에 후불 정산합니다." },
              ].map((c, i) => (
                <div key={i} className={`bg-white border-t-4 ${c.accent} border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className={`h-14 w-14 ${c.bg} rounded-2xl flex items-center justify-center`}>{c.icon}</div>
                  <div className="space-y-3">
                    <span className={`text-xs font-black ${c.tagColor} uppercase tracking-widest`}>{c.tag}</span>
                    <h3 className="text-xl font-black text-[#0f1e36] leading-snug">{c.title}</h3>
                    <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALCULATION EXAMPLE */}
        <section className="w-full bg-slate-50 border-t border-slate-100 py-24 px-6">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">02 — Real Example</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight break-keep">실제 환급액 계산 예시</h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
              <p className="text-slate-500 font-bold text-base">월급 250만원 / 중소기업 재직 <span className="text-[#b88c30] font-black">3년</span> 기준 / E-9 비자</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "3년간 원천징수 세액", value: "약 252만원", sub: "84만원 × 3년 공제", color: "bg-white border border-slate-200" },
                { label: "90% 소득세 감면 적용", value: "약 227만원", sub: "정부 혜택 환급 대상", color: "bg-white border border-slate-200" },
                { label: "서비스 수수료 25%", value: "약 57만원", sub: "환급 입금 후 후납", color: "bg-[#0f1e36] text-white" },
                { label: "최종 순수령액", value: "약 170만원", sub: "내 통장으로 직접 입금", color: "bg-[#b88c30]" },
              ].map((item, i) => (
                <div key={i} className={`${item.color} rounded-3xl p-7 space-y-3`}>
                  <div className={`text-xs font-black uppercase tracking-widest ${item.color.includes('#0f1e36') ? 'text-slate-500' : item.color.includes('#b88c30') ? 'text-[#0f1e36]/60' : 'text-slate-400'}`}>{String(i + 1).padStart(2, '0')}</div>
                  <div className={`text-2xl font-black ${item.color.includes('#0f1e36') ? 'text-white' : item.color.includes('#b88c30') ? 'text-[#0f1e36]' : 'text-[#0f1e36]'}`}>{item.value}</div>
                  <div className={`text-sm font-black ${item.color.includes('#0f1e36') ? 'text-slate-300' : 'text-[#0f1e36]'}`}>{item.label}</div>
                  <div className={`text-xs font-bold ${item.color.includes('#0f1e36') ? 'text-slate-500' : 'text-[#0f1e36]/60'}`}>{item.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-bold">* 위 금액은 예시이며 실제 환급액은 근무 기간, 소득, 비자 종류 등에 따라 다를 수 있습니다.</p>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="w-full py-24 px-6 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">03 — Why Us</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight break-keep">왜 Easy Tax Refund인가?</h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-slate-50 px-8 py-5 text-left text-sm font-black text-slate-400 uppercase tracking-widest w-1/3">비교 항목</th>
                    <th className="bg-slate-100 px-8 py-5 text-center text-sm font-black text-slate-500 w-1/3">타 서비스 (선결제)</th>
                    <th className="bg-[#0f1e36] px-8 py-5 text-center text-sm font-black text-[#b88c30] w-1/3">Easy Tax Refund (후불제)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { item: "신청 초기 비용", other: "수만~수십만원", us: "완전 무료 (0원)" },
                    { item: "환급 실패 시", other: "수수료 환불 안 됨", us: "수수료 청구 없음" },
                    { item: "수수료 납부 시점", other: "신청 전 선결제", us: "환급금 입금 후 후납" },
                    { item: "세무사 직접 대행", other: "자동화 처리만", us: "공인 세무사 1:1 검토" },
                    { item: "고객 리스크", other: "높음 (선납 손실 위험)", us: "0% (No Win, No Fee)" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-black text-sm text-[#0f1e36]">{row.item}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
                          <X className="h-4 w-4 shrink-0" />{row.other}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center bg-[#0f1e36]/5">
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-sm">
                          <Check className="h-4 w-4 shrink-0" />{row.us}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* WHY 25% + COMPLIANCE */}
        <section className="w-full py-24 px-6 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">04 — Our Service</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight break-keep">왜 25%의 수수료가 발생하나요?</h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
              <p className="text-slate-500 font-bold">외국인 세금 환급은 한국인보다 과정이 훨씬 까다롭습니다.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 bg-white border border-t-4 border-t-[#b88c30] border-x-slate-200 border-b-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm">
                {[
                  { icon: <CheckCircle2 className="h-6 w-6 text-[#b88c30] shrink-0 mt-1" />, title: "국가공인 제휴 세무사의 전 과정 책임 대행", desc: "환급 신청서 작성부터 환급금이 통장에 입금되는 마지막 순간까지, 대한민국 국가공인 전문 세무사가 모든 심사와 행정 과정을 전담하여 책임 처리합니다." },
                  { icon: <CheckCircle2 className="h-6 w-6 text-[#b88c30] shrink-0 mt-1" />, title: "제휴 세무사의 1:1 맞춤 정밀 검토", desc: "단순 계산 오류나 비자 타입(E-9, E-7 등) 누락을 최소화하여 환급 성공률을 극대화합니다." },
                  { icon: <UserCheck className="h-6 w-6 text-[#b88c30] shrink-0 mt-1" />, title: "비대면 자동화 세무 서류 생성 솔루션", desc: "지난 5년 치의 소득세 납부 데이터를 안전하게 암호화하여 처리하는 독자적인 기술 솔루션을 제공합니다." },
                  { icon: <ShieldCheck className="h-6 w-6 text-[#b88c30] shrink-0 mt-1" />, title: "국세청 공식 절차(경정청구) 전담 마크", desc: "접수부터 국세청 심사관 대응까지 환급금이 통장에 최종 입금되는 순간까지 모든 프로세스를 밀착 케어합니다." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    {item.icon}
                    <div>
                      <h4 className="font-black text-[#0f1e36] text-base mb-1">{item.title}</h4>
                      <p className="text-slate-500 font-bold text-sm leading-relaxed break-keep">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-2 bg-[#0f1e36] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl shadow-slate-900/20">
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#b88c30]" />
                    <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">준수 사항 (COMPLIANCE)</span>
                  </div>
                  <div className="h-px w-10 bg-[#b88c30]" />
                  <h3 className="text-2xl font-black text-white leading-tight">합법적인 세무 프로세스</h3>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed break-keep">* 본 서비스는 대한민국 국가공인 전문 세무법인과의 공식 기술 제휴를 통해 운영되며, 세무 분석 및 신청 지원 솔루션을 제공합니다. 고객님의 실제 세무 신고 및 환급 대행 업무는 제휴 세무법인의 책임 하에 안전하고 적법하게 처리되므로 안심하셔도 됩니다.</p>
                </div>
                <div className="pt-8">
                  <Link href="/estimate" className="w-full h-14 bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl text-base">
                    지금 무료로 조회하기 <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST QUOTE CTA */}
        <section className="w-full bg-[#0f1e36] py-20 px-6 border-t-4 border-[#b88c30]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-widest uppercase">신뢰 보장</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <blockquote className="text-3xl sm:text-4xl font-black text-white italic leading-tight">"전문적인 서비스, 리스크 제로."</blockquote>
            <p className="text-slate-400 font-bold">환급이 끝난 후에만 수수료를 받습니다. 리스크는 제로.</p>
            <Link href="/estimate" className="inline-flex items-center gap-2 bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black text-base px-10 py-5 rounded-2xl transition-all hover:scale-105 shadow-xl mt-4">
              예상 환급액 무료 조회하기 <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
