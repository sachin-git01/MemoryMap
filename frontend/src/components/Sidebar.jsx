import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useJourney } from '../context/JourneyContext';
import { useThemeSettings } from '../context/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';
import { PricingModal } from './PricingModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import {
  PREMIUM_PLAN_EVENT,
  formatStorageLimit,
  getStoredPremiumPlan,
  setStoredPremiumPlan
} from '../data/premiumPlans';

const TYPE_META = {
  love: { label: 'love', icon: 'heart', chip: 'bg-rose-50 text-rose-500' },
  friendship: { label: 'friendship', icon: 'group', chip: 'bg-violet-50 text-violet-500' },
  family: { label: 'family', icon: 'home', chip: 'bg-amber-50 text-amber-600' },
  personal: { label: 'personal', icon: 'flag', chip: 'bg-sky-50 text-sky-500' },
  custom: { label: 'custom', icon: 'star', chip: 'bg-slate-50 text-slate-500' }
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentJourney, journeys, selectJourney } = useJourney();
  const { activeTheme } = useThemeSettings();
  const { logout } = useAuth();
  const { journeyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [activePremiumPlan, setActivePremiumPlan] = useState(() => getStoredPremiumPlan());

  useEffect(() => {
    const syncPremiumPlan = () => setActivePremiumPlan(getStoredPremiumPlan());
    window.addEventListener('storage', syncPremiumPlan);
    window.addEventListener(PREMIUM_PLAN_EVENT, syncPremiumPlan);
    return () => {
      window.removeEventListener('storage', syncPremiumPlan);
      window.removeEventListener(PREMIUM_PLAN_EVENT, syncPremiumPlan);
    };
  }, []);

  const routeJourneyId = journeyId || location.pathname.match(/^\/journey\/([^/]+)/)?.[1] || null;
  const activeJId = routeJourneyId || currentJourney?.id;
  const routeJourney = activeJId ? journeys.find(journey => journey.id === activeJId) : null;
  const displayJourney = activeJId
    ? (currentJourney?.id === activeJId ? currentJourney : routeJourney)
    : currentJourney;
  const navJourneyId = displayJourney?.id || (!routeJourneyId ? currentJourney?.id : null);
  const displayTheme = displayJourney?.theme || activeTheme;
  const brandMeta = (() => {
    if (!displayJourney || location.pathname === '/dashboard' || location.pathname === '/create-journey') {
      return { label: 'MemoryMap', letter: 'M', colors: 'from-blue-500 to-sky-500', text: 'text-blue-950' };
    }
    const theme = displayJourney.theme || displayJourney.journeyType || 'custom';
    if (theme === 'love') return { label: 'LoveMap', letter: 'L', colors: 'from-rose-500 to-pink-500', text: 'text-rose-600' };
    if (theme === 'friendship') return { label: 'FriendshipMap', letter: 'F', colors: 'from-violet-500 to-indigo-500', text: 'text-violet-600' };
    if (theme === 'family') return { label: 'FamilyMap', letter: 'F', colors: 'from-amber-500 to-orange-500', text: 'text-amber-700' };
    if (theme === 'personal') return { label: 'LifeMap', letter: 'L', colors: 'from-sky-500 to-cyan-500', text: 'text-sky-600' };
    return {
      label: `${displayJourney.journeyName.split(' ')[0]}Map`,
      letter: 'C',
      colors: 'from-slate-700 to-sky-500',
      text: 'text-slate-800'
    };
  })();

  const calculateDuration = (startDateStr) => {
    if (!startDateStr) return '';
    const startDate = new Date(startDateStr);
    const today = new Date();
    
    let years = today.getFullYear() - startDate.getFullYear();
    let months = today.getMonth() - startDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const yearStr = years > 0 ? `${years} Year${years > 1 ? 's' : ''}` : '';
    const monthStr = months > 0 ? `${months} Month${months > 1 ? 's' : ''}` : '';
    
    if (years === 0 && months === 0) return 'Started this month';
    
    return [yearStr, monthStr].filter(Boolean).join(', ');
  };

  const menuItems = navJourneyId ? [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Journey Map', path: `/journey/${navJourneyId}`, icon: 'map', exact: true },
    { name: 'Gallery', path: `/journey/${navJourneyId}/gallery`, icon: 'album' },
    { name: 'Notes & Letters', path: `/journey/${navJourneyId}/notes`, icon: 'notes' },
    { name: 'Settings', path: `/journey/${navJourneyId}/settings`, icon: 'settings' }
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' }
  ];

  const handleJourneyClick = (jId) => {
    selectJourney(jId);
    navigate(`/journey/${jId}`);
    if (onClose) onClose();
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutConfirmOpen(false);
    navigate('/', { replace: true });
    if (onClose) onClose();
  };

  const handleSelectPremiumPlan = (plan) => {
    const selectedPlan = setStoredPremiumPlan(plan.id);
    setActivePremiumPlan(selectedPlan);
  };

  const sidebarContent = (
    <div className="no-scrollbar flex h-full flex-col justify-between overflow-y-auto bg-white/[0.96] p-6">
      <div>
        <div className="mb-9 flex items-center justify-between">
          <button
            onClick={() => handleItemClick('/dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            {!displayJourney || location.pathname === '/dashboard' || location.pathname === '/create-journey' ? (
              <img src="/logo.png" alt="MemoryMap" className="h-10 w-10 object-contain transition-transform group-hover:scale-105 drop-shadow-sm" />
            ) : (
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${brandMeta.colors} text-xl font-black text-white shadow-md`}>
                {brandMeta.letter}
              </span>
            )}
            <span className={`truncate text-2xl font-extrabold tracking-tight ${brandMeta.text}`}>{brandMeta.label}</span>
          </button>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-sky-50 md:hidden"
            aria-label="Close navigation"
          >
            {getIcon('close', { size: 20 })}
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isItemActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path) && (item.path !== '/dashboard' || location.pathname === '/dashboard');
            
            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item.path)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-base font-extrabold transition-all duration-300 ${
                  isItemActive 
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_18px_35px_-24px_rgba(37,99,235,0.9)]' 
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <span className={isItemActive ? 'text-white' : 'text-slate-400'}>
                  {getIcon(item.icon, { size: 19 })}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {journeys.length > 0 && !routeJourneyId && (
          <div className="mt-9">
            <h3 className="px-1 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">My Journeys</h3>
            <div className="mt-4 space-y-3">
              {journeys.map((journey) => {
                const type = journey.theme || journey.journeyType || 'custom';
                const meta = TYPE_META[type] || TYPE_META.custom;

                return (
                  <button
                    key={journey.id}
                    onClick={() => handleJourneyClick(journey.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-1.5 py-1.5 text-left transition-all ${
                      displayJourney?.id === journey.id
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}>
                      {getIcon(meta.icon, { size: 18, strokeWidth: 2.3 })}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-blue-950">{journey.journeyName}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-500">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!routeJourneyId && (
          <div className="mt-10 rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50 via-white to-rose-50 p-5 shadow-[0_18px_45px_-35px_rgba(37,99,235,0.45)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm">
              {getIcon('star', { size: 20 })}
            </div>
            <h4 className="text-sm font-extrabold text-blue-700">
              {activePremiumPlan ? `${activePremiumPlan.name} Active` : 'Unlock Premium'}
            </h4>
            <p className="mt-3 text-sm font-medium leading-6 text-blue-900/70">
              {activePremiumPlan
                ? `${formatStorageLimit(activePremiumPlan.storageLimitMb)} storage unlocked for your memory maps.`
                : 'Bigger storage, richer exports, and more room for every story.'}
            </p>
            <button
              type="button"
              onClick={() => setPricingOpen(true)}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-extrabold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            >
              {activePremiumPlan ? 'Manage Premium' : 'View Premium Plans'}
              {getIcon('right', { size: 15 })}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-tr-[2rem] border-t border-sky-100 pt-5">
        {displayJourney && navJourneyId && (
          <div className="mb-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {displayTheme === 'love' ? 'Together Since' : displayTheme === 'friendship' ? 'Friends Since' : 'Journey Start'}
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {new Date(displayJourney.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {calculateDuration(displayJourney.startDate)}
            </p>
          </div>
        )}
        <button
          onClick={() => handleItemClick(navJourneyId ? `/journey/${navJourneyId}/settings` : '/dashboard')}
          className="flex w-full items-center justify-between rounded-2xl px-2 py-3 text-sm font-medium text-blue-950 hover:bg-sky-50"
        >
          <span className="flex items-center gap-3">
            {getIcon('help', { size: 19 })}
            Help & Support
          </span>
          {getIcon('right', { size: 15 })}
        </button>
        <button
          onClick={() => handleItemClick('/settings')}
          className="flex w-full items-center justify-between rounded-2xl px-2 py-3 text-sm font-medium text-blue-950 hover:bg-sky-50"
        >
          <span className="flex items-center gap-3">
            {getIcon('settings', { size: 19 })}
            Account Settings
          </span>
          {getIcon('right', { size: 15 })}
        </button>
        <button
          onClick={() => setLogoutConfirmOpen(true)}
          className="mt-1 flex w-full items-center justify-between rounded-2xl px-2 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <span className="flex items-center gap-3">
            {getIcon('logout', { size: 19 })}
            Logout
          </span>
          {getIcon('right', { size: 15 })}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-[18.75rem] border-r border-sky-100/90 bg-white/[0.94] shadow-[18px_0_55px_-48px_rgba(37,99,235,0.65)] backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>

      <PricingModal
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        currentPlanId={activePremiumPlan?.id}
        onSelectPlan={handleSelectPremiumPlan}
      />
      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};
