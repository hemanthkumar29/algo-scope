'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine,
  GitBranch,
  Repeat,
  Calculator,
  BarChart3,
} from 'lucide-react';

const PHASES = [
  { icon: <TreePine size={16} />, label: 'Parsing syntax tree...' },
  { icon: <GitBranch size={16} />, label: 'Detecting loop structures...' },
  { icon: <Repeat size={16} />, label: 'Analyzing recursion patterns...' },
  { icon: <Calculator size={16} />, label: 'Computing complexity class...' },
  { icon: <BarChart3 size={16} />, label: 'Generating visualizations...' },
];

export default function AnalysisLoader() {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase progression
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, 800);

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return 95;
        return p + Math.random() * 8;
      });
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated rings */}
      <div className="relative h-20 w-20">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/20"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-accent/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="text-accent"
            >
              {PHASES[phase].icon}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="mt-6 text-sm font-medium text-text-secondary"
        >
          {PHASES[phase].label}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent via-purple-500 to-accent"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Phase dots */}
      <div className="mt-4 flex gap-1.5">
        {PHASES.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-colors ${
              i <= phase ? 'bg-accent' : 'bg-surface-3'
            }`}
            animate={{ width: i === phase ? 16 : 6 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
