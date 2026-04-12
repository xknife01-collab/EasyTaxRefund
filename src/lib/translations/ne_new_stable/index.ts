import { common } from './common';
import { main } from './main';
import { guides } from './guides';
import { forms } from './forms_v2';
import { legal } from './legal';
import { notifications } from './notifications';
import { faq } from './faq';
import { portal } from './portal';
import { reviews } from './reviews';
import { security } from './security';

export const ne = {
  ...main,
  ...legal,
  ...notifications,
  ...faq,
  ...portal,
  ...reviews,
  ...security,
  ...common,
  ...forms,
  ...guides,

  // Custom Date
  "{year}년 {month}월 {day}일": "{year} वर्ष {month} महिना {day} गते",
  "_version": "1.0.1-" + Date.now()
};

console.log('Nepali translations (ne_new_stable) loaded at:', new Date().toISOString());
