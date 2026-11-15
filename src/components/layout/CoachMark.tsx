import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { useSettingsStore } from '../../state/useSettingsStore';

interface CoachMarkProps {
  id?: string;
  title: string;
  message: string;
  className?: string;
}

export const CoachMark: React.FC<CoachMarkProps> = ({
  title,
  message,
  className = '',
}) => {
  const { dismissedCoachMarks, dismissCoachMarks } = useSettingsStore();

  if (dismissedCoachMarks) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={`bg-white border border-grey border-l-4 border-l-orange rounded-[8px] p-4 flex items-start gap-3 shadow-overlay ${className}`}
      >
        <div className="w-8 h-8 rounded-[8px] bg-grey-header border border-grey text-orange flex items-center justify-center shrink-0">
          <Lightbulb size={18} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-navy">{title}</h4>
          <p className="text-xs text-dim mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={dismissCoachMarks}
          className="text-dim hover:text-navy p-1 transition-colors"
          title="Dismiss tip"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
