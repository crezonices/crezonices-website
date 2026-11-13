import { describe, it, expect } from 'vitest';
import { domains, founders, projects, services } from '../data/content';
import { navItems, company } from '../config/site';

describe('Crezonices Brand & Content Integrity', () => {
  it('strictly designates Executive Director and Managing Director', () => {
    expect(founders.length).toBeGreaterThanOrEqual(2);
    const designations = founders.map((f) => f.designation);
    expect(designations).toContain('Executive Director');
    expect(designations).toContain('Managing Director');
  });

  it('contains the six essential navigation items', () => {
    const labels = navItems.map((item) => item.label);
    expect(labels).toEqual(['Home', 'Projects', 'About Us', 'Services', 'Founders', 'Contact']);
  });

  it('defines the 3 core technology domains with required metadata', () => {
    expect(domains.length).toBe(3);
    const labels = domains.map((d) => d.label);
    expect(labels).toContain('IoT');
    expect(labels).toContain('Security');
    expect(labels).toContain('AI / ML');
  });

  it('provides comprehensive services with descriptions and features', () => {
    expect(services.length).toBeGreaterThanOrEqual(5);
    services.forEach((service) => {
      expect(service.title).toBeTruthy();
      expect(service.description).toBeTruthy();
      expect(service.features.length).toBeGreaterThan(0);
    });
  });

  it('maintains valid official email without placeholder text', () => {
    expect(company.email).toBe('crezonices@gmail.com');
  });

  it('has valid projects with slugs and categories', () => {
    projects.forEach((proj) => {
      expect(proj.slug).toBeTruthy();
      expect(proj.title).toBeTruthy();
      expect(proj.category).toBeTruthy();
    });
  });
});
