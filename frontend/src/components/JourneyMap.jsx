import { useNavigate } from 'react-router-dom';
import { getIcon } from '../utils/icons';
import { useThemeSettings } from '../context/ThemeProvider';

export const JourneyMap = ({
  checkpoints,
  journeyId,
  isSelectMode = false,
  selectedCpIds = new Set(),
  onToggleSelect = () => {}
}) => {
  const navigate = useNavigate();
  const { activeTheme } = useThemeSettings();

  const checkIsVideo = (url) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('video') || url.startsWith('blob:video') || url.includes('.mov') || url.includes('.webm');
  };

  const photoNodeSize = 'var(--checkpoint-photo-size, 5rem)';

  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-theme-border bg-white/80 p-8 text-center sm:p-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-theme-primary/10 text-theme-primary shadow-inner">
          {getIcon('location', { size: 28 })}
        </div>
        <h3 className="text-lg font-bold text-slate-800">Your journey is waiting for its first moment</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
          Add a checkpoint for the day everything began, a turning point, a promise, a win, or a memory you never want to lose.
        </p>
        <button
          onClick={() => navigate(`/journey/${journeyId}/add-checkpoint`)}
          className="mt-6 rounded-full bg-theme-primary px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-theme-accent transition-all duration-300"
        >
          Add First Checkpoint
        </button>
      </div>
    );
  }

  // Vertical winding path configuration
  const spacingY = 180;
  const paddingY = 60;
  const totalPoints = checkpoints.length;
  const svgHeight = (totalPoints - 1) * spacingY + paddingY * 2;

  const getCoordinates = (i) => {
    const y = i * spacingY + paddingY;
    const wave = i % 2 === 0 ? 1 : -1;
    const x = 160 + wave * 50;
    return { x, y, wave };
  };

  // Generate SVG Path with smooth curves
  let pathD = "";
  for (let i = 0; i < totalPoints; i++) {
    const curr = getCoordinates(i);
    if (i === 0) {
      pathD += `M 160,0 L 160,${curr.y} `;
    } else {
      const prev = getCoordinates(i - 1);
      const controlY1 = prev.y + spacingY * 0.4;
      const controlY2 = curr.y - spacingY * 0.4;
      pathD += `C ${prev.x},${controlY1} ${curr.x},${controlY2} ${curr.x},${curr.y} `;
    }
    if (i === totalPoints - 1) {
      pathD += `L ${curr.x},${svgHeight} `;
    }
  }

  return (
    <div className="journey-map-shell relative mx-auto w-full max-w-4xl border border-theme-border/60 bg-white/95 rounded-[2.5rem] shadow-xl overflow-hidden">

      {/* Dreamy Soft Pink & Blue Cloud Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="journey-cloud-pink" style={{ width: '18rem', height: '18rem', left: '-3rem', top: '2rem' }}></div>
        <div className="journey-cloud-blue" style={{ width: '16rem', height: '16rem', right: '-2rem', top: '30%' }}></div>
        <div className="journey-cloud-pink" style={{ width: '14rem', height: '14rem', left: '40%', bottom: '-2rem', opacity: 0.6 }}></div>
        <div className="journey-cloud-blue" style={{ width: '12rem', height: '12rem', left: '-1rem', bottom: '20%', opacity: 0.5 }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 journey-grid-bg opacity-20 z-0 pointer-events-none"></div>

      {/* Path Render */}
      <div className="journey-map-stage relative flex justify-center py-8 sm:py-10 z-10">

        {/* Glowing SVG Road */}
        <svg
          width={320}
          height={svgHeight}
          className="absolute pointer-events-none select-none journey-road-glow"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.9" />
              <stop offset="50%" stopColor="rgb(var(--color-secondary))" stopOpacity="0.85" />
              <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0.9" />
            </linearGradient>
            <filter id="roadGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main glowing path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#roadGrad)"
            strokeWidth="4"
            strokeDasharray={activeTheme === "friendship" ? "8 6" : "0"}
            strokeLinecap="round"
            filter="url(#roadGlow)"
          />

          {/* White dotted trace on top */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="3 5"
            strokeOpacity="0.7"
          />
        </svg>

        {/* Checkpoint Nodes & Text Cards */}
        <div className="relative w-full" style={{ height: svgHeight, zIndex: 10 }}>
          {checkpoints.map((cp, idx) => {
            const coord = getCoordinates(idx);
            const photoSlides = (cp.photos || []).filter(photo => !checkIsVideo(photo));
            const roadX = `calc(50% - 160px + ${coord.x}px)`;
            const isLeft = coord.wave < 0;
            // Text card: alternating sides
            const isLatest = idx === checkpoints.length - 1;

            return (
              <div
                key={cp.id}
                className="absolute w-full flex items-center pointer-events-none"
                style={{ top: coord.y, transform: 'translateY(-50%)' }}
              >
                {/* Text card: on the opposite side of the node wave */}
                <div
                  className={`absolute pointer-events-auto max-w-[110px] sm:max-w-[180px] transition-all duration-300 map-text-card`}
                  style={{
                    zIndex: 25,
                    ...(isLeft
                      ? { left: `calc(${roadX} + 3.5rem)` }
                      : { right: `calc(100% - ${roadX} + 3.5rem)` }
                    ),
                    textAlign: isLeft ? 'left' : 'right',
                  }}
                >
                  <div
                    onClick={() => {
                      if (isSelectMode) {
                        onToggleSelect(cp.id);
                      } else {
                        navigate(`/journey/${journeyId}/checkpoint/${cp.id}`);
                      }
                    }}
                    className="glass-card px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border border-slate-200/50 bg-white/95 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 block tracking-wider uppercase">
                      {new Date(cp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h4 className="text-[10px] sm:text-xs font-extrabold text-slate-800 leading-tight mt-0.5 truncate">
                      {cp.title}
                    </h4>
                    {cp.location && (
                      <span className="text-[8px] sm:text-[9px] font-semibold text-slate-500 mt-0.5 flex items-center gap-0.5" style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
                        📍 {cp.location.split(',')[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Circular Photo Node */}
                <div
                  className="photo-node absolute pointer-events-auto"
                  style={{
                    left: roadX,
                    transform: 'translateX(-50%)',
                    zIndex: 38,
                    width: photoNodeSize,
                    height: photoNodeSize,
                  }}
                >
                  <button
                    onClick={() => {
                      if (isSelectMode) {
                        onToggleSelect(cp.id);
                      } else {
                        navigate(`/journey/${journeyId}/checkpoint/${cp.id}`);
                      }
                    }}
                    className={`checkpoint-photo-button group/orb relative flex cursor-pointer border-0 bg-transparent p-0 ${isLatest ? 'is-latest' : ''} ${
                      isSelectMode && selectedCpIds.has(cp.id) ? 'is-selected' : ''
                    }`}
                    aria-label={cp.title}
                    data-title={cp.title}
                    style={{ width: '100%', height: '100%', borderRadius: '9999px' }}
                  >
                    <span
                      className="checkpoint-photo-orb"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}
                    >
                      {photoSlides.length > 0 ? (
                        photoSlides.map((photo, photoIdx) => (
                          <img
                            key={`${photo}-${photoIdx}`}
                            src={photo}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.opacity = '0';
                            }}
                            className={`checkpoint-photo-slide ${photoSlides.length === 1 ? 'is-single' : ''}`}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              maxWidth: 'none',
                              aspectRatio: '1 / 1',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              borderRadius: 'inherit',
                              animationDelay: `${photoIdx * 2.4}s`,
                              animationDuration: `${photoSlides.length * 2.4}s`
                            }}
                          />
                        ))
                      ) : (
                        <span className="checkpoint-empty-orb" aria-hidden="true"></span>
                      )}
                    </span>
                  </button>
                </div>

                {/* Select mode checkbox */}
                {isSelectMode && (
                  <div className="absolute pointer-events-auto" style={{ left: `calc(${roadX} - 2.2rem)`, zIndex: 40 }}>
                    <button
                      onClick={() => onToggleSelect(cp.id)}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedCpIds.has(cp.id)
                          ? 'bg-theme-accent border-theme-accent text-white'
                          : 'bg-white border-slate-300 hover:border-theme-primary'
                      }`}
                    >
                      {selectedCpIds.has(cp.id) && getIcon('check', { size: 12 })}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};