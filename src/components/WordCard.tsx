import { useState, useCallback, useEffect, useRef } from 'react';
import { SyllableView } from './SyllableView';
import { AudioButton } from './AudioButton';
import { useSpeech } from '../hooks/useSpeech';
import type { Word } from '../types';

interface WordCardProps {
  word: Word;
  index: number;
  isActive: boolean;
  onComplete?: () => void;
}

export function WordCard({ word, index, isActive }: WordCardProps) {
  const { speak } = useSpeech();
  const [showDetails, setShowDetails] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const handlePlayWord = useCallback(async () => {
    await speak(word.french, 0.85);
  }, [speak, word.french]);

  const handlePlayExample = useCallback(async () => {
    const example = word.examples[currentExampleIndex];
    if (example) {
      await speak(example.fr, 0.9);
    }
  }, [speak, word.examples, currentExampleIndex]);

  const handlePlaySlowly = useCallback(async () => {
    // Speak syllable by syllable, then whole word
    for (const syl of word.syllables) {
      await speak(syl, 0.6);
      await new Promise(r => setTimeout(r, 350));
    }
    await new Promise(r => setTimeout(r, 500));
    await speak(word.french, 0.8);
  }, [speak, word.syllables, word.french]);

  // Auto-play full pronunciation when entering the word detail page
  const hasAutoPlayed = useRef(false);
  useEffect(() => {
    hasAutoPlayed.current = false;
  }, [word.id]);

  useEffect(() => {
    if (isActive && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        speak(word.french, 0.85);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, word.id, word.french, speak]);

  return (
    <div className={`
      card transition-all duration-500
      ${isActive ? 'opacity-100 translate-y-0 shadow-lg border-blue-200' : 'opacity-40 translate-y-4'}
    `}>
      {/* Word Number Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {index + 1}
        </span>
        <span className="text-sm text-slate-400">第 {index + 1} 个单词</span>
        <AudioButton onPlay={handlePlayWord} size="md" variant="secondary" />
      </div>

      {/* French Word - Large */}
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-slate-800 tracking-wide mb-1">
          {word.french}
        </h2>
        <p className="text-sm text-slate-400 font-mono">{word.ipa}</p>
      </div>

      {/* Syllable Breakdown */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2 text-center">🎯 音节拆分（点击听发音）</p>
        <SyllableView word={word.french} syllables={word.syllables} />
      </div>

      {/* Pronunciation Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <p className="text-xs text-amber-600 font-medium mb-1">📖 拼读规则</p>
        <p className="text-sm text-amber-800">{word.pronunciationNote}</p>
      </div>

      {/* Meanings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">🇬🇧 English</p>
          <p className="text-lg font-semibold text-slate-700">{word.english}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">🇨🇳 中文</p>
          <p className="text-lg font-semibold text-slate-700">{word.chinese}</p>
        </div>
      </div>

      {/* Pinyin Assist - Highlighted */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 mb-4 text-center">
        <p className="text-xs text-red-500 font-medium mb-1">🗣️ 中文谐音（助记）</p>
        <p className="text-2xl font-bold text-red-600 tracking-wider">{word.pinyinAssist}</p>
        <p className="text-xs text-red-400 mt-1">像读拼音一样读出来</p>
      </div>

      {/* Word Forms */}
      {word.forms.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {showDetails ? '收起' : '展开'}单词变形与例句
            <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 animate-fade-in-up">
              {/* Forms */}
              {word.forms.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium mb-2">单词变形</p>
                  <div className="flex flex-wrap gap-2">
                    {word.forms.map((form, i) => (
                      <button
                        key={i}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await speak(form.form, 0.8);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer group"
                        title={`听发音: ${form.form}`}
                      >
                        <span className="text-slate-400 text-xs">{form.label}:</span>
                        <span className="font-medium text-slate-700">{form.form}</span>
                        <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {word.examples.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-blue-600 font-medium">生活例句</p>
                    {word.examples.length > 1 && (
                      <div className="flex gap-1">
                        {word.examples.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentExampleIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === currentExampleIndex ? 'bg-blue-600 w-4' : 'bg-blue-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {word.examples[currentExampleIndex] && (
                    <div className="space-y-2 animate-slide-in" key={currentExampleIndex}>
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-slate-800 italic">
                          "{word.examples[currentExampleIndex].fr}"
                        </p>
                        <AudioButton onPlay={handlePlayExample} size="md" variant="ghost" />
                      </div>
                      <p className="text-sm text-slate-500">{word.examples[currentExampleIndex].en}</p>
                      <p className="text-sm text-slate-500">{word.examples[currentExampleIndex].zh}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slow pronunciation button */}
      <div className="flex justify-center">
        <button
          onClick={handlePlaySlowly}
          className="btn-outline text-sm flex items-center gap-2"
        >
          🔤 分音节慢速拼读
        </button>
      </div>
    </div>
  );
}
