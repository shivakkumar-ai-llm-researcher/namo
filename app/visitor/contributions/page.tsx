'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';
import { contributionService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Contribution } from '@/types';

export default function VisitorContributionsPage() {
  const [items, setItems] = useState<Contribution[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contributionService.getAll({ limit: 500 });
      const filtered = search
        ? res.data.filter((c) =>
            c.member?.full_name?.toLowerCase().includes(search.toLowerCase())
          )
        : res.data;
      setItems(filtered);
      setTotalAmount(res.data.reduce((s, c) => s + Number(c.amount), 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Contributions</h1>
        <p className="text-sm font-semibold" style={{ color: 'var(--income)' }}>
          Total Community Seva: {formatCurrency(totalAmount)}
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by member name..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--income)' }} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="📈" title="No contributions found" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all space-y-2.5"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Header: Member Name & Amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--income-light)' }}
                  >
                    <TrendingUp size={16} style={{ color: 'var(--income)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm sm:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {item.member?.full_name || 'Devotee Member'}
                    </p>
                    {item.member?.member_id && (
                      <p className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        ID: {item.member.member_id}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className="text-sm sm:text-base font-black px-2.5 py-1 rounded-xl shrink-0"
                  style={{ color: 'var(--income)', backgroundColor: 'var(--income-light)' }}
                >
                  +{formatCurrency(item.amount)}
                </span>
              </div>

              {/* Badges / Metadata Tags (Full text visible, cleanly wrapped) */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 font-medium text-[11px]">
                  📅 {formatDate(item.payment_date)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/60 dark:border-emerald-800/60">
                  💳 {item.payment_method.toUpperCase()}
                </span>
                {item.function?.name && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold text-[11px] border border-amber-200/50 dark:border-amber-800/50">
                    🛕 {item.function.name}
                  </span>
                )}
                {item.reference_number && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                    Ref: {item.reference_number}
                  </span>
                )}
              </div>

              {/* Optional Notes */}
              {item.notes && (
                <p className="text-xs text-stone-500 dark:text-stone-400 italic pt-0.5">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
