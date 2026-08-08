import { useState, useCallback, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';
import type { DailyProgress, GroupProgress, UserStats } from '../types';

const DEFAULT_STATS: UserStats = {
  streak: 0,
  totalWordsLearned: 0,
  totalGroupsCompleted: 0,
  lastStudyDate: null,
};

export function useProgress() {
  const { isReady, getProgress, saveProgress, getAllProgress, getStats, saveStats } = useIndexedDB();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stats on mount
  useEffect(() => {
    if (!isReady) return;

    const loadData = async () => {
      try {
        const savedStats = await getStats();
        if (savedStats) {
          setStats(savedStats);
        }

        const today = new Date().toISOString().split('T')[0];
        const progress = await getProgress(today);
        setTodayProgress(progress || {
          date: today,
          completedGroups: [],
          studiedAt: undefined,
        });
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
      setIsLoading(false);
    };

    loadData();
  }, [isReady, getStats, getProgress]);

  // Calculate streak
  const calculateStreak = useCallback(async (): Promise<number> => {
    try {
      const allProgress = await getAllProgress();
      if (allProgress.length === 0) return 0;

      const dates = allProgress
        .filter(p => p.completedGroups.length > 0)
        .map(p => p.date)
        .sort()
        .reverse();

      if (dates.length === 0) return 0;

      const today = new Date().toISOString().split('T')[0];
      let streak = 0;
      let checkDate = new Date(today);

      for (const dateStr of dates) {
        const expected = checkDate.toISOString().split('T')[0];
        if (dateStr === expected) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (dateStr < expected) {
          break;
        }
      }

      // Check if today or yesterday was studied (streak still valid)
      const lastStudied = dates[0];
      const today2 = new Date();
      const yesterday = new Date(today2);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStudied !== today && lastStudied !== yesterdayStr) {
        return 0;
      }

      return streak;
    } catch {
      return 0;
    }
  }, [getAllProgress]);

  // Recalculate streak when stats change
  useEffect(() => {
    if (!isReady) return;
    calculateStreak().then(streak => {
      setStats(prev => ({ ...prev, streak }));
    });
  }, [isReady, todayProgress, calculateStreak]);

  const completeGroup = useCallback(async (groupId: number, quizScore?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const groupProgress: GroupProgress = {
      groupId,
      completed: true,
      completedAt: now,
      quizScore,
    };

    // Update today's progress
    const currentProgress = todayProgress || {
      date: today,
      completedGroups: [],
    };

    // Avoid duplicates
    const existingIndex = currentProgress.completedGroups.findIndex(g => g.groupId === groupId);
    if (existingIndex >= 0) {
      currentProgress.completedGroups[existingIndex] = groupProgress;
    } else {
      currentProgress.completedGroups.push(groupProgress);
    }

    currentProgress.studiedAt = now;
    await saveProgress(currentProgress);
    setTodayProgress({ ...currentProgress });

    // Update stats
    const newStats = {
      ...stats,
      totalGroupsCompleted: stats.totalGroupsCompleted + (existingIndex >= 0 ? 0 : 1),
      totalWordsLearned: stats.totalWordsLearned + (existingIndex >= 0 ? 0 : 5),
      lastStudyDate: today,
    };
    await saveStats(newStats);
    setStats(newStats);

    // Recalculate streak
    const streak = await calculateStreak();
    const updatedStats = { ...newStats, streak };
    await saveStats(updatedStats);
    setStats(updatedStats);
  }, [todayProgress, stats, saveProgress, saveStats, calculateStreak]);

  const isGroupCompletedToday = useCallback((groupId: number): boolean => {
    if (!todayProgress) return false;
    return todayProgress.completedGroups.some(g => g.groupId === groupId);
  }, [todayProgress]);

  const getTodayCompletedCount = useCallback((): number => {
    if (!todayProgress) return 0;
    return todayProgress.completedGroups.length;
  }, [todayProgress]);

  return {
    stats,
    todayProgress,
    isLoading,
    completeGroup,
    isGroupCompletedToday,
    getTodayCompletedCount,
    getAllProgress,
  };
}
