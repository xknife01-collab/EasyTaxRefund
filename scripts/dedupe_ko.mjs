import fs from 'fs';

const koPath = './src/lib/translations/ko.ts';
const content = fs.readFileSync(koPath, 'utf8');

const matchAll = content.match(/"([^"]+)":\s*"([^"]+)",?/g) || [];
const uniqueKeys = new Map();

matchAll.forEach(m => {
    const parts = m.match(/"([^"]+)":\s*"([^"]+)",?/);
    if (parts) {
        uniqueKeys.set(parts[1], parts[2]);
    }
});

let newContent = 'export const ko = {\n';
Array.from(uniqueKeys.keys()).sort().forEach(k => {
    const val = uniqueKeys.get(k);
    newContent += `  "${k}": "${val}",\n`;
});
newContent += '};\n';

fs.writeFileSync(koPath, newContent);
console.log('Deduplicated ko.ts');
