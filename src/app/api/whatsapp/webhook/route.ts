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
      .select('id, unread_count, metadata')
      .eq('channel', 'whatsapp')
      .eq('external_chat_id', String(whatsappChatId))
      .maybeSingle();

    if (fetchErr) {
      console.error('[WhatsApp Webhook] Failed to query support chat:', fetchErr);
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
        })
        .eq('id', existingChat.id)
        .select('id, metadata')
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
        })
        .select('id, metadata')
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

        const aiResult = await askManagerAi({
          message: rawText,
          language: sourceLang,
          history,
        });

        const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (waToken && waPhoneId) {
          const waUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
          await axios.post(
            waUrl,
            {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: whatsappChatId,
              type: 'text',
              text: {
                preview_url: false,
                body: aiResult.answer,
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
        console.error('[WhatsApp Webhook] Failed to auto-respond with AI:', aiErr);
      }
    }

    return NextResponse.json({ ok: true, translated: translatedText });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] POST error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
