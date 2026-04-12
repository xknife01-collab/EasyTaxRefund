import fs from 'fs';
import path from 'path';

const filePath = 'src/lib/translations/th.ts';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');
const keyCounts = {};

lines.forEach((line, index) => {
    const match = line.match(/^\s*"((?:\\.|[^"])+)":/);
    if (match) {
        const key = match[1];
        if (!keyCounts[key]) keyCounts[key] = [];
        keyCounts[key].push(index + 1);
    }
});

Object.entries(keyCounts).forEach(([key, lines]) => {
    if (lines.length > 1) {
        console.log(`Duplicate key "${key}" found on lines: ${lines.join(', ')}`);
    }
});
