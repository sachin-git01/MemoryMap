import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useThemeSettings } from '../context/ThemeProvider';
import { getIcon } from '../utils/icons';
import { LogoutConfirmModal } from './LogoutConfirmModal';

export const Navbar = ({ onMenuToggle }) => {
  const { currentUser, logout } = useAuth();
  const { currentJourney, journeys, checkpoints, notes } = useJourney();
  const { themeConfig } = useThemeSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const isLandingPage = location.pathname === '/';
  
  const routeJourneyId = !isLandingPage ? (location.pathname.match(/^\/journey\/([^/]+)/)?.[1] || null) : null;
  const routeJourney = routeJourneyId ? journeys.find(journey => journey.id === routeJourneyId) : null;
  const displayJourney = routeJourneyId
    ? (currentJourney?.id === routeJourneyId ? currentJourney : routeJourney)
    : currentJourney;
  
  const isInJourney = displayJourney && !isLandingPage && location.pathname !== '/dashboard' && location.pathname !== '/create-journey';
  const canShowJourneyStats = !routeJourneyId || currentJourney?.id === routeJourneyId;

  // Calculate stats for current journey
  const getJourneyStats = () => {
    if (!isInJourney) return { checkpoints: 0, photos: 0, notes: 0, storage: '0 MB' };
    const photoCount = checkpoints.reduce((sum, cp) => sum + (cp.photos?.length || 0), 0);
    const notesCount = notes.length;
    const storageUsed = ((photoCount * 0.4) + (notesCount * 0.05)).toFixed(1);
    
    return {
      checkpoints: checkpoints.length,
      photos: photoCount,
      notes: notesCount,
      storage: `${storageUsed} MB`
    };
  };

  const stats = isInJourney ? getJourneyStats() : null;

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutConfirmOpen(false);
    navigate('/', { replace: true });
  };

  // Authenticated App Header
  if (currentUser && !isLandingPage) {
    return (
      <>
        <header className="sticky top-0 z-30 h-16 w-full border-b border-sky-100/80 bg-white/80 backdrop-blur-xl transition-all shadow-xs">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">
            {/* Left Section: Mobile Menu + Breadcrumb / Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={onMenuToggle}
                className="rounded-xl border border-sky-100 bg-white p-2 text-slate-500 shadow-xs hover:bg-sky-50 hover:text-sky-600 md:hidden"
                aria-label="Toggle Menu"
              >
                {getIcon('menu', { size: 20 })}
              </button>
              
              {/* Mobile Brand Link */}
              <Link
                to={isInJourney ? `/journey/${displayJourney.id}` : '/dashboard'}
                className="flex items-center gap-2 md:hidden"
              >
                <img src="/logo.png" alt="MemoryMap" className="h-7 w-7 object-contain drop-shadow-xs" />
                <span className="text-base font-extrabold text-slate-900">MemoryMap</span>
              </Link>

              {/* Desktop Breadcrumb Context */}
              <div className="hidden md:flex items-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-slate-800 font-extrabold text-sm hover:text-sky-600 transition-colors"
                >
                  <img src="/logo.png" alt="MemoryMap" className="h-7 w-7 object-contain drop-shadow-xs" />
                  <span>MemoryMap</span>
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {location.pathname === '/dashboard' && 'Dashboard Overview'}
                  {location.pathname === '/create-journey' && 'Create New Journey'}
                  {location.pathname === '/settings' && 'Account Settings'}
                  {location.pathname.includes('/gallery') && 'Photo Gallery'}
                  {location.pathname.includes('/notes') && 'Notes & Letters'}
                  {isInJourney && displayJourney?.journeyName}
                </span>
              </div>
            </div>

            {/* Middle Section: Journey Stats if in a Journey */}
            {isInJourney && canShowJourneyStats ? (
              <div className="hidden items-center gap-6 rounded-full border border-theme-border/60 bg-white/75 px-5 py-1.5 text-xs font-bold text-theme-muted shadow-xs lg:flex">
                <span className="flex items-center gap-1.5 text-theme-text font-extrabold">
                  <span>{themeConfig.emoji}</span>
                  {displayJourney.journeyName}
                </span>
                <span><strong className="text-theme-text">{stats.checkpoints}</strong> Checkpoints</span>
                <span><strong className="text-theme-text">{stats.photos}</strong> Photos</span>
                <span><strong className="text-theme-text">{stats.notes}</strong> Notes</span>
                <button
                  onClick={() => navigate(`/journey/${displayJourney.id}/add-checkpoint`)}
                  className="rounded-full bg-theme-primary px-3 py-1 text-white shadow-xs transition-colors hover:bg-theme-accent"
                >
                  Add Checkpoint
                </button>
              </div>
            ) : null}

            {/* Right Section: User & Quick Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {currentUser?.isDemo && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Demo Mode
                </span>
              )}

              {location.pathname === '/dashboard' && (
                <button
                  onClick={() => navigate('/create-journey')}
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                >
                  {getIcon('plus', { size: 14 })}
                  <span>New Journey</span>
                </button>
              )}

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 rounded-2xl p-1 sm:px-2 sm:py-1.5 transition-colors hover:bg-sky-50 text-left"
                title="Account Settings"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-800 leading-tight">{currentUser.displayName}</span>
                  <span className="text-[10px] font-medium text-slate-400 leading-tight">{currentUser.email}</span>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Logout"
              >
                {getIcon('logout', { size: 16 })}
              </button>
            </div>
          </div>
        </header>
        <LogoutConfirmModal
          isOpen={logoutConfirmOpen}
          onCancel={() => setLogoutConfirmOpen(false)}
          onConfirm={confirmLogout}
        />
      </>
    );
  }

  // Landing Page Navbar - Static floating pill matching exact design
  return (
    <>
      <header className="relative z-40 w-full pt-4 sm:pt-6 px-4 sm:px-6 md:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-white/80 bg-white/90 px-4 sm:px-7 shadow-[0_12px_36px_-15px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MemoryMap"
              className="h-8.5 w-8.5 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
            />
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
              Memory<span className="bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-500 bg-clip-text text-transparent">Map</span>
            </span>
          </Link>

          {/* Center Badges / Links */}
          <nav className="hidden md:flex items-center gap-3.5 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3.5 py-1 text-slate-700">
              <span>✨</span>
              <span>Map Visual Milestones</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 text-emerald-700 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Free Demo Mode Active</span>
            </span>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  {getIcon('right', { size: 13 })}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  {getIcon('logout', { size: 16 })}
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:text-slate-950 hover:bg-slate-100"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-1.5"
                >
                  <span>Start Your Journey</span>
                  {getIcon('right', { size: 13 })}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};
