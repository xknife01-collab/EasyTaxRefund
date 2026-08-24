import { NextRequest, NextResponse } from "next/server";
import { askManagerAi } from "@/ai/flows/manager-chat-flow";
import { translateIncomingTelegramMessage } from "@/ai/flows/telegram-translation-flow";
import { supabaseAdmin } from "@/lib/supabase";
import { sendTakeoverAlert } from "@/lib/slack";

const FALLBACK_MAINTENANCE_MESSAGES: Record<string, string> = {
  ko: "안녕하세요! 김준현 공식 매니저입니다. 현재 국세청 시스템 및 상담 서버가 잠시 점검 중입니다. 급하신 문의는 아래 [왓츠앱] 또는 [텔레그램] 실시간 상담 버튼을 눌러주시면 즉시 답변해 드리겠습니다! 🛡️",
  en: "Hello! This is Manager Kim Jun-hyun. Our consultation and tax system server is currently undergoing temporary maintenance. For urgent inquiries, please click the [WhatsApp] or [Telegram] button below to connect with us immediately! 🛡️",
  vi: "Xin chào! Tôi là quản lý chính thức Kim Jun-hyun. Hiện tại hệ thống và máy chủ tư vấn đang được bảo trì tạm thời. Nếu có thắc mắc gấp, vui lòng bấm nút [WhatsApp] hoặc [Telegram] bên dưới để được hỗ trợ ngay lập tức! 🛡️",
  zh: "您好！我是金俊贤官方经理。目前国税厅系统及咨询服务器正在进行临时维护。如有紧急咨询，请点击下方的 [WhatsApp] 或 [Telegram] 按钮，我们将立即为您解答！🛡️",
  mn: "Сайн байна уу! Би менежер Ким Жүн Хён байна. Одоогоор татварын систем болон зөвлөгөө өгөх серверт түр хугацааны засвар үйлчилгээ хийгдэж байна. Яаралтай асуух зүйл байвал доорх [WhatsApp] эсвэл [Telegram] товчийг дарж холбогдоно уу! 🛡️",
  th: "สวัสดีครับ! ผมผู้จัดการคิมจุนฮยอน ขณะนี้ระบบสรรพากรและเซิร์ฟเวอร์ให้คำปรึกษากำลังปิดปรับปรุงชั่วคราว หากมีข้อสงสัยเร่งด่วน กรุณากดปุ่ม [WhatsApp] หรือ [Telegram] ด้านล่างเพื่อรับคำตอบทันทีครับ! 🛡️",
  ne: "नमस्ते! म आधिकारिक प्रबन्धक किम जुन-ह्युन हुँ। हाल कर प्रणाली र परामर्श सर्भरमा अस्थायी मर्मत भइरहेको छ। तुरुन्त सोधपुछका लागि तलको [WhatsApp] वा [Telegram] बटनमा क्लिक गरी सम्पर्क गर्नुहोला! 🛡️",
  uz: "Assalomu alaykum! Men rasmiy menejer Kim Jun-hyunman. Hozirda soliq tizimi va maslahat serverida vaqtinchalik profilaktika ishlari olib borilmoqda. Shoshilinch savollaringiz bo'lsa, quyidagi [WhatsApp] yoki [Telegram] tugmasini bosib darhol javob olishingiz mumkin! 🛡️",
  my: "မင်္ဂလာပါ! ကျွန်တော်သည် တရားဝင်မန်နေဂျာ ကင်မ်ဂျွန်းဟျွန် ဖြစ်ပါသည်။ လက်ရှိတွင် အခွန်စနစ်နှင့် တိုင်ပင်ဆွေးနွေးမှု ဆာဗာကို ခေတ္တထိန်းသိမ်းမှု ပြုလုပ်နေပါသည်။ အရေးပေါ်မေးမြန်းလိုပါက အောက်ပါ [WhatsApp] သို့မဟုတ် [Telegram] ခလုတ်ကိုနှိပ်၍ ချက်ချင်း ဆက်သွယ်မေးမြန်းနိုင်ပါသည်! 🛡️",
  id: "Halo! Saya manajer resmi Kim Jun-hyun. Saat ini sistem perpajakan dan server konsultasi kami sedang dalam pemeliharaan sementara. Untuk pertanyaan mendesak, silakan klik tombol [WhatsApp] atau [Telegram] di bawah ini untuk segera terhubung! 🛡️",
  km: "សួស្តី! ខ្ញុំជាអ្នកគ្រប់គ្រងផ្លូវការ Kim Jun-hyun។ បច្ចុប្បន្ន ប្រព័ន្ធពន្ធដារ និងម៉ាស៊ីនមេពិគ្រោះយោបល់កំពុងស្ថិតក្រោមការថែទាំបណ្តោះអាសន្ន។ សម្រាប់ចម្ងល់បន្ទាន់ សូមចុចប៊ូតុង [WhatsApp] ឬ [Telegram] ខាងក្រោមដើម្បីទទួលបានការឆ្លើយតបភ្លាមៗ! 🛡️",
  si: "ආයුබෝවන්! මම නිල කළමනාකරු කිම් ජුන්-හ්යුන්. දැනට බදු පද්ධතිය සහ උපදේශන සේවාදායකය තාවකාලික නඩත්තුවක පවතී. හදිසි විමසීම් සඳහා කරුණාකර පහත [WhatsApp] හෝ [Telegram] බොත්තම ක්ලික් කරන්න! 🛡️",
  bn: "হ্যালো! আমি অফিসিয়াল ম্যানেজার কিম জুন-হিউন। বর্তমানে কর সিস্টেম এবং পরামর্শ সার্ভার সাময়িক রক্ষণাবেক্ষণে রয়েছে। জরুরি তথ্যের জন্য দয়া করে নিচের [WhatsApp] বা [Telegram] বোতামে ক্লিক করুন! 🛡️",
  kk: "Сәлеметсіз бе! Мен ресми менеджер Ким Джун Хёнмын. Қазіргі уақытта салық жүйесі мен кеңес беру серверінде уақытша техникалық жұмыстар жүргізілуде. Шұғыл сұрақтар бойынша төмендегі [WhatsApp] немесе [Telegram] батырмасын басыңыз! 🛡️",
  ur: "ہیلو! میں آفیشل مینیجر کم جون ہیون ہوں۔ اس وقت ٹیکس سسٹم اور مشاورتی سرور کی عارضی دیکھ بھال جاری ہے۔ فوری معلومات کے لیے نیچے دیے گئے [WhatsApp] یا [Telegram] بٹن پر کلک کریں! 🛡️",
};

export async function POST(req: NextRequest) {
  let userLang = "ko";
  try {
    const body = await req.json().catch(() => ({}));
    const { message, language, sessionLanguage: bodySessionLang, history, chatId, clientOs, clientIsInApp, currentPathname, currentStep, activeGuideContext, referralSource, referralContext } = body;

    userLang = language || bodySessionLang || "ko";

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Determine if this is a background system notification (never rendered in chat)
    const isSystemRequest = message.includes("[SYSTEM_NOTIFICATION]") || message.includes("[STUCK_HELPER]") || message.includes("[STUCK_HELPER_SYSTEM_REQUEST]");

    // 1. Retrieve current sentiment scores and metadata memory from database if chatId is provided
    let cumulativePos = 0;
    let cumulativeNeg = 0;
    let existingChat = null;
    let previousSummary = "이전 요약 기록 없음";
    let previousStep = "Step 0: Estimate (신청 준비 단계)";
    let previousFacts = "기록된 사용자 팩트 없음";
    let previousPersonality = "expressive (기본값: 친근감 선호형)";
    let sessionLanguage = language || bodySessionLang || "ko";

    if (chatId) {
      const { data, error } = await supabaseAdmin
        .from("support_chats")
        .select("id, metadata, cumulative_pos, cumulative_neg, detected_language")
        .eq("channel", "web")
        .eq("external_chat_id", chatId)
        .maybeSingle();

      if (!error && data) {
        existingChat = data;
        cumulativePos = data.cumulative_pos ?? 0;
        cumulativeNeg = data.cumulative_neg ?? 0;
        sessionLanguage = data.detected_language || language || "ko";
        userLang = sessionLanguage;
        previousSummary = data.metadata?.summary || "이전 요약 기록 없음";
        previousStep = data.metadata?.current_step || "Step 0: Estimate (신청 준비 단계)";
        previousPersonality = data.metadata?.personality_type || "expressive (기본값: 친근감 선호형)";
        
        const previousFactsObj = data.metadata?.user_facts || {};
        previousFacts = Object.entries(previousFactsObj)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n') || "기록된 사용자 팩트 없음";
      }
    }

    // 0. Auto-detect message language and translate to Korean for admin/DB if real user message
    let effectiveLanguage = sessionLanguage;
    let translatedKoreanText = message.trim();

    if (!isSystemRequest) {
      try {
        const hasKoreanChar = /[가-힣]/.test(message.trim());
        const isNumericOrShort = /^[\d\s.,/\-vVonwon만원$]+$/i.test(message.trim()) || message.trim().length <= 6;

        // If message is just numbers/amount/date (e.g. "1993/08/20", "35.000000von") and session is in foreign language, keep session language!
        if (isNumericOrShort && sessionLanguage && sessionLanguage !== "ko" && !hasKoreanChar) {
          effectiveLanguage = sessionLanguage;
        } else {
          const translationRes = await translateIncomingTelegramMessage(message.trim());
          if (translationRes && translationRes.sourceLang) {
            // Only switch to 'ko' if user explicitly wrote Korean characters
            if ((translationRes.sourceLang === 'ko' || translationRes.sourceLang === 'en') && !hasKoreanChar && sessionLanguage && sessionLanguage !== 'ko') {
              effectiveLanguage = sessionLanguage;
            } else {
              effectiveLanguage = translationRes.sourceLang;
            }
            translatedKoreanText = translationRes.translatedText || message.trim();
          }
        }
      } catch (err) {
        console.warn("[Web Chat Language Detection Error]:", err);
      }
    }
    userLang = effectiveLanguage || userLang;

    // 1. Check Global System AI Switch status (Global AI Master)
    const { data: globalSettings } = await supabaseAdmin
      .from("support_chats")
      .select("metadata")
      .eq("external_chat_id", "GLOBAL_SYSTEM_SETTINGS")
      .maybeSingle();

    const isGlobalAiActive = globalSettings ? (globalSettings.metadata?.is_ai_active !== false) : true;

    // 2. Check if Room AI Switch is explicitly false
    const isRoomAiActive = existingChat ? (existingChat.metadata?.is_ai_active !== false) : true;

    // AI is inactive if either the Global Master Switch or the Room Switch is off!
    const isAiActive = isGlobalAiActive && isRoomAiActive;

    if (!isAiActive) {
      console.log(`[🤖 AI INACTIVE] Chat ${chatId} is offline (Global=${isGlobalAiActive}, Room=${isRoomAiActive}). Skipping auto-reply.`);
      
      let chatSessionId = "";
      const currentMetadata = existingChat?.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        last_message_text: message.trim()
      };

      if (existingChat) {
        chatSessionId = existingChat.id;
        await supabaseAdmin
          .from("support_chats")
          .update({
            last_message_at: new Date().toISOString(),
            detected_language: effectiveLanguage,
            metadata: updatedMetadata
          })
          .eq("id", existingChat.id);
      } else {
        const { data: newChat } = await supabaseAdmin
          .from("support_chats")
          .insert({
            channel: "web",
            external_chat_id: chatId,
            user_name: "Web Client",
            detected_language: effectiveLanguage,
            last_message_at: new Date().toISOString(),
            metadata: updatedMetadata
          })
          .select("id")
          .single();
        if (newChat) chatSessionId = newChat.id;
      }

      if (chatSessionId) {
        // Write to support_messages (Bypass if system request)
        if (!isSystemRequest) {
          await supabaseAdmin.from("support_messages").insert({
            chat_id: chatSessionId,
            sender_type: "customer",
            original_text: message.trim(),
            translated_text: translatedKoreanText,
            source_lang: effectiveLanguage,
            target_lang: "ko",
            is_read: false
          });
        }

        const dummyUserUuid = '11111111-1111-1111-1111-111111111111';
        
        // Ensure chat_room exists
        const { data: existingRoom } = await supabaseAdmin
          .from("chat_rooms")
          .select("id")
          .eq("id", chatSessionId)
          .maybeSingle();

        if (!existingRoom) {
          await supabaseAdmin.from("chat_rooms").insert({
            id: chatSessionId,
            name: `실시간 환급 상담 - ${chatId.substring(0, 8)}`,
          });
        }

        // Bind member roles
        const { data: existingMembers } = await supabaseAdmin
          .from("chat_room_members")
          .select("user_id")
          .eq("room_id", chatSessionId);

        const existingUserIds = (existingMembers || []).map(m => m.user_id);
        const membersToInsert = [];
        if (!existingUserIds.includes(dummyUserUuid)) {
          membersToInsert.push({ room_id: chatSessionId, user_id: dummyUserUuid, role: 'guest' });
        }
        if (!existingUserIds.includes('00000000-0000-0000-0000-000000000000')) {
          membersToInsert.push({ room_id: chatSessionId, user_id: '00000000-0000-0000-0000-000000000000', role: 'bot' });
        }
        if (membersToInsert.length > 0) {
          await supabaseAdmin.from("chat_room_members").insert(membersToInsert);
        }

        if (!isSystemRequest) {
          await supabaseAdmin.from("chat_messages").insert({
            room_id: chatSessionId,
            sender_id: dummyUserUuid,
            message: message.trim(),
            is_read: false
          });
        }
      }

      return NextResponse.json({
        success: true,
        answer: "",
        isAiActive: false
      });
    }

    // 2. Call Genkit AI Manager Flow with cumulative scores and memory parameters passed in
    const result = await askManagerAi({
      message: message.trim(),
      language: effectiveLanguage,
      history: history || [],
      channel: "web",
      cumulativePos,
      cumulativeNeg,
      previousSummary,
      previousFacts,
      previousStep,
      previousPersonality,
      clientOs,
      clientIsInApp,
      currentPathname,
      currentStep: typeof currentStep === 'number' ? currentStep : undefined,
      activeGuideContext: activeGuideContext || undefined,
      referralSource: referralSource || undefined,
      referralContext: referralContext || undefined
    });

    // 🚀 자가 학습 로그 비동기 수집 (ai_learning_logs)
    if (activeGuideContext && !isSystemRequest) {
      Promise.resolve(
        supabaseAdmin.from("ai_learning_logs").insert({
          auth_method: activeGuideContext.method || 'unknown',
          slide_index: activeGuideContext.slideIndex ?? 0,
          user_language: effectiveLanguage,
          user_question: message.trim(),
          ai_answer: result.answer,
          target_coords: activeGuideContext.targetCoords || null,
          is_resolved: true
        })
      ).catch((err) => console.warn("[ai_learning_logs] Log error:", err));
    }

    // 시스템 요청(STUCK/SYSTEM_NOTIFICATION)은 고객 감정이 아니므로 점수 누적 제외
    const newPosScore = isSystemRequest ? 0 : (result.posScore ?? 0);
    const newNegScore = isSystemRequest ? 0 : (result.negScore ?? 0);

    // 💡 양방향 누적 점수 시스템:
    // 1) 누적 긍정/신뢰 점수: 긍정 반응 시 상승(+), 부정 반응 시 차감(-)되어 실시간 오르내림 반영 (최소 0점)
    // 2) 누적 부정 점수: 부정 반응 시 상승(+), 긍정 반응 시 감쇄(-)
    const updatedCumulativePos = Math.max(0, cumulativePos + newPosScore - Math.round(newNegScore * 1.5));
    const updatedCumulativeNeg = Math.max(0, cumulativeNeg + newNegScore - newPosScore);

    // 고객이 직접 명시적으로 사람/상담원 연결을 요구했는지 감지
    const isExplicitHumanRequest = /(상담원|사람|직원|실제\s*매니저|사람과|사람하고|상담사|인간)\s*(연결|바꿔|대화|상담)/i.test(message.trim());

    // 3. Update database if chatId is provided
    if (chatId) {
      try {
        const currentMetadata = existingChat?.metadata || {};
        const newFacts = result.extractedFacts || {};
        const updatedFacts = {
          ...(currentMetadata.user_facts || {}),
          ...newFacts
        };
        
        // AI는 부정 점수가 높아져도 절대 스스로 대답을 멈추지 않음 (is_ai_active는 항상 true 유지).
        // 오직 고객이 직접 "상담원 연결해 주세요"라고 요구했을 때만 false 전환.
        const updatedIsAiActive = isExplicitHumanRequest ? false : (currentMetadata.is_ai_active ?? true);
        const isHighNegAlert = updatedCumulativeNeg >= 25;

        const updatedMetadata = {
          ...currentMetadata,
          last_script_id: result.matchedScriptId || currentMetadata.last_script_id,
          is_ai_active: updatedIsAiActive,
          summary: result.conversationSummary || currentMetadata.summary,
          current_step: result.currentStep || currentMetadata.current_step,
          personality_type: result.detectedPersonality || currentMetadata.personality_type,
          user_facts: updatedFacts,
          takeover_alert: isHighNegAlert || (currentMetadata.takeover_alert || false),
          client_os: clientOs || currentMetadata.client_os,
          client_is_in_app: clientIsInApp !== undefined ? clientIsInApp : currentMetadata.client_is_in_app,
          last_action_score: result.actionScore,
          last_action_type: result.actionType,
          last_message_text: message.trim(),
        };

        if (isExplicitHumanRequest) {
          console.warn(`[🙋‍♂️ EXPLICIT HUMAN REQUEST] Chat ${chatId} user explicitly requested human agent. AI paused.`);
        }

        let chatSessionId = "";

        if (existingChat) {
          chatSessionId = existingChat.id;
          await supabaseAdmin
            .from("support_chats")
            .update({
              last_message_at: new Date().toISOString(),
              metadata: updatedMetadata,
              detected_language: effectiveLanguage,
              cumulative_pos: updatedCumulativePos,
              cumulative_neg: updatedCumulativeNeg,
            })
            .eq("id", existingChat.id);
        } else {
          const { data: newChat, error: insertErr } = await supabaseAdmin
            .from("support_chats")
            .insert({
              channel: "web",
              external_chat_id: chatId,
              user_name: "Web Client",
              detected_language: effectiveLanguage,
              last_message_at: new Date().toISOString(),
              metadata: updatedMetadata,
              cumulative_pos: updatedCumulativePos,
              cumulative_neg: updatedCumulativeNeg,
            })
            .select("id")
            .single();

          if (insertErr) throw insertErr;
          if (newChat) chatSessionId = newChat.id;
        }

        if (chatSessionId) {
          // 3a. Insert customer message with sentiment scores (Bypass if system request)
          if (!isSystemRequest) {
            const { error: custMsgErr } = await supabaseAdmin.from("support_messages").insert({
              chat_id: chatSessionId,
              sender_type: "customer",
              original_text: message.trim(),
              translated_text: translatedKoreanText,
              source_lang: effectiveLanguage,
              target_lang: "ko",
              is_read: true,
              pos_score: newPosScore,
              neg_score: newNegScore,
            });
            if (custMsgErr) {
              console.error("Failed to insert customer support message:", custMsgErr);
            }
          }

          // 3b. Insert AI manager response
          const richCardStr = result.richCardPayload && result.richCardPayload.cardType !== 'none'
            ? `\n[RICH_CARD_JSON: ${JSON.stringify(result.richCardPayload)}]`
            : '';

          let aiKoreanText = result.koreanSummary || result.answer;
          if (effectiveLanguage && effectiveLanguage !== 'ko' && !/[가-힣]/.test(result.answer)) {
            try {
              const transRes = await translateIncomingTelegramMessage(result.answer);
              if (transRes?.translatedText) {
                aiKoreanText = transRes.translatedText;
              }
            } catch {
              // fallback to koreanSummary or raw answer
            }
          }

          const { error: aiMsgErr } = await supabaseAdmin.from("support_messages").insert({
            chat_id: chatSessionId,
            sender_type: "admin",
            original_text: result.answer + richCardStr,
            translated_text: aiKoreanText + richCardStr,
            source_lang: effectiveLanguage || "ko",
            target_lang: "ko",
            is_read: true
          });
          if (aiMsgErr) {
            console.error("Failed to insert AI support message:", aiMsgErr);
          }

          // 3c. Double write to new tables for admin chat dashboard control
          try {
            // Check if room exists in chat_rooms, insert if missing
            const { data: existingRoom } = await supabaseAdmin
              .from("chat_rooms")
              .select("id")
              .eq("id", chatSessionId)
              .maybeSingle();

            if (!existingRoom) {
              await supabaseAdmin.from("chat_rooms").insert({
                id: chatSessionId,
                name: `실시간 환급 상담 - ${chatId.substring(0, 8)}`,
              });
            }

            // Bind customer and bot role in chat_room_members safely (avoiding duplicate primary key errors)
            const dummyUserUuid = '11111111-1111-1111-1111-111111111111';
            const { data: existingMembers } = await supabaseAdmin
              .from("chat_room_members")
              .select("user_id")
              .eq("room_id", chatSessionId);

            const existingUserIds = (existingMembers || []).map(m => m.user_id);
            const membersToInsert = [];

            if (!existingUserIds.includes(dummyUserUuid)) {
              membersToInsert.push({ room_id: chatSessionId, user_id: dummyUserUuid, role: 'guest' });
            }
            if (!existingUserIds.includes('00000000-0000-0000-0000-000000000000')) {
              membersToInsert.push({ room_id: chatSessionId, user_id: '00000000-0000-0000-0000-000000000000', role: 'bot' });
            }

            if (membersToInsert.length > 0) {
              await supabaseAdmin.from("chat_room_members").insert(membersToInsert);
            }

            // Insert messages to chat_messages
            const messagesToInsert = [];
            if (!isSystemRequest) {
              messagesToInsert.push({
                room_id: chatSessionId,
                sender_id: dummyUserUuid,
                message: message.trim(),
                is_read: true
              });
            }
            messagesToInsert.push({
              room_id: chatSessionId,
              sender_id: '00000000-0000-0000-0000-000000000000',
              message: result.answer + richCardStr,
              is_read: false
            });

            await supabaseAdmin.from("chat_messages").insert(messagesToInsert);

            // Save conversation score details for metrics & logs
            await supabaseAdmin.from("ai_conversation_scores").insert({
              lead_id: 0,
              chat_room_id: chatSessionId,
              planner_id: '00000000-0000-0000-0000-000000000000',
              message_text: message.trim(),
              ai_response: result.answer,
              action_type: result.actionType || 'pending',
              action_score: result.actionScore || 0,
              pos_score: newPosScore,
              neg_score: newNegScore
            });

            // 3d. Self-learning: Boost success weight if actionScore reaches 5 (auth completed)
            if (result.actionScore && result.actionScore >= 5) {
              const matchedScriptId = result.matchedScriptId;
              if (matchedScriptId) {
                const { data: scriptData } = await supabaseAdmin
                  .from('refund_scripts')
                  .select('id, success_weight')
                  .eq('id', matchedScriptId)
                  .single();

                if (scriptData) {
                  await supabaseAdmin
                    .from('refund_scripts')
                    .update({ success_weight: (scriptData.success_weight || 0) + 25 })
                    .eq('id', matchedScriptId);
                  console.log(`[Self-Learning RAG] Auto-boosted success weight for script ID: ${matchedScriptId} (+25) due to actionScore >= 5.`);
                }
              } else {
                // RAG reinforcement: if AI dynamically generated a high-converting sentence, auto-register it
                const currentStep = result.actionType || 'step5_auth';
                const { data: dupScript } = await supabaseAdmin
                  .from('refund_scripts')
                  .select('id, success_weight')
                  .eq('script_text', result.answer)
                  .maybeSingle();

                if (dupScript) {
                  await supabaseAdmin
                    .from('refund_scripts')
                    .update({ success_weight: (dupScript.success_weight || 0) + 25 })
                    .eq('id', dupScript.id);
                  console.log(`[Self-Learning RAG] Dynamically generated script text already exists. Incremented weight by +25.`);
                } else {
                  await supabaseAdmin.from('refund_scripts').insert({
                    refund_step: currentStep,
                    target_psychology: 'trust_safety',
                    script_text: result.answer,
                    detected_language: effectiveLanguage || userLang || 'ko',
                    success_weight: 25,
                    success_count: 1,
                    script_type: 'ai_auto'
                  });
                  console.log(`[Self-Learning RAG] Newly registered dynamically generated high scoring script into RAG database (${effectiveLanguage || userLang || 'ko'}).`);
                }
              }
            }
          } catch (syncErr) {
            console.error("Failed to sync new chat_rooms DDL tables:", syncErr);
          }
        }

        if (isHighNegAlert && !currentMetadata.takeover_alert && chatSessionId) {
          await sendTakeoverAlert({
            chatId: chatSessionId,
            channel: "web",
            userName: "Web Client",
            detectedLanguage: language || "ko",
            cumulativeNeg: updatedCumulativeNeg,
            summary: result.conversationSummary || currentMetadata.summary || "요약 없음",
            lastMessage: message.trim(),
          }).catch((err) => console.error("[Slack Alert API Error]:", err));
        }
      } catch (dbErr) {
        console.error("Failed to update web chat session details in DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      answer: result.answer,
      koreanSummary: result.koreanSummary,
      matchedScriptId: result.matchedScriptId,
      posScore: newPosScore,
      negScore: newNegScore,
      actionScore: result.actionScore,
      actionType: result.actionType,
      richCardPayload: result.richCardPayload,
      collectedUserData: result.collectedUserData
    });
  } catch (error: any) {
    console.error("AI Manager Chat API Error:", error);

    const fallbackLang = (userLang || "ko").toLowerCase();
    const fallbackAnswer = FALLBACK_MAINTENANCE_MESSAGES[fallbackLang] || FALLBACK_MAINTENANCE_MESSAGES["en"] || FALLBACK_MAINTENANCE_MESSAGES["ko"];

    // Fallback reassuring response in user's native language in case of system offline or API key error
    return NextResponse.json({
      success: true,
      answer: fallbackAnswer,
      koreanSummary: "시스템 서버 점검에 따른 비상 안내 발송 (다국어 안내)",
    });
  }
}
