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
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-xs">
            <Music size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">TrueNote</h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 font-mono">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden sm:block">Sight-Reading & Pitch Practice</p>
          </div>
        </div>

        {/* Tab Navigation — nothing to switch between until there's a session */}
        {user && (
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium">
            <button
              onClick={() => onTabChange('library')}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                activeTab === 'library'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => onTabChange('stats')}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                activeTab === 'stats'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs rounded-lg transition shadow-xs"
            >
              <Download size={14} /> Install App
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Account: signed-out has no header affordance — the whole app is the login page then */}
          {user && (
            <button
              onClick={() => {
                if (confirm('Sign out?')) logoutUser();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl transition"
              title="Sign out"
            >
              <UserCircle2 size={16} className="text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline max-w-[8rem] truncate">{user.name}</span>
              <LogOut size={13} />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

