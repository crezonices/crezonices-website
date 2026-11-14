import { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Edit3,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ProjectCard } from '../components/common/ProjectCard';
import { SectionHeading } from '../components/common/SectionHeading';
import { TechnologyCard } from '../components/common/TechnologyCard';
import { domains } from '../data/content';
import { usePageContent, useProjects, useReviews, useServices, useTeam } from '../features/content/usePublicContent';
import { useAuth } from '../contexts/AuthContext';

const ShieldSentinelHeroV3 = lazy(() =>
  import('../components/three/ShieldSentinelHeroV3').then((m) => ({ default: m.ShieldSentinelHeroV3 }))
);

export function HomePage() {
  const content = usePageContent('homepage', {
    eyebrow: 'Pioneering Intelligent Systems',
    title: 'Architecting intelligent solutions for an interconnected future.',
    description:
      'Crezonices engineers advanced products, neural software architectures, and cybersecurity solutions that bridge complex technologies with real-world impact.',
    ctaPrimaryLabel: 'Explore our projects',
    ctaPrimaryLink: '/projects',
    ctaSecondaryLabel: 'Discover our services',
    ctaSecondaryLink: '/services',
  });

  const { data: projects } = useProjects();
  const { data: founders } = useTeam();
  const { data: services } = useServices();
  const { data: reviews } = useReviews();
  const { user } = useAuth();

  return (
    <main>
      {/* 1. CINEMATIC HERO SECTION: SENTINEL SHIELD & NEURAL MATRIX */}
      <section className="hero">
        <div className="hero-grid-layout hero-v3-grid">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hero-badge-row"
            >
              <span className="eyebrow">{content.eyebrow || 'Pioneering Intelligent Systems'}</span>
              <span className="hero-status-pill">
                <span className="status-dot-pulse" /> Neural Core Active
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="hero-heading"
            >
              {content.title || 'Architecting intelligent solutions for an interconnected future.'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="hero-description"
            >
              {content.description ||
                'Crezonices engineers advanced products, neural software architectures, and cybersecurity solutions that bridge complex technologies with real-world impact.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="hero-actions"
            >
              <Button href={content.ctaPrimaryLink || '/projects'}>
                {content.ctaPrimaryLabel || 'Explore our projects'}
              </Button>
              <Button href={content.ctaSecondaryLink || '/services'} variant="ghost">
                {content.ctaSecondaryLabel || 'Discover our services'}
              </Button>
            </motion.div>
          </div>

          {/* Right Column: Cybernetic Iron Shield Mask & Neural Brain Sentinel */}
          <div className="hero-stage-v3">
            <Suspense
              fallback={
                <div className="scene loading-scene">
                  <div className="scene-spinner" />
                  <span>Synchronizing sentinel cognitive lattice…</span>
                </div>
              }
            >
              <ShieldSentinelHeroV3 />
            </Suspense>
          </div>
        </div>

        {/* HERO FOOTER — Clean, technological status bar */}
        <div className="hero-foot">
          <div className="hero-foot-item">
            <span className="hero-foot-label">Architecture</span>
            <span className="hero-foot-value">Distributed Neural Systems</span>
          </div>
          <div className="hero-foot-item">
            <span className="hero-foot-label">Domains</span>
            <span className="hero-foot-value">AI · Cybersecurity · IoT</span>
          </div>
          <div className="hero-foot-item hero-foot-link">
            <a href="/about" className="hero-inline-link">
              Explore the Ecosystem <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL INTRODUCTION */}
      <section className="section editorial">
        <div>
          <span className="eyebrow">Crezonices / Engineering Foundation</span>
          <h2>Crafted for the technological frontiers that define tomorrow.</h2>
        </div>
        <div>
          <p>
            We build with rigorous product thinking, technical depth, and dimensional precision.
            From responsive multi-platform web applications to distributed IoT sensing networks
            and hardened cybersecurity perimeters, Crezonices transforms bold ideas into reliable
            digital infrastructure.
          </p>
          <div className="editorial-stats">
            <div className="stat-box">
              <span className="stat-number">3+</span>
              <span className="stat-label">Core Domains</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">100%</span>
              <span className="stat-label">Production Focus</span>
            </div>
          </div>
          <Button href="/about" variant="ghost">
            Learn more about our vision
          </Button>
        </div>
      </section>

      {/* 3. CORE TECHNOLOGY DOMAINS */}
      <section className="section domains">
        <SectionHeading
          eyebrow="Our technology domains"
          title="A focused approach to complex systems."
          copy="From intelligent algorithmic models to secure infrastructure and connected edge devices, our work spans the pillars of modern computing."
        />
        <div className="domain-grid">
          {domains.map((domain) => (
            <TechnologyCard domain={domain} key={domain.label} />
          ))}
        </div>
      </section>

      {/* 4. WHAT WE DO — CAPABILITY ARCHITECTURE */}
      <section className="section what-we-do">
        <div className="what-intro">
          <SectionHeading
            eyebrow="What we build"
            title="Technology with an applied purpose."
          />
          <p>
            We operate at the convergence of product architecture, high-performance software
            engineering, and continuous system reliability.
          </p>
          <div className="tech-badge-cluster">
            <span><Cpu size={14} /> Edge Computing</span>
            <span><ShieldCheck size={14} /> Zero Trust</span>
            <span><Terminal size={14} /> Cloud Systems</span>
          </div>
        </div>
        <div className="capability-list">
          <article>
            <div className="cap-icon-box">
              <Layers size={22} />
            </div>
            <div>
              <span className="cap-num">01</span>
              <h3>Intelligent Products & Applications</h3>
              <p>
                Purpose-built software platforms, tailored web applications, and intuitive
                interfaces engineered for real-world utility and effortless scalability.
              </p>
            </div>
          </article>
          <article>
            <div className="cap-icon-box">
              <Network size={22} />
            </div>
            <div>
              <span className="cap-num">02</span>
              <h3>Connected Systems & Security</h3>
              <p>
                End-to-end IoT sensor topologies, telemetry pipelines, and defensive security
                frameworks designed to protect critical digital operations.
              </p>
            </div>
          </article>
          <article>
            <div className="cap-icon-box">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="cap-num">03</span>
              <h3>Professional Web Solutions</h3>
              <p>
                Modern responsive web development, portfolio ecosystems, and ongoing technical
                care to ensure long-term stability and optimal digital presence.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 5. PRODUCT STATEMENT CALLOUT */}
      <section className="section product-statement">
        <span className="eyebrow">Product-Driven Innovation</span>
        <h2>From initial concept to intelligent, deployable products.</h2>
        <p>
          Crezonices is driven by engineering curiosity and functional discipline. We analyze
          complex requirements before building solutions that deliver measurable value.
        </p>
        <div className="product-statement-actions">
          <Button href="/services#enquiry">Initiate a collaboration</Button>
        </div>
      </section>

      {/* 6. FEATURED PROJECTS SHOWCASE */}
      <section className="section projects">
        <div className="split-heading">
          <SectionHeading
            eyebrow="Featured Projects"
            title="Pioneering technology concepts in progress."
            copy="Explore early product models and architecture demonstrators actively developed by the Crezonices team."
          />
          <Button href="/projects" variant="ghost">
            View all projects
          </Button>
        </div>
        <div className="project-grid">
          {projects
            .filter((x) => x.featured)
            .map((project) => (
              <ProjectCard project={project} key={project.id} />
            ))}
        </div>
      </section>

      {/* 7. PROFESSIONAL SERVICES PREVIEW */}
      <section className="section services-preview">
        <div>
          <SectionHeading
            eyebrow="Professional Services"
            title="Bring your digital presence into sharp focus."
            copy="Comprehensive web engineering and technical support for startups, professionals, and forward-thinking teams."
          />
          <div className="services-action-wrap">
            <Button href="/services">Explore all capabilities</Button>
          </div>
        </div>
        <div className="services-list-container">
          {services.map((s, i) => (
            <a href="/services#enquiry" className="service-preview-row" key={s.id}>
              <span className="service-row-idx">0{i + 1}</span>
              <div className="service-row-info">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
              <ArrowRight size={18} className="service-row-arrow" />
            </a>
          ))}
        </div>
      </section>

      {/* 8. GUIDING PRINCIPLES */}
      <section className="section values">
        <div>
          <span className="eyebrow">The Crezonices Standard</span>
          <h2>A principled approach to building enduring technology.</h2>
        </div>
        <ol className="values-list">
          {[
            { title: 'Problem-solving mindset', desc: 'Focusing on authentic challenges before deciding architecture.' },
            { title: 'Innovation-focused development', desc: 'Embracing next-generation tooling, AI models, and 3D web systems.' },
            { title: 'Practical solutions', desc: 'Building dependable software that performs reliably in the real world.' },
            { title: 'Continuous improvement', desc: 'Iterating through proactive monitoring, feedback, and technical refinement.' },
            { title: 'User-focused design', desc: 'Merging dimensional aesthetics with intuitive, accessible workflows.' },
          ].map((item, i) => (
            <li key={item.title}>
              <span className="value-num">0{i + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 9. DIRECTORS HIGHLIGHT */}
      <section className="section founders-preview">
        <SectionHeading
          eyebrow="Executive Leadership"
          title="Meet the Directors of Crezonices."
          copy="Guided by strategic technical vision and engineering discipline. Profile records are maintained directly through our company CMS."
        />
        <div className="founder-teasers">
          {founders.map((f, i) => (
            <a href="/founders" className="founder-teaser-card" key={f.id}>
              <div className="founder-badge-row">
                <span className="founder-num">0{i + 1}</span>
                <span className="founder-designation-tag">{f.designation}</span>
              </div>
              <h3>{f.name || (i === 0 ? 'Executive Director' : 'Managing Director')}</h3>
              <p>{f.shortBio || 'Directorship details and biography are managed through the verified CMS.'}</p>
              <span className="teaser-link">
                View profile <ArrowUpRight size={15} />
              </span>
            </a>
          ))}
        </div>
        <div className="founders-preview-foot">
          <Button href="/founders" variant="ghost">
            Meet the Directors
          </Button>
        </div>
      </section>

      {/* 9.5. VERIFIED CLIENT TESTIMONIALS */}
      {reviews && reviews.length > 0 && (
        <section className="section testimonials-section">
          <SectionHeading
            eyebrow="Reputation & Verified Endorsements"
            title="What partners and clients say about Crezonices."
            copy="Authentic endorsements from enterprise clients and technical collaborators who have experienced our engineering craft."
          />
          <div className="testimonials-grid">
            {reviews.map((r) => {
              const name = r.reviewerName || r.customerName || 'Verified Client';
              const text = r.reviewText || r.testimonialText;
              const meta = [r.reviewerDesignation || r.designation, r.company || r.companyName]
                .filter(Boolean)
                .join(' · ');
              return (
                <article key={r.id} className="testimonial-card glass-panel" style={{ position: 'relative' }}>
                  {user && (
                    <Link
                      to="/admin/reviews"
                      className="admin-quick-edit-pill"
                      title="Edit testimonial in Admin Portal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit3 size={11} /> Edit
                    </Link>
                  )}
                  <div className="testimonial-rating">
                    {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                  </div>
                  <p className="testimonial-quote">"{text}"</p>
                  <div className="testimonial-author">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={name} className="testimonial-avatar" />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}
                      >
                        {name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <strong>{name}</strong>
                      {meta && <span>{meta}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 10. CALL TO ACTION */}
      <section className="section service-cta">
        <span className="eyebrow">Start a conversation</span>
        <h2>Have an ambitious idea? Let’s engineer something exceptional.</h2>
        <p>
          Whether you need a cutting-edge web platform, an AI consultation, or a custom digital
          solution, we are ready to collaborate.
        </p>
        <div className="hero-actions cta-actions">
          <Button href="/services#enquiry">Discuss your project</Button>
          <Button href="/contact" variant="ghost">
            Contact Crezonices
          </Button>
        </div>
      </section>
    </main>
  );
}
