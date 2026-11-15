import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop: 40% navy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/40"
          />

          {/* Drawer: 480 wide from right, 24 padding, white fill, 1px left #E5E5E5 border, soft shadow */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-screen max-w-[480px] pointer-events-auto bg-white border-l border-grey shadow-overlay flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-4 mb-6 border-b border-grey">
                <div>
                  <h3 className="font-sans font-semibold text-xl text-navy leading-7">{title}</h3>
                  {subtitle && <p className="text-dim text-xs mt-1 leading-4">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-[8px] border border-grey bg-white text-dim hover:text-navy hover:bg-grey flex items-center justify-center transition-colors"
                  aria-label="Close drawer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
