import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && !f.includes('config') && !f.includes('index'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Case 1: property value followed by another property key on next line with missing comma
  // Using a regex that captures the end of a line and check next char
  const lines = content.split('\n');
  const fixedLines = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let nextLine = lines[i+1] ? lines[i+1].trim() : '';
    let trimmedCurrent = line.trim();
    
    if (trimmedCurrent.startsWith('"') && trimmedCurrent.includes('": "') && !trimmedCurrent.endsWith(',') && nextLine.startsWith('"')) {
      fixedLines.push(line.replace(/"\s*$/, '",'));
    } else {
      fixedLines.push(line);
    }
  }

  const finalContent = fixedLines.join('\n');
  fs.writeFileSync(filePath, finalContent);
  console.log(`Reliably fixed ${file}`);
});
