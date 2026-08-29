import Link from 'next/link';
import { getBlogPosts, isEasyTax, BlogPost } from '@/lib/supabaseBlog';
import { languages, Language } from '@/lib/translations/config';
import { getBlogTranslation } from '@/lib/translations/blogTranslations';
import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  User, 
  Globe2, 
  BadgeCheck, 
  ShieldCheck, 
  HelpCircle, 
  Star, 
  ArrowRight,
} from 'lucide-react';

interface Props {
  params: Promise<{ lang: string }> | { lang: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'ko';
  const isTax = isEasyTax;
  const baseDomain = isTax ? 'https://ktrs-service.vercel.app' : 'https://ktrs-market.vercel.app';
  const t = getBlogTranslation(lang);

  const title = `${t.heroTitle2} | KTRS`;
  const description = t.heroDesc;

  // 15개 언어 alternate hreflang
  const languageAlternates: Record<string, string> = {};
  languages.forEach((l) => {
    languageAlternates[l.code] = `${baseDomain}/${l.code}/blog`;
  });
  languageAlternates['x-default'] = `${baseDomain}/ko/blog`;

  return {
    title: `${title} (${lang.toUpperCase()})`,
    description,
    alternates: {
      canonical: `${baseDomain}/${lang}/blog`,
      languages: languageAlternates,
    },
    openGraph: {
      title: `${title} (${lang.toUpperCase()})`,
      description,
      url: `${baseDomain}/${lang}/blog`,
      siteName: 'Korea Tax Refund Service',
      type: 'website',
    },
  };
}

export default async function BlogListPage({ params }: Props) {
  const resolvedParams = await params;
  const lang = (resolvedParams.lang || 'ko') as Language;
  const posts = await getBlogPosts(lang, 24);
  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];
  const t = getBlogTranslation(lang);

  // 기본 가이드 카드 (15개 언어 사전과 연동)
  const defaultGuides = [
    {
      id: 'guide-1',
      slug: 'youth-tax-reduction-guide',
      title: t.guide1Title,
      excerpt: t.guide1Excerpt,
      category: t.guide1Category,
      author: t.authorLabel,
      published_at: '2026-08-28',
      thumbnail_url: '/certified_security_seal_premium_1774150786685.png',
    },
    {
      id: 'guide-2',
      slug: 'past-5-years-refund-process',
      title: t.guide2Title,
      excerpt: t.guide2Excerpt,
      category: t.guide2Category,
      author: t.authorLabel,
      published_at: '2026-08-27',
      thumbnail_url: '/official_nts_carrier_badge_v2_1774141326494.png',
    },
    {
      id: 'guide-3',
      slug: 'e9-e7-f2-visa-tax-benefits',
      title: t.guide3Title,
      excerpt: t.guide3Excerpt,
      category: t.guide3Category,
      author: t.authorLabel,
      published_at: '2026-08-25',
      thumbnail_url: '/nts-logo.jpg',
    },
  ];

  const displayPosts = posts.length > 0 ? posts : defaultGuides;

  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-[#0f1e36]">
      {/* ─── 1. KTRS 공식 GNB 헤더 ─── */}
      <Navbar />

      <main className="flex-1 flex flex-col items-center w-full pt-[96px]">
        {/* ─── 2. KTRS 시그니처 HERO SECTION ─── */}
        <div className="relative w-full bg-[#0f1e36] py-24 sm:py-28 px-6 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
              backgroundSize: "40px 40px"
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-[0.3em] uppercase">
                {t.heroTag}
              </span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              {t.heroTitle1}<br />
              <span className="text-[#b88c30]">{t.heroTitle2}</span>
            </h1>

            <div className="h-px w-20 bg-[#b88c30] mx-auto" />

            <p className="text-slate-300 text-base sm:text-xl font-bold max-w-2xl mx-auto leading-relaxed break-keep">
              {t.heroDesc}
            </p>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold pt-2">
              <Link href="/" className="hover:text-[#b88c30] transition-colors">{t.breadcrumbHome}</Link>
              <ChevronRight className="h-3 w-3 text-slate-500" />
              <span className="text-[#b88c30]">{t.breadcrumbBlog}</span>
              <ChevronRight className="h-3 w-3 text-slate-500" />
              <span className="text-slate-300">{currentLangObj.flag} {currentLangObj.name}</span>
            </div>
          </div>
        </div>

        {/* ─── 3. CERTIFICATION STRIP (국세청 / 공인세무사 / 보안인증) ─── */}
        <section className="w-full bg-white border-b border-slate-100 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <img src="/nts-logo.jpg" alt="NTS Logo" className="h-14 sm:h-16 object-contain" />
              <span className="text-xs font-black text-slate-500 tracking-wide">{t.certNts}</span>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center gap-2">
              <img src="/official_nts_carrier_badge_v2_1774141326494.png" alt="Agent Badge" className="h-14 sm:h-16 object-contain" />
              <span className="text-xs font-black text-slate-500 tracking-wide">{t.certAgent}</span>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center gap-2">
              <img src="/certified_security_seal_premium_1774150786685.png" alt="Security Seal" className="h-14 sm:h-16 object-contain" />
              <span className="text-xs font-black text-slate-500 tracking-wide">{t.certSecurity}</span>
            </div>
          </div>
        </section>

        {/* ─── 4. IMPACT NUMBERS STRIP (골드 배너) ─── */}
        <section className="w-full bg-[#b88c30] py-10 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[#0f1e36]/20">
            {[
              { value: t.stat5Years, label: t.stat5YearsLabel },
              { value: t.statAvgRefund, label: t.statAvgRefundLabel },
              { value: t.statPeriod, label: t.statPeriodLabel },
              { value: t.statFee, label: t.statFeeLabel },
            ].map((s, i) => (
              <div key={i} className="space-y-1 px-4">
                <div className="text-2xl sm:text-3xl font-black text-[#0f1e36]">{s.value}</div>
                <div className="text-xs font-black text-[#0f1e36]/80 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. 15개국 언어 선택 탭 & 검색 바 ─── */}
        <section className="w-full py-12 px-6 bg-slate-950 border-b border-slate-800">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-[#b88c30]" />
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  {t.langSelectLabel}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {t.currentSelectLabel} <strong className="text-[#b88c30]">{currentLangObj.flag} {currentLangObj.name}</strong>
              </span>
            </div>

            {/* 15개 언어 전환 버튼 그리드 */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {languages.map((l) => {
                const isActive = l.code === lang;
                return (
                  <Link
                    key={l.code}
                    href={`/${l.code}/blog`}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black transition-all ${
                      isActive
                        ? 'bg-[#b88c30] text-[#0f1e36] shadow-lg shadow-[#b88c30]/20 scale-[1.03] border-2 border-[#e2b659]'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span className="truncate">{l.name.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 6. BLOG POST CARDS SECTION (깔끔하고 고급스러운 라이트 카드 그리드) ─── */}
        <section className="w-full bg-slate-50 py-20 px-6 border-b border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">
                  {t.sectionTag}
                </span>
                <h2 className="text-3xl font-black text-[#0f1e36] mt-1">
                  {currentLangObj.name} {t.sectionTitle}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {t.totalArticles.replace('{count}', String(displayPosts.length))}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post: any) => (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#b88c30] transition-all hover:shadow-xl flex flex-col justify-between group"
                >
                  {/* 카드 상단 이미지 영역 */}
                  <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    <img
                      src={post.thumbnail_url || '/nts-logo.jpg'}
                      alt={post.title}
                      className="max-h-36 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#0f1e36] text-[#b88c30] rounded-full text-[11px] font-black tracking-wider uppercase shadow-sm">
                      {post.category}
                    </div>
                  </div>

                  {/* 카드 본문 */}
                  <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="text-lg sm:text-xl font-black text-[#0f1e36] group-hover:text-[#b88c30] transition-colors leading-snug line-clamp-2">
                        <Link href={`/${lang}/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-slate-600 font-medium text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* 카드 하단 메타 */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#b88c30]" />
                        <span>{post.author}</span>
                      </div>
                      <Link
                        href={`/${lang}/blog/${post.slug}`}
                        className="text-[#b88c30] font-black hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>{t.readArticle}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 7. REVIEWS SECTION (고객 후기) ─── */}
        <section className="w-full bg-[#0f1e36] py-20 px-6 border-t border-slate-800">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">
                {t.reviewsTag}
              </span>
              <h2 className="text-3xl font-black text-white">
                {t.reviewsTitle}
              </h2>
              <div className="flex justify-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-200 font-bold text-base leading-relaxed break-keep">
                  "{t.review1Text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div>
                    <div className="text-white font-black text-sm">{t.review1Author}</div>
                  </div>
                  <div className="text-[#b88c30] font-black text-sm">{t.review1Amount}</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-200 font-bold text-base leading-relaxed break-keep">
                  "{t.review2Text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div>
                    <div className="text-white font-black text-sm">{t.review2Author}</div>
                  </div>
                  <div className="text-[#b88c30] font-black text-sm">{t.review2Amount}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. TRUST BADGES ─── */}
        <section className="w-full bg-white border-t border-slate-200 py-12 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: <BadgeCheck className="h-5 w-5 text-[#b88c30]" />, label: t.trustAgent },
              { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, label: t.trustSecurity },
              { icon: <Sparkles className="h-5 w-5 text-[#b88c30]" />, label: t.trustAi },
              { icon: <HelpCircle className="h-5 w-5 text-[#0f1e36]" />, label: t.trustSupport },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-[#b88c30]/40 transition-all shadow-sm"
              >
                {item.icon}
                <span className="text-sm font-black text-[#0f1e36]">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 9. GRAND BOTTOM CTA SECTION ─── */}
        <section className="w-full bg-[#0f1e36] py-20 px-6 border-t-4 border-[#b88c30]">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">
                  {t.ctaTag}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight break-keep">
                {t.ctaTitle1}<br />
                <span className="text-[#b88c30]">{t.ctaTitle2}</span>
              </h2>
              <p className="text-slate-300 font-bold text-base break-keep">
                {t.ctaDesc}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/estimate"
                className="w-full h-16 rounded-2xl bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-3"
              >
                <span>{t.ctaButton}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="text-center text-xs font-bold text-slate-400">
                {t.ctaBottomNote}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 10. KTRS 공식 Footer ─── */}
      <Footer />
    </div>
  );
}
