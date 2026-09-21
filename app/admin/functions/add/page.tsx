'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, Button, DatePicker } from '@/components/ui';
import { functionService } from '@/services';
import type { FunctionType, FunctionStatus } from '@/types';

export default function AddFunctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndStr = new Date(new Date().getFullYear() + 3, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    type: 'ANNUAL' as FunctionType,
    description: '',
    status: 'active' as FunctionStatus,
  });

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Function name is required');
      return;
    }
    if (!startDate) {
      setError('Please select a valid date (dd/mm/yyyy)');
      return;
    }

    const startYear = new Date(startDate).getFullYear();
    const endYear = form.type === 'FOUR_YEAR' && endDate ? new Date(endDate).getFullYear() : undefined;

    setLoading(true);
    setError(null);
    try {
      await functionService.create({
        name: form.name,
        type: form.type,
        start_year: startYear,
        end_year: endYear,
        description: form.description || undefined,
        status: form.status,
      });
      router.push('/admin/calendar');
    } catch (err: any) {
      setError(err?.message || 'Failed to create function');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/calendar" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Function</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add Festival or Seva Function • நிகழ்வு சேர்க்க</p>
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
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Function Name *</label>
            <input
              type="text"
              placeholder="e.g. Purattasi Sani Kiyamai 2026"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Function Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as FunctionType })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="ANNUAL">Purattasi Sani (Yearly)</option>
                <option value="FOUR_YEAR">Gokulaashdami (4-Year)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FunctionStatus })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Date Selection with Calendar Selector dd/mm/yyyy */}
          {form.type === 'ANNUAL' ? (
            <div>
              <DatePicker
                label="Function Date (நிகழ்வு தேதி)"
                value={startDate}
                onChange={(val) => setStartDate(val)}
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker
                label="Cycle Start Date (தொடக்க தேதி)"
                value={startDate}
                onChange={(val) => {
                  setStartDate(val);
                  if (val) {
                    const d = new Date(val);
                    d.setFullYear(d.getFullYear() + 3);
                    setEndDate(d.toISOString().split('T')[0]);
                  }
                }}
                required
              />
              <DatePicker
                label="Cycle End Date (முடிவு தேதி)"
                value={endDate}
                onChange={(val) => setEndDate(val)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              rows={3}
              placeholder="Annadhanam, Thirumanjanam, Pooja details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <Button type="submit" fullWidth loading={loading} leftIcon={<Save size={16} />}>
            Create Function
          </Button>
        </form>
      </Card>
    </div>
  );
}
