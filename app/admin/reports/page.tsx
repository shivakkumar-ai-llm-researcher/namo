'use client';
import { useState, useEffect } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { contributionService, expenseService, memberService, functionService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const exportCSV = async (type: 'contributions' | 'expenses' | 'members') => {
    setDownloading(true);
    try {
      let csv = '';
      if (type === 'contributions') {
        const res = await contributionService.getAll({ limit: 2000 });
        csv = 'ID,Member,Function,Amount,Payment Method,Date,Reference,Notes\n' +
          res.data.map((c) =>
            `"${c.id}","${c.member?.full_name || ''}","${c.function?.name || ''}",${c.amount},"${c.payment_method}","${c.payment_date}","${c.reference_number || ''}","${c.notes || ''}"`
          ).join('\n');
      } else if (type === 'expenses') {
        const res = await expenseService.getAll({ limit: 2000 });
        csv = 'ID,Function,Category,Description,Amount,Payment Method,Date,Reference,Notes\n' +
          res.data.map((e) =>
            `"${e.id}","${e.function?.name || ''}","${e.category}","${e.description}",${e.amount},"${e.payment_method}","${e.expense_date}","${e.reference_number || ''}","${e.notes || ''}"`
          ).join('\n');
      } else {
        const res = await memberService.getAll('', 1, 2000);
        csv = 'ID,Member ID,Full Name,Phone,Email,Status,Role,Join Date\n' +
          res.data.map((m) =>
            `"${m.id}","${m.member_id}","${m.full_name}","${m.phone || ''}","${m.email || ''}","${m.status}","${m.role || ''}","${m.join_date}"`
          ).join('\n');
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `srivari-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (e) {
      alert('Failed to export CSV');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Financial Reports</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Export Data & Audits • அறிக்கைகள்</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--income-light)' }}>
              <Table size={20} style={{ color: 'var(--income)' }} />
            </div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Contributions Ledger</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Complete export of member donations, seva payments, and UPI details.</p>
          </div>
          <Button
            size="sm"
            onClick={() => exportCSV('contributions')}
            loading={downloading}
            leftIcon={<Download size={14} />}
          >
            Export CSV
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--expense-light)' }}>
              <FileText size={20} style={{ color: 'var(--expense)' }} />
            </div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Expenses Ledger</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Detailed breakdown of festival food, flowers, sound, and Mandapam costs.</p>
          </div>
          <Button
            size="sm"
            onClick={() => exportCSV('expenses')}
            loading={downloading}
            leftIcon={<Download size={14} />}
          >
            Export CSV
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--primary-light)' }}>
              <FileText size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Members Directory</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Complete roster of community devotees, member IDs, and contact info.</p>
          </div>
          <Button
            size="sm"
            onClick={() => exportCSV('members')}
            loading={downloading}
            leftIcon={<Download size={14} />}
          >
            Export CSV
          </Button>
        </Card>
      </div>
    </div>
  );
}
