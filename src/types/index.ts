// ===== Word Data Types =====

export interface WordForm {
  label: string;       // e.g., "feminine", "plural", "passé composé"
  form: string;        // e.g., "bonne", "bonjour", "mangé"
}

export interface Example {
  fr: string;          // French example sentence
  en: string;          // English translation
  zh: string;          // Chinese translation
}

export interface Word {
  id: number;
  french: string;
  syllables: string[];           // e.g., ["bon", "jour"]
  ipa: string;                   // e.g., "/bɔ̃.ʒuʁ/"
  pronunciationNote: string;     // Pronunciation rule explanation in Chinese
  english: string;
  chinese: string;
  pinyinAssist: string;          // Chinese pinyin-like phonetic hint
  forms: WordForm[];
  examples: Example[];
}

// ===== Word Group Types =====

export interface WordGroup {
  id: number;
  day: number;                   // Day number (1-based)
  orderInDay: number;            // Order within the day (1-based)
  theme: string;                 // Theme in English
  themeZh: string;               // Theme in Chinese
  emoji: string;                 // Theme emoji
  wordIds: number[];             // 5 word IDs
  story: string;                 // Mnemonic story (Chinese + French mixed)
}

// ===== Progress Types =====

export interface GroupProgress {
  groupId: number;
  completed: boolean;
  completedAt?: string;          // ISO date string
  quizScore?: number;            // 0-5
}

export interface DailyProgress {
  date: string;                  // YYYY-MM-DD
  completedGroups: GroupProgress[];
  studiedAt?: string;            // ISO datetime
}

export interface UserStats {
  streak: number;
  totalWordsLearned: number;
  totalGroupsCompleted: number;
  lastStudyDate: string | null;
}

// ===== App Settings =====

export interface AppSettings {
  groupsPerDay: number;          // Default: 5
  dailyReminder: boolean;
  reminderTime: string;          // HH:MM format
}

// ===== Learning State =====

export type LearningStep = 'intro' | 'word' | 'story' | 'quiz' | 'spelling' | 'complete';

export interface LearningState {
  currentGroupId: number | null;
  currentStep: LearningStep;
  currentWordIndex: number;      // 0-4 during 'word' step
  quizAnswers: number[];         // User's quiz answers
}
