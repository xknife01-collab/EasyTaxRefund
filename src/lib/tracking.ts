import { db } from './firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

export interface TrackingData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
  detectedSource: string; // 최종 확정된 유입 채널
  timestamp: number;
}

const TRACKING_COOKIE_NAME = 'etr_marketing_tracking';

/**
 * HTTP Referrer를 분석해 유입 채널을 자동 감지합니다.
 * UTM 파라미터가 없을 때 fallback으로 사용됩니다.
 */
function detectSourceFromReferrer(referrer: string): string {
  if (!referrer) return 'direct';
  const r = referrer.toLowerCase();

  if (r.includes('google.') || r.includes('googleadservices') || r.includes('googleads')) return 'google';
  if (r.includes('facebook.com') || r.includes('fb.com') || r.includes('l.facebook.com') || r.includes('m.facebook.com')) return 'facebook';
  if (r.includes('instagram.com') || r.includes('l.instagram.com')) return 'instagram';
  if (r.includes('naver.com') || r.includes('naver.net')) return 'naver';
  if (r.includes('kakao.com') || r.includes('kakaocdn.net') || r.includes('kakaocorp.com')) return 'kakao';
  if (r.includes('youtube.com') || r.includes('youtu.be')) return 'youtube';
  if (r.includes('twitter.com') || r.includes('t.co') || r.includes('x.com')) return 'twitter';
  if (r.includes('tiktok.com')) return 'tiktok';
  if (r.includes('linkedin.com')) return 'linkedin';
  if (r.includes('bing.com')) return 'bing';
  if (r.includes('yahoo.com') || r.includes('search.yahoo')) return 'yahoo';

  return 'referral'; // 기타 외부 링크
}

/**
 * UTM 파라미터를 파싱하고 유입 채널을 localStorage에 저장합니다.
 * UTM이 없어도 referrer 기반 자동 감지로 항상 저장합니다.
 * UTM 파라미터가 있으면 기존 데이터를 덮어씁니다 (광고 클릭 우선).
 */
export function captureTrackingData(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  const hasUtm = ['utm_source', 'utm_medium', 'utm_campaign'].some(p => urlParams.has(p));

  // UTM source가 있으면 그것을 우선 사용, 없으면 referrer로 감지
  const utmSource = urlParams.get('utm_source') || undefined;
  const detectedSource = utmSource || detectSourceFromReferrer(referrer);

  const trackingData: TrackingData = {
    utmSource,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
    landingPage: window.location.pathname,
    referrer: referrer || undefined,
    detectedSource, // 항상 설정됨: 'facebook' | 'google' | 'instagram' | 'direct' | ...
    timestamp: Date.now(),
  };

  // UTM 파라미터가 있거나, 저장된 데이터가 없을 때만 덮어씀
  // (UTM 없는 재방문 시 기존 광고 attribution 보존)
  const existing = localStorage.getItem(TRACKING_COOKIE_NAME);
  if (hasUtm || !existing) {
    localStorage.setItem(TRACKING_COOKIE_NAME, JSON.stringify(trackingData));
  }
}

/**
 * localStorage에 저장된 트래킹 데이터를 반환합니다.
 */
export function getStoredTrackingData(): TrackingData | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(TRACKING_COOKIE_NAME);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error recovering tracking data:', error);
    return null;
  }
}

/**
 * 최종 확정 유입 채널을 반환합니다.
 * UTM source → referrer 감지 → 'direct' 순으로 우선순위가 적용됩니다.
 */
export function getEffectiveSource(): string {
  const data = getStoredTrackingData();
  return data?.detectedSource || data?.utmSource || 'direct';
}

/**
 * 저장된 트래킹 데이터를 삭제합니다.
 */
export function clearTrackingData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRACKING_COOKIE_NAME);
}

/**
 * Firestore daily_stats 컬렉션에 방문을 기록합니다.
 * sessionStorage를 사용해 한 세션에 한 번만 기록됩니다.
 */
export async function logVisit(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionKey = 'etr_visit_logged';
    if (sessionStorage.getItem(sessionKey)) return;

    const today = new Date().toISOString().split('T')[0];
    const statRef = doc(db, 'daily_stats', today);
    
    // 최종 확정 채널명 사용
    const source = getEffectiveSource();
    const safeSource = source.replace(/[.#$/[\]]/g, '_');

    await setDoc(statRef, { 
      visitCount: increment(1),
      [`sourceVisits.${safeSource}`]: increment(1)
    }, { merge: true });
    
    sessionStorage.setItem(sessionKey, 'true');
  } catch (error) {
    console.error('Error logging visit:', error);
  }
}

/**
 * 사용자가 언어를 선택했을 때 해당 언어의 방문을 기록합니다.
 * 한 세션에 한 번만 기록되도록 세션 스토리지 체크를 포함합니다.
 */
export async function logLanguageVisit(lang: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionKey = `etr_lang_visit_${lang}_logged`;
    if (sessionStorage.getItem(sessionKey)) return;

    const today = new Date().toISOString().split('T')[0];
    const statRef = doc(db, 'daily_stats', today);
    
    // 언어 코드 안전화 (ko, vi, zh 등)
    const safeLang = lang.replace(/[.#$/[\]]/g, '_');

    await setDoc(statRef, { 
      [`languageVisits.${safeLang}`]: increment(1)
    }, { merge: true });

    sessionStorage.setItem(sessionKey, 'true');
  } catch (error) {
    console.error('Error logging language visit:', error);
  }
}
