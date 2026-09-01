import { Metadata } from 'next';
import Link from 'next/link';

// [EasyTax SEO] 산업단지 근로자 세금 환급 랜딩 페이지
// Route: /[lang]/industrial/[slug]

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

const LANG_MAP: Record<string, { name: string; flag: string; welcome: string }> = {
  en: { name: 'English', flag: '🇺🇸', welcome: 'Welcome' },
  ko: { name: '한국어', flag: '🇰🇷', welcome: '환영합니다' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳', welcome: 'Chào mừng' },
  zh: { name: '中文', flag: '🇨🇳', welcome: '欢迎' },
  ja: { name: '日本語', flag: '🇯🇵', welcome: 'ようこそ' },
  th: { name: 'ภาษาไทย', flag: '🇹🇭', welcome: 'ยินดีต้อนรับ' },
  id: { name: 'Bahasa Indonesia', flag: '🇮🇩', welcome: 'Selamat datang' },
  mn: { name: 'Монгол', flag: '🇲🇳', welcome: 'Тавтай морилно уу' },
  uz: { name: "O'zbek", flag: '🇺🇿', welcome: 'Xush kelibsiz' },
  ru: { name: 'Русский', flag: '🇷🇺', welcome: 'Добро пожаловать' },
  kk: { name: 'Қазақша', flag: '🇰🇿', welcome: 'Қош келдіңіз' },
  ne: { name: 'नेपाली', flag: '🇳🇵', welcome: 'स्वागत छ' },
  bn: { name: 'বাংলা', flag: '🇧🇩', welcome: 'স্বাগতম' },
  ur: { name: 'اردو', flag: '🇵🇰', welcome: 'خوش آمدید' },
  my: { name: 'မြန်မာ', flag: '🇲🇲', welcome: 'ကြိုဆိုပါသည်' },
  km: { name: 'ខ្មែរ', flag: '🇰🇭', welcome: 'សូមស្វាគមន៍' },
  tl: { name: 'Filipino', flag: '🇵🇭', welcome: 'Maligayang pagdating' },
};

function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const langInfo = LANG_MAP[lang] || LANG_MAP['en'];
  const title = slugToTitle(slug);
  return {
    title: `[${title}] Year-End Tax Settlement for Foreign Factory Workers | EasyTax Korea`,
    description: `Free Korean tax refund guidance near ${title}. ${langInfo.name} AI support. Year-end tax settlement for foreign workers.`,
    alternates: {
      canonical: `https://easytax-service.vercel.app/${lang}/industrial/${slug}`,
      languages: Object.fromEntries(
        Object.keys(LANG_MAP).map(l => [l, `https://easytax-service.vercel.app/${l}/industrial/${slug}`])
      ),
    },
    openGraph: {
      title: `[${title}] EasyTax 🏭 Year-End Tax Settlement for Foreign Factory Workers`,
      description: `Korean tax refund help near ${title}. ${langInfo.name} supported.`,
      url: `https://easytax-service.vercel.app/${lang}/industrial/${slug}`,
      siteName: 'EasyTax Korea',
    },
  };
}

export default async function EasyTaxIndustrialSEOPage({ params }: Props) {
  const { lang, slug } = await params;
  const langInfo = LANG_MAP[lang] || LANG_MAP['en'];
  const title = slugToTitle(slug);
  const cta = `https://easytax-service.vercel.app/${lang}/welcome?utm_source=google_seo&utm_medium=organic&utm_campaign=industrial_${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'GovernmentService',
    name: `EasyTax @ ${title}`,
    description: `Year-End Tax Settlement for Foreign Factory Workers near ${title} in Korea.`,
    url: `https://easytax-service.vercel.app/${lang}/industrial/${slug}`,
    address: { '@type': 'PostalAddress', addressCountry: 'KR' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#0a0f1e', minHeight: '100vh', color: '#f8fafc' }}>
        <header style={{ background: '#0f1729', padding: '16px 24px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${lang}/welcome`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 900, fontSize: '20px' }}>
            🏭 EasyTax Korea
          </Link>
          <span style={{ fontSize: '14px', color: '#64748b' }}>{langInfo.flag} {langInfo.name}</span>
        </header>
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>🏭</div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.3, marginBottom: '16px' }}>
            {title} — Year-End Tax Settlement for Foreign Factory Workers
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.8, marginBottom: '32px' }}>
            Free Korean tax refund help near {title}. {langInfo.flag} {langInfo.name} AI support.
          </p>
          <a href={cta} style={{ display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontWeight: 900, padding: '14px 36px', borderRadius: '50px', textDecoration: 'none', fontSize: '16px', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
            🏭 Check My Tax Refund →
          </a>
        </section>
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              ['💰', 'Free Tax Refund Check', 'Find how much Korean tax refund you are owed. Completely free AI estimate.'],
              ['🌍', `${langInfo.name} Support`, 'Full AI guidance in your native language. No Korean required.'],
              ['📋', 'Year-End Settlement', 'Automatic settlement support for E-9, H-2 visa holders.'],
              ['⚡', 'Fast & Simple', '3-minute online process. No accountant needed.'],
            ].map(([icon, t, d], i) => (
              <div key={i} style={{ background: '#0f1729', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{t}</h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ maxWidth: '900px', margin: '0 auto 60px', padding: '0 24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f1729, #1e3a5f)', borderRadius: '24px', padding: '48px 32px', textAlign: 'center', border: '1px solid #2563eb' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>
              Get Your Korean Tax Refund — Free AI Guidance
            </h3>
            <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '15px' }}>
              E-9, H-2, D-2 visa holders near {title}. Check your refund eligibility in 3 minutes.
            </p>
            <a href={cta} style={{ background: '#3b82f6', color: '#fff', fontWeight: 900, padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px' }}>
              Check Refund Free →
            </a>
          </div>
        </section>
        <footer style={{ borderTop: '1px solid #0f1729', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#334155', fontSize: '13px' }}>
            © 2025 EasyTax Korea ·{' '}
            <Link href={`/${lang}/welcome`} style={{ color: '#60a5fa', textDecoration: 'none' }}>Go to EasyTax</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
