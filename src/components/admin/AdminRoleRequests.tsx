import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';

interface RoleRequestRow {
  id: string;
  requester_user_id: string;
  requested_role: string;
  status: string;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  requester_username?: string | null;
  requester_email?: string | null;
}

export default function AdminRoleRequests() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<RoleRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [acting, setActing] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<{ row: RoleRequestRow; action: 'approved' | 'rejected' } | null>(null);
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('role_requests' as any).select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    const list = ((data || []) as any[]) as RoleRequestRow[];

    const ids = Array.from(new Set(list.map(r => r.requester_user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('user_id, username').in('user_id', ids);
      const map = new Map<string, string>();
      (profs || []).forEach((p: any) => p.username && map.set(p.user_id, p.username));
      list.forEach(r => { r.requester_username = map.get(r.requester_user_id) ?? null; });
    }
    setRows(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const decide = async () => {
    if (!reviewing) return;
    setActing(reviewing.row.id);
    const { row, action } = reviewing;
    const { data: { user } } = await supabase.auth.getUser();

    const { error: rrErr } = await supabase.from('role_requests' as any)
      .update({ status: action, review_note: note.trim() || null, reviewed_at: new Date().toISOString(), reviewed_by_user_id: user?.id ?? null })
      .eq('id', row.id);

    if (rrErr) { toast.error(rrErr.message); setActing(null); return; }

    if (action === 'approved') {
      const { error: roleErr } = await supabase.from('user_roles').insert({
        user_id: row.requester_user_id,
        role: row.requested_role as any,
      });
      if (roleErr && !roleErr.message.includes('duplicate')) {
        toast.error(`Role grant failed: ${roleErr.message}`);
      }
    }

    toast.success(action === 'approved' ? t('admin.roleRequests.approved') : t('admin.roleRequests.rejected'));
    setReviewing(null);
    setNote('');
    setActing(null);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Cormorant_Garamond'] text-3xl text-foreground">{t('admin.roleRequests.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('admin.roleRequests.subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${filter === f ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground'}`}
          >
            {t(`admin.roleRequests.filter.${f}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">{t('admin.roleRequests.empty')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.roleRequests.user')}</TableHead>
              <TableHead>{t('admin.roleRequests.requestedRole')}</TableHead>
              <TableHead>{t('admin.roleRequests.message')}</TableHead>
              <TableHead>{t('admin.roleRequests.status')}</TableHead>
              <TableHead>{t('admin.roleRequests.date')}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">@{r.requester_username || r.requester_user_id.slice(0, 8)}</TableCell>
                <TableCell><Badge variant="secondary">{r.requested_role}</Badge></TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={r.message ?? undefined}>{r.message}</TableCell>
                <TableCell><Badge variant={r.status === 'pending' ? 'default' : r.status === 'approved' ? 'secondary' : 'destructive'}>{r.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => { setReviewing({ row: r, action: 'approved' }); setNote(''); }} disabled={acting === r.id}>
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setReviewing({ row: r, action: 'rejected' }); setNote(''); }} disabled={acting === r.id}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewing?.action === 'approved' ? t('admin.roleRequests.approveTitle') : t('admin.roleRequests.rejectTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm">
              <strong>@{reviewing?.row.requester_username}</strong> → <Badge variant="secondary">{reviewing?.row.requested_role}</Badge>
            </p>
            {reviewing?.row.message && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">{reviewing.row.message}</p>
            )}
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('admin.roleRequests.notePlaceholder')}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)}>{t('common.cancel', 'Cancelar')}</Button>
            <Button onClick={decide} disabled={!!acting}>
              {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : reviewing?.action === 'approved' ? t('admin.roleRequests.approve') : t('admin.roleRequests.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
