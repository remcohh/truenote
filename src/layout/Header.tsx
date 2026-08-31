import React, { useState, useEffect } from 'react';
import { Music, Download, Sun, Moon, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { logoutUser } from '../services/pocketbase';

interface HeaderProps {
  activeTab: 'practice' | 'library' | 'stats';
  onTabChange: (tab: 'practice' | 'library' | 'stats') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const user = useAuth();

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-sm dark:shadow-xl transition-colors duration-200">
      <div className="w-full px-2 sm:px-4 md:px-6 flex items-center justify-between gap-3">

        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Music size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight">TrueNote</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30 font-mono">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium hidden sm:block">Interactive Sight-Reading & Pitch Practice</p>
          </div>
        </div>

        {/* Tab Navigation — nothing to switch between until there's a session */}
        {user && (
          <nav className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-semibold">
            {/* Practice is a sub-view of Library (reached by picking a piece there), not its own
                destination — but it's not "on" Library either, so neither tab lights up there. */}
            <button
              onClick={() => onTabChange('library')}
              className={`px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                activeTab === 'library'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                  : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-300/60 dark:hover:bg-slate-800/60 font-bold'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => onTabChange('stats')}
              className={`px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                  : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-300/60 dark:hover:bg-slate-800/60 font-bold'
              }`}
            >
              Stats
            </button>
          </nav>
        )}

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-lg transition shadow-md shadow-teal-500/20"
            >
              <Download size={14} /> Install App
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-amber-600 dark:text-indigo-400 hover:bg-slate-300 dark:hover:bg-slate-800 transition shadow-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Sun size={17} className="text-amber-600 fill-amber-400/20" /> : <Moon size={17} className="text-indigo-400 fill-indigo-400/20" />}
          </button>

          {/* Account: signed-out has no header affordance — the whole app is the login page then */}
          {user && (
            <button
              onClick={() => {
                if (confirm('Sign out?')) logoutUser();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition shadow-sm"
              title="Sign out"
            >
              <UserCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline max-w-[8rem] truncate">{user.name}</span>
              <LogOut size={13} />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

