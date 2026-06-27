import { Language } from '@/lib/translations/config';

export const PERSONAS: Record<Language, {
  name: string;
  nationality: string;
  visa: string;
  phone: string;
  carrier: string;
  bank: string;
  account: string;
  refund: number;
  breakdown: { year: string; amount: number }[];
}> = {
  ko: {
    name: "응우옌반에이",
    nationality: "베트남",
    visa: "E-9 (비전문취업)",
    phone: "010-1234-5678",
    carrier: "SKT",
    bank: "하나은행",
    account: "123-456-789012",
    refund: 3240000,
    breakdown: [
      { year: "2020", amount: 480000 },
      { year: "2021", amount: 620000 },
      { year: "2022", amount: 680000 },
      { year: "2023", amount: 710000 },
      { year: "2024", amount: 750000 }
    ]
  },
  vi: {
    name: "NGUYỄN VĂN A",
    nationality: "Việt Nam",
    visa: "E-9 (Lao động phổ thông)",
    phone: "010-9876-5432",
    carrier: "KT",
    bank: "신한은행",
    account: "110-123-456789",
    refund: 3450000,
    breakdown: [
      { year: "2020", amount: 510000 },
      { year: "2021", amount: 650000 },
      { year: "2022", amount: 720000 },
      { year: "2023", amount: 770000 },
      { year: "2024", amount: 800000 }
    ]
  },
  zh: {
    name: "张伟 (ZHANG WEI)",
    nationality: "中国",
    visa: "E-9 (非专业就业)",
    phone: "010-2345-6789",
    carrier: "LGU+",
    bank: "KB국민은행",
    account: "4567-890-12345",
    refund: 3120000,
    breakdown: [
      { year: "2020", amount: 450000 },
      { year: "2021", amount: 580000 },
      { year: "2022", amount: 650000 },
      { year: "2023", amount: 700000 },
      { year: "2024", amount: 740000 }
    ]
  },
  km: {
    name: "SOK SOPHEAK",
    nationality: "កម្ពុជា",
    visa: "E-9 (ពលករមិនជំនាញ)",
    phone: "010-3456-7890",
    carrier: "SKT 알뜰폰",
    bank: "우리은행",
    account: "1002-123-456789",
    refund: 2950000,
    breakdown: [
      { year: "2020", amount: 400000 },
      { year: "2021", amount: 550000 },
      { year: "2022", amount: 620000 },
      { year: "2023", amount: 680000 },
      { year: "2024", amount: 700000 }
    ]
  },
  ne: {
    name: "RAM BAHADUR",
    nationality: "नेपाल",
    visa: "E-9 (दक्षता नभएका कामدار)",
    phone: "010-4567-8901",
    carrier: "KT 알뜰폰",
    bank: "하나은행",
    account: "321-654-987012",
    refund: 3080000,
    breakdown: [
      { year: "2020", amount: 420000 },
      { year: "2021", amount: 580000 },
      { year: "2022", amount: 640000 },
      { year: "2023", amount: 700000 },
      { year: "2024", amount: 740000 }
    ]
  },
  uz: {
    name: "JASURBEK",
    nationality: "O'zbekiston",
    visa: "E-9 (Maligni bo'lmagan ishchi)",
    phone: "010-5678-9012",
    carrier: "LGU+ 알뜰폰",
    bank: "KB국민은행",
    account: "9876-543-21098",
    refund: 3380000,
    breakdown: [
      { year: "2020", amount: 490000 },
      { year: "2021", amount: 630000 },
      { year: "2022", amount: 700000 },
      { year: "2023", amount: 760000 },
      { year: "2024", amount: 800000 }
    ]
  },
  my: {
    name: "AUNG MIN TUN",
    nationality: "မြန်မာ",
    visa: "E-9 (ကျွမ်းကျင်မှုမလိုသော လုပ်သား)",
    phone: "010-6789-0123",
    carrier: "SKT",
    bank: "IBK기업은행",
    account: "010-6789-01234",
    refund: 2880000,
    breakdown: [
      { year: "2020", amount: 380000 },
      { year: "2021", amount: 520000 },
      { year: "2022", amount: 600000 },
      { year: "2023", amount: 660000 },
      { year: "2024", amount: 720000 }
    ]
  },
  id: {
    name: "BUDI SANTOSO",
    nationality: "Indonesia",
    visa: "E-9 (Pekerja Non-Profesional)",
    phone: "010-7890-1234",
    carrier: "KT",
    bank: "신한은행",
    account: "123-456-789012",
    refund: 3150000,
    breakdown: [
      { year: "2020", amount: 460000 },
      { year: "2021", amount: 590000 },
      { year: "2022", amount: 660000 },
      { year: "2023", amount: 710000 },
      { year: "2024", amount: 730000 }
    ]
  },
  th: {
    name: "สมชาย แซ่ตั้ง",
    nationality: "ไทย",
    visa: "E-9 (แรงงานทั่วไป)",
    phone: "010-8901-2345",
    carrier: "LGU+",
    bank: "하나은행",
    account: "584-910-234567",
    refund: 3290000,
    breakdown: [
      { year: "2020", amount: 480000 },
      { year: "2021", amount: 620000 },
      { year: "2022", amount: 690000 },
      { year: "2023", amount: 730000 },
      { year: "2024", amount: 770000 }
    ]
  },
  en: {
    name: "JOHN CARTER",
    nationality: "Philippines",
    visa: "E-7 (Specialized Foreign Worker)",
    phone: "010-9012-3456",
    carrier: "SKT",
    bank: "하나은행",
    account: "123-456-789012",
    refund: 3500000,
    breakdown: [
      { year: "2020", amount: 500000 },
      { year: "2021", amount: 680000 },
      { year: "2022", amount: 730000 },
      { year: "2023", amount: 770000 },
      { year: "2024", amount: 820000 }
    ]
  },
  si: {
    name: "PRIYANTHA",
    nationality: "ශ්‍රී ලංකාව",
    visa: "E-9 (නොදන්නා සේවක)",
    phone: "010-9123-4567",
    carrier: "KT 알뜰폰",
    bank: "신한은행",
    account: "110-234-567890",
    refund: 2980000,
    breakdown: [
      { year: "2020", amount: 410000 },
      { year: "2021", amount: 560000 },
      { year: "2022", amount: 630000 },
      { year: "2023", amount: 670000 },
      { year: "2024", amount: 710000 }
    ]
  },
  mn: {
    name: "BAT-ERDENE",
    nationality: "Монгол",
    visa: "E-9 (Мэргэжлийн бус)",
    phone: "010-1234-9876",
    carrier: "LGU+ 알뜰폰",
    bank: "우리은행",
    account: "1002-345-678901",
    refund: 3110000,
    breakdown: [
      { year: "2020", amount: 440000 },
      { year: "2021", amount: 580000 },
      { year: "2022", amount: 650000 },
      { year: "2023", amount: 700000 },
      { year: "2024", amount: 740000 }
    ]
  },
  bn: {
    name: "HOSSAIN",
    nationality: "বাংলাদেশ",
    visa: "E-9 (অদক্ষ কর্মী)",
    phone: "010-2345-8765",
    carrier: "SKT 알뜰폰",
    bank: "KB국민은행",
    account: "123456-01-234567",
    refund: 3040000,
    breakdown: [
      { year: "2020", amount: 430000 },
      { year: "2021", amount: 570000 },
      { year: "2022", amount: 630000 },
      { year: "2023", amount: 690000 },
      { year: "2024", amount: 720000 }
    ]
  },
  kk: {
    name: "ARMAND",
    nationality: "Қазақстан",
    visa: "E-9 (Маман емес)",
    phone: "010-3456-7654",
    carrier: "KT 알뜰폰",
    bank: "우리은행",
    account: "1002-987-654321",
    refund: 3260000,
    breakdown: [
      { year: "2020", amount: 480000 },
      { year: "2021", amount: 620000 },
      { year: "2022", amount: 680000 },
      { year: "2023", amount: 720000 },
      { year: "2024", amount: 760000 }
    ]
  },
  ur: {
    name: "MUHAMMAD ALI",
    nationality: "پاکستان",
    visa: "E-9 (غیر-پیشہ ور)",
    phone: "010-4567-6543",
    carrier: "LGU+ 알뜰폰",
    bank: "신한은행",
    account: "110-987-654321",
    refund: 3190000,
    breakdown: [
      { year: "2020", amount: 460000 },
      { year: "2021", amount: 600000 },
      { year: "2022", amount: 670000 },
      { year: "2023", amount: 710000 },
      { year: "2024", amount: 750000 }
    ]
  }
};
