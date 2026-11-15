import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  let styleClasses = '';

  if (variant === 'primary') {
    // Primary button: height 40, padding 0 16, fill #FCA311, text navy 14/600, radius 8. Hover: fill #E8950F
    styleClasses = 'h-10 px-4 bg-orange text-navy font-semibold text-sm rounded-[8px] hover:bg-orange-hover active:bg-orange-active';
  } else if (variant === 'secondary') {
    // Secondary button: height 40, white fill, 1px navy border, navy text. Hover: fill #E5E5E5
    styleClasses = 'h-10 px-4 bg-white border border-navy text-navy font-semibold text-sm rounded-[8px] hover:bg-grey active:bg-grey/80';
  } else if (variant === 'danger' || variant === 'dark') {
    // Danger/destructive button: height 40, fill #000000, white text
    styleClasses = 'h-10 px-4 bg-black text-white font-semibold text-sm rounded-[8px] hover:bg-navy active:bg-navy/90';
  } else if (variant === 'icon') {
    // Icon button: 40x40, white fill, 1px #E5E5E5 border, radius 8, 20px icon
    styleClasses = 'w-10 h-10 min-w-[40px] bg-white border border-grey text-navy rounded-[8px] hover:bg-grey flex items-center justify-center p-0';
  }

  // Adjust for sm/lg sizes if specifically provided
  if (size === 'sm' && variant !== 'icon') {
    styleClasses = styleClasses.replace('h-10 px-4 text-sm', 'h-8 px-3 text-xs');
  } else if (size === 'sm' && variant === 'icon') {
    styleClasses = styleClasses.replace('w-10 h-10', 'w-8 h-8 min-w-[32px]');
  } else if (size === 'lg' && variant !== 'icon') {
    styleClasses = styleClasses.replace('h-10 px-4 text-sm', 'h-12 px-6 text-base');
  }

  const disabledClass = disabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer transition-colors duration-150';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 select-none outline-none font-sans ${styleClasses} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// Backwards compatibility alias
export const NeuButton = Button;
