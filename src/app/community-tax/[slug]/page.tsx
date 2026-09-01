import { Metadata } from 'next';
import Link from 'next/link';

// [EasyTax SEO] 교민회 세무 포털
// Route: /community-tax/[slug]

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
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
  kk: { name: 'Қазақша', flag: 'Қош келдіңіз', welcome: 'Қош келдіңіз' },
  ne: { name: 'नेपाली', flag: 'नेपाल', welcome: 'स्वागत छ' },
  bn: { name: 'বাংলা', flag: '🇧🇩', welcome: 'স্বাগতম' },
  ur: { name: 'اردو', flag: '🇵🇰', welcome: 'خوش آمدید' },
  my: { name: 'မြန်မာ', flag: '🇲🇲', welcome: 'ကြိုဆိုပါသည်' },
  km: { name: 'ខ្មែរ', flag: '🇰🇭', welcome: 'សូមស្វាគមន៍' },
  tl: { name: 'Filipino', flag: '🇵🇭', welcome: 'Maligayang pagdating' },
};

function slugToTitle(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const lang = sp?.lang || 'en';
  const langInfo = LANG_MAP[lang] || LANG_MAP['en'];
  const title = slugToTitle(slug);
  return {
    title: `[${title}] Certified Tax Refund & Income Protection | EasyTax Korea`,
    description: `Free Korean tax refund guidance near ${title}. ${langInfo.name} AI support. Year-end tax settlement for foreign workers.`,
  };
}

export default async function EasyTaxCommunityTaxPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const lang = sp?.lang || 'en';
  const langInfo = LANG_MAP[lang] || LANG_MAP['en'];
  const title = slugToTitle(slug);
  const cta = `/welcome?lang=${lang}&utm_source=google_seo&utm_medium=organic&utm_campaign=community-tax_${slug}`;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#0a0f1e', minHeight: '100vh', color: '#f8fafc' }}>
      <header style={{ background: '#0f1729', padding: '16px 24px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/welcome?lang=${lang}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 900, fontSize: '20px' }}>
          🤝 EasyTax Korea
        </Link>
        <span style={{ fontSize: '14px', color: '#64748b' }}>{langInfo.flag} {langInfo.name}</span>
      </header>
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '52px', marginBottom: '20px' }}>🤝</div>
        <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.3, marginBottom: '16px' }}>
          {title} — Certified Tax Refund & Income Protection
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.8, marginBottom: '32px' }}>
          Free Korean tax refund help near {title}. {langInfo.flag} {langInfo.name} AI support.
        </p>
        <a href={cta} style={{ display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontWeight: 900, padding: '14px 36px', borderRadius: '50px', textDecoration: 'none', fontSize: '16px', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
          🤝 Check My Tax Refund →
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
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: '#e2e8f0' }}>{t}</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ borderTop: '1px solid #0f1729', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#334155', fontSize: '13px' }}>© 2025 EasyTax Korea</p>
      </footer>
    </div>
  );
}
