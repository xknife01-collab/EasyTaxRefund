import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { translateIncomingTelegramMessage } from '@/ai/flows/telegram-translation-flow';

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Return 200 OK for raw health ping
      return NextResponse.json({
        version: '2.0',
        template: { outputs: [{ simpleText: { text: '[KTRS] 스킬 연결 확인 완료' } }] }
      });
    }

    // 1. Extract Kakao User ID & Utterance
    const kakaoUserId =
      body?.userRequest?.user?.id ||
      body?.userRequest?.user?.properties?.botUserKey ||
      body?.user_id ||
      body?.user_key ||
      body?.chatId ||
      'unknown_kakao_user';

    const rawText = (
      body?.userRequest?.utterance ||
      body?.content ||
      body?.text ||
      body?.message ||
      ''
    ).trim();

    // Health Check or Empty Test Utterance Payload
    if (!rawText || rawText === '스킬테스트' || rawText === 'test') {
      return NextResponse.json({
        version: '2.0',
        template: {
          outputs: [{ simpleText: { text: '[KTRS AI] 스킬이 정상 연결되었습니다.' } }]
        }
      });
    }

    const userName = body?.userRequest?.user?.properties?.nickname || `카카오 고객 (${kakaoUserId.substring(0, 8)})`;

    // 2. Fast AI Translation with 3.5s Timeout to strictly satisfy Kakao 5s limit
    let sourceLang = 'en';
    let translatedText = rawText;

    try {
      const translationPromise = translateIncomingTelegramMessage(rawText);
      const timeoutPromise = new Promise<{ sourceLang: string; translatedText: string }>((resolve) =>
        setTimeout(() => resolve({ sourceLang: 'en', translatedText: rawText }), 3500)
      );

      const translationResult = await Promise.race([translationPromise, timeoutPromise]);
      sourceLang = translationResult.sourceLang || 'en';
      translatedText = translationResult.translatedText || rawText;
    } catch (err) {
      console.error('[Kakao Webhook] AI Translation fallback:', err);
    }

    // 3. Async DB Session Record (don't block response)
    (async () => {
      try {
        let chatSessionId: string | null = null;
        const { data: existingChat } = await supabaseAdmin
          .from('support_chats')
          .select('id, unread_count')
          .eq('channel', 'kakao')
          .eq('external_chat_id', String(kakaoUserId))
          .maybeSingle();

        if (existingChat) {
          chatSessionId = existingChat.id;
          await supabaseAdmin
            .from('support_chats')
            .update({
              user_name: userName,
              detected_language: sourceLang,
              last_message_at: new Date().toISOString(),
              unread_count: (existingChat.unread_count || 0) + 1,
            })
            .eq('id', existingChat.id);
        } else {
          const { data: newChat } = await supabaseAdmin
            .from('support_chats')
            .insert({
              channel: 'kakao',
              external_chat_id: String(kakaoUserId),
              user_name: userName,
              detected_language: sourceLang,
              last_message_at: new Date().toISOString(),
              unread_count: 1,
            })
            .select('id')
            .single();

          if (newChat) chatSessionId = newChat.id;
        }

        if (chatSessionId) {
          await supabaseAdmin.from('support_messages').insert({
            chat_id: chatSessionId,
            sender_type: 'customer',
            original_text: rawText,
            translated_text: translatedText,
            source_lang: sourceLang,
            target_lang: 'ko',
            is_read: false,
          });
        }
      } catch (dbErr) {
        console.error('[Kakao Webhook DB Error]:', dbErr);
      }
    })();

    // 4. Always Return HTTP 200 within <1s with Kakao v2.0 Skill Format
    return NextResponse.json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: `[KTRS AI 상담원] 문의가 정상 접수되었습니다.\n(번역: ${translatedText})`
            }
          }
        ]
      }
    });

  } catch (error: any) {
    console.error('[Kakao Webhook Critical Catch Error]:', error);
    // MUST ALWAYS RETURN HTTP 200 for Kakao Open Builder Skill
    return NextResponse.json({
      version: '2.0',
      template: {
        outputs: [
          { simpleText: { text: '[KTRS] 문의가 접수되었습니다.' } }
        ]
      }
    });
  }
}

export async function GET() {
  return NextResponse.json({
    version: '2.0',
    template: { outputs: [{ simpleText: { text: 'KakaoTalk Webhook Active' } }] }
  });
}
