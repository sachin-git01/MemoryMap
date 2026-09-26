import { createContext, useContext, useMemo, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useJourney } from './JourneyContext';
import { THEME_CONFIGS } from '../data/mockData';

const ThemeContext = createContext(null);

export const useThemeSettings = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeSettings must be used within a ThemeProvider");
  return context;
};

// Helper to convert hex color to r g b format for Tailwind CSS variables
const hexToRgb = (hex) => {
  if (!hex) return null;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
};

export const ThemeProvider = ({ children }) => {
  const { currentJourney, journeys } = useJourney();
  const location = useLocation();

  const routeJourneyId = location.pathname.match(/^\/journey\/([^/]+)/)?.[1] || null;
  const routeJourney = routeJourneyId ? journeys.find(journey => journey.id === routeJourneyId) : null;
  const effectiveJourney = routeJourneyId
    ? (currentJourney?.id === routeJourneyId ? currentJourney : routeJourney)
    : currentJourney;
  const activeTheme = effectiveJourney?.theme || "personal";
  const themeConfig = useMemo(
    () => THEME_CONFIGS[activeTheme] || THEME_CONFIGS.custom,
    [activeTheme]
  );

  useLayoutEffect(() => {
    const root = document.documentElement;

    // Apply data-theme attribute for class selectors
    root.setAttribute('data-theme', activeTheme);

    // For Custom Theme with Custom Colors, dynamically set CSS variables on the root document element
    if (activeTheme === "custom" && effectiveJourney?.customColors) {
      const colors = effectiveJourney.customColors;

      if (colors.primary) root.style.setProperty('--color-primary', hexToRgb(colors.primary) || colors.primary);
      if (colors.secondary) root.style.setProperty('--color-secondary', hexToRgb(colors.secondary) || colors.secondary);
      if (colors.accent) root.style.setProperty('--color-accent', hexToRgb(colors.accent) || colors.accent);
      if (colors.accentHover) root.style.setProperty('--color-accent-hover', hexToRgb(colors.accentHover) || colors.accentHover);

      // Handle backgrounds
      if (colors.bgGradientFrom) {
        const rgbFrom = hexToRgb(colors.bgGradientFrom);
        root.style.setProperty('--color-bg-gradient-from', rgbFrom || colors.bgGradientFrom);
      }
      if (colors.bgGradientTo) {
        const rgbTo = hexToRgb(colors.bgGradientTo);
        root.style.setProperty('--color-bg-gradient-to', rgbTo || colors.bgGradientTo);
      }
      if (effectiveJourney.customFontFamily) {
        root.style.setProperty('--font-family-active', effectiveJourney.customFontFamily);
      }
    } else {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-accent-hover');
      root.style.removeProperty('--color-bg-gradient-from');
      root.style.removeProperty('--color-bg-gradient-to');
      root.style.removeProperty('--font-family-active');
    }
  }, [activeTheme, effectiveJourney]);

  const value = {
    activeTheme,
    themeConfig,
    isCustom: activeTheme === "custom"
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
