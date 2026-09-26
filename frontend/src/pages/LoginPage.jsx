import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';

const REMEMBER_EMAIL_KEY = 'memorymap_remembered_email';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY) || localStorage.getItem('photoflow_remembered_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError("Please fill in all fields.");
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log in. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await login("demo@memorymap.com", "demopassword");
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError("Failed to start demo.");
      setLoading(false);
    }
  };

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-50 via-white to-rose-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 journey-grid-bg opacity-20"></div>
      <div className="absolute right-[20%] top-[20%] h-80 w-80 rounded-full bg-theme-primary/10 blur-[100px] animate-pulse-slow"></div>

      <div className="auth-card-enter relative w-full max-w-md">
        <Link to="/" className="absolute -top-12 left-0 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800">
          {getIcon('left', { size: 14 })}
          Back to Home
        </Link>

        <div className="glass-card rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="MemoryMap" className="mx-auto h-12 w-12 object-contain drop-shadow-sm" />
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-sans">
              Welcome Back
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-500 font-sans">
              Log in to access your memory maps and moments.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 animate-slide-up">
              {getIcon('close', { size: 14 })}
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  {getIcon('mail', { size: 17 })}
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  {getIcon('lock', { size: 17 })}
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {getIcon(showPassword ? 'eyeOff' : 'eye', { size: 17 })}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                Remember email
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none font-sans"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  {getIcon('right', { size: 16 })}
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300 font-sans"
          >
            <span>✨</span>
            <span>Instant Demo Mode (1-Click)</span>
          </button>

          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-theme-primary font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
