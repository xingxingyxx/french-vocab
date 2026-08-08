import { useState, useMemo, useCallback } from 'react';
import { WordGroup } from '../components/WordGroup';
import { ProgressBar } from '../components/ProgressBar';
import { useProgressContext } from '../context/ProgressContext';
import { getGroupsForDay, calculateCurrentDay } from '../utils/schedule';
import type { WordGroup as WordGroupType, Word } from '../types';

// We'll import these from data files
import groupsData from '../data/groups.json';
import wordsData from '../data/words.json';

const allGroups = groupsData as WordGroupType[];
const allWords = wordsData as Word[];

export function LearnPage() {
  const { todayProgress, isGroupCompletedToday } = useProgressContext();
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  const completedGroupIds = useMemo(() =>
    todayProgress?.completedGroups.map(g => g.groupId) || [],
    [todayProgress]
  );

  const currentDay = useMemo(() =>
    calculateCurrentDay(completedGroupIds, allGroups),
    [completedGroupIds]
  );

  const todayGroups = useMemo(() =>
    getGroupsForDay(allGroups, currentDay),
    [currentDay]
  );

  const handleGroupComplete = useCallback(() => {
    setActiveGroupId(null);
  }, []);

  const handleNextDay = () => {
    // Move to next day's groups
    const nextDayGroups = getGroupsForDay(allGroups, currentDay + 1);
    if (nextDayGroups.length > 0) {
      // All groups done for today, move to next day
      window.location.reload(); // Simple approach - reload to recalculate
    }
  };

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

  // List view - show today's groups
  const completedCount = todayGroups.filter(g => isGroupCompletedToday(g.id)).length;
  const allDone = completedCount >= todayGroups.length;

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-slate-800">📖 今日学习</h1>
        <p className="text-sm text-slate-500">
          第 {currentDay} 天 · {completedCount}/{todayGroups.length} 组完成
        </p>
        <div className="mt-2">
          <ProgressBar
            current={completedCount}
            total={todayGroups.length}
            size="sm"
            color="blue"
          />
        </div>
      </div>

      {/* All done message */}
      {allDone && (
        <div className="card bg-green-50 border-green-200 text-center animate-bounce-in">
          <p className="text-4xl mb-2">🎉</p>
          <h2 className="text-lg font-bold text-green-800 mb-1">今日学习完成！</h2>
          <p className="text-sm text-green-600 mb-4">
            今天掌握了 {todayGroups.length * 5} 个法语单词
          </p>
          <button
            onClick={handleNextDay}
            className="btn-primary bg-green-600 hover:bg-green-700 shadow-green-600/20"
          >
            预习明天的内容 →
          </button>
        </div>
      )}

      {/* Group Cards */}
      <div className="space-y-3 stagger-children">
        {todayGroups.map((group, idx) => {
          const completed = isGroupCompletedToday(group.id);
          const groupWords = group.wordIds
            .map(id => allWords.find(w => w.id === id))
            .filter(Boolean) as Word[];

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
                  w-10 h-10 rounded-xl flex items-center justify-center text-xl
                  ${completed ? 'bg-green-200' : idx === completedCount ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-100'}
                `}>
                  {completed ? '✅' : group.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{group.themeZh}</h3>
                    <span className="text-xs text-slate-400">{group.theme}</span>
                    {idx === completedCount && !completed && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        当前
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {groupWords.map(w => w.french).join(' · ')}
                  </p>
                </div>

                <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* No groups message (shouldn't normally happen) */}
      {todayGroups.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">🏁</p>
          <p className="text-slate-600">所有单词都学完了！</p>
        </div>
      )}
    </div>
  );
}
