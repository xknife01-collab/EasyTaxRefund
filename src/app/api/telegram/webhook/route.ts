import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import { askManagerAi } from '@/ai/flows/manager-chat-flow';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if valid Telegram message update
    const message = body?.message || body?.edited_message;
    if (!message || !message.chat || !message.chat.id) {
      return NextResponse.json({ ok: true });
    }

    const telegramChatId = message.chat.id;
    const rawText = message.text || message.caption || '[미디어/파일 수신]';

    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';
    const username = message.from?.username ? `@${message.from.username}` : '';
    const userName = (`${firstName} ${lastName}`.trim() || username || `Customer #${telegramChatId}`).trim();

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
      .select('id, unread_count, metadata')
      .eq('channel', 'telegram')
      .eq('external_chat_id', String(telegramChatId))
      .maybeSingle();

    if (fetchErr) {
      console.error('Failed to query existing support chat:', fetchErr);
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }

    const isAiActive = !existingChat || existingChat.metadata?.is_ai_active !== false;

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
        .select('id, metadata')
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
        })
        .select('id, metadata')
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

    // 3. Insert customer message into support_messages table
    const { error: msgErr } = await supabaseAdmin.from('support_messages').insert({
      chat_id: chatSession.id,
      sender_type: 'customer',
      original_text: rawText,
      translated_text: translatedText,
      source_lang: sourceLang,
      target_lang: 'ko',
      is_read: isAiActive,
    });

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

        const aiResult = await askManagerAi({
          message: rawText,
          language: sourceLang,
          history,
          channel: 'telegram',
        });

        // 4a. Update chat session metadata with the matched script ID
        if (aiResult.matchedScriptId) {
          const currentMetadata = chatSession.metadata || {};
          await supabaseAdmin
            .from('support_chats')
            .update({
              metadata: {
                ...currentMetadata,
                last_script_id: aiResult.matchedScriptId
              }
            })
            .eq('id', chatSession.id);
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

            // Calculate human-like typing delay (capped for safety)
            const typingTime = Math.min(chunk.length * 30 + 500, 2500);
            await delay(typingTime);

            // Send actual message chunk
            await axios.post(telegramUrl, {
              chat_id: telegramChatId,
              text: chunk,
              parse_mode: 'HTML',
            }).catch(err => {
              console.error('[Telegram AI Response] delivery failed:', err?.response?.data || err.message);
            });

            // Small rest between messages
            await delay(800);
          }
        }

        await supabaseAdmin.from('support_messages').insert({
          chat_id: chatSession.id,
          sender_type: 'admin',
          original_text: aiResult.koreanSummary || aiResult.answer,
          translated_text: aiResult.answer,
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
