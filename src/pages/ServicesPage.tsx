import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Layers,
  LineChart,
  Lock,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
} from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { EnquiryForm } from '../components/common/EnquiryForm';
import { SectionHeading } from '../components/common/SectionHeading';
import { useServices } from '../features/content/usePublicContent';

export function ServicesPage() {
  const { data: services } = useServices();
  return (
    <main>
      <PageHero
        kind="services"
        eyebrow="Professional Services & Engineering"
        title="Purpose-built technological solutions for the digital era."
        copy="From modern responsive web systems to intelligent algorithms, secure architectures, and connected edge devices, Crezonices delivers practical and scalable engineering."
        badge="Engineered for Scalability"
      />

      {/* DETAILED TECHNICAL DOMAIN BREAKDOWN (Visual Storytelling) */}
      <section className="section services-domains-breakdown">
        <div className="section-intro-centered">
          <span className="eyebrow">Core Engineering Competencies</span>
          <h2>Comprehensive capabilities across 5 key technology domains</h2>
          <p>
            We combine rigorous computer science fundamentals with modern production frameworks to build
            robust, maintainable, and high-performance digital systems.
          </p>
        </div>

        <div className="domain-deep-dive-grid">
          {/* 1. WEB DEVELOPMENT */}
          <div className="domain-feature-card">
            <div className="domain-feature-header">
              <div className="domain-icon-wrap cyan">
                <Globe size={24} />
              </div>
              <div>
                <span className="domain-badge">Domain 01</span>
                <h3>Custom Web Development & Interactive Systems</h3>
              </div>
            </div>
            <p className="domain-lead-text">
              We design and construct high-speed, responsive web applications, business platforms,
              and interactive 3D web experiences using modern frameworks like React, TypeScript, and Three.js.
            </p>
            {/* Visual Micro-Storytelling Mockup */}
            <div className="domain-mockup-frame web-mockup">
              <div className="mockup-topbar">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="mockup-url">https://crezonices.com/client-system</span>
              </div>
              <div className="mockup-content-grid">
                <div className="mockup-code-block">
                  <code>{`// Responsive Modern Architecture\nconst App = () => (\n  <Canvas camera={{ fov: 45 }}>\n    <InteractiveModel />\n    <DataVisualizer />\n  </Canvas>\n);`}</code>
                </div>
                <div className="mockup-stat-pill">
                  <Smartphone size={14} /> Mobile-First · Sub-Second Load
                </div>
              </div>
            </div>
            <div className="domain-deliverables">
              <h4>Concrete Deliverables:</h4>
              <ul>
                <li><CheckCircle2 size={16} /> Fully responsive responsive web applications & custom single-page apps (SPAs)</li>
                <li><CheckCircle2 size={16} /> Portfolio systems for students, executives, and creative technologists</li>
                <li><CheckCircle2 size={16} /> Three.js & WebGL 3D interactive product showcases and landing pages</li>
                <li><CheckCircle2 size={16} /> Accessible semantic HTML, high Lighthouse scores, and search engine optimization</li>
              </ul>
            </div>
          </div>

          {/* 2. AI & MACHINE LEARNING */}
          <div className="domain-feature-card">
            <div className="domain-feature-header">
              <div className="domain-icon-wrap amber">
                <Brain size={24} />
              </div>
              <div>
                <span className="domain-badge">Domain 02</span>
                <h3>AI & Machine Learning Solutions</h3>
              </div>
            </div>
            <p className="domain-lead-text">
              We build intelligent application logic, neural-network integrations, and automated data pipelines
              that turn raw operational information into actionable insights and intuitive workflows.
            </p>
            {/* Visual Micro-Storytelling Mockup */}
            <div className="domain-mockup-frame ai-mockup">
              <div className="neural-nodes-row">
                <span className="neural-node active" />
                <span className="neural-connector" />
                <span className="neural-node active" />
                <span className="neural-connector" />
                <span className="neural-node" />
              </div>
              <div className="ai-telemetry-readout">
                <span>Model: Multi-modal Inference</span>
                <span className="ai-status">Latency: 14ms · 99.2% Accuracy</span>
              </div>
            </div>
            <div className="domain-deliverables">
              <h4>Concrete Deliverables:</h4>
              <ul>
                <li><CheckCircle2 size={16} /> LLM & multimodal API integrations (Gemini, structured reasoning, automated classification)</li>
                <li><CheckCircle2 size={16} /> Domain-specific conversational assistants and automated customer enquiry analyzers</li>
                <li><CheckCircle2 size={16} /> Predictive data visualization dashboards with real-time inference displays</li>
                <li><CheckCircle2 size={16} /> Data preprocessing, feature extraction, and pipeline orchestration</li>
              </ul>
            </div>
          </div>

          {/* 3. INTERNET OF THINGS (IoT) */}
          <div className="domain-feature-card">
            <div className="domain-feature-header">
              <div className="domain-icon-wrap cyan">
                <Cpu size={24} />
              </div>
              <div>
                <span className="domain-badge">Domain 03</span>
                <h3>Internet of Things (IoT) & Embedded Systems</h3>
              </div>
            </div>
            <p className="domain-lead-text">
              We bridge the physical and digital divide through connected sensor topologies, microcontroller
              telemetry hubs, and cloud-synchronized device monitoring networks.
            </p>
            {/* Visual Micro-Storytelling Mockup */}
            <div className="domain-mockup-frame iot-mockup">
              <div className="iot-topology-cluster">
                <div className="iot-node-chip"><Server size={14} /> Gateway</div>
                <span className="iot-signal-line" />
                <div className="iot-node-chip"><Network size={14} /> Sensor Node A</div>
                <span className="iot-signal-line" />
                <div className="iot-node-chip"><Network size={14} /> Edge Client B</div>
              </div>
              <div className="iot-telemetry-log">
                <span>Protocol: MQTT / WebSockets</span>
                <span>Signal: Stable (99.98% uptime)</span>
              </div>
            </div>
            <div className="domain-deliverables">
              <h4>Concrete Deliverables:</h4>
              <ul>
                <li><CheckCircle2 size={16} /> Sensor telemetry ingestion and real-time dashboard visualization</li>
                <li><CheckCircle2 size={16} /> Edge device communication via MQTT, HTTP, and WebSocket protocols</li>
                <li><CheckCircle2 size={16} /> Hardware-to-cloud bridge architectures and distributed device state management</li>
                <li><CheckCircle2 size={16} /> Low-latency alert dispatch systems for physical status triggers</li>
              </ul>
            </div>
          </div>

          {/* 4. CYBERSECURITY */}
          <div className="domain-feature-card">
            <div className="domain-feature-header">
              <div className="domain-icon-wrap amber">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="domain-badge">Domain 04</span>
                <h3>Cybersecurity & Defensible Architecture</h3>
              </div>
            </div>
            <p className="domain-lead-text">
              Security is not an afterthought; we implement layered protection mechanisms, secure authentication
              flows, encrypted communication channels, and hardened database access rules.
            </p>
            {/* Visual Micro-Storytelling Mockup */}
            <div className="domain-mockup-frame sec-mockup">
              <div className="sec-shield-status">
                <Lock size={16} />
                <span>Zero-Trust Access Perimeter · AES-256 / TLS 1.3</span>
              </div>
              <div className="sec-rule-audit">
                <code>{`service cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId} {\n      allow read, write: if request.auth.uid == userId;\n    }\n  }\n}`}</code>
              </div>
            </div>
            <div className="domain-deliverables">
              <h4>Concrete Deliverables:</h4>
              <ul>
                <li><CheckCircle2 size={16} /> Firebase & Cloud Firestore declarative security rules authoring and auditing</li>
                <li><CheckCircle2 size={16} /> Token-based authentication, Role-Based Access Control (RBAC), and session security</li>
                <li><CheckCircle2 size={16} /> Web vulnerability mitigation (XSS, CSRF, Injection prevention, CORS protection)</li>
                <li><CheckCircle2 size={16} /> Input sanitization, data encryption in transit, and secret management</li>
              </ul>
            </div>
          </div>

          {/* 5. WEBSITE MANAGEMENT & MAINTENANCE */}
          <div className="domain-feature-card full-width-card">
            <div className="domain-feature-header">
              <div className="domain-icon-wrap cyan">
                <RefreshCw size={24} />
              </div>
              <div>
                <span className="domain-badge">Domain 05</span>
                <h3>Continuous Website Management & Maintenance</h3>
              </div>
            </div>
            <p className="domain-lead-text">
              We ensure your digital products stay fast, secure, compatible, and up-to-date through dedicated
              lifecycle maintenance, uptime monitoring, and proactive content management.
            </p>
            {/* Visual Micro-Storytelling Mockup */}
            <div className="domain-mockup-frame maintenance-mockup">
              <div className="diag-stat-row">
                <div className="diag-item">
                  <LineChart size={16} />
                  <div>
                    <strong>99.9%</strong>
                    <span>Uptime SLA</span>
                  </div>
                </div>
                <div className="diag-item">
                  <Terminal size={16} />
                  <div>
                    <strong>Automated CI/CD</strong>
                    <span>Continuous Deployment</span>
                  </div>
                </div>
                <div className="diag-item">
                  <Layers size={16} />
                  <div>
                    <strong>Dependency Auditing</strong>
                    <span>Zero Vulnerabilities</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="domain-deliverables grid-two-col">
              <ul>
                <li><CheckCircle2 size={16} /> Routine dependency updates and security patch application</li>
                <li><CheckCircle2 size={16} /> Cross-browser and responsive device regression testing</li>
              </ul>
              <ul>
                <li><CheckCircle2 size={16} /> Database backups, storage optimization, and CDN cache invalidation</li>
                <li><CheckCircle2 size={16} /> CMS content synchronization and ongoing feature enhancements</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG OF ENGAGEMENT PACKAGES (CMS Services) */}
      <section className="section service-list-section">
        <div className="split-heading">
          <SectionHeading
            eyebrow="Service Packages"
            title="Transparent, structured offerings tailored to your stage."
            copy="Review our core engagement offerings. Every project includes structured kickoff, milestone deliverables, and deployment support."
          />
        </div>

        <div className="service-list">
          {services.map((service, i) => (
            <article key={service.id} className="service-list-item">
              <div className="service-count">
                <span>0{i + 1}</span>
                <ArrowDownRight size={18} />
              </div>
              <div className="service-main-content">
                <span className="eyebrow">{service.title}</span>
                <h2>{service.description}</h2>
              </div>
              <div className="service-feature-col">
                <ul>
                  {service.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <a href="#enquiry" className="text-link">
                  Discuss this service <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ENQUIRY FORM SECTION */}
      <section id="enquiry" className="section form-section">
        <div>
          <span className="eyebrow">Project Enquiry & Consultation</span>
          <h2>Tell us about the system you want to build.</h2>
          <p>
            Share your requirements, desired timeline, or architectural question. We review all
            enquiries and prepare a structured proposal or schedule an initial discovery discussion.
          </p>
          <div className="enquiry-benefits">
            <div className="benefit-item">
              <strong>Technical Discovery</strong>
              <span>We evaluate technical feasibility, framework choices, and architecture before code is written.</span>
            </div>
            <div className="benefit-item">
              <strong>Transparent Scoping</strong>
              <span>Clear milestones, realistic deliverables, and predictable timelines.</span>
            </div>
          </div>
        </div>
        <EnquiryForm mode="service" />
      </section>

      {/* FINAL SERVICE CTA */}
      <section className="section service-cta">
        <span className="eyebrow">Have a Question?</span>
        <h2>Ready to elevate your digital capabilities?</h2>
        <p>
          Contact Crezonices today to discuss your next web platform, embedded IoT system, or AI-powered solution.
        </p>
        <div className="hero-actions cta-actions">
          <Link className="button" to="/contact">
            Get in touch
          </Link>
          <Link className="button ghost" to="/projects">
            Review past concepts
          </Link>
        </div>
      </section>
    </main>
  );
}
