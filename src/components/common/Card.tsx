import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-grey rounded-[8px] p-6 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-grey">
          <div>
            {title && <h3 className="font-sans font-semibold text-navy text-base leading-6">{title}</h3>}
            {subtitle && <p className="text-dim text-xs leading-4 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center space-x-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// Backwards compatibility alias
export const NeuCard = Card;
