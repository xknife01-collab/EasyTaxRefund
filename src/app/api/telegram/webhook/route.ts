import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import { askManagerAi } from '@/ai/flows/manager-chat-flow';
import { analyzeScreenshot, downloadTelegramPhoto } from '@/ai/flows/vision-analysis-flow';
import axios from 'axios';
import { sendTakeoverAlert } from '@/lib/slack';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if valid Telegram message update
    const message = body?.message || body?.edited_message;
    if (!message || !message.chat || !message.chat.id) {
      return NextResponse.json({ ok: true });
    }

    const telegramChatId = message.chat.id;
    const hasPhoto = message.photo && message.photo.length > 0;
    const rawText = message.text || message.caption || (hasPhoto ? '' : '[미디어/파일 수신]');

    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';
    const username = message.from?.username ? `@${message.from.username}` : '';
    const userName = (`${firstName} ${lastName}`.trim() || username || `Customer #${telegramChatId}`).trim();

    // Handle photo messages via Vision AI
    if (hasPhoto) {
      const photoArray = message.photo;
      const largestPhoto = photoArray[photoArray.length - 1]; // Last element = highest resolution
      const fileId = largestPhoto.file_id;
      const caption = message.caption || '';

      console.log(`[Telegram Webhook] 📸 Photo received from ${telegramChatId}, fileId: ${fileId}`);

      // Process image analysis in the background
      (async () => {
        try {
          // 1. Download photo from Telegram
          const { base64, mimeType } = await downloadTelegramPhoto(fileId);
          console.log(`[Telegram Vision] Image downloaded (${mimeType}, ${Math.round(base64.length / 1024)}KB base64)`);

          // 2. Get existing chat session for context
          const { data: existingChat } = await supabaseAdmin
            .from('support_chats')
            .select('id, metadata, detected_language')
            .eq('channel', 'telegram')
            .eq('external_chat_id', String(telegramChatId))
            .maybeSingle();

          const lang = existingChat?.detected_language || 'en';
          const previousStep = existingChat?.metadata?.current_step || undefined;
          const previousSummary = existingChat?.metadata?.summary || undefined;

          // 3. Analyze screenshot with Vision AI
          const visionResult = await analyzeScreenshot({
            imageBase64: base64,
            mimeType,
            caption,
            language: lang,
            previousStep,
            previousSummary,
          });

          console.log(`[Telegram Vision] Analysis: step=${visionResult.detectedStep}, isKtrs=${visionResult.isKtrsScreen}, confidence=${visionResult.confidence}%`);

          // 4. Store customer image message in support_messages
          const chatId = existingChat?.id;
          if (chatId) {
            await supabaseAdmin.from('support_messages').insert({
              chat_id: chatId,
              sender_type: 'customer',
              original_text: `[📸 스크린샷 전송]${caption ? ` ${caption}` : ''}`,
              translated_text: `[📸 스크린샷 전송]${caption ? ` ${caption}` : ''}`,
              source_lang: lang,
              target_lang: 'ko',
              is_read: true,
            });
          }

          // 5. Send Vision AI response back to customer via Telegram
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            let chunks = visionResult.guidanceMessage
              .split(/[|]|\n{2,}/)
              .map(c => c.trim())
              .filter(c => c.length > 0);

            if (chunks.length > 2) {
              const first = chunks[0];
              const rest = chunks.slice(1).join(" ");
              chunks = [first, rest];
            }

            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const actionUrl = `https://api.telegram.org/bot${botToken}/sendChatAction`;

            for (const chunk of chunks) {
              await axios.post(actionUrl, { chat_id: telegramChatId, action: 'typing' }).catch(() => {});

              const baseSpeed = 20 + Math.random() * 15;
              const basePause = 300 + Math.random() * 400;
              const typingTime = Math.min(chunk.length * baseSpeed + basePause, 3000);
              await delay(typingTime);

              await axios.post(telegramUrl, {
                chat_id: telegramChatId,
                text: chunk,
                parse_mode: 'HTML',
              }).catch(err => {
                console.error('[Telegram Vision Response] delivery failed:', err?.response?.data || err.message);
              });

              await delay(1200 + Math.random() * 600);
            }
          }

          // 6. Store AI response in support_messages
          if (chatId) {
            await supabaseAdmin.from('support_messages').insert({
              chat_id: chatId,
              sender_type: 'admin',
              original_text: `[📸 Vision AI 분석] ${visionResult.koreanSummary}\n${visionResult.guidanceMessage}`,
              translated_text: visionResult.guidanceMessage,
              source_lang: 'ko',
              target_lang: lang,
              is_read: true,
            });
          }
        } catch (visionErr) {
          console.error('[Telegram Webhook] Vision AI analysis failed:', visionErr);
        }
      })();

      return NextResponse.json({ ok: true, type: 'image_processing' });
    }

    // Skip empty text messages
    if (!rawText.trim()) {
      return NextResponse.json({ ok: true });
    }

    // 1. AI Auto language detection & translation to Korean
    let sourceLang = 'en';
    let translatedText = rawText;
    try {
      const translationResult = await translateIncomingTelegramMessage(rawText);
      sourceLang = translationResult.sourceLang || 'en';
      translatedText = translationResult.translatedText || rawText;
    } catch (err) {
      console.error('[Telegram Webhook] AI Translation failed, falling back to raw text:', err);
    }

    // 2. Load or create the unified Support Chat Session in Supabase
    let chatSession = null;
    const { data: existingChat, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, unread_count, metadata, cumulative_pos, cumulative_neg')
      .eq('channel', 'telegram')
      .eq('external_chat_id', String(telegramChatId))
      .maybeSingle();

    if (fetchErr) {
      console.error('Failed to query existing support chat:', fetchErr);
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
        console.error('Failed to update support chat session:', updateErr);
        return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
      }
      chatSession = updatedChat;
    } else {
      const { data: newChat, error: insertErr } = await supabaseAdmin
        .from('support_chats')
        .insert({
          channel: 'telegram',
          external_chat_id: String(telegramChatId),
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
        console.error('Failed to insert support chat session:', insertErr);
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
      console.error('Failed to insert support message:', msgErr);
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
          channel: 'telegram',
          cumulativePos,
          cumulativeNeg,
          previousSummary,
          previousFacts,
          previousStep,
          previousPersonality,
        });

        const newPosScore = aiResult.posScore ?? 0;
        const newNegScore = aiResult.negScore ?? 0;
        const updatedCumulativePos = Math.max(0, cumulativePos + newPosScore - Math.round(newNegScore * 1.5));
        const updatedCumulativeNeg = Math.max(0, cumulativeNeg + newNegScore - newPosScore);

        const isExplicitHumanRequest = /(상담원|사람|직원|실제\s*매니저|사람과|사람하고|상담사|인간)\s*(연결|바꿔|대화|상담)/i.test(rawText.trim());

        // 4a. Update chat session metadata and cumulative sentiment scores
        const currentMetadata = chatSession.metadata || {};
        const newFacts = aiResult.extractedFacts || {};
        const updatedFacts = {
          ...(currentMetadata.user_facts || {}),
          ...newFacts
        };
        const updatedIsAiActive = isExplicitHumanRequest ? false : (currentMetadata.is_ai_active ?? true);
        const isHighNegAlert = updatedCumulativeNeg >= 25;

        const updatedMetadata = {
          ...currentMetadata,
          last_script_id: aiResult.matchedScriptId || currentMetadata.last_script_id,
          is_ai_active: updatedIsAiActive,
          summary: aiResult.conversationSummary || currentMetadata.summary,
          current_step: aiResult.currentStep || currentMetadata.current_step,
          personality_type: aiResult.detectedPersonality || currentMetadata.personality_type,
          user_facts: updatedFacts,
          takeover_alert: isHighNegAlert || (currentMetadata.takeover_alert || false),
        };

        if (isHighNegAlert) {
          console.warn(`[🚨 HIGH NEGATIVE ALERT Telegram] Chat ${chatSession.id} reached ${updatedCumulativeNeg}. High negative sentiment detected.`);
          if (!currentMetadata.takeover_alert) {
            await sendTakeoverAlert({
              chatId: chatSession.id,
              channel: 'telegram',
              userName: userName,
              detectedLanguage: sourceLang,
              cumulativeNeg: updatedCumulativeNeg,
              summary: aiResult.conversationSummary || currentMetadata.summary || '요약 없음',
              lastMessage: rawText,
            }).catch(err => console.error('[Slack Alert Telegram Error]:', err));
          }
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

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
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
          const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          const actionUrl = `https://api.telegram.org/bot${botToken}/sendChatAction`;

          for (const chunk of chunks) {
            // Send 'typing' chat action
            await axios.post(actionUrl, {
              chat_id: telegramChatId,
              action: 'typing',
            }).catch(() => {});

            // Calculate human-like irregular typing delay
            const baseSpeed = 20 + Math.random() * 15; // 20ms to 35ms per character
            const basePause = 300 + Math.random() * 400; // 300ms to 700ms base thinking/resting pause
            const typingTime = Math.min(chunk.length * baseSpeed + basePause, 3000);
            await delay(typingTime);

            // Send actual message chunk
            await axios.post(telegramUrl, {
              chat_id: telegramChatId,
              text: chunk,
              parse_mode: 'HTML',
            }).catch(err => {
              console.error('[Telegram AI Response] delivery failed:', err?.response?.data || err.message);
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
          original_text: aiResult.answer + richCardStr,
          translated_text: aiResult.answer + richCardStr,
          source_lang: 'ko',
          target_lang: sourceLang,
          is_read: true,
        });
      } catch (aiErr) {
        console.error('[Telegram Webhook] Failed to auto-respond with AI:', aiErr);
      }
    }

    return NextResponse.json({ ok: true, translated: translatedText });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' });
}
