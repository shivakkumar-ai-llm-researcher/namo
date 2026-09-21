'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';
import { expenseService } from '@/services';
import { formatCurrency, formatDate, formatExpenseCategory, getCategoryEmoji } from '@/utils/formatters';
import type { Expense } from '@/types';

export default function VisitorExpensesPage() {
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Expenses</h1>
        <p className="text-sm font-semibold" style={{ color: 'var(--expense)' }}>
          Total Community Expenditure: {formatCurrency(totalAmount)}
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--expense)' }} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="📉" title="No expenses found" />
      ) : (
        <Card padding="none">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: 'var(--expense-light)' }}
              >
                {getCategoryEmoji(item.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.description}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {formatDate(item.expense_date)} • {formatExpenseCategory(item.category)}
                  {item.function?.name ? ` • ${item.function.name}` : ''}
                </p>
              </div>
              <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--expense)' }}>
                -{formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
