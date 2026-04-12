import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Use a simpler approach: just read and try to parse the structure
import fs from 'fs';
import path from 'path';

const translationsDir = 'src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Look for commas at the end of lines inside the object
  const lines = content.split('\n');
  let insideObject = false;
  
  lines.forEach((line, i) => {
    if (line.includes('= {')) insideObject = true;
    if (line.includes('};')) insideObject = false;
    
    if (insideObject && line.trim() && !line.trim().startsWith('//')) {
        // If the line has "key": "val" but NO comma and NO closing brace
        if (line.includes('":') && !line.trim().endsWith(',') && !line.trim().endsWith('{') && !line.trim().endsWith('};') && !line.trim().endsWith('}')) {
             console.log(`Possible missing comma in ${file} at line ${i + 1}: ${line.trim()}`);
        }
    }
  });
});
