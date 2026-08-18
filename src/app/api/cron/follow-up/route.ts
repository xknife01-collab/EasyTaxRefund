import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { askFollowUpAi } from '@/ai/flows/manager-chat-flow';
import { sendAligoSms } from '@/ai/flows/aligo-sms';
import axios from 'axios';
import { getFacebookPageToken } from '@/lib/facebook';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron authorization header (if configured)
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ktrs-service.vercel.app';
    const processedChats = [];
    const processedSms = [];

    // =========================================================================
    // [Section A] Messenger Channels (WhatsApp, Telegram, Facebook)
    // =========================================================================
    const cutoffTime = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    const { data: eligibleChats, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, channel, external_chat_id, detected_language, metadata')
      .in('channel', ['telegram', 'whatsapp', 'facebook'])
      .lt('last_message_at', cutoffTime);

    if (!fetchErr && eligibleChats && eligibleChats.length > 0) {
      for (const chat of eligibleChats) {
        const isAiActive = chat.metadata?.is_ai_active !== false;
        const followUpCount = chat.metadata?.follow_up_count || 0;

        if (!isAiActive || followUpCount >= 3) {
          continue;
        }

        try {
          const lang = chat.detected_language || 'en';
          const resumeLink = `${appBaseUrl}/?lang=${lang}`;

          const { data: messages } = await supabaseAdmin
            .from('support_messages')
            .select('sender_type, original_text')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: true })
            .limit(20);

          const chatHistoryStr = messages
            ? messages.map(m => `[${m.sender_type === 'user' ? '사용자' : 'AI매니저'}]: ${m.original_text}`).join('\n')
            : '대화 기록 없음';

          const previousSummary = chat.metadata?.summary || "이전 요약 기록 없음";
          const previousStep = chat.metadata?.current_step || "Step 0: Estimate (신청 준비 단계)";
          const previousFactsObj = chat.metadata?.user_facts || {};
          const previousFacts = Object.entries(previousFactsObj)
            .map(([k, v]) => `- ${k}: ${v}`)
            .join('\n') || "기록된 사용자 팩트 없음";

          const aiResult = await askFollowUpAi({ 
            language: lang,
            chatHistory: chatHistoryStr,
            previousSummary,
            previousStep,
            previousFacts,
            resumeUrl: resumeLink,
          });

          let deliverySuccess = false;

          if (chat.channel === 'telegram') {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken && !botToken.includes('YOUR_')) {
              const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
              try {
                await axios.post(telegramUrl, {
                  chat_id: parseInt(chat.external_chat_id, 10),
                  text: aiResult.answer,
                  parse_mode: 'HTML',
                });
              } catch (err: any) {
                console.warn(`[Cron FollowUp] Telegram Bot API delivery error: ${err.message}`);
              }
            }
            deliverySuccess = true;
          } else if (chat.channel === 'whatsapp') {
            const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
            const waPhoneId = chat.metadata?.whatsapp_phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
            if (waToken && waPhoneId && !waToken.includes('YOUR_')) {
              const waUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
              try {
                await axios.post(
                  waUrl,
                  {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: chat.external_chat_id,
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
                );
              } catch (err: any) {
                console.warn(`[Cron FollowUp] WhatsApp API delivery error: ${err.message}`);
              }
            }
            deliverySuccess = true;
          } else if (chat.channel === 'facebook') {
            const pageId = chat.metadata?.page_id;
            const fbToken = getFacebookPageToken(pageId);
            if (fbToken && !fbToken.includes('YOUR_')) {
              const fbUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${fbToken}`;
              try {
                await axios.post(
                  fbUrl,
                  {
                    recipient: { id: chat.external_chat_id },
                    message: { text: aiResult.answer },
                  },
                  { timeout: 8000 }
                );
              } catch (err: any) {
                console.warn(`[Cron FollowUp] Facebook API delivery error: ${err.message}`);
              }
            }
            deliverySuccess = true;
          }

          if (deliverySuccess) {
            await supabaseAdmin.from('support_messages').insert({
              chat_id: chat.id,
              sender_type: 'admin',
              original_text: aiResult.answer,
              translated_text: aiResult.answer,
              source_lang: 'ko',
              target_lang: lang,
              is_read: true,
            });

            await supabaseAdmin
              .from('support_chats')
              .update({
                last_message_at: new Date().toISOString(),
                metadata: {
                  ...(chat.metadata || {}),
                  follow_up_count: followUpCount + 1,
                },
              })
              .eq('id', chat.id);

            processedChats.push({
              chatId: chat.id,
              channel: chat.channel,
              lang,
              followUpCount: followUpCount + 1,
            });
          }
        } catch (chatErr: any) {
          console.error(`[Cron FollowUp] Error processing chat ${chat.id}:`, chatErr.message);
        }
      }
    }

    // =========================================================================
    // [Section B] Web Abandoned Applications Recovery via Aligo SMS
    // =========================================================================
    try {
      const qApps = query(collection(db, 'applications'));
      const querySnapshot = await getDocs(qApps);

      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
      const seventyTwoHoursAgo = Date.now() - 72 * 60 * 60 * 1000;

      for (const docSnap of querySnapshot.docs) {
        const appData = docSnap.data();
        const phone = appData.phone || appData.phoneNo;
        const status = String(appData.status || '').toLowerCase();
        const followUpSmsCount = appData.follow_up_sms_count || 0;

        // Skip if already signed or completed
        if (
          status.includes('signed') || 
          status.includes('completed') || 
          status.includes('success') ||
          appData.isDeleted === true ||
          followUpSmsCount >= 2 // Max 2 SMS recovery attempts
        ) {
          continue;
        }

        // Must have valid phone number
        if (!phone || String(phone).replace(/[^0-9]/g, '').length < 10) {
          continue;
        }

        // Check timestamp (drop-off between 4h and 72h)
        let appTime = 0;
        if (appData.updatedAt?.toDate) appTime = appData.updatedAt.toDate().getTime();
        else if (appData.createdAt?.toDate) appTime = appData.createdAt.toDate().getTime();
        else if (appData.createdAt?.seconds) appTime = appData.createdAt.seconds * 1000;

        if (appTime > fourHoursAgo || (appTime > 0 && appTime < seventyTwoHoursAgo)) {
          // Outside the ideal 4h~72h recovery window
          continue;
        }

        const lang = appData.language || appData.lang || 'vi';
        const customerName = appData.fullName || '고객';
        const estimatedAmount = appData.estimatedRefundAmount || appData.preFilterEstimate || 1850000;
        
        // 🚀 Generate Direct App Recovery URL
        const resumeUrl = `${appBaseUrl}/estimate?resumeId=${docSnap.id}&lang=${lang}&prefill=1`;

        // Generate customized recovery SMS text via Kim Jun-hyun AI
        const smsAiResult = await askFollowUpAi({
          language: lang,
          isSms: true,
          customerName,
          estimatedAmount,
          resumeUrl,
          previousStep: `Step ${appData.step || 4}: 인증 단계`,
          previousSummary: `환급 신청 중단 (예상 환급액: ${estimatedAmount.toLocaleString()}원, 고객명: ${customerName})`,
        });

        // Send via Aligo SMS / LMS
        const smsRes = await sendAligoSms({
          phone: String(phone),
          title: '[이지텍스] 숨은 환급금 조회 안내',
          message: smsAiResult.answer,
        });

        if (smsRes.success) {
          // Update Firestore application with follow-up metadata
          await updateDoc(doc(db, 'applications', docSnap.id), {
            follow_up_sms_count: followUpSmsCount + 1,
            last_follow_up_sms_at: serverTimestamp(),
          });

          processedSms.push({
            appId: docSnap.id,
            phone: String(phone).substring(0, 7) + '****',
            customerName,
            lang,
            followUpSmsCount: followUpSmsCount + 1,
            resumeUrl,
          });
          console.log(`[Cron Recovery SMS] Successfully sent follow-up SMS to ${customerName} (${phone})`);
        }
      }
    } catch (smsCronErr: any) {
      console.error('[Cron Recovery SMS Error]:', smsCronErr.message);
    }

    return NextResponse.json({
      ok: true,
      messengerChatsProcessed: processedChats.length,
      smsRecoveryProcessed: processedSms.length,
      processedChats,
      processedSms,
    });
  } catch (error: any) {
    console.error('[Cron FollowUp] Global error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

