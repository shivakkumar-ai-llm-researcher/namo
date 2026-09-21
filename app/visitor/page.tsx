'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Scale, Users, ArrowRight, Wallet } from 'lucide-react';
import { StatCard, Card, Badge } from '@/components/ui';
import { contributionService, expenseService, functionService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useLanguage } from '@/context/LanguageContext';
import type { Contribution, Expense, CommunityFunction, FunctionType } from '@/types';

type FnSummary = { contributions: number; expenses: number; balance: number; contributors: number };

export default function VisitorDashboard() {
  const { language, t, formatMethod, translateMember, translateFunction } = useLanguage();
  const [allContributions, setAllContributions] = useState<Contribution[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [annualFn, setAnnualFn] = useState<CommunityFunction | null>(null);
  const [fourYearFn, setFourYearFn] = useState<CommunityFunction | null>(null);
  const [annualSummary, setAnnualSummary] = useState<FnSummary>({ contributions: 0, expenses: 0, balance: 0, contributors: 0 });
  const [fourYearSummary, setFourYearSummary] = useState<FnSummary>({ contributions: 0, expenses: 0, balance: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | FunctionType>('all');
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveCard((p) => (p === 0 ? 1 : 0)), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [fns, csRes, esRes] = await Promise.all([
          functionService.getAll(),
          contributionService.getAll({ limit: 1000 }),
          expenseService.getAll({ limit: 1000 }),
        ]);
        const aFn = fns.find((f) => f.type === 'ANNUAL') || null;
        const fyFn = fns.find((f) => f.type === 'FOUR_YEAR') || null;
        setAnnualFn(aFn);
        setFourYearFn(fyFn);
        setAllContributions(csRes.data);
        setAllExpenses(esRes.data);

        const aC = csRes.data.filter((c) => aFn && c.function_id === aFn.id);
        const aE = esRes.data.filter((e) => aFn && e.function_id === aFn.id);
        const aTc = aC.reduce((s, c) => s + Number(c.amount), 0);
        const aTe = aE.reduce((s, e) => s + Number(e.amount), 0);
        setAnnualSummary({
          contributions: aTc,
          expenses: aTe,
          balance: aTc - aTe,
          contributors: new Set(aC.map((c) => c.member_id)).size,
        });

        const fyC = csRes.data.filter((c) => fyFn && c.function_id === fyFn.id);
        const fyE = esRes.data.filter((e) => fyFn && e.function_id === fyFn.id);
        const fyTc = fyC.reduce((s, c) => s + Number(c.amount), 0);
        const fyTe = fyE.reduce((s, e) => s + Number(e.amount), 0);
        setFourYearSummary({
          contributions: fyTc,
          expenses: fyTe,
          balance: fyTc - fyTe,
          contributors: new Set(fyC.map((c) => c.member_id)).size,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const cs = selectedType === 'all' ? allContributions : allContributions.filter((c) => c.function?.type === selectedType);
    const es = selectedType === 'all' ? allExpenses : allExpenses.filter((e) => e.function?.type === selectedType);
    const tc = cs.reduce((s, c) => s + Number(c.amount), 0);
    const te = es.reduce((s, e) => s + Number(e.amount), 0);
    return {
      contributions: cs,
      expenses: es,
      totalContributions: tc,
      totalExpenses: te,
      balance: tc - te,
      contributorCount: new Set(cs.map((c) => c.member_id)).size,
    };
  }, [allContributions, allExpenses, selectedType]);

  const recentContributions = filtered.contributions.slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Festival Hero Cards Carousel */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCard(0)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeCard === 0 ? 'text-white border-yellow-500' : 'border-transparent'}`}
            style={activeCard === 0 ? { backgroundColor: '#851D1D' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--surface)' }}
          >
            {t('dashboard.purattasiSani')}
          </button>
          <button
            onClick={() => setActiveCard(1)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeCard === 1 ? 'text-white border-emerald-400' : 'border-transparent'}`}
            style={activeCard === 1 ? { backgroundColor: '#064E3B' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--surface)' }}
          >
            {t('dashboard.gokulaashdami')}
          </button>
        </div>

        {activeCard === 0 ? (
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ backgroundColor: '#851D1D', border: '2px solid #F59E0B' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2" style={{ backgroundColor: '#F59E0B', color: '#451A03' }}>
              {t('dashboard.yearlyFestival')}
            </span>
            <h3 className="text-lg font-bold">{t('dashboard.purattasiTitle')}</h3>
            <p className="text-xs mb-3" style={{ color: '#FDE68A' }}>
              {t('dashboard.purattasiSubLabel')} • {translateFunction(annualFn?.name)}
            </p>
            <div className="bg-black/30 rounded-lg p-3 mb-3 border-l-4 border-yellow-400">
              <p className="text-xs font-bold">{t('dashboard.purattasiEventNotice')}</p>
              <p className="text-[10px] mt-1" style={{ color: '#FDE68A' }}>
                {t('dashboard.purattasiHighlights')}
              </p>
            </div>
            <div className="flex justify-around bg-black/25 rounded-lg py-2">
              <div className="text-center">
                <div className="text-[10px] opacity-75">{t('dashboard.income')}</div>
                <div className="text-xs font-bold" style={{ color: '#BBF7D0' }}>+{formatCurrency(annualSummary.contributions)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">{t('dashboard.expenses')}</div>
                <div className="text-xs font-bold" style={{ color: '#FECDD3' }}>-{formatCurrency(annualSummary.expenses)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">{t('dashboard.savings')}</div>
                <div className="text-xs font-bold" style={{ color: '#FDE68A' }}>{formatCurrency(annualSummary.balance)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ backgroundColor: '#064E3B', border: '2px solid #10B981' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400" />
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
              {t('dashboard.fourYearFestival')}
            </span>
            <h3 className="text-lg font-bold">{t('dashboard.gokulTitle')}</h3>
            <p className="text-xs mb-3" style={{ color: '#A7F3D0' }}>
              {t('dashboard.gokulSubLabel')} • {translateFunction(fourYearFn?.name)}
            </p>
            <div className="bg-black/30 rounded-lg p-3 mb-3 border-l-4 border-emerald-400">
              <p className="text-xs font-bold">{t('dashboard.gokulEventNotice')}</p>
              <p className="text-[10px] mt-1" style={{ color: '#A7F3D0' }}>
                {t('dashboard.gokulHighlights')}
              </p>
            </div>
            <div className="flex justify-around bg-black/25 rounded-lg py-2">
              <div className="text-center">
                <div className="text-[10px] opacity-75">{t('dashboard.totalFund')}</div>
                <div className="text-xs font-bold" style={{ color: '#A7F3D0' }}>+{formatCurrency(fourYearSummary.contributions)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">{t('dashboard.expenses')}</div>
                <div className="text-xs font-bold" style={{ color: '#FECDD3' }}>-{formatCurrency(fourYearSummary.expenses)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">{t('dashboard.fourYrSavings')}</div>
                <div className="text-xs font-bold" style={{ color: '#FDE68A' }}>{formatCurrency(fourYearSummary.balance)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter header */}
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t('dashboard.overview')}</h2>
        <div className="flex gap-2 mb-4">
          {(['all', 'ANNUAL', 'FOUR_YEAR'] as const).map((fnKey) => (
            <button
              key={fnKey}
              onClick={() => setSelectedType(fnKey)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={
                selectedType === fnKey
                  ? { backgroundColor: 'var(--primary)', color: '#fff', borderColor: '#F59E0B' }
                  : { backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
              }
            >
              {fnKey === 'all'
                ? t('dashboard.allFunctions')
                : fnKey === 'ANNUAL'
                ? t('dashboard.purattasiSani')
                : t('dashboard.gokulaashdami')}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <StatCard title={t('dashboard.totalContributions')} amount={filtered.totalContributions} color="var(--income)" bgColor="var(--income-light)" icon={<TrendingUp size={16} />} compact />
        <StatCard title={t('dashboard.totalExpenses')} amount={filtered.totalExpenses} color="var(--expense)" bgColor="var(--expense-light)" icon={<TrendingDown size={16} />} compact />
        <StatCard title={t('dashboard.srivariSavings')} amount={Math.max(0, filtered.balance)} color="var(--savings)" bgColor="var(--savings-light)" compact />
        <StatCard title={t('dashboard.balance')} amount={filtered.balance} color="var(--balance)" bgColor="var(--balance-light)" icon={<Scale size={16} />} compact />
      </div>

      {/* Community Services Quick Links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.communityServices')}
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          {[
            { href: '/visitor/members', icon: '👥', label: language === 'ta' ? 'உறுப்பினர்' : 'Members', bg: '#EFF6FF' },
            { href: '/visitor/contributions', icon: '📈', label: language === 'ta' ? 'வருமானம்' : 'Income', bg: '#F0FDF4' },
            { href: '/visitor/expenses', icon: '📉', label: language === 'ta' ? 'செலவுகள்' : 'Expenses', bg: '#FEF2F2' },
            { href: '/visitor/savings', icon: '💰', label: language === 'ta' ? 'சேமிப்பு' : 'Savings', bg: '#F5F3FF' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-1 p-1.5 sm:p-3 rounded-xl border text-center hover:shadow-md transition-shadow overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg shrink-0" style={{ backgroundColor: a.bg }}>
                {a.icon}
              </div>
              <span className="text-[9px] sm:text-[11px] font-bold leading-tight line-clamp-2 w-full text-center break-words" style={{ color: 'var(--text-primary)' }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Contributions Section - Individual Card Cells */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.recentContributions')}
          </h3>
          <Link href="/visitor/contributions" className="text-xs sm:text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
            {t('common.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        {recentContributions.length === 0 ? (
          <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.noContributions')}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentContributions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all space-y-2"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                {/* Top Row: Devotee & Amount */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--income-light)' }}>
                      <TrendingUp size={15} style={{ color: 'var(--income)' }} />
                    </div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {translateMember(item.member?.full_name)}
                    </p>
                  </div>
                  <span className="text-sm sm:text-base font-extrabold px-2.5 py-0.5 rounded-lg shrink-0" style={{ color: 'var(--income)', backgroundColor: 'var(--income-light)' }}>
                    +{formatCurrency(item.amount)}
                  </span>
                </div>

                {/* Bottom Row: Badges (Full text visible, no truncation) */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 font-medium">
                    📅 {formatDate(item.payment_date)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold border border-amber-200/50 dark:border-amber-800/50">
                    💳 {formatMethod(item.payment_method)}
                  </span>
                  {item.function?.name && (
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 font-medium">
                      🛕 {translateFunction(item.function.name)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
