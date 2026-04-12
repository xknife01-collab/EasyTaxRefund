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

export const vi = {
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

  "방금 전": "Vừa xong",
  "실시간 업데이트": "Cập nhật thời gian thực",
  "카카오 지갑 알림을 확인한 뒤\n아래 버튼을 눌러주세요.": "Vui lòng kiểm tra thông báo ví Kakao\nsau đó nhấn nút bên dưới.",

  // Welcome Page
  "언어 선택": "Lựa chọn ngôn ngữ",
  "welcome_title": "Vui lòng chọn ngôn ngữ của bạn",
  "welcome_desc": "Để nhận được sự hỗ trợ về thuế chuyên nghiệp bằng ngôn ngữ mẹ đẻ của bạn.",

  // Custom Date
  "{year}년 {month}월 {day}일": "Ngày {day} tháng {month} năm {year}"
};
