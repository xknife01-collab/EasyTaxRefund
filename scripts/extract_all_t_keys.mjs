import fs from 'fs';
import path from 'path';

const srcDir = './src';

const tKeys = new Set();

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Extract t('key') or t("key") or t(`key`)
            const matches = content.match(/t\(['"`]([^'"`]+)['"`]/g);
            if (matches) {
                matches.forEach(m => {
                    const key = m.slice(3, -1);
                    tKeys.add(key);
                });
            }
        }
    }
}

walk(srcDir);

console.log('--- ALL t() KEYS IN CODEBASE ---');
Array.from(tKeys).sort().forEach(k => console.log(k));
