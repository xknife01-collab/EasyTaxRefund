"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronRight, ArrowLeft, Send, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
const translate = (s: string) => s;
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getGuideStepKnowledge } from "@/lib/guide-knowledge-db";

// Local translation dictionary for the consultation widget
const TRANSLATIONS: Record<string, Record<string, string>> = {
  ko: {
    "Official Manager": "공식 매니저",
    "김준현 공식 매니저": "김준현 공식 매니저",
    "김준현 공식 매니저 상담": "김준현 공식 매니저 상담",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.",
    "지금 실시간으로 매니저에게 문의하기": "지금 실시간으로 매니저에게 문의하기",
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
    "지금 실시간으로 매니저에게 문의하기": "Chat Live with Manager Now",
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
    "지금 실시간으로 매니저에게 문의하기": "Hỏi đáp trực tiếp với Quản lý ngay",
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
    "지금 실시간으로 매니저에게 문의하기": "立即与经理在线实时咨询",
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
    "지금 실시간으로 매니저에게 문의하기": "Tanya Manajer Langsung Sekarang",
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
    "지금 실시간으로 매니저에게 문의하기": "Menejer bilan hoziroq bog'lanish",
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
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "हामी कोरियाली साना तथा मझौला उद्योग (SME) का विदेशी कर्मचारीहरूको लुकेको कर फिर्ता ०.१ सेकेन्डमै जाँच गर्छौं र ९०% सम्मको आयकर छुट सुरक्षित रूपमा प्राप्त गर्न मद्दत गर्छौं।",
    "지금 실시간으로 매니저에게 문의하기": "अहिले नै प्रबन्धकसँग प्रत्यक्ष कुराकानी गर्नुहोस्",
    "카카오톡 실시간 상담": "KakaoTalk परामर्श",
    "왓츠앱 실시간 상담": "WhatsApp परामर्श",
    "텔레그램 실시간 상담": "Telegram परामर्श",
    "내 휴대폰에 앱 설치하기": "메रो फोनमा एप स्थापना गर्नुहोस्",
    "숨기기": "लुकाउनुहोस्",
    "in_app_browser_copy_done": "लिङ्क प्रतिलिपि गरियो",
    "in_app_browser_copy_desc": "एप स्थापना गर्न कृपया बाह्य ब्राउजर (Chrome, Safari) मा टाँस्नुहोस्।",
    "app_install_guide_title": "एप स्थापना निर्देशिका",
    "app_install_guide_desc": "एन्ड्रोइडको लागि Chrome मेनुमा स्थापना चयन गर्नुहोस्। आईफोनको लागि साझा बटन थिच्नुहोस् र 'गृह स्क्रينमा थप्नुहोस्' चयन गर्नुहोस्।"
  },
  th: {
    "Official Manager": "ผู้จัดการอย่างเป็นทางการ",
    "김준현 공식 매니저": "ผู้จัดการ คิม จุนฮยอน",
    "김준현 공식 매니저 상담": "ปรึกษากับผู้จัดการคิม",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "เราช่วยแรงงานต่างชาติในธุรกิจ SME ขอคืนภาษีเงินได้",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "เราตรวจสอบเงินคืนภาษีที่ซ่อนอยู่ของคุณใน 0.1 วินาที และช่วยเหลือคุณในการลดหย่อนภาษีเงินได้สูงสุด 90% สำหรับพนักงานต่างชาติ in ธุรกิจ SME ของเกาหลีอย่างปลอดภัย",
    "지금 실시간으로 매니저에게 문의하기": "สอบถามผู้จัดการแบบเรียลไทม์ตอนนี้",
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
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "យើងជួយស្វែងរកប្រាក់បង្វិលពន្ធដែលលាក់ទុករបស់អ្នកក្នុងរយៈពេល 0.1 វិនាទី និងជួយសម្រួលដល់การទទួលបានการកាត់បន្ថយពន្ធរហូតដល់ 90% សម្រាប់ពលករលបរទេសនៅសហគ្រាសធុនតូចនិងមធ្យមកូរ៉េ។",
    "지금 실시간으로 매니저에게 문의하기": "សួរអ្នកគ្រប់គ្រងផ្ទាល់ឥឡូវនេះ",
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
    "지금 실시간으로 매니저에게 문의하기": "မန်နေဂျာနှင့် တိုက်ရိုက်မေးမြန်းရန်",
    "카카오톡 실시간 상담": "KakaoTalk ဖြင့်ဆွေးနွေးရန်",
    "왓츠앱 실시간 상담": "WhatsApp ဖြင့်ဆွေးနွေးရန်",
    "텔레그램 실시간 상담": "Telegram ဖြင့်ဆွေးနွေးရန်",
    "내 휴대폰에 앱 설치하기": "ဖုန်းတွင် App ထည့်သွင်းရန်",
    "숨기기": "ဖျောက်ရန်",
    "in_app_browser_copy_done": "လင့်ခ်ကူးယူပြီး",
    "in_app_browser_copy_desc": "အက်ပ်ကို ထည့်သွင်းရန် ပြင်ပဘရောက်ဆာ (Chrome, Safari) တွင် ကူးထည့်ပါ။",
    "app_install_guide_title": "အက်ပ်ထည့်သွင်းမှု လမ်းညွှန်",
    "app_install_guide_desc": "Android အတွက် Chrome မီနူးတွင် ထည့်သွင်းရန်ကို ရွေးချယ်ပါ။ iPhone အတွက် မျှဝေရန်ခလုတ်ကို နှိပ်ပြီး 'ပင်မစခရင်သို့ ပေါင်းထည့်ရန်' ကို ရွေးချယ်ပါ။"
  },
  si: {
    "Official Manager": "නිල කළමනාකරු",
    "김준현 공식 매니저": "කළමනාකරු කිම් ජුන්-හ්යුන්",
    "김준현 공식 매니저 상담": "කළමනාකරු කිම් සමඟ උපදෙස් ලබා ගන්න",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "කුඩා හා මධ්‍යම පරිමාණ ව්‍යවසායන්හි විදේශීය සේවකයින්ට ආදායම් බදු ආපසු ලබා ගැනීමට අපි උපකාර කරමු.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "විදේශීය සේවකයින් සඳහා සැඟවුණු බදු ආපසු ගෙවීම් තත්පර 0.1 කින් පරීක්ෂා කර 90% දක්වා ආදායම් බදු සහන ආරක්ෂිතව ලබා ගැනීමට උපකාරී වේ.",
    "지금 실시간으로 매니저에게 문의하기": "දැන්ම කළමනාකරුගෙන් විමසන්න",
    "카카오톡 실시간 상담": "KakaoTalk සජීවී කතාබහ",
    "왓츠앱 실시간 상담": "WhatsApp සජීවී කතාබහ",
    "텔레그램 실시간 상담": "Telegram සජීවී කතාබහ",
    "내 휴대폰에 앱 설치하기": "දුරකථනයට යෙදුම ස්ථාපනය කරන්න",
    "숨기기": "සඟවන්න",
    "in_app_browser_copy_done": "ලිංකය පිටපත් කරන ලදී",
    "in_app_browser_copy_desc": "ස්ථාපනය කිරීමට කරුණාකර බාහිර බ්‍රවුසරයකට අලවන්න.",
    "app_install_guide_title": "යෙදුම් ස්ථාපන මාර්ගෝපදේශය",
    "app_install_guide_desc": "Android සඳහා Chrome මෙනුවෙන් ස්ථාපනය තෝරන්න."
  },
  mn: {
    "Official Manager": "Албан ёсны менежер",
    "김준현 공식 매니저": "Менежер Ким Жүн-хён",
    "김준현 공식 매니저 상담": "Менежер Кимтэй зөвлөлдөх",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "ЖДҮ-ийн гадаад ажилчдад орлогын татварын буцаан олголт авахад тусална.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "Бид Солонгосын ЖДҮ-ийн гадаад ажилчдын нуугдмал татварын буцаан олголтыг 0.1 секундэд шалгаж, 90% хүртэлх орлогын татварын хөнгөлөлтийг аюулгүй авахад тусална.",
    "지금 실시간으로 매니저에게 문의하기": "Менежертэй одоо шууд чатлах",
    "카카오톡 실시간 상담": "KakaoTalk зөвлөгөө",
    "왓츠앱 실시간 상담": "WhatsApp зөвлөгөө",
    "텔레그램 실시간 상담": "Telegram зөвлөгөө",
    "내 휴대폰에 앱 설치하기": "Утаснадаа апп суулгах",
    "숨기기": "Нуух",
    "in_app_browser_copy_done": "Холбоос хуулагдлаа",
    "in_app_browser_copy_desc": "Суулгахын тулд гадаад хөтөч дээр буулгана уу.",
    "app_install_guide_title": "Апп суулгах заавар",
    "app_install_guide_desc": "Android-д Chrome цэснээ스 сонгоно уу."
  },
  bn: {
    "Official Manager": "অফিসিয়াল ম্যানেজার",
    "김준현 공식 매니저": "ম্যানেজার কিম জুন-হিউন",
    "김준현 공식 매니저 상담": "ম্যানেজার কিমের সাথে পরামর্শ করুন",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "আমরা এসএমই-এর বিদেশী কর্মীদের আয়কর ফেরত পেতে সাহায্য করি।",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "আমরা ০.১ সেকেন্ডে আপনার গোপন কর ফেরত পরীক্ষা করি এবং ৯০% পর্যন্ত আয়কর ছাড় নিরাপদে পেতে সাহায্য করি।",
    "지금 실시간으로 매니저에게 문의하기": "এখনই ম্যানেজারের সাথে সরাসরি চ্যাট করুন",
    "카카오톡 실시간 상담": "KakaoTalk লাইভ চ্যাট",
    "왓츠앱 실시간 상담": "WhatsApp লাইভ চ্যাট",
    "텔레그램 실시간 상담": "Telegram লাইভ চ্যাট",
    "내 휴대폰에 앱 설치하기": "ফোনে অ্যাপ ইনস্টল করুন",
    "숨기기": "লুকান",
    "in_app_browser_copy_done": "লিঙ্ক অনুলিপি করা হয়েছে",
    "in_app_browser_copy_desc": "ইনস্টল করতে বাহ্যিক ব্রাউজারে পেস্ট করুন।",
    "app_install_guide_title": "অ্যাপ ইনস্টলেশন গাইড",
    "app_install_guide_desc": "Android এর জন্য Chrome মেনু থেকে নির্বাচন করুন।"
  },
  kk: {
    "Official Manager": "Ресми менеджер",
    "김준현 공식 매니저": "Менеджер Ким Джун Хен",
    "김준현 공식 매니저 상담": "Менеджер Киммен кеңесу",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "ШОБ-тағы шетелдік жұмысшыларға табыс салығын қайтаруға көмектесеміз.",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "Шетелдік жұмысшылардың жасырын салық қайтарымын 0.1 секундта тексеріп, 90%-ға дейін табыс салығы жеңілдігін қауіпсіз алуға көмектесеміз.",
    "지금 실시간으로 매니저에게 문의하기": "Менеджермен қазір онлайн сөйлесу",
    "카카오톡 실시간 상담": "KakaoTalk онлайн кеңес",
    "왓츠앱 실시간 상담": "WhatsApp онлайн кеңес",
    "텔레그램 실시간 상담": "Telegram онлайн кеңес",
    "내 휴대폰에 앱 설치하기": "Телефонға қолданбаны орнату",
    "숨기기": "Жасыру",
    "in_app_browser_copy_done": "Сілтеме көшірілді",
    "in_app_browser_copy_desc": "Орнату үшін сыртқы браузерге қойыңыз.",
    "app_install_guide_title": "Қолданбаны орнату нұсқаулығы",
    "app_install_guide_desc": "Android үшін Chrome мәзірінен орнатуды таңдаңыз."
  },
  ur: {
    "Official Manager": "آفیشل مینیجر",
    "김준현 공식 매니저": "مینیجر کم جون ہیون",
    "김준현 공식 매니저 상담": "مینیجر کم کے ساتھ مشورہ کریں",
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": "ہم چھوٹے اور درمیانے درجے کے اداروں کے غیر ملکی کارکنوں کو انکم ٹیکس ریفنڈ حاصل کرنے میں مدد کرتے ہیں۔",
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": "ہم 0.1 سیکنڈ میں آپ کا چھپا ہوا ٹیکس ریفنڈ تلاش کرتے ہیں اور 90% تک انکم ٹیکس میں چھوٹ حاصل کرنے میں مدد کرتے ہیں۔",
    "지금 실시간으로 매니저에게 문의하기": "ابھی مینیجر سے لائیو بات کریں",
    "카카오톡 실시간 상담": "KakaoTalk لائیو چیٹ",
    "왓츠앱 실시간 상담": "WhatsApp لائیو چیٹ",
    "텔레그램 실시간 상담": "Telegram لائیو چیٹ",
    "내 휴대폰에 앱 설치하기": "فون میں ایپ انسٹال کریں",
    "숨기기": "چھپائیں",
    "in_app_browser_copy_done": "لنک کاپی ہو گیا",
    "in_app_browser_copy_desc": "انسٹال کرنے کے لیے اسے بیرونی برائوزر میں پیسٹ کریں۔",
    "app_install_guide_title": "ایپ انسٹالیشن گائیڈ",
    "app_install_guide_desc": "اینڈرائیڈ کے لیے کروم مینو سے انسٹال کو منتخب کریں۔"
  }
};

interface ChatMessage {
  id: string;
  sender: "user" | "manager";
  text: string;
  timestamp: string;
  imageUrl?: string;
  richCard?: {
    cardType: 'none' | 'estimate_preview' | 'security_badge' | 'telecom_helper' | 'completion_checklist' | 'guide';
    title?: string;
    description?: string;
    imageUrl?: string;
    metrics?: Record<string, string>;
  };
}

function parseRichCardFromText(rawText: string): { text: string; richCard?: ChatMessage['richCard'] } {
  if (!rawText) return { text: "", richCard: undefined };
  
  const match = rawText.match(/\[RICH_CARD_JSON:\s*(\{.*?\})\]/);
  if (match) {
    try {
      const richCard = JSON.parse(match[1]);
      const cleanText = rawText.replace(match[0], "").trim();
      return { text: cleanText, richCard };
    } catch (e) {
      console.warn("Failed to parse rich card JSON:", e);
    }
  }
  return { text: rawText, richCard: undefined };
}


// 🌟 0단계 ~ 10단계 매니저 실시간 선제적 맞춤형 안내 가이드
const getStepProactiveMessage = (step: number, lang: string = 'ko'): { text: string; richCard?: ChatMessage['richCard'] } => {
  const dummyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  switch (step) {
    case 0:
      return {
        text: lang === 'vi' ? 'Xin chào~ 😊 Nếu thấy các bước khó khăn, hãy nói với tôi trước nhé! Tôi sẽ giúp bạn hoàn tất các bước phức tạp nhất~ Tên tiếng Anh trên thẻ ARC của bạn là gì?'
            : lang === 'zh' ? '您好~ 😊 如果觉得步骤复杂，可以先告诉我！我来帮您搞定最难的步骤~ 请问您登录证上的英文姓名是？'
            : lang === 'uz' ? 'Salom~ 😊 Agar bosqichlar qiyin tuyulsa, avval menga ayting! Eng qiyin bosqichlarni o\'tishingizga yordam beraman~ ARC kartangizdagi ismingiz qanday?'
            : lang === 'id' ? 'Halo~ 😊 Jika terasa sulit, beri tahu saya dulu ya! Saya akan bantu lewati langkah paling rumit~ Siapa nama lengkap Anda di kartu ARC?'
            : lang === 'en' ? 'Hello~ 😊 If the steps feel overwhelming, talk to me first! I will help you breeze through the hardest parts~ What is your name on your ARC?'
            : '안녕하세요~ 😊 어려우시면 저한테 먼저 말씀해 주세요! 제가 가장 어려운 단계를 넘어가게 도와드릴게요~ 이름이 어떻게 되세요?'
      };
    case 1:
      return {
        text: lang === 'vi' ? 'Bước 1: Vui lòng chọn thời gian làm việc tại Hàn Quốc và mức lương trung bình hàng tháng. Hệ thống sẽ tính số tiền hoàn thuế ước tính trong 0.1 giây!'
            : lang === 'zh' ? '第1步：请选择在韩国的工作年限和月平均工资。系统将在0.1秒内计算出预估退税金额！'
            : lang === 'uz' ? '1-bosqich: Koreyadagi ish staji va o\'rtacha oylik maoshingizni tanlang. Tizim 0.1 soniyada taxminiy qaytarish summasini hisoblab beradi!'
            : lang === 'id' ? 'Langkah 1: Pilih masa kerja di Korea dan rata-rata gaji bulanan Anda. Sistem akan menghitung perkiraan pengembalian pajak dalam 0,1 detik!'
            : lang === 'en' ? 'Step 1: Select your work period in Korea and approximate monthly salary. The system will calculate your estimated refund in 0.1 seconds!'
            : '1단계: 한국 근무 기간과 대략적인 월급을 선택해 주세요. 0.1초 만에 예상 환급액을 정밀 계산해 드립니다!',
        richCard: {
          cardType: 'estimate_preview',
          title: '실시간 환급금 모의 정밀 분석',
          description: '현재 조건 기준 잠정 예상 환급금',
          metrics: { estimated_refund: '₩450,000 ~ ₩1,800,000' }
        }
      };
    case 2:
      return {
        text: lang === 'vi' ? 'Bước 2: Nhập họ tên tiếng Anh và 13 số CMND người nước ngoài (ARC). Mọi thông tin đều được mã hóa an toàn 256-bit SSL 🔒'
            : lang === 'zh' ? '第2步：请输入登录证上的英文姓名和13位外国人登录号。所有数据均受 256-bit SSL 高级加密保护 🔒'
            : lang === 'uz' ? '2-bosqich: ARC kartangizdagi inglizcha ismingiz va 13 xonali raqamingizni kiriting. Barcha ma\'lumotlar 256-bit SSL bilan himoyalangan 🔒'
            : lang === 'id' ? 'Langkah 2: Masukkan nama Inggris di kartu ARC dan 13 digit nomor ARC. Semua data dienkripsi aman dengan 256-bit SSL 🔒'
            : lang === 'en' ? 'Step 2: Enter your English name and 13-digit Foreigner Registration Number. All data is protected with 256-bit SSL encryption 🔒'
            : '2단계: 외국인등록증에 적힌 영문 성함과 외국인등록번호 13자리를 입력해 주세요. 모든 정보는 256-bit SSL로 안전하게 암호화됩니다 🔒',
        richCard: {
          cardType: 'security_badge',
          title: '개인정보 보호 및 보안 인증',
          description: '시중 은행과 동일한 수준의 256-bit SSL 암호화 처리 후 국세청 연동 즉시 자동 파기됩니다.'
        }
      };
    case 3:
      return {
        text: lang === 'vi' ? 'Bước 3: Vui lòng chọn nhà mạng (SKT, KT, LGU+, Alttle) và số điện thoại chính chủ để nhận mã OTP xác thực 📱'
            : lang === 'zh' ? '第3步：请选择手机运营商（SKT、KT、LGU+、廉价卡）并输入本人名义的手机号以接收验证码 📱'
            : lang === 'uz' ? '3-bosqich: O\'z nomingizdagi aloqa operatori (SKT, KT, LGU+, Alttle) va telefon raqamingizni tanlang 📱'
            : lang === 'id' ? 'Langkah 3: Pilih operator telekomunikasi (SKT, KT, LGU+, Hemat) dan nomor telepon atas nama Anda sendiri 📱'
            : lang === 'en' ? 'Step 3: Select your mobile carrier (SKT, KT, LGU+, MVNO) and enter your registered phone number 📱'
            : '3단계: 본인 명의 휴대폰 번호와 통신사를 선택해 주세요! 알뜰폰 고객님은 대행 통신사 구분을 정확히 확인해 주셔야 인증 문자가 옵니다 📱',
        richCard: {
          cardType: 'telecom_helper',
          title: '통신사 본인인증 도우미',
          description: '인증 문자가 오지 않는 경우 스팸 차단 설정 및 알뜰폰 대행사 구분을 확인해 주세요.'
        }
      };
    case 4:
      return {
        text: lang === 'vi' ? 'Bước 4: Chọn chứng chỉ tiện lợi nhất (Hana Bank, PASS, KakaoTalk). Nếu gặp khó khăn, hãy nhắn cho tôi để nhận ảnh hướng dẫn 1:1 nhé 🛡️'
            : lang === 'zh' ? '第4步：请选择最方便的认证方式（韩亚银行、PASS、KakaoTalk）。如果遇到困难，请告诉我，我将提供1:1图片引导 🛡️'
            : lang === 'uz' ? '4-bosqich: Qulay sertifikatni tanlang (Hana Bank, PASS, KakaoTalk). Qiyin bo\'lsa, menga yozing, 1:1 rasmli qo\'llanma beraman 🛡️'
            : lang === 'id' ? 'Langkah 4: Pilih sertifikat yang paling nyaman (Hana Bank, PASS, KakaoTalk). Jika kesulitan, beri tahu saya untuk panduan foto 1:1 🛡️'
            : lang === 'en' ? 'Step 4: Select your preferred authentication certificate (Hana Bank, PASS, KakaoTalk). Ask me if you need a step-by-step photo guide 🛡️'
            : '4단계: 하나은행, PASS, 카카오톡 중 가장 편하신 인증서를 선택해 주세요! 인증서 발급이 어려우시면 저한테 말씀해 주시면 1:1 사진으로 하나씩 안내해 드릴게요 🛡️',
        richCard: {
          cardType: 'guide'
        }
      };
    case 5:
      return {
        text: lang === 'vi' ? 'Bước 5: Vui lòng phê duyệt thông báo xác thực trên điện thoại hoặc nhập mã PIN 6 chữ số. Hệ thống sẽ kết nối an toàn với Cơ quan Thuế ✨'
            : lang === 'zh' ? '第5步：请在手机上批准认证请求或输入6位PIN密码。即将安全连接国税厅系统 ✨'
            : lang === 'uz' ? '5-bosqich: Telefonga kelgan tasdiqlash so\'rovini tasdiqlang yoki 6 xonali PIN-kodni kiriting ✨'
            : lang === 'id' ? 'Langkah 5: Setujui notifikasi verifikasi di ponsel Anda atau masukkan PIN 6 digit ✨'
            : lang === 'en' ? 'Step 5: Please approve the auth notification on your phone or enter your 6-digit PIN ✨'
            : '5단계: 휴대폰으로 도착한 인증 요청 알림을 승인해 주시거나 화면에 6자리 비밀번호를 입력해 주세요! 잠시 후 국세청과 안전하게 연동됩니다 ✨'
      };
    case 6:
      return {
        text: lang === 'vi' ? 'Bước 6: Đang kết nối trực tiếp với hệ thống Hometax của Cơ quan Thuế để tính toán chính xác tiền hoàn thuế 5 năm qua. Vui lòng giữ màn hình ⏳'
            : lang === 'zh' ? '第6步：正在与国税厅 Hometax 系统安全联网，精准计算过去5年的退税金额。请稍候，请勿关闭页面 ⏳'
            : lang === 'uz' ? '6-bosqich: Soliq idorasi tizimi bilan bog\'lanib, so\'nggi 5 yillik qaytariladigan soliq aniq hisoblanmoqda. Iltimos, kutib turing ⏳'
            : lang === 'id' ? 'Langkah 6: Sedang terhubung dengan sistem Kantor Pajak untuk menghitung pengembalian pajak 5 tahun terakhir secara akurat. Harap tunggu ⏳'
            : lang === 'en' ? 'Step 6: Connecting with the National Tax Service to calculate your exact 5-year tax refund. Please wait a moment ⏳'
            : '6단계: 국세청 홈택스 시스템과 안전하게 연동하여 지난 5년간의 세금 환급금을 정밀 계산 중입니다. 화면을 닫지 마시고 잠시만 기다려 주세요 ⏳'
      };
    case 7:
      return {
        text: lang === 'vi' ? 'Bước 7: Chúc mừng! Số tiền hoàn thuế của bạn đã được tính toán thành công 🎉 Hãy kiểm tra và nhấn [Nhập tài khoản]!'
            : lang === 'zh' ? '第7步：恭喜您！您的隐藏退税金额已成功计算完毕 🎉 请确认金额后点击 [输入银行账户]！'
            : lang === 'uz' ? '7-bosqich: Tabriklaymiz! Qaytariladigan soliq summasi muvaffaqiyatli hisoblab chiqildi 🎉 Ma\'lumotni tekshiring va davom eting!'
            : lang === 'id' ? 'Langkah 7: Selamat! Jumlah pengembalian pajak tersembunyi Anda telah berhasil dihitung 🎉 Periksa hasilnya dan lanjutkan!'
            : lang === 'en' ? 'Step 7: Congratulations! Your hidden tax refund has been calculated successfully 🎉 Check the details and proceed!'
            : '7단계: 축하드립니다! 고객님의 숨은 세금 환급액이 정확하게 산출되었습니다 🎉 계산 결과를 확인하시고 [계좌 입력하기]를 눌러주세요!'
      };
    case 8:
      return {
        text: lang === 'vi' ? 'Bước 8: Vui lòng nhập số tài khoản ngân hàng chính chủ tại Hàn Quốc để nhận tiền hoàn thuế trực tiếp từ Cơ quan Thuế 🏦'
            : lang === 'zh' ? '第8步：请输入您本人的韩国银行账户，国税厅将直接把退税款存入该账户 🏦'
            : lang === 'uz' ? '8-bosqich: Soliq idorasi to\'g\'ridan-to\'g\'ri pul o\'tkazishi uchun o\'z nomingizdagi bank hisob raqamini kiriting 🏦'
            : lang === 'id' ? 'Langkah 8: Masukkan nomor rekening bank di Korea atas nama Anda sendiri untuk menerima transfer langsung dari Kantor Pajak 🏦'
            : lang === 'en' ? 'Step 8: Enter your Korean bank account number in your name to receive the refund directly from the Tax Office 🏦'
            : '8단계: 국세청에서 세금을 직접 입금받으실 고객님 본인 명의의 은행 계좌번호를 입력해 주세요 🏦'
      };
    case 9:
      return {
        text: lang === 'vi' ? 'Bước 9: Vui lòng kiểm tra điều khoản ủy quyền nộp hồ sơ cho kế toán thuế và ký tên. Chính sách thanh toán sau 100%, chi phí hiện tại là 0đ ✍️'
            : lang === 'zh' ? '第9步：请确认税务师委托申报条款并进行电子签名。100% 后结结算政策，当前支付金额为 0韩元 ✍️'
            : lang === 'uz' ? '9-bosqich: Soliq mutaxassisiga ishonchnoma shartlarini tekshiring va imzo qo\'ying. 100% natijadan keyin to\'lov, hozir 0 von ✍️'
            : lang === 'id' ? 'Langkah 9: Periksa ketentuan kuasa konsultan pajak dan tanda tangani. Kebijakan pembayaran pascabayar 100%, biaya saat ini adalah 0 won ✍️'
            : lang === 'en' ? 'Step 9: Review the tax agent authorization terms and sign. 100% pay-after-refund policy, amount due right now is 0 won ✍️'
            : '9단계: 세무사 경정청구 위임 약관을 확인하시고 서명해 주시면 접수가 완료됩니다! 100% 후불 정산이므로 지금 결제되는 금액은 0원입니다 ✍️',
        richCard: {
          cardType: 'completion_checklist',
          title: '환급금 신청 진행 체크리스트'
        }
      };
    case 10:
      return {
        text: lang === 'vi' ? 'Bước 10: Hồ sơ hoàn thuế đã được tiếp nhận thành công! Tôi sẽ đồng hành cùng bạn đến khi tiền về tài khoản 🚀'
            : lang === 'zh' ? '第10步：退税申请已成功受理！从税务局审核到退税款到账，我将全程为您保驾护航 🚀'
            : lang === 'uz' ? '10-bosqich: Soliqni qaytarish arizasi muvaffaqiyatli qabul qilindi! Pul tushguncha barchasini kuzatib boraman 🚀'
            : lang === 'id' ? 'Langkah 10: Permohonan pengembalian pajak berhasil diajukan! Saya akan memantau prosesnya hingga dana masuk ke rekening Anda 🚀'
            : lang === 'en' ? 'Step 10: Tax refund application submitted successfully! I will look after your process until the refund arrives in your bank 🚀'
            : '10단계: 환급 신청이 성공적으로 접수되었습니다! 관할 세무서 심사부터 계좌 입금까지 제가 꼼꼼하게 챙겨드릴게요. 추가 문의사항이 있으시면 언제든 말씀하세요 🚀'
      };
    default:
      return {
        text: '궁금하신 점이 있으시면 언제든 질문해 주세요! 공식 매니저 김준현이 친절히 안내해 드립니다 🛡️'
      };
  }
};

function LiveVisualCoachCard({
  activeGuide,
  language,
  onAskQuestion
}: {
  activeGuide?: { method: 'hana' | 'pass' | 'kakao'; slideIndex: number; total: number } | null;
  language?: string;
  onAskQuestion?: (q: string) => void;
}) {
  const method = activeGuide?.method || 'hana';
  const slideIndex = activeGuide?.slideIndex ?? 0;
  const total = activeGuide?.total ?? 32;
  const info = getGuideStepKnowledge(method, slideIndex);

  const methodNames = {
    hana: language === 'vi' ? 'Ngân hàng Hana' : language === 'zh' ? '韩亚银行' : '하나은행',
    pass: 'PASS',
    kakao: language === 'vi' ? 'KakaoTalk' : '카카오톡'
  };

  return (
    <div className="mt-2.5 p-3.5 rounded-2xl bg-[#081220] border-2 border-[#e2b659]/50 shadow-2xl text-slate-100 flex flex-col gap-2.5 max-w-[310px] animate-in fade-in zoom-in-95 duration-300 font-bold">
      {/* 1. Header: Active slide status */}
      <div className="flex items-center justify-between text-[11px] text-slate-300 font-black border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 text-[#e2b659]">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
          <span>{methodNames[method]} {slideIndex + 1}/{total}</span>
        </div>
        <span className="bg-[#b88c30]/20 border border-[#b88c30]/40 px-2 py-0.5 rounded-full text-[9px] font-black text-[#e2b659]">
          {info.chapterTitle}
        </span>
      </div>

      {/* 2. Visual Point & Exact Location Callout */}
      <div className="bg-[#112338] p-2.5 rounded-xl border border-[#e2b659]/30 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-[#e2b659] text-[10px] font-black">
          <span>🎯 위치:</span>
          <span className="text-white">{info.visualLocationHint}</span>
        </div>
        <p className="text-[11px] font-bold text-slate-100 leading-snug">
          {info.actionInstruction}
        </p>
      </div>

      {/* 3. Action Reason Box */}
      <div className="bg-slate-900/90 p-2 rounded-xl border border-white/10 text-[10px] text-slate-300 font-medium leading-relaxed">
        <span className="text-[#e2b659] font-black">💡 이유: </span>
        <span>{info.actionReason}</span>
      </div>

      {/* 4. Instant Troubleshooting Quick Chips */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
          {language === 'vi' ? 'Hỏi nhanh Quản lý Kim:' : '김준현 매니저 원클릭 질문:'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {info.quickQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onAskQuestion && onAskQuestion(item.q)}
              className="text-left py-1 px-2 rounded-lg bg-white/5 hover:bg-[#b88c30]/20 hover:border-[#e2b659]/60 border border-white/10 text-[10px] text-slate-200 hover:text-[#e2b659] transition-all cursor-pointer font-bold"
            >
              💬 {item.q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RichCardRenderer({
  card,
  language,
  currentStep,
  activeGuide,
  onAskQuestion
}: {
  card: NonNullable<ChatMessage['richCard']>;
  language?: string;
  currentStep?: number;
  activeGuide?: { method: 'hana' | 'pass' | 'kakao'; slideIndex: number; total: number } | null;
  onAskQuestion?: (q: string) => void;
}) {
  const { cardType, title, description, metrics } = card;

  switch (cardType) {
    case 'estimate_preview':
      return (
        <div className="mt-2.5 p-4.5 rounded-2xl bg-gradient-to-br from-[#1d385a] to-[#0a1d33] border border-[#e2b659]/30 shadow-lg text-slate-100 flex flex-col gap-3.5 max-w-full font-bold">
          <div className="flex items-center gap-2 text-[#e2b659] text-xs">
            <svg className="w-4.5 h-4.5 shrink-0 text-[#e2b659]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{title || "실시간 환급금 모의 정밀 분석"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-medium">{description || "현재 정보 기준 잠정 예상 환급금"}</span>
            <span className="text-xl font-extrabold text-[#e2b659]">
              {metrics?.estimated_refund || "₩450,000"}
            </span>
          </div>
          <div className="h-px bg-white/10 w-full" />
          <div className="flex items-center justify-between text-[9px] text-slate-400">
            <span>보안 분석 엔진 v2.5</span>
            <span className="text-[#e2b659]">분석 신뢰도 99%</span>
          </div>
        </div>
      );
    case 'security_badge':
      return (
        <div className="mt-2.5 p-4.5 rounded-2xl bg-gradient-to-br from-[#0e213a] to-[#050f1b] border border-emerald-500/20 shadow-md text-slate-100 flex flex-col gap-2.5 max-w-full font-bold">
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <svg className="w-4.5 h-4.5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{title || "개인정보 보호 및 보안 인증"}</span>
          </div>
          <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
            {description || "고객님의 모든 정보는 시중 은행과 동일한 수준의 최고급 256-bit SSL 암호화 처리 후 국세청 연동 즉시 자동 파기됩니다."}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1 text-[9px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SSL 256bit</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">국세청 가이드 준수</span>
          </div>
        </div>
      );
    case 'telecom_helper':
      return (
        <div className="mt-2.5 p-4.5 rounded-2xl bg-gradient-to-br from-[#1d385a] to-[#0a1d33] border border-blue-400/20 shadow-md text-slate-100 flex flex-col gap-3 max-w-full font-bold">
          <div className="flex items-center gap-2 text-blue-400 text-xs">
            <svg className="w-4.5 h-4.5 shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{title || "통신사 본인인증 도우미"}</span>
          </div>
          <div className="flex flex-col gap-1.5 text-[10px] text-slate-300 font-medium">
            <p className="text-slate-400">{description || "본인인증 문자가 오지 않는 경우 조치 방법:"}</p>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1.5 items-start">
                <span className="text-[#e2b659] shrink-0">1.</span>
                <span>휴대폰 스팸 메시지 보관함 또는 통신사 인증 차단 서비스 설정을 확인해 주세요.</span>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-[#e2b659] shrink-0">2.</span>
                <span>알뜰폰 고객님의 경우 대행사 통신사 구분을 정확히 입력하셨는지 확인 바랍니다.</span>
              </div>
            </div>
          </div>
        </div>
      );
    case 'completion_checklist':
      return (
        <div className="mt-2.5 p-4.5 rounded-2xl bg-[#0d1e35] border border-white/10 shadow-md text-slate-100 flex flex-col gap-3 max-w-full font-bold">
          <div className="flex items-center gap-2 text-[#e2b659] text-xs">
            <svg className="w-4.5 h-4.5 shrink-0 text-[#e2b659]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>{title || "환급금 신청 진행 체크리스트"}</span>
          </div>
          <div className="flex flex-col gap-2.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">1단계: 세무 환급금 모의 조회</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                조회 성공
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">2단계: 국세청 안전 본인인증</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                인증 성공
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-200">3단계: 최종 환급 승인 서명</span>
              <span className="text-[#e2b659] animate-pulse">최종 서명 대기</span>
            </div>
          </div>
        </div>
      );
    case 'guide':
      return <LiveVisualCoachCard activeGuide={activeGuide} language={language} onAskQuestion={onAskQuestion} />;
    default:
      return null;
  }
}

function detectDeviceAndBrowser(): { os: 'ios' | 'android' | 'other'; isInApp: boolean } {
  if (typeof window === 'undefined') return { os: 'other', isInApp: false };
  const ua = window.navigator.userAgent.toLowerCase();
  
  let os: 'ios' | 'android' | 'other' = 'other';
  if (/iphone|ipad|ipod/.test(ua)) {
    os = 'ios';
  } else if (/android/.test(ua)) {
    os = 'android';
  }
  
  const isInApp = /kakaotalk|instagram|fb_iab|fbav|line|messenger|zalo|whatsapp|snapchat/.test(ua);
  return { os, isInApp };
}

export function FloatingAiChat() {
  return <FloatingConsultingPanelInner />;
}

function FloatingConsultingPanelInner() {
  const { language, t } = useTranslation();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"menu" | "live_chat">("menu");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  // Live Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 🚨 실시간 단계값 동기화 및 Stuck 감지 자동 사운드 개입 연동
  const [currentStep, setCurrentStep] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentBubbleText, setCurrentBubbleText] = useState("");
  const [activeGuide, setActiveGuide] = useState<{ method: 'hana' | 'pass' | 'kakao'; slideIndex: number; total: number } | null>(null);

  const [chatId, setChatId] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasCheckedHistory, setHasCheckedHistory] = useState(false);
  const inactivityTimerRef = useRef<any>(null);
  const messageCountRef = useRef<number>(0);

  // Simple UUID generator
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 1. Initialize chatId and check URL tracking parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const refChatId = searchParams.get("ref_chat_id");
      
      let id = refChatId;
      if (id) {
        localStorage.setItem("ktrs_chat_session_id", id);
      } else {
        id = localStorage.getItem("ktrs_chat_session_id") || "";
        if (!id) {
          id = generateUUID();
          localStorage.setItem("ktrs_chat_session_id", id);
        }
      }
      setChatId(id);
    }
  }, []);

  // 2. Conversion score sender helper
  const sendScoreFeedback = async (action: string) => {
    const activeChatId = chatId || localStorage.getItem("ktrs_chat_session_id");
    if (!activeChatId) return;
    try {
      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          action
        })
      });
    } catch (err) {
      console.error("Failed to send conversion feedback:", err);
    }
  };

  // 3. Inactivity timer control
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      sendScoreFeedback("inactivity_10min");
    }, 10 * 60 * 1000); // 10 minutes
  };

  // 4. Listen to global custom events dispatched from pages (e.g. estimate page transitions)
  useEffect(() => {
    const handleFeedbackEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const action = customEvent.detail?.action;
      if (action) {
        sendScoreFeedback(action);
      }
    };
    window.addEventListener("ktrs_conversion_feedback", handleFeedbackEvent);
    return () => {
      window.removeEventListener("ktrs_conversion_feedback", handleFeedbackEvent);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [chatId]);

  const handleChatClose = () => {
    setIsOpen(false);
    if (messageCountRef.current < 3) {
      sendScoreFeedback("instant_close");
    } else {
      const isAuthStep = pathname?.includes("/estimate") && document.querySelector('input[type="tel"]') !== null;
      if (isAuthStep) {
        sendScoreFeedback("verification_input");
      } else {
        sendScoreFeedback("chat_negotiation");
      }
    }
  };

  const isEstimatePage = pathname?.startsWith("/estimate");

  // 🚀 /estimate 첫 진입 시 선제적 채팅창 자동 열기 (sessionStorage 체크)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isEstimatePage) {
      const alreadyOpened = sessionStorage.getItem("ktrs_chat_auto_opened");
      if (!alreadyOpened) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          setViewMode("live_chat");
          sessionStorage.setItem("ktrs_chat_auto_opened", "true");
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isEstimatePage]);

  // Helper function to translate keys using local dictionary with English fallback
  const translate = (key: string) => {
    const lang = language || "ko";
    const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"] || TRANSLATIONS["ko"];
    if (dict && dict[key]) {
      return dict[key];
    }
    const serverTranslated = t(key);
    if (serverTranslated && serverTranslated !== key) {
      return serverTranslated;
    }
    return key;
  };

  // Helper to generate initial welcome & card messages
  const getDefaultWelcomeMessages = (): ChatMessage[] => {
    const dummyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getWelcomeMessage = () => {
      if (isEstimatePage) {
        switch (language) {
          case "vi": return "Xin chào~ 😊 Nếu thấy các bước khó khăn, hãy nói với tôi trước nhé! Tôi sẽ giúp bạn hoàn tất các bước phức tạp nhất~ Tên tiếng Anh trên thẻ ARC của bạn là gì?";
          case "zh": return "您好~ 😊 如果觉得步骤复杂，可以先告诉我！我来帮您搞定最难的步骤~ 请问您登录证上的英文姓名是？";
          case "id": return "Halo~ 😊 Jika terasa sulit, beri tahu saya dulu ya! Saya akan bantu lewati langkah paling rumit~ Siapa nama lengkap Anda di kartu ARC?";
          case "uz": return "Salom~ 😊 Agar bosqichlar qiyin tuyulsa, avval menga ayting! Eng qiyin bosqichlarni o'tishingizga yordam beraman~ ARC kartangizdagi ismingiz qanday?";
          case "th": return "สวัสดีครับ~ 😊 หากรู้สึกว่าขั้นตอนยุ่งยาก บอกผมได้เลยนะครับ! ผมจะช่วยข้ามขั้นตอนที่ยากที่สุดให้~ ขอทราบชื่อภาษาอังกฤษบนบัตรต่างด้าวหน่อยครับ?";
          case "km": return "សួស្តី~ 😊 ប្រសិនបើពិបាក សូមប្រាប់ខ្ញុំមុន! ខ្ញុំនឹងជួយអ្នករំលងជំហានដែលពិបាកបំផុត~ តើឈ្មោះជាភាសាអង់គ្លេសលើកាត ARC របស់អ្នកឈ្មោះអ្វី?";
          case "my": return "မင်္ဂလာပါ~ 😊 အဆင့်တွေ ခက်ခဲနေပါက ကျွန်တော့်ကို အရင်ပြောပြပါ! အခက်ခဲဆုံး အပိုင်းတွေကို ကူညီပေးပါမယ်~ ARC ကတ်ပေါ်က သင့်နာမည်က ဘာပါလဲ။";
          case "ne": return "नमस्कार~ 😊 यदि प्रक्रिया गाह्रो लागेमा पहिले मलाई भन्नुहोस्! म सबैभन्दा गाह्रो चरणहरू पार गर्न मद्दत गर्नेछु~ तपाईंको ARC कार्डमा भएको अंग्रेजी नाम के हो?";
          case "mn": return "Сайн байна уу~ 😊 Хэрэव хэцүү байвал надад эхлээд хэлээрэй! Би хамгийн төвөгтэй алхмуудыг алгасахад тусална~ ARC карт дээрх англи нэр тань хэн бэ?";
          case "bn": return "হ্যালো~ 😊 যদি ধাপগুলো কঠিন মনে হয়, তবে প্রথমে আমাকে বলুন! আমি আপনাকে সবচেয়ে জটিল ধাপগুলো পার করতে সাহায্য করব~ আপনার ARC কার্ডের ইংরেজি নামটি কী?";
          case "kk": return "Сәлеметсіз бе~ 😊 Егер қиын болса, алдымен маған айтыңыз! Ең қиын қадамдарды өтуге көмектесемін~ ARC картаңыздағы ағылшынша атыңыз кім?";
          case "si": return "ආයුබෝවන්~ 😊 පියවර අපහසු නම්, මුලින්ම මට කියන්න! මම වඩාත්ම සංකීර්ණ පියවර මඟහැරීමට උදවු කරන්නෙමි~ ඔබේ ARC නම කුමක්ද?";
          case "ur": return "ہیلو~ 😊 اگر مشکل لگے تو پہلے مجھے بتائیں! میں سب سے مشکل مراحل پار کرنے میں آپ کی مدد کروں گا~ آپ کے ARC پر انگریزی نام کیا ہے؟";
          case "en": return "Hello~ 😊 If the steps feel overwhelming, talk to me first! I will help you breeze through the hardest parts~ What is your name on your ARC?";
          default: return "안녕하세요~ 😊 어려우시면 저한테 먼저 말씀해 주세요! 제가 가장 어려운 단계를 넘어가게 도와드릴게요~ 이름이 어떻게 되세요?";
        }
      }

      switch (language) {
        case "vi": return "Xin chào! Tôi là Kim Jun-hyun, Quản lý chính thức. 👋 Tôi có thể giúp gì cho bạn về hoàn thuế thu nhập?";
        case "zh": return "您好！我是官方经理金俊贤。👋 请问有什么关于所得税退税的问题我可以帮您？";
        case "id": return "Halo! Saya Kim Jun-hyun, Manajer Resmi. 👋 Ada yang bisa saya bantu terkait pengembalian pajak Anda?";
        case "uz": return "Salom! Men Rasmiy menejer Kim Jun-hyunman. 👋 Daromad solig'ini qaytarish bo'yicha qanday yordam bera olaman?";
        case "th": return "สวัสดีครับ! ผมคือผู้จัดการอย่างเป็นทางการ คิม จุนฮยอน 👋 มีอะไรให้ผมช่วยเหลือเกี่ยวกับภาษีเงินได้ไหมครับ?";
        case "km": return "សួស្តី! ខ្ញុំគឺ គីម ជុនហ្យុន អ្នកគ្រប់គ្រងផ្លូវការ។ 👋 តើខ្ញុំអាចជួយអ្វីអ្នកបានខ្លះអំពីการបង្វិលពន្ធ?";
        case "my": return "မင်္ဂလာပါ။ ကျွန်တော်က တရားဝင်မန်နေဂျာ Kim Jun-hyun ပါ။ 👋 အခွန်ပြန်အမ်းငွေနှင့် ပတ်သက်၍ ဘာကူညီပေးရမလဲ။";
        case "ne": return "नमस्कार! म आधिकारिक प्रबन्धक किम जुन-ह्युन हुँ। 👋 कर फिर्ता सम्बन्धी केही सोध्नु छ?";
        case "mn": return "Сайн байна уу! Би албан ёсны менежер Ким Жүн-хён байна. 👋 Татварын буцаан олголтын талаאר юу асуумаар байна?";
        case "bn": return "হ্যালো! আমি অফিসিয়াল ম্যানেজার কিম জুন-হিউন। 👋 কর ফেরত সম্পর্কে কীভাবে সাহায্য করতে পারি?";
        case "kk": return "Сәлеметсіз бе! Мен ресми менеджер Ким Джун Хенмін. 👋 Салықты қайтару бойынша қалай көмектесе аламын?";
        case "si": return "ආයුබෝවන්! මම නිල කළමනාකරු කිම් ජුන්-හ්යුන්. 👋 ආදායම් බදු ආපසු ගෙවීම පිළිබඳව ඔබට කෙසේ උදව් කළ හැකිද?";
        case "ur": return "ہیلو! میں آفیشل مینیجر کم جون ہیون ہوں۔ 👋 میں انکم ٹیکس ریفنڈ میں آپ کی کیا مدد کر سکتا ہوں؟";
        case "en": return "Hello! I'm Official Manager Kim Jun-hyun. 👋 How can I assist you with your tax refund query today?";
        default: return "안녕하세요! 김준현 공식 매니저입니다. 👋 환급금 조회, 본인 인증, 수수료 등 궁금하신 점을 편하게 모국어로 물어보세요!";
      }
    };

    const getCardMessage = () => {
      switch (language) {
        case "vi": return "Đây là danh thiếp chính thức của tôi. Hãy lưu lại để liên hệ nhé! 🤝";
        case "zh": return "这是我的官方名片。请保存以备参考！🤝";
        case "id": return "Ini kartu nama resmi saya. Silakan simpan untuk referensi Anda! 🤝";
        case "uz": return "Bu mening rasmiy tashrif qog'ozim. Malumot uchun saqlab qo'ying! 🤝";
        case "th": return "นี่คือนามบัตรอย่างเป็นทางการของผม โปรดบันทึกไว้เพื่ออ้างอิงครับ! 🤝";
        case "km": return "នេះគឺជាកាតអាជីវកម្មផ្លូវការរបស់ខ្ញុំ។ សូមរក្សាទុកវាសម្រាប់ជាឯកសារយោង! 🤝";
        case "my": return "ဒါကတော့ ကျွန်ုပ်ရဲ့ တရားဝင် မိတ်ဆက်ကတ်ပြား ဖြစ်ပါတယ်။ ကိုးကားရန် သိမ်းဆည်းထားပါ! 🤝";
        case "ne": return "यो मेरो आधिकारिक व्यापार कार्ड हो। कृपया सन्दर्भको लागि बचत गर्नुहोस्! 🤝";
        case "mn": return "Энэ бол миний албан ёсны нэрийн хуудас юм. Хадгалж авна уу! 🤝";
        case "bn": return "এটি আমার অফিসিয়াল বিজনেস কার্ড। অনুগ্রহ করে রেফারেন্সের জন্য সংরক্ষণ করুন! 🤝";
        case "kk": return "Бұл менің ресми визиткам. Сілтеме үшін сақтап қойыңыз! 🤝";
        case "si": return "මෙය මගේ නිල ව්‍යාපාරික කාඩ්පතයි. කරුණාකර එය සුරැකීමට තබන්න! 🤝";
        case "ur": return "یہ میرا آفیشل بزنس کارڈ ہے۔ براہ کرم حوالہ کے لیے محفوظ کر لیں! 🤝";
        case "en": return "Here is my official business card. Please save it for reference! 🤝";
        default: return "제 모바일 명함입니다. 신뢰할 수 있는 공식 매니저이니 언제든 안심하고 문의해 주세요! 🤝";
      }
    };

    return [
      {
        id: "welcome-1",
        sender: "manager",
        text: getWelcomeMessage(),
        timestamp: dummyTimestamp,
      },
      {
        id: "welcome-card",
        sender: "manager",
        imageUrl: "/kim_junhyun_card.png",
        text: getCardMessage(),
        timestamp: dummyTimestamp,
      }
    ];
  };


  // 🎯 0단계 ~ 10단계 단계 변경 감지 및 실시간 선제적 가이드 발송
  useEffect(() => {
    const handleStepChange = (e: any) => {
      const newStep = e.detail?.step;
      if (typeof newStep === 'number') {
        setCurrentStep(newStep);
        
        // 채팅창이 열려있을 때 단계별 맞춤 선제 안내 메시지 자동 추가
        const stepMsgData = getStepProactiveMessage(newStep, language || 'ko');
        setCurrentBubbleText(stepMsgData.text);
        setShowSpeechBubble(true);
        const dummyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setMessages(prev => {
          // 이미 해당 단계 안내가 가장 최근 메시지로 들어가 있다면 중복 발송 방지
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && (lastMsg.id === `step-proactive-${newStep}` || lastMsg.text === stepMsgData.text)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: `step-proactive-${newStep}-${Date.now()}`,
              sender: "manager",
              text: stepMsgData.text,
              richCard: stepMsgData.richCard,
              timestamp: dummyTimestamp
            }
          ];
        });
      }
    };

    const handleStuckEvent = () => {
      // 30초 정체 시 구출 가이드 자동 오픈 및 안내
      setIsOpen(true);
      setViewMode("live_chat");
      const dummyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `stuck-help-${Date.now()}`,
          sender: "manager",
          text: (language === 'vi' ? 'Bạn đang gặp khó khăn ở bước này phải không? Tôi đã mở sẵn video hướng dẫn mô phỏng trực tiếp bên dưới cho bạn nhé! 😊'
               : language === 'zh' ? '您在这个步骤遇到困难了吗？我为您准备了下方的实时模拟引导视频，请参考操作！😊'
               : '혹시 이 단계에서 진행이 어려우신가요? 고객님을 위해 아래에 실시간 시뮬레이션 가이드를 준비해 두었습니다! 천천히 따라해 보세요 😊'),
          richCard: { cardType: 'guide' },
          timestamp: dummyTimestamp
        }
      ]);
    };

    const handleGuideSlideChange = (e: any) => {
      if (e && e.detail) {
        setActiveGuide({
          method: e.detail.method || 'hana',
          slideIndex: e.detail.slideIndex ?? 0,
          total: e.detail.total ?? 32
        });
      }
    };

    const handleOpenChatEvent = () => {
      setIsOpen(true);
      setViewMode("live_chat");
    };

    window.addEventListener("ktrs-step-change", handleStepChange);
    window.addEventListener("ktrs-user-stuck", handleStuckEvent);
    window.addEventListener("ktrs-guide-slide-change", handleGuideSlideChange as EventListener);
    window.addEventListener("open-ai-consult-chat", handleOpenChatEvent);
    return () => {
      window.removeEventListener("ktrs-step-change", handleStepChange);
      window.removeEventListener("ktrs-user-stuck", handleStuckEvent);
      window.removeEventListener("ktrs-guide-slide-change", handleGuideSlideChange as EventListener);
      window.removeEventListener("open-ai-consult-chat", handleOpenChatEvent);
    };
  }, [language, currentStep]);

  // 1. Initial welcome message check when entering live chat
  useEffect(() => {
    if (viewMode === "live_chat" && messages.length === 0) {
      setMessages(getDefaultWelcomeMessages());
    }
  }, [viewMode, language, isEstimatePage]);

  // 2. Load previous messages from Supabase
  useEffect(() => {
    if (viewMode !== "live_chat") {
      setHasCheckedHistory(false);
      return;
    }

    const currentActiveChatId = chatId || (typeof window !== 'undefined' ? localStorage.getItem("ktrs_chat_session_id") : null);
    if (!currentActiveChatId) {
      setHasCheckedHistory(true);
      return;
    }

    let isMounted = true;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { data: chatSession } = await supabase
          .from("support_chats")
          .select("id")
          .eq("channel", "web")
          .eq("external_chat_id", currentActiveChatId)
          .maybeSingle();

        if (chatSession && isMounted) {
          const { data: dbMessages } = await supabase
            .from("support_messages")
            .select("*")
            .eq("chat_id", chatSession.id)
            .order("created_at", { ascending: true });

          if (isMounted && dbMessages && dbMessages.length > 0) {
            const mapped: ChatMessage[] = dbMessages.map((msg) => {
              const isUser = msg.sender_type === "customer";
              const isKo = (language || "ko") === "ko";
              const rawText = isUser 
                ? msg.original_text 
                : (isKo ? msg.original_text : (msg.translated_text || msg.original_text));

              const { text, richCard } = parseRichCardFromText(rawText);

              return {
                id: String(msg.id),
                sender: isUser ? ("user" as const) : ("manager" as const),
                text: text,
                richCard: richCard,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            });

            const hasWelcomeAlready = mapped.some(
              (m) =>
                m.id === "welcome-1" ||
                m.id === "welcome-card" ||
                m.text.includes("공식 매니저") ||
                m.text.includes("명함") ||
                m.text.includes("이름이 어떻게 되세요")
            );

            if (hasWelcomeAlready) {
              setMessages(mapped);
            } else {
              setMessages([...getDefaultWelcomeMessages(), ...mapped]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
          setHasCheckedHistory(true);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [viewMode, chatId, language, isEstimatePage]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isSending, isTyping]);

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

  const [showIosGuideModal, setShowIosGuideModal] = useState(false);

  const handleInstallApp = () => {
    if (isInAppBrowser) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("lang", language);
      const targetUrl = currentUrl.toString();

      if (navigator.userAgent.match(/Android/i)) {
        window.location.href = `intent://${targetUrl.replace(/^https?:\/\//i, "")}#Intent;scheme=https;package=com.android.chrome;end`;
      } else {
        setShowIosGuideModal(true);
      }
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
      });
    } else {
      setShowIosGuideModal(true);
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = async (textToSend?: string, forcedStep?: number) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || isSending || isTyping) return;

    const isSystemStuckRequest = text.includes("[STUCK_HELPER_SYSTEM_REQUEST]");

    // Track active message exchanges
    messageCountRef.current += 1;
    resetInactivityTimer();

    if (!isSystemStuckRequest) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
    }
    
    setInputMessage("");
    setIsSending(true);

    try {
      // Clear typing text indicator on send
      const activeChatId = chatId || localStorage.getItem("ktrs_chat_session_id");
      if (activeChatId) {
        Promise.resolve(
          supabase.from("support_chats").select("metadata").eq("id", activeChatId).maybeSingle().then(({ data: chatData }) => {
            const updatedMetadata = {
              ...(chatData?.metadata || {}),
              typing_text: ""
            };
            return supabase.from("support_chats").update({ metadata: updatedMetadata }).eq("id", activeChatId).then(() => {});
          })
        ).catch(() => {});
      }

      const device = detectDeviceAndBrowser();
      const res = await fetch("/api/chat/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim().includes("[STUCK_HELPER_SYSTEM_REQUEST]")
            ? `[SYSTEM_NOTIFICATION] 고객이 Step ${typeof forcedStep === 'number' ? forcedStep : currentStep} 단계 화면에서 30초 동안 움직임이 없어 정체된 상태입니다. 이에 대해 고객을 다정히 안심시키고, 해당 단계의 가이드 이미지 캡처 사진을 참조하여 진행해 보라고 고객 설정 언어로 상냥하게 구출 안내 메시지를 작성해 주세요.`
            : text.trim(),
          language: language || "ko",
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text,
          })),
          chatId: chatId || localStorage.getItem("ktrs_chat_session_id"),
          clientOs: device.os,
          clientIsInApp: device.isInApp,
          currentPathname: pathname,
          currentStep: typeof forcedStep === 'number' ? forcedStep : currentStep,
          activeGuideContext: activeGuide ? getGuideStepKnowledge(activeGuide.method, activeGuide.slideIndex) : undefined
        }),
      });

      const data = await res.json();
      setIsSending(false); // Hide main loading spinner

      // 🚀 정보 수집 완료 시 Step 4 자동 점프 (ktrs-auto-fill)
      if (data.collectedUserData && (data.collectedUserData.isComplete || (data.collectedUserData.name && data.collectedUserData.registrationNumber && data.collectedUserData.phone))) {
        console.log("[FloatingAiChat] Auto-filling collected user data to estimate form:", data.collectedUserData);
        window.dispatchEvent(new CustomEvent("ktrs-auto-fill", { detail: data.collectedUserData }));
      }
      
      // If AI response is disabled (Manual Takeover), do not print any automatic answers.
      if (data.isAiActive === false || data.answer === "") {
        console.log("[AI Disabled] Manual intervention is active. Silent mode.");
        setIsTyping(false);
        return;
      }

      console.log(`[AI Response] Sentiment scores: Pos=${data.posScore}, Neg=${data.negScore}`);
      const answer = data.answer;
      
      // Split sentence chunks using '|' or double line breaks '\n\n'
      let chunks = answer
        .split(/[|]|\n{2,}/)
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);

      // Forcefully cap to maximum 2 chunks to avoid message spam, merging the rest
      if (chunks.length > 2) {
        const first = chunks[0];
        const rest = chunks.slice(1).join(" ");
        chunks = [first, rest];
      }

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      let chunkIdx = 0;
      for (const chunk of chunks) {
        setIsTyping(true); // Turn on typing indicator
        
        // Calculate typing delay based on characters
        const baseSpeed = 20 + Math.random() * 15;
        const basePause = 300 + Math.random() * 400;
        const typingTime = Math.min(chunk.length * baseSpeed + basePause, 3000);
        await delay(typingTime);
        
        setIsTyping(false); // Turn off typing indicator temporarily for message slide-in
        await delay(100);
        
        const isLastChunk = chunkIdx === chunks.length - 1;
        const managerMsg: ChatMessage = {
          id: `manager-${Date.now()}-${Math.random()}`,
          sender: "manager",
          text: chunk,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          richCard: (isLastChunk && data.richCardPayload && data.richCardPayload.cardType !== 'none')
            ? data.richCardPayload
            : undefined
        };
        
        setMessages((prev) => [...prev, managerMsg]);
        messageCountRef.current += 1;
        resetInactivityTimer();
        
        chunkIdx++;
        
        // Keep typing indicator active during the gap between chunks
        if (!isLastChunk) {
          setIsTyping(true);
          await delay(1200 + Math.random() * 600);
        }
      }
      setIsTyping(false);

    } catch (err) {
      console.error("Failed to send message to AI Manager:", err);
      setIsSending(false);
      setIsTyping(false);
      const errorMsg: ChatMessage = {
        id: `manager-err-${Date.now()}`,
        sender: "manager",
        text: "현재 국세청 연동 서버 응답이 원활하지 않습니다. 급하신 분은 아래 왓츠앱 실시간 상담을 이용해 주세요!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // 🚨 실시간 단계값 동기화 및 Stuck 감지 자동 사운드 개입 연동
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStepChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.step === 'number') {
        console.log(`[FloatingAiChat] Syncing currentStep state to: ${customEvent.detail.step}`);
        setCurrentStep(customEvent.detail.step);
      }
    };

    const handleUserStuck = (e: Event) => {
      const customEvent = e as CustomEvent;
      const stuckStep = customEvent.detail?.step ?? 0;
      console.log(`[FloatingAiChat] Stuck detected at step: ${stuckStep}. Triggering helper...`);

      // 🔊 경쾌한 수신 카톡 알림 사운드 재생
      try {
        const audio = new Audio('/sounds/message_received.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (err) {
        console.warn('Failed to play helper notification sound:', err);
      }

      // 채팅창 자동 활성화 오픈
      setIsOpen(true);
      setViewMode("live_chat");

      // AI 구출 멘트 선제 호출
      handleSendMessage(`[STUCK_HELPER_SYSTEM_REQUEST]`, stuckStep);
    };

    window.addEventListener("ktrs-step-change", handleStepChange);
    window.addEventListener("ktrs-user-stuck", handleUserStuck);

    return () => {
      window.removeEventListener("ktrs-step-change", handleStepChange);
      window.removeEventListener("ktrs-user-stuck", handleUserStuck);
    };
  }, [chatId, messages, currentStep]);

  const getQuickQuestions = () => {
    switch (language) {
      case "vi":
        return ["📱 Hướng dẫn xác thực PASS", "💬 Hướng dẫn xác thực KakaoTalk", "🏦 Hướng dẫn xác thực Hana Bank", "Hoàn thuế bao lâu thì có tiền?"];
      case "zh":
        return ["📱 PASS 认证步骤指南", "💬 KakaoTalk 认证指南", "🏦 韩亚银行 认证指南", "退税需要多长时间到账？"];
      case "id":
        return ["📱 Panduan Verifikasi PASS", "💬 Panduan Verifikasi KakaoTalk", "🏦 Panduan Verifikasi Hana Bank", "Kapan uang cair?"];
      case "uz":
        return ["📱 PASS tasdiqlash qo'llanmasi", "💬 KakaoTalk tasdiqlash qo'llanmasi", "🏦 Hana Bank tasdiqlash qo'llanmasi", "Pul qachon tushadi?"];
      case "en":
        return ["📱 PASS Auth Guide", "💬 KakaoTalk Auth Guide", "🏦 Hana Bank Auth Guide", "When will I get my refund?"];
      default:
        return ["📱 PASS 앱 인증 방법", "💬 카카오톡 인증 방법", "🏦 하나은행 인증 방법", "환급금은 언제 입금되나요?"];
    }
  };

  return (
    <div
      id="floating-chat-container"
      data-floating-chat="true"
      className="fixed bottom-[98px] lg:bottom-6 right-3 sm:right-6 z-[99999] floating-ai-widget flex flex-col items-end gap-3 print:hidden max-w-[calc(100vw-24px)] pointer-events-auto"
    >
      {/* 1. collapsed state: capsule button, simulation button & proactive speech bubble */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2 group max-w-[320px]">
          {/* 💬 0단계부터 10단계까지 실시간 선제적 말풍선 팝업 (Speech Bubble) */}
          {showSpeechBubble && (
            <div
              onClick={() => {
                setIsOpen(true);
                setViewMode("live_chat");
              }}
              className="relative bg-[#0f1e36] text-white border-2 border-[#b88c30] rounded-2xl p-3 pr-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-300 text-xs font-bold leading-snug cursor-pointer hover:border-[#e2b659] hover:scale-[1.02] transition-all"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                title="말풍선 닫기"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1.5 mb-1 text-[#e2b659] text-[10px] font-black uppercase">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>
                  {language === 'vi' ? `Mẹo Bước ${currentStep} từ Quản lý Kim`
                   : language === 'zh' ? `金经理的第${currentStep}步实时引导`
                   : language === 'uz' ? `Menejer Kimning ${currentStep}-bosqich yordami`
                   : language === 'id' ? `Panduan Langkah ${currentStep} dari Manajer Kim`
                   : language === 'en' ? `Manager Kim's Step ${currentStep} Live Guide`
                   : `김준현 매니저의 Step ${currentStep} 실시간 안내`}
                </span>
              </div>
              <p className="text-slate-200 text-[11px] break-keep font-medium leading-relaxed">
                {getStepProactiveMessage(currentStep, language || 'ko').text}
              </p>
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#b88c30]" />
            </div>
          )}

          {/* 메인 캡슐 버튼 */}
          <button
            onClick={() => {
              setIsOpen(true);
            }}
            className="flex items-center gap-3 bg-[#0f1e36] hover:bg-[#152a45] text-white rounded-full p-2.5 pl-3.5 pr-6 border border-[#b88c30]/50 shadow-[0_10px_30px_rgba(15,30,54,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 group-hover:scale-105 z-[200] max-w-[280px]"
          >
            {/* Avatar Area */}
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 rounded-full border border-[#b88c30]/60 animate-pulse" />
              <div className="absolute -inset-1 rounded-full border border-[#b88c30]/20" />
              <div className="h-10 w-10 rounded-full overflow-hidden border border-[#b88c30] relative bg-slate-800">
                <img
                  src="/images/manager.png"
                  alt="Manager Profile"
                  className="h-full w-full object-cover"
                />
              </div>
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
        </div>
      )}

      {/* 2. expanded state: pop-up dialog */}
      {isOpen && (
        <div className="w-[350px] max-w-[calc(100vw-24px)] h-[520px] max-h-[calc(100dvh-100px)] lg:max-h-[85vh] bg-[#0f1e36] rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,30,54,0.5)] border border-[#b88c30]/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 z-[200]">
          
          {/* Header */}
          <div className="px-4 sm:px-6 pt-3.5 pb-3 flex items-center justify-between shrink-0 sticky top-0 bg-[#0f1e36] z-20 border-b border-white/10 shadow-md">
            <div className="flex items-center gap-2">
              {viewMode === "live_chat" && (
                <button
                  onClick={() => setViewMode("menu")}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/10 mr-1 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-500 font-black uppercase tracking-wider">
                    {viewMode === "live_chat" ? "AI Manager · Live" : "Online · Active Now"}
                  </span>
                </div>
                {viewMode === "live_chat" && (
                  <span className="text-white text-xs font-black tracking-tight">
                    {translate("김준현 공식 매니저")}
                  </span>
                )}
              </div>
            </div>
             <div className="flex items-center gap-2">
              <button
                onClick={handleChatClose}
                className="px-3.5 py-1.5 rounded-full bg-[#b88c30]/25 hover:bg-[#b88c30]/40 text-[#e2b659] font-black text-[11px] transition-all border border-[#b88c30]/50 shadow-sm active:scale-95 cursor-pointer"
              >
                {translate("숨기기")}
              </button>
              <button
                onClick={handleChatClose}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/20 shadow-sm active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Menu View */}
          {viewMode === "menu" && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Profile headshot section */}
              <div className="flex flex-col items-center pt-2 sm:pt-3 pb-2 sm:pb-3 px-4 sm:px-6 text-center">
                <div className="relative mb-2.5">
                  <div className="absolute -inset-1 rounded-full border-2 border-[#b88c30]/20" />
                  <div className="absolute -inset-2 rounded-full border border-[#b88c30]/10" />
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden border-2 border-[#b88c30] relative bg-slate-800 shadow-xl">
                    <img
                      src="/images/manager.png"
                      alt="Manager Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#0f1e36] animate-pulse" />
                </div>

                <span className="inline-flex items-center justify-center bg-[#b88c30]/10 border border-[#b88c30]/30 text-[#b88c30] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  {translate("Official Manager")}
                </span>

                <h3 className="text-white font-black text-lg tracking-tight">
                  {translate("김준현 공식 매니저")}
                </h3>
                
                <p className="text-slate-400 font-bold text-[11px] mt-0.5">
                  Official Center 010-5864-8577
                </p>
              </div>

              {/* Manager Headline Info Display Box */}
              <div className="px-5 pb-3">
                <div className="text-center">
                  <p className="text-[#e2b659] font-black text-xs sm:text-sm tracking-tight break-keep leading-snug">
                    {translate("외국인 중소 기업 청년 소득세 환급을 도와 드립니다.")}
                  </p>
                </div>
              </div>

              {/* Action Links Container */}
              <div className="px-4 sm:px-6 pb-4 flex flex-col gap-2">
                {/* Multi-language Support Banner */}
                <div className="p-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-[#e2b659]">
                    <span className="animate-pulse">🌐</span>
                    {t("모국어로 편하게 대화하세요 (지원 언어: 베트남어, 중국어, 우즈벡어 등)")}
                  </div>
                </div>

                {/* Primary Real-time Manager AI Chat Button */}
                <button
                  onClick={() => setViewMode("live_chat")}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-[#b88c30] via-[#e2b659] to-[#b88c30] hover:brightness-110 text-[#0f1e36] font-black rounded-xl sm:rounded-2xl py-3 px-4 shadow-[0_6px_20px_rgba(226,182,89,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm border border-yellow-200/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">💬</span>
                    <span className="tracking-tight">{translate("지금 실시간으로 매니저에게 문의하기")}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#0f1e36]" />
                </button>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/821058648577"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/95 text-white font-black rounded-xl py-2.5 px-3.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                >
                  <img src="/WhatsApp.png" alt="WhatsApp" className="h-4 w-4 object-contain shrink-0" />
                  <span>{translate("왓츠앱 실시간 상담")}</span>
                </a>

                {/* Telegram */}
                <a
                  href="https://t.me/ktrs_support_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0088cc]/95 text-white font-black rounded-xl py-2.5 px-3.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                >
                  <img src="/Telegram.png" alt="Telegram" className="h-4 w-4 object-contain shrink-0" />
                  <span>{translate("텔레그램 실시간 상담")}</span>
                </a>

                {/* App Install */}
                <button
                  onClick={handleInstallApp}
                  className="flex items-center justify-center gap-2 bg-[#FF4E00] hover:bg-[#FF4E00]/95 text-white font-black rounded-xl py-2.5 px-3.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                >
                  <span className="text-sm leading-none">📱</span>
                  <span>{translate("내 휴대폰에 앱 설치하기")}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Real-time Live Chat View */}
          {viewMode === "live_chat" && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#081220]">
              
              {/* Chat Message Stream */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#e2b659]" />
                    <span className="text-[10px] font-bold">대화 기록 불러오는 중...</span>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2 max-w-[88%]",
                          msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {msg.sender === "manager" && (
                          <div className="h-7 w-7 rounded-full overflow-hidden border border-[#b88c30] shrink-0 mt-0.5 bg-slate-800">
                            <img src="/images/manager.png" alt="Manager" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div
                            className={cn(
                              "p-3 rounded-2xl text-xs leading-relaxed font-bold shadow-sm whitespace-pre-wrap break-keep",
                              msg.sender === "user"
                                ? "bg-gradient-to-r from-[#b88c30] to-[#e2b659] text-[#0f1e36] rounded-tr-none"
                                : "bg-[#152a45] text-slate-100 border border-white/10 rounded-tl-none"
                            )}
                          >
                            {msg.imageUrl && (
                              <div className="mb-2.5 rounded-xl overflow-hidden border border-white/10 bg-[#081220] flex items-center justify-center max-h-[180px]">
                                <img src={msg.imageUrl} alt="Message Media" className="w-full h-auto object-contain" />
                              </div>
                            )}
                            {msg.text}
                          </div>
                          {msg.richCard && (
                            <RichCardRenderer
                              card={msg.richCard}
                              language={language}
                              currentStep={currentStep}
                              activeGuide={activeGuide}
                              onAskQuestion={(q) => handleSendMessage(q)}
                            />
                          )}
                          <span className={cn(
                            "text-[9px] text-slate-500 font-bold mt-1 px-1",
                            msg.sender === "user" ? "text-right" : "text-left"
                          )}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {(isSending || isTyping) && (
                      <div className="flex gap-2 max-w-[88%] mr-auto">
                        <div className="h-7 w-7 rounded-full overflow-hidden border border-[#b88c30] shrink-0 mt-0.5 bg-slate-800">
                          <img src="/images/manager.png" alt="Manager" className="h-full w-full object-cover" />
                        </div>
                        <div className="p-3.5 px-4.5 rounded-2xl bg-[#152a45] border border-white/10 rounded-tl-none flex items-center justify-center w-15 h-9.5 shadow-sm">
                          <span className="flex gap-1 items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-[#e2b659] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#e2b659] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[#e2b659] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-3 py-1.5 bg-[#0f1e36]/80 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
                {getQuickQuestions().map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-[#0f1e36] border-t border-white/10 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputMessage(val);
                    
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(async () => {
                      const activeChatId = chatId || localStorage.getItem("ktrs_chat_session_id");
                      if (!activeChatId) return;
                      try {
                        const { data: chatData } = await supabase
                          .from("support_chats")
                          .select("metadata")
                          .eq("id", activeChatId)
                          .maybeSingle();

                        const updatedMetadata = {
                          ...(chatData?.metadata || {}),
                          typing_text: val.trim()
                        };

                        await supabase
                          .from("support_chats")
                          .update({ metadata: updatedMetadata })
                          .eq("id", activeChatId);
                      } catch (err) {
                        // ignore
                      }
                    }, 150);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={
                    language === "vi" ? "Nhập câu hỏi của bạn..." :
                    language === "zh" ? "请输入您的疑问..." :
                    language === "uz" ? "Savolingizni kiriting..." :
                    language === "id" ? "Ketik pertanyaan Anda..." :
                    language === "en" ? "Type your question..." :
                    "모국어로 질문을 입력하세요..."
                  }
                  className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#b88c30] transition-colors font-bold"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isSending}
                  className="h-8 w-8 rounded-xl bg-gradient-to-r from-[#b88c30] to-[#e2b659] hover:brightness-110 disabled:opacity-40 flex items-center justify-center text-[#0f1e36] transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* iOS Visual Safari Opening Guide Modal */}
      {showIosGuideModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-start pt-12 px-6 text-white text-center animate-in fade-in duration-200">
          <div className="absolute top-4 right-6 flex items-center gap-2 animate-bounce">
            <span className="text-sm font-black text-[#e2b659]">1. [···] 버튼 클릭 ↗️</span>
          </div>

          <div className="max-w-sm bg-[#0f1e36] border border-[#b88c30]/50 rounded-3xl p-6 shadow-2xl mt-12 space-y-4">
            <div className="h-12 w-12 rounded-full bg-[#b88c30]/20 border border-[#b88c30] flex items-center justify-center mx-auto text-2xl">
              🧭
            </div>
            <h3 className="text-lg font-black text-white">
              {language === "vi" ? "Mở trong Safari để cài đặt" :
               language === "zh" ? "在 Safari 中打开以进行安装" :
               language === "uz" ? "O'rnatish uchun Safari-da oching" :
               language === "en" ? "Open in Safari to Install" :
               "Safari(사파리)에서 열기 안내"}
            </h3>
            <p className="text-xs text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">
              {language === "vi" ? "Nhấn vào nút [···] ở góc trên bên phải màn hình và chọn 'Mở bằng Safari' (Open in Safari)." :
               language === "zh" ? "点击屏幕右上角的 [...] 按钮，然后选择“在 Safari 中打开”(Open in Safari)。" :
               language === "uz" ? "Ekraning yuqori o'ng burchagidagi [...] tugmasini bosing va 'Safari-da ochish'ni tanlang." :
               language === "en" ? "Tap the [...] button in the top right corner of your screen and select 'Open in Safari'." :
               "화면 우측 상단의 [...] 버튼을 누른 후 'Safari에서 열기'를 선택하시면 편리하게 이용하실 수 있습니다."}
            </p>
            <button
              onClick={() => setShowIosGuideModal(false)}
              className="w-full py-3 bg-[#b88c30] hover:bg-[#e2b659] text-[#0f1e36] font-black rounded-xl text-xs transition-colors cursor-pointer"
            >
              {language === "vi" ? "Đã hiểu" : language === "zh" ? "知道了" : language === "uz" ? "Tushundim" : "확인"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
