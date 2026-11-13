import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { ShieldAlert, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';

export function ChangePasswordPage() {
  const { user, refreshClaims } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  // Password strength checks
  const hasLength = newPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isStrong = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!isStrong) {
      setError('Please satisfy all password security requirements before proceeding.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    if (!user) {
      setError('No active authenticated session found. Please sign in again.');
      return;
    }

    setBusy(true);
    try {
      await updatePassword(user, newPassword);
      setSuccess(true);

      // Attempt to refresh user token claims
      setTimeout(async () => {
        try {
          await refreshClaims();
        } catch {
          // ignore
        }
      }, 500);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('This sensitive action requires a fresh login. Please log in again with your credentials.');
      } else {
        setError(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  const handleProceed = async () => {
    await refreshClaims();
    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <main className="admin-login">
      <div>
        <Logo size="md" />
        <span className="eyebrow text-amber">
          <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          First-Login Password Initialization
        </span>
        <h1>Establish your permanent password.</h1>
        <p>
          You are authenticated as <strong>{user?.email}</strong> using an initial temporary credential.
          To protect privileged access to the Crezonices production infrastructure, you must establish
          a permanent, high-entropy password before entering the administrator dashboard.
        </p>
      </div>

      <div className="admin-card glass-panel" style={{ maxWidth: 480 }}>
        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-alert success" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={20} />
              <span>Permanent administrator password updated and activated in Firebase!</span>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your new password is now active. To complete claim verification, you may run:
            </p>
            <pre className="code-snippet">node scripts/clear-temp-password.mjs {user?.email}</pre>
            <button
              type="button"
              className="button"
              onClick={handleProceed}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Continue to Admin Dashboard <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2>Set New Administrator Password</h2>

            <label>
              New Password *
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong permanent password"
                autoComplete="new-password"
              />
            </label>

            {/* Live Security Criteria Checklist */}
            <div style={{ background: 'var(--bg-surface-secondary)', padding: '12px 14px', borderRadius: 8, fontSize: 12 }}>
              <strong style={{ display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>Password Criteria:</strong>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li style={{ color: hasLength ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                  {hasLength ? '✓' : '○'} At least 10 characters ({newPassword.length}/10)
                </li>
                <li style={{ color: hasUpper ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                  {hasUpper ? '✓' : '○'} At least one uppercase letter (A-Z)
                </li>
                <li style={{ color: hasLower ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                  {hasLower ? '✓' : '○'} At least one lowercase letter (a-z)
                </li>
                <li style={{ color: hasNumber ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                  {hasNumber ? '✓' : '○'} At least one number (0-9)
                </li>
                <li style={{ color: hasSpecial ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                  {hasSpecial ? '✓' : '○'} At least one special symbol (!@#$%^&*)
                </li>
              </ul>
            </div>

            <label>
              Confirm New Password *
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password to confirm"
                autoComplete="new-password"
              />
            </label>

            {error && <div className="admin-alert error">{error}</div>}

            <button
              className="button"
              type="submit"
              disabled={busy || !isStrong || !passwordsMatch}
            >
              <Lock size={15} /> {busy ? 'Encrypting & Updating…' : 'Activate Permanent Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
