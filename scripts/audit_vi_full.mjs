import fs from 'fs';
import path from 'path';

const koDir = './src/lib/translations/ko';
const viDir = './src/lib/translations/vi';

function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  // Match "key": or 'key':
  const matches = content.match(/["']([^"']+)["']\s*:/g);
  if (matches) {
    matches.forEach(m => {
      const key = m.match(/["']([^"']+)["']/)[1];
      keys.add(key);
    });
  }
  return keys;
}

function getAllKeysFromDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  const allKeys = new Set();
  files.forEach(file => {
    const keys = extractKeys(path.join(dir, file));
    keys.forEach(k => allKeys.add(k));
  });
  return allKeys;
}

const koKeys = getAllKeysFromDir(koDir);
const viKeys = getAllKeysFromDir(viDir);

const missingInVi = Array.from(koKeys).filter(k => !viKeys.has(k));

console.log('--- MISSING IN VI ---');
console.log(JSON.stringify(missingInVi, null, 2));

// Special check for Welcome Page keys mentioned by user
const welcomeKeys = ['언어 선택', 'welcome_desc'];
welcomeKeys.forEach(k => {
  if (!viKeys.has(k)) {
    console.log(`[ALERT] Key "${k}" is MISSING in VI!`);
  }
});
