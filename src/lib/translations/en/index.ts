import { common } from './common';
import { main } from './main';
import { faq } from './faq';
import { legal } from './legal';
import { portal } from './portal';
import { forms } from './forms_v2';
import { notifications } from './notifications';
import { guides } from './guides';
import { reviews } from './reviews';
import { security } from './security';
import { simulator } from './simulator';

export const en = {
  ...simulator,
  ...common,
  ...main,
  ...faq,
  ...legal,
  ...portal,
  ...forms,
  ...notifications,
  ...guides,
  ...reviews,
  security,
};
