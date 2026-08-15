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

  // PASS APP (27 Slides)
  'pass-0': {
    method: 'pass',
    slideIndex: 0,
    chapterTitle: 'PASS 앱 설치',
    imageUrl: '/images/guide/pass/pass_01.jpg',
    targetName: '통신사별 PASS 앱',
    visualLocationHint: '스토어 검색 결과 상단',
    actionInstruction: '본인이 이용 중인 통신사(SKT, KT, LGU+)의 PASS 앱을 설치해 주세요.',
    actionReason: '알뜰폰 고객님도 망(SKT망/KT망/LGU+망)에 맞는 PASS 앱을 설치하시면 됩니다.',
    quickQuestions: [
      { q: '알뜰폰은 어떤 PASS를 받나요?', a: '가입하신 알뜰폰이 사용하는 통신망(SKT, KT, LGU+)의 PASS 앱을 다운받으시면 됩니다.' }
    ]
  },
  'pass-14': {
    method: 'pass',
    slideIndex: 14,
    chapterTitle: '계좌 1원 인증',
    imageUrl: '/images/guide/pass/pass_15.jpg',
    targetName: '1원 송금 입금자명 4자리 입력칸',
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
    chapterTitle: 'PASS 푸시 승인',
    imageUrl: '/images/guide/pass/pass_27.jpg',
    targetName: 'PASS 푸시 알림 [확인]',
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
