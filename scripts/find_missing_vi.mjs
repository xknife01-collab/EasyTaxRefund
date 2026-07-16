import fs from 'fs';
import path from 'path';

const viDir = './src/lib/translations/vi';
const srcDir = './src';

// 1. Get all keys currently in VI
function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  const matches = content.match(/["']([^"']+)["']\s*:/g);
  if (matches) {
    matches.forEach(m => {
      const key = m.match(/["']([^"']+)["']/)[1];
      keys.add(key);
    });
  }
  return keys;
}

function getAllViKeys() {
  const files = fs.readdirSync(viDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  const allKeys = new Set();
  files.forEach(file => {
    const keys = extractKeys(path.join(viDir, file));
    keys.add(file.replace('.ts', '')); // skip segment name matches if any
    keys.forEach(k => allKeys.add(k));
  });
  
  // also check vi/index.ts
  const indexKeys = extractKeys(path.join(viDir, 'index.ts'));
  indexKeys.forEach(k => allKeys.add(k));

  return allKeys;
}

const viKeys = getAllViKeys();

// 2. Get all keys used in codebase
const codeKeys = new Set();
function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = content.match(/t\(['"`]([^'"`]+)['"`]/g);
            if (matches) {
                matches.forEach(m => {
                    const key = m.slice(3, -1);
                    codeKeys.add(key);
                });
            }
        }
    }
}
walk(srcDir);

// 3. Find missing
const missing = Array.from(codeKeys).filter(k => !viKeys.has(k));

console.log('--- MISSING IN VI DIRECTORY ---');
console.log(JSON.stringify(missing, null, 2));
