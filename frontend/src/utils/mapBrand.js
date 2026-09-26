export const DEFAULT_MAP_NAMES = {
  love: 'LoveMap',
  friendship: 'FriendshipMap',
  family: 'FamilyMap',
  personal: 'LifeMap',
  custom: 'MyMap'
};

export const getJourneyTheme = (journey) => journey?.theme || journey?.journeyType || 'custom';

export const getDefaultMapName = (theme = 'custom') => (
  DEFAULT_MAP_NAMES[theme] || 'MemoryMap'
);

export const getMapBrandName = (journey) => {
  const savedName = typeof journey?.mapName === 'string' ? journey.mapName.trim() : '';
  if (savedName) return savedName;
  return getDefaultMapName(getJourneyTheme(journey));
};

export const getMapBrandInitial = (name = 'MemoryMap') => {
  const firstLetter = name.trim().charAt(0);
  return (firstLetter || 'M').toUpperCase();
};
