console.log('Loading UR_NEW index');
import { common } from './common';
import { faq } from './faq';
import { forms } from './forms_v2';
import { guides } from './guides';
import { legal } from './legal';
import { main } from './main';
import { notifications } from './notifications';
import { portal } from './portal';
import { reviews } from './reviews';
import { security } from './security';

export const ur = {
  ...common,
  ...faq,
  ...forms,
  ...guides,
  ...legal,
  ...main,
  ...notifications,
  ...portal,
  ...reviews,
  ...security,

  // Special case
  "{year}년 {month}월 {day}일": "{day} {month} {year}"
};
