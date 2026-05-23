import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Use regex to find "언어 선택" and the line before it if it lacks a comma
  // We want to match: (any key: value [no comma]) \n (space) "언어 선택"
  // But regex on multi-line is tricky.
  
  // Simple check: if we have '": "something"' followed by \n and "언어 선택", and no comma in between
  // Example: ": \"নথিপত্র প্রয়োজন\"\n  \"언어 선택\""
  
  const regex = /(": "[^"]+")(\s+)"언어 선택":/g;
  if (regex.test(content)) {
    console.log(`Fixing ${file} using regex`);
    content = content.replace(regex, '$1,$2"언어 선택":');
    fs.writeFileSync(filePath, content);
  } else {
    // try with single quotes
    const regex2 = /(': '[^']+')(\s+)"언어 선택":/g;
    if (regex2.test(content)) {
       console.log(`Fixing ${file} using regex (single quotes)`);
       content = content.replace(regex2, '$1,$2"언어 선택":');
       fs.writeFileSync(filePath, content);
    }
  }
}
console.log('Finished fixing commas.');
