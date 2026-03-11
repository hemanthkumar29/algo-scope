'use client';

import { motion } from 'framer-motion';

export default function AnalysisLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated rings */}
      <div className="relative h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-accent/50"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ borderTopColor: 'transparent' }}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-sm font-medium text-text-secondary"
      >
        Analyzing code complexity
      </motion.p>

      <div className="mt-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
