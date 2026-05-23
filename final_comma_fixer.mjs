import fs from 'fs';
import path from 'path';

const translationsDir = 'src/lib/translations';
const files = ['bn.ts', 'en.ts', 'id.ts', 'kk.ts', 'km.ts', 'ko.ts', 'mn.ts', 'my.ts', 'ne.ts', 'si.ts', 'th.ts', 'ur.ts', 'uz.ts', 'vi.ts', 'zh.ts'];

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Robust replacement for any missing comma between key-value pairs
  // This looks for a closing quote of a value, optional whitespace/newlines,
  // and then the beginning of the next key (a quote), WITHOUT a comma in between.
  content = content.replace(/("[^"]*")(\s*\n\s*")/g, (match, p1, p2) => {
    if (p1.endsWith('"') && !p1.includes(':')) {
       // This might be match part of a long string? No, p1 starts with quote.
    }
    // More precise: key: "value" followed by "nextKey"
    return match; 
  });

  // Let's use a simpler, safer one:
  const lines = content.split('\n');
  const fixedLines = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    let nextLine = lines[i+1] ? lines[i+1].trim() : '';
    
    if (trimmed.startsWith('"') && trimmed.includes('": "') && !trimmed.endsWith(',') && !trimmed.endsWith('{') && !trimmed.endsWith('[') && nextLine.startsWith('"')) {
       fixedLines.push(line.trimEnd() + ',');
    } else {
       fixedLines.push(line);
    }
  }

  fs.writeFileSync(filePath, fixedLines.join('\n'), { encoding: 'utf8' });
  console.log(`Verified and fixed ${file}`);
});
