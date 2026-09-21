import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  children: ReactNode;
}

export function Card({ variant = 'default', padding = 'md', children, className = '', ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  const variants = {
    default: 'shadow-sm',
    outlined: 'border',
    elevated: 'shadow-md',
  };
  return (
    <div
      {...props}
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 12, ...props.style }}
      className={`${variants[variant]} ${paddings[padding]} ${variant === 'outlined' ? 'border' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
