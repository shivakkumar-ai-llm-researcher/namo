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
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${className}`} style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {icon && (
        <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: bgColor }}>
          <span style={{ color }}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <p className={`font-bold truncate ${compact ? 'text-base' : 'text-xl'}`} style={{ color }}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
