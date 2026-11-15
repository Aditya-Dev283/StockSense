import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1 ${containerClassName}`}>
        {label && (
          <label className="text-xs font-medium text-navy flex items-center justify-between">
            <span>{label}</span>
            {props.required && <span className="text-orange text-xs">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-dim">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-10 bg-white border border-grey rounded-[8px] text-navy placeholder:text-dim px-3 text-sm outline-none transition-colors duration-150 focus:border-navy focus:ring-1 focus:ring-navy ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${error ? 'border-black' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-dim">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-black mt-1">⚠️ {error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Backwards compatibility alias
export const NeuInput = Input;
export type NeuInputProps = InputProps;
