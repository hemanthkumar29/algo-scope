'use client';

import { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from './ThemeProvider';
import type { Language } from './LanguageSelector';

interface Props {
  language: Language;
  code: string;
  onChange: (value: string) => void;
  highlightLines?: number[];
}

const PLACEHOLDER_CODE: Record<string, string> = {
  cpp: `// Paste your C++ algorithm here
#include <iostream>
using namespace std;

int main() {
    int n = 100;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << i * j << " ";
        }
    }
    return 0;
}`,
  java: `// Paste your Java algorithm here
public class Main {
    public static void main(String[] args) {
        int n = 100;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                System.out.print(i * j + " ");
            }
        }
    }
}`,
  python: `# Paste your Python algorithm here
def example(n):
    for i in range(n):
        for j in range(n):
            print(i * j, end=" ")

example(100)`,
  javascript: `// Paste your JavaScript algorithm here
function example(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      console.log(i * j);
    }
  }
}

example(100);`,
  go: `// Paste your Go algorithm here
package main

import "fmt"

func main() {
    n := 100
    for i := 0; i < n; i++ {
        for j := 0; j < n; j++ {
            fmt.Print(i*j, " ")
        }
    }
}`,
  rust: `// Paste your Rust algorithm here
fn main() {
    let n = 100;
    for i in 0..n {
        for j in 0..n {
            print!("{} ", i * j);
        }
    }
}`,
};

export function getPlaceholder(langId: string): string {
  return PLACEHOLDER_CODE[langId] || PLACEHOLDER_CODE.javascript;
}

export default function CodeEditor({
  language,
  code,
  onChange,
  highlightLines,
}: Props) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Define custom dark theme
      monaco.editor.defineTheme('algo-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'c084fc' },
          { token: 'string', foreground: '6ee7b7' },
          { token: 'number', foreground: 'fbbf24' },
          { token: 'type', foreground: '67e8f9' },
        ],
        colors: {
          'editor.background': '#111113',
          'editor.foreground': '#e4e4e7',
          'editor.lineHighlightBackground': '#1a1a1e',
          'editor.selectionBackground': '#6366f133',
          'editorLineNumber.foreground': '#3f3f46',
          'editorLineNumber.activeForeground': '#a1a1aa',
          'editor.inactiveSelectionBackground': '#6366f11a',
          'editorCursor.foreground': '#818cf8',
          'editorWidget.background': '#111113',
          'editorWidget.border': '#27272a',
        },
      });

      // Define custom light theme
      monaco.editor.defineTheme('algo-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
          { token: 'keyword', foreground: '7c3aed' },
          { token: 'string', foreground: '059669' },
          { token: 'number', foreground: 'd97706' },
          { token: 'type', foreground: '0891b2' },
        ],
        colors: {
          'editor.background': '#f9fafb',
          'editor.foreground': '#111827',
          'editor.lineHighlightBackground': '#f3f4f6',
          'editor.selectionBackground': '#6366f122',
          'editorLineNumber.foreground': '#d1d5db',
          'editorLineNumber.activeForeground': '#6b7280',
          'editor.inactiveSelectionBackground': '#6366f10d',
          'editorCursor.foreground': '#6366f1',
          'editorWidget.background': '#f9fafb',
          'editorWidget.border': '#e5e7eb',
        },
      });

      monaco.editor.setTheme(theme === 'dark' ? 'algo-dark' : 'algo-light');

      editor.focus();
    },
    [theme]
  );

  // Update theme when it changes
  const monacoTheme = theme === 'dark' ? 'algo-dark' : 'algo-light';

  // Highlight lines when they change
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    handleEditorMount(editor, monaco);

    if (highlightLines && highlightLines.length > 0) {
      const decorations = highlightLines.map((line) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'highlighted-line',
          linesDecorationsClassName: 'highlighted-line-gutter',
          overviewRuler: {
            color: '#6366f1',
            position: monaco.editor.OverviewRulerLane.Full,
          },
        },
      }));
      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        decorations
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
      <Editor
        height="420px"
        language={language.monacoId}
        value={code}
        theme={monacoTheme}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          padding: { top: 16, bottom: 16 },
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          formatOnPaste: true,
          suggest: { showKeywords: true },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-surface-1">
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
              <div className="flex gap-1">
                <div className="loading-dot h-1.5 w-1.5 rounded-full bg-accent" />
                <div className="loading-dot h-1.5 w-1.5 rounded-full bg-accent" />
                <div className="loading-dot h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              Loading editor
            </div>
          </div>
        }
      />
    </div>
  );
}
