import { useEffect, useState } from 'react';
import { useRouteJourney } from '../hooks/useRouteJourney';
import { useThemeSettings } from '../context/ThemeProvider';
import { NoteCard } from '../components/NoteCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';

export const NotesPage = () => {
  const {
    activeJourney: currentJourney,
    notes,
    addNote,
    updateNote,
    deleteNote,
    isResolvingJourney,
    journeyNotFound
  } = useRouteJourney();
  const { themeConfig, activeTheme } = useThemeSettings();

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // If editing a note, stores note object; else null for creation
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);

  // Set default category when theme configuration updates
  useEffect(() => {
    if (themeConfig) {
      const categories = getCategoriesForTheme(activeTheme);
      setNoteCategory(categories[0]);
    }
  }, [themeConfig, activeTheme]);

  const getCategoriesForTheme = (theme) => {
    switch (theme) {
      case 'love':
        return ['Letter', 'Promise', 'Quote', 'Moment'];
      case 'friendship':
        return ['Joke', 'Quote', 'Moment', 'Memory'];
      case 'family':
        return ['Family Note', 'Memory', 'Tradition'];
      case 'personal':
        return ['Reflection', 'Goal', 'Achievement', 'Plan'];
      default:
        return ['Note', 'Memory', 'Thought'];
    }
  };

  if (isResolvingJourney) {
    return <div className="text-center p-8">Loading digital notes...</div>;
  }

  if (journeyNotFound || !currentJourney) {
    return <div className="text-center p-8">Journey not found.</div>;
  }

  const categories = getCategoriesForTheme(activeTheme);

  const openCreateModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteDate(new Date().toISOString().split('T')[0]);
    setNoteCategory(categories[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteDate(note.date);
    setNoteCategory(note.category);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;

    setSaving(true);
    try {
      if (editingNote) {
        // Update Note
        await updateNote(currentJourney.id, editingNote.id, {
          title: noteTitle,
          content: noteContent,
          date: noteDate,
          category: noteCategory
        });
      } else {
        // Create Note
        await addNote(currentJourney.id, {
          title: noteTitle,
          content: noteContent,
          date: noteDate,
          category: noteCategory
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Note not saved',
        message: 'Could not save this note. Please check the details and try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (nId) => {
    setNoteToDelete(notes.find(note => note.id === nId) || { id: nId, title: 'this note' });
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    setDeletingNote(true);
    try {
      await deleteNote(currentJourney.id, noteToDelete.id);
      setNoteToDelete(null);
      setNotice({
        type: 'success',
        title: 'Note deleted',
        message: 'That note has been removed from this journey.'
      });
    } catch (err) {
      console.error(err);
      setNotice({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not delete this note. Please try again.'
      });
    } finally {
      setDeletingNote(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 page-enter space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Notes & Letters
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-sans font-semibold">
            {activeTheme === 'love' ? "Preserve your letters, promises, and sweet quotes." :
             activeTheme === 'friendship' ? "Hold quotes, crazy inside jokes, and logs." :
             activeTheme === 'family' ? "Document old legends, recipes, and notes." :
             "Jot down goals, reflections, and achievements."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          {getIcon('plus', { size: 14 })}
          Add Scrapbook Note
        </button>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
      />

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(n => (
            <NoteCard
              key={n.id}
              note={n}
              onEdit={openEditModal}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/40">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-base font-bold text-slate-700 font-sans">Scrapbook is empty</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
            Record promises, letters, quotes, or goals. Add your first digital note to this journey!
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow"
          >
            Create Note
          </button>
        </div>
      )}

      {/* Creation/Edit Note Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 animate-fade-in">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 font-sans">
                {editingNote ? "Edit Note" : "Create Note"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                {getIcon('close', { size: 18 })}
              </button>
            </div>

            <InlineNotice
              notice={notice}
              onDismiss={() => setNotice(null)}
            />

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Our Promises, The Canteen Rules"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Note Content
                </label>
                <textarea
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                  placeholder="Write your letter, memory log, or quote here..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    {getIcon('check', { size: 14 })}
                    Save Scrapbook Note
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        title="Delete this note?"
        message={`"${noteToDelete?.title || 'This note'}" will be removed from this journey. This cannot be undone.`}
        icon="trash"
        tone="danger"
        confirmLabel="Delete"
        loading={deletingNote}
        onConfirm={confirmDeleteNote}
        onCancel={() => setNoteToDelete(null)}
      />

    </div>
  );
};
