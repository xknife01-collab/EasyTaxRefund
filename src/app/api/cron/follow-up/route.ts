import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { askFollowUpAi } from '@/ai/flows/manager-chat-flow';
import { sendAligoSms } from '@/ai/flows/aligo-sms';
import axios from 'axios';
import { getFacebookPageToken } from '@/lib/facebook';

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
    // 15분 후 1차(시간 분기), 1시간 후 2차(금액+링크), 1~3일 차 롱테일 자동 관리
    // =========================================================================
    const now = Date.now();
    const kstHour = (new Date().getUTCHours() + 9) % 24;
    const kstTimeSlot: 'work' | 'evening' | 'night' = 
      (kstHour >= 8 && kstHour < 18) ? 'work' :
      (kstHour >= 18 && kstHour < 22) ? 'evening' : 'night';

    // 15분 이상 경과한 대화방 대상 조회
    const fifteenMinAgo = new Date(now - 15 * 60 * 1000).toISOString();

    const { data: eligibleChats, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, channel, external_chat_id, detected_language, metadata, last_message_at')
      .in('channel', ['telegram', 'whatsapp', 'facebook'])
      .lt('last_message_at', fifteenMinAgo);

    if (!fetchErr && eligibleChats && eligibleChats.length > 0) {
      for (const chat of eligibleChats) {
        const isAiActive = chat.metadata?.is_ai_active !== false;
        const isTakeover = chat.metadata?.takeover_alert === true || chat.metadata?.is_human_takeover === true;
        const currentStep = String(chat.metadata?.current_step || '').toLowerCase();
        const isCompleted = currentStep.includes('completed') || currentStep.includes('step 10') || currentStep.includes('step 11') || currentStep.includes('step 5');
        const followUpCount = chat.metadata?.follow_up_count || 0;
        const lastMsgTime = chat.last_message_at ? new Date(chat.last_message_at).getTime() : 0;
        const elapsedMs = now - lastMsgTime;

        if (!isAiActive || isTakeover || isCompleted || followUpCount >= 5) {
          continue;
        }

        // 🎯 단계별 발송 자격 판정
        let followUpStage: '15min_first' | '1hour_second' | 'long_term' | null = null;

        if (followUpCount === 0 && elapsedMs >= 15 * 60 * 1000) {
          // 1차 즉시 팔로업: 15분 경과
          followUpStage = '15min_first';
        } else if (followUpCount === 1 && elapsedMs >= 60 * 60 * 1000) {
          // 2차 즉시 팔로업: 1시간 경과
          followUpStage = '1hour_second';
        } else if (followUpCount >= 2 && followUpCount < 5 && elapsedMs >= 20 * 60 * 60 * 1000) {
          // 3일 차 장기 리마인드: 20시간 이상 경과
          followUpStage = 'long_term';
        }

        if (!followUpStage) {
          continue; // 아직 발송 타이밍에 도달하지 않음
        }

        try {
          const lang = chat.detected_language || 'en';
          const resumeLink = `${appBaseUrl}/estimate?step=4&lang=${lang}&prefill=1`;

          const { data: messages } = await supabaseAdmin
            .from('support_messages')
            .select('sender_type, original_text')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: true })
            .limit(20);

          const chatHistoryStr = messages
            ? messages.map(m => `[${m.sender_type === 'customer' ? '사용자' : 'AI매니저'}]: ${m.original_text}`).join('\n')
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
            followUpStage,
            kstTimeSlot,
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
    // [Section B] Web Abandoned Applications Recovery via Supabase & Aligo SMS
    // Indexed High-Speed Query (avoiding full table scans)
    // =========================================================================
    try {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

      const { data: eligibleApps, error: appFetchErr } = await supabaseAdmin
        .from('tax_applications')
        .select('*')
        .not('status', 'in', '("signed","completed","success")')
        .lt('follow_up_sms_count', 2)
        .gte('updated_at', seventyTwoHoursAgo)
        .lte('updated_at', fourHoursAgo)
        .limit(100);

      if (appFetchErr) {
        console.error('[Cron Recovery SMS Supabase Fetch Error]:', appFetchErr.message);
      } else if (eligibleApps && eligibleApps.length > 0) {
        for (const appData of eligibleApps) {
          const phone = appData.phone;
          const followUpSmsCount = appData.follow_up_sms_count || 0;

          // Must have valid phone number
          if (!phone || String(phone).replace(/[^0-9]/g, '').length < 10) {
            continue;
          }

          const lang = appData.language || 'vi';
          const customerName = appData.full_name || '고객';
          const estimatedAmount = appData.estimated_refund_amount || 1850000;
          
          // 🚀 Generate Direct App Recovery URL
          const resumeUrl = `${appBaseUrl}/estimate?resumeId=${appData.id}&lang=${lang}&prefill=1`;

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
            // Update Supabase tax_applications with follow-up metadata
            await supabaseAdmin
              .from('tax_applications')
              .update({
                follow_up_sms_count: followUpSmsCount + 1,
                last_follow_up_sms_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', appData.id);

            processedSms.push({
              appId: appData.id,
              phone: String(phone).substring(0, 7) + '****',
              customerName,
              lang,
              followUpSmsCount: followUpSmsCount + 1,
              resumeUrl,
            });
            console.log(`[Cron Recovery SMS] Successfully sent follow-up SMS to ${customerName} (${phone})`);
          }
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

