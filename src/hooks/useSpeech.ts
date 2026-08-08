import { useCallback, useRef } from 'react';

/**
 * Hook for French Text-to-Speech using Web Speech API.
 * Supports speaking whole words, individual syllables, and sentences.
 */
export function useSpeech() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getFrenchVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    // Prefer a French voice
    const frenchVoice = voices.find(
      v => v.lang.startsWith('fr') && v.name.includes('Thomas')
    ) || voices.find(
      v => v.lang.startsWith('fr')
    ) || voices.find(
      v => v.lang.startsWith('fr-FR')
    );
    return frenchVoice || null;
  }, []);

  const speak = useCallback((text: string, rate: number = 0.9): Promise<void> => {
    return new Promise((resolve) => {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = rate;
      utterance.pitch = 1;

      const voice = getFrenchVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, [getFrenchVoice]);

  const speakEnglish = useCallback((text: string, rate: number = 0.85): Promise<void> => {
    return new Promise((resolve) => {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1;

      // Prefer a US English voice
      const voices = speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Samantha'))
        || voices.find(v => v.lang.startsWith('en-US'))
        || voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, []);

  const speakSyllable = useCallback(async (syllable: string, delay: number = 300) => {
    await speak(syllable, 0.7);
    // Small pause between syllables
    await new Promise(r => setTimeout(r, delay));
  }, [speak]);

  const speakSyllables = useCallback(async (syllables: string[], delayBetween: number = 400) => {
    for (const syllable of syllables) {
      await speakSyllable(syllable, delayBetween);
    }
  }, [speakSyllable]);

  const speakWordSlowly = useCallback(async (word: string, syllables: string[]) => {
    // First speak each syllable
    await speakSyllables(syllables);
    // Then speak the whole word
    await new Promise(r => setTimeout(r, 500));
    await speak(word, 0.8);
  }, [speak, speakSyllables]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
  }, []);

  return {
    speak,
    speakEnglish,
    speakSyllable,
    speakSyllables,
    speakWordSlowly,
    stop,
  };
}
