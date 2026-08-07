"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronRight, ArrowLeft, Send, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
const translate = (s: string) => s;
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// FAQ Items definition
const FAQ_ITEMS = [
  {
    title: translate("Korea Tax Refund Service, 믿을 수 있나요?"),
    content: translate("네, 안심하고 이용하셔도 좋습니다! Korea Tax Refund Service를 믿을 수 있는 3가지 확실한 이유를 말씀드릴게요. 🛡️\n\n1️⃣ 100% 한국 국세청(NTS)에서 직접 입금해 드립니다.\n가장 많이 걱정하시는 부분이죠! 저희는 고객님의 환급금에 절대 손대지 않습니다. 신고가 완료되면 환급금은 저희를 거치지 않고, 한국 국세청에서 고객님 본인 명의의 계좌로 직접 송금합니다.\n\n2️⃣ 국가 공인 전문 세무사가 전담합니다.\n모든 환급 절차는 엄격한 자격을 갖춘 대한민국 국가 공인 전문 세무사가 합법적이고 꼼꼼하게 처리합니다.\n\n3️⃣ 철저한 개인정보 보호\n본인 인증과 개인정보는 오직 정부(국세청) 시스템에 세금 환급을 신고하기 위한 목적으로만 사용되며, 철저한 보안 속에 안전하게 보호됩니다.\n\n매년 수많은 외국인 근로자분들이 잘 몰라서 놓치고 있는 '정당하게 돌려받아야 할 내 돈'을 안전하게 찾아드리고 있습니다. 안심하고 화면의 안내에 따라 조회를 시작해 보세요! 👍")
  },
  {
    title: translate("수수료는 왜 내야 하나요?"),
    content: translate("수수료 22%는 고객님의 세금을 꼼꼼하게 다시 계산해서 국세청에 대신 신고해 주는 '전문 세무사'의 정당한 수임료(인건비)입니다. 👨‍💼💼\n\n세금 환급은 단순히 버튼만 누른다고 돈이 나오는 것이 아니라, 과거 5년 치의 복잡한 세금 기록을 세무사가 직접 분석하고 국세청에 신고 서류를 제출해야 하는 까다로운 법적 절차입니다.\n\n💎 신청 시 결제 금액 0원! 100% 후불 결제 원칙\n저희 Korea Tax Refund Service는 '선결제 0원 / 후불제 수수료' 정책을 적용하고 있습니다. 신청 단계에서는 비용이 전혀 청구되지 않으며, 한국 국세청에서 고객님의 통장으로 환급금이 실제로 입금된 것이 확인된 후에만 수수료(22%) 결제가 진행됩니다.\n\n⚠️ 환급 실패 시 수수료 0원 (100% 안심 보장)\n세무사의 최종 검토 결과 환급이 불가능하거나 국세청에서 환급금이 나오지 않는 경우에는 수수료를 단 1원도 청구하지 않습니다. 고객님께는 어떠한 금전적 위험도 없으니 안심하고 신청하셔도 됩니다!")
  },
  {
    title: translate("언제 입금되나요?"),
    content: translate("환급 신청을 완료하신 후, 실제 통장으로 돈이 입금되기까지는 보통 45일에서 최대 60일 정도 소요됩니다. ⏳\n\n시간이 꽤 걸리는 이유는, 한국 국세청(NTS)의 공무원들이 고객님의 지난 5년 치 세금 기록을 하나하나 꼼꼼히 확인하고 승인하는 심사 기간이 필요하기 때문입니다. (관할 세무서의 업무량에 따라 조금 더 빠르거나 늦어질 수 있습니다.)\n\n환급 진행 상황은 언제든지 Korea Tax Refund Service의 [나의 환급 진행사항] 메뉴에서 실시간으로 확인하실 수 있으니 안심하고 기다려 주세요!")
  },
  {
    title: translate("신분증 사진, 안전한가요?"),
    content: translate("네, 100% 안전합니다! 신분증 사진이 혹시라도 나쁜 곳에 쓰일까 걱정하시는 마음, 충분히 이해합니다. Korea Tax Refund Service의 철저한 보안 원칙 3가지를 약속드립니다. 🔒\n\n1️⃣ 전송 즉시 영구 삭제 (저장 NO!)\n촬영하신 신분증 사진은 저희 서버나 휴대폰에 절대 '저장'되지 않습니다. 오직 세무서에 본인 확인용으로 제출되는 즉시 영구적으로 파기됩니다.\n\n2️⃣ 국세청(정부) 필수 제출 서류\n한국 국세청(NTS)에서 세금 환급을 승인하려면, '이 사람이 진짜 본인이 맞는지' 확인하기 위해 반드시 신분증 사본을 요구합니다. 저희는 이 필수 서류를 국세청에 대신 내드리는 역할만 할 뿐, 대출이나 휴대폰 개통 등 다른 어떤 목적으로도 절대 사용할 수 없습니다.\n\n3️⃣ 은행급 암호화 보안\n고객님의 모든 정보는 한국의 대형 은행들과 동일한 수준의 강력한 암호화 시스템을 통해 국세청으로만 바로 전송됩니다. \n\n내 소중한 개인정보가 유출될 일은 절대 없으니, 안심하고 안내에 따라 신분증을 촬영해 주세요!")
  },
  {
    title: translate("환급액이 0원이라고 나오는데 왜 그런가요?"),
    content: translate("조회 결과 환급액이 0원으로 나오셨나요? 이는 정상적인 결과일 수 있습니다. 📊\n\n세금 환급은 '내가 낸 세금' 중에서 '돌려받을 자격이 있는 세금'을 돌려받는 것입니다. 만약 과거에 다니던 회사에서 연말정산을 완벽하게 잘 처리해주었거나, 납부한 세금 자체가 적었다면 돌려받을 추가 금액(숨은 세금)이 없을 수 있습니다. \n\n이번에는 환급액이 0원이더라도, 내년이나 이직 후에 다시 조회해 보시면 환급금이 발생할 수 있으니 내년에 Korea Tax Refund Service를 다시 꼭 찾아주세요!")
  },
  {
    title: translate("다른 사람 명의 은행 계좌로 받을 수 있나요?"),
    content: translate("아니요, 절대 불가능합니다! 🚫\n\n금융 사기 및 명의 도용을 방지하기 위해 한국 국세청(NTS)은 '환급을 신청한 본인 이름'과 정확히 일치하는 은행 계좌로만 돈을 입금합니다. \n\n따라서 반드시 환급자 본인 명의로 된 한국 은행 계좌를 입력해 주셔야 하며, 다른 일체의 계좌 번호를 입력하시면 국세청에서 환급금 송금을 거절하게 됩니다.")
  },
  {
    title: translate("이미 한국을 떠났는데 환급받을 수 있나요?"),
    content: translate("네, 조건만 맞으면 가능합니다! ✈️\n\n비록 현재 한국에 없더라도, 아래 두 가지 조건만 충족하신다면 Korea Tax Refund Service를 통해 환급 신청이 가능합니다.\n\n1. 본인 인증 통과: 현재 가입되어 있는 한국 통신사(알뜰폰 포함) 번호를 통해 본인 인증(PASS 문자 등)을 받을 수 있어야 합니다.\n2. 한국 은행 계좌 유지: 환급금을 입금받을 수 있는 본인 명의의 '한국 은행 계좌'가 아직 정지되지 않고 열려 있어야 합니다.\n\n위 두 가지가 가능하시다면 타국에서도 문제없이 앱을 통해 환급을 신청하실 수 있습니다!")
  }
];

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

function RichCardRenderer({ card, language, currentStep }: { card: NonNullable<ChatMessage['richCard']>; language?: string; currentStep?: number }) {
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
        <div className="mt-2.5 p-4 rounded-2xl bg-gradient-to-br from-[#0e213a] to-[#050f1b] border border-emerald-500/20 shadow-md text-slate-100 flex flex-col items-center gap-2 max-w-full font-bold">
          <img
            src="/certified_security_seal_premium_1774150786685.png"
            alt="보안 인증 씰"
            className="w-28 h-28 object-contain"
          />
          <span className="text-emerald-400 text-xs font-bold text-center">{title || "개인정보 보호 및 보안 인증"}</span>
          <p className="text-[10px] text-slate-300 font-medium leading-relaxed text-center">
            {description || "고객님의 모든 정보는 시중 은행과 동일한 수준의 최고급 256-bit SSL 암호화 처리 후 국세청 연동 즉시 자동 파기됩니다."}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 text-[9px]">
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
    case 'guide': {
      const simStep = currentStep ?? 0;
      return (
        <div className="mt-2.5 p-3.5 bg-gradient-to-br from-[#0f2442] to-[#071324] border border-[#e2b659]/50 rounded-2xl animate-in fade-in duration-300 overflow-hidden shadow-lg space-y-2.5 text-left font-bold">
          <div className="flex items-center gap-2 text-[#e2b659] text-xs font-black">
            <Sparkles className="w-4 h-4 text-[#e2b659] shrink-0" />
            <span>{title || `Step ${simStep} 맞춤 안내`}</span>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
            💡 {description || "환급 단계에서 어느 부분을 눌러야 하는지 보여주는 가상 화면입니다."}
          </p>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-step-guide", { detail: { step: simStep } }));
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-[#e2b659] to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <span>🎬 Step {simStep} 시뮬레이션 가이드 보기</span>
          </button>
        </div>
      );
    }
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
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Live Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 🚨 실시간 단계값 동기화 및 Stuck 감지 자동 사운드 개입 연동
  const [currentStep, setCurrentStep] = useState(0);

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

  // Initial welcome message in live chat
  useEffect(() => {
    if (viewMode === "live_chat" && messages.length === 0 && !isLoadingHistory && hasCheckedHistory) {
      const getWelcomeMessage = () => {
        switch (language) {
          case "vi": return "Xin chào! Tôi là Kim Jun-hyun, Quản lý chính thức. 👋 Tôi có thể giúp gì cho bạn về hoàn thuế thu nhập?";
          case "zh": return "您好！我是官方经理金俊贤。👋 请问有什么关于所得税退税的问题我可以帮您？";
          case "id": return "Halo! Saya Kim Jun-hyun, Manajer Resmi. 👋 Ada yang bisa saya bantu terkait pengembalian pajak Anda?";
          case "uz": return "Salom! Men Rasmiy menejer Kim Jun-hyunman. 👋 Daromad solig'ini qaytarish bo'yicha qanday yordam bera olaman?";
          case "th": return "สวัสดีครับ! ผมคือผู้จัดการอย่างเป็นทางการ คิม จุนฮยอน 👋 มีอะไรให้ผมช่วยเหลือเกี่ยวกับภาษีเงินได้ไหมครับ?";
          case "km": return "សួស្តី! ខ្ញុំគឺ គីម ជុនហ្យុន អ្នកគ្រប់គ្រងផ្លូវការ។ 👋 តើខ្ញុំអាចជួយអ្វីអ្នកបានខ្លះអំពីការបង្វិលពន្ធ?";
          case "my": return "မင်္ဂလာပါ။ ကျွန်တော်က တရားဝင်မန်နေဂျာ Kim Jun-hyun ပါ။ 👋 အခွန်ပြန်အမ်းငွေနှင့် ပတ်သက်၍ ဘာကူညီပေးရမလဲ။";
          case "ne": return "नमस्कार! म आधिकारिक प्रबन्धक किम जुन-ह्युन हुँ। 👋 कर फिर्ता सम्बन्धी केही सोध्नु छ?";
          case "mn": return "Сайн байна уу! Би албан ёсны менежер Ким Жүн-хён байна. 👋 Татварын буцаан олголтын талаар юу асуумаар байна?";
          case "bn": return "হ্যালো! আমি অফিসিয়াল ম্যানেজার কিম জুন-হিউন। 👋 কর ফেরত সম্পর্কে কীভাবে সাহায্য করতে পারি?";
          case "kk": return "Сәлеметсіз бе! Мен ресми менеджер Ким Джун Хенмін. 👋 Салықты қайтару бойынша қалай көмектесе аламын?";
          case "si": return "ආයුබෝවන්! මම නිල කළමනාකරු කිම් ජුන්-හ්යුන්. 👋 බදු ආපසු ගෙවීම ගැන ඔබට කෙසේ උපකාර කළ හැකිද?";
          case "ur": return "ہیلو! میں آفیشل مینیجر کم جون ہیون ہوں۔ 👋 ٹیکس ریفنڈ کے بارے میں میں آپ کی کیا مدد کر سکتا ہوں؟";
          case "en": return "Hello! I'm Official Manager Kim Jun-hyun. 👋 How can I assist you with your tax refund query today?";
          default: return "안녕하세요! 김준현 공식 매니저입니다. 👋 환급금 조회, 본인 인증, 수수료 등 궁금하신 점을 편하게 모국어로 물어보세요!";
        }
      };

      const getCardMessage = () => {
        switch (language) {
          case "vi": return "Đây là danh thiếp chính thức của tôi. Hãy lưu lại để liên hệ nhé! 🛡️";
          case "zh": return "这是我的官方名片。请保存以备参考！🛡️";
          case "id": return "Ini kartu nama resmi saya. Silakan simpan untuk referensi Anda! 🛡️";
          case "uz": return "Bu mening rasmiy tashrif qog'ozim. Malumot uchun saqlab qo'ying! 🛡️";
          case "th": return "นี่คือนามบัตรอย่างเป็นทางการของผม โปรดบันทึกไว้เพื่ออ้างอิงครับ! 🛡️";
          case "km": return "នេះគឺជាកាតអាជីវកម្មផ្លូវការរបស់ខ្ញុំ។ សូមរក្សាទុកវាសម្រាប់ជាឯកសារយោង! 🛡️";
          case "my": return "ဒါကတော့ ကျွန်ုပ်ရဲ့ တရားဝင် မိတ်ဆက်ကတ်ပြား ဖြစ်ပါတယ်။ ကိုးကားရန် သိမ်းဆည်းထားပါ! 🛡️";
          case "ne": return "यो मेरो आधिकारिक व्यापार कार्ड हो। कृपया सन्दर्भको लागि बचत गर्नुहोस्! 🛡️";
          case "mn": return "Энэ бол миний албан ёсны нэрийн хуудас юм. Хадгалж авна уу! 🛡️";
          case "bn": return "এটি আমার অফিসিয়াল বিজনেস কার্ড। অনুগ্রহ করে রেফারেন্সের জন্য সংরক্ষণ করুন! 🛡️";
          case "kk": return "Бұл менің ресми визиткам. Сілтеме үшін сақтап қойыңыз! 🛡️";
          case "si": return "මෙය මගේ නිල ව්‍යාපාරික කාඩ්පතයි. කරුණාකර එය සුරැකීමට තබන්න! 🛡️";
          case "ur": return "یہ میرا آفیشل بزنس کارڈ ہے۔ براہ کرم حوالہ کے لیے محفوظ کر لیں! 🛡️";
          case "en": return "Here is my official business card. Please save it for reference! 🛡️";
          default: return "제 모바일 명함입니다. 신뢰할 수 있는 공식 매니저이니 언제든 안심하고 문의해 주세요! 🛡️";
        }
      };

      setMessages([
        {
          id: "welcome-1",
          sender: "manager",
          text: getWelcomeMessage(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: "welcome-card",
          sender: "manager",
          imageUrl: "/kim_junhyun_card.png",
          text: getCardMessage(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [viewMode, language]);

  // Load previous messages from Supabase
  useEffect(() => {
    if (viewMode !== "live_chat" || !chatId) {
      if (viewMode !== "live_chat") {
        setHasCheckedHistory(false);
      }
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
          .eq("external_chat_id", chatId)
          .maybeSingle();

        if (chatSession) {
          const { data: dbMessages } = await supabase
            .from("support_messages")
            .select("*")
            .eq("chat_id", chatSession.id)
            .order("created_at", { ascending: true });

          if (isMounted && dbMessages && dbMessages.length > 0) {
            const mapped = dbMessages.map((msg) => {
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
                m.text.includes("모바일 명함")
            );

            if (hasWelcomeAlready) {
              setMessages(mapped);
            } else {
              const dummyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const welcomeText = translate("안녕하세요! 김준현 공식 매니저입니다. 👋 환급금 조회, 본인 인증, 수수료 등 궁금하신 점을 편하게 모국어로 물어보세요!");
              const cardText = translate("제 모바일 명함입니다. 신뢰할 수 있는 공식 매니저이니 언제든 안심하고 문의해 주세요! 🛡️");

              const welcomeMsgs: ChatMessage[] = [
                {
                  id: "welcome-1",
                  sender: "manager",
                  text: welcomeText,
                  timestamp: dummyTimestamp,
                },
                {
                  id: "welcome-card",
                  sender: "manager",
                  imageUrl: "/kim_junhyun_card.png",
                  text: cardText,
                  timestamp: dummyTimestamp,
                }
              ];
              setMessages([...welcomeMsgs, ...mapped]);
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
  }, [viewMode, chatId, language]);

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
          currentStep: typeof forcedStep === 'number' ? forcedStep : currentStep
        }),
      });

      const data = await res.json();
      setIsSending(false); // Hide main loading spinner
      
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
      const stuckStep = customEvent.detail?.step ?? currentStep;
      console.log(`[FloatingAiChat] Stuck detected at step: ${stuckStep}.`);

      // 🚨 [필수 방어] 단순 인사/탐색/메인 단계(step 0 이하)에서는 STUCK 구출 메시지를 보내지 않습니다.
      if (stuckStep <= 0) {
        console.log(`[FloatingAiChat] Suppressing STUCK_HELPER for initial/greeting step (${stuckStep}).`);
        return;
      }

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
    <div className="fixed bottom-[98px] lg:bottom-6 right-3 sm:right-6 z-[200] flex flex-col items-end gap-3 print:hidden max-w-[calc(100vw-24px)]">
      {/* 1. collapsed state: capsule button */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2 group max-w-[280px]">
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

              {/* FAQ or Core Info Display Box */}
              <div className="px-5 pb-3">
                {isEstimatePage ? (
                  <div className="bg-[#081220] border border-[#b88c30]/20 rounded-3xl p-4 shadow-inner text-left">
                    <div className="text-[11px] font-black text-[#b88c30] uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
                      <span>{t('자주 묻는 질문 (FAQ)')}</span>
                      <span className="text-[9px] text-slate-500 font-medium lowercase">click to expand</span>
                    </div>
                    <div className="max-h-[170px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                      {FAQ_ITEMS.map((faq, i) => (
                        <div key={i} className="border-b border-white/5 last:border-0 pb-2 last:pb-0">
                          <button
                            onClick={() => setExpandedFaqIndex(expandedFaqIndex === i ? null : i)}
                            className="w-full flex justify-between items-start text-left py-0.5 hover:text-[#e2b659] transition-colors group"
                          >
                            <span className="text-xs font-black text-slate-200 leading-snug break-keep pr-2 group-hover:text-[#e2b659]">
                              {t(faq.title)}
                            </span>
                            <ChevronRight className={cn(
                              "h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 mt-0.5",
                              expandedFaqIndex === i ? "rotate-90 text-[#b88c30]" : "group-hover:text-[#e2b659]"
                            )} />
                          </button>
                          {expandedFaqIndex === i && (
                            <div className="mt-2 text-[11px] font-bold text-slate-400 bg-white/5 rounded-2xl p-3 leading-relaxed whitespace-pre-wrap break-keep animate-in fade-in slide-in-from-top-1 duration-200">
                              {t(faq.content)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[#e2b659] font-black text-xs sm:text-sm tracking-tight break-keep leading-snug">
                      {translate("외국인 중소 기업 청년 소득세 환급을 도와 드립니다.")}
                    </p>
                  </div>
                )}
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
                          {msg.richCard && <RichCardRenderer card={msg.richCard} language={language} currentStep={currentStep} />}
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
