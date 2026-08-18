import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/components/FloatingAiChat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix step 1:
content = content.replace(
  /: '1단계: 한국 근무 기간과 대략적인 월급을 선택해 주세요\. 0\.1초 만에 예상 환급액을 정밀 계산해 드립니다!',[\s\S]*?case 2:/,
  `: '1단계: 한국 근무 기간과 대략적인 월급을 선택해 주세요. 0.1초 만에 예상 환급액을 정밀 계산해 드립니다!'\n      };\n    case 2:`
);

// Fix step 2:
content = content.replace(
  /: '2단계: 외국인등록증에 적힌 영문 성함과 외국인등록번호 13자리를 입력해 주세요\. 모든 정보는 256-bit SSL로 안전하게 암호화됩니다 🔒',[\s\S]*?case 3:/,
  `: '2단계: 외국인등록증에 적힌 영문 성함과 외국인등록번호 13자리를 입력해 주세요. 모든 정보는 256-bit SSL로 안전하게 암호화됩니다 🔒'\n      };\n    case 3:`
);

// Fix step 3:
content = content.replace(
  /: '3단계: 본인 명의 휴대폰 번호와 통신사를 선택해 주세요! 알뜰폰 고객님은 대행 통신사 구분을 정확히 확인해 주셔야 인증 문자가 옵니다 📱',[\s\S]*?case 4:/,
  `: '3단계: 본인 명의 휴대폰 번호와 통신사를 선택해 주세요! 알뜰폰 고객님은 대행 통신사 구분을 정확히 확인해 주셔야 인증 문자가 옵니다 📱'\n      };\n    case 4:`
);

// Fix step 9:
content = content.replace(
  /: '9단계: 세무사 경정청구 위임 약관을 확인하시고 서명해 주시면 접수가 완료됩니다! 100% 후불 정산이므로 지금 결제되는 금액은 0원입니다 ✍️',[\s\S]*?case 10:/,
  `: '9단계: 세무사 경정청구 위임 약관을 확인하시고 서명해 주시면 접수가 완료됩니다! 100% 후불 정산이므로 지금 결제되는 금액은 0원입니다 ✍️'\n      };\n    case 10:`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('FloatingAiChat.tsx step messages cleaned.');
