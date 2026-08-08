import { useSpeech } from '../hooks/useSpeech';

interface StoryMnemonicProps {
  story: string;
  theme: string;
  themeZh: string;
  emoji: string;
  words: { french: string; chinese: string; pinyinAssist: string }[];
}

export function StoryMnemonic({ story, theme, themeZh, emoji, words }: StoryMnemonicProps) {
  const { speak } = useSpeech();

  const handlePlayStory = async () => {
    // Read each French word in the story context
    for (const word of words) {
      await speak(word.french, 0.85);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  // Split story into lines for rhythmic display
  const lines = story.split('\n').filter(l => l.trim());

  return (
    <div className="card bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-200">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">{emoji}</span>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-purple-800">{themeZh}</h2>
          <span className="text-sm text-purple-400">({theme})</span>
        </div>
        <p className="text-sm text-purple-500">🎭 口诀故事助记</p>
      </div>

      {/* The Story */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6 border border-purple-200">
        <div className="space-y-3">
          {lines.map((line, i) => (
            <p
              key={i}
              className="text-lg leading-relaxed text-slate-700 text-center"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Play story button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handlePlayStory}
          className="btn-primary bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 flex items-center gap-2"
        >
          <span>🔊</span>
          <span>听口诀发音</span>
        </button>
      </div>

      {/* Word recap */}
      <div className="grid grid-cols-1 gap-2">
        <p className="text-xs text-purple-500 font-medium text-center mb-1">📝 本组单词回顾</p>
        {words.map((w, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-2.5">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span className="font-bold text-slate-800 text-lg">{w.french}</span>
            <span className="text-slate-400">—</span>
            <span className="text-slate-600">{w.chinese}</span>
            <span className="text-red-400 text-sm ml-auto">{w.pinyinAssist}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
