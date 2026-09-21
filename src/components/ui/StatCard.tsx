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
      className={`rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-1.5 sm:gap-2 shadow-xs transition-shadow hover:shadow-md ${className}`}
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <p className="text-[11px] sm:text-xs font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </p>
        {icon && (
          <div className="rounded-lg p-1.5 sm:p-2 shrink-0" style={{ backgroundColor: bgColor }}>
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`font-black tracking-tight ${
            compact
              ? 'text-sm xs:text-[15px] sm:text-base lg:text-lg'
              : 'text-base sm:text-xl lg:text-2xl'
          }`}
          style={{ color }}
        >
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}

