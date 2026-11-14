import { describe, it, expect } from 'vitest';
// @ts-ignore
import { parseServiceAccountKey } from '../../server/server.mjs';

describe('Firebase Service Account Key Parser', () => {
  const sampleKey = {
    type: 'service_account',
    project_id: 'crezonices-2026',
    private_key_id: 'test_key_id_12345',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk@crezonices-2026.iam.gserviceaccount.com',
  };

  it('correctly parses raw unquoted JSON', () => {
    const raw = JSON.stringify(sampleKey);
    const parsed = parseServiceAccountKey(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.project_id).toBe('crezonices-2026');
    expect(parsed?.private_key).toContain('BEGIN PRIVATE KEY');
  });

  it('correctly parses JSON with extra whitespace and leading newlines', () => {
    const raw = `  \n\r  ${JSON.stringify(sampleKey, null, 2)}  \n\t `;
    const parsed = parseServiceAccountKey(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.project_id).toBe('crezonices-2026');
  });

  it('correctly parses JSON wrapped in outer double quotes', () => {
    const raw = JSON.stringify(JSON.stringify(sampleKey));
    const parsed = parseServiceAccountKey(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.project_id).toBe('crezonices-2026');
  });

  it('correctly parses JSON wrapped in outer single quotes', () => {
    const raw = `'${JSON.stringify(sampleKey)}'`;
    const parsed = parseServiceAccountKey(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.project_id).toBe('crezonices-2026');
  });

  it('correctly parses base64-encoded JSON', () => {
    const b64 = Buffer.from(JSON.stringify(sampleKey)).toString('base64');
    const parsed = parseServiceAccountKey(b64);
    expect(parsed).not.toBeNull();
    expect(parsed?.project_id).toBe('crezonices-2026');
  });

  it('correctly parses JSON containing escaped newlines (\\\\n) and normalizes private_key', () => {
    const sampleWithEscapedKey = {
      ...sampleKey,
      private_key: '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC...\\n-----END PRIVATE KEY-----\\n',
    };
    const raw = JSON.stringify(sampleWithEscapedKey);
    const parsed = parseServiceAccountKey(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.project_id).toBe('crezonices-2026');
    expect(parsed?.private_key).toContain('\n');
    expect(parsed?.private_key).not.toContain('\\n');
  });

  it('safely returns null for invalid string inputs without throwing', () => {
    expect(parseServiceAccountKey('unexpected token w')).toBeNull();
    expect(parseServiceAccountKey('random_text_123')).toBeNull();
    expect(parseServiceAccountKey('{ incomplete json')).toBeNull();
    expect(parseServiceAccountKey('{"type": "service_account"}')).toBeNull(); // Missing project_id / private_key
    expect(parseServiceAccountKey('')).toBeNull();
    expect(parseServiceAccountKey(null as any)).toBeNull();
    expect(parseServiceAccountKey(undefined as any)).toBeNull();
  });
});
