import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Use a regex that adds comma to any line that ends with "quote" and follows with another key
  // We want to match: "key": "value" \n \s* "nextKey":
  // and replace with: "key": "value", \n \s* "nextKey":
  
  // Regex explanation: matching a value quote, then optional carriage return, then newline, then whitespace, then a quote (start of next key)
  const regex = /("[^"]*")(\s+)("[^"]*"\s*:)/g;
  
  // We iterate until no more replacements are possible
  let changed = false;
  let newContent = content;
  while (regex.test(newContent)) {
     newContent = newContent.replace(regex, (match, $1, $2, $3) => {
        // Only add comma if $1 doesn't have it
        if (!$1.endsWith(',')) {
           return $1 + ',' + $2 + $3;
        }
        return match;
     });
     // avoid infinite loop
     if (newContent === content) break;
     content = newContent;
     changed = true;
  }
  
  if (changed) {
    console.log(`Fixed commas in ${file}`);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Finished final comma fix.');
