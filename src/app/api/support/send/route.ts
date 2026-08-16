import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateOutgoingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import axios from 'axios';
import { getFacebookPageToken } from '@/lib/facebook';

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
      let waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      // Dynamically load WhatsApp Phone Number ID from metadata if present
      try {
        const { data: chatData } = await supabaseAdmin
          .from('support_chats')
          .select('metadata')
          .eq('id', chatId)
          .single();
        if (chatData?.metadata?.whatsapp_phone_number_id) {
          waPhoneId = chatData.metadata.whatsapp_phone_number_id;
        }
      } catch (err) {
        console.error('[OmniChat] Failed to fetch chat metadata for custom phone ID:', err);
      }

      if (waToken && waPhoneId) {
        const waUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
        let recipientNumber = String(externalChatId).replace(/[^0-9]/g, '');
        if (recipientNumber.startsWith('010')) {
          recipientNumber = '82' + recipientNumber.substring(1);
        }

        await axios.post(
          waUrl,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientNumber,
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
      const pageId = (chatSession?.metadata as any)?.page_id;
      const pageAccessToken = getFacebookPageToken(pageId);
      if (pageAccessToken) {
        const facebookUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
        await axios.post(facebookUrl, {
          recipient: { id: externalChatId },
          message: { text: translatedText }
        }).catch(err => {
          console.error('[OmniChat] Facebook delivery failed:', err?.response?.data || err.message);
        });
      } else {
        console.warn('[OmniChat] Facebook Page Access Token is missing for page:', pageId);
      }
    } else if (channel === 'kakao') {
      const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
      const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY || process.env.SOLAPI_API_KEY;
      
      if (kakaoRestApiKey || kakaoAdminKey) {
        // Kakao Business / FriendTalk REST API Endpoint
        const kakaoUrl = `https://kapi.kakao.com/v2/api/talk/memo/send`;
        await axios.post(
          kakaoUrl,
          new URLSearchParams({
            template_object: JSON.stringify({
              object_type: 'text',
              text: `[KTRS CS Center]\n${translatedText}`,
              link: {
                web_url: 'https://easy-tax-refund.co.kr',
                mobile_web_url: 'https://easy-tax-refund.co.kr'
              }
            })
          }).toString(),
          {
            headers: {
              Authorization: `Bearer ${kakaoRestApiKey || kakaoAdminKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        ).catch(err => {
          console.error('[OmniChat] KakaoTalk delivery API failed (logged as dry-run):', err?.response?.data || err.message);
        });
      } else {
        console.log(`[OmniChat] KakaoTalk message sent to ${externalChatId}: "${translatedText}" (Original: "${koreanText}")`);
      }
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
