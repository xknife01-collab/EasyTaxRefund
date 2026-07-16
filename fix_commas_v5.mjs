import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove any trailing punctuation except quotes at the end of key-value lines
  // content = content.replace(/(?<=: "[^"]*)"\s*,?\s*\n/g, '",\n'); // This is a bit risky

  // 2. Simple way: find lines that look like a property and make sure they have a comma
  const lines = content.split('\n');
  const fixedLines = lines.map((line, i) => {
    let trimmed = line.trim();
    if (trimmed.startsWith('"') && trimmed.includes('": "') && !trimmed.endsWith(',') && !trimmed.endsWith('},') && !trimmed.endsWith('};')) {
      // Check if next line is a property or the closing brace
      return line + ',';
    }
    return line;
  });

  content = fixedLines.join('\n');
  
  // 3. Remove comma from the very last property before };
  content = content.replace(/,\s*\n\s*};/g, '\n};');
  // Or actually, just ensure there's NO comma before }; for cleaner look, but we need it between properties.
  // Wait, line 489: "확인됨": "Đã xác minh" is followed by }; so it doesn't need a comma.
  // Line 488: "영어 이름 (English Name)": "Tên tiếng Anh (English Name)" IS followed by a property, so it NEEDS a comma.

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
