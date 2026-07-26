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

[대화 상황]:
사용자가 우리 서비스를 이전에 상담하기 시작했으나, 아직 최종 환급 신청이나 무료 조회 완료 소식이 없는 상태입니다. 하루가 지난 시점에서 사용자에게 모국어로 안부 인사와 함께 따뜻하고 자연스러운 리마인드 메시지를 보내려고 합니다.

[작성 수칙]:
1. 사용자의 설정 언어({{{language}}})로 친절하고 따뜻한 안부 인사를 건네십시오. (예: "안녕하세요! KTRS 공식 매니저 김준현입니다. 잘 지내고 계신가요?")
2. 혹시 세금 환급금을 조회하시거나 본인 인증하는 과정에서 어려운 점이 있으셨는지 부드럽게 물어보십시오.
3. 저희 공식 웹사이트 링크인 "https://ktrs-service.vercel.app/?lang={{{language}}}"를 제공하며, 언제든지 편하게 조회를 마칠 수 있도록 상냥하게 유도하십시오.
4. 영업적인 푸시 느낌보다는 진심으로 돕고 싶어 하는 매니저의 인상을 남기도록 대화를 자연스럽게 작성하십시오.

동시에, 한국인 관리자를 위한 한 줄 한국어 요약(koreanSummary)도 함께 작성하십시오. (예: "네팔어 안부 리마인드 발송 완료")
`,
});

export async function askFollowUpAi(input: { language: string }) {
  const { output } = await followUpPrompt(input);
  if (!output) {
    throw new Error('AI 매니저 안부 인사 생성에 실패했습니다.');
  }
  return output;
}

