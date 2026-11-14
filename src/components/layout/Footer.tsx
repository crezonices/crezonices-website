import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';
import { company, navItems } from '../../config/site';
import { domains, services } from '../../data/content';
import { useSiteSettings } from '../../features/content/usePublicContent';

export function Footer() {
  const settings = useSiteSettings();
  const contactEmail = settings.email || company.email;
  const copyrightText = settings.footerCopyright || `© ${new Date().getFullYear()} Crezonices. All rights reserved. Architected for progress.`;
  const social = settings.socialLinks || {};

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand & Statement Column */}
        <div className="footer-brand-col">
          <Logo inverted size="md" showName />
          <p className="footer-mission-text">
            {company.description ||
              'Engineering advanced software products, neural systems, and cybersecurity architectures for real-world impact.'}
          </p>
          <div className="footer-security-badge">
            <ShieldCheck size={16} className="text-cyan" />
            <span>Enterprise Security & Quality Standards</span>
          </div>
        </div>

        {/* Navigation Links Column */}
        <div className="footer-nav-col">
          <span className="eyebrow footer-col-title">Navigation</span>
          <ul className="footer-links-list">
            {navItems.map((x) => (
              <li key={x.href}>
                <Link to={x.href} className="footer-link">
                  {x.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Core Domains & Services Column */}
        <div className="footer-domains-col">
          <span className="eyebrow footer-col-title">Technology Focus</span>
          <ul className="footer-links-list">
            {domains.map((x) => (
              <li key={x.label}>
                <Link to="/about" className="footer-link">
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
          <span className="eyebrow footer-col-title footer-subheading">Services</span>
          <ul className="footer-links-list">
            {services.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link to="/services" className="footer-link">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Direct Outreach Column */}
        <div className="footer-connect-col">
          <span className="eyebrow footer-col-title">Communications</span>
          <a href={`mailto:${contactEmail}`} className="footer-email-link">
            <Mail size={16} />
            <span>{contactEmail}</span>
          </a>
          <p className="footer-note">
            Headquartered for international research, digital development, and consulting collaborations.
          </p>

          {/* Dynamic Social Links */}
          {(social.linkedin || social.github || social.twitter || social.instagram || social.youtube) && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '14px 0' }}>
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noreferrer" className="footer-link" style={{ fontSize: 13 }}>
                  LinkedIn ↗
                </a>
              )}
              {social.github && (
                <a href={social.github} target="_blank" rel="noreferrer" className="footer-link" style={{ fontSize: 13 }}>
                  GitHub ↗
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noreferrer" className="footer-link" style={{ fontSize: 13 }}>
                  Twitter / X ↗
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" className="footer-link" style={{ fontSize: 13 }}>
                  Instagram ↗
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noreferrer" className="footer-link" style={{ fontSize: 13 }}>
                  YouTube ↗
                </a>
              )}
            </div>
          )}

          <div className="footer-status-pill">
            <span className="status-dot-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <span>{copyrightText}</span>
          <div className="footer-bottom-links">
            <Link to="/about">About Us</Link>
            <span className="sep">·</span>
            <Link to="/services">Services</Link>
            <span className="sep">·</span>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
