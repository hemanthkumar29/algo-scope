'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Trash2, Clock, Code2, RotateCcw } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  language: string;
  languageLabel: string;
  code: string;
  codePreview: string;
  timeComplexity: string;
  spaceComplexity: string;
  result: AnalysisResult;
}

const STORAGE_KEY = 'algo-scope-history';
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage full, trim and retry
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 20)));
    } catch {
      // Bail
    }
  }
}

export function addHistoryEntry(
  language: string,
  languageLabel: string,
  code: string,
  result: AnalysisResult
) {
  const entries = loadHistory();
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    language,
    languageLabel,
    code,
    codePreview: code.split('\n').slice(0, 3).join('\n').slice(0, 120),
    timeComplexity: result.time_complexity,
    spaceComplexity: result.space_complexity,
    result,
  };
  entries.unshift(entry);
  saveHistory(entries);
  return entry;
}

export function getHistoryCount(): number {
  return loadHistory().length;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
}

export default function AnalysisHistory({ open, onClose, onRestore }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) {
      setEntries(loadHistory());
    }
  }, [open]);

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setEntries([]);
    saveHistory([]);
  }, []);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const complexityColor = (c: string) => {
    const colors: Record<string, string> = {
      'O(1)': 'text-emerald-400 bg-emerald-500/10',
      'O(log n)': 'text-cyan-400 bg-cyan-500/10',
      'O(n)': 'text-indigo-400 bg-indigo-500/10',
      'O(n log n)': 'text-purple-400 bg-purple-500/10',
      'O(n²)': 'text-amber-400 bg-amber-500/10',
      'O(n³)': 'text-orange-400 bg-orange-500/10',
      'O(2ⁿ)': 'text-red-400 bg-red-500/10',
      'O(n!)': 'text-red-500 bg-red-500/10',
    };
    return colors[c] || 'text-text-secondary bg-surface-2';
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-surface-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <History size={16} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Analysis History
                  </h2>
                  <p className="text-[11px] text-text-tertiary">
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {entries.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={12} />
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                    <Clock size={20} className="text-text-tertiary" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-text-secondary">
                    No history yet
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Analyzed code will appear here
                  </p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
                  }}
                  className="space-y-2"
                >
                  {entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0 },
                      }}
                      className="group rounded-xl border border-border bg-surface-1 p-3.5 transition-colors hover:border-accent/30"
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-tertiary">
                            {entry.languageLabel}
                          </span>
                          <span className="text-[10px] text-text-tertiary">•</span>
                          <span className="text-[11px] text-text-tertiary">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${complexityColor(
                              entry.timeComplexity
                            )}`}
                          >
                            {entry.timeComplexity}
                          </span>
                        </div>
                      </div>

                      {/* Code preview */}
                      <pre className="mt-2 overflow-hidden rounded-lg bg-surface-2/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-text-secondary">
                        {entry.codePreview}
                        {entry.code.length > 120 && (
                          <span className="text-text-tertiary">...</span>
                        )}
                      </pre>

                      {/* Actions */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-tertiary">
                            Space: {entry.spaceComplexity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => onRestore(entry)}
                            className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
                          >
                            <RotateCcw size={11} />
                            Restore
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
