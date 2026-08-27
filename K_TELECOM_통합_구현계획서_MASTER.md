# 📱 [K-Telecom (케이텔레콤)] 18개국어 외국인 전용 통신 슈퍼앱 마스터 구현 계획서
**[부제: 스마트폰 단말할부 × 알뜰폰 요금제/eSIM × 초고속 인터넷·IPTV 결합 원스톱 비대면 플랫폼]**

> 📌 **새로운 안티그래비티(Antigravity) AI 인스턴스를 위한 안내**:  
> 본 문서는 **KTRS(세무 환급) - K-Market(중고거래) - K-Telecom(통신)**으로 이어지는 대한민국 1등 외국인 종합 슈퍼앱 생태계의 3번째 핵심 축인 **[K-Telecom(케이텔레콤)]**의 완벽한 단독 구축을 위한 **마스터 설계서(Master Blueprint)**입니다.  
> 본 문서를 읽고 즉시 독립된 Next.js 프로젝트를 생성하여 아래의 모든 명세와 Supabase 통합 연동을 구축하십시오.

---

## 🎯 1. 프로젝트 비전 및 사업 개요 (Executive Summary)

### 1.1 시장 기회 및 페인포인트 해결
대한민국 100만 외국인 근로자 및 유학생은 스마트폰 구매, 알뜰폰 개통, 원룸 인터넷 설치 시 심각한 3대 고통을 겪고 있습니다:
1. **한국어 언어 장벽**: 통신사 매장/웹사이트가 한국어로만 되어 있어 요금제와 약정을 이해하지 못함.
2. **단말기 구매 부담**: 외국인 신용카드 할부 불가로 100만원 이상 현금 일시불을 요구받음.
3. **원룸 인터넷 설치 단절**: 언어 불통으로 기사님 방문 예약 및 기숙사/원룸 인터넷 설치 포기.

### 1.2 K-Telecom 솔루션 (100% 인앱 비대면 무인 시스템)
- **[18개국어 완벽 지원]**: 베트남어, 중국어, 우즈벡어, 캄보디아어, 몽골어, 네팔어 등 18개국 모국어로 폰/요금제/인터넷 100% 투명 안내.
- **[초기비용 0원 단말기 할부]**: 외국인등록증(ARC)만으로 24개월 통신비 고지서에 기계값을 합산 청구 (0원 새폰 & S급 리퍼폰).
- **[eSIM 1분 즉시 개통 & 실물 유심 무료 배송]**: 택배를 기다릴 필요 없는 1분 eSIM 즉시 개통 및 기숙사 우체국 택배 발송.
- **[원룸 초고속 인터넷 + IPTV 결합]**: GiGA 인터넷 + Wi-Fi + IPTV 1분 신청 및 전문 기사님 방문 설치 (최대 45만원 혜택).
- **[제휴 파트너 B2B API 연동]**: (주)아이즈비전(아이즈모바일), 유니컴즈(모빙) B2B 전산망과 연동되어 100% 무인 개통 및 풀필먼트.

---

## 🌐 2. K-유니버스 슈퍼앱 생태계 & Supabase 통합 계정 아키텍처

K-Telecom은 독자적인 도메인/주소로 운영되지만, **동일한 Supabase 데이터베이스**를 공유하여 회원 정보와 신분증 인증 데이터를 100% 공유합니다.

```
                  🌟 [공용 Supabase 통합 데이터베이스]
                      (Shared Supabase Project)
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   💰 [KTRS 세무 환급]      🛍️ [K-Market 글로벌 장터]   📱 [K-Telecom 통신]
 (easy-tax-refund.vercel)  (kmarket-tax-refund.vercel)   (k-telecom.vercel)
   - 18개국 세무 환급       - 18개국 번역 C2C 장터       - 18개국 폰/요금제/인터넷
   - 신분증 OCR 데이터       - 수만 명 트래픽 자석        - 단말할부 & 개통
```

### 2.1 크로스 플랫폼 딥링크 & 자동 로그인 연동 규격
- **세무 환급(KTRS) ➡️ K-Telecom 연결**:
  - URL: `https://k-telecom.vercel.app/?source=ktrs&user_id=[UUID]&lang=[LANG]`
  - 효과: KTRS에서 이미 인증된 신분증(이름, 외국인등록번호, 연락처)이 K-Telecom 신청서에 100% 자동 채워짐!
- **케이마켓(K-Market) ➡️ K-Telecom 연결**:
  - URL: `https://k-telecom.vercel.app/?source=kmarket&lead_id=[LEAD_ID]&lang=[LANG]`
  - 효과: 케이마켓 중고폰 거래 고객에게 알뜰폰 요금제 및 인터넷 결합 원클릭 개통 제공!

---

## 📱 3. K-Telecom 3대 핵심 상품 라인업 (아이즈모바일 공식 기반)

### 3.1 📱 [상품군 1] 스마트폰 단말할부 결합 (초기비용 0원)
1. **[0원 공짜폰] 삼성 갤럭시 A15 / A25 5G (미개봉 새폰)**
   - 출고가 319,000원 ➡️ 통신사 공시지원금 100% 지원 = **기기값 0원**
   - 결합 요금제: 월 19,800원 (데이터 15GB+1Mbps 무제한 + 통화 기본)
   - 타겟: 초기 입국 근로자, 서브폰, 알뜰 실속파
2. **[인기 1위] 애플 아이폰 12 / 13 / 14 128GB (S급 정품 리퍼폰)**
   - 배터리 90% 이상 + 외관 무스크래치 + 풀패키지 박스
   - 기계값: 월 15,000원 (24개월 분할) + 통신비 월 19,900원 = **매달 총 34,900원 합산 청구**
   - 타겟: 베트남, 필리핀, 캄보디아 2030 청년 근로자
3. **[프리미엄 갓성비] 삼성 갤럭시 S22 / S23 5G (S급)**
   - 기계값 + 무제한 데이터 요금 = **매달 총 39,900원 합산 청구**

### 3.2 📶 [상품군 2] 18개국어 맞춤 알뜰폰 요금제 & eSIM
1. **[실속 알뜰 요금제]**: 월 9,900원 (음성 200분 + 문자 100건 + 데이터 5GB)
2. **[데이터 무제한 베스트]**: 월 19,800원 (데이터 15GB + 소진 시 1Mbps 무제한)
3. **[고향 무료 통화팩]**: 월 25,900원 (데이터 무제한 + **베트남/중국/우즈벡 등 국제전화 매월 100분 무료**)
4. **[eSIM 1분 즉시 개통 전용관]**: QR코드 스캔 즉시 통신망 활성화 (유심 배송 불필요)

### 3.3 🌐 [상품군 3] 원룸 초고속 인터넷 & IPTV 결합
1. **[원룸 GiGA 인터넷 100M/500M + Wi-Fi]**: 월 22,000원 (원룸 룸메이트 필수)
2. **[초고속 인터넷 + IPTV 결합]**: 월 34,100원 (실시간 200개 채널 + 현금 사은품 지원)
3. **[풀트리플 결합]**: 폰 + 인터넷 + TV 3중 결합 시 매월 추가 11,000원 결합 할인

---

## 🔄 4. 100% 인앱 비대면 무인 신청 파이프라인 (In-App Flow)

```
  [Step 1: 18개국어 큐레이션 쇼룸]
    - 모국어로 폰/요금제/인터넷 선택 및 월 청구액(기계값+통신비) 실시간 계산
                           │
                           ▼
  [Step 2: Vision AI 신분증 OCR 무인 스캔]
    - 외국인등록증(ARC) 또는 여권 촬영 ➡️ 영문명, 등록번호 13자리 100% 자동완성
                           │
                           ▼
  [Step 3: 배송지 & 자동이체 & 전자서명]
    - 기숙사/원룸 배송 주소 입력, 통신비 자동이체(CMS) 은행 계좌 입력, 손가락 전자서명
                           │
                           ▼
  [Step 4: Supabase 저장 & B2B API 자동 전송]
    - DB 테이블 `telecom_applications`에 암호화 저장
    - 아이즈모바일 / 모빙 B2B 전산 API 엔드포인트(`/api/telecom/apply`)로 자동 발송
                           │
                           ▼
  [Step 5: 풀필먼트 및 배송 추적]
    - 물류센터에서 폰+유심 세팅 후 우체국 택배 당일 발송 ➡️ 송장 번호 자동 회신
    - 인터넷/TV는 고객 주소지로 전문 기사님 방문 설치 일정 자동 예약
```

---

## 🏗️ 5. 프로젝트 기술 스택 및 폴더/파일 구조

### 5.1 Tech Stack
- **Framework**: Next.js 16.x (App Router, Turbopack, Server Actions)
- **Styling**: Tailwind CSS + Vanilla CSS (Apple/Toss 감성의 최고급 다크/라이트 하이브리드 UI)
- **Icons**: Lucide React
- **Database / Auth**: Supabase (@supabase/supabase-js)
- **Multi-language**: 18개국어 지원 (`ko`, `vi`, `zh`, `km`, `ne`, `uz`, `my`, `id`, `th`, `en`, `si`, `mn`, `bn`, `kk`, `ur`, `ru`, `tl`, `ja`)

### 5.2 Folder & Component Structure
```
k-telecom/
 ├── public/
 │    └── proposal_eyesmobile.html     👉 [완성된 B2B 제휴 제안서 HTML]
 ├── src/
 │    ├── app/
 │    │    ├── layout.tsx              👉 18개국어 LanguageProvider, Navbar, Footer
 │    │    ├── page.tsx                👉 K-Telecom 메인 홈 (히어로 배너, 3대 결합 탭)
 │    │    ├── phones/page.tsx         👉 스마트폰 0원폰 & S급 리퍼폰 쇼룸
 │    │    ├── plans/page.tsx          👉 알뜰폰 요금제 & eSIM 1분 개통관
 │    │    ├── internet/page.tsx       👉 원룸 초고속 인터넷 & IPTV 결합관
 │    │    ├── apply/page.tsx          👉 [100% 인앱] 신분증 OCR, 주소, 전자서명 원스톱 신청
 │    │    ├── admin/page.tsx          👉 대표님 전용 [통신 개통 관리 대시보드]
 │    │    └── api/
 │    │         └── telecom/
 │    │              └── apply/route.ts 👉 Supabase 저장 & B2B API 전송 백엔드
 │    ├── components/
 │    │    ├── Navbar.tsx              👉 18개국어 셀렉터, 3대 카테고리 메뉴
 │    │    ├── Footer.tsx              👉 사업자 정보 (대표 김홍일, 남양주시 주소)
 │    │    ├── PhoneCard.tsx           👉 단말기 카드 (0원 뱃지, 월 할부금 계산기)
 │    │    ├── PlanCard.tsx            👉 요금제 카드 (데이터, 통화, 국제전화 혜택)
 │    │    ├── InternetCard.tsx        👉 인터넷 결합 카드 (사은품 혜택, 설치 안내)
 │    │    └── apply/
 │    │         ├── IdCardOcrScanner.tsx 👉 신분증 Vision AI 스캐너
 │    │         └── SignatureCanvas.tsx  👉 손가락 전자서명 패드
 │    └── lib/
 │         ├── supabase.ts             👉 Supabase 공용 클라이언트
 │         ├── telecom-data.ts         👉 아이즈모바일 기반 단말기/요금제/인터넷 데이터셋
 │         └── translations/           👉 18개국어 완전 번역 딕셔너리
 └── supabase/
      └── migrations/
           └── 20260825_telecom_schema.sql 👉 통신 신청서 DB 스키마
```

---

## 🗄️ 6. Supabase 데이터베이스 테이블 스키마 (`telecom_applications`)

```sql
CREATE TABLE IF NOT EXISTS telecom_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 고객 기본 정보
    user_id UUID,
    full_name TEXT NOT NULL,
    alien_registration_number TEXT NOT NULL, -- 외국인등록번호 (암호화)
    phone_number TEXT NOT NULL,
    language TEXT DEFAULT 'ko',
    
    -- 신청 상품 정보
    application_type TEXT NOT NULL, -- 'phone_plan', 'sim_only', 'esim', 'internet_tv'
    device_model TEXT,              -- 'Galaxy A25 5G (New)', 'iPhone 13 128GB (S-Grade)' 등
    device_color TEXT,
    plan_name TEXT NOT NULL,        -- '아이즈 15GB+ 무제한', '원룸 GiGA인터넷+TV' 등
    monthly_total_fee INTEGER NOT NULL, -- 월 청구 예상 합산액
    
    -- 배송 및 자동이체 정보
    delivery_address TEXT NOT NULL,
    delivery_detail_address TEXT,
    postal_code TEXT,
    bank_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    
    -- 본인확인 및 서명
    id_card_image_url TEXT,
    signature_image_url TEXT,
    
    -- 개통 및 배송 상태
    status TEXT DEFAULT 'PendingReview', -- 'PendingReview', 'Approved', 'Shipped', 'Activated', 'Completed', 'Cancelled'
    tracking_number TEXT,               -- 우체국 택배 송장번호
    partner_id TEXT DEFAULT 'eyesmobile',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_telecom_status ON telecom_applications(status);
CREATE INDEX IF NOT EXISTS idx_telecom_phone ON telecom_applications(phone_number);
```

---

## 🚀 7. 새로운 안티그래비티 인스턴스 실행 가이드 (초간단 3단계 Quick Start)

### 📌 1단계: 새 폴더 생성 및 새 안티그래비티 창 열기
1. 바탕화면 또는 원하는 위치에 새 폴더(예: `C:\Users\zkfnt\Desktop\k-telecom`)를 만듭니다.
2. 안티그래비티 IDE에서 **[File] ➡️ [Open Folder]**로 해당 새 폴더(`k-telecom`)를 엽니다.

### 📌 2단계: 새 안티그래비티에게 첫 프롬프트 입력
새 창의 채팅창에 아래 문구를 그대로 복사해서 넣어주세요:

> **"K_TELECOM_통합_구현계획서_MASTER.md 파일의 명세에 따라, 18개국어 외국인 전용 통신 슈퍼앱 K-Telecom(스마트폰 0원 단말할부 + 알뜰폰 요금제/eSIM + 원룸 인터넷/IPTV 결합)을 Next.js와 Supabase로 완벽하게 구축해 줘."**

### 📌 3단계: Supabase 공용 환경변수 연결 (`.env.local`)
세무 환급(KTRS), 케이마켓(K-Market)과 동일한 공용 Supabase 키를 새 프로젝트의 `.env.local`에 넣어주면 회원과 신청 데이터가 100% 자동 연동됩니다:

```env
# Supabase Configuration (KTRS & K-Market & K-Telecom 공용)
NEXT_PUBLIC_SUPABASE_URL=https://ilvxvohksgwdiyvpkwag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SgM2Oeuwg_wdKjchATOeRg_5AjRTQyo
```

---

### 💻 새 프로젝트 기본 초기화 명령어
```powershell
npx -y create-next-app@latest ./ --typescript --tailwind --eslint=false --app --src-dir --import-alias "@/*" --use-npm
npm install @supabase/supabase-js lucide-react clsx tailwind-merge canvas-confetti
npm install -D @types/canvas-confetti
```

---

**본 문서는 KTRS/K-Market/K-Telecom 슈퍼앱 생태계의 공식 마스터 구현 계획서입니다.**  
**작성일: 2026년 8월 25일 | 대표 김홍일**
