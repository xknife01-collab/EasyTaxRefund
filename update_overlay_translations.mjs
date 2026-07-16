import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';

const newKeys = {
  vi: { "영어 이름 (English Name)": "Tên tiếng Anh (English Name)", "확인됨": "Đã xác minh" },
  zh: { "영어 이름 (English Name)": "英语姓名 (English Name)", "확인됨": "已确认" },
  id: { "영어 이름 (English Name)": "Nama Inggris (English Name)", "확인됨": "Terverifikasi" },
  th: { "영어 이름 (English Name)": "ชื่อภาษาอังกฤษ (English Name)", "확인됨": "ตรวจสอบแล้ว" },
  uz: { "영어 이름 (English Name)": "Inglizcha ism (English Name)", "확인됨": "Tasdiqlangan" },
  mn: { "영어 이름 (English Name)": "Англи нэр (English Name)", "확인됨": "Баталгаажсан" },
  ne: { "영어 이름 (English Name)": "अंग्रेजी नाम (English Name)", "확인됨": "प्रमाणित" },
  km: { "영어 이름 (English Name)": "ឈ្មោះជាភាសាអង់គ្លេស (English Name)", "확인됨": "បានបញ្ជាក់" },
  bn: { "영어 이름 (English Name)": "ইংরেজি নাম (English Name)", "확인됨": "ভেরিফাই করা হয়েছে" },
  my: { "영어 이름 (English Name)": "အင်္ဂလိပ်အမည် (English Name)", "확인됨": "အတည်ပြုပြီး" },
  kk: { "영어 이름 (English Name)": "Ағылшынша есімі (English Name)", "확인됨": "Расталған" },
  ur: { "영어 이름 (English Name)": "انگریزی نام (English Name)", "확인됨": "تصدیق شدہ" },
  si: { "영어 이름 (English Name)": "ඉංග්‍රීසි නම (English Name)", "확인됨": "තහවුරු කරන ලදී" }
};

Object.entries(newKeys).forEach(([lang, values]) => {
  const filePath = path.join(translationsDir, `${lang}.ts`);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if keys already exist to avoid duplicates
    let updated = false;
    Object.entries(values).forEach(([key, val]) => {
      if (!content.includes(`"${key}":`)) {
        content = content.replace(/};?\s*$/, `  "${key}": "${val}",\n};`);
        updated = true;
      }
    });

    if (updated) {
      // Clean up potential double commas or trailing commas before };
      content = content.replace(/,\s*,\s*}/g, ', }').replace(/,\s*}/g, '\n};');
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${lang}.ts`);
    } else {
      console.log(`${lang}.ts already has the keys.`);
    }
  }
});
