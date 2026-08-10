import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Theme {
  id: string;
  name: string;
  description: string;
  accent: string;
  bg: string;
}

const THEMES: Theme[] = [
  { id: 'light', name: 'Light', description: 'Clean minimal white', accent: '#EF4444', bg: '#FAFAFA' },
  { id: 'dark', name: 'Dark', description: 'Cozy dark charcoal', accent: '#F97316', bg: '#180D08' },
];

export default function ThemeSwitcherModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTheme, setActiveTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('app-theme') || 'dark';
    setActiveTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setActiveTheme(themeId);
    localStorage.setItem('app-theme', themeId);
    document.documentElement.dataset.theme = themeId;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[var(--theme-surface)] border border-[var(--theme-accent-500)] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--theme-accent-500)]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[var(--theme-text)]">Pick a look.</h3>
                <p className="text-sm text-[var(--theme-text-muted)] mt-1">Applies instantly across the whole app.</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] flex items-center justify-center hover:bg-[var(--theme-accent-500)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES.map((theme) => {
                const isActive = activeTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-[var(--theme-surface-elevated)] ring-2 ring-[var(--theme-accent-500)] shadow-md'
                        : 'bg-[var(--theme-surface)] border border-transparent hover:border-[var(--theme-accent-500)] hover:bg-[var(--theme-surface-elevated)]/50'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif font-black text-lg shadow-inner shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {theme.name.charAt(0)}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-[var(--theme-text)]">{theme.name}</span>
                      <span className="text-xs text-[var(--theme-text-muted)]">{theme.description}</span>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-[var(--theme-accent-500)] text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
