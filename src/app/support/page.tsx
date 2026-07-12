"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/components/LanguageContext";
import { Headphones, MapPin, Star } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center pt-[96px] w-full">
        {/* Hero Section */}
        <div className="relative w-full h-[600px] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/60 z-10" />
          <img
            src="/serene-light-wood-office-interior-ai-generation.jpg"
            alt="Customer Support Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-headline">
              {t("고객센터")}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300 font-bold">
              <Link href="/" className="hover:text-white transition-colors">{t("홈")}</Link>
              <span>/</span>
              <span className="text-[#b88c30]">{t("고객센터")}</span>
            </div>
          </div>
        </div>

        {/* Contact info and Form */}
        <div className="w-full max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Column: Contact info */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-[#b88c30] bg-[#b88c30]/10 border border-[#b88c30]/20 uppercase">
                  {t("GET IN TOUCH")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {t("고객센터 연락처")}
                </h2>
              </div>

              {/* Cards */}
              <div className="space-y-6">
                {/* Location Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-[#b88c30]/10 flex items-center justify-center text-[#b88c30]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">{t("회사 위치")}</h3>
                    <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                      {t("경기도 남양주시 부평로 48번길 140, 107-1102")}
                    </p>
                  </div>
                </div>

                {/* Support Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-[#b88c30]/10 flex items-center justify-center text-[#b88c30]">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">{t("24/7 실시간 상담")}</h3>
                    <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                      {t("연락처: 010-5864-8577")}<br />
                      {t("이메일: zkfnth01@naver.com")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Satisfaction Badge */}
              <div className="bg-slate-100 border border-slate-200/50 rounded-2xl py-4 px-6 flex items-center justify-center gap-2">
                <span className="text-xs font-black text-slate-700">
                  {t("고객 만족도 4.9")}
                </span>
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] space-y-8">
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-[#b88c30] bg-[#b88c30]/10 border border-[#b88c30]/20 uppercase">
                  {t("HAVE ANY QUESTIONS?")}
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t("문의 사항 남기기")}
                </h2>
                <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                  {t("문의주신 내용은 담당 세무사 및 상담원이 확인 후 신속하게 답변해 드립니다.")}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert('문의가 접수되었습니다.'); }} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("성함")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("이름을 입력해 주세요")}
                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30] bg-slate-50/50 text-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("이메일 주소")}</label>
                    <input
                      type="email"
                      required
                      placeholder="example@email.com"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30] bg-slate-50/50 text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("연락처")}</label>
                    <input
                      type="tel"
                      required
                      placeholder="010-0000-0000"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30] bg-slate-50/50 text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{t("문의 내용")}</label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t("문의 내용을 상세히 적어주세요")}
                    className="w-full p-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#b88c30] focus:ring-1 focus:ring-[#b88c30] bg-slate-50/50 text-slate-900 font-semibold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-14 bg-[#b88c30] hover:bg-[#b88c30]/90 text-white font-black rounded-2xl transition-all hover:scale-102 active:scale-95 shadow-lg shadow-[#b88c30]/20"
                >
                  {t("문의 제출하기")}
                </button>
              </form>
            </div>
            
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full max-w-6xl mx-auto px-6 pb-24 space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#b88c30] rounded-full" />
            {t("찾아오시는 길")}
          </h3>
          <div className="w-full overflow-hidden rounded-[2.5rem] border border-slate-200/50 shadow-[0_20px_40px_rgba(0,0,0,0.05)] bg-white h-[450px] p-2">
            <iframe
              src="https://maps.google.com/maps?q=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EB%82%A8%EC%96%91%EC%A3%BC%EC%8B%9C%20%EB%B6%85%ED%8F%89%EB%A1%9C%2048%EB%B2%88%EA%B8%B8%20140&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              className="rounded-[2.2rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
