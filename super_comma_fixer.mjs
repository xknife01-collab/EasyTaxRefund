import fs from 'fs';
import path from 'path';

const translationsDir = 'src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let nextLine = lines[i+1] ? lines[i+1].trim() : '';
    
    // If current line ends with a string (key or value) and next line starts with a string
    if (trimmed.endsWith('"') && nextLine.startsWith('"')) {
       // Find the very last double quote in the line and append a comma
       const lastQuoteIdx = line.lastIndexOf('"');
       line = line.substring(0, lastQuoteIdx + 1) + ',' + line.substring(lastQuoteIdx + 1);
    }
    fixedLines.push(line);
  }

  // Also fix potential double commas from multiple runs
  let newContent = fixedLines.join('\n');
  newContent = newContent.replace(/,,/g, ',');

  fs.writeFileSync(filePath, newContent, { encoding: 'utf8' });
  console.log(`Global fix applied to ${file}`);
});
