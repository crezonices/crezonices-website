import { ArrowRight, Clock, Edit3, Globe, Mail, MapPin, MessageSquare, Phone, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/common/PageHero';
import { EnquiryForm } from '../components/common/EnquiryForm';
import { company } from '../config/site';
import { usePageContent, useSiteSettings } from '../features/content/usePublicContent';
import { useAuth } from '../contexts/AuthContext';

export function ContactPage() {
  const { user } = useAuth();
  const settings = useSiteSettings();
  const content = usePageContent('contact', {
    eyebrow: 'Direct Communications & Inquiries',
    title: 'Initiate a conversation with the Crezonices team.',
    description:
      'Whether you have an inquiry regarding a new technology venture, web system, or research partnership, our engineers and directorship are ready to listen.',
    badge: 'Signal Active',
  });

  const activeEmail = settings.email || company.email;
  const activeHeading = settings.contactHeading || content.title || 'Initiate a conversation with the Crezonices team.';
  const activeDesc = settings.contactDescription || content.description || 'Whether you have an inquiry regarding a new technology venture, web system, or research partnership, our engineers and directorship are ready to listen.';

  return (
    <main>
      <PageHero
        kind="contact"
        eyebrow={content.eyebrow || 'Direct Communications & Inquiries'}
        title={activeHeading}
        copy={activeDesc}
        badge={content.badge || 'Signal Active'}
      />

      <section className="section contact-layout" style={{ position: 'relative' }}>
        {/* Admin 1 Quick Edit Shortcut */}
        {user && (
          <Link
            to="/admin/contact-info"
            className="admin-quick-edit-pill"
            style={{ top: 0, right: 20 }}
            title="Edit contact settings in Admin Portal"
          >
            <Edit3 size={11} /> Edit Contact Info
          </Link>
        )}

        {/* Contact Info & Telemetry Column */}
        <div className="contact-info-panel glass-panel">
          <div className="contact-card-top">
            <span className="eyebrow">Communication Gateway</span>
            <h2>Direct Channels</h2>
            <p>
              {settings.supportingContactText ||
                'Connect with our operational desk for immediate consultations, technical proposals, or strategic dialogues.'}
            </p>
          </div>

          <div className="contact-direct-links">
            <a href={`mailto:${activeEmail}`} className="direct-email-card">
              <div className="channel-icon-wrap">
                <Mail size={22} />
              </div>
              <div>
                <span className="channel-label">Official Electronic Mail</span>
                <strong className="channel-address">{activeEmail}</strong>
              </div>
              <ArrowRight size={18} className="channel-arrow" />
            </a>

            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="direct-email-card" style={{ marginTop: 12 }}>
                <div className="channel-icon-wrap">
                  <Phone size={22} />
                </div>
                <div>
                  <span className="channel-label">Telephone Communications</span>
                  <strong className="channel-address">{settings.phone}</strong>
                </div>
                <ArrowRight size={18} className="channel-arrow" />
              </a>
            )}

            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="direct-email-card"
                style={{ marginTop: 12 }}
              >
                <div className="channel-icon-wrap">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <span className="channel-label">Instant WhatsApp Desk</span>
                  <strong className="channel-address">{settings.whatsapp}</strong>
                </div>
                <ArrowRight size={18} className="channel-arrow" />
              </a>
            )}
          </div>

          <div className="contact-telemetry-list">
            <div className="telemetry-item">
              <Clock size={18} className="telemetry-icon" />
              <div>
                <strong>Response Window</strong>
                <span>{settings.responseTime || 'Typically within 24–48 business hours'}</span>
              </div>
            </div>
            {settings.officeHours && (
              <div className="telemetry-item">
                <Clock size={18} className="telemetry-icon" />
                <div>
                  <strong>Operational Hours</strong>
                  <span>{settings.officeHours}</span>
                </div>
              </div>
            )}
            <div className="telemetry-item">
              <Globe size={18} className="telemetry-icon" />
              <div>
                <strong>Operational Facility</strong>
                <span>{settings.address || 'Serving international clients, developers & institutions'}</span>
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
