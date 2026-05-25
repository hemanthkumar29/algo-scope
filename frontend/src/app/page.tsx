'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Sparkles,
  Code2,
  History,
  Sun,
  Moon,
  Download,
  Share2,
  Command,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import LanguageSelector, {
  LANGUAGES,
  type Language,
} from '@/components/LanguageSelector';
import CodeEditor, { getPlaceholder } from '@/components/CodeEditor';
import ResultPanel from '@/components/ResultPanel';
import ComplexityGraph from '@/components/ComplexityGraph';
import AnalysisLoader from '@/components/AnalysisLoader';
import ParticleBackground from '@/components/ParticleBackground';
import AnalysisHistory, {
  addHistoryEntry,
  getHistoryCount,
  type HistoryEntry,
} from '@/components/AnalysisHistory';
import CommandPalette, { type CommandItem } from '@/components/CommandPalette';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import SnippetTemplates, { type Template } from '@/components/SnippetTemplates';
import ShareExport from '@/components/ShareExport';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/Toast';
import type { AnalysisResult } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Floating code symbols for hero
const FLOATING_SYMBOLS = ['{ }', '< >', 'O(n)', '( )', '[ ]', '=>'];

export default function HomePage() {
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(getPlaceholder(LANGUAGES[0].id));
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  // Load analysis count on mount
  useEffect(() => {
    setAnalysisCount(getHistoryCount());

    // Check for shared code in URL
    try {
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get('share');
      if (shareData) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(shareData))));
        if (decoded.code && decoded.language) {
          const lang = LANGUAGES.find((l) => l.id === decoded.language);
          if (lang) {
            setLanguage(lang);
            setCode(decoded.code);
            addToast('Shared code loaded!', 'info');
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      }
    } catch {
      // Invalid share data, ignore
    }
  }, [addToast]);

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      const prevPlaceholder = getPlaceholder(language.id);
      if (code === prevPlaceholder || code.trim() === '') {
        setCode(getPlaceholder(lang.id));
      }
    },
    [code, language]
  );

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language.id, code }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);

      // Save to history
      addHistoryEntry(language.id, language.label, code, data);
      setAnalysisCount(getHistoryCount());
      addToast(`Analysis complete: ${data.time_complexity}`, 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze code. Is the backend running?');
      addToast('Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [code, language, addToast]);

  const handleReset = useCallback(() => {
    setCode(getPlaceholder(language.id));
    setResult(null);
    setError(null);
  }, [language]);

  const handleHistoryRestore = useCallback(
    (entry: HistoryEntry) => {
      const lang = LANGUAGES.find((l) => l.id === entry.language);
      if (lang) setLanguage(lang);
      setCode(entry.code);
      setResult(entry.result);
      setHistoryOpen(false);
      addToast('Analysis restored from history', 'info');
    },
    [addToast]
  );

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      const lang = LANGUAGES.find((l) => l.id === template.language);
      if (lang) setLanguage(lang);
      setCode(template.code);
      setResult(null);
      addToast(`Loaded template: ${template.name}`, 'info');
    },
    [addToast]
  );

  // Command palette commands
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'analyze',
        label: 'Analyze Code',
        description: 'Run complexity analysis',
        icon: <Play size={14} />,
        shortcut: '⌘↵',
        action: handleAnalyze,
        category: 'Actions',
      },
      {
        id: 'reset',
        label: 'Reset Editor',
        description: 'Reset to placeholder code',
        icon: <RotateCcw size={14} />,
        shortcut: '⌘⇧R',
        action: handleReset,
        category: 'Actions',
      },
      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        description: 'Toggle application theme',
        icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
        shortcut: '⌘⇧T',
        action: toggleTheme,
        category: 'Preferences',
      },
      {
        id: 'history',
        label: 'Open History',
        description: 'View past analyses',
        icon: <History size={14} />,
        shortcut: '⌘⇧H',
        action: () => setHistoryOpen(true),
        category: 'Navigation',
      },
      {
        id: 'templates',
        label: 'Browse Templates',
        description: 'Algorithm snippet library',
        icon: <Code2 size={14} />,
        shortcut: '⌘⇧S',
        action: () => setTemplatesOpen(true),
        category: 'Navigation',
      },
      ...LANGUAGES.map((lang) => ({
        id: `lang-${lang.id}`,
        label: `Switch to ${lang.label}`,
        description: `Change editor language to ${lang.label}`,
        icon: <span className="text-xs">{lang.icon}</span>,
        action: () => handleLanguageChange(lang),
        category: 'Languages',
      })),
    ],
    [handleAnalyze, handleReset, theme, toggleTheme, handleLanguageChange]
  );

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Animated background */}
      <div className="bg-mesh" />
      <ParticleBackground />

      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts
        onAnalyze={handleAnalyze}
        onReset={handleReset}
        onToggleTheme={toggleTheme}
        onToggleHistory={() => setHistoryOpen((prev) => !prev)}
        onToggleTemplates={() => setTemplatesOpen((prev) => !prev)}
      />

      {/* Command palette */}
      <CommandPalette commands={commands} />

      {/* History drawer */}
      <AnalysisHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleHistoryRestore}
      />

      {/* Templates modal */}
      <SnippetTemplates
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handleTemplateSelect}
      />

      <Navbar
        onToggleHistory={() => setHistoryOpen((prev) => !prev)}
        analysisCount={analysisCount}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-10 text-center"
        >
          {/* Floating code symbols */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {FLOATING_SYMBOLS.map((sym, i) => (
              <motion.span
                key={sym}
                className="absolute font-mono text-sm text-accent/15"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${10 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              >
                {sym}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 shadow-lg shadow-accent/10"
          >
            <Sparkles size={22} className="text-accent" />
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Code Complexity{' '}
            <span className="gradient-text-animated">Analyzer</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary sm:text-base">
            Paste your algorithm and instantly understand its time and space
            complexity with visual explanations.
          </p>

          {/* Quick stats */}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              6 languages
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              8 complexity classes
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Press{' '}
              <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>{' '}
              for commands
            </span>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Editor toolbar */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LanguageSelector
                  selected={language}
                  onChange={handleLanguageChange}
                />
                <button
                  onClick={() => setTemplatesOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-accent/40 hover:bg-surface-2 hover:text-text-primary"
                >
                  <Code2 size={13} />
                  Templates
                </button>
              </div>
              <div className="flex items-center gap-2">
                <ShareExport
                  result={result}
                  code={code}
                  language={language.id}
                />
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-secondary"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !code.trim()}
                  className="group flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Sparkles size={14} />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Analyze
                      <kbd className="hidden sm:inline-flex items-center rounded bg-white/15 px-1 py-0.5 text-[9px] font-medium">
                        ⌘↵
                      </kbd>
                    </>
                  )}
                </button>
              </div>
            </div>

            <CodeEditor
              language={language}
              code={code}
              onChange={setCode}
              highlightLines={result?.highlight_lines}
            />

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AnalysisLoader />
                </motion.div>
              )}

              {!loading && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <ResultPanel result={result} />
                  <ComplexityGraph result={result} />
                </motion.div>
              )}

              {!loading && !result && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24"
                >
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2"
                    animate={{
                      boxShadow: [
                        '0 0 0px rgba(99, 102, 241, 0)',
                        '0 0 20px rgba(99, 102, 241, 0.15)',
                        '0 0 0px rgba(99, 102, 241, 0)',
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles size={22} className="text-text-tertiary" />
                  </motion.div>
                  <p className="mt-4 text-sm font-medium text-text-secondary">
                    Analysis results will appear here
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Paste code and press{' '}
                    <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[10px] font-medium">
                      ⌘↵
                    </kbd>{' '}
                    to analyze
                  </p>
                  <button
                    onClick={() => setTemplatesOpen(true)}
                    className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    <Code2 size={13} />
                    Browse Templates
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 border-t border-border py-6 text-center text-xs text-text-tertiary"
        >
          <p>
            Algo Scope — Static complexity analysis for interview preparation.
            Results are heuristic-based estimates.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[9px]">⌘K</kbd>
              Commands
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[9px]">⌘↵</kbd>
              Analyze
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[9px]">⌘⇧H</kbd>
              History
            </span>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
