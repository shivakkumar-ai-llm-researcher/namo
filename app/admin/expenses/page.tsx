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
        <Card padding="none">
          {items.map((item, idx) => (
            <Link
              key={item.id}
              href={`/admin/expenses/${item.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors"
              style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: 'var(--expense-light)' }}
              >
                {getCategoryEmoji(item.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.description}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDate(item.expense_date)} • {formatExpenseCategory(item.category)}
                  {item.function?.name ? ` • ${item.function.name}` : ''}
                </p>
              </div>
              <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--expense)' }}>
                -{formatCurrency(item.amount)}
              </span>
              <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
