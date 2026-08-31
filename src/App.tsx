import { useEffect, useState } from 'react';
import { Header } from './layout/Header';
import { PracticeView } from './features/practice/components/PracticeView';
import { ExerciseSelector } from './features/library/components/ExerciseSelector';
import { PracticeStats } from './features/stats/components/PracticeStats';
import { PracticeCompleteModal } from './features/practice/components/PracticeCompleteModal';
import { usePracticeSession } from './features/practice/hooks/usePracticeSession';
import { LoginPage } from './features/auth/components/LoginPage';
import { useAuth } from './features/auth/hooks/useAuth';

import type { Exercise } from './types';
import { SAMPLE_EXERCISES } from './features/library/data/sampleExercises';
import { getLocalCustomExercises, saveLocalCustomExercise } from './services/pocketbase';

const TRANSPOSE_STORAGE_KEY = 'truenote_transpose';
const THEME_STORAGE_KEY = 'truenote_theme';

export function App() {
  const [currentExercise, setCurrentExercise] = useState<Exercise>(SAMPLE_EXERCISES[0]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [transpose, setTranspose] = useState<number>(() => {
    const saved = localStorage.getItem(TRANSPOSE_STORAGE_KEY);
    return saved !== null ? Number(saved) || 0 : 0;
  });
  const [bpm, setBpm] = useState<number>(SAMPLE_EXERCISES[0].defaultBpm);

  // Theme state ('light' by default per request, stored in localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(TRANSPOSE_STORAGE_KEY, String(transpose));
  }, [transpose]);

  const [isMetronomeMuted, setIsMetronomeMuted] = useState<boolean>(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  // Library is the landing screen post-login; Practice is reached only by picking a piece there.
  const [activeTab, setActiveTab] = useState<'practice' | 'library' | 'stats'>('library');
  // The whole app requires a session: every tab is gated on this alone, no per-tab
  // exceptions and no manual dismiss — signing in/out drives it directly.
  const user = useAuth();
  const showLogin = !user;

  useEffect(() => {
    setCustomExercises(getLocalCustomExercises());
  }, []);

  const practice = usePracticeSession({ currentExercise, bpm, transpose });

  const handleSelectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    setBpm(ex.defaultBpm);
    setTranspose(0);
    practice.resetForExercise(ex);
  };

  const handleUploadCustomExercise = (newEx: Omit<Exercise, 'id'>) => {
    const saved = saveLocalCustomExercise(newEx);
    setCustomExercises((prev) => [...prev, saved]);
    handleSelectExercise(saved);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-ambient-light dark:bg-ambient-dark text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-teal-500 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-6 flex flex-col gap-6">
        {showLogin && <LoginPage />}

        {!showLogin && activeTab === 'practice' && (
          <PracticeView
            currentExercise={currentExercise}
            zoom={zoom}
            onZoomChange={setZoom}
            transpose={transpose}
            onTransposeChange={setTranspose}
            bpm={bpm}
            onBpmChange={setBpm}
            onChangeSheet={() => setActiveTab('library')}
            isMetronomeMuted={isMetronomeMuted}
            onToggleMetronomeMute={() => setIsMetronomeMuted((prev) => !prev)}
            practice={practice}
          />
        )}

        {!showLogin && activeTab === 'library' && (
          <ExerciseSelector
            currentExercise={currentExercise}
            onSelectExercise={(ex) => {
              handleSelectExercise(ex);
              setActiveTab('practice');
            }}
            customExercises={customExercises}
            onUploadCustomExercise={handleUploadCustomExercise}
          />
        )}

        {!showLogin && activeTab === 'stats' && (
          <PracticeStats sessions={practice.sessions} onClearSessions={practice.clearSessions} />
        )}
      </main>

      {/* Practice Completed Summary Modal */}
      <PracticeCompleteModal
        session={practice.lastFinishedSession}
        exerciseTitle={currentExercise.title}
        samples={practice.lastSessionSamples}
        onClose={practice.dismissFinishedSession}
        onViewStats={() => setActiveTab('stats')}
      />
    </div>
  );
}

export default App;
