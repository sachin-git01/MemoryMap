import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../context/JourneyContext';
import { JourneyTypeCard } from '../components/JourneyTypeCard';
import { InlineNotice } from '../components/InlineNotice';
import { getIcon } from '../utils/icons';
import { CUSTOM_FONT_OPTIONS, CUSTOM_THEME_PRESETS } from '../data/mockData';

export const CreateJourney = () => {
  const { createJourney } = useJourney();
  const navigate = useNavigate();

  // Step tracking: 1 = Choose type, 2 = Fill details
  const [step, setStep] = useState(1);

  // Form State
  const [journeyType, setJourneyType] = useState('love');
  const [journeyName, setJourneyName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [privacy, setPrivacy] = useState('private');
  const [notice, setNotice] = useState(null);

  // Custom Color State (if custom journey)
  const [customPreset, setCustomPreset] = useState(CUSTOM_THEME_PRESETS[0].id);
  const [customFont, setCustomFont] = useState(CUSTOM_FONT_OPTIONS[0].id);
  const [customColors, setCustomColors] = useState({
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#4f46e5',
    accentHover: '#3730a3',
    bgGradientFrom: '#f5f3ff',
    bgGradientTo: '#eedeff'
  });

  const selectedCustomFont = CUSTOM_FONT_OPTIONS.find(font => font.id === customFont) || CUSTOM_FONT_OPTIONS[0];

  const handleNextStep = () => {
    // Set default name suggestions based on type
    if (!journeyName) {
      if (journeyType === 'love') setJourneyName('Our Love Story ❤️');
      else if (journeyType === 'friendship') setJourneyName('College Crew ⚡');
      else if (journeyType === 'family') setJourneyName('The Family Album 🏡');
      else if (journeyType === 'personal') setJourneyName('My Growth Journey 🚀');
      else setJourneyName('My Memory Map ✨');
    }
    setStep(2);
  };

  const handleCustomColorChange = (key, val) => {
    setCustomColors(prev => ({ ...prev, [key]: val }));
  };

  const handlePresetSelect = (preset) => {
    setCustomPreset(preset.id);
    setCustomColors(preset.colors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!journeyName) return;

    try {
      const journeyId = await createJourney({
        journeyName,
        journeyType,
        theme: journeyType,
        startDate,
        privacy,
        ...(journeyType === 'custom' ? {
          customPreset,
          customFont,
          customFontFamily: selectedCustomFont.family,
          customColors
        } : {})
      });
      navigate(`/journey/${journeyId}`);
    } catch (err) {
      console.error("Error creating journey:", err);
      setNotice({
        type: 'error',
        title: 'Journey not created',
        message: 'Could not build this memory map right now. Please try again.'
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 page-enter">

      {/* Back button */}
      <button
        onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        {getIcon('left', { size: 14 })}
        {step === 2 ? "Back to Choose Type" : "Back to Dashboard"}
      </button>

      {/* Progress header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {step === 1 ? "Choose Your Journey Type" : `Create Your ${journeyType.charAt(0).toUpperCase() + journeyType.slice(1)} Journey`}
        </h1>
        <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {step === 1
            ? "What kind of memory map are we crafting today? Wording, colors, suggested checkpoints, and layouts adapt to your choice."
            : "Let's gather some basic details to carve out your personalized memory path."}
        </p>
      </div>

      <InlineNotice
        notice={notice}
        onDismiss={() => setNotice(null)}
        className="mx-auto mb-6 max-w-3xl"
      />

      {step === 1 ? (
        /* STEP 1: Select Type */
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <JourneyTypeCard
              type="love"
              isSelected={journeyType === 'love'}
              onClick={() => setJourneyType('love')}
            />
            <JourneyTypeCard
              type="friendship"
              isSelected={journeyType === 'friendship'}
              onClick={() => setJourneyType('friendship')}
            />
            <JourneyTypeCard
              type="family"
              isSelected={journeyType === 'family'}
              onClick={() => setJourneyType('family')}
            />
            <JourneyTypeCard
              type="personal"
              isSelected={journeyType === 'personal'}
              onClick={() => setJourneyType('personal')}
            />
            <JourneyTypeCard
              type="custom"
              isSelected={journeyType === 'custom'}
              onClick={() => setJourneyType('custom')}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleNextStep}
              className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              Continue to Details
              {getIcon('right', { size: 16 })}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: Fill Details */
        <form onSubmit={handleSubmit} className="premium-surface rounded-3xl p-6 sm:p-8 bg-white max-w-3xl mx-auto border border-slate-100 shadow-xl space-y-6">

          {/* Journey Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Journey Name
            </label>
            <input
              type="text"
              required
              value={journeyName}
              onChange={(e) => setJourneyName(e.target.value)}
              placeholder="e.g. Our Love Story ❤️"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              When did this journey begin?
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-medium text-slate-800 outline-none transition-all focus:border-theme-primary focus:bg-white focus:ring-2 focus:ring-theme-primary/10"
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
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${privacy === 'private'
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
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${privacy === 'shared'
                  ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {getIcon('unlock', { size: 14 })}
                Shared View
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-semibold italic">
              *Private: Only you can view this page. Shared: Share a read-only link later.
            </p>
          </div>

          {/* CUSTOM THEME PALETTE EDITOR (Only for custom journey type) */}
          {journeyType === 'custom' && (
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                  Custom Theme Studio
                </h3>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  Pick one of 7 moods, choose 1 of 5 fonts, then customize every color.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Theme Presets
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CUSTOM_THEME_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`rounded-2xl border p-3 text-left transition-all ${customPreset === preset.id
                        ? 'border-slate-900 bg-slate-950 text-white shadow-lg'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                    >
                      <span className="block text-xs font-extrabold">{preset.name}</span>
                      <span className={`mt-0.5 block text-[10px] font-semibold ${customPreset === preset.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {preset.mood}
                      </span>
                      <span className="mt-2 flex gap-1">
                        {Object.values(preset.colors).slice(0, 4).map(color => (
                          <span key={color} className="h-3 w-3 rounded-full border border-white/50" style={{ backgroundColor: color }}></span>
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Font Style
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {CUSTOM_FONT_OPTIONS.map(font => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setCustomFont(font.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${customFont === font.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                        }`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ['primary', 'Primary Accent'],
                    ['secondary', 'Secondary Color'],
                    ['accent', 'Deep Tone Accent'],
                    ['accentHover', 'Hover Accent'],
                    ['bgGradientFrom', 'Background Start'],
                    ['bgGradientTo', 'Background End']
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {label}
                      </label>
                      <div className="flex gap-2 items-center rounded-xl border border-slate-200 bg-white px-2 py-2">
                        <input
                          type="color"
                          value={customColors[key]}
                          onChange={(e) => handleCustomColorChange(key, e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200"
                        />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{customColors[key]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-3xl border p-5 shadow-inner"
                  style={{
                    fontFamily: selectedCustomFont.family,
                    background: `linear-gradient(135deg, ${customColors.bgGradientFrom}, ${customColors.bgGradientTo})`,
                    borderColor: customColors.primary
                  }}
                >
                  <span className="inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ backgroundColor: customColors.primary }}>
                    Live Preview
                  </span>
                  <h4 className="mt-4 text-2xl font-extrabold" style={{ color: customColors.accent }}>
                    {journeyName || "My Memory Map"}
                  </h4>
                  <p className="mt-2 text-xs font-semibold" style={{ color: customColors.accentHover }}>
                    Dashboard, map, gallery, and checkpoints will inherit this mood.
                  </p>
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/75 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: customColors.primary }}>
                      {getIcon('star', { size: 18 })}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold" style={{ color: customColors.accent }}>First Custom Milestone</p>
                      <p className="text-[10px] font-bold text-slate-500">A preview of your checkpoint style.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
          >
            {getIcon('check', { size: 14 })}
            Create My Journey
          </button>

        </form>
      )}

    </div>
  );
};
