import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations/bn.ts';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split(/\r?\n/);
let lastLineIdx = lines.length - 1;
while(lastLineIdx >= 0 && lines[lastLineIdx].trim() !== '};') lastLineIdx--;

if (lastLineIdx > 0) {
  let prevLine = lines[lastLineIdx - 1];
  console.log(`Prev line: [${prevLine}]`);
  console.log(`Length: ${prevLine.length}`);
  console.log(`Trimmed last char code: ${prevLine.trim().charCodeAt(prevLine.trim().length - 1)}`);
}
