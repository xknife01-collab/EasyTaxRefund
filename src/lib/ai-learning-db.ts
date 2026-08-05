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
    
    // Fetch slightly more candidates from RPC to allow reranking
    const fetchLimit = Math.max(limit * 3, 10);

    // Call Supabase RPC
    const { data, error } = await supabaseAdmin.rpc('match_refund_scripts', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: fetchLimit,
      p_step: step || null,
      p_lang: lang,
    });

    if (error) {
      console.error('[Retrieve Scripts RPC Error]:', error);
      return [];
    }

    const rawList = (data || []) as MatchedScript[];
    if (rawList.length === 0) return [];

    // Re-rank candidates by weighting similarity (60%) and success_weight (40%)
    const rerankedList = [...rawList].sort((a, b) => {
      const scoreA = (a.similarity * 0.6) + (Math.min(a.success_weight || 0, 100) / 100 * 0.4);
      const scoreB = (b.similarity * 0.6) + (Math.min(b.success_weight || 0, 100) / 100 * 0.4);
      return scoreB - scoreA;
    });

    return rerankedList.slice(0, limit);
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
    // We try querying by external_chat_id first since the client widget sends that
    let chat = null;
    let chatErr = null;

    const { data: chatByExt, error: extErr } = await supabaseAdmin
      .from('support_chats')
      .select('id, metadata')
      .eq('external_chat_id', chatId)
      .maybeSingle();

    if (!extErr && chatByExt) {
      chat = chatByExt;
    } else {
      // Fallback to checking by primary key id if it's a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(chatId)) {
        const { data: chatById, error: idErr } = await supabaseAdmin
          .from('support_chats')
          .select('id, metadata')
          .eq('id', chatId)
          .maybeSingle();

        if (!idErr && chatById) {
          chat = chatById;
        } else {
          chatErr = idErr || extErr;
        }
      } else {
        chatErr = extErr;
      }
    }

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
          chat_id: chat.id,
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
        chat_id: chat.id,
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

    // 4. If the conversion action is 'signed', trigger Self-Learning RAG Loop
    if (actionType === 'signed') {
      try {
        const { data: messages, error: msgErr } = await supabaseAdmin
          .from('support_messages')
          .select('sender_type, original_text, translated_text, source_lang')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true });

        if (!msgErr && messages && messages.length > 0) {
          for (let i = 0; i < messages.length - 1; i++) {
            const currentMsg = messages[i];
            const nextMsg = messages[i + 1];

            // Match Customer -> Admin (Manager response) pair
            if (currentMsg.sender_type === 'customer' && nextMsg.sender_type === 'admin') {
              const queryText = currentMsg.original_text || '';
              const responseText = nextMsg.original_text || nextMsg.translated_text || '';

              if (queryText.trim().length > 5 && responseText.trim().length > 10) {
                const embedding = await getEmbedding(queryText.trim()).catch(() => null);
                if (embedding) {
                  const existingMatches = await retrieveMatchedScripts(queryText.trim(), currentMsg.source_lang || 'ko', undefined, 0.85, 1);
                  if (existingMatches && existingMatches.length > 0) {
                    const matchedScript = existingMatches[0];
                    console.log(`[Self-Learning RAG] Found highly similar script (ID: ${matchedScript.id}, Similarity: ${matchedScript.similarity}). Incrementing success weight instead of inserting duplicate.`);
                    await Promise.resolve(supabaseAdmin.rpc('increment_script_weight', {
                      script_id_input: matchedScript.id,
                      increment_amount: 15
                    })).catch(async () => {
                      const { data: script } = await supabaseAdmin
                        .from('refund_scripts')
                        .select('success_weight')
                        .eq('id', matchedScript.id)
                        .single();
                      if (script) {
                        await supabaseAdmin
                          .from('refund_scripts')
                          .update({ success_weight: (script.success_weight || 0) + 15 })
                          .eq('id', matchedScript.id);
                      }
                    });
                  } else {
                    await supabaseAdmin.from('refund_scripts').insert({
                      refund_step: 'success_case',
                      target_psychology: 'real_conversion_case',
                      script_text: responseText.trim(),
                      detected_language: currentMsg.source_lang || 'ko',
                      success_weight: 15,
                      embedding: embedding
                    });
                    console.log(`[Self-Learning RAG] Successfully learned new successful response in: ${currentMsg.source_lang || 'ko'}`);
                  }
                }
              }
            }
          }
        }
      } catch (learningErr) {
        console.error('[Self-Learning RAG Error]:', learningErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Feedback Logging Error]:', err);
    return { success: false, error: err.message };
  }
}
