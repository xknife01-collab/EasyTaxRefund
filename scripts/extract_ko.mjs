import fs from 'fs';
import path from 'path';

const srcDir = './src';
const koPath = './src/lib/translations/ko.ts';

// Get current keys
const koFileContent = fs.readFileSync(koPath, 'utf8');
const koKeys = new Set();
const matchAllKeys = koFileContent.match(/"([^"]+)":/g) || [];
matchAllKeys.forEach(m => {
    const key = m.slice(1, -2);
    koKeys.add(key);
});

const koreanRegex = /[\uAC00-\uD7AF]+/g;
const missingResults = new Set();

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'translations') continue;
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Extract strings in quotes or JSX text
            const matches = content.match(/["'`]([^"'`]*[\uAC00-\uD7AF]+[^"'`]*)["'`]|>([^<]*[\uAC00-\uD7AF]+[^<]*)<\//g);
            if (matches) {
                matches.forEach(m => {
                    let text = m;
                    if (m.startsWith('>') && m.endsWith('</')) {
                        text = m.slice(1, -2).trim();
                    } else {
                        text = m.slice(1, -1);
                    }
                    
                    if (text && !koKeys.has(text) && !text.includes('${')) {
                        // Skip if it's a template literal with variables for now, or handle them
                        missingResults.add(text);
                    }
                });
            }
        }
    }
}

walk(srcDir);

console.log('--- MISSING KOREAN KEYS ---');
Array.from(missingResults).sort().forEach(res => console.log(res));
