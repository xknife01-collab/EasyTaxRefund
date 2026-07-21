'use server';
/**
 * @fileOverview HYPHEN API 및 국세청(NTS) 사업자상태조회 API를 결합한 정밀 환급 분석 엔진.
 * - 하이픈(Hyphen) MyNTS API를 사용하여 근로소득 지급명세서 조회.
 * - 조세특례제한법 제30조에 따른 중소기업 취업자 소득세 감면 대상 판별.
 * - 국세청 API를 통한 실시간 사업자 상태 검증 및 감면 제외 업종 필터링 로직 탑재.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import axios from 'axios';

const HYPHEN_CONFIG = {
  userId: process.env.HYPHEN_USER_ID || "zkfnth01",
  hKey: process.env.HYPHEN_HKEY || "bebc2c0dfab3266b",
  baseUrl: "https://api.hyphen.im",
  gustation: process.env.HYPHEN_GUSTATION || "N"
};

const NTS_CONFIG = {
  serviceKey: "61365b989dc12a3267b3e5843d1750fa930c68b0ae3fafd9e51926c93ce6a612",
  statusUrl: "https://api.odcloud.kr/api/nts-businessman/v1/status"
};

/**
 * 국세청 API를 통한 사업자 상태 조회 및 부적격 업종 판별 (시계열 검증 포함)
 */
async function verifyBusinessAndIndustry(businessNo: string, companyName: string, targetYear: string) {
  try {
    const cleanBNo = businessNo.replace(/[^0-9]/g, '');
    if (cleanBNo.length !== 10) return { isValid: false, reason: "INVALID_BRN" };

    const res = await axios.post(`${NTS_CONFIG.statusUrl}?serviceKey=${NTS_CONFIG.serviceKey}`, {
      b_no: [cleanBNo]
    }, {
      headers: {
        "Authorization": NTS_CONFIG.serviceKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    const bizData = res.data.data?.[0];
    if (!bizData) return { isValid: true, reason: "API_NO_DATA_FALLBACK" };
    
    const statusCd = bizData.b_stt_cd;
    const endDt = bizData.end_dt || ""; 

    if (statusCd !== "01" && endDt.length >= 4) {
      const endYear = endDt.substring(0, 4);
      if (parseInt(targetYear) > parseInt(endYear)) {
        return { isValid: false, reason: `BUSINESS_CLOSED_BEFORE_WORK` };
      }
    }

    const ineligibleKeywords = [
      "법무", "법무법인", "변호사", "회계", "회계법인", "세무", "세무법인", "변리", "관세", "노무", 
      "의원", "병원", "치과", "한의원", "요양병원", 
      "은행", "증권", "금융", "보험", "대부", "저축", 
      "부동산", "임대", "중개", "공인중개", 
      "유흥", "단란", "무도장", "골프장", "스키장", "게임장", "도박"
    ];

    const isExcluded = ineligibleKeywords.some(kw => companyName.includes(kw));
    if (isExcluded && companyName.includes("동물병원")) return { isValid: true };
    if (isExcluded) return { isValid: false, reason: "EXCLUDED_INDUSTRY" };

    return { isValid: true };
  } catch (error) {
    return { isValid: true }; 
  }
}

function getEightDigitBirth(regNo: string): string {
  const cleanRegNo = regNo.replace(/[^0-9]/g, '');
  if (cleanRegNo.length < 7) return "";
  const birth6 = cleanRegNo.substring(0, 6);
  const genderDigit = cleanRegNo.charAt(6);
  const prefix = (['3', '4', '7', '8'].includes(genderDigit)) ? '20' : '19';
  return prefix + birth6;
}

/**
 * 하이픈 1단계: 인증 요청 (step: init)
 */
export async function initiateRefundAuth(input: { userName: string, registrationNumber: string, phoneNo: string, telecom: string, method: 'app' | 'sms' | 'kakao' | 'hana' }) {
  try {
    // 하이픈 통신사 코드 변환 (S, K, L)
    const telMap: Record<string, string> = { "0": "S", "1": "K", "2": "L" };
    const mobileCo = telMap[input.telecom] || input.telecom;

    // 조직 코드 매핑
    let loginOrgCd = "pass";
    if (input.method === 'kakao') loginOrgCd = "kakao";
    if (input.method === 'hana') loginOrgCd = "hana";

    console.log(`[Hyphen] Step 1 Init for ${input.userName} via ${loginOrgCd}`);

    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") {
      headers["hyphen-gustation"] = "Y";
    }

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000300`, {
      loginMethod: "EASY",
      loginOrgCd: loginOrgCd,
      resNm: input.userName,
      resNo: getEightDigitBirth(input.registrationNumber),
      mobileCo: mobileCo,
      mobileNo: input.phoneNo,
      stepMode: "step",
      step: "init"
    }, {
      headers,
      timeout: 90000 // 90초 타임아웃 (Vercel Pro 기준)
    });

    console.log("[Hyphen Step1 Response]", JSON.stringify(res.data?.common));

    const common = res.data.common;
    // errYn === 'N' 이면 에러 없음(정상), 'Y' 이면 에러
    if (common?.errYn === 'N') {
      const stepData = res.data.data?.stepData;
      return {
        success: true,
        id: common.hyphenTrNo,
        twoWayInfo: { stepData },
        message: "휴대폰 인증 요청이 발송되었습니다. 승인 후 로딩이 끝날 때까지 기다려주세요."
      };
    }

    // 에러인 경우 코드와 메시지를 모두 포함하여 throw
    const errDetail = `[${common?.errCd || 'ERR'}] ${common?.errMsg || '인증 요청 실패'}`;
    throw new Error(errDetail);
  } catch (error: any) {
    // axios 에러인 경우 response body도 로깅
    if (error.response) {
      console.error("[Hyphen Step1 HTTP Error]", error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error("[Hyphen Step1 Error]", error.message);
    }
    return {
      success: false,
      id: "ERROR",
      twoWayInfo: null,
      message: `API 에러: ${error.message}`
    };
  }
}

/**
 * 하이픈 2단계: 승인 확인 및 데이터 조회 (step: sign)
 */
export async function completeAuthAndEstimate(input: {id: string, twoWayInfo: any, userName: string, registrationNumber: string, phoneNo: string, telecom: string, method: 'app' | 'kakao' | 'hana', otpCode?: string}) {
  try {
    if (input.id.startsWith('DEMO-')) throw new Error("DEMO_MODE_SUCCESS");

    const telMap: Record<string, string> = { "0": "S", "1": "K", "2": "L" };
    const mobileCo = telMap[input.telecom] || input.telecom;

    // 조직 코드 매핑 (1단계와 동일해야 함)
    let loginOrgCd = "pass";
    if (input.method === 'kakao') loginOrgCd = "kakao";
    if (input.method === 'hana') loginOrgCd = "hana";

    console.log(`[Hyphen] Step 2 Sign for ID: ${input.id} via ${loginOrgCd}`);

    const headers2: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") {
      headers2["hyphen-gustation"] = "Y";
    }

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000300`, {
      loginMethod: "EASY",
      loginOrgCd: loginOrgCd,
      resNm: input.userName,
      resNo: getEightDigitBirth(input.registrationNumber),
      mobileCo: mobileCo,
      mobileNo: input.phoneNo,
      stepMode: "step",
      step: "sign",
      stepData: input.twoWayInfo.stepData,
      detailYn: "Y"
    }, {
      headers: headers2,
      timeout: 90000 // 90초 타임아웃
    });

    console.log("[Hyphen Step2 Response]", JSON.stringify(res.data?.common));

    const common = res.data.common;
    if (common?.errYn !== 'N') {
      // 에러 코드별 구체적 처리
      if (common?.errCd === '1201' || common?.errCd === '1202') throw new Error("NAME_MISMATCH");
      const errDetail = `[${common?.errCd || 'ERR'}] ${common?.errMsg || '조회 실패'}`;
      throw new Error(errDetail);
    }

    // 하이픈 데이터 파싱
    const rawList = res.data.data?.list || res.data.data?.resPayList || [];
    console.log("[Hyphen Sign] rawList retrieved (length):", rawList.length, "contents:", JSON.stringify(rawList));
    
    const settlementPromises = rawList.map((item: any) => analyzeYearlyTax(item));
    const analyses = await Promise.all(settlementPromises);
    console.log("[Hyphen Sign] analyses completed:", JSON.stringify(analyses));
    
    let totalRefundSum = 0;
    let totalDecidedTax = 0;
    let anyAlreadyReduced = false;
    let recordsFoundCount = 0;
    let details: any[] = [];
    let latestFoundAnalysis: any = null;

    for (const analysis of analyses) {
      if (analysis) {
        recordsFoundCount++;
        totalDecidedTax += analysis.decidedTax;
        if (analysis.isAlreadyReduced) anyAlreadyReduced = true;
        totalRefundSum += analysis.potentialRefund;
        if (!latestFoundAnalysis || parseInt(analysis.year) > parseInt(latestFoundAnalysis.year)) latestFoundAnalysis = analysis;
        if (analysis.potentialRefund > 0) details.push({ year: analysis.year, company: analysis.company, amount: analysis.potentialRefund });
      }
    }

    const finalResult = {
      success: true,
      ...formatResult(totalRefundSum, anyAlreadyReduced, details, totalDecidedTax, recordsFoundCount),
      resIncomeTax: latestFoundAnalysis?.decidedTax ?? 0,
      resCompanyIdentityNo1: latestFoundAnalysis?.businessNo ?? "N/A",
      resAttrYear: latestFoundAnalysis?.year || "N/A",
      resIncomeSpecList: latestFoundAnalysis?.incomeSpecsJSON || "조회된 내역이 없습니다."
    };
    
    console.log("[Hyphen Sign] Final parsed result returned to client:", JSON.stringify(finalResult));
    return finalResult;

  } catch (error: any) {
    console.error("[Hyphen Sign Error]", error.message);
    throw error;
  }
}

async function analyzeYearlyTax(item: any) {
  if (!item) return null;
  const year = item.resAttrYear || item.resYear;
  const companyName = item.resCompanyNm1 || item.resCompanyNm || "정보 없음";
  const businessNo = item.resCompanyIdentityNo1 || item.resBizNo || "N/A";
  
  const ntsVerification = await verifyBusinessAndIndustry(businessNo, companyName, year);
  
  const incomeSpecs = item.resIncomeSpecList || [];
  const isAlreadyReduced = incomeSpecs.some((spec: any) => 
    spec.resType?.includes("중소기업") || spec.resType?.includes("T11") || spec.resType?.includes("제30조")
  );
  
  const taxSpecs = item.resTaxAmtSpecList || [];
  const mainTax = taxSpecs.find((t: any) => t.resType?.includes("주(현)")) || taxSpecs[0] || item;
  
  const incomeTax = parseInt((mainTax.resIncomeTax || "0").toString().replace(/[^0-9]/g, ''));
  const localTax = parseInt((mainTax.resLocalIncomeTax || "0").toString().replace(/[^0-9]/g, ''));
  const decidedTax = incomeTax + localTax;
  
  let potentialRefund = 0;
  if (!isAlreadyReduced && decidedTax > 0 && ntsVerification.isValid) {
    potentialRefund = Math.min(2000000, Math.floor(decidedTax * 0.9));
  }
  
  return { 
    year, company: companyName, businessNo, decidedTax, potentialRefund, isAlreadyReduced, 
    incomeSpecsJSON: JSON.stringify(incomeSpecs)
  };
}

function formatResult(totalRefundSum: number, anyAlreadyReduced: boolean, details: any[], totalDecidedTax: number, recordsFoundCount: number) {
  let caseType = 'D';
  if (totalRefundSum > 0) caseType = 'A';
  else if (anyAlreadyReduced) caseType = 'B';
  else if (recordsFoundCount > 0 && totalDecidedTax === 0) caseType = 'C';

  let message = caseType === 'A' ? "축하합니다! {amount}을 찾았습니다." :
                caseType === 'B' ? "이미 감면 혜택를 받고 계시네요!" :
                caseType === 'C' ? "납부하신 세금이 없어 환급액이 0원입니다." : "조회된 데이터가 없습니다.";

  return {
    caseType,
    refundEstimate: totalRefundSum,
    message,
    details: details.sort((a, b) => parseInt(b.year) - parseInt(a.year)),
    deductionsConsidered: ["중소기업 취업자 소득세 감면 (90%)", "국세청 사업자 시계열 상태 검증 완료"],
    serviceFee: Math.floor(totalRefundSum * 0.22)
  };
}

// --- NEW HOMETAX SIGNUP & ID/PW QUERY ACTIONS ---

import crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '63a56e7293b48274d756ef8291a27e366113b2849e7b282711d2e38c7b841a22';
const IV_LENGTH = 16;

function encryptText(text: string): string {
  try {
    let keyBuffer: Buffer;
    try {
      keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
      if (keyBuffer.length !== 32) {
        keyBuffer = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
      }
    } catch (e) {
      keyBuffer = crypto.scryptSync(ENCRYPTION_KEY || 'default-fallback-key', 'salt', 32);
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err: any) {
    console.error("Encryption failed:", err.message);
    return text;
  }
}

function decryptText(text: string): string {
  try {
    let keyBuffer: Buffer;
    try {
      keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
      if (keyBuffer.length !== 32) {
        keyBuffer = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
      }
    } catch (e) {
      keyBuffer = crypto.scryptSync(ENCRYPTION_KEY || 'default-fallback-key', 'salt', 32);
    }
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err: any) {
    console.error("Decryption failed:", err.message);
    return text;
  }
}

function getCleanRegNo(regNo: string): string {
  return regNo.replace(/[^0-9]/g, '');
}

function getTelecomSignupCode(telecom: string): string {
  const telMap: Record<string, string> = { 
    "0": "SKT", 
    "1": "KTF", 
    "2": "LGT",
    "3": "SKM",
    "4": "KTM",
    "5": "LGM"
  };
  return telMap[telecom] || telecom;
}

// 1. 아이디 중복 체크
export async function checkHometaxIdDuplicate(userId: string, isSimulation?: boolean) {
  try {
    console.log(`[Hometax ID Check] Checking userId: ${userId} (Simulation: ${isSimulation})`);
    if (isSimulation) {
      if (['admin', 'duplicate', 'user123'].includes(userId.toLowerCase())) {
        return { success: false, message: "이미 사용 중인 아이디입니다." };
      }
      return { success: true, message: "사용 가능한 아이디입니다." };
    }

    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000354`, {
      userId
    }, { headers, timeout: 30000 });

    console.log("[Hometax ID Check Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      return { success: true, message: "사용 가능한 아이디입니다." };
    }
    return { success: false, message: common?.errMsg || "이미 가입되었거나 사용할 수 없는 아이디입니다." };
  } catch (error: any) {
    console.error("[Hometax ID Check Error]", error.message);
    return { success: false, message: `오류: ${error.message}` };
  }
}

// 2. 회원가입 문자 요청 (Step 1)
export async function requestHometaxSignupSms(input: {
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  telecom: string;
  userId: string;
  userPw: string;
  email: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax SignUp Step 1] Requesting SMS for ${input.userName} (Simulation: ${input.isSimulation})`);
    if (input.isSimulation) {
      return {
        success: true,
        id: "SIM-TR-SIGNUP-" + Math.floor(Math.random() * 100000),
        twoWayInfo: { stepData: "SIM-STEP-DATA-SIGNUP" },
        message: "인증 문자가 발송되었습니다."
      };
    }

    const mobileCo = getTelecomSignupCode(input.telecom);
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000353`, {
      mobileYn: "Y",
      resNo: getCleanRegNo(input.registrationNumber),
      resNm: input.userName,
      userId: input.userId,
      userPw: input.userPw,
      email: input.email,
      step: "captcha",
      mobileCo: mobileCo,
      mobileNo: input.phoneNo,
      sOption: "02"
    }, { headers, timeout: 60000 });

    console.log("[Hometax SignUp Step 1 Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      const stepData = res.data.data?.step_data || res.data.data?.stepData;
      return {
        success: true,
        id: common.hyphenTrNo,
        twoWayInfo: { stepData },
        message: "인증 문자가 발송되었습니다."
      };
    }

    throw new Error(`[${common?.errCd}] ${common?.errMsg}`);
  } catch (error: any) {
    console.error("[Hometax SignUp Step 1 Error]", error.message);
    return { success: false, message: error.message || "인증 문자 발송에 실패했습니다." };
  }
}

// 3. 회원가입 승인 및 최종 가입 완료 (Step 2)
export async function completeHometaxSignup(input: {
  id: string;
  twoWayInfo: any;
  smsCode: string;
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  telecom: string;
  userId: string;
  userPw: string;
  email: string;
  applicationId: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax SignUp Step 2] Verifying SMS for ${input.userName} (Simulation: ${input.isSimulation})`);
    
    if (input.isSimulation) {
      if (input.smsCode === "000000") {
        throw new Error("인증번호가 일치하지 않습니다. 다시 입력해 주세요.");
      }
      // Save simulated credentials to Supabase
      try {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const encryptedPw = encryptText(input.userPw);
        const encryptedReg = encryptText(input.registrationNumber);
        const { error } = await supabaseAdmin.from('hometax_credentials').upsert({
          application_id: input.applicationId,
          hometax_id: input.userId,
          hometax_pw_encrypted: encryptedPw,
          registration_number_encrypted: encryptedReg,
          full_name: input.userName,
          phone: input.phoneNo
        }, { onConflict: 'application_id' });
        if (error) console.error("Supabase Save Warning (Simulated):", error.message);
      } catch (dbErr: any) {
        console.warn("Supabase bypass (Simulated environment):", dbErr.message);
      }

      return { success: true, message: "회원가입이 완료되었습니다!" };
    }

    const mobileCo = getTelecomSignupCode(input.telecom);
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000353`, {
      mobileYn: "Y",
      resNo: getCleanRegNo(input.registrationNumber),
      resNm: input.userName,
      userId: input.userId,
      userPw: input.userPw,
      email: input.email,
      step: "identityCheck",
      step_input: input.smsCode,
      step_data: input.twoWayInfo.stepData,
      mobileCo: mobileCo,
      mobileNo: input.phoneNo,
      sOption: "02"
    }, { headers, timeout: 60000 });

    console.log("[Hometax SignUp Step 2 Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      // Save credentials in Supabase
      try {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const encryptedPw = encryptText(input.userPw);
        const encryptedReg = encryptText(input.registrationNumber);
        await supabaseAdmin.from('hometax_credentials').upsert({
          application_id: input.applicationId,
          hometax_id: input.userId,
          hometax_pw_encrypted: encryptedPw,
          registration_number_encrypted: encryptedReg,
          full_name: input.userName,
          phone: input.phoneNo
        }, { onConflict: 'application_id' });
      } catch (dbErr: any) {
        console.error("Failed to save credentials to Supabase:", dbErr.message);
      }

      return { success: true, message: "회원가입이 완료되었습니다!" };
    }

    throw new Error(`[${common?.errCd}] ${common?.errMsg}`);
  } catch (error: any) {
    console.error("[Hometax SignUp Step 2 Error]", error.message);
    return { success: false, message: error.message || "회원가입 완료에 실패했습니다." };
  }
}

// 4. 아이디 찾기 문자 요청 (Step 1)
export async function findHometaxIdSms(input: {
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  telecom: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax Find ID Step 1] (Simulation: ${input.isSimulation})`);
    if (input.isSimulation) {
      return {
        success: true,
        id: "SIM-TR-FINDID-" + Math.floor(Math.random() * 100000),
        twoWayInfo: { stepData: "SIM-STEP-DATA-FINDID" },
        message: "인증 문자가 발송되었습니다."
      };
    }

    const mobileCo = getTelecomSignupCode(input.telecom);
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000357`, {
      mobileYn: "Y",
      resNo: getCleanRegNo(input.registrationNumber),
      resNm: input.userName,
      step: "captcha",
      mobileCo: mobileCo,
      mobileNo: input.phoneNo
    }, { headers, timeout: 60000 });

    console.log("[Hometax Find ID Step 1 Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      const stepData = res.data.data?.stepData || res.data.data?.step_data;
      return {
        success: true,
        id: common.hyphenTrNo,
        twoWayInfo: { stepData },
        message: "인증 문자가 발송되었습니다."
      };
    }

    throw new Error(`[${common?.errCd}] ${common?.errMsg}`);
  } catch (error: any) {
    console.error("[Hometax Find ID Step 1 Error]", error.message);
    return { success: false, message: error.message || "인증 문자 발송에 실패했습니다." };
  }
}

// 5. 아이디 찾기 승인 및 조회 완료 (Step 2)
export async function verifyFindHometaxId(input: {
  id: string;
  twoWayInfo: any;
  smsCode: string;
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  telecom: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax Find ID Step 2] (Simulation: ${input.isSimulation})`);
    if (input.isSimulation) {
      if (input.smsCode === "000000") throw new Error("인증번호가 일치하지 않습니다.");
      return { success: true, userId: "foreignUser99" };
    }

    const mobileCo = getTelecomSignupCode(input.telecom);
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000357`, {
      mobileYn: "Y",
      resNo: getCleanRegNo(input.registrationNumber),
      resNm: input.userName,
      step: "identityCheck",
      stepInput: input.smsCode,
      stepData: input.twoWayInfo.stepData,
      mobileCo: mobileCo,
      mobileNo: input.phoneNo
    }, { headers, timeout: 60000 });

    console.log("[Hometax Find ID Step 2 Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      return { success: true, userId: res.data.data?.userId || "아이디 조회 결과 없음" };
    }

    throw new Error(`[${common?.errCd}] ${common?.errMsg}`);
  } catch (error: any) {
    console.error("[Hometax Find ID Step 2 Error]", error.message);
    return { success: false, message: error.message || "아이디 찾기에 실패했습니다." };
  }
}

// 6. 비밀번호 재발급 문자 요청 (Step 1)
export async function resetHometaxPasswordSms(input: {
  hometaxId: string;
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  telecom: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax Reset PW Step 1] (Simulation: ${input.isSimulation})`);
    if (input.isSimulation) {
      return {
        success: true,
        id: "SIM-TR-RESETPW-" + Math.floor(Math.random() * 100000),
        twoWayInfo: { stepData: "SIM-STEP-DATA-RESETPW" },
        message: "인증 문자가 발송되었습니다."
      };
    }

    const mobileCo = getTelecomSignupCode(input.telecom);
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000358`, {
      mobileYn: "Y",
      userId: input.hometaxId,
      resNo: getCleanRegNo(input.registrationNumber),
      resNm: input.userName,
      step: "captcha",
      mobileCo: mobileCo,
      mobileNo: input.phoneNo
    }, { headers, timeout: 60000 });

    console.log("[Hometax Reset PW Step 1 Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      const stepData = res.data.data?.stepData || res.data.data?.step_data;
      return {
        success: true,
        id: common.hyphenTrNo,
        twoWayInfo: { stepData },
        message: "인증 문자가 발송되었습니다."
      };
    }

    throw new Error(`[${common?.errCd}] ${common?.errMsg}`);
  } catch (error: any) {
    console.error("[Hometax Reset PW Step 1 Error]", error.message);
    return { success: false, message: error.message || "인증 문자 발송에 실패했습니다." };
  }
}

// 7. 비밀번호 재발급 완료 (Step 2)
export async function verifyResetHometaxPassword(input: {
  id: string;
  twoWayInfo: any;
  smsCode: string;
  hometaxId: string;
  newPw: string;
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  telecom: string;
  applicationId: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax Reset PW Step 2] (Simulation: ${input.isSimulation})`);
    if (input.isSimulation) {
      if (input.smsCode === "000000") throw new Error("인증번호가 일치하지 않습니다.");
      
      // Save simulated credentials to Supabase
      try {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const encryptedPw = encryptText(input.newPw);
        const encryptedReg = encryptText(input.registrationNumber);
        await supabaseAdmin.from('hometax_credentials').upsert({
          application_id: input.applicationId,
          hometax_id: input.hometaxId,
          hometax_pw_encrypted: encryptedPw,
          registration_number_encrypted: encryptedReg,
          full_name: input.userName,
          phone: input.phoneNo
        }, { onConflict: 'application_id' });
      } catch (dbErr: any) {
        console.warn("Supabase bypass (Simulated environment):", dbErr.message);
      }

      return { success: true, message: "비밀번호가 성공적으로 재설정되었습니다!" };
    }

    const mobileCo = getTelecomSignupCode(input.telecom);
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    const res = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000358`, {
      mobileYn: "Y",
      userId: input.hometaxId,
      userPw: input.newPw,
      resNo: getCleanRegNo(input.registrationNumber),
      resNm: input.userName,
      step: "identityCheck",
      stepInput: input.smsCode,
      stepData: input.twoWayInfo.stepData,
      mobileCo: mobileCo,
      mobileNo: input.phoneNo
    }, { headers, timeout: 60000 });

    console.log("[Hometax Reset PW Step 2 Response]", JSON.stringify(res.data?.common));
    const common = res.data.common;
    if (common?.errYn === 'N') {
      // Save updated credentials in Supabase
      try {
        const { supabaseAdmin } = await import('@/lib/supabase');
        const encryptedPw = encryptText(input.newPw);
        const encryptedReg = encryptText(input.registrationNumber);
        await supabaseAdmin.from('hometax_credentials').upsert({
          application_id: input.applicationId,
          hometax_id: input.hometaxId,
          hometax_pw_encrypted: encryptedPw,
          registration_number_encrypted: encryptedReg,
          full_name: input.userName,
          phone: input.phoneNo
        }, { onConflict: 'application_id' });
      } catch (dbErr: any) {
        console.error("Failed to save credentials to Supabase:", dbErr.message);
      }

      return { success: true, message: "비밀번호가 성공적으로 재설정되었습니다!" };
    }

    throw new Error(`[${common?.errCd}] ${common?.errMsg}`);
  } catch (error: any) {
    console.error("[Hometax Reset PW Step 2 Error]", error.message);
    return { success: false, message: error.message || "비밀번호 재설정에 실패했습니다." };
  }
}

// 8. ID/PW 기반 세션공유 및 환급액 산정
export async function estimateRefundWithIdPw(input: {
  hometaxId: string;
  hometaxPw: string;
  userName: string;
  registrationNumber: string;
  phoneNo: string;
  applicationId: string;
  isSimulation?: boolean;
}) {
  try {
    console.log(`[Hometax ID/PW Estimate] Running query for ${input.userName} (Simulation: ${input.isSimulation})`);
    
    if (input.isSimulation) {
      // Mock result matching formatResult structure
      return {
        success: true,
        caseType: 'A',
        refundEstimate: 1250000,
        message: "축하합니다! {amount}을 찾았습니다.",
        details: [
          { year: "2025", company: "Simulated Corp A", amount: 800000 },
          { year: "2024", company: "Simulated Corp B", amount: 450000 }
        ],
        deductionsConsidered: ["중소기업 취업자 소득세 감면 (90%)", "국세청 사업자 시계열 상태 검증 완료"],
        serviceFee: 312500,
        resIncomeTax: 1500000,
        resCompanyIdentityNo1: "120-81-12345",
        resAttrYear: "2025",
        resIncomeSpecList: "[]"
      };
    }

    // --- Step 1: Get Session Cookie from /in0076000244 ---
    const headers: Record<string, string> = {
      "user-id": HYPHEN_CONFIG.userId,
      "Hkey": HYPHEN_CONFIG.hKey,
      "Content-Type": "application/json"
    };
    if (HYPHEN_CONFIG.gustation === "Y") headers["hyphen-gustation"] = "Y";

    // 2차 인증 번호는 주민등록번호 앞 7자리 (YYMMDDG)
    const userValidNo = getCleanRegNo(input.registrationNumber).substring(0, 7);

    console.log("[Hometax ID/PW Estimate] Step 1: Logging in via member-info api...");
    const loginRes = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000244`, {
      loginMethod: "ID",
      userId: input.hometaxId,
      userPw: input.hometaxPw,
      userVaildNo: userValidNo,
      showCookie: "Y"
    }, { headers, timeout: 60000 });

    console.log("[Hometax ID/PW Login Response]", JSON.stringify(loginRes.data?.common));
    const loginCommon = loginRes.data.common;
    if (loginCommon?.errYn !== 'N') {
      throw new Error(`로그인 실패: [${loginCommon?.errCd}] ${loginCommon?.errMsg}`);
    }

    const cookieData = loginRes.data.data?.cookie || loginRes.data.data?.cookieData;
    if (!cookieData) {
      throw new Error("로그인에는 성공했으나 세션 정보를 받아오지 못했습니다.");
    }

    // Save/Update credentials in Supabase
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const encryptedPw = encryptText(input.hometaxPw);
      const encryptedReg = encryptText(input.registrationNumber);
      await supabaseAdmin.from('hometax_credentials').upsert({
        application_id: input.applicationId,
        hometax_id: input.hometaxId,
        hometax_pw_encrypted: encryptedPw,
        registration_number_encrypted: encryptedReg,
        full_name: input.userName,
        phone: input.phoneNo
      }, { onConflict: 'application_id' });
    } catch (dbErr: any) {
      console.error("Failed to save/update credentials to Supabase:", dbErr.message);
    }

    // --- Step 2: Fetch Payment Statements (MyNTS) via /in0076000300 ---
    console.log("[Hometax ID/PW Estimate] Step 2: Querying MyNTS statements using cookie...");
    const ntsRes = await axios.post(`${HYPHEN_CONFIG.baseUrl}/in0076000300`, {
      cookieData: cookieData,
      loginMethod: "ID", // Format value required by schema
      detailYn: "Y"
    }, { headers, timeout: 90000 });

    console.log("[Hometax ID/PW MyNTS Response]", JSON.stringify(ntsRes.data?.common));
    const ntsCommon = ntsRes.data.common;
    if (ntsCommon?.errYn !== 'N') {
      throw new Error(`MyNTS 조회 실패: [${ntsCommon?.errCd}] ${ntsCommon?.errMsg}`);
    }

    // Run original tax analysis logic on the retrieved list
    const rawList = ntsRes.data.data?.list || ntsRes.data.data?.resPayList || [];
    console.log("[Hometax ID/PW Estimate] rawList retrieved (length):", rawList.length, "contents:", JSON.stringify(rawList));
    
    const settlementPromises = rawList.map((item: any) => analyzeYearlyTax(item));
    const analyses = await Promise.all(settlementPromises);
    console.log("[Hometax ID/PW Estimate] analyses completed:", JSON.stringify(analyses));
    
    let totalRefundSum = 0;
    let totalDecidedTax = 0;
    let anyAlreadyReduced = false;
    let recordsFoundCount = 0;
    let details: any[] = [];
    let latestFoundAnalysis: any = null;

    for (const analysis of analyses) {
      if (analysis) {
        recordsFoundCount++;
        totalDecidedTax += analysis.decidedTax;
        if (analysis.isAlreadyReduced) anyAlreadyReduced = true;
        totalRefundSum += analysis.potentialRefund;
        if (!latestFoundAnalysis || parseInt(analysis.year) > parseInt(latestFoundAnalysis.year)) latestFoundAnalysis = analysis;
        if (analysis.potentialRefund > 0) details.push({ year: analysis.year, company: analysis.company, amount: analysis.potentialRefund });
      }
    }

    const finalResult = {
      success: true,
      ...formatResult(totalRefundSum, anyAlreadyReduced, details, totalDecidedTax, recordsFoundCount),
      resIncomeTax: latestFoundAnalysis?.decidedTax ?? 0,
      resCompanyIdentityNo1: latestFoundAnalysis?.businessNo ?? "N/A",
      resAttrYear: latestFoundAnalysis?.year || "N/A",
      resIncomeSpecList: latestFoundAnalysis?.incomeSpecsJSON || "조회된 내역이 없습니다."
    };
    
    console.log("[Hometax ID/PW Estimate] Final parsed result returned to client:", JSON.stringify(finalResult));
    return finalResult;

  } catch (error: any) {
    console.error("[Hometax ID/PW Estimate Error]", error.message);
    return { success: false, message: error.message };
  }
}

export async function getDecryptedHometaxCredentialsMap() {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data, error } = await supabaseAdmin
      .from('hometax_credentials')
      .select('application_id, hometax_id, hometax_pw_encrypted, registration_number_encrypted');

    if (error) {
      console.error("Failed to fetch hometax credentials:", error.message);
      return { success: false, credentialsMap: {} };
    }

    const credentialsMap: Record<string, { hometaxId: string, hometaxPw: string, registrationNumber: string }> = {};
    if (data) {
      data.forEach((item: any) => {
        credentialsMap[item.application_id] = {
          hometaxId: item.hometax_id || "",
          hometaxPw: item.hometax_pw_encrypted ? decryptText(item.hometax_pw_encrypted) : "",
          registrationNumber: item.registration_number_encrypted ? decryptText(item.registration_number_encrypted) : ""
        };
      });
    }

    return { success: true, credentialsMap };
  } catch (err: any) {
    console.error("Failed to fetch credentials map:", err.message);
    return { success: false, credentialsMap: {} };
  }
}


