import { Link } from 'react-router-dom';
import { useProgressContext } from '../context/ProgressContext';
import { ProgressBar } from '../components/ProgressBar';
import { StreakBadge } from '../components/StreakBadge';

export function HomePage() {
  const { stats, getTodayCompletedCount, isLoading } = useProgressContext();

  const groupsPerDay = 6;
  const totalWords = 1000;
  const todayCompleted = getTodayCompletedCount();
  const todayWords = todayCompleted * 5;
  const todayProgressPercent = Math.round((todayCompleted / groupsPerDay) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-800">
          {getGreeting()}，继续加油！🇫🇷
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          每天{groupsPerDay}组，30天掌握1000法语单词
        </p>
      </div>

      {/* Streak & Stats */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
        <div className="card flex flex-col items-center">
          <StreakBadge streak={stats.streak} size="md" />
        </div>
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">已学单词</p>
          <p className="text-3xl font-bold text-blue-600 tabular-nums">
            {stats.totalWordsLearned}
          </p>
          <p className="text-xs text-slate-400">/ {totalWords}</p>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="card animate-fade-in-up">
        <h2 className="text-lg font-bold text-slate-800 mb-3">📅 今日进度</h2>
        <ProgressBar
          current={todayCompleted}
          total={groupsPerDay}
          size="lg"
          color={todayProgressPercent >= 100 ? 'green' : 'blue'}
          showCount={true}
        />
        <p className="text-center text-sm text-slate-500 mt-2">
          今日已学 {todayWords} 个单词
          {todayProgressPercent >= 100 && ' ✅ 今日目标完成！'}
        </p>
      </div>

      {/* CTA Button */}
      <div className="animate-fade-in-up">
        <Link
          to="/learn"
          className="btn-primary w-full text-center flex items-center justify-center gap-2 text-lg py-4"
        >
          {todayCompleted > 0 ? (
            <>
              <span>📖</span>
              <span>继续今日学习</span>
              <span className="text-blue-200 text-sm">
                ({todayCompleted}/{groupsPerDay}组)
              </span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>开始今日学习</span>
            </>
          )}
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up">
        <div className="card text-center py-3">
          <p className="text-2xl mb-0.5">📖</p>
          <p className="text-xs text-slate-500">完成组数</p>
          <p className="text-lg font-bold text-slate-700 tabular-nums">
            {stats.totalGroupsCompleted}
          </p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl mb-0.5">🎯</p>
          <p className="text-xs text-slate-500">掌握率</p>
          <p className="text-lg font-bold text-green-600 tabular-nums">
            {stats.totalWordsLearned > 0
              ? Math.round((stats.totalWordsLearned / totalWords) * 100)
              : 0}%
          </p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl mb-0.5">🗓️</p>
          <p className="text-xs text-slate-500">预计天数</p>
          <p className="text-lg font-bold text-slate-700 tabular-nums">
            {Math.ceil((totalWords - stats.totalWordsLearned) / (groupsPerDay * 5))}
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 animate-fade-in-up">
        <h3 className="font-bold text-blue-800 mb-2">💡 学习小贴士</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 每组5个单词，用口诀串联记忆</li>
          <li>• 大声跟读，调动听觉记忆</li>
          <li>• 用谐音联想，让法语更亲切</li>
          <li>• 每天坚持6组 = 30个新单词</li>
        </ul>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 10) return '早上好';
  if (hour < 13) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}
