import { ai } from '@/ai/genkit';
import { supabaseAdmin } from './supabase';

/**
 * Generate 3072-dimensional vector embedding for a given text using gemini-embedding-001
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.embed({
      embedder: 'googleai/gemini-embedding-001',
      content: text,
    });
    if (response && response[0] && response[0].embedding) {
      return response[0].embedding;
    }
    throw new Error('No embedding returned from API');
  } catch (error: any) {
    console.error('[Embedding Error]:', error);
    throw error;
  }
}

export interface MatchedScript {
  id: number;
  refund_step: string;
  target_psychology: string;
  script_text: string;
  success_weight: number;
  similarity: number;
}

/**
 * Retrieve matched refund scripts based on user message semantic search
 */
export async function retrieveMatchedScripts(
  messageText: string,
  lang: string = 'ko',
  step?: string,
  threshold: number = 0.5,
  limit: number = 3
): Promise<MatchedScript[]> {
  try {
    const queryEmbedding = await getEmbedding(messageText);
    
    // Call Supabase RPC
    const { data, error } = await supabaseAdmin.rpc('match_refund_scripts', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      p_step: step || null,
      p_lang: lang,
    });

    if (error) {
      console.error('[Retrieve Scripts RPC Error]:', error);
      return [];
    }

    return (data || []) as MatchedScript[];
  } catch (err) {
    console.error('[Retrieve Scripts Error]:', err);
    return [];
  }
}

/**
 * Log conversion feedback and increment success weight of the script
 */
export async function logConversionFeedback(
  chatId: string,
  actionType: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Find the support chat session to check its metadata for the last script ID
    const { data: chat, error: chatErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, metadata')
      .eq('id', chatId)
      .maybeSingle();

    if (chatErr) {
      return { success: false, error: `Failed to fetch chat: ${chatErr.message}` };
    }
    if (!chat) {
      return { success: false, error: 'Chat session not found' };
    }

    const scriptId = chat.metadata?.last_script_id;
    if (!scriptId) {
      // It's normal if there was no script sent yet in this session (e.g. instant close without AI dialogue)
      // We still insert the log without a script_id to track the raw action
      const { error: logErr } = await supabaseAdmin
        .from('script_conversion_logs')
        .insert({
          chat_id: chatId,
          script_id: null,
          action_type: actionType,
          score: score,
          is_converted: score >= 8
        });

      if (logErr) {
        return { success: false, error: `Failed to log conversion: ${logErr.message}` };
      }
      return { success: true };
    }

    // 2. Insert into script_conversion_logs
    const { error: logErr } = await supabaseAdmin
      .from('script_conversion_logs')
      .insert({
        chat_id: chatId,
        script_id: scriptId,
        action_type: actionType,
        score: score,
        is_converted: score >= 8
      });

    if (logErr) {
      return { success: false, error: `Failed to log conversion: ${logErr.message}` };
    }

    // 3. Update refund_scripts success_weight (increment by score)
    const { data: updatedScript, error: scriptErr } = await supabaseAdmin.rpc('increment_script_weight', {
      script_id_input: scriptId,
      increment_amount: score
    });

    // Fallback if rpc is not created yet
    if (scriptErr) {
      console.warn('RPC increment_script_weight failed, using direct query update:', scriptErr.message);
      
      const { data: script } = await supabaseAdmin
        .from('refund_scripts')
        .select('success_weight')
        .eq('id', scriptId)
        .single();
        
      if (script) {
        await supabaseAdmin
          .from('refund_scripts')
          .update({ success_weight: (script.success_weight || 0) + score })
          .eq('id', scriptId);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Feedback Logging Error]:', err);
    return { success: false, error: err.message };
  }
}
