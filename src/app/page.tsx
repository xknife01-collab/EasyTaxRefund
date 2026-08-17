/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ShieldCheck, 
  BadgeCheck,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  ScanSearch,
  UserCheck,
  Lock,
  Plane,
  Home,
  Coins,
  Trophy,
  Globe,
  Database,
  Shield,
  X,
  Minimize2,
  Banknote,
  Check,
  Play
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { useToast } from "@/hooks/use-toast";
import { AiChatDialog } from "@/components/AiChatDialog";
import { useTranslation } from "@/components/LanguageContext";
import { logLanguageVisit } from "@/lib/tracking";

import { useRouter } from "next/navigation";
import { languages } from '@/lib/translations/config';
import Image from 'next/image';
import { AnimatedCounter } from "@/components/AnimatedCounter";

const TaxRefundSimulator = dynamic(
  () => import("@/components/TaxRefundSimulator"),
  { ssr: false }
);

const BADGE_TEXTS: Record<string, string> = {
  ko: "📢 외국인 근로자도 100% 지원금 대상입니다!",
  en: "📢 100% Eligible for Foreign Workers in Korea!",
  vi: "📢 100% Đối tượng hỗ trợ cho lao động nước ngoài!",
  ne: "📢 कोरियामा रहेका विदेशी कामدارहरू पनि १००% योग्य छन्!",
  uz: "📢 Koreyadagi chet ellik ishchilar ham 100% muvofiq keladi!",
  zh: "📢 在韩外国劳动者也100%符合支持条件！",
  km: "📢 ពលករទេសន្តរប្រវេសន៍នៅកូរ៉េក៏ទទួលបានអត្ថប្រយោជន៍ ១០០% ដែរ!",
  th: "📢 แรงงานต่างชาติในเกาหลีก็มีสิทธิ์ได้รับ 100%!",
  my: "📢 ကိုရီးယားရှိ နိုင်ငံခြားသားအလုပ်သမားများလည်း ၁၀၀% အကျုံးဝင်ပါသည်။",
  si: "📢 කොරියාවේ සිටින විදේශික සේවකයින්ටද 100% ක් හිමිකම් ඇත!",
  kk: "📢 Кореядағы шетелдік жұмысшылар да 100% қолдауға ие!",
  bn: "📢 কোরিয়ায় কর্মরত বিদেশী কর্মীরাও ১০০% যোগ্য!",
  id: "📢 Pekerja asing di Korea juga 100% memenuhi syarat!",
  mn: "📢 Солонгост байгаа гадаад ажилчид ч 100% хамрагдах боломжтой!",
  ur: "📢 کوریا میں غیر ملکی کارکن بھی 100% اہل ہیں!"
};

const BUTTON_TEXTS: Record<string, string> = {
  ko: "📄 청년 소득세 90% 감면 제도 안내 보기",
  en: "📄 View Youth Income Tax 90% Reduction Guide",
  vi: "📄 Xem hướng dẫn giảm 90% thuế thu nhập trẻ",
  ne: "📄 युवा आयकर ९०% छुट सम्बन्धी जानकारी हेर्नुहोस्",
  uz: "📄 Yoshlar daromad solig'ini 90% ga kamaytirish bo'yicha qo'llanma",
  zh: "📄 查看青年所得税减免90%制度指南",
  km: "📄 មើលការណែនាំអំពីការកាត់បន្ថយពន្ធលើប្រាក់ចំណូលយុវជន ៩០%",
  th: "📄 ดูคู่มือการลดภาษีเงินได้เยาวชน 90%",
  my: "📄 လူငယ်ဝင်ငွေခွန် ၉၀% လျှော့చရေး လမ်းညွှန်ချက်ကို ကြည့်ရှုရန်",
  si: "📄 තරුණ ආදායම් ბදු 90% අඩු කිරීමේ මාර්ගෝපදේශය බලන්න",
  kk: "📄 Жастардың табыс салығын 90%-ға төмендету бойынша нұсқаулықты қарау",
  bn: "📄 যুব আয়কর ৯০% হ্রাস সংক্রান্ত নির্দেশিকা দেখুন",
  id: "📄 Lihat Panduan Pengurangan Pajak Penghasilan Pemuda 90%",
  mn: "📄 Залуучуудын орлогын албан татварыг 90% хөнгөлөх заавар харах",
  ur: "📄 نوجوانوں کے انکم ٹیکس میں 90% کمی کی گائیڈ دیکھیں"
};

const BANNER_TRUST_TEXTS: Record<string, string> = {
  ko: "🔒 100% 후불 정산 (선결제 없음) | 개인정보 즉시 파기",
  en: "🔒 100% Post-paid (No upfront fee) | Data deleted immediately",
  vi: "🔒 Thanh toán sau 100% (Không phí trước) | Xóa dữ liệu ngay lập tức",
  ne: "🔒 १००% भुक्तानी पछि (कुनै अग्रिम शुल्क छैन) | डाटा तुरुन्तै मेटाइयो",
  uz: "🔒 100% Keyin to'lash (Oldindan to'lovsiz) | Ma'lumotlar darhol o'chiriladi",
  zh: "🔒 100% 后付结算（无预付款） | 个人信息立即销毁",
  km: "🔒 ទូទាត់ក្រោយ ១០០% (គ្មានថ្លៃមុន) | លុបទិន្នន័យភ្លាមៗ",
  th: "🔒 จ่ายหลังบริการ 100% (ไม่มีค่าใช้จ่ายล่วงหน้า) | ลบข้อมูลทันที",
  my: "🔒 ၁၀၀% အပြီးသတ်မှပေးချေရန် (ကြိုတင်ခမရှိ) | အချက်အလက်များကို ချက်ချင်းဖျက်ပစ်သည်",
  si: "🔒 100% පසුගෙවුම් (පෙර ගෙවුම් නැත) | දත්ත වහාම මකා දැමේ",
  kk: "🔒 100% кейін төлеу (алдын ала төлемсіз) | Деректер дереу жойылады",
  bn: "🔒 ১০০% পোস্ট-পেইড (কোন অগ্রিম fee নেই) | ডেটা অবিলম্বে মুছে ফেলা হবে",
  id: "🔒 100% Bayar di akhir (Tanpa biaya di awal) | Data langsung dihapus",
  mn: "🔒 100% Дараа төлбөрт (Урьдчилгаа төлбөргүй) | Хувийн мэдээллийг шууд устгана",
  ur: "🔒 100% بعد میں ادائیگی (کوئی پیشگی فیس نہیں) | ڈیٹا فوری طور پر حذف کر دیا گیا"
};

const HERO_TRUST_TEXTS: Record<string, string> = {
  ko: "* 본 서비스는 국가 공인 세무사가 검토하며, 조회된 정보는 확인 즉시 영구 파기됩니다.",
  en: "* Reviewed by certified tax accountants. Checked data is permanently deleted immediately.",
  vi: "* Được kiểm tra bởi kế toán thuế có chứng chỉ. Dữ liệu kiểm tra sẽ bị xóa vĩnh viễn ngay lập tức.",
  ne: "* प्रमाणित कर लेखा परीक्षकद्वारा समीक्षा गरिएको। जाँच गरिएको डाटा तुरुन्तै स्थायी रूपमा मेटाइन्छ।",
  uz: "* Sertifikatlangan soliq maslahatchilari tomonidan tekshiriladi. Ma'lumotlar darhol butunlay o'chiriladi.",
  zh: "* 由国家公认税务师审核，查询信息确认后立即永久销毁。",
  km: "* បញ្ជាក់ដោយគណនេយ្យករពន្ធដែលមានការรับដឹង។ ទិន្នន័យដែលបានពិនិត្យនឹងត្រូវលុបជាអចិន្ត្រៃយ៍ភ្លាមៗ។",
  th: "* ตรวจสอบโดยผู้สอบบัญชีภาษีอากรที่ได้รับอนุญาต ข้อมูลที่ตรวจสอบจะถูกลบอย่างถาวรทันที",
  my: "* လက်မှတ်ရ အခွန်စာရင်းကိုင်များမှ စစ်ဆေးသည်။ စစ်ဆေးပြီးသောအချက်အလက်များကို ချက်ချင်းအမြဲတမ်းဖျက်ပစ်သည်။",
  si: "* සහතික ලත් බදු ගණකාධිකාරීවරුන් විසින් සමාලෝචනය කරනු ලැබේ. පරීක්ෂා කරන ලද දත්ත වහාම ස්ථිරවම මකා දැමේ.",
  kk: "* Сертификатталған салық кеңесшілері тексереді. Тексерілген деректер дереу біржола жойылады.",
  bn: "* প্রত্যয়িত কর হিসাবরক্ষক দ্বারা পর্যালোচনা করা হয়। পরীক্ষিত ডেটা অবিলম্বে স্থায়ীভাবে মুছে ফেলা হয়।",
  id: "* Ditinjau oleh akuntan pajak bersertifikat. Data yang diperiksa langsung dihapus secara permanen.",
  mn: "* Мэргэшсэн татварын нягтлан бодогчид хянана. Шалгасан мэдээллийг шууд бүрмөсөн устгана.",
  ur: "* تصدیق شدہ ٹیکس اکاؤنٹنٹ کے ذریعہ جائزہ لیا گیا۔ چیک کیا گیا ڈیٹا فوری طور پر مستقل طور پر حذف کر دیا جاتا ہے۔"
};

const COUNTRY_REVIEW_VIDEOS: Record<string, { name: string; amount: string; flag: string; poster: string; videoUrl: string }> = {
  vi: {
    name: "Nguyen",
    amount: "+3,100,000 Won",
    flag: "🇻🇳",
    poster: "/reviews/nguyen.png",
    videoUrl: "https://ilvxvohksgwdiyvpkwag.supabase.co/storage/v1/object/public/review-videos/vietnam_refund_review.mp4"
  },
  ne: {
    name: "Sita",
    amount: "+3,000,000 Won",
    flag: "🇳🇵",
    poster: "/reviews/sita.png",
    videoUrl: "https://ilvxvohksgwdiyvpkwag.supabase.co/storage/v1/object/public/review-videos/nepal_refund_review.mp4"
  },
  my: {
    name: "Kyaw",
    amount: "+1,150,000 Won",
    flag: "🇲🇲",
    poster: "/reviews/kyaw.png",
    videoUrl: "https://ilvxvohksgwdiyvpkwag.supabase.co/storage/v1/object/public/review-videos/myanmar_refund_review.mp4"
  }
};

export default function HomePage() {
  const router = useRouter();
  const { t, isReady, setLanguage, language } = useTranslation();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiVisible, setIsAiVisible] = useState(true);

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  // 방문 여부 확인 및 초기화
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      const welcomeSeen = localStorage.getItem("welcome_seen");
      
      if (urlLang) {
        localStorage.setItem("welcome_seen", "true");
        setHasSeenWelcome(true);
      } else {
        setHasSeenWelcome(!!welcomeSeen);
      }
    } catch (e) {
      console.error('LocalStorage failed:', e);
      setHasSeenWelcome(false);
    }

    // Extremely aggressive safety fallback: force loading screen to hide after 100ms
    const welcomeFallback = setTimeout(() => {
      setHasSeenWelcome(prev => prev === null ? false : prev);
    }, 100);

    return () => clearTimeout(welcomeFallback);
  }, []);

  // Redirect first-time visitors (without lang in URL and welcome_seen in localStorage) to the flag/language select page
  useEffect(() => {
    if (hasSeenWelcome === false) {
      router.push('/welcome');
    }
  }, [hasSeenWelcome, router]);

  const handleLanguageSelect = (langCode: any) => {
    localStorage.setItem('welcome_seen', 'true');
    setLanguage(langCode as any);
    logLanguageVisit(langCode);
    setHasSeenWelcome(true);
  };



  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setAiAnswer(null);
    
    try {
      const result = await askFaqQuestion({ question, language });
      setAiAnswer(result.answer);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("AI 비서 연결 실패"),
        description: t("현재 AI 비서가 응답할 수 없습니다. 잠시 후 다시 시도해 주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const faqData = [
    {
      category: t('1. 비자 및 체류 자격 (Visa & Status)'),
      items: [
        { q: t('비자 종류(E-7, E-9, F-2 등)에 상관없이 신청할 수 있나요?'), a: t("네, 비자 종류보다는 '거주자(183일 이상 한국 거주)' 여부와 '중소기업 근무' 여부가 중요합니다. 요건만 충족한다면 대부분의 취업 비자 소지자가 혜택 대상입니다.") },
        { q: t('지금은 회사를 그만두고 구직 중(D-10)이거나 본국으로 돌아갈 예정인데 가능한가요?'), a: t("과거 5년 이내에 한국 중소기업에서 일하며 세금을 냈던 기록이 있다면, 현재 무직 상태이거나 출국 예정이라도 지난 세금을 돌려받을 수 있습니다.") },
        { q: t('이 신청이 내 비자 연장이나 영주권 신청에 불이익을 주지 않나요?'), a: t('전혀 그렇지 않습니다. 이것은 정부가 법적으로 보장하는 정당한 세제 혜택이며, 세금을 체납하는 것이 아니라 이미 낸 세금을 법에 따라 환급받는 것이므로 비자 상태에 아무런 영향을 주지 않습니다.') },
      ]
    },
    {
      category: t('2. 회사와의 관계 (Relationship with Company)'),
      items: [
        { q: t('회사 몰래 신청할 수 있나요? 사장님이 알면 싫어하실까 봐 걱정돼요.'), a: t("과거의 세금을 돌려받는 '경정청구'는 회사를 통하지 않고 본인이 직접 세무서에 신청하는 것입니다. 회사에는 어떠한 통보도 가지 않으며, 회사가 비용을 부담하는 것도 아니니 안심하고 신청하셔도 됩니다.") },
        { q: t('회사가 중소기업인지 어떻게 확인하나요?'), a: t(`저희 앱에 접속하여 사업자 번호만 입력하시면, 저희 AI 시스템이 해당 기업이 감면 대상인 '중소기업 기본법'상의 중소기업인지 즉시 판별해 드립니다.`) },
      ]
    },
    {
      category: t('3. 환급 및 세금 (Refund & Tax)'),
      items: [
        { q: t('이미 연말정산을 했는데 또 받을 수 있는 게 있나요?'), a: t(`네, 연말정산 때 이 감면 혜택(90% 감면)을 적용받지 못했다면, 놓친 금액만큼을 '경정청구'라는 절차를 통해 별도로 돌려받을 수 있습니다.`) },
        { q: t('돈은 언제, 어디로 들어오나요?'), a: t('신청 후 세무서의 검토를 거쳐 보통 1~2개월 이내에 신청 시 입력하신 본인 명의의 한국 은행 계좌로 국세청에서 직접 입금됩니다.') },
        { q: t('환급금이 없으면 수수료를 안 내도 되나요?'), a: t("네, 저희 서비스는 '성공 보수' 원칙입니다. 예상 환급액을 확인하는 것은 무료이며, 실제 환급액이 발생하지 않으면 어떠한 수수료도 청구되지 않습니다.") },
      ]
    },
    {
      category: t('4. 본인 인증 및 오류 (Authentication)'),
      items: [
        { q: t('이름이 외국인 등록증(ARC)이랑 통신사에 등록된 게 다른데 어떡하죠?'), a: t("외국인들이 가장 많이 겪는 문제입니다. 저희 앱의 'AI 이름 최적화' 기능을 사용하면, 다양한 이름 조합을 자동으로 테스트하여 인증에 성공할 수 있도록 도와드립니다.") },
        { q: t('한국 핸드폰 번호가 없으면 신청이 불가능한가요?'), a: t("앱을 통한 자동 조회를 위해서는 본인 명의의 휴대폰 인증이 필수입니다. 만약 본인 명의의 휴대폰이 없으시다면, 가까운 주민센터(동사무소)나 세무서에 방문하여 발급받으신 '원천징수영수증' 사진을 촬영하여 실시간 상담원 채팅으로 보내주세요. 전문 세무사가 안전하게 개별 환급 신청을 도와드립니다.") },
      ]
    },
    {
      category: t('5. 연령 및 기간 (Age & Period)'),
      items: [
        { q: t('저는 만 34세가 넘었는데 아예 방법이 없나요?'), a: t("현재 나이가 만 34세가 넘었더라도, '취업 당시' 나이가 만 34세 이하였다면 그 시점부터 5년 동안의 세금은 환급받을 수 있습니다. 포기하기 전에 꼭 확인해 보세요.") },
        { q: t('한국에 온 지 1년밖에 안 됐는데 신청 가능한가요?'), a: t('네, 입사한 날로부터 바로 혜택이 시작됩니다. 작년에 냈던 세금을 지금 바로 환급 신청하세요.') }
      ]
    }
  ];

  // 로딩 중인 경우에만 렌더링
  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex flex-col items-center gap-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-4 group">
            <img 
              src="/1625-1.png" 
              alt="Korea Tax Refund Service Logo" 
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain shrink-0 transition-transform duration-300 group-hover:scale-110 active:scale-95"
            />
            <span className="text-2xl sm:text-3xl font-black tracking-tighter font-headline uppercase flex items-center gap-2 whitespace-nowrap">
              <span className="text-[#b88c30]">KTRS</span>
              <span className="text-[#0b192c]">Tax Refund Service</span>
            </span>
          </div>
          <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#b88c30] animate-progress-indefinite" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      <main className="flex-1">
        
        {/* 디자인 섹션 1: 히어로 섹션 */}
        <section className="relative h-[750px] overflow-hidden bg-white flex items-center">
          {/* Full-width background image */}
          <div className="absolute inset-0 z-0 select-none">
            <Image
              src="/MAIN.png"
              alt="National Assembly Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[75%_center] md:object-right"
            />
          </div>
          
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 text-left space-y-6 md:space-y-8">
                
                {/* Main Heading */}
                <div className="space-y-4">
                  {/* "외국인 근로자도 100% 지원금 대상입니다!" 미니 캡슐 배지 (관공서 안내 스타일) */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b192c]/10 border border-slate-200 text-slate-800 text-xs sm:text-sm font-black w-fit shadow-[0_2px_8px_rgba(15,25,44,0.03)]">
                    <BadgeCheck className="w-4.5 h-4.5 text-[#b88c30] shrink-0" />
                    <span className="tracking-tight">{BADGE_TEXTS[language] || BADGE_TEXTS['en']}</span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-[#0b192c] text-xl md:text-2xl lg:text-[2.2rem] font-black tracking-tight font-headline uppercase leading-none">
                      {t('FOREIGNER INCOME TAX REFUND')}
                    </h2>
                    <h3 className="text-[#b88c30] text-lg md:text-xl lg:text-2xl font-black font-headline uppercase leading-none">
                      {t('- GOVERNMENT SUPPORTED PROGRAM')}
                    </h3>
                    <h1 className="text-3xl md:text-5xl lg:text-[3.2rem] font-black text-slate-900 tracking-tight leading-[1.15] break-keep pt-2">
                      {t('외국인 중소기업 소득세 환급 - 정부 공식 제도 안내')}
                    </h1>
                  </div>

                  {/* Subtitle text only */}
                  <div className="space-y-1 pt-2">
                    <p className="text-base md:text-lg font-black text-slate-700">{t('Verify your eligibility in 1 minute.')}</p>
                    <p className="text-sm md:text-base font-bold text-slate-500">{t('Our service is securely linked with the National Tax Service (Hometax).')}</p>
                  </div>

                  {/* 청년 소득세 90% 감면 제도 안내 대형 버튼 (긴 번역어 대응용 반응형 세팅) */}
                  <div className="pt-4">
                    <Button
                      asChild
                      className="w-full sm:w-auto min-h-[4rem] h-auto py-4 px-8 bg-[#0b192c] hover:bg-[#152a45] text-white border-2 border-[#e2b659] text-base md:text-lg font-black rounded-2xl shadow-xl shadow-[#0b192c]/20 flex items-center justify-center flex-wrap gap-2 text-center leading-tight whitespace-normal break-words transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Link href="/youth-tax" className="flex items-center justify-center w-full h-full">
                        {BUTTON_TEXTS[language] || BUTTON_TEXTS['en']}
                      </Link>
                    </Button>
                  </div>
                </div>

              </div>
              <div className="hidden lg:block lg:col-span-5">
                {/* Space reserved for image background display on large screens */}
              </div>
            </div>
          </div>
        </section>

        {/* Navy Trust Banner */}
        <section className="bg-[#0b192c] text-white py-10 border-y-4 border-[#e2b659]">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
              
              {/* Col 1: Certified Partners */}
              <div className="space-y-4 pb-6 md:pb-0">
                <div className="text-[#e2b659] text-xs font-black tracking-wider uppercase">{t('Certified Partners')}</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <img src="/nts-logo.jpg" alt={t("국세청 로고")} className="h-full w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-900">{t('NTS Hometax Connected')}</div>
                      <div className="text-xs text-slate-500 font-bold">{t('국세청 홈택스 공식 실시간 연동')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <img src="/certified_security_seal_premium_1774150786685.png" alt={t("보안 인증")} className="h-full w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-900">{t('Certified Secure Platform')}</div>
                      <div className="text-xs text-slate-500 font-bold">{t('개인정보 보안 인증 플랫폼')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Visas Supported */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-10 text-left">
                <div className="text-[#e2b659] text-xs font-black tracking-wider uppercase">{t('Real Visas Supported')}</div>
                <div className="text-xl lg:text-2xl font-black text-white">{t('E-7, E-9, D-10, etc.')}</div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {languages.map((lang) => {
                    const isActive = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
                        title={lang.name}
                      >
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg shadow-sm transition-all ${
                          isActive
                            ? 'bg-[#e2b659]/20 border-[#e2b659] scale-110 ring-2 ring-[#e2b659]/30'
                            : 'bg-white/10 border-white/20 group-hover:bg-white/25 group-hover:scale-110'
                        }`}>
                          {lang.flag}
                        </span>
                        <span className={`text-[9px] font-bold transition-colors leading-none ${
                          isActive
                            ? 'text-[#e2b659] font-black'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}>
                          {lang.countryCode.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Col 3: Refund Records */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-10 text-left">
                <div className="text-[#e2b659] text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e2b659]" />
                  {t('Refund Records')}
                </div>
                <div className="space-y-4">
                  {/* 신청 건수 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('누적 환급 처리 건수')}</div>
                    <AnimatedCounter target={1247} suffix={t('건')} className="text-2xl font-black text-white" />
                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">{t('2026년 5월 기준 · 경정청구 완료')}</div>
                  </div>
                  {/* 환급 총액 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('누적 환급 총액')}</div>
                    <AnimatedCounter target={2443455552} prefix="₩" suffix={t('원')} className="text-xl font-black text-[#e2b659]" />
                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">{t('국세청 경정청구 입금 완료 기준')}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===== 청년 외국인 세무 지원 섹션 — 에디토리얼 프리미엄 ===== */}
        <section id="tax-reduction-guide" className="bg-white overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30]" />

          <div className="container mx-auto max-w-7xl px-6 py-16 lg:py-24">
            {/* 상단: 2열 구조 (왼쪽: 사진, 오른쪽: 헤드라인/수치/타임라인) */}
            <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-12 lg:gap-16 items-start">

              {/* ─── 왼쪽: 매니저 사진 ─── */}
              <div className="relative w-full max-w-[480px] mx-auto lg:mx-0">
                {/* 뒤 골드 장식 */}
                <div className="absolute top-4 -left-3 w-full h-full rounded-3xl border-2 border-[#b88c30]/20 bg-[#f5f0e8]/50 -z-0" />

                 <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(15,30,54,0.18)]" style={{ height: '520px' }}>
                  <Image
                    src="/images/manager.png"
                    alt={t("김준현 공식 매니저")}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover object-top"
                  />
                  {/* 하단 페이드 */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0f1e36]/90 to-transparent z-10" />
                  {/* 상단 Official Manager 라인 */}
                  <div className="absolute top-5 left-5 right-5 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#b88c30]/40" />
                    <span className="text-[#b88c30] text-[10px] font-black uppercase tracking-[0.3em]">Official Manager</span>
                    <div className="h-px flex-1 bg-[#b88c30]/40" />
                  </div>
                  {/* 하단 이름 */}
                  <div className="absolute bottom-0 left-0 right-0 px-6 py-4 text-center">
                    <div className="text-white font-black text-xl">{t("김준현 공식 매니저")}</div>
                    <div className="text-slate-300 font-bold text-xs mt-0.5">{t("외국인 중소기업 청년 소득세 환급 전문")}</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs font-black">{t("지금 상담 가능 · 010-5964-5340")}</span>
                    </div>
                  </div>
                </div>

                {/* 90% 플로팅 배지 */}
                <div className="absolute top-8 -right-4 z-20 bg-[#b88c30] rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(184,140,48,0.40)] text-center">
                  <div className="text-[#0f1e36] font-black text-3xl leading-none">90%</div>
                  <div className="text-[#0f1e36]/70 font-black text-xs mt-0.5">{t("소득세 감면")}</div>
                </div>
              </div>

              {/* ─── 오른쪽: 헤드라인 + 수치 + 타임라인 ─── */}
              <div className="flex flex-col gap-8 lg:pt-2">

                {/* 아이브로우 */}
                <div className="flex items-center gap-3">
                  <div className="h-[3px] w-8 bg-[#b88c30]" />
                  <span className="text-[#b88c30] text-xs font-black tracking-[0.35em] uppercase">{t("조세특례제한법 제30조 · 정부 공식 제도")}</span>
                </div>

                {/* 헤드라인 */}
                <div className="space-y-3 border-l-4 border-[#b88c30] pl-6">
                  <h2 className="text-4xl sm:text-5xl font-black text-[#0f1e36] tracking-tight leading-[1.1] break-keep font-headline">
                    {t("월급에서 이미 낸 세금")}<br />
                    <span className="text-[#b88c30]">{t("90%")}</span>{t("를 돌려받을 권리")}
                  </h2>
                  <p className="text-slate-500 font-bold text-base leading-relaxed break-keep">
                    {t('대한민국 정부가 중소기업 청년 근로자에게 보장하는 법정 세제 혜택입니다. 외국인 근로자도 동일하게 적용됩니다.')}
                  </p>
                </div>

                {/* 핵심 수치 3개 */}
                <div className="grid grid-cols-3 gap-3">
                   {[
                     { value: t('90%'), label: t('소득세 감면율'), sub: t('취업일부터 5년간'), dark: true },
                     { value: t('200만원'), label: t('연간 최대 환급'), sub: t('과세연도 한도'), dark: false },
                     { value: t('1,000만원'), label: t('5년 누적 총액'), sub: t('평균 실수령 300만+'), dark: false },
                   ].map((item) => (
                     <div key={item.value} className={`rounded-xl p-5 text-center border ${item.dark ? 'bg-[#0f1e36] border-[#0f1e36]' : 'bg-[#f5f0e8] border-[#b88c30]/20'}`}>
                       <div className={`font-black text-2xl sm:text-3xl leading-none ${item.dark ? 'text-[#b88c30]' : 'text-[#0f1e36]'}`}>{item.value}</div>
                       <div className={`font-black text-xs mt-2 ${item.dark ? 'text-white' : 'text-[#0f1e36]'}`}>{item.label}</div>
                       <div className={`font-bold text-xs mt-0.5 ${item.dark ? 'text-slate-400' : 'text-slate-500'}`}>{item.sub}</div>
                     </div>
                   ))}
                 </div>

                 {/* 5년 타임라인 */}
                 <div className="bg-[#f5f0e8] rounded-xl p-6 space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-[#0f1e36] font-black text-base">{t("5년 환급 타임라인")}</span>
                     <span className="text-[#b88c30] font-black text-sm">{t("누적 최대 1,000만원")}</span>
                   </div>
                   <div className="flex gap-2">
                     {[t('1년차'), t('2년차'), t('3년차'), t('4년차'), t('5년차')].map((yr, i) => (
                       <div key={yr} className="flex-1 space-y-1.5">
                         <div className="h-7 rounded bg-[#b88c30] transition-all hover:h-9" style={{ opacity: 0.35 + i * 0.13 }} />
                         <div className="text-center text-[10px] text-slate-500 font-black">{yr}</div>
                         <div className="text-center text-[10px] text-[#b88c30] font-black">{t("+200만")}</div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* 법적 대행 안내 */}
                 <div className="flex items-start gap-4 bg-[#f5f0e8] border border-[#b88c30]/20 rounded-xl px-5 py-4">
                   <BadgeCheck className="h-6 w-6 text-[#b88c30] shrink-0 mt-0.5" />
                   <div>
                     <div className="text-[#0f1e36] font-black text-base">{t("공인 세무사 직접 대행")}</div>
                     <div className="text-slate-500 font-bold text-sm mt-0.5 break-keep">{t("비자 불이익 없음 · 조세특례제한법 제30조 기반 정당한 법적 혜택")}</div>
                   </div>
                 </div>
              </div>
            </div>

            {/* 웅장한 가로 구분선 */}
            <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-[#b88c30]/30 to-transparent" />

            {/* ─── 하단: 세금 감면 상세 정보 및 신청 자격 요약 (2열 프리미엄 레이아웃) ─── */}
            <div className="max-w-5xl mx-auto space-y-12">
                  
                  {/* 섹션 소제목 */}
                  <div className="space-y-4">
                    <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">{t("01 — Benefit Details")}</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f1e36] leading-tight break-keep font-headline">
                      {t("파격적인 세금 감면 제도, 알고 계셨나요?")}
                    </h2>
                    <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
                  </div>

                  {/* 2열 상세 구조 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* 1) 왼쪽: 친절한 제도 설명 및 환급 예시 */}
                    <div className="space-y-8">
                      {/* 핵심 설명 */}
                      <p className="text-slate-600 text-base sm:text-lg font-bold leading-relaxed break-keep">
                        {t("대한민국 정부는 중소기업에 취업한 청년 근로자들에게 매우 큰 세금 감면 혜택을 제공하고 있으며, 이는 외국인 근로자(베트남 등 모든 국적)에게도 동일하게 적용되는 정당한 권리입니다.")}
                      </p>

                      {/* 어떤 세금을 돌려받는가 */}
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                          <span className="text-sm font-black text-[#0f1e36] uppercase tracking-wider">{t("어떤 세금을 돌려받나요?")}</span>
                        </div>
                        <p className="text-slate-600 text-sm font-bold leading-relaxed break-keep">
                          {t("매달 월급을 받을 때 회사가 급여에서 미리 떼어 가는 '근로소득세 (원천징수세)'가 그 대상입니다. 예를 들어 월급이 250만원이라면 회사가 매월 약 3~8만원의 소득세를 자동으로 공제한 후 지급합니다. 이 세금의 90%를 돌려받는 제도입니다.")}
                        </p>
                      </div>

                      {/* 실제 환급 계산 예시 */}
                      <div className="p-6 bg-[#0f1e36]/3 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                          <span className="text-sm font-black text-[#0f1e36] uppercase tracking-wider">{t("실제 환급 계산 예시")}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200">
                            <span className="text-slate-500 font-bold">{t("연간 소득세 100만원인 경우")}</span>
                            <span className="font-black text-emerald-600">{t("→ 90만원 환급")}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200">
                            <span className="text-slate-500 font-bold">{t("연간 소득세 200만원인 경우")}</span>
                            <span className="font-black text-emerald-600">{t("→ 180만원 환급")}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm py-2">
                            <span className="text-slate-500 font-bold">{t("연간 소득세 300만원인 경우")}</span>
                            <span className="font-black text-emerald-600">{t("→ 200만원 환급 (한도 적용)")}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-bold">{t("※ 연간 최대 감면 한도 200만원. 5년 적용 시 최대 1,000만원")}</p>
                      </div>

                      {/* 과거 환급 + 현실적 문제 */}
                      <div className="space-y-4">
                        <div className="flex gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-black text-[#0f1e36] mb-1">{t("과거 5년치 환급 가능 (경정청구)")}</div>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">
                              {t("제도를 몰라서 신청하지 못했어도, '경정청구'를 통해 최대 5년치 이미 납부한 세금을 전액 일시에 돌려받을 수 있습니다. 퇴사 후에도 신청 가능합니다.")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 p-5 bg-red-50 rounded-2xl border border-red-100">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-black text-[#0f1e36] mb-1">{t("현실적인 문제")}</div>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed break-keep">
                              {t("대부분의 중소기업은 외국인 근로자를 위한 감면 신청서를 별도로 챙겨주지 않습니다. 회사가 처리해주지 않으면 근로자 본인이 놓치게 되며, 수년치 세금을 그냥 납부하는 경우가 대부분입니다.")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2) 오른쪽: 다크 네이비 "신청 자격 요약" 카드 */}
                    <div className="bg-[#0f1e36] rounded-3xl p-8 sm:p-10 space-y-6 text-white shadow-2xl shadow-slate-900/20 border border-[#b88c30]/20">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                        <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                        <span className="text-[#b88c30] text-xs font-black uppercase tracking-widest">{t("신청 자격 요약")}</span>
                      </div>
                      {[
                        { label: t("신청 대상"), value: t("만 15 ~ 34세 외국인") },
                        { label: t("근무지 요건"), value: t("중소기업 재직자") },
                        { label: t("거주 요건"), value: t("183일 이상 국내 거소") },
                        { label: t("감면율"), value: t("소득세 90%") },
                        { label: t("연간 한도"), value: t("200만원 / 년") },
                        { label: t("최대 한도"), value: t("누적 1,000만원") },
                        { label: t("적용 기간"), value: t("최대 5년") },
                        { label: t("과거 환급"), value: t("경정청구로 5년치 가능") },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-800 last:border-0">
                          <span className="text-slate-400 text-sm font-bold">{row.label}</span>
                          <span className="text-white text-sm font-black">{row.value}</span>
                        </div>
                      ))}
                      
                      <Button asChild className="w-full min-h-[4rem] h-auto py-4 px-6 premium-btn-shimmer bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30] hover:from-[#e2b659] hover:to-[#b88c30] text-[#0f1e36] font-black rounded-2xl text-base mt-4 shadow-xl shadow-[#b88c30]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer whitespace-normal break-words">
                        <Link href="/estimate" className="flex items-center justify-center flex-wrap gap-2 text-center leading-tight w-full">
                          <span>{t("예상 환급액 무료 조회")}</span>
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 shrink-0 text-[#0f1e36]" />
                        </Link>
                      </Button>
                    </div>

                  </div>
                  {/* ── 정리된 새 버전 ── */}
                  <div className="bg-slate-50 rounded-3xl p-8 lg:p-10 border border-[#b88c30]/15 shadow-[0_16px_48px_rgba(15,30,54,0.06)]">

                    {/* 타이틀 */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-[3px] w-8 bg-[#b88c30]" />
                      <div>
                        <div className="text-[#b88c30] text-xs font-black uppercase tracking-[0.25em]">{t('신청 자격 · 4가지 조건')}</div>
                        <div className="text-slate-400 text-xs font-bold mt-0.5">{t('4가지 중 하나라도 해당되면 환급 신청 가능합니다')}</div>
                      </div>
                    </div>

                    {/* 자격 카드 - 핵심어 압축 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: '🎂', title: t('만 15~34세 외국인'), sub: t('군복무 시 최대 만 40세까지 · 비자 종류 무관') },
                        { icon: '🏢', title: t('중소기업 재직자'), sub: t('제조·IT·서비스업 등 감면 대상 업종 근무') },
                        { icon: '🛂', title: t('183일 이상 국내 거주'), sub: t('E-7, E-9, D-10, F-2 등 합법 취업 비자 동일 적용') },
                        { icon: '📋', title: t('5년 이내 소급 환급 가능'), sub: t('퇴사 후 · 출국 예정자도 경정청구로 신청 가능') },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-[#b88c30]/40 transition-all shadow-sm group">
                          <span className="text-xl shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#0f1e36] font-black text-sm group-hover:text-[#b88c30] transition-colors">{item.title}</div>
                            <div className="text-slate-400 font-bold text-xs mt-0.5 break-keep">{item.sub}</div>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-[#b88c30] shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>

                    {/* 후불제 카드는 하단 섹션에 중복 존재하므로 제거됨 */}

                  </div>



                  {/* 제도안내 자세히 알아보기 CTA (긴 번역어 대응용 반응형 세팅) */}
                  <div className="flex justify-center pt-4">
                    <Button size="lg" asChild className="premium-btn-shimmer w-full sm:w-auto text-lg font-black min-h-[4rem] h-auto py-4 px-6 bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30] hover:from-[#e2b659] hover:to-[#b88c30] text-[#0f1e36] rounded-2xl shadow-xl shadow-[#b88c30]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer whitespace-normal break-words">
                      <Link href="/youth-tax" className="flex items-center justify-center flex-wrap gap-2 text-center leading-tight w-full">
                        <span>{t('청년 소득세 90% 감면 제도안내 자세히 알아보기')}</span>
                        <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1.5 shrink-0" />
                      </Link>
                    </Button>
                  </div>

            </div>

          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#b88c30]/40 to-transparent" />
        </section>
        {/* 임팩트 신뢰 슬로건 배너 */}
        <div className="h-[5px] w-full bg-gradient-to-r from-transparent via-[#b88c30] to-transparent" />
        <section className="w-full bg-[#0f1e36] py-20 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-7">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-[#b88c30]" />
              <span className="text-[#b88c30] text-xs font-black tracking-widest uppercase">
                {t('대한민국 국세청(NTS) 조세특례제한법 제30조 법적 근거')}
              </span>
              <div className="h-px w-10 bg-[#b88c30]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug break-keep">
              {t('그냥 지나치기 쉬운 세금 감면 혜택,')}{' '}
              <span className="text-[#b88c30]">{t('외국인 근로자도 동일하게 보장받는 법적 권리입니다.')}</span>
            </h2>
            <div className="h-px w-20 bg-[#b88c30] mx-auto" />
            <p className="text-slate-300 text-base sm:text-lg font-bold leading-relaxed max-w-4xl mx-auto break-keep">
              {t('본 제도는 대한민국 조세특례제한법에 근거한 공식 세제 지원책입니다. 대한민국 세법은 내·외국인 간 세무상 차별을 두지 않으므로, 납세 의무를 다한 외국인 근로자라면 누구나 안전하게 국세청을 통해 정당한 소득세 환급을 청구할 수 있습니다.')}
            </p>
          </div>
        </section>
        <div className="h-[5px] w-full bg-gradient-to-r from-transparent via-[#b88c30] to-transparent" />

        {/* 안심 보장 카드 섹션 */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* 헤더 */}
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-[2px] w-8 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black uppercase tracking-[0.3em]">02 — 3-Tier Guarantee · No Win, No Fee</span>
              </div>
              <h2
                className="text-3xl md:text-5xl font-black text-[#0f1e36] leading-tight tracking-tight break-keep mb-4"
                dangerouslySetInnerHTML={{ __html: t('수수료 선결제 0원, 오직 환급 성공 시에만 정산받는 3대 안심 보장제도') }}
              />
              <p className="text-slate-500 font-bold text-base md:text-lg leading-relaxed break-keep max-w-2xl">
                {t('0.1초 만에 조회하고, 환급금이 통장에 안전하게 입금된 것을 직접 확인한 후에 정산하세요.')}
              </p>
            </div>

            {/* 3열 카드 */}
            <div className="grid md:grid-cols-3 gap-6">

              {/* 카드 01 */}
              <div className="group relative bg-white border-t-4 border-t-[#b88c30] border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                  <Coins className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#0f1e36] leading-snug break-keep">
                  {t('초기 비용 0원, 완전 무료 시작')}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">
                  {t('서비스 신청 시 필요한 비용은 전혀 없습니다. 예상 환급액 조회부터 전문 세무사의 전담 검토 단계까지, 신청 시점에 고객님이 내야 할 돈은 단 1원도 없습니다.')}
                </p>
              </div>

              {/* 카드 02 — 가운데 다크 네이비 대신 깔끔한 화이트 + 네이비 상단 포인트 */}
              <div className="group relative bg-white border-t-4 border-t-[#0f1e36] border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#0f1e36] leading-snug break-keep">
                  {t('환급 거절/실패 시 수수료 0원')}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">
                  {t('세무서 심사 결과 환급액이 나오지 않으면 서비스 수수료도 청구되지 않습니다. 고객님은 비용 손실이나 리스크가 0%이므로 안심하고 권리를 찾으세요.')}
                </p>
              </div>

              {/* 카드 03 */}
              <div className="group relative bg-white border-t-4 border-t-[#b88c30] border-x border-b border-slate-200/80 rounded-3xl p-8 space-y-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-14 w-14 bg-[#0f1e36]/5 rounded-2xl flex items-center justify-center text-[#0f1e36]">
                  <Banknote className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-[#0f1e36] leading-snug break-keep">
                  {t('환급금 입금된 후 후불 정산')}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-bold leading-relaxed break-keep">
                  {t('국세청에서 고객님 명의의 은행 계좌로 환급금을 직접 입금해 드리면, 나중에 후불 정산합니다.')}
                </p>
              </div>

            </div>
          </div>
        </section>
        {/* 후불 FLOW TIMELINE - Added above comparison table */}
        <section className="py-20 bg-white border-t border-slate-100 px-6">
          <div className="max-w-6xl mx-auto space-y-14">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black tracking-[0.3em] uppercase">{t('후불 정산 순서')}</span>
                <div className="h-px w-10 bg-[#b88c30]" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0f1e36]">{t('신청부터 환급까지, 3단계')}</h2>
            </div>

            {/* Steps */}
            <div className="relative">
              {/* connecting gold line */}
              <div className="hidden md:block absolute top-6 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-[#b88c30]" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {[
                  {
                    num: "01",
                    icon: "⏱",
                    tag: t("무료 · 즉시"),
                    title: t("홈페이지 접속 및 조회"),
                    desc: t("홈페이지 주소(또는 QR코드)로 접속하여 이름·외국인등록번호만 입력하면 30초 안에 예상 환급액을 무료로 확인할 수 있습니다."),
                  },
                  {
                    num: "02",
                    icon: "%",
                    tag: t("선결제 없음"),
                    title: t("전담 세무사 매칭 & 신청"),
                    desc: t("전담 공인 세무사가 1:1로 배정되어 경정청구 서류를 대신 준비하고 국세청에 직접 제출합니다. 수수료 선결제 없이 진행됩니다."),
                  },
                  {
                    num: "03",
                    icon: "💰",
                    tag: t("NO WIN, NO FEE"),
                    title: t("환급금 입금 후 성공 보수"),
                    desc: t("국세청에서 환급금이 본인 통장에 직접 입금된 뒤, 성공 보수를 수취합니다. 환급이 되지 않으면 수수료도 없습니다."),
                  },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-5">
                    {/* Number circle */}
                    <div className="h-12 w-12 rounded-full bg-[#0f1e36] text-[#b88c30] font-black text-lg flex items-center justify-center shadow-lg ring-4 ring-white">
                      {step.num}
                    </div>
                    {/* Icon circle */}
                    <div className="h-14 w-14 rounded-full bg-[#f5f0e8] flex items-center justify-center text-xl shadow-sm">
                      {step.icon}
                    </div>
                    {/* Tag */}
                    <span className="text-xs font-black text-[#b88c30] italic tracking-wider border border-[#b88c30]/30 rounded-full px-3 py-1 bg-[#b88c30]/5">
                      {step.tag}
                    </span>
                    {/* Title */}
                    <h3 className="text-lg font-black text-[#0f1e36] leading-snug">{step.title}</h3>
                    {/* Desc */}
                    <p className="text-slate-500 font-bold text-sm leading-relaxed break-keep max-w-xs">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE - Added right below 3-Tier Guarantee */}
        <section className="pb-20 md:pb-28 px-6 bg-white">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="h-px w-full bg-slate-100 mb-16" />
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-[2px] w-8 bg-[#b88c30]" />
                <span className="text-[#b88c30] text-xs font-black uppercase tracking-[0.3em]">03 — Why Us</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#0f1e36] leading-tight tracking-tight break-keep mb-4">
                {t('왜 Korea Tax Refund Service인가?')}
              </h2>
              <div className="h-1 w-12 bg-[#b88c30] rounded-full" />
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-slate-50 px-6 py-5 text-left text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest w-1/3">{t('비교 항목')}</th>
                    <th className="bg-slate-100 px-6 py-5 text-center text-xs md:text-sm font-black text-slate-500 w-1/3">{t('타 서비스 (선결제)')}</th>
                    <th className="bg-[#0f1e36] px-6 py-5 text-center text-xs md:text-sm font-black text-[#b88c30] w-1/3">{t('Korea Tax Refund Service (후불제)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { item: t("신청 초기 비용"), other: t("수만~수십만원"), us: t("완전 무료 (0원)") },
                    { item: t("환급 실패 시"), other: t("수수료 환불 안 됨"), us: t("수수료 청구 없음") },
                    { item: t("수수료 납부 시점"), other: t("신청 전 선결제"), us: t("환급금 입금 후 후납") },
                    { item: t("세무사 직접 대행"), other: t("자동화 처리만"), us: t("공인 세무사 1:1 검토") },
                    { item: t("고객 리스크"), other: t("높음 (선납 손실 위험)"), us: t("0% (No Win, No Fee)") },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-black text-xs md:text-sm text-[#0f1e36]">{row.item}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1 text-red-400 font-bold text-xs md:text-sm">
                          <X className="h-4 w-4 shrink-0" />{row.other}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center bg-[#0f1e36]/5">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-black text-xs md:text-sm">
                          <Check className="h-4 w-4 shrink-0" />{row.us}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>


        {/* 디자인 섹션 2: 신뢰 지표 */}
        <section className="py-8 bg-slate-50/60 border-y border-slate-100/80 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">

              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-6 w-6 text-[#b88c30] shrink-0" />
                <span className="font-black text-base md:text-lg text-[#2b4c7e] tracking-tight whitespace-nowrap">{t('공인 세무사 직접 대행')}</span>
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200" />

              <div className="flex items-center h-12 md:h-14">
                <Image src="/nts-logo.jpg" alt={t("국세청")} width={110} height={44} className="h-10 md:h-12 w-auto object-contain" />
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200" />

              <div className="flex items-center h-12 md:h-14">
                <Image src="/official_nts_carrier_badge_v2_1774141326494.png" alt="NTS Badge" width={48} height={48} className="h-10 md:h-12 w-auto object-contain" />
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200" />

              <div className="flex items-center h-12 md:h-14">
                <Image src="/certified_security_seal_premium_1774150786685.png" alt="Security Seal" width={48} height={48} className="h-10 md:h-12 w-auto object-contain" />
              </div>

              <div className="hidden md:block h-8 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                <span className="font-black text-base md:text-lg text-[#2b4c7e] tracking-tight whitespace-nowrap">{t('개인정보 보호 인증')}</span>
              </div>

            </div>
          </div>
        </section>

        {/* 디자인 섹션 3: 정부 공인 상세 안내 */}
        <section className="py-24 bg-[#faf6f0] relative overflow-hidden">
          {/* Subtle elegant legal patterns */}
          <div className="absolute inset-0 bg-[#0b192c]/[0.01] pointer-events-none" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#b88c30]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10 max-w-5xl">
            <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-16 p-10 md:p-14 bg-[#0f1e36] rounded-[2.5rem] shadow-[0_24px_60px_rgba(15,30,54,0.35)] border-2 border-[#b88c30]/35 overflow-hidden">
              
              {/* Decorative corner borders for classic official feel */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#b88c30]/50 rounded-tl-xl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#b88c30]/50 rounded-tr-xl" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#b88c30]/50 rounded-bl-xl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#b88c30]/50 rounded-br-xl" />
              
              {/* Left Column: Official Stamp Frame */}
              <div className="shrink-0 relative group mx-auto md:mx-0">
                {/* Elegant outer glow */}
                <div className="absolute -inset-4 bg-[#b88c30]/15 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Double-bordered luxury frame for the partner badge */}
                <div className="relative p-2.5 rounded-[2rem] bg-[#0b192c] border border-[#b88c30]/35 shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
                  <div className="rounded-[1.5rem] overflow-hidden bg-white p-5 border border-[#b88c30]/20">
                    <Image 
                      src="/official_nts_carrier_badge_v2_1774141326494.png"
                      alt="Official NTS & Carrier Badge" 
                      width={160}
                      height={160}
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Text & Detailed Grid */}
              <div className="flex-1 space-y-6 text-left">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#b88c30]/40 text-[#e2b659] bg-[#b88c30]/10">
                  <ShieldCheck className="h-4 w-4 text-[#e2b659] animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] leading-none">{t('safe_and_secure')}</span>
                </div>
                
                {/* Title */}
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight font-headline">
                    {t('nts_trust_title')}
                  </h2>
                  {/* Decorative line under title */}
                  <div className="h-0.5 w-16 bg-gradient-to-r from-[#b88c30] to-transparent" />
                </div>
                
                {/* Message */}
                <p className="text-slate-300 font-bold text-base md:text-lg leading-relaxed max-w-2xl">
                  {t('nts_trust_message')}
                </p>
                
                {/* Clean data blocks matching law firm style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-700/60 w-full">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 transition-all hover:bg-white/10 hover:border-[#b88c30]/30 group">
                    <div className="h-10 w-10 bg-[#b88c30]/10 border border-[#b88c30]/35 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-[#e2b659]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">database portal</div>
                      <div className="text-white text-sm font-black transition-colors group-hover:text-[#e2b659]">{t('nts_hometax')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 transition-all hover:bg-white/10 hover:border-[#b88c30]/30 group">
                    <div className="h-10 w-10 bg-[#b88c30]/10 border border-[#b88c30]/35 rounded-xl flex items-center justify-center shrink-0">
                      <UserCheck className="h-5 w-5 text-[#e2b659]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">carrier auth</div>
                      <div className="text-white text-sm font-black transition-colors group-hover:text-[#e2b659]">{t('SKT / KT / LGU+')}</div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* 10단계 시뮬레이터 쇼케이스 */}
        <section className="py-0 bg-[#0b192c]">
          <div className="container mx-auto px-4">
            <TaxRefundSimulator />
          </div>
        </section>

        {/* 디자인 섹션 5: 문제 제기 */}
        <section className="py-24 md:py-32 bg-white overflow-hidden relative">
          {/* 골드 장식 라인 */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#b88c30]/40 to-transparent" />
          {/* 배경 글로우 */}
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#b88c30]/4 rounded-full blur-[140px] pointer-events-none" />

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* 왼쪽: 헤드라인 + 수치 */}
              <div className="space-y-10">
                <div className="space-y-5">
                  {/* 아이브로우 */}
                  <div className="flex items-center gap-3">
                    <div className="h-[3px] w-8 bg-[#b88c30]" />
                    <span className="text-[#b88c30] text-xs font-black uppercase tracking-[0.3em]">{t('실제 문제')}</span>
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-black font-headline text-[#0f1e36] leading-tight whitespace-pre-line border-l-4 border-[#b88c30] pl-6">
                    {t("Why didn't I know\nthis before?")}
                  </h2>
                  <p className="text-lg font-bold text-slate-500">{t('외국인 근로자 10명 중 9명이 환급을 받지 못하는 이유')}</p>
                </div>
                <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl break-keep">{t(`대한민국 정부는 중소기업에서 활약하는 젊은 인재들을 위해 강력한 세제 혜택를 제공합니다. 하지만 정작 혜택를 받아야 할 외국인 근로자들은 정보 부족과 까다로운 본인 인증 절차 때문에 매년 수백만 원을 국가에 남겨두고 있습니다.`)}</p>

                {/* 수치 카드 3개 */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: t('매년 최대 환급액'), value: t('200만 원') },
                    { label: t('최대 환급액'), value: t('1,000만 원') },
                    { label: t('과거 내역 소급'), value: t('과거 5년치') },
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-[#f5f0e8] border border-[#b88c30]/20 rounded-2xl text-center space-y-2 hover:border-[#b88c30]/40 transition-all">
                      <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{item.label}</div>
                      <div className="text-xl font-black text-[#0f1e36]">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽: 이유 카드 */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#0f1e36]/5 rounded-[3rem] -rotate-2 pointer-events-none" />
                <div className="relative bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 space-y-6 shadow-xl">
                  {/* 코너 장식 */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#b88c30]/40 rounded-tl-xl" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#b88c30]/40 rounded-tr-xl" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#b88c30]/40 rounded-bl-xl" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#b88c30]/40 rounded-br-xl" />

                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <div className="h-2 w-2 rounded-full bg-[#b88c30]" />
                    <h3 className="text-lg font-black text-[#0f1e36]">{t('왜 지금까지 못 받았을까요?')}</h3>
                  </div>
                  <div className="space-y-4">
                    {[t('복잡한 조세특례제한법 법률 용어'), t('통신사와 ARC 명의 불일치로 인한 인증 실패'), t('회사 인사팀에 직접 물어보기 껄끄러운 상황'), t('외국인 전문 상담 창구의 부재')].map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-[#b88c30]/30 hover:shadow-sm transition-all group">
                        <div className="h-8 w-8 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-[#0f1e36] transition-colors">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 디자인 섹션 4: 해결책 */}
        <section className="py-24 md:py-32 bg-[#0b192c] relative overflow-hidden">
          {/* 장식 */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e2b659] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e2b659] to-transparent" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#b88c30]/6 rounded-full blur-[140px] pointer-events-none" />

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            {/* 헤더 */}
            <div className="text-center space-y-5 mb-16">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-[#e2b659]" />
                <span className="text-[#e2b659] text-xs font-black uppercase tracking-[0.3em]">Our Solution</span>
                <div className="h-px w-10 bg-[#e2b659]" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-black font-headline text-white leading-tight">
                {t('가장 까다로운 인증을')}<br />
                <span className="text-[#e2b659]">{t('가장 확실하게 해결합니다')}</span>
              </h2>
              <p className="text-slate-300 font-bold text-base max-w-xl mx-auto">{t('Korea Tax Refund Service만의 독자적인 기술력과 전문성을 경험하세요.')}</p>
            </div>

            {/* 3열 카드 */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: ScanSearch, title: t('외국인 전용 성명 매칭 알고리즘'), desc: t('ARC와 통신사 정보의 이름 형식이 달라 발생하는 고질적인 인증 오류를 저희만의 독자적인 알고리즘으로 해결했습니다.') },
                { icon: UserCheck, title: t('국가 공인 세무 전문가의 검토'), desc: t('단순한 자동화 프로그램이 아닙니다. 모든 신청은 대한민국 공인 세무사의 철저한 검토를 거쳐 진행됩니다.') },
                { icon: Lock, title: t('금융권 수준의 데이터 보안'), desc: t('당신의 소중한 개인정보는 은행급 암호화 프로토콜로 보호됩니다. 환급 목적 외 데이터 사용은 절대 금지됩니다.') },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-5 hover:border-[#e2b659]/40 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                  {/* 코너 골드 장식 */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#e2b659]/40 rounded-tl-lg group-hover:border-[#e2b659]/80 transition-colors" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#e2b659]/40 rounded-tr-lg group-hover:border-[#e2b659]/80 transition-colors" />

                  <div className="h-14 w-14 bg-[#e2b659]/10 border border-[#e2b659]/20 rounded-2xl flex items-center justify-center group-hover:bg-[#e2b659]/20 transition-colors">
                    <Icon className="h-7 w-7 text-[#e2b659]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-white leading-snug break-keep">{title}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed text-sm break-keep group-hover:text-slate-300 transition-colors">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 디자인 섹션 7: CTA */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6 max-w-5xl text-center space-y-12">
            <h2 className="text-4xl lg:text-7xl font-black font-headline text-slate-900 text-gradient break-keep">
              {t('단 30초의 확인으로, 선결제 없이')}<br />{t('지난 5년의 권리를 찾으세요.')}
            </h2>
            <div className="flex flex-col items-center gap-8 pt-8">
              <Button size="lg" asChild className="w-full sm:w-auto text-xl sm:text-3xl px-8 sm:px-12 py-8 sm:py-12 h-auto bg-[#0b192c] hover:bg-[#152a45] text-white border-2 border-[#e2b659] shadow-xl rounded-2xl transition-all hover:scale-105 active:scale-95 whitespace-normal break-words">
                <Link href="/estimate" className="flex items-center justify-center flex-wrap gap-4 text-center leading-tight py-4 w-full text-white">
                  <span className="flex-1 min-w-[200px] flex flex-wrap items-center justify-center gap-1.5 font-black text-white">
                    <span className="font-black">
                      {language === 'ko' ? (
                        <>
                          <span className="text-[#e2b659] mr-1.5">국세청 안전 연동으로</span>
                          <span className="text-white">내 숨은 환급금 무료 조회하기</span>
                        </>
                      ) : (
                        <span className="text-white">
                          {t('국세청 안전 연동으로 내 숨은 환급금 무료 조회하기')}
                        </span>
                      )}
                    </span>
                  </span> <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 text-white" />
                </Link>
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-black"><ShieldCheck className="h-6 w-6 text-[#b88c30]" />{t('전문적인 서비스')}</div>
                <div className="hidden sm:block h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-900 font-black"><RotateCcw className="h-6 w-6 text-[#b88c30]" />{t('리스크 제로')}</div>
              </div>
              <p className="text-slate-400 font-bold max-lg">{t('우리는 단순히 계산기만 돌리는 앱이 아닙니다. 전문적인 서비스, 리스크는 제로. 환급 성공 시에만 수수료가 청구되며 실패 시 수수료는 0원입니다.')}</p>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 8: 보안 안심 보증서 */}
        <section className="py-20 bg-[#faf6f0] overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* 남색 카드 — NTS 카드와 동일한 구조 */}
              <div className="bg-[#0b192c] border border-[#e2b659]/25 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
                {/* 코너 골드 장식 */}
                <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#e2b659]/60 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#e2b659]/60 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#e2b659]/60 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#e2b659]/60 rounded-br-lg" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#b88c30]/8 rounded-full -translate-y-1/2 translate-x-1/4 blur-[80px] pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row items-center gap-10">
                  {/* 왼쪽: 흰색 박스 안 보안 씰 */}
                  <div className="shrink-0 bg-white rounded-2xl p-5 shadow-lg flex items-center justify-center w-[150px] h-[150px]">
                    <Image
                      src="/certified_security_seal_premium_1774150786685.png"
                      alt="Certified Security"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>

                  {/* 오른쪽 */}
                  <div className="flex-1 space-y-5 text-center lg:text-left">
                    {/* 배지 */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e2b659]/10 border border-[#e2b659]/30">
                      <Lock className="h-3 w-3 text-[#e2b659]" />
                      <span className="text-xs font-black text-[#e2b659] tracking-[0.2em] uppercase">{t('security_certified')}</span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight break-keep">
                        {t('security_card_title')}
                      </h2>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        {t('security_card_subtitle')}
                      </p>
                    </div>

                    {/* 3개 데이터 블록 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {[
                        { icon: Lock, label: t('security_item_encryption_title'), sub: t('security_item_encryption_desc') },
                        { icon: Database, label: t('security_item_no_storage_title'), sub: t('security_item_no_storage_desc') },
                        { icon: Shield, label: t('security_item_pippa_title'), sub: t('security_item_pippa_desc') },
                      ].map(({ icon: Icon, label, sub }, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#e2b659]/30 transition-all">
                          <Icon className="h-4 w-4 text-[#e2b659] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] font-black text-[#e2b659]/80 uppercase tracking-widest mb-0.5">{label}</div>
                            <div className="text-xs font-bold text-slate-300 leading-snug">{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 디자인 섹션 6: 미래 가치 */}
        <section className="py-24 md:py-32 bg-white overflow-hidden relative">
          {/* 상단 골드 라인 */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#b88c30]/50 to-transparent" />
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b88c30]/4 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#0b192c]/3 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* 왼쪽: 헤드라인 + 인용구 */}
              <div className="space-y-10">
                <div className="space-y-5">
                  {/* 아이브로우 */}
                  <div className="flex items-center gap-3">
                    <div className="h-[3px] w-8 bg-[#b88c30]" />
                    <span className="text-[#b88c30] text-xs font-black uppercase tracking-[0.3em]">{t('당신의 미래 가치')}</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black font-headline text-[#0b192c] leading-tight border-l-4 border-[#b88c30] pl-6">
                    {t('연간 200만 원,')}<br />
                    <span className="text-[#b88c30]">{t('당신의 한국 생활이 달라집니다')}</span>
                  </h2>
                  <p className="text-base text-slate-500 font-medium leading-relaxed max-w-lg break-keep">
                    {t('매년 한 달 치 월급을 보너스로 받는다고 상상해 보세요. Korea Tax Refund Service가 찾아드리는 환급금은 단순한 숫자가 아닌 당신의 미래를 위한 소중한 자산입니다.')}
                  </p>
                </div>

                {/* 격조 있는 인용구 */}
                <div className="relative p-7 bg-[#faf6f0] border-l-4 border-[#b88c30] rounded-r-2xl">
                  <div className="absolute top-4 left-6 text-5xl text-[#b88c30]/20 font-serif leading-none">"</div>
                  <p className="text-base font-bold text-slate-600 leading-relaxed pl-4 break-keep">
                    {t('절차가 어렵다는 이유만으로 당신의 소중한 돈을 포기하지 마세요. 저희가 그 과정을 쉽고 완벽하게 만들어 드립니다.')}
                  </p>
                  <div className="mt-3 pl-4 flex items-center gap-2">
                    <div className="h-px w-6 bg-[#b88c30]" />
                    <span className="text-xs font-black text-[#b88c30] uppercase tracking-widest">Korea Tax Refund Service</span>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 카드 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { icon: Plane, title: t('고향 방문 왕복 항공권'), desc: t('가족들을 만나러 가는 비행기 표, 이제 부담 없이 예약하세요.'), span: false },
                  { icon: Home, title: t('수개월 치의 월세 및 생활비'), desc: t('고정 지출의 부담을 줄이고 여유 있는 한국 생활을 즐기세요.'), span: false },
                  { icon: Coins, title: t('당신의 미래를 위한 종잣돈'), desc: t('더 큰 꿈을 향한 투자의 시작, 환급금이 든든한 기반이 됩니다.'), span: true },
                ].map(({ icon: Icon, title, desc, span }, i) => (
                  <div
                    key={i}
                    className={`group relative p-7 bg-[#faf6f0] border border-[#b88c30]/15 rounded-2xl hover:border-[#b88c30]/40 hover:bg-[#f5f0e8] hover:-translate-y-1 transition-all duration-200 ${span ? 'sm:col-span-2' : ''}`}
                  >
                    {/* 코너 장식 */}
                    <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#b88c30]/30 rounded-tr-md group-hover:border-[#b88c30]/60 transition-colors" />

                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 bg-[#0b192c] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#152a45] transition-colors">
                        <Icon className="h-5 w-5 text-[#e2b659]" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-[#0b192c]">{title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed break-keep">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 사회적 증거(Social Proof) 리뷰 섹션 */}
        <section className="py-20 bg-slate-50/50 overflow-hidden border-t border-slate-100">
          <div className="container mx-auto px-4 mb-12 text-center">
            <Badge variant="outline" className="mb-4 py-1 px-4 border-[#e2b659] text-slate-800 bg-[#e2b659]/5 rounded-full font-bold">
              {t('함께하는 동료들의 리얼 후기')}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
              {t('이미 많은 외국인 동료들이 권리를 찾았습니다')}
            </h2>
          </div>

          {/* 🌟 숏폼 비디오 실제 환급 인터뷰 하이라이트 (Supabase CDN 초경량 스트리밍) */}
          {COUNTRY_REVIEW_VIDEOS[language] && (
            <div className="container mx-auto px-4 max-w-sm sm:max-w-md mb-12 flex flex-col items-center">
              <div className="w-full bg-[#0b192c] rounded-3xl p-4 sm:p-5 border-2 border-[#e2b659]/50 shadow-2xl overflow-hidden relative flex flex-col items-center">
                {/* 상단 콤팩트 헤더 뱃지 */}
                <div className="w-full flex items-center justify-between pb-3 px-1">
                  <Badge className="bg-[#e2b659] text-slate-950 font-black px-2.5 py-0.5 text-xs shadow-sm">
                    {COUNTRY_REVIEW_VIDEOS[language].flag} {COUNTRY_REVIEW_VIDEOS[language].name} ({COUNTRY_REVIEW_VIDEOS[language].amount})
                  </Badge>
                  <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-amber-400" /> {t('실제 입금 인증 영상')}
                  </span>
                </div>

                {/* 중앙: 9:16 숏폼 비디오 플레이어 (Supabase CDN) */}
                <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#e2b659]/60 bg-black group">
                  <video
                    id="review-video-player"
                    src={COUNTRY_REVIEW_VIDEOS[language].videoUrl}
                    poster={COUNTRY_REVIEW_VIDEOS[language].poster}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 하단: 직관적인 환급 신청 버튼 */}
                <div className="w-full pt-4">
                  <Link href="/estimate" className="block w-full">
                    <Button className="w-full bg-[#e2b659] hover:bg-[#f0c870] text-slate-950 font-black text-base h-12 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                      {t('나의 환급금 1분 만에 조회하기')} <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="relative flex gap-8 py-4">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-8">
                  {[
                    { 
                      name: "Nguyen", country: t("베트남"), flag: "🇻🇳", amount: "3,100,000", image: "/reviews/nguyen.png",
                      text: t("맨 처음에는 한국어를 몰라서 인증앱을 어떻게 깔아야 하나 걱정부터 앞섰어요. 그런데 이지텍스리펀드의 자세한 안내를 하나하나 따라하다 보니 인증에 성공했구요. 결과는 대박! 제가 받을 수 있는 금액이 310만원이나 되더라구요. 신청 후 2달 뒤에 어김없이 국세청에서 입금되었습니다. 여러분 두려워 마세요!") 
                    },
                    { 
                      name: "Chen", country: t("중국"), flag: "🇨🇳", amount: "2,250,000", image: "/reviews/chen.png",
                      text: t("솔직히 처음엔 사기인 줄 알고 의심했어요. 하지만 국세청 공식 데이터를 안전하게 가져온다는 설명을 보고 용기를 냈죠. SMS 인증이 조금 복잡했지만 그림 가이드 덕분에 성공했고, 정확히 8주 뒤에 225만원이 통장으로 들어왔습니다. 정말 믿을 수 있는 서비스예요.") 
                    },
                    { 
                      name: "Hassan", country: t("우즈베키스탄"), flag: "🇺🇿", amount: "1,850,000", image: "/reviews/hassan.png",
                      text: t("이름 대소문자랑 띄어쓰기 때문에 항상 실패했는데, 여기서 알려준 대로 하니까 바로 통과됐어요! 한국어가 서툴러도 그림만 보면 누구나 할 수 있습니다. 185만원이라는 큰 돈이 생겨서 너무 행복합니다. 우즈벡 친구들에게도 다 추천하고 있어요.") 
                    },
                    { 
                      name: "Maria", country: t("필리핀"), flag: "🇵🇭", amount: "2,780,000", image: "/reviews/maria.png",
                      text: t("인증앱 설치가 외국인에겐 제일 큰 장벽인데, 이 앱은 그걸 아주 쉽게 풀어서 알려줍니다. 보안도 확실해서 개인정보 유출 걱정도 없었어요. 한 달 반 만에 278만원 환급받았습니다. 포기하지 마시고 꼭 도전해 보세요!") 
                    },
                    { 
                      name: "Aris", country: t("인도네시아"), flag: "🇮🇩", amount: "1,420,000", image: "/reviews/aris.png",
                      text: t("처음엔 내 정보를 넣는 게 무서웠어요. 하지만 암호화 기술과 무저장 원칙을 보고 신뢰가 생겼습니다. 인증 성공하고 조회해보니 142만원이나 있었네요! 실제로 돈이 입금되는 걸 확인하니 정말 감격스러웠습니다. 이지텍스리펀드 팀 감사합니다.") 
                    },
                    { 
                      name: "Sita", country: t("네팔"), flag: "🇳🇵", amount: "3,000,000", image: "/reviews/sita.png",
                      text: t("네팔 친구들은 세금을 돌려받을 수 있다는 사실조차 몰랐어요. 저도 긴가민가하면서 시작했는데 300만원 행운을 얻었습니다! 인증 과정이 조금 힘들 수 있지만 자세히 설명된 대로만 하면 저 같은 외국인도 충분히 성공할 수 있어요.") 
                    },
                    { 
                      name: "Bat", country: t("몽골"), flag: "🇲🇳", amount: "950,000", image: "/reviews/bat.png",
                      text: t("통신사 인증이 항상 문제였는데, 여기서 알려준 팁 덕분에 드디어 해결했습니다. 소액이라고 생각했는데 95만원이나 들어오니 기분 최고네요! 외국인을 위한 이런 서비스가 있어서 정말 다행입니다. 여러분도 본인의 권리를 찾으세요.") 
                    },
                    { 
                      name: "Somchai", country: t("태국"), flag: "🇹🇭", amount: "2,120,000", image: "/reviews/somchai.png",
                      text: t("신청하고 나서 정말 돈이 들어올까 매일 확인했어요. 정확히 약속한 날짜에 국세청에서 입금 알림이 왔을 때 소리를 질렀습니다! 212만원 환급 성공! 인증앱 때문에 포기하지 마세요. 차근차근 따라하다 보면 행운이 올 거예요.") 
                    },
                    { 
                      name: "Vlad", country: t("러시아"), flag: "🇷🇺", amount: "1,680,000", image: "/reviews/vlad.png",
                      text: t("보안이 제일 중요했는데 이 앱은 보안 보증서까지 있어서 안심하고 사용했습니다. SMS 인증 방법이 상세해서 외국인인 저도 5분 만에 끝냈어요. 168만원 환급금 받고 고향 부모님께 선물 보냈습니다. 정말 감사합니다!") 
                    },
                    { 
                      name: "Kyaw", country: t("미얀마"), flag: "🇲🇲", amount: "1,150,000", image: "/reviews/kyaw.png",
                      text: t("미얀마 친구들이 사기 아니냐고 걱정했는데 제가 먼저 받고 증명했습니다! 115만원 통장에 찍히는 순간 다들 놀랐죠. 인증이 막힌다면 AI 비서에게 물어보세요. 정말 친절하게 알려줍니다. 모두 꼭 해보세요!") 
                    },
                  ].map((review, idx) => (
                    <Card key={idx} className="w-[450px] shrink-0 border-none shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08)] rounded-[2.5rem] bg-white border border-slate-50 transition-all hover:scale-[1.03] active:scale-95 group flex flex-col overflow-hidden">
                      <div className="relative h-[300px] w-full shrink-0">
                        <Image 
                          src={review.image} 
                          alt={review.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner leading-none group-hover:bg-[#b88c30]/5 transition-colors">
                              {review.flag}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-lg tracking-tight">{review.name}</span>
                                <Badge className="bg-[#b88c30]/10 text-[#b88c30] border border-[#b88c30]/20 font-bold text-[9px] h-4 px-2 uppercase tracking-wider">VERIFIED</Badge>
                                {COUNTRY_REVIEW_VIDEOS[language]?.name === review.name && (
                                  <Badge 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const el = document.getElementById('review-video-player') as HTMLVideoElement | null;
                                      if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        el.play().catch(() => {});
                                      }
                                    }}
                                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-[9px] h-4 px-2 cursor-pointer shadow-sm flex items-center gap-1 animate-pulse"
                                  >
                                    <Play className="w-2 h-2 fill-current" /> {t('인터뷰 영상')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t(review.country)}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#b88c30] font-black text-2xl tracking-tighter">+{review.amount}</span>
                              <span className="text-slate-400 font-black text-xs">{t('원')}</span>
                            </div>
                            <p className="text-[9px] text-[#b88c30] font-black uppercase mt-1">Deposited ✓</p>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -top-3 -left-1 text-[#b88c30]/10 text-5xl font-serif">"</div>
                          <p className="text-slate-600 font-bold leading-relaxed text-base pl-4 relative z-10 break-words whitespace-normal line-clamp-4">
                            {t(review.text)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
            {/* 측면 그래디언트 페이드 (고급스러움) */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50/100 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50/100 to-transparent z-10 pointer-events-none" />
          </div>
        </section>

        {/* 디자인 섹션 7: FAQ/AI Assistant & Contact Us Grid */}
        <section className="py-24 bg-[#faf6f0] border-t border-slate-100">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* 1. AI 세무 비서에게 바로 물어보세요 */}
            {isAiVisible ? (
              <div className="bg-[#0b192c] border border-[#e2b659]/25 rounded-[2rem] p-8 md:p-12 relative overflow-hidden mb-16 shadow-xl animate-in fade-in zoom-in duration-500">
                {/* 코너 장식 */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#e2b659]/30 rounded-tl-md" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#e2b659]/30 rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#e2b659]/30 rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#e2b659]/30 rounded-br-md" />
                
                <button 
                  onClick={() => setIsAiVisible(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20"
                  title={t("AI 비서 숨기기")}
                >
                  <Minimize2 className="h-5 w-5" />
                </button>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  {/* 좌측 설명 */}
                  <div className="space-y-4 text-center lg:text-left max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2b659]/10 border border-[#e2b659]/20">
                      <Sparkles className="h-3 w-3 text-[#e2b659]" />
                      <span className="text-[10px] font-black text-[#e2b659] tracking-wider uppercase">AI ASSISTANT</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight break-keep">
                      {t('AI 세무 비서에게 바로 물어보세요')}
                    </h2>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      {t('대리인 동의요건, 지급 일정 등 무엇이든 질문하세요. 24시간 실시간으로 답변해 드립니다.')}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[11px] text-green-400 font-bold tracking-tight">{t('실시간 답변 처리율 99.8%')}</span>
                    </div>
                  </div>

                  {/* 우측 질문 창 */}
                  <div className="w-full lg:w-auto min-w-[300px] md:min-w-[450px]">
                    <form onSubmit={handleAsk} className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl focus-within:border-[#e2b659]/40 transition-all">
                      <input 
                        placeholder={t(`궁금한 사항이나 키워드를 입력해 주세요.`)} 
                        className="bg-transparent text-white placeholder-slate-400 text-sm w-full px-4 outline-none border-none"
                        value={question} 
                        onChange={(e) => setQuestion(e.target.value)} 
                      />
                      <button 
                        type="submit" 
                        className="h-12 w-12 rounded-xl bg-[#e2b659] hover:bg-[#cfa54c] text-[#0b192c] flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </form>
                  </div>
                </div>

                {/* AI 답변 영역 */}
                {aiAnswer && (
                  <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                    <button 
                      onClick={() => { setAiAnswer(null); setQuestion(""); }}
                      className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-[#e2b659]/10 border border-[#e2b659]/30 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-[#e2b659]" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#e2b659] uppercase tracking-widest">AI RESPONSE</span>
                          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded font-black">VERIFIED</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{aiAnswer}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
                <Button 
                  onClick={() => setIsAiVisible(true)}
                  className="rounded-[1.5rem] min-h-[3.5rem] h-auto py-3 px-6 border border-[#e2b659]/30 hover:border-[#e2b659]/60 bg-[#0b192c] hover:bg-[#152a45] text-white font-black shadow-xl group transition-all duration-300 hover:scale-[1.02] active:scale-95 whitespace-normal break-words"
                >
                  <span className="flex items-center justify-center flex-wrap gap-2 text-center leading-tight">
                    <Sparkles className="h-5 w-5 text-[#e2b659] shrink-0" />
                    <span>{t('Korea Tax Refund Service AI 비서 호출하기')}</span>
                  </span>
                </Button>
              </div>
            )}

            {/* 2. 카테고리별 FAQ 그리드 */}
            <div className="space-y-16">
              {faqData.map((section, sectionIdx) => {
                const match = section.category.match(/(\d+)\.\s*([^(]+)\s*(?:\(([^)]+)\))?/);
                const num = match ? match[1].padStart(2, '0') : `0${sectionIdx + 1}`;
                const title = match ? match[2].trim() : section.category;
                const sub = match && match[3] ? match[3].trim() : '';

                return (
                  <div key={sectionIdx} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pb-12 border-b border-[#b88c30]/10 last:border-none">
                    {/* 카테고리명 (좌측) */}
                    <div className="lg:col-span-1 space-y-3 lg:pr-6">
                      <div className="text-3xl font-serif font-black text-[#b88c30]">{num}</div>
                      <h3 className="text-xl lg:text-2xl font-black text-[#0b192c] leading-tight break-keep">{title}</h3>
                      {sub && <p className="text-xs font-black text-[#b88c30]/65 uppercase tracking-widest">{sub}</p>}
                    </div>

                    {/* 아코디언 질문 리스트 (우측) */}
                    <div className="lg:col-span-2">
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {section.items.map((item, itemIdx) => (
                          <AccordionItem 
                            key={itemIdx} 
                            value={`section-${sectionIdx}-item-${itemIdx}`} 
                            className="border border-[#b88c30]/15 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-[#b88c30]/35 transition-all px-6 py-1 overflow-hidden"
                          >
                            <AccordionTrigger className="hover:no-underline font-bold text-base lg:text-lg py-5 text-left text-[#0b192c] group">
                              <div className="flex items-center gap-3 pr-3 break-keep">
                                <HelpCircle className="h-5 w-5 text-[#b88c30]/60 shrink-0 group-hover:text-[#b88c30] transition-colors" />
                                {item.q}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 text-sm pb-8 pl-8 leading-relaxed font-medium border-t border-slate-100 pt-6 break-keep">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. 고객 만족도 배너 및 미니 리뷰 */}
            <div className="mt-24 pt-16 border-t border-[#b88c30]/15 text-center space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2">
                  <div className="h-px w-6 bg-[#b88c30]" />
                  <span className="text-xs font-black text-[#b88c30] tracking-[0.2em] uppercase">{t('실제 고객 후기')}</span>
                  <div className="h-px w-6 bg-[#b88c30]" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-[#0b192c] tracking-tight">{t('4.9점 고객 만족도')}</h3>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl text-[#e2b659]">★</span>
                  ))}
                </div>
              </div>

              {/* 2개 미니 리뷰 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div className="bg-white border border-[#b88c30]/15 rounded-2xl p-7 text-left space-y-4 hover:border-[#b88c30]/35 hover:-translate-y-0.5 transition-all shadow-sm">
                  <div className="flex gap-0.5 text-xs text-[#e2b659]">★★★★★</div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed break-keep">
                    "{t('회사에 통지 안 가고 제 개인 정보도 안전하다는 소식을 듣고 신청했습니다. 대만족입니다.')}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">Nguyen T.H. <span className="text-slate-400 font-medium">• {t('베트남')}</span></span>
                    <span className="font-black text-[#b88c30] bg-[#b88c30]/10 px-2.5 py-1 rounded-full">{t('310만 원 환급')}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#b88c30]/15 rounded-2xl p-7 text-left space-y-4 hover:border-[#b88c30]/35 hover:-translate-y-0.5 transition-all shadow-sm">
                  <div className="flex gap-0.5 text-xs text-[#e2b659]">★★★★★</div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed break-keep">
                    "{t('한국어 번역이 잘 되어 있고 카카오톡 상담사께서 친절하게 설명해주셨습니다. 수수료도 정말 합리적입니다.')}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">Maria S. <span className="text-slate-400 font-medium">• {t('필리핀')}</span></span>
                    <span className="font-black text-[#b88c30] bg-[#b88c30]/10 px-2.5 py-1 rounded-full">{t('278만 원 환급')}</span>
                  </div>
                </div>
              </div>

              {/* 4대 안심 배지 */}
              <div className="inline-flex flex-wrap justify-center items-center gap-x-8 gap-y-4 px-8 py-5 rounded-2xl bg-white border border-[#b88c30]/15 shadow-sm max-w-4xl mx-auto">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-[#b88c30]" />
                  <span className="text-xs font-black text-slate-700">{t('세무사 직접 검토')}</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#b88c30]" />
                  <span className="text-xs font-black text-slate-700">{t('금융권 수준 보안')}</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#b88c30]" />
                  <span className="text-xs font-black text-slate-700">{t('1분 간편 신청')}</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-[#b88c30]" />
                  <span className="text-xs font-black text-slate-700">{t('미환급 시 수수료 0원')}</span>
                </div>
              </div>
            </div>

            {/* 4. 아직 궁금하신 게 있으신가요? (Contact Us Banner) */}
            <div className="mt-24 max-w-4xl mx-auto bg-[#0b192c] border border-[#e2b659]/25 rounded-[2rem] p-8 md:p-12 relative overflow-hidden text-center space-y-6 shadow-2xl">
              {/* 코너 장식 */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#e2b659]/30 rounded-tl-md" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#e2b659]/30 rounded-tr-md" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#e2b659]/30 rounded-bl-md" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#e2b659]/30 rounded-br-md" />

              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl md:text-3xl font-black text-white">{t('아직 궁금하신 게 있으신가요?')}</h3>
                <p className="text-lg font-bold text-[#e2b659]">{t('상담원과 직접 대화하세요')}</p>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {t('전담 세무사와 1:1 카카오톡 / WhatsApp 채널을 통해 언제든 실시간 질문이 가능합니다.')}
                </p>
                {/* Multi-language Support Banner */}
                <div className="bg-[#172a45] border border-[#e2b659]/30 rounded-2xl p-4 max-w-lg mx-auto space-y-1 mt-4">
                  <div className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-[#e2b659]">
                    <span className="animate-pulse">🌐</span>
                    {t('모국어로 편하게 대화하세요 (지원 언어: 베트남어, 중국어, 우즈벡어 등)')}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t('모국어로 질문하시면 실시간 번역되어 답변해 드립니다.')}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-4 flex flex-col gap-3 max-w-md mx-auto">
                {/* 카카오톡 (Hidden during screening)
                <a 
                  href="https://pf.kakao.com/_xxx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-14 rounded-full bg-[#fef01b] hover:bg-[#ebd905] text-[#0b192c] font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2.5"
                >
                  <img src="/Kakao Talk.png" alt="KakaoTalk" className="h-9 w-9 object-contain shrink-0" />
                  {t('카카오톡 실시간 상담')}
                </a>
                */}
                
                {/* 왓츠앱 */}
                <a 
                  href="https://wa.me/821058648577" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-14 rounded-full bg-[#25d366] hover:bg-[#1ebd58] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2.5"
                >
                  <img src="/WhatsApp.png" alt="WhatsApp" className="h-9 w-9 object-contain shrink-0" />
                  {t('왓츠앱 실시간 상담')}
                </a>

                {/* 텔레그램 */}
                <a 
                  href="https://t.me/ktrs_support_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-14 rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2.5"
                >
                  <img src="/Telegram.png" alt="Telegram" className="h-9 w-9 object-contain shrink-0" />
                  {t('텔레그램 실시간 상담')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 animate-fade-in-up delay-300">
        <Button size="lg" asChild className="w-full text-lg min-h-[4rem] h-auto bg-[#0b192c] hover:bg-[#152a45] text-white border border-[#e2b659] shadow-2xl rounded-2xl font-black py-4 px-6 whitespace-normal break-words">
          <Link href="/estimate" className="flex items-center justify-center flex-wrap gap-3 text-center leading-tight w-full text-white">
            <span className="flex-1 min-w-[150px] font-black text-white flex flex-wrap items-center justify-center gap-1">
              <span className="font-black text-sm xs:text-base leading-tight">
                {language === 'ko' ? (
                  <>
                    <span className="text-[#e2b659] mr-1.5">국세청 안전 연동으로</span>
                    <span className="text-white">내 숨은 환급금 무료 조회하기</span>
                  </>
                ) : (
                  <span className="text-white">
                    {t('국세청 안전 연동으로 내 숨은 환급금 무료 조회하기')}
                  </span>
                )}
              </span>
            </span> <ArrowRight className="h-5 w-5 shrink-0 text-white" />
          </Link>
        </Button>
        {/* 초소형 안심 띠지 (버튼 위치에 영향 주지 않도록 하단 절대 좌표 배치) */}
        <div className="absolute top-[108%] left-1/2 -translate-x-1/2 text-[9.5px] font-black text-slate-500 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-md leading-none flex items-center gap-1 whitespace-nowrap z-50">
          {BANNER_TRUST_TEXTS[language] || BANNER_TRUST_TEXTS['en']}
        </div>
      </div>
    </div>
  );
}
