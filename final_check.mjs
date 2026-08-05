import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const koTsPath = path.join(srcDir, 'lib', 'translations', 'ko.ts');

const extractedKeys = new Set();

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath === koTsPath) continue; 
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // t('key') or t("key") or t(`key`)
      const regex = /t\(\s*(["'`])([\s\S]*?)\1[\s,)]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[2]) {
          let key = match[2];
          extractedKeys.add(key);
        }
      }
    }
  }
}

walkDir(srcDir);

const koContent = fs.readFileSync(koTsPath, 'utf-8');
const existingKeys = new Set();

const lines = koContent.split('\n');
for (let line of lines) {
  let lineStr = line.trim();
  if (lineStr.startsWith('"')) {
    let match = lineStr.match(/^"([^"]|\\")+"\s*:\s*"(.*)"(?:,)?$/);
    if (match) {
      let key = match[0].substring(1, match[0].indexOf('": "') === -1 ? match[0].indexOf('":') : match[0].indexOf('": "'));
      if(key.endsWith('"')) key = key.substring(0, key.length - 1);
      
      // unescape strictly for matching
      let unescapedKey = key.replace(/\\"/g, '"');
      existingKeys.add(unescapedKey);
    } else {
        // Fallback for tricky keys
        let firstColon = lineStr.indexOf('": "');
        if (firstColon !== -1) {
          let key = lineStr.substring(1, firstColon);
          existingKeys.add(key.replace(/\\"/g, '"'));
        }
    }
  }
}

const missingKeys = [];
for (let key of extractedKeys) {
  // Ignore non-translation strings
  if (key === 'ko' || key === 'en' || key.length === 0 || key.length <= 4) continue;
  if (key.includes('${NTS_CONFIG') || key.includes('${CODEF_CONFIG') || key.startsWith('@/lib/')) continue;
  
  if (!existingKeys.has(key)) {
    // try to check various unescaped versions
    let unescaped1 = key.replace(/\\"/g, '"');
    let unescaped2 = key.replace(/\\n/g, '\n');
    let unescaped3 = unescaped1.replace(/\\n/g, '\n');
    
    if (!existingKeys.has(unescaped1) && !existingKeys.has(unescaped2) && !existingKeys.has(unescaped3)) {
       missingKeys.push(key);
    }
  }
}

fs.writeFileSync('final_missing.json', JSON.stringify({ missingKeys }, null, 2));
console.log('Final missing keys count:', missingKeys.length);
