import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations/bn.ts';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split(/\r?\n/);
let lastLineIdx = lines.length - 1;
while(lastLineIdx >= 0 && lines[lastLineIdx].trim() === '') lastLineIdx--;

console.log(`Last non-empty line: [${lines[lastLineIdx]}]`);
console.log(`Length: ${lines[lastLineIdx].length}`);
console.log(`Last char code: ${lines[lastLineIdx].charCodeAt(lines[lastLineIdx].length - 1)}`);
