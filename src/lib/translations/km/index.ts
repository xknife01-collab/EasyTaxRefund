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

export const km = {
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
  "카카오 지갑 알림을 확인한 뒤\n아래 버튼을 눌러주세요.": "បន្ទាប់ពីពិនិត្យមើលការជូនដំណឹងពីកាបូប Kakao\nសូមចុចប៊ូតុងខាងក្រោម។",

  // Welcome Page
  "언어 선택": "ជ្រើសរើសភាសា",
  "welcome_title": "សូមជ្រើសរើសភាសារបស់អ្នក",
  "welcome_desc": "ដើម្បីទទួលបានការគាំទ្រផ្នែកពន្ធដារប្រកបដោយវិជ្ជាជីវៈជាភាសាកំណើតរបស់អ្នក។",

  // Custom Date
  "{year}년 {month}월 {day}일": "ថ្ងៃទី {day} ខែ {month} ឆ្នាំ {year}"
};
