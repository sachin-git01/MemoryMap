import { createPortal } from 'react-dom';
import { getIcon } from '../utils/icons';

const TONE_STYLES = {
  danger: {
    iconWrap: 'bg-red-50 text-red-500',
    confirm: 'bg-red-600 text-white hover:bg-red-700',
    ring: 'border-red-100'
  },
  primary: {
    iconWrap: 'bg-sky-50 text-blue-500',
    confirm: 'bg-slate-950 text-white hover:bg-slate-800',
    ring: 'border-sky-100'
  }
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  icon = 'trash',
  tone = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const styles = TONE_STYLES[tone] || TONE_STYLES.primary;
  const dialog = (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-[1.5rem] border bg-white p-6 text-center shadow-2xl ${styles.ring}`}>
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
          {getIcon(icon, { size: 22 })}
        </div>
        <h3 className="mt-4 text-lg font-extrabold text-slate-950">{title}</h3>
        {message && (
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            {message}
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-70 ${styles.confirm}`}
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
