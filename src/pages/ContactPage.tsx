import { ArrowRight, Clock, Globe, Mail, MapPin, MessageSquare, Shield, Sparkles } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { EnquiryForm } from '../components/common/EnquiryForm';
import { company } from '../config/site';

export function ContactPage() {
  return (
    <main>
      <PageHero
        kind="contact"
        eyebrow="Direct Communications & Inquiries"
        title="Initiate a conversation with the Crezonices team."
        copy="Whether you have an inquiry regarding a new technology venture, web system, or research partnership, our engineers and directorship are ready to listen."
        badge="Signal Active"
      />

      <section className="section contact-layout">
        {/* Contact Info & Telemetry Column */}
        <div className="contact-info-panel glass-panel">
          <div className="contact-card-top">
            <span className="eyebrow">Communication Gateway</span>
            <h2>Direct Channels</h2>
            <p>
              Connect with our operational desk for immediate consultations, technical proposals,
              or strategic dialogues.
            </p>
          </div>

          <div className="contact-direct-links">
            <a href={`mailto:${company.email}`} className="direct-email-card">
              <div className="channel-icon-wrap">
                <Mail size={22} />
              </div>
              <div>
                <span className="channel-label">Official Electronic Mail</span>
                <strong className="channel-address">{company.email}</strong>
              </div>
              <ArrowRight size={18} className="channel-arrow" />
            </a>
          </div>

          <div className="contact-telemetry-list">
            <div className="telemetry-item">
              <Clock size={18} className="telemetry-icon" />
              <div>
                <strong>Response Window</strong>
                <span>Typically within 24–48 business hours</span>
              </div>
            </div>
            <div className="telemetry-item">
              <Globe size={18} className="telemetry-icon" />
              <div>
                <strong>Global Operations</strong>
                <span>Serving international clients, developers & institutions</span>
              </div>
            </div>
            <div className="telemetry-item">
              <Shield size={18} className="telemetry-icon" />
              <div>
                <strong>Confidentiality First</strong>
                <span>All concept proposals are handled with strict privacy</span>
              </div>
            </div>
          </div>

          <div className="contact-service-redirect">
            <div className="redirect-note">
              <Sparkles size={16} />
              <span>Planning a specific website or software deployment?</span>
            </div>
            <a href="/services#enquiry" className="text-link">
              Jump to structured service enquiry <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Message Form Column */}
        <div className="contact-form-panel glass-panel">
          <div className="form-panel-header">
            <span className="eyebrow">Transmission Interface</span>
            <h2>Send an Electronic Dispatch</h2>
            <p>
              Complete the fields below to prepare a structured dispatch directly to our executive inbox.
            </p>
          </div>
          <EnquiryForm mode="contact" />
        </div>
      </section>
    </main>
  );
}
