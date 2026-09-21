'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PiggyBank, Plus, TrendingUp, X, Check } from 'lucide-react';
import { Card, StatCard, EmptyState } from '@/components/ui';
import { contributionService, expenseService, functionService, memberService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { CommunityFunction, Member, PaymentMethod, Contribution } from '@/types';

export default function SavingsPage() {
  const [fns, setFns] = useState<CommunityFunction[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [savings, setSavings] = useState<Record<string, { contributions: number; expenses: number; balance: number }>>({});
  const [loading, setLoading] = useState(true);

  // Quick Add Contribution Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Form State
  const [memberName, setMemberName] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [functionId, setFunctionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [fnList, csRes, esRes, mRes] = await Promise.all([
        functionService.getAll(),
        contributionService.getAll({ limit: 1000 }),
        expenseService.getAll({ limit: 1000 }),
        memberService.getAll('', 1, 200),
      ]);
      setFns(fnList);
      setContributions(csRes.data);
      setMembers(mRes.data);

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

      if (fnList.length > 0 && !functionId) {
        setFunctionId(fnList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [functionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalSavings = Object.values(savings).reduce((sum, v) => sum + v.balance, 0);

  // Handle Quick Add Submission
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    const finalName = memberName.trim();
    if (!selectedMemberId && !finalName) {
      setFormError('Please enter a devotee / member name');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      let targetMemberId = selectedMemberId;

      // If user typed a new name and did not select an existing member, create or link member
      if (!targetMemberId && finalName) {
        const existing = members.find(
          (m) => m.full_name.toLowerCase() === finalName.toLowerCase()
        );
        if (existing) {
          targetMemberId = existing.id;
        } else {
          try {
            const newMem = await memberService.create({
              member_id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
              full_name: finalName,
              status: 'active',
              role: 'visitor',
            });
            targetMemberId = newMem.id;
          } catch {
            targetMemberId = 'mem_' + Date.now();
          }
        }
      }

      // Default to first function if not selected
      const targetFnId = functionId || (fns[0]?.id ?? 'default_fn');

      await contributionService.create({
        member_id: targetMemberId,
        function_id: targetFnId,
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(true);
      setTimeout(async () => {
        setShowAddModal(false);
        setSubmitSuccess(false);
        setAmount('');
        setMemberName('');
        setSelectedMemberId('');
        setNotes('');
        await loadData();
      }, 800);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add amount. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div
          className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--savings)' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header with Add Amount & Name Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Srivari Savings
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Community Fund Balance Overview • சேமிப்பு மேலோட்டம்
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all duration-150 hover:brightness-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: '#851D1D',
              border: '2px solid #F59E0B',
            }}
          >
            <Plus size={18} className="text-amber-300" />
            <span>Add Amount & Name</span>
            <span className="text-xs text-amber-200 opacity-90">(வருமானம் சேர்க்க)</span>
          </button>
        </div>
      </div>

      {/* Main Big Savings Card */}
      <div
        className="rounded-2xl p-6 text-center text-white shadow-md relative overflow-hidden"
        style={{ backgroundColor: '#851D1D', border: '2px solid #F59E0B' }}
      >
        <PiggyBank size={42} className="mx-auto mb-2" color="#FDE68A" />
        <p className="text-sm font-semibold tracking-wide" style={{ color: '#FDE68A' }}>
          Total Community Net Savings • மொத்த சேமிப்பு
        </p>
        <p className="text-4xl sm:text-5xl font-extrabold mt-1 tracking-tight">
          {formatCurrency(totalSavings)}
        </p>
        <div className="mt-3 flex justify-center gap-4 text-xs text-amber-100">
          <span>
            Functions Tracked: <strong className="text-white">{fns.length}</strong>
          </span>
          <span>•</span>
          <span>
            Total Transactions: <strong className="text-white">{contributions.length}</strong>
          </span>
        </div>
      </div>

      {/* Function Breakdown Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Festival & Function Breakdown • நிகழ்வு வாரியான இருப்பு
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {fns.length} Festivals
          </span>
        </div>

        {fns.length === 0 ? (
          <EmptyState
            icon="🛕"
            title="No functions found"
            subtitle="Start by recording an amount or creating a function"
            action={
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mt-3 cursor-pointer"
                style={{ backgroundColor: '#851D1D' }}
              >
                <Plus size={16} /> Add Amount & Name
              </button>
            }
          />
        ) : (
          fns.map((fn) => {
            const s = savings[fn.id] || { contributions: 0, expenses: 0, balance: 0 };
            return (
              <Card key={fn.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {fn.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {fn.type === 'ANNUAL' ? 'Purattasi Sani Kiyamai (Yearly)' : 'Gokulaashdami (4-Year)'} •{' '}
                      {fn.start_year}
                      {fn.end_year ? `-${fn.end_year}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Net Balance
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: s.balance >= 0 ? 'var(--savings)' : 'var(--expense)' }}
                    >
                      {formatCurrency(s.balance)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    title="Income (வரவு)"
                    amount={s.contributions}
                    color="var(--income)"
                    bgColor="var(--income-light)"
                    compact
                  />
                  <StatCard
                    title="Expenses (செலவு)"
                    amount={s.expenses}
                    color="var(--expense)"
                    bgColor="var(--expense-light)"
                    compact
                  />
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
          })
        )}
      </div>

      {/* Recent Contributions Activity */}
      {contributions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Recent Contributions • சமீபத்திய நன்கொடைகள்
            </h2>
            <Link
              href="/admin/contributions"
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              View All →
            </Link>
          </div>

          <Card padding="none">
            {contributions.slice(0, 5).map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
                style={{
                  borderBottom: idx < Math.min(5, contributions.length) - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--income-light)' }}
                  >
                    <TrendingUp size={15} style={{ color: 'var(--income)' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.member?.full_name || 'Devotee'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(item.payment_date)} • {item.payment_method.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm" style={{ color: 'var(--income)' }}>
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Quick Add Amount & Name Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Modal Header */}
            <div
              className="p-5 flex items-center justify-between text-white"
              style={{
                backgroundColor: '#851D1D',
                borderBottom: '2px solid #F59E0B',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
                  <Plus size={20} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Add Amount & Name</h3>
                  <p className="text-xs text-amber-200">Record Devotee Seva • வருமானம் & பெயர் சேர்க்க</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-amber-100 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              {formError && (
                <div
                  className="p-3 rounded-xl text-sm border font-medium"
                  style={{
                    backgroundColor: 'var(--error-light)',
                    color: 'var(--error)',
                    borderColor: 'var(--error)',
                  }}
                >
                  {formError}
                </div>
              )}

              {submitSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <Check size={26} />
                  </div>
                  <h4 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Saved Successfully!
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Contribution and Devotee Name have been recorded.
                  </p>
                </div>
              ) : (
                <>
                  {/* Name Input with Quick Select / Type New */}
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Devotee / Member Name (பெயர்) *
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Enter Devotee Full Name (e.g. S. Ramanathan)"
                        value={memberName}
                        onChange={(e) => {
                          setMemberName(e.target.value);
                          setSelectedMemberId('');
                        }}
                        className="w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                        style={{
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border)',
                        }}
                      />

                      {/* Or Select Existing Member Quick Dropdown */}
                      {members.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-500">Or pick existing:</span>
                          <select
                            value={selectedMemberId}
                            onChange={(e) => {
                              setSelectedMemberId(e.target.value);
                              const found = members.find((m) => m.id === e.target.value);
                              if (found) setMemberName(found.full_name);
                            }}
                            className="text-xs px-2.5 py-1.5 border rounded-lg outline-none flex-1 truncate"
                            style={{
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <option value="">-- Choose from {members.length} registered members --</option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.full_name} ({m.member_id})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Amount (தொகை ₹) *
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg"
                        style={{ color: '#851D1D' }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        placeholder="500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-lg font-bold border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                        style={{
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border)',
                        }}
                      />
                    </div>
                    {/* Quick Amount Suggestion Buttons */}
                    <div className="flex gap-2 mt-2">
                      {[200, 500, 1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(String(amt))}
                          className="px-2.5 py-1 text-xs rounded-lg border font-medium hover:border-amber-500 transition-colors cursor-pointer"
                          style={{
                            backgroundColor: amount === String(amt) ? '#851D1D' : 'transparent',
                            color: amount === String(amt) ? '#FFFFFF' : 'var(--text-primary)',
                            borderColor: amount === String(amt) ? '#F59E0B' : 'var(--border)',
                          }}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Festival / Function Selection */}
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Festival / Function (நிகழ்வு)
                    </label>
                    <select
                      value={functionId}
                      onChange={(e) => setFunctionId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {fns.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.type === 'ANNUAL' ? 'Purattasi Sani' : 'Gokulaashdami'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method & Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 text-sm border rounded-xl outline-none"
                        style={{
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <option value="upi">UPI (GPay / PhonePe)</option>
                        <option value="cash">Cash (ரொக்கம்)</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Date (தேதி)
                      </label>
                      <input
                        type="date"
                        required
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-xl outline-none"
                        style={{
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Notes (விருப்ப குறிப்பு)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Purattasi Annadhanam donation"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border rounded-xl outline-none"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border)',
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-black/5 transition-colors cursor-pointer"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                      style={{
                        backgroundColor: '#851D1D',
                        border: '1.5px solid #F59E0B',
                      }}
                    >
                      {submitting ? 'Saving...' : 'Confirm & Save (சேமிக்க)'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
