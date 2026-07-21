"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/components/LanguageContext";
import {
  Headphones,
  MapPin,
  Star,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Clock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-[#0f1e36]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center pt-[96px] w-full">

        {/* ─── HERO ─── */}
        <div className="relative w-full h-[70vh] overflow-hidden flex items-center justify-center">
          <img
            src="/serene-light-wood-office-interior-ai-generation.jpg"
            alt="Customer Support Hero"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="relative z-20 text-center space-y-5 px-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-[0.3em] uppercase">Korea Tax Refund Service</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {t("고객센터")}
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-200 text-sm font-bold">
              <Link href="/" className="hover:text-[#b88c30] transition-colors">{t("홈")}</Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-[#b88c30]">{t("고객센터")}</span>
            </div>
          </div>
        </div>

        {/* ─── QUICK CONTACT STRIP ─── */}
        <section className="w-full bg-[#b88c30] py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-[#0f1e36]">
            <a href="tel:010-5864-8577" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Phone className="h-5 w-5 shrink-0" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{t("전화 상담")}</div>
                <div className="text-base font-black">010-5864-8577</div>
              </div>
            </a>
            <div className="h-8 w-px bg-[#0f1e36]/20 hidden sm:block" />
            <a href="mailto:zkfnth021@gmail.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Mail className="h-5 w-5 shrink-0" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{t("이메일")}</div>
                <div className="text-base font-black">zkfnth021@gmail.com</div>
              </div>
            </a>
            <div className="h-8 w-px bg-[#0f1e36]/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{t("상담 시간")}</div>
                <div className="text-base font-black">{t("평일 09:00 — 18:00")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <section className="w-full py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

              {/* ── Left: Contact Info ── */}
              <div className="lg:col-span-5 space-y-10">
                <div className="space-y-4">
                  <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">GET IN TOUCH</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-[#0f1e36] leading-tight">
                    {t("고객센터 연락처")}
                  </h2>
                  <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
                  <p className="text-slate-500 font-bold text-base leading-relaxed break-keep">
                    {t("궁금하신 사항은 아래 연락처로 문의주시거나, 우측 양식을 통해 문의를 남겨주세요. 담당 세무사가 신속히 답변드립니다.")}
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-5">
                  <div className="bg-white border border-t-4 border-t-[#b88c30] border-x-slate-200 border-b-slate-200 rounded-3xl p-7 space-y-3 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#b88c30]/10 rounded-xl flex items-center justify-center text-[#b88c30]">
                        <Phone className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-[#0f1e36]">{t("전화 상담")}</h3>
                    </div>
                    <a href="tel:010-5864-8577" className="text-2xl font-black text-[#0f1e36] hover:text-[#b88c30] transition-colors block">
                      010-5864-8577
                    </a>
                    <p className="text-slate-400 text-xs font-bold">{t("평일 09:00 ~ 18:00 (주말·공휴일 휴무)")}</p>
                  </div>

                  <div className="bg-white border border-t-4 border-t-[#0f1e36] border-x-slate-200 border-b-slate-200 rounded-3xl p-7 space-y-3 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#0f1e36]/5 rounded-xl flex items-center justify-center text-[#0f1e36]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-[#0f1e36]">{t("이메일 문의")}</h3>
                    </div>
                    <a href="mailto:zkfnth021@gmail.com" className="text-lg font-black text-[#0f1e36] hover:text-[#b88c30] transition-colors block break-all">
                      zkfnth021@gmail.com
                    </a>
                    <p className="text-slate-400 text-xs font-bold">{t("24시간 접수 · 영업일 기준 1일 내 답변")}</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-3 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#b88c30]/10 rounded-xl flex items-center justify-center text-[#b88c30]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-[#0f1e36]">{t("회사 위치")}</h3>
                    </div>
                    <p className="text-slate-600 text-sm font-bold leading-relaxed break-keep">
                      {t("경기도 남양주시 부평로 48번길 140, 107-1102")}
                    </p>
                  </div>
                </div>

                {/* Satisfaction Badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl py-5 px-7 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{t("고객 만족도")}</div>
                    <div className="text-2xl font-black text-[#0f1e36]">4.9 / 5.0</div>
                  </div>
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Trust note */}
                <div className="flex items-start gap-3 p-5 bg-[#0f1e36]/3 rounded-2xl border border-slate-200">
                  <ShieldCheck className="h-5 w-5 text-[#b88c30] shrink-0 mt-0.5" />
                  <p className="text-slate-500 text-xs font-bold leading-relaxed break-keep">
                    {t("본 서비스는 정식 제휴된 공인 세무사가 직접 대행합니다. 개인정보는 암호화되어 안전하게 보호됩니다.")}
                  </p>
                </div>
              </div>

              {/* ── Right: Contact Form ── */}
              <div className="lg:col-span-7 bg-white border border-t-4 border-t-[#b88c30] border-x-slate-200 border-b-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
                <div className="space-y-3">
                  <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">HAVE ANY QUESTIONS?</span>
                  <h2 className="text-3xl font-black text-[#0f1e36] tracking-tight">
                    {t("문의 사항 남기기")}
                  </h2>
                  <div className="h-1 w-10 bg-[#b88c30] rounded-full" />
                  <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">
                    {t("문의주신 내용은 담당 세무사 및 상담원이 확인 후 신속하게 답변해 드립니다.")}
                  </p>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); alert(t("문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.")); }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("성함")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("이름을 입력해 주세요")}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-2 focus:ring-[#b88c30]/20 bg-slate-50 text-[#0f1e36] font-bold transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("이메일 주소")}</label>
                      <input
                        type="email"
                        required
                        placeholder="example@email.com"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-2 focus:ring-[#b88c30]/20 bg-slate-50 text-[#0f1e36] font-bold transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("연락처")}</label>
                      <input
                        type="tel"
                        required
                        placeholder="010-0000-0000"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-2 focus:ring-[#b88c30]/20 bg-slate-50 text-[#0f1e36] font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("문의 내용")}</label>
                    <textarea
                      rows={5}
                      required
                      placeholder={t("문의 내용을 상세히 적어주세요")}
                      className="w-full p-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-2 focus:ring-[#b88c30]/20 bg-slate-50 text-[#0f1e36] font-bold resize-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#0f1e36] hover:bg-[#b88c30] text-white font-black rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg flex items-center justify-center gap-2 text-base"
                  >
                    <MessageSquare className="h-5 w-5" />
                    {t("문의 제출하기")}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* ─── MAP SECTION ─── */}
        <section className="w-full bg-slate-50 border-t border-slate-200 py-24 px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">LOCATION</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0f1e36]">{t("찾아오시는 길")}</h3>
              <div className="h-1 w-10 bg-[#b88c30] rounded-full" />
            </div>
            <div className="w-full overflow-hidden rounded-3xl border border-slate-200 shadow-lg bg-white h-[450px]">
              <iframe
                src="https://maps.google.com/maps?q=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EB%82%A8%EC%96%91%EC%A3%BC%EC%8B%9C%20%EB%B6%85%ED%8F%89%EB%A1%9C%2048%EB%B2%88%EA%B8%B8%20140&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* ─── DARK CTA ─── */}
        <section className="w-full bg-[#0f1e36] py-20 px-6 border-t-4 border-[#b88c30]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-widest uppercase">{t("무료 환급액 조회")}</span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight break-keep">
              {t("지금 바로 내 환급액을")}<br />{t("30초 만에 확인하세요")}
            </h2>
            <p className="text-slate-400 font-bold text-base break-keep max-w-xl mx-auto">
              {t("선결제 없이, 환급 성공 후 성공 보수만 수취합니다. (No Win, No Fee)")}
            </p>
            <Link
              href="/estimate"
              className="inline-flex items-center gap-2 bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black text-base px-10 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#b88c30]/20"
            >
              {t("예상 환급액 무료 조회하기")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
