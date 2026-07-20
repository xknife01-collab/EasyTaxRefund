import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateOutgoingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { chatId, telegramChatId, koreanText, targetLang } = await req.json();

    if (!telegramChatId || !koreanText) {
      return NextResponse.json({ ok: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // 1. Translate Korean to customer's target language via AI
    const { translatedText } = await translateOutgoingTelegramMessage(koreanText, targetLang || 'en');

    // 2. Send translated message to Telegram if bot token exists
    if (botToken) {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: telegramChatId,
        text: translatedText,
        parse_mode: 'HTML',
      }).catch(err => {
        console.error('Failed to send Telegram Bot message:', err?.response?.data || err.message);
      });
    }

    // 3. Store in Supabase telegram_messages
    const { error: msgErr } = await supabaseAdmin.from('telegram_messages').insert({
      chat_id: chatId,
      telegram_chat_id: telegramChatId,
      sender_type: 'admin',
      original_text: koreanText,
      translated_text: translatedText,
      source_lang: 'ko',
      target_lang: targetLang || 'en',
      is_read: true,
    });

    if (msgErr) {
      console.error('Failed to save admin message to Supabase:', msgErr);
      return NextResponse.json({ ok: false, error: msgErr.message }, { status: 500 });
    }

    // 4. Update session last_message_at
    await supabaseAdmin
      .from('telegram_chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('telegram_chat_id', telegramChatId);

    return NextResponse.json({
      ok: true,
      originalText: koreanText,
      translatedText,
      targetLang
    });
  } catch (error: any) {
    console.error('Send telegram message error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
