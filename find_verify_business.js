const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/ai/flows/automated-refund-estimate.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for verifyBusinessAndIndustry...");
lines.forEach((line, index) => {
  if (line.includes('verifyBusinessAndIndustry')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
