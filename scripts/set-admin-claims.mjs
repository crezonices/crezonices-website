
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.GCLOUD_PROJECT;
const email = process.argv[2];

if (!projectId || !email) {
  console.error(
    "Usage: Set GCLOUD_PROJECT and provide an admin email."
  );
  process.exit(1);
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

const auth = getAuth(app);

try {
  const user = await auth.getUserByEmail(email);

  const existingClaims = user.customClaims || {};

  await auth.setCustomUserClaims(user.uid, {
    ...existingClaims,
    admin: true,
  });

  console.log(`Admin privilege assigned to: ${user.email}`);
  console.log(`UID: ${user.uid}`);
} catch (error) {
  console.error("Could not assign admin privilege:", error.message);
  process.exitCode = 1;
}
