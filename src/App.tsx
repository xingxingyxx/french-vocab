import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

// Lazy-load pages that import large data files (1.2MB+ JSON)
// Use .then() wrapper because pages use named exports, not default
const LearnPage = lazy(() => import('./pages/LearnPage').then(m => ({ default: m.LearnPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-3" />
        <p className="text-slate-400 text-sm">加载中...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ProgressProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/learn" element={
                <Suspense fallback={<LoadingFallback />}>
                  <LearnPage />
                </Suspense>
              } />
              <Route path="/review" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ReviewPage />
                </Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<LoadingFallback />}>
                  <SettingsPage />
                </Suspense>
              } />
            </Route>
          </Routes>
        </ProgressProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
