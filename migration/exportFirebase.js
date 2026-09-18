/**
 * migration/exportFirebase.js
 * Phase 1: Extracts vehicles, bookings, and profiles from Firebase Firestore
 * and saves them as JSON files in migration/data/
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { firebaseConfig } = require('../firebaseConfig');

async function exportCollection(db, collectionName) {
  console.log(`📡 Exporting collection: "${collectionName}"...`);
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  const records = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    // Convert Firestore Timestamp to ISO string if applicable
    const serialized = { docId: docSnap.id };
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && typeof value.toDate === 'function') {
        serialized[key] = value.toDate().toISOString();
      } else {
        serialized[key] = value;
      }
    }
    records.push(serialized);
  });

  console.log(`  ✅ Extracted ${records.length} documents from "${collectionName}"`);
  return records;
}

async function main() {
  console.log('==============================================');
  console.log('🚀 RAPIDRENTAL FIREBASE DATA EXTRACTION');
  console.log('==============================================\n');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const collections = ['vehicles', 'bookings', 'profiles'];
  const summary = {};

  for (const col of collections) {
    try {
      const data = await exportCollection(db, col);
      summary[col] = data.length;
      const filePath = path.join(outputDir, `${col}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  💾 Saved to ${filePath}\n`);
    } catch (err) {
      console.error(`  ❌ Failed to export "${col}":`, err.message);
      summary[col] = 0;
      fs.writeFileSync(path.join(outputDir, `${col}.json`), '[]', 'utf-8');
    }
  }

  console.log('==============================================');
  console.log('📊 EXTRACTION SUMMARY:');
  console.log(`  - Vehicles: ${summary.vehicles} documents`);
  console.log(`  - Bookings: ${summary.bookings} documents`);
  console.log(`  - Profiles: ${summary.profiles} documents`);
  console.log('==============================================');

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal export error:', err);
  process.exit(1);
});
