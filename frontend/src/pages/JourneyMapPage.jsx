import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteJourney } from '../hooks/useRouteJourney';
import { useThemeSettings } from '../context/ThemeProvider';
import { JourneyMap } from '../components/JourneyMap';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';

export const JourneyMapPage = () => {
  const navigate = useNavigate();
  const {
    activeJourney: currentJourney,
    checkpoints,
    notes,
    deleteCheckpoint,
    isResolvingJourney,
    journeyNotFound
  } = useRouteJourney();
  const { themeConfig } = useThemeSettings();

  // Active view: 'map' or 'timeline'
  const [viewMode, setViewMode] = useState('map');

  // Select / Manage state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedCpIds, setSelectedCpIds] = useState(new Set());
  const [checkpointToDelete, setCheckpointToDelete] = useState(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleToggleSelect = (cpId) => {
    setSelectedCpIds(prev => {
      const next = new Set(prev);
      if (next.has(cpId)) {
        next.delete(cpId);
      } else {
        next.add(cpId);
      }
      return next;
    });
  };

  const handleSingleDelete = async () => {
    if (!checkpointToDelete) return;
    try {
      await deleteCheckpoint(currentJourney.id, checkpointToDelete.id);
      setCheckpointToDelete(null);
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Milestone not deleted',
        message: 'Could not delete this checkpoint. Please try again.'
      });
    }
  };

  const handleBatchDelete = async () => {
    setShowBatchDeleteConfirm(false);
    try {
      for (const id of selectedCpIds) {
        await deleteCheckpoint(currentJourney.id, id);
      }
      setSelectedCpIds(new Set());
      setIsSelectMode(false);
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Some milestones stayed',
        message: 'Could not delete every selected checkpoint. Please try again.'
      });
    }
  };

  if (isResolvingJourney) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-slate-200 rounded-full"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-full"></div>
          </div>
        </div>
        <div className="h-[60vh] rounded-[2.5rem] bg-slate-100/70 border border-slate-200/50 relative overflow-hidden flex flex-col justify-between p-8">
          <div className="absolute top-4 left-4 h-6 w-36 bg-slate-200 rounded-full"></div>
          <div className="flex-1 flex items-center justify-around relative">
            <div className="absolute inset-x-12 h-2 bg-slate-200 rounded-full top-1/2 -translate-y-1/2"></div>
            {[1, 2, 3].map(n => (
              <div key={n} className="relative z-10 flex flex-col items-center space-y-4">
                <div className="h-16 w-16 bg-slate-200 rounded-full border-4 border-white shadow-md"></div>
                <div className="h-4 w-24 bg-slate-200 rounded-lg"></div>
                <div className="h-3 w-16 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (journeyNotFound || !currentJourney) {
    return (
      <div className="mx-auto max-w-md text-center py-20 px-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {getIcon('search', { size: 24 })}
        </div>
        <h2 className="text-xl font-bold text-slate-800">Journey not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The journey you are looking for does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const currentType = currentJourney.theme || currentJourney.journeyType || 'custom';
  const journeyTypeIcon = {
    love: 'heart',
    friendship: 'group',
    family: 'home',
    personal: 'flag',
    custom: 'star'
  }[currentType] || 'star';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 page-enter space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="premium-surface relative overflow-hidden rounded-3xl border border-theme-border bg-white p-5 sm:p-8">
        <div className={`absolute -right-20 -top-20 h-44 w-44 rounded-full bg-gradient-to-br ${themeConfig.bgClass} opacity-40 blur-3xl`}></div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-theme-primary/10 text-theme-primary shadow-inner">
                {getIcon(journeyTypeIcon, { size: 16 })}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
                {currentJourney.journeyName}
              </h1>
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                currentJourney.privacy === 'private' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {getIcon(currentJourney.privacy === 'private' ? 'lock' : 'unlock', { size: 10 })}
                {currentJourney.privacy === 'private' ? 'Private' : 'Shared'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-theme-muted font-semibold">
              Theme style: <span className="underline">{themeConfig.mood}</span> | An emotional path, not a folder of photos.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View Toggle */}
            <div className="flex rounded-full bg-white/70 p-1 border border-theme-border/60 shadow-inner">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {getIcon('map', { size: 11 })}
                Map
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  viewMode === 'timeline'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {getIcon('album', { size: 11 })}
                Timeline
              </button>
            </div>

            {/* Manage */}
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedCpIds(new Set());
              }}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition-all duration-300 flex items-center gap-1 border cursor-pointer ${
                isSelectMode
                  ? 'bg-theme-accent text-white border-theme-accent shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getIcon('manage', { size: 11 })}
              {isSelectMode ? "Exit" : "Manage"}
            </button>

            {/* Add Checkpoint */}
            <button
              onClick={() => navigate(`/journey/${currentJourney.id}/add-checkpoint`)}
              className="rounded-full bg-theme-primary px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md shadow-theme-primary/10 hover:bg-theme-accent transition-all duration-300 flex items-center gap-1"
            >
              {getIcon('plus', { size: 13 })}
              Add
            </button>
          </div>
        </div>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

      {/* Main Content */}
      <div className="animate-fade-in">
        {viewMode === 'map' ? (
          <JourneyMap
            checkpoints={checkpoints}
            notes={notes}
            journeyId={currentJourney.id}
            isSelectMode={isSelectMode}
            selectedCpIds={selectedCpIds}
            onToggleSelect={handleToggleSelect}
          />
        ) : (
          /* Timeline List */
          <div className="relative max-w-2xl mx-auto px-2 sm:px-4">
            {checkpoints.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 sm:before:left-6 before:w-0.5 before:bg-theme-border before:rounded-full">
                {checkpoints.map((cp, idx) => {
                  const dateStr = new Date(cp.date).toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  });

                  return (
                    <div
                      key={cp.id}
                      onClick={() => {
                        if (isSelectMode) {
                          handleToggleSelect(cp.id);
                        } else {
                          navigate(`/journey/${currentJourney.id}/checkpoint/${cp.id}`);
                        }
                      }}
                      className="relative pl-8 sm:pl-12 group cursor-pointer animate-slide-up"
                    >
                      {/* Timeline Dot */}
                      {isSelectMode ? (
                        <span className={`absolute left-0.5 sm:left-1 top-4 sm:top-5 h-[14px] w-[14px] sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center transition-all group-hover:scale-125 text-[10px] font-bold ${
                          selectedCpIds.has(cp.id)
                            ? 'bg-theme-accent border-theme-accent text-white'
                            : 'bg-slate-100 border-slate-300'
                        }`}>
                          {selectedCpIds.has(cp.id) ? getIcon('check', { size: 10 }) : ""}
                        </span>
                      ) : (
                        <span className="absolute left-0.5 sm:left-1 top-4 sm:top-5 h-[14px] sm:h-5 w-[14px] sm:w-5 rounded-full border-2 border-white bg-theme-primary shadow-sm flex items-center justify-center transition-all group-hover:scale-125">
                          {idx === checkpoints.length - 1 && (
                            <span className="absolute -inset-1.5 animate-ping rounded-full bg-theme-primary/20 opacity-75"></span>
                          )}
                        </span>
                      )}

                      {/* Card */}
                      <div className="glass-card rounded-2xl p-3 sm:p-5 bg-white transition-all duration-300 hover:border-theme-primary hover:shadow-md flex flex-col sm:flex-row gap-3 sm:gap-4">

                        {/* Image preview */}
                        {cp.photos && cp.photos.length > 0 && (
                          <div className="h-20 w-full sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
                            <img
                              src={cp.photos[0]}
                              alt={cp.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="overflow-hidden space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-theme-primary">{getIcon(cp.icon || 'heart', { size: 13 })}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {dateStr}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-theme-primary transition-colors truncate">
                            {cp.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {cp.description || "No description provided for this milestone."}
                          </p>
                          {cp.notes && (
                            <div className="mt-1 text-[10px] text-theme-muted italic border-l-2 border-theme-primary/30 pl-2 py-0.5 line-clamp-1">
                              "{cp.notes}"
                            </div>
                          )}
                        </div>

                        {/* Delete button */}
                        {!isSelectMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCheckpointToDelete(cp);
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer self-center shadow-sm shrink-0"
                            title="Delete Milestone"
                          >
                            {getIcon('trash', { size: 12 })}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white/40">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-theme-primary/10 text-theme-primary mx-auto">
                  {getIcon('location', { size: 24 })}
                </div>
                <p className="text-sm font-semibold text-slate-500">Your timeline is empty. Add a checkpoint to begin!</p>
                <button
                  onClick={() => navigate(`/journey/${currentJourney.id}/add-checkpoint`)}
                  className="mt-4 rounded-full bg-theme-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-theme-accent transition-all"
                >
                  Add Checkpoint
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Batch Actions */}
      {isSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-3 animate-slide-up">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
            {selectedCpIds.size} selected
          </span>
          <button
            disabled={selectedCpIds.size === 0}
            onClick={() => setShowBatchDeleteConfirm(true)}
            className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white px-3 sm:px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {getIcon('trash', { size: 12 })}
            Delete
          </button>
          <button
            onClick={() => {
              setIsSelectMode(false);
              setSelectedCpIds(new Set());
            }}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 sm:px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Single Delete Modal */}
      {checkpointToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              {getIcon('trash', { size: 20 })}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Milestone?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to permanently delete "{checkpointToDelete.title}" and all its photos? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSingleDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setCheckpointToDelete(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Modal */}
      {showBatchDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              {getIcon('trash', { size: 20 })}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete {selectedCpIds.size} Milestones?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to permanently delete the {selectedCpIds.size} selected milestones? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBatchDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowBatchDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
