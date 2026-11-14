import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Network,
  Rocket,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { domains } from '../data/content';
import { TechnologyCard } from '../components/common/TechnologyCard';
import { usePageContent } from '../features/content/usePublicContent';

const principles = [
  {
    num: '01',
    title: 'Engineered for Purpose',
    desc: 'Every system we construct begins with a concrete real-world challenge rather than speculative hype.',
  },
  {
    num: '02',
    title: 'Architectural Integrity',
    desc: 'We prioritize defensible, modular, and maintainable software patterns that withstand growth.',
  },
  {
    num: '03',
    title: 'Cross-Domain Synthesis',
    desc: 'True technological value lies at the crossroads of artificial intelligence, distributed IoT networks, and hardened cybersecurity.',
  },
  {
    num: '04',
    title: 'Precision & Craft',
    desc: 'From sub-second response times and 3D experiences to clean semantic markup, the details define the quality.',
  },
  {
    num: '05',
    title: 'Continuous Evolution',
    desc: 'We cultivate constant learning, experimenting with emerging standards, machine-learning models, and modern graphics pipelines.',
  },
];

export function AboutPage() {
  const content = usePageContent('about', {
    eyebrow: 'About Crezonices',
    title: 'Engineering complex technology ecosystems for a connected world.',
    description:
      'Crezonices is an advanced technology development company creating specialized software, artificial intelligence applications, distributed IoT networks, and cybersecurity architectures.',
    badge: 'Multi-Domain Technology',
  });

  return (
    <main>
      <PageHero
        kind="about"
        eyebrow={content.eyebrow || 'About Crezonices'}
        title={content.title || 'Engineering complex technology ecosystems for a connected world.'}
        copy={
          content.description ||
          'Crezonices is an advanced technology development company creating specialized software, artificial intelligence applications, distributed IoT networks, and cybersecurity architectures.'
        }
        badge={content.badge || 'Multi-Domain Technology'}
      />

      {/* 1. MISSION & VISION EDITORIAL */}
      <section className="section editorial">
        <div>
          <span className="eyebrow">Our Mission</span>
          <h2>To engineer robust, accessible digital systems that solve critical modern challenges.</h2>
        </div>
        <div>
          <span className="eyebrow">Our Vision</span>
          <p>
            To establish an ecosystem of forward-looking software products and engineering services that
            empower businesses, startups, developers, and institutions to harness next-generation computing safely.
          </p>
          <div className="editorial-callout-box">
            <Target className="callout-icon" size={20} />
            <div>
              <strong>Production-Grade Engineering</strong>
              <span>We bridge experimental technologies with reliable, production-tested architectures.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE MULTI-TIERED TECHNOLOGY PLATFORM */}
      <section className="section about-ecosystem-section">
        <div className="section-intro-centered">
          <span className="eyebrow">The Dimensional Platform</span>
          <h2>A unified ecosystem bridging software, hardware, and intelligence</h2>
          <p>
            We do not simply build static websites. We orchestrate comprehensive digital environments
            where data flows seamlessly across client devices, cloud servers, and automated pipelines.
          </p>
        </div>

        <div className="ecosystem-showcase-wrap">
          <div className="ecosystem-visual-banner glass-panel">
            <img
              src="/assets/imagery/about-ecosystem.jpg"
              alt="Crezonices Multi-Tier Architecture & Technology Stack"
              className="ecosystem-banner-img"
              loading="lazy"
            />
            <div className="ecosystem-banner-overlay">
              <span className="banner-tag">
                <ShieldCheck size={14} /> Integrated Architecture
              </span>
              <h3>Hardware-to-Cloud Telemetry & AI Inference Pipeline</h3>
            </div>
          </div>
        </div>

        <div className="ecosystem-cards-grid">
          <div className="ecosystem-card">
            <div className="eco-header">
              <Brain size={26} className="text-cyan" />
              <span className="eco-step">Tier 01</span>
            </div>
            <h3>Cognitive & AI Tier</h3>
            <p>
              Neural networks, predictive analytics, and natural language logic embedded directly into user interfaces
              and backend decision workflows.
            </p>
          </div>

          <div className="ecosystem-card">
            <div className="eco-header">
              <Cpu size={26} className="text-amber" />
              <span className="eco-step">Tier 02</span>
            </div>
            <h3>IoT & Edge Computing</h3>
            <p>
              Hardware-accelerated telemetry ingestion, distributed sensor networks, and edge-level data processing
              operating with high resilience.
            </p>
          </div>

          <div className="ecosystem-card">
            <div className="eco-header">
              <ShieldCheck size={26} className="text-cyan" />
              <span className="eco-step">Tier 03</span>
            </div>
            <h3>Security & Defense Layer</h3>
            <p>
              Cryptographic protocol validation, end-to-end data encryption, and zero-trust authentication boundaries
              safeguarding sensitive data assets.
            </p>
          </div>

          <div className="ecosystem-card">
            <div className="eco-header">
              <Code2 size={26} className="text-amber" />
              <span className="eco-step">Tier 04</span>
            </div>
            <h3>Application & Experience</h3>
            <p>
              Fluid, immersive, and ultra-responsive user interfaces built with React, WebGL, and modern state architectures.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE DOMAINS */}
      <section className="section domains">
        <span className="eyebrow">Domains of Innovation</span>
        <h2>Where we concentrate our research and development</h2>
        <div className="domain-grid">
          {domains.map((x) => (
            <TechnologyCard key={x.label} domain={x} />
          ))}
        </div>
      </section>

      {/* 4. GUIDING PHILOSOPHY & VALUES */}
      <section className="section values">
        <div>
          <span className="eyebrow">Operating Principles</span>
          <h2>Our engineering philosophy & code of conduct.</h2>
          <p>
            Every line of code and architectural blueprint we produce is governed by a consistent
            dedication to quality, transparency, and enduring value.
          </p>
        </div>
        <ol className="principles-list">
          {principles.map((p) => (
            <li key={p.num} className="principle-item">
              <span className="principle-num">{p.num}</span>
              <div>
                <strong>{p.title}</strong>
                <p>{p.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="section service-cta">
        <span className="eyebrow">Explore our portfolio</span>
        <h2>Witness our concepts in action.</h2>
        <p>
          Discover the projects and technical architecture models our engineers are preparing to solve real-world problems.
        </p>
        <div className="hero-actions cta-actions">
          <Link className="button" to="/projects">
            Explore active projects
          </Link>
          <Link className="button ghost" to="/founders">
            Meet the leadership <Users size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
