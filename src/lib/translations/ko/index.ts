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

export const ko = {
  ...common,
  ...main,
  ...guides,
  ...forms,
  ...legal,
  ...notifications,
  ...faq,
  ...portal,
  ...reviews,
  ...security,

  // Custom Date
  "{year}년 {month}월 {day}일": "{year}년 {month}월 {day}일"
};
