import { common } from './common';
import { faq } from './faq';
import { mnFormsContent as forms } from './forms_v2';
import { guides } from './guides';
import { legal } from './legal';
import { main } from './main';
import { notifications } from './notifications';
import { portal } from './portal';
import { reviews } from './reviews';

export const mn = {
  ...common,
  ...faq,
  ...forms,
  ...guides,
  ...legal,
  ...main,
  ...notifications,
  ...portal,
  ...reviews,
};
