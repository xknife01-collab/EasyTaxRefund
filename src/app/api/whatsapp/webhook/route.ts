import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';

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
    const { sourceLang, translatedText } = await translateIncomingTelegramMessage(rawText);

    // 2. Load or create the unified Support Chat Session in Supabase
    let chatSession = null;
    const { data: existingChat, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, unread_count')
      .eq('channel', 'whatsapp')
      .eq('external_chat_id', String(whatsappChatId))
      .maybeSingle();

    if (fetchErr) {
      console.error('[WhatsApp Webhook] Failed to query support chat:', fetchErr);
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }

    if (existingChat) {
      const { data: updatedChat, error: updateErr } = await supabaseAdmin
        .from('support_chats')
        .update({
          user_name: userName,
          detected_language: sourceLang,
          last_message_at: new Date().toISOString(),
          unread_count: (existingChat.unread_count || 0) + 1,
        })
        .eq('id', existingChat.id)
        .select('id')
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
          unread_count: 1,
        })
        .select('id')
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

    // 3. Insert message into support_messages table
    const { error: msgErr } = await supabaseAdmin.from('support_messages').insert({
      chat_id: chatSession.id,
      sender_type: 'customer',
      original_text: rawText,
      translated_text: translatedText,
      source_lang: sourceLang,
      target_lang: 'ko',
      is_read: false,
    });

    if (msgErr) {
      console.error('[WhatsApp Webhook] Failed to insert support message:', msgErr);
      return NextResponse.json({ ok: false, error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, translated: translatedText });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] POST error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
