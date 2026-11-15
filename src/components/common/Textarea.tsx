import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1 ${containerClassName}`}>
        {label && (
          <label className="text-xs font-medium text-navy flex items-center justify-between">
            <span>{label}</span>
            {props.required && <span className="text-orange text-xs">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full min-h-[96px] bg-white border border-grey rounded-[8px] text-navy placeholder:text-dim p-3 text-sm outline-none transition-colors duration-150 resize-y focus:border-navy focus:ring-1 focus:ring-navy ${
            error ? 'border-black' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-black mt-1">⚠️ {error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Backwards compatibility alias
export const NeuTextarea = Textarea;
export type NeuTextareaProps = TextareaProps;
