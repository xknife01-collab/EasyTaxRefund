-- 1. 인증서 슬라이드별 좌표 및 시각적 지식 테이블
CREATE TABLE IF NOT EXISTS public.guide_step_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_method VARCHAR(20) NOT NULL, -- 'hana' | 'pass' | 'kakao'
    slide_index INT NOT NULL,          -- 0 ~ 36 (0-indexed 또는 슬라이드 번호)
    chapter_title VARCHAR(100),       -- '하나원큐 시작', '회원가입', '인증서 발급' 등
    image_url TEXT NOT NULL,           -- '/images/guide/hana/6.jpg'
    target_name VARCHAR(100),          -- '우측 상단 X 닫기 버튼'
    target_coords JSONB,               -- {"x": 90, "y": 7, "width": 12, "height": 6}
    visual_location_hint TEXT,         -- '화면 오른쪽 맨 위 시계/배터리 아이콘 바로 아래 점선 영역'
    action_instruction TEXT,           -- '인증서 발급을 위해 오른쪽 상단의 X를 눌러 팝업을 닫아주세요'
    action_reason TEXT,                -- '홈 화면의 광고 팝업을 닫아야 인증서 발급 본메뉴 버튼이 나타납니다'
    faqs JSONB DEFAULT '[]'::jsonb,    -- [{"q": "X가 안 보여요", "a": "화면 맨 위 오른쪽을 보세요"}, {"q": "왜 닫아요?", "a": "광고 팝업을 닫아야 발급 메뉴가 나옵니다"}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auth_method, slide_index)
);

-- 2. AI 막힘 질문 수집 및 자가 고도화 학습 로그 테이블
CREATE TABLE IF NOT EXISTS public.ai_learning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    auth_method VARCHAR(20),           -- 'hana' | 'pass' | 'kakao'
    slide_index INT,                   -- 0 ~ 36
    user_language VARCHAR(10) DEFAULT 'ko',
    user_question TEXT NOT NULL,       -- 고객이 실제 질문한 문장
    ai_answer TEXT,                    -- AI가 답변한 내용
    target_coords JSONB,               -- 당시 슬라이드의 타겟 좌표
    is_resolved BOOLEAN DEFAULT true,  -- 고객이 도움을 받았는지 여부
    needs_enrichment BOOLEAN DEFAULT false -- 지식 베이스 보강 필요 여부
);

-- 3. RLS(Row Level Security) 설정
ALTER TABLE public.guide_step_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read guide knowledge"
    ON public.guide_step_knowledge FOR SELECT USING (true);

CREATE POLICY "Service role / Users can insert learning logs"
    ON public.ai_learning_logs FOR INSERT WITH CHECK (true);
