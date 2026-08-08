import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { AudioButton } from '../components/AudioButton';
import { useProgressContext } from '../context/ProgressContext';
import type { WordGroup, Word, DailyProgress } from '../types';

import groupsData from '../data/groups.json';
import wordsData from '../data/words.json';

const allGroups = groupsData as WordGroup[];
const allWords = wordsData as Word[];

type ReviewMode = 'flashcard' | 'list';
type TimeRange = '1' | '3' | '5' | 'all';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '1', label: '1天' },
  { value: '3', label: '3天' },
  { value: '5', label: '5天' },
  { value: 'all', label: '全部' },
];

export function ReviewPage() {
  const { todayProgress, getAllProgress } = useProgressContext();
  const { speak, speakEnglish, stop } = useSpeech();
  const [mode, setMode] = useState<ReviewMode>('flashcard');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Auto-play state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(-1);
  const autoPlayRef = useRef(false);
  const loopRef = useRef(false);
  const speedRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { loopRef.current = isLooping; }, [isLooping]);
  useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);

  // Load all progress history
  const [allProgress, setAllProgress] = useState<DailyProgress[]>([]);
  useEffect(() => {
    getAllProgress().then(setAllProgress).catch(() => setAllProgress([]));
  }, [getAllProgress, todayProgress]);

  // Get completed group IDs based on time range
  const completedGroupIdsInRange = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'all') {
      // All groups ever completed
      const ids = new Set<number>();
      allProgress.forEach(p => p.completedGroups.forEach(g => ids.add(g.groupId)));
      return ids;
    }

    const days = parseInt(timeRange);
    cutoffDate.setDate(now.getDate() - days + 1); // include today
    cutoffDate.setHours(0, 0, 0, 0);

    const ids = new Set<number>();
    allProgress.forEach(p => {
      const progressDate = new Date(p.date);
      if (progressDate >= cutoffDate) {
        p.completedGroups.forEach(g => ids.add(g.groupId));
      }
    });
    return ids;
  }, [allProgress, timeRange]);

  // Get all words from completed groups in range
  const reviewedWords = useMemo(() => {
    const completedGroups = allGroups.filter(g => completedGroupIdsInRange.has(g.id));
    const wordIds = new Set<number>();
    completedGroups.forEach(g => g.wordIds.forEach(id => wordIds.add(id)));
    return Array.from(wordIds)
      .map(id => allWords.find(w => w.id === id))
      .filter(Boolean) as Word[];
  }, [completedGroupIdsInRange]);

  // Reset card index when words change
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [reviewedWords.length]);

  const currentWord = reviewedWords[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && currentWord) {
      speak(currentWord.french);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % Math.max(reviewedWords.length, 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + reviewedWords.length) % Math.max(reviewedWords.length, 1));
  };

  const handlePlayCurrent = async () => {
    if (currentWord) {
      await speak(currentWord.french);
    }
  };

  // Auto-play through all words in list mode (with optional loop and speed)
  const handleStartAutoPlay = useCallback(async () => {
    if (reviewedWords.length === 0) return;

    stop();
    setIsAutoPlaying(true);
    autoPlayRef.current = true;

    const playRound = async () => {
      for (let i = 0; i < reviewedWords.length; i++) {
        if (!autoPlayRef.current) return false;

        setCurrentPlayIndex(i);

        // Scroll to the current word
        const wordEl = document.getElementById(`review-word-${reviewedWords[i].id}`);
        if (wordEl) {
          wordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const speed = speedRef.current;
        const baseRate = 0.85;

        // Speak French
        await speak(reviewedWords[i].french, baseRate * speed);
        if (!autoPlayRef.current) return false;
        await new Promise(r => setTimeout(r, 600 / speed));

        // Speak English meaning
        await speakEnglish(reviewedWords[i].english, baseRate * speed);
        if (!autoPlayRef.current) return false;
        await new Promise(r => setTimeout(r, 1000 / speed));
      }
      return true; // completed a full round
    };

    do {
      const completed = await playRound();
      if (!completed) break;
    } while (loopRef.current && autoPlayRef.current);

    setIsAutoPlaying(false);
    setCurrentPlayIndex(-1);
    autoPlayRef.current = false;
  }, [reviewedWords, speak, speakEnglish, stop]);

  const handleStopAutoPlay = () => {
    autoPlayRef.current = false;
    stop();
    setIsAutoPlaying(false);
    setCurrentPlayIndex(-1);
  };

  // Stats for the selected range
  const rangeStats = useMemo(() => {
    const groupCount = completedGroupIdsInRange.size;
    return {
      groupCount,
      wordCount: reviewedWords.length,
    };
  }, [completedGroupIdsInRange.size, reviewedWords.length]);

  if (reviewedWords.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-slate-800 mb-4">🔄 复习</h1>

        {/* Time range selector - always visible */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {TIME_RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="card text-center py-12">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-slate-600 mb-1">该时间范围内还没有学过的单词</p>
          <p className="text-sm text-slate-400">换一个时间范围，或先去学习页开始背单词吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🔄 复习</h1>
          <p className="text-sm text-slate-500">
            {rangeStats.wordCount} 个单词 · {rangeStats.groupCount} 组
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setMode('flashcard')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'flashcard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
            }`}
          >
            闪卡
          </button>
          <button
            onClick={() => setMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
            }`}
          >
            列表
          </button>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">复习范围：</span>
        {TIME_RANGE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setTimeRange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              timeRange === opt.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Flashcard Mode */}
      {mode === 'flashcard' && currentWord && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Card Counter */}
          <p className="text-center text-sm text-slate-400">
            {currentCardIndex + 1} / {reviewedWords.length}
          </p>

          {/* The Card */}
          <div
            onClick={handleFlip}
            className={`
              card min-h-64 flex flex-col items-center justify-center cursor-pointer
              transition-all duration-500 transform perspective-1000
              ${isFlipped ? 'bg-blue-50 border-blue-200 shadow-lg' : 'hover:shadow-md'}
            `}
          >
            {!isFlipped ? (
              <div className="text-center animate-fade-in-up">
                <p className="text-sm text-slate-400 mb-4">👆 点击翻转</p>
                <h2 className="text-4xl font-bold text-slate-800 mb-4 tracking-wide">
                  {currentWord.french}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-mono text-slate-400">{currentWord.ipa}</p>
                  <AudioButton onPlay={handlePlayCurrent} size="sm" variant="ghost" />
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {currentWord.syllables.map((syl, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                      {syl}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center animate-bounce-in">
                <p className="text-sm text-slate-400 mb-4">📖</p>
                <h2 className="text-4xl font-bold text-slate-800 mb-2 tracking-wide">
                  {currentWord.french}
                </h2>
                <p className="text-lg font-semibold text-blue-700 mb-1">
                  {currentWord.chinese}
                </p>
                <p className="text-base text-slate-500 mb-3">
                  {currentWord.english}
                </p>
                <p className="text-2xl font-bold text-red-500 mb-4">
                  {currentWord.pinyinAssist}
                </p>
                {currentWord.examples.length > 0 && (
                  <p className="text-xs text-slate-400 italic">
                    "{currentWord.examples[0].fr}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={handlePrev} className="btn-outline text-sm px-4 py-2">
              ← 上一个
            </button>
            <AudioButton onPlay={handlePlayCurrent} size="lg" variant="primary" label="播放发音" />
            <button onClick={handleNext} className="btn-outline text-sm px-4 py-2">
              下一个 →
            </button>
          </div>
        </div>
      )}

      {/* List Mode */}
      {mode === 'list' && (
        <div className="space-y-2" ref={listRef}>
          {/* Auto-play control bar */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 space-y-3">
            {/* Main controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔊</span>
                <div>
                  <p className="font-bold text-blue-800 text-sm">
                    {isAutoPlaying
                      ? isLooping ? '🔄 循环播放中...' : '正在自动播放...'
                      : '自动连读'}
                  </p>
                  <p className="text-xs text-blue-500">
                    {isAutoPlaying
                      ? `法语 → 英语 · ${currentPlayIndex + 1}/${reviewedWords.length} · ${playbackSpeed}x`
                      : `依次朗读法语发音和英语释义 · ${reviewedWords.length} 个单词`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Loop toggle */}
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  disabled={isAutoPlaying}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isLooping
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  } ${isAutoPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isLooping ? '循环播放已开启' : '循环播放已关闭'}
                >
                  <span>🔁</span>
                  <span>{isLooping ? '循环中' : '循环'}</span>
                </button>

                {isAutoPlaying ? (
                  <button
                    onClick={handleStopAutoPlay}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>⏹</span>
                    <span>停止</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartAutoPlay}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>▶</span>
                    <span>开始连读</span>
                  </button>
                )}
              </div>
            </div>

            {/* Speed selector row */}
            <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
              <span className="text-xs text-blue-500 font-medium">语速：</span>
              {[1, 1.25, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    playbackSpeed === speed
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Word list */}
          <div className="space-y-1.5 stagger-children">
            {reviewedWords.map((word, idx) => (
              <div
                key={word.id}
                id={`review-word-${word.id}`}
                className={`card py-3 px-4 transition-all duration-300 ${
                  idx === currentPlayIndex && isAutoPlaying
                    ? 'ring-2 ring-blue-400 bg-blue-50 border-blue-300 shadow-md scale-[1.02]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Play indicator */}
                  {idx === currentPlayIndex && isAutoPlaying && (
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-lg">{word.french}</span>
                      <span className="text-xs text-slate-400 font-mono">{word.ipa}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {word.chinese} · {word.english}
                    </p>
                    <p className="text-sm text-red-400">{word.pinyinAssist}</p>
                  </div>
                  <AudioButton
                    onPlay={() => speak(word.french)}
                    size="sm"
                    variant="secondary"
                    label={`播放 ${word.french}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
