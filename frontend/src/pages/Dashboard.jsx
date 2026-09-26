import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { JourneyCard } from '../components/JourneyCard';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';
import { MOCK_CHECKPOINTS, THEME_CONFIGS } from '../data/mockData';
import {
  FREE_PLAN,
  PREMIUM_PLAN_EVENT,
  formatStorageLimit,
  getStoredPremiumPlan
} from '../data/premiumPlans';

const JOURNEYS_PAGE_SIZE = 4;

const TYPE_STYLES = {
  love: {
    label: 'Love Story',
    icon: 'heart',
    badge: 'bg-rose-50 text-rose-600',
    bar: 'from-rose-400 to-pink-500',
    cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=640&q=80'
  },
  friendship: {
    label: 'Friendship',
    icon: 'group',
    badge: 'bg-violet-50 text-violet-600',
    bar: 'from-violet-400 to-indigo-500',
    cover: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=640&q=80'
  },
  family: {
    label: 'Family',
    icon: 'home',
    badge: 'bg-amber-50 text-amber-700',
    bar: 'from-amber-400 to-orange-500',
    cover: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=640&q=80'
  },
  personal: {
    label: 'Personal Life',
    icon: 'flag',
    badge: 'bg-sky-50 text-sky-600',
    bar: 'from-sky-400 to-cyan-500',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80'
  },
  custom: {
    label: 'Custom',
    icon: 'star',
    badge: 'bg-slate-50 text-slate-600',
    bar: 'from-slate-400 to-sky-500',
    cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=640&q=80'
  }
};

const loadDashboardCheckpoints = () => {
  const localCpStr = localStorage.getItem('memorymap_local_checkpoints');
  if (!localCpStr) return MOCK_CHECKPOINTS;

  try {
    const parsedCheckpoints = JSON.parse(localCpStr);
    return Array.isArray(parsedCheckpoints) ? parsedCheckpoints : MOCK_CHECKPOINTS;
  } catch {
    localStorage.setItem('memorymap_local_checkpoints', JSON.stringify(MOCK_CHECKPOINTS));
    return MOCK_CHECKPOINTS;
  }
};

const isVideo = (url = '') => (
  url.endsWith('.mp4') ||
  url.includes('video') ||
  url.startsWith('blob:video') ||
  url.includes('.mov') ||
  url.includes('.webm')
);

const getJourneyType = (journey) => journey?.theme || journey?.journeyType || 'custom';

const getCoverPhoto = (journey, checkpoints) => {
  const type = getJourneyType(journey);
  const checkpointPhoto = checkpoints
    .flatMap(checkpoint => checkpoint.photos || [])
    .find(photo => photo && !isVideo(photo));

  return journey?.coverImage || TYPE_STYLES[type]?.cover || checkpointPhoto || TYPE_STYLES.custom.cover;
};

export const Dashboard = () => {
  const { currentUser, isDemoMode } = useAuth();
  const { journeys, setCurrentJourney, loading, deleteJourney } = useJourney();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [allCheckpoints, setAllCheckpoints] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [journeyToDelete, setJourneyToDelete] = useState(null);
  const [visibleJourneyCount, setVisibleJourneyCount] = useState(JOURNEYS_PAGE_SIZE);
  const [activePremiumPlan, setActivePremiumPlan] = useState(() => getStoredPremiumPlan());
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setCurrentJourney(null);
  }, [setCurrentJourney]);

  useEffect(() => {
    setAllCheckpoints(loadDashboardCheckpoints());
  }, [journeys]);

  useEffect(() => {
    setVisibleJourneyCount(JOURNEYS_PAGE_SIZE);
  }, [searchQuery]);

  useEffect(() => {
    const syncPremiumPlan = () => setActivePremiumPlan(getStoredPremiumPlan());
    window.addEventListener('storage', syncPremiumPlan);
    window.addEventListener(PREMIUM_PLAN_EVENT, syncPremiumPlan);
    return () => {
      window.removeEventListener('storage', syncPremiumPlan);
      window.removeEventListener(PREMIUM_PLAN_EVENT, syncPremiumPlan);
    };
  }, []);

  const journeyStats = useMemo(() => {
    const stats = new Map();
    journeys.forEach(journey => {
      const jCheckpoints = allCheckpoints.filter(checkpoint => checkpoint.journeyId === journey.id);
      const photosCount = jCheckpoints.reduce((sum, checkpoint) => (
        sum + (checkpoint.photos || []).filter(photo => !isVideo(photo)).length
      ), 0);
      const type = getJourneyType(journey);
      const target = Math.max((THEME_CONFIGS[type]?.suggestedCheckpoints || []).length, 6);
      const progress = Math.min(Math.round((jCheckpoints.length / target) * 100), 100);

      stats.set(journey.id, {
        checkpoints: jCheckpoints,
        checkpointsCount: jCheckpoints.length,
        photosCount,
        coverImage: getCoverPhoto(journey, jCheckpoints),
        progress
      });
    });
    return stats;
  }, [allCheckpoints, journeys]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-sky-100 bg-white/80 p-8 shadow-sm">
          <div className="h-9 w-80 max-w-full rounded-xl skeleton-soft"></div>
          <div className="mt-4 h-4 w-96 max-w-full rounded-lg skeleton-soft"></div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="rounded-[1.5rem] border border-sky-100 bg-white/75 p-4 shadow-sm">
                <div className="h-36 rounded-2xl skeleton-soft"></div>
                <div className="mt-4 h-5 w-40 rounded-lg skeleton-soft"></div>
                <div className="mt-3 h-3 w-full rounded-full skeleton-soft"></div>
              </div>
            ))}
          </div>
          <div className="rounded-[1.5rem] border border-sky-100 bg-white/75 p-6 shadow-sm">
            <div className="h-5 w-44 rounded-lg skeleton-soft"></div>
            <div className="mt-8 h-3 w-full rounded-full skeleton-soft"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredJourneys = journeys.filter(journey => {
    const query = searchQuery.toLowerCase();
    return (
      journey.journeyName.toLowerCase().includes(query) ||
      getJourneyType(journey).toLowerCase().includes(query)
    );
  });
  const visibleJourneys = filteredJourneys.slice(0, visibleJourneyCount);
  const hasMoreJourneys = visibleJourneyCount < filteredJourneys.length;

  const totalCheckpoints = allCheckpoints.length;
  const totalPhotos = allCheckpoints.reduce((sum, checkpoint) => (
    sum + (checkpoint.photos || []).filter(photo => !isVideo(photo)).length
  ), 0);
  const storageLimitMb = activePremiumPlan?.storageLimitMb || FREE_PLAN.storageLimitMb;
  const storageUsed = Number(((totalPhotos * 0.4) + (totalCheckpoints * 0.05)).toFixed(1));
  const storagePct = Math.min(Math.round((storageUsed / storageLimitMb) * 100), 100);
  const freeStorage = Math.max(storageLimitMb - storageUsed, 0);
  const recentCheckpoints = [...allCheckpoints]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 3);

  const getJourney = (journeyId) => journeys.find(journey => journey.id === journeyId);

  const openRecentGallery = () => {
    const firstRecent = recentCheckpoints[0];
    if (firstRecent) navigate(`/journey/${firstRecent.journeyId}/gallery`);
  };

  const confirmDeleteJourney = async () => {
    if (!journeyToDelete) return;
    try {
      await deleteJourney(journeyToDelete.id);
      setJourneyToDelete(null);
      setDeleteMode(false);
    } catch (error) {
      console.error(error);
      setNotice({
        type: 'error',
        title: 'Journey not deleted',
        message: 'Could not remove this journey. Please try again.'
      });
    }
  };

  return (
    <div className="dashboard-shell pb-6 sm:pb-7">
      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
        className="mb-5"
      />

      {isDemoMode && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/70 to-rose-50/80 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                {getIcon('star', { size: 20 })}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
                    Demo Mode Active
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Exploring 4 sample journeys
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">
                  You are previewing preloaded demo journeys (<span className="font-semibold text-rose-600">Our Love Story ❤️</span>, <span className="font-semibold text-violet-600">College Crew ⚡</span>, <span className="font-semibold text-amber-700">The Family Album 🏡</span>, and <span className="font-semibold text-sky-600">My Path to Growth 🚀</span>). Create your free private account to upload photos permanently and store your memories safely in the cloud!
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="rounded-xl bg-blue-950 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-900"
              >
                Create Private Account
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-[1.5rem] border border-sky-100/90 bg-white/[0.65] shadow-[0_24px_70px_-50px_rgba(37,99,235,0.65)] backdrop-blur-xl sm:rounded-[1.75rem]">
          <div className="relative min-h-[210px] overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-4 py-5 sm:px-9">
            <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[radial-gradient(circle_at_55%_15%,rgba(59,130,246,0.14),transparent_17%),linear-gradient(180deg,rgba(255,255,255,0.25),rgba(219,234,254,0.52))] lg:block"></div>
            <div className="absolute bottom-0 right-0 hidden h-40 w-[50%] opacity-85 lg:block">
              <div className="absolute bottom-0 left-5 h-16 w-56 rounded-t-full bg-white/70"></div>
              <div className="absolute bottom-0 left-28 h-24 w-72 rounded-t-full bg-blue-100/65"></div>
              <div className="absolute bottom-0 right-3 h-14 w-60 rounded-t-full bg-white/85"></div>
              <div className="absolute right-36 top-4 h-24 w-24">
                <div className="absolute left-1/2 top-0 h-16 w-24 -translate-x-1/2 overflow-hidden rounded-t-full border-4 border-blue-200 bg-white/80 shadow-sm">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-blue-200"></span>
                  <span className="absolute left-5 top-0 h-full w-px bg-blue-100"></span>
                  <span className="absolute right-5 top-0 h-full w-px bg-blue-100"></span>
                </div>
                <span className="absolute left-[1.35rem] top-14 h-8 w-px rotate-[-18deg] bg-blue-200"></span>
                <span className="absolute right-[1.35rem] top-14 h-8 w-px rotate-[18deg] bg-blue-200"></span>
                <span className="absolute bottom-0 left-1/2 h-5 w-7 -translate-x-1/2 rounded-b-lg bg-blue-200"></span>
              </div>
              <span className="absolute right-72 top-9 h-2 w-5 rotate-[-22deg] rounded-full border-t-2 border-sky-400"></span>
              <span className="absolute right-16 top-[6.25rem] h-2 w-5 rotate-[-22deg] rounded-full border-t-2 border-sky-400"></span>
            </div>

            <div className="relative z-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <div className="min-w-0">
                <h1 className="w-full max-w-full break-words text-[1.9rem] font-serif font-black leading-tight tracking-tight text-blue-950 sm:max-w-2xl sm:text-[2.35rem]">
                  Your <span className="font-sans text-sky-500">memories</span>, <span className="block sm:inline">mapped beautifully.</span>
                </h1>
                <p className="mt-4 w-full max-w-full break-words text-sm font-medium leading-6 text-blue-900/60 sm:max-w-lg sm:text-base sm:leading-7">
                  Create private journeys, capture meaningful moments, and relive your story anytime.
                </p>

                <div className="mt-6 flex max-w-full items-center gap-4 overflow-hidden rounded-2xl border border-sky-100 bg-white/70 p-3.5 shadow-[0_16px_40px_-32px_rgba(37,99,235,0.8)] sm:max-w-xl">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-blue-500">
                    {getIcon('star', { size: 24 })}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-blue-950">
                      Welcome back, <span className="text-blue-600">{currentUser?.displayName || 'Adventurer'}!</span>
                    </span>
                    <span className="mt-1 block truncate text-xs font-medium text-blue-900/60">
                      {isDemoMode
                        ? 'Every memory you save today becomes a story to cherish tomorrow.'
                        : 'Every saved memory becomes a story to cherish tomorrow.'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex justify-start lg:justify-end">
                <button
                  onClick={() => navigate('/create-journey')}
                  className="inline-flex items-center gap-3 rounded-2xl bg-blue-950 px-6 py-4 text-sm font-extrabold text-white shadow-[0_24px_45px_-25px_rgba(30,64,175,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-900"
                >
                  {getIcon('plus', { size: 18 })}
                  Add New Journey
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-7">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-black tracking-tight text-blue-950">My Journeys</h2>
              <p className="mt-1 text-sm font-medium text-blue-900/60">
                Pick a story world and continue building the path.
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:gap-3 lg:w-auto">
              <label className="relative min-w-0 flex-1 basis-full sm:basis-auto lg:w-72">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                  {getIcon('search', { size: 17 })}
                </span>
                <input
                  type="text"
                  placeholder="Search journeys..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-sky-100 bg-white/90 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>
              <button
                type="button"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white text-blue-900 shadow-sm transition-colors hover:text-sky-600"
                aria-label="Filter journeys"
              >
                {getIcon('sliders', { size: 18 })}
              </button>
              <button
                type="button"
                onClick={() => setDeleteMode(prev => !prev)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-colors ${
                  deleteMode
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-sky-100 bg-white text-blue-900 hover:text-red-500'
                }`}
                aria-label="Delete journey mode"
                title={deleteMode ? 'Delete mode on' : 'Delete journey'}
              >
                {getIcon('trash', { size: 18 })}
              </button>
            </div>
          </div>

          {filteredJourneys.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleJourneys.map(journey => {
                const stats = journeyStats.get(journey.id) || {
                  checkpoints: [],
                  checkpointsCount: 0,
                  photosCount: 0,
                  coverImage: getCoverPhoto(journey, []),
                  progress: 0
                };

                return (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    checkpointsCount={stats.checkpointsCount}
                    photosCount={stats.photosCount}
                    coverImage={stats.coverImage}
                    progress={stats.progress}
                    typeStyle={TYPE_STYLES[getJourneyType(journey)] || TYPE_STYLES.custom}
                    deleteMode={deleteMode}
                    onDeleteRequest={setJourneyToDelete}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-sky-200 bg-sky-50/40 p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm">
                {getIcon('map', { size: 24 })}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {searchQuery ? 'No matching journey found' : 'Build your first memory map'}
              </h3>
              <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
                {searchQuery
                  ? 'Try another keyword or clear the search to see your journeys.'
                  : 'Choose a journey type and start connecting photos, dates, notes, and milestones into one story.'}
              </p>
              <button
                onClick={searchQuery ? () => setSearchQuery('') : () => navigate('/create-journey')}
                className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
              >
                {searchQuery ? 'Clear Search' : 'Create Journey'}
              </button>
            </div>
          )}

            {hasMoreJourneys && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleJourneyCount(count => count + JOURNEYS_PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-7 py-3 text-sm font-bold text-blue-900 shadow-sm transition-colors hover:bg-sky-50"
                >
                  Load more journeys
                  {getIcon('down', { size: 16 })}
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="grid gap-5 md:grid-cols-2 xl:block xl:space-y-5">
          <section className="rounded-[1.5rem] border border-sky-100 bg-white/[0.82] p-6 shadow-[0_20px_55px_-42px_rgba(37,99,235,0.7)] backdrop-blur-xl">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-blue-500">
                  {getIcon('upload', { size: 18 })}
                </span>
                <h3 className="text-base font-extrabold text-blue-950">Storage Overview</h3>
              </div>
            </div>

            <div>
              <p className="text-lg font-extrabold text-blue-950">
                {storageUsed} MB <span className="font-semibold text-slate-400">/ {formatStorageLimit(storageLimitMb)}</span>
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                  style={{ width: `${storagePct}%` }}
                ></div>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">{storagePct}% used</p>
              <p className="mt-3 text-xs font-medium leading-5 text-blue-900/60">
                {activePremiumPlan
                  ? `${activePremiumPlan.name} plan active. ${formatStorageLimit(freeStorage)} still free.`
                  : `Free plan. ${formatStorageLimit(freeStorage)} still free.`}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-sky-50 pt-6">
              {[
                ['Total Journeys', journeys.length, 'album'],
                ['Checkpoints', totalCheckpoints, 'check'],
                ['Photos', totalPhotos, 'camera'],
                ['Memories', totalPhotos + totalCheckpoints, 'heart']
              ].map(([label, value, icon]) => (
                <div key={label} className="rounded-2xl bg-slate-50/70 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-900/60">{label}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500">
                      {getIcon(icon, { size: 15 })}
                    </span>
                  </div>
                  <strong className="text-2xl font-black text-blue-950">{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-sky-100 bg-white/[0.82] p-6 shadow-[0_20px_55px_-42px_rgba(37,99,235,0.7)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-blue-500">
                  {getIcon('date', { size: 17 })}
                </span>
                <h3 className="text-base font-extrabold text-blue-950">Recent Memories</h3>
              </div>
              {recentCheckpoints.length > 0 && (
                <button
                  onClick={openRecentGallery}
                  className="text-xs font-bold text-sky-600 transition-colors hover:text-sky-700"
                >
                  View all
                </button>
              )}
            </div>

            {recentCheckpoints.length > 0 ? (
              <div className="space-y-4">
                {recentCheckpoints.map(checkpoint => {
                  const journey = getJourney(checkpoint.journeyId);
                  const type = getJourneyType(journey);
                  const style = TYPE_STYLES[type] || TYPE_STYLES.custom;
                  const firstPhoto = (checkpoint.photos || []).find(photo => !isVideo(photo));

                  return (
                    <button
                      key={checkpoint.id}
                      onClick={() => navigate(`/journey/${checkpoint.journeyId}/checkpoint/${checkpoint.id}`)}
                      className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-sky-50/70"
                    >
                      {firstPhoto ? (
                        <img
                          src={firstPhoto}
                          alt={checkpoint.title}
                          className="h-14 w-14 shrink-0 rounded-2xl border border-sky-50 object-cover"
                        />
                      ) : (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-50 bg-slate-50 text-slate-400">
                          {getIcon('camera', { size: 18 })}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${style.badge}`}>
                          {style.label}
                        </span>
                        <span className="block truncate text-sm font-extrabold text-slate-900 group-hover:text-sky-600">
                          {checkpoint.title}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                          {new Date(checkpoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-sky-100 bg-sky-50/40 p-6 text-center">
                <p className="text-sm font-semibold text-slate-500">No memories yet. Add a checkpoint to begin.</p>
              </div>
            )}

            {recentCheckpoints.length > 0 && (
              <button
                onClick={openRecentGallery}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-bold text-sky-600 transition-colors hover:bg-sky-50"
              >
                Browse all memories
                {getIcon('right', { size: 15 })}
              </button>
            )}
          </section>
        </aside>
      </div>

      {journeyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-red-100 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              {getIcon('trash', { size: 22 })}
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-950">Delete this journey?</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              "{journeyToDelete.journeyName}" and all its checkpoints, notes, and memories will be removed.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setJourneyToDelete(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteJourney}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
