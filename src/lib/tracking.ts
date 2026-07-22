import { db } from './firebase';
import { doc, setDoc, increment, collection } from 'firebase/firestore';

/**
 * 한국 시간(KST, UTC+9) 기준의 YYYY-MM-DD 날짜 문자열을 구합니다.
 */
export function getKstDateString(date = new Date()): string {
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(date.getTime() + kstOffset);
  return kstDate.toISOString().split('T')[0];
}

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

  if (r.includes('facebook.com') || r.includes('fb.com') || r.includes('l.facebook.com') || r.includes('m.facebook.com') || r.includes('com.facebook.katana') || r.includes('com.facebook.orca')) return 'facebook';
  if (r.includes('instagram.com') || r.includes('l.instagram.com') || r.includes('com.instagram.android')) return 'instagram';
  if (r.includes('google.') || r.includes('googleadservices') || r.includes('googleads') || r.includes('com.google.android.googlequicksearchbox') || r.includes('com.google.android.youtube')) return 'google';
  if (r.includes('naver.com') || r.includes('naver.net') || r.includes('com.nhn.android.naversearch')) return 'naver';
  if (r.includes('kakao.com') || r.includes('kakaocdn.net') || r.includes('kakaocorp.com') || r.includes('com.kakao.talk')) return 'kakao';
  if (r.includes('youtube.com') || r.includes('youtu.be')) return 'youtube';
  if (r.includes('twitter.com') || r.includes('t.co') || r.includes('x.com')) return 'twitter';
  if (r.includes('tiktok.com') || r.includes('com.zhiliaoapp.musically')) return 'tiktok';
  if (r.includes('linkedin.com')) return 'linkedin';
  if (r.includes('bing.com')) return 'bing';
  if (r.includes('yahoo.com') || r.includes('search.yahoo')) return 'yahoo';

  return 'referral'; // 기타 외부 링크
}

/**
 * UTM 파라미터 및 광고 클릭 식별자(fbclid, gclid 등)를 파싱하고 유입 채널을 localStorage에 저장합니다.
 * 정보가 없어도 referrer 기반 자동 감지로 항상 저장합니다.
 * 광고 유입 정보가 발견되면 기존 데이터를 덮어씁니다 (광고 클릭 우선).
 */
export function captureTrackingData(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  
  // 1. UTM 파라미터 추출
  let utmSource = urlParams.get('utm_source') || undefined;
  const utmMedium = urlParams.get('utm_medium') || undefined;
  const utmCampaign = urlParams.get('utm_campaign') || undefined;

  // 2. 자동 광고 클릭 식별자(Click ID)가 있는 경우, UTM 파라미터가 없어도 매체 자동 판별
  if (!utmSource) {
    if (urlParams.has('fbclid')) {
      utmSource = 'facebook';
    } else if (urlParams.has('gclid') || urlParams.has('gbraid') || urlParams.has('wbraid')) {
      utmSource = 'google';
    } else if (urlParams.has('ttclid')) {
      utmSource = 'tiktok';
    }
  }

  const hasUtmOrClickId = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid'].some(p => urlParams.has(p));
  const detectedSource = utmSource || detectSourceFromReferrer(referrer);

  const trackingData: TrackingData = {
    utmSource,
    utmMedium: utmMedium || (urlParams.has('fbclid') || urlParams.has('gclid') || urlParams.has('gbraid') || urlParams.has('wbraid') ? 'cpc' : undefined),
    utmCampaign: utmCampaign || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
    landingPage: window.location.pathname,
    referrer: referrer || undefined,
    detectedSource, // 항상 설정됨: 'facebook' | 'google' | 'instagram' | 'direct' | ...
    timestamp: Date.now(),
  };

  // UTM 파라미터나 광고 클릭 식별자가 있거나, 저장된 데이터가 없을 때만 덮어씀
  // (광고를 통한 재방문 시 기존 광고 attribution 보존)
  const existing = localStorage.getItem(TRACKING_COOKIE_NAME);
  if (hasUtmOrClickId || !existing) {
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
  if (window.location.search.includes('simulation=true')) return;
  
  try {
    const today = getKstDateString();
    const localKey = 'etr_last_visit_date';
    if (localStorage.getItem(localKey) === today) return;

    const statRef = doc(db, 'daily_stats', today);
    
    // 최종 확정 채널명 사용
    const source = getEffectiveSource();
    const safeSource = source.replace(/[.#$/[\]]/g, '_');

    await setDoc(statRef, { 
      visitCount: increment(1),
      [`sourceVisits.${safeSource}`]: increment(1)
    }, { merge: true });
    
    localStorage.setItem(localKey, today);
  } catch (error) {
    console.error('Error logging visit:', error);
  }
}

/**
 * 사용자가 언어를 선택했을 때 해당 언어의 방문을 기록합니다.
 * 하루에 한 번만 기록되도록 로컬 스토리지 체크를 포함합니다.
 */
export async function logLanguageVisit(lang: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.location.search.includes('simulation=true')) return;
  
  try {
    const today = getKstDateString();
    const localKey = `etr_last_lang_visit_${lang}_date`;
    if (localStorage.getItem(localKey) === today) return;

    const statRef = doc(db, 'daily_stats', today);
    
    // 언어 코드 안전화 (ko, vi, zh 등)
    const safeLang = lang.replace(/[.#$/[\]]/g, '_');

    await setDoc(statRef, { 
      [`languageVisits.${safeLang}`]: increment(1)
    }, { merge: true });

    localStorage.setItem(localKey, today);
  } catch (error) {
    console.error('Error logging language visit:', error);
  }
}

/**
 * PWA 설치 완료 이벤트를 기록합니다.
 * daily_stats에 pwaInstallCount를 증가시키고, pwa_installs 컬렉션에 로그를 개별 생성합니다.
 */
export async function logPwaInstall(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.location.search.includes('simulation=true')) return;
  
  try {
    const today = getKstDateString();
    const statRef = doc(db, 'daily_stats', today);
    
    // daily_stats 누적 카터 증가
    await setDoc(statRef, { 
      pwaInstallCount: increment(1)
    }, { merge: true });

    // 개별 설치 로그 기록
    const installsRef = doc(collection(db, 'pwa_installs'));
    await setDoc(installsRef, {
      installedAt: new Date().toISOString(),
      userAgent: navigator.userAgent || 'Unknown',
      platform: navigator.platform || 'Unknown',
      applicationId: sessionStorage.getItem('myApplicationId') || null,
      utmSource: getEffectiveSource()
    });
  } catch (error) {
    console.error('Error logging PWA install:', error);
  }
}

