import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Boxes,
  MapPin,
  ClipboardList,
  AlertTriangle,
  Building2,
  ShoppingCart,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Info,
} from 'lucide-react';
import { useAuthStore } from '../../state/useAuthStore';
import { useInventoryStore } from '../../state/useInventoryStore';
import { UserRole } from '../../types';

interface NavItemDef {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
  badgeKey?: 'alerts';
}

const NAV_ITEMS: NavItemDef[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['owner', 'storekeeper', 'mechanic', 'purchasing'],
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Boxes,
    roles: ['owner', 'storekeeper', 'mechanic', 'purchasing'],
  },
  {
    label: 'Shelf Map',
    path: '/shelf-map',
    icon: MapPin,
    roles: ['owner', 'storekeeper', 'mechanic', 'purchasing'],
  },
  {
    label: 'Issue Part',
    path: '/issue-part',
    icon: ClipboardList,
    roles: ['owner', 'storekeeper', 'mechanic'],
  },
  {
    label: 'Low-Stock Alerts',
    path: '/alerts',
    icon: AlertTriangle,
    roles: ['owner', 'storekeeper', 'purchasing'],
    badgeKey: 'alerts',
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: Building2,
    roles: ['owner', 'storekeeper', 'purchasing'],
  },
  {
    label: 'Orders',
    path: '/procurement/orders',
    icon: ShoppingCart,
    roles: ['owner', 'storekeeper', 'purchasing'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['owner', 'storekeeper', 'purchasing'],
  },
  {
    label: 'Audit Trail',
    path: '/admin/audit-trail',
    icon: ShieldCheck,
    roles: ['owner'],
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    roles: ['owner'],
  },
];

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuthStore();
  const { parts } = useInventoryStore();
  const navigate = useNavigate();

  const userRole = currentUser?.role || 'owner';
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  const lowStockCount = parts.filter(
    p => !p.is_archived && p.stock_qty <= p.min_threshold
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 bg-white border-r border-grey select-none z-30">
      {/* Brand Wordmark with small orange square (Section 1) */}
      <div className="h-16 px-6 flex items-center border-b border-grey">
        <div className="flex items-center gap-2">
          {/* Small orange square */}
          <div className="w-3 h-3 bg-orange rounded-[2px] shrink-0" />
          <div>
            <span className="font-sans font-bold text-base text-navy leading-none tracking-tight block">
              StockSense
            </span>
            <span className="text-[10px] text-dim font-medium leading-none block mt-1">
              Spare Part Inventory
            </span>
          </div>
        </div>
      </div>

      {/* Nav Items (height 40, 8px radius; active = grey #E5E5E5 fill + 4px orange left marker + navy 600 text) */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map(item => {
          const Icon = item.icon;
          const hasAlert = item.badgeKey === 'alerts' && lowStockCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center h-10 px-3 rounded-[8px] text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-grey text-navy font-semibold'
                    : 'text-dim hover:text-navy hover:bg-grey-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* 4px orange left marker */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavMarker"
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 inset-y-1.5 w-1 bg-orange rounded-r-[2px]"
                    />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className={`shrink-0 mr-3 transition-colors ${
                      isActive ? 'text-orange' : 'text-navy group-hover:text-navy'
                    }`}
                  />

                  <span className="truncate flex-1">{item.label}</span>

                  {hasAlert && (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange text-navy text-[10px] font-bold">
                      {lowStockCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-grey space-y-2">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 h-9 rounded-[8px] text-xs font-medium text-dim hover:text-navy hover:bg-grey-hover transition-colors ${
              isActive ? 'bg-grey text-navy font-semibold' : ''
            }`
          }
        >
          <Info size={16} strokeWidth={1.5} />
          <span>About System</span>
        </NavLink>

        <div className="p-2.5 rounded-[8px] bg-grey-header border border-grey flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-navy truncate">
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
            </p>
            <span className="text-[10px] uppercase font-semibold text-dim block truncate">
              {currentUser?.role === 'owner'
                ? 'Owner'
                : currentUser?.role === 'storekeeper'
                ? 'Shopkeeper'
                : currentUser?.role === 'mechanic'
                ? 'Mechanic'
                : currentUser?.role === 'purchasing'
                ? 'Supplier'
                : 'Staff'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-7 h-7 rounded-[4px] border border-grey bg-white hover:bg-grey text-navy flex items-center justify-center transition-colors"
            aria-label="Logout"
          >
            <LogOut size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};
