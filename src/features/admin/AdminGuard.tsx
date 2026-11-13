import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function AdminGuard() {
  const { loading, user, isAdmin, mustChangePassword, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="placeholder">
        <p>Verifying administrator session…</p>
      </main>
    );
  }

  if (error) {
    return <Navigate to="/admin/login" replace state={{ message: error }} />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Enforce mandatory password change on first login before dashboard access
  if (mustChangePassword && location.pathname !== '/admin/change-password') {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <Outlet />;
}
