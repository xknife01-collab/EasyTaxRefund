import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find where our new key was added
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"언어 선택":')) {
      // Check the previous line (excluding empty/comment lines and the start of the object)
      let prevIndex = i - 1;
      while (prevIndex >= 0 && (lines[prevIndex].trim() === '' || lines[prevIndex].trim().startsWith('//'))) {
        prevIndex--;
      }
      
      if (prevIndex >= 0 && !lines[prevIndex].trim().endsWith(',') && !lines[prevIndex].trim().endsWith('{')) {
        console.log(`Fixing missing comma in ${file} at ${prevIndex + 1}`);
        lines[prevIndex] = lines[prevIndex].trimEnd() + ',';
      }
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}
console.log('Finished fixing commas.');
