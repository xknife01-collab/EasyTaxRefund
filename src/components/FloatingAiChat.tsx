"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Local translation dictionary for the consultation widget
const TRANSLATIONS: Record<string, Record<string, string>> = {
  ko: {
    "Official Manager": "공식 매니저",
    "김준현 공식 매니저": "김준현 공식 매니저",
    "김준현 공식 매니저 상담": "김준현 공식 매니저 상담",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.",
    "카카오톡 실시간 상담": "카카오톡 실시간 상담",
    "왓츠앱 실시간 상담": "왓츠앱 실시간 상담",
    "텔레그램 실시간 상담": "텔레그램 실시간 상담",
    "내 휴대폰에 앱 설치하기": "내 휴대폰에 앱 설치하기",
    "숨기기": "숨기기",
    "in_app_browser_copy_done": "링크 복사 완료",
    "in_app_browser_copy_desc": "외부 브라우저(크롬, 사파리 등)에 붙여넣어 설치를 진행해주세요.",
    "app_install_guide_title": "앱 설치 안내",
    "app_install_guide_desc": "안드로이드는 크롬 메뉴에서, 아이폰은 공유 버튼을 누르고 '홈 화면에 추가'를 선택해주세요."
  },
  en: {
    "Official Manager": "Official Manager",
    "김준현 공식 매니저": "Manager Kim Jun-hyun",
    "김준현 공식 매니저 상담": "Chat with Manager Kim",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "We help foreign workers in SMEs get their income tax refund.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "We query your hidden tax refund in 0.1 seconds and assist you in safely receiving up to 90% income tax reduction for foreign employees at Korean SMEs.",
    "카카오톡 실시간 상담": "KakaoTalk Live Chat",
    "왓츠앱 실시간 상담": "WhatsApp Live Chat",
    "텔레그램 실시간 상담": "Telegram Live Chat",
    "내 휴대폰에 앱 설치하기": "Install App on Phone",
    "숨기기": "Hide",
    "in_app_browser_copy_done": "Link Copied",
    "in_app_browser_copy_desc": "Please paste it into an external browser (Chrome, Safari, etc.) to install the app.",
    "app_install_guide_title": "App Installation",
    "app_install_guide_desc": "For Android, select install in Chrome menu. For iPhone, tap the Share button and select 'Add to Home Screen'."
  },
  vi: {
    "Official Manager": "Quản lý chính thức",
    "김준현 공식 매니저": "Quản lý Kim Jun-hyun",
    "김준현 공식 매니저 상담": "Tư vấn với Quản lý Kim",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "Hỗ trợ hoàn thuế thu nhập cho lao động nước ngoài tại doanh nghiệp vừa và nhỏ.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "Chúng tôi giúp kiểm tra khoản thuế hoàn lại bị ẩn trong 0.1 giây và hỗ trợ nhận mức giảm thuế thu nhập tới 90% cho lao động nước ngoài tại các doanh nghiệp vừa và nhỏ Hàn Quốc.",
    "카카오톡 실시간 상담": "Tư vấn qua KakaoTalk",
    "왓츠앱 실시간 상담": "Tư vấn qua WhatsApp",
    "텔레그램 실시간 상담": "Tư vấn qua Telegram",
    "내 휴대폰에 앱 설치하기": "Cài đặt ứng dụng trên điện thoại",
    "숨기기": "Ẩn",
    "in_app_browser_copy_done": "Đã sao chép liên kết",
    "in_app_browser_copy_desc": "Vui lòng dán liên kết vào trình duyệt ngoài (Chrome, Safari) để cài đặt ứng dụng.",
    "app_install_guide_title": "Hướng dẫn cài đặt ứng dụng",
    "app_install_guide_desc": "Android: Chọn cài đặt trong menu Chrome. iPhone: Nhấp vào nút Chia sẻ và chọn 'Thêm vào màn hình chính'."
  },
  zh: {
    "Official Manager": "官方经理",
    "김준현 공식 매니저": "经理 金俊贤",
    "김준현 공식 매니저 상담": "与金经理实时咨询",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "我们帮助中小企业的外国员工办理所得税退税。",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "我们可在0.1秒内查询您未领取的退税，并协助您安全地获得韩国中小企业外国员工高达90%的所得税减免优惠。",
    "카카오톡 실시간 상담": "KakaoTalk 实时咨询",
    "왓츠앱 실시간 상담": "WhatsApp 实时咨询",
    "텔레그램 실시간 상담": "Telegram 实时咨询",
    "내 휴대폰에 앱 설치하기": "在我的手机上安装应用",
    "숨기기": "隐藏",
    "in_app_browser_copy_done": "链接复制成功",
    "in_app_browser_copy_desc": "请粘贴到外部浏览器（Chrome、Safari 等）进行安装。",
    "app_install_guide_title": "应用安装指南",
    "app_install_guide_desc": "安卓请在 Chrome 菜单中选择安装，苹果请点击分享按钮并选择“添加到主屏幕”。"
  },
  id: {
    "Official Manager": "Manajer Resmi",
    "김준현 공식 매니저": "Manajer Kim Jun-hyun",
    "김준현 공식 매니저 상담": "Konsultasi dengan Manajer Kim",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "Kami membantu pekerja asing di UKM mendapatkan pengembalian pajak.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "Kami mendeteksi pengembalian pajak tersembunyi Anda dalam 0.1 detik dan membantu Anda mendapatkan pengurangan pajak penghasilan hingga 90% untuk karyawan asing di UKM Korea dengan aman.",
    "카카오톡 실시간 상담": "Konsultasi KakaoTalk",
    "왓츠앱 실시간 상담": "Konsultasi WhatsApp",
    "텔레그램 실시간 상담": "Konsultasi Telegram",
    "내 휴대폰에 앱 설치하기": "Instal Aplikasi di Ponsel Saya",
    "숨기기": "Sembunyikan",
    "in_app_browser_copy_done": "Tautan Disalin",
    "in_app_browser_copy_desc": "Silakan tempel di browser eksternal (Chrome, Safari, dll.) untuk menginstal.",
    "app_install_guide_title": "Panduan Instalasi Aplikasi",
    "app_install_guide_desc": "Untuk Android, pilih instal di menu Chrome. Untuk iPhone, ketuk tombol Bagikan dan pilih 'Tambahkan ke Layar Utama'."
  },
  uz: {
    "Official Manager": "Rasmiy menejer",
    "김준현 공식 매니저": "Menejer Kim Jun-hyun",
    "김준현 공식 매니저 상담": "Menejer Kim bilan bog'lanish",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "Kichik va o'rta korxonalardagi chet elliklarga soliq qaytarishda yordam beramiz.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "Koreya kichik va o'rta korxonalaridagi chet ellik ishchilar uchun yashirin soliq qaytarish summasini 0.1 soniyada tekshiring va 90% gacha daromad solig'i imtiyozini xavfsiz oling.",
    "카카오톡 실시간 상담": "KakaoTalk jonli maslahat",
    "왓츠앱 실시간 상담": "WhatsApp jonli maslahat",
    "텔레그램 실시간 상담": "Telegram jonli maslahat",
    "내 휴대폰에 앱 설치하기": "Telefonimga ilovani o'rnatish",
    "숨기기": "Yashirish",
    "in_app_browser_copy_done": "Havola nusxalandi",
    "in_app_browser_copy_desc": "Ilovani o'rnatish uchun tashqi brauzerga (Chrome, Safari) joylashtiring.",
    "app_install_guide_title": "Ilovani o'rnatish yo'riqnomasi",
    "app_install_guide_desc": "Android uchun Chrome menyusidan o'rnatishni tanlang. iPhone uchun Ulashish tugmasini bosing va 'Bosh ekranga qo'shish'ni tanlang."
  },
  ne: {
    "Official Manager": "आधिकारिक प्रबन्धक",
    "김준현 공식 매니저": "प्रबन्धक किम जुन-ह्युन",
    "김준현 공식 매니저 상담": "प्रबन्धक किमसँग परामर्श",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "हामी साना तथा मझौला उद्योगका विदेशी कामदारहरूलाई आयकर फिर्ता पाउन मद्दत गर्छौं।",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "हामी कोरियाली साना तथा मझौला उद्योग (SME) का विदेशी कर्मचारीहरूको लुकेको कर फिर्ता ०.१ सेकेन्डमै जाँच गर्छौं र ९०% सम्मको आयकर छुट सुरक्षित रूपมา प्राप्त गर्न मद्दत गर्छौं।",
    "카카오톡 실시간 상담": "KakaoTalk परामर्श",
    "왓츠앱 실시간 상담": "WhatsApp परामर्श",
    "텔레그램 실시간 상담": "Telegram परामर्श",
    "내 휴대폰에 앱 설치하기": "मेრო फोनमा एप स्थापना गर्नुहोस्",
    "숨기기": "लुकाउनुहोस्",
    "in_app_browser_copy_done": "लिङ्क प्रतिलिपि गरियो",
    "in_app_browser_copy_desc": "एप स्थापना गर्न कृपया बाह्य ब्राउजर (Chrome, Safari) मा टाँस्नुहोस्।",
    "app_install_guide_title": "एप स्थापना निर्देशिका",
    "app_install_guide_desc": "एन्ड्रोइडको लागि Chrome मेनुमा स्थापना चयन गर्नुहोस्। आईफोनको लागि साझा बटन थिच्नुहोस् र 'गृह स्क्रिनमा थပ်नुहोस्' चयन गर्नुहोस्।"
  },
  th: {
    "Official Manager": "ผู้จัดการอย่างเป็นทางการ",
    "김준현 공식 매니저": "ผู้จัดการ คิม จุนฮยอน",
    "김준현 공식 매니저 상담": "ปรึกษากับผู้จัดการคิม",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "เราช่วยแรงงานต่างชาติในธุรกิจ SME ขอคืนภาษีเงินได้",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "เราตรวจสอบเงินคืนภาษีที่ซ่อนอยู่ของคุณใน 0.1 วินาที และช่วยเหลือคุณในการลดหย่อนภาษีเงินได้สูงสุด 90% สำหรับพนักงานต่างชาติ in ธุรกิจ SME ของเกาหลีอย่างปลอดภัย",
    "카카오톡 실시간 상담": "ปรึกษาผ่าน KakaoTalk",
    "왓츠앱 실시간 상담": "ปรึกษาผ่าน WhatsApp",
    "텔레그램 실시간 상담": "ปรึกษาผ่าน Telegram",
    "내 휴대폰에 앱 설치하기": "ติดตั้งแอปบนมือถือของฉัน",
    "숨기기": "ซ่อน",
    "in_app_browser_copy_done": "คัดลอกลิงก์แล้ว",
    "in_app_browser_copy_desc": "กรุณาวางในเบราว์เซอร์ภายนอก (Chrome, Safari) เพื่อติดตั้งแอป",
    "app_install_guide_title": "คำแนะนำการติดตั้งแอป",
    "app_install_guide_desc": "สำหรับ Android เลือกติดตั้งในเมนู Chrome สำหรับ iPhone แตะปุ่มแชร์และเลือก 'เพิ่มในหน้าจอหลัก'"
  },
  km: {
    "Official Manager": "អ្នកគ្រប់គ្រងផ្លូវការ",
    "김준현 공식 매니저": "អ្នកគ្រប់គ្រង គីម ជុនហ្យុន",
    "김준현 공식 매니저 상담": "ពិភាក្សាជាមួយអ្នកគ្រប់គ្រង គីម",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "យើងជួយពលករលបរទេសនៅសហគ្រាសធុនតូចនិងមធ្យមទទួលបានការបង្វិលពន្ធវិញ។",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "យើងជួយស្វែងរកប្រាក់បង្វិលពន្ធដែលលាក់ទុករបស់អ្នកក្នុងរយៈពេល 0.1 វិនាទី និងជួយសម្រួលដល់การទទួលបានការកាត់បន្ថយពន្ធរហូតដល់ 90% សម្រាប់ពលករលបរទេសនៅសហគ្រាសធុនតូចនិងមធ្យមកូរ៉េ។",
    "카카오톡 실시간 상담": "ពិភាក្សាតាម KakaoTalk",
    "왓츠앱 실시간 상담": "ពិភាក្សាតាម WhatsApp",
    "텔레그램 실시간 상담": "ពិភាក្សាតាម Telegram",
    "내 휴대폰에 앱 설치하기": "ដំឡើងកម្មវិធីលើទូរស័ព្ទខ្ញុំ",
    "숨기기": "លាក់",
    "in_app_browser_copy_done": "បានចម្លងតំណ",
    "in_app_browser_copy_desc": "សូមបិទភ្ជាប់ក្នុងកម្មវិធីរុករកខាងក្រៅ (Chrome, Safari) ដើម្បីដំឡើង។",
    "app_install_guide_title": "ការណែនាំដំឡើងកម្មវិធី",
    "app_install_guide_desc": "សម្រាប់ Android ជ្រើសរើសដំឡើងក្នុងម៉ឺនុយ Chrome។ សម្រាប់ iPhone ចុចប៊ូតុងចែករំលែក ហើយជ្រើសរើស 'បន្ថែមទៅអេក្រង់ដើម'។"
  },
  my: {
    "Official Manager": "တရားဝင်မန်နေဂျာ",
    "김준현 공식 매니저": "မန်နေဂျာ Kim Jun-hyun",
    "김준현 공식 매니저 상담": "မန်နေဂျာ Kim နှင့်ဆွေးနွေးရန်",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "SME ရှိ နိုင်ငံခြားသားအလုပ်သမားများ ဝင်ငွေခွန်ပြန်အမ်းငွေရရှိရန် ကူညီပေးပါသည်။",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "ကိုရီးယား SME များရှိ နိုင်ငံခြားသားဝန်ထမ်းများအတွက် ၀.၁ စက္ကန့်အတွင်း ဝှက်ထားသော အခွန်ပြန်အမ်းငွေကို ရှာဖွေပြီး ၉၀% အထိ ဝင်ငွေခွန်လျှော့ပေါ့ခွင့်ကို ဘေးကင်းစွာ ရရှိစေရန် ကူညီပေးပါမည်။",
    "카카오톡 실시간 상담": "KakaoTalk ဖြင့်ဆွေးနွေးရန်",
    "왓츠앱 실시간 상담": "WhatsApp ဖြင့်ဆွေးနွေးရန်",
    "텔레그램 실시간 상담": "Telegram ဖြင့်ဆွေးနွေးရန်",
    "내 휴대폰에 앱 설치하기": "ဖုန်းတွင် App ထည့်သွင်းရန်",
    "숨기기": "ဖျောက်ရန်",
    "in_app_browser_copy_done": "လင့်ခ်ကူးယူပြီး",
    "in_app_browser_copy_desc": "အက်ပ်ကို ထည့်သွင်းရန် ပြင်ပဘရောက်ဆာ (Chrome, Safari) တွင် ကူးထည့်ပါ။",
    "app_install_guide_title": "အက်ပ်ထည့်သွင်းမှု လမ်းညွှန်",
    "app_install_guide_desc": "Android အတွက် Chrome မီနူးတွင် ထည့်သွင်းရန်ကို ရွေးချယ်ပါ။ iPhone အတွက် မျှဝေရန်ခလုတ်ကို နှိပ်ပြီး 'ပင်မစခရင်သို့ ပေါင်းထည့်ရန်' ကို ရွေးချယ်ပါ။"
  }
};

export function FloatingAiChat() {
  const pathname = usePathname();

  // Hide on estimate pages
  if (pathname?.startsWith("/estimate")) return null;

  return <FloatingConsultingPanelInner />;
}

function FloatingConsultingPanelInner() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  // Helper function to translate keys using local dictionary with English fallback
  const translate = (key: string) => {
    const lang = language || "ko";
    const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"] || TRANSLATIONS["ko"];
    return dict[key] || key;
  };

  // PWA & In-App Browser Detect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isInApp = /FBAN|FBAV|Instagram|KAKAOTALK|Line|Twitter/i.test(ua);
      if (isInApp) {
        setIsInAppBrowser(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallApp = () => {
    if (isInAppBrowser) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("lang", language);
      const targetUrl = currentUrl.toString();

      if (navigator.userAgent.match(/Android/i)) {
        window.location.href = `intent://${targetUrl.replace(/^https?:\/\//i, "")}#Intent;scheme=https;package=com.android.chrome;end`;
      } else {
        navigator.clipboard.writeText(targetUrl);
        toast({
          title: translate("in_app_browser_copy_done"),
          description: translate("in_app_browser_copy_desc")
        });
      }
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    } else {
      toast({
        title: translate("app_install_guide_title"),
        description: translate("app_install_guide_desc")
      });
    }
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-[200] flex flex-col items-end gap-3 print:hidden">
      {/* 1. collapsed state: capsule button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-[#0f1e36] hover:bg-[#152a45] text-white rounded-full p-2.5 pl-3.5 pr-6 border border-[#b88c30]/50 shadow-[0_10px_30px_rgba(15,30,54,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 group z-[200] max-w-[280px]"
        >
          {/* Avatar Area */}
          <div className="relative shrink-0">
            {/* Double Ring Border Effect */}
            <div className="absolute -inset-0.5 rounded-full border border-[#b88c30]/60 animate-pulse" />
            <div className="absolute -inset-1 rounded-full border border-[#b88c30]/20" />
            <div className="h-10 w-10 rounded-full overflow-hidden border border-[#b88c30] relative bg-slate-800">
              <img
                src="/images/manager.png"
                alt="Manager Profile"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Active Status Dot */}
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#0f1e36]" />
          </div>

          {/* Text Area */}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[#b88c30] text-[9px] font-black uppercase tracking-[0.15em] font-headline">
              {translate("Official Manager")}
            </span>
            <span className="text-white font-black text-[13px] tracking-tight whitespace-nowrap mt-0.5">
              {translate("김준현 공식 매니저 상담")}
            </span>
          </div>
        </button>
      )}

      {/* 2. expanded state: pop-up dialog */}
      {isOpen && (
        <div className="w-[350px] bg-[#0f1e36] rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,30,54,0.5)] border border-[#b88c30]/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 z-[200]">
          
          {/* Header */}
          <div className="px-6 pt-5 pb-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-black uppercase tracking-wider">
                Online · Active Now
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Hide (숨기기) button */}
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-[10px] font-black transition-colors"
              >
                {translate("숨기기")}
              </button>
              {/* Close (X) button */}
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Profile headshot section */}
          <div className="flex flex-col items-center pt-1 pb-4 px-6 text-center">
            {/* Double Ring Avatar */}
            <div className="relative mb-3.5">
              <div className="absolute -inset-1 rounded-full border-2 border-[#b88c30]/20" />
              <div className="absolute -inset-2 rounded-full border border-[#b88c30]/10" />
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#b88c30] relative bg-slate-800 shadow-xl">
                <img
                  src="/images/manager.png"
                  alt="Manager Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-[#0f1e36] animate-pulse" />
            </div>

            {/* Official Manager badge */}
            <span className="inline-flex items-center justify-center bg-[#b88c30]/10 border border-[#b88c30]/30 text-[#b88c30] text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
              {translate("Official Manager")}
            </span>

            {/* Manager Name */}
            <h3 className="text-white font-black text-xl tracking-tight">
              {translate("김준현 공식 매니저")}
            </h3>
            
            {/* Hotline number */}
            <p className="text-slate-400 font-bold text-xs mt-1">
              Official Center (010) 325-9953
            </p>
          </div>

          {/* Core Info Display Box */}
          <div className="px-6 pb-4">
            <div className="bg-[#081220] border border-white/5 rounded-3xl p-4.5 text-center space-y-2.5 shadow-inner">
              <p className="text-[#e2b659] font-black text-sm tracking-tight break-keep leading-snug">
                {translate(`"외국인 중소 기업 청년 소득세 환급을 도와 드립니다."`)}
              </p>
              <p className="text-slate-400 font-bold text-[11px] leading-relaxed break-keep">
                {translate(`대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.`)}
              </p>
            </div>
          </div>

          {/* Social Consulting Links */}
          <div className="px-6 pb-6 flex flex-col gap-2.5">
            {/* KakaoTalk */}
            <a
              href="https://pf.kakao.com/_xxx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#FEE500]/95 text-[#0f1e36] font-black rounded-2xl py-3.5 px-4 shadow-[0_4px_12px_rgba(254,229,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <span className="text-base leading-none">💬</span>
              <span>{translate("카카오톡 실시간 상담")}</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/82103259953"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#25D366]/95 text-white font-black rounded-2xl py-3.5 px-4 shadow-[0_4px_12px_rgba(37,211,102,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <span className="text-base leading-none">🟢</span>
              <span>{translate("왓츠앱 실시간 상담")}</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/easytaxrefund"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#0088cc] hover:bg-[#0088cc]/95 text-white font-black rounded-2xl py-3.5 px-4 shadow-[0_4px_12px_rgba(0,136,204,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <span className="text-base leading-none">✈️</span>
              <span>{translate("텔레그램 실시간 상담")}</span>
            </a>

            {/* App Install */}
            <button
              onClick={handleInstallApp}
              className="flex items-center justify-center gap-2.5 bg-[#FF4E00] hover:bg-[#FF4E00]/95 text-white font-black rounded-2xl py-3.5 px-4 shadow-[0_4px_12px_rgba(255,78,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <span className="text-base leading-none">📱</span>
              <span>{translate("내 휴대폰에 앱 설치하기")}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
