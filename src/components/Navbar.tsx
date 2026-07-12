/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Calculator, HelpCircle, Menu, CreditCard, User, RotateCcw, Headphones, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";
import { languages } from "@/lib/translations/config";


import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import Image from "next/image";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const user = null; // Mocked
  const isUserLoading = false; // Mocked
  const { t, language, setLanguage } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    // await signOut(auth);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/estimate", label: t('환급 신청'), icon: <Calculator className="h-4 w-4 text-[#b88c30]" /> },
    { href: "/pricing", label: t('가격 정책'), icon: <CreditCard className="h-4 w-4 text-[#b88c30]" /> },
    { href: "/faq", label: t('자주 묻는 질문'), icon: <HelpCircle className="h-4 w-4 text-[#b88c30]" /> },
    { href: "/youth-tax", label: t('청년 소득세 90% 감면 제도안내'), icon: <Percent className="h-4 w-4 text-[#b88c30]" /> },
    { href: "/support", label: t('고객센터'), icon: <Headphones className="h-4 w-4 text-[#b88c30]" /> },
  ];

  const TOP_LANGS = ['ko', 'en', 'vi', 'km', 'mn'];

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 py-4 print:hidden",
      scrolled ? "glass-nav py-4" : "bg-transparent py-8"
    )}>
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
          <img 
            src="/1625.png" 
            alt="KOREA Easy Tax Refund Logo" 
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 transition-transform duration-300 group-hover:scale-110 active:scale-95"
          />
          <span className="text-sm sm:text-base font-black tracking-tighter text-[#0b192c] font-headline uppercase flex flex-col leading-[1.0] whitespace-nowrap">
            <span className="text-[#b88c30]">Korea</span>
            <span className="flex gap-1">
              <span>Easy Tax</span>
              <span>Refund</span>
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} icon={link.icon}>{link.label}</NavLink>
          ))}
          {user && <NavLink href="/portal" icon={<User className="h-4 w-4" />}>{t('나의 환급 진행사항')}</NavLink>}
        </div>

        <div className="flex items-center gap-6">
          {/* Desktop Language Switcher */}
          <div className="hidden md:flex items-center relative">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/80 bg-white text-xs font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <span>🌐</span>
                <span>{languages.find(l => l.code === language)?.name || 'Language'}</span>
                <span>▾</span>
              </button>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in max-h-64 overflow-y-auto">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code, false);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors hover:bg-slate-50",
                          language === l.code ? "text-primary font-black bg-slate-50" : "text-slate-600 font-bold"
                        )}
                      >
                        <span className="text-sm">{l.flag}</span>
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {!isUserLoading && (
            user ? (
              <Button variant="ghost" onClick={handleLogout} className="hidden md:inline-flex font-black text-slate-900 hover:bg-slate-100/50 rounded-2xl px-6">{t('로그아웃')}</Button>
            ) : (
              <Button variant="ghost" asChild className="hidden md:inline-flex font-black text-slate-900 hover:bg-slate-100/50 rounded-2xl px-6">
                <Link href="/login">{t('나의 실시간 환급 현황')}</Link>
              </Button>
            )
          )}
          <Button asChild className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 h-auto min-h-[3rem] py-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 whitespace-normal break-words">
            <Link href="/estimate" className="flex-1 min-w-[max-content] flex items-center justify-center gap-1">
              <span className="text-orange-500 font-black">{t('대한민국 국세청 공식 연동')}</span>
              {language !== 'ko' && <span className="text-white font-medium">•</span>}
              <span className="text-white font-black">{t('30초 만에 잠자는 내 숨은 돈 찾기')}</span>
            </Link>
          </Button>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-12 w-12 rounded-2xl bg-white border border-slate-100">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="rounded-l-[2.5rem] p-10 overflow-y-auto">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-2xl font-black font-headline">Easy Tax Refund</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="flex items-center gap-4 text-lg font-bold text-slate-600 hover:text-primary transition-colors"
                  >
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center">
                      {link.icon}
                    </div>
                    {link.label}
                  </Link>
                ))}
                 {user && (
                    <Link href="/portal" className="flex items-center gap-4 text-lg font-bold text-slate-600 hover:text-primary transition-colors">
                      <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center"><User className="h-4 w-4" /></div>
                      {t('나의 환급 진행사항')}
                    </Link>
                 )}
                
                {/* Mobile Language Grid */}
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">{t('언어 선택')}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code, false)}
                        className={cn(
                          "flex items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-black transition-all active:scale-95",
                          language === l.code
                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                            : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span>{l.flag}</span>
                        <span>{l.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-2" />
                <Link href="/login" className="text-lg font-bold text-slate-900">{t('로그인 / 신청 현황')}</Link>
                <Button asChild className="w-full bg-primary h-auto min-h-[4rem] rounded-2xl font-black text-lg mt-2 py-4 px-6 shadow-lg shadow-primary/20 whitespace-normal break-words">
                  <Link href="/estimate" className="text-center leading-tight flex-1 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-orange-500 font-black">{t('대한민국 국세청 공식 연동')}</span>
                    <span className="text-white font-black text-xs">{t('30초 만에 잠자는 내 숨은 돈 찾기')}</span>
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, icon }: { href: string, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <Link href={href} className="text-[15px] font-black text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2 relative group whitespace-nowrap">
      {icon}
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
