import { motion } from 'motion/react';
import { Award, Globe, Mail, ShieldCheck, Sparkles, UserCheck, Cpu, Layers } from 'lucide-react';

type PageHeroKind = 'projects' | 'about' | 'services' | 'founders' | 'contact';

function resolveKind(eyebrow: string): PageHeroKind {
  const text = eyebrow.toLowerCase();
  if (text.includes('project')) return 'projects';
  if (text.includes('about')) return 'about';
  if (text.includes('service')) return 'services';
  if (text.includes('founder') || text.includes('people') || text.includes('team') || text.includes('leadership') || text.includes('director')) return 'founders';
  return 'contact';
}

/**
 * 2D Executive Leadership Visual for Founders Page.
 * Dignified, elegant, and corporate without distracting 3D clutter.
 */
function FoundersLeadershipVisual() {
  return (
    <div className="hero-visual-frame founders-crest-stage" aria-hidden="true">
      <div className="crest-orbital-ring crest-outer" />
      <div className="crest-orbital-ring crest-middle" />
      <div className="crest-center-plate glass-panel">
        <div className="crest-emblem-icon">
          <Award size={36} className="text-amber" />
        </div>
        <span className="crest-label">Executive Board</span>
        <div className="crest-dual-nodes">
          <span className="node-pill">
            <UserCheck size={12} /> Executive Director
          </span>
          <span className="node-pill">
            <ShieldCheck size={12} /> Managing Director
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * High-End Dimensional Visual Frame for Pages with Bespoke Generated Art.
 */
function PageArtworkFrame({
  src,
  alt,
  badgeText,
  icon: Icon,
  metricLabel,
  metricValue,
}: {
  src: string;
  alt: string;
  badgeText: string;
  icon: typeof Cpu;
  metricLabel: string;
  metricValue: string;
}) {
  return (
    <div className="hero-artwork-frame glass-panel" aria-hidden="true">
      <div className="artwork-image-container">
        <img src={src} alt={alt} className="hero-artwork-img" loading="eager" />
        <div className="artwork-glass-reflection" />
        <div className="artwork-top-tag">
          <span className="status-dot-pulse" />
          <span>{badgeText}</span>
        </div>
        <div className="artwork-floating-metric glass-panel">
          <div className="metric-icon-wrap">
            <Icon size={16} />
          </div>
          <div>
            <span className="metric-tag">{metricLabel}</span>
            <strong className="metric-stat">{metricValue}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  copy,
  badge,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  badge?: string;
}) {
  const kind = resolveKind(eyebrow);

  return (
    <section className="page-hero">
      <div className="page-hero-grid">
        <div className="page-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="page-hero-meta"
          >
            <span className="eyebrow">{eyebrow}</span>
            {badge && <span className="hero-status-pill">{badge}</span>}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
          >
            {copy}
          </motion.p>
        </div>

        {/* Hero Visual Area: High-End Bespoke Imagery or Executive 2D Crest */}
        <div className="page-hero-visual-col">
          {kind === 'projects' && (
            <PageArtworkFrame
              src="/assets/imagery/projects-portfolio.jpg"
              alt="Crezonices Multi-Platform Project Portfolio & Engineering Architectures"
              badgeText="Portfolio Showcase"
              icon={Layers}
              metricLabel="Systems Built"
              metricValue="Production Deployed"
            />
          )}

          {kind === 'about' && (
            <PageArtworkFrame
              src="/assets/imagery/about-ecosystem.jpg"
              alt="Crezonices Multi-Tier Technology Ecosystem"
              badgeText="Unified Ecosystem"
              icon={Cpu}
              metricLabel="Architecture Tiers"
              metricValue="4 Core Layers"
            />
          )}

          {kind === 'services' && (
            <PageArtworkFrame
              src="/assets/imagery/services-tech.jpg"
              alt="Crezonices Multi-Domain Engineering Services"
              badgeText="Engineering Spectrum"
              icon={Sparkles}
              metricLabel="Service Domains"
              metricValue="5 Specializations"
            />
          )}

          {kind === 'founders' && (
            <PageArtworkFrame
              src="/assets/imagery/founders-leadership.jpg"
              alt="Crezonices Executive Leadership Vision"
              badgeText="Executive Board"
              icon={Award}
              metricLabel="Leadership"
              metricValue="2 Directors"
            />
          )}

          {kind === 'contact' && (
            <PageArtworkFrame
              src="/assets/imagery/contact-hub.jpg"
              alt="Crezonices Global Communications Gateway"
              badgeText="Gateway Live"
              icon={Globe}
              metricLabel="Transmission Latency"
              metricValue="< 24h Response"
            />
          )}
        </div>
      </div>
    </section>
  );
}
