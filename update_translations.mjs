import fs from 'fs';
import path from 'path';

const translations = {
  'vi.ts': 'Chọn ngôn ngữ',
  'zh.ts': '选择语言',
  'id.ts': 'Pilih Bahasa',
  'uz.ts': 'Tilni tanlash',
  'th.ts': 'เลือกภาษา',
  'bn.ts': 'ভাষা নির্বাচন করুন',
  'kk.ts': 'Тілді таңдау',
  'km.ts': 'ជ្រើសរើសភាសា',
  'mn.ts': 'Хэл сонгох',
  'my.ts': 'ဘာသာစကား ရွေးချယ်ပါ',
  'ne.ts': 'भाषा चयन गर्नुहोस्',
  'si.ts': 'භාෂාව තෝරන්න',
  'ur.ts': 'زبان کا انتخاب'
};

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';

for (const [file, translation] of Object.entries(translations)) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it already has the key to avoid duplication
  if (content.includes('"언어 선택"') || content.includes("'언어 선택'")) {
    console.log(`Skipping ${file}: key already exists`);
    continue;
  }

  // Find the last closing brace and insert before it
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex !== -1) {
    const updatedContent = content.slice(0, lastBraceIndex) + `  "언어 선택": "${translation}",\n` + content.slice(lastBraceIndex);
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Error: Could not find closing brace in ${file}`);
  }
}
