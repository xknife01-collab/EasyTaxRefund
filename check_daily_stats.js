const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDailyStats() {
  try {
    const querySnapshot = await getDocs(collection(db, 'daily_stats'));
    console.log(`Total Daily Stats Records: ${querySnapshot.size}\n`);
    
    querySnapshot.forEach((doc) => {
      console.log(`=== STATS ID (Date): ${doc.id} ===`);
      console.log(JSON.stringify(doc.data(), null, 2));
      console.log("=========================================\n");
    });
  } catch (err) {
    console.error("Error reading daily_stats:", err);
  }
}

checkDailyStats().then(() => process.exit(0));
