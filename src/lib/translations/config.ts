export type Language = 'ko' | 'vi' | 'zh' | 'km' | 'ne' | 'uz' | 'my' | 'id' | 'th' | 'en' | 'si' | 'mn' | 'bn' | 'kk' | 'ur';

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

export const defaultLanguage = 'ko';
