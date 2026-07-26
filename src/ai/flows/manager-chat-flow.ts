import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AI_MANAGER_SYSTEM_PROMPT } from '@/lib/ai-manager-persona';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

export const ManagerChatInputSchema = z.object({
  message: z.string().describe("외국인 사용자가 보낸 질문 메시지"),
  language: z.string().optional().describe("사용자의 현재 설정 언어 (예: 'vi', 'zh', 'uz', 'en' 등)"),
  history: z.array(ChatMessageSchema).optional().describe("이전 대화 내역"),
  channel: z.enum(['web', 'telegram', 'whatsapp']).optional().describe("현재 대화가 진행 중인 채널 구분 ('web', 'telegram', 'whatsapp')"),
});

export type ManagerChatInput = z.infer<typeof ManagerChatInputSchema>;

export const ManagerChatOutputSchema = z.object({
  answer: z.string().describe("외국인 사용자의 질문에 대한 김준현 매니저의 모국어 친절 답변"),
  koreanSummary: z.string().describe("관리자 페이지(한국인 매니저)를 위한 질문과 답변의 한 줄 한국어 요약"),
});

export type ManagerChatOutput = z.infer<typeof ManagerChatOutputSchema>;

const managerChatPrompt = ai.definePrompt({
  name: 'managerChatPrompt',
  input: { schema: ManagerChatInputSchema },
  output: { schema: ManagerChatOutputSchema },
  prompt: `${AI_MANAGER_SYSTEM_PROMPT}

[현재 사용자의 설정 언어]: {{{language}}}
[현재 대화 채널]: {{{channel}}}

[대화 상황]:
사용자가 다음과 같이 질문했습니다.

사용자 질문: {{{message}}}

[채널별 대화 안내 수칙]:
- 만약 [현재 대화 채널]이 'telegram' 또는 'whatsapp'인 경우:
  사용자가 환급금 조회나 환급받는 법을 질문하면, 공식 서비스 사이트인 "https://ktrs-service.vercel.app/?lang={{{language}}}" 주소 링크(사용자 설정 언어인 {{{language}}}가 쿼리 파라미터로 붙은 링크)를 제공하며 모바일 브라우저로 접속해 무료 조회를 진행하라고 친절하게 유도하십시오. (예: 베트남어 사용자에게는 https://ktrs-service.vercel.app/?lang=vi, 네팔어 사용자에게는 https://ktrs-service.vercel.app/?lang=ne 와 같이 자동으로 해당 언어 코드가 링크 주소 뒤에 붙게 답변을 작성)
- 만약 [현재 대화 채널]이 'web'인 경우:
  이미 사용자가 당사 웹사이트에 들어온 상태이므로, 외부 링크를 소개하지 말고 "지금 보고 계신 화면에서 바로 0단계 조회를 시작해 주세요" 혹은 "화면의 버튼을 눌러 조회를 진행해 주세요"라고 이미 사이트에 접속해 있음을 전제하고 안내하십시오.

사용자가 질문한 언어나 설정 언어({{{language}}})로 친절하고 정확하며 안심을 주는 답변(answer)을 작성하십시오.
동시에, 한국인 관리자가 대화 내용을 한눈에 파악할 수 있도록 [한국어 요약(koreanSummary)]도 함께 작성하십시오. (예: "질문: 환급금 언제 입금되나요? / 답변: 45~60일 소요 안내")
`,
});

export async function askManagerAi(input: ManagerChatInput): Promise<ManagerChatOutput> {
  return managerChatFlow(input);
}

const managerChatFlow = ai.defineFlow(
  {
    name: 'managerChatFlow',
    inputSchema: ManagerChatInputSchema,
    outputSchema: ManagerChatOutputSchema,
  },
  async input => {
    const { output } = await managerChatPrompt(input);
    if (!output) {
      throw new Error('AI 매니저 답변을 생성하지 못했습니다.');
    }
    return output;
  }
);

// -------------------------------------------------------------
// Daily CS Follow-up Flow: Warm check-in reminders for customers
// -------------------------------------------------------------
const FollowUpInputSchema = z.object({
  language: z.string().describe("사용자의 감지된 언어 (예: 'vi', 'zh', 'ne', 'en' 등)"),
  chatHistory: z.string().optional().describe("사용자와의 최근 대화 기록"),
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

[현재 사용자의 설정 언어]: {{{language}}}

[사용자와의 최근 대화 기록]:
{{{chatHistory}}}

[대화 상황 분석 및 작성 지침]:
주어진 [사용자와의 최근 대화 기록]을 보고 사용자의 상태를 2가지 케이스 중 하나로 판별하여 맞춤형 리마인드 메시지를 작성하십시오:

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

export async function askFollowUpAi(input: { language: string; chatHistory?: string }) {
  const { output } = await followUpPrompt(input);
  if (!output) {
    throw new Error('AI 매니저 안부 인사 생성에 실패했습니다.');
  }
  return output;
}

