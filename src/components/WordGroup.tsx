import { useState, useCallback, useRef } from 'react';
import { WordCard } from './WordCard';
import { StoryMnemonic } from './StoryMnemonic';
import { ProgressBar } from './ProgressBar';
import type { WordGroup as WordGroupType, Word, LearningStep } from '../types';
import { useProgressContext } from '../context/ProgressContext';

interface WordGroupProps {
  group: WordGroupType;
  words: Word[];
  onComplete: () => void;
}

export function WordGroup({ group, words, onComplete }: WordGroupProps) {
  const { completeGroup } = useProgressContext();
  const [step, setStep] = useState<LearningStep>('intro');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Spelling step state
  const [currentSpellingIndex, setCurrentSpellingIndex] = useState(0);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingResults, setSpellingResults] = useState<{
    index: number;
    userAnswer: string;
    correct: boolean;
  }[]>([]);
  const spellingInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = words.length + 4; // intro + words + story + quiz + spelling
  const currentStepNumber = step === 'intro' ? 0
    : step === 'word' ? currentWordIndex + 1
    : step === 'story' ? words.length + 1
    : step === 'quiz' ? words.length + 2
    : step === 'spelling' ? words.length + 3
    : totalSteps;

  const handleStartLearning = () => {
    setStep('word');
    setCurrentWordIndex(0);
  };

  const handleWordComplete = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setStep('story');
    }
  };

  const handleStoryComplete = () => {
    setStep('quiz');
  };

  // Generate quiz questions
  const generateQuiz = useCallback(() => {
    return words.map((word, i) => ({
      id: i,
      question: word.chinese,
      frenchWord: word.french,
      options: generateOptions(word.french, words),
    }));
  }, [words]);

  const [quiz] = useState(generateQuiz);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleQuizAnswer = (questionId: number, answer: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleQuizSubmit = async () => {
    const score = quiz.filter(q => selectedAnswers[q.id] === q.frenchWord).length;
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleGoToSpelling = () => {
    setStep('spelling');
    setCurrentSpellingIndex(0);
    setSpellingInput('');
    setSpellingResults([]);
  };

  // Spelling: check the user's input for the current word
  const handleSpellingCheck = () => {
    const word = words[currentSpellingIndex];
    const hiddenIdx = pickSyllableToHide(word.syllables);
    const correctSyllable = word.syllables[hiddenIdx];
    const isCorrect = spellingInput.trim().toLowerCase() === correctSyllable.toLowerCase();

    setSpellingResults(prev => [...prev, {
      index: currentSpellingIndex,
      userAnswer: spellingInput.trim(),
      correct: isCorrect,
    }]);
  };

  const handleSpellingNext = () => {
    if (currentSpellingIndex < words.length - 1) {
      setCurrentSpellingIndex(prev => prev + 1);
      setSpellingInput('');
    }
  };

  const handleFinish = async () => {
    await completeGroup(group.id, quizScore ?? 0);
    onComplete();
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-8">
      {/* Progress */}
      <div className="mb-6">
        <ProgressBar
          current={currentStepNumber}
          total={totalSteps}
          size="sm"
          showCount={false}
        />
        <p className="text-xs text-slate-400 text-center mt-1">
          {step === 'intro' && '准备开始'}
          {step === 'word' && `单词 ${currentWordIndex + 1} / ${words.length}`}
          {step === 'story' && '口诀故事'}
          {step === 'quiz' && '词义测验'}
          {step === 'spelling' && `拼写填空 ${currentSpellingIndex + 1} / ${words.length}`}
          {step === 'complete' && '完成！'}
        </p>
      </div>

      {/* Step: Intro */}
      {step === 'intro' && (
        <div className="animate-fade-in-up text-center">
          <div className="card mb-6">
            <span className="text-7xl block mb-4">{group.emoji}</span>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {group.themeZh}
            </h1>
            <p className="text-slate-500 mb-1">{group.theme}</p>
            <p className="text-sm text-slate-400">
              本组包含 {words.length} 个相关单词
            </p>
          </div>

          {/* Preview words */}
          <div className="card mb-6">
            <p className="text-sm text-slate-500 mb-3">📋 预习单词</p>
            <div className="space-y-2">
              {words.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-slate-700 text-lg">{w.french}</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-500 text-sm">{w.chinese}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartLearning}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>开始学习</span>
          </button>
        </div>
      )}

      {/* Step: Word by Word */}
      {step === 'word' && (
        <div className="space-y-4">
          <WordCard
            key={words[currentWordIndex].id}
            word={words[currentWordIndex]}
            index={currentWordIndex}
            isActive={true}
          />

          <div className="flex justify-between pt-2">
            {currentWordIndex > 0 && (
              <button
                onClick={() => setCurrentWordIndex(prev => prev - 1)}
                className="btn-outline text-sm"
              >
                ← 上一个
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleWordComplete}
              className="btn-primary text-sm"
            >
              {currentWordIndex < words.length - 1 ? '下一个单词 →' : '看口诀故事 →'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Story */}
      {step === 'story' && (
        <div className="space-y-4 animate-fade-in-up">
          <StoryMnemonic
            story={group.story}
            theme={group.theme}
            themeZh={group.themeZh}
            emoji={group.emoji}
            words={words.map(w => ({
              french: w.french,
              chinese: w.chinese,
              pinyinAssist: w.pinyinAssist,
            }))}
          />

          <button
            onClick={handleStoryComplete}
            className="btn-primary w-full"
          >
            记住了！开始测验 →
          </button>
        </div>
      )}

      {/* Step: Quiz - Meaning Matching */}
      {step === 'quiz' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">📝 词义测验</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              看中文意思，选择对应的法语单词
            </p>

            <div className="space-y-4">
              {quiz.map((q, i) => (
                <div key={q.id} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-2">第 {i + 1} 题</p>
                  <p className="text-lg font-bold text-slate-800 mb-3">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleQuizAnswer(q.id, opt)}
                        className={`
                          p-2.5 rounded-xl border-2 text-sm font-medium transition-all
                          ${selectedAnswers[q.id] === opt
                            ? quizSubmitted
                              ? opt === q.frenchWord
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-red-500 bg-red-50 text-red-700'
                              : 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }
                        `}
                        disabled={quizSubmitted}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {quizSubmitted && (
                    <p className={`text-xs mt-1.5 ${selectedAnswers[q.id] === q.frenchWord ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedAnswers[q.id] === q.frenchWord ? '✅ 正确!' : `❌ 正确答案: ${q.frenchWord}`}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(selectedAnswers).length < quiz.length}
                className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交答案
              </button>
            ) : (
              <div className="mt-4 text-center animate-bounce-in">
                <p className="text-2xl font-bold text-slate-800 mb-1">
                  得分: {quizScore} / {quiz.length}
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  {quizScore === quiz.length ? '🏆 全部正确，太棒了！'
                    : quizScore! >= quiz.length * 0.6 ? '👍 不错，继续加油！'
                    : '💪 没关系，多练习就好！'}
                </p>
                <button onClick={handleGoToSpelling} className="btn-primary">
                  下一步：拼写填空 →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step: Spelling - Fill in the Blank */}
      {step === 'spelling' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="card">
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">✍️ 拼写填空</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              补全缺失的音节，加深拼写记忆
            </p>

            {/* Show progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {words.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < spellingResults.length
                      ? spellingResults[i].correct
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : i === currentSpellingIndex
                        ? 'bg-blue-500 ring-2 ring-blue-200'
                        : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Current word to fill */}
            {(() => {
              const word = words[currentSpellingIndex];
              const hiddenIdx = pickSyllableToHide(word.syllables);
              const alreadyChecked = spellingResults.length > currentSpellingIndex;
              const result = alreadyChecked ? spellingResults[currentSpellingIndex] : null;

              return (
                <div className="space-y-4">
                  {/* Word with blank */}
                  <div className="bg-slate-50 rounded-2xl p-6 text-center">
                    <p className="text-xs text-slate-400 mb-3">填写缺失的音节</p>
                    <div className="flex items-center justify-center flex-wrap gap-1 text-3xl font-bold">
                      {word.syllables.map((syl, i) => (
                        <span key={i} className="inline-flex items-center">
                          {i > 0 && <span className="text-slate-300 mx-0.5">·</span>}
                          {i === hiddenIdx ? (
                            alreadyChecked ? (
                              <span className={`px-3 py-1 rounded-lg ${
                                result!.correct
                                  ? 'bg-green-100 text-green-700 border-2 border-green-400'
                                  : 'bg-red-100 text-red-700 border-2 border-red-400'
                              }`}>
                                {result!.userAnswer || '（未填）'}
                              </span>
                            ) : (
                              <span className="inline-block border-b-4 border-blue-400 min-w-[60px] px-3 py-1 text-blue-400">
                                {spellingInput || '___'}
                              </span>
                            )
                          ) : (
                            <span className="text-slate-800">{syl}</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 mt-2 font-mono">{word.ipa}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {word.chinese} · {word.english}
                    </p>
                  </div>

                  {/* Input area - show before checking */}
                  {!alreadyChecked && (
                    <div className="flex gap-3">
                      <input
                        ref={spellingInputRef}
                        type="text"
                        value={spellingInput}
                        onChange={(e) => setSpellingInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && spellingInput.trim()) {
                            handleSpellingCheck();
                          }
                        }}
                        placeholder="输入缺失的音节..."
                        className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-lg font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        autoFocus
                      />
                      <button
                        onClick={handleSpellingCheck}
                        disabled={!spellingInput.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        确认 ✓
                      </button>
                    </div>
                  )}

                  {/* Feedback after checking */}
                  {alreadyChecked && (
                    <div className={`rounded-xl p-4 border-2 animate-bounce-in ${
                      result!.correct
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      {/* Result */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">
                          {result!.correct ? '✅' : '❌'}
                        </span>
                        <div>
                          <p className={`font-bold ${result!.correct ? 'text-green-700' : 'text-red-700'}`}>
                            {result!.correct ? '拼写正确！' : '拼写有误'}
                          </p>
                          <p className="text-sm text-slate-600">
                            正确拼写：<span className="font-bold text-slate-800">{word.syllables[hiddenIdx]}</span>
                            {!result!.correct && result!.userAnswer && (
                              <span className="text-red-500 ml-2">
                                （你写的是：{result!.userAnswer}）
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Full word recap */}
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <p className="text-xs text-slate-400 mb-1">完整单词拼写</p>
                        <p className="text-2xl font-bold text-slate-800 tracking-wide">{word.french}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {word.syllables.map((syl, i) => (
                            <span
                              key={i}
                              className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                                i === hiddenIdx
                                  ? 'bg-amber-200 text-amber-800 ring-1 ring-amber-400'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {syl}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Spelling explanation */}
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-blue-500 font-medium mb-1">💡 拼写解析</p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {word.pronunciationNote}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-400">
                            💬 中文谐音助记：<span className="text-red-500 font-medium">{word.pinyinAssist}</span>
                          </p>
                        </div>
                      </div>

                      {/* Next button */}
                      <div className="mt-4 flex justify-end">
                        {currentSpellingIndex < words.length - 1 ? (
                          <button
                            onClick={handleSpellingNext}
                            className="btn-primary"
                          >
                            下一个单词 →
                          </button>
                        ) : (
                          <button
                            onClick={handleFinish}
                            className="btn-primary bg-green-600 hover:bg-green-700 shadow-green-600/20"
                          >
                            🎉 完成本组学习
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: generate wrong options for quiz
function generateOptions(correctAnswer: string, allWords: Word[]): string[] {
  const others = allWords
    .filter(w => w.french !== correctAnswer)
    .map(w => w.french);

  // Shuffle and pick 3 wrong options
  const shuffled = others.sort(() => Math.random() - 0.5);
  const options = [correctAnswer, ...shuffled.slice(0, 3)];

  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
}

// Pick the most "educational" syllable to hide for spelling practice
// Strategy: prefer syllables with accents (harder to spell), then the longest syllable
function pickSyllableToHide(syllables: string[]): number {
  if (syllables.length === 0) return 0;
  if (syllables.length === 1) return 0;

  // Prefer syllables with French accents (more challenging/memorable to spell)
  const accentRegex = /[àâäéèêëîïôöùûüç]/i;
  const accentedIndex = syllables.findIndex(s => accentRegex.test(s));
  if (accentedIndex >= 0) return accentedIndex;

  // Otherwise pick the longest syllable
  let longestIdx = 0;
  for (let i = 1; i < syllables.length; i++) {
    if (syllables[i].length > syllables[longestIdx].length) {
      longestIdx = i;
    }
  }
  return longestIdx;
}
