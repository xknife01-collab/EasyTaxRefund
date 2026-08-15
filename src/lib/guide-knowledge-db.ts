export interface GuideStepKnowledgeItem {
  method: 'hana' | 'pass' | 'kakao';
  slideIndex: number; // 0-indexed
  chapterTitle: string;
  imageUrl: string;
  targetName: string;
  targetCoords?: { x: number; y: number; width?: number; height?: number };
  visualLocationHint: string;
  actionInstruction: string;
  actionReason: string;
  quickQuestions: { q: string; a: string }[];
}

export const GUIDE_KNOWLEDGE_DB: Record<string, GuideStepKnowledgeItem> = {
  // HANA BANK (32 Slides)
  'hana-0': {
    method: 'hana',
    slideIndex: 0,
    chapterTitle: '하나원큐 시작',
    imageUrl: '/images/guide/hana/1.jpg',
    targetName: 'Play 스토어 검색창',
    targetCoords: { x: 43.5, y: 38.7, width: 78, height: 5.5 },
    visualLocationHint: '화면 상단 검색창 중앙',
    actionInstruction: "스토어 검색창에 '하나원큐'를 검색하여 설치해 주세요.",
    actionReason: '하나은행 공식 인증서를 발급받기 위해 전용 앱 설치가 필요합니다.',
    quickQuestions: [
      { q: '어디서 다운받나요?', a: '구글 플레이스토어나 애플 앱스토어 검색창에 [하나원큐]를 입력하시면 됩니다.' },
      { q: '비용이 드나요?', a: '아니요, 하나원큐 앱 설치 및 인증서 발급은 100% 무료입니다.' }
    ]
  },
  'hana-5': {
    method: 'hana',
    slideIndex: 5,
    chapterTitle: '홈 화면 팝업 닫기',
    imageUrl: '/images/guide/hana/6.jpg',
    targetName: '오른쪽 상단 X 닫기 버튼',
    targetCoords: { x: 90, y: 7, width: 12, height: 6 },
    visualLocationHint: '화면 맨 위 오른쪽 상단, 배터리 표시 바로 아래',
    actionInstruction: "인증서 발급을 위해 오른쪽 상단의 'X'를 눌러 팝업을 닫아주세요.",
    actionReason: '메인 홈의 이벤트 팝업 배너를 닫아야 뒤에 있는 [인증서 발급] 본메뉴 버튼이 나타납니다.',
    quickQuestions: [
      { q: 'X가 안 보여요', a: '화면 가장 오른쪽 위 모서리(배터리 잔량 아이콘 바로 밑)에 작게 X 표시가 있습니다.' },
      { q: 'X를 왜 닫아야 해요?', a: '첫 실행 시 뜨는 안내 팝업을 닫아야 본인인증 및 회원가입 버튼을 누를 수 있습니다.' }
    ]
  },
  'hana-6': {
    method: 'hana',
    slideIndex: 6,
    chapterTitle: '하나원큐 시작하기',
    imageUrl: '/images/guide/hana/7.jpg',
    targetName: '하나원큐 시작하기 버튼',
    targetCoords: { x: 50, y: 85, width: 90, height: 8 },
    visualLocationHint: '화면 맨 아래 하단 청록색 넓은 버튼',
    actionInstruction: "하단의 '하나원큐 시작하기' 버튼을 눌러주세요.",
    actionReason: '인증서 발급 및 본인확인 절차를 시작하기 위함입니다.',
    quickQuestions: [
      { q: '버튼이 안 눌려요', a: '약관 동의 체크박스가 모두 체크되었는지 확인 후 하단 버튼을 눌러주세요.' }
    ]
  },
  'hana-7': {
    method: 'hana',
    slideIndex: 7,
    chapterTitle: '본인확인 수단 선택',
    imageUrl: '/images/guide/hana/8.jpg',
    targetName: '휴대폰인증 버튼',
    targetCoords: { x: 50, y: 58, width: 85, height: 6 },
    visualLocationHint: '화면 중앙 첫 번째 [휴대폰인증] 항목',
    actionInstruction: "인증서 발급을 위해 '휴대폰인증'을 선택해 주세요.",
    actionReason: '외국인 근로자는 본인 명의 휴대폰 SMS 인증으로 가장 빠르고 안전하게 가입할 수 있습니다.',
    quickQuestions: [
      { q: '알뜰폰도 되나요?', a: '네! 알뜰폰 고객님도 통신사 선택 시 알뜰폰(MVNO)을 선택하시면 정상 인증됩니다.' }
    ]
  },
  'hana-16': {
    method: 'hana',
    slideIndex: 16,
    chapterTitle: '인증서 발급',
    imageUrl: '/images/guide/hana/17.jpg',
    targetName: '여권/신분증 촬영',
    visualLocationHint: '화면 중앙 신분증 가이드 사각형 프레임',
    actionInstruction: '외국인등록증 또는 여권을 사각형 프레임에 맞춰 촬영해 주세요.',
    actionReason: '국세청 전자서명법에 따른 필수 비대면 실명 확인 절차입니다.',
    quickQuestions: [
      { q: '빛 반사가 심해요', a: '어두운 바닥이나 책상 위에 신분증을 두고 빛이 반사되지 않게 비스듬히 촬영해 보세요.' }
    ]
  },
  'hana-26': {
    method: 'hana',
    slideIndex: 26,
    chapterTitle: '최종 승인',
    imageUrl: '/images/guide/hana/27.jpg',
    targetName: '인증 승인 확인',
    visualLocationHint: '화면 하단 [인증 완료] 버튼',
    actionInstruction: '발급 완료 후 스마트폰 화면에 뜨는 6자리 핀번호를 입력하고 승인해 주세요.',
    actionReason: '국세청에 소득세 감면 환급을 전자신고하기 위한 최종 서명 절차입니다.',
    quickQuestions: [
      { q: '승인 후 어디로 가나요?', a: '승인 완료 후 저희 KTRS 웹사이트 화면으로 돌아오시면 자동으로 조회가 시작됩니다!' }
    ]
  },

  // PASS APP (28 Slides)
  'pass-0': {
    method: 'pass',
    slideIndex: 0,
    chapterTitle: 'PASS 시작',
    imageUrl: '/images/guide/pass/pass_01.jpg',
    targetName: '통신사별 PASS 앱 선택',
    targetCoords: { x: 50, y: 18, width: 80, height: 10 },
    visualLocationHint: '화면 상단 통신사 목록 (SKT 알뜰폰→SKT / KT 알뜰폰→KT / LG 알뜰폰→LG)',
    actionInstruction: '본인 통신사에 맞는 PASS 앱을 설치해 주세요.',
    actionReason: '알뜰폰 고객님도 망에 맞는 PASS 앱을 선택하셔야 본인인증이 가능합니다.',
    quickQuestions: [
      { q: '알뜰폰은 어떤 PASS를 받나요?', a: '가입하신 알뜰폰이 사용하는 통신망(SKT, KT, LGU+)의 PASS 앱을 다운받으시면 됩니다.' }
    ]
  },
  'pass-1': {
    method: 'pass',
    slideIndex: 1,
    chapterTitle: 'PASS 앱 설치',
    imageUrl: '/images/guide/pass/pass_02.jpg',
    targetName: 'PASS 앱 설치 버튼',
    targetCoords: { x: 50, y: 16, width: 80, height: 10 },
    visualLocationHint: '스토어 화면 상단 [설치] 버튼',
    actionInstruction: '스토어에서 PASS 앱 [설치]를 눌러 다운로드해 주세요.',
    actionReason: '국세청 모바일 본인인증을 진행하기 위해 전용 앱이 필요합니다.',
    quickQuestions: [
      { q: '다운로드가 안 돼요', a: 'Wi-Fi 연결 상태를 확인하시거나 스토어 계정 로그인을 확인해 주세요.' }
    ]
  },
  'pass-2': {
    method: 'pass',
    slideIndex: 2,
    chapterTitle: 'PASS 앱 실행',
    imageUrl: '/images/guide/pass/pass_03.jpg',
    targetName: 'PASS 앱 [열기] 버튼',
    targetCoords: { x: 50, y: 20, width: 80, height: 10 },
    visualLocationHint: '스토어 화면 오른쪽 [열기] 버튼',
    actionInstruction: '설치가 완료되면 [열기]를 눌러 앱을 실행해 주세요.',
    actionReason: 'PASS 앱 회원가입 및 인증서 발급을 시작하기 위함입니다.',
    quickQuestions: [
      { q: '열기 버튼이 어디 있나요?', a: '스토어 앱 설치 완료 후 상단 오른쪽에 초록색/파란색 [열기] 버튼이 나타납니다.' }
    ]
  },
  'pass-3': {
    method: 'pass',
    slideIndex: 3,
    chapterTitle: '앱 이용 권한 안내',
    imageUrl: '/images/guide/pass/pass_04.jpg',
    targetName: '이용 권한 [확인] 버튼',
    targetCoords: { x: 50, y: 89, width: 85, height: 8 },
    visualLocationHint: '화면 맨 아래 하단 [확인] 버튼 (x: 50, y: 89)',
    actionInstruction: '아래로 스크롤하여 권한 내용을 확인하신 후, 하단의 [확인] 버튼을 눌러주세요.',
    actionReason: '본인인증 문자 수신 및 푸시 알림 작동을 위한 필수 권한 안내입니다.',
    quickQuestions: [
      { q: '확인 버튼이 안 눌려요', a: '화면을 맨 아래로 끝까지 스크롤하시면 하단 확인 버튼이 활성화됩니다.' }
    ]
  },
  'pass-4': {
    method: 'pass',
    slideIndex: 4,
    chapterTitle: '앱 알림 권한 승인 (Step 5)',
    imageUrl: '/images/guide/pass/pass_05.jpg',
    targetName: '앱 알림 권한 [허용] 버튼',
    targetCoords: { x: 50, y: 80, width: 70, height: 8 },
    visualLocationHint: '스마트폰 팝업창 하단 오른쪽/중앙의 [허용] 버튼 (x: 50, y: 80)',
    actionInstruction: '팝업에서 [허용]을 눌러 PASS 앱의 알림 권한을 승인해 주세요.',
    actionReason: '국세청 홈택스 본인인증 요청 시 스마트폰으로 실시간 푸시 알림을 받기 위해 알림 권한이 반드시 필요합니다.',
    quickQuestions: [
      { q: '허용을 안 누르면 어떻게 되나요?', a: '나중에 국세청 인증 요청 알림이 스마트폰에 뜨지 않아 진행이 막힐 수 있으니 꼭 [허용]을 눌러주세요.' },
      { q: '허용 버튼이 안 보여요', a: '화면 중앙에 떠 있는 팝업창 아래쪽에 파란색 [허용] 글자를 누르시면 됩니다.' }
    ]
  },
  'pass-5': {
    method: 'pass',
    slideIndex: 5,
    chapterTitle: '전화 관리 권한 승인 (Step 6)',
    imageUrl: '/images/guide/pass/pass_06.jpg',
    targetName: '전화 관리 권한 [허용] 버튼',
    targetCoords: { x: 50, y: 80, width: 70, height: 8 },
    visualLocationHint: '스마트폰 화면 중앙 팝업창 아래쪽 파란색 [허용] 버튼',
    actionInstruction: '팝업에서 [허용]을 눌러 전화 관리 권한을 승인해 주세요.',
    actionReason: '현재 기기의 유심(USIM) 전화번호와 일치하는지 통신사 자동 확인을 하기 위함입니다.',
    quickQuestions: [
      { q: '전화 권한은 왜 필요한가요?', a: '고객님의 스마트폰에 꽂힌 유심 번호와 가입자 번호가 일치하는지 안전하게 확인하기 위함입니다.' }
    ]
  },
  'pass-6': {
    method: 'pass',
    slideIndex: 6,
    chapterTitle: '회원가입 기본정보 입력 (Step 7)',
    imageUrl: '/images/guide/pass/pass_07.jpg',
    targetName: '성명, 외국인등록번호, 휴대폰번호 입력',
    targetCoords: { x: 50, y: 88, width: 85, height: 8 },
    visualLocationHint: '화면 위쪽부터 차례대로 성명, 외국인등록번호, 휴대폰번호 입력 후 맨 아래 파란색 [다음] 버튼',
    actionInstruction: '성명, 외국인등록번호(13자리), 휴대폰번호를 입력 후 하단 [다음]을 눌러주세요.',
    actionReason: '외국인등록증에 기재된 정확한 영문 성명으로 통신사 가입자 정보와 대조하기 위함입니다.',
    quickQuestions: [
      { q: '이름은 어떻게 적나요?', a: '외국인등록증 상의 영문 성명을 띄어쓰기 포함하여 대문자로 정확히 입력해 주세요.' }
    ]
  },
  'pass-7': {
    method: 'pass',
    slideIndex: 7,
    chapterTitle: 'PASS 필수 약관 동의 (Step 8)',
    imageUrl: '/images/guide/pass/pass_08.jpg',
    targetName: '필수 약관 전체 동의 및 [다음]',
    targetCoords: { x: 50, y: 88.5, width: 85, height: 8 },
    visualLocationHint: '화면 중앙의 [필수] 약관 동의 체크 후 맨 아래 파란색 [다음] 버튼',
    actionInstruction: 'PASS 필수 항목을 선택하여 모두 동의하신 후 하단 [다음] 버튼을 눌러주세요.',
    actionReason: '본인인증 서비스 이용을 위한 통신사 필수 이용약관 동의 절차입니다.',
    quickQuestions: [
      { q: '선택 항목도 체크해야 하나요?', a: '아닙니다, [필수] 항목만 체크하시고 선택 항목은 체크하지 않으셔도 진행됩니다.' }
    ]
  },
  'pass-8': {
    method: 'pass',
    slideIndex: 8,
    chapterTitle: 'SMS 인증번호 입력 (Step 9)',
    imageUrl: '/images/guide/pass/pass_09.jpg',
    targetName: '문자 인증번호 6자리 입력',
    targetCoords: { x: 50, y: 88.5, width: 85, height: 8 },
    visualLocationHint: '화면 위쪽 6자리 인증번호 입력창에 숫자 입력 후 맨 아래 파란색 [다음] 버튼',
    actionInstruction: '휴대폰 문자로 수신된 6자리 인증번호를 입력하고 하단 [다음]을 눌러주세요.',
    actionReason: '본인 명의의 휴대폰 기기인지 확인하는 SMS 인증 절차입니다.',
    quickQuestions: [
      { q: '문자가 오지 않아요', a: '외국인등록증 영문 이름 순서(성/이름 띄어쓰기)가 통신사 등록 정보와 다를 수 있습니다. 신분증 분석 도우미를 이용해 보세요.' }
    ]
  },
  'pass-9': {
    method: 'pass',
    slideIndex: 9,
    chapterTitle: '비밀번호 6자리 설정 (Step 10)',
    imageUrl: '/images/guide/pass/pass_10.jpg',
    targetName: '숫자 6자리 비밀번호 입력',
    targetCoords: { x: 50, y: 30, width: 80, height: 10 },
    visualLocationHint: '화면 중앙 숫자 키패드',
    actionInstruction: '앞으로 PASS 앱 실행 및 인증 시 사용할 숫자 6자리 비밀번호를 설정해 주세요.',
    actionReason: '간편하고 안전한 인증을 위한 개인 보안 핀번호입니다.',
    quickQuestions: [
      { q: '연속된 숫자는 안 되나요?', a: '123456이나 생년월일 같은 연속/반복 숫자는 보안상 불가하니 기억하기 쉬운 조합으로 설정해 주세요.' }
    ]
  },
  'pass-14': {
    method: 'pass',
    slideIndex: 14,
    chapterTitle: '계좌 1원 인증 (Step 15)',
    imageUrl: '/images/guide/pass/pass_15.jpg',
    targetName: '1원 송금 입금자명 4자리 입력칸',
    targetCoords: { x: 50, y: 80.5, width: 85, height: 8 },
    visualLocationHint: '화면 중앙 4칸 입력 상자',
    actionInstruction: '본인 통장으로 입금된 1원의 입금자명 앞 4자리 숫자를 입력해 주세요.',
    actionReason: '본인 명의의 실제 금융 계좌가 맞는지 검증하는 2차 보안 절차입니다.',
    quickQuestions: [
      { q: '1원 입금자명이 어디 있나요?', a: '고객님의 은행 앱 거래내역을 보시면 1원이 입금되어 있고 [PASS1234]처럼 적혀 있습니다. 뒤 숫자 4자리를 입력하세요.' }
    ]
  },
  'pass-26': {
    method: 'pass',
    slideIndex: 26,
    chapterTitle: 'PASS 푸시 승인 (Step 27)',
    imageUrl: '/images/guide/pass/pass_27.jpg',
    targetName: 'PASS 푸시 알림 [확인]',
    targetCoords: { x: 50, y: 36, width: 80, height: 10 },
    visualLocationHint: '화면 중앙 확인 버튼',
    actionInstruction: '스마트폰 상단에 도착한 PASS 인증 알림을 누르고 6자리 비밀번호를 입력해 주세요.',
    actionReason: '국세청 홈택스 접속 승인을 완료하기 위함입니다.',
    quickQuestions: [
      { q: '알림이 안 와요', a: 'PASS 앱을 직접 실행하시면 메인 화면에 [인증 요청 1건] 팝업이 바로 떠 있습니다.' }
    ]
  },

  // KAKAOTALK (37 Slides)
  'kakao-0': {
    method: 'kakao',
    slideIndex: 0,
    chapterTitle: '카카오톡 시작',
    imageUrl: '/images/guide/KakaoTalk/kakao_1.jpg',
    targetName: '카카오톡 앱 열기',
    visualLocationHint: '카카오톡 메인',
    actionInstruction: '카카오톡 앱을 실행해 주세요.',
    actionReason: '카카오톡 지갑에 발급된 국민인증서로 간편하게 국세청을 조회할 수 있습니다.',
    quickQuestions: [
      { q: '카카오톡 계정이 없어요', a: '휴대폰 번호로 1분 만에 회원가입 후 바로 인증서를 만드실 수 있습니다.' }
    ]
  },
  'kakao-31': {
    method: 'kakao',
    slideIndex: 31,
    chapterTitle: '카카오 지갑 인증서 발급',
    imageUrl: '/images/guide/KakaoTalk/kakao_32.jpg',
    targetName: '1원 계좌 인증',
    visualLocationHint: '화면 중앙 계좌 입력칸',
    actionInstruction: '본인 명의 은행 계좌로 1원을 송금받아 입금자명을 확인해 주세요.',
    actionReason: '카카오 인증서 발급을 위한 정부 공인 본인확인 절차입니다.',
    quickQuestions: [
      { q: '입금자명이 단어인가요 숫자입니까?', a: '카카오페이는 [달콤한123] 또는 4자리 숫자로 입금됩니다. 입금자명을 그대로 입력해 주세요.' }
    ]
  },
  'kakao-36': {
    method: 'kakao',
    slideIndex: 36,
    chapterTitle: '알림톡 인증 승인',
    imageUrl: '/images/guide/KakaoTalk/kakao_37.jpg',
    targetName: '노란색 [인증하기] 버튼',
    visualLocationHint: '카카오톡 채팅방 안의 노란색 버튼',
    actionInstruction: '카카오톡으로 온 알림톡 메시지에서 노란색 [인증하기]를 누르고 비밀번호를 입력해 주세요.',
    actionReason: '국세청 전자서명 요청을 승인하여 환급금 조회를 마무리합니다.',
    quickQuestions: [
      { q: '알림톡이 어디로 오나요?', a: '카카오톡 [카카오페이] 또는 [카카오톡 지갑] 공식 채널 채팅방으로 즉시 발송됩니다.' }
    ]
  }
};

export function getGuideStepKnowledge(method: 'hana' | 'pass' | 'kakao', slideIndex: number): GuideStepKnowledgeItem {
  const key = `${method}-${slideIndex}`;
  if (GUIDE_KNOWLEDGE_DB[key]) {
    return GUIDE_KNOWLEDGE_DB[key];
  }

  // Generic fallback with realistic calculated clues
  const totalMap = { hana: 32, pass: 27, kakao: 37 };
  const methodNames = { hana: '하나은행 하나원큐', pass: 'PASS 앱', kakao: '카카오톡' };
  const currentTotal = totalMap[method];
  const currentNum = slideIndex + 1;

  let fallbackChapter = '기본 설정';
  let fallbackInstruction = '화면에 표시된 점선 안내 박스를 확인하시고 다음 단계로 진행해 주세요.';
  let fallbackReason = '국세청 본인인증 전자서명을 안전하게 완료하기 위한 필수 단계입니다.';

  if (currentNum <= 5) {
    fallbackChapter = '앱 설치 및 권한 승인';
    fallbackInstruction = '앱 마켓에서 전용 앱을 설치하시고 알림 및 전화 권한을 허용해 주세요.';
  } else if (currentNum <= Math.floor(currentTotal * 0.6)) {
    fallbackChapter = '회원가입 및 본인확인';
    fallbackInstruction = '외국인등록번호(ARC)와 휴대폰 번호를 입력하여 SMS 인증을 진행해 주세요.';
  } else if (currentNum <= Math.floor(currentTotal * 0.85)) {
    fallbackChapter = '인증서 발급 및 계좌 인증';
    fallbackInstruction = '신분증 촬영 및 1원 계좌 송금 인증을 완료하고 6자리 비밀번호를 설정해 주세요.';
  } else {
    fallbackChapter = '최종 전자서명 승인';
    fallbackInstruction = '스마트폰 화면에 도착한 인증 알림을 누르고 6자리 비밀번호로 승인해 주세요.';
  }

  return {
    method,
    slideIndex,
    chapterTitle: fallbackChapter,
    imageUrl: method === 'hana' ? `/images/guide/hana/${currentNum}.jpg`
             : method === 'pass' ? `/images/guide/pass/pass_${String(currentNum).padStart(2, '0')}.jpg`
             : `/images/guide/KakaoTalk/kakao_${currentNum}.jpg`,
    targetName: `Step ${currentNum} 안내 영역`,
    visualLocationHint: '화면 내 점선 또는 원형 강조 영역',
    actionInstruction: fallbackInstruction,
    actionReason: fallbackReason,
    quickQuestions: [
      { q: '이 화면에서 어디를 눌러야 하나요?', a: `${methodNames[method]} 화면 중앙의 점선 강조 표시된 버튼을 눌러주시면 됩니다.` },
      { q: '다음 단계로 어떻게 넘어가나요?', a: '안내에 따라 입력을 완료하시면 화면 하단의 다음/확인 버튼이 활성화됩니다.' }
    ]
  };
}
