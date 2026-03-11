'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LanguageSelector, {
  LANGUAGES,
  type Language,
} from '@/components/LanguageSelector';
import CodeEditor, { getPlaceholder } from '@/components/CodeEditor';
import ResultPanel from '@/components/ResultPanel';
import ComplexityGraph from '@/components/ComplexityGraph';
import AnalysisLoader from '@/components/AnalysisLoader';
import type { AnalysisResult } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HomePage() {
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(getPlaceholder(LANGUAGES[0].id));
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      // Only replace with placeholder if code is the placeholder of the previous language
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
    } catch (err: any) {
      setError(err.message || 'Failed to analyze code. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  const handleReset = useCallback(() => {
    setCode(getPlaceholder(language.id));
    setResult(null);
    setError(null);
  }, [language]);

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Code Complexity{' '}
            <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-text-secondary">
            Paste your algorithm and instantly understand its time and space
            complexity with visual explanations. Built for DSA interview prep.
          </p>
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
              <LanguageSelector
                selected={language}
                onChange={handleLanguageChange}
              />
              <div className="flex items-center gap-2">
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
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
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
                      Analyze Complexity
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                    <Sparkles size={20} className="text-text-tertiary" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-text-secondary">
                    Analysis results will appear here
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Paste code and click &quot;Analyze Complexity&quot; to
                    begin
                  </p>
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
        </motion.footer>
      </main>
    </div>
  );
}
