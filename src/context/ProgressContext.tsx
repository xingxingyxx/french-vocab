import React, { createContext, useContext, useMemo } from 'react';
import { useProgress } from '../hooks/useProgress';
import type { UserStats, DailyProgress, AppSettings } from '../types';
import { getSettings, saveSettings } from '../utils/schedule';

interface ProgressContextType {
  stats: UserStats;
  todayProgress: DailyProgress | null;
  isLoading: boolean;
  settings: AppSettings;
  completeGroup: (groupId: number, quizScore?: number) => Promise<void>;
  isGroupCompletedToday: (groupId: number) => boolean;
  getTodayCompletedCount: () => number;
  getAllProgress: () => Promise<DailyProgress[]>;
  exportAllData: () => Promise<object>;
  importAllData: (data: any) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const progress = useProgress();
  const [settings, setSettingsState] = React.useState<AppSettings>(getSettings);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  const value = useMemo(() => ({
    ...progress,
    settings,
    updateSettings,
  }), [progress, settings]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext(): ProgressContextType {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgressContext must be used within ProgressProvider');
  }
  return ctx;
}
