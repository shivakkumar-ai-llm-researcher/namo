'use client';
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, leftIcon, required, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>{leftIcon}</span>}
        <input
          ref={ref}
          {...props}
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: error ? 'var(--error)' : 'var(--border)', borderRadius: 10, ...props.style }}
          className={`w-full border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${leftIcon ? 'pl-10' : ''} ${className}`}
        />
      </div>
      {error && <span className="text-xs" style={{ color: 'var(--error)' }}>{error}</span>}
    </div>
  );
});
