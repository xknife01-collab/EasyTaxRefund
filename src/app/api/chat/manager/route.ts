import { NextRequest, NextResponse } from "next/server";
import { askManagerAi } from "@/ai/flows/manager-chat-flow";
import { supabaseAdmin } from "@/lib/supabase";
import { sendTakeoverAlert } from "@/lib/slack";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language, history, chatId, clientOs, clientIsInApp, currentPathname } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Intercept "ai 점수" debug command
    if (message.trim() === "ai 점수") {
      let cumPos = 0;
      let cumNeg = 0;
      if (chatId) {
        const { data: chatData } = await supabaseAdmin
          .from("support_chats")
          .select("cumulative_pos, cumulative_neg")
          .eq("channel", "web")
          .eq("external_chat_id", chatId)
          .maybeSingle();
        if (chatData) {
          cumPos = chatData.cumulative_pos ?? 0;
          cumNeg = chatData.cumulative_neg ?? 0;
        }
      }
      return NextResponse.json({
        success: true,
        answer: `[감정 분석 디버그]\n- 현재 누적 긍정 점수: ${cumPos}점\n- 현재 누적 부정 점수: ${cumNeg}점`,
        koreanSummary: "디버그용 감정 점수 확인 요청",
        posScore: 0,
        negScore: 0,
      });
    }

    // 1. Retrieve current sentiment scores and metadata memory from database if chatId is provided
    let cumulativePos = 0;
    let cumulativeNeg = 0;
    let existingChat = null;
    let previousSummary = "이전 요약 기록 없음";
    let previousStep = "Step 0: Estimate (신청 준비 단계)";
    let previousFacts = "기록된 사용자 팩트 없음";
    let previousPersonality = "expressive (기본값: 친근감 선호형)";

    if (chatId) {
      const { data, error } = await supabaseAdmin
        .from("support_chats")
        .select("id, metadata, cumulative_pos, cumulative_neg")
        .eq("channel", "web")
        .eq("external_chat_id", chatId)
        .maybeSingle();

      if (!error && data) {
        existingChat = data;
        cumulativePos = data.cumulative_pos ?? 0;
        cumulativeNeg = data.cumulative_neg ?? 0;
        previousSummary = data.metadata?.summary || "이전 요약 기록 없음";
        previousStep = data.metadata?.current_step || "Step 0: Estimate (신청 준비 단계)";
        previousPersonality = data.metadata?.personality_type || "expressive (기본값: 친근감 선호형)";
        
        const previousFactsObj = data.metadata?.user_facts || {};
        previousFacts = Object.entries(previousFactsObj)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n') || "기록된 사용자 팩트 없음";
      }
    }

    // 2. Call Genkit AI Manager Flow with cumulative scores and memory parameters passed in
    const result = await askManagerAi({
      message: message.trim(),
      language: language || "ko",
      history: history || [],
      channel: "web",
      cumulativePos,
      cumulativeNeg,
      previousSummary,
      previousFacts,
      previousStep,
      previousPersonality,
      clientOs,
      clientIsInApp,
      currentPathname,
    });

    const newPosScore = result.posScore ?? 0;
    const newNegScore = result.negScore ?? 0;
    const updatedCumulativePos = cumulativePos + newPosScore;
    const updatedCumulativeNeg = cumulativeNeg + newNegScore;

    // 3. Update database if chatId is provided
    if (chatId) {
      try {
        const currentMetadata = existingChat?.metadata || {};
        const newFacts = result.extractedFacts || {};
        const updatedFacts = {
          ...(currentMetadata.user_facts || {}),
          ...newFacts
        };
        const isTakeoverTriggered = updatedCumulativeNeg >= 6;
        const updatedMetadata = {
          ...currentMetadata,
          last_script_id: result.matchedScriptId || currentMetadata.last_script_id,
          is_ai_active: isTakeoverTriggered ? false : true,
          summary: result.conversationSummary || currentMetadata.summary,
          current_step: result.currentStep || currentMetadata.current_step,
          personality_type: result.detectedPersonality || currentMetadata.personality_type,
          user_facts: updatedFacts,
          takeover_alert: isTakeoverTriggered ? true : (currentMetadata.takeover_alert || false),
          client_os: clientOs || currentMetadata.client_os,
          client_is_in_app: clientIsInApp !== undefined ? clientIsInApp : currentMetadata.client_is_in_app,
        };

        if (isTakeoverTriggered) {
          console.warn(`[🚨 TAKEOVER ALERT] Chat ${chatId} negative score reached ${updatedCumulativeNeg}. Automatic takeover triggered, AI de-activated.`);
        }

        let chatSessionId = "";

        if (existingChat) {
          chatSessionId = existingChat.id;
          await supabaseAdmin
            .from("support_chats")
            .update({
              last_message_at: new Date().toISOString(),
              metadata: updatedMetadata,
              detected_language: language || "ko",
              cumulative_pos: updatedCumulativePos,
              cumulative_neg: updatedCumulativeNeg,
            })
            .eq("id", existingChat.id);
        } else {
          const { data: newChat, error: insertErr } = await supabaseAdmin
            .from("support_chats")
            .insert({
              channel: "web",
              external_chat_id: chatId,
              user_name: "Web Client",
              detected_language: language || "ko",
              last_message_at: new Date().toISOString(),
              metadata: updatedMetadata,
              cumulative_pos: updatedCumulativePos,
              cumulative_neg: updatedCumulativeNeg,
            })
            .select("id")
            .single();

          if (insertErr) throw insertErr;
          if (newChat) chatSessionId = newChat.id;
        }

        if (chatSessionId) {
          // 3a. Insert customer message with sentiment scores
          const { error: custMsgErr } = await supabaseAdmin.from("support_messages").insert({
            chat_id: chatSessionId,
            sender_type: "customer",
            original_text: message.trim(),
            translated_text: message.trim(),
            source_lang: language || "ko",
            target_lang: "ko",
            is_read: true,
            pos_score: newPosScore,
            neg_score: newNegScore,
          });
          if (custMsgErr) {
            console.error("Failed to insert customer support message:", custMsgErr);
          }

          // 3b. Insert AI manager response
          const richCardStr = result.richCardPayload && result.richCardPayload.cardType !== 'none'
            ? `\n[RICH_CARD_JSON: ${JSON.stringify(result.richCardPayload)}]`
            : '';

          const { error: aiMsgErr } = await supabaseAdmin.from("support_messages").insert({
            chat_id: chatSessionId,
            sender_type: "admin",
            original_text: (result.koreanSummary || result.answer) + richCardStr,
            translated_text: result.answer + richCardStr,
            source_lang: "ko",
            target_lang: language || "ko",
            is_read: true
          });
          if (aiMsgErr) {
            console.error("Failed to insert AI support message:", aiMsgErr);
          }
        }

        if (isTakeoverTriggered && !currentMetadata.takeover_alert && chatSessionId) {
          await sendTakeoverAlert({
            chatId: chatSessionId,
            channel: "web",
            userName: "Web Client",
            detectedLanguage: language || "ko",
            cumulativeNeg: updatedCumulativeNeg,
            summary: result.conversationSummary || currentMetadata.summary || "요약 없음",
            lastMessage: message.trim(),
          }).catch((err) => console.error("[Slack Alert API Error]:", err));
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
      posScore: newPosScore,
      negScore: newNegScore,
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
