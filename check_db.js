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

console.log("Connecting to Firebase Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
  try {
    const querySnapshot = await getDocs(collection(db, 'applications'));
    console.log("Total Applications Found in DB:", querySnapshot.size);
    
    let deletedCount = 0;
    let deletedFromDashboardCount = 0;
    let vipCount = 0;
    let vips = [];
    
    const docs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      docs.push({ id: doc.id, ...data });
      if (data.isDeleted === true) deletedCount++;
      if (data.deletedFromDashboard === true) deletedFromDashboardCount++;
      
      const preFilterEstimate = data.preFilterEstimate || 0;
      if (preFilterEstimate >= 400000) {
        vipCount++;
        vips.push({
          id: doc.id,
          fullName: data.fullName,
          preFilterEstimate: preFilterEstimate,
          estimatedRefundAmount: data.estimatedRefundAmount,
          isDeleted: data.isDeleted,
          deletedFromDashboard: data.deletedFromDashboard,
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'N/A'
        });
      }
    });
    
    console.log("-----------------------------------------");
    console.log(`Deleted applications (isDeleted === true): ${deletedCount}`);
    console.log(`Deleted from Dashboard (deletedFromDashboard === true): ${deletedFromDashboardCount}`);
    console.log(`VIP applications (preFilterEstimate >= 400000): ${vipCount}`);
    console.log("-----------------------------------------");
    
    if (vips.length > 0) {
      console.log("VIP List:");
      vips.forEach((v, index) => {
        console.log(`${index + 1}. ID: ${v.id}, Name: ${v.fullName}, Estimate: ${v.preFilterEstimate}, Refund: ${v.estimatedRefundAmount}, isDeleted: ${v.isDeleted}, deletedFromDashboard: ${v.deletedFromDashboard}, Date: ${v.createdAt}`);
      });
    } else {
      console.log("No VIPs found (preFilterEstimate >= 400000).");
    }
    
    console.log("-----------------------------------------");
    console.log("Sample of last 5 applications:");
    docs.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    docs.slice(0, 5).forEach((d) => {
      console.log(`ID: ${d.id}, Name: ${d.fullName}, preFilterEstimate: ${d.preFilterEstimate}, estimatedRefundAmount: ${d.estimatedRefundAmount}, isDeleted: ${d.isDeleted}, deletedFromDashboard: ${d.deletedFromDashboard}`);
    });
    
  } catch (err) {
    console.error("Error reading database:", err);
  }
}

checkDatabase().then(() => process.exit(0));
