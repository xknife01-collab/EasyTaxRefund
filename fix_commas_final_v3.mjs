import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Any line that has a "quote" value end followed by a "quote" key start on the next line
  // We match (": [anything but newline and quote] " [optional spaces] [newline] [optional spaces] " [anything but newline and quote] " : )
  
  const original = content;
  // A more robust regex that allows for spaces and newlines
  const regex = /(": "[^"\n\r]*")([\s\r\n]+)("[^"\n\r]*"\s*:)/g;
  
  let newContent = content;
  for (let i = 0; i < 5; i++) {
     newContent = newContent.replace(regex, (match, $1, $2, $3) => {
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
console.log('Finished final regex comma fix.');
