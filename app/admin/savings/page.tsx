'use client';
import { useState, useEffect } from 'react';
import { PiggyBank } from 'lucide-react';
import { Card, StatCard } from '@/components/ui';
import { contributionService, expenseService, functionService } from '@/services';
import { formatCurrency } from '@/utils/formatters';
import type { CommunityFunction } from '@/types';

export default function SavingsPage() {
  const [fns, setFns] = useState<CommunityFunction[]>([]);
  const [savings, setSavings] = useState<Record<string, { contributions: number; expenses: number; balance: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [fnList, csRes, esRes] = await Promise.all([
          functionService.getAll(),
          contributionService.getAll({ limit: 1000 }),
          expenseService.getAll({ limit: 1000 }),
        ]);
        setFns(fnList);
        const s: Record<string, { contributions: number; expenses: number; balance: number }> = {};
        fnList.forEach((fn) => {
          const c = csRes.data
            .filter((item) => item.function_id === fn.id)
            .reduce((sum, item) => sum + Number(item.amount), 0);
          const e = esRes.data
            .filter((item) => item.function_id === fn.id)
            .reduce((sum, item) => sum + Number(item.amount), 0);
          s[fn.id] = { contributions: c, expenses: e, balance: c - e };
        });
        setSavings(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSavings = Object.values(savings).reduce((sum, v) => sum + v.balance, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--savings)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Srivari Savings</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Community Fund Balance Overview • சேமிப்பு மேலோட்டம்</p>
      </div>

      <div className="rounded-2xl p-6 text-center text-white" style={{ backgroundColor: '#851D1D', border: '2px solid #F59E0B' }}>
        <PiggyBank size={40} className="mx-auto mb-2" color="#FDE68A" />
        <p className="text-sm font-semibold" style={{ color: '#FDE68A' }}>Total Community Net Savings</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(totalSavings)}</p>
      </div>

      <div className="space-y-4">
        {fns.map((fn) => {
          const s = savings[fn.id] || { contributions: 0, expenses: 0, balance: 0 };
          return (
            <Card key={fn.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{fn.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {fn.type === 'ANNUAL' ? 'Purattasi Sani Kiyamai (Yearly)' : 'Gokulaashdami (4-Year)'} • {fn.start_year}{fn.end_year ? `-${fn.end_year}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Net Balance</p>
                  <p className="text-lg font-bold" style={{ color: s.balance >= 0 ? 'var(--savings)' : 'var(--expense)' }}>
                    {formatCurrency(s.balance)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard title="Income" amount={s.contributions} color="var(--income)" bgColor="var(--income-light)" compact />
                <StatCard title="Expenses" amount={s.expenses} color="var(--expense)" bgColor="var(--expense-light)" compact />
              </div>
              {s.contributions > 0 && (
                <div className="mt-4">
                  <div className="h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.round((s.expenses / s.contributions) * 100))}%`,
                        backgroundColor: 'var(--expense)',
                      }}
                    />
                    <div style={{ flex: 1, backgroundColor: 'var(--income)' }} />
                  </div>
                  <div className="flex justify-between mt-1 text-xs font-medium">
                    <span style={{ color: 'var(--expense)' }}>
                      Spent: {Math.round((s.expenses / s.contributions) * 100)}%
                    </span>
                    <span style={{ color: 'var(--income)' }}>
                      Saved: {Math.max(0, 100 - Math.round((s.expenses / s.contributions) * 100))}%
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
