-- ==============================================================================
-- K-Market (케이마켓) 테이블 스키마 생성 SQL
-- ==============================================================================

-- 1. K-Market 매물 테이블
CREATE TABLE IF NOT EXISTS public.kmarket_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id TEXT,
    seller_name TEXT NOT NULL,
    seller_phone TEXT,
    seller_country TEXT DEFAULT 'VN', -- 'VN'(베트남), 'NP'(네팔), 'UZ'(우즈벡), 'MN'(몽골), 'KR'(한국) 등
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0, -- 0원이면 무료 나눔
    category TEXT NOT NULL, -- 'appliances', 'furniture', 'moving_sale', 'digital', 'living'
    images TEXT[] NOT NULL DEFAULT '{}',
    region TEXT NOT NULL, -- '평택 포승', '안산 원곡', '화성 향남', '시흥 시화', '구미 공단' 등
    status TEXT NOT NULL DEFAULT 'selling', -- 'selling', 'reserved', 'sold'
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. K-Market 1:1 채팅방 테이블
CREATE TABLE IF NOT EXISTS public.kmarket_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.kmarket_items(id) ON DELETE CASCADE,
    buyer_name TEXT NOT NULL,
    buyer_country TEXT DEFAULT 'NP',
    seller_name TEXT NOT NULL,
    seller_country TEXT DEFAULT 'VN',
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. K-Market 1:1 번역 메시지 테이블
CREATE TABLE IF NOT EXISTS public.kmarket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.kmarket_chats(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_type TEXT NOT NULL, -- 'buyer' or 'seller'
    original_text TEXT NOT NULL,
    translated_text TEXT, -- 상대방 언어로 실시간 번역된 텍스트
    source_lang TEXT NOT NULL DEFAULT 'auto',
    target_lang TEXT NOT NULL DEFAULT 'ko',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_kmarket_items_region ON public.kmarket_items(region);
CREATE INDEX IF NOT EXISTS idx_kmarket_items_category ON public.kmarket_items(category);
CREATE INDEX IF NOT EXISTS idx_kmarket_items_created_at ON public.kmarket_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kmarket_messages_chat_id ON public.kmarket_messages(chat_id);
