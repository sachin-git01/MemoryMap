import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRouteJourney } from '../hooks/useRouteJourney';
import { useThemeSettings } from '../context/ThemeProvider';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const CheckpointDetails = () => {
  const { checkpointId } = useParams();
  const navigate = useNavigate();
  const {
    activeJourney: currentJourney,
    checkpoints,
    updateCheckpoint,
    deleteCheckpoint,
    uploadPhoto,
    isResolvingJourney,
    journeyNotFound
  } = useRouteJourney();
  const { themeConfig } = useThemeSettings();

  const [checkpoint, setCheckpoint] = useState(null);
  const [activePhoto, setActivePhoto] = useState('');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editIcon, setEditIcon] = useState('heart');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoDeleteConfirm, setShowPhotoDeleteConfirm] = useState(false);
  const [showBatchPhotoDeleteConfirm, setShowBatchPhotoDeleteConfirm] = useState(false);
  const [isMediaSelectMode, setIsMediaSelectMode] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(new Set());
  const [notice, setNotice] = useState(null);
  
  // Lightbox Zoom state
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Thumbnail Scroll Drag states
  const thumbnailScrollRef = useRef(null);
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const [thumbStartX, setThumbStartX] = useState(0);
  const [thumbScrollLeft, setThumbScrollLeft] = useState(0);
  
  const headerFileInputRef = useRef(null);

  // Load checkpoint
  useEffect(() => {
    const cp = checkpoints.find(c => c.id === checkpointId);
    if (cp) {
      setCheckpoint(cp);
      setEditTitle(cp.title);
      setEditDate(cp.date);
      setEditDescription(cp.description || '');
      setEditNotes(cp.notes || '');
      setEditIcon(cp.icon || 'heart');
      
      // Set default active photo to first image
      if (cp.photos && cp.photos.length > 0) {
        setActivePhoto(cp.photos[0]);
      } else {
        setActivePhoto('');
      }
    } else {
      setCheckpoint(null);
      setActivePhoto('');
    }
  }, [checkpoints, checkpointId]);

  if (isResolvingJourney) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Opening journey...</p>
      </div>
    );
  }

  if (journeyNotFound || !currentJourney) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Journey not found</h2>
        <p className="mt-2 text-sm text-slate-500">This journey does not exist or is still unavailable.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!checkpoint) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Searching milestone entry...</p>
      </div>
    );
  }

  const checkIsVideo = (url) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('video') || url.startsWith('blob:video') || url.includes('.mov') || url.includes('.webm');
  };

  const handlePrevMedia = (e) => {
    e.stopPropagation();
    if (!checkpoint.photos || checkpoint.photos.length <= 1) return;
    const currentIdx = checkpoint.photos.indexOf(activePhoto);
    const prevIdx = (currentIdx - 1 + checkpoint.photos.length) % checkpoint.photos.length;
    setActivePhoto(checkpoint.photos[prevIdx]);
  };

  const handleNextMedia = (e) => {
    e.stopPropagation();
    if (!checkpoint.photos || checkpoint.photos.length <= 1) return;
    const currentIdx = checkpoint.photos.indexOf(activePhoto);
    const nextIdx = (currentIdx + 1) % checkpoint.photos.length;
    setActivePhoto(checkpoint.photos[nextIdx]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle) return;
    
    setSaving(true);
    try {
      const updatePayload = {
        title: editTitle,
        date: editDate,
        description: editDescription,
        notes: editNotes,
        icon: editIcon
      };
      await updateCheckpoint(currentJourney.id, checkpoint.id, updatePayload);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Changes not saved',
        message: 'Could not update this checkpoint. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteCheckpoint(currentJourney.id, checkpoint.id);
      navigate(`/journey/${currentJourney.id}`);
    } catch (err) {
      console.error("Deletion crashed with error:", err);
      setNotice({
        type: 'error',
        title: 'Checkpoint not deleted',
        message: 'Could not delete this checkpoint. Please try again.'
      });
    }
  };

  const confirmDeletePhoto = async () => {
    if (!activePhoto) return;
    setShowPhotoDeleteConfirm(false);
    try {
      const updatedPhotos = checkpoint.photos.filter(p => p !== activePhoto);
      await updateCheckpoint(currentJourney.id, checkpoint.id, {
        photos: updatedPhotos
      });
      setCheckpoint(prev => ({ ...prev, photos: updatedPhotos }));
      // Set next active photo
      if (updatedPhotos.length > 0) {
        setActivePhoto(updatedPhotos[0]);
      } else {
        setActivePhoto('');
      }
    } catch (err) {
      console.error("Failed to delete photo:", err);
      setNotice({
        type: 'error',
        title: 'Media not removed',
        message: 'Could not remove this photo or video. Please try again.'
      });
    }
  };

  const confirmDeleteSelectedMedia = async () => {
    setShowBatchPhotoDeleteConfirm(false);
    setIsMediaSelectMode(false);
    try {
      const updatedPhotos = checkpoint.photos.filter(p => !selectedMedia.has(p));
      await updateCheckpoint(currentJourney.id, checkpoint.id, {
        photos: updatedPhotos
      });
      setCheckpoint(prev => ({ ...prev, photos: updatedPhotos }));
      setSelectedMedia(new Set());
      // Set next active photo
      if (updatedPhotos.length > 0) {
        setActivePhoto(updatedPhotos[0]);
      } else {
        setActivePhoto('');
      }
    } catch (err) {
      console.error("Failed to delete selected media:", err);
      setNotice({
        type: 'error',
        title: 'Selected media not removed',
        message: 'Could not remove every selected item. Please try again.'
      });
    }
  };

  const handleThumbnailClick = (url) => {
    if (isMediaSelectMode) {
      setSelectedMedia(prev => {
        const next = new Set(prev);
        if (next.has(url)) next.delete(url);
        else next.add(url);
        return next;
      });
    } else {
      setActivePhoto(url);
    }
  };

  const handleThumbMouseDown = (e) => {
    setIsThumbDragging(true);
    setThumbStartX(e.pageX - thumbnailScrollRef.current.offsetLeft);
    setThumbScrollLeft(thumbnailScrollRef.current.scrollLeft);
  };

  const handleThumbMouseMove = (e) => {
    if (!isThumbDragging) return;
    e.preventDefault();
    const x = e.pageX - thumbnailScrollRef.current.offsetLeft;
    const walk = (x - thumbStartX) * 1.5;
    thumbnailScrollRef.current.scrollLeft = thumbScrollLeft - walk;
  };

  const handleThumbMouseUpOrLeave = () => {
    setIsThumbDragging(false);
  };



  const formattedDate = new Date(checkpoint.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 page-enter relative min-h-[90vh]">

      <div className="relative z-10 space-y-6">
      
      {/* Navigation Row */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <Link 
          to={`/journey/${currentJourney.id}`}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          {getIcon('left', { size: 14 })}
          Back to Timeline
        </Link>

        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={headerFileInputRef}
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={async (e) => {
              if (!e.target.files || e.target.files.length === 0) return;
              setSaving(true);
              try {
                const newUrls = [];
                for (let i = 0; i < e.target.files.length; i++) {
                  const file = e.target.files[i];
                  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                    setNotice({
                      type: 'warning',
                      title: 'Unsupported file skipped',
                      message: 'Only image and video files are supported.'
                    });
                    continue;
                  }
                  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
                    setNotice({
                      type: 'warning',
                      title: 'File is too large',
                      message: `${file.name} is larger than 20MB. Please choose a smaller file.`
                    });
                    continue;
                  }
                  const url = await uploadPhoto(currentJourney.id, file);
                  if (url) newUrls.push(url);
                }
                if (newUrls.length > 0) {
                  const updatedPhotos = [...(checkpoint.photos || []), ...newUrls];
                  await updateCheckpoint(currentJourney.id, checkpoint.id, {
                    photos: updatedPhotos
                  });
                  setCheckpoint(prev => ({ ...prev, photos: updatedPhotos }));
                  if (!activePhoto) {
                    setActivePhoto(newUrls[0]);
                  }
                }
              } catch (err) {
                console.error(err);
                setNotice({
                  type: 'error',
                  title: 'Memories not added',
                  message: 'Could not append these files to the checkpoint. Please try again.'
                });
              } finally {
                setSaving(false);
                e.target.value = '';
              }
            }}
          />

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? "View Memory" : "Edit Details"}
          </button>
          {!isEditing && (
            <>
              <button
                onClick={() => headerFileInputRef.current.click()}
                disabled={saving}
                className="rounded-full bg-theme-primary hover:bg-theme-accent text-white px-4 py-1.5 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    {getIcon('upload', { size: 12 })}
                    <span>Add Memories</span>
                  </>
                )}
              </button>

              {checkpoint.photos && checkpoint.photos.length > 0 && (
                <button
                  onClick={() => {
                    setIsMediaSelectMode(!isMediaSelectMode);
                    setSelectedMedia(new Set());
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                    isMediaSelectMode 
                      ? 'bg-slate-700 hover:bg-slate-800 text-white' 
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  {getIcon('manage', { size: 12 })}
                  <span>{isMediaSelectMode ? "Cancel Select" : "Delete Multiple"}</span>
                </button>
              )}

              {isMediaSelectMode && selectedMedia.size > 0 && (
                <button
                  onClick={() => setShowBatchPhotoDeleteConfirm(true)}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                >
                  {getIcon('trash', { size: 12 })}
                  <span>Delete Selected ({selectedMedia.size})</span>
                </button>
              )}

            </>
          )}
        </div>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

      {isEditing ? (
        /* EDIT FORM VIEW */
        <form onSubmit={handleUpdate} className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-100 shadow-xl space-y-6 max-w-xl mx-auto">
          <h2 className="text-xl font-extrabold text-slate-900 font-sans mb-4">Edit Checkpoint</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Icon</label>
              <select
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
              >
                {themeConfig.icons?.map(ico => (
                  <option key={ico} value={ico}>{ico.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Highlight (Short Note)</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* STANDARD VIEW PORT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Large active image preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-theme-primary/20 shadow-theme-primary/10 flex items-center justify-center group transform hover:scale-[1.01] transition-all duration-500">
              


              {/* 4-Directional Arrow Maximize overlay button */}
              {activePhoto && !checkIsVideo(activePhoto) && (
                <button
                  onClick={() => {
                    setIsZoomOpen(true);
                    setZoomScale(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 hover:bg-theme-primary text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 shadow-md cursor-pointer flex items-center justify-center"
                  title="Maximize Memory Preview"
                >
                  {getIcon('zoom', { size: 16 })}
                </button>
              )}

              {activePhoto ? (
                checkIsVideo(activePhoto) ? (
                  <video 
                    key={activePhoto}
                    src={activePhoto} 
                    className="h-full w-full object-contain animate-fade-in" 
                    controls 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                  />
                ) : (
                  <img 
                    key={activePhoto}
                    src={activePhoto} 
                    alt={checkpoint.title} 
                    className="h-full w-full object-contain animate-fade-in cursor-zoom-in hover:scale-[1.01] transition-transform duration-300"
                    title="Click to zoom photo"
                    onClick={() => {
                      setIsZoomOpen(true);
                      setZoomScale(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="text-5xl mb-3">📸</div>
                  <p className="text-xs font-semibold">No pictures or videos uploaded yet for this checkpoint.</p>
                </div>
              )}

              {/* Next/Prev Navigation Arrows overlay */}
              {activePhoto && checkpoint.photos && checkpoint.photos.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevMedia}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-black/60 hover:scale-105 shadow-md cursor-pointer"
                  >
                    {getIcon('left', { size: 18 })}
                  </button>
                  <button 
                    onClick={handleNextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-black/60 hover:scale-105 shadow-md cursor-pointer"
                  >
                    {getIcon('right', { size: 18 })}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right panel: Information details */}
          <div className="lg:col-span-5 space-y-6 relative z-10">
            
            <div className="rounded-[2.5rem] p-6 sm:p-8 bg-white/85 backdrop-blur-md border border-white/60 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-primary opacity-80"></div>
              
              {/* Title & icon header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-theme-primary/10 text-theme-primary shadow-inner">
                    {getIcon(checkpoint.icon || 'star', { size: 18 })}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {formattedDate}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans tracking-tight leading-tight">
                  {checkpoint.title}
                </h1>
              </div>
              {/* Main journal text description */}
              <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line font-sans font-medium">
                {checkpoint.description || "You haven't written a description for this checkpoint yet. Use 'Edit Details' at the top right to document this memory."}
              </p>
 
              {/* Highlighting Quote Callout */}
              {checkpoint.notes && (
                <div className="rounded-2xl bg-gradient-to-br from-theme-primary/5 via-transparent to-transparent border-l-4 border-theme-primary p-5 relative overflow-hidden shadow-sm">
                  <span className="absolute right-3 bottom-0 text-7xl font-serif text-theme-primary/10 select-none leading-none pointer-events-none">”</span>
                  <p className="text-[15px] italic font-semibold text-theme-muted font-sans relative z-10 leading-relaxed pr-6">
                    "{checkpoint.notes}"
                  </p>
                </div>
              )}
 
              {/* Horizontal photos strip picker */}
              {checkpoint.photos && checkpoint.photos.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Memories under this milestone ({checkpoint.photos.length}) {isMediaSelectMode && "• SELECT MODE ACTIVE"}
                  </h4>
                  
                  <div 
                    ref={thumbnailScrollRef}
                    onMouseDown={handleThumbMouseDown}
                    onMouseMove={handleThumbMouseMove}
                    onMouseUp={handleThumbMouseUpOrLeave}
                    onMouseLeave={handleThumbMouseUpOrLeave}
                    className="flex gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth select-none cursor-grab active:cursor-grabbing no-scrollbar scrollbar-thin scrollbar-thumb-slate-200"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {checkpoint.photos.map((ph, idx) => (
                      <button
                        key={ph + idx}
                        type="button"
                        onClick={() => handleThumbnailClick(ph)}
                        className={`relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border transition-all bg-slate-100 flex items-center justify-center ${
                          activePhoto === ph
                            ? 'border-theme-primary ring-2 ring-theme-primary/20 scale-105 shadow-md'
                            : 'border-slate-200 hover:border-slate-400 hover:scale-[1.02]'
                        }`}
                      >
                        {isMediaSelectMode && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-2xl transition-all">
                            <input 
                              type="checkbox" 
                              checked={selectedMedia.has(ph)}
                              readOnly
                              className="h-5 w-5 accent-red-600 rounded cursor-pointer pointer-events-none"
                            />
                          </div>
                        )}
                        {checkIsVideo(ph) ? (
                          <video src={ph} className="h-full w-full object-cover pointer-events-none" muted />
                        ) : (
                          <img src={ph} alt={`Milestone media ${idx + 1}`} className="h-full w-full object-cover pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mx-auto text-xl animate-pulse">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-sans">Delete Milestone?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to permanently delete "{checkpoint.title}" and all its photos? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Photo Delete Confirmation Modal */}
      {showPhotoDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mx-auto text-xl animate-pulse">
              🗑️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-sans">Remove Media?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to remove this photo/video from this milestone?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDeletePhoto}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setShowPhotoDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Batch Photos Delete Confirmation Modal */}
      {showBatchPhotoDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mx-auto text-xl animate-pulse">
              🗑️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-sans">Remove Selected Memories?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to remove all {selectedMedia.size} selected photos/videos from this milestone?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDeleteSelectedMedia}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Remove All
              </button>
              <button
                onClick={() => setShowBatchPhotoDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && activePhoto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
          {/* Close button */}
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer text-lg font-bold"
            title="Close Lightbox"
          >
            ✕
          </button>



          {/* Navigation Arrows inside Lightbox */}
          {checkpoint.photos && checkpoint.photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIdx = checkpoint.photos.indexOf(activePhoto);
                  const prevIdx = (currentIdx - 1 + checkpoint.photos.length) % checkpoint.photos.length;
                  setActivePhoto(checkpoint.photos[prevIdx]);
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all cursor-pointer text-2xl font-bold shadow-lg border border-white/10"
                title="Previous Photo"
              >
                {getIcon('left', { size: 24 })}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIdx = checkpoint.photos.indexOf(activePhoto);
                  const nextIdx = (currentIdx + 1) % checkpoint.photos.length;
                  setActivePhoto(checkpoint.photos[nextIdx]);
                  setZoomScale(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all cursor-pointer text-2xl font-bold shadow-lg border border-white/10"
                title="Next Photo"
              >
                {getIcon('right', { size: 24 })}
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-8 z-50 flex gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg select-none">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
              className="text-white hover:text-sky-300 text-lg font-extrabold px-2 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              －
            </button>
            <span className="text-white text-xs font-bold self-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(4, prev + 0.25))}
              className="text-white hover:text-sky-300 text-lg font-extrabold px-2 transition-colors cursor-pointer"
              title="Zoom In"
            >
              ＋
            </button>
            <div className="w-px bg-white/10 self-stretch"></div>
            <button
              onClick={() => {
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="text-white hover:text-sky-300 text-xs font-semibold px-2 transition-colors cursor-pointer"
              title="Reset"
            >
              Reset
            </button>
          </div>

          {/* Photo Display Window */}
          <div 
            className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              setPanOffset({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
              });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <img
              src={activePhoto}
              alt="Zoomed memory preview"
              className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`
              }}
            />
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
