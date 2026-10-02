import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../utils/icons';

export const PhotoGrid = ({ photos, journeyId }) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activePhotoIdx === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === 'Escape') {
        setActivePhotoIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhotoIdx, photos.length]);

  const checkIsVideo = (url) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('video') || url.startsWith('blob:video') || url.includes('.mov') || url.includes('.webm');
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="premium-surface relative mx-auto my-8 flex max-w-lg flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-md sm:p-12">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-primary opacity-80"></div>
        <div className="gallery-empty-orbit"></div>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-theme-primary/10 text-theme-primary shadow-inner animate-float">
          {getIcon('camera', { size: 28 })}
        </div>
        <h4 className="text-lg font-extrabold text-slate-800 font-sans">No photos on this path yet</h4>
        <p className="mt-2 max-w-xs text-xs font-semibold leading-relaxed text-slate-500">
          Add photos inside checkpoints so each image belongs to a moment, a date, and a feeling instead of becoming a loose gallery item.
        </p>
      </div>
    );
  }

  const openLightbox = (idx) => setActivePhotoIdx(idx);
  const closeLightbox = () => setActivePhotoIdx(null);

  const nextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = activePhotoIdx !== null ? photos[activePhotoIdx] : null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 animate-fade-in">
        {photos.map((item, idx) => (
          <div
            key={item.url + idx}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:ring-4 hover:ring-theme-primary/10"
          >


            {checkIsVideo(item.url) ? (
              <video
                src={item.url}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                playsInline
              />
            ) : (
              <img
                src={item.url}
                alt={item.checkpointTitle || "Memory Photo"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            )}

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="block truncate text-[9px] font-semibold text-theme-primary">
                {item.checkpointTitle}
              </span>
              <span className="truncate text-[10px] font-bold">
                {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {currentPhoto && createPortal(
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 p-4 animate-fade-in backdrop-blur-md select-none"
        >
          <button
            onClick={closeLightbox}
            className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[100000] flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer text-xl font-bold shadow-2xl border border-white/20"
            aria-label="Close preview"
            title="Close (Esc)"
          >
            ✕
          </button>

          {photos.length > 1 && (
            <button
              onClick={prevPhoto}
              className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-[100000] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 hover:scale-105 active:scale-95 transition-all cursor-pointer text-2xl font-bold shadow-2xl border border-white/20"
              aria-label="Previous photo"
              title="Previous Photo (←)"
            >
              {getIcon('left', { size: 24 })}
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="photo-preview-modal relative flex max-h-[75vh] max-w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            {checkIsVideo(currentPhoto.url) ? (
              <video
                src={currentPhoto.url}
                className="max-h-[75vh] max-w-full object-contain"
                controls
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={currentPhoto.url}
                alt={currentPhoto.checkpointTitle}
                className="max-h-[75vh] max-w-full object-contain"
              />
            )}
          </div>

          {photos.length > 1 && (
            <button
              onClick={nextPhoto}
              className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[100000] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 hover:scale-105 active:scale-95 transition-all cursor-pointer text-2xl font-bold shadow-2xl border border-white/20"
              aria-label="Next photo"
              title="Next Photo (→)"
            >
              {getIcon('right', { size: 24 })}
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="photo-preview-modal mt-6 max-w-md rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-center backdrop-blur-md"
          >
            <h4 className="text-lg font-bold leading-tight text-white">
              {currentPhoto.checkpointTitle}
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Captured on {new Date(currentPhoto.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1.5 font-sans">
              Photo {activePhotoIdx + 1} of {photos.length}
            </p>
            {currentPhoto.checkpointId && (
              <button
                onClick={() => {
                  closeLightbox();
                  navigate(`/journey/${journeyId}/checkpoint/${currentPhoto.checkpointId}`);
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white px-3.5 py-1.5 transition-all"
              >
                Go to Checkpoint
                {getIcon('right', { size: 10 })}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
