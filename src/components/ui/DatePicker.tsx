'use client';
import React, { useRef } from 'react';
import { CalendarDays } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  required = false,
  min,
  max,
  className = '',
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format YYYY-MM-DD -> DD/MM/YYYY
  const formatDisplay = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const displayFormatted = formatDisplay(value);

  const handleContainerClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {displayFormatted && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              {displayFormatted}
            </span>
          )}
        </div>
      )}

      <div
        onClick={handleContainerClick}
        className="relative flex items-center border rounded-xl px-3 py-2 cursor-pointer transition-all hover:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <CalendarDays size={18} className="mr-2.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
        
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required={required}
          className="w-full text-sm outline-none bg-transparent cursor-pointer font-medium"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] px-1" style={{ color: 'var(--text-tertiary)' }}>
        <span>Calendar selector (dd/mm/yyyy)</span>
        {value && !isNaN(new Date(value).getTime()) && (
          <span className="font-medium text-amber-700 dark:text-amber-400">
            {new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
