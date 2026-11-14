import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const projectId = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const email = process.argv[2];
const role = process.argv[3] || 'admin';

if (!email) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> [role=admin|superadmin]');
  process.exit(1);
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  console.log(`Checking Firebase Authentication records for: ${email}...`);

  let user = null;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`User already exists: UID = ${user.uid}`);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      console.error('Error querying user:', err.message);
      process.exit(1);
    }
  }

  const randomSegment = crypto.randomBytes(14).toString('base64url');
  const tempPassword = `Cz#9!${randomSegment}$X1`;

  if (!user) {
    user = await auth.createUser({
      email,
      password: tempPassword,
      emailVerified: false,
      displayName: `${email.split('@')[0]} Administrator`,
      disabled: false,
    });
    console.log(`[SUCCESS] Created new user with UID: ${user.uid}`);
  } else {
    await auth.updateUser(user.uid, {
      password: tempPassword,
      disabled: false,
    });
    console.log(`[SUCCESS] Updated existing user with UID: ${user.uid}`);
  }

  // Set administrator custom claims
  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    admin: true,
    role,
    tempPassword: true,
  });

  // Create Firestore admin metadata
  await db.collection('admins').doc(user.uid).set(
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || `${email.split('@')[0]} Administrator`,
      role,
      status: 'active',
      mustChangePassword: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'cli-admin-script',
    },
    { merge: true }
  );

  // Write temporary credentials to secure local file
  const credsDir = path.resolve(process.cwd(), '.credentials');
  if (!fs.existsSync(credsDir)) {
    fs.mkdirSync(credsDir, { recursive: true });
  }

  const credFile = path.join(credsDir, `admin-${email.replace(/[^a-zA-Z0-9]/g, '_')}.secret`);
  fs.writeFileSync(
    credFile,
    `EMAIL=${email}\nTEMPORARY_PASSWORD=${tempPassword}\nUID=${user.uid}\nSTATUS=MUST_CHANGE_ON_FIRST_LOGIN\n`,
    { mode: 0o600 }
  );

  console.log(`[SUCCESS] Admin account prepared. Credentials saved to: ${credFile}`);
  console.log(`[SECURITY] Temporary password was NOT logged to console.`);
}

run().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
