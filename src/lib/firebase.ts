import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, disableNetwork } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key-for-simulation",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "easy-tax-refund",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
};

const isSimulationMode = typeof window !== 'undefined' && (
  window.location.search.includes('simulation=true') ||
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
);

// 항상 올바른 Firebase 앱과 Firestore 인스턴스를 초기화하여 doc() 함수 검증 에러를 예방합니다.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

if (isSimulationMode) {
  // 시뮬레이션 모드일 때는 네트워크 연결을 비활성화하여 오프라인으로만 실행되게 합니다.
  // 이로 인해 콘솔 에러가 발생하지 않으며 모든 SDK 호출이 에러 없이 정상 바이패스됩니다.
  disableNetwork(db).catch((err) => {
    console.warn("Failed to disable Firestore network in simulation mode:", err);
  });
}
