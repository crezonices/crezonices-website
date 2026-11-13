import { useState, useEffect } from 'react';
import {
  Activity,
  Briefcase,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Home,
  Layers,
  Layout,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PanelLeft,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '../../lib/firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import {
  getDashboardMetrics,
  listActivityLogs,
  type DashboardMetrics,
} from '../content/contentStore';
import type { AdminActivityLog } from '../../types/models';

export const ADMIN_NAV_LINKS = [
  { label: 'Overview', to: '/admin/dashboard', icon: Home, end: true },
  { label: 'Website Content', to: '/admin/content', icon: FileText },
  { label: 'Page Management', to: '/admin/pages', icon: Layout },
  { label: 'Projects', to: '/admin/projects', icon: Briefcase },
  { label: 'Founders & Team', to: '/admin/founders', icon: Users },
  { label: 'Services', to: '/admin/services', icon: Layers },
  { label: 'Reviews & Testimonials', to: '/admin/reviews', icon: Star },
  { label: 'Contact Enquiries', to: '/admin/enquiries', icon: MessageSquare },
  { label: 'Contact Information', to: '/admin/contact-info', icon: Mail },
  { label: 'Social Media Links', to: '/admin/social', icon: Share2 },
  { label: 'Website Settings', to: '/admin/settings', icon: Settings },
  { label: 'Administrator Management', to: '/admin/administrators', icon: ShieldAlert },
  { label: 'Activity Logs', to: '/admin/activity', icon: Activity },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      navigate('/admin/login');
    } catch {
      // Navigate to login regardless
      navigate('/admin/login');
    }
  };

  return (
    <main className="admin-shell">
      {/* Mobile Top Bar */}
      <header className="admin-mobile-bar mobile-only">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle admin navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="admin-brand-inline">
          <ShieldCheck size={18} className="text-cyan" />
          <span>Crezonices CMS</span>
        </div>
        <button type="button" className="admin-quick-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </header>

      {/* Admin Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <ShieldCheck size={22} className="text-cyan" />
          <div>
            <span className="brand-name">Crezonices</span>
            <span className="brand-sub">Enterprise CMS v3.0</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Administrator navigation">
          {ADMIN_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={16} className="nav-icon" />
                <span className="nav-label">{link.label}</span>
                <ChevronRight size={13} className="nav-arrow" />
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <span className="user-dot active" />
            <div className="user-info">
              <span className="user-email" title={user?.email || 'Administrator'}>
                {user?.email || 'admin@crezonices.com'}
              </span>
              <span className="user-role">Super Administrator</span>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-backdrop mobile-only"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Workspace Area */}
      <section className="admin-workspace">
        <header className="workspace-header">
          <div className="workspace-title-wrap">
            <PanelLeft size={16} className="text-cyan" />
            <span>Operational Console · Secure Firestore Synchronized</span>
          </div>
          <div className="workspace-header-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="view-live-site-btn">
              <Globe size={14} /> View Live Website
            </a>
          </div>
        </header>

        <div className="workspace-content-pane">
          <Outlet />
        </div>
      </section>
    </main>
  );
}

/**
 * 1. Admin Overview Section with Live Metrics from Firestore
 */
export function AdminOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    totalTeam: 0,
    totalServices: 0,
    publishedReviews: 0,
    newEnquiries: 0,
    pendingEnquiries: 0,
    resolvedEnquiries: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [m, logs] = await Promise.all([getDashboardMetrics(), listActivityLogs(6)]);
      setMetrics(m);
      setRecentLogs(logs);
    } catch {
      // Use fallback zeros
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">Enterprise Intelligence</span>
          <h1>System Overview & Live Metrics</h1>
          <p>
            Real-time operational metrics across projects, directorship records, client enquiries, and
            content channels.
          </p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={fetchStats} title="Refresh metrics">
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-stats-grid">
        <article className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-label">Projects</span>
            <Briefcase size={16} className="text-cyan" />
          </div>
          <strong className="stat-number">{metrics.totalProjects}</strong>
          <span className="stat-sub">
            {metrics.publishedProjects} Published · {metrics.draftProjects} Draft
          </span>
          <NavLink to="/admin/projects" className="stat-link">
            Manage projects <ChevronRight size={13} />
          </NavLink>
        </article>

        <article className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-label">Directors & Team</span>
            <Users size={16} className="text-amber" />
          </div>
          <strong className="stat-number">{metrics.totalTeam}</strong>
          <span className="stat-sub">Verified Corporate Profiles</span>
          <NavLink to="/admin/founders" className="stat-link">
            Manage profiles <ChevronRight size={13} />
          </NavLink>
        </article>

        <article className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-label">Active Services</span>
            <Layers size={16} className="text-cyan" />
          </div>
          <strong className="stat-number">{metrics.totalServices}</strong>
          <span className="stat-sub">Engineering Capabilities</span>
          <NavLink to="/admin/services" className="stat-link">
            Manage services <ChevronRight size={13} />
          </NavLink>
        </article>

        <article className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-label">Client Enquiries</span>
            <MessageSquare size={16} className="text-amber" />
          </div>
          <strong className="stat-number">{metrics.newEnquiries}</strong>
          <span className="stat-sub">
            {metrics.newEnquiries} New · {metrics.pendingEnquiries} In Progress
          </span>
          <NavLink to="/admin/enquiries" className="stat-link">
            View enquiries <ChevronRight size={13} />
          </NavLink>
        </article>

        <article className="stat-card glass-panel">
          <div className="stat-card-header">
            <span className="stat-label">Approved Reviews</span>
            <Star size={16} className="text-cyan" />
          </div>
          <strong className="stat-number">{metrics.publishedReviews}</strong>
          <span className="stat-sub">Client Testimonials</span>
          <NavLink to="/admin/reviews" className="stat-link">
            Manage reviews <ChevronRight size={13} />
          </NavLink>
        </article>
      </div>

      {/* Quick Action Bar */}
      <div className="admin-quick-actions-bar glass-panel">
        <span className="quick-actions-label">Quick Actions:</span>
        <div className="action-buttons-wrap">
          <NavLink to="/admin/projects" className="button small">
            <Plus size={14} /> Add Project
          </NavLink>
          <NavLink to="/admin/founders" className="button small ghost">
            <Plus size={14} /> Add Team Member
          </NavLink>
          <NavLink to="/admin/content" className="button small ghost">
            <FileText size={14} /> Edit Homepage Copy
          </NavLink>
          <NavLink to="/admin/enquiries" className="button small ghost">
            <MessageSquare size={14} /> Review Inquiries ({metrics.newEnquiries})
          </NavLink>
        </div>
      </div>

      {/* Recent Activity Audit Trail */}
      <div className="admin-section-block">
        <div className="section-block-header">
          <h2>Recent Administrative Activity</h2>
          <NavLink to="/admin/activity" className="view-all-link">
            View all logs <ChevronRight size={14} />
          </NavLink>
        </div>

        {recentLogs.length > 0 ? (
          <div className="admin-activity-timeline glass-panel">
            {recentLogs.map((log) => (
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
          </div>
        ) : (
          <div className="admin-empty-card glass-panel">
            <Clock size={20} className="text-muted" />
            <p>
              Administrative audit logs are initialized. Modifications made across projects, team, and
              services will be recorded chronologically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
