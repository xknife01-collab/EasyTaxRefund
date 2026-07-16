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

const missingResults = new Set();
const adminPrefix = path.join('src', 'app', 'admin');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        
        // Skip admin and translations folders
        if (fullPath.includes(adminPrefix) || fullPath.includes('translations')) {
            continue;
        }

        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Regex to find Korean text in strings or JSX
            // 1. Strings: "한글", '한글', `한글`
            const stringMatches = content.match(/["'`]([^"'`\r\n]*[\uAC00-\uD7AF]+[^"'`\r\n]*)["'`]/g) || [];
            stringMatches.forEach(m => {
                const text = m.slice(1, -1).trim();
                if (text && !koKeys.has(text) && !text.includes('${')) {
                    missingResults.add(text);
                }
            });

            // 2. JSX Text: > 한글 <
            const jsxMatches = content.match(/>([^<]*[\uAC00-\uD7AF]+[^<]*)<\//g) || [];
            jsxMatches.forEach(m => {
                const text = m.slice(1, -2).trim();
                if (text && !koKeys.has(text)) {
                    missingResults.add(text);
                }
            });
        }
    }
}

walk(srcDir);

console.log('--- MISSING USER-FACING KOREAN KEYS ---');
Array.from(missingResults).sort().forEach(res => console.log(res));
