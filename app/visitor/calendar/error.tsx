'use client';
import { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Calendar error boundary caught:', error);
  }, [error]);

  return (
    <div className="rounded-2xl border p-8 text-center max-w-lg mx-auto my-12" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-100 dark:bg-red-950 text-red-600">
        <AlertTriangle size={24} />
      </div>
      <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Unable to Display Calendar
      </h2>
      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
        {error?.message || 'An unexpected error occurred while loading the sacred calendar.'}
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
        style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
      >
        <RefreshCw size={14} /> Reload Calendar
      </button>
    </div>
  );
}
