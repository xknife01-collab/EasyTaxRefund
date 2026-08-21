import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';
import { enforceLanguageGuard } from '@/ai/flows/manager-chat-flow';

// ─── Schema ────────────────────────────────────────────────────────────────
const VisionAnalysisInputSchema = z.object({
  imageBase64: z.string().describe("Base64 인코딩된 이미지 데이터"),
  mimeType: z.string().optional().describe("이미지 MIME 타입 (image/jpeg, image/png 등)"),
  caption: z.string().optional().describe("고객이 이미지와 함께 보낸 텍스트 메시지"),
  language: z.string().optional().describe("고객의 현재 설정 언어 (예: 'vi', 'en', 'ko')"),
  previousStep: z.string().optional().describe("이전 대화에서 파악된 현재 단계"),
  previousSummary: z.string().optional().describe("이전 대화 요약"),
});

const VisionAnalysisOutputSchema = z.object({
  detectedStep: z.string().describe("감지된 KTRS 앱 단계 (예: 'Step 3: 본인인증 정보 입력', 'Step 5: 인증 대기', '앱 외부 화면' 등)"),
  problemDescription: z.string().describe("화면에서 감지된 문제점 또는 막힌 지점에 대한 한국어 설명"),
  guidanceMessage: z.string().describe("김준현 매니저 스타일로 고객 언어에 맞춰 작성된 친절한 가이드 답변"),
  isKtrsScreen: z.boolean().describe("이 화면이 KTRS 환급 앱의 화면인지 여부"),
  confidence: z.number().min(0).max(100).describe("단계 감지 신뢰도 (0~100%)"),
  koreanSummary: z.string().describe("관리자를 위한 한국어 요약 (예: '고객이 Step 4 인증서 선택 화면 스크린샷 전송 → 카카오톡 탭 안내')"),
});

export type VisionAnalysisInput = z.infer<typeof VisionAnalysisInputSchema>;
export type VisionAnalysisOutput = z.infer<typeof VisionAnalysisOutputSchema>;

// ─── Vision Prompt ─────────────────────────────────────────────────────────
const visionAnalysisFlow = ai.defineFlow(
  {
    name: 'visionAnalysisFlow',
    inputSchema: VisionAnalysisInputSchema,
    outputSchema: VisionAnalysisOutputSchema,
  },
  async (input) => {
    const lang = input.language || 'en';
    const caption = input.caption || '';
    const mimeType = input.mimeType || 'image/jpeg';

    const systemPrompt = `당신은 대한민국 'Korea Tax Refund Service (KTRS)'의 공식 세무 매니저 김준현입니다.
고객이 현재 KTRS 환급 앱 화면의 스크린샷을 보내왔습니다. 이 이미지를 분석하여 다음을 수행하십시오:

[분석 목표]:
1. 이 화면이 KTRS 환급 앱(easy-tax-refund)의 화면인지 판별하십시오.
2. KTRS 앱 화면이라면, 아래 단계 목록 중 정확히 어떤 단계(Step)의 화면인지 판별하십시오:
   - Step 0: 예상 환급액 조회 (슬라이더로 근무 기간, 급여 조작)
   - Step 0.5: 환급 과정 안내 (4단계 로드맵 설명)
   - Step 1: 사전 준비 (신분증, 스마트폰 소지 확인)
   - Step 2: 신분증 정보 입력 (외국인등록증 OCR 촬영)
   - Step 3: 휴대폰 본인 인증 정보 입력 (통신사, 전화번호, 이름 입력)
   - Step 4: 인증서 선택 및 가이드 (하나은행/PASS/카카오톡 탭)
   - Step 5: 본인인증 승인 대기 (푸시 알림 수락 대기)
   - Step 6: 데이터 분석 중 (홈택스 스크래핑 로딩)
   - Step 7: 예상 환급금 진단 보고서 (연도별 환급액 결과)
   - Step 8: 국세청 자동 가입 및 SMS 인증
   - Step 9: 환급 계좌 등록 및 1원 인증
   - Step 10: 최종 수임 동의서 서명
   - Step 11: 신청 완료
3. 화면에서 에러 메시지, 경고 팝업, 로딩 멈춤 등 문제 상황이 보이면 구체적으로 설명하십시오.
4. 어떤 버튼을 눌러야 하는지, 어떤 입력이 필요한지 구체적으로 가이드하십시오.

[응답 언어 지침]:
- guidanceMessage는 반드시 고객의 언어(${lang})로 작성하십시오.
- 김준현 매니저의 따뜻하고 친근한 구어체 톤을 유지하십시오.
- "보내주신 화면 확인했어요~" 같은 자연스러운 오프닝으로 시작하십시오.
- 3~4문장 내외로 간결하되 충분히 상세하게 안내하십시오.

[고객이 함께 보낸 메시지]: ${caption || '(없음)'}
[이전 대화 요약]: ${input.previousSummary || '없음'}
[이전 진행 단계]: ${input.previousStep || '알 수 없음'}

이미지를 분석하고 위 지침에 따라 JSON 형식으로 응답하십시오.`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { text: systemPrompt },
        {
          media: {
            contentType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            url: `data:${mimeType};base64,${input.imageBase64}`,
          },
        },
      ],
      output: { schema: VisionAnalysisOutputSchema },
    });

    if (!output) {
      throw new Error('Vision AI 분석 결과를 생성하지 못했습니다.');
    }

    // 🛡️ [Language Guard Fail-safe] 비전 AI 분석 답변도 100% 모국어 보장
    const safeGuidance = await enforceLanguageGuard(output.guidanceMessage, lang || 'en');

    return {
      ...output,
      guidanceMessage: safeGuidance,
    };
  }
);

// ─── Public API ────────────────────────────────────────────────────────────
export async function analyzeScreenshot(input: VisionAnalysisInput): Promise<VisionAnalysisOutput> {
  return visionAnalysisFlow(input);
}

// ─── WhatsApp Image Download Helper ────────────────────────────────────────
export async function downloadWhatsAppMedia(mediaId: string): Promise<{ base64: string; mimeType: string }> {
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!waToken) throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');

  // Step 1: Get media URL from Meta Graph API
  const metaRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${waToken}` },
  });
  const mediaUrl = metaRes.data.url;
  const mimeType = metaRes.data.mime_type || 'image/jpeg';

  // Step 2: Download the actual media binary
  const imageRes = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${waToken}` },
    responseType: 'arraybuffer',
  });

  const base64 = Buffer.from(imageRes.data).toString('base64');
  return { base64, mimeType };
}

// ─── Telegram Image Download Helper ────────────────────────────────────────
export async function downloadTelegramPhoto(fileId: string): Promise<{ base64: string; mimeType: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

  // Step 1: Get file path from Telegram Bot API
  const fileRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile`, {
    params: { file_id: fileId },
  });
  const filePath = fileRes.data.result.file_path;

  // Step 2: Download the actual photo binary
  const photoUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const imageRes = await axios.get(photoUrl, {
    responseType: 'arraybuffer',
  });

  // Determine MIME type from file extension
  const ext = filePath.split('.').pop()?.toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const base64 = Buffer.from(imageRes.data).toString('base64');
  return { base64, mimeType };
}
