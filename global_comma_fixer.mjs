import fs from 'fs';
import path from 'path';

const translationsDir = 'src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace: " (newline) "  with ", (newline) "
  // and: " (newline) }  with stays same (regex doesn't match)
  content = content.replace(/"(\s*(\r\n|\n)\s*)"/g, '",$1"');

  // Let's also fix double commas if we accidentally added one
  content = content.replace(/,,/g, ',');

  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log(`Global fix applied to ${file}`);
});
