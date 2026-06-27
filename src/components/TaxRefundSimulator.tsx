'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  ArrowRight, 
  Lock, 
  Shield, 
  Activity, 
  FileText, 
  Check, 
  HelpCircle, 
  Trophy, 
  CreditCard, 
  Banknote, 
  PenTool,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { useTranslation } from "@/components/LanguageContext";
import { Language } from '@/lib/translations/config';

import { PERSONAS } from '@/lib/personas';
export { PERSONAS };

const enBase = {
  sim_title: "10-Step Real-Time Simulation Showcase",
  sim_desc: "This is not just a mockup slideshow. We reproduce the entire business flow of the actual Easy Tax Refund app, from Step 0 (work info input) to Step 9 (tax agent delegation & electronic signature) with active front-end simulator logic.",
  pause_btn: "Pause",
  play_btn: "Auto Play",
  restart_btn: "Restart",
  step_0: "Eligibility Check (Months/Salary)",
  step_1: "Guideline & Requirements Check",
  step_2: "ARC Information Input",
  step_3: "Mobile Identity Input",
  step_4: "Authentication Choice & Wait",
  step_5: "NTS API Connection & Logic",
  step_6: "AI Refund Precision Report",
  step_7: "Fee (25%) Bank Payout",
  step_8: "Account Info & E-Signature",
  step_9: "Final Application Submission",
  waiting_banner_title: "💡 Direct Selection Pending (Simulation Paused)",
  waiting_banner_desc: "Please click one of the [two options] on the phone screen below! The simulation will resume based on your choice."
};

// 시뮬레이터 내부 단계별 번역 텍스트
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ko: {
    sim_title: "10단계 전과정 실시간 시뮬레이터",
    sim_desc: "단순히 그림을 넘겨보는 더미 애니메이션이 아닙니다. 실제 이지텍스 앱의 0단계 근무 기록 입력부터 9단계 세무사 위임 및 전자 서명 완료까지의 전체 플로우를 실제 작동하는 코드로 고스란히 재현합니다.",
    pause_btn: "일시 정지",
    play_btn: "자동 재생",
    restart_btn: "처음부터",
    step_0: "자격 가조회 (개월수/월급)",
    step_1: "안내 및 준비물 확인",
    step_2: "외국인등록증 정보 입력",
    step_3: "휴대폰 본인 정보 입력",
    step_4: "인증 수단 선택 및 대기",
    step_5: "국세청 API 연동 및 연산",
    step_6: "환급액 정밀 분석 보고서",
    step_7: "수수료(25%) 무통장 입금",
    step_8: "계좌 입력 및 계약 전자서명",
    step_9: "최종 신청 및 접수 완료",
    waiting_banner_title: "💡 직접 선택 대기 중 (시뮬레이션 일시정지)",
    waiting_banner_desc: "가상 핸드폰 화면 속의 [두 가지 선택지] 중 하나를 마우스로 클릭해 주세요! 선택에 따라 각기 다른 시나리오로 데모가 자동 재개됩니다."
  },
  vi: {
    sim_title: "Trình mô phỏng thời gian thực 10 bước",
    sim_desc: "Đây không phải là một hiệu ứng chuyển cảnh giả lập. Chúng tôi tái hiện hoàn chỉnh toàn bộ quy trình từ bước 0 (Nhập thông tin làm việc) đến bước 9 (Ủy quyền đại lý thuế và chữ ký điện tử) bằng mã chạy thực tế của ứng dụng Easy Tax Refund.",
    pause_btn: "Tạm dừng",
    play_btn: "Tự động chạy",
    restart_btn: "Bắt đầu lại",
    step_0: "Kiểm tra điều kiện (Tháng/Lương)",
    step_1: "Hướng dẫn & Chuẩn bị bắt buộc",
    step_2: "Nhập thông tin thẻ người nước ngoài",
    step_3: "Nhập thông tin xác thực điện thoại",
    step_4: "Chọn phương thức xác thực & Chờ",
    step_5: "Liên kết API Cục Thuế & Tính toán",
    step_6: "Báo cáo hoàn thuế chi tiết AI",
    step_7: "Nộp phí dịch vụ (25%)",
    step_8: "Nhập tài khoản & Chữ ký điện tử",
    step_9: "Hoàn tất đăng ký cuối cùng",
    waiting_banner_title: "💡 Đang chờ chọn trực tiếp (Tạm dừng mô phỏng)",
    waiting_banner_desc: "Vui lòng click chọn 1 trong [2 lựa chọn] trên màn hình điện thoại! Trình mô phỏng sẽ tự động tiếp tục theo từng kịch bản tương ứng."
  },
  zh: {
    sim_title: "10步全流程实时模拟器",
    sim_desc: "这并非简单的图片轮播。我们使用Easy Tax Refund应用程序的真实运行代码，完美再现从Step 0（工作记录输入）到Step 9（税务代理委托及电子签名）的全套业务流程。",
    pause_btn: "暂停",
    play_btn: "自动播放",
    restart_btn: "从头开始",
    step_0: "资格快速查询 (月数/工资)",
    step_1: "确认申请前必备事项",
    step_2: "外国人登录证信息输入",
    step_3: "手机实名认证信息输入",
    step_4: "认证方式选择及等待",
    step_5: "联接国税厅API及评估",
    step_6: "AI退税金额精算报告",
    step_7: "支付税务服务费 (25%)",
    step_8: "账户输入及电子签名",
    step_9: "最终申请提交成功",
    waiting_banner_title: "💡 等待手动选择 (模拟已暂停)",
    waiting_banner_desc: "请点击虚拟手机屏幕中的 [两个选项] 之一！模拟将根据选择的场景自动继续播放。"
  },
  en: enBase,
  th: {
    sim_title: "โปรแกรมจำลองเสมือนจริง 10 ขั้นตอน",
    sim_desc: "นี่ไม่ใช่การจำลองภาพแบบธรรมดา แต่รันจากโค้ดจริงเพื่อแสดงกระบวนการตั้งแต่ขั้นตอนที่ 0 (ป้อนข้อมูลทำงาน) ไปจนถึงขั้นตอนที่ 9 (มอบอำนาจตัวแทนภาษีและลงลายมือชื่อ)",
    pause_btn: "หยุดชั่วคราว",
    play_btn: "เล่นอัตโนมัติ",
    restart_btn: "เริ่มใหม่",
    step_0: "ตรวจสอบคุณสมบัติ (เดือน/เงินเดือน)",
    step_1: "แนวทางและรายการเอกสารที่จำเป็น",
    step_2: "ป้อนข้อมูลบัตรต่างด้าว (ARC)",
    step_3: "ป้อนข้อมูลยืนยันตัวตนทางมือถือ",
    step_4: "เลือกช่องทางการยืนยันตัวตนและรอ",
    step_5: "เชื่อมต่อ NTS API และคำนวณ",
    step_6: "รายงานการคำนวณเงินคืนภาษีจาก AI",
    step_7: "ชำระค่าธรรมเนียม (25%) โอนเงินผ่านธนาคาร",
    step_8: "ข้อมูลบัญชีและลงลายมือชื่ออิเล็กทรอนิกส์",
    step_9: "ส่งคำขอสุดท้ายเสร็จสิ้น",
    waiting_banner_title: "💡 รอการตัดสินใจโดยตรง (หยุดการจำลองชั่วคราว)",
    waiting_banner_desc: "โปรดคลิкเลือกหนึ่งใน [สองตัวเลือก] บนหน้าจอมือถือจำลอง! การจำลองจะเริ่มทำงานต่อโดยอัตโนมัติ"
  },
  km: {
    sim_title: "កម្មវិធីពិសោធន៍ជាក់ស្តែង ១០ ជំហាន",
    sim_desc: "នេះមិនមែនជាការបង្ហាញរូបភាពគំរូធម្មតាទេ។ យើងបង្កើតឡើងវិញនូវលំហូរអាជីវកម្មទាំងមូលនៃកម្មវិធី Easy Tax Refund ពិតប្រាកដ ចាប់ពីជំហានទី ០ (បញ្ចូលព័ត៌មានការងារ) ដល់ជំហានទី ៩ (ការផ្ទេរសិទ្ធិភ្នាក់ងារពន្ធ និងហត្ថលេខាអេឡិចត្រូនិច) ជាមួយនឹងតក្កវិជ្ជានៃការពិសោធន៍ពិតប្រាកដ។",
    pause_btn: "ផ្អាក",
    play_btn: "លេងស្វ័យប្រវត្ត",
    restart_btn: "ចាប់ផ្តើមឡើងវិញ",
    step_0: "ពិនិត្យលក្ខណៈសម្បត្តិ (ខែ/ប្រាក់ខែ)",
    step_1: "ណែនាំ និងពិនិត្យតម្រូវការ",
    step_2: "បញ្ចូលព័ត៌មានកាតស្នាក់នៅ (ARC)",
    step_3: "បញ្ចូលព័ត៌មានអត្តសញ្ញាណទូរស័ព្ទ",
    step_4: "ជ្រើសរើសការផ្ទៀងផ្ទាត់ និងរង់ចាំ",
    step_5: "ការភ្ជាប់ NTS API និងការគណនា",
    step_6: "របាយការណ៍ស្វែងរកប្រាក់សំណងដោយ AI",
    step_7: "បង់កម្រៃសេវា (២៥%) តាមធនាគារ",
    step_8: "ព័ត៌មានគណនី និងហត្ថលេខាអេឡិចត្រូនិច",
    step_9: "ការដាក់ពាក្យសុំចុងក្រោយ",
    waiting_banner_title: "💡 កំពុងរង់ចាំការជ្រើសរើសផ្ទាល់ (ផ្អាកការពិសោធន៍)",
    waiting_banner_desc: "សូមចុចលើជម្រើសមួយក្នុងចំណោម [ជម្រើសពីរ] នៅលើអេក្រង់ទូរស័ព្ទខាងក្រោម! ការពិសោធន៍នឹងបន្តឡើងវិញដោយស្វ័យប្រវត្តិ។"
  },
  ne: {
    sim_title: "১০-चरण वास्तविक समय सिम्युलेटर",
    sim_desc: "यो केवल नक्कली स्लाइड शो होइन। हामी वास्तविक Easy Tax Refund एपको सम्पूर्ण व्यवसाय प्रवाह पुन: उत्पादन गर्छौं, चरण ० (काम जानकारी इनपुट) देखि चरण ९ (कर एजेन्ट प्रतिनिधि र इलेक्ट्रोनिक हस्ताक्षर) सम्म।",
    pause_btn: "पज गर्नुहोस्",
    play_btn: "अटो प्ले",
    restart_btn: "पुन: सुरु गर्नुहोस्",
    step_0: "योग्यता जाँच (महिना/तलब)",
    step_1: "निर्देशिका र आवश्यक कागजात जाँच",
    step_2: "विदेशी दर्ता कार्ड (ARC) इनपुट",
    step_3: "मोबाइल पहिचान इनपुट",
    step_4: "प्रमाणीकरण विकल्प र पर्खाइ",
    step_5: "NTS API जडान र गणना",
    step_6: "AI कर फिर्ता रिपोर्ट",
    step_7: "सेवा शुल्क (२५%) बैंक जम्मा",
    step_8: "खाता विवरण र इलेक्ट्रोनिक हस्ताक्षर",
    step_9: "अन्तिम आवेदन दर्ता",
    waiting_banner_title: "💡 प्रत्यक्ष चयन बाँकी छ (सिमुलेशन पज)",
    waiting_banner_desc: "कृपया तलको फोन स्क्रिनमा [दुई विकल्पहरू] मध्ये एकमा क्लिक गर्नुहोस्! सिमुलेशन स्वतः पुन: सुरु हुनेछ।"
  },
  uz: {
    sim_title: "10 bosqichli real vaqt rejimidagi simulyator",
    sim_desc: "Bu shunchaki slayd-shou emas. Biz haqiqiy Easy Tax Refund ilovasining barcha biznes jarayonini, Bosqich 0 (ish ma'lumotlarini kiritish) dan Bosqich 9 (soliq agenti vakilligi va elektron imzo) gacha to'liq qayta tiklaymiz.",
    pause_btn: "Pauza",
    play_btn: "Avtomatik ijro",
    restart_btn: "Boshidan boshlash",
    step_0: "Muvofiqlikni tekshirish (oylar/ish haqi)",
    step_1: "Yo'riqnoma va talablarni tekshirish",
    step_2: "Chet ellik kartasi (ARC) ma'lumotlari",
    step_3: "Telefon orqali shaxsni tasdiqlash",
    step_4: "Tasdiqlash usulini tanlash va kutish",
    step_5: "NTS API ulanishi va hisob-kitob",
    step_6: "AI soliq qaytarish hisoboti",
    step_7: "Xizmat haqi (25%) bank o'tkazmasi",
    step_8: "Hisob raqami va elektron imzo",
    step_9: "Yakuniy ariza topshirish",
    waiting_banner_title: "💡 Tanlov kutilmoqda (Simulyatsiya to'xtatildi)",
    waiting_banner_desc: "Iltimos, telefondagi [ikki variantdan] birini tanlang! Simulyatsiya avtomatik ravishda davom etadi."
  },
  my: {
    sim_title: "၁၀ ဆင့် လက်တွေ့ သရုပ်ပြစနစ်",
    sim_desc: "ဒါဟာ သာမန် slide မဟုတ်ပါ။ Easy Tax Refund အက်ပ်၏ အဆင့် ၀ (အလုပ်အချက်အလက်) မှ အဆင့် ၉ (အခွန်ကိုယ်စားလှယ်လွှဲအပ်ခြင်းနှင့် လက်မှတ်ရေးထိုးခြင်း) အထိ လုပ်ငန်းစဉ်တစ်ခုလုံးကို ကုဒ်အစစ်ဖြင့် ပြသထားခြင်း ဖြစ်သည်။",
    pause_btn: "ခေတ္တရပ်ရန်",
    play_btn: "အလိုအလျောက်ဖွင့်ရန်",
    restart_btn: "အစမှ ပြန်စရန်",
    step_0: "သတ်မှတ်ချက်စစ်ဆေးခြင်း (လ/လစာ)",
    step_1: "လမ်းညွှန်ချက်နှင့် လိုအပ်ချက်များ စစ်ဆေးခြင်း",
    step_2: "နိုင်ငံခြားသားကတ် (ARC) အချက်အလက်ထည့်ရန်",
    step_3: "ဖုန်းဖြင့် ကိုယ်ရေးအချက်အလက်ထည့်ရန်",
    step_4: "အတည်ပြုစနစ်ရွေးချယ်ပြီး စောင့်ဆိုင်းရန်",
    step_5: "NTS API ချိတ်ဆက်တွက်ချက်ခြင်း",
    step_6: "AI အခွန်ပြန်အမ်းငွေ အစီရင်ခံစာ",
    step_7: "ဝန်ဆောင်ခ (၂၅%) ဘဏ်မှပေးချေခြင်း",
    step_8: "ဘဏ်အကောင့်နှင့် အီလက်ထရွန်နစ်လက်မှတ်",
    step_9: "နောက်ဆုံးလျှောက်လွှา တင်သွင်းပြီးစီးမှု",
    waiting_banner_title: "💡 ရွေးချယ်မှု စောင့်ဆိုင်းနေပါသည် (သရုပ်ပြမှုကို ရပ်ထားပါသည်)",
    waiting_banner_desc: "ဖုန်းမျက်နှာပြင်ပေါ်ရှိ [ရွေးချယ်စရာနှစ်ခု] အနက် တစ်ခုကို နှိပ်ပါ။ သရုပ်ပြမှု အလိုအလျောက် ဆက်လက်လည်ပတ်ပါမည်။"
  },
  id: {
    sim_title: "Simulator Real-Time 10 Langkah",
    sim_desc: "Ini bukan sekadar slideshow mockup. Kami mereproduksi seluruh alur bisnis dari aplikasi Easy Tax Refund yang sebenarnya, mulai dari Langkah 0 (input info kerja) hingga Langkah 9 (delegasi agen pajak & tanda tangan elektronik).",
    pause_btn: "Jeda",
    play_btn: "Putar Otomatis",
    restart_btn: "Mulai Ulang",
    step_0: "Pemeriksaan Kelayakan (Bulan/Gaji)",
    step_1: "Panduan & Pemeriksaan Persyaratan",
    step_2: "Input Informasi Kartu ARC",
    step_3: "Input Identitas Seluler",
    step_4: "Pilih Metode Autentikasi & Tunggu",
    step_5: "Koneksi API NTS & Perhitungan",
    step_6: "Laporan Presisi Pengembalian AI",
    step_7: "Pembayaran Layanan (25%) Transfer Bank",
    step_8: "Informasi Rekening & Tanda Tangan Elektronik",
    step_9: "Pengiriman Aplikasi Akhir",
    waiting_banner_title: "💡 Menunggu Pilihan Langsung (Simulasi Dijeda)",
    waiting_banner_desc: "Silakan klik salah satu dari [dua opsi] di layar ponsel! Simulasi akan dilanjutkan secara otomatis."
  },
  si: {
    sim_title: "පියවර 10 ක සජීවී සිමියුලේටරය",
    sim_desc: "මෙය හුදෙක් පින්තූර පෙන්වීමක් නොවේ. Easy Tax Refund යෙදුමේ සැබෑ ක්‍රියාවලිය පියවර 0 සිට පියවර 9 දක්වා සැබෑ කේතයන් මгින් මෙහි නිරූපණය වේ.",
    pause_btn: "නවතන්න",
    play_btn: "ස්වයංක්‍රීයව ධාවනය",
    restart_btn: "මුල සිට ආරම්භ කරන්න",
    step_0: "සුදුසුකම් පරීක්ෂාව (මාස/වැටුප)",
    step_1: "උපදෙས་ සහ අවශ්‍යතා පරීක්ෂාව",
    step_2: "විදේශික කාඩ්පත් (ARC) තොරතුරු ඇතුළත් කිරීම",
    step_3: "දුරකථන අනන්‍යතා තොරතුරු ඇතුළත් කිරීම",
    step_4: "සහතික කිරීමේ ක්‍රමය තේරීම සහ රැඳී සිටීම",
    step_5: "NTS API සම්බන්ධතාවය සහ ගණනය කිරීම්",
    step_6: "AI බදු ආපසු ගෙවීමේ වාර්තාව",
    step_7: "සේවා ගාස්තුව (25%) බැංකු තැන්පතු",
    step_8: "ගිණුම් තොරතුරු සහ විද්‍යුත් අත්සන",
    step_9: "অවසාන අයදුම්පත ඉදිරිපත් කිරීම",
    waiting_banner_title: "💡 තේරීමක් බලාපොරොත්තුවෙන් (සිමියුලේෂනය තාවකාලිකව නවතා ඇත)",
    waiting_banner_desc: "කරුණာකර දුරකථන තිරයේ ඇති [විකල්ප දෙකෙන්] එකක් ක්ලිക് කරන්න! සිමියුලේෂනය ස්වයංක්‍රීයව නැවත ආරම්භ වේ."
  },
  mn: {
    sim_title: "10 алхамт бодит цагийн симулятор",
    sim_desc: "Энэ бол зүгээр нэг зураг харуулах үзүүлбэр биш юм. Easy Tax Refund аппликейшний ажиллагааг Алхам 0-ээс Алхам 9 хүртэл бодит кодоор ажиллуулж харуулж байна.",
    pause_btn: "Түр зогсоох",
    play_btn: "Автоматаар тоглуулах",
    restart_btn: "Эхнээс нь эхлэх",
    step_0: "Боломжийг шалгах (Сар/Цалин)",
    step_1: "Зааварчилгаа болон шаардлага шалгах",
    step_2: "Гадаад иргэний үнэмлэх (ARC) оруулах",
    step_3: "Утасны дугаараар баталгаажуулах",
    step_4: "Баталгаажуулах хэлбэр сонгох, хүлээх",
    step_5: "NTS API холболт болон тооцоолол",
    step_6: "AI Татварын буцаан олголтын тайлан",
    step_7: "Үйлчилгээний хөлс (25%) банкны шилжүүлэг",
    step_8: "Дансны мэдээлэл болон цахим гарын үсэг",
    step_9: "Эцсийн хүсэлт илгээж дуусгах",
    waiting_banner_title: "💡 Сонголт хүлээж байна (Симулятор түр зогссон)",
    waiting_banner_desc: "Утасны дэлгэц дээрх [хоёр сонголт]-ын аль нэгийг дарна уу! Үйл ажиллагаа автоматаар үргэлжлэх болно."
  },
  bn: {
    sim_title: "১০-ধাপের রিয়েল-টাইম সিমুলেটর",
    sim_desc: "এটি কেবল একটি ডামি স্লাইডশো নয়। আমরা ইজি ট্যাক্স রিফান্ড অ্যাপের প্রকৃত কাজের ধাপ ০ (কাজের তথ্য ইনপুট) থেকে ধাপ ৯ (ট্যাক্স এজেন্ট প্রতিনিধিত্ব ও স্বাক্ষর) পর্যন্ত বাস্তব কোড দ্বারা পুনরুৎপাদন করেছি।",
    pause_btn: "থামুন",
    play_btn: "স্বয়ংক্রিয় প্লে",
    restart_btn: "পুনরায় শুরু করুন",
    step_0: "যোগ্যতা যাচাই (মাস/বেতন)",
    step_1: "নির্দেশিকা ও প্রয়োজনীয়তা পরীক্ষা",
    step_2: "বিদেশী নিবন্ধন কার্ড (ARC) তথ্য ইনপুট",
    step_3: "মোবাইল পরিচয় তথ্য ইনপুট",
    step_4: "যাচাইকরণ পদ্ধতি নির্বাচন ও অপেক্ষা",
    step_5: "NTS API সংযোগ ও হিসাব",
    step_6: "AI ট্যাক্স রিফান্ড রিপোর্ট",
    step_7: "পরিষেবা চার্জ (২৫%) ব্যাংক জমা",
    step_8: "অ্যাকাউন্ট তথ্য ও ইলেকট্রনিক স্বাক্ষর",
    step_9: "চূড়ান্ত আবেদন জমা সম্পন্ন",
    waiting_banner_title: "💡 সরাসরি নির্বাচনের অপেক্ষায় (সিমুলেশন স্থগিত)",
    waiting_banner_desc: "দয়া করে ফোনের স্ক্রিনে [দুটি বিকল্পের] যেকোনো একটিতে ক্লিক করুন! সিমুলেশন স্বয়ংক্রিয়ভাবে পুনরায় শুরু হবে।"
  },
  kk: {
    sim_title: "10 қадамдық нақты уақыттағы симулятор",
    sim_desc: "Бұл жай ғана слайд-шоу емес. Біз Easy Tax Refund қосымшасының жұмысын 0-қадамнан 9-қадамға дейін нақты код арқылы толығымен көрсетеміз.",
    pause_btn: "Тоқтату",
    play_btn: "Автоматты ойнату",
    restart_btn: "Қайта бастау",
    step_0: "Сәйкестікті тексеру (айлар/жалақы)",
    step_1: "Нұсқаулық пен талаптарды тексеру",
    step_2: "Шетелдік картасы (ARC) мәліметтері",
    step_3: "Телефон арқылы сәйкестендіру",
    step_4: "Бастапқы растау және күту",
    step_5: "NTS API қосылымы және есептеу",
    step_6: "AI салықты қайтару есептемесі",
    step_7: "Қызмет ақысы (25%) банктік аударым",
    step_8: "Шот деректері және электрондық қолтаңба",
    step_9: "Қорытынды өтінімді жіберу",
    waiting_banner_title: "💡 Таңдау күтілуде (Симуляция тоқтатылды)",
    waiting_banner_desc: "Телефон экранындағы [екі нұсқаның] бірін таңдаңыз! Симуляция автоматты түрде жалғасады."
  },
  ur: {
    sim_title: "10 مراحل پر مشتمل ریئل ٹائم سیمولیٹر",
    sim_desc: "یہ محض کوئی ڈمی سلائیڈ شو نہیں ہے۔ ہم اصل Easy Tax Refund ایپ کے پورے عمل کو مرحلہ 0 (کام کی معلومات) سے مرحلہ 9 (ٹیکس ایجنٹ کی نامزدگی اور دستخط) تک حقیقی کوڈ کے ذریعے دوبارہ پیش کرتے ہیں۔",
    pause_btn: "روکیں",
    play_btn: "خودکار چلائیں",
    restart_btn: "شروع سے",
    step_0: "اہلیت کی جانچ (مہینے/تنخواہ)",
    step_1: "رہنما خطوط اور شرائط کی جانچ",
    step_2: "غیر ملکی کارڈ (ARC) معلومات کا اندراج",
    step_3: "مобائل شناختی معلومات کا اندراج",
    step_4: "تصدیقی طریقہ کار کا انتخاب اور انتظار",
    step_5: "NTS API کنکشن اور حساب کتاب",
    step_6: "AI ٹیکس ریفنڈ رپورٹ",
    step_7: "سروس چارج (25٪) بینک ڈپازٹ",
    step_8: "اکاؤنٹ کی معلومات اور الیکٹرانک دستخط",
    step_9: "حتمی درخواست جمع کروانا",
    waiting_banner_title: "💡 دستی انتخاب کا انتظار ہے (سیمولیشن روک دی گئی ہے)",
    waiting_banner_desc: "براہ کرم فون کی اسکرین پر موجود [دو اختیارات] میں سے کسی ایک پر کلک کریں! سیمولیشن خود بخود دوبارہ شروع ہو جائے گی۔"
  }
};

export default function TaxRefundSimulator() {
  const { language } = useTranslation();
  const [activeStep, setActiveStep] = useState<number | 'done'>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Virtual Pointer States
  const [pointer, setPointer] = useState({ top: '50%', left: '50%', opacity: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [pointerEventsEnabled, setPointerEventsEnabled] = useState(false);

  const tSim = TRANSLATIONS[language] || TRANSLATIONS['en'];

  const selectedPersona = useMemo(() => {
    const langKey = language as Language;
    if (PERSONAS[langKey]) return langKey;
    return 'en';
  }, [language]);

  // Bi-directional message communication: Host listens to Child events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'STEP_CHANGED') {
        const stepNum = data.step;
        if (stepNum === 10) {
          setActiveStep('done');
        } else {
          setActiveStep(stepNum);
        }
      } else if (data.type === 'UPDATE_POINTER') {
        setPointer({ 
          top: data.top, 
          left: data.left, 
          opacity: data.opacity !== undefined ? data.opacity : 1 
        });
        if (data.click) {
          setIsClicking(true);
          setTimeout(() => setIsClicking(false), 200);
        }
      } else if (data.type === 'SET_POINTER_EVENTS') {
        setPointerEventsEnabled(data.enabled);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Hide social proof popups on mount while simulator is shown
    window.dispatchEvent(new CustomEvent("hide-social-proof"));
    return () => {
      window.dispatchEvent(new CustomEvent("show-social-proof"));
    };
  }, []);

  // Post control message helper
  const postControlMessage = (msg: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  };

  // Sync parent playing status to child iframe
  useEffect(() => {
    postControlMessage({ type: 'SET_PLAYING', isPlaying });
  }, [isPlaying]);

  // Handle timeline step jump
  const handleStepJump = (stepNum: number | 'done') => {
    setActiveStep(stepNum);
    const targetStep = stepNum === 'done' ? 10 : stepNum;
    postControlMessage({ type: 'JUMP_STEP', step: targetStep });
  };

  const handleTogglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    postControlMessage({ type: 'SET_PLAYING', isPlaying: nextPlaying });
  };

  const handleRestart = () => {
    setActiveStep(0);
    postControlMessage({ type: 'JUMP_STEP', step: 0 });
    postControlMessage({ type: 'SET_PLAYING', isPlaying: true });
    setIsPlaying(true);
  };

  // Animate Virtual Mouse Pointer based on activeStep
  useEffect(() => {
    // Let the child iframe control the pointer updates via postMessage to ensure perfect sync
    return;
  }, [activeStep]);

  return (
    <section className="w-full py-10 md:py-16 px-4 sm:px-6 md:px-8 bg-slate-950 text-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden mb-12 md:mb-20 max-w-[1600px] mx-auto">
      {/* 웅장한 백그라운드 그라디언트 글로우 */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* 왼쪽: 베젤이 들어간 가상 스마트폰 목업 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none w-full gap-4">
          
          <div className="relative w-full max-w-[385px] h-[680px] sm:h-[780px] bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] p-[8px] sm:p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_0_1px_rgba(255,255,255,0.15)] border-4 border-slate-800 flex flex-col overflow-hidden">
            
            {/* 상단 다이나믹 아일랜드 노치 */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end px-4 gap-1">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              <div className="w-1 h-1 bg-slate-950 rounded-full" />
            </div>

            {/* 상태 표시줄 */}
            <div className="w-full h-8 flex justify-between items-center px-6 pt-1 text-[10px] font-bold text-white/95 z-40 bg-slate-950/60 backdrop-blur-sm">
              <span>12:09</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="flex items-end gap-0.5 h-2">
                  <div className="w-0.5 h-1 bg-white rounded-full" />
                  <div className="w-0.5 h-1.5 bg-white rounded-full" />
                  <div className="w-0.5 h-2 bg-white rounded-full" />
                </div>
                <div className="w-5 h-2.5 border border-white/60 rounded-[3px] p-[1px] flex items-center">
                  <div className="h-full w-4 bg-primary rounded-[1px] animate-pulse" />
                </div>
              </div>
            </div>

            {/* 웹 뷰포트 영역 */}
            <div className="w-full flex-1 bg-white rounded-[2.2rem] overflow-hidden flex flex-col relative text-slate-800 font-sans">
              
              {/* 브라우저 URL 바 */}
              <div className="w-full bg-slate-100 border-b border-slate-200/60 p-2 flex items-center gap-2 z-10 shrink-0">
                <div className="flex gap-1 pl-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-0.5 px-3 text-[9px] text-slate-500 font-medium text-center truncate flex items-center justify-center gap-1">
                  <span className="text-emerald-500">🔒</span> easy-tax-refund.co.kr/estimate
                </div>
              </div>

              {/* 실제 콘텐츠 뷰포트 (아이프레임 연동) */}
              <div className="w-full flex-1 flex flex-col overflow-hidden relative bg-slate-50 text-[11px] text-left">
                <iframe
                  ref={iframeRef}
                  src={`/estimate?simulation=true&persona=${selectedPersona}&lang=${language}`}
                  className="w-full h-full border-0 select-none bg-white"
                  style={{ pointerEvents: pointerEventsEnabled ? 'auto' : 'none' }}
                />

                {/* 가상 마우스 포인터 */}
                <div 
                  className="absolute pointer-events-none z-50 rounded-full flex items-center justify-center transition-all duration-700 ease-in-out"
                  style={{ 
                    top: pointer.top, 
                    left: pointer.left, 
                    opacity: pointer.opacity,
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  {/* 포인터 서클 */}
                  <div className={`w-6 h-6 rounded-full border-2 border-white bg-amber-400/80 shadow-lg flex items-center justify-center transition-transform ${isClicking ? 'scale-75 bg-amber-500' : 'scale-100'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* 오른쪽: 설명 글 및 10단계 시뮬레이터 타임라인 (7 cols) */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-primary" /> Live Code Orchestration
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {tSim.sim_title} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
                실시간 리얼 인터랙티브
              </span>
            </h2>
            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xl break-keep">
              {tSim.sim_desc}
            </p>
          </div>

          {/* 10단계 콤팩트 타임라인 리스트 */}
          <div className="grid grid-cols-2 gap-2 max-w-xl">
            {/* Step 0 */}
            <div 
              onClick={() => handleStepJump(0)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 0 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 0 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>00</div>
              <span className="text-[10px] font-black">{tSim.step_0}</span>
            </div>

            {/* Step 0.5 & 1 */}
            <div 
              onClick={() => handleStepJump(0.5)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                (activeStep === 0.5 || activeStep === 1) ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${(activeStep === 0.5 || activeStep === 1) ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>01</div>
              <span className="text-[10px] font-black">{tSim.step_1}</span>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => handleStepJump(2)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 2 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 2 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>02</div>
              <span className="text-[10px] font-black">{tSim.step_2}</span>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => handleStepJump(3)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 3 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 3 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>03</div>
              <span className="text-[10px] font-black">{tSim.step_3}</span>
            </div>

            {/* Step 4 & 5 */}
            <div 
              onClick={() => handleStepJump(4)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                (activeStep === 4 || activeStep === 5) ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${(activeStep === 4 || activeStep === 5) ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>04</div>
              <span className="text-[10px] font-black">{tSim.step_4}</span>
            </div>

            {/* Step 6 */}
            <div 
              onClick={() => handleStepJump(6)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 6 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 6 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>05</div>
              <span className="text-[10px] font-black">{tSim.step_5}</span>
            </div>

            {/* Step 7 */}
            <div 
              onClick={() => handleStepJump(7)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 7 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 7 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>06</div>
              <span className="text-[10px] font-black">{tSim.step_6}</span>
            </div>

            {/* Step 8 */}
            <div 
              onClick={() => handleStepJump(8)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 8 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 8 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>07</div>
              <span className="text-[10px] font-black">{tSim.step_7}</span>
            </div>

            {/* Step 9 */}
            <div 
              onClick={() => handleStepJump(9)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 9 ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 9 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>08</div>
              <span className="text-[10px] font-black">{tSim.step_8}</span>
            </div>

            {/* Done */}
            <div 
              onClick={() => handleStepJump('done')}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                activeStep === 'done' ? 'bg-primary/10 border-primary/30 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeStep === 'done' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-50'}`}>09</div>
              <span className="text-[10px] font-black">{tSim.step_9}</span>
            </div>
          </div>

          {/* 재생 제어 컨트롤 버튼 */}
          <div className="flex items-center gap-4 border-t border-slate-800 pt-6">
            <button
              onClick={handleTogglePlay}
              className={`px-5 py-3 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                isPlaying 
                  ? 'bg-slate-800 text-white hover:bg-slate-750 border border-slate-700' 
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={12} fill="currentColor" /> {tSim.pause_btn}
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" /> {tSim.play_btn}
                </>
              )}
            </button>
            <button
              onClick={handleRestart}
              className="px-5 py-3 bg-slate-800 border border-slate-700 text-slate-350 hover:text-white hover:bg-slate-750 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw size={12} /> {tSim.restart_btn}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
