import { useState } from 'react';
import { AudioButton } from './AudioButton';
import { useSpeech } from '../hooks/useSpeech';

interface SyllableViewProps {
  word: string;
  syllables: string[];
  onSyllableClick?: (syllable: string, index: number) => void;
}

const SYLLABLE_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

export function SyllableView({ word, syllables, onSyllableClick }: SyllableViewProps) {
  const { speak, speakSyllable } = useSpeech();
  const [activeSyllable, setActiveSyllable] = useState<number | null>(null);

  const handleSyllableClick = async (syllable: string, index: number) => {
    setActiveSyllable(index);
    await speakSyllable(syllable, 300);
    setActiveSyllable(null);
    onSyllableClick?.(syllable, index);
  };

  const handlePlayAll = async () => {
    // Speak each syllable then the whole word
    for (let i = 0; i < syllables.length; i++) {
      setActiveSyllable(i);
      await speakSyllable(syllables[i], 400);
    }
    setActiveSyllable(null);
    await new Promise(r => setTimeout(r, 600));
    await speak(word, 0.85);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {syllables.map((syllable, index) => (
          <button
            key={index}
            onClick={() => handleSyllableClick(syllable, index)}
            className={`
              syllable-chip border-2
              ${SYLLABLE_COLORS[index % SYLLABLE_COLORS.length]}
              ${activeSyllable === index ? 'scale-110 shadow-lg ring-2 ring-offset-2 ring-blue-400' : ''}
            `}
          >
            {syllable}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">点击音节听发音</span>
        <span className="text-slate-300">|</span>
        <button
          onClick={handlePlayAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          逐个朗读
        </button>
        <AudioButton onPlay={handlePlayAll} size="md" variant="secondary" />
      </div>
    </div>
  );
}
