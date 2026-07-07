const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, orderBy, query } = require('firebase/firestore');
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

async function checkChat() {
  const appId = 'hnIhfI6XUiqmDDOIwURg';
  try {
    const chatRef = collection(db, 'applications', appId, 'chat_messages');
    const q = query(chatRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Total Chat Messages for ${appId}: ${querySnapshot.size}\n`);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const dateStr = data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'N/A';
      console.log(`[${dateStr}] ${data.sender}: ${data.text || data.message || JSON.stringify(data)}`);
    });
  } catch (err) {
    console.error("Error reading chat:", err);
  }
}

checkChat().then(() => process.exit(0));
