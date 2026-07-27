import { NextRequest, NextResponse } from "next/server";
import { logConversionFeedback } from "@/lib/ai-learning-db";

const SCORE_MAP: Record<string, number> = {
  signed: 10,              // 가입 서명 완료
  auth_success: 8,          // 인증 완료
  auth_started: 7,          // 인증번호 요청 진행
  positive_reply: 6,        // 긍정적 대화 반응
  slider_interacted: 5,     // 슬라이더 조작
  verification_input: 3,    // 인증 입력 단계 이탈
  chat_negotiation: 2,      // 대화 중 이탈
  inactivity_10min: 1,      // 10분 무응답
  instant_close: 0,         // 즉시 닫기
  
  // Legacy support compatibility
  success: 8,
  fail: 1
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, action } = body;

    if (!chatId || !action) {
      return NextResponse.json(
        { error: "chatId and action are required" },
        { status: 400 }
      );
    }

    const score = SCORE_MAP[action] !== undefined ? SCORE_MAP[action] : 2; // Default to 2 (chat negotiation level) if not matched

    const result = await logConversionFeedback(chatId, action, score);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to log feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      score,
      action
    });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
