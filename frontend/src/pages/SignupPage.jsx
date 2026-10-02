import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';

export const SignupPage = () => {
  const [step, setStep] = useState(1); // 1 = Registration Form (Name, Email, Password), 2 = 6-digit OTP verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);
  const { signup, verifySignupOtp, resendSignupOtp } = useAuth();
  const navigate = useNavigate();

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

  // Step 1: Submit Registration Form (Password + Email) -> Brevo sends OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await signup(name, email, password);
      setSuccessMsg(res?.message || 'Verification code sent to your email!');
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return setError('Please enter the complete 6-digit verification code.');
    }

    setError('');
    setLoading(true);

    try {
      await verifySignupOtp(email, cleanOtp);
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
      const res = await resendSignupOtp(email);
      setSuccessMsg(res?.message || 'A fresh code was sent to your email.');
      setCooldown(60);
      setOtp('');
    } catch (err) {
      setError(err?.data?.message || err.message || 'Could not resend code. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-50 via-white to-rose-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 journey-grid-bg opacity-20"></div>
      <div className="absolute left-[15%] bottom-[15%] h-80 w-80 rounded-full bg-theme-primary/10 blur-[100px] animate-pulse-slow"></div>

      <div className="auth-card-enter relative w-full max-w-md">
        <Link to="/" className="absolute -top-12 left-0 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-800">
          {getIcon('left', { size: 14 })}
          Back to Home
        </Link>

        <div className="glass-card rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              {step === 1 ? getIcon('user', { size: 28 }) : getIcon('mail', { size: 28 })}
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
            </h2>
            <p className="mt-1.5 text-xs font-medium text-slate-500 font-sans">
              {step === 1
                ? 'Sign up with your email and password. We will send an OTP to verify your account.'
                : `Enter the 6-digit code sent to:`}
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

          {/* Step 1: Registration Form with Name, Email & Password */}
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    {getIcon('user', { size: 17 })}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex River"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-theme-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-theme-primary/10 transition-all font-sans"
                  />
                </div>
              </div>

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
                    placeholder="Min. 6 characters"
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

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    {getIcon('lock', { size: 17 })}
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Send OTP</span>
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
                        setTimeout(() => {
                          const submitBtn = document.getElementById('signup-verify-btn');
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
                id="signup-verify-btn"
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
                    <span>Verify & Enter Dashboard</span>
                    {getIcon('check', { size: 16 })}
                  </>
                )}
              </button>

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

          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-theme-primary font-bold hover:underline">
              Log in with Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
