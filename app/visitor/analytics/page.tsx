'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui';
import { contributionService, expenseService } from '@/services';
import { formatCurrency, formatExpenseCategory } from '@/utils/formatters';
import type { ExpenseCategory } from '@/types';

const COLORS = ['#851D1D', '#D97706', '#15803D', '#0369A1', '#7C3AED', '#DC2626', '#B45309', '#064E3B', '#1D4ED8', '#9A3412'];

export default function VisitorAnalyticsPage() {
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; income: number; expense: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [csRes, esRes] = await Promise.all([
          contributionService.getAll({ limit: 1000 }),
          expenseService.getAll({ limit: 1000 }),
        ]);
        const mMap: Record<string, { income: number; expense: number }> = {};
        csRes.data.forEach((c) => {
          const m = c.payment_date.slice(0, 7);
          if (!mMap[m]) mMap[m] = { income: 0, expense: 0 };
          mMap[m].income += Number(c.amount);
        });
        esRes.data.forEach((e) => {
          const m = e.expense_date.slice(0, 7);
          if (!mMap[m]) mMap[m] = { income: 0, expense: 0 };
          mMap[m].expense += Number(e.amount);
        });
        const monthly = Object.entries(mMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12)
          .map(([month, v]) => ({ month, ...v }));
        setMonthlyData(monthly);

        const catMap: Partial<Record<ExpenseCategory, number>> = {};
        esRes.data.forEach((e) => {
          catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
        });
        setCategoryData(
          Object.entries(catMap)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({
              name: formatExpenseCategory(name as ExpenseCategory),
              value,
            }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Community Financial Trends • நிதி பகுப்பாய்வு</p>
      </div>

      <Card>
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Income vs Expenses</h3>
        {monthlyData.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No transactions recorded yet</p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B4E38' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B4E38' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), '']}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: 10 }}
                />
                <Bar dataKey="income" fill="#15803D" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#DC2626" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {categoryData.length > 0 && (
        <Card>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Expense Categories</h3>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${(((percent ?? 0)) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex justify-between items-center text-sm py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                  </div>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
