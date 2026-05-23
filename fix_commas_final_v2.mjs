import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // This regex matches: ": "value" follow by newline/spaces and "nextKey":
  // and checks if there's NO comma after "value".
  
  const original = content;
  content = content.replace(/(": "[^"]*")(\s+)("[^"]*"\s*:)/g, (match, $1, $2, $3) => {
     if (!$1.endsWith(',')) {
        return $1 + ',' + $2 + $3;
     }
     return match;
  });
  
  if (content !== original) {
    console.log(`Fixed commas in ${file}`);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Finished final comma fix v2.');
