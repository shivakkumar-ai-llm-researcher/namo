'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { memberService } from '@/services';
import { getInitials } from '@/utils/formatters';
import { useLanguage } from '@/context/LanguageContext';
import type { Member } from '@/types';

export default function VisitorMembersPage() {
  const { language, t } = useLanguage();
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('members.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {total} {t('members.registered')}
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('members.searchPlaceholder')}
          className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
          style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon="👥" title={t('members.empty')} />
      ) : (
        <div className="space-y-2.5">
          {members.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {getInitials(m.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm sm:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {m.full_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {t('members.id')}: <span className="font-mono font-medium">{m.member_id}</span>
                    {m.phone ? ` • 📞 ${m.phone}` : ''}
                  </p>
                </div>
              </div>
              <Badge
                label={m.status === 'active' ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலற்ற' : 'Inactive')}
                variant={m.status === 'active' ? 'success' : 'default'}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
