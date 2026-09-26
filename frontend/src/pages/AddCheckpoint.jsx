import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteJourney } from '../hooks/useRouteJourney';
import { useThemeSettings } from '../context/ThemeProvider';
import { UploadBox } from '../components/UploadBox';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';

export const AddCheckpoint = () => {
  const navigate = useNavigate();
  const {
    activeJourney: currentJourney,
    addCheckpoint,
    isResolvingJourney,
    journeyNotFound
  } = useRouteJourney();
  const { themeConfig } = useThemeSettings();

  // Active step: 1 = Details, 2 = Photos, 3 = Notes, 4 = Review
  const [activeStep, setActiveStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIcon, setSelectedIcon] = useState('heart');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Set default icon from theme config
  useEffect(() => {
    if (themeConfig && themeConfig.icons?.length > 0) {
      setSelectedIcon(themeConfig.icons[0]);
    }
  }, [themeConfig]);

  if (isResolvingJourney) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="h-6 w-32 rounded-full skeleton-soft"></div>
        <div className="h-10 w-72 rounded-2xl skeleton-soft"></div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-3 space-y-3">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="h-14 rounded-2xl skeleton-soft"></div>
            ))}
          </div>
          <div className="md:col-span-9 h-96 rounded-3xl skeleton-soft"></div>
        </div>
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

  const checkIsVideo = (url) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('video') || url.startsWith('blob:video') || url.includes('.mov') || url.includes('.webm');
  };

  const handleSuggestionClick = (suggestedTitle) => {
    setTitle(suggestedTitle);
  };

  const handlePhotoUpload = (photoUrls) => {
    if (Array.isArray(photoUrls)) {
      setUploadedPhotos(prev => [...prev, ...photoUrls]);
    } else {
      setUploadedPhotos(prev => [...prev, photoUrls]);
    }
  };

  const removePhoto = (idxToRemove) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleNextStep = () => {
    if (activeStep === 1 && !title) {
      setNotice({
        type: 'warning',
        title: 'Title needed',
        message: 'Please name this checkpoint before moving ahead.'
      });
      return;
    }
    setNotice(null);
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addCheckpoint(currentJourney.id, {
        title,
        date,
        location,
        description,
        icon: selectedIcon,
        photos: uploadedPhotos,
        notes
      });
      navigate(`/journey/${currentJourney.id}`);
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Checkpoint not saved',
        message: 'Something blocked this memory from being added. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Photos' },
    { num: 3, label: 'Notes' },
    { num: 4, label: 'Review' }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 page-enter">
      
      {/* Back link */}
      <button 
        onClick={() => navigate(`/journey/${currentJourney.id}`)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        {getIcon('left', { size: 14 })}
        Back to Map
      </button>

      {/* Header */}
      <div className="premium-surface mb-8 rounded-3xl p-5 sm:p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Add a Meaningful Checkpoint
        </h1>
        <p className="mt-2 text-xs text-slate-500 font-sans font-semibold leading-relaxed max-w-2xl">
          Add the date, emotion, media, and small details that make this moment belong inside <span className="text-theme-primary">{currentJourney.journeyName}</span>.
        </p>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
        className="mb-6"
      />

      {/* Split Grid Layout mimicking Mockup 5 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Steps Progress Indicator Panel */}
        <div className="md:col-span-3 flex md:flex-col gap-4 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 no-scrollbar">
          {stepsList.map(step => (
            <div 
              key={step.num}
            className={`min-w-[9rem] md:min-w-0 flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${
                activeStep === step.num
                  ? 'border-theme-primary bg-theme-primary/10 text-theme-primary font-bold shadow-sm'
                  : activeStep > step.num
                    ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700 font-semibold'
                    : 'border-slate-100 bg-white text-slate-400 font-medium'
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                activeStep === step.num
                  ? 'bg-theme-primary text-white'
                  : activeStep > step.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {activeStep > step.num ? getIcon('check', { size: 12 }) : step.num}
              </span>
              <span className="text-xs uppercase tracking-wider">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Right Side: Interactive Forms Panel */}
        <div className="md:col-span-9 premium-surface glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-100 shadow-xl min-h-[400px] flex flex-col justify-between">
          
          {/* STEP 1: Details */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">Name the moment</h3>
              
              {/* Title & Suggestions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Checkpoint Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. First Date, Beach Bonfire Night"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
                  />
                </div>

                {themeConfig.suggestedCheckpoints && (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Suggested titles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {themeConfig.suggestedCheckpoints.map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="rounded-full bg-slate-50 border border-slate-200/60 px-3 py-1 text-[10px] font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:border-slate-300"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Location Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Milestone Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-theme-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Location / Place (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Central Park, NY"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Select Icon Indicator
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  {themeConfig.icons?.map(ico => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setSelectedIcon(ico)}
                      className={`flex aspect-square items-center justify-center rounded-lg border transition-all ${
                        selectedIcon === ico
                          ? 'border-theme-primary bg-theme-primary text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {getIcon(ico, { size: 14 })}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Photos */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">Add media memories</h3>
              
              <UploadBox 
                onUploadComplete={handlePhotoUpload} 
                journeyId={currentJourney.id} 
                multiple={true} 
              />

              {uploadedPhotos.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Photos & Videos ({uploadedPhotos.length})</h4>
                  <div className="flex flex-wrap gap-3">
                    {uploadedPhotos.map((p, idx) => (
                      <div key={p + idx} className="relative h-20 w-20 group rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {checkIsVideo(p) ? (
                          <video src={p} className="h-full w-full object-cover" muted playsInline />
                        ) : (
                          <img src={p} alt="Milestone media" className="h-full w-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-300"
                        >
                          {getIcon('trash', { size: 14 })}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-theme-border bg-theme-primary/5 p-5 text-center">
                  <p className="text-xs text-theme-muted font-semibold">No photos yet. This checkpoint can still be saved as a written memory.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Notes */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">Write the feeling</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Describe what happened (Story Journal)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Record your thoughts, emotions, and descriptions..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-theme-primary focus:bg-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Short Highlight (Inside Note Quote)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 'Butterflies everywhere!' or 'The most beautiful sunset!'"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-theme-primary focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review Checkpoint parameters */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">Review the checkpoint</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                <div className="space-y-2">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestone Header</span>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-theme-primary/10 text-theme-primary">{getIcon(selectedIcon, { size: 16 })}</span>
                    <strong className="text-sm text-slate-800">{title}</strong>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Date: {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {location && <p className="text-xs text-slate-500 font-medium">Location: {location}</p>}
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Photos & Videos preview</span>
                    <div className="flex gap-2">
                      {uploadedPhotos.map((ph, idx) => (
                        <div key={ph + idx} className="h-12 w-12 rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center">
                          {checkIsVideo(ph) ? (
                            <video src={ph} className="h-full w-full object-cover" muted />
                          ) : (
                            <img src={ph} className="h-full w-full object-cover" alt="preview" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {description && (
                <div className="space-y-1 bg-slate-50 p-4 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Journal Story</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{description}</p>
                </div>
              )}

              {notes && (
                <div className="space-y-1 bg-theme-primary/5 p-4 rounded-xl border border-theme-border/50">
                  <span className="block text-[10px] text-theme-primary font-bold uppercase">Highlight Note Quote</span>
                  <p className="text-xs italic text-theme-muted font-semibold">"{notes}"</p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors sm:w-auto"
              >
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/journey/${currentJourney.id}`)}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors sm:w-auto"
              >
                Cancel
              </button>
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex w-full items-center justify-center gap-1 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors sm:w-auto"
              >
                Next Step
                {getIcon('right', { size: 14 })}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-theme-primary px-6 py-3 text-xs font-bold text-white hover:bg-theme-accent transition-colors shadow shadow-theme-primary/10 sm:w-auto"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    {getIcon('check', { size: 14 })}
                    Save Checkpoint
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
