'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, Button, DatePicker } from '@/components/ui';
import { expenseService, functionService } from '@/services';
import type { CommunityFunction, ExpenseCategory, PaymentMethod } from '@/types';

const CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Food & Annadhanam (உணவு)', value: 'food' },
  { label: 'Hall & Mandapam (மண்டபம்)', value: 'hall' },
  { label: 'Decoration & Flowers (அலங்காரம்)', value: 'decoration' },
  { label: 'Transportation (போக்குவரத்து)', value: 'transportation' },
  { label: 'Cultural & Religious (பூஜை பொருட்கள்)', value: 'cultural_religious' },
  { label: 'Printing & Invitations (பத்திரிக்கை)', value: 'printing' },
  { label: 'Sound System & Lights (ஒலி & ஒளி)', value: 'sound_system' },
  { label: 'Gifts & Prasadam (பிரசாதம்)', value: 'gifts' },
  { label: 'Utilities (பயன்பாடுகள்)', value: 'utilities' },
  { label: 'Miscellaneous (இதர)', value: 'miscellaneous' },
];

export default function AddExpensePage() {
  const router = useRouter();
  const [functions, setFunctions] = useState<CommunityFunction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    function_id: '',
    category: 'food' as ExpenseCategory,
    description: '',
    amount: '',
    payment_method: 'upi' as PaymentMethod,
    expense_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const fList = await functionService.getAll();
        setFunctions(fList);
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
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!form.function_id) {
      setError('Please select a function');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await expenseService.create({
        function_id: form.function_id,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        expense_date: form.expense_date,
        reference_number: form.reference_number || undefined,
        notes: form.notes || undefined,
      });
      router.push('/admin/expenses');
    } catch (err: any) {
      setError(err?.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/expenses" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Add Expense</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Record Community Expenditure • செலவு சேர்க்க</p>
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
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Description *</label>
            <input
              type="text"
              placeholder="e.g. Annadhanam Rice & Groceries purchase"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--expense)', borderColor: 'var(--border)' }}
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
              label="Expense Date (தேதி)"
              value={form.expense_date}
              onChange={(val) => setForm({ ...form, expense_date: val })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Reference / Bill No.</label>
            <input
              type="text"
              placeholder="Invoice # or Txn ID"
              value={form.reference_number}
              onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <Button type="submit" fullWidth loading={loading} leftIcon={<Save size={16} />}>
            Save Expense
          </Button>
        </form>
      </Card>
    </div>
  );
}
