import fs from 'fs';

const koPath = './src/lib/translations/ko.ts';
const viPath = './src/lib/translations/vi.ts';

const koContent = fs.readFileSync(koPath, 'utf8');
const viContent = fs.readFileSync(viPath, 'utf8');

const koKeys = new Set();
const matchKo = koContent.match(/"([^"]+)":/g) || [];
matchKo.forEach(m => koKeys.add(m.slice(1, -2)));

const viKeys = new Set();
const matchVi = viContent.match(/"([^"]+)":/g) || [];
matchVi.forEach(m => viKeys.add(m.slice(1, -2)));

const missing = [];
koKeys.forEach(k => {
    if (!viKeys.has(k)) {
        missing.push(k);
    }
});

console.log('--- MISSING KEYS IN VI.TS ---');
missing.forEach(m => console.log(m));
console.log('Total Missing:', missing.length);
