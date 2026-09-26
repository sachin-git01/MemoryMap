import { THEME_CONFIGS } from '../data/mockData';

export const JourneyTypeCard = ({ type, isSelected, onClick }) => {
  const config = THEME_CONFIGS[type];
  
  if (!config) return null;

  const colorStyles = {
    love: {
      border: 'border-rose-200 hover:border-rose-400',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20',
      accentBg: 'bg-rose-50 text-rose-600',
      iconCircle: 'bg-rose-100 text-rose-600'
    },
    friendship: {
      border: 'border-violet-200 hover:border-violet-400',
      activeBorder: 'border-violet-500 ring-2 ring-violet-500/20',
      accentBg: 'bg-violet-50 text-violet-600',
      iconCircle: 'bg-violet-100 text-violet-600'
    },
    family: {
      border: 'border-amber-200 hover:border-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
      accentBg: 'bg-amber-50 text-amber-700',
      iconCircle: 'bg-amber-100 text-amber-700'
    },
    personal: {
      border: 'border-sky-200 hover:border-sky-400',
      activeBorder: 'border-sky-500 ring-2 ring-sky-500/20',
      accentBg: 'bg-sky-50 text-sky-600',
      iconCircle: 'bg-sky-100 text-sky-600'
    },
    custom: {
      border: 'border-slate-200 hover:border-slate-400',
      activeBorder: 'border-slate-800 ring-2 ring-slate-800/20',
      accentBg: 'bg-slate-50 text-slate-700',
      iconCircle: 'bg-slate-100 text-slate-800'
    }
  }[type];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 ${
        isSelected ? colorStyles.activeBorder : colorStyles.border
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Top Emoji Circle */}
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-inner ${colorStyles.iconCircle}`}>
            {config.emoji}
          </div>

          {/* Title and Mood */}
          <h3 className="text-base font-extrabold text-slate-800">
            {config.name}
          </h3>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${colorStyles.accentBg}`}>
            {config.mood}
          </span>

          {/* Suggested Checkpoints Info */}
          <p className="mt-4 text-xs text-slate-500 leading-relaxed line-clamp-3">
            <strong>{type === 'custom' ? 'Includes:' : 'Checkpoints suggest:'}</strong> {type === 'custom' ? '7 theme presets, 5 fonts, and editable colors.' : `${config.suggestedCheckpoints.slice(0, 4).join(', ')}, and more.`}
          </p>
        </div>

        {/* Dynamic Theme Color Dots Preview */}
        <div className="mt-6 flex items-center gap-1.5 pt-2 border-t border-slate-50">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Palette:</span>
          <div className="flex gap-1">
            {type === 'love' && (
              <>
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                <span className="h-3 w-3 rounded-full bg-pink-400"></span>
                <span className="h-3 w-3 rounded-full bg-orange-100"></span>
              </>
            )}
            {type === 'friendship' && (
              <>
                <span className="h-3 w-3 rounded-full bg-violet-500"></span>
                <span className="h-3 w-3 rounded-full bg-blue-400"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-300"></span>
              </>
            )}
            {type === 'family' && (
              <>
                <span className="h-3 w-3 rounded-full bg-amber-700"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              </>
            )}
            {type === 'personal' && (
              <>
                <span className="h-3 w-3 rounded-full bg-sky-500"></span>
                <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                <span className="h-3 w-3 rounded-full bg-white border"></span>
              </>
            )}
            {type === 'custom' && (
              <span className="text-[9px] text-slate-500 font-bold">Pick your own colors!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
