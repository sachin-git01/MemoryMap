import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';
import { OtpVerificationCard } from '../components/OtpVerificationCard';

const REMEMBER_EMAIL_KEY = 'memorymap_remembered_email';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
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
      if (err.requiresVerification) {
        setVerifyingEmail(err.email || email.trim());
        setDevOtp(err.devOtp || '');
      } else {
        setError(err.message || "Failed to log in. Please check your credentials.");
      }
      setLoading(false);
    }
  };

  if (verifyingEmail) {
    return (
      <div className="page-enter relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-50 via-white to-rose-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 journey-grid-bg opacity-20"></div>
        <div className="absolute right-[20%] top-[20%] h-80 w-80 rounded-full bg-theme-primary/10 blur-[100px] animate-pulse-slow"></div>

        <div className="auth-card-enter relative w-full max-w-md">
          <OtpVerificationCard
            email={verifyingEmail}
            devOtp={devOtp}
            onVerified={() => navigate('/dashboard', { replace: true })}
            onCancel={() => setVerifyingEmail('')}
          />
        </div>
      </div>
    );
  }

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
          <div className="mb-8 text-center">
            <img src="/logo.png" alt="MemoryMap" className="mx-auto h-12 w-12 object-contain drop-shadow-sm" />
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-sans">
              Welcome back
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-500 font-sans">
              Log in to continue building your private memory journeys.
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
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {getIcon(showPassword ? 'eyeoff' : 'eye', { size: 16 })}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Remember email
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Log In
                  {getIcon('right', { size: 14 })}
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {getIcon('star', { size: 14 })}
            Explore in Demo Mode
          </button>

          <p className="mt-8 text-center text-xs font-semibold text-slate-500 font-sans">
            Don't have a private account?{' '}
            <Link to="/signup" className="font-bold text-theme-primary transition-colors hover:text-theme-accent">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
