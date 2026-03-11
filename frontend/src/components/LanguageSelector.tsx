'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface Language {
  id: string;
  label: string;
  monacoId: string;
  icon: string;
}

export const LANGUAGES: Language[] = [
  { id: 'cpp', label: 'C++', monacoId: 'cpp', icon: '⚡' },
  { id: 'java', label: 'Java', monacoId: 'java', icon: '☕' },
  { id: 'python', label: 'Python', monacoId: 'python', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript', icon: '✦' },
  { id: 'go', label: 'Go', monacoId: 'go', icon: '◈' },
  { id: 'rust', label: 'Rust', monacoId: 'rust', icon: '⚙' },
];

interface Props {
  selected: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSelector({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-sm font-medium text-text-primary transition-all hover:border-accent/40 hover:bg-surface-2"
      >
        <span className="text-xs">{selected.icon}</span>
        <span>{selected.label}</span>
        <ChevronDown
          size={14}
          className={`text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-xl shadow-black/5 dark:shadow-black/20"
          >
            <div className="p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    onChange(lang);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected.id === lang.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <span className="text-xs">{lang.icon}</span>
                  <span className="flex-1 font-medium">{lang.label}</span>
                  {selected.id === lang.id && (
                    <Check size={14} className="text-accent" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
