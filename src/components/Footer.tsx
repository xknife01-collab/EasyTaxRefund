/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import Link from "next/link";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";
import { LegalDialog } from "@/components/LegalDialog";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0B192C] text-slate-300 border-t border-slate-800 print:hidden">
      <div className="container mx-auto px-6 py-16 lg:py-24">
        {/* Top Grand Callout Section */}
        <div className="border-b border-slate-800 pb-12 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-[#b88c30] bg-[#b88c30]/10 border border-[#b88c30]/20 uppercase">
                {t('GET IN TOUCH')}
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-headline leading-tight tracking-tight">
                {t('당신의 잠자는 환급금,')}<br />{t('지금 0.1초 만에 확인해 보세요')}
              </h3>
            </div>
            
            <div className="bg-gradient-to-r from-[#b88c30]/20 via-[#e2b659]/10 to-transparent border border-[#b88c30]/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 lg:max-w-xl w-full">
              <div className="space-y-1">
                <span className="text-xs font-black text-[#b88c30] uppercase tracking-wider">{t('실시간 문의 및 상담')}</span>
                <div className="text-xl sm:text-2xl font-black text-white">{t('1:1 AI 상담원 연결')}</div>
                <p className="text-xs text-slate-400 font-medium">{t('365일 24시간 언제나 실시간 상담이 가능합니다.')}</p>
              </div>
              <AiChatDialog>
                <button className="bg-[#b88c30] hover:bg-[#b88c30]/90 text-white font-black text-sm px-6 py-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg shadow-[#b88c30]/20">
                  {t('상담 시작하기')}
                </button>
              </AiChatDialog>
            </div>
          </div>
        </div>

        {/* Middle Columns Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/1625.png" 
                alt="KOREA Easy Tax Refund Logo" 
                className="h-10 w-10 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-xl font-black font-headline tracking-tighter text-white flex flex-col uppercase leading-[1.0]">
                <span className="text-[#b88c30]">Korea</span>
                <span className="flex gap-1.5">
                  <span>Easy Tax</span>
                  <span>Refund</span>
                </span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
              {t('대한민국에 있는 외국인들이 정당한 권리를 찾을 수 있도록 돕습니다. 외국인을 위한 쉽고 빠르며 안전한 세금 환급 서비스입니다.')}
            </p>
            <div className="pt-4 flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-[#b88c30]/50 transition-colors cursor-pointer">
                <span className="text-[10px] font-black text-slate-400">FB</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-[#b88c30]/50 transition-colors cursor-pointer">
                <span className="text-[10px] font-black text-slate-400">IG</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-[#b88c30]/50 transition-colors cursor-pointer">
                <span className="text-[10px] font-black text-slate-400">LI</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs border-l-2 border-[#b88c30] pl-3">{t('제품 및 가격')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li>
                <Link href="/estimate" className="hover:text-white transition-colors flex items-center gap-1">
                  <span className="text-[#b88c30]">›</span> {t('환급 신청')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors flex items-center gap-1">
                  <span className="text-[#b88c30]">›</span> {t('가격 정책 (25%)')}
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-white transition-colors flex items-center gap-1">
                  <span className="text-[#b88c30]">›</span> {t('서류 업로드 센터')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs border-l-2 border-[#b88c30] pl-3">{t('고객 지원')}</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors flex items-center gap-1">
                  <span className="text-[#b88c30]">›</span> {t('자주 묻는 질문')}
                </Link>
              </li>
              <li>
                <Link href="/youth-tax" className="hover:text-white transition-colors flex items-center gap-1">
                  <span className="text-[#b88c30]">›</span> {t('청년 소득세 90% 감면 제도안내')}
                </Link>
              </li>
              <li>
                <AiChatDialog>
                  <button className="hover:text-white transition-colors text-left flex items-center gap-1">
                    <span className="text-[#b88c30]">›</span> {t('1:1 AI 상담')}
                  </button>
                </AiChatDialog>
              </li>
              <li>
                <LegalDialog type="privacy">
                  <button className="hover:text-white transition-colors text-left flex items-center gap-1">
                    <span className="text-[#b88c30]">›</span> {t('개인정보 처리방침')}
                  </button>
                </LegalDialog>
              </li>
              <li>
                <LegalDialog type="terms">
                  <button className="hover:text-white transition-colors text-left flex items-center gap-1">
                    <span className="text-[#b88c30]">›</span> {t('이용 약관')}
                  </button>
                </LegalDialog>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Metadata & Stamps Section */}
        <div className="mt-16 pt-10 border-t border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4 text-xs font-medium text-slate-400 leading-relaxed">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-400 font-bold">
                <span>{t('사업자명: 더윤컴퍼니')}</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>{t('대표자: 윤희수')}</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>{t('사업자 등록번호: 105-1278126')}</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>{t('통신판매업 번호: 제 2023-진접오남-0680호')}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-400 font-bold">
                <span>{t('주소: 경기도 남양주시 부평로 48번길 140, 107-1102')}</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>{t('연락처: 010-5864-8577')}</span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>{t('이메일: zkfnth01@naver.com')}</span>
              </div>
              <p className="mt-4 text-[10px] text-slate-500 font-medium leading-relaxed max-w-3xl">
                {t('이지택스환급(Easy Tax Refund)은 세무대리 신고를 직접 수행하지 않으며, 본 플랫폼에서 작성된 신청 서류는 제휴된 대한민국 국가공인 전문 세무법인 및 협력 세무사를 통해 최종 검토 및 제출됩니다.')}
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-end justify-between h-full gap-4">
              {/* Stamps Container */}
              <div className="flex flex-wrap gap-4">
                {/* Stamp 1 */}
                <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 shadow-sm hover:border-[#e2b659]/50 transition-all">
                  <div className="h-10 w-10 rounded-full border-2 border-emerald-500 flex flex-col items-center justify-center text-[7px] font-black text-emerald-500 bg-emerald-500/10 shrink-0 leading-none">
                    <span>SSL</span>
                    <span>SECURE</span>
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-[9px] font-black text-white">{t('개인정보 보호')}</div>
                    <div className="text-[8px] font-medium text-slate-400 mt-1">256bit Encrypted</div>
                  </div>
                </div>

                {/* Stamp 2 */}
                <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 shadow-sm hover:border-[#e2b659]/50 transition-all">
                  <div className="h-10 w-10 rounded-full border-2 border-[#e2b659] flex flex-col items-center justify-center text-[7px] font-black text-[#b88c30] bg-[#e2b659]/10 shrink-0 leading-none">
                    <span>TAX</span>
                    <span>PARTNER</span>
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-[9px] font-black text-white">{t('공인 세무 협력')}</div>
                    <div className="text-[8px] font-medium text-slate-400 mt-1">Certified Review</div>
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-500 text-center lg:text-right mt-2">
                © 2026 Easy Tax Refund. THEYOON COMPANY. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
