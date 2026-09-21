'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, ArrowRight } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';
import { expenseService } from '@/services';
import { formatCurrency, formatDate, formatExpenseCategory, getCategoryEmoji } from '@/utils/formatters';
import type { Expense } from '@/types';

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseService.getAll({ search, limit: 500 });
      setItems(res.data);
      setTotalAmount(res.data.reduce((s, e) => s + Number(e.amount), 0));
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
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Expenses</h1>
          <p className="text-sm font-semibold" style={{ color: 'var(--expense)' }}>
            Total Spent: {formatCurrency(totalAmount)}
          </p>
        </div>
        <Link
          href="/admin/expenses/add"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)', border: '1px solid #F59E0B' }}
        >
          <Plus size={16} /> Add Expense
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses by description..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--expense)' }} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="📉"
          title="No expenses found"
          subtitle={search ? 'No match found' : 'Record your first community expense'}
          action={
            <Link
              href="/admin/expenses/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white mt-3"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus size={16} /> Add Expense
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/expenses/${item.id}`}
              className="block rounded-2xl border p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all space-y-2.5 group"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Header: Description & Amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--expense-light)' }}
                  >
                    {getCategoryEmoji(item.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm sm:text-base leading-snug group-hover:text-amber-700 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-sm sm:text-base font-black px-2.5 py-1 rounded-xl"
                    style={{ color: 'var(--expense)', backgroundColor: 'var(--expense-light)' }}
                  >
                    -{formatCurrency(item.amount)}
                  </span>
                  <ArrowRight size={15} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Badges / Metadata Tags (Full text visible, cleanly wrapped) */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 font-medium text-[11px]">
                  📅 {formatDate(item.expense_date)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 font-bold text-[11px] border border-rose-200/60 dark:border-rose-800/60">
                  🏷️ {formatExpenseCategory(item.category)}
                </span>
                {item.function?.name && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold text-[11px] border border-amber-200/50 dark:border-amber-800/50">
                    🛕 {item.function.name}
                  </span>
                )}
                {item.payment_method && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 font-medium text-[11px]">
                    💳 {item.payment_method.toUpperCase()}
                  </span>
                )}
                {item.reference_number && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                    Ref: {item.reference_number}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
