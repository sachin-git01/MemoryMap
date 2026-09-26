import { getIcon } from '../utils/icons';

export const NoteCard = ({ note, onEdit, onDelete }) => {
  const dateStr = new Date(note.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Get color styles based on category/tag
  const getCategoryStyles = (category) => {
    const cat = category?.toLowerCase();
    if (cat === 'promise' || cat === 'letter') {
      return 'bg-pink-50/70 border-pink-100 text-pink-700';
    }
    if (cat === 'joke' || cat === 'inside jokes') {
      return 'bg-violet-50/70 border-violet-100 text-violet-700';
    }
    if (cat === 'reflection' || cat === 'goal') {
      return 'bg-sky-50/70 border-sky-100 text-sky-700';
    }
    if (cat === 'family note' || cat === 'memories') {
      return 'bg-amber-50/70 border-amber-100 text-amber-700';
    }
    return 'bg-slate-50/70 border-slate-100 text-slate-700';
  };

  const tagStyles = getCategoryStyles(note.category);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-theme-primary">
      <div>
        {/* Title, Date and Category Badge */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tagStyles}`}>
              {note.category || 'Note'}
            </span>
            <h4 className="mt-2 text-sm font-bold text-slate-800 line-clamp-1">
              {note.title}
            </h4>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={() => onEdit(note)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              title="Edit Note"
            >
              {getIcon('edit', { size: 14 })}
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete Note"
            >
              {getIcon('trash', { size: 14 })}
            </button>
          </div>
        </div>

        {/* Note Content */}
        <p className="mt-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans font-medium">
          {note.content}
        </p>
      </div>

      {/* Date stamp */}
      <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-semibold text-right">
        {dateStr}
      </div>
    </div>
  );
};
