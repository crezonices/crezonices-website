import { ArrowUpRight, Award, ExternalLink, Sparkles, UserCheck } from 'lucide-react';
import type { Founder } from '../../types/models';

export function FounderProfile({ founder, index }: { founder: Founder; index: number }) {
  const image = founder.imageUrl || founder.image;
  // Ensure the designated titles are prominently formatted
  const isExecDir = index === 0 || founder.designation?.toLowerCase().includes('executive');
  const standardizedDesignation = isExecDir ? 'Executive Director' : 'Managing Director';
  const displayDesignation = founder.designation || standardizedDesignation;

  return (
    <article className="founder-profile-card glass-panel" data-interactive>
      {/* Profile Visual Column */}
      <div className="founder-avatar-col">
        {image ? (
          <div className="founder-image-wrapper">
            <img
              src={image}
              alt={`${founder.name || 'Leadership'} portrait`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="avatar-ambient-glow" />
          </div>
        ) : (
          <div className="founder-avatar-placeholder">
            <div className="avatar-monogram">
              <span>0{index + 1}</span>
            </div>
            <div className="avatar-geometric-rings" />
            <div className="avatar-role-pill">
              <UserCheck size={14} /> Leadership
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Column */}
      <div className="founder-details-col">
        <div className="founder-header-badge-row">
          <span className="eyebrow">{founder.role || 'Director'}</span>
          <span className="designation-chip">
            <Award size={13} /> {displayDesignation}
          </span>
        </div>

        <h2 className="founder-name">
          {founder.name || `Leadership Profile 0${index + 1}`}
        </h2>

        <h3 className="founder-title-lead">{displayDesignation}</h3>

        <p className="founder-bio">
          {founder.biography ||
            founder.shortBio ||
            'Executive leadership details and strategic focus are maintained directly through our company CMS.'}
        </p>

        {/* Expertise & Skills */}
        {founder.expertise && founder.expertise.length > 0 && (
          <div className="founder-skill-group">
            <span className="skill-group-label">Core Competencies:</span>
            <div className="tags">
              {founder.expertise.map((item) => (
                <span key={item} className="tag-pill tag-cyan">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {founder.skills && founder.skills.length > 0 && (
          <div className="founder-skill-group">
            <span className="skill-group-label">Technical Disciplines:</span>
            <div className="tags">
              {founder.skills.map((skill) => (
                <span key={skill} className="tag-pill tag-amber">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social / Direct Connect */}
        <div className="founder-footer-actions">
          {founder.socialLinks?.linkedin ? (
            <a
              href={founder.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="founder-social-btn"
            >
              <ExternalLink size={15} /> Connect on LinkedIn <ArrowUpRight size={14} />
            </a>
          ) : (
            <span className="founder-verified-notice">
              <Sparkles size={13} /> Verified Corporate Directorship
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
