import { common } from "./common";
import { main } from "./main";
import { notifications } from "./notifications";
import { faq } from "./faq";
import { portal } from "./portal";
import { guides } from "./guides";
import { forms } from "./forms_v2";
import { legal } from "./legal";
import { reviews } from "./reviews";
import { security } from "./security";

export const my = {
  ...common,
  ...main,
  ...notifications,
  ...faq,
  ...portal,
  ...guides,
  ...forms,
  ...legal,
  ...reviews,
  ...security,
};
