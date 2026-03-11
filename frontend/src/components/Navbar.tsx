'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Github, Braces } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-border bg-surface-0/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Braces className="h-4.5 w-4.5 text-accent" size={18} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            Algo Scope
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            BETA
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
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
