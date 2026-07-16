import fs from 'fs';
const content = fs.readFileSync('src/lib/translations/bn.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('확인했습니다')) {
    console.log(`Line ${i+1}: ${JSON.stringify(line)}`);
  }
});
