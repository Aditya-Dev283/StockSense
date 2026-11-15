import React from 'react';
import { motion } from 'framer-motion';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between cursor-pointer select-none py-1 ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      }`}
      onClick={() => !disabled && onChange(!checked)}
    >
      {(label || description) && (
        <div className="mr-3">
          {label && <span className="text-sm font-medium text-navy block">{label}</span>}
          {description && <span className="text-xs text-dim block mt-0.5">{description}</span>}
        </div>
      )}
      {/* 40x24 track, 20px white knob */}
      <div
        className={`relative w-10 h-6 rounded-full transition-colors duration-150 p-0.5 ${
          checked ? 'bg-orange' : 'bg-grey'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 16 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </div>
    </div>
  );
};

// Backwards compatibility alias
export const NeuToggle = Toggle;
export type NeuToggleProps = ToggleProps;
