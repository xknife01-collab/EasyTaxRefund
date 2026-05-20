export type Language = 
  | 'ko' | 'vi' | 'zh' | 'km' | 'ne' | 'uz' | 'my' | 'id' | 'th' | 'en' | 'si' | 'mn' | 'bn' | 'kk' | 'ur';

export const languages: { code: Language; name: string; flag: string; countryCode: string }[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷', countryCode: 'kr' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', countryCode: 'vn' },
  { code: 'zh', name: '中文', flag: '🇨🇳', countryCode: 'cn' },
  { code: 'km', name: 'ភាសាខ្មែរ', flag: '🇰🇭', countryCode: 'kh' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵', countryCode: 'np' },
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿', countryCode: 'uz' },
  { code: 'my', name: 'မြန်မာဘာသာ', flag: '🇲🇲', countryCode: 'mm' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', countryCode: 'id' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', countryCode: 'th' },
  { code: 'en', name: 'Philippines (English)', flag: '🇵🇭', countryCode: 'ph' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰', countryCode: 'lk' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳', countryCode: 'mn' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩', countryCode: 'bd' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿', countryCode: 'kz' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', countryCode: 'pk' },
];

export interface Guides {
  [key: string]: string;
}
