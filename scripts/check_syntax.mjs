import fs from 'fs';
import path from 'path';

const translationsDir = 'src/lib/translations';

async function checkSyntax() {
  const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

  for (const file of files) {
    const filePath = path.join(translationsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Simplistic check: find the object part
    const match = content.match(/export const \w+ = (\{[\s\S]+\});/);
    if (!match) {
        console.log(`Could not find export object in ${file}`);
        continue;
    }

    const objStr = match[1];
    
    try {
        // Try to evaluate the object string (very dangerous but okay for local check on known files)
        // We'll use a safer approach: just check if it ends with }; and has some structure
        if (!objStr.endsWith('}')) {
             console.log(`File ${file} seems truncated or missing closing brace.`);
        }
    } catch (e) {
        console.log(`Syntax error potentially in ${file}: ${e.message}`);
    }
  }
}

checkSyntax();
