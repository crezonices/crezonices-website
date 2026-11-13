import { useEffect, useState, type FormEvent } from 'react';
import {
  Activity,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  deleteAdminRecord,
  getAdminRecord,
  listActivityLogs,
  listAdminRecords,
  saveAdminRecord,
  updateEnquiryStatus,
  urlIsSafe,
} from '../content/contentStore';
import type {
  AdminActivityLog,
  ContactEnquiry,
  EnquiryStatus,
  Founder,
  PageContent,
  Project,
  ProjectCategory,
  Review,
  Service,
  SiteSettings,
  TeamRole,
} from '../../types/models';

function ImagePreview({ url, alt = 'Preview' }: { url?: string; alt?: string }) {
  if (!url) return null;
  return (
    <div className="url-preview-wrapper">
      <img
        className="url-preview-thumb"
        src={url}
        alt={alt}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <span className="preview-label">Live Image Preview</span>
    </div>
  );
}

// ============================================================================
// 1. PROJECTS MANAGER
// ============================================================================

const blankProject = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  logoUrl: '',
  coverImageUrl: '',
  projectUrl: '',
  githubUrl: '',
  category: 'Web Development' as ProjectCategory,
  technologies: '',
  status: 'Published' as string,
  displayOrder: 1,
  isPublished: true,
  featured: false,
};

export function ProjectsManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [edit, setEdit] = useState<(typeof blankProject & { id?: string }) | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const records = await listAdminRecords<Project>('projects');
      setItems(records);
    } catch {
      setNotice({ type: 'error', message: 'Could not load projects. Verify Firestore connection.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!edit || !user) return;

    if (!edit.title.trim() || !edit.shortDescription.trim()) {
      setNotice({ type: 'error', message: 'Project title and short description are required.' });
      return;
    }
    if (edit.logoUrl && !urlIsSafe(edit.logoUrl)) {
      setNotice({ type: 'error', message: 'Logo URL must be HTTPS and not a GitHub /blob/ link.' });
      return;
    }

    try {
      await saveAdminRecord(
        'projects',
        edit.id,
        {
          ...edit,
          slug: edit.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
          technologies: edit.technologies
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
          imageUrl: edit.logoUrl,
        },
        user.uid,
        user.email || '',
        edit.title
      );
      setEdit(null);
      setNotice({ type: 'success', message: 'Project saved successfully and synchronized.' });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to save project. Verify Firestore permissions.' });
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await deleteAdminRecord('projects', id, user?.uid || '', user?.email || '', title);
      setNotice({ type: 'success', message: `Deleted project "${title}".` });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to delete project.' });
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Portfolio Architecture</span>
          <h1>Projects Management</h1>
          <p>Create, update, and publish digital product showcases dynamically on the public Projects page.</p>
        </div>
        <button
          type="button"
          className="button small"
          onClick={() => setEdit({ ...blankProject, displayOrder: items.length + 1 })}
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {edit && (
        <form className="admin-editor glass-panel" onSubmit={handleSave}>
          <div className="editor-top-bar">
            <h2>{edit.id ? 'Edit Project' : 'Create New Project'}</h2>
            <button type="button" className="close-editor-btn" onClick={() => setEdit(null)}>
              <X size={16} />
            </button>
          </div>

          <div className="form-grid-2">
            <label>
              Project Title *
              <input
                required
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                placeholder="e.g. Connected Operations Suite"
              />
            </label>
            <label>
              Category
              <select
                value={edit.category}
                onChange={(e) => setEdit({ ...edit, category: e.target.value as ProjectCategory })}
              >
                {['IoT', 'Cybersecurity', 'AI/ML', 'Web Development', 'Other'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Short Description * (Displayed on portfolio cards)
            <textarea
              required
              rows={2}
              value={edit.shortDescription}
              onChange={(e) => setEdit({ ...edit, shortDescription: e.target.value })}
              placeholder="Concise, 1–2 sentence summary of this system..."
            />
          </label>

          <label>
            Full Architecture Description
            <textarea
              rows={4}
              value={edit.fullDescription}
              onChange={(e) => setEdit({ ...edit, fullDescription: e.target.value })}
              placeholder="Detailed technical overview and problem statement..."
            />
          </label>

          <div className="form-grid-2">
            <label>
              Direct HTTPS Logo / Image URL
              <input
                type="url"
                value={edit.logoUrl}
                onChange={(e) => setEdit({ ...edit, logoUrl: e.target.value })}
                placeholder="https://images.example.com/project-thumb.jpg"
              />
            </label>
            <label>
              Live Project / Demo Link
              <input
                type="url"
                value={edit.projectUrl}
                onChange={(e) => setEdit({ ...edit, projectUrl: e.target.value })}
                placeholder="https://project.example.com"
              />
            </label>
          </div>

          <ImagePreview url={edit.logoUrl} alt="Project logo preview" />

          <div className="form-grid-2">
            <label>
              GitHub Repository Link (Optional)
              <input
                type="url"
                value={edit.githubUrl}
                onChange={(e) => setEdit({ ...edit, githubUrl: e.target.value })}
                placeholder="https://github.com/crezonices/repo"
              />
            </label>
            <label>
              Technologies (Comma-separated)
              <input
                value={edit.technologies}
                onChange={(e) => setEdit({ ...edit, technologies: e.target.value })}
                placeholder="React, TypeScript, Three.js, IoT"
              />
            </label>
          </div>

          <div className="form-row-checkboxes">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={edit.isPublished}
                onChange={(e) => setEdit({ ...edit, isPublished: e.target.checked })}
              />
              <span>Published (Visible publicly on Projects page)</span>
            </label>
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={edit.featured}
                onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
              />
              <span>Featured on Homepage</span>
            </label>
            <label className="order-input-wrap">
              <span>Display Order:</span>
              <input
                type="number"
                value={edit.displayOrder}
                onChange={(e) => setEdit({ ...edit, displayOrder: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="editor-actions">
            <button type="submit" className="button small">
              <Save size={14} /> Save Project
            </button>
            <button type="button" className="button small ghost" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects List View */}
      <div className="admin-items-list">
        {items.map((item) => (
          <article key={item.id} className="admin-record-row glass-panel">
            <div className="record-main-col">
              <span className={`status-badge ${item.isPublished ? 'published' : 'draft'}`}>
                {item.isPublished ? 'Published' : 'Draft'}
              </span>
              <div className="record-info">
                <h3>{item.title}</h3>
                <span className="record-meta">
                  Category: <strong>{item.category}</strong> · Order: {item.displayOrder} ·{' '}
                  {item.featured ? 'Featured on Home' : 'Standard'}
                </span>
                <p className="record-desc-preview">{item.shortDescription}</p>
              </div>
            </div>

            <div className="record-actions-col">
              {item.projectUrl && (
                <a
                  href={item.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="record-icon-btn"
                  title="Visit link"
                >
                  <ExternalLink size={15} />
                </a>
              )}
              <button
                type="button"
                className="record-icon-btn"
                onClick={() =>
                  setEdit({
                    ...blankProject,
                    ...item,
                    logoUrl: item.logoUrl || item.imageUrl || '',
                    coverImageUrl: item.coverImageUrl || '',
                    technologies: item.technologies?.join(', ') || '',
                  })
                }
                title="Edit project"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                className="record-icon-btn danger"
                onClick={() => handleDelete(item.id, item.title)}
                title="Delete project"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && !loading && (
          <div className="admin-empty-card glass-panel">
            <Briefcase size={24} className="text-muted" />
            <p>No projects stored in Firestore yet. Click "New Project" to publish your first showcase.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// 2. FOUNDERS & TEAM MANAGER
// ============================================================================

const blankMember = {
  name: '',
  designation: 'Executive Director',
  role: 'Director' as TeamRole,
  imageUrl: '',
  shortBio: '',
  biography: '',
  skills: '',
  expertise: '',
  linkedin: '',
  github: '',
  displayOrder: 1,
  isPublished: true,
  featured: true,
};

export function TeamManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Founder[]>([]);
  const [edit, setEdit] = useState<(typeof blankMember & { id?: string }) | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refresh = async () => {
    try {
      const records = await listAdminRecords<Founder>('teamMembers');
      setItems(records);
    } catch {
      setNotice({ type: 'error', message: 'Could not load team records.' });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!edit || !user) return;

    if (!edit.name.trim() || !edit.designation.trim() || !edit.biography.trim()) {
      setNotice({ type: 'error', message: 'Full name, title/designation, and biography are required.' });
      return;
    }

    try {
      await saveAdminRecord(
        'teamMembers',
        edit.id,
        {
          ...edit,
          image: edit.imageUrl,
          skills: edit.skills.split(',').map((x) => x.trim()).filter(Boolean),
          expertise: edit.expertise.split(',').map((x) => x.trim()).filter(Boolean),
          socialLinks: {
            linkedin: edit.linkedin || undefined,
            github: edit.github || undefined,
          },
        },
        user.uid,
        user.email || '',
        edit.name
      );
      setEdit(null);
      setNotice({ type: 'success', message: 'Team profile saved successfully.' });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to save profile.' });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await deleteAdminRecord('teamMembers', id, user?.uid || '', user?.email || '', name);
      setNotice({ type: 'success', message: `Removed profile ${name}.` });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to delete profile.' });
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Corporate Governance</span>
          <h1>Founders & Executive Team</h1>
          <p>
            Manage the two Directors (Executive Director & Managing Director) and future team members
            dynamically.
          </p>
        </div>
        <button
          type="button"
          className="button small"
          onClick={() => setEdit({ ...blankMember, displayOrder: items.length + 1 })}
        >
          <Plus size={14} /> Add Team Member
        </button>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {edit && (
        <form className="admin-editor glass-panel" onSubmit={handleSave}>
          <div className="editor-top-bar">
            <h2>{edit.id ? 'Edit Directorship Profile' : 'New Directorship Profile'}</h2>
            <button type="button" className="close-editor-btn" onClick={() => setEdit(null)}>
              <X size={16} />
            </button>
          </div>

          <div className="form-grid-2">
            <label>
              Full Name *
              <input
                required
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                placeholder="Director's full name"
              />
            </label>
            <label>
              Designation / Professional Title *
              <select
                value={edit.designation}
                onChange={(e) => setEdit({ ...edit, designation: e.target.value })}
              >
                <option value="Executive Director">Executive Director</option>
                <option value="Managing Director">Managing Director</option>
                <option value="Director">Director</option>
                <option value="Principal Engineer">Principal Engineer</option>
                <option value="Technical Lead">Technical Lead</option>
              </select>
            </label>
          </div>

          <div className="form-grid-2">
            <label>
              Profile Image URL (Direct HTTPS)
              <input
                type="url"
                value={edit.imageUrl}
                onChange={(e) => setEdit({ ...edit, imageUrl: e.target.value })}
                placeholder="https://example.com/portrait.jpg"
              />
            </label>
            <label>
              LinkedIn Profile URL
              <input
                type="url"
                value={edit.linkedin}
                onChange={(e) => setEdit({ ...edit, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/director"
              />
            </label>
          </div>

          <ImagePreview url={edit.imageUrl} alt="Profile photo preview" />

          <label>
            Short Bio (Summary)
            <input
              value={edit.shortBio}
              onChange={(e) => setEdit({ ...edit, shortBio: e.target.value })}
              placeholder="Brief 1-sentence executive positioning statement..."
            />
          </label>

          <label>
            Full Biography *
            <textarea
              required
              rows={4}
              value={edit.biography}
              onChange={(e) => setEdit({ ...edit, biography: e.target.value })}
              placeholder="Comprehensive biography, engineering craft, and strategic leadership roadmap..."
            />
          </label>

          <div className="form-grid-2">
            <label>
              Core Competencies (Comma-separated)
              <input
                value={edit.expertise}
                onChange={(e) => setEdit({ ...edit, expertise: e.target.value })}
                placeholder="Distributed Architecture, Artificial Intelligence, Cybersecurity"
              />
            </label>
            <label>
              Technical Disciplines (Comma-separated)
              <input
                value={edit.skills}
                onChange={(e) => setEdit({ ...edit, skills: e.target.value })}
                placeholder="Cloud Infrastructure, Zero-Trust, IoT Mesh"
              />
            </label>
          </div>

          <div className="form-row-checkboxes">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={edit.isPublished}
                onChange={(e) => setEdit({ ...edit, isPublished: e.target.checked })}
              />
              <span>Published on Leadership page</span>
            </label>
            <label className="order-input-wrap">
              <span>Display Order:</span>
              <input
                type="number"
                value={edit.displayOrder}
                onChange={(e) => setEdit({ ...edit, displayOrder: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="editor-actions">
            <button type="submit" className="button small">
              <Save size={14} /> Save Profile
            </button>
            <button type="button" className="button small ghost" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Profiles List */}
      <div className="admin-items-list">
        {items.map((item, idx) => (
          <article key={item.id} className="admin-record-row glass-panel">
            <div className="record-main-col">
              <span className={`status-badge ${item.isPublished !== false ? 'published' : 'draft'}`}>
                {item.isPublished !== false ? 'Published' : 'Draft'}
              </span>
              <div className="record-info">
                <h3>{item.name || `Leadership Profile 0${idx + 1}`}</h3>
                <span className="record-meta">
                  Title: <strong>{item.designation}</strong> · Role: {item.role || 'Director'} · Order:{' '}
                  {item.displayOrder}
                </span>
                <p className="record-desc-preview">{item.biography || item.shortBio}</p>
              </div>
            </div>

            <div className="record-actions-col">
              <button
                type="button"
                className="record-icon-btn"
                onClick={() =>
                  setEdit({
                    ...blankMember,
                    ...item,
                    name: item.name || '',
                    imageUrl: item.imageUrl || item.image || '',
                    skills: item.skills?.join(', ') || '',
                    expertise: item.expertise?.join(', ') || '',
                    linkedin: item.socialLinks?.linkedin || '',
                    github: item.socialLinks?.github || '',
                  })
                }
                title="Edit profile"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                className="record-icon-btn danger"
                onClick={() => handleDelete(item.id, item.name || 'this profile')}
                title="Delete profile"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 3. SERVICES MANAGER
// ============================================================================

const blankService = {
  title: '',
  description: '',
  features: '',
  displayOrder: 1,
  active: true,
};

export function ServicesManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Service[]>([]);
  const [edit, setEdit] = useState<(typeof blankService & { id?: string }) | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refresh = async () => {
    try {
      const records = await listAdminRecords<Service>('services');
      setItems(records);
    } catch {
      setNotice({ type: 'error', message: 'Could not load services.' });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!edit || !user) return;

    if (!edit.title.trim() || !edit.description.trim()) {
      setNotice({ type: 'error', message: 'Service title and description are required.' });
      return;
    }

    try {
      await saveAdminRecord(
        'services',
        edit.id,
        {
          ...edit,
          slug: edit.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
          features: edit.features.split(',').map((x) => x.trim()).filter(Boolean),
        },
        user.uid,
        user.email || '',
        edit.title
      );
      setEdit(null);
      setNotice({ type: 'success', message: 'Service capability updated.' });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to save service.' });
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Engineering Spectrum</span>
          <h1>Services Management</h1>
          <p>Configure and update technical service offerings displayed across the public website.</p>
        </div>
        <button
          type="button"
          className="button small"
          onClick={() => setEdit({ ...blankService, displayOrder: items.length + 1 })}
        >
          <Plus size={14} /> Add Service
        </button>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {edit && (
        <form className="admin-editor glass-panel" onSubmit={handleSave}>
          <div className="editor-top-bar">
            <h2>{edit.id ? 'Edit Service' : 'New Service'}</h2>
            <button type="button" className="close-editor-btn" onClick={() => setEdit(null)}>
              <X size={16} />
            </button>
          </div>

          <label>
            Service Title *
            <input
              required
              value={edit.title}
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              placeholder="e.g. Next-Gen Web Development"
            />
          </label>

          <label>
            Description *
            <textarea
              required
              rows={3}
              value={edit.description}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              placeholder="Comprehensive summary of what Crezonices delivers in this domain..."
            />
          </label>

          <label>
            Key Capabilities & Features (Comma-separated)
            <textarea
              rows={2}
              value={edit.features}
              onChange={(e) => setEdit({ ...edit, features: e.target.value })}
              placeholder="Architecture Consulting, 3D Web Systems, Zero-Trust Hardening"
            />
          </label>

          <div className="form-row-checkboxes">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={edit.active}
                onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
              />
              <span>Active (Visible on public Services page)</span>
            </label>
            <label className="order-input-wrap">
              <span>Display Order:</span>
              <input
                type="number"
                value={edit.displayOrder}
                onChange={(e) => setEdit({ ...edit, displayOrder: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="editor-actions">
            <button type="submit" className="button small">
              <Save size={14} /> Save Service
            </button>
            <button type="button" className="button small ghost" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-items-list">
        {items.map((item) => (
          <article key={item.id} className="admin-record-row glass-panel">
            <div className="record-main-col">
              <span className={`status-badge ${item.active ? 'published' : 'draft'}`}>
                {item.active ? 'Active' : 'Inactive'}
              </span>
              <div className="record-info">
                <h3>{item.title}</h3>
                <p className="record-desc-preview">{item.description}</p>
              </div>
            </div>

            <div className="record-actions-col">
              <button
                type="button"
                className="record-icon-btn"
                onClick={() =>
                  setEdit({
                    ...blankService,
                    ...item,
                    features: item.features?.join(', ') || '',
                  })
                }
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                className="record-icon-btn danger"
                onClick={async () => {
                  if (confirm(`Delete service "${item.title}"?`)) {
                    await deleteAdminRecord('services', item.id, user?.uid || '', user?.email || '', item.title);
                    refresh();
                  }
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 4. REVIEWS & TESTIMONIALS MANAGER
// ============================================================================

export function ReviewsManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refresh = async () => {
    try {
      const records = await listAdminRecords<Review>('reviews');
      setItems(records);
    } catch {
      setNotice({ type: 'error', message: 'Could not load reviews.' });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Reputation & Social Proof</span>
          <h1>Reviews & Client Testimonials</h1>
          <p>
            Moderate, verify, and publish real client endorsements. Only administrator-approved reviews
            appear publicly.
          </p>
        </div>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
        </div>
      )}

      <div className="admin-empty-card glass-panel">
        <Star size={24} className="text-amber" />
        <h3>Verified Reviews System Active</h3>
        <p>
          Per company integrity standards, no fabricated testimonials are pre-loaded. Verified client
          reviews submitted through enterprise feedback channels can be published here.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// 5. CONTACT ENQUIRIES MANAGER
// ============================================================================

export function EnquiriesManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContactEnquiry[]>([]);
  const [filter, setFilter] = useState<'all' | EnquiryStatus>('all');
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refresh = async () => {
    try {
      const records = await listAdminRecords<ContactEnquiry>('enquiries', 'createdAt');
      setItems(records);
    } catch {
      setNotice({ type: 'error', message: 'Could not load client enquiries.' });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  async function handleStatusChange(id: string, status: EnquiryStatus) {
    try {
      await updateEnquiryStatus(id, status, '', user?.uid || '', user?.email || '');
      setNotice({ type: 'success', message: `Marked enquiry as ${status}.` });
      refresh();
      if (selected && selected.id === id) {
        setSelected({ ...selected, status });
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to update enquiry status.' });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete enquiry from ${name}?`)) return;
    try {
      await deleteAdminRecord('enquiries', id, user?.uid || '', user?.email || '', `Enquiry: ${name}`);
      setNotice({ type: 'success', message: 'Enquiry deleted.' });
      setSelected(null);
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to delete enquiry.' });
    }
  }

  const filtered = items.filter((x) => filter === 'all' || x.status === filter);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Direct Channel Gateway</span>
          <h1>Client Enquiries</h1>
          <p>Inspect, track, and manage requests submitted through public enquiry and contact channels.</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={refresh}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-filter-bar glass-panel">
        <div className="filter-pill-group">
          {(['all', 'new', 'pending', 'in-progress', 'resolved'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-pill-btn ${filter === st ? 'active' : ''}`}
              onClick={() => setFilter(st)}
            >
              {st.toUpperCase()} (
              {st === 'all' ? items.length : items.filter((x) => x.status === st || (!x.status && st === 'new')).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="admin-items-list">
        {filtered.map((item) => (
          <article
            key={item.id}
            className={`admin-record-row glass-panel clickable ${item.status === 'new' ? 'unread' : ''}`}
            onClick={() => setSelected(item)}
          >
            <div className="record-main-col">
              <span className={`status-badge ${item.status || 'new'}`}>
                {(item.status || 'new').toUpperCase()}
              </span>
              <div className="record-info">
                <h3>{item.name}</h3>
                <span className="record-meta">
                  Email: <strong>{item.email}</strong> · Service:{' '}
                  <strong>{item.serviceNeeded || 'General Inquiry'}</strong>
                </span>
                <p className="record-desc-preview">{item.message}</p>
              </div>
            </div>

            <div className="record-actions-col" onClick={(e) => e.stopPropagation()}>
              <select
                className="status-dropdown"
                value={item.status || 'new'}
                onChange={(e) => handleStatusChange(item.id, e.target.value as EnquiryStatus)}
              >
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                type="button"
                className="record-icon-btn danger"
                onClick={() => handleDelete(item.id, item.name)}
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="admin-empty-card glass-panel">
            <MessageSquare size={24} className="text-muted" />
            <p>No enquiries found in this category.</p>
          </div>
        )}
      </div>

      {/* Selected Enquiry Detail Modal */}
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">Client Communication</span>
                <h2>{selected.name}</h2>
              </div>
              <button type="button" className="close-editor-btn" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-detail-row">
                <span className="detail-label">Client Email:</span>
                <a href={`mailto:${selected.email}`} className="detail-value link">
                  {selected.email}
                </a>
              </div>
              {selected.serviceNeeded && (
                <div className="modal-detail-row">
                  <span className="detail-label">Service Needed:</span>
                  <span className="detail-value">{selected.serviceNeeded}</span>
                </div>
              )}
              {selected.budgetRange && (
                <div className="modal-detail-row">
                  <span className="detail-label">Budget Range:</span>
                  <span className="detail-value">{selected.budgetRange}</span>
                </div>
              )}
              <div className="modal-detail-block">
                <span className="detail-label">Message Payload:</span>
                <div className="enquiry-message-box">{selected.message}</div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="status-change-group">
                <span>Update State:</span>
                <button
                  type="button"
                  className="button small"
                  onClick={() => handleStatusChange(selected.id, 'resolved')}
                >
                  <CheckCircle2 size={14} /> Mark Resolved
                </button>
              </div>
              <button type="button" className="button small ghost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// 6. WEBSITE CONTENT & PAGE MANAGEMENT
// ============================================================================

export function WebsiteContentManager() {
  const { user } = useAuth();
  const [content, setContent] = useState<PageContent>({
    id: 'homepage',
    eyebrow: 'Pioneering Intelligent Systems',
    title: 'Architecting intelligent solutions for an interconnected future.',
    description:
      'Crezonices engineers advanced products, neural software architectures, and cybersecurity solutions that bridge complex technologies with real-world impact.',
    ctaPrimaryLabel: 'Explore our projects',
    ctaPrimaryLink: '/projects',
    ctaSecondaryLabel: 'Discover our services',
    ctaSecondaryLink: '/services',
  });
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getAdminRecord<PageContent>('pageContent', 'homepage').then((res) => {
      if (res) setContent(res);
    });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      await saveAdminRecord(
        'pageContent',
        'homepage',
        { ...content },
        user.uid,
        user.email || '',
        'Homepage Content'
      );
      setNotice({ type: 'success', message: 'Homepage copy updated and synchronized in real time!' });
    } catch {
      setNotice({ type: 'error', message: 'Failed to update homepage content.' });
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Dynamic Content Engine</span>
          <h1>Website Content Management</h1>
          <p>Edit homepage editorial headlines, subheadings, and calls to action without modifying source code.</p>
        </div>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
        </div>
      )}

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <h2>Homepage Hero Section</h2>
        <label>
          Hero Eyebrow Tagline
          <input
            value={content.eyebrow || ''}
            onChange={(e) => setContent({ ...content, eyebrow: e.target.value })}
          />
        </label>
        <label>
          Hero Main Headline
          <textarea
            rows={2}
            value={content.title || ''}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
          />
        </label>
        <label>
          Supporting Narrative
          <textarea
            rows={3}
            value={content.description || ''}
            onChange={(e) => setContent({ ...content, description: e.target.value })}
          />
        </label>

        <div className="form-grid-2">
          <label>
            Primary Button Label
            <input
              value={content.ctaPrimaryLabel || ''}
              onChange={(e) => setContent({ ...content, ctaPrimaryLabel: e.target.value })}
            />
          </label>
          <label>
            Primary Button Route
            <input
              value={content.ctaPrimaryLink || ''}
              onChange={(e) => setContent({ ...content, ctaPrimaryLink: e.target.value })}
            />
          </label>
        </div>

        <div className="editor-actions">
          <button type="submit" className="button small">
            <Save size={14} /> Save Content Changes
          </button>
        </div>
      </form>
    </section>
  );
}

// ============================================================================
// 7. CONTACT INFO & SETTINGS MANAGERS
// ============================================================================

export function ContactInfoManager() {
  const { user } = useAuth();
  const [info, setInfo] = useState({
    email: 'crezonices@gmail.com',
    phone: '',
    address: 'Bengaluru, India',
    officeHours: 'Monday – Friday, 9:00 AM – 6:00 PM IST',
    responseTime: '< 24 Hours Response Guarantee',
  });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getAdminRecord<typeof info>('siteSettings', 'contact').then((res) => {
      if (res) setInfo((prev) => ({ ...prev, ...res }));
    });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      await saveAdminRecord('siteSettings', 'contact', info, user.uid, user.email || '', 'Contact Information');
      setNotice('Contact details updated successfully.');
    } catch {
      setNotice('Failed to update contact info.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Corporate Channels</span>
          <h1>Contact Information</h1>
          <p>Update official public email addresses, phone contacts, and operating guarantees.</p>
        </div>
      </div>

      {notice && <div className="admin-alert success"><span>{notice}</span></div>}

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <div className="form-grid-2">
          <label>
            Official Company Email *
            <input
              type="email"
              required
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
            />
          </label>
          <label>
            Response Time Guarantee
            <input
              value={info.responseTime}
              onChange={(e) => setInfo({ ...info, responseTime: e.target.value })}
            />
          </label>
        </div>
        <div className="form-grid-2">
          <label>
            Office Hours
            <input
              value={info.officeHours}
              onChange={(e) => setInfo({ ...info, officeHours: e.target.value })}
            />
          </label>
          <label>
            Headquarters / Operational Location
            <input
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
            />
          </label>
        </div>
        <div className="editor-actions">
          <button type="submit" className="button small">
            <Save size={14} /> Update Contact Info
          </button>
        </div>
      </form>
    </section>
  );
}

export function SocialMediaManager() {
  const { user } = useAuth();
  const [social, setSocial] = useState({
    linkedin: 'https://linkedin.com/company/crezonices',
    github: 'https://github.com/crezonices',
    twitter: '',
    instagram: '',
    youtube: '',
  });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getAdminRecord<typeof social>('siteSettings', 'social').then((res) => {
      if (res) setSocial((prev) => ({ ...prev, ...res }));
    });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      await saveAdminRecord('siteSettings', 'social', social, user.uid, user.email || '', 'Social Links');
      setNotice('Social media links saved.');
    } catch {
      setNotice('Failed to save social links.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">External Channels</span>
          <h1>Social Media Links</h1>
          <p>Manage verified external profiles rendered in the global navigation and footer.</p>
        </div>
      </div>

      {notice && <div className="admin-alert success"><span>{notice}</span></div>}

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <label>
          LinkedIn Corporate Page URL
          <input
            type="url"
            value={social.linkedin}
            onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
          />
        </label>
        <label>
          GitHub Organization URL
          <input
            type="url"
            value={social.github}
            onChange={(e) => setSocial({ ...social, github: e.target.value })}
          />
        </label>
        <label>
          Twitter / X URL
          <input
            type="url"
            value={social.twitter}
            onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
          />
        </label>
        <div className="editor-actions">
          <button type="submit" className="button small">
            <Save size={14} /> Save Social Links
          </button>
        </div>
      </form>
    </section>
  );
}

export function WebsiteSettingsManager() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    siteTitle: 'Crezonices — Engineering Advanced Digital Solutions',
    metaDescription:
      'Crezonices architects intelligent products, neural software systems, and cybersecurity solutions for an interconnected future.',
    footerCopyright: '© 2026 Crezonices. All rights reserved.',
    maintenanceMode: false,
  });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getAdminRecord<typeof settings>('siteSettings', 'general').then((res) => {
      if (res) setSettings((prev) => ({ ...prev, ...res }));
    });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      await saveAdminRecord('siteSettings', 'general', settings, user.uid, user.email || '', 'General Settings');
      setNotice('Website settings saved.');
    } catch {
      setNotice('Failed to save settings.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">System Configuration</span>
          <h1>Website Settings</h1>
          <p>Global site-wide configuration, metadata, and appearance controls.</p>
        </div>
      </div>

      {notice && <div className="admin-alert success"><span>{notice}</span></div>}

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <label>
          Global Website Title
          <input
            value={settings.siteTitle}
            onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
          />
        </label>
        <label>
          Global Meta Description (SEO / OpenGraph)
          <textarea
            rows={2}
            value={settings.metaDescription}
            onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
          />
        </label>
        <label>
          Footer Copyright Notice
          <input
            value={settings.footerCopyright}
            onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
          />
        </label>
        <div className="editor-actions">
          <button type="submit" className="button small">
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </form>
    </section>
  );
}

export function AdministratorsManager() {
  const { user } = useAuth();

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Access Control</span>
          <h1>Administrator Management</h1>
          <p>Security protocols, authenticated session telemetry, and role verification.</p>
        </div>
      </div>

      <div className="admin-records glass-panel">
        <div className="admin-auth-card">
          <div className="auth-card-top">
            <ShieldCheck size={28} className="text-cyan" />
            <div>
              <h3>Active Administrator Session</h3>
              <span className="auth-email">{user?.email}</span>
            </div>
          </div>

          <div className="auth-spec-grid">
            <div className="spec-box">
              <span>Authentication Provider</span>
              <strong>Firebase Auth (Email/Pass)</strong>
            </div>
            <div className="spec-box">
              <span>Security Privilege</span>
              <strong className="text-cyan">Custom Claim: role='admin'</strong>
            </div>
            <div className="spec-box">
              <span>Public Registration</span>
              <strong className="text-amber">Disabled (Zero Trust)</strong>
            </div>
          </div>
        </div>

        <div className="admin-security-instructions">
          <h4>Adding Additional Administrators</h4>
          <p>
            To onboard an additional authorized administrator without exposing root secrets or creating
            public registration vectors, execute the privileged setup script in your local environment:
          </p>
          <pre className="code-snippet">node scripts/set-admin-claims.mjs &lt;FIREBASE_USER_UID&gt;</pre>
        </div>
      </div>
    </section>
  );
}

export function ActivityLogsViewer() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const records = await listActivityLogs(50);
      setLogs(records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Audit Trail</span>
          <h1>Administrative Activity Logs</h1>
          <p>Chronological audit trail of content creations, modifications, and deletions.</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={fetchLogs}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh Logs
        </button>
      </div>

      <div className="admin-activity-timeline glass-panel">
        {logs.map((log) => (
          <div key={log.id} className="timeline-item">
            <span className="timeline-dot" />
            <div className="timeline-info">
              <div className="timeline-action-row">
                <strong className="action-title">{log.action.replace(/_/g, ' ').toUpperCase()}</strong>
                <span className="action-collection">[{log.collection}]</span>
                <span className="action-target">{log.targetTitle}</span>
              </div>
              <span className="action-meta">
                by {log.adminEmail} · {log.details}
              </span>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="admin-empty-card">
            <Clock size={20} className="text-muted" />
            <p>No activity logs recorded yet. Changes made in the dashboard will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function PageManagementManager() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState<'home' | 'projects' | 'about' | 'services' | 'founders' | 'contact'>('home');
  const [notice, setNotice] = useState<string | null>(null);

  const [pageData, setPageData] = useState({
    eyebrow: '',
    title: '',
    copy: '',
    badge: '',
  });

  useEffect(() => {
    getAdminRecord<typeof pageData>('pageContent', selectedPage).then((res) => {
      if (res) setPageData(res);
      else {
        // Local defaults
        if (selectedPage === 'projects') {
          setPageData({
            eyebrow: 'Projects & Engineering Portfolio',
            title: 'Intelligent systems, applications, and technology in development.',
            copy: 'Explore the projects, technological concepts, and digital solutions engineered by the Crezonices team.',
            badge: 'Live Portfolio',
          });
        } else if (selectedPage === 'founders') {
          setPageData({
            eyebrow: 'Directors & Leadership',
            title: 'Meet the Directors of Crezonices.',
            copy: 'Leadership, vision and direction behind Crezonices. Our two Directors combine strategic technological vision, technical craft, and an unwavering commitment to engineering integrity.',
            badge: 'Executive Board',
          });
        }
      }
    });
  }, [selectedPage]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      await saveAdminRecord(
        'pageContent',
        selectedPage,
        pageData,
        user.uid,
        user.email || '',
        `Page Content: ${selectedPage}`
      );
      setNotice(`Updated content for ${selectedPage} page.`);
    } catch {
      setNotice('Failed to update page content.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Multi-Page Architecture</span>
          <h1>Page Management</h1>
          <p>Customize hero headlines, eyebrows, and badges across all six public website pages.</p>
        </div>
      </div>

      {notice && <div className="admin-alert success"><span>{notice}</span></div>}

      <div className="admin-tab-row glass-panel">
        {(['home', 'projects', 'about', 'services', 'founders', 'contact'] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={`admin-tab-btn ${selectedPage === p ? 'active' : ''}`}
            onClick={() => setSelectedPage(p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <h2>{selectedPage.toUpperCase()} Hero Settings</h2>
        <label>
          Hero Eyebrow
          <input
            value={pageData.eyebrow}
            onChange={(e) => setPageData({ ...pageData, eyebrow: e.target.value })}
          />
        </label>
        <label>
          Page Title / Headline
          <textarea
            rows={2}
            value={pageData.title}
            onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
          />
        </label>
        <label>
          Hero Narrative Copy
          <textarea
            rows={3}
            value={pageData.copy}
            onChange={(e) => setPageData({ ...pageData, copy: e.target.value })}
          />
        </label>
        <label>
          Status Badge Tag
          <input
            value={pageData.badge}
            onChange={(e) => setPageData({ ...pageData, badge: e.target.value })}
          />
        </label>

        <div className="editor-actions">
          <button type="submit" className="button small">
            <Save size={14} /> Save Page Content
          </button>
        </div>
      </form>
    </section>
  );
}
