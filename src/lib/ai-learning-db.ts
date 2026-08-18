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
  detected_language?: string;
  target_personality?: string;
  generation_origin?: string;
  success_weight: number;
  impressions_count?: number;
  conversions_count?: number;
  conversion_rate?: number;
  similarity: number;
}

/**
 * Retrieve matched refund scripts based on user message semantic search and matrix RL
 */
export async function retrieveMatchedScripts(
  messageText: string,
  lang: string = 'ko',
  step?: string,
  personality: string = 'all',
  threshold: number = 0.45,
  limit: number = 3
): Promise<MatchedScript[]> {
  try {
    const queryEmbedding = await getEmbedding(messageText);
    
    // Fetch slightly more candidates from RPC to allow reranking
    const fetchLimit = Math.max(limit * 3, 10);

    // Call Supabase RPC with matrix parameters
    const { data, error } = await supabaseAdmin.rpc('match_refund_scripts', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: fetchLimit,
      p_step: step || null,
      p_lang: lang,
      p_personality: personality || 'all',
    });

    if (error) {
      console.error('[Retrieve Scripts RPC Error]:', error);
      return [];
    }

    const rawList = (data || []) as MatchedScript[];
    if (rawList.length === 0) return [];

    // Re-rank candidates using Multi-Armed Bandit (Sim 45% + Conversion Rate 40% + Exploration Bonus 15%)
    const rerankedList = [...rawList].sort((a, b) => {
      const rateA = a.conversion_rate || 0.0;
      const rateB = b.conversion_rate || 0.0;
      const bonusA = (a.impressions_count || 0) < 5 ? 0.15 : 0.02;
      const bonusB = (b.impressions_count || 0) < 5 ? 0.15 : 0.02;

      const scoreA = (a.similarity * 0.45) + (rateA * 0.40) + bonusA;
      const scoreB = (b.similarity * 0.45) + (rateB * 0.40) + bonusB;
      return scoreB - scoreA;
    });

    return rerankedList.slice(0, limit);
  } catch (err) {
    console.error('[Retrieve Scripts Error]:', err);
    return [];
  }
}

/**
 * Atomically record script impression count
 */
export async function recordScriptImpression(scriptId: number): Promise<void> {
  try {
    if (!scriptId) return;
    await supabaseAdmin.rpc('record_script_impression', {
      p_script_id: scriptId,
    });
  } catch (err) {
    console.warn('[Record Impression Warning]:', err);
  }
}

/**
 * Log conversion feedback and atomically increment conversion stats of the script
 */
export async function logConversionFeedback(
  chatId: string,
  actionType: string,
  score: number,
  lang: string = 'ko',
  personality: string = 'all'
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Find the support chat session to check its metadata for the last script ID
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

    // 3. Atomically record conversion via RPC
    const { error: scriptErr } = await supabaseAdmin.rpc('record_script_conversion', {
      p_script_id: scriptId,
      p_score: score
    });

    if (scriptErr) {
      console.warn('RPC record_script_conversion failed, using fallback update:', scriptErr.message);
      const { data: script } = await supabaseAdmin
        .from('refund_scripts')
        .select('success_weight, conversions_count, impressions_count')
        .eq('id', scriptId)
        .single();
        
      if (script) {
        const nextConversions = (script.conversions_count || 0) + 1;
        const impressions = script.impressions_count || 1;
        const nextRate = Math.round((nextConversions / impressions) * 10000) / 10000;
        await supabaseAdmin
          .from('refund_scripts')
          .update({ 
            success_weight: (script.success_weight || 0) + score,
            conversions_count: nextConversions,
            conversion_rate: nextRate,
            updated_at: new Date().toISOString()
          })
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

            if (currentMsg.sender_type === 'customer' && nextMsg.sender_type === 'admin') {
              const queryText = currentMsg.original_text || '';
              const responseText = nextMsg.original_text || nextMsg.translated_text || '';

              if (queryText.trim().length > 5 && responseText.trim().length > 10) {
                const embedding = await getEmbedding(queryText.trim()).catch(() => null);
                if (embedding) {
                  const existingMatches = await retrieveMatchedScripts(queryText.trim(), currentMsg.source_lang || 'ko', undefined, personality, 0.85, 1);
                  if (existingMatches && existingMatches.length > 0) {
                    const matchedScript = existingMatches[0];
                    await Promise.resolve(supabaseAdmin.rpc('record_script_conversion', {
                      p_script_id: matchedScript.id,
                      p_score: 15
                    })).catch(() => {});
                  } else {
                    await supabaseAdmin.from('refund_scripts').insert({
                      refund_step: 'success_case',
                      target_psychology: 'real_conversion_case',
                      script_text: responseText.trim(),
                      detected_language: currentMsg.source_lang || 'ko',
                      target_personality: personality || 'all',
                      generation_origin: 'ai_self_generated',
                      success_weight: 15,
                      impressions_count: 1,
                      conversions_count: 1,
                      conversion_rate: 1.0,
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

/**
 * 🚀 AI Self-Prompting Synthesizer: Synthesize and auto-register new sales scripts
 */
export async function generateAndEvolveScripts(params?: {
  targetLanguage?: string;
  targetPersonality?: 'driver' | 'skeptical' | 'analytical' | 'expressive' | 'all';
  targetStep?: string;
  count?: number;
}): Promise<{ success: boolean; generatedCount: number; scripts: any[] }> {
  const lang = params?.targetLanguage || 'vi';
  const personality = params?.targetPersonality || 'all';
  const step = params?.targetStep || 'general';
  const count = params?.count || 3;

  try {
    // 1. Fetch current top performing scripts for reference
    const { data: topScripts } = await supabaseAdmin
      .from('refund_scripts')
      .select('script_text, success_weight, conversion_rate')
      .or(`detected_language.eq.${lang},detected_language.eq.all,detected_language.eq.ko`)
      .order('conversion_rate', { ascending: false })
      .limit(3);

    const topTexts = (topScripts || []).map(s => s.script_text);

    // 2. Call synthesizer flow
    const { synthesizeNewScripts } = await import('@/ai/flows/script-synthesizer-flow');
    const synthesized = await synthesizeNewScripts({
      targetLanguage: lang,
      targetPersonality: personality,
      targetStep: step,
      topPerformingScripts: topTexts,
      count: count,
    });

    const insertedScripts: any[] = [];

    // 3. Generate embeddings and insert into refund_scripts
    for (const item of synthesized.generatedScripts) {
      try {
        const embedding = await getEmbedding(item.script_text);
        const { data, error } = await supabaseAdmin
          .from('refund_scripts')
          .insert({
            refund_step: item.refund_step || step,
            target_psychology: item.target_psychology,
            script_text: item.script_text,
            detected_language: item.detected_language || lang,
            target_personality: item.target_personality || personality,
            generation_origin: 'ai_self_generated',
            success_weight: 50,
            impressions_count: 1, // Start with 1 for exploration bonus
            conversions_count: 0,
            conversion_rate: 0.0,
            embedding: embedding,
          })
          .select()
          .single();

        if (!error && data) {
          insertedScripts.push(data);
        }
      } catch (embErr) {
        console.warn('[Evolve Script Embedding Error]:', embErr);
      }
    }

    return {
      success: insertedScripts.length > 0,
      generatedCount: insertedScripts.length,
      scripts: insertedScripts,
    };
  } catch (err: any) {
    console.error('[Generate and Evolve Scripts Error]:', err);
    return { success: false, generatedCount: 0, scripts: [] };
  }
}

export interface LearnedKnowledge {
  id: number;
  question: string;
  answer: string;
  category: string;
  source_type: string;
  similarity: number;
  hit_count: number;
}

/**
 * Retrieve cached knowledge from ai_knowledge_base based on semantic similarity
 */
export async function retrieveLearnedKnowledge(
  queryText: string,
  threshold: number = 0.85,
  limit: number = 1
): Promise<LearnedKnowledge[]> {
  try {
    const queryEmbedding = await getEmbedding(queryText);
    const { data, error } = await supabaseAdmin.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.warn('[Retrieve Knowledge RPC Warning]:', error);
      return [];
    }

    return (data || []) as LearnedKnowledge[];
  } catch (err) {
    console.warn('[Retrieve Knowledge Error]:', err);
    return [];
  }
}

/**
 * Save new self-learned Q&A pair into Supabase ai_knowledge_base table
 */
export async function ingestSelfLearnedKnowledge(
  question: string,
  answer: string,
  category: string = 'general',
  sourceType: string = 'google_search'
): Promise<void> {
  try {
    if (!question || !answer || question.trim().length < 3 || answer.trim().length < 5) return;
    
    const embedding = await getEmbedding(question.trim()).catch(() => null);
    if (!embedding) return;

    // Check if similar knowledge already exists
    const existing = await retrieveLearnedKnowledge(question.trim(), 0.90, 1);
    if (existing && existing.length > 0) {
      // Increment hit count
      const matched = existing[0];
      await supabaseAdmin
        .from('ai_knowledge_base')
        .update({ 
          hit_count: (matched.hit_count || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', matched.id);
      console.log(`[Self-Learning Cache] Knowledge already exists (ID: ${matched.id}). Incremented hit_count.`);
    } else {
      // Ingest new knowledge
      await supabaseAdmin.from('ai_knowledge_base').insert({
        question: question.trim(),
        answer: answer.trim(),
        category,
        source_type: sourceType,
        embedding
      });
      console.log(`[Self-Learning Cache] Successfully ingested new knowledge (${sourceType}): "${question.trim().substring(0, 30)}..."`);
    }
  } catch (err) {
    console.error('[Ingest Knowledge Error]:', err);
  }
}

/**
 * Retrieve highest scoring Q&A pairs for a specific auth guide step from Supabase
 */
export async function retrieveTopScoredGuideKnowledge(
  authMethod: string,
  slideIndex: number,
  limit: number = 3
): Promise<Array<{ question: string; answer: string; is_resolved: boolean }>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_learning_logs')
      .select('user_question, ai_answer, is_resolved')
      .eq('auth_method', authMethod)
      .eq('slide_index', slideIndex)
      .eq('is_resolved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(item => ({
      question: item.user_question,
      answer: item.ai_answer,
      is_resolved: item.is_resolved
    }));
  } catch (err) {
    console.warn('[Retrieve Top Guide Knowledge Warning]:', err);
    return [];
  }
}

