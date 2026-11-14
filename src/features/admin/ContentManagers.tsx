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
import { getApiUrl } from '../../lib/api';
import { ImageUploader } from '../../components/common/ImageUploader';
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
  AdminUser,
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
  gallery: [] as string[],
  projectUrl: '',
  githubUrl: '',
  completionDate: '',
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
      setNotice({ type: 'error', message: 'Logo URL must be HTTPS.' });
      return;
    }
    if (edit.projectUrl && !urlIsSafe(edit.projectUrl)) {
      setNotice({ type: 'error', message: 'Project URL must use secure HTTPS protocol.' });
      return;
    }
    if (edit.githubUrl && !urlIsSafe(edit.githubUrl)) {
      setNotice({ type: 'error', message: 'GitHub URL must use secure HTTPS protocol.' });
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
          imageUrl: edit.coverImageUrl || edit.logoUrl,
          gallery: edit.gallery || [],
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

  const handleAddGalleryImage = (url: string) => {
    if (!edit) return;
    if (edit.gallery.includes(url)) return;
    setEdit({ ...edit, gallery: [...edit.gallery, url] });
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (!edit) return;
    setEdit({
      ...edit,
      gallery: edit.gallery.filter((_, idx) => idx !== indexToRemove),
    });
  };

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
            Full Architecture Description (Optional)
            <textarea
              rows={4}
              value={edit.fullDescription}
              onChange={(e) => setEdit({ ...edit, fullDescription: e.target.value })}
              placeholder="Detailed technical overview and problem statement..."
            />
          </label>

          {/* GOOGLE DRIVE IMAGE UPLOADERS */}
          <div className="form-grid-2">
            <ImageUploader
              label="Project Logo (Optional)"
              currentUrl={edit.logoUrl}
              folder="Project Logos"
              onUploadSuccess={(res) => setEdit({ ...edit, logoUrl: res.url })}
              onRemove={() => setEdit({ ...edit, logoUrl: '' })}
              helperText="Uploads directly to Google Drive 'Project Logos' folder"
            />
            <ImageUploader
              label="Cover Image (Optional)"
              currentUrl={edit.coverImageUrl}
              folder="Project Images"
              onUploadSuccess={(res) => setEdit({ ...edit, coverImageUrl: res.url })}
              onRemove={() => setEdit({ ...edit, coverImageUrl: '' })}
              helperText="Hero / banner image for the project"
            />
          </div>

          {/* PROJECT GALLERY MULTI-IMAGE UPLOADER */}
          <div className="gallery-manager-wrap glass-panel" style={{ padding: 14, marginBottom: 14, borderRadius: 8 }}>
            <span className="uploader-label" style={{ display: 'block', marginBottom: 6 }}>
              Multiple Gallery Images ({edit.gallery.length} uploaded)
            </span>
            <ImageUploader
              label="Add Image to Gallery"
              folder="Project Images"
              onUploadSuccess={(res) => handleAddGalleryImage(res.url)}
              helperText="Upload screenshots, mockups, and UI assets into the project gallery"
            />
            {edit.gallery.length > 0 && (
              <div className="gallery-strip">
                {edit.gallery.map((gUrl, idx) => (
                  <div key={idx} className="gallery-thumb-wrap">
                    <img src={gUrl} alt={`Gallery item ${idx + 1}`} />
                    <button
                      type="button"
                      className="gallery-remove-btn"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      title="Remove from gallery"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-grid-2">
            <label>
              Live Project / Demo Link
              <input
                type="url"
                value={edit.projectUrl}
                onChange={(e) => setEdit({ ...edit, projectUrl: e.target.value })}
                placeholder="https://project.example.com"
              />
            </label>
            <label>
              GitHub Repository Link (Optional)
              <input
                type="url"
                value={edit.githubUrl}
                onChange={(e) => setEdit({ ...edit, githubUrl: e.target.value })}
                placeholder="https://github.com/crezonices/repo"
              />
            </label>
          </div>

          <div className="form-grid-2">
            <label>
              Technologies & Tools (Comma-separated)
              <input
                value={edit.technologies}
                onChange={(e) => setEdit({ ...edit, technologies: e.target.value })}
                placeholder="React, TypeScript, Three.js, IoT, Node.js"
              />
            </label>
            <label>
              Completion Date (Optional)
              <input
                type="text"
                value={edit.completionDate}
                onChange={(e) => setEdit({ ...edit, completionDate: e.target.value })}
                placeholder="e.g. Q4 2026 or November 2026"
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
                  {item.gallery && item.gallery.length > 0 && ` · Gallery: ${item.gallery.length} imgs`}
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
                    gallery: item.gallery || [],
                    completionDate: item.completionDate || '',
                    technologies: item.technologies?.join(', ') || '',
                  })
                }
                title="Edit project (Admin 1 Action)"
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
            <ImageUploader
              label="Director / Team Profile Image"
              currentUrl={edit.imageUrl}
              folder="Directors & Team"
              onUploadSuccess={(res) => setEdit({ ...edit, imageUrl: res.url })}
              onRemove={() => setEdit({ ...edit, imageUrl: '' })}
              helperText="Uploads directly to Google Drive 'Directors & Team' folder"
            />
            <div>
              <label>
                LinkedIn Profile URL
                <input
                  type="url"
                  value={edit.linkedin}
                  onChange={(e) => setEdit({ ...edit, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/director"
                />
              </label>
              <label style={{ marginTop: 12 }}>
                GitHub Profile URL (Optional)
                <input
                  type="url"
                  value={edit.github}
                  onChange={(e) => setEdit({ ...edit, github: e.target.value })}
                  placeholder="https://github.com/director"
                />
              </label>
            </div>
          </div>

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
  detailedDescription: '',
  imageUrl: '',
  icon: 'Layers',
  features: '',
  technologies: '',
  startingPrice: '',
  ctaLabel: 'Enquire About Capability',
  ctaUrl: '/contact',
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
      setNotice({ type: 'error', message: 'Service title and short description are required.' });
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
          technologies: edit.technologies ? edit.technologies.split(',').map((x) => x.trim()).filter(Boolean) : [],
          isPublished: edit.active,
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

          <div className="form-grid-2">
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
              Icon Indicator (Optional)
              <input
                value={edit.icon}
                onChange={(e) => setEdit({ ...edit, icon: e.target.value })}
                placeholder="Globe, Shield, Brain, Layers, Cpu, Server"
              />
            </label>
          </div>

          <label>
            Short Description * (Displayed on service overview cards)
            <textarea
              required
              rows={2}
              value={edit.description}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              placeholder="Concise summary of what Crezonices delivers in this domain..."
            />
          </label>

          <label>
            Detailed Architecture Description (Optional)
            <textarea
              rows={4}
              value={edit.detailedDescription}
              onChange={(e) => setEdit({ ...edit, detailedDescription: e.target.value })}
              placeholder="Comprehensive architectural deep dive for this service capability..."
            />
          </label>

          <ImageUploader
            label="Service Illustration / Showcase Image (Optional)"
            currentUrl={edit.imageUrl}
            folder="Service Images"
            onUploadSuccess={(res) => setEdit({ ...edit, imageUrl: res.url })}
            onRemove={() => setEdit({ ...edit, imageUrl: '' })}
            helperText="Uploads directly to Google Drive 'Service Images' folder"
          />

          <label>
            Key Capabilities & Features (Comma-separated deliverables)
            <textarea
              rows={2}
              value={edit.features}
              onChange={(e) => setEdit({ ...edit, features: e.target.value })}
              placeholder="Architecture Consulting, 3D Web Systems, Zero-Trust Hardening, CI/CD Automation"
            />
          </label>

          <div className="form-grid-3">
            <label>
              Technologies & Stacks
              <input
                value={edit.technologies}
                onChange={(e) => setEdit({ ...edit, technologies: e.target.value })}
                placeholder="React, Three.js, Docker"
              />
            </label>
            <label>
              Starting Price / Engagement (Optional)
              <input
                value={edit.startingPrice}
                onChange={(e) => setEdit({ ...edit, startingPrice: e.target.value })}
                placeholder="e.g. Custom Scope or $5,000+"
              />
            </label>
            <label>
              Call To Action Label
              <input
                value={edit.ctaLabel}
                onChange={(e) => setEdit({ ...edit, ctaLabel: e.target.value })}
                placeholder="Enquire About Capability"
              />
            </label>
          </div>

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
                <span className="record-meta">
                  Order: {item.displayOrder} · {item.features?.length || 0} Deliverables
                  {item.startingPrice && ` · From: ${item.startingPrice}`}
                </span>
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
                    technologies: item.technologies?.join(', ') || '',
                    detailedDescription: item.detailedDescription || '',
                    imageUrl: item.imageUrl || item.image || '',
                    icon: item.icon || 'Layers',
                    startingPrice: item.startingPrice || '',
                    ctaLabel: item.ctaLabel || 'Enquire About Capability',
                    ctaUrl: item.ctaUrl || '/contact',
                  })
                }
                title="Edit service (Admin 1 Action)"
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
                title="Delete service"
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

const blankReview = {
  reviewerName: '',
  reviewerDesignation: '',
  company: '',
  companyLogo: '',
  productImage: '',
  reviewText: '',
  rating: 5,
  imageUrl: '',
  relatedProject: '',
  testimonialDate: '',
  featured: false,
  displayOrder: 1,
  isPublished: true,
};

export function ReviewsManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [edit, setEdit] = useState<(typeof blankReview & { id?: string }) | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const records = await listAdminRecords<Review>('reviews', 'displayOrder');
      setItems(records);
    } catch {
      setNotice({ type: 'error', message: 'Could not load client testimonials from Firestore.' });
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

    if (!edit.reviewerName.trim() || !edit.reviewText.trim()) {
      setNotice({ type: 'error', message: 'Customer name and testimonial text are required.' });
      return;
    }

    try {
      await saveAdminRecord(
        'reviews',
        edit.id,
        {
          ...edit,
          customerName: edit.reviewerName,
          testimonialText: edit.reviewText,
          published: edit.isPublished,
        },
        user.uid,
        user.email || '',
        `Review by ${edit.reviewerName}`
      );
      setEdit(null);
      setNotice({ type: 'success', message: `Testimonial by "${edit.reviewerName}" saved successfully.` });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to persist review record to Firestore.' });
    }
  }

  async function togglePublish(item: Review) {
    if (!user) return;
    const nextStatus = !item.isPublished && !item.published;
    try {
      await saveAdminRecord(
        'reviews',
        item.id,
        {
          ...item,
          isPublished: nextStatus,
          published: nextStatus,
        },
        user.uid,
        user.email || '',
        `Review by ${item.reviewerName || 'Client'}`
      );
      setNotice({
        type: 'success',
        message: `Testimonial ${nextStatus ? 'published publicly' : 'converted to draft'}.`,
      });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Could not update publication state.' });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the testimonial by "${name}"?`)) return;
    try {
      await deleteAdminRecord('reviews', id, user?.uid || '', user?.email || '', `Review by ${name}`);
      setNotice({ type: 'success', message: `Deleted testimonial by "${name}".` });
      refresh();
    } catch {
      setNotice({ type: 'error', message: 'Failed to delete review record.' });
    }
  }

  const filtered = items.filter((r) => {
    const isPub = r.isPublished === true || r.published === true;
    if (filter === 'published') return isPub;
    if (filter === 'draft') return !isPub;
    return true;
  });

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Reputation & Social Proof</span>
          <h1>Reviews & Client Testimonials</h1>
          <p>Moderate, verify, and publish real client endorsements. Only administrator-approved reviews appear publicly.</p>
        </div>
        <button
          type="button"
          className="button small"
          onClick={() => setEdit({ ...blankReview, displayOrder: items.length + 1 })}
        >
          <Plus size={14} /> New Testimonial
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

      {/* Filter Bar */}
      <div className="admin-filter-bar glass-panel">
        <div className="filter-pill-group">
          {(['all', 'published', 'draft'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`button small ${filter === mode ? '' : 'ghost'}`}
              onClick={() => setFilter(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)} ({mode === 'all' ? items.length : items.filter((r) => (mode === 'published' ? r.isPublished || r.published : !(r.isPublished || r.published))).length})
            </button>
          ))}
        </div>
        <button type="button" className="button small ghost" onClick={refresh} title="Refresh list">
          <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Editor Modal */}
      {edit && (
        <form className="admin-editor glass-panel" onSubmit={handleSave}>
          <div className="editor-top-bar">
            <h3>{edit.id ? 'Edit Testimonial' : 'Create New Testimonial'}</h3>
            <button type="button" className="close-editor-btn" onClick={() => setEdit(null)}>
              <X size={16} />
            </button>
          </div>

          <div className="form-grid-2">
            <label>
              Customer / Reviewer Name *
              <input
                required
                value={edit.reviewerName}
                onChange={(e) => setEdit({ ...edit, reviewerName: e.target.value })}
                placeholder="e.g. Dr. Elena Vance"
              />
            </label>
            <label>
              Professional Designation & Role (Optional)
              <input
                value={edit.reviewerDesignation}
                onChange={(e) => setEdit({ ...edit, reviewerDesignation: e.target.value })}
                placeholder="e.g. VP of Infrastructure Engineering"
              />
            </label>
          </div>

          <div className="form-grid-2">
            <label>
              Company / Organization Name (Optional)
              <input
                value={edit.company}
                onChange={(e) => setEdit({ ...edit, company: e.target.value })}
                placeholder="e.g. Global Distributed Systems Ltd."
              />
            </label>
            <label>
              Star Rating (1 – 5 Stars)
              <select
                value={edit.rating}
                onChange={(e) => setEdit({ ...edit, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Testimonial Text *
            <textarea
              required
              rows={4}
              value={edit.reviewText}
              onChange={(e) => setEdit({ ...edit, reviewText: e.target.value })}
              placeholder="Enter verified client testimonial or project endorsement..."
            />
          </label>

          {/* GOOGLE DRIVE IMAGE UPLOADERS FOR TESTIMONIAL */}
          <div className="form-grid-3">
            <ImageUploader
              label="Customer Profile Photo"
              currentUrl={edit.imageUrl}
              folder="Testimonials"
              onUploadSuccess={(res) => setEdit({ ...edit, imageUrl: res.url })}
              onRemove={() => setEdit({ ...edit, imageUrl: '' })}
              helperText="Uploads to 'Testimonials' folder"
            />
            <ImageUploader
              label="Company Logo (Optional)"
              currentUrl={edit.companyLogo}
              folder="Project Logos"
              onUploadSuccess={(res) => setEdit({ ...edit, companyLogo: res.url })}
              onRemove={() => setEdit({ ...edit, companyLogo: '' })}
              helperText="Uploads to 'Project Logos' folder"
            />
            <ImageUploader
              label="Product Image (Optional)"
              currentUrl={edit.productImage}
              folder="Product Images"
              onUploadSuccess={(res) => setEdit({ ...edit, productImage: res.url })}
              onRemove={() => setEdit({ ...edit, productImage: '' })}
              helperText="Uploads to 'Product Images' folder"
            />
          </div>

          <div className="form-grid-2">
            <label>
              Related Project / Engagement (Optional)
              <input
                value={edit.relatedProject}
                onChange={(e) => setEdit({ ...edit, relatedProject: e.target.value })}
                placeholder="e.g. Connected Operations Suite"
              />
            </label>
            <label>
              Testimonial Date (Optional)
              <input
                type="text"
                value={edit.testimonialDate}
                onChange={(e) => setEdit({ ...edit, testimonialDate: e.target.value })}
                placeholder="e.g. October 2026"
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
              <span>Published publicly on website</span>
            </label>
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={edit.featured}
                onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
              />
              <span>Mark as Featured testimonial</span>
            </label>
            <label className="order-input-wrap">
              <span>Display Order:</span>
              <input
                type="number"
                min={1}
                value={edit.displayOrder}
                onChange={(e) => setEdit({ ...edit, displayOrder: Number(e.target.value) || 1 })}
              />
            </label>
          </div>

          <div className="editor-actions">
            <button type="button" className="button small ghost" onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button type="submit" className="button small">
              <Save size={14} /> Save Testimonial
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      <div className="admin-records glass-panel">
        {filtered.map((item) => {
          const isPub = item.isPublished === true || item.published === true;
          return (
            <article key={item.id} className="admin-record-row glass-panel">
              <div className="record-info">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.reviewerName} className="url-preview-thumb" />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: 'var(--bg-surface-secondary)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--color-amber)',
                    }}
                  >
                    <Star size={20} />
                  </div>
                )}
                <div className="record-main-col">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <strong>{item.reviewerName}</strong>
                    <span className={`status-pill ${isPub ? 'published' : 'draft'}`}>
                      {isPub ? 'Published' : 'Draft'}
                    </span>
                    {item.featured && (
                      <span className="folder-pill" style={{ borderColor: 'var(--color-amber)', color: 'var(--color-amber)' }}>
                        Featured
                      </span>
                    )}
                    <span style={{ color: 'var(--color-amber)', fontSize: 12 }}>
                      {'★'.repeat(item.rating || 5)}{'☆'.repeat(5 - (item.rating || 5))}
                    </span>
                  </div>
                  <div className="record-meta">
                    {item.reviewerDesignation && <span>{item.reviewerDesignation}</span>}
                    {item.company && <span>· {item.company}</span>}
                    {item.relatedProject && <span>· Project: {item.relatedProject}</span>}
                    <span>· Order #{item.displayOrder || 1}</span>
                  </div>
                  <p className="record-desc-preview" title={item.reviewText}>
                    "{item.reviewText}"
                  </p>
                </div>
              </div>

              <div className="record-actions-col">
                <button
                  type="button"
                  className="record-icon-btn"
                  onClick={() => togglePublish(item)}
                  title={isPub ? 'Unpublish' : 'Publish'}
                >
                  {isPub ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className="record-icon-btn"
                  onClick={() =>
                    setEdit({
                      ...blankReview,
                      ...item,
                      reviewerName: item.reviewerName,
                      reviewerDesignation: item.reviewerDesignation || item.designation || '',
                      company: item.company || item.organization || '',
                      companyLogo: item.companyLogo || '',
                      productImage: item.productImage || '',
                      reviewText: item.reviewText,
                      rating: item.rating || 5,
                      imageUrl: item.imageUrl || item.image || '',
                      relatedProject: item.relatedProject || '',
                      testimonialDate: item.testimonialDate || '',
                      featured: item.featured || false,
                      displayOrder: item.displayOrder || 1,
                      isPublished: isPub,
                    })
                  }
                  title="Edit testimonial (Admin 1 Action)"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  className="record-icon-btn danger"
                  onClick={() => handleDelete(item.id, item.reviewerName)}
                  title="Delete testimonial"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="admin-empty-card glass-panel">
            <Star size={24} className="text-amber" />
            <p>
              {filter === 'all'
                ? 'No client testimonials stored in Firestore yet. Click "New Testimonial" to create your first endorsement.'
                : `No testimonials found with status "${filter}".`}
            </p>
          </div>
        )}
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
    whatsapp: '',
    address: 'Bengaluru, India',
    officeHours: 'Monday – Friday, 9:00 AM – 6:00 PM IST',
    responseTime: '< 24 Hours Response Guarantee',
    mapUrl: '',
    contactHeading: 'Direct Communications & Inquiries',
    contactDescription: 'Whether you have an inquiry regarding a new technology venture, web system, or research partnership, our engineers and directorship are ready to listen.',
    supportingContactText: 'Connect with our operational desk for immediate consultations, technical proposals, or strategic dialogues.',
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
      setNotice('Contact details and page editorial updated successfully.');
    } catch {
      setNotice('Failed to update contact info.');
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Corporate Channels</span>
          <h1>Contact Information & Inquiries CMS</h1>
          <p>Update official public email addresses, phone contacts, WhatsApp channels, and public page editorial.</p>
        </div>
      </div>

      {notice && <div className="admin-alert success"><span>{notice}</span></div>}

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <h2>Direct Communication Gateways</h2>
        <div className="form-grid-3">
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
            Contact Phone Number (Optional)
            <input
              type="tel"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              placeholder="+91 ..."
            />
          </label>
          <label>
            WhatsApp Communications Number (Optional)
            <input
              type="tel"
              value={info.whatsapp}
              onChange={(e) => setInfo({ ...info, whatsapp: e.target.value })}
              placeholder="+91 ... (with country code)"
            />
          </label>
        </div>

        <div className="form-grid-3">
          <label>
            Response Time Guarantee
            <input
              value={info.responseTime}
              onChange={(e) => setInfo({ ...info, responseTime: e.target.value })}
            />
          </label>
          <label>
            Operational Business Hours
            <input
              value={info.officeHours}
              onChange={(e) => setInfo({ ...info, officeHours: e.target.value })}
            />
          </label>
          <label>
            Operational Headquarters / Location
            <input
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
            />
          </label>
        </div>

        <label>
          Interactive Map / Location Embed URL (Optional)
          <input
            type="url"
            value={info.mapUrl}
            onChange={(e) => setInfo({ ...info, mapUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
          />
        </label>

        <h2 style={{ marginTop: 24 }}>Contact Page Editorial Copy</h2>
        <label>
          Contact Page Main Heading
          <input
            value={info.contactHeading}
            onChange={(e) => setInfo({ ...info, contactHeading: e.target.value })}
            placeholder="Direct Communications & Inquiries"
          />
        </label>
        <label>
          Contact Page Subtitle / Description
          <textarea
            rows={2}
            value={info.contactDescription}
            onChange={(e) => setInfo({ ...info, contactDescription: e.target.value })}
            placeholder="Whether you have an inquiry regarding a new technology venture..."
          />
        </label>
        <label>
          Supporting Contact Text (Inside Direct Channels card)
          <textarea
            rows={2}
            value={info.supportingContactText}
            onChange={(e) => setInfo({ ...info, supportingContactText: e.target.value })}
            placeholder="Connect with our operational desk for immediate consultations..."
          />
        </label>

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

  // Google Drive integration status
  const [driveStatus, setDriveStatus] = useState<{
    connected: boolean;
    account: string;
    mainFolderId: string;
    mainFolderName: string;
    folderAccessible: boolean;
    subfolders: string[];
    configuredSubfolders: string[];
    clientIdConfigured: boolean;
    redirectUri: string;
    error?: string;
  } | null>(null);
  const [checkingDrive, setCheckingDrive] = useState(false);

  const checkDrive = async () => {
    setCheckingDrive(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/google/status'));
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setDriveStatus(data);
      }
    } catch {
      // Backend offline or local fallback
    } finally {
      setCheckingDrive(false);
    }
  };

  useEffect(() => {
    getAdminRecord<typeof settings>('siteSettings', 'general').then((res) => {
      if (res) setSettings((prev) => ({ ...prev, ...res }));
    });
    checkDrive();
  }, []);

  const handleConnectDrive = async () => {
    try {
      const res = await fetch(getApiUrl('/api/auth/google/url'));
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          alert(data.error || 'Google OAuth credentials or Redirect URI not configured in backend yet.');
          return;
        }
      }
      alert('The backend OAuth endpoint is not reachable on this domain. Ensure the backend server is running.');
    } catch (err: any) {
      alert(`Could not connect to backend OAuth endpoint: ${err.message}`);
    }
  };

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
          <h1>Website Settings & Cloud Integrations</h1>
          <p>Global site-wide configuration, metadata, and Google Drive cloud asset storage.</p>
        </div>
      </div>

      {notice && <div className="admin-alert success"><span>{notice}</span></div>}

      {/* GOOGLE DRIVE STORAGE INTEGRATION CARD */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <span className="eyebrow">Image Storage Provider</span>
            <h2 style={{ margin: 0, fontSize: 18 }}>Google Drive Assets Engine</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span
              className={`status-pill ${driveStatus?.connected ? 'published' : 'draft'}`}
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              {driveStatus?.connected ? 'Drive Connected & Verified' : 'OAuth Authorization Required'}
            </span>
            <button
              type="button"
              className="button small ghost"
              onClick={checkDrive}
              disabled={checkingDrive}
              title="Refresh Google Drive status"
            >
              <RefreshCw size={13} className={checkingDrive ? 'spin' : ''} /> Check Status
            </button>
          </div>
        </div>

        <div className="form-grid-2" style={{ marginBottom: 16 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Target Google Account:</span>
            <strong style={{ color: '#38bdf8' }}>crezonices@gmail.com</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Primary Drive Folder:</span>
            <strong style={{ color: '#38bdf8' }}>CREZONICES_WEBSITE_ASSETS</strong>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>(ID: 1ryzD2gXWu5xW4qybIGePyZAu0iL_Etbw)</span>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
            Configured Dedicated Subfolders:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              'Project Logos',
              'Project Images',
              'Testimonials',
              'Product Images',
              'Directors & Team',
              'Service Images',
              'Other Website Images',
            ].map((sf) => (
              <span key={sf} className="folder-pill">
                <CheckCircle2 size={12} /> {sf}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {!driveStatus?.connected ? (
            <button
              type="button"
              className="button small"
              onClick={handleConnectDrive}
            >
              Authorize crezonices@gmail.com with Google Drive
            </button>
          ) : (
            <button
              type="button"
              className="button small ghost"
              onClick={handleConnectDrive}
            >
              Re-authorize Google Account
            </button>
          )}

          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            OAuth Redirect URI:{' '}
            <code style={{ color: driveStatus?.redirectUri ? '#38bdf8' : '#f87171' }}>
              {driveStatus?.redirectUri || 'Not Configured (Requires HTTPS callback URL in production)'}
            </code>
          </span>
        </div>
      </div>

      <form className="admin-editor glass-panel" onSubmit={handleSave}>
        <h2>Website Global Metadata & SEO</h2>
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
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin' | 'editor'>('admin');

  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);

  const refreshAdmins = async () => {
    setLoading(true);
    try {
      const records = await listAdminRecords<AdminUser>('admins', 'createdAt');
      if (records.length > 0) {
        setAdmins(records);
      } else if (user) {
        // Fallback representation of active session user
        setAdmins([
          {
            uid: user.uid,
            email: user.email || 'admin@crezonices.com',
            displayName: user.displayName || 'Primary Administrator',
            role: 'superadmin',
            status: 'active',
            mustChangePassword: false,
          },
        ]);
      }
    } catch {
      setNotice({ type: 'error', message: 'Could not load administrator accounts from Firestore.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmins();
  }, [user]);

  async function handleCreateAdmin(e: FormEvent) {
    e.preventDefault();
    if (!user || !newAdminEmail.trim()) return;

    try {
      // Create Firestore metadata record
      const tempUid = `pending-${Date.now()}`;
      await saveAdminRecord(
        'admins',
        tempUid,
        {
          uid: tempUid,
          email: newAdminEmail.trim().toLowerCase(),
          displayName: newAdminName.trim() || `${newAdminEmail.split('@')[0]} Admin`,
          role: newAdminRole,
          status: 'active',
          mustChangePassword: true,
          createdBy: user.email || user.uid,
        },
        user.uid,
        user.email || '',
        `Admin account for ${newAdminEmail}`
      );

      setNotice({
        type: 'success',
        message: `Registered administrator metadata for "${newAdminEmail}". To finalize credentials, execute: node scripts/create-admin-user.mjs ${newAdminEmail} ${newAdminRole}`,
      });
      setShowAddModal(false);
      setNewAdminEmail('');
      setNewAdminName('');
      refreshAdmins();
    } catch {
      setNotice({ type: 'error', message: 'Failed to record administrator document.' });
    }
  }

  async function handleUpdateAdmin(e: FormEvent) {
    e.preventDefault();
    if (!editAdmin || !user) return;

    try {
      await saveAdminRecord(
        'admins',
        editAdmin.uid || editAdmin.id,
        {
          ...editAdmin,
          displayName: editAdmin.displayName || '',
          role: editAdmin.role,
        },
        user.uid,
        user.email || '',
        `Updated admin ${editAdmin.email}`
      );
      setNotice({ type: 'success', message: `Updated administrator profile for ${editAdmin.email}.` });
      setEditAdmin(null);
      refreshAdmins();
    } catch {
      setNotice({ type: 'error', message: 'Failed to update administrator profile.' });
    }
  }

  async function toggleStatus(targetAdmin: AdminUser) {
    if (!user) return;

    // Safety check: protect the last active administrator
    const activeAdmins = admins.filter((a) => a.status === 'active');
    if (targetAdmin.status === 'active' && activeAdmins.length <= 1) {
      alert('Safety Lockout Prevention: You cannot suspend or revoke the only remaining active administrator.');
      return;
    }

    const nextStatus = targetAdmin.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      nextStatus === 'suspended'
        ? `Are you sure you want to suspend administrator privileges for "${targetAdmin.email}"?`
        : `Reactivate administrator privileges for "${targetAdmin.email}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      await saveAdminRecord(
        'admins',
        targetAdmin.uid || targetAdmin.id,
        {
          ...targetAdmin,
          status: nextStatus,
        },
        user.uid,
        user.email || '',
        `${nextStatus === 'suspended' ? 'Suspended' : 'Reactivated'} admin ${targetAdmin.email}`
      );
      setNotice({
        type: 'success',
        message: `Administrator "${targetAdmin.email}" status updated to ${nextStatus}.`,
      });
      refreshAdmins();
    } catch {
      setNotice({ type: 'error', message: 'Failed to update administrator status.' });
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Access Governance</span>
          <h1>Administrator Management</h1>
          <p>Role-based access control, active administrative directories, and security audit integrity.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="button small ghost" onClick={refreshAdmins}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button type="button" className="button small" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Administrator
          </button>
        </div>
      </div>

      {notice && (
        <div className={`admin-alert ${notice.type === 'error' ? 'error' : 'success'}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Active Session Telemetry Card */}
      <div className="admin-auth-card glass-panel" style={{ marginBottom: 24 }}>
        <div className="auth-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ShieldCheck size={32} className="text-cyan" />
            <div>
              <span className="eyebrow" style={{ fontSize: 11, marginBottom: 2 }}>Current Active Session</span>
              <h3 style={{ margin: 0 }}>{user?.displayName || 'Primary Administrator'}</h3>
              <span className="auth-email">{user?.email}</span>
            </div>
          </div>
          <span className="status-pill published">Active Superadmin Session</span>
        </div>

        <div className="auth-spec-grid">
          <div className="spec-box">
            <span>Authentication Authority</span>
            <strong>Firebase Auth (HMAC / RSA Token)</strong>
          </div>
          <div className="spec-box">
            <span>Privilege Verification</span>
            <strong className="text-cyan">Custom Claim: admin == true</strong>
          </div>
          <div className="spec-box">
            <span>Public Registration</span>
            <strong className="text-amber">Disabled (Zero Trust)</strong>
          </div>
        </div>
      </div>

      {/* Add Administrator Modal */}
      {showAddModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Onboard New Administrator</h3>
              <button type="button" className="close-editor-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin}>
              <div className="modal-body">
                <label>
                  Administrator Email *
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. security-lead@crezonices.com"
                  />
                </label>
                <div className="form-grid-2">
                  <label>
                    Display Name
                    <input
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Lead Engineer"
                    />
                  </label>
                  <label>
                    Role Privilege
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as any)}
                    >
                      <option value="admin">Administrator (Full CMS)</option>
                      <option value="superadmin">Super Administrator (Root Access)</option>
                      <option value="editor">Content Editor (Read/Write CMS)</option>
                    </select>
                  </label>
                </div>

                <div className="admin-security-instructions" style={{ margin: '12px 0' }}>
                  <h4>Trusted Backend Provisioning Requirement</h4>
                  <p>
                    Per zero-trust security rules, administrative credentials and password hashes are never created in the browser.
                    Saving this form registers the administrator profile document. To generate the secure authentication credentials
                    and assign the custom claim, run the privileged CLI script:
                  </p>
                  <pre className="code-snippet">
                    node scripts/create-admin-user.mjs {newAdminEmail || '&lt;email&gt;'} {newAdminRole}
                  </pre>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button small ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button small">
                  <Save size={14} /> Register Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Administrator Modal */}
      {editAdmin && (
        <div className="admin-modal-backdrop" onClick={() => setEditAdmin(null)}>
          <div className="admin-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Administrator Profile</h3>
              <button type="button" className="close-editor-btn" onClick={() => setEditAdmin(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateAdmin}>
              <div className="modal-body">
                <label>
                  Email Identifier
                  <input type="email" disabled value={editAdmin.email} />
                </label>
                <label>
                  Display Name
                  <input
                    value={editAdmin.displayName || ''}
                    onChange={(e) => setEditAdmin({ ...editAdmin, displayName: e.target.value })}
                  />
                </label>
                <label>
                  Administrative Role
                  <select
                    value={editAdmin.role}
                    onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value as any })}
                  >
                    <option value="admin">Administrator</option>
                    <option value="superadmin">Super Administrator</option>
                    <option value="editor">Content Editor</option>
                  </select>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button small ghost" onClick={() => setEditAdmin(null)}>
                  Cancel
                </button>
                <button type="submit" className="button small">
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administrator Records Directory */}
      <div className="admin-records glass-panel">
        <h3 style={{ margin: '8px 0 16px', fontSize: 18 }}>Authorized Administrator Directory</h3>
        {admins.map((adm) => {
          const isActive = adm.status === 'active';
          const isCurrentUser = adm.email === user?.email;
          return (
            <article key={adm.uid || adm.email} className="admin-record-row glass-panel">
              <div className="record-info">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: 'var(--bg-surface-secondary)',
                    display: 'grid',
                    placeItems: 'center',
                    color: isActive ? 'var(--color-cyan)' : 'var(--color-amber)',
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div className="record-main-col">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <strong>{adm.displayName || adm.email}</strong>
                    {isCurrentUser && (
                      <span className="status-pill published" style={{ fontSize: 10 }}>
                        Current User
                      </span>
                    )}
                    <span className={`status-pill ${isActive ? 'published' : 'draft'}`}>
                      {adm.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: 'var(--color-cyan)',
                      }}
                    >
                      {adm.role?.toUpperCase() || 'ADMIN'}
                    </span>
                  </div>
                  <div className="record-meta">
                    <span>{adm.email}</span>
                    <span>· UID: {adm.uid || 'Synced'}</span>
                    {adm.mustChangePassword && <span className="text-amber">· Password reset required on next sign-in</span>}
                  </div>
                </div>
              </div>

              <div className="record-actions-col">
                <button
                  type="button"
                  className="record-icon-btn"
                  onClick={() => setEditAdmin(adm)}
                  title="Edit profile metadata"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  className={`record-icon-btn ${isActive ? 'danger' : ''}`}
                  onClick={() => toggleStatus(adm)}
                  title={isActive ? 'Suspend Administrator' : 'Reactivate Administrator'}
                >
                  {isActive ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </article>
          );
        })}

        {admins.length === 0 && !loading && (
          <div className="admin-empty-card glass-panel">
            <Users size={24} className="text-muted" />
            <p>No administrator metadata records found in Firestore collection 'admins'.</p>
          </div>
        )}
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
  const [selectedPage, setSelectedPage] = useState<'homepage' | 'projects' | 'about' | 'services' | 'founders' | 'contact'>('homepage');
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
        if (selectedPage === 'homepage') {
          setPageData({
            eyebrow: 'Pioneering Intelligent Systems',
            title: 'Architecting intelligent solutions for an interconnected future.',
            copy: 'Crezonices engineers advanced AI systems, digital platforms, and cybersecurity architectures.',
            badge: 'Intelligence In Sync',
          });
        } else if (selectedPage === 'projects') {
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
        } else if (selectedPage === 'about') {
          setPageData({
            eyebrow: 'About Crezonices',
            title: 'Building high-reliability software, autonomous intelligence, and secure cloud ecosystems.',
            copy: 'Founded on core principles of computational precision and secure architecture.',
            badge: 'Enterprise Engineering',
          });
        } else if (selectedPage === 'services') {
          setPageData({
            eyebrow: 'Capabilities & Solutions',
            title: 'Full-Spectrum Engineering for Modern Enterprises',
            copy: 'From autonomous AI agent architectures to battle-hardened cybersecurity.',
            badge: 'Full-Spectrum',
          });
        } else if (selectedPage === 'contact') {
          setPageData({
            eyebrow: 'Get In Touch',
            title: 'Start a Conversation',
            copy: 'Ready to engineer next-generation software or safeguard your infrastructure?',
            badge: 'Direct Access',
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
        {(['homepage', 'projects', 'about', 'services', 'founders', 'contact'] as const).map((p) => (
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
