import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';
import { company, navItems } from '../../config/site';
import { domains, services } from '../../data/content';

export function Footer() {
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
          <a href={`mailto:${company.email}`} className="footer-email-link">
            <Mail size={16} />
            <span>{company.email}</span>
          </a>
          <p className="footer-note">
            Headquartered for international research, digital development, and consulting collaborations.
          </p>
          <div className="footer-status-pill">
            <span className="status-dot-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <span>
            © {new Date().getFullYear()} Crezonices. All rights reserved. Architected for progress.
          </span>
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
