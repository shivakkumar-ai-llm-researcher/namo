import { ReactNode } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  color: string;
  bgColor: string;
  icon?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function StatCard({ title, amount, color, bgColor, icon, compact = false, className = '' }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2 shadow-xs transition-shadow hover:shadow-md min-w-0 ${className}`}
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Title row with optional icon */}
      <div className="flex items-start justify-between gap-1">
        <p className="text-[10px] sm:text-xs font-semibold leading-snug line-clamp-2 flex-1 min-w-0 break-words" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </p>
        {icon && (
          <div className="rounded-lg p-1 sm:p-1.5 shrink-0 ml-1" style={{ backgroundColor: bgColor }}>
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      {/* Amount — scales down on very narrow mobile */}
      <div className="min-w-0">
        <p
          className={`font-black tracking-tight break-all leading-tight ${
            compact
              ? 'text-[12px] xs:text-sm sm:text-base lg:text-lg'
              : 'text-sm sm:text-xl lg:text-2xl'
          }`}
          style={{ color }}
        >
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}

