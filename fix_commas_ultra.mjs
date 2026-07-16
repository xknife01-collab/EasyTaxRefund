import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';

const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && f !== 'config.ts' && f !== 'index.ts');

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix missing commas between properties
  // Look for lines that end with " or ' but have no comma, and are followed by another property line
  content = content.replace(/(["'])\s*\n\s*(["'])/g, '$1,\n  $2');

  // Fix the trailing }; structure
  content = content.replace(/},\s*};/g, '};').replace(/};?\s*;?\s*$/, '\n};');
  
  // Ensure the last property has a comma too for safety or clean it up
  content = content.replace(/(["'])\s*\n};/g, '$1\n};'); // No comma at the very last line before }; is also fine but let's be consistent
  
  // Actually, standard is trailing comma or not. The error is the missing comma between lines.
  // Let's re-run the logic carefully.
  const lines = content.split('\n');
  const fixedLines = lines.map((line, i) => {
    if (i < lines.length - 1) {
      const trimmedLine = line.trim();
      const nextLine = lines[i+1].trim();
      if (trimmedLine.match(/: ".*"$/) && nextLine.match(/^".*":/)) {
         return line + ',';
      }
    }
    return line;
  });

  content = fixedLines.join('\n');
  
  // Final fix for the double };; or similar
  content = content.replace(/};\s*;?\s*$/, '};');

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
