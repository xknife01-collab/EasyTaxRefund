import { Metadata } from 'next';
import Link from 'next/link';

// [EasyTax SEO] 세목별 가이드 페이지
// Route: /[lang]/guide/[slug] & /guide/[slug]

interface Props {
  params: Promise<{ slug: string; lang?: string }>;
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slugToTitle(slug);
  return {
    title: `[${title}] Expat Tax Guide & Refund Calculator | EasyTax Korea`,
    description: `Complete guide on ${title} in South Korea. 100% free AI guidance in 17 languages.`,
  };
}

export default async function EasyTaxGuidePage({ params, searchParams }: Props) {
  const { slug, lang: pLang } = await params;
  const sp = searchParams ? await searchParams : {};
  const lang = pLang || sp?.lang || 'en';
  const langInfo = LANG_MAP[lang] || LANG_MAP['en'];
  const title = slugToTitle(slug);
  const cta = `/welcome?lang=${lang}&utm_source=google_seo&utm_medium=organic&utm_campaign=guide_${slug}`;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#0a0f1e', minHeight: '100vh', color: '#f8fafc' }}>
      <header style={{ background: '#0f1729', padding: '16px 24px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href={`/welcome?lang=${lang}`} style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 900, fontSize: '20px' }}>💰 EasyTax Korea</Link>
        <span style={{ fontSize: '14px', color: '#64748b' }}>{langInfo.flag} {langInfo.name}</span>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: '#0f1729', border: '1px solid #1e3a5f', borderRadius: '20px', padding: '36px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📜</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '12px' }}>{title}</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px' }}>Official Korean Tax Law & Income Tax Exemption Assistance in {langInfo.name}.</p>
          <a href={cta} style={{ display: 'inline-block', background: '#3b82f6', color: '#fff', fontWeight: 900, padding: '14px 36px', borderRadius: '50px', textDecoration: 'none', fontSize: '16px' }}>Start Free Simulation →</a>
        </div>
      </main>
      <footer style={{ borderTop: '1px solid #0f1729', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#334155', fontSize: '13px' }}>© 2025 EasyTax Korea</p>
      </footer>
    </div>
  );
}
