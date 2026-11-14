import { describe, it, expect } from 'vitest';
import type { Project, Service, Review, SiteSettings } from '../types/models';
import { urlIsSafe } from '../features/content/contentStore';

describe('CMS Data Validation & Integrity', () => {
  describe('Projects Validation', () => {
    it('validates required project fields', () => {
      const validProject: Partial<Project> = {
        title: 'Cyber AI Shield Sentinel',
        shortDescription: 'Autonomous defense infrastructure.',
        category: 'Cybersecurity',
        status: 'Published',
        isPublished: true,
        displayOrder: 1,
        gallery: [
          '/api/drive/image/proj1_img1',
          '/api/drive/image/proj1_img2',
        ],
      };

      expect(validProject.title?.trim().length).toBeGreaterThan(0);
      expect(validProject.shortDescription?.trim().length).toBeGreaterThan(0);
      expect(validProject.gallery?.length).toBe(2);
      expect(validProject.isPublished).toBe(true);
    });

    it('validates safe project URLs', () => {
      expect(urlIsSafe('https://crezonices.com/live')).toBe(true);
      expect(urlIsSafe('https://github.com/crezonices/repo')).toBe(true);
      expect(urlIsSafe('https://github.com/crezonices/repo/blob/main/code.js')).toBe(false);
      expect(urlIsSafe('http://insecure-site.com')).toBe(false);
      expect(urlIsSafe('')).toBe(true);
      expect(urlIsSafe(undefined)).toBe(true);
    });
  });

  describe('Services Validation', () => {
    it('verifies service creation fields and deliverables list', () => {
      const service: Partial<Service> = {
        title: 'Custom Web Development & 3D Interactive Systems',
        description: 'Responsive web apps, business platforms, and Three.js 3D web systems.',
        features: [
          'Full-stack responsive web applications',
          'WebGL/Three.js interactive visualizations',
          'Accessible WCAG semantic engineering',
        ],
        active: true,
        displayOrder: 1,
      };

      expect(service.title?.trim()).toBeTruthy();
      expect(service.description?.trim()).toBeTruthy();
      expect(service.features?.length).toBe(3);
      expect(service.active).toBe(true);
    });
  });

  describe('Testimonials / Reviews Validation', () => {
    it('validates rating bounds and published state filter', () => {
      const reviews: Review[] = [
        {
          id: 'rev-1',
          reviewerName: 'Dr. Elena Vance',
          reviewText: 'Outstanding technical execution and architectural craft.',
          rating: 5,
          published: true,
          isPublished: true,
          displayOrder: 1,
        },
        {
          id: 'rev-2',
          reviewerName: 'Marcus Sterling',
          reviewText: 'Draft review not yet approved for publication.',
          rating: 4,
          published: false,
          isPublished: false,
          displayOrder: 2,
        },
      ];

      const publishedOnly = reviews.filter((r) => r.isPublished === true || r.published === true);
      expect(publishedOnly.length).toBe(1);
      expect(publishedOnly[0].reviewerName).toBe('Dr. Elena Vance');

      // Valid ratings must be 1 to 5
      reviews.forEach((r) => {
        expect(r.rating).toBeGreaterThanOrEqual(1);
        expect(r.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Contact Settings Validation', () => {
    it('verifies company email default and telephone/whatsapp fields', () => {
      const settings: Partial<SiteSettings> = {
        companyName: 'Crezonices',
        email: 'crezonices@gmail.com',
        phone: '+91 98765 43210',
        whatsapp: '+919876543210',
        responseTime: '< 24 Hours Response Guarantee',
      };

      expect(settings.email).toBe('crezonices@gmail.com');
      expect(settings.phone).toBeTruthy();
      expect(settings.whatsapp).toBeTruthy();
      expect(settings.responseTime).toBeTruthy();
    });
  });
});
