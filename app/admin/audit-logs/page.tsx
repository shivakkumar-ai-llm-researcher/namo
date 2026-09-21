'use client';
import { useState, useEffect } from 'react';
import { ClipboardList, ShieldCheck } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/formatters';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
        if (!error && data) {
          setLogs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Audit Logs</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Security & Accountability Trail • தணிக்கை பதிவு</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--income-light)', color: 'var(--income)' }}>
          <ShieldCheck size={14} /> Immutable Trail
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="No audit entries logged yet"
          subtitle="System changes and transactions will appear here for governance."
        />
      ) : (
        <Card padding="none">
          {logs.map((log, idx) => (
            <div
              key={log.id}
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: idx < logs.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    label={log.action.toUpperCase()}
                    variant={log.action === 'create' ? 'success' : log.action === 'delete' ? 'error' : 'warning'}
                    size="sm"
                  />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {log.entity}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  User ID: {log.user_id || 'System'}
                </p>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatDate(log.timestamp, 'dd MMM yyyy, h:mm a')}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
