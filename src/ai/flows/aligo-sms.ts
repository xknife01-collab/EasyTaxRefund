'use server';

import axios from 'axios';

// 간단한 인메모리 OTP 저장소 (실 서비스 시 Redis나 DB 사용 권장)
const otpStore = new Map<string, { code: string, timestamp: number }>();

export async function sendOtpSms(phone: string) {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3분 유효기간 저장
    otpStore.set(cleanPhone, { code: otp, timestamp: Date.now() });

    const msg = `[이지택스] 고객포털 로그인 인증번호는 [${otp}]입니다. 타인에게 알리지 마세요.`;
    
    // 환경변수에서 알리고 계정 정보 가져오기 (.env 파일에 등록 필요)
    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const sender = process.env.ALIGO_SENDER;

    if (!apiKey || !userId || !sender) {
      console.warn("⚠️ 알리고 API 키가 설정되지 않아 메세지 발송을 시뮬레이션 합니다. 콘솔에서 OTP를 확인하세요.");
      console.log(`[시뮬레이션] ${cleanPhone} 번호로 발송된 OTP: ${otp}`);
      return { success: true, simulated: true };
    }

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('user_id', userId);
    params.append('sender', sender);
    params.append('receiver', cleanPhone);
    params.append('msg', msg);
    // params.append('testmode_yn', 'Y'); // 실제 과금 방지 테스트용 모드

    const res = await axios.post('https://apis.aligo.in/send/', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    });

    if (res.data.result_code === 1) {
      return { success: true };
    } else {
      return { success: false, error: res.data.message };
    }
  } catch (error: any) {
    console.error('Aligo OTP Error:', error.message);
    return { success: false, error: '문자 발송 서버 오류가 발생했습니다.' };
  }
}

export async function verifyOtpSms(phone: string, inputCode: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const record = otpStore.get(cleanPhone);
  
  if (!record) return { success: false, error: '인증 번호를 다시 요청해 주세요.' };
  
  if (Date.now() - record.timestamp > 3 * 60 * 1000) { // 3분 초과 시 만료
    otpStore.delete(cleanPhone);
    return { success: false, error: '인증 시간이 만료되었습니다. 다시 시도해 주세요.' };
  }

  if (record.code === inputCode) {
    otpStore.delete(cleanPhone);
    return { success: true };
  }
  
  return { success: false, error: '인증번호가 일치하지 않습니다.' };
}
