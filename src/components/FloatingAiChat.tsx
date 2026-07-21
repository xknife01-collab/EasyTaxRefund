"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
const translate = (s: string) => s;
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// FAQ Items definition
const FAQ_ITEMS = [
  {
    title: translate("환급은 어떻게 받나요?"),
    content: translate("안녕하세요! 숨은 세금 환급금을 찾아 통장으로 받기까지의 전체 핵심 4단계 과정을 안내해 드릴게요. 🚀\n\n1️⃣ [정부 필수] 신분증 확인 및 번호 입력 (Step 1~3)\n대한민국 국세청(NTS)에서 세금 환급 승인을 위해 법적으로 요구하는 필수 절차입니다. 제출하신 신분증 사진은 본인 확인 즉시 시스템에서 영구 파기(저장 NO!)되며, 금융권 수준의 강력한 암호화 보안 기술로 안전하게 보호되니 안심하고 촬영해 주세요.\n\n2️⃣ [가장 중요] 홈택스 1분 가입 또는 로그인 (Step 4~5)\n한국 국세청(NTS) 전산망과 안전하게 연결하기 위해 홈택스 아이디/비밀번호로 로그인을 완료합니다. (아이디가 없으시면 1분 만에 바로 가입하실 수 있습니다.)\n\n3️⃣ 정확한 환급금 확인 및 후불제 계좌 등록 (Step 6~8)\n최근 5년 동안 한국에서 일하며 더 낸 세금이 얼마인지 즉시 확인합니다. 지금 신청하시는 단계에서는 단 1원도 결제하실 필요가 없습니다 (신청 수수료 0원). 환급금을 안전하게 돌려받으실 본인 명의의 은행 계좌를 등록합니다.\n\n4️⃣ 계약서 서명 및 입금 신청 (Step 9)\n결제 완료 후, 모바일 서명을 통해 정식 세무대리 수임계약서가 투명하고 안전하게 작성되며 환급금을 입금받으실 본인 통장 계좌번호를 입력합니다. 이후 약 1~2개월 뒤 한국 국세청에서 고객님의 통장으로 환급금을 직접 송금해 드립니다.\n\n💬 지금 해야 할 일!\n대화창을 닫고, 화면에 보이는 [로그인] 또는 [회원가입]을 진행해 보세요. 막히는 부분이 있다면 언제든 다시 질문해 주세요!")
  },
  {
    title: translate("홈택스 계정이 꼭 필요한가요?"),
    content: translate("네, 선택이 아닌 필수입니다! 🚨\n\n한국 국세청(NTS)은 개인의 민감한 세금 및 금융 정보를 다루기 때문에, 보안이 가장 강력한 국세청 홈택스 계정 정보가 없으면 그 누구도 고객님의 세금 기록을 열람할 수 없습니다.\n\n홈택스 계정은 국세청 금고를 열어 고객님의 숨은 돈을 확인하는 유일한 '디지털 열쇠'입니다. 🔑\n계정이 없으면 전문 세무사조차도 고객님의 환급금이 얼마인지 확인하거나 환급을 신청할 방법이 전혀 없습니다. \n\n조금 번거로우시더라도, 소중한 내 돈을 안전하게 돌려받기 위한 필수 정부 보안 절차이니 꼭 안내에 따라 1분 회원가입을 완료하거나 로그인을 진행해 주시길 부탁드립니다!")
  },
  {
    title: translate("Korea Tax Refund Service, 믿을 수 있나요?"),
    content: translate("네, 안심하고 이용하셔도 좋습니다! Korea Tax Refund Service를 믿을 수 있는 3가지 확실한 이유를 말씀드릴게요. 🛡️\n\n1️⃣ 100% 한국 국세청(NTS)에서 직접 입금해 드립니다.\n가장 많이 걱정하시는 부분이죠! 저희는 고객님의 환급금에 절대 손대지 않습니다. 신고가 완료되면 환급금은 저희를 거치지 않고, 한국 국세청에서 고객님 본인 명의의 계좌로 직접 송금합니다.\n\n2️⃣ 국가 공인 전문 세무사가 전담합니다.\n모든 환급 절차는 엄격한 자격을 갖춘 대한민국 국가 공인 전문 세무사가 합법적이고 꼼꼼하게 처리합니다.\n\n3️⃣ 철저한 개인정보 보호\n본인 인증과 개인정보는 오직 정부(국세청) 시스템에 세금 환급을 신고하기 위한 목적으로만 사용되며, 철저한 보안 속에 안전하게 보호됩니다.\n\n매년 수많은 외국인 근로자분들이 잘 몰라서 놓치고 있는 '정당하게 돌려받아야 할 내 돈'을 안전하게 찾아드리고 있습니다. 안심하고 화면의 안내에 따라 조회를 시작해 보세요! 👍")
  },
  {
    title: translate("수수료는 왜 내야 하나요?"),
    content: translate("수수료 25%는 고객님의 세금을 꼼꼼하게 다시 계산해서 국세청에 대신 신고해 주는 '전문 세무사'의 정당한 수임료(인건비)입니다. 👨‍💼💼\n\n세금 환급은 단순히 버튼만 누른다고 돈이 나오는 것이 아니라, 과거 5년 치의 복잡한 세금 기록을 세무사가 직접 분석하고 국세청에 신고 서류를 제출해야 하는 까다로운 법적 절차입니다.\n\n💎 신청 시 결제 금액 0원! 100% 후불 결제 원칙\n저희 Korea Tax Refund Service는 '선결제 0원 / 후불제 수수료' 정책을 적용하고 있습니다. 신청 단계에서는 비용이 전혀 청구되지 않으며, 한국 국세청에서 고객님의 통장으로 환급금이 실제로 입금된 것이 확인된 후에만 수수료(25%) 결제가 진행됩니다.\n\n⚠️ 환급 실패 시 수수료 0원 (100% 안심 보장)\n세무사의 최종 검토 결과 환급이 불가능하거나 국세청에서 환급금이 나오지 않는 경우에는 수수료를 단 1원도 청구하지 않습니다. 고객님께는 어떠한 금전적 위험도 없으니 안심하고 신청하셔도 됩니다!")
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
    "Official Manager": translate("공식 매니저"),
    "김준현 공식 매니저": translate("김준현 공식 매니저"),
    "김준현 공식 매니저 상담": translate("김준현 공식 매니저 상담"),
    "외국인 중소 기업 청년 소득세 환급을 도와 드립니다.": translate("외국인 중소 기업 청년 소득세 환급을 도와 드립니다."),
    "대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.": translate("대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다."),
    "카카오톡 실시간 상담": translate("카카오톡 실시간 상담"),
    "왓츠앱 실시간 상담": translate("왓츠앱 실시간 상담"),
    "텔레그램 실시간 상담": translate("텔레그램 실시간 상담"),
    "내 휴대폰에 앱 설치하기": translate("내 휴대폰에 앱 설치하기"),
    "숨기기": translate("숨기기"),
    "in_app_browser_copy_done": translate("링크 복사 완료"),
    "in_app_browser_copy_desc": translate("외부 브라우저(크롬, 사파리 등)에 붙여넣어 설치를 진행해주세요."),
    "app_install_guide_title": translate("앱 설치 안내"),
    "app_install_guide_desc": translate("안드로이드는 크롬 메뉴에서, 아이폰은 공유 버튼을 누르고 '홈 화면에 추가'를 선택해주세요.")
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
  return <FloatingConsultingPanelInner />;
}

function FloatingConsultingPanelInner() {
  const { language, t } = useTranslation();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const isEstimatePage = pathname?.startsWith("/estimate");

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
    <div className="fixed bottom-[84px] lg:bottom-6 right-3 sm:right-6 z-[200] flex flex-col items-end gap-3 print:hidden max-w-[calc(100vw-24px)]">
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
        <div className="w-[340px] max-w-[calc(100vw-24px)] max-h-[calc(100dvh-100px)] lg:max-h-[85vh] bg-[#0f1e36] rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,30,54,0.5)] border border-[#b88c30]/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 z-[200]">
          
          {/* Header */}
          <div className="px-5 sm:px-6 pt-3.5 pb-3 flex items-center justify-between shrink-0 sticky top-0 bg-[#0f1e36] z-20 border-b border-white/10 shadow-md">
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
                className="px-3.5 py-1.5 rounded-full bg-[#b88c30]/25 hover:bg-[#b88c30]/40 text-[#e2b659] font-black text-[11px] transition-all border border-[#b88c30]/50 shadow-sm active:scale-95 cursor-pointer"
              >
                {translate("숨기기")}
              </button>
              {/* Close (X) button */}
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/20 shadow-sm active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Profile headshot section */}
            <div className="flex flex-col items-center pt-2 sm:pt-3 pb-2 sm:pb-4 px-4 sm:px-6 text-center">
              {/* Double Ring Avatar */}
              <div className="relative mb-3.5">
                <div className="absolute -inset-1 rounded-full border-2 border-[#b88c30]/20" />
                <div className="absolute -inset-2 rounded-full border border-[#b88c30]/10" />
                <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-[#b88c30] relative bg-slate-800 shadow-xl">
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
                Official Center 010-5864-8577
              </p>
            </div>

          {/* FAQ or Core Info Display Box */}
          <div className="px-6 pb-4">
            {isEstimatePage ? (
              <div className="bg-[#081220] border border-[#b88c30]/20 rounded-3xl p-4 shadow-inner text-left">
                <div className="text-[11px] font-black text-[#b88c30] uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
                  <span>{t('자주 묻는 질문 (FAQ)')}</span>
                  <span className="text-[9px] text-slate-500 font-medium lowercase">click to expand</span>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
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
              <div className="bg-[#081220] border border-white/5 rounded-3xl p-4.5 text-center space-y-2.5 shadow-inner">
                <p className="text-[#e2b659] font-black text-sm tracking-tight break-keep leading-snug">
                  {translate("외국인 중소 기업 청년 소득세 환급을 도와 드립니다.")}
                </p>
                <p className="text-slate-400 font-bold text-[11px] leading-relaxed break-keep">
                  {translate("대한민국 중소기업에 근무하는 외국인 근로자의 숨은 환급금을 0.1초 만에 조회하고, 최대 90% 소득세 감면 혜택을 안전하게 환급받으실 수 있도록 끝까지 도와드립니다.")}
                </p>
              </div>
            )}
          </div>

          {/* Social Consulting Links */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col gap-1.5 sm:gap-2.5">
            {/* KakaoTalk */}
            <a
              href="https://pf.kakao.com/_xxx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-2.5 bg-[#FEE500] hover:bg-[#FEE500]/95 text-[#0f1e36] font-black rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 px-3.5 sm:px-4 shadow-[0_4px_12px_rgba(254,229,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
            >
              <img src="/Kakao Talk.png" alt="KakaoTalk" className="h-5 w-5 object-contain shrink-0" />
              <span>{translate("카카오톡 실시간 상담")}</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/821058648577"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-2.5 bg-[#25D366] hover:bg-[#25D366]/95 text-white font-black rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 px-3.5 sm:px-4 shadow-[0_4px_12px_rgba(37,211,102,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
            >
              <img src="/WhatsApp.png" alt="WhatsApp" className="h-5 w-5 object-contain shrink-0" />
              <span>{translate("왓츠앱 실시간 상담")}</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/ktrs_support_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-2.5 bg-[#0088cc] hover:bg-[#0088cc]/95 text-white font-black rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 px-3.5 sm:px-4 shadow-[0_4px_12px_rgba(0,136,204,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
            >
              <img src="/Telegram.png" alt="Telegram" className="h-5 w-5 object-contain shrink-0" />
              <span>{translate("텔레그램 실시간 상담")}</span>
            </a>

            {/* App Install */}
            <button
              onClick={handleInstallApp}
              className="flex items-center justify-center gap-2 sm:gap-2.5 bg-[#FF4E00] hover:bg-[#FF4E00]/95 text-white font-black rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 px-3.5 sm:px-4 shadow-[0_4px_12px_rgba(255,78,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm"
            >
              <span className="text-base leading-none">📱</span>
              <span>{translate("내 휴대폰에 앱 설치하기")}</span>
            </button>
          </div>

          </div>
        </div>
      )}
    </div>
  );
}
