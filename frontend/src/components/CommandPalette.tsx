'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Play,
  RotateCcw,
  Sun,
  Moon,
  History,
  Code2,
  Download,
  Command,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface Props {
  commands: CommandItem[];
}

export default function CommandPalette({ commands }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter commands
  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      setOpen(false);
      setQuery('');
      cmd.action();
    },
    []
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        executeCommand(filtered[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIndex, executeCommand]);

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="cmd-backdrop fixed inset-0 z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
            className="fixed left-1/2 top-[20%] z-[60] w-full max-w-lg -translate-x-1/2"
          >
            <div className="glass-card mx-4 overflow-hidden shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
                <Search size={16} className="text-text-tertiary" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
                <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-text-tertiary">
                    No commands found
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                        {category}
                      </div>
                      {items.map((cmd) => {
                        flatIndex++;
                        const isSelected = flatIndex === selectedIndex;
                        const currentIndex = flatIndex;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-accent/10 text-accent'
                                : 'text-text-secondary hover:bg-surface-2'
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                isSelected
                                  ? 'bg-accent/20 text-accent'
                                  : 'bg-surface-2 text-text-tertiary'
                              }`}
                            >
                              {cmd.icon}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {cmd.label}
                              </div>
                              {cmd.description && (
                                <div className="text-[11px] text-text-tertiary">
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/50 px-4 py-2">
                <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5">↵</kbd>
                    Select
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <Command size={10} />
                  <span>K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
