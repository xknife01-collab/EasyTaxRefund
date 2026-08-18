'use server';

import axios from 'axios';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export async function sendOtpSms(phone: string) {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Firestore에 OTP 저장 (서버리스 인스턴스 간 데이터 보존을 위해)
    await setDoc(doc(db, "otps", cleanPhone), {
      code: otp,
      timestamp: Date.now()
    });

    const msg = `[Korea Tax Refund Service] 고객포털 로그인 인증번호는 [${otp}]입니다. 타인에게 알리지 마세요.`;
    
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

    const requestConfig: any = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    };

    // Vercel 고정 IP 아웃바운드 프록시(Fixie 등) 자동 감지 및 연동
    if (process.env.FIXIE_URL) {
      try {
        const parsedUrl = new URL(process.env.FIXIE_URL);
        const username = parsedUrl.username;
        const password = parsedUrl.password;
        
        requestConfig.proxy = {
          protocol: parsedUrl.protocol.replace(':', ''),
          host: parsedUrl.hostname,
          port: parseInt(parsedUrl.port || '80'),
          ...(username ? { auth: { username, password } } : {})
        };
        console.log(`[Aligo Proxy] Routing via Fixie proxy: ${parsedUrl.hostname}:${parsedUrl.port}`);
      } catch (proxyError: any) {
        console.error(`[Aligo Proxy Error] Failed to parse FIXIE_URL:`, proxyError.message);
      }
    }

    const res = await axios.post('https://apis.aligo.in/send/', params, requestConfig);

    if (res.data.result_code === 1 || res.data.result_code === '1') {
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
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const docRef = doc(db, "otps", cleanPhone);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: '인증 번호를 다시 요청해 주세요.' };
    }
    
    const record = docSnap.data();
    
    if (Date.now() - record.timestamp > 3 * 60 * 1000) { // 3분 초과 시 만료
      await deleteDoc(docRef);
      return { success: false, error: '인증 시간이 만료되었습니다. 다시 시도해 주세요.' };
    }

    if (record.code === inputCode) {
      await deleteDoc(docRef);
      return { success: true };
    }
    
    return { success: false, error: '인증번호가 일치하지 않습니다.' };
  } catch (error: any) {
    console.error('Verify OTP Error:', error.message);
    return { success: false, error: '인증 확인 중 서버 오류가 발생했습니다.' };
  }
}

export async function sendAligoSms({
  phone,
  message,
  title,
  testMode = false
}: {
  phone: string;
  message: string;
  title?: string;
  testMode?: boolean;
}): Promise<{ success: boolean; error?: string; simulated?: boolean }> {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: '유효하지 않은 전화번호입니다.' };
    }

    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const sender = process.env.ALIGO_SENDER;

    if (!apiKey || !userId || !sender) {
      console.warn("⚠️ [Aligo SMS] API 키 또는 발신번호 미설정으로 시뮬레이션 발송 처리됩니다.");
      console.log(`[SMS 시뮬레이션] 수신자: ${cleanPhone} | 제목: ${title || '(없음)'}\n본문:\n${message}`);
      return { success: true, simulated: true };
    }

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('user_id', userId);
    params.append('sender', sender);
    params.append('receiver', cleanPhone);
    params.append('msg', message);
    if (title) {
      params.append('title', title);
    }
    if (testMode) {
      params.append('testmode_yn', 'Y');
    }

    const requestConfig: any = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    };

    if (process.env.FIXIE_URL) {
      try {
        const parsedUrl = new URL(process.env.FIXIE_URL);
        const username = parsedUrl.username;
        const password = parsedUrl.password;
        
        requestConfig.proxy = {
          protocol: parsedUrl.protocol.replace(':', ''),
          host: parsedUrl.hostname,
          port: parseInt(parsedUrl.port || '80'),
          ...(username ? { auth: { username, password } } : {})
        };
      } catch (proxyError: any) {
        console.error(`[Aligo Proxy Error] Failed to parse FIXIE_URL:`, proxyError.message);
      }
    }

    const res = await axios.post('https://apis.aligo.in/send/', params, requestConfig);

    if (res.data.result_code === 1 || res.data.result_code === '1') {
      console.log(`[Aligo SMS] Successfully sent SMS to ${cleanPhone} (msg_id: ${res.data.msg_id})`);
      return { success: true };
    } else {
      console.warn(`[Aligo SMS Error] Failed to send SMS to ${cleanPhone}:`, res.data.message);
      return { success: false, error: res.data.message };
    }
  } catch (error: any) {
    console.error('Aligo SMS Send Error:', error.message);
    return { success: false, error: 'SMS 발송 서버 통신 오류가 발생했습니다.' };
  }
}

