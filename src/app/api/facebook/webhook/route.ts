import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import { analyzeDocumentImage } from '@/ai/flows/multimodal-document-flow';
import axios from 'axios';

// 1. GET: Webhook Verification for Meta (Facebook Messenger Setup)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'easy_tax_refund_messenger_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Facebook Webhook] Verified successfully.');
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }
  return NextResponse.json({ status: 'Facebook Messenger webhook active' });
}

// 2. POST: Handle Incoming Facebook Messenger Messages
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if it's a page subscription callback
    if (body.object !== 'page') {
      return NextResponse.json({ ok: false, error: 'Not a page event' }, { status: 400 });
    }

    const entry = body.entry?.[0];
    const messagingEvent = entry?.messaging?.[0];

    // Check if valid message event
    if (!messagingEvent || !messagingEvent.message || messagingEvent.message.is_echo) {
      return NextResponse.json({ ok: true });
    }

    const psid = messagingEvent.sender?.id; // Page Scoped ID (Unique client id)
    const rawText = messagingEvent.message.text || '[미디어/파일 수신]';

    if (!psid) {
      return NextResponse.json({ ok: true });
    }

    // Optional: Get User's First Name & Last Name from Facebook Graph API if PAGE_ACCESS_TOKEN is available
    let userName = `Messenger 고객 #${psid.substring(0, 6)}`;
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (pageAccessToken) {
      try {
        const profileUrl = `https://graph.facebook.com/${psid}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken}`;
        const profileRes = await axios.get(profileUrl);
        if (profileRes.data) {
          const { first_name, last_name } = profileRes.data;
          userName = `${first_name || ''} ${last_name || ''}`.trim() || userName;
        }
      } catch (err: any) {
        console.error('[Facebook Webhook] Failed to fetch profile info:', err.message);
      }
    }

    // Extract attachment URL for image/OCR
    let attachmentUrl = '';
    const attachments = messagingEvent.message.attachments;
    if (attachments && attachments.length > 0) {
      const firstAttachment = attachments[0];
      if (firstAttachment.type === 'image' && firstAttachment.payload?.url) {
        attachmentUrl = firstAttachment.payload.url;
      }
    }

    // 1. AI Auto language detection & translation to Korean or OCR image analysis
    let sourceLang = 'en';
    let translatedText = rawText;
    let ocrResult = null;

    if (attachmentUrl) {
      try {
        const ocr = await analyzeDocumentImage(attachmentUrl);
        ocrResult = ocr;
        translatedText = `[신분증/문서 수신] 분석결과:\n- 구분: ${ocr.documentType}\n- 신뢰도: ${ocr.confidence}\n- 성명: ${ocr.name || 'N/A'}\n- 외국인등록번호: ${ocr.arcNo || 'N/A'}\n- 비자: ${ocr.visaStatus || 'N/A'}\n\n피드백: ${ocr.analysisFeedback}`;
        sourceLang = 'ko';
      } catch (err: any) {
        console.error('[Facebook Webhook] OCR analysis failed:', err.message);
      }
    } else {
      const translationResult = await translateIncomingTelegramMessage(rawText);
      sourceLang = translationResult.sourceLang || 'en';
      translatedText = translationResult.translatedText || rawText;
    }

    // 2. Load or create the unified Support Chat Session in Supabase
    let chatSession = null;
    const { data: existingChat, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, unread_count')
      .eq('channel', 'facebook')
      .eq('external_chat_id', String(psid))
      .maybeSingle();

    if (fetchErr) {
      console.error('[Facebook Webhook] Failed to query existing chat:', fetchErr);
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
        console.error('[Facebook Webhook] Failed to update chat session:', updateErr);
        return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
      }
      chatSession = updatedChat;
    } else {
      const { data: newChat, error: insertErr } = await supabaseAdmin
        .from('support_chats')
        .insert({
          channel: 'facebook',
          external_chat_id: String(psid),
          user_name: userName,
          detected_language: sourceLang,
          last_message_at: new Date().toISOString(),
          unread_count: 1,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('[Facebook Webhook] Failed to insert chat session:', insertErr);
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
      console.error('[Facebook Webhook] Failed to insert support message:', msgErr);
      return NextResponse.json({ ok: false, error: msgErr.message }, { status: 500 });
    }

    // 4. If OCR image analysis was performed, auto-reply the feedback to Facebook customer
    if (ocrResult && ocrResult.analysisFeedback) {
      if (pageAccessToken) {
        const facebookUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
        try {
          await axios.post(facebookUrl, {
            recipient: { id: psid },
            message: { text: ocrResult.analysisFeedback }
          });

          // Store the AI's auto-reply feedback message in support_messages
          await supabaseAdmin.from('support_messages').insert({
            chat_id: chatSession.id,
            sender_type: 'admin',
            original_text: ocrResult.analysisFeedback,
            translated_text: ocrResult.analysisFeedback,
            source_lang: 'ko',
            target_lang: sourceLang,
            is_read: true,
          });
        } catch (err: any) {
          console.error('[Facebook Webhook] OCR Auto-reply failed:', err?.response?.data || err.message);
        }
      }
    }

    return NextResponse.json({ ok: true, translated: translatedText });
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing message:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
