'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  complexity: string;
}

const SCORES: Record<string, { score: number; label: string; color: string; gradient: string }> = {
  'O(1)': { score: 100, label: 'Excellent', color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
  'O(log n)': { score: 95, label: 'Excellent', color: '#10b981', gradient: 'from-emerald-400 to-cyan-500' },
  'O(n)': { score: 82, label: 'Great', color: '#06b6d4', gradient: 'from-cyan-400 to-blue-500' },
  'O(n log n)': { score: 68, label: 'Good', color: '#6366f1', gradient: 'from-indigo-400 to-purple-500' },
  'O(n²)': { score: 45, label: 'Fair', color: '#f59e0b', gradient: 'from-amber-400 to-orange-500' },
  'O(n³)': { score: 25, label: 'Poor', color: '#ef4444', gradient: 'from-orange-400 to-red-500' },
  'O(2ⁿ)': { score: 15, label: 'Poor', color: '#ef4444', gradient: 'from-red-400 to-red-600' },
  'O(n!)': { score: 5, label: 'Critical', color: '#dc2626', gradient: 'from-red-500 to-red-700' },
};

export default function ComplexityBadge({ complexity }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const info = SCORES[complexity] || SCORES['O(n)'];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (info.score / 100) * circumference;

  // Animate score counter
  useEffect(() => {
    setAnimatedScore(0);
    const target = info.score;
    const duration = 1500;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [info.score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
      className="flex flex-col items-center gap-3"
    >
      {/* SVG Gauge */}
      <div className="relative flex h-[120px] w-[120px] items-center justify-center">
        <svg
          className="absolute"
          width="120"
          height="120"
          viewBox="0 0 120 120"
        >
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth="8"
            opacity={0.3}
          />
          {/* Score ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={info.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-ring"
            style={{
              '--gauge-circumference': circumference,
              '--gauge-offset': offset,
              filter: `drop-shadow(0 0 6px ${info.color}40)`,
            } as React.CSSProperties}
          />
        </svg>

        {/* Score number */}
        <div className="z-10 flex flex-col items-center">
          <span
            className="text-3xl font-bold"
            style={{ color: info.color }}
          >
            {animatedScore}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            / 100
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${info.color}15`,
            color: info.color,
          }}
        >
          {info.label}
        </span>
      </div>
    </motion.div>
  );
}
