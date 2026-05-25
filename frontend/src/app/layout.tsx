import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Algo Scope — Code Complexity Analyzer',
  description:
    'Paste your code and instantly analyze time & space complexity with visual explanations. Built for DSA interview prep.',
  keywords: ['algorithm', 'complexity', 'analyzer', 'DSA', 'interview', 'Big O', 'time complexity', 'space complexity'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-0 text-text-primary antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
