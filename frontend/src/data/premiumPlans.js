const PREMIUM_PLAN_KEY = 'memorymap_premium_plan';
export const PREMIUM_PLAN_EVENT = 'memorymap_premium_plan_changed';

export const FREE_PLAN = {
  id: 'free',
  name: 'Free',
  price: '0',
  storageLimitMb: 50,
  storage: '50 MB storage'
};

export const PREMIUM_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '200',
    accent: 'from-sky-400 to-blue-500',
    tone: 'text-sky-600',
    storageLimitMb: 200,
    storage: '200 MB storage',
    bestFor: 'Personal memory builders',
    features: ['10 private journeys', 'High-quality photo maps', 'Gallery and notes', 'Basic export tools']
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '350',
    accent: 'from-blue-500 to-indigo-500',
    tone: 'text-blue-600',
    storageLimitMb: 1024,
    storage: '1 GB storage',
    bestFor: 'Families and close groups',
    features: ['Unlimited journeys', 'Advanced memory insights', 'Priority uploads', 'Beautiful exports']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '500',
    accent: 'from-blue-950 to-sky-600',
    tone: 'text-blue-950',
    storageLimitMb: 5120,
    storage: '5 GB storage',
    bestFor: 'Collectors and storytellers',
    features: ['Everything in Plus', 'Premium themes', 'Priority support', 'Archive-ready backups']
  }
];

export const formatStorageLimit = (mb) => {
  if (mb >= 1024) return `${Number((mb / 1024).toFixed(1))} GB`;
  return `${Number(mb.toFixed(1))} MB`;
};

const getPremiumPlanById = (planId) => (
  PREMIUM_PLANS.find(plan => plan.id === planId) || null
);

export const getStoredPremiumPlan = () => {
  if (typeof window === 'undefined') return null;
  return getPremiumPlanById(window.localStorage.getItem(PREMIUM_PLAN_KEY));
};

export const setStoredPremiumPlan = (planId) => {
  if (typeof window === 'undefined') return null;

  const plan = getPremiumPlanById(planId);
  if (!plan) return null;

  window.localStorage.setItem(PREMIUM_PLAN_KEY, plan.id);
  window.dispatchEvent(new CustomEvent(PREMIUM_PLAN_EVENT, { detail: plan }));
  return plan;
};
