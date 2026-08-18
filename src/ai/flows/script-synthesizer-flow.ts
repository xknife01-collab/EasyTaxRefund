import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ScriptSynthesizerInputSchema = z.object({
  targetStep: z.string().optional().default('general').describe("타겟 환급 단계 (예: 'Step 0: Estimate', 'Step 4: Auth', 'Step 9: Account', 'general')"),
  targetLanguage: z.string().optional().default('ko').describe("타겟 고객 언어/국적 (예: 'vi', 'zh', 'uz', 'ne', 'ko')"),
  targetPersonality: z.enum(['driver', 'skeptical', 'analytical', 'expressive', 'all']).optional().default('all').describe("타겟 고객 성향"),
  topPerformingScripts: z.array(z.string()).optional().describe("현재 전환율이 가장 높은 기존 모범 스크립트 목록"),
  count: z.number().optional().default(3).describe("새롭게 창작할 신규 화법 개수"),
});

export const SynthesizedScriptItemSchema = z.object({
  script_text: z.string().describe("새롭게 창작된 김준현 매니저의 독창적인 세일즈 스크립트 (구어체, 친근한 비유법, 설득력 있는 문장)"),
  target_psychology: z.string().describe("이 스크립트에 적용된 핵심 심리 기법 (예: '손실 회피 + 베트남 동료 성공사례 스토리텔링', '3분 완료 간편함 강조 + 작은 동의 사다리')"),
  refund_step: z.string().describe("적용 대상 환급 단계"),
  target_personality: z.enum(['driver', 'skeptical', 'analytical', 'expressive', 'all']).describe("가장 효과적인 고객 성향"),
  detected_language: z.string().describe("스크립트 작성 언어 코드"),
  rationale: z.string().describe("이 화법이 기존 스크립트보다 더 높은 전환율을 낼 것으로 기대되는 이유"),
});

export const ScriptSynthesizerOutputSchema = z.object({
  theme: z.string().describe("이번 자율 진화 화법 생성의 핵심 테마"),
  generatedScripts: z.array(SynthesizedScriptItemSchema).describe("새롭게 합성된 스크립트 목록"),
});

export type ScriptSynthesizerInput = z.infer<typeof ScriptSynthesizerInputSchema>;
export type ScriptSynthesizerOutput = z.infer<typeof ScriptSynthesizerOutputSchema>;

const scriptSynthesizerPrompt = ai.definePrompt({
  name: 'scriptSynthesizerPrompt',
  input: { schema: ScriptSynthesizerInputSchema },
  output: { schema: ScriptSynthesizerOutputSchema },
  prompt: `당신은 대한민국 최고 외국인 세무 환급 서비스(KTRS)의 '인공지능 세일즈 연구소장'입니다.
15년 차 베테랑 세무 영업 전문가 [김준현 공식 매니저]가 고객 대화에서 활용할 **새롭고 혁신적인 고전환율 영업 화법(A/B 테스트용 신규 스크립트)**을 자율적으로 창작하십시오.

[현재 분석 데이터]:
- 타겟 단계: {{{targetStep}}}
- 타겟 국적/언어: {{{targetLanguage}}}
- 타겟 고객 성향: {{{targetPersonality}}}
- 현재 최고 전환율을 기록 중인 모범 스크립트 참고본:
{{#if topPerformingScripts}}
{{#each topPerformingScripts}}
- "{{this}}"
{{/each}}
{{else}}
- (기존 모범 스크립트 데이터 없음 - 독창적인 신규 설득 화법 창작 필요)
{{/if}}

[자율 창작 핵심 지침]:
1. **단순 복사/변형 금지**: 기존 멘트의 단어만 바꾸지 말고, 완전히 새로운 비유법, 스토리텔링, 심리적 프레이밍을 시도하십시오.
2. **5대 필승 심리 기법 중 1~2개 이상 결합**:
   - **Loss Framing (손실 회피)**: "돈을 법니다" 대신 "5년 지나면 정부 국고로 영구 귀속되는 고객님 돈 최대 200만원을 지켜드립니다"
   - **Social Proof (사회적 증거)**: 국적과 직종을 구체적으로 언급하는 동료 환급 성공기 ("지난주에도 화성 공장 베트남 동료분이...")
   - **Pain Preemption (불안 선제 차단)**: 100% 후불제(선입금 0원), 회사/사장님 통보 0% 비밀보장, 국세청 직접 계좌 입금
   - **Micro-commitment (작은 동의 쌓기)**: 부담 없이 대답할 수 있는 2지선다 질문 ("카카오가 편하세요, PASS가 편하세요?")
   - **Metaphor & Warmth (인간적 비유)**: "숨겨둔 보너스 통장", "정부가 보관 중인 내 월급 찾기"
3. **고객 성향별 최적화**:
   - **driver (속전속결)**: 핵심 수치, 환급 소요 시간, 직관적 행동 유도.
   - **skeptical (신중/의심)**: 100% 후불제 원칙과 법적 비밀보장 팩트 제시.
   - **analytical (이성/꼼꼼)**: 조세특례제한법 제30조 및 5년 치 경정청구 원리 명쾌한 해설.
   - **expressive (친근)**: 따뜻한 공감과 감정 이입, 친근한 리액션.
4. **언어 형식**:
   - script_text는 기본적으로 한국어로 작성하되, 필요시 해당 국적 언어 화자의 심리적 특성을 반영하십시오. (시스템이 실시간 번역 및 다국어 챗에서 매핑하여 사용합니다)
   - 한 번에 읽기 편한 2~3문장의 메신저 구어체 톤앤매너 유지.

총 {{{count}}}개의 독창적인 신규 스크립트를 창작해 주십시오.`,
});

export const scriptSynthesizerFlow = ai.defineFlow(
  {
    name: 'scriptSynthesizerFlow',
    inputSchema: ScriptSynthesizerInputSchema,
    outputSchema: ScriptSynthesizerOutputSchema,
  },
  async (input) => {
    const { output } = await scriptSynthesizerPrompt(input);
    if (!output) {
      throw new Error('AI 스크립트 자율 생성에 실패했습니다.');
    }
    return output;
  }
);

export async function synthesizeNewScripts(input: ScriptSynthesizerInput): Promise<ScriptSynthesizerOutput> {
  return scriptSynthesizerFlow(input);
}
