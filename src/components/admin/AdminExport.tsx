import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Users, BookOpen, Database } from 'lucide-react';
import { toast } from 'sonner';

function jsonToCsv(data: Record<string, any>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const dateStr = () => new Date().toISOString().slice(0, 10);

async function logExport(exportType: string) {
  const { data: { session } } = await supabase.auth.getSession();
  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ action: 'log_export', details: exportType }),
  });
}

export default function AdminExport() {
  const [loading, setLoading] = useState<string | null>(null);

  const exportUsers = async () => {
    setLoading('users');
    try {
      const { data, error } = await supabase.rpc('admin_export_users');
      if (error) throw error;
      const rows = data as unknown as Record<string, any>[];
      downloadCsv(jsonToCsv(rows), `bibliotheca-users-${dateStr()}.csv`);
      await logExport('export_users');
      toast.success('Users exported successfully');
    } catch (err: any) {
      toast.error('Export failed', { description: err.message });
    }
    setLoading(null);
  };

  const exportBooks = async () => {
    setLoading('books');
    try {
      const { data, error } = await supabase.rpc('admin_export_books');
      if (error) throw error;
      const rows = data as unknown as Record<string, any>[];
      downloadCsv(jsonToCsv(rows), `bibliotheca-books-${dateStr()}.csv`);
      await logExport('export_books');
      toast.success('Books exported successfully');
    } catch (err: any) {
      toast.error('Export failed', { description: err.message });
    }
    setLoading(null);
  };

  const exportFull = async () => {
    setLoading('full');
    try {
      const [usersRes, booksRes] = await Promise.all([
        supabase.rpc('admin_export_users'),
        supabase.rpc('admin_export_books'),
      ]);
      if (usersRes.error) throw usersRes.error;
      if (booksRes.error) throw booksRes.error;

      const users = usersRes.data as unknown as Record<string, any>[];
      const books = booksRes.data as unknown as Record<string, any>[];

      // Flatten: prefix each column with table name
      const prefixed = (rows: Record<string, any>[], prefix: string) =>
        rows.map(r => {
          const out: Record<string, any> = {};
          for (const [k, v] of Object.entries(r)) out[`${prefix}_${k}`] = v;
          return out;
        });

      const allData = [
        ...prefixed(users, 'user'),
        ...prefixed(books, 'book'),
      ];

      downloadCsv(jsonToCsv(allData), `bibliotheca-full-export-${dateStr()}.csv`);
      await logExport('export_full');
      toast.success('Full export completed');
    } catch (err: any) {
      toast.error('Export failed', { description: err.message });
    }
    setLoading(null);
  };

  const exports = [
    { key: 'users', label: 'Export Users', desc: 'All user profiles with email, location, join date.', icon: Users, fn: exportUsers },
    { key: 'books', label: 'Export Books', desc: 'All books with owner username, metadata, and status.', icon: BookOpen, fn: exportBooks },
    { key: 'full', label: 'Full Database Export', desc: 'All tables flattened into a single CSV.', icon: Database, fn: exportFull },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">Data Export</h2>
        <p className="text-muted-foreground text-sm font-['Josefin_Sans'] mt-1">Download CSV exports of platform data</p>
      </div>

      <div className="grid gap-4">
        {exports.map(({ key, label, desc, icon: Icon, fn }) => (
          <Card key={key}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-['Josefin_Sans'] font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Button onClick={fn} disabled={!!loading} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {loading === key ? 'Exporting…' : 'Download CSV'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-['Josefin_Sans']">
        All exports are logged to the audit trail.
      </p>
    </div>
  );
}
