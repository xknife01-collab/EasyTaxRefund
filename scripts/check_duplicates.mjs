import fs from 'fs';
import path from 'path';

const translationsDir = 'src/lib/translations';

function findDuplicates() {
  const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

  files.forEach(file => {
    const filePath = path.join(translationsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract keys by finding "key":
    // Keys can be like "key": or "\"key\"":
    // We'll look for strings that end with ": and are at the start of a line (roughly)
    const lines = content.split('\n');
    const keyCounts = {};
    const duplicates = [];

    lines.forEach((line, index) => {
      // Look for something like   "key": or " \"key\" ":
      const match = line.match(/^\s*"((?:\\.|[^"])+)":/);
      if (match) {
        const key = match[1];
        keyCounts[key] = (keyCounts[key] || 0) + 1;
        if (keyCounts[key] === 2) {
          duplicates.push({ key, line: index + 1 });
        }
      }
    });

    if (duplicates.length > 0) {
      console.log(`Duplicate keys in ${file}:`);
      duplicates.forEach(d => console.log(`  - "${d.key}" at line ${d.line}`));
    }
  });
}

findDuplicates();
