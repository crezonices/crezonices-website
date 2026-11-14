import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ============================================================================
// 1. CONFIGURATION & DIRECTORIES
// ============================================================================

const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'crezonices-2026';
const GOOGLE_DRIVE_ACCOUNT = 'crezonices@gmail.com';
const MAIN_DRIVE_FOLDER_ID = '1ryzD2gXWu5xW4qybIGePyZAu0iL_Etbw';
const MAIN_DRIVE_FOLDER_NAME = 'CREZONICES_WEBSITE_ASSETS';

const KNOWN_SUBFOLDERS = [
  'Project Logos',
  'Project Images',
  'Testimonials',
  'Product Images',
  'Directors & Team',
  'Service Images',
  'Other Website Images',
];

const credentialsDir = path.join(projectRoot, '.credentials');
if (!fs.existsSync(credentialsDir)) {
  fs.mkdirSync(credentialsDir, { recursive: true });
}

const tokensFilePath = path.join(credentialsDir, 'google-drive-tokens.json');
const oauthSecretPath = path.join(credentialsDir, 'google-oauth.secret');
const emailSecretPath = path.join(credentialsDir, 'email.secret');

// Helper to parse key=value lines from secret files
function loadSecretFile(filePath) {
  const result = {};
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    raw.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        result[k] = v;
      }
    });
  }
  return result;
}

const oauthSecrets = loadSecretFile(oauthSecretPath);
const emailSecrets = loadSecretFile(emailSecretPath);

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || oauthSecrets.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || oauthSecrets.GOOGLE_CLIENT_SECRET || '';

// Production redirect URI must be explicitly configured via env or secret file.
// In development, localhost is permitted as a local test fallback.
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  oauthSecrets.GOOGLE_REDIRECT_URI ||
  (IS_PRODUCTION ? '' : `http://localhost:${PORT}/api/auth/google/callback`);

const REDIRECT_URI = GOOGLE_REDIRECT_URI;

// ============================================================================
// 2. FIREBASE ADMIN SDK INITIALIZATION
// ============================================================================

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: applicationDefault(),
        projectId: GCLOUD_PROJECT,
      });

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ============================================================================
// 3. GOOGLE OAUTH CLIENT
// ============================================================================

function createOAuthClient() {
  if (!REDIRECT_URI) {
    throw new Error('GOOGLE_REDIRECT_URI is not configured.');
  }
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
}

async function getStoredTokens() {
  // 1. Check Firestore systemConfig collection
  try {
    const snap = await db.collection('systemConfig').doc('googleDriveTokens').get();
    if (snap.exists) {
      const data = snap.data();
      if (data && (data.refresh_token || data.access_token)) {
        return data;
      }
    }
  } catch (err) {
    // Firestore might be offline or initializing
  }

  // 2. Check local credentials file (fallback/local dev cache)
  if (fs.existsSync(tokensFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tokensFilePath, 'utf-8'));
      return data;
    } catch {
      return null;
    }
  }
  return null;
}

async function saveTokens(tokens) {
  const existing = (await getStoredTokens()) || {};
  const merged = { ...existing, ...tokens, updatedAt: new Date().toISOString() };

  // 1. Persist to Firestore for cloud/serverless persistence
  try {
    await db.collection('systemConfig').doc('googleDriveTokens').set(merged, { merge: true });
  } catch (err) {
    console.warn('[Crezonices Backend] Failed to write tokens to Firestore:', err.message);
  }

  // 2. Persist to local cache file if filesystem is writable
  try {
    fs.writeFileSync(tokensFilePath, JSON.stringify(merged, null, 2), {
      mode: 0o600,
    });
  } catch (err) {
    // Ignore in read-only container environments
  }

  return merged;
}

async function getAuthorizedClient() {
  const tokens = await getStoredTokens();
  if (!tokens || (!tokens.refresh_token && !tokens.access_token)) {
    throw new Error('Google Drive account is not authorized yet. Please complete OAuth authorization.');
  }

  const client = createOAuthClient();
  client.setCredentials(tokens);

  // If token is close to expiry or expired, refresh it
  if (tokens.expiry_date && tokens.expiry_date <= Date.now() + 60000 && tokens.refresh_token) {
    const { credentials } = await client.refreshAccessToken();
    await saveTokens(credentials);
    client.setCredentials(credentials);
  }

  return client;
}

// In-memory cache for folder IDs to reduce API queries
const folderIdCache = new Map();

async function resolveSubfolderId(client, folderName) {
  if (folderIdCache.has(folderName)) {
    return folderIdCache.get(folderName);
  }

  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;

  // Query subfolder inside main folder
  const query = encodeURIComponent(
    `'${MAIN_DRIVE_FOLDER_ID}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to query Google Drive folder "${folderName}": ${errText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    const id = data.files[0].id;
    folderIdCache.set(folderName, id);
    return id;
  }

  // Create subfolder under main folder if it does not exist
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [MAIN_DRIVE_FOLDER_ID],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Drive subfolder "${folderName}": ${errText}`);
  }

  const created = await createRes.json();
  folderIdCache.set(folderName, created.id);
  return created.id;
}

// ============================================================================
// 4. EXPRESS APP & MIDDLEWARES
// ============================================================================

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer memory storage (Max 5MB per image)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Middleware: Authenticate Firebase Administrator
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    const isAdmin =
      decoded.admin === true ||
      decoded.role === 'superadmin' ||
      decoded.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Administrator privileges required.' });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

// In-memory rate limiter for contact submissions (max 5 per hour per IP)
const ipRateLimits = new Map();
function rateLimitEnquiries(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  const record = ipRateLimits.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  ipRateLimits.set(ip, record);

  if (record.count > 5) {
    return res.status(429).json({
      error: 'Submission rate limit reached. Please wait before submitting another message.',
    });
  }
  next();
}

// ============================================================================
// 5. OAUTH ENDPOINTS (Phase 3 & 4)
// ============================================================================

/**
 * GET /api/auth/google/url
 * Returns the OAuth2 consent URL for crezonices@gmail.com
 */
app.get('/api/auth/google/url', (req, res) => {
  if (!REDIRECT_URI) {
    return res.status(400).json({
      error: 'Google OAuth Redirect URI is not configured for production.',
      code: 'MISSING_REDIRECT_URI',
      instructions:
        'Please configure GOOGLE_REDIRECT_URI in your environment variables or in .credentials/google-oauth.secret with your production HTTPS callback URL (e.g. https://<backend-domain>/api/auth/google/callback).',
    });
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({
      error: 'Google OAuth credentials not configured in backend.',
      code: 'MISSING_CLIENT_CREDENTIALS',
      redirectUri: REDIRECT_URI,
      instructions:
        'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .credentials/google-oauth.secret or environment variables.',
    });
  }

  try {
    const client = createOAuthClient();
    const returnTo = req.query.returnTo || req.headers.referer || '/admin/settings';
    const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64url');

    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      login_hint: GOOGLE_DRIVE_ACCOUNT,
      state,
    });

    res.json({
      url,
      redirectUri: REDIRECT_URI,
      account: GOOGLE_DRIVE_ACCOUNT,
      clientIdConfigured: true,
      redirectUriConfigured: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback and exchanges code for refresh token
 */
app.get('/api/auth/google/callback', async (req, res) => {
  const { code, error, state } = req.query;

  let returnTo = '/admin/settings';
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (
        parsed.returnTo &&
        (parsed.returnTo.startsWith('http://') ||
          parsed.returnTo.startsWith('https://') ||
          parsed.returnTo.startsWith('/'))
      ) {
        returnTo = parsed.returnTo;
      }
    } catch {}
  }

  if (error) {
    return res.status(400).send(`
      <html>
        <body style="font-family: sans-serif; background: #0A131C; color: #f87171; padding: 40px; text-align: center;">
          <h2>Google Authorization Denied or Failed</h2>
          <p>${error}</p>
          <a href="${returnTo}" style="color: #38bdf8;">Return to Admin Dashboard</a>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code.');
  }

  if (!REDIRECT_URI) {
    return res.status(400).send('OAuth Redirect URI is not configured on the backend.');
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    await saveTokens(tokens);

    // Verify access to main Drive folder
    client.setCredentials(tokens);
    const tokenRes = await client.getAccessToken();
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${MAIN_DRIVE_FOLDER_ID}?fields=id,name`,
      { headers: { Authorization: `Bearer ${tokenRes.token}` } }
    );

    const folderCheckOk = checkRes.ok;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Drive Connected · Crezonices</title>
          <meta http-equiv="refresh" content="3;url=${returnTo}">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #0A131C;
              color: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: rgba(18, 32, 46, 0.85);
              border: 1px solid rgba(56, 189, 248, 0.4);
              border-radius: 12px;
              padding: 36px;
              max-width: 480px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            }
            h1 { color: #38bdf8; font-size: 20px; margin-bottom: 12px; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
            .badge {
              display: inline-block;
              background: rgba(16, 185, 129, 0.2);
              color: #34d399;
              padding: 4px 12px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            .btn {
              display: inline-block;
              margin-top: 24px;
              background: #38bdf8;
              color: #030712;
              padding: 10px 20px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Connection Successful</span>
            <h1>Google Drive Connected to Crezonices</h1>
            <p>
              Account <strong>${GOOGLE_DRIVE_ACCOUNT}</strong> has authorized asset uploads to folder
              <strong>${MAIN_DRIVE_FOLDER_NAME}</strong> (${MAIN_DRIVE_FOLDER_ID}).
            </p>
            <p style="font-size: 12px; color: #64748b;">
              Folder Access Verified: <strong>${folderCheckOk ? 'YES (Active)' : 'Requires Sharing Permission'}</strong>
            </p>
            <p style="font-size: 11px; color: #38bdf8; margin-top: 16px;">
              Redirecting back to Admin Settings in 3 seconds...
            </p>
            <a href="${returnTo}" class="btn">Return to Admin Dashboard</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; background: #0A131C; color: #f87171; padding: 40px; text-align: center;">
          <h2>Failed to Complete OAuth Authorization</h2>
          <p>${err.message}</p>
          <a href="${returnTo}" style="color: #38bdf8;">Return to Admin Dashboard</a>
        </body>
      </html>
    `);
  }
});

/**
 * GET /api/auth/google/status
 * Returns current OAuth status, account, and folder accessibility
 */
app.get('/api/auth/google/status', async (req, res) => {
  const tokens = await getStoredTokens();
  const hasTokens = !!tokens && (!!tokens.refresh_token || !!tokens.access_token);

  let folderAccessible = false;
  let subfolders = [];
  let testError = null;

  if (hasTokens && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && REDIRECT_URI) {
    try {
      const client = await getAuthorizedClient();
      const tokenRes = await client.getAccessToken();

      // Check main folder
      const checkRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${MAIN_DRIVE_FOLDER_ID}?fields=id,name,mimeType,capabilities`,
        { headers: { Authorization: `Bearer ${tokenRes.token}` } }
      );

      if (checkRes.ok) {
        folderAccessible = true;

        // List existing subfolders
        const subRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${MAIN_DRIVE_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)`,
          { headers: { Authorization: `Bearer ${tokenRes.token}` } }
        );

        if (subRes.ok) {
          const subData = await subRes.json();
          subfolders = subData.files || [];
        }
      } else {
        const errJson = await checkRes.json().catch(() => ({}));
        testError = errJson.error?.message || `HTTP ${checkRes.status}`;
      }
    } catch (err) {
      testError = err.message;
    }
  }

  res.json({
    connected: hasTokens && folderAccessible,
    account: GOOGLE_DRIVE_ACCOUNT,
    mainFolderId: MAIN_DRIVE_FOLDER_ID,
    mainFolderName: MAIN_DRIVE_FOLDER_NAME,
    folderAccessible,
    subfolders: subfolders.map((s) => s.name),
    configuredSubfolders: KNOWN_SUBFOLDERS,
    clientIdConfigured: !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET,
    redirectUri: REDIRECT_URI || null,
    redirectUriConfigured: Boolean(REDIRECT_URI),
    isProduction: IS_PRODUCTION,
    error: testError,
  });
});

// ============================================================================
// 6. GOOGLE DRIVE IMAGE UPLOAD & SERVING (Phase 2 & 3)
// ============================================================================

/**
 * POST /api/drive/upload
 * Protected endpoint for authenticated administrators to upload images to Drive
 */
app.post('/api/drive/upload', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  const folderName = req.body.folder || 'Other Website Images';
  const file = req.file;

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file format. Only JPG, PNG, and WebP are supported.' });
  }

  // Validate magic bytes
  const buf = file.buffer;
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng =
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isWebp =
    buf.subarray(0, 4).toString() === 'RIFF' &&
    buf.subarray(8, 12).toString() === 'WEBP';

  if (!isJpg && !isPng && !isWebp) {
    return res.status(400).json({ error: 'File integrity check failed. Not a valid image.' });
  }

  try {
    const client = await getAuthorizedClient();
    const subfolderId = await resolveSubfolderId(client, folderName);
    const tokenRes = await client.getAccessToken();
    const token = tokenRes.token;

    // Use Google Drive multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: file.originalname,
      mimeType: file.mimetype,
      parents: [subfolderId],
    };

    const multipartRequestBody = Buffer.concat([
      Buffer.from(
        delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${file.mimetype}\r\n\r\n`
      ),
      file.buffer,
      Buffer.from(closeDelimiter),
    ]);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return res.status(500).json({ error: `Google Drive upload failed: ${errText}` });
    }

    const uploaded = await uploadRes.json();
    const fileId = uploaded.id;
    const servingUrl = `/api/drive/image/${fileId}`;

    // Store image metadata in Firestore
    await db.collection('imageMetadata').doc(fileId).set({
      fileId,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folderId: subfolderId,
      folderName,
      servingUrl,
      storageProvider: 'google-drive',
      uploadedBy: req.adminUser.email || req.adminUser.uid,
      uploadedAt: FieldValue.serverTimestamp(),
      references: [],
    });

    res.json({
      success: true,
      fileId,
      servingUrl,
      url: servingUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: folderName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/drive/image/:fileId
 * Secure backend image-serving mechanism with appropriate caching headers.
 * Streams image content from Google Drive API without exposing OAuth secrets.
 */
app.get('/api/drive/image/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const client = await getAuthorizedClient();
    const tokenRes = await client.getAccessToken();
    const token = tokenRes.token;

    // First fetch file metadata to determine MIME type
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!metaRes.ok) {
      return res.status(404).send('Image not found on Google Drive.');
    }

    const meta = await metaRes.json();
    const mimeType = meta.mimeType || 'image/jpeg';

    // Stream image binary content
    const streamRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!streamRes.ok) {
      return res.status(streamRes.status).send('Could not retrieve image data.');
    }

    // Set production caching headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const arrayBuffer = await streamRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send(`Image serving error: ${err.message}`);
  }
});

/**
 * DELETE /api/drive/image/:fileId
 * Safe deletion endpoint. Ensures image is not referenced in active content records before removing.
 */
app.delete('/api/drive/image/:fileId', requireAdmin, async (req, res) => {
  const { fileId } = req.params;

  try {
    const servingPattern = `/api/drive/image/${fileId}`;

    // Check collections for references
    const [projectsSnap, servicesSnap, reviewsSnap, teamSnap] = await Promise.all([
      db.collection('projects').where('logoUrl', '==', servingPattern).get(),
      db.collection('services').where('imageUrl', '==', servingPattern).get(),
      db.collection('reviews').where('imageUrl', '==', servingPattern).get(),
      db.collection('teamMembers').where('imageUrl', '==', servingPattern).get(),
    ]);

    const inUse =
      projectsSnap.size > 0 ||
      servicesSnap.size > 0 ||
      reviewsSnap.size > 0 ||
      teamSnap.size > 0;

    if (inUse) {
      return res.status(409).json({
        error:
          'Cannot delete image: this file is still actively referenced by one or more published content records.',
        references: {
          projects: projectsSnap.size,
          services: servicesSnap.size,
          reviews: reviewsSnap.size,
          team: teamSnap.size,
        },
      });
    }

    // Delete from Drive
    const client = await getAuthorizedClient();
    const tokenRes = await client.getAccessToken();
    const delRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenRes.token}` },
      }
    );

    // Remove metadata
    await db.collection('imageMetadata').doc(fileId).delete();

    res.json({ success: true, message: `Image ${fileId} deleted from Google Drive.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 7. CONTACT ENQUIRY & SERVER-SIDE EMAIL DISPATCH (Phase 5)
// ============================================================================

/**
 * POST /api/email/send
 * Saves enquiry in Firestore and dispatches email via configured provider
 */
app.post('/api/email/send', rateLimitEnquiries, async (req, res) => {
  const { name, email, subject, message, serviceNeeded, budgetRange, _hp } = req.body;

  // Bot honeypot check
  if (_hp) {
    return res.status(200).json({ success: true, message: 'Message logged.' });
  }

  // Validate fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // 1. Fetch official recipient email from siteSettings/contact
    let recipientEmail = 'crezonices@gmail.com';
    const settingsDoc = await db.collection('siteSettings').doc('contact').get();
    if (settingsDoc.exists && settingsDoc.data().email) {
      recipientEmail = settingsDoc.data().email;
    }

    // 2. Save enquiry in Firestore
    const enquiryRef = await db.collection('enquiries').add({
      name: name.trim().slice(0, 120),
      email: email.trim().slice(0, 255),
      serviceNeeded: (serviceNeeded || subject || 'General Consultation').trim().slice(0, 200),
      budgetRange: (budgetRange || 'Not specified').trim().slice(0, 100),
      message: message.trim().slice(0, 5000),
      status: 'new',
      emailDeliveryStatus: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Attempt email delivery via Resend API if configured
    const resendApiKey = process.env.RESEND_API_KEY || emailSecrets.RESEND_API_KEY;
    let emailSent = false;
    let deliveryNote = '';

    if (resendApiKey) {
      try {
        const fromAddress =
          process.env.EMAIL_FROM || emailSecrets.EMAIL_FROM || 'inquiries@crezonices.com';

        const emailPayload = {
          from: `Crezonices Inquiry Desk <${fromAddress}>`,
          to: [recipientEmail],
          reply_to: email,
          subject: `[Crezonices Inquiry] ${subject || serviceNeeded || 'New Client Message'} from ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A131C; color: #f1f5f9; border-radius: 8px;">
              <h2 style="color: #38bdf8; margin-top: 0;">New Transmission Received</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; color: #94a3b8; width: 140px;">Name:</td><td style="padding: 8px; font-weight: bold;">${name}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Email:</td><td style="padding: 8px;"><a href="mailto:${email}" style="color: #38bdf8;">${email}</a></td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Service:</td><td style="padding: 8px;">${serviceNeeded || subject || 'General'}</td></tr>
                <tr><td style="padding: 8px; color: #94a3b8;">Budget:</td><td style="padding: 8px;">${budgetRange || 'Not specified'}</td></tr>
              </table>
              <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 6px; margin-top: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #38bdf8;">Message:</h4>
                <p style="white-space: pre-wrap; margin: 0; line-height: 1.6;">${message}</p>
              </div>
              <p style="font-size: 11px; color: #64748b; margin-top: 24px;">Enquiry ID: ${enquiryRef.id} · Logged securely to Crezonices Firestore</p>
            </div>
          `,
        };

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        if (resendRes.ok) {
          emailSent = true;
          deliveryNote = 'Delivered to inbox via Resend';
        } else {
          const resendErr = await resendRes.text();
          deliveryNote = `Resend delivery failed: ${resendErr}`;
        }
      } catch (e) {
        deliveryNote = `Email transport error: ${e.message}`;
      }
    } else {
      deliveryNote =
        'Enquiry saved to Firestore. (Email provider credentials pending in .credentials/email.secret)';
    }

    // Update status in Firestore
    await enquiryRef.update({
      emailDeliveryStatus: emailSent ? 'delivered' : 'logged_pending_config',
      emailDeliveryNote: deliveryNote,
    });

    res.json({
      success: true,
      enquiryId: enquiryRef.id,
      emailSent,
      message: emailSent
        ? 'Thank you! Your message was delivered to our team.'
        : 'Thank you! Your inquiry was logged securely into our engineering queue.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Crezonices Backend] Server listening on port ${PORT} (NODE_ENV: ${IS_PRODUCTION ? 'production' : 'development'})`);
  console.log(`[Crezonices Backend] OAuth Redirect URI: ${REDIRECT_URI || '(NOT CONFIGURED - Set GOOGLE_REDIRECT_URI for production)'}`);
  console.log(`[Crezonices Backend] Google Drive Account: ${GOOGLE_DRIVE_ACCOUNT}`);
  console.log(`[Crezonices Backend] Google Drive Folder ID: ${MAIN_DRIVE_FOLDER_ID}`);
});
