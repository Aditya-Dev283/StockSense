import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ label: string; value: string | number; disabled?: boolean }>;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1 ${containerClassName}`}>
        {label && (
          <label className="text-xs font-medium text-navy flex items-center justify-between">
            <span>{label}</span>
            {props.required && <span className="text-orange text-xs">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full h-10 bg-white border border-grey rounded-[8px] text-navy px-3 pr-8 text-sm outline-none transition-colors duration-150 appearance-none cursor-pointer focus:border-navy focus:ring-1 focus:ring-navy ${
              error ? 'border-black' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dim">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-black mt-1">⚠️ {error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Backwards compatibility alias
export const NeuSelect = Select;
export type NeuSelectProps = SelectProps;
