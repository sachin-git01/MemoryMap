import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIcon } from '../utils/icons';

const LEFT_FLOATING_MEMORIES = [
  {
    id: 'left-1',
    title: 'Our First Sunset',
    date: 'Feb 14',
    emoji: '❤️',
    rotation: '-5deg',
    animationClass: 'floating-frame-1',
    tapeBg: 'bg-rose-100/80',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=360&q=80'
  },
  {
    id: 'left-2',
    title: 'College Crew Trip',
    date: 'Aug 2019',
    emoji: '⚡',
    rotation: '4deg',
    animationClass: 'floating-frame-2',
    tapeBg: 'bg-violet-100/80',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=360&q=80'
  },
  {
    id: 'left-3',
    title: 'Said Yes! Forever',
    date: 'Dec 2024',
    emoji: '💍',
    rotation: '-4deg',
    animationClass: 'floating-frame-3',
    tapeBg: 'bg-amber-100/80',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=360&q=80'
  },
  {
    id: 'left-4',
    title: 'Paris Lights',
    date: 'Apr 2025',
    emoji: '✨',
    rotation: '4deg',
    animationClass: 'floating-frame-1',
    tapeBg: 'bg-sky-100/80',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=360&q=80'
  }
];

const RIGHT_FLOATING_MEMORIES = [
  {
    id: 'right-1',
    title: 'Summit Peak Hike',
    date: 'Oct 2023',
    emoji: '🏔️',
    rotation: '5deg',
    animationClass: 'floating-frame-2',
    tapeBg: 'bg-sky-100/80',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=360&q=80'
  },
  {
    id: 'right-2',
    title: 'The Family Album',
    date: 'May 2015',
    emoji: '🏡',
    rotation: '-5deg',
    animationClass: 'floating-frame-3',
    tapeBg: 'bg-amber-100/80',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=360&q=80'
  },
  {
    id: 'right-3',
    title: 'Sunday Cafe Coffee',
    date: 'Sep 2025',
    emoji: '☕',
    rotation: '4deg',
    animationClass: 'floating-frame-1',
    tapeBg: 'bg-emerald-100/80',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=360&q=80'
  },
  {
    id: 'right-4',
    title: 'Graduation Day',
    date: 'Jun 2021',
    emoji: '🎓',
    rotation: '-4deg',
    animationClass: 'floating-frame-2',
    tapeBg: 'bg-rose-100/80',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=360&q=80'
  }
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();
  const headlineWords = ["Map", "Every", "Memory,", "From", "Love", "to", "Life"];

  const handleExploreDemo = async (journeyId = null) => {
    try {
      await login("demo@memorymap.com", "demopassword");
      if (journeyId) {
        navigate(`/journey/${journeyId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStart = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pt-4 pb-16 sm:pt-6 sm:pb-20 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="relative text-center">

          {/* Left Floating Framed Memories (4 Photos) */}
          <div
            className="pointer-events-none absolute top-1 xl:top-2 hidden lg:flex flex-col gap-20 xl:gap-24 2xl:gap-28 -left-4 lg:-left-10 xl:-left-20 2xl:-left-28 z-20"
            aria-hidden="true"
          >
            {LEFT_FLOATING_MEMORIES.map((item) => (
              <div
                key={item.id}
                className={`pointer-events-auto floating-photo-card ${item.animationClass}`}
                style={{ '--rot': item.rotation, transform: `rotate(${item.rotation})` }}
              >
                <div className="relative w-30 xl:w-36 rounded-2xl bg-white/95 p-2 pb-2.5 shadow-[0_16px_32px_-10px_rgba(15,23,42,0.14)] border border-white/90 backdrop-blur-md transition-all">
                  {/* Tape Accent */}
                  <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-7 rounded-sm ${item.tapeBg} shadow-xs border border-white/50`}></div>

                  <div className="overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] shadow-inner">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover select-none pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-1.5 px-1 text-left">
                    <p className="truncate text-[10.5px] font-extrabold text-slate-800 leading-tight">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between text-[9.5px] font-semibold text-slate-400">
                      <span>{item.date}</span>
                      <span className="text-xs">{item.emoji}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Floating Framed Memories (4 Photos) */}
          <div
            className="pointer-events-none absolute top-1 xl:top-2 hidden lg:flex flex-col gap-20 xl:gap-24 2xl:gap-28 -right-4 lg:-right-10 xl:-right-20 2xl:-right-28 z-20"
            aria-hidden="true"
          >
            {RIGHT_FLOATING_MEMORIES.map((item) => (
              <div
                key={item.id}
                className={`pointer-events-auto floating-photo-card ${item.animationClass}`}
                style={{ '--rot': item.rotation, transform: `rotate(${item.rotation})` }}
              >
                <div className="relative w-30 xl:w-36 rounded-2xl bg-white/95 p-2 pb-2.5 shadow-[0_16px_32px_-10px_rgba(15,23,42,0.14)] border border-white/90 backdrop-blur-md transition-all">
                  {/* Tape Accent */}
                  <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-7 rounded-sm ${item.tapeBg} shadow-xs border border-white/50`}></div>

                  <div className="overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] shadow-inner">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover select-none pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-1.5 px-1 text-left">
                    <p className="truncate text-[10.5px] font-extrabold text-slate-800 leading-tight">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between text-[9.5px] font-semibold text-slate-400">
                      <span>{item.date}</span>
                      <span className="text-xs">{item.emoji}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Logo Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-100 px-3.5 py-1.5 text-xs font-bold text-sky-600 mb-5 animate-fade-in shadow-xs">
            <span className="inline-block">✨</span> Map Every Single Memory
          </div>

          <h1 className="mx-auto flex min-h-[4rem] sm:min-h-[5.5rem] md:min-h-[6.5rem] max-w-4xl items-center justify-center text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] sm:leading-[0.98] px-2">
            <span className="block" aria-label="Map Every Memory, From Love to Life">
              {headlineWords.map((word, index) => {
                const isGradientText = index >= 3;
                return (
                  <Fragment key={word + index}>
                    <span
                      className={`word-reveal inline-block ${
                        isGradientText
                          ? 'bg-gradient-to-r from-rose-500 via-violet-600 to-sky-500 bg-clip-text text-transparent'
                          : 'text-[#0B1530]'
                      }`}
                      style={{ animationDelay: `${index * 0.18}s` }}
                    >
                      {word}
                    </span>
                    {index === 2 ? (
                      <>
                        <span className="inline sm:hidden">&nbsp;</span>
                        <br className="hidden sm:inline" />
                      </>
                    ) : ' '}
                  </Fragment>
                );
              })}
            </span>
          </h1>

          <p className="mx-auto mt-5 sm:mt-8 max-w-2xl text-xs sm:text-base text-slate-500/90 leading-relaxed font-medium px-2">
            Bring your dates, photos, notes, and milestones together in a beautiful memory board where every checkpoint feels like a story, not just another gallery item.
          </p>

          <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 max-w-xs sm:max-w-none mx-auto">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto rounded-full bg-[#0B1530] px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/10 hover:bg-[#122048] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Your Journey
              {getIcon('right', { size: 16 })}
            </button>
            <button
              onClick={() => handleExploreDemo()}
              className="w-full sm:w-auto rounded-full bg-white/40 px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-md hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300 border border-white/60 backdrop-blur-sm"
            >
              Explore Demo
            </button>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 sm:mt-10 flex items-center justify-center px-2">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-500 bg-slate-50/80 border border-slate-200/60 px-3 sm:px-[1.125rem] py-2 sm:py-2.5 rounded-full shadow-inner text-center">
              <span className="text-emerald-500 text-sm">✓</span> <span>100% Safe, Secure & Private Memory Journal</span>
            </div>
          </div>
        </div>

        {/* Memory Board Preview */}
        <div id="preview-section" className="mt-14 sm:mt-20 scroll-mt-24 relative flex flex-col items-center px-1 sm:px-0 w-full">
          <div className="w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-white/60 bg-white/40 p-3 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-md">

            {/* Preview Header */}
            <div className="flex items-center justify-between border-b border-slate-200/40 pb-3 sm:pb-4 mb-4 sm:mb-8">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-400"></div>
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-400"></div>
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-sky-400"></div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400/80 ml-1 sm:ml-2 tracking-wider uppercase truncate">Memory Board Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500/80 bg-white/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200/40 whitespace-nowrap">❤️ Heartfelt Theme</span>
              </div>
            </div>

            {/* Preview Board */}
            <div className="relative w-full rounded-2xl bg-white/40 border border-white/50 min-h-[360px] p-6 flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 800 300"
                className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-visible"
              >
                <path
                  d="M 50,150 C 200,50 350,50 400,150 C 450,250 600,250 750,150"
                  fill="none"
                  stroke="url(#boardRoadGrad)"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                  className="opacity-60"
                />
                <defs>
                  <linearGradient id="boardRoadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Event Node 1 */}
              <div
                onClick={() => handleExploreDemo('demo-love-story')}
                className="absolute left-[18%] top-[45%] -translate-y-1/2 flex flex-col items-center cursor-pointer group/node"
              >
                <div className="h-7 w-7 rounded-full bg-rose-500 border-4 border-white flex items-center justify-center text-white shadow-md text-[9px] z-20 group-hover/node:scale-110 transition-transform">❤️</div>
                <div className="mt-3 bg-white/80 border border-slate-100/60 rounded-2xl p-2.5 shadow-sm w-32 text-left text-xs backdrop-blur-sm group-hover/node:bg-white transition-colors">
                  <div className="h-14 w-full rounded-lg bg-rose-50 mb-1.5 flex items-center justify-center text-lg">🌅</div>
                  <span className="font-bold text-slate-800 block text-[11px] leading-tight">First Trip</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Catching Sunsets 🌄</span>
                </div>
              </div>

              {/* Event Node 2 */}
              <div
                onClick={() => handleExploreDemo('demo-family')}
                className="absolute right-[18%] top-[55%] -translate-y-1/2 flex flex-col items-center cursor-pointer group/node"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center text-white shadow-md text-[9px] z-20 group-hover/node:scale-110 transition-transform">🏡</div>
                <div className="mt-3 bg-white/80 border border-slate-100/60 rounded-2xl p-2.5 shadow-sm w-32 text-left text-xs backdrop-blur-sm group-hover/node:bg-white transition-colors">
                  <div className="h-14 w-full rounded-lg bg-indigo-50 mb-1.5 flex items-center justify-center text-lg">🎨</div>
                  <span className="font-bold text-slate-800 block text-[11px] leading-tight">Family Album</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Home painting 🏡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div id="themes-section" className="mt-28 scroll-mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 text-xl font-bold mb-6">❤️</div>
            <h3 className="text-base font-bold text-[#0B1530]">Heartfelt Love Journeys</h3>
            <p className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium">
              Document your love saga. The layout shifts to soft sunset colors, displaying flower/ring markers and suggested milestones like First Date or Marriage.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 text-xl font-bold mb-6">⚡</div>
            <h3 className="text-base font-bold text-[#0B1530]">Friendship Scrapbooks</h3>
            <p className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium">
              Vibrant, fun doodle styling tailored for friends. Add inside jokes, graduation milestones, and crazy road trip logs with emoji pins.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 text-xl font-bold mb-6">🏡</div>
            <h3 className="text-base font-bold text-[#0B1530]">Warm Family Archives</h3>
            <p className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium">
              A soft, nostalgic beige album for home memories, holiday gatherings, and heritage milestones. Safe, emotional, and warm.
            </p>
          </div>
        </div>

      </main>
  );
};