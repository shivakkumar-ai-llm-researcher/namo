'use client';
import { useState, useEffect } from 'react';
import { PiggyBank } from 'lucide-react';
import { Card, StatCard } from '@/components/ui';
import { contributionService, expenseService, functionService } from '@/services';
import { formatCurrency } from '@/utils/formatters';
import { useLanguage } from '@/context/LanguageContext';
import type { CommunityFunction } from '@/types';

export default function VisitorSavingsPage() {
  const { language, t, translateFunction } = useLanguage();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('savings.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('savings.subtitle')}
        </p>
      </div>

      <div className="rounded-2xl p-6 text-center text-white" style={{ backgroundColor: '#851D1D', border: '2px solid #F59E0B' }}>
        <PiggyBank size={40} className="mx-auto mb-2" color="#FDE68A" />
        <p className="text-sm font-semibold" style={{ color: '#FDE68A' }}>
          {t('savings.netSavings')}
        </p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(totalSavings)}</p>
      </div>

      <div className="space-y-4">
        {fns.map((fn) => {
          const s = savings[fn.id] || { contributions: 0, expenses: 0, balance: 0 };
          return (
            <Card key={fn.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {translateFunction(fn.name)}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {fn.type === 'ANNUAL' ? t('savings.purattasiYearly') : t('savings.gokulFourYear')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t('savings.netBalance')}
                  </p>
                  <p className="text-lg font-bold" style={{ color: s.balance >= 0 ? 'var(--savings)' : 'var(--expense)' }}>
                    {formatCurrency(s.balance)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard title={t('savings.income')} amount={s.contributions} color="var(--income)" bgColor="var(--income-light)" compact />
                <StatCard title={t('savings.expenses')} amount={s.expenses} color="var(--expense)" bgColor="var(--expense-light)" compact />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
