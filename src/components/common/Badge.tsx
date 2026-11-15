import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

export interface BadgeProps {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  className = '',
  size = 'md',
}) => {
  const iconSize = 14;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-medium';

  if (status === 'IN_STOCK') {
    // In Stock: pill, 1px navy border, navy text, check icon 14px
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-navy text-navy bg-white ${paddingClass} ${className}`}
      >
        <Check size={iconSize} strokeWidth={2} className="text-navy" />
        <span>{label || 'In Stock'}</span>
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    // Low Stock: pill, orange fill, navy text, alert-triangle icon 14px
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-orange text-navy font-semibold ${paddingClass} ${className}`}
      >
        <AlertTriangle size={iconSize} strokeWidth={2} className="text-navy" />
        <span>{label || 'Low Stock'}</span>
      </span>
    );
  }

  // Out of Stock: pill, black fill, white text, x icon 14px
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-black text-white font-medium ${paddingClass} ${className}`}
    >
      <X size={iconSize} strokeWidth={2} className="text-white" />
      <span>{label || 'Out of Stock'}</span>
    </span>
  );
};

// Backwards compatibility alias
export const StatusBadge = Badge;
export type StatusBadgeProps = BadgeProps;
