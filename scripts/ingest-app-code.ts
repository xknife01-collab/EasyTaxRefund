import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabaseAdmin } from '../src/lib/supabase';
import { getEmbedding } from '../src/lib/ai-learning-db';

interface AppCodeKnowledge {
  question: string;
  answer: string;
  category: string;
  source_type: string;
}

const APP_CODE_KNOWLEDGE_BASE: AppCodeKnowledge[] = [
  {
    question: "가이드 어디에 있어요? 카카오톡 가이드 어떻게 보나요? Step 4 가이드 위치",
    answer: "우선 화면 상단의 골드색 [국세청 안전 연동으로 내 숨은 환급금 무료 조회하기] 버튼을 누르고 시작하여 본인인증 수단 선택 화면(4번째 화면)까지 이동하신 후, 상단에 보이는 [카카오톡] 탭을 터치하시면 화면 중앙에 카카오 지갑 신규 생성부터 1원 입금 인증 및 37개 슬라이드 정밀 안내 가이드북이 짜잔 나타납니다! 가이드 이미지를 손가락으로 넘겨보시면서 따라 하시면 됩니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "PASS 앱 가이드 어디에 있나요? PASS 인증서 설치 방법",
    answer: "우선 화면 상단의 골드색 [국세청 안전 연동으로 내 숨은 환급금 무료 조회하기] 버튼을 눌러 조회를 시작하신 뒤, 본인인증 선택 화면 상단의 [PASS] 탭을 클릭하시면 PASS 앱 28개 슬라이드 전체 가이드북 및 1원 송금 계좌 인증 안내가 노출됩니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "하나은행 가이드 어디에 있나요? 하나원큐 인증서 발급 오류 해결법",
    answer: "화면 상단의 골드색 [국세청 안전 연동으로 내 숨은 환급금 무료 조회하기] 버튼을 눌러 조회를 진행하시고, 본인인증 선택 화면 상단의 [하나은행] 탭을 클릭하시면 하나원큐 앱 32개 슬라이드 가이드북이 노출됩니다. 90% 이상의 오류는 여권 이름과 계좌 개설 이름 불일치로 발생하며, 해결이 어려울 경우 계좌 인증이 필요 없는 PASS 또는 카카오톡 인증으로 전환하시면 됩니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "Step 0 예상 환급액 조회 화면 사용법 버튼 위치",
    answer: "Step 0 (예상 환급액 확인) 화면에서는 소득과 근무 기간 슬라이더를 조작하신 후, 맨 아래 골드색 [이어서 정밀 진단 시작하기] 버튼을 누르시면 Step 0.5 및 Step 1 사전 준비 단계로 이동합니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "Step 2 신분증 인증 외국인등록증 촬영 위치 버튼",
    answer: "Step 2 화면에서는 외국인등록증(ARC) 사진을 카메라로 촬영하거나 파일로 업로드하여 OCR 자동 인식을 진행한 후 하단 [다음 단계로 이동] 버튼을 클릭합니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "Step 3 휴대폰 본인 인증 입력창 및 통신사 선택",
    answer: "Step 3 화면에서는 휴대폰 번호 입력창에 번호를 적고 통신사를 선택한 뒤, AI 추천 영어 이름을 선택하고 [조회 정보 확인 완료] 버튼을 누르면 본인 인증이 요청됩니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "Step 5 인증 완료 대기 알림 승인 방법",
    answer: "Step 5 화면에서는 스마트폰 카카오톡/PASS/하나원큐 앱으로 전송된 본인인증 승인 알림 푸시를 수락하신 뒤, 이지텍스 앱으로 돌아와 하단 [인증 완료 및 데이터 분석] 버튼을 클릭하시면 국세청 5년 치 환급금 조회가 자동 실행됩니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "Step 9 환급 계좌 등록 1원 입금 인증 방법",
    answer: "Step 9 화면에서는 환급금을 지급받을 본인 명의 은행과 계좌번호를 입력한 후, 계좌로 입금된 1원의 입금자명 앞 4자리 난수를 입력하여 본인 계좌임을 인증합니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },
  {
    question: "Step 10 최종 수임 동의서 서명 사명 방법",
    answer: "Step 10 화면에서는 흰색 서명 패드 상자에 손가락으로 사인을 그린 뒤 하단 골드색 [서명 적용 및 환급 신청하기] 버튼을 누르면 국세청 환급 접수가 최종 완료됩니다.",
    category: "app_code_ui",
    source_type: "code_scan"
  },

  // -------------------------------------------------------------------------
  // 🧮 세무 계산 공식 & 시뮬레이터 로직 (TaxRefundSimulator.tsx & 세법 계산식)
  // -------------------------------------------------------------------------
  {
    question: "세금 환급금 계산 공식 소득세 감면액 어떻게 계산하나요? 환급 산출 로직",
    answer: "외국인 근로자 중소기업 소득세 감면(조세특례제한법 제30조) 계산 공식:\n1. 대상: 만 15세~34세 중소기업 취업 외국인 근로자 (E-9, E-7 등)\n2. 감면율: 원천징수 소득세의 90% 감면 (연간 최대 200만 원 한도)\n3. 적용 기간: 취업일로부터 5년 간 (최대 60개월)\n4. 소급 적용: 과거 5년 치 (2021년~2025년) 기납부 소득세 중 감면받지 못한 세금 전액 경정청구하여 본인 명의 계좌로 100% 환급.",
    category: "tax_formula",
    source_type: "code_scan"
  },
  {
    question: "소득과 근무 기간에 따른 예상 환급금 수치 예시 모의 조회 공식",
    answer: "이지텍스 환급 시뮬레이터 기준 예상 환급액 수치 가이드:\n- 평균 월급 250만 원, 3년(36개월) 근무 시: 약 180만 원 ~ 220만 원 환급\n- 평균 월급 300만 원, 5년(60개월) 근무 시: 최대 300만 원 ~ 350만 원 (연 200만 원 한도 적용)\n- 5개년 분할 산출 방식: 2021년(약 48만 원) + 2022년(약 62만 원) + 2023년(약 68만 원) + 2024년(약 75만 원) + 2025년(약 80만 원) 조합으로 5년 치 합산 입금됩니다.",
    category: "tax_formula",
    source_type: "code_scan"
  },
  {
    question: "외국인 국적별 환급 성공 사례 및 평균 환급금 시뮬레이션 데이터",
    answer: "국적별 평균 환급 성공 시뮬레이션 수치:\n- 베트남(NGUYỄN VĂN A, E-9): 5년 합산 평균 324만 원 ~ 345만 원 환급\n- 중국(ZHANG WEI, E-9): 5년 합산 평균 312만 원 환급\n- 네팔(RAM BAHADUR, E-9): 5년 합산 평균 308만 원 환급\n- 캄보디아(SOK SOPHEAK, E-9): 5년 합산 평균 295만 원 환급\n- 우즈베키스탄(JASURBEK, E-9): 5년 합산 평균 330만 원 환급",
    category: "tax_formula",
    source_type: "code_scan"
  },

  // -------------------------------------------------------------------------
  // ❓ 서비스 공식 FAQ 및 수수료/입금/보안 규정 (FloatingAiChat FAQ)
  // -------------------------------------------------------------------------
  {
    question: "Korea Tax Refund Service (이지텍스) 믿을 수 있나요? 사기나 피싱 아닌가요?",
    answer: "믿고 이용하셔도 100% 안전합니다. 3가지 확실한 이유:\n1. 환급금은 당사를 거치지 않고 대한민국 국세청(NTS)에서 고객님 본인 명의 계좌로 직접 입금됩니다.\n2. 대한민국 국가 공인 전문 세무사가 전담하여 정식 경정청구를 진행합니다.\n3. 사전 비용이 0원이며, 입금 확인 후 수수료를 받는 100% 후불제라 고객님 위험이 0입니다.",
    category: "faq_security",
    source_type: "code_scan"
  },
  {
    question: "수수료 22%는 왜 내야 하나요? 언제 결제하나요?",
    answer: "수수료(22%)는 과거 5년 치 세금 기록을 세무사가 직접 분석하고 국세청에 경정청구 서류를 대신 제출해 드리는 정식 수임료입니다. 100% 후불제로 신청 시 결제 금액은 0원이며, 국세청에서 고객님 통장으로 환급금이 실제 입금된 후에만 청구됩니다. 환급금이 0원이거나 실패 시 수수료는 단 1원도 청구되지 않습니다.",
    category: "faq_fee",
    source_type: "code_scan"
  },
  {
    question: "환급금 언제 입금되나요? 소요 기간",
    answer: "환급 신청 완료 후 국세청 심사를 거쳐 실제 통장으로 입금되기까지는 통상 45일에서 최대 60일 소요됩니다. 대한민국 국세청 관할 세무서 공무원이 지난 5년 치 기록을 정밀 검토하는 법정 심사 기간입니다.",
    category: "faq_timeline",
    source_type: "code_scan"
  },
  {
    question: "신분증 사진 보안 안전한가요? 촬영 사진 저장 여부",
    answer: "100% 안전합니다. 촬영하신 신분증 사진은 당사 서버나 휴대폰에 저장되지 않으며, 국세청 본인 확인 전송 직후 즉시 영구 파기됩니다. 시중 1금융권 은행과 동일한 최고 수준의 암호화 전송 보안이 적용됩니다.",
    category: "faq_security",
    source_type: "code_scan"
  },
  {
    question: "회사 사장님이나 인사팀에 연락이 가나요? 비밀 보장 여부",
    answer: "0.001%도 연락이 가지 않습니다! 대한민국 국세청과 신청자 본인 단둘만의 비밀 법적 절차입니다. 회사 사장님이나 공장 관계자에게 알림이나 통보가 전혀 가지 않으니 안심하세요.",
    category: "faq_privacy",
    source_type: "code_scan"
  },

  // -------------------------------------------------------------------------
  // 🏢 회사 정보 & 네비게이션 메뉴 지식 (Navbar.tsx, Footer.tsx)
  // -------------------------------------------------------------------------
  {
    question: "KTRS 이지텍스 회사 정보 사업자명 대표자 연락처 주소 이메일",
    answer: "Korea Tax Refund Service (KTRS) 운영사 정보:\n- 사업자명: 더윤컴퍼니\n- 대표자: 윤희수\n- 사업자 등록번호: 105-1278126\n- 통신판매업 신고번호: 제 2023-진접오남-0680호\n- 주소: 경기도 남양주시 부평로 48번길 140, 107-1102\n- 연락처: 010-5864-8577\n- 이메일: zkfnth021@gmail.com\n- 세무대리 협력: 본 플랫폼은 대한민국 국가공인 전문 세무법인 및 협력 세무사를 통해 정밀 검토 및 국세청 접수를 진행합니다.",
    category: "company_info",
    source_type: "code_scan"
  },
  {
    question: "웹사이트 상단 메뉴 네비게이션바 메뉴 구성 Navbar",
    answer: "이지텍스 웹사이트 네비게이션 주요 메뉴:\n1. [청년 소득세 90% 감면 제도안내] (/youth-tax)\n2. [가격 정책 (수수료 22% 후불)] (/pricing)\n3. [자주 묻는 질문] (/faq)\n4. [고객 센터] (/support)\n5. [나의 실시간 환급 현황] (/portal 또는 /login)\n6. 다국어 언어 변경 (한국어, 영어, 베트남어, 크메르어, 몽골어 등 15개국 다국어 지원)",
    category: "navigation",
    source_type: "code_scan"
  }
];

async function ingestAppCodebase() {
  console.log("🚀 Starting App Codebase UI Knowledge Ingestion into Supabase ai_knowledge_base...");

  let successCount = 0;
  for (const item of APP_CODE_KNOWLEDGE_BASE) {
    try {
      console.log(`Processing: "${item.question.substring(0, 30)}..."`);
      const embedding = await getEmbedding(item.question);

      // Upsert/Insert into ai_knowledge_base
      const { data: existing } = await supabaseAdmin
        .from('ai_knowledge_base')
        .select('id')
        .eq('question', item.question)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from('ai_knowledge_base')
          .update({
            answer: item.answer,
            category: item.category,
            source_type: item.source_type,
            embedding,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        console.log(`✅ Updated existing knowledge ID: ${existing.id}`);
      } else {
        await supabaseAdmin
          .from('ai_knowledge_base')
          .insert({
            question: item.question,
            answer: item.answer,
            category: item.category,
            source_type: item.source_type,
            embedding,
            hit_count: 1
          });
        console.log(`✅ Inserted new code UI knowledge.`);
      }
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to ingest item: "${item.question}"`, err);
    }
  }

  console.log(`\n🎉 Ingestion Completed! ${successCount}/${APP_CODE_KNOWLEDGE_BASE.length} items successfully loaded into Supabase ai_knowledge_base vector store.`);
}

ingestAppCodebase().catch(err => {
  console.error("Fatal ingestion error:", err);
  process.exit(1);
});
