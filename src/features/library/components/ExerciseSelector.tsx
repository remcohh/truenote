import React, { useState } from 'react';
import { Music, Upload, Search, Sparkles, FileCode, Check } from 'lucide-react';
import type { Exercise } from '../../../types';
import { SAMPLE_EXERCISES } from '../data/sampleExercises';
import { ErrorBanner } from '../../../components/ErrorBanner';

interface ExerciseSelectorProps {
  currentExercise: Exercise;
  onSelectExercise: (exercise: Exercise) => void;
  customExercises: Exercise[];
  onUploadCustomExercise: (exercise: Omit<Exercise, 'id'>) => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  currentExercise,
  onSelectExercise,
  customExercises,
  onUploadCustomExercise,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Custom upload form state
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customBpm, setCustomBpm] = useState<number>(100);
  const [customXml, setCustomXml] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const allExercises = [...SAMPLE_EXERCISES, ...customExercises];

  const categories = ['All', 'Scales', 'Arpeggios', 'Classical', 'Rhythm', 'Custom'];

  const filtered = allExercises.filter((ex) => {
    const matchesCategory = activeCategory === 'All' || ex.category === activeCategory;
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && (content.includes('<score-partwise') || content.includes('<score-timewise'))) {
        setCustomXml(content);
        if (!customTitle) {
          setCustomTitle(file.name.replace(/\.(musicxml|xml)$/i, ''));
        }
        setUploadError(null);
      } else {
        setUploadError('Invalid file. File must be a valid MusicXML document.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customXml.trim()) {
      setUploadError('Please provide both title and MusicXML content.');
      return;
    }

    const newEx: Omit<Exercise, 'id'> = {
      title: customTitle,
      category: 'Custom',
      difficulty: 'Intermediate',
      defaultBpm: customBpm,
      description: 'Custom uploaded MusicXML sheet exercise',
      xmlData: customXml,
      isCustom: true,
    };

    onUploadCustomExercise(newEx);
    setIsModalOpen(false);
    setCustomTitle('');
    setCustomXml('');
    setUploadError(null);
  };

  return (
    <div className="exercise-selector flex flex-col gap-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Upload Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 shadow-xs w-44"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-medium transition shadow-xs"
          >
            <Upload size={14} /> Upload XML
          </button>
        </div>
      </div>

      {/* Grid of Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filtered.map((ex) => {
          const isSelected = currentExercise.id === ex.id;
          return (
            <div
              key={ex.id}
              onClick={() => onSelectExercise(ex)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-900 dark:ring-slate-100'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                    {ex.category}
                  </span>
                  {isSelected && <Check size={16} className="text-slate-900 dark:text-slate-100" />}
                </div>

                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{ex.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{ex.description}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="font-medium text-slate-700 dark:text-slate-300">{ex.defaultBpm} BPM</span>
                <span className="font-medium text-slate-400 dark:text-slate-500">{ex.difficulty}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Custom MusicXML Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCode className="text-teal-600 dark:text-teal-400" size={18} /> Upload Custom MusicXML
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="flex flex-col gap-3">
              {uploadError && <ErrorBanner message={uploadError} className="text-xs p-2.5" />}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exercise Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Czerny Exercise No. 1"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default BPM</label>
                <input
                  type="number"
                  min="30"
                  max="240"
                  value={customBpm}
                  onChange={(e) => setCustomBpm(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Choose .musicxml File</label>
                <input
                  type="file"
                  accept=".xml,.musicxml"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-300 dark:hover:file:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste MusicXML String Directly
                </label>
                <textarea
                  rows={4}
                  placeholder='<?xml version="1.0"...'
                  value={customXml}
                  onChange={(e) => setCustomXml(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

