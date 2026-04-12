import fs from 'fs';
import path from 'path';

const koDir = './src/lib/translations/ko';
const viDir = './src/lib/translations/vi';

async function getKeysFromDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  let allKeys = {};
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Simple regex to find keys in "key": "value" format
    const matches = content.match(/"([^"]+)"\s*:/g);
    if (matches) {
      matches.forEach(m => {
        const key = m.replace(/"/g, '').replace(':', '').trim();
        allKeys[key] = true;
      });
    }
  }
  return allKeys;
}

async function run() {
  const koKeys = await getKeysFromDir(koDir);
  const viKeys = await getKeysFromDir(viDir);
  
  const missingKeys = Object.keys(koKeys).filter(k => !viKeys[k]);
  
  console.log('--- Missing Keys in VI ---');
  console.log(JSON.stringify(missingKeys, null, 2));
}

run();
