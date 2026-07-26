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

[대화 상황]:
사용자가 다음과 같이 질문했습니다.

사용자 질문: {{{message}}}

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
