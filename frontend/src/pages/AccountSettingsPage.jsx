import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';

export const AccountSettingsPage = () => {
  const { currentUser, isDemoMode, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  // Profile Form
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [notice, setNotice] = useState(null);

  const isNewPasswordValid = newPassword.length >= 6;
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setProfileSaving(true);
    setNotice(null);

    try {
      await updateUserProfile({ displayName: displayName.trim() });
      setNotice({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your display name has been updated successfully.'
      });
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update your display name.'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setNotice({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please complete all password fields.'
      });
    }
    if (newPassword !== confirmPassword) {
      return setNotice({
        type: 'error',
        title: 'Passwords Mismatch',
        message: 'New password and confirm password do not match.'
      });
    }
    if (newPassword.length < 6) {
      return setNotice({
        type: 'error',
        title: 'Password Too Short',
        message: 'New password must be at least 6 characters.'
      });
    }

    setPasswordSaving(true);
    setNotice(null);

    try {
      await updateUserProfile({
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been securely updated.'
      });
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Password Change Failed',
        message: err.message || 'Could not update password. Please check your current password.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 page-enter">
      {/* Page Title */}
      <div className="border-b border-sky-100 pb-6">
        <h1 className="text-2xl font-serif font-black tracking-tight text-blue-950 sm:text-3xl">
          Account & Security
        </h1>
        <p className="mt-1 text-sm font-medium text-blue-900/60">
          Manage your personal credentials, profile name, and account security.
        </p>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

      {/* Account Status Card */}
      <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white/[0.85] p-6 sm:p-8 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-2xl font-black text-white shadow-md shadow-sky-500/20">
              {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-blue-950">
                  {currentUser?.displayName || 'User'}
                </h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                  isDemoMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isDemoMode ? 'Demo Guest Account' : 'Permanent Cloud Account'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {currentUser?.email || 'demo@memorymap.com'}
              </p>
            </div>
          </div>

          {isDemoMode ? (
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-xl bg-blue-950 px-5 py-3 text-xs font-extrabold text-white shadow-md transition-all hover:bg-blue-900"
            >
              Create Private Account
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-700">
              {getIcon('check', { size: 16 })}
              <span>Cloud Storage Active</span>
            </div>
          )}
        </div>

        {isDemoMode && (
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs font-medium leading-relaxed text-amber-900">
            <strong>Note:</strong> You are using MemoryMap in Demo Mode. Photos uploaded here are stored in temporary browser memory. To ensure your photos and journeys never get lost and remain accessible from any device, create a private account with permanent storage.
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-3xl border border-sky-100 bg-white/[0.85] p-6 sm:p-8 shadow-sm backdrop-blur-xl">
        <h3 className="text-base font-extrabold text-blue-950">
          Personal Profile
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Update how your name appears across your journeys and memory cards.
        </p>

        <form onSubmit={handleUpdateName} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-sky-100 bg-slate-50/70 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-3 text-xs font-semibold text-slate-500 cursor-not-allowed outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Email address is linked to your account authentication and cannot be changed.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving || displayName.trim() === currentUser?.displayName}
              className="rounded-xl bg-blue-950 px-6 py-3 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="rounded-3xl border border-sky-100 bg-white/[0.85] p-6 sm:p-8 shadow-sm backdrop-blur-xl">
        <h3 className="text-base font-extrabold text-blue-950">
          Security & Password
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Ensure your account uses a strong, secure password.
        </p>

        {isDemoMode ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs font-bold text-slate-600">
              Password management is not applicable in Demo Mode.
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Create a free private account to set up password security.
            </p>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="mt-4 rounded-xl bg-blue-950 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-900"
            >
              Sign Up for Private Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-sky-100 bg-slate-50/70 px-4 py-3 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {getIcon(showCurrentPassword ? 'eyeoff' : 'eye', { size: 16 })}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  New Password
                </label>
                {newPassword && (
                  <span className={`text-[10px] font-bold ${isNewPasswordValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isNewPasswordValid ? '✓ Minimum length met' : 'Min 6 characters'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-sky-100 bg-slate-50/70 px-4 py-3 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {getIcon(showNewPassword ? 'eyeoff' : 'eye', { size: 16 })}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Confirm New Password
                </label>
                {confirmPassword && (
                  <span className={`text-[10px] font-bold ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isMatch ? '✓ Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-sky-100 bg-slate-50/70 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-xl bg-blue-950 px-6 py-3 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
