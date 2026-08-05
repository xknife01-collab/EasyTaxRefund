-- =========================================================================
-- 🧠 EasyTax Refund 실시간 AI 세일즈 비서 & RAG 자율학습 시스템 구축용 Supabase SQL DDL
-- =========================================================================
-- 이 SQL 스크립트를 Supabase -> SQL Editor에 복사하여 실행하세요.
-- 기존에 가동 중인 테이블의 데이터 유실을 최소화하면서 RLS 보안 설정을 적용하여 이식합니다.

-- pgvector 익스텐션 활성화 (임베딩 검색 필수)
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================================================================
-- [1단계] RAG 지식베이스 테이블 마이그레이션 및 확장
-- =========================================================================
DO $$
BEGIN
    -- refund_scripts 테이블에 success_count 컬럼이 없는 경우 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='success_count') THEN
        ALTER TABLE refund_scripts ADD COLUMN success_count INT DEFAULT 0;
    END IF;

    -- refund_scripts 테이블에 used_count 컬럼이 없는 경우 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='used_count') THEN
        ALTER TABLE refund_scripts ADD COLUMN used_count INT DEFAULT 0;
    END IF;

    -- refund_scripts 테이블에 ab_group 컬럼이 없는 경우 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='ab_group') THEN
        ALTER TABLE refund_scripts ADD COLUMN ab_group TEXT DEFAULT 'A';
    END IF;

    -- refund_scripts 테이블에 script_type 컬럼이 없는 경우 추가 (system / planner_manual 구분)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='refund_scripts' AND column_name='script_type') THEN
        ALTER TABLE refund_scripts ADD COLUMN script_type TEXT DEFAULT 'system';
    END IF;
END $$;


-- =========================================================================
-- [2단계] 신규 테이블 생성 (다중 참여 대화방 관제 & 감정/행동 스코어 적재)
-- =========================================================================

-- 1. 실시간 대화방 테이블 (chat_rooms)
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 예: "실시간 환급 상담 - 홍길동 고객님"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 대화방 멤버 매핑 테이블 (chat_room_members)
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- auth.users 또는 planners.id 매핑용
  role TEXT DEFAULT 'guest' NOT NULL, -- 'guest' (고객), 'planner' (상담원/세무사), 'bot' (AI)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, user_id)
);

-- 3. 대화 메시지 적재 테이블 (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  lead_id INT, -- 환급 신청 리드 ID (customer_leads.id)와 매핑
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. AI 실시간 정서/행동 스코어 판독 로그 테이블 (ai_conversation_scores)
CREATE TABLE IF NOT EXISTS ai_conversation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id INT NOT NULL, -- 환급 리드 ID
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  planner_id UUID NOT NULL, -- 담당 상담원 ID
  message_text TEXT NOT NULL, -- 분석 대상이 된 고객 또는 AI의 메시지
  ai_response TEXT NOT NULL, -- 당시 AI의 답변 (수동 개입일 경우 '(설계사 직접 메시지)')
  action_type TEXT DEFAULT 'pending', -- 판독된 행동 타입 (인증시작, 홈택스동기화 등)
  action_score INT DEFAULT 0, -- 행동 진척도 점수 (1~10점)
  pos_score INT DEFAULT 0, -- 긍정 감정 점수
  neg_score INT DEFAULT 0, -- 부정/의심 감정 점수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- =========================================================================
-- [3단계] Row Level Security (RLS) 활성화 설정 및 보안 강화
-- =========================================================================
-- 외부 익명(anon) 키 및 가입(authenticated) 키를 통한 비정상적인 접근을 방어하고,
-- API 서버(service_role)만 안전하게 CRUD를 제어하도록 격리 정책을 추가합니다.

-- RLS 활성화
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_scripts ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (중복 생성 에러 방지)
DROP POLICY IF EXISTS "Allow anonymous insert on chat_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Allow anonymous select on chat_rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Allow anonymous select on chat_room_members" ON chat_room_members;
DROP POLICY IF EXISTS "Allow anonymous insert on chat_room_members" ON chat_room_members;
DROP POLICY IF EXISTS "Allow anonymous insert on chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow anonymous select on chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow public select on refund_scripts" ON refund_scripts;

-- 1) chat_rooms 정책: 익명 고객용 채팅 캡슐 생성 및 조회 허용
CREATE POLICY "Allow anonymous insert on chat_rooms" ON chat_rooms FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous select on chat_rooms" ON chat_rooms FOR SELECT TO anon USING (true);

-- 2) chat_room_members 정책: 대화방 멤버 정보 매핑 허용
CREATE POLICY "Allow anonymous insert on chat_room_members" ON chat_room_members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous select on chat_room_members" ON chat_room_members FOR SELECT TO anon USING (true);

-- 3) chat_messages 정책: 실시간 1:1 웹 위젯 메시지 작성 및 로드 허용
CREATE POLICY "Allow anonymous insert on chat_messages" ON chat_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous select on chat_messages" ON chat_messages FOR SELECT TO anon USING (true);

-- 4) refund_scripts 정책: 세무 RAG 상담 지식은 일반 사용자(익명)에게 읽기 전용으로 오픈
CREATE POLICY "Allow public select on refund_scripts" ON refund_scripts FOR SELECT TO anon USING (true);

-- 5) ai_conversation_scores 정책:
-- 이 테이블은 세무사의 관제 및 민감 감정 분석 로그용이므로 익명(anon) 유저 정책은 추가하지 않습니다.
-- service_role(어드민) 키를 사용하는 서버 및 어드민 대시보드만 제한 없이 접근할 수 있습니다.


-- =========================================================================
-- [4단계] 성능 최적화를 위한 인덱스 설정
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_scores_lead ON ai_conversation_scores(lead_id);


-- =========================================================================
-- [5단계] RAG 검색용 코사인 유사도 함수 (match_refund_scripts가 없을 경우 생성)
-- =========================================================================
CREATE OR REPLACE FUNCTION match_refund_scripts(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  p_step text default null,
  p_lang text default 'ko'
)
RETURNS TABLE (
  id bigint,
  refund_step text,
  target_psychology text,
  script_text text,
  success_weight int,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER -- RLS 권한 우회하여 RAG 임베딩 매칭 수행
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.refund_step,
    r.target_psychology,
    r.script_text,
    r.success_weight,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM refund_scripts r
  WHERE 
    r.embedding IS NOT NULL
    AND (p_step IS NULL OR r.refund_step = p_step)
    AND (p_lang IS NULL OR r.detected_language = p_lang)
    AND 1 - (r.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC, r.success_weight DESC
  LIMIT match_count;
END;
$$;
