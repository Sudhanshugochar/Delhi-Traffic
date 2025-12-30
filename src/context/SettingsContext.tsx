import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange';
export type ThemeMode = 'dark' | 'light';

interface SettingsContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
  congestionThreshold: number;
  setCongestionThreshold: (threshold: number) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const accentColors: Record<AccentColor, string> = {
  blue: '217 91% 60%',
  green: '142 71% 45%',
  purple: '258 90% 66%',
  orange: '25 95% 53%',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [congestionThreshold, setCongestionThreshold] = useState(70);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // Apply accent color
    const root = document.documentElement;
    root.style.setProperty('--primary', accentColors[accentColor]);
    root.style.setProperty('--accent', accentColors[accentColor]);
    root.style.setProperty('--ring', accentColors[accentColor]);
    root.style.setProperty('--sidebar-primary', accentColors[accentColor]);
    root.style.setProperty('--sidebar-ring', accentColors[accentColor]);
  }, [accentColor]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        alertsEnabled,
        setAlertsEnabled,
        congestionThreshold,
        setCongestionThreshold,
        refreshInterval,
        setRefreshInterval,
        isPaused,
        setIsPaused,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
