'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, TrendingUp } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { memberService, contributionService } from '@/services';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import type { Member, Contribution } from '@/types';

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [m, cRes] = await Promise.all([
          memberService.getById(id),
          contributionService.getAll({ member_id: id }),
        ]);
        setMember(m);
        setContribs(cRes.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load member');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setSaving(true);
    setError(null);
    try {
      await memberService.update(member.id, {
        full_name: member.full_name,
        phone: member.phone || undefined,
        email: member.email || undefined,
        status: member.status,
        role: member.role,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update member');
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

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Member not found</p>
        <Link href="/admin/members" className="text-sm font-semibold underline mt-2 block" style={{ color: 'var(--primary)' }}>
          Back to Members
        </Link>
      </div>
    );
  }

  const totalContributed = contribs.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/members" className="p-2 rounded-lg border hover:bg-black/5" style={{ borderColor: 'var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{member.full_name}</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>ID: {member.member_id}</p>
        </div>
        <Badge label={member.status} variant={member.status === 'active' ? 'success' : 'default'} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--income-light)' }}>
            <TrendingUp size={18} style={{ color: 'var(--income)' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Seva Given</p>
            <p className="text-lg font-bold" style={{ color: 'var(--income)' }}>{formatCurrency(totalContributed)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
            {getInitials(member.full_name)}
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Contributions</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{contribs.length} times</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Edit Details</h3>
        {error && (
          <div className="p-3 mb-4 rounded-xl text-sm border" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', borderColor: 'var(--error)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 rounded-xl text-sm border" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)', borderColor: 'var(--income)' }}>
            Member updated successfully!
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              value={member.full_name}
              onChange={(e) => setMember({ ...member, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
              <input
                type="tel"
                value={member.phone || ''}
                onChange={(e) => setMember({ ...member, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                value={member.email || ''}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                value={member.status}
                onChange={(e) => setMember({ ...member, status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
              <select
                value={member.role || 'visitor'}
                onChange={(e) => setMember({ ...member, role: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                <option value="visitor">Devotee (Visitor)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
            Save Changes
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>Contribution History</h3>
        {contribs.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No contributions recorded yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {contribs.map((c) => (
              <div key={c.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {c.function?.name || 'Community Fund'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(c.payment_date)} • {c.payment_method.toUpperCase()}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--income)' }}>
                  +{formatCurrency(c.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
