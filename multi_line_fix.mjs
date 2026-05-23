import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace value quote followed by whitespace and next key quote with value quote comma
  const original = content;
  // This version handles newlines in values too
  const regex = /(": "[^"]*")(\s+)(")/gs;
  
  content = content.replace(regex, (match, $1, $2, $3) => {
     if (!$1.endsWith(',')) {
        return $1 + ',' + $2 + $3;
     }
     return match;
  });

  if (content !== original) {
    console.log(`Fixed multiple commas in ${file}`);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Finished final multi-line regex fix.');
