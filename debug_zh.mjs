import fs from 'fs';
const content = fs.readFileSync('src/lib/translations/zh.ts', 'utf8');
const index = content.indexOf('"이전": "上一步"');
if (index !== -1) {
  const substr = content.substring(index, index + 50);
  console.log('Substr around index:', JSON.stringify(substr));
  for (let i = 0; i < substr.length; i++) {
    console.log(`${i}: ${substr[i]} (${substr.charCodeAt(i)})`);
  }
}
