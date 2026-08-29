import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, isEasyTax } from '@/lib/supabaseBlog';
import { languages, Language } from '@/lib/translations/config';
import { getBlogTranslation } from '@/lib/translations/blogTranslations';
import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  ShieldCheck, 
  BadgeCheck,
  HelpCircle,
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  params: Promise<{ lang: string; slug: string }> | { lang: string; slug: string };
}

// 1. Google SEO 15개국어 hreflang 메타데이터 및 OpenGraph 주입
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang = 'ko', slug } = resolvedParams;
  const post = await getBlogPostBySlug(slug, lang);
  const t = getBlogTranslation(lang);

  const baseDomain = isEasyTax ? 'https://ktrs-service.vercel.app' : 'https://ktrs-market.vercel.app';
  const canonicalUrl = `${baseDomain}/${lang}/blog/${slug}`;

  // 15개 공식 언어 hreflang 상호 교차 링크
  const languageAlternates: Record<string, string> = {};
  languages.forEach((l) => {
    languageAlternates[l.code] = `${baseDomain}/${l.code}/blog/${slug}`;
  });
  languageAlternates['x-default'] = `${baseDomain}/ko/blog/${slug}`;

  const title = post ? post.title : t.guide1Title;
  const description = post ? post.excerpt : t.guide1Excerpt;

  return {
    title: `${title} | KTRS (${lang.toUpperCase()})`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: `${title} | KTRS`,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post?.published_at || '2026-08-28',
      siteName: 'Korea Tax Refund Service',
      images: post?.thumbnail_url ? [{ url: post.thumbnail_url, alt: title }] : [{ url: `${baseDomain}/1625-1.png` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post?.thumbnail_url ? [post.thumbnail_url] : [`${baseDomain}/1625-1.png`],
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { lang = 'ko', slug } = resolvedParams;
  let post = await getBlogPostBySlug(slug, lang);
  const t = getBlogTranslation(lang);
  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  // DB에 해당 slug 글이 아직 없을 경우의 기본 가이드 템플릿 (15개 언어 자동 적용)
  if (!post) {
    post = {
      id: 1,
      slug: slug,
      target_lang: lang,
      title: t.guide1Title,
      excerpt: t.guide1Excerpt,
      content_html: `
        <div class="space-y-6">
          <p class="text-lg leading-relaxed font-medium text-slate-700">
            ${t.guide1Excerpt}
          </p>

          <h3 class="text-2xl font-black text-[#0f1e36] border-l-4 border-[#b88c30] pl-4 my-6">
            1. ${t.guide3Category}
          </h3>
          <p class="text-slate-700 leading-relaxed">
            ${t.guide3Excerpt}
          </p>

          <div class="my-8 p-6 bg-amber-50/80 border-2 border-[#b88c30]/30 rounded-2xl">
            <h4 class="text-lg font-black text-[#0f1e36] mb-2 flex items-center gap-2">
              💡 ${t.stat5YearsLabel} (Gyeongjeongcheonggu)
            </h4>
            <p class="text-slate-600 text-sm leading-relaxed">
              ${t.guide2Excerpt}
            </p>
          </div>

          <h3 class="text-2xl font-black text-[#0f1e36] border-l-4 border-[#b88c30] pl-4 my-6">
            2. ${t.statAvgRefundLabel}
          </h3>
          <p class="text-slate-700 leading-relaxed">
            ${t.heroDesc}
          </p>
        </div>
      `,
      thumbnail_url: '/official_nts_carrier_badge_v2_1774141326494.png',
      category: t.guide1Category,
      author: t.authorLabel,
      published_at: '2026-08-28',
    };
  }

  const baseDomain = isEasyTax ? 'https://ktrs-service.vercel.app' : 'https://ktrs-market.vercel.app';
  const canonicalUrl = `${baseDomain}/${lang}/blog/${slug}`;

  // 2. Schema.org BlogPosting JSON-LD 리치 스니펫 (구글 검색 상단 강조 노출용)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.published_at,
    image: post.thumbnail_url ? [post.thumbnail_url] : [`${baseDomain}/1625-1.png`],
    author: {
      '@type': 'Organization',
      name: post.author || t.authorLabel,
      url: baseDomain,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Korea Tax Refund Service (KTRS)',
      logo: {
        '@type': 'ImageObject',
        url: `${baseDomain}/1625-1.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-[#0f1e36]">
      {/* ─── 1. KTRS 공식 GNB 헤더 ─── */}
      <Navbar />

      {/* 구글 검색엔진용 JSON-LD 구조화 데이터 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 flex flex-col items-center w-full pt-[96px]">
        {/* ─── 2. KTRS HERO HEADER (글 제목 및 브레드크럼) ─── */}
        <div className="relative w-full bg-[#0f1e36] py-20 px-6 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #b88c30 0px, #b88c30 1px, transparent 1px, transparent 50%)",
              backgroundSize: "40px 40px"
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#b88c30]/15 text-[#e2b659] border border-[#b88c30]/30 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#e2b659]" />
              <span>{post.category || t.guide1Category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="h-px w-20 bg-[#b88c30] mx-auto" />

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 font-bold">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#b88c30]" />
                <span>{post.author || t.authorLabel}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{t.publishDateLabel}: {new Date(post.published_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <span>•</span>
              <span className="text-[#b88c30]">{currentLangObj.flag} {currentLangObj.name}</span>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm font-bold pt-2">
              <Link href="/" className="hover:text-[#b88c30] transition-colors">{t.breadcrumbHome}</Link>
              <ChevronRight className="h-3 w-3 text-slate-500" />
              <Link href={`/${lang}/blog`} className="hover:text-[#b88c30] transition-colors">{t.breadcrumbBlog}</Link>
              <ChevronRight className="h-3 w-3 text-slate-500" />
              <span className="text-slate-300 truncate max-w-[200px]">{post.title}</span>
            </div>
          </div>
        </div>

        {/* ─── 3. CERTIFICATION STRIP ─── */}
        <section className="w-full bg-white border-b border-slate-100 py-6 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.certNts}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#b88c30]" />
              <span>{t.certAgent}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0f1e36]" />
              <span>{t.certNoCost}</span>
            </div>
          </div>
        </section>

        {/* ─── 4. ARTICLE BODY CONTAINER ─── */}
        <section className="w-full bg-slate-50 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Link
                href={`/${lang}/blog`}
                className="inline-flex items-center gap-2 text-sm font-black text-[#b88c30] hover:text-[#0f1e36] transition-colors bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToList}</span>
              </Link>
            </div>

            {/* 메인 칼럼 페이퍼 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 space-y-8">
              {/* 요약 발췌 박스 */}
              {post.excerpt && (
                <div className="p-6 bg-slate-50 border-l-4 border-[#b88c30] rounded-2xl">
                  <span className="text-xs font-black text-[#b88c30] uppercase tracking-wider block mb-1">
                    {t.executiveSummary}
                  </span>
                  <p className="text-slate-700 font-bold text-base sm:text-lg leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* 장문 본문 HTML 렌더링 */}
              <div
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg space-y-6 font-medium"
                dangerouslySetInnerHTML={{ __html: post.content_html }}
              />

              {/* 칼럼 작성자 프로필 카드 */}
              <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-slate-50 p-6 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[#0f1e36] text-[#b88c30] flex items-center justify-center font-black text-xl shrink-0">
                  <User className="w-7 h-7 text-[#b88c30]" />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-black text-[#0f1e36] text-base">{post.author || t.authorLabel}</h4>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">{t.certifiedTag}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {t.authorBio}
                  </p>
                </div>
              </div>
            </div>

            {/* ─── 5. IN-ARTICLE CONVERSION CTA BOX ─── */}
            <div className="mt-12 bg-gradient-to-br from-[#0f1e36] via-[#172a45] to-[#0b192c] border-2 border-[#b88c30]/40 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b88c30]/20 text-[#e2b659] border border-[#b88c30]/30 rounded-full text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#e2b659]" />
                <span>{t.ctaTag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                {t.ctaTitle1}<br />
                <span className="text-[#b88c30]">{t.ctaTitle2}</span>
              </h3>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                {t.ctaDesc}
              </p>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/estimate"
                  className="px-8 py-4 bg-[#b88c30] hover:bg-[#b88c30]/90 text-[#0f1e36] font-black rounded-2xl text-base sm:text-lg transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2"
                >
                  <span>{t.ctaButton}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. REVIEWS & TRUST ─── */}
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
      </main>

      {/* ─── 7. KTRS 공식 Footer ─── */}
      <Footer />
    </div>
  );
}
