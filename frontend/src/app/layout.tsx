import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Algo Scope — Code Complexity Analyzer',
  description:
    'Paste your code and instantly analyze time & space complexity with visual explanations. Built for DSA interview prep.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-0 text-text-primary antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
