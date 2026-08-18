-- =========================================================================
-- ⚡ [타입 캐스팅 패치] match_refund_scripts RPC 함수 보완 SQL
-- =========================================================================
-- Supabase SQL Editor에서 실행해 주세요.

CREATE OR REPLACE FUNCTION match_refund_scripts(
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
  detected_language text,
  target_personality text,
  generation_origin text,
  success_weight int,
  impressions_count int,
  conversions_count int,
  conversion_rate float,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id::bigint,
    r.refund_step::text,
    r.target_psychology::text,
    r.script_text::text,
    COALESCE(r.detected_language::text, 'ko'::text),
    COALESCE(r.target_personality::text, 'all'::text),
    COALESCE(r.generation_origin::text, 'human_seed'::text),
    COALESCE(r.success_weight, 0)::int,
    COALESCE(r.impressions_count, 0)::int,
    COALESCE(r.conversions_count, 0)::int,
    COALESCE(r.conversion_rate, 0.0)::float,
    (1 - (r.embedding <=> query_embedding))::float AS similarity
  FROM public.refund_scripts r
  WHERE 
    r.embedding IS NOT NULL
    AND (p_step IS NULL OR r.refund_step::text = p_step OR r.refund_step::text = 'general')
    AND (p_lang IS NULL OR r.detected_language::text = p_lang OR r.detected_language::text = 'all' OR r.detected_language::text = 'ko')
    AND (p_personality IS NULL OR r.target_personality::text = p_personality OR r.target_personality::text = 'all')
    AND (1 - (r.embedding <=> query_embedding)) > match_threshold
  ORDER BY 
    (
      (1 - (r.embedding <=> query_embedding)) * 0.45 + 
      COALESCE(r.conversion_rate, 0.0) * 0.40 + 
      (CASE WHEN COALESCE(r.impressions_count, 0) < 5 THEN 0.15 ELSE 0.02 END)
    ) DESC
  LIMIT match_count;
END;
$$;
