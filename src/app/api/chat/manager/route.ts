import { NextRequest, NextResponse } from "next/server";
import { askManagerAi } from "@/ai/flows/manager-chat-flow";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language, history, chatId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call Genkit AI Manager Flow
    const result = await askManagerAi({
      message: message.trim(),
      language: language || "ko",
      history: history || [],
      channel: "web",
    });

    // If chatId is provided, record the chat session and last script ID for self-learning
    if (chatId) {
      try {
        const { data: existingChat, error: fetchErr } = await supabaseAdmin
          .from("support_chats")
          .select("id, metadata")
          .eq("channel", "web")
          .eq("external_chat_id", chatId)
          .maybeSingle();

        if (!fetchErr) {
          const currentMetadata = existingChat?.metadata || {};
          const updatedMetadata = {
            ...currentMetadata,
            last_script_id: result.matchedScriptId || currentMetadata.last_script_id,
            is_ai_active: true
          };

          if (existingChat) {
            await supabaseAdmin
              .from("support_chats")
              .update({
                last_message_at: new Date().toISOString(),
                metadata: updatedMetadata,
                detected_language: language || "ko"
              })
              .eq("id", existingChat.id);
          } else {
            await supabaseAdmin
              .from("support_chats")
              .insert({
                channel: "web",
                external_chat_id: chatId,
                user_name: "Web Client",
                detected_language: language || "ko",
                last_message_at: new Date().toISOString(),
                metadata: updatedMetadata
              });
          }
        }
      } catch (dbErr) {
        console.error("Failed to update web chat session details in DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      answer: result.answer,
      koreanSummary: result.koreanSummary,
      matchedScriptId: result.matchedScriptId,
    });
  } catch (error: any) {
    console.error("AI Manager Chat API Error:", error);

    // Fallback reassuring response in case of system offline or API key error
    return NextResponse.json({
      success: true,
      answer: "안녕하세요! 김준현 공식 매니저입니다. 현재 국세청 시스템 및 상담 서버가 잠시 점검 중입니다. 급하신 문의는 아래 [왓츠앱] 또는 [텔레그램] 실시간 상담 버튼을 눌러주시면 즉시 답변해 드리겠습니다! 🛡️",
      koreanSummary: "시스템 서버 점검에 따른 비상 안내 발송",
    });
  }
}
