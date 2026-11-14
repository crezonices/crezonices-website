import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const target = process.argv[2];
const roleArg = process.argv[3] || 'admin';
const actionArg = process.argv[4] || 'grant'; // 'grant' or 'revoke'

if (!target) {
  console.error('Usage: node scripts/set-admin-claims.mjs <email_or_uid> [role=admin|superadmin] [action=grant|revoke]');
  process.exit(1);
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  let user;
  if (target.includes('@')) {
    user = await auth.getUserByEmail(target);
  } else {
    user = await auth.getUser(target);
  }

  const isGrant = actionArg === 'grant';
  const existingClaims = user.customClaims || {};

  await auth.setCustomUserClaims(user.uid, {
    ...existingClaims,
    admin: isGrant,
    role: isGrant ? roleArg : 'revoked',
  });

  // Update Firestore record
  await db.collection('admins').doc(user.uid).set(
    {
      uid: user.uid,
      email: user.email,
      role: isGrant ? roleArg : 'revoked',
      status: isGrant ? 'active' : 'suspended',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`[SUCCESS] Admin privilege ${isGrant ? 'granted to' : 'revoked from'}: ${user.email} (UID: ${user.uid})`);
}

run().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
