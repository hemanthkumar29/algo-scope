'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  HardDrive,
  Layers,
  GitBranch,
  Lightbulb,
  ChevronRight,
  Zap,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';

interface Props {
  result: AnalysisResult;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ResultPanel({ result }: Props) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Complexity badges */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <ComplexityCard
          icon={<Clock size={16} />}
          label="Time Complexity"
          notation={result.time_complexity}
          sublabel={result.time_label}
          color="indigo"
        />
        <ComplexityCard
          icon={<HardDrive size={16} />}
          label="Space Complexity"
          notation={result.space_complexity}
          sublabel={result.space_label}
          color="emerald"
        />
      </motion.div>

      {/* Analysis details */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        <MiniStat
          icon={<Layers size={13} />}
          label="Loop Depth"
          value={result.loop_depth.toString()}
        />
        <MiniStat
          icon={<GitBranch size={13} />}
          label="Recursion"
          value={result.recursion ? 'Yes' : 'No'}
        />
        <MiniStat
          icon={<Zap size={13} />}
          label="Log Pattern"
          value={result.logarithmic_patterns ? 'Yes' : 'No'}
        />
      </motion.div>

      {/* Best / Average / Worst case */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            <BarChart3 size={13} />
            Case Analysis
          </h3>
          <div className="space-y-2">
            <CaseRow label="Best" notation={result.cases.best.notation} desc={result.cases.best.description} color="text-emerald-400" />
            <CaseRow label="Average" notation={result.cases.average.notation} desc={result.cases.average.description} color="text-amber-400" />
            <CaseRow label="Worst" notation={result.cases.worst.notation} desc={result.cases.worst.description} color="text-red-400" />
          </div>
        </div>
      </motion.div>

      {/* Explanation */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            <TrendingUp size={13} />
            Explanation
          </h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            {result.explanation}
          </p>
        </div>
      </motion.div>

      {/* Step-by-step breakdown */}
      {result.step_by_step.length > 0 && (
        <motion.div variants={item}>
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <Layers size={13} />
              Code Breakdown
            </h3>
            <div className="space-y-2">
              {result.step_by_step.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-surface-2/50 px-3 py-2"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-accent/10 text-[10px] font-bold text-accent">
                    {step.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">
                      {step.description}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-tertiary">
                      <span>Line {step.line}</span>
                      <span className="text-accent">{step.complexity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Optimization Suggestions */}
      <motion.div variants={item}>
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            <Lightbulb size={13} />
            Optimization Suggestions
          </h3>
          <div className="space-y-2.5">
            {result.suggestions.map((suggestion, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-2">
                  <ChevronRight
                    size={12}
                    className="text-accent transition-transform group-hover:translate-x-0.5"
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {suggestion.title}
                  </span>
                  {suggestion.impact && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                      {suggestion.impact}
                    </span>
                  )}
                </div>
                <p className="ml-5 mt-0.5 text-xs leading-relaxed text-text-tertiary">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ComplexityCard({
  icon,
  label,
  notation,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  notation: string;
  sublabel: string;
  color: 'indigo' | 'emerald';
}) {
  const colorClasses = {
    indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
  };
  const textClasses = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-2 text-text-tertiary">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`mt-2 text-2xl font-bold ${textClasses[color]}`}>
        {notation}
      </div>
      <div className="mt-0.5 text-xs text-text-tertiary">{sublabel}</div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 px-3 py-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-text-tertiary">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="mt-1 text-lg font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}

function CaseRow({ label, notation, desc, color }: { label: string; notation: string; desc: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-14 text-xs font-medium ${color}`}>{label}</span>
      <span className="text-sm font-semibold text-text-primary">{notation}</span>
      <span className="text-xs text-text-tertiary">— {desc}</span>
    </div>
  );
}
