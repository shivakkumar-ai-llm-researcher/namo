'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, Button, DatePicker } from '@/components/ui';
import { contributionService, memberService, functionService } from '@/services';
import type { Member, CommunityFunction, PaymentMethod } from '@/types';

export default function AddContributionPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [functions, setFunctions] = useState<CommunityFunction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    member_id: '',
    function_id: '',
    amount: '',
    payment_method: 'upi' as PaymentMethod,
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const [mRes, fList] = await Promise.all([
          memberService.getAll('', 1, 200),
          functionService.getAll(),
        ]);
        setMembers(mRes.data);
        setFunctions(fList);
        if (mRes.data[0]) setForm((prev) => ({ ...prev, member_id: mRes.data[0].id }));
        if (fList[0]) setForm((prev) => ({ ...prev, function_id: fList[0].id }));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!form.member_id) {
      setError('Please select a member');
      return;
    }
    if (!form.function_id) {
      setError('Please select a festival');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await contributionService.create({
        member_id: form.member_id,
        function_id: form.function_id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        payment_date: form.payment_date,
        reference_number: form.reference_number || undefined,
        notes: form.notes || undefined,
      });
      router.push('/admin/contributions');
    } catch (err: any) {
      setError(err?.message || 'Failed to record contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/contributions" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Add Contribution</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Record New Member Seva • வருமானம் சேர்க்க</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="p-3 mb-4 rounded-xl text-sm border" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', borderColor: 'var(--error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Member *</label>
            <select
              value={form.member_id}
              onChange={(e) => setForm({ ...form, member_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Festival / Function *</label>
            <select
              value={form.function_id}
              onChange={(e) => setForm({ ...form, function_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              required
            >
              {functions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type === 'ANNUAL' ? 'Purattasi Sani' : 'Gokulaashdami'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              min="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Payment Method</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="upi">UPI (GPay / PhonePe)</option>
                <option value="cash">Cash (ரொக்கம்)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <DatePicker
              label="Payment Date (தேதி)"
              value={form.payment_date}
              onChange={(val) => setForm({ ...form, payment_date: val })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Reference Number (Optional)</label>
            <input
              type="text"
              placeholder="UPI Ref / Txn ID"
              value={form.reference_number}
              onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Any comments..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <Button type="submit" fullWidth loading={loading} leftIcon={<Save size={16} />}>
            Save Contribution
          </Button>
        </form>
      </Card>
    </div>
  );
}
