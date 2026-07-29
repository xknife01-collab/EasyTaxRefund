import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import { askManagerAi } from '@/ai/flows/manager-chat-flow';
import axios from 'axios';

// GET: Meta Webhook Verification
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ktrs_whatsapp_verify_token_2026';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('[WhatsApp Webhook] Verification successful.');
        return new Response(challenge, { status: 200 });
      } else {
        console.warn('[WhatsApp Webhook] Verification failed. Token mismatch.');
        return new Response('Forbidden', { status: 403 });
      }
    }

    return new Response('Bad Request', { status: 400 });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] GET error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}

// POST: Handle Incoming WhatsApp Messages
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check WhatsApp webhook message details
    const changeValue = body?.entry?.[0]?.changes?.[0]?.value;
    const message = changeValue?.messages?.[0];

    if (!message || message.type !== 'text') {
      // Return 200 to acknowledge receipt of other events (statuses, media, etc.)
      return NextResponse.json({ ok: true });
    }

    const whatsappChatId = message.from; // Sender's WhatsApp ID (usually phone number)
    const rawText = message.text?.body || '';

    if (!rawText.trim()) {
      return NextResponse.json({ ok: true });
    }

    // Extract profile name
    const contactProfile = changeValue?.contacts?.[0]?.profile;
    const userName = contactProfile?.name || `WhatsApp Client #${whatsappChatId}`;

    // 1. AI Auto language detection & translation to Korean
    let sourceLang = 'en';
    let translatedText = rawText;
    try {
      const translationResult = await translateIncomingTelegramMessage(rawText);
      sourceLang = translationResult.sourceLang || 'en';
      translatedText = translationResult.translatedText || rawText;
    } catch (err) {
      console.error('[WhatsApp Webhook] AI Translation failed, falling back to raw text:', err);
    }

    // 2. Load or create the unified Support Chat Session in Supabase
    let chatSession = null;
    const { data: existingChat, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, unread_count, metadata, cumulative_pos, cumulative_neg')
      .eq('channel', 'whatsapp')
      .eq('external_chat_id', String(whatsappChatId))
      .maybeSingle();

    if (fetchErr) {
      console.error('[WhatsApp Webhook] Failed to query support chat:', fetchErr);
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }

    const isAiActive = !existingChat || existingChat.metadata?.is_ai_active !== false;
    const cumulativePos = existingChat?.cumulative_pos ?? 0;
    const cumulativeNeg = existingChat?.cumulative_neg ?? 0;

    if (existingChat) {
      const { data: updatedChat, error: updateErr } = await supabaseAdmin
        .from('support_chats')
        .update({
          user_name: userName,
          detected_language: sourceLang,
          last_message_at: new Date().toISOString(),
          unread_count: isAiActive ? 0 : (existingChat.unread_count || 0) + 1,
          metadata: {
            ...(existingChat.metadata || {}),
            follow_up_count: 0
          }
        })
        .eq('id', existingChat.id)
        .select('id, metadata, cumulative_pos, cumulative_neg')
        .single();

      if (updateErr) {
        console.error('[WhatsApp Webhook] Failed to update chat session:', updateErr);
        return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
      }
      chatSession = updatedChat;
    } else {
      const { data: newChat, error: insertErr } = await supabaseAdmin
        .from('support_chats')
        .insert({
          channel: 'whatsapp',
          external_chat_id: String(whatsappChatId),
          user_name: userName,
          detected_language: sourceLang,
          last_message_at: new Date().toISOString(),
          unread_count: isAiActive ? 0 : 1,
          cumulative_pos: 0,
          cumulative_neg: 0,
        })
        .select('id, metadata, cumulative_pos, cumulative_neg')
        .single();

      if (insertErr) {
        console.error('[WhatsApp Webhook] Failed to insert chat session:', insertErr);
        return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
      }
      chatSession = newChat;
    }

    if (!chatSession) {
      return NextResponse.json({ ok: false, error: 'Failed to resolve chat session' }, { status: 500 });
    }

    // 3. Insert customer message into support_messages table and select its ID
    const { data: insertedMsg, error: msgErr } = await supabaseAdmin
      .from('support_messages')
      .insert({
        chat_id: chatSession.id,
        sender_type: 'customer',
        original_text: rawText,
        translated_text: translatedText,
        source_lang: sourceLang,
        target_lang: 'ko',
        is_read: isAiActive,
      })
      .select('id')
      .single();

    if (msgErr) {
      console.error('[WhatsApp Webhook] Failed to insert support message:', msgErr);
      return NextResponse.json({ ok: false, error: msgErr.message }, { status: 500 });
    }

    // 4. If AI Auto-responder is active, generate and send reply
    if (isAiActive) {
      try {
        const { data: historyMsgs } = await supabaseAdmin
          .from('support_messages')
          .select('sender_type, original_text, translated_text')
          .eq('chat_id', chatSession.id)
          .order('created_at', { ascending: true })
          .limit(10);

        const history = (historyMsgs || [])
          .filter((_, idx) => idx < (historyMsgs?.length || 0) - 1)
          .map(m => ({
            role: m.sender_type === 'customer' ? 'user' as const : 'model' as const,
            text: m.sender_type === 'customer' ? m.original_text : (m.translated_text || m.original_text)
          }));

        const previousSummary = chatSession.metadata?.summary || "이전 요약 기록 없음";
        const previousStep = chatSession.metadata?.current_step || "Step 0: Estimate (신청 준비 단계)";
        const previousFactsObj = chatSession.metadata?.user_facts || {};
        const previousFacts = Object.entries(previousFactsObj)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n') || "기록된 사용자 팩트 없음";
        const previousPersonality = chatSession.metadata?.personality_type || "expressive (기본값: 친근감 선호형)";

        const aiResult = await askManagerAi({
          message: rawText,
          language: sourceLang,
          history,
          channel: 'whatsapp',
          cumulativePos,
          cumulativeNeg,
          previousSummary,
          previousFacts,
          previousStep,
          previousPersonality,
        });

        const newPosScore = aiResult.posScore ?? 0;
        const newNegScore = aiResult.negScore ?? 0;
        const updatedCumulativePos = cumulativePos + newPosScore;
        const updatedCumulativeNeg = cumulativeNeg + newNegScore;

        // 4a. Update chat session metadata and cumulative sentiment scores
        const currentMetadata = chatSession.metadata || {};
        const newFacts = aiResult.extractedFacts || {};
        const updatedFacts = {
          ...(currentMetadata.user_facts || {}),
          ...newFacts
        };
        const isTakeoverTriggered = updatedCumulativeNeg >= 6;
        const updatedMetadata = {
          ...currentMetadata,
          last_script_id: aiResult.matchedScriptId || currentMetadata.last_script_id,
          is_ai_active: isTakeoverTriggered ? false : true,
          summary: aiResult.conversationSummary || currentMetadata.summary,
          current_step: aiResult.currentStep || currentMetadata.current_step,
          personality_type: aiResult.detectedPersonality || currentMetadata.personality_type,
          user_facts: updatedFacts,
          takeover_alert: isTakeoverTriggered ? true : (currentMetadata.takeover_alert || false),
        };

        if (isTakeoverTriggered) {
          console.warn(`[🚨 TAKEOVER ALERT WhatsApp] Chat ${chatSession.id} reached ${updatedCumulativeNeg}. Deactivating AI.`);
        }

        await supabaseAdmin
          .from('support_chats')
          .update({
            metadata: updatedMetadata,
            cumulative_pos: updatedCumulativePos,
            cumulative_neg: updatedCumulativeNeg
          })
          .eq('id', chatSession.id);

        // 4b. Update the customer message with the evaluated sentiment scores
        if (insertedMsg?.id) {
          await supabaseAdmin
            .from('support_messages')
            .update({
              pos_score: newPosScore,
              neg_score: newNegScore
            })
            .eq('id', insertedMsg.id);
        }

        const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (waToken && waPhoneId) {
          const waUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
          
          // Parse answer into sentences/chunks using '|' or double line breaks '\n\n'
          let chunks = aiResult.answer
            .split(/[|]|\n{2,}/)
            .map(c => c.trim())
            .filter(c => c.length > 0);

          // Forcefully cap to maximum 2 chunks to avoid spamming the client, merging the rest
          if (chunks.length > 2) {
            const first = chunks[0];
            const rest = chunks.slice(1).join(" ");
            chunks = [first, rest];
          }

          const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

          for (const chunk of chunks) {
            // Calculate human-like irregular typing delay
            const baseSpeed = 20 + Math.random() * 15; // 20ms to 35ms per character
            const basePause = 300 + Math.random() * 400; // 300ms to 700ms base thinking/resting pause
            const typingTime = Math.min(chunk.length * baseSpeed + basePause, 3000);
            await delay(typingTime);

            await axios.post(
              waUrl,
              {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: whatsappChatId,
                type: 'text',
                text: {
                  preview_url: false,
                  body: chunk,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${waToken}`,
                  'Content-Type': 'application/json',
                },
              }
            ).catch(err => {
              console.error('[WhatsApp AI Response] delivery failed:', err?.response?.data || err.message);
            });

            // Realistic human-like typing pause gap between split messages
            await delay(1200 + Math.random() * 600);
          }
        }

        const richCardStr = aiResult.richCardPayload && aiResult.richCardPayload.cardType !== 'none'
          ? `\n[RICH_CARD_JSON: ${JSON.stringify(aiResult.richCardPayload)}]`
          : '';

        await supabaseAdmin.from('support_messages').insert({
          chat_id: chatSession.id,
          sender_type: 'admin',
          original_text: (aiResult.koreanSummary || aiResult.answer) + richCardStr,
          translated_text: aiResult.answer + richCardStr,
          source_lang: 'ko',
          target_lang: sourceLang,
          is_read: true,
        });
      } catch (aiErr) {
        console.error('[WhatsApp Webhook] Failed to auto-respond with AI:', aiErr);
      }
    }

    return NextResponse.json({ ok: true, translated: translatedText });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] POST error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
