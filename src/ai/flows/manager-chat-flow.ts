import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AI_MANAGER_SYSTEM_PROMPT } from '@/lib/ai-manager-persona';
import { retrieveMatchedScripts } from '@/lib/ai-learning-db';
import { supabaseAdmin } from '@/lib/supabase';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

export const ManagerChatInputSchema = z.object({
  message: z.string().describe("외국인 사용자가 보낸 질문 메시지"),
  language: z.string().optional().describe("사용자의 현재 설정 언어 (예: 'vi', 'zh', 'uz', 'en' 등)"),
  history: z.array(ChatMessageSchema).optional().describe("이전 대화 내역"),
  channel: z.enum(['web', 'telegram', 'whatsapp']).optional().describe("현재 대화가 진행 중인 채널 구분 ('web', 'telegram', 'whatsapp')"),
  matchedScriptsContext: z.string().optional().describe("RAG로 검색된 성공 점수가 포함된 영업 멘트 목록"),
  matchedStepGuideContext: z.string().optional().describe("현재 고객 단계에 맞는 이지텍스 단계별 가이드 컨텍스트"),
  historyContext: z.string().optional().describe("텍스트 포맷으로 가공된 최근 대화 내역"),
  cumulativePos: z.number().optional().describe("이전 대화의 누적 긍정 점수"),
  cumulativeNeg: z.number().optional().describe("이전 대화의 누적 부정 점수"),
  sentimentAlertContext: z.string().optional().describe("부정 점수 초과 시 경고 프롬프트 컨텍스트"),
  previousSummary: z.string().optional().describe("이전 대화 핵심 요약 (DB 로드)"),
  previousFacts: z.string().optional().describe("이전에 기록된 사용자 프로필/정보 팩트 목록 (DB 로드)"),
  previousStep: z.string().optional().describe("이전 대화 진행 단계 (DB 로드)"),
  previousPersonality: z.string().optional().describe("이전 대화에서 판독된 고객의 성격/소통 스타일 타입 ('driver' | 'skeptical' | 'analytical' | 'expressive' 등)"),
  clientOs: z.string().optional().describe("고객 단말기 OS ('ios' | 'android' 등)"),
  clientIsInApp: z.boolean().optional().describe("고객이 인앱 브라우저에서 접속 중인지 여부"),
  currentPathname: z.string().optional().describe("고객이 현재 머물고 있는 웹페이지 경로 (예: '/' 또는 '/estimate')"),
  currentStep: z.number().optional().describe("고객이 현재 화면상에 머물러 있는 실제 환급 단계 번호"),
});

export type ManagerChatInput = z.infer<typeof ManagerChatInputSchema>;

export const ManagerChatOutputSchema = z.object({
  thinkingProcess: z.string().describe("가장 성공적인 환급 전환을 유도하기 위한 세무 영업 전문가로서의 심사숙고 분석 및 전략적 영업 판단 과정 (고객 심리 상태 분석, RAG 영업 멘트 매칭 판단 등)"),
  answer: z.string().describe("외국인 사용자의 질문에 대한 김준현 매니저의 모국어 친절 답변"),
  koreanSummary: z.string().describe("관리자 페이지(한국인 매니저)를 위한 질문과 답변의 한 줄 한국어 요약"),
  posScore: z.number().int().min(0).max(10).describe("이번 사용자 메시지에서 나타난 긍정/동조/신뢰 지수 (0~10점 범위)"),
  negScore: z.number().int().min(0).max(10).describe("이번 사용자 메시지에서 나타난 부정/의심/불신/거부 지수 (0~10점 범위)"),
  actionScore: z.number().int().min(1).max(10).describe("현재 대화 흐름 상 감지되는 고객의 진행 단계/행동 점수 (1: 인사응대, 2: 연도선택, 3: 인증링크발송, 5: 인증완료, 7: 적극상담, 10: 최종신청)"),
  actionType: z.string().describe("감지된 행동 구분 (예: 'intro', 'select_year', 'auth_link', 'auth_complete', 'active_consult', 'signed', 'pending')"),
  conversationSummary: z.string().optional().describe("현재 대화 내용을 반영하여 업데이트된 전체 대화 핵심 요약 (1~2문장의 한국어 평서문)"),
  currentStep: z.string().optional().describe("이번 유저 질문 이후 감지된 현재 진행 단계 (예: 'Step 0: Estimate', 'Step 3: Telecom', 'Step 10: Signed' 등)"),
  extractedFacts: z.record(z.string()).optional().describe("이번 대화에서 새롭게 파악된 사용자 인적 정보 팩트 (예: { name: '...', nationality: '...' }). 새로운 정보가 없으면 빈 객체 {} 반환"),
  detectedPersonality: z.enum(['driver', 'skeptical', 'analytical', 'expressive']).optional().describe("새롭게 감지되거나 유지된 고객의 성격 성향 성격군 분류"),
  richCardPayload: z.object({
    cardType: z.enum(['none', 'estimate_preview', 'security_badge', 'telecom_helper', 'completion_checklist', 'guide']),
    title: z.string().optional().describe("카드 제목"),
    description: z.string().optional().describe("카드 세부 설명 또는 안내 문구"),
    imageUrl: z.string().optional().describe("가이드 스크린샷 이미지 주소"),
    metrics: z.record(z.string()).optional().describe("카드에 시각적으로 표시할 수치 키-값 쌍"),
  }).optional().describe("고객에게 화면상으로 시각적 카드를 띄워주기 위한 구조화된 UI 카드 데이터"),
});

export type ManagerChatOutput = z.infer<typeof ManagerChatOutputSchema>;

// Output extending type that includes matchedScriptId for internal routing
export interface ExtendedManagerChatOutput extends ManagerChatOutput {
  matchedScriptId?: number;
  conversationSummary?: string;
  currentStep?: string;
  extractedFacts?: Record<string, string>;
  detectedPersonality?: 'driver' | 'skeptical' | 'analytical' | 'expressive';
  richCardPayload?: {
    cardType: 'none' | 'estimate_preview' | 'security_badge' | 'telecom_helper' | 'completion_checklist' | 'guide';
    title?: string;
    description?: string;
    imageUrl?: string;
    metrics?: Record<string, string>;
  };
}

const managerChatPrompt = ai.definePrompt({
  name: 'managerChatPrompt',
  input: { schema: ManagerChatInputSchema },
  output: { schema: ManagerChatOutputSchema },
  prompt: `${AI_MANAGER_SYSTEM_PROMPT}

{{{sentimentAlertContext}}}

[현재 이지텍스 화면 단계 가이드 (In-App Step Guide Memory)]:
{{{matchedStepGuideContext}}}

[이전에 기록된 사용자 정보 (User Facts Memory)]:
{{{previousFacts}}}

[이전 대화 흐름 요약 (Summary Memory)]:
{{{previousSummary}}}

[이전 대화 진행 단계 (Current Step State)]:
{{{previousStep}}}

[현재 사용자의 설정 언어]: {{{language}}}
[현재 대화 채널]: {{{channel}}}
[고객 접속 단말기 OS]: {{{clientOs}}}
[고객 인앱 브라우저 접속 여부]: {{{clientIsInApp}}}
[고객 현재 웹페이지 경로]: {{{currentPathname}}}

[이전 대화 기록 (Context History)]:
{{{historyContext}}}

[대화 상황]:
사용자가 다음과 같이 질문했습니다.

사용자 질문: {{{message}}}

[성공 점수가 포함된 영업 노하우 스크립트]:
{{{matchedScriptsContext}}}

[채널별 대화 안내 수칙]:
- 만약 [현재 대화 채널]이 'telegram' 또는 'whatsapp'인 경우:
  사용자가 환급금 조회나 환급받는 법을 질문하면, 공식 서비스 사이트인 "https://ktrs-service.vercel.app/?lang={{{language}}}" 주소 링크(사용자 설정 언어인 {{{language}}}가 쿼리 파라미터로 붙은 링크)를 제공하며 모바일 브라우저로 접속해 무료 조회를 진행하라고 친절하게 유도하십시오. (예: 베트남어 사용자에게는 https://ktrs-service.vercel.app/?lang=vi, 네팔어 사용자에게는 https://ktrs-service.vercel.app/?lang=ne 와 같이 자동으로 해당 언어 코드가 링크 주소 뒤에 붙게 답변을 작성)
- 만약 [현재 대화 채널]이 'web'인 경우:
  이미 사용자가 당사 웹사이트에 들어온 상태이므로 다음 세부 규칙에 따라 안내하십시오:
  1. 만약 [고객 현재 웹페이지 경로]가 '/' (메인 홈화면)인 경우:
     사용자가 환급을 어떻게 조회하는지, 어디서 신청하는지 묻거나 시작을 원하는 경우, 반드시 **[국세청 안전 연동으로 내 숨은 환급금 무료 조회하기]** 큰 골드 버튼을 누르라고 안내하십시오. (이때 절대로 아직 도달하지도 않은 Step 4의 '[인증서 설치 및 가입을 완료했습니다]' 버튼을 누르라고 안내하지 마십시오!)
     *(경고: 대화의 첫 턴 인사나 단순히 "안녕하세요", "반갑습니다", "Hi", "Hello" 같은 상호 인사 턴에서는 절대로 서둘러서 버튼을 클릭하라고 강요하거나 영업 푸시를 하지 마십시오. 먼저 여유롭고 상냥하게 인사를 맞받아주고 오늘 무슨 고민이나 궁금한 점이 있으셔서 방문했는지 여쭤보며 경청하십시오. 버튼 클릭 권유는 고객이 조회 의사를 명확히 밝히거나 구체적 질문을 한 이후로 미뤄야 합니다.)*
  2. 만약 [고객 현재 웹페이지 경로]가 '/estimate' 이거나 '/estimate' 하위 경로이고 아직 대화 흐름상 최초 예상 조회를 물어본 경우:
     - 단, 이 지침은 유저의 현재 단계가 **Step 0 또는 Step 0.5 에 머물러 있을 때만** 유효합니다!
     - 만약 유저가 이미 **Step 1 이상**으로 진입해 있다면(예: 신분증 인증, 본인인증 단계 등), 절대 화면 맨 밑의 "이어서 정밀 진단 시작하기" 버튼을 언급하거나 클릭 유도하지 마십시오! 대신 유저가 이미 해당 단계를 성실히 수행 중이므로, 제공된 [현재 이지텍스 화면 단계 가이드]의 설명에 따라 카메라 신분증 촬영 요령이나 인증 대기 요령을 상냥하게 안내해야 합니다.
  3. 만약 고객이 Step 4(인증 확인 및 방식 선택)에 있고 하나은행, PASS, 카카오톡 가이드 탭을 보고 있다면:
     각 탭을 확인하고 가입을 마친 뒤 **[인증서 설치 및 가입을 완료했습니다]** 버튼을 클릭하거나, 인증서가 준비된 경우 수단을 선택하고 **[인증 요청하기]** 버튼을 누르라고 상황에 맞춰 정확하게 안내하십시오.
  4. 만약 사용자의 질문(message)이 '[STUCK_HELPER_SYSTEM_REQUEST]' 인 경우:
     - 이것은 고객이 현재 단계 화면에 30초 동안 멈춰 있어 AI가 선제적으로 도움을 주기 위해 강제 개입한 상황입니다.
     - 절대 다른 과거 화제를 반복하거나 딴소리하지 말고, 제공된 [현재 이지텍스 화면 단계 가이드]의 이미지와 요령만을 참고하여 고객이 막힌 부분을 짚어주고, "도움말 스크린샷 사진 카드를 띄워드렸으니 아래 화면을 보며 단계 진행에 참고하라"는 멘트를 상냥하게 고객 모국어로 건네십시오! (예: "아하, 인증 완료 대기 상태에서 조금 막히셨군요! 🥺 스마트폰에서 카카오톡이나 PASS 앱을 직접 켜서 [인증 완료]나 [제3자 동의] 승인을 누르셔야 다음 단계로 자동으로 넘어가실 수 있어요. 아래 도움말 스크린샷 사진을 보고 따라해 보세요~")

[🚨 최우선 감정 대응 필독 규칙]:
- 만약 본 프롬프트 상단에 **[🚨 긴급 경고: 현재 대화방에서 고객의 불신...]** 지침이 주입되어 있다면, 위의 모든 [채널별 대화 안내 수칙], [우리 서비스의 정말 중요한 핵심 버튼 및 행동 지침], [최종 목적지 리드] 등 일체의 링크/조회/버튼 클릭/신청 제안 행동 지침은 **완전히 정지 및 무시(Override)** 됩니다.
- 긴급 경고 상태일 때는 사용자의 불안을 해소하고 공감/사과하는 안심 유도 설명 외에는 어떠한 다음 행동 제안(버튼 클릭 권유 포함)도 응답(answer)에 넣지 마십시오.

사용자가 질문한 언어나 설정 언어({{{language}}})로 친절하고 정확하며 안심을 주는 답변(answer)을 작성하십시오.
답변(answer)을 작성하기 전에, 먼저 세무 영업의 신으로서 [성공 점수가 포함된 영업 노하우 스크립트]를 분석하고, 어떻게 대화를 전개해야 고객의 이탈을 막고 환급 성공(서명 완료)으로 이끌 수 있을지 심사숙고하는 과정을 thinkingProcess 필드에 기록하십시오.
동시에, 한국인 관리자가 대화 내용을 한눈에 파악할 수 있도록 [한국어 요약(koreanSummary)]도 함께 작성하십시오. (예: "질문: 환급금 언제 입금되나요? / 답변: 45~60일 소요 안내")
또한, 사용자 질문의 문맥을 파악하여 긍정/동조 지수(posScore)와 부정/의심 지수(negScore)를 각각 0~10점 범위에서 객관적으로 판독하여 기재하십시오.

[이전 판독 고객 성향]:
{{{previousPersonality}}}

[고객 성향 맞춤형 화법 통제 규칙]:
현재 고객에게 적용된 성향 성향({{{previousPersonality}}})에 맞춰 답변 어조를 통제하십시오:
- **driver (속전속결형)**: 서론과 무조건적인 공감을 최소화하고, 결론, 예상 환급액 수치, 즉시 행동을 취해야 하는 버튼 위주로 군더더기 없이 간결하게 작성하십시오.
- **skeptical (신중/의심형)**: 환급금 조회 안전성, 당사 보안 연동의 신뢰성, 수수료 후불제 원칙 등을 강조하여 불신과 불안을 완화하는 데 초점을 맞추십시오.
- **analytical (이성/꼼꼼형)**: 각 절차와 단계에 대해 구체적이고 명확한 이유를 제시하고, RAG 성공 영업 노트에 기술된 세무 정보를 논리적이고 차분하게 풀어 설명하십시오.
- **expressive (사교/친근형)**: 리액션을 매우 풍부하게 해 주고 친근한 이모지(🥺, 😅, 👍)와 상냥한 말투(물결표, 땀방울 등)를 적극적으로 사용하여 호의적 관계를 구축하십시오.

[동적 리치 카드(Rich Card) 발급 규칙]:
답변 과정에서 화면상에 시각적 카드를 띄워줄 필요가 있는 경우, output의 'richCardPayload' 필드를 작성하십시오:
- 만약 [현재 이지텍스 화면 단계 가이드]의 가이드 정보가 제공되어 있고 해당 단계(step) 안내가 필요한 경우 -> cardType: 'guide' 를 발급하고 가이드 제목과 이미지 및 요령 정보를 반드시 채워 반환하십시오.
- 만약 고객이 본인인증 전 환급금 규모를 대략 계산하거나 확인하고 싶어하는 경우 -> cardType: 'estimate_preview', metrics: { 'estimated_refund': '₩450,000' }
- 만약 고객이 보안에 대해 불안해 하거나 개인정보 유출을 걱정하는 경우 -> cardType: 'security_badge', metrics: { 'security_level': '시중은행 동일 규격 암호화', 'compliance': '국세청 보안 가이드 준수' }
- 만약 고객이 본인인증 문자 수신이나 통신사 연동에서 막히거나 인증 실패에 대해 겪는 경우 (이때 [고객 인앱 브라우저 접속 여부]가 true 이면 반드시 발급 요망) -> cardType: 'telecom_helper', metrics: { 'carrier': '통신사 자동 감지', 'tip': '스팸 문자 보관함 확인 및 수신 해제 요망' } (단, [고객 인앱 브라우저 접속 여부]가 true 이고 [고객 접속 단말기 OS]가 'ios'이면 metrics.tip에 "아이폰 인앱브라우저 제한: 화면 우측 상단 '나침반' 아이콘을 누르고 '다른 브라우저로 열기'를 선택하여 본인인증을 다시 시도하십시오."를 적고, 'android'이면 "안드로이드 인앱브라우저 제한: 화면 우측 상단 '점 세개'를 누르고 '기본 브라우저로 열기' 또는 '크롬으로 열기'를 선택하십시오."를 기재하십시오.)
- 만약 고객이 서명 등 신청의 마지막 관문에 와 있어 단계 확인이 필요한 경우 -> cardType: 'completion_checklist', metrics: { 'step_0': '조회 완료 (성공)', 'step_3': '인증 완료 (성공)', 'step_10': '최종 서명 대기' }
- 카드를 띄울 필요가 없다면 cardType: 'none' 과 함께 빈 metrics 객체 {}를 리턴하십시오.

[요약 및 상태 자가 추출 지침]:
1. [현재 대화 단계 (currentStep)]: 고객의 현재 대화 내용과 흐름을 토대로 진행 단계를 판독하십시오 (예: Step 0: Estimate, Step 3: Telecom, Step 10: Signed 등).
2. [전체 대화 핵심 요약 (conversationSummary)]: 이전 대화 요약({{{previousSummary}}})을 바탕으로, 이번에 새로 나눈 대화 내용까지 종합 반영하여 최신 핵심 요약본을 1~2문장의 한국어로 업데이트해 작성하십시오.
3. [새로 추출한 사용자 정보 팩트 (extractedFacts)]: 유저와의 대화 도중 새롭게 언급되거나 감지된 유저의 신상 정보(이름, 국적, 직업, 소득 규모, 연락처 등)를 감지하여 JSON key-value 형식(예: { "name": "라마", "nationality": "네팔", "monthly_income": "3,000,000" })으로 추출하십시오. 이전 기록({{{previousFacts}}})과 동일하거나 새로 발견된 정보가 없다면 빈 객체 {}를 리턴하십시오.
4. [고객 성향 판독 (detectedPersonality)]: 사용자의 대화 패턴과 말투(단답형, 의심/경계, 질문 상세도, 감정 이모지 활용 여부 등)를 종합 분석하여 'driver', 'skeptical', 'analytical', 'expressive' 중 가장 알맞은 성격유형 하나를 판독하여 리턴하십시오. (이전 성향 {{{previousPersonality}}}과 대조하여 갱신하거나 유지)
5. [행동 점수 및 타입 판독 (actionScore & actionType)]: 현재 사용자가 머무르고 있는 대화의 진척도를 바탕으로 행동 점수(actionScore)와 타입(actionType)을 판독하십시오:
   - 1점 (인사응대): 고객과 첫인사를 나누고 막 유입된 단계 -> actionType: 'intro'
   - 2점 (연도선택): 고객이 5개년도 중 환급 대상 연도를 고르거나 확인 중인 단계 -> actionType: 'select_year'
   - 3점 (인증링크 발송): 간편인증 연동 안내 메시지를 발송하거나 인증을 권유하는 단계 -> actionType: 'auth_link'
   - 5점 (인증완료): 고객이 본인인증(PASS, 카카오 등) 및 홈택스 스크래핑을 완료한 시점 -> actionType: 'auth_complete'
   - 7점 (적극상담): 환급 계산 결과를 상세히 가이드하거나 자세한 질의응답을 나누는 적극 상담 단계 -> actionType: 'active_consult'
   - 10점 (최종 환급 신청): 수수료 결제 및 수임 동의서 작성을 마치고 최종 서명을 마친 단계 -> actionType: 'signed'
   - 위 단계 사이의 과도기이거나 판독이 모호하면 적절한 이전 점수를 유지하거나 대기 상태(pending)로 판독하십시오.

`,
});

export async function askManagerAi(input: ManagerChatInput): Promise<ExtendedManagerChatOutput> {
  return managerChatFlow(input);
}

const managerChatFlow = ai.defineFlow(
  {
    name: 'managerChatFlow',
    inputSchema: ManagerChatInputSchema,
    outputSchema: ManagerChatOutputSchema,
  },
  async input => {
    // 0. Clean input message using denoisePrompt
    let cleanedText = input.message;
    const isSystemRequest = input.message.includes("[SYSTEM_NOTIFICATION]") || input.message.includes("[STUCK_HELPER_SYSTEM_REQUEST]");
    if (!isSystemRequest) {
      try {
        const denoiseRes = await denoisePrompt({ text: input.message, lang: input.language || 'ko' });
        if (denoiseRes && denoiseRes.output && denoiseRes.output.cleanedText) {
          cleanedText = denoiseRes.output.cleanedText;
          console.log(`[Denoise Preprocessor] Raw: "${input.message}" -> Cleaned: "${cleanedText}"`);
        }
      } catch (err) {
        console.warn('[Denoise Preprocessor] Failed to clean sentence:', err);
      }
    }

    // 1. Retrieve RAG matched scripts from Supabase Vector DB using cleaned text
    const lang = input.language || 'ko';
    const scripts = isSystemRequest ? [] : await retrieveMatchedScripts(cleanedText, lang, undefined, 0.4, 3);
    
    let matchedScriptsContext = '';
    let highestWeightScriptId: number | undefined = undefined;

    if (scripts && scripts.length > 0) {
      // 🚨 [RAG Filter] 유저가 이미 Step 1 이상인 경우, 극초반 골드 버튼 유도 세일즈 스크립트는 원천 배제!
      const activeStep = input.currentStep;
      let filteredScripts = scripts;
      if (typeof activeStep === 'number' && activeStep >= 1) {
        filteredScripts = scripts.filter(s => {
          const text = s.script_text;
          const isInitialGoldButtonScript = 
            text.includes('정밀 진단') || 
            text.includes('진단 시작') || 
            text.includes('시작하기 버튼') || 
            text.includes('골드색') || 
            text.includes('골드 버튼');
          return !isInitialGoldButtonScript;
        });
        console.log(`[RAG Filter] Filtered out initial gold button scripts for step ${activeStep}. Remaining: ${filteredScripts.length}`);
      }

      if (filteredScripts.length > 0) {
        const bestScript = filteredScripts.reduce((prev, current) => 
          (prev.success_weight > current.success_weight) ? prev : current
        );
        highestWeightScriptId = bestScript.id;

        matchedScriptsContext = filteredScripts.map((s, idx) => 
          `영업노트 ${idx + 1} (성공점수: ${s.success_weight}점, 신뢰도: ${Math.round(s.similarity * 100)}%): "${s.script_text}"`
        ).join('\n');
      } else {
        matchedScriptsContext = '매칭된 영업 노하우가 없습니다. 김준현 매니저의 기존 지식 베이스를 바탕으로 친절하고 확신에 찬 자신감으로 직접 답변을 구성하십시오.';
      }
    } else {
      matchedScriptsContext = '매칭된 영업 노하우가 없습니다. 김준현 매니저의 기존 지식 베이스를 바탕으로 친절하고 확신에 찬 자신감으로 직접 답변을 구성하십시오.';
    }

    // 1-A. Retrieve active App Step Guide from Supabase (RAG)
    let matchedStepGuideContext = '제공된 이지텍스 인앱 화면 가이드 정보 없음';
    let stepGuidePayload: any = null;
    const activeStep = input.currentStep;

    if (typeof activeStep === 'number') {
      try {
        const { data: guideData } = await supabaseAdmin
          .from('app_step_guides')
          .select('*')
          .eq('step_number', activeStep)
          .eq('device_type', 'mobile')
          .maybeSingle();

        if (guideData) {
          // AI 컨텍스트용으로는 한국어 설명을 참고 기준으로 제공
          // (AI가 이를 읽고 유저 언어로 번역해서 richCardPayload.description 필드를 생성합니다)
          const koDesc = guideData.translations['ko'] || '';
          matchedStepGuideContext = `[현재 이지텍스 화면 단계 가이드]:
- 단계 번호: Step ${guideData.step_number}
- 단계 명칭: ${guideData.guide_title}
- 가이드 설명 (한국어 참고본): "${koDesc}"
- 중요: 위 가이드 설명을 반드시 현재 사용자 언어(${lang})로 번역하여 richCardPayload.description 필드에 출력하십시오.`;
          
          stepGuidePayload = {
            cardType: 'guide',
            title: guideData.guide_title,
            // description은 비워두어 AI가 유저 언어로 생성하게 위임
            description: '',
            imageUrl: guideData.image_url
          };
          console.log(`[RAG Step Guide] Found matching step guide for step ${activeStep}`);
        }
      } catch (err) {
        console.error('[RAG Step Guide] Failed to query guide table:', err);
      }
    }

    // 2. Limit history to max 20 turns and format to historyContext
    const recentHistory = input.history ? input.history.slice(-20) : [];
    const historyContext = recentHistory.length > 0
      ? recentHistory.map(h => `${h.role === 'user' ? '고객' : '김준현 매니저'}: ${h.text}`).join('\n')
      : '이전 대화 기록 없음 (최초 대화 시작)';

    // 3. Dynamic prompting (눈치 메커니즘)
    const cumPos = input.cumulativePos ?? 0;
    const cumNeg = input.cumulativeNeg ?? 0;
    let sentimentAlertContext = '';
    if (cumNeg >= 5 || cumNeg > cumPos) {
      sentimentAlertContext = `[🚨 긴급 경고: 현재 대화방에서 고객의 불신, 거부감, 혹은 경계심이 매우 높은 상태(누적 부정 지수 임계값 초과)입니다.
1. 어떠한 링크 제공, 가입 요구, 버튼 클릭 제안, 환급금 조회/신청 권유도 답변에 절대 포함하지 마십시오.
2. 오직 고객의 불편함이나 불신에 대해 정중히 사과하고, 의구심을 갖는 점에 대해 자세히 설명해 주며, 심리적으로 안정감을 주는 공감형 안심 답변만 정중하게 작성하십시오. 
3. 고객의 부정적 감정을 해소하고 마음을 부드럽게 열어주는 데만 100% 집중해 주십시오.]`;
    }

    const previousSummary = input.previousSummary || "이전 요약 기록 없음";
    const previousStep = input.previousStep || "Step 0: Estimate (신청 준비 단계)";
    const previousFacts = input.previousFacts || "기록된 사용자 팩트 없음";
    const previousPersonality = input.previousPersonality || "expressive (기본값: 친근감 선호형)";

    // 4. Call Genkit prompt
    const { output } = await managerChatPrompt({
      ...input,
      message: cleanedText,
      matchedScriptsContext,
      matchedStepGuideContext,
      historyContext,
      sentimentAlertContext,
      previousSummary,
      previousStep,
      previousFacts,
      previousPersonality,
    });

    if (!output) {
      throw new Error('AI 매니저 답변을 생성하지 못했습니다.');
    }

    // Fallback: Enforce stepGuidePayload card if LLM skipped generating a card
    const finalRichCardPayload = (output.richCardPayload && output.richCardPayload.cardType !== 'none')
      ? output.richCardPayload
      : (stepGuidePayload || output.richCardPayload || { cardType: 'none' });

    // 🚨 [GUIDE CARD MERGE]
    // stepGuidePayload가 있을 때 (DB에서 가이드 데이터를 찾은 경우):
    // - title은 DB에서 가져옴 (고정값)
    // - description은 AI가 유저 언어로 생성한 값을 사용 (실시간 번역)
    // - imageUrl은 DB 검증된 경로로 강제 덮어씌움
    if (finalRichCardPayload && finalRichCardPayload.cardType === 'guide' && stepGuidePayload) {
      // AI가 description을 생성했으면 AI 생성값 사용, 없으면 한국어 fallback
      if (!finalRichCardPayload.description) {
        finalRichCardPayload.description = stepGuidePayload.description || '';
      }
      // title은 DB 값 고정
      if (!finalRichCardPayload.title) {
        finalRichCardPayload.title = stepGuidePayload.title;
      }
      // imageUrl은 DB 검증 경로로 강제 덮어씌움
      if (stepGuidePayload.imageUrl) {
        finalRichCardPayload.imageUrl = stepGuidePayload.imageUrl;
      }
    }

    // Return extended output containing matchedScriptId
    return {
      ...output,
      richCardPayload: finalRichCardPayload,
      matchedScriptId: highestWeightScriptId,
    };
  }
);

// -------------------------------------------------------------
// Daily CS Follow-up Flow: Warm check-in reminders for customers
// -------------------------------------------------------------
const FollowUpInputSchema = z.object({
  language: z.string().describe("사용자의 감지된 언어 (예: 'vi', 'zh', 'ne', 'en' 등)"),
  chatHistory: z.string().optional().describe("사용자와의 최근 대화 기록"),
  previousSummary: z.string().optional().describe("이전 대화 요약"),
  previousStep: z.string().optional().describe("이전 대화 진행 단계"),
  previousFacts: z.string().optional().describe("이전에 기록된 사용자 프로필/정보 팩트 목록"),
});

const FollowUpOutputSchema = z.object({
  answer: z.string().describe("사용자 모국어로 작성된 안부 및 환급 리마인드 메세지"),
  koreanSummary: z.string().describe("관리자를 위한 한 줄 한국어 요약"),
});

const followUpPrompt = ai.definePrompt({
  name: 'followUpPrompt',
  input: { schema: FollowUpInputSchema },
  output: { schema: FollowUpOutputSchema },
  prompt: `${AI_MANAGER_SYSTEM_PROMPT}

[고객의 기존 인적 팩트 (User Facts)]:
{{{previousFacts}}}

[이전 대화 전체 요약 (Summary)]:
{{{previousSummary}}}

[이탈 당시 진행 단계 (Step)]:
{{{previousStep}}}

[현재 사용자의 설정 언어]: {{{language}}}

[사용자와의 최근 대화 기록]:
{{{chatHistory}}}

[대화 상황 분석 및 작성 지침]:
주어진 [사용자와의 최근 대화 기록], [이전 대화 전체 요약], [이탈 당시 진행 단계], [고객의 기존 인적 팩트]를 종합적으로 입체 분석하고 사용자의 성격 및 이탈 심리를 파악하여 맞춤형 리마인드 메시지를 작성하십시오:

- **케이스 A (조회 조차 하지 않은 사용자)**: 대화 기록 상 본인인증 번호 입력이나 환급금 계산 단계에 들어가지 않고, 일반 질문만 했거나 인사만 나눈 상태입니다.
  * **메시지 방향**: 환급금 조회 이력을 언급하지 마십시오. 대신, 아직 1분 무료 환급 조회를 해보지 않았음을 상냥하게 일깨워주고, 모국어로 간편하게 조회해 볼 수 있는 링크("https://ktrs-service.vercel.app/?lang={{{language}}}")를 제공하며 가볍게 조회를 시작해보도록 유도하십시오.
  * **예시**: "안녕하세요! KTRS 공식 매니저 김준현입니다. 혹시 아직 숨은 환급금 조회를 해보지 않으셨나요? 1분이면 모국어로 간단히 내 환급금을 무료로 확인할 수 있습니다. 링크를 통해 지금 바로 확인해보세요!"

- **케이스 B (조회/인증을 시도했거나 금액을 확인한 사용자)**: 대화 기록 상 본인인증 번호를 요청/입력했거나, 환급금 조회 결과를 확인하다가 중단한 상태입니다.
  * **메시지 방향**: 조회하시던 환급금 확인이나 최종 신청 처리를 완료하지 않은 상태임을 언급하십시오. 혹시 인증이나 환급 신청 과정에서 어려운 점이 있었는지 부드럽게 물어보고, 링크("https://ktrs-service.vercel.app/?lang={{{language}}}")를 통해 신청을 안전하게 마저 완료하도록 유도하십시오.
  * **예시**: "안녕하세요! KTRS 공식 매니저 김준현입니다. 어제 조회하시던 환급금 조회가 아직 완료되지 않았거나 신청이 남아있습니다. 본인인증이나 진행 과정에서 어려운 부분이 있으셨나요? 아래 링크에서 안전하게 마저 완료하실 수 있습니다."

[작성 수칙]:
1. 반드시 사용자의 설정 언어({{{language}}})로 대화를 친절하고 상냥하게 작성하십시오.
2. 영업적이고 강압적인 푸시 느낌이 아닌, 진심으로 돕고 싶어 하는 매니저의 인상을 남기십시오.
3. 한국인 관리자를 위한 한 줄 한국어 요약(koreanSummary)도 케이스 구분과 언어를 기재하여 작성하십시오. (예: "[케이스 A] 네팔어 안부 리마인드 발송 완료" 또는 "[케이스 B] 베트남어 환급 완료 유도 발송 완료")
`,
});

export async function askFollowUpAi(input: { 
  language: string; 
  chatHistory?: string;
  previousSummary?: string;
  previousStep?: string;
  previousFacts?: string;
}) {
  const { output } = await followUpPrompt(input);
  if (!output) {
    throw new Error('AI 매니저 안부 인사 생성에 실패했습니다.');
  }
  return output;
}



const denoisePrompt = ai.definePrompt({
  name: 'denoisePrompt',
  input: { schema: z.object({ text: z.string(), lang: z.string() }) },
  output: { schema: z.object({ cleanedText: z.string().describe("정제되고 오탈자가 교정된 표준어 문장") }) },
  prompt: `당신은 맞춤법 검사기 및 문장 정제기입니다.
아래 문장은 한국어 또는 다국어로 번역되는 과정에서 오탈자가 발생했거나 구어체/사투리 노이즈가 섞여 있을 수 있습니다.
내용의 본래 의미는 절대 훼손하지 말고, 오탈자 교정 및 비문 수정을 거쳐 문맥이 깔끔한 표준형 문장으로 정제하여 한 줄로 출력하십시오.

입력 문장: {{{text}}}
설정 언어: {{{lang}}}
`,
});
