interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gold';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  const styles = {
    default: { backgroundColor: 'var(--surface-variant)', color: 'var(--text-secondary)' },
    primary: { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' },
    success: { backgroundColor: 'var(--success-light)', color: 'var(--success)' },
    warning: { backgroundColor: 'var(--warning-light)', color: 'var(--savings)' },
    error: { backgroundColor: 'var(--error-light)', color: 'var(--error)' },
    info: { backgroundColor: '#F0F9FF', color: '#0369A1' },
    gold: { backgroundColor: '#FEF3C7', color: '#B45309' },
  };
  const sizes = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' };
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizes[size]}`} style={styles[variant]}>
      {label}
    </span>
  );
}
