import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Look for "언어 선택" and see if the precedes character is not a comma
  // We match anything before "언어 선택" that isn't a comma, brace or comment
  // Regex: ([^,{}\n])(\s+)"언어 선택":
  const regex = /([^,{}\n])(\s+)"언어 선택":/g;
  if (regex.test(content)) {
    console.log(`Fixing ${file}`);
    content = content.replace(regex, '$1,$2"언어 선택":');
    fs.writeFileSync(filePath, content);
  }
}
console.log('Finished fixing commas.');
