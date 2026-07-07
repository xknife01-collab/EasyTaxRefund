const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'easy-tax-refund-main/easy-tax-refund-main/src/app/estimate/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for setResult in estimate page.tsx...");
lines.forEach((line, index) => {
  if (line.includes('setResult')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
