import type { WordGroup, AppSettings } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  groupsPerDay: 6,
  dailyReminder: false,
  reminderTime: '09:00',
};

/**
 * Get the groups scheduled for a given day number.
 * Day 1 = first day of study.
 */
export function getGroupsForDay(groups: WordGroup[], dayNumber: number): WordGroup[] {
  return groups
    .filter(g => g.day === dayNumber)
    .sort((a, b) => a.orderInDay - b.orderInDay);
}

/**
 * Calculate which day the user should be on based on progress.
 */
export function calculateCurrentDay(completedGroupIds: number[], groups: WordGroup[]): number {
  if (completedGroupIds.length === 0) return 1;

  // Find the last completed group
  const completedSet = new Set(completedGroupIds);

  // Find the highest day that has all groups completed
  const groupsByDay = new Map<number, WordGroup[]>();
  for (const g of groups) {
    const list = groupsByDay.get(g.day) || [];
    list.push(g);
    groupsByDay.set(g.day, list);
  }

  let currentDay = 1;
  for (const [day, dayGroups] of groupsByDay) {
    const allCompleted = dayGroups.every(g => completedSet.has(g.id));
    if (allCompleted) {
      currentDay = day + 1;
    } else {
      break;
    }
  }

  return Math.min(currentDay, Math.max(...groups.map(g => g.day)));
}

/**
 * Get settings from localStorage.
 */
export function getSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('french-vocab-settings');
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage.
 */
export function saveSettings(settings: AppSettings): void {
  localStorage.setItem('french-vocab-settings', JSON.stringify(settings));
}

/**
 * Get the total number of study days needed.
 */
export function getTotalDays(groups: WordGroup[]): number {
  const days = new Set(groups.map(g => g.day));
  return days.size;
}
