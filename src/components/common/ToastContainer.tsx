import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useInventoryStore } from '../../state/useInventoryStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useInventoryStore();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-[320px] w-full">
      <AnimatePresence>
        {toasts.map(toast => {
          let icon = <Check className="text-navy shrink-0" size={16} strokeWidth={2} />;
          let borderHighlight = 'border-l-4 border-l-navy';

          if (toast.type === 'error') {
            icon = <AlertCircle className="text-black shrink-0" size={16} strokeWidth={2} />;
            borderHighlight = 'border-l-4 border-l-black';
          } else if (toast.type === 'warning' || toast.type === 'info') {
            icon = <AlertTriangle className="text-orange shrink-0" size={16} strokeWidth={2} />;
            borderHighlight = 'border-l-4 border-l-orange';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto bg-white border border-grey rounded-[8px] p-4 flex items-start gap-3 shadow-overlay ${borderHighlight}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 pr-1">
                <p className="text-xs font-medium text-navy leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-dim hover:text-navy p-0.5 transition-colors"
                aria-label="Dismiss toast"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
