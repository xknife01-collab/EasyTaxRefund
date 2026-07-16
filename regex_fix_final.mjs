import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Use a regex that adds comma after value if it's missing
  // Match any line like "key": "value" that's followed by "nextKey":
  const original = content;
  // A very broad regex to match a key:value pair
  const regex = /("[^"]*"\s*:\s*"[^"]*")(\s*\n\s*")/g;
  
  // Apply multiple times to handle consecutive lines
  for (let i = 0; i < 500; i++) {
     let newContent = content.replace(regex, (match, $1, $2, $3) => {
        if (!$1.endsWith(',')) {
           return $1 + ',' + $2 + $3;
        }
        return match;
     });
     if (newContent === content) break;
     content = newContent;
  }

  if (content !== original) {
    console.log(`Fixed commas in ${file}`);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Finished regex final fix.');
