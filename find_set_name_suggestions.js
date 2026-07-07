const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/app/estimate/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for setNameSuggestions occurrences in Page.tsx...");
lines.forEach((line, index) => {
  if (line.includes('setNameSuggestions')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
