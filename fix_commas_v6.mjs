import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].trim();
    if (currentLine.startsWith('"') && currentLine.includes(':') && currentLine.endsWith('"')) {
      // Look ahead for the next non-comment line starting with "
      let nextIndex = i + 1;
      while (nextIndex < lines.length && (lines[nextIndex].trim() === '' || lines[nextIndex].trim().startsWith('//'))) {
        nextIndex++;
      }
      if (nextIndex < lines.length && lines[nextIndex].trim().startsWith('"')) {
        console.log(`Adding comma to ${file}:${i+1}`);
        lines[i] = lines[i].replace(/"$/, '",');
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Successfully updated ${file}`);
  }
}
console.log('Finished final line-by-line comma fix.');
