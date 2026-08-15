import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logId, authMethod, slideIndex, question, answer, isHelpful, rating } = body;

    const scoreDelta = isHelpful ? (rating || 5) : -2;

    // 1. If specific logId is provided, update ai_learning_logs
    if (logId) {
      await supabaseAdmin
        .from("ai_learning_logs")
        .update({
          is_resolved: isHelpful,
          updated_at: new Date().toISOString()
        })
        .eq("id", logId);
    }

    // 2. Insert or update quality-scored entry in ai_learning_logs
    if (authMethod && typeof slideIndex === 'number' && question && answer) {
      await supabaseAdmin.from("ai_learning_logs").insert({
        auth_method: authMethod,
        slide_index: slideIndex,
        user_question: question.trim(),
        ai_answer: answer.trim(),
        is_resolved: isHelpful,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, scoreDelta });
  } catch (err: any) {
    console.error("[Chat Feedback API Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
