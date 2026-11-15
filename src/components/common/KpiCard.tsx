import React from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from './ProgressBar';

export interface KpiCardProps {
  label: string;
  value: number | string;
  percent?: number;
  sublabel?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  percent = 0,
  sublabel,
  icon,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-grey rounded-[8px] p-6 flex flex-col justify-between transition-colors select-none ${
        onClick ? 'cursor-pointer hover:border-navy hover:bg-grey-hover' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase font-medium text-dim tracking-wider">
          {label}
        </span>
        {icon && <div className="text-navy">{icon}</div>}
      </div>

      <div className="my-3">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[32px] leading-[40px] font-bold text-navy tracking-tight block"
        >
          {value}
        </motion.span>
      </div>

      <div className="space-y-1.5">
        {percent > 0 && <ProgressBar percent={percent} />}
        {sublabel && <p className="text-xs text-dim">{sublabel}</p>}
      </div>
    </div>
  );
};

// Backwards compatibility alias for RingKPI
export const RingKPI = KpiCard;
