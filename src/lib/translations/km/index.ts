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
import { simulator } from './simulator';

export const km = {
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

  "방금 전": "អម្បាញ់មិញ",
  "실시간 업데이트": "ការធ្វើបច្ចុប្បន្នភាពតាមពេលវេលาជាក់ស្តែង",

  // Welcome Page
  "언어 선택": "ជ្រើសរើសភាសា",
  "welcome_title": "សូមជ្រើសរើសភាសារបស់អ្នក",
  "welcome_desc": "ដើម្បីទទួលបានការគាំទ្រផ្នែកពន្ធដារប្រកបដោយវិជ្ជាជីវៈជាភាសាកំណើតរបស់អ្នក។",

  // Custom Date
  "{year}년 {month}월 {day}일": "ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year}"
};
