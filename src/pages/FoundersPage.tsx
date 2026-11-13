import { Link } from 'react-router-dom';
import { Award, Briefcase, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { FounderProfile } from '../components/common/FounderProfile';
import { PageHero } from '../components/common/PageHero';
import { useTeam } from '../features/content/usePublicContent';

export function FoundersPage() {
  const { data: founders, error } = useTeam();

  return (
    <main>
      <PageHero
        eyebrow="Directors & Leadership"
        title="Meet the Directors of Crezonices."
        copy="Leadership, vision and direction behind Crezonices. Our two Directors combine strategic technological vision, technical craft, and an unwavering commitment to engineering integrity."
        badge="Executive Board"
      />

      <section className="section founder-list-section">
        <div className="section-intro-centered">
          <span className="eyebrow">Corporate Governance</span>
          <h2>The Directors</h2>
          <p>
            The Crezonices Directors oversee our technology roadmap, research initiatives,
            and operational standards. Profile information is managed directly via our verified administrative portal.
          </p>
        </div>

        {error && (
          <div className="concept-note-box">
            <Sparkles size={16} />
            <span>{error} Displaying active leadership records.</span>
          </div>
        )}

        <div className="founder-list">
          {founders.length ? (
            founders.map((f, i) => <FounderProfile founder={f} index={i} key={f.id} />)
          ) : (
            <div className="empty-state glass-panel">
              <p>Verified leadership profiles will appear here once published by the administrators.</p>
            </div>
          )}
        </div>
      </section>

      {/* LEADERSHIP COMMITMENT */}
      <section className="section values leadership-values">
        <div>
          <span className="eyebrow">Executive Commitments</span>
          <h2>A steadfast dedication to our partners and community.</h2>
        </div>
        <div className="commitments-grid">
          <div className="commitment-card glass-panel">
            <ShieldCheck size={26} className="text-cyan" />
            <h3>Transparent Engineering</h3>
            <p>
              We deliver honest technical assessments, clear architectural documentation, and
              uncompromising security standards.
            </p>
          </div>
          <div className="commitment-card glass-panel">
            <Briefcase size={26} className="text-amber" />
            <h3>Practical Scalability</h3>
            <p>
              Every product direction is shaped for sustainable growth, avoiding premature complexity
              while ensuring reliable long-term foundation.
            </p>
          </div>
        </div>
      </section>

      <section className="section service-cta">
        <span className="eyebrow">Direct Inquiries</span>
        <h2>Engage with the Crezonices Leadership.</h2>
        <p>
          For strategic partnerships, institutional collaborations, or enterprise consulting,
          we invite you to connect directly with our office.
        </p>
        <div className="hero-actions cta-actions">
          <Link className="button" to="/contact">
            Contact the office <Mail size={16} />
          </Link>
          <Link className="button ghost" to="/services">
            Explore our services
          </Link>
        </div>
      </section>
    </main>
  );
}
