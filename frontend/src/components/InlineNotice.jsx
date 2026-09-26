import { getIcon } from '../utils/icons';

const NOTICE_STYLES = {
  success: {
    icon: 'check',
    shell: 'border-emerald-100 bg-emerald-50/90 text-emerald-900',
    iconWrap: 'bg-emerald-500 text-white',
    close: 'text-emerald-700 hover:bg-emerald-100'
  },
  error: {
    icon: 'trash',
    shell: 'border-red-100 bg-red-50/90 text-red-900',
    iconWrap: 'bg-red-500 text-white',
    close: 'text-red-700 hover:bg-red-100'
  },
  warning: {
    icon: 'star',
    shell: 'border-amber-100 bg-amber-50/90 text-amber-900',
    iconWrap: 'bg-amber-400 text-white',
    close: 'text-amber-700 hover:bg-amber-100'
  },
  info: {
    icon: 'star',
    shell: 'border-sky-100 bg-sky-50/90 text-sky-950',
    iconWrap: 'bg-sky-500 text-white',
    close: 'text-sky-700 hover:bg-sky-100'
  }
};

export const InlineNotice = ({ notice, type = 'info', title, message, onDismiss, className = '' }) => {
  const data = notice || { type, title, message };
  if (!data?.title && !data?.message) return null;

  const tone = NOTICE_STYLES[data.type || type] || NOTICE_STYLES.info;

  return (
    <div
      role={(data.type || type) === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-md animate-slide-up ${tone.shell} ${className}`}
    >
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${tone.iconWrap}`}>
        {getIcon(data.icon || tone.icon, { size: 16 })}
      </span>
      <span className="min-w-0 flex-1">
        {data.title && (
          <span className="block text-sm font-extrabold leading-5">
            {data.title}
          </span>
        )}
        {data.message && (
          <span className="mt-0.5 block text-xs font-semibold leading-5 opacity-75">
            {data.message}
          </span>
        )}
      </span>
      {onDismiss && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${tone.close}`}
          aria-label="Dismiss message"
        >
          {getIcon('close', { size: 14 })}
        </button>
      )}
    </div>
  );
};
