'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { Card, Button, DatePicker } from '@/components/ui';
import { functionService } from '@/services';
import type { CommunityFunction, FunctionType, FunctionStatus } from '@/types';

export default function FunctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<CommunityFunction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const fn = await functionService.getById(id);
        setItem(fn);
        if (fn.start_year) {
          setStartDate(`${fn.start_year}-09-15`);
        }
        if (fn.end_year) {
          setEndDate(`${fn.end_year}-09-15`);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load function');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const startYear = startDate ? new Date(startDate).getFullYear() : item.start_year;
    const endYear = item.type === 'FOUR_YEAR' && endDate ? new Date(endDate).getFullYear() : undefined;

    setSaving(true);
    setError(null);
    try {
      await functionService.update(item.id, {
        name: item.name,
        type: item.type,
        start_year: startYear,
        end_year: endYear,
        description: item.description || undefined,
        status: item.status,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update function');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Function not found</p>
        <Link href="/admin/calendar" className="text-sm font-semibold underline mt-2 block" style={{ color: 'var(--primary)' }}>
          Back to Calendar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/calendar" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Edit Festival Settings • திருவிழா அமைப்புகள்</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="p-3 mb-4 rounded-xl text-sm border" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', borderColor: 'var(--error)' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-xl text-sm border flex items-center gap-2" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', borderColor: 'var(--success)' }}>
            <CheckCircle2 size={16} /> Changes saved successfully!
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Function Name *</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Function Type</label>
              <select
                value={item.type}
                onChange={(e) => setItem({ ...item, type: e.target.value as FunctionType })}
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
                value={item.status}
                onChange={(e) => setItem({ ...item, status: e.target.value as FunctionStatus })}
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
          {item.type === 'ANNUAL' ? (
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
              value={item.description || ''}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
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
