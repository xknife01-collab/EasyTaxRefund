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

export const bn = {
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

  // Custom Date
  "{year}년 {month}월 {day}일": "{year} বছর {month} মাস {day} দিন",
};
