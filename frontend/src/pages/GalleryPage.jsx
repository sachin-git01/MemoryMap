import { useEffect, useState } from 'react';
import { useRouteJourney } from '../hooks/useRouteJourney';
import { PhotoGrid } from '../components/PhotoGrid';
import { getIcon } from '../utils/icons';

export const GalleryPage = () => {
  const {
    activeJourney: currentJourney,
    checkpoints,
    isResolvingJourney,
    journeyNotFound
  } = useRouteJourney();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [photosList, setPhotosList] = useState([]);

  useEffect(() => {
    if (checkpoints.length > 0) {
      const photos = [];
      checkpoints.forEach(cp => {
        if (cp.photos && cp.photos.length > 0) {
          cp.photos.forEach(url => {
            photos.push({
              url,
              date: cp.date,
              checkpointTitle: cp.title,
              checkpointId: cp.id,
              createdAt: cp.createdAt
            });
          });
        }
      });
      setPhotosList(photos);
    } else {
      setPhotosList([]);
    }
  }, [checkpoints]);

  if (isResolvingJourney) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="premium-surface rounded-3xl p-6 space-y-3">
          <div className="h-7 w-48 rounded-xl skeleton-soft"></div>
          <div className="h-4 w-80 max-w-full rounded-lg skeleton-soft"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
            <div key={item} className="aspect-square rounded-3xl skeleton-soft"></div>
          ))}
        </div>
      </div>
    );
  }

  if (journeyNotFound || !currentJourney) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {getIcon('search', { size: 24 })}
        </div>
        <h2 className="text-xl font-bold text-slate-800">Journey not found</h2>
        <p className="mt-2 text-sm text-slate-500">This journey does not exist or is still unavailable.</p>
      </div>
    );
  }

  let filteredPhotos = [...photosList];

  if (activeFilter === 'checkpoint' && selectedCheckpointId) {
    filteredPhotos = filteredPhotos.filter(p => p.checkpointId === selectedCheckpointId);
  }

  filteredPhotos.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 page-enter space-y-8">
      <div className="premium-surface relative overflow-hidden rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border border-theme-border/60">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-theme-primary/10 blur-3xl"></div>
        <div className="relative z-10">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-theme-primary">Checkpoint Media</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Memory Gallery
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-500 font-sans font-semibold leading-relaxed">
            Every photo here is attached to a checkpoint, so the gallery stays connected to the journey.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort date:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="premium-surface rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex w-full overflow-x-auto rounded-full bg-slate-100 p-1 border border-slate-200 no-scrollbar sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              activeFilter === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {getIcon('album', { size: 12 })}
            All Photos
          </button>
          <button
            onClick={() => setActiveFilter('checkpoint')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              activeFilter === 'checkpoint'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {getIcon('map', { size: 12 })}
            By Checkpoint
          </button>
        </div>

        {activeFilter === 'checkpoint' && (
          <div className="flex w-full flex-col gap-2 animate-fade-in sm:w-auto sm:flex-row sm:items-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Select Checkpoint:</span>
            <select
              value={selectedCheckpointId}
              onChange={(e) => setSelectedCheckpointId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none sm:max-w-xs"
            >
              <option value="">Choose Checkpoint</option>
              {checkpoints.map(cp => (
                <option key={cp.id} value={cp.id}>{cp.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="premium-surface bg-white/60 border border-slate-100 rounded-3xl p-3 sm:p-6 shadow-inner min-h-[400px]">
        <PhotoGrid
          photos={filteredPhotos}
          journeyId={currentJourney.id}
        />
      </div>
    </div>
  );
};
