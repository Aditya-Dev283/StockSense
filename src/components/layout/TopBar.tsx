import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ScanLine, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../state/useAuthStore';
import { useInventoryStore } from '../../state/useInventoryStore';
import { Button } from '../common/Button';

interface TopBarProps {
  onOpenBarcodeModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenBarcodeModal }) => {
  const { currentUser, logout } = useAuthStore();
  const { parts } = useInventoryStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const lowStockCount = parts.filter(
    p => !p.is_archived && p.stock_qty <= p.min_threshold
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-grey px-6 flex items-center justify-between gap-4">
      {/* Global Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 text-dim pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search part name, code, barcode or vehicle..."
            className="w-full h-10 bg-white border border-grey rounded-[8px] text-navy placeholder:text-dim text-xs sm:text-sm pl-9 pr-4 outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>
      </form>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        {/* Scan Barcode Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenBarcodeModal}
          className="flex items-center gap-1.5"
          title="Scan Barcode (Hotkey: Rapid scanner wedge)"
        >
          <ScanLine size={16} strokeWidth={1.5} className="text-orange" />
          <span className="hidden sm:inline text-xs font-medium">Scan Barcode</span>
        </Button>

        {/* Notifications Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative w-10 h-10 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center transition-colors"
          title={`${lowStockCount} items need attention`}
          aria-label="View inventory alerts"
        >
          <Bell size={18} strokeWidth={1.5} />
          {lowStockCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange" />
          )}
        </button>

        {/* Role Chip */}
        <div className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full border border-grey bg-grey-header text-navy text-xs font-semibold">
          <ShieldAlert size={14} strokeWidth={1.5} className="text-orange" />
          <span>
            {currentUser?.name ||
              (currentUser?.role === 'owner'
                ? 'Owner'
                : currentUser?.role === 'storekeeper'
                ? 'Shopkeeper'
                : currentUser?.role === 'mechanic'
                ? 'Mechanic'
                : currentUser?.role === 'purchasing'
                ? 'Supplier'
                : 'Staff')}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-[8px] border border-grey bg-white text-navy hover:bg-grey flex items-center justify-center transition-colors"
          title="Sign Out"
          aria-label="Logout"
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
