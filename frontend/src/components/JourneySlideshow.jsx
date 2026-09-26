import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getIcon } from '../utils/icons';

const isVideo = (url = '') => (
  url.endsWith('.mp4') ||
  url.includes('video') ||
  url.startsWith('blob:video') ||
  url.includes('.mov') ||
  url.includes('.webm')
);

export const JourneySlideshow = ({
  isOpen,
  onClose,
  checkpoints = [],
  journeyName = 'Journey',
  initialCheckpointId = '',
  initialPhoto = ''
}) => {
  const frames = useMemo(() => (
    checkpoints.flatMap((checkpoint, checkpointIndex) => (
      (checkpoint.photos || [])
        .filter(photo => photo && !isVideo(photo))
        .map((photo, photoIndex) => ({
          id: `${checkpoint.id}-${photoIndex}`,
          photo,
          checkpointIndex,
          photoIndex,
          title: checkpoint.title,
          date: checkpoint.date,
          description: checkpoint.description,
          notes: checkpoint.notes,
          location: checkpoint.location
        }))
    ))
  ), [checkpoints]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const exactPhotoIndex = initialPhoto
      ? frames.findIndex(frame => frame.photo === initialPhoto)
      : -1;
    const checkpointIndex = initialCheckpointId
      ? frames.findIndex(frame => frame.id.startsWith(`${initialCheckpointId}-`))
      : -1;

    setActiveIndex(exactPhotoIndex >= 0 ? exactPhotoIndex : Math.max(checkpointIndex, 0));
    setIsPlaying(frames.length > 1);
  }, [frames, frames.length, initialCheckpointId, initialPhoto, isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousRootOverscroll = root.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    root.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      body.style.touchAction = previousBodyTouchAction;
      root.style.overscrollBehavior = previousRootOverscroll;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isPlaying || frames.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % frames.length);
    }, 3600);

    return () => window.clearInterval(intervalId);
  }, [frames.length, isOpen, isPlaying]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setActiveIndex(prev => (prev + 1) % Math.max(frames.length, 1));
      if (event.key === 'ArrowLeft') setActiveIndex(prev => (prev - 1 + Math.max(frames.length, 1)) % Math.max(frames.length, 1));
      if (event.key === ' ') {
        event.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frames.length, isOpen, onClose]);

  if (!isOpen) return null;

  const currentFrame = frames[activeIndex] || null;
  const formattedDate = currentFrame?.date
    ? new Date(currentFrame.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const goPrevious = () => {
    if (frames.length <= 1) return;
    setActiveIndex(prev => (prev - 1 + frames.length) % frames.length);
  };

  const goNext = () => {
    if (frames.length <= 1) return;
    setActiveIndex(prev => (prev + 1) % frames.length);
  };

  const slideshowMarkup = (
    <div
      className="fixed inset-0 z-[9998] flex min-h-[100dvh] flex-col overflow-hidden bg-slate-950 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${journeyName} slideshow`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 18% 20%, rgb(var(--color-primary) / 0.32), transparent 28%), radial-gradient(circle at 82% 12%, rgba(56,189,248,0.24), transparent 30%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))'
        }}
      ></div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Journey Slideshow</p>
          <h2 className="truncate text-base font-extrabold sm:text-xl">{journeyName}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-md transition hover:bg-white/20"
          aria-label="Close slideshow"
        >
          {getIcon('close', { size: 20, strokeWidth: 2.6 })}
        </button>
      </header>

      {currentFrame ? (
        <main className="relative z-10 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 lg:gap-6">
          <section className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35 shadow-2xl sm:rounded-[2rem]">
            <img
              key={currentFrame.photo}
              src={currentFrame.photo}
              alt={currentFrame.title}
              className="h-full max-h-[68dvh] w-full object-contain animate-fade-in lg:max-h-[calc(100dvh-9rem)]"
              draggable="false"
            />

            {frames.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:bg-white/15"
                  aria-label="Previous slide"
                >
                  {getIcon('left', { size: 24 })}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:bg-white/15"
                  aria-label="Next slide"
                >
                  {getIcon('right', { size: 24 })}
                </button>
              </>
            )}
          </section>

          <aside className="flex min-h-0 flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-primary">
                {formattedDate}
              </p>
              <h3 className="mt-2 break-words text-2xl font-black leading-tight text-white">
                {currentFrame.title}
              </h3>
              {currentFrame.location && (
                <p className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-white/75">
                  {getIcon('location', { size: 12 })}
                  <span className="truncate">{currentFrame.location}</span>
                </p>
              )}
              <p className="mt-4 max-h-32 overflow-y-auto text-sm font-medium leading-6 text-white/68 no-scrollbar">
                {currentFrame.description || 'A quiet moment from this journey.'}
              </p>
              {currentFrame.notes && (
                <p className="mt-4 rounded-2xl border-l-4 border-theme-primary bg-white/10 p-4 text-sm font-semibold italic leading-6 text-white/78">
                  "{currentFrame.notes}"
                </p>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-theme-primary transition-all duration-500"
                  style={{ width: `${((activeIndex + 1) / frames.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-white/50">
                  {activeIndex + 1} / {frames.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPlaying(prev => !prev)}
                  disabled={frames.length <= 1}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {getIcon(isPlaying ? 'pause' : 'play', { size: 14, fill: 'currentColor' })}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          </aside>
        </main>
      ) : (
        <main className="relative z-10 flex flex-1 items-center justify-center px-4">
          <div className="max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-theme-primary">
              {getIcon('camera', { size: 24 })}
            </div>
            <h3 className="mt-5 text-lg font-black">No photos to play yet</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-white/60">
              Add photos inside checkpoints, then this journey can play like a memory film.
            </p>
          </div>
        </main>
      )}

      {frames.length > 1 && (
        <footer className="relative z-10 flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6 no-scrollbar">
          {frames.map((frame, index) => (
            <button
              key={frame.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-2xl border transition ${
                index === activeIndex ? 'border-theme-primary ring-2 ring-theme-primary/40' : 'border-white/10 opacity-60 hover:opacity-100'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <img src={frame.photo} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </footer>
      )}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(slideshowMarkup, document.body)
    : slideshowMarkup;
};
