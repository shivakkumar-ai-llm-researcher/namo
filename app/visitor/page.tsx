'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Scale, Users, ArrowRight, Wallet } from 'lucide-react';
import { StatCard, Card, Badge } from '@/components/ui';
import { contributionService, expenseService, functionService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Contribution, Expense, CommunityFunction, FunctionType } from '@/types';

type FnSummary = { contributions: number; expenses: number; balance: number; contributors: number };

export default function VisitorDashboard() {
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
            Purattasi Sani
          </button>
          <button
            onClick={() => setActiveCard(1)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeCard === 1 ? 'text-white border-emerald-400' : 'border-transparent'}`}
            style={activeCard === 1 ? { backgroundColor: '#064E3B' } : { color: 'var(--text-secondary)', backgroundColor: 'var(--surface)' }}
          >
            Gokulaashdami
          </button>
        </div>

        {activeCard === 0 ? (
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ backgroundColor: '#851D1D', border: '2px solid #F59E0B' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2" style={{ backgroundColor: '#F59E0B', color: '#451A03' }}>
              YEARLY FESTIVAL • புரட்டாசி
            </span>
            <h3 className="text-lg font-bold">Purattasi Sani Kiyamai</h3>
            <p className="text-xs mb-3" style={{ color: '#FDE68A' }}>
              புரட்டாசி சனிக்கிழமை • {annualFn?.name || 'Annual Function'}
            </p>
            <div className="bg-black/30 rounded-lg p-3 mb-3 border-l-4 border-yellow-400">
              <p className="text-xs font-bold">⭐ 2nd Saturday of Purattasi (Annual Function)</p>
              <p className="text-[10px] mt-1" style={{ color: '#FDE68A' }}>
                Balaji Thirumanjanam • Maavilakku Deepam • Annadhanam
              </p>
            </div>
            <div className="flex justify-around bg-black/25 rounded-lg py-2">
              <div className="text-center">
                <div className="text-[10px] opacity-75">Income</div>
                <div className="text-xs font-bold" style={{ color: '#BBF7D0' }}>+{formatCurrency(annualSummary.contributions)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">Expenses</div>
                <div className="text-xs font-bold" style={{ color: '#FECDD3' }}>-{formatCurrency(annualSummary.expenses)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">Savings</div>
                <div className="text-xs font-bold" style={{ color: '#FDE68A' }}>{formatCurrency(annualSummary.balance)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ backgroundColor: '#064E3B', border: '2px solid #10B981' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400" />
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
              4-YEAR FESTIVAL • 4 வருட விழா
            </span>
            <h3 className="text-lg font-bold">Gokulaashdami Festival</h3>
            <p className="text-xs mb-3" style={{ color: '#A7F3D0' }}>
              கோகுலாஷ்டமி 4 வருட பெருவிழா • {fourYearFn?.name || '2026-2029'}
            </p>
            <div className="bg-black/30 rounded-lg p-3 mb-3 border-l-4 border-emerald-400">
              <p className="text-xs font-bold">✨ Celebrated 2025 ✓ • Next in 2029</p>
              <p className="text-[10px] mt-1" style={{ color: '#A7F3D0' }}>
                Sri Krishna Janmashtami • Uriyadi • Maha Prasad
              </p>
            </div>
            <div className="flex justify-around bg-black/25 rounded-lg py-2">
              <div className="text-center">
                <div className="text-[10px] opacity-75">Total Fund</div>
                <div className="text-xs font-bold" style={{ color: '#A7F3D0' }}>+{formatCurrency(fourYearSummary.contributions)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">Expenses</div>
                <div className="text-xs font-bold" style={{ color: '#FECDD3' }}>-{formatCurrency(fourYearSummary.expenses)}</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] opacity-75">4-Yr Savings</div>
                <div className="text-xs font-bold" style={{ color: '#FDE68A' }}>{formatCurrency(fourYearSummary.balance)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter header */}
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Overview</h2>
        <div className="flex gap-2 mb-4">
          {(['all', 'ANNUAL', 'FOUR_YEAR'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={
                selectedType === t
                  ? { backgroundColor: 'var(--primary)', color: '#fff', borderColor: '#F59E0B' }
                  : { backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
              }
            >
              {t === 'all' ? 'All Functions' : t === 'ANNUAL' ? 'Purattasi Sani' : 'Gokulaashdami'}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total Contributions" amount={filtered.totalContributions} color="var(--income)" bgColor="var(--income-light)" icon={<TrendingUp size={18} />} compact />
        <StatCard title="Total Expenses" amount={filtered.totalExpenses} color="var(--expense)" bgColor="var(--expense-light)" icon={<TrendingDown size={18} />} compact />
        <StatCard title="Srivari Savings" amount={Math.max(0, filtered.balance)} color="var(--savings)" bgColor="var(--savings-light)" compact />
        <StatCard title="Balance" amount={filtered.balance} color="var(--balance)" bgColor="var(--balance-light)" icon={<Scale size={18} />} compact />
      </div>

      {/* Community Services Quick Links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          Community Services • விரைவு சேவைகள்
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: '/visitor/members', icon: '👥', label: 'Members', tamil: 'உறுப்பினர்கள்', bg: '#EFF6FF' },
            { href: '/visitor/contributions', icon: '📈', label: 'Income', tamil: 'வருமானம்', bg: '#F0FDF4' },
            { href: '/visitor/expenses', icon: '📉', label: 'Expenses', tamil: 'செலவுகள்', bg: '#FEF2F2' },
            { href: '/visitor/savings', icon: '💰', label: 'Savings', tamil: 'சேமிப்பு', bg: '#F5F3FF' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center hover:shadow-md transition-shadow"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: a.bg }}>
                {a.icon}
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{a.label}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{a.tamil}</span>
            </Link>
          ))}
        </div>
      </div>
      {/* Recent Contributions list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recent Contributions</h3>
          <Link href="/visitor/contributions" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <Card padding="none">
          {recentContributions.length === 0 ? (
            <p className="p-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>No contributions match</p>
          ) : (
            recentContributions.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: idx < recentContributions.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--income-light)' }}>
                    <TrendingUp size={16} style={{ color: 'var(--income)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.member?.full_name || 'Member'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(item.payment_date)} • {item.payment_method.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--income)' }}>+{formatCurrency(item.amount)}</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
