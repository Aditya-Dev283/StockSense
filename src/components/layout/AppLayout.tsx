import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalBarcodeModal } from './GlobalBarcodeModal';
import { ToastContainer } from '../common/ToastContainer';
import { LayoutDashboard, Boxes, MapPin, ClipboardList, AlertTriangle } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white text-navy font-sans">
      {/* Persistent Desktop Sidebar: 240 wide */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8">
        {/* Persistent Top Bar: 64 high */}
        <TopBar onOpenBarcodeModal={() => setBarcodeModalOpen(true)} />

        {/* Dynamic Route Content with Animated Transitions: Max Width 1136, Padding 32 */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1136px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Barcode Scanner Modal */}
      <GlobalBarcodeModal
        isOpen={barcodeModalOpen}
        onClose={() => setBarcodeModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Mobile Bottom Dock (Phone viewport only: 64 high, 5 icons) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-grey h-16 px-4 flex items-center justify-around">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium ${
              isActive ? 'text-orange font-bold' : 'text-dim'
            }`
          }
        >
          <LayoutDashboard size={18} strokeWidth={1.5} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium ${
              isActive ? 'text-orange font-bold' : 'text-dim'
            }`
          }
        >
          <Boxes size={18} strokeWidth={1.5} />
          <span>Catalog</span>
        </NavLink>
        <button
          onClick={() => setBarcodeModalOpen(true)}
          className="w-10 h-10 rounded-[8px] bg-orange text-navy flex items-center justify-center font-bold text-xs"
          title="Scan Barcode"
        >
          SCAN
        </button>
        <NavLink
          to="/shelf-map"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium ${
              isActive ? 'text-orange font-bold' : 'text-dim'
            }`
          }
        >
          <MapPin size={18} strokeWidth={1.5} />
          <span>Map</span>
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1 text-[10px] font-medium ${
              isActive ? 'text-orange font-bold' : 'text-dim'
            }`
          }
        >
          <AlertTriangle size={18} strokeWidth={1.5} />
          <span>Alerts</span>
        </NavLink>
      </nav>
    </div>
  );
};
