import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const email = process.argv[2] || 'phoenix@gmail.com';

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);

async function run() {
  const user = await auth.getUserByEmail(email);
  const currentClaims = user.customClaims || {};

  await auth.setCustomUserClaims(user.uid, {
    admin: true,
    tempPassword: false,
  });

  console.log(`[SUCCESS] Temporary password requirement cleared for: ${user.email} (UID: ${user.uid})`);
  console.log(`Updated claims:`, { admin: true, tempPassword: false });
}

run().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
