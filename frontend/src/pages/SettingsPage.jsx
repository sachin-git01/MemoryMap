import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteJourney } from '../hooks/useRouteJourney';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const {
    activeJourney: currentJourney,
    checkpoints,
    notes,
    updateJourney,
    deleteJourney,
    isResolvingJourney,
    journeyNotFound
  } = useRouteJourney();

  // Form State
  const [journeyName, setJourneyName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [theme, setTheme] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load fields
  useEffect(() => {
    if (currentJourney) {
      setJourneyName(currentJourney.journeyName);
      setStartDate(currentJourney.startDate);
      setPrivacy(currentJourney.privacy);
      setTheme(currentJourney.theme || currentJourney.journeyType);
    }
  }, [currentJourney]);

  if (isResolvingJourney) {
    return <div className="text-center p-8">Loading Settings...</div>;
  }

  if (journeyNotFound || !currentJourney) {
    return <div className="text-center p-8">Journey not found.</div>;
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    if (!journeyName) return;

    setSaving(true);
    try {
      await updateJourney(currentJourney.id, {
        journeyName,
        startDate,
        privacy,
        theme,
        journeyType: theme // Keep journey type synchronized with presets
      });
      setNotice({
        type: 'success',
        title: 'Settings saved',
        message: 'Your journey settings updated beautifully.'
      });
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Settings not saved',
        message: 'Could not update this journey. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportMemories = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        journey: {
          journeyName: currentJourney.journeyName,
          journeyType: currentJourney.journeyType,
          startDate: currentJourney.startDate,
          theme: currentJourney.theme,
          privacy: currentJourney.privacy
        },
        checkpoints: checkpoints.map(cp => ({
          title: cp.title,
          date: cp.date,
          description: cp.description,
          icon: cp.icon,
          notes: cp.notes,
          photos: cp.photos || []
        })),
        notes: notes.map(n => ({
          title: n.title,
          content: n.content,
          date: n.date,
          category: n.category
        }))
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);

      const safeName = currentJourney.journeyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      downloadAnchor.setAttribute("download", `memorymap_backup_${safeName}.json`);

      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setNotice({
        type: 'success',
        title: 'Export ready',
        message: 'Your journey archive has been downloaded.'
      });
    } catch (error) {
      console.error(error);
      setNotice({
        type: 'error',
        title: 'Export failed',
        message: 'Could not prepare your backup file. Please try again.'
      });
    }
  };

  const handleDeleteJourney = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteJourney = async () => {
    setDeleting(true);
    try {
      await deleteJourney(currentJourney.id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Journey not deleted',
        message: 'Could not delete this journey. Please try again.'
      });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 page-enter space-y-8">

      {/* Title */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Journey Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-sans font-semibold">
          Manage name, presets, privacy and backup data for <span className="text-theme-primary">{currentJourney.journeyName}</span>.
        </p>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

      {/* Main Settings Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/50 shadow-sm space-y-8">

        <form onSubmit={handleUpdateSettings} className="space-y-6">

          {/* Change name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Journey Name
            </label>
            <input
              type="text"
              required
              value={journeyName}
              onChange={(e) => setJourneyName(e.target.value)}
              placeholder="Our Love Story ❤️"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
            />
          </div>

          {/* Change theme mood */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Change Preset Theme Mood
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
            >
              <option value="love">Heartfelt Pink (Love Story)</option>
              <option value="friendship">Vibrant Purple (Friendship)</option>
              <option value="family">Warm Golden (Family Album)</option>
              <option value="personal">Sky Blue (Life / Career Growth)</option>
              <option value="custom">Slate Grey (Custom/Flexible)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
            />
          </div>

          {/* Privacy Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Privacy Settings
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPrivacy('private')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3.5 text-xs font-bold transition-all ${privacy === 'private'
                  ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {getIcon('lock', { size: 14 })}
                Private Journey
              </button>
              <button
                type="button"
                onClick={() => setPrivacy('shared')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3.5 text-xs font-bold transition-all ${privacy === 'shared'
                  ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {getIcon('unlock', { size: 14 })}
                Shared View
              </button>
            </div>
          </div>

          {/* Submit Save */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : "Save Settings Changes"}
          </button>
        </form>

        {/* Backups & Actions Section */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-sans">
              Backup & Archives
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-sans font-medium">
              Export all visual timelines, journals, letters and media parameters into a JSON file to safeguard your memories offline.
            </p>
            <button
              type="button"
              onClick={handleExportMemories}
              className="mt-3 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              🚀 Export Journey Memories
            </button>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-red-600 font-sans">
              Danger Zone
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-sans font-medium">
              Permanently purge this journey and all metadata. This action is final and can never be undone.
            </p>
            <button
              type="button"
              onClick={handleDeleteJourney}
              className="mt-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 text-xs font-bold transition-all shadow-sm border border-red-100"
            >
              Delete This Journey
            </button>
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this journey?"
        message={`"${currentJourney.journeyName}" and every checkpoint, photo log, and note inside it will be permanently removed.`}
        icon="trash"
        tone="danger"
        confirmLabel="Delete Journey"
        loading={deleting}
        onConfirm={confirmDeleteJourney}
        onCancel={() => setShowDeleteConfirm(false)}
      />

    </div>
  );
};
