import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && (!f.includes('config') && !f.includes('index')));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Convert to lines
  const lines = content.split('\n');
  const fixed = lines.map(line => {
    const trimmed = line.trim();
    // If it looks like a property but doesn't have a comma at the end
    if (trimmed.startsWith('"') && trimmed.includes('": "') && !trimmed.endsWith(',') && !trimmed.endsWith('};') && !trimmed.endsWith('}')) {
      return line + ',';
    }
    return line;
  });

  let finalContent = fixed.join('\n');
  
  // Ensure the very last property before }; does NOT have an extra comma if possible, 
  // but better to have it than a missing one. 
  // Wait, line 489 is followed by line 490: };
  // So line 489 does NOT need a comma.
  // Actually, let's keep it simple. Add commas to ALL properties.
  
  // Strip double commas
  finalContent = finalContent.replace(/,,/g, ',');
  
  fs.writeFileSync(filePath, finalContent);
  console.log(`Cleaned ${file}`);
});
