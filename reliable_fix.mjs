import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split(/\r?\n/);
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    let trimmed = lines[i].trim();
    // Match line that starts with " and ends with " and has a :
    if (trimmed.startsWith('"') && trimmed.includes('": "') && trimmed.endsWith('"')) {
       // Check if there is a next line and if it starts with "
       let nextIdx = i + 1;
       while (nextIdx < lines.length && (lines[nextIdx].trim() === '' || lines[nextIdx].trim().startsWith('//'))) {
         nextIdx++;
       }
       
       if (nextIdx < lines.length && lines[nextIdx].trim().startsWith('"')) {
          console.log(`Fixing ${file}:${i+1}`);
          lines[i] = lines[i].trimEnd() + ',';
          changed = true;
       }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Success: Fixed commas in ${file}`);
  }
}
console.log('Finished final reliable fix.');
