'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Card, Button, DatePicker } from '@/components/ui';
import { expenseService } from '@/services';
import type { Expense, ExpenseCategory, PaymentMethod } from '@/types';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const e = await expenseService.getById(id);
        setItem(e);
      } catch (err: any) {
        setError(err?.message || 'Failed to load expense');
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
      await expenseService.update(item.id, {
        description: item.description,
        amount: Number(item.amount),
        category: item.category,
        payment_method: item.payment_method,
        expense_date: item.expense_date,
        reference_number: item.reference_number || undefined,
        notes: item.notes || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(id);
      router.push('/admin/expenses');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--expense)' }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Expense not found</p>
        <Link href="/admin/expenses" className="text-sm font-semibold underline mt-2 block" style={{ color: 'var(--primary)' }}>
          Back to Expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/expenses" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Expense</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.function?.name}</p>
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
            Expense updated successfully!
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <input
              type="text"
              value={item.description}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (₹)</label>
            <input
              type="number"
              value={item.amount}
              onChange={(e) => setItem({ ...item, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-xl text-base font-bold outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--expense)', borderColor: 'var(--border)' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select
                value={item.category}
                onChange={(e) => setItem({ ...item, category: e.target.value as ExpenseCategory })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="food">Food</option>
                <option value="hall">Hall</option>
                <option value="decoration">Decoration</option>
                <option value="transportation">Transportation</option>
                <option value="cultural_religious">Cultural / Religious</option>
                <option value="printing">Printing</option>
                <option value="sound_system">Sound System</option>
                <option value="gifts">Gifts</option>
                <option value="utilities">Utilities</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <DatePicker
              label="Expense Date (தேதி)"
              value={item.expense_date.split('T')[0]}
              onChange={(val) => setItem({ ...item, expense_date: val })}
              required
            />
          </div>

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

          <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
