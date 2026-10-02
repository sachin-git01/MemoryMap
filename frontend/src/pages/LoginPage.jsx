import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';

const REMEMBER_EMAIL_KEY = 'memorymap_remembered_email';

export const LoginPage = () => {
  // Modes: 'login' | 'forgot' | 'reset' | 'verify-unverified'
  const [mode, setMode] = useState('login');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot / Reset Password States
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Unverified Account OTP State
  const [verifyOtpVal, setVerifyOtpVal] = useState('');

  // UI Feedback States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);
  const { login, forgotPassword, resetPassword, verifySignupOtp, resendSignupOtp, loginDemo } = useAuth();
  const navigate = useNavigate();

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus OTP inputs when entering reset or verify-unverified mode
  useEffect(() => {
    if ((mode === 'reset' || mode === 'verify-unverified') && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [mode]);

  // Standard Login (Email + Password only, NO OTP needed!)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.requiresVerification || err.status === 403) {
        setSuccessMsg(err.message || 'Please verify your email before logging in.');
        setMode('verify-unverified');
        setCooldown(60);
      } else {
        setError(err?.data?.message || err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1 Forgot Password: Send 6-Digit OTP to Email
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setError('Please enter a valid email address.');
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await forgotPassword(cleanEmail);
      setSuccessMsg(res?.message || 'Password reset code has been sent to your email.');
      setMode('reset');
      setCooldown(60);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Reset Password: Verify OTP & Save New Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const cleanOtp = resetOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return setError('Please enter the 6-digit verification code.');
    }

    if (!newPassword || newPassword.length < 6) {
      return setError('New password must be at least 6 characters long.');
    }

    if (newPassword !== confirmNewPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await resetPassword(email, cleanOtp, newPassword);
      // Automatically logged in!
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.data?.message || err.message || 'Invalid code or password reset failed.');
      setLoading(false);
    }
  };

  // Resend Reset Password OTP
  const handleResendResetOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res?.message || 'A fresh reset code was sent to your email.');
      setCooldown(60);
      setResetOtp('');
    } catch (err) {
      setError(err?.data?.message || err.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Unverified Account Verification OTP
  const handleVerifyUnverifiedSubmit = async (e) => {
    e.preventDefault();
    const cleanOtp = verifyOtpVal.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return setError('Please enter the 6-digit verification code.');
    }

    setError('');
    setLoading(true);

    try {
      await verifySignupOtp(email, cleanOtp);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.data?.message || err.message || 'Invalid code.');
      setLoading(false);
    }
  };

  // Resend Unverified Account OTP
  const handleResendVerifyOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await resendSignupOtp(email);
      setSuccessMsg('A new verification code has been sent to your email.');
      setCooldown(60);
      setVerifyOtpVal('');
    } catch (err) {
      setError(err?.data?.message || err.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login (Instant 1-Click)
  const handleDemo = () => {
    loginDemo();
    navigate('/dashboard', { replace: true });
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

        <div className="glass-card rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              {mode === 'login' && getIcon('lock', { size: 28 })}
              {(mode === 'forgot' || mode === 'reset') && getIcon('shield', { size: 28 })}
              {mode === 'verify-unverified' && getIcon('mail', { size: 28 })}
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Set New Password'}
              {mode === 'verify-unverified' && 'Verify Your Email'}
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-500 font-sans">
              {mode === 'login' && 'Sign in using your email and password.'}
              {mode === 'forgot' && 'Enter your email to receive a 6-digit password reset code.'}
              {mode === 'reset' && `Enter the 6-digit code sent to ${email} and your new password.`}
              {mode === 'verify-unverified' && `Enter the 6-digit verification code sent to ${email}.`}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 animate-slide-up">
              {getIcon('close', { size: 14 })}
              <span>{error}</span>
            </div>
          )}

          {successMsg && !error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 animate-slide-up">
              {getIcon('check', { size: 14 })}
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Mode: Standard Login (Email + Password, NO OTP) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-xs font-bold text-theme-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    {getIcon('lock', { size: 17 })}
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
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
          )}

          {/* 2. Mode: Forgot Password (Enter Email -> Send 6-Digit OTP) */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none font-sans"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    {getIcon('right', { size: 16 })}
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Log In
                </button>
              </div>
            </form>
          )}

          {/* 3. Mode: Reset Password (Enter OTP + New Password) */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  6-Digit Reset Code
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] rounded-2xl border-2 border-slate-200 bg-slate-50/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-mono"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    {getIcon('lock', { size: 17 })}
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {getIcon(showNewPassword ? 'eyeOff' : 'eye', { size: 17 })}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    {getIcon('lock', { size: 17 })}
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || resetOtp.length !== 6}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none font-sans"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span>Saving New Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password & Enter</span>
                    {getIcon('check', { size: 16 })}
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Log In
                </button>
                {cooldown > 0 ? (
                  <span className="text-slate-400">
                    Resend in <strong>{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={loading}
                    className="font-bold text-theme-primary hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* 4. Mode: Verify Unverified Account (If user registered earlier but hadn't verified OTP yet) */}
          {mode === 'verify-unverified' && (
            <form onSubmit={handleVerifyUnverifiedSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  6-Digit Verification Code
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={verifyOtpVal}
                  onChange={(e) => setVerifyOtpVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] rounded-2xl border-2 border-slate-200 bg-slate-50/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || verifyOtpVal.length !== 6}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none font-sans"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    {getIcon('check', { size: 16 })}
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Log In
                </button>
                {cooldown > 0 ? (
                  <span className="text-slate-400">
                    Resend in <strong>{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerifyOtp}
                    disabled={loading}
                    className="font-bold text-theme-primary hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Divider */}
          {mode === 'login' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold">Or</span>
                </div>
              </div>

              {/* Instant Demo Mode */}
              <button
                type="button"
                onClick={handleDemo}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
