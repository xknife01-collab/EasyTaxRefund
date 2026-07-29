import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

export const DocumentAnalysisResultSchema = z.object({
  documentType: z.enum(['arc', 'passport', 'other', 'unknown']).describe('Document type (arc = 외국인등록증, passport = 여권, etc.)'),
  confidence: z.number().describe('Confidence level from 0.0 to 1.0'),
  name: z.string().optional().describe('English name on the registration card or passport in upper case'),
  arcNo: z.string().optional().describe('13-digit registration number, e.g. 950101-1234567'),
  visaStatus: z.string().optional().describe('Visa status code, e.g. E-9, E-7, F-2, H-2'),
  analysisFeedback: z.string().describe('User feedback in Korean explaining the OCR result and whether they need to take another photo or if we succeeded.'),
});

export type DocumentAnalysisResult = z.infer<typeof DocumentAnalysisResultSchema>;

/**
 * Downloads a remote image (with Facebook Graph API authentication fallback if needed)
 * and converts it to a base64 Data URL.
 */
export async function downloadImageAsDataUrl(url: string): Promise<{ dataUrl: string; contentType: string }> {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  let requestUrl = url;

  if (url.includes('facebook.com') || url.includes('fbsbx.com')) {
    if (pageAccessToken) {
      try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set('access_token', pageAccessToken);
        requestUrl = parsedUrl.toString();
      } catch (err: any) {
        console.warn('[downloadImageAsDataUrl] Failed to append access token:', err.message);
      }
    }
  }

  console.log(`[Multimodal Flow] Downloading image from: ${requestUrl.substring(0, 100)}...`);
  const response = await axios.get(requestUrl, { responseType: 'arraybuffer' });
  const contentType = response.headers['content-type'] || 'image/jpeg';
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  const dataUrl = `data:${contentType};base64,${base64}`;

  return { dataUrl, contentType };
}

/**
 * Analyze an uploaded document image (e.g. ARC, Passport) using Gemini multimodal capabilities.
 */
export async function analyzeDocumentImage(imageUrl: string): Promise<DocumentAnalysisResult> {
  try {
    const { dataUrl, contentType } = await downloadImageAsDataUrl(imageUrl);

    const response = await ai.generate({
      prompt: [
        { text: `You are an expert AI OCR assistant for Korea Tax Refund Service (KTRS) specialized in foreign worker tax documents.
Analyze the attached document image.
1. Determine if it is a South Korean Foreigner Registration Card (외국인등록증, ARC), a Passport (여권), or some other document.
2. If it is an ARC (Foreigner Registration Card), extract:
   - English Name (upper case, as shown, e.g. "KHAN MOHAMMAD")
   - Registration Number (외국인등록번호, 13 digits, extract all digits, e.g. "950101-1234567")
   - Visa type (체류자격, e.g., E-9, E-7, F-2, F-4, H-2, G-1)
3. If it is a Passport, extract the English name and passport number if visible.
4. Generate a friendly user feedback text in Korean explaining the OCR outcome (e.g. "신분증 인식에 성공했습니다. 성함: KHAN MOHAMMAD, 외국인등록번호: 950101-*******로 자동 입력됩니다." or "사진이 다소 흐리거나 일부가 가려져 있어 등록번호를 판독하지 못했습니다. 더 밝고 선명한 곳에서 카드 전면이 다 나오도록 다시 찍어주시면 즉시 분석해 드릴게요! 🥺").
5. Return the result conforming to the requested output schema.` },
        { media: { url: dataUrl, contentType } },
      ],
      output: {
        schema: DocumentAnalysisResultSchema,
      },
    });

    if (!response.output) {
      throw new Error('Gemini failed to output structured data.');
    }

    return response.output;
  } catch (error: any) {
    console.error('[Multimodal Analysis Error]:', error);
    return {
      documentType: 'unknown',
      confidence: 0,
      analysisFeedback: '죄송합니다. 이미지 데이터를 내려받거나 분석하는 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 😭',
    };
  }
}
