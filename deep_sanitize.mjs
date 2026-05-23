import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the object name
  const match = content.match(/export const (\w+) =/);
  if (!match) continue;
  const objectName = match[1];
  
  // Clean up content to make it evaluatable
  // Remove 'export const name = ' and the final ';'
  let objectContent = content.substring(content.indexOf('{'));
  if (objectContent.endsWith(';')) objectContent = objectContent.slice(0, -1);
  if (objectContent.endsWith('\n')) objectContent = objectContent.trimEnd();
  if (objectContent.endsWith(';')) objectContent = objectContent.slice(0, -1);

  try {
     // A slightly safer eval: wrap in ()
     const obj = new Function('return ' + objectContent)();
     
     // Re-stringify with formatting
     // Note: JSON.stringify uses double quotes for keys, which is good
     const newObjectContent = JSON.stringify(obj, null, 2);
     const newContent = `export const ${objectName} = ${newObjectContent};\n`;
     
     fs.writeFileSync(filePath, newContent);
     console.log(`Success: Re-formatted ${file}`);
  } catch (e) {
     console.log(`Failed to parse ${file}: ${e.message}`);
     
     // If it failed to parse, it means there is a syntax error.
     // We must fix it manually.
     // I'll try to add commas to every line that looks like a key-value pair and write it back.
     
     const lines = objectContent.split(/\r?\n/);
     for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.includes(':') && !line.endsWith(',') && !line.endsWith('{') && !line.endsWith('}')) {
           lines[i] = lines[i] + ',';
        }
     }
     const fixedContent = `export const ${objectName} = ${lines.join('\n')};\n`;
     fs.writeFileSync(filePath, fixedContent);
     console.log(`Fallback: Fixed commas in ${file}`);
  }
}
console.log('Finished deep sanitization.');
