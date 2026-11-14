import { describe, it, expect } from 'vitest';
import { getApiUrl } from '../lib/api';

describe('API URL Generator', () => {
  it('correctly defaults to relative path without base URL', () => {
    expect(getApiUrl('/api/drive/upload')).toBe('/api/drive/upload');
    expect(getApiUrl('api/auth/google/url')).toBe('/api/auth/google/url');
    expect(getApiUrl('/api/email/send')).toBe('/api/email/send');
  });

  it('guarantees leading slash on path', () => {
    expect(getApiUrl('health')).toBe('/health');
    expect(getApiUrl('/health')).toBe('/health');
  });
});
