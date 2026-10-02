import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';

const REMEMBER_EMAIL_KEY = 'memorymap_remembered_email';

export const LoginPage = () => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = 6-digit OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);
  const { sendOtp, verifyOtp, resendOtp, loginDemo } = useAuth();
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
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

  // Focus OTP input on step 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Step 1: Request 6-digit OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return setError('Please enter a valid email address.');
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      localStorage.setItem(REMEMBER_EMAIL_KEY, trimmed);
      const res = await sendOtp(trimmed);
      setSuccessMsg(res?.message || 'Verification code sent! Check your inbox.');
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and log in
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return setError('Please enter the complete 6-digit verification code.');
    }

    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, cleanOtp);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.data?.message || err.message || 'Invalid or expired code. Please try again.');
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await resendOtp(email);
      setSuccessMsg(res?.message || 'A fresh verification code was sent to your email.');
      setCooldown(60);
      setOtp('');
    } catch (err) {
      setError(err?.data?.message || err.message || 'Could not resend code. Please try again later.');
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
          {/* Logo & Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              {getIcon('mail', { size: 28 })}
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {step === 1 ? 'Sign In with OTP' : 'Enter Verification Code'}
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-500 font-sans">
              {step === 1
                ? 'Passwordless login. We will send a secure 6-digit code to your email.'
                : `We sent a 6-digit login code to:`}
            </p>
            {step === 2 && (
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="text-xs font-semibold text-theme-primary hover:underline"
                >
                  Change
                </button>
              </div>
            )}
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

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none font-sans"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    {getIcon('right', { size: 16 })}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: 6-Digit OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      if (val.length === 6) {
                        // Automatically trigger submission on 6 digits
                        setTimeout(() => {
                          const submitBtn = document.getElementById('verify-otp-btn');
                          if (submitBtn) submitBtn.click();
                        }, 50);
                      }
                    }}
                    className="w-full text-center text-2xl font-black tracking-[0.5em] rounded-2xl border-2 border-slate-200 bg-slate-50/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-mono"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Didn't receive it? Check your Spam or Junk folder.
                </p>
              </div>

              <button
                id="verify-otp-btn"
                type="submit"
                disabled={loading || otp.length !== 6}
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

              {/* Resend Section */}
              <div className="pt-2 text-center">
                {cooldown > 0 ? (
                  <span className="text-xs font-semibold text-slate-400">
                    Resend code in <strong className="text-slate-700">{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs font-bold text-theme-primary hover:underline transition-all"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Divider */}
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
            {step === 1 ? (
              <>
                New to MemoryMap?{' '}
                <Link to="/signup" className="text-theme-primary font-bold hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-slate-600 hover:text-slate-900 font-bold"
              >
                ← Use a different email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
