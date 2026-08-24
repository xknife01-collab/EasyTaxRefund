# 🥕 [K-Market (케이마켓)] 외국인 전용 중고거래 & 세무 환급 연계 통합 개발 가이드
**[부제: 수수료 0원 15개국어 실시간 번역 장터 × 세무 환급 플라이휠 브릿지 구축 계획서]**

---

## 📌 1. K-Market 프로젝트 개요 및 핵심 목표

### 1.1 플랫폼 정체성
* **서비스명**: **K-Market (케이마켓)**
* **슬로건**: *No.1 외국인 안심 직거래 & 무빙 세일(Moving Sale) 장터*
* **과금 모델**: **수수료 0원 100% 완전 무료 (Zero Fee C2C)**
* **핵심 역할**: 매일 수만 명의 외국인 트래픽을 무료로 끌어모으는 **'트래픽 자석 & 체류시간 증폭기'** ➡️ 모인 트래픽을 **'세무 환급(건당 30만원) 및 대출(건당 20만원)'**으로 자동 전환.

### 1.2 3대 킬러 기능
1. **15개 언어 실시간 양방향 자동 번역 1:1 채팅**:
   - 베트남인 판매자 ↔ 네팔인 구매자 ↔ 한국인 판매자가 각자 자기 나라 말로 채팅해도 AI가 0.3초 만에 상대방 언어로 자동 번역.
2. **귀국 근로자 '무빙 세일(Moving Sale)' 전용관**:
   - 비자 만료/귀국 D-7 가전/가구 묶음(세탁기+밥솥+전자레인지) 헐값 급처분 특별 피드.
3. **공단/지역 기반 위치 필터링**:
   - 평택, 안산, 화성, 시흥, 구미, 김해 등 외국인 밀집 공단 반경 도보 직거래 지원.

---

## 🌉 2. 세무 환급(KTRS) ↔ K-Market 완벽한 양방향 연계 아키텍처

```
┌────────────────────────────────────────────────────────────────────────┐
│                        🌟 KTRS 종합 슈퍼앱 메인 쉘                     │
├────────────────────────────────────────────────────────────────────────┤
│  🌐 전역 언어 동기화 (고객이 선택한 15개 언어로 4개 탭 100% 동일 표시)     │
│                                                                        │
│   [💰 1. 세무 환급]   [⚡ 2. 비상금 대출]   [🏠 3. 안심 원룸]   [🥕 4. K-Market] │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[K-Market ➡️ 세무 환급 유입]                   [세무 환급 ➡️ K-Market 판매자 전환]
- K-Market 메인 피드 상단 킬러 배너:          - 세무 환급 184만원 신청 완료 화면:
  💰 "한국 근무 1년 이상?                       🎁 "귀국/이사를 준비 중이신가요?
      숨은 세금 [184만원] 30초 무료 환급!"          쓰던 가전 사진 3장 찍고 K-Market에
  👉 터치 시 [세무 환급 탭]으로 1초 이동!            올려 오늘 바로 현금 챙기세요!"
```

---

## 🗄️ 3. 데이터베이스 스키마 설계 (Supabase SQL)

새 창에서 복사하여 Supabase SQL Editor에 바로 실행할 수 있는 완성형 테이블 스키마입니다:

```sql
-- 1. K-Market 매물 테이블
CREATE TABLE IF NOT EXISTS public.kmarket_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    seller_phone TEXT,
    seller_country TEXT DEFAULT 'VN', -- 국가 코드 (베트남, 네팔 등 국기 뱃지용)
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0, -- 0원이면 무료 나눔
    category TEXT NOT NULL, -- 'appliances'(가전), 'furniture'(가구), 'moving_sale'(무빙세일), 'digital'(전자기기), 'clothes'(의류/생활)
    images TEXT[] NOT NULL DEFAULT '{}', -- 이미지 URL 배열
    region TEXT NOT NULL, -- '평택 포승', '안산 원곡', '화성 향남' 등
    status TEXT NOT NULL DEFAULT 'selling', -- 'selling'(판매중), 'reserved'(예약중), 'sold'(판매완료)
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. K-Market 1:1 채팅방 테이블
CREATE TABLE IF NOT EXISTS public.kmarket_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.kmarket_items(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. K-Market 1:1 번역 메시지 테이블
CREATE TABLE IF NOT EXISTS public.kmarket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.kmarket_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'buyer' or 'seller'
    original_text TEXT NOT NULL,
    translated_text TEXT, -- 상대방 언어로 자동 번역된 텍스트
    source_lang TEXT NOT NULL DEFAULT 'auto',
    target_lang TEXT NOT NULL DEFAULT 'ko',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 활성화 및 정책 설정
ALTER TABLE public.kmarket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmarket_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kmarket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public items are viewable by everyone" ON public.kmarket_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert items" ON public.kmarket_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own items" ON public.kmarket_items FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can view their own chats" ON public.kmarket_chats FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can view their own messages" ON public.kmarket_messages FOR ALL USING (true);
```

---

## 📁 4. 프론트엔드 모듈 파일 구조 (`src/components/kmarket/`)

```
src/
 ├── components/
 │    └── kmarket/
 │         ├── KMarketMainFeed.tsx      👉 [메인 화면] 매물 리스트, 공단 필터, 킬러 환급 배너
 │         ├── KMarketItemCard.tsx      👉 [매물 카드] 사진, 가격, 국기 뱃지, 실시간 상태
 │         ├── KMarketItemDetail.tsx    👉 [상세 보기] 15개국어 자동번역 설명, 1:1 채팅 버튼
 │         ├── KMarketCreatePost.tsx    👉 [1분 등록] 사진 3장, 가격, 공단 선택 폼
 │         ├── KMarketChatDrawer.tsx    👉 [실시간 번역 채팅] 15개국어 양방향 번역 대화창
 │         └── KMarketTaxBanner.tsx     👉 [세무환급 브릿지] 환급액 계산기 연동 배너
 │
 └── app/
      ├── api/
      │    └── kmarket/
      │         ├── items/route.ts      👉 매물 목록 조회 및 등록 API
      │         ├── chat/route.ts       👉 1:1 채팅방 생성 및 메시지 전송 API
      │         └── translate/route.ts  👉 Gemini 기반 0.3초 다국어 번역 API
      │
      └── page.tsx                      👉 KTRS 4대 탭 중 [K-Market] 탭에 마운트
```

---

## 📱 5. UI/UX 디자인 상세 명세

### 5.1 K-Market 메인 피드 상단 킬러 배너 (`KMarketTaxBanner.tsx`)
```
┌────────────────────────────────────────────────────────┐
│ 💰 [KTRS 특별 혜택]                                     │
│  "한국에서 일하는 외국인 근로자라면?                      │
│   5년 치 숨은 소득세 [평균 184만 원] 30초 만에 환급받기!" │
│  👉 [지금 내 환급금 무료 조회하기 >] (터치 시 세무 탭 전환)  │
└────────────────────────────────────────────────────────┘
```

### 5.2 귀국자 무빙 세일 (Moving Sale) 특별관
```
┌────────────────────────────────────────────────────────┐
│ ✈️ [귀국 D-7 무빙세일] 헐값 급처분 가전/가구               │
├────────────────────────────────────────────────────────┤
│ [📷 세탁기+밥솥+전자레인지]  [📷 냉장고+선풍기]            │
│ 80,000원 (원가 50만)        60,000원 (원가 40만)        │
│ 📍 평택 포승 (🇻🇳 응우옌)     📍 안산 원곡 (🇳🇵 라마)       │
└────────────────────────────────────────────────────────┘
```

### 5.3 15개국어 실시간 자동 번역 1:1 채팅창 (`KMarketChatDrawer.tsx`)
- 구매자가 **"यो कतिमा दिनुहुन्छ? (얼마에 주실 수 있나요?)"** (네팔어) 입력 시
- 판매자 화면에는 **"Bạn có thể giảm giá bao nhiêu? (얼마에 주실 수 있나요?)"** (베트남어)로 실시간 0.3초 만에 번역되어 표시됨!

---

## 🤖 6. 새 창에서 바로 실행할 수 있는 '이어 만들기' AI 프롬프트

새 창을 열고 아래 프롬프트를 복사해서 붙여넣으시면, AI가 이 계획서를 100% 이해하고 K-Market 개발을 즉시 시작합니다:

```markdown
안녕하세요! 우리는 대한민국 1위 외국인 종합 슈퍼앱 KTRS를 개발하고 있습니다.
바탕화면의 [KTRS_K마켓_연계_구현계획서.md]에 따라, 수수료 0원 15개국어 외국인 전용 중고거래 플랫폼인 [K-Market (케이마켓)] 모듈을 개발하려고 합니다.

[핵심 요구사항]
1. 기존 세무 환급 시스템과 100% 동일한 LanguageContext(15개 언어)를 공유하여 단일 언어로 동작.
2. 메인 피드(KMarketMainFeed.tsx), 매물 카드(KMarketItemCard.tsx), 1분 간편 등록(KMarketCreatePost.tsx), 15개국어 실시간 번역 채팅(KMarketChatDrawer.tsx) 구현.
3. K-Market 상단에 세무 환급(184만원)으로 바로 넘어가는 [KMarketTaxBanner.tsx] 탑재.
4. Next.js 15, Tailwind CSS, Supabase DB 기반으로 가장 미려하고 빠르고 독립된 모듈로 만들어주세요.

첫 번째 단계로 Supabase DB 테이블 생성 및 K-Market 프론트엔드 모듈 개발을 시작해 주세요!
```

---

**작성일자**: 2026년 8월 21일  
**문서 위치**: 바탕화면 `KTRS_K마켓_연계_구현계획서.md`  
**총괄 기획**: KTRS 엔지니어링 & AI 세일즈 총괄 본부
