import { ArrowUpRight, Cpu, Edit3, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, type PointerEvent } from 'react';
import type { Project } from '../../types/models';
import { useAuth } from '../../contexts/AuthContext';

export function ProjectCard({ project }: { project: Project }) {
  const { user } = useAuth();
  const [tilt, setTilt] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  const move = (event: PointerEvent<HTMLElement>) => {
    if (!matchMedia('(pointer:fine)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    setTilt(`perspective(1000px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-8px)`);
  };

  const image = project.coverImageUrl || project.logoUrl || project.imageUrl || project.thumbnail;

  return (
    <article
      className="project-card glass-panel"
      data-interactive
      onPointerMove={move}
      onPointerLeave={() => setTilt('')}
      style={{ transform: tilt, position: 'relative' }}
    >
      {/* Admin 1 Quick Edit Shortcut */}
      {user && (
        <Link
          to={`/admin/projects`}
          className="admin-quick-edit-pill"
          title="Edit project in Admin Portal"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit3 size={11} /> Edit Project
        </Link>
      )}

      {/* Visual Header / Cover Art */}
      <div className="project-art">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={`${project.title} project`}
            onError={() => setImageFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="project-art-procedural">
            <div className="art-grid-lines" />
            <div className="art-center-badge">
              {project.category === 'IoT' ? (
                <Cpu size={32} />
              ) : project.category === 'Cybersecurity' ? (
                <Layers size={32} />
              ) : (
                <Sparkles size={32} />
              )}
              <span className="art-label">{project.placeholder ? 'System Model' : 'Active System'}</span>
            </div>
            <div className="orbit orbit-cyan" />
            <div className="orbit orbit-amber" />
          </div>
        )}
        <div className="project-status-tag">
          <span className="status-dot" />
          {project.status || 'Active'}
        </div>
      </div>

      {/* Card Content Info */}
      <div className="project-card-body">
        <div className="project-meta-row">
          <span className="eyebrow">{project.category}</span>
          <span className="project-stage">{project.placeholder ? 'Concept Model' : 'Production'}</span>
        </div>

        <h3>{project.title}</h3>
        <p>{project.shortDescription}</p>

        {project.technologies && project.technologies.length > 0 && (
          <div className="tags">
            {project.technologies.slice(0, 4).map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="project-card-foot">
          <Link
            to={`/projects/${project.slug}`}
            className="project-action-link"
            aria-label={`Explore details for ${project.title}`}
          >
            <span>Explore Architecture</span>
            <div className="action-circle">
              <ArrowUpRight size={16} />
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
