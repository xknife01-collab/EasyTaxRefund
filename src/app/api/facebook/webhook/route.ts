import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';
import { askManagerAi } from '@/ai/flows/manager-chat-flow';
import { analyzeScreenshot } from '@/ai/flows/vision-analysis-flow';
import axios from 'axios';
import { sendTakeoverAlert } from '@/lib/slack';
import { getFacebookPageToken } from '@/lib/facebook';

export const maxDuration = 60;

// 1. GET: Webhook Verification for Meta (Facebook Messenger Setup)
export async function GET(req: Request) {
  try {
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
        console.warn('[Facebook Webhook] Verification token mismatch.');
        return new Response('Forbidden', { status: 403 });
      }
    }
    return NextResponse.json({ status: 'Facebook Messenger webhook active' });
  } catch (error: any) {
    console.error('[Facebook Webhook] GET error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
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
    const pageId = entry?.id || messagingEvent.recipient?.id;
    const rawText = messagingEvent.message.text || '';
    const pageAccessToken = getFacebookPageToken(pageId);

    if (!psid) {
      return NextResponse.json({ ok: true });
    }

    // Optional: Get User's First Name & Last Name from Facebook Graph API
    let userName = `Messenger 고객 #${psid.substring(0, 6)}`;
    if (pageAccessToken) {
      try {
        const profileUrl = `https://graph.facebook.com/${psid}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken}`;
        const profileRes = await axios.get(profileUrl, { timeout: 4000 });
        if (profileRes.data) {
          const { first_name, last_name } = profileRes.data;
          userName = `${first_name || ''} ${last_name || ''}`.trim() || userName;
        }
      } catch (err: any) {
        console.warn('[Facebook Webhook] Profile fetch skipped/failed:', err.message);
      }
    }

    // Check for image attachments
    let attachmentUrl = '';
    const attachments = messagingEvent.message.attachments;
    if (attachments && attachments.length > 0) {
      const firstAttachment = attachments[0];
      if (firstAttachment.type === 'image' && firstAttachment.payload?.url) {
        attachmentUrl = firstAttachment.payload.url;
      }
    }

    // ─── Case A: Image message received (Vision AI Analysis) ─────────────────
    if (attachmentUrl) {
      console.log(`[Facebook Webhook] 📸 Image received from PSID ${psid}, URL: ${attachmentUrl}`);

      try {
        // 1. Download image from Facebook CDN
        const imgRes = await axios.get(attachmentUrl, { responseType: 'arraybuffer', timeout: 10000 });
        const base64 = Buffer.from(imgRes.data).toString('base64');
        const mimeType = imgRes.headers['content-type'] || 'image/jpeg';

        // 2. Fetch existing chat session for context
        const { data: existingChat } = await supabaseAdmin
          .from('support_chats')
          .select('id, metadata, detected_language')
          .eq('channel', 'facebook')
          .eq('external_chat_id', String(psid))
          .maybeSingle();

        const lang = existingChat?.detected_language || 'en';
        const previousStep = existingChat?.metadata?.current_step || undefined;
        const previousSummary = existingChat?.metadata?.summary || undefined;

        // 3. Analyze screenshot with Vision AI
        const visionResult = await analyzeScreenshot({
          imageBase64: base64,
          mimeType,
          caption: rawText,
          language: lang,
          previousStep,
          previousSummary,
        });

        console.log(`[Facebook Vision] Analysis: step=${visionResult.detectedStep}, isKtrs=${visionResult.isKtrsScreen}, confidence=${visionResult.confidence}%`);

        // 4. Save customer message to support_messages
        const chatId = existingChat?.id;
        if (chatId) {
          await supabaseAdmin.from('support_messages').insert({
            chat_id: chatId,
            sender_type: 'customer',
            original_text: `[📸 스크린샷 전송]${rawText ? ` ${rawText}` : ''}`,
            translated_text: `[📸 스크린샷 전송]${rawText ? ` ${rawText}` : ''}`,
            source_lang: lang,
            target_lang: 'ko',
            is_read: true,
          });
        }

        // 5. Send Vision AI response to customer via Facebook Send API
        if (pageAccessToken) {
          const fbUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;

          let chunks = visionResult.guidanceMessage
            .split(/[|]|\n{2,}/)
            .map(c => c.trim())
            .filter(c => c.length > 0);

          if (chunks.length > 2) {
            const first = chunks[0];
            const rest = chunks.slice(1).join(' ');
            chunks = [first, rest];
          }

          const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

          for (const chunk of chunks) {
            const baseSpeed = 20 + Math.random() * 15;
            const basePause = 300 + Math.random() * 400;
            const typingTime = Math.min(chunk.length * baseSpeed + basePause, 3000);
            await delay(typingTime);

            await axios.post(
              fbUrl,
              {
                recipient: { id: psid },
                message: { text: chunk }
              },
              { timeout: 8000 }
            ).catch(err => {
              console.error('[Facebook Vision AI Response] Delivery failed:', err?.response?.data || err.message);
            });

            await delay(1000 + Math.random() * 500);
          }
        }

        // 6. Record admin response in support_messages
        if (chatId) {
          await supabaseAdmin.from('support_messages').insert({
            chat_id: chatId,
            sender_type: 'admin',
            original_text: visionResult.guidanceMessage,
            translated_text: visionResult.guidanceMessage,
            source_lang: 'ko',
            target_lang: lang,
            is_read: true,
          });
        }

        return NextResponse.json({ ok: true, vision: true });
      } catch (err: any) {
        console.error('[Facebook Webhook] Vision processing error:', err.message);
      }
    }

    // ─── Case B: Text message received (Manager Chat Flow) ───────────────────
    if (!rawText.trim()) {
      return NextResponse.json({ ok: true });
    }

    // 1. Load existing chat session to know current language context
    let chatSession = null;
    let cumulativePos = 0;
    let cumulativeNeg = 0;

    const { data: existingChat, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, unread_count, cumulative_pos, cumulative_neg, metadata, detected_language')
      .eq('channel', 'facebook')
      .eq('external_chat_id', String(psid))
      .maybeSingle();

    if (fetchErr) {
      console.error('[Facebook Webhook] Failed to query existing chat:', fetchErr);
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }

    // 2. Language detection & translation
    const translationResult = await translateIncomingTelegramMessage(rawText);
    let sourceLang = translationResult.sourceLang || 'en';
    const translatedText = translationResult.translatedText || rawText;

    const hasKoreanChar = /[가-힣]/.test(rawText.trim());
    const isNumericOrDate = /^[\d\s.,/\-vVonwon만원$]+$/i.test(rawText.trim()) || rawText.trim().length <= 4;
    const existingLang = existingChat?.detected_language;

    // If existing session is already in a foreign language (e.g. 'vi', 'ne', 'uz', etc.):
    // NEVER switch to 'ko' or 'en' unless user explicitly wrote Korean hangul!
    if (existingLang && existingLang !== 'ko' && !hasKoreanChar) {
      if (isNumericOrDate || sourceLang === 'ko' || sourceLang === 'en') {
        sourceLang = existingLang;
      }
    }

    if (existingChat) {
      cumulativePos = existingChat.cumulative_pos ?? 0;
      cumulativeNeg = existingChat.cumulative_neg ?? 0;

      const { data: updatedChat, error: updateErr } = await supabaseAdmin
        .from('support_chats')
        .update({
          user_name: userName,
          detected_language: sourceLang,
          last_message_at: new Date().toISOString(),
          unread_count: (existingChat.unread_count || 0) + 1,
        })
        .eq('id', existingChat.id)
        .select('id, metadata, cumulative_pos, cumulative_neg, detected_language')
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
          metadata: {
            page_id: pageId,
            is_ai_active: true,
            summary: '신규 페이스북 메신저 고객 유입',
            current_step: 'Step 0: Estimate (신청 준비 단계)',
            user_facts: {},
            personality_type: 'expressive'
          }
        })
        .select('id, metadata, cumulative_pos, cumulative_neg')
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

    // 3. Insert customer message
    const { data: insertedMsg } = await supabaseAdmin
      .from('support_messages')
      .insert({
        chat_id: chatSession.id,
        sender_type: 'customer',
        original_text: rawText,
        translated_text: translatedText,
        source_lang: sourceLang,
        target_lang: 'ko',
        is_read: false,
      })
      .select('id')
      .single();

    // 4. Check Global & Room AI Switches
    const { data: globalSettings } = await supabaseAdmin
      .from('support_chats')
      .select('metadata')
      .eq('external_chat_id', 'GLOBAL_SYSTEM_SETTINGS')
      .maybeSingle();

    const isGlobalAiActive = globalSettings ? (globalSettings.metadata?.is_ai_active !== false) : true;
    const isRoomAiActive = chatSession.metadata?.is_ai_active !== false;
    const isAiActive = isGlobalAiActive && isRoomAiActive;

    if (!isAiActive) {
      console.log(`[Facebook Webhook] 🤖 AI is inactive for PSID ${psid}. Skipping auto-reply.`);
      return NextResponse.json({ ok: true, aiSkipped: true });
    }

    // 5. Build conversation history and context
    const { data: historyMsgs } = await supabaseAdmin
      .from('support_messages')
      .select('sender_type, original_text, translated_text')
      .eq('chat_id', chatSession.id)
      .order('created_at', { ascending: true })
      .limit(20);

    const history = (historyMsgs || [])
      .filter((_, idx) => idx < (historyMsgs?.length || 0) - 1)
      .map(m => ({
        role: m.sender_type === 'customer' ? 'user' as const : 'model' as const,
        text: m.original_text || m.translated_text || ''
      }));

    const previousSummary = chatSession.metadata?.summary || '이전 요약 기록 없음';
    const previousStep = chatSession.metadata?.current_step || 'Step 0: Estimate (신청 준비 단계)';
    const previousFactsObj = chatSession.metadata?.user_facts || {};
    const previousFacts = Object.entries(previousFactsObj)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n') || '기록된 사용자 팩트 없음';
    const previousPersonality = chatSession.metadata?.personality_type || 'expressive (기본값: 친근감 선호형)';

    // 6. Ask AI Manager (Kim Jun-hyun)
    const aiResult = await askManagerAi({
      message: rawText,
      language: sourceLang,
      history,
      channel: 'facebook',
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

    // 7. Update metadata & sentiment in DB
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

    if (isHighNegAlert && !currentMetadata.takeover_alert) {
      console.warn(`[🚨 HIGH NEGATIVE ALERT Facebook] Chat ${chatSession.id} reached ${updatedCumulativeNeg}.`);
      await sendTakeoverAlert({
        chatId: chatSession.id,
        channel: 'facebook',
        userName: userName,
        detectedLanguage: sourceLang,
        cumulativeNeg: updatedCumulativeNeg,
        summary: aiResult.conversationSummary || currentMetadata.summary || '요약 없음',
        lastMessage: rawText,
      }).catch(err => console.error('[Slack Alert Facebook Error]:', err));
    }

    await supabaseAdmin
      .from('support_chats')
      .update({
        metadata: updatedMetadata,
        cumulative_pos: updatedCumulativePos,
        cumulative_neg: updatedCumulativeNeg
      })
      .eq('id', chatSession.id);

    if (insertedMsg?.id) {
      await supabaseAdmin
        .from('support_messages')
        .update({
          pos_score: newPosScore,
          neg_score: newNegScore
        })
        .eq('id', insertedMsg.id);
    }

    // 8. Deliver AI Response to Facebook Messenger with human-like typing
    if (pageAccessToken) {
      const fbUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;

      let chunks = aiResult.answer
        .split(/[|]|\n{2,}/)
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (chunks.length > 2) {
        const first = chunks[0];
        const rest = chunks.slice(1).join(' ');
        chunks = [first, rest];
      }

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (const chunk of chunks) {
        const baseSpeed = 20 + Math.random() * 15;
        const basePause = 300 + Math.random() * 400;
        const typingTime = Math.min(chunk.length * baseSpeed + basePause, 3000);
        await delay(typingTime);

        await axios.post(
          fbUrl,
          {
            recipient: { id: psid },
            message: { text: chunk }
          },
          { timeout: 8000 }
        ).catch(err => {
          console.error('[Facebook AI Response Delivery failed]:', err?.response?.data || err.message);
        });

        await delay(1200 + Math.random() * 600);
      }

      // 🚀 If proactive collection is complete, send the Step 4 direct jump link
      if (aiResult.collectedUserData && aiResult.collectedUserData.isComplete) {
        const cd = aiResult.collectedUserData;
        const nameParam = encodeURIComponent(cd.name || '');
        const regNoParam = encodeURIComponent(cd.registrationNumber || '');
        const phoneParam = encodeURIComponent(cd.phone || '');
        const carrierParam = encodeURIComponent(cd.carrier || '');
        const salaryParam = cd.salary ? `&salary=${cd.salary}` : '';
        const workMonthsParam = cd.workMonths ? `&workMonths=${cd.workMonths}` : '';
        const step4Url = `https://ktrs-service.vercel.app/estimate?prefill=1&name=${nameParam}&regNo=${regNoParam}&phone=${phoneParam}&carrier=${carrierParam}${salaryParam}${workMonthsParam}&step=4&lang=${sourceLang}`;

        await delay(1000);
        await axios.post(
          fbUrl,
          {
            recipient: { id: psid },
            message: {
              text: `👉 ${step4Url}`
            }
          },
          { timeout: 8000 }
        ).catch(err => {
          console.error('[Facebook Step 4 Link Delivery failed]:', err?.response?.data || err.message);
        });
      }
    }

    // 9. Store AI response in support_messages
    const richCardStr = aiResult.richCardPayload && aiResult.richCardPayload.cardType !== 'none'
      ? `\n[RICH_CARD_JSON: ${JSON.stringify(aiResult.richCardPayload)}]`
      : '';

    let aiKoreanText = aiResult.koreanSummary || aiResult.answer;
    if (sourceLang && sourceLang !== 'ko' && !/[가-힣]/.test(aiResult.answer)) {
      try {
        const transRes = await translateIncomingTelegramMessage(aiResult.answer);
        if (transRes?.translatedText) {
          aiKoreanText = transRes.translatedText;
        }
      } catch {
        // fallback
      }
    }

    await supabaseAdmin.from('support_messages').insert({
      chat_id: chatSession.id,
      sender_type: 'admin',
      original_text: aiResult.answer + richCardStr,
      translated_text: aiKoreanText + richCardStr,
      source_lang: sourceLang || 'en',
      target_lang: 'ko',
      is_read: true,
      pos_score: newPosScore,
      neg_score: newNegScore,
    });

    return NextResponse.json({
      ok: true,
      translated: translatedText,
      answer: aiResult.answer,
      collectedUserData: aiResult.collectedUserData
    });
  } catch (error: any) {
    console.error('[Facebook Webhook] Error processing message:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
