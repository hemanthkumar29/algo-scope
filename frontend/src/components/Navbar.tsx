'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Github, Braces, Command, History } from 'lucide-react';
import { getShortcutSymbol } from './KeyboardShortcuts';

interface Props {
  onToggleHistory?: () => void;
  analysisCount?: number;
}

export default function Navbar({ onToggleHistory, analysisCount }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-border/50 glass gradient-border-animated"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"
            animate={{
              boxShadow: [
                '0 0 0px rgba(99, 102, 241, 0)',
                '0 0 12px rgba(99, 102, 241, 0.3)',
                '0 0 0px rgba(99, 102, 241, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Braces className="h-4.5 w-4.5 text-accent" size={18} />
          </motion.div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            Algo Scope
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            BETA
          </span>
          {analysisCount !== undefined && analysisCount > 0 && (
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
              {analysisCount} analyses
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Cmd+K indicator */}
          <button
            onClick={() => {
              // Dispatch Cmd+K event to open command palette
              window.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true,
                })
              );
            }}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-surface-1/50 px-2.5 py-1 text-[11px] text-text-tertiary transition-colors hover:border-accent/40 hover:text-text-secondary"
          >
            <Command size={11} />
            <span className="font-medium">K</span>
          </button>

          {/* History button */}
          {onToggleHistory && (
            <button
              onClick={onToggleHistory}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label="Analysis history"
              title="Analysis History (⌘⇧H)"
            >
              <History size={16} />
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <Github size={16} />
          </a>

          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
            aria-label="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
