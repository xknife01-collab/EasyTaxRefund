import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Test if the file itself is a valid JS object if we wrap it
  try {
     // This is loose but we can check if it parses as an object literal if we evaluate the part after =
     const objectLiteral = content.substring(content.indexOf('{'));
     // Evaluate it in a safe way
     new Function('return ' + objectLiteral)();
  } catch (e) {
     console.log(`SYNTAX ERROR in ${file}: ${e.message}`);
     
     // Find where it's broken
     const lines = content.split(/\r?\n/);
     for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.includes(':') && !line.endsWith(',') && !line.endsWith('{') && !line.endsWith('}')) {
           const nextLine = lines[i+1]?.trim();
           if (nextLine && nextLine.includes(':')) {
             console.log(`  Possibly missing comma at line ${i+1}`);
           }
        }
     }
  }
}
console.log('Finished translation file validation.');
