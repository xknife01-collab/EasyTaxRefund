const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/app/estimate/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for database mutations...");
lines.forEach((line, index) => {
  if (line.includes('updateDoc') || line.includes('setDoc') || line.includes('addDoc') || line.includes('deleteDoc')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
