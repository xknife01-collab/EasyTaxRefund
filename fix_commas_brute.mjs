import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Every line that ends with "quote" and is not followed by a comma
  // We match a full line like: "key": "value"
  // and check if the next line starts with a quote.
  
  let lines = content.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length - 1; i++) {
    let line = lines[i].trim();
    if (line.endsWith('"') && !line.endsWith(',') && line.includes(':')) {
       // Check the next line
       let nextIdx = i + 1;
       while (nextIdx < lines.length && lines[nextIdx].trim() === '') nextIdx++;
       if (nextIdx < lines.length && lines[nextIdx].trim().startsWith('"')) {
          console.log(`Fixing ${file}:${i+1}`);
          lines[i] = lines[i] + ',';
          changed = true;
       }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Successfully updated ${file}`);
  }
}
console.log('Brute force fixed.');
