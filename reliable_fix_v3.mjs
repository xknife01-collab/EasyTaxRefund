import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && !f.includes('config') && !f.includes('index'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any end-of-property quote NOT followed by a comma, but followed by another property
  // using a loop to be sure
  let match;
  const regex = /(": ".*")(\s*\n\s*")/g;
  while ((match = regex.exec(content)) !== null) {
     if (!match[1].endsWith(',')) {
         content = content.slice(0, match.index) + match[1].replace(/"$/, '",') + match[2] + content.slice(match.index + match[0].length);
         // Reset regex index to search again from current position
         regex.lastIndex = match.index;
     }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Reliably fixed ${file}`);
});
