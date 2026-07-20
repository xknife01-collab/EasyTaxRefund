import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';

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
      .select('id, unread_count')
      .eq('channel', 'telegram')
      .eq('external_chat_id', String(telegramChatId))
      .maybeSingle();

    if (fetchErr) {
      console.error('Failed to query existing support chat:', fetchErr);
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
          unread_count: 1,
        })
        .select('id')
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
      console.error('Failed to insert support message:', msgErr);
      return NextResponse.json({ ok: false, error: msgErr.message }, { status: 500 });
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
