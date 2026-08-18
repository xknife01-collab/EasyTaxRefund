-- =========================================================================
-- 🧠 Matrix-based Multi-Armed Bandit RL & AI Self-Prompting Migration
-- =========================================================================

-- 1. Extend refund_scripts table with matrix RL and self-generation metadata
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='generation_origin') THEN
        ALTER TABLE refund_scripts ADD COLUMN generation_origin TEXT DEFAULT 'human_seed';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='target_personality') THEN
        ALTER TABLE refund_scripts ADD COLUMN target_personality TEXT DEFAULT 'all';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='impressions_count') THEN
        ALTER TABLE refund_scripts ADD COLUMN impressions_count INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='conversions_count') THEN
        ALTER TABLE refund_scripts ADD COLUMN conversions_count INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='conversion_rate') THEN
        ALTER TABLE refund_scripts ADD COLUMN conversion_rate FLOAT DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='detected_language') THEN
        ALTER TABLE refund_scripts ADD COLUMN detected_language TEXT DEFAULT 'ko';
    END IF;
END $$;

-- 2. Create Multi-Dimensional Performance Matrix Table (Language x Personality x Script)
CREATE TABLE IF NOT EXISTS public.script_performance_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id BIGINT REFERENCES public.refund_scripts(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL DEFAULT 'ko',
    personality_type VARCHAR(20) NOT NULL DEFAULT 'all',
    impressions INT DEFAULT 0,
    conversions INT DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(script_id, language, personality_type)
);

-- Index for high speed retrieval
CREATE INDEX IF NOT EXISTS idx_matrix_lookup ON public.script_performance_matrix(script_id, language, personality_type);

-- 3. RLS Settings for Matrix
ALTER TABLE public.script_performance_matrix ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on script_performance_matrix" ON public.script_performance_matrix;
CREATE POLICY "Allow public select on script_performance_matrix" ON public.script_performance_matrix FOR SELECT USING (true);

-- 4. RPC to atomically record impressions
CREATE OR REPLACE FUNCTION record_script_impression(
    p_script_id BIGINT,
    p_lang TEXT DEFAULT 'ko',
    p_personality TEXT DEFAULT 'all'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update general script impressions
    UPDATE public.refund_scripts
    SET 
        impressions_count = COALESCE(impressions_count, 0) + 1,
        used_count = COALESCE(used_count, 0) + 1,
        conversion_rate = CASE 
            WHEN COALESCE(impressions_count, 0) + 1 > 0 
            THEN ROUND((COALESCE(conversions_count, 0)::numeric / (COALESCE(impressions_count, 0) + 1)::numeric), 4)
            ELSE 0 
        END
    WHERE id = p_script_id;

    -- Upsert matrix stats
    INSERT INTO public.script_performance_matrix (script_id, language, personality_type, impressions, conversions, conversion_rate, updated_at)
    VALUES (p_script_id, p_lang, p_personality, 1, 0, 0.0, NOW())
    ON CONFLICT (script_id, language, personality_type)
    DO UPDATE SET
        impressions = script_performance_matrix.impressions + 1,
        conversion_rate = ROUND(((script_performance_matrix.conversions)::numeric / (script_performance_matrix.impressions + 1)::numeric), 4),
        updated_at = NOW();
END;
$$;

-- 5. RPC to atomically record conversion feedback
CREATE OR REPLACE FUNCTION record_script_conversion(
    p_script_id BIGINT,
    p_lang TEXT DEFAULT 'ko',
    p_personality TEXT DEFAULT 'all',
    p_score INT DEFAULT 10
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update general script conversions and weight
    UPDATE public.refund_scripts
    SET 
        conversions_count = COALESCE(conversions_count, 0) + 1,
        success_count = COALESCE(success_count, 0) + 1,
        success_weight = COALESCE(success_weight, 0) + p_score,
        conversion_rate = CASE 
            WHEN COALESCE(impressions_count, 0) > 0 
            THEN ROUND(((COALESCE(conversions_count, 0) + 1)::numeric / COALESCE(impressions_count, 0)::numeric), 4)
            ELSE 1.0 
        END
    WHERE id = p_script_id;

    -- Upsert matrix conversions
    INSERT INTO public.script_performance_matrix (script_id, language, personality_type, impressions, conversions, conversion_rate, updated_at)
    VALUES (p_script_id, p_lang, p_personality, 1, 1, 1.0, NOW())
    ON CONFLICT (script_id, language, personality_type)
    DO UPDATE SET
        conversions = script_performance_matrix.conversions + 1,
        conversion_rate = CASE 
            WHEN script_performance_matrix.impressions > 0 
            THEN ROUND(((script_performance_matrix.conversions + 1)::numeric / script_performance_matrix.impressions::numeric), 4)
            ELSE 1.0 
        END,
        updated_at = NOW();
END;
$$;

-- 6. Advanced Matrix Multi-Armed Bandit RAG Matcher
CREATE OR REPLACE FUNCTION match_matrix_refund_scripts(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_step text default null,
  p_lang text default 'ko',
  p_personality text default 'all'
)
RETURNS TABLE (
  id bigint,
  refund_step text,
  target_psychology text,
  script_text text,
  generation_origin text,
  target_personality text,
  success_weight int,
  impressions_count int,
  conversions_count int,
  conversion_rate float,
  matrix_conversion_rate float,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.refund_step,
    r.target_psychology,
    r.script_text,
    COALESCE(r.generation_origin, 'human_seed') AS generation_origin,
    COALESCE(r.target_personality, 'all') AS target_personality,
    COALESCE(r.success_weight, 0) AS success_weight,
    COALESCE(r.impressions_count, 0) AS impressions_count,
    COALESCE(r.conversions_count, 0) AS conversions_count,
    COALESCE(r.conversion_rate, 0.0) AS conversion_rate,
    COALESCE(m.conversion_rate, r.conversion_rate, 0.0) AS matrix_conversion_rate,
    (1 - (r.embedding <=> query_embedding)) AS similarity
  FROM public.refund_scripts r
  LEFT JOIN public.script_performance_matrix m 
    ON m.script_id = r.id 
    AND m.language = p_lang 
    AND (m.personality_type = p_personality OR m.personality_type = 'all')
  WHERE 
    r.embedding IS NOT NULL
    AND (p_step IS NULL OR r.refund_step = p_step)
    AND (p_lang IS NULL OR r.detected_language = p_lang OR r.detected_language = 'ko' OR r.detected_language = 'all')
    AND (1 - (r.embedding <=> query_embedding)) > match_threshold
  ORDER BY 
    -- Combined Multi-Armed Bandit score ordering
    (
      (1 - (r.embedding <=> query_embedding)) * 0.4 + 
      COALESCE(m.conversion_rate, r.conversion_rate, 0.0) * 0.4 + 
      (CASE WHEN COALESCE(r.impressions_count, 0) < 5 THEN 0.2 ELSE 0.05 END)
    ) DESC
  LIMIT match_count;
END;
$$;
