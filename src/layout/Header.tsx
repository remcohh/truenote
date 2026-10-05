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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#272121]/90 backdrop-blur-md border-b border-[#a8a492]/25 dark:border-[#524646]/60 px-4 py-3 shadow-xs dark:shadow-xl transition-colors duration-200">
      <div className="w-full px-2 sm:px-4 md:px-6 flex items-center justify-between gap-3">

        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warm-coral flex items-center justify-center text-white shadow-xs">
            <Music size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-warm-dark dark:text-warm-cream tracking-tight">TrueNote</h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-warm-cream text-warm-dark dark:bg-[#3a3030] dark:text-warm-cream border border-[#a8a492]/40 font-mono">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#a8a492] font-medium hidden sm:block">Sight-Reading & Pitch Practice</p>
          </div>
        </div>

        {/* Tab Navigation */}
        {user && (
          <nav className="flex items-center gap-1 bg-warm-cream/70 dark:bg-[#342b2b] p-1 rounded-xl border border-[#a8a492]/30 dark:border-[#524646] text-xs font-medium">
            <a
              href="/library"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('library');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                activeTab === 'library'
                  ? 'bg-warm-coral text-white shadow-xs font-semibold'
                  : 'text-warm-dark/80 dark:text-warm-cream/80 hover:text-warm-coral dark:hover:text-warm-coral hover:bg-warm-coral/10'
              }`}
            >
              Library
            </a>
            <a
              href="/practice"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('practice');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                activeTab === 'practice'
                  ? 'bg-warm-coral text-white shadow-xs font-semibold'
                  : 'text-warm-dark/80 dark:text-warm-cream/80 hover:text-warm-coral dark:hover:text-warm-coral hover:bg-warm-coral/10'
              }`}
            >
              Practice
            </a>
            <a
              href="/stats"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('stats');
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                activeTab === 'stats'
                  ? 'bg-warm-coral text-white shadow-xs font-semibold'
                  : 'text-warm-dark/80 dark:text-warm-cream/80 hover:text-warm-coral dark:hover:text-warm-coral hover:bg-warm-coral/10'
              }`}
            >
              Stats
            </a>
          </nav>
        )}

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-coral hover:bg-[#d94e2d] text-white font-medium text-xs rounded-lg transition shadow-xs"
            >
              <Download size={14} /> Install App
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-warm-cream/70 dark:bg-[#342b2b] border border-[#a8a492]/30 dark:border-[#524646] text-warm-dark dark:text-warm-cream hover:bg-[#f0e6d6] dark:hover:bg-[#433838] transition"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Account */}
          {user && (
            <button
              onClick={() => {
                if (confirm('Sign out?')) logoutUser();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-cream/70 dark:bg-[#342b2b] border border-[#a8a492]/30 dark:border-[#524646] hover:bg-[#f0e6d6] dark:hover:bg-[#433838] text-warm-dark dark:text-warm-cream font-medium text-xs rounded-xl transition"
              title="Sign out"
            >
              <UserCircle2 size={16} className="text-[#a8a492]" />
              <span className="hidden sm:inline max-w-[8rem] truncate">{user.name}</span>
              <LogOut size={13} />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

