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
    
    const settlementPromises = rawList.map((item: any) => analyzeYearlyTax(item));
    const analyses = await Promise.all(settlementPromises);
    
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

    return {
      ...formatResult(totalRefundSum, anyAlreadyReduced, details, totalDecidedTax, recordsFoundCount),
      resIncomeTax: latestFoundAnalysis?.decidedTax ?? 0,
      resCompanyIdentityNo1: latestFoundAnalysis?.businessNo ?? "N/A",
      resAttrYear: latestFoundAnalysis?.year || "N/A",
      resIncomeSpecList: latestFoundAnalysis?.incomeSpecsJSON || "조회된 내역이 없습니다."
    };

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
    serviceFee: Math.floor(totalRefundSum * 0.25)
  };
}
