'use client';

import { useEffect } from 'react';

interface ShortcutActions {
  onAnalyze: () => void;
  onReset: () => void;
  onToggleTheme: () => void;
  onToggleHistory: () => void;
  onToggleTemplates: () => void;
}

export default function KeyboardShortcuts({
  onAnalyze,
  onReset,
  onToggleTheme,
  onToggleHistory,
  onToggleTemplates,
}: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+Enter → Analyze
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        onAnalyze();
        return;
      }

      // Cmd+Shift+R → Reset
      if (isMod && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        onReset();
        return;
      }

      // Cmd+Shift+T → Toggle Theme
      if (isMod && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        onToggleTheme();
        return;
      }

      // Cmd+Shift+H → Toggle History
      if (isMod && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        onToggleHistory();
        return;
      }

      // Cmd+Shift+S → Toggle Templates
      if (isMod && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        onToggleTemplates();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onAnalyze, onReset, onToggleTheme, onToggleHistory, onToggleTemplates]);

  // This component renders nothing — it's purely a side-effect
  return null;
}

// Helper to format shortcut display
export function getShortcutSymbol() {
  if (typeof navigator === 'undefined') return '⌘';
  return /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘' : 'Ctrl';
}
