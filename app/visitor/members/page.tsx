'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { memberService } from '@/services';
import { getInitials } from '@/utils/formatters';
import type { Member } from '@/types';

export default function VisitorMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await memberService.getAll(search, 1, 200);
      setMembers(res.data);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Community Members</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{total} registered devotees • உறுப்பினர்கள்</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon="👥" title="No members found" />
      ) : (
        <Card padding="none">
          {members.map((m, idx) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: idx < members.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {getInitials(m.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.full_name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>ID: {m.member_id}</p>
              </div>
              <Badge label={m.status} variant={m.status === 'active' ? 'success' : 'default'} size="sm" />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
