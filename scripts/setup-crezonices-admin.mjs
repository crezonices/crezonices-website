import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const projectId = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const targetEmail = 'crezonices@gmail.com';

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  console.log(`[INIT] Running administrator setup for: ${targetEmail} on project ${projectId}...`);

  let userRecord = null;
  try {
    userRecord = await auth.getUserByEmail(targetEmail);
    console.log(`[EXISTS] User ${targetEmail} found with UID: ${userRecord.uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`[CREATE] User ${targetEmail} not found, creating new account...`);
    } else {
      console.error('[ERROR] Failed to query user record:', err.message);
      process.exit(1);
    }
  }

  // Generate a cryptographically strong temporary password
  // (20 characters: mixed case, numbers, symbols)
  const randomSegment = crypto.randomBytes(14).toString('base64url');
  const tempPassword = `Cz#9!${randomSegment}$A2`;

  if (!userRecord) {
    userRecord = await auth.createUser({
      email: targetEmail,
      password: tempPassword,
      displayName: 'Crezonices Administrator',
      emailVerified: false,
      disabled: false,
    });
    console.log(`[SUCCESS] Created Firebase Auth user with UID: ${userRecord.uid}`);
  } else {
    // Update existing user with secure temporary password
    await auth.updateUser(userRecord.uid, {
      password: tempPassword,
      displayName: userRecord.displayName || 'Crezonices Administrator',
      disabled: false,
    });
    console.log(`[SUCCESS] Updated credentials for UID: ${userRecord.uid}`);
  }

  // Assign admin custom claim + temporary password flag
  const existingClaims = userRecord.customClaims || {};
  await auth.setCustomUserClaims(userRecord.uid, {
    ...existingClaims,
    admin: true,
    role: 'superadmin',
    tempPassword: true,
  });
  console.log(`[SUCCESS] Assigned custom claims { admin: true, role: 'superadmin', tempPassword: true }`);

  // Write administrator document to Firestore 'admins/{uid}'
  const adminDocRef = db.collection('admins').doc(userRecord.uid);
  await adminDocRef.set(
    {
      uid: userRecord.uid,
      email: targetEmail,
      displayName: 'Crezonices Administrator',
      role: 'superadmin',
      status: 'active',
      mustChangePassword: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'system-initialization',
    },
    { merge: true }
  );
  console.log(`[SUCCESS] Synchronized Firestore document: admins/${userRecord.uid}`);

  // Also ensure phoenix@gmail.com has its document in admins collection
  try {
    const phoenix = await auth.getUserByEmail('phoenix@gmail.com');
    await db.collection('admins').doc(phoenix.uid).set(
      {
        uid: phoenix.uid,
        email: phoenix.email,
        displayName: 'Phoenix Admin (Predecessor)',
        role: 'admin',
        status: 'active',
        mustChangePassword: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: 'system-initialization',
      },
      { merge: true }
    );
    console.log(`[BACKUP] Registered predecessor administrator in admins/${phoenix.uid}`);
  } catch {
    // ignore if phoenix not found
  }

  // Securely write credentials to local gitignored secret file
  const credsDir = path.resolve(process.cwd(), '.credentials');
  if (!fs.existsSync(credsDir)) {
    fs.mkdirSync(credsDir, { recursive: true });
  }

  const credFilePath = path.join(credsDir, 'admin-crezonices-credentials.secret');
  const secretContent = [
    `# ==============================================================`,
    `# CREZONICES PRIMARY ADMINISTRATOR CREDENTIALS (DO NOT COMMIT)`,
    `# Generated at: ${new Date().toISOString()}`,
    `# ==============================================================`,
    `EMAIL=${targetEmail}`,
    `TEMPORARY_PASSWORD=${tempPassword}`,
    `UID=${userRecord.uid}`,
    `STATUS=MUST_CHANGE_ON_FIRST_LOGIN`,
    `# Instructions: Sign in at /admin/login using this temporary password.`,
    `# You will be prompted to set your personal permanent password.`,
  ].join('\n');

  fs.writeFileSync(credFilePath, secretContent, { mode: 0o600 });
  console.log(`[SECURE] Temporary credentials saved to local file: ${credFilePath}`);
  console.log(`[SECURITY] Temporary password was NOT logged to console or committed.`);
}

run().catch((err) => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
