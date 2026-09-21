'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Card, Button, DatePicker } from '@/components/ui';
import { contributionService } from '@/services';
import type { Contribution, PaymentMethod } from '@/types';

export default function ContributionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const c = await contributionService.getById(id);
        setItem(c);
      } catch (e: any) {
        setError(e?.message || 'Failed to load contribution');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      await contributionService.update(item.id, {
        amount: Number(item.amount),
        payment_method: item.payment_method,
        payment_date: item.payment_date,
        reference_number: item.reference_number || undefined,
        notes: item.notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update contribution');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contribution?')) return;
    try {
      await contributionService.delete(id);
      router.push('/admin/contributions');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--income)' }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Contribution not found</p>
        <Link href="/admin/contributions" className="text-sm font-semibold underline mt-2 block" style={{ color: 'var(--primary)' }}>
          Back to Contributions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/contributions" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Contribution</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.member?.full_name}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg border hover:bg-red-50 text-red-600 transition-colors"
          style={{ borderColor: 'var(--border)' }}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <Card>
        {error && (
          <div className="p-3 mb-4 rounded-xl text-sm border" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', borderColor: 'var(--error)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 rounded-xl text-sm border" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)', borderColor: 'var(--income)' }}>
            Contribution updated successfully!
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Member</label>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.member?.full_name} ({item.member?.member_id})</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Function</label>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.function?.name}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (₹)</label>
            <input
              type="number"
              value={item.amount}
              onChange={(e) => setItem({ ...item, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-amber-500"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--income)', borderColor: 'var(--border)' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Payment Method</label>
              <select
                value={item.payment_method}
                onChange={(e) => setItem({ ...item, payment_method: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <DatePicker
              label="Payment Date (தேதி)"
              value={item.payment_date.split('T')[0]}
              onChange={(val) => setItem({ ...item, payment_date: val })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Reference Number</label>
            <input
              type="text"
              value={item.reference_number || ''}
              onChange={(e) => setItem({ ...item, reference_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
            <textarea
              rows={2}
              value={item.notes || ''}
              onChange={(e) => setItem({ ...item, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
