import { common } from './common';
import { main } from './main';
import { faq } from './faq';
import { legal } from './legal';
import { forms } from './forms_v2';
import { portal } from './portal';
import { guides } from './guides';
import { notifications } from './notifications';
import { reviews } from './reviews';
import { security } from './security';
import { simulator } from './simulator';

export const zh = {
  ...simulator,
  ...common,
  ...main,
  ...faq,
  ...legal,
  ...forms,
  ...portal,
  ...guides,
  ...notifications,
  ...reviews,
  ...security,

  "방금 전": "刚刚",
  "실시간 업데이트": "实时更新",
};
