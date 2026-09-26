import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEME_CONFIGS } from '../data/mockData';
import { getIcon } from '../utils/icons';

const THEME_DESCRIPTIONS = {
  love: 'Romantic chapters, promises, dates, and the little sparks between them.',
  friendship: 'Inside jokes, wild plans, birthdays, trips, and the crew timeline.',
  family: 'Warm home moments, traditions, old photos, and people who shaped you.',
  personal: 'Goals, brave starts, lessons, wins, and the climb toward yourself.',
  custom: 'A flexible story world built with your own colors, rhythm, and mood.'
};

export const JourneyCard = ({
  journey,
  checkpointsCount = 0,
  photosCount = 0,
  coverImage = '',
  progress = 0,
  typeStyle,
  deleteMode = false,
  onDeleteRequest = () => {}
}) => {
  const navigate = useNavigate();
  const journeyType = journey.theme || journey.journeyType || 'custom';
  const config = THEME_CONFIGS[journeyType] || THEME_CONFIGS.custom;
  const fallbackIcon = {
    love: 'heart', friendship: 'group', family: 'home',
    personal: 'flag', custom: 'star'
  }[journeyType] || 'star';
  const style = typeStyle || {
    label: config.name, icon: fallbackIcon,
    badge: 'bg-slate-50 text-slate-600', bar: 'from-slate-400 to-sky-500'
  };

  const [visibleCover, setVisibleCover] = useState(coverImage || style.cover || '');
  const [imgError, setImgError] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const descRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    setVisibleCover(coverImage || style.cover || '');
    setImgError(false);
  }, [coverImage, style.cover]);

  // Check if description overflows the clamped area
  useEffect(() => {
    if (descRef.current) {
      setIsOverflowing(descRef.current.scrollHeight > descRef.current.clientHeight);
    }
  }, []);

  const description = journey.description || THEME_DESCRIPTIONS[journeyType] || THEME_DESCRIPTIONS.custom;

  const formattedDate = new Date(journey.startDate).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric'
  });

  const privacyLabel = journey.privacy === 'private' ? 'Private' : 'Public';

  const handleSeeMore = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDescModal(true);
  };

  const handleCardClick = () => {
    if (deleteMode) {
      onDeleteRequest(journey);
      return;
    }
    navigate(`/journey/${journey.id}`);
  };

  const handleImgError = () => {
    setImgError(true);
    if (style.cover) {
      setVisibleCover(style.cover);
    } else {
      setVisibleCover('');
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        data-journey-type={journeyType}
        className={`journey-card group cursor-pointer overflow-hidden rounded-[1.35rem] border bg-white/[0.92] shadow-[0_18px_45px_-34px_rgba(14,165,233,0.7)] transition-all duration-300 hover:shadow-[0_24px_60px_-38px_rgba(14,165,233,0.9)] ${
          deleteMode
            ? 'border-red-200 ring-4 ring-red-50 hover:border-red-300 hover:-translate-y-0.5'
            : 'border-sky-100 hover:border-sky-200 hover:-translate-y-0.5'
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Cover Image */}
          <div className="relative h-44 shrink-0 overflow-hidden sm:h-52 sm:w-44 lg:w-40 xl:w-44">
            <div className="absolute inset-0 rounded-[1.05rem] bg-gradient-to-br from-sky-50 via-white to-sky-100">
              {visibleCover && !imgError ? (
                <img
                  src={visibleCover}
                  alt={journey.journeyName}
                  onError={handleImgError}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="card-img-fallback h-full w-full">
                  {getIcon(style.icon, { size: 32 })}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            {/* Badge + Delete */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${style.badge}`}>
                {getIcon(style.icon, { size: 11 })}
                {style.label}
              </span>
              {deleteMode && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  {getIcon('trash', { size: 13 })}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="line-clamp-1 text-base font-extrabold leading-tight text-blue-950 transition-colors group-hover:text-sky-600">
              {journey.journeyName}
            </h3>

            {/* Description with clamping and See More */}
            <div className="relative mt-1.5">
              <p
                ref={descRef}
                className="line-clamp-2 text-xs font-medium leading-relaxed text-blue-900/65"
              >
                {description}
              </p>
              {(description.length > 120 || isOverflowing) && (
                <button
                  onClick={handleSeeMore}
                  className="see-more-btn mt-0.5 text-[10px] font-bold text-sky-500 hover:text-sky-700 transition-colors"
                >
                  See more
                </button>
              )}
            </div>

            {/* Progress */}
            {progress > 0 && (
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
                  <span>{formattedDate}</span>
                  <span>{progress}% complete</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-auto pt-3">
              {progress === 0 && (
                <div className="text-[11px] font-bold text-slate-400 mb-0.5">
                  {formattedDate}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-500">
                <span>{checkpointsCount} checkpoints</span>
                <span className="stats-divider inline-block"></span>
                <span>{photosCount} photos</span>
                <span className="stats-divider inline-block"></span>
                <span className="uppercase tracking-wide text-slate-400">{privacyLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* "See More" Description Modal */}
      {showDescModal && (
        <div className="see-more-overlay" onClick={() => setShowDescModal(false)}>
          <div className="see-more-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${style.badge}`}>
                  {getIcon(style.icon, { size: 11 })}
                  {style.label}
                </span>
              </div>
              <button
                onClick={() => setShowDescModal(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                {getIcon('close', { size: 14 })}
              </button>
            </div>
            <h3 className="text-base font-extrabold text-blue-950 mb-1">{journey.journeyName}</h3>
            <p className="text-xs font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">
              {description}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-400">
              <span>Started {formattedDate}</span>
              <span>{checkpointsCount} checkpoints</span>
              <span>{photosCount} photos</span>
              <span className="uppercase">{privacyLabel}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
