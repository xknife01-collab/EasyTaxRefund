/** FINAL_TRANSLATION_LOCK: ALL_SORTED_BY_PRIORITY **/
import { ko } from './ko';
import { vi } from './vi';
import { zh } from './zh';
import { km } from './km';
import { ne } from './ne';
import { uz } from './uz';
import { my } from './my';
import { id } from './id';
import { th } from './th';
import { en } from './en';
import { si } from './si';
import { mn } from './mn';
import { bn } from './bn';
import { kk } from './kk';
import { ur } from './ur';

import type { Language } from './config';

export const languages: { code: Language; name: string; countryCode: string }[] = [
  { code: 'ko', name: '한국어', countryCode: 'kr' },
  { code: 'vi', name: 'Tiếng Việt', countryCode: 'vn' },
  { code: 'zh', name: '中文', countryCode: 'cn' },
  { code: 'km', name: 'ភាសាខ្មែរ', countryCode: 'kh' },
  { code: 'ne', name: 'नेपाली', countryCode: 'np' },
  { code: 'uz', name: 'Oʻzbekcha', countryCode: 'uz' },
  { code: 'my', name: 'မြန်မာဘာသာ', countryCode: 'mm' },
  { code: 'id', name: 'Bahasa Indonesia', countryCode: 'id' },
  { code: 'th', name: 'ไทย', countryCode: 'th' },
  { code: 'en', name: 'Philippines (English)', countryCode: 'ph' },
  { code: 'si', name: 'සිංහල', countryCode: 'lk' },
  { code: 'mn', name: 'Монгол', countryCode: 'mn' },
  { code: 'bn', name: 'বাংলা', countryCode: 'bd' },
  { code: 'kk', name: 'Қазақша', countryCode: 'kz' },
  { code: 'ur', name: 'اردو', countryCode: 'pk' }
];

export const translations: Record<Language, any> = {
  ko,
  vi,
  zh,
  km,
  ne,
  uz,
  my,
  id,
  th,
  en,
  si,
  mn,
  bn,
  kk,
  ur
};