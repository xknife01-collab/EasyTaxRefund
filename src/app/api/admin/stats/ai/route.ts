import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch all support chats
    const { data: chats, error: chatsErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, channel, detected_language, metadata, cumulative_pos, cumulative_neg');

    if (chatsErr) {
      throw chatsErr;
    }

    const chatsList = chats || [];
    const totalChats = chatsList.length;

    // Grouping by channel
    const chatsByChannel: Record<string, number> = {
      web: 0,
      facebook: 0,
      telegram: 0,
      whatsapp: 0,
      kakao: 0,
    };
    
    let takeoverCount = 0;
    let aiActiveCount = 0;
    let signedCount = 0;

    const personalityDistribution: Record<string, number> = {
      driver: 0,
      skeptical: 0,
      analytical: 0,
      expressive: 0,
      unknown: 0,
    };

    chatsList.forEach(chat => {
      const ch = chat.channel || 'web';
      if (chatsByChannel[ch] !== undefined) {
        chatsByChannel[ch]++;
      } else {
        chatsByChannel[ch] = 1;
      }

      // Check takeover status
      const metadata = chat.metadata || {};
      const isTakeover = metadata.takeover_alert === true || metadata.is_ai_active === false;
      if (isTakeover) {
        takeoverCount++;
      } else {
        aiActiveCount++;
      }

      // Check step status (signed/completed)
      const currentStep = metadata.current_step || '';
      if (
        currentStep.toLowerCase().includes('signed') || 
        currentStep.toLowerCase().includes('complete') || 
        currentStep.toLowerCase().includes('step 10') || 
        currentStep.toLowerCase().includes('step 11')
      ) {
        signedCount++;
      }

      // Personality distribution
      const personality = metadata.personality_type || 'unknown';
      const cleanPers = String(personality).split(' ')[0].toLowerCase().trim();
      if (personalityDistribution[cleanPers] !== undefined) {
        personalityDistribution[cleanPers]++;
      } else {
        personalityDistribution.unknown++;
      }
    });

    // 2. Fetch top successful RAG scripts with matrix metrics
    const { data: scripts } = await supabaseAdmin
      .from('refund_scripts')
      .select('id, refund_step, target_psychology, script_text, success_weight, detected_language, target_personality, generation_origin, impressions_count, conversions_count, conversion_rate')
      .order('conversion_rate', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalChats,
        chatsByChannel,
        takeoverCount,
        aiActiveCount,
        signedCount,
        personalityDistribution,
        topScripts: scripts || [],
      }
    });
  } catch (error: any) {
    console.error('[AI Stats API Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
