"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/components/LanguageContext";
import {
  Percent,
  Coins,
  Calendar,
  UserCheck,
  Globe,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function YouthTaxPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-[#0f1e36]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full pt-[96px]">

        {/* ─── HERO ─── */}
        <div className="relative w-full h-[70vh] overflow-hidden flex items-center justify-center">
          <Image
            src="/KakaoTalk_20260712_205355534.png"
            alt="Youth Tax Reduction Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="relative z-20 text-center px-6 space-y-5">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-sm font-black tracking-[0.3em] uppercase">EASY TAX REFUND</span>
              <div className="h-px w-12 bg-[#b88c30]" />
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
              청년 소득세<br />
              <span className="text-[#b88c30]">90% 감면</span> 안내
            </h1>
            <p className="text-white text-base sm:text-xl font-black max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">
              외국인 근로자를 위한 대한민국 정부 공식 세금 감면 제도
            </p>
            <div className="flex items-center justify-center gap-2 text-white text-sm font-bold drop-shadow-[0_1px_6px_rgba(0,0,0,1)] pt-2">
              <Link href="/" className="hover:text-[#b88c30] transition-colors">홈</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#b88c30]">청년 소득세 감면 안내</span>
            </div>
          </div>
        </div>

        {/* ─── TRUST BADGE STRIP ─── */}
        <section className="w-full bg-[#fafafa] border-b border-slate-200 py-5 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-wider">
              <BadgeCheck className="h-4 w-4 text-[#b88c30]" />
              공인 세무사 직접 대행
            </div>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <img src="/nts-logo.jpg" alt="국세청" className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <div className="h-6 w-px bg-slate-300 hidden sm:block" />
            <img src="/official_nts_carrier_badge_v2_1774141326494.png" alt="국세청 공식 연동" className="h-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            <div className="h-6 w-px bg-slate-300 hidden sm:block" />
            <img src="/certified_security_seal_premium_1774150786685.png" alt="보안 인증" className="h-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              개인정보 보호 인증
            </div>
          </div>
        </section>

        {/* ─── INTRO DARK BAND ─── */}
        <section className="w-full bg-[#0f1e36] py-20 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-7">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-widest uppercase">외국인 근로자 숨은 세금 환급 안내</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug break-keep">
              몰라서 놓친 정당한 권리,<br className="hidden sm:block" />
              스마트폰으로 <span className="text-[#b88c30]">3분 만에</span> 찾아가세요!
            </h2>
            <div className="h-px w-20 bg-[#b88c30] mx-auto" />
            <p className="text-slate-300 text-base sm:text-lg font-bold leading-relaxed max-w-4xl mx-auto break-keep">
              한국에서 성실히 일하고 계시는 외국인 근로자 여러분! 마땅히 돌려받아야 할 세금을 그대로 방치하고 계시지 않나요?
              회사가 제도를 잘 몰라서, 혹은 신청이 번거로워서 챙겨주지 못한{" "}
              <span className="text-[#b88c30] font-black">'중소기업 취업자 소득세 감면'</span> 혜택을 Easy Tax Refund가 안전하고 완벽하게 찾아드립니다.
            </p>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="w-full bg-[#b88c30] py-10 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[#0f1e36]/20">
            {[
              { value: "90%", label: "소득세 감면율" },
              { value: "200만원", label: "연간 최대 혜택" },
              { value: "5년", label: "최대 적용 기간" },
              { value: "1,000만원", label: "최대 누적 환급" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1 px-4">
                <div className="text-3xl sm:text-4xl font-black text-[#0f1e36]">{stat.value}</div>
                <div className="text-xs font-black text-[#0f1e36]/70 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 1: 감면 제도 ─── */}
        <section className="w-full py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">01 — Benefit Details</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight break-keep">
                파격적인 세금 감면 제도,<br />알고 계셨나요?
              </h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* left */}
              <div className="space-y-8">
                {/* 핵심 설명 */}
                <p className="text-slate-600 text-base sm:text-lg font-bold leading-relaxed break-keep">
                  대한민국 정부는 중소기업에 취업한 청년 근로자들에게 매우 큰 세금 감면 혜택을 제공하고 있으며, 이는 외국인 근로자(베트남 등 모든 국적)에게도 동일하게 적용되는{" "}
                  <span className="text-[#0f1e36] font-black">정당한 권리</span>입니다.
                </p>

                {/* 어떤 세금인가? */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                    <span className="text-sm font-black text-[#0f1e36] uppercase tracking-wider">어떤 세금을 돌려받나요?</span>
                  </div>
                  <p className="text-slate-600 text-sm font-bold leading-relaxed break-keep">
                    매달 월급을 받을 때 회사가 <span className="font-black text-[#0f1e36]">급여에서 미리 떼어 가는 '근로소득세 (원천징수세)'</span>가 그 대상입니다. 예를 들어 월급이 250만원이라면 회사가 매월 약 3~8만원의 소득세를 자동으로 공제한 후 지급합니다. 이 세금의 <span className="font-black text-[#0f1e36]">90%</span>를 돌려받는 제도입니다.
                  </p>
                </div>

                {/* 실제 계산 예시 */}
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

                {/* 과거 환급 + 문제 */}
                <div className="space-y-4">
                  <div className="flex gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-black text-[#0f1e36] mb-1">과거 5년치 환급 가능 (경정청구)</div>
                      <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">
                        제도를 몰라서 신청하지 못했어도, <span className="font-black text-[#0f1e36]">'경정청구'</span>를 통해 최대 5년치 이미 납부한 세금을 <span className="font-black text-[#0f1e36]">전액 일시에</span> 돌려받을 수 있습니다. 퇴사 후에도 신청 가능합니다.
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

              {/* right: summary card */}
              <div className="bg-[#0f1e36] rounded-3xl p-8 sm:p-10 space-y-6 text-white shadow-2xl shadow-slate-900/20">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                  <img src="/official_nts_carrier_badge_v2_1774141326494.png" alt="국세청" className="h-7 object-contain" />
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
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                    <span className="text-slate-400 text-sm font-bold">{row.label}</span>
                    <span className="text-white text-sm font-black">{row.value}</span>
                  </div>
                ))}
                <Button asChild className="w-full bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black rounded-xl py-6 text-base mt-4">
                  <Link href="/estimate" className="flex items-center justify-center gap-2">
                    예상 환급액 무료 조회 <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>


        {/* ─── SECTION 2: 왜 ETR? ─── */}
        <section className="w-full py-24 px-6 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">02 — Our Strengths</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight break-keep">
                왜 Easy Tax Refund인가요?
              </h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <UserCheck className="h-7 w-7" />,
                  title: "회사를 거치지 않는 직접 신청",
                  desc: "회사에 눈치를 보거나 복잡한 요청을 할 필요가 없습니다. 근로자 본인이 앱을 통해 직접 신청하면 저희 전담 세무사가 국세청에 직접 청구합니다.",
                  accentTop: "border-t-[#b88c30]",
                },
                {
                  icon: <Globe className="h-7 w-7" />,
                  title: "다국어 지원 시스템",
                  desc: "어렵고 복잡한 한국의 세무·행정 용어를 외국인 근로자의 모국어로 쉽게 풀어서 제공하므로 언어 장벽이 전혀 없습니다.",
                  accentTop: "border-t-[#0f1e36]",
                },
                {
                  icon: <ShieldCheck className="h-7 w-7" />,
                  title: "불법 브로커 차단 및 안전 보장",
                  desc: "검증되지 않은 불법 브로커의 과도한 수수료 갈취나 개인정보 유출 위험이 없습니다. 정식 제휴된 전문 세무 대리인이 합법적이고 투명하게 대행합니다.",
                  accentTop: "border-t-[#b88c30]",
                },
              ].map((card, i) => (
                <div key={i} className={`bg-white border-t-4 ${card.accentTop} border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-black text-[#0f1e36] leading-snug">{card.title}</h3>
                  <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: PROCESS ─── */}
        <section className="w-full py-24 px-6 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="space-y-4">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">03 — Simple Process</span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0f1e36] leading-tight break-keep">
                환급 신청 및 수령 프로세스 <span className="text-[#b88c30]">(딱 3분!)</span>
              </h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
              <p className="text-slate-500 font-bold text-base sm:text-lg max-w-3xl break-keep">
                방문이나 복잡한 서류 제출 없이 스마트폰 하나로 간편하게 진행됩니다.
              </p>
              {/* No Win No Fee 배너 */}
              <div className="inline-flex items-center gap-3 bg-[#0f1e36] text-white text-sm font-black px-6 py-3 rounded-2xl shadow-lg mt-2">
                <ShieldCheck className="h-5 w-5 text-[#b88c30] shrink-0" />
                <span>선결제 수수료 0원 — 환급 성공 후 성공 보수만 수취 (No Win, No Fee)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-0.5 bg-[#b88c30]/30 z-0" />

              {[
                {
                  step: "01",
                  icon: <Clock className="h-6 w-6" />,
                  title: "홈페이지 접속 및 조회",
                  desc: "홈페이지 주소(또는 QR코드)로 접속하여 이름·외국인등록번호만 입력하면 30초 안에 예상 환급액을 무료로 확인할 수 있습니다.",
                  tag: "무료 · 즉시",
                },
                {
                  step: "02",
                  icon: <Percent className="h-6 w-6" />,
                  title: "전담 세무사 매칭 & 신청",
                  desc: "전담 공인 세무사가 1:1로 배정되어 경정청구 서류를 대신 준비하고 국세청에 직접 제출합니다. 수수료 선결제 없이 진행됩니다.",
                  tag: "선결제 없음",
                },
                {
                  step: "03",
                  icon: <Coins className="h-6 w-6" />,
                  title: "환급금 입금 후 성공 보수",
                  desc: "국세청에서 환급금이 본인 통장에 직접 입금된 뒤, 성공 보수를 수취합니다. 환급이 되지 않으면 수수료도 없습니다.",
                  tag: "No Win, No Fee",
                },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center px-6 py-8 relative z-10">
                  <div className="h-[60px] w-[60px] rounded-full bg-[#0f1e36] border-4 border-[#b88c30] flex items-center justify-center text-white font-black text-base mb-6 shadow-lg">
                    {s.step}
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#b88c30]/10 flex items-center justify-center text-[#b88c30] mb-4">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-black text-[#b88c30] uppercase tracking-widest bg-[#b88c30]/10 px-3 py-1 rounded-full mb-3">{s.tag}</span>
                  <h3 className="text-xl font-black text-[#0f1e36] mb-3">{s.title}</h3>
                  <p className="text-slate-500 font-bold text-sm sm:text-base leading-relaxed break-keep">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST SEAL SECTION ─── */}
        <section className="w-full py-16 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">Certification & Trust</span>
              <h3 className="text-2xl font-black text-[#0f1e36]">공신력 있는 기관과 함께합니다</h3>
              <div className="h-px w-12 bg-[#b88c30] mx-auto" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10 py-4">
              <div className="flex flex-col items-center gap-3">
                <img src="/nts-logo.jpg" alt="국세청" className="h-16 object-contain" />
                <span className="text-xs font-black text-slate-400">대한민국 국세청</span>
              </div>
              <div className="h-16 w-px bg-slate-200 hidden sm:block" />
              <div className="flex flex-col items-center gap-3">
                <img src="/official_nts_carrier_badge_v2_1774141326494.png" alt="국세청 공식 연동" className="h-16 object-contain" />
                <span className="text-xs font-black text-slate-400">국세청 공식 연동</span>
              </div>
              <div className="h-16 w-px bg-slate-200 hidden sm:block" />
              <div className="flex flex-col items-center gap-3">
                <img src="/certified_security_seal_premium_1774150786685.png" alt="보안 인증" className="h-16 object-contain" />
                <span className="text-xs font-black text-slate-400">보안 인증 서비스</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-bold max-w-2xl mx-auto leading-relaxed break-keep">
              ※ 본 서비스는 외국인 보호센터, 이주민 권익 옹호 단체 등 공신력 있는 파트너 기관들과 함께 안전하고 투명한 금융 환경을 만들어 갑니다.
            </p>
          </div>
        </section>

        {/* ─── CTA / SUPPORT ─── */}
        <section className="w-full bg-[#0f1e36] py-24 px-6 border-t-4 border-[#b88c30]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* left */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">Customer Support</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                지금 바로<br />무료로 확인하세요
              </h2>
              <p className="text-slate-400 font-bold text-sm sm:text-base leading-relaxed break-keep">
                Easy Tax Refund 고객지원 및 상담
              </p>
              <Button asChild size="lg" className="bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black text-base px-10 py-7 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#b88c30]/20">
                <Link href="/estimate" className="flex items-center gap-2">
                  예상 환급액 무료 조회하기 <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* right */}
            <div className="bg-[#0b192c] border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="text-xs font-black text-[#b88c30] uppercase tracking-widest pb-2 border-b border-slate-800">
                연락처 안내
              </div>
              {[
                { icon: <Phone className="h-5 w-5" />, label: "전화번호", value: "010-4885-8575", href: "tel:010-4885-8575" },
                { icon: <Mail className="h-5 w-5" />, label: "이메일", value: "zkfnth01@naver.com", href: "mailto:zkfnth01@naver.com" },
                { icon: <ExternalLink className="h-5 w-5" />, label: "홈페이지", value: "easy-tax-refund.vercel.app/welcome", href: "/welcome" },
              ].map((item, i) => (
                <a key={i} href={item.href} className="flex items-start gap-4 group">
                  <div className="h-10 w-10 bg-[#b88c30]/10 rounded-xl flex items-center justify-center text-[#b88c30] shrink-0 group-hover:bg-[#b88c30]/20 transition-all">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-0.5">{item.label}</div>
                    <div className="text-white font-black text-base group-hover:text-[#b88c30] transition-colors break-all">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
