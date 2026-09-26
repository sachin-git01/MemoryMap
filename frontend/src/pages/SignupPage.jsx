import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';
import { OtpVerificationCard } from '../components/OtpVerificationCard';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const isPasswordValid = password.length >= 6;
  const isMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setError('');
    setLoading(true);

    try {
      const res = await signup(email, password, name);
      if (res?.requiresVerification) {
        setVerifyingEmail(res.email);
        setDevOtp(res.devOtp || '');
        setLoading(false);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  if (verifyingEmail) {
    return (
      <div className="page-enter relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-50 via-white to-rose-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 journey-grid-bg opacity-20"></div>
        <div className="absolute left-[15%] bottom-[15%] h-80 w-80 rounded-full bg-theme-primary/10 blur-[100px] animate-pulse-slow"></div>

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

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-50 via-white to-rose-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 journey-grid-bg opacity-20"></div>
      <div className="absolute left-[15%] bottom-[15%] h-80 w-80 rounded-full bg-theme-primary/10 blur-[100px] animate-pulse-slow"></div>

      <div className="auth-card-enter relative w-full max-w-md">
        <Link to="/" className="absolute -top-12 left-0 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800">
          {getIcon('left', { size: 14 })}
          Back to Home
        </Link>

        <div className="glass-card rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <img src="/logo.png" alt="MemoryMap" className="mx-auto h-12 w-12 object-contain drop-shadow-sm" />
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-sans">
              Create Your Account
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-500 font-sans">
              Start documenting your life, love, or friendship milestones securely.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
              />
            </div>

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
                placeholder="jane@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                {password && (
                  <span className={`text-[10px] font-bold ${isPasswordValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isPasswordValid ? '✓ Minimum length met' : 'Min 6 characters'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Min 6 characters"
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Confirm Password
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isMatch ? '✓ Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {getIcon(showConfirmPassword ? 'eyeoff' : 'eye', { size: 16 })}
                </button>
              </div>
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
                  Create Private Account
                  {getIcon('right', { size: 14 })}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-semibold text-slate-500 font-sans">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-theme-primary transition-colors hover:text-theme-accent">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
