import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Package, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { getRememberedUsername, isRememberMeEnabled } from '../utils/authStorage';

const features = [
  'Record products & warehouses',
  'Track stock in / stock out',
  'Daily, weekly & monthly reports',
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => getRememberedUsername());
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => isRememberMeEnabled());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, rememberMe);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative flex flex-col justify-between overflow-hidden bg-slate-950 px-8 py-10 text-white lg:w-[44%] lg:px-12 lg:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-600/30 via-transparent to-transparent" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary-200">
            <Package className="h-3.5 w-3.5" />
            StockHub Ltd · Kigali
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Stock Management System
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
            Digital inventory for wholesale and retail — products, warehouses, transactions, and reports in one place.
          </p>
        </div>
        <ul className="relative mt-10 hidden space-y-3 text-sm text-slate-300 sm:block">
          {features.map((text) => (
            <li key={text} className="flex items-center gap-2 transition hover:translate-x-1">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-400" />
              {text}
            </li>
          ))}
        </ul>
        <p className="relative mt-8 text-xs text-slate-500">© StockHub Ltd</p>
      </section>

      <section className="flex flex-1 items-center justify-center bg-slate-100 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="panel p-8 hover:shadow-lg">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-950">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your store manager credentials</p>
            </div>

            <Alert type="error" message={error} onClose={() => setError('')} />

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="e.g. admin"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={rememberMe ? 'current-password' : 'off'}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 transition hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 transition focus:ring-primary-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary-700 transition hover:text-primary-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
                <LogIn className="h-4 w-4" />
                {loading ? 'Signing in…' : 'Sign in to dashboard'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New user?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary-700 transition hover:text-primary-800 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
