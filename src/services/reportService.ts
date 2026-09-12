import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { format } from 'date-fns';

export const reportService = {
  async exportContributionsCSV(functionId?: string): Promise<void> {
    let query = supabase
      .from('contributions')
      .select('payment_date, amount, payment_method, reference_number, notes, member:members(full_name, member_id), function:functions(name)')
      .order('payment_date', { ascending: false })
      .limit(5000);

    if (functionId) query = query.eq('function_id', functionId);

    const { data, error } = await query;
    if (error) throw error;

    const headers = ['Date', 'Member', 'Member ID', 'Function', 'Amount', 'Payment Method', 'Reference', 'Notes'];
    const rows = ((data ?? []) as any[]).map((c: any) => [
      c.payment_date,
      c.member?.full_name ?? '',
      c.member?.member_id ?? '',
      c.function?.name ?? '',
      c.amount,
      c.payment_method,
      c.reference_number ?? '',
      c.notes ?? '',
    ]);

    await this._shareCSV('contributions', headers, rows);
  },

  async exportExpensesCSV(functionId?: string): Promise<void> {
    let query = supabase
      .from('expenses')
      .select('expense_date, category, description, amount, payment_method, reference_number, notes, function:functions(name)')
      .order('expense_date', { ascending: false })
      .limit(5000);

    if (functionId) query = query.eq('function_id', functionId);

    const { data, error } = await query;
    if (error) throw error;

    const headers = ['Date', 'Function', 'Category', 'Description', 'Amount', 'Payment Method', 'Reference', 'Notes'];
    const rows = ((data ?? []) as any[]).map((e: any) => [
      e.expense_date,
      e.function?.name ?? '',
      e.category,
      e.description,
      e.amount,
      e.payment_method,
      e.reference_number ?? '',
      e.notes ?? '',
    ]);

    await this._shareCSV('expenses', headers, rows);
  },

  async exportSavingsCSV(functionId?: string): Promise<void> {
    let fnQuery = supabase.from('functions').select('id, name, type, start_year, end_year');
    if (functionId) fnQuery = fnQuery.eq('id', functionId);
    const { data: fns, error: fnError } = await fnQuery;
    if (fnError) throw fnError;

    const headers = ['Function', 'Type', 'Start Year', 'End Year', 'Total Contributions', 'Total Expenses', 'Savings'];
    const rows = await Promise.all(((fns ?? []) as any[]).map(async (fn: any) => {
      // Use database function summary RPC instead of downloading all rows to client
      const { data: summary } = await supabase.rpc('get_function_summary', { p_function_id: fn.id });
      const row = Array.isArray(summary) ? summary[0] : summary;
      const totalC = Number(row?.total_contributions ?? 0);
      const totalE = Number(row?.total_expenses ?? 0);
      const balance = Number(row?.balance ?? (totalC - totalE));
      return [fn.name, fn.type, fn.start_year, fn.end_year ?? '', totalC, totalE, balance];
    }));

    await this._shareCSV('savings', headers, rows);
  },

  async _shareCSV(name: string, headers: string[], rows: (string | number | null)[][]): Promise<void> {
    const escapeCSV = (val: string | number | null) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n');

    const fileName = `${name}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      return;
    }
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: `Export ${name}`,
    });
  },
};
