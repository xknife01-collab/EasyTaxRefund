import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations/bn.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find a known key and its value, and print its characters one by one
const searchKey = '서류 보완 필요';
const idx = content.indexOf(searchKey);
if (idx !== -1) {
  const slice = content.substring(idx, idx + 100);
  console.log(`Found [${searchKey}] at ${idx}`);
  console.log(`Slice: [${slice}]`);
  for (let i = 0; i < slice.length; i++) {
     console.log(`${i}: ${slice[i]} (code: ${slice.charCodeAt(i)})`);
  }
}
