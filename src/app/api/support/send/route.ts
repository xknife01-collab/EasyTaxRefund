import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateOutgoingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { chatId, channel, externalChatId, koreanText, targetLang } = await req.json();

    if (!chatId || !channel || !externalChatId || !koreanText) {
      return NextResponse.json({ ok: false, error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Translate Korean to customer's target language via AI Flow
    const { translatedText } = await translateOutgoingTelegramMessage(koreanText, targetLang || 'en');

    // 2. Deliver message based on the source channel
    if (channel === 'telegram') {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(telegramUrl, {
          chat_id: parseInt(externalChatId, 10),
          text: translatedText,
          parse_mode: 'HTML',
        }).catch(err => {
          console.error('[OmniChat] Telegram delivery failed:', err?.response?.data || err.message);
        });
      } else {
        console.warn('[OmniChat] Telegram Bot Token is missing in environment variables.');
      }
    } else if (channel === 'whatsapp') {
      const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      if (waToken && waPhoneId) {
        const waUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
        await axios.post(
          waUrl,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: externalChatId,
            type: 'text',
            text: {
              preview_url: false,
              body: translatedText,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${waToken}`,
              'Content-Type': 'application/json',
            },
          }
        ).catch(err => {
          console.error('[OmniChat] WhatsApp delivery failed:', err?.response?.data || err.message);
        });
      } else {
        console.warn('[OmniChat] WhatsApp Access Token or Phone Number ID is missing in environment variables.');
      }
    } else if (channel === 'facebook') {
      const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      if (pageAccessToken) {
        const facebookUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
        await axios.post(facebookUrl, {
          recipient: { id: externalChatId },
          message: { text: translatedText }
        }).catch(err => {
          console.error('[OmniChat] Facebook delivery failed:', err?.response?.data || err.message);
        });
      } else {
        console.warn('[OmniChat] Facebook Page Access Token is missing in environment variables.');
      }
    } else if (channel === 'kakao') {
      // Stub for Kakao BizTalk / Notification Talk API integration
      console.log(`[OmniChat] KakaoTalk message dry-run to ${externalChatId}: ${translatedText}`);
    }

    // 3. Store message in Supabase support_messages
    const { error: msgErr } = await supabaseAdmin.from('support_messages').insert({
      chat_id: chatId,
      sender_type: 'admin',
      original_text: koreanText,
      translated_text: translatedText,
      source_lang: 'ko',
      target_lang: targetLang || 'en',
      is_read: true,
    });

    if (msgErr) {
      console.error('[OmniChat] Failed to save support message to Supabase:', msgErr);
      return NextResponse.json({ ok: false, error: msgErr.message }, { status: 500 });
    }

    // 4. Update session last_message_at and reset unread count
    await supabaseAdmin
      .from('support_chats')
      .update({
        last_message_at: new Date().toISOString(),
        unread_count: 0
      })
      .eq('id', chatId);

    return NextResponse.json({
      ok: true,
      originalText: koreanText,
      translatedText,
      targetLang
    });
  } catch (error: any) {
    console.error('[OmniChat] Send support message error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
