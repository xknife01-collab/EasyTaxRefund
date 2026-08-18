-- =========================================================================
-- 🇻🇳 [베트남 국적 전용] 세일즈 시드 화법 (seeds_vietnam_vi.sql)
-- =========================================================================

INSERT INTO public.refund_scripts (refund_step, target_psychology, script_text, generation_origin, target_personality, detected_language, success_weight, impressions_count, conversions_count, conversion_rate)
VALUES
(
  'Step 0: Estimate',
  '손실회피 + 안산/화성 제조공장 동료 성공사례',
  '화성이나 안산 공장에서 일하시는 베트남 동료분들도 처음엔 긴가민가하셨는데요, 5년 치 일하신 세금 조회해보니 평균 180만 원이 그대로 남아있어서 깜짝 놀라셨어요! 지금 안 찾아가시면 한국 정부가 고객님 돈을 그냥 갖고 있게 됩니다.',
  'human_seed',
  'expressive',
  'vi',
  85,
  10,
  8,
  0.80
),
(
  'Step 4: Auth',
  '카카오톡 1분 간편인증 + 사장님 비밀보장',
  '인증하실 때 카카오톡이 제일 편하세요! 폰으로 온 노란색 알림톡에서 [인증하기] 누르고 비밀번호 6자리만 누르시면 1분 만에 끝납니다. 회사 사장님한테는 0.001%도 연락 안 가니 안심하세요~',
  'human_seed',
  'driver',
  'vi',
  90,
  15,
  14,
  0.93
),
(
  'Step 9: Account',
  '100% 후불제 원칙 + 국세청 본인 계좌 직접 입금',
  '저희는 사전에 1원도 요구하지 않습니다. 환급금은 대한민국 국세청에서 고객님 통장으로 바로 입금되고, 돈 들어온 거 직접 확인하신 후에만 수수료가 청구되는 100% 후불제예요!',
  'human_seed',
  'skeptical',
  'vi',
  95,
  20,
  19,
  0.95
)
ON CONFLICT DO NOTHING;
