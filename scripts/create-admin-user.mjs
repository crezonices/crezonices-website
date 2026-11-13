import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const projectId = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const email = process.argv[2] || 'phoenix@gmail.com';

if (!email) {
  console.error('Error: Email address required.');
  process.exit(1);
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);

async function run() {
  console.log(`Checking Firebase Authentication records for: ${email} (Project: ${projectId})...`);

  let existingUser = null;
  try {
    existingUser = await auth.getUserByEmail(email);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      console.error('Error checking user record:', err.message);
      process.exit(1);
    }
  }

  if (existingUser) {
    console.log(`User already exists in Firebase Auth: UID = ${existingUser.uid}`);
    console.log(`Existing claims:`, existingUser.customClaims || {});

    // Ensure admin claim is assigned
    if (!existingUser.customClaims?.admin) {
      console.log('Assigning administrator custom claims...');
      await auth.setCustomUserClaims(existingUser.uid, {
        ...(existingUser.customClaims || {}),
        admin: true,
      });
      console.log('[SUCCESS] Administrator privileges assigned to existing user.');
    } else {
      console.log('[INFO] User already possesses active administrator privileges.');
    }
    return;
  }

  // User does not exist, generate a strong temporary password
  // (Min 16 chars with uppercase, lowercase, numbers, symbols)
  const randomSegment = crypto.randomBytes(12).toString('base64url');
  const tempPassword = `Cz#9!${randomSegment}$X1`;

  console.log('Creating new administrator user in Firebase Authentication...');
  const newUser = await auth.createUser({
    email,
    password: tempPassword,
    emailVerified: false,
    displayName: 'Phoenix Administrator',
    disabled: false,
  });

  console.log(`User created successfully with UID: ${newUser.uid}`);

  // Set administrator custom claims + tempPassword flag enforcing first-login reset
  await auth.setCustomUserClaims(newUser.uid, {
    admin: true,
    tempPassword: true,
  });

  // Securely persist temporary credentials to local gitignored file
  const credsDir = path.resolve(process.cwd(), '.credentials');
  if (!fs.existsSync(credsDir)) {
    fs.mkdirSync(credsDir, { recursive: true });
  }

  const credFilePath = path.join(credsDir, 'admin-initial-credentials.secret');
  const secretContent = [
    `# ==============================================================`,
    `# CREZONICES ADMINISTRATOR INITIAL CREDENTIALS (DO NOT COMMIT)`,
    `# Generated at: ${new Date().toISOString()}`,
    `# ==============================================================`,
    `EMAIL=${email}`,
    `TEMPORARY_PASSWORD=${tempPassword}`,
    `UID=${newUser.uid}`,
    `STATUS=MUST_CHANGE_ON_FIRST_LOGIN`,
    `# Instructions: Sign in at /admin/login using this temporary password.`,
    `# You will be prompted to set your personal permanent password.`,
    `# Once changed, delete this file.`,
  ].join('\n');

  fs.writeFileSync(credFilePath, secretContent, { mode: 0o600 });

  console.log('[SUCCESS] Administrator account established successfully.');
  console.log(`[SECURE] Temporary credentials written to local file: ${credFilePath}`);
  console.log('[SECURITY NOTE] Password was NOT logged to console or git.');
}

run().catch((err) => {
  console.error('Fatal execution error:', err.message);
  process.exit(1);
});
