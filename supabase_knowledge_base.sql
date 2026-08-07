-- =========================================================================
-- 🧠 AI 자율 학습 지식 베이스 테이블 (ai_knowledge_base)
-- Supabase -> SQL Editor 에 붙여넣고 [Run and enable RLS] 클릭!
-- =========================================================================

-- pgvector 확장 모듈 활성화 (이미 되어있을 수 있음)
CREATE EXTENSION IF NOT EXISTS vector;

-- [1단계] 지식 자산 적재 테이블 생성
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id              BIGSERIAL PRIMARY KEY,
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  category        TEXT DEFAULT 'general',
  source_type     TEXT DEFAULT 'google_search', -- 'google_search', 'code_scan', 'manual'
  embedding       VECTOR(768),
  hit_count       INT DEFAULT 1,
  confidence_score DOUBLE PRECISION DEFAULT 0.95,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- [2단계] RLS 보안 활성화 및 서비스 롤 전용 정책 설정
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_knowledge" ON ai_knowledge_base
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- [3단계] 유사도 코사인 검색 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_embedding 
  ON ai_knowledge_base 
  USING hnsw (embedding vector_cosine_ops);

-- [4단계] RPC 함수: 유사한 지식 빠른 검색
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding VECTOR(768),
  match_threshold DOUBLE PRECISION,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  question TEXT,
  answer TEXT,
  category TEXT,
  source_type TEXT,
  similarity DOUBLE PRECISION,
  hit_count INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.question,
    k.answer,
    k.category,
    k.source_type,
    1 - (k.embedding <=> query_embedding) AS similarity,
    k.hit_count
  FROM ai_knowledge_base k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 확인용 샘플 데이터 조회
SELECT count(*) FROM ai_knowledge_base;
