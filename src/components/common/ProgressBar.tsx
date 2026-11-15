import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  percent: number; // 0 to 100
  className?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  className = '',
  animate = true,
}) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={`w-full h-2 bg-grey rounded-[4px] overflow-hidden ${className}`}>
      {animate ? (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-orange rounded-[4px]"
        />
      ) : (
        <div
          style={{ width: `${clamped}%` }}
          className="h-full bg-orange rounded-[4px]"
        />
      )}
    </div>
  );
};
