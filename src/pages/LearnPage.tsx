import { useState, useMemo, useCallback, useEffect } from 'react';
import { WordGroup } from '../components/WordGroup';
import { ProgressBar } from '../components/ProgressBar';
import { useProgressContext } from '../context/ProgressContext';
import { getGroupsForDay, calculateCurrentDay } from '../utils/schedule';
import type { WordGroup as WordGroupType, Word } from '../types';

import groupsData from '../data/groups.json';
import wordsData from '../data/words.json';

const allGroups = groupsData as WordGroupType[];
const allWords = wordsData as Word[];

export function LearnPage() {
  const { todayProgress, getAllProgress } = useProgressContext();
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [allCompletedGroupIds, setAllCompletedGroupIds] = useState<Set<number>>(new Set());

  // Compute all completed group IDs across all dates
  const refreshCompletedGroups = useCallback(async () => {
    try {
      const progressList = await getAllProgress();
      const ids = new Set<number>();
      progressList.forEach(p => p.completedGroups.forEach(g => ids.add(g.groupId)));
      setAllCompletedGroupIds(ids);
    } catch {
      // Fallback: use today's progress only
      if (todayProgress) {
        const ids = new Set(todayProgress.completedGroups.map(g => g.groupId));
        setAllCompletedGroupIds(ids);
      }
    }
  }, [getAllProgress, todayProgress]);

  useEffect(() => {
    refreshCompletedGroups();
  }, [refreshCompletedGroups]);

  // All unique days
  const allDays = useMemo(() => {
    const days = new Set(allGroups.map(g => g.day));
    return Array.from(days).sort((a, b) => a - b);
  }, []);

  // Current scheduled day
  const todayCompletedIds = useMemo(() =>
    todayProgress?.completedGroups.map(g => g.groupId) || [],
    [todayProgress]
  );

  const currentDay = useMemo(() =>
    calculateCurrentDay(todayCompletedIds, allGroups),
    [todayCompletedIds]
  );

  // Selected day (defaults to current day)
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);

  useEffect(() => {
    setSelectedDay(currentDay);
  }, [currentDay]);

  const handleGroupComplete = useCallback(async () => {
    setActiveGroupId(null);
    // Refresh completed groups after finishing a group
    await refreshCompletedGroups();
  }, [refreshCompletedGroups]);

  // If viewing a specific group
  if (activeGroupId !== null) {
    const group = allGroups.find(g => g.id === activeGroupId);
    if (!group) return null;

    const groupWords = group.wordIds
      .map(id => allWords.find(w => w.id === id))
      .filter(Boolean) as Word[];

    return (
      <WordGroup
        key={group.id}
        group={group}
        words={groupWords}
        onComplete={handleGroupComplete}
      />
    );
  }

  // Day overview view
  const selectedDayGroups = getGroupsForDay(allGroups, selectedDay);

  // Count total completed groups
  const totalCompletedCount = allCompletedGroupIds.size;
  const totalGroupsCount = allGroups.length;

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-slate-800">📖 全部课程</h1>
        <p className="text-sm text-slate-500">
          共 {allDays.length} 天 · {totalCompletedCount}/{totalGroupsCount} 组已完成
        </p>
        <div className="mt-2">
          <ProgressBar
            current={totalCompletedCount}
            total={totalGroupsCount}
            size="sm"
            color="blue"
          />
        </div>
      </div>

      {/* Day tabs - horizontal scrollable */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {allDays.map(day => {
          const dayGroups = getGroupsForDay(allGroups, day);
          const allCompleted = dayGroups.length > 0 && dayGroups.every(g => allCompletedGroupIds.has(g.id));
          const someCompleted = dayGroups.some(g => allCompletedGroupIds.has(g.id));

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`
                flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                ${selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105'
                  : allCompleted
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : someCompleted
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                }
                ${day === currentDay && selectedDay !== day ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
              `}
            >
              <span className="flex items-center gap-1">
                {allCompleted ? '✅' : someCompleted ? '📖' : ''}
                D{day}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day info bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          第 <span className="font-bold text-slate-700">{selectedDay}</span> 天
          {selectedDay === currentDay && (
            <span className="ml-1.5 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">今日预定</span>
          )}
        </span>
        <span className="text-slate-400">
          {dayCompletionText(selectedDayGroups, allCompletedGroupIds)}
        </span>
      </div>

      {/* Group Cards */}
      <div className="space-y-3 stagger-children">
        {selectedDayGroups.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500">该天没有学习内容</p>
          </div>
        )}

        {selectedDayGroups.map((group, idx) => {
          const completed = allCompletedGroupIds.has(group.id);
          const groupWords = group.wordIds
            .map(id => allWords.find(w => w.id === id))
            .filter(Boolean) as Word[];

          // Count how many groups in this day are completed
          const completedInDay = selectedDayGroups.filter(g => allCompletedGroupIds.has(g.id)).length;

          return (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={`card w-full text-left transition-all duration-200 hover:shadow-md ${
                completed
                  ? 'bg-green-50 border-green-200 opacity-70'
                  : 'hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                  ${completed ? 'bg-green-200' : !completed && idx === completedInDay ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-100'}
                `}>
                  {completed ? '✅' : group.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{group.themeZh}</h3>
                    <span className="text-xs text-slate-400">{group.theme}</span>
                    {!completed && idx === completedInDay && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        继续
                      </span>
                    )}
                    {completed && (
                      <span className="text-xs text-green-600">已学</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {groupWords.map(w => w.french).join(' · ')}
                  </p>
                </div>

                <svg className="w-5 h-5 text-slate-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state (shouldn't happen normally) */}
      {allDays.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">🏁</p>
          <p className="text-slate-600">没有可用的学习内容</p>
        </div>
      )}
    </div>
  );
}

function dayCompletionText(groups: WordGroupType[], completedIds: Set<number>): string {
  if (groups.length === 0) return '';
  const completed = groups.filter(g => completedIds.has(g.id)).length;
  return `${completed}/${groups.length} 组`;
}
