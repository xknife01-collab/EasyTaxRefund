const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/app/estimate/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for handleAutoGenerateAndCheckHometaxId in Page.tsx...");
let start = -1;
lines.forEach((line, index) => {
  if (line.includes('handleAutoGenerateAndCheckHometaxId =')) {
    start = index;
  }
});

if (start !== -1) {
  console.log(`Found starting at line ${start + 1}`);
  for (let i = start; i < start + 60; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log("Not found");
}
