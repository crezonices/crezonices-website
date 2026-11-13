import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Application Security & Firebase Rules Audit', () => {
  it('enforces strict CSP and security headers in firebase.json', () => {
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    const content = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));

    expect(content.hosting).toBeDefined();
    expect(content.hosting.headers).toBeDefined();

    const globalHeaders = content.hosting.headers.find((h: any) => h.source === '**');
    expect(globalHeaders).toBeDefined();

    const headerKeys = globalHeaders.headers.map((h: any) => h.key);
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('Content-Security-Policy');

    const csp = globalHeaders.headers.find((h: any) => h.key === 'Content-Security-Policy').value;
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('verifies firestore.rules protects administrative documents and enforces auth', () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    expect(rules).toContain("rules_version = '2'");
    expect(rules).toContain('request.auth != null');
    expect(rules).toContain('match /{document=**} { allow read, write: if false; }');
  });

  it('verifies storage.rules enforces file size and safe MIME types', () => {
    const storagePath = path.resolve(__dirname, '../../storage.rules');
    const rules = fs.readFileSync(storagePath, 'utf8');

    expect(rules).toContain('5 * 1024 * 1024');
    expect(rules).toContain('image/(jpeg|png|webp)');
  });
});
