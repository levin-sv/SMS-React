import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(username, newPassword);
      setSuccess('Password reset successfully. Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="panel w-full max-w-md p-8 hover:shadow-lg">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-950">Forgot password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your username and choose a new password
          </p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="fp-username">Username</label>
            <input
              id="fp-username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label" htmlFor="fp-password">New password</label>
            <input
              id="fp-password"
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="fp-confirm">Confirm new password</label>
            <input
              id="fp-confirm"
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
            <KeyRound className="h-4 w-4" />
            {loading ? 'Updating…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
