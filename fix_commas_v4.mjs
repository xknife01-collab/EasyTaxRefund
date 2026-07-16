import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Clean up if we messed up earlier
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/([^,])\s*,\s*"언어 선택":/g, '$1,\n  "언어 선택":');

  // If there's a comma at the start of the line, fix it
  content = content.replace(/\n\s*,\s*"언어 선택":/g, ',\n  "언어 선택":');
  
  fs.writeFileSync(filePath, content);
}
console.log('Finished fixing commas.');
