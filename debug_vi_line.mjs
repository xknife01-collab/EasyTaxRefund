import fs from 'fs';
const content = fs.readFileSync('src/lib/translations/vi.ts', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((line, i) => {
  if (line.includes('Quay lại')) {
    console.log(`Line ${i+1}: ${JSON.stringify(line)}`);
  }
});
