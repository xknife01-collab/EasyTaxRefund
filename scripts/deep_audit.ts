import fs from 'fs';
import path from 'path';

// Import all translations
import { ko } from '../src/lib/translations/ko/index';
import { en } from '../src/lib/translations/en/index';
import { vi } from '../src/lib/translations/vi/index';
import { zh } from '../src/lib/translations/zh/index';
import { km } from '../src/lib/translations/km/index';
import { ne } from '../src/lib/translations/ne_new_stable/index';
import { uz } from '../src/lib/translations/uz/index';
import { my } from '../src/lib/translations/my/index';
import { id } from '../src/lib/translations/id/index';
import { th } from '../src/lib/translations/th/index';
import { si } from '../src/lib/translations/si/index';
import { mn } from '../src/lib/translations/mn/index';
import { bn } from '../src/lib/translations/bn/index';
import { kk } from '../src/lib/translations/kk/index';
import { ur } from '../src/lib/translations/ur_new/index';

const allTranslations: Record<string, Record<string, string>> = {
  ko, en, vi, zh, km, ne, uz, my, id, th, si, mn, bn, kk, ur
};

// Exact texts extracted directly from page.tsx line 1450 to 1510
const pageTsxPath = path.join(process.cwd(), 'src/app/page.tsx');
const pageContent = fs.readFileSync(pageTsxPath, 'utf8');

// Let's check exactly how reviews are declared in page.tsx
console.log('=== Checking page.tsx review strings directly ===');

// Extract all t(...) calls in review list from page.tsx
const reviewBlocks: { name: string; country: string; flag: string; amount: string; text: string }[] = [];
const regex = /name:\s*"([^"]+)",\s*country:\s*t\("([^"]+)"\),\s*flag:\s*"([^"]+)",\s*amount:\s*"([^"]+)",\s*image:[^,]+,\s*text:\s*t\("([^"]+)"\)/g;

let match;
while ((match = regex.exec(pageContent)) !== null) {
  reviewBlocks.push({
    name: match[1],
    country: match[2],
    flag: match[3],
    amount: match[4],
    text: match[5]
  });
}

console.log(`Found ${reviewBlocks.length} reviews in page.tsx:`);
reviewBlocks.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.name} - ${r.country} (${r.flag})]: key length = ${r.text.length}`);
});

console.log('\n=== Testing exact key lookup against all 15 languages ===');

const langCodes = ['ko', 'en', 'vi', 'zh', 'km', 'ne', 'uz', 'my', 'id', 'th', 'si', 'mn', 'bn', 'kk', 'ur'];

langCodes.forEach(lang => {
  const dict = allTranslations[lang];
  let failed = 0;
  let koreanIncluded = 0;
  
  reviewBlocks.forEach((r, idx) => {
    // Exactly what LanguageContext does:
    const trimmedKey = r.text.trim().replace(/\r\n/g, '\n');
    const translation = dict[trimmedKey];
    
    if (!translation) {
      console.log(`[${lang}] Review ${idx + 1} (${r.name}): MISSING KEY!`);
      failed++;
    } else if (lang !== 'ko' && translation === r.text) {
      console.log(`[${lang}] Review ${idx + 1} (${r.name}): SAME AS KOREAN!`);
      koreanIncluded++;
    }
  });

  if (failed === 0 && koreanIncluded === 0) {
    console.log(`✅ [${lang.toUpperCase()}] All ${reviewBlocks.length} reviews perfectly translated into native language.`);
  } else {
    console.log(`❌ [${lang.toUpperCase()}] Failed: ${failed}, Korean: ${koreanIncluded}`);
  }
});
