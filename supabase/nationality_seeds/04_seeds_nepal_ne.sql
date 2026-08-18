-- =========================================================================
-- 🇳🇵 [네팔 국적 전용] 세일즈 시드 화법 (seeds_nepal_ne.sql)
-- =========================================================================

INSERT INTO public.refund_scripts (refund_step, target_psychology, script_text, generation_origin, target_personality, detected_language, success_weight, impressions_count, conversions_count, conversion_rate)
VALUES
(
  'Step 0: Estimate',
  '조세특례제한법 제30조 청년 감면 원리 + 친근한 안심',
  '네팔 고객님들께서 한국에서 열심히 땀 흘려 일하신 소득세 중 최대 90%까지 세법상 돌려받으실 수 있는 세금입니다. 과거 5년 동안 못 챙기신 숨은 돈을 제가 1원도 빠짐없이 찾아드릴게요!',
  'human_seed',
  'analytical',
  'ne',
  90,
  15,
  14,
  0.93
),
(
  'Step 4: Auth',
  'PASS 1원 계좌인증 요령 + 단계별 동행 코칭',
  'PASS 앱으로 하실 때는 은행 계좌로 입금된 1원의 입금자명 앞 4글자만 확인하시면 돼요! 어려우시면 제가 화면 보면서 하나씩 옆에서 가르쳐 드릴 테니 편하게 따라오세요~',
  'human_seed',
  'expressive',
  'ne',
  86,
  11,
  9,
  0.81
),
(
  'Step 9: Account',
  'CMS 100% 후불 보증 + 사전 비용 0원 확약',
  '환급금 전액이 고객님 명의 통장에 안전하게 들어온 것을 직접 확인하시기 전까지는 수수료가 청구되지 않으니 안심하고 계좌번호를 적어주세요!',
  'human_seed',
  'skeptical',
  'ne',
  94,
  18,
  17,
  0.94
)
ON CONFLICT DO NOTHING;
