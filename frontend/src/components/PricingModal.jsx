import { getIcon } from '../utils/icons';
import { PREMIUM_PLANS } from '../data/premiumPlans';

export const PricingModal = ({ isOpen, onClose, currentPlanId, onSelectPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-blue-950/45 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-[2rem] border border-sky-100 bg-white p-5 shadow-[0_35px_90px_-36px_rgba(15,23,42,0.55)] sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-white text-slate-500 shadow-sm transition-colors hover:bg-sky-50 hover:text-sky-600"
          aria-label="Close premium pricing"
        >
          {getIcon('close', { size: 18 })}
        </button>

        <div className="max-w-2xl pr-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-sky-600">
            {getIcon('star', { size: 14 })}
            Premium
          </span>
          <h2 className="mt-4 font-serif text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
            Unlock Premium
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-blue-900/65 sm:text-base">
            Keep more journeys, richer photos, and polished exports inside one private memory space.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {PREMIUM_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            return (
              <article
                key={plan.name}
                className={`relative flex min-h-[25rem] flex-col rounded-[1.5rem] border bg-gradient-to-br from-white via-sky-50/35 to-white p-5 shadow-[0_24px_55px_-42px_rgba(37,99,235,0.75)] ${
                  isCurrent ? 'border-blue-300 ring-4 ring-blue-100' : 'border-sky-100'
                }`}
              >
                {isCurrent && (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">
                    Active
                  </span>
                )}
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.accent} text-white shadow-lg shadow-blue-500/20`}>
                  {getIcon('star', { size: 20 })}
                </div>
                <h3 className="text-xl font-black text-blue-950">{plan.name}</h3>
                <p className="mt-2 text-sm font-semibold text-blue-900/55">{plan.bestFor}</p>

                <div className="mt-5">
                  <span className="text-sm font-bold text-slate-400">Rs</span>
                  <strong className={`mx-1 text-4xl font-black ${plan.tone}`}>{plan.price}</strong>
                  <span className="text-sm font-bold text-slate-400">/mo</span>
                </div>
                <p className="mt-2 text-sm font-extrabold text-blue-900">{plan.storage}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm font-medium leading-5 text-slate-600">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                        {getIcon('check', { size: 13 })}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onSelectPlan?.(plan)}
                  className={`mt-7 rounded-2xl px-4 py-3 text-sm font-black shadow-[0_18px_35px_-22px_rgba(37,99,235,0.9)] transition-transform hover:-translate-y-0.5 ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700 shadow-none hover:translate-y-0'
                      : `bg-gradient-to-r ${plan.accent} text-white`
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Choose ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
