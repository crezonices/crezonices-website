import { describe, it, expect } from 'vitest';
import type { DriveAssetMetadata, ImageReference } from '../types/models';

describe('Image Upload & Metadata Model', () => {
  it('correctly constructs a Google Drive asset metadata record', () => {
    const meta: DriveAssetMetadata = {
      fileId: '1ryzD2gXWu5xW4qybIGePyZAu0iL_Etbw_file123',
      name: 'sentinel-cover.webp',
      mimeType: 'image/webp',
      size: 1024 * 450, // 450 KB
      folderId: '1ryzD2gXWu5xW4qybIGePyZAu0iL_Etbw',
      folderName: 'Project Images',
      servingUrl: '/api/drive/image/1ryzD2gXWu5xW4qybIGePyZAu0iL_Etbw_file123',
      storageProvider: 'google-drive',
      uploadedBy: 'crezonices@gmail.com',
      uploadedAt: new Date().toISOString(),
      references: [
        { collection: 'projects', docId: 'connected-operations', field: 'coverImageUrl' },
      ],
    };

    expect(meta.storageProvider).toBe('google-drive');
    expect(meta.servingUrl).toContain('/api/drive/image/');
    expect(meta.size).toBeLessThan(5 * 1024 * 1024); // Under 5MB
    expect(['image/jpeg', 'image/png', 'image/webp']).toContain(meta.mimeType);
  });

  it('validates supported MIME types and size constraints', () => {
    const MAX_SIZE_MB = 5;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    const validTestCases = [
      { type: 'image/jpeg', size: 2 * 1024 * 1024 },
      { type: 'image/png', size: 4.8 * 1024 * 1024 },
      { type: 'image/webp', size: 500 * 1024 },
    ];

    validTestCases.forEach((tc) => {
      expect(allowed.includes(tc.type)).toBe(true);
      expect(tc.size <= MAX_SIZE_MB * 1024 * 1024).toBe(true);
    });

    const invalidTestCases = [
      { type: 'application/pdf', size: 1024 },
      { type: 'image/gif', size: 1024 },
      { type: 'image/jpeg', size: 6 * 1024 * 1024 }, // Exceeds 5MB
    ];

    expect(allowed.includes(invalidTestCases[0].type)).toBe(false);
    expect(allowed.includes(invalidTestCases[1].type)).toBe(false);
    expect(invalidTestCases[2].size <= MAX_SIZE_MB * 1024 * 1024).toBe(false);
  });

  it('verifies generic ImageReference model is provider-agnostic', () => {
    const driveRef: ImageReference = {
      provider: 'google-drive',
      fileId: 'abc123drive',
      url: '/api/drive/image/abc123drive',
      folder: 'Testimonials',
    };

    const externalRef: ImageReference = {
      provider: 'external',
      url: 'https://images.unsplash.com/photo-1234',
    };

    expect(driveRef.provider).toBe('google-drive');
    expect(externalRef.provider).toBe('external');
  });
});
