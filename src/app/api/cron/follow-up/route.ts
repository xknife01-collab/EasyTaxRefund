import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { askFollowUpAi } from '@/ai/flows/manager-chat-flow';
import axios from 'axios';

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron authorization header (if configured)
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch chats that are active, on Telegram/WhatsApp, and haven't had a message in 20 hours
    const cutoffTime = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();

    const { data: eligibleChats, error: fetchErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, channel, external_chat_id, detected_language, metadata')
      .in('channel', ['telegram', 'whatsapp'])
      .lt('last_message_at', cutoffTime);

    if (fetchErr) {
      console.error('[Cron FollowUp] Failed to fetch eligible chats:', fetchErr);
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }

    if (!eligibleChats || eligibleChats.length === 0) {
      return NextResponse.json({ ok: true, message: 'No chats eligible for follow-up.' });
    }

    const processedChats = [];

    for (const chat of eligibleChats) {
      const isAiActive = chat.metadata?.is_ai_active !== false;
      const followUpCount = chat.metadata?.follow_up_count || 0;

      // Limit to max 3 follow-ups until the customer replies (user feedback adjustment)
      if (!isAiActive || followUpCount >= 3) {
        continue;
      }

      try {
        const lang = chat.detected_language || 'en';

        // Fetch recent messages to understand if they have estimated
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

        // Generate warm follow-up message via Gemini Manager Persona
        const aiResult = await askFollowUpAi({ 
          language: lang,
          chatHistory: chatHistoryStr,
          previousSummary,
          previousStep,
          previousFacts,
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
              console.warn(`[Cron FollowUp] Telegram Bot API delivery returned error (token may be dummy). Proceeding with database recording anyway. Error: ${err.message}`);
            }
          } else {
            console.warn(`[Cron DryRun] Telegram Bot Token missing or dummy. Simulating sending to ${chat.external_chat_id}: "${aiResult.answer}"`);
          }
          deliverySuccess = true;
        } else if (chat.channel === 'whatsapp') {
          const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
          const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
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
              console.warn(`[Cron FollowUp] WhatsApp API delivery returned error (token may be dummy). Proceeding with database recording anyway. Error: ${err.message}`);
            }
          } else {
            console.warn(`[Cron DryRun] WhatsApp Token missing or dummy. Simulating sending to ${chat.external_chat_id}: "${aiResult.answer}"`);
          }
          deliverySuccess = true;
        }

        if (deliverySuccess) {
          // Insert AI follow-up message into database
          await supabaseAdmin.from('support_messages').insert({
            chat_id: chat.id,
            sender_type: 'admin',
            original_text: aiResult.answer,
            translated_text: aiResult.answer,
            source_lang: 'ko',
            target_lang: lang,
            is_read: true,
          });

          // Update chat metadata and last_message_at
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

    return NextResponse.json({
      ok: true,
      processedCount: processedChats.length,
      processedChats,
    });
  } catch (error: any) {
    console.error('[Cron FollowUp] Global error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
