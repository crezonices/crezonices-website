import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const target = process.argv[2] || 'crezonices@gmail.com';

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  let userRecord;
  if (target.includes('@')) {
    userRecord = await auth.getUserByEmail(target);
  } else {
    userRecord = await auth.getUser(target);
  }

  const currentClaims = userRecord.customClaims || {};
  await auth.setCustomUserClaims(userRecord.uid, {
    ...currentClaims,
    admin: true,
    tempPassword: false,
  });

  // Update Firestore admins record
  const adminDocRef = db.collection('admins').doc(userRecord.uid);
  await adminDocRef.set(
    {
      mustChangePassword: false,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`[SUCCESS] Temporary password requirement cleared for: ${userRecord.email} (UID: ${userRecord.uid})`);
  console.log(`[SUCCESS] Updated claims:`, { ...currentClaims, admin: true, tempPassword: false });
}

run().catch((err) => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
