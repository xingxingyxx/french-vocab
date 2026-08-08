# 🥐 FrenchVocab - French Vocabulary Learning Assistant

A French vocabulary memorization app designed for Chinese native speakers, using spaced repetition and multiple memory strategies to help you master French words efficiently.

## ✨ Features

### 📖 Learning Mode
- **Themed Groups**: Words organized by themes (Dining, Travel, Shopping, etc.), 5 words per group per day
- **Syllable Breakdown**: Each word split into syllables — tap any syllable to hear its pronunciation
- **Sequential Playback**: Auto-play each syllable one by one, then the full word, reinforcing pronunciation memory
- **Pronunciation Rules**: Detailed French pronunciation rule explanations
- **Phonetic Hints**: Chinese pinyin-style approximate pronunciation guides for quick sound association
- **Word Forms**: Verb conjugations, noun gender forms, and other inflections — tap to hear pronunciation
- **Example Sentences**: Each word includes French/English/Chinese example sentences, with multiple examples per word

### 📝 Quiz & Review
- **Meaning Quiz**: Match Chinese meanings to French words with instant feedback and scoring
- **Spelling Fill-in**: Fill in missing syllables, intelligently selecting the trickiest syllable to test
- **Flashcard Mode**: French on the front, tap to reveal meaning — auto-plays pronunciation
- **List Mode**: Browse all learned words with auto-sequential playback and loop mode
- **Adjustable Speed**: 1x / 1.25x / 1.5x / 2x playback speed options

### 📊 Learning Management
- **Progress Tracking**: Local progress storage via IndexedDB — all data stays on your device
- **Review Filtering**: Filter review content by 1/3/5 day or all-time range
- **Spaced Repetition**: Review scheduling based on the Ebbinghaus forgetting curve

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| [React 19](https://react.dev) | UI Framework |
| [TypeScript](https://www.typescriptlang.org) | Type Safety |
| [Vite](https://vitejs.dev) | Build Tool |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| [React Router 7](https://reactrouter.com) | Routing |
| [IndexedDB (idb)](https://github.com/jakearchibald/idb) | Local Data Persistence |
| [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) | French Text-to-Speech |

## 📁 Project Structure

```
french-vocab/
├── public/                 # Static assets (PWA manifest, Service Worker, icons)
├── scripts/                # Word bank data (JSON)
├── src/
│   ├── components/         # UI Components
│   │   ├── AudioButton.tsx    # Pronunciation play button
│   │   ├── ErrorBoundary.tsx  # Error boundary
│   │   ├── Layout.tsx         # App layout
│   │   ├── ProgressBar.tsx    # Progress bar
│   │   ├── StoryMnemonic.tsx  # Mnemonic story card
│   │   ├── StreakBadge.tsx    # Streak badge
│   │   ├── SyllableView.tsx   # Syllable breakdown view
│   │   ├── WordCard.tsx       # Word detail card
│   │   └── WordGroup.tsx      # Word group learning flow
│   ├── context/            # React Context (progress management)
│   ├── data/               # Learning data (groups & words)
│   ├── hooks/              # Custom Hooks
│   │   ├── useIndexedDB.ts    # IndexedDB wrapper
│   │   ├── useProgress.ts     # Learning progress management
│   │   └── useSpeech.ts       # French TTS
│   ├── pages/              # Pages
│   │   ├── HomePage.tsx       # Home
│   │   ├── LearnPage.tsx      # Learn
│   │   ├── ReviewPage.tsx     # Review
│   │   └── SettingsPage.tsx   # Settings
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 📱 PWA Support

The app supports offline use via PWA. After building, resources are cached by Service Worker and the app can be added to the home screen on mobile devices.

## 📝 Word Data

Word banks are located in `scripts/` and `src/data/`. Each word entry includes:

- French word & syllable breakdown
- IPA transcription
- Pronunciation rule explanation
- Chinese & English definitions
- Chinese phonetic hint (pinyin-style)
- Word forms (conjugations, gender variants, etc.)
- Multi-language example sentences

## 📄 License

MIT
