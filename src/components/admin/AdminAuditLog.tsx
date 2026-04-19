import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditEntry {
  id: string;
  admin_user_id: string;
  action: string;
  affected_user_id: string | null;
  affected_record_id: string | null;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}

const actionLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  delete_user: { label: 'Delete User', variant: 'destructive' },
  suspend_user: { label: 'Suspend User', variant: 'destructive' },
  unsuspend_user: { label: 'Unsuspend', variant: 'secondary' },
  promote_admin: { label: 'Promote Admin', variant: 'default' },
  demote_admin: { label: 'Demote Admin', variant: 'secondary' },
  data_export: { label: 'Data Export', variant: 'outline' },
};

export default function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      setEntries(data as AuditEntry[]);
    }
    setLoading(false);
  };

  if (loading) return <p className="text-muted-foreground text-sm font-['Josefin_Sans']">Loading audit log…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">Audit Log</h2>
        <p className="text-muted-foreground text-sm font-['Josefin_Sans'] mt-1">Last 500 admin actions (read-only)</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Timestamp</span></TableHead>
              <TableHead><span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Action</span></TableHead>
              <TableHead><span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Details</span></TableHead>
              <TableHead><span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Affected User</span></TableHead>
              <TableHead><span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">IP Address</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                  No admin actions recorded yet.
                </TableCell>
              </TableRow>
            )}
            {entries.map((e) => {
              const actionInfo = actionLabels[e.action] || { label: e.action, variant: 'outline' as const };
              return (
                <TableRow key={e.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionInfo.variant} className="text-[10px]">
                      {actionInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {e.details || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                    {e.affected_user_id ? e.affected_user_id.slice(0, 8) + '…' : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                    {e.ip_address || '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
