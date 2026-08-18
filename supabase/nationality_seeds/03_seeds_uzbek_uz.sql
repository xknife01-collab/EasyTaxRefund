-- =========================================================================
-- 🇺🇿 [우즈베키스탄 국적 전용] 세일즈 시드 화법 (seeds_uzbek_uz.sql)
-- =========================================================================

INSERT INTO public.refund_scripts (refund_step, target_psychology, script_text, generation_origin, target_personality, detected_language, success_weight, impressions_count, conversions_count, conversion_rate)
VALUES
(
  'Step 0: Estimate',
  '비자 영향 0% + 합법적 권리 행사 강조',
  '우즈벡 동료분들이 가장 걱정하시는 게 비자 연장에 문제 생길까 봐인데요! 이건 불법 신청이 아니라 조세특례제한법에 따라 국가에서 돌려주는 정당한 내 월급입니다. 비자나 출입국 기록에 전혀 영향 없습니다.',
  'human_seed',
  'skeptical',
  'uz',
  88,
  12,
  10,
  0.83
),
(
  'Step 4: Auth',
  '하나은행/PASS 간편 인증 선택 가이드',
  '하나은행 앱이나 PASS 앱 중 스마트폰에 깔려 있는 걸로 바로 인증 요청하실 수 있어요! 계좌 비밀번호 3회 틀리면 잠기니까 천천히 눌러주시고, 혹시 막히시면 제가 바로 해결해 드릴게요.',
  'human_seed',
  'analytical',
  'uz',
  82,
  10,
  8,
  0.80
),
(
  'Step 10: Signed',
  '서명 후 정밀 심사 및 45일 지급 로드맵',
  '여기 서명 패드에 본인 사인만 하시면 모든 서류 접수가 안전하게 완료됩니다! 국세청 세무 조사관이 검토 후 45일~60일 이내에 계좌로 바로 꽂아드립니다.',
  'human_seed',
  'driver',
  'uz',
  92,
  14,
  13,
  0.92
)
ON CONFLICT DO NOTHING;
