'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading = false, fullWidth = false, leftIcon, rightIcon, children, disabled, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'text-white hover:opacity-90',
    secondary: 'border hover:bg-opacity-80',
    ghost: 'hover:bg-opacity-10',
    danger: 'text-white hover:opacity-90',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variantStyle = {
    primary: { backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' },
    secondary: { backgroundColor: 'transparent', color: 'var(--primary)', borderColor: 'var(--primary)' },
    ghost: { backgroundColor: 'transparent', color: 'var(--text-secondary)' },
    danger: { backgroundColor: 'var(--error)' },
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={variantStyle[variant]}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
