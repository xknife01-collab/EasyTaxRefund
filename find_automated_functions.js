const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/ai/flows/automated-refund-estimate.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for function exports in automated-refund-estimate.ts...");
lines.forEach((line, index) => {
  if (line.includes('export') && line.includes('function')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
