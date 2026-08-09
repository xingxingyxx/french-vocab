import { useState, useRef } from 'react';
import { useProgressContext } from '../context/ProgressContext';

export function SettingsPage() {
  const { stats, settings, updateSettings, exportAllData, importAllData } = useProgressContext();
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGroupsPerDayChange = (value: number) => {
    updateSettings({ groupsPerDay: value });
  };

  const handleReminderToggle = () => {
    updateSettings({ dailyReminder: !settings.dailyReminder });
  };

  const handleReminderTimeChange = (time: string) => {
    updateSettings({ reminderTime: time });
  };

  // Export progress as JSON file download
  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `french-vocab-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSyncMessage({ type: 'success', text: 'Progress exported successfully!' });
    } catch {
      setSyncMessage({ type: 'error', text: 'Export failed. Please try again.' });
    }
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Import progress from JSON file
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      setSyncMessage({ type: 'success', text: 'Progress imported! Reloading...' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setSyncMessage({ type: 'error', text: err.message || 'Import failed. Check the file format.' });
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-slate-800">⚙️ 设置</h1>

      {/* Learning Settings */}
      <div className="card space-y-4">
        <h2 className="font-bold text-slate-700">📚 学习设置</h2>

        <div>
          <label className="block text-sm text-slate-600 mb-2">
            每日学习组数（每组5个单词）
          </label>
          <div className="flex gap-2">
            {[4, 5, 6, 8, 10].map(num => (
              <button
                key={num}
                onClick={() => handleGroupsPerDayChange(num)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${settings.groupsPerDay === num
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {num}组
                <span className="block text-xs opacity-70">{num * 5}词</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="card space-y-4">
        <h2 className="font-bold text-slate-700">⏰ 学习提醒</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700 font-medium">每日提醒</p>
            <p className="text-xs text-slate-400">在设定时间发送学习提醒</p>
          </div>
          <button
            onClick={handleReminderToggle}
            className={`
              w-12 h-7 rounded-full transition-colors relative
              ${settings.dailyReminder ? 'bg-blue-600' : 'bg-slate-300'}
            `}
          >
            <div className={`
              absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform
              ${settings.dailyReminder ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5'}
            `}
              style={{
                transform: settings.dailyReminder ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        {settings.dailyReminder && (
          <div>
            <label className="block text-sm text-slate-600 mb-2">提醒时间</label>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleReminderTimeChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card space-y-3">
        <h2 className="font-bold text-slate-700">📊 学习统计</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400">连胜天数</p>
            <p className="text-2xl font-bold text-amber-600 tabular-nums">{stats.streak}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400">已完成组数</p>
            <p className="text-2xl font-bold text-blue-600 tabular-nums">{stats.totalGroupsCompleted}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400">已学单词</p>
            <p className="text-2xl font-bold text-green-600 tabular-nums">{stats.totalWordsLearned}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400">上次学习</p>
            <p className="text-lg font-bold text-slate-600">
              {stats.lastStudyDate || '尚未开始'}
            </p>
          </div>
        </div>
      </div>

      {/* Data Sync */}
      <div className="card space-y-4">
        <h2 className="font-bold text-slate-700">🔄 跨设备同步</h2>
        <p className="text-sm text-slate-500">
          导出一台设备的进度文件，在另一台设备导入即可同步学习记录。
        </p>

        {/* Sync message */}
        {syncMessage && (
          <div className={`px-4 py-2.5 rounded-xl text-sm font-medium animate-fade-in-up ${
            syncMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {syncMessage.text}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出进度
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="3,10 12,15 21,10" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            导入进度
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="font-bold text-slate-700 mb-2">💡 关于</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          法语单词通 v1.0 — 专为中文母语者设计的法语单词学习工具。
          采用"5词一组+口诀故事"的记忆方法，配合音节拆分、
          中文谐音助记和语音朗读，帮助你高效记忆法语单词。
        </p>
      </div>
    </div>
  );
}
