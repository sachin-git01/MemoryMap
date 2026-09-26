import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';

export const OtpVerificationCard = ({ email, devOtp, onVerified, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { verifyOtp, resendOtp } = useAuth();
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      return setError('Please enter a valid 6-digit verification code.');
    }

    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, cleanOtp);
      if (onVerified) {
        onVerified();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid or expired code. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await resendOtp(email);
      setSuccessMsg(res?.message || 'New verification code sent to your email.');
      setCountdown(60);
      setOtp('');
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="glass-card rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl text-center">
      {/* Icon Header */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-inner">
        <span className="text-2xl">📬</span>
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
        Verify Your Email
      </h2>
      <p className="mt-1.5 text-xs text-slate-500 font-sans leading-relaxed">
        We sent a 6-digit confirmation code to:
      </p>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-800">
        <span>📧</span>
        <span className="truncate max-w-[220px]">{email}</span>
      </div>

      <p className="mt-2 text-[11px] text-slate-400 font-medium">
        (Please check your <strong>Spam / Junk</strong> folder if not visible in Inbox)
      </p>

      {/* Alerts */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 text-left animate-slide-up">
          {getIcon('close', { size: 14 })}
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 text-left animate-slide-up">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleVerify} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
            6-Digit Verification Code
          </label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(val);
              if (error) setError('');
            }}
            placeholder="······"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-center font-mono text-3xl font-black tracking-[0.4em] text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
          />
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            Code expires in 10 minutes
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full rounded-full bg-[#0B1530] py-3.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:bg-[#122048] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              {getIcon('right', { size: 14 })}
            </>
          )}
        </button>
      </form>

      {/* Resend and Back Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-xs font-semibold">
        <div className="flex items-center justify-center gap-1.5 text-slate-500">
          <span>Didn't receive the email?</span>
          {countdown > 0 ? (
            <span className="font-bold text-slate-400">
              Resend in <strong className="font-mono text-slate-700">{countdown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-sky-600 hover:text-sky-700 underline transition-colors cursor-pointer"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          )}
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Change email or re-enter details
          </button>
        )}
      </div>
    </div>
  );
};
