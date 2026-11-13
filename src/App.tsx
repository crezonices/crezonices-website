import { Route, Routes } from 'react-router-dom';
import { Navigation } from './components/navigation/Navigation';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { PageMetadata } from './components/layout/PageMetadata';
import { PointerGlow } from './components/effects/PointerGlow';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AboutPage } from './pages/AboutPage';
import { FoundersPage } from './pages/FoundersPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminGuard } from './features/admin/AdminGuard';
import { AdminDashboard, AdminOverview } from './features/admin/AdminDashboard';
import { AdminLoginPage } from './features/admin/AdminLoginPage';
import {
  ActivityLogsViewer,
  AdministratorsManager,
  ContactInfoManager,
  EnquiriesManager,
  PageManagementManager,
  ProjectsManager,
  ReviewsManager,
  ServicesManager,
  SocialMediaManager,
  TeamManager,
  WebsiteContentManager,
  WebsiteSettingsManager,
} from './features/admin/ContentManagers';

export function App() {
  return (
    <>
      <PointerGlow />
      <ScrollToTop />
      <PageMetadata />
      <Routes>
        {/* Administrator Authentication */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Enterprise Admin Dashboard (All 13 Fully-Functional Modules) */}
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="content" element={<WebsiteContentManager />} />
            <Route path="pages" element={<PageManagementManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="founders" element={<TeamManager />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="reviews" element={<ReviewsManager />} />
            <Route path="enquiries" element={<EnquiriesManager />} />
            <Route path="contact-info" element={<ContactInfoManager />} />
            <Route path="social" element={<SocialMediaManager />} />
            <Route path="settings" element={<WebsiteSettingsManager />} />
            <Route path="administrators" element={<AdministratorsManager />} />
            <Route path="activity" element={<ActivityLogsViewer />} />
          </Route>
        </Route>

        {/* Public Website Routes */}
        <Route
          path="*"
          element={
            <>
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/founders" element={<FoundersPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}
