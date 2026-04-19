import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Play, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BackupFile {
  name: string;
  size: number;
  created_at: string;
}

interface BackupAudit {
  action: string;
  created_at: string;
  details: string | null;
}

export default function AdminBackups() {
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [lastAudit, setLastAudit] = useState<BackupAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: list } = await supabase.storage.from('backups').list('', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    setFiles(
      (list ?? [])
        .filter((f) => f.name.endsWith('.json'))
        .map((f) => ({
          name: f.name,
          size: (f.metadata as { size?: number } | null)?.size ?? 0,
          created_at: f.created_at ?? '',
        }))
    );

    const { data: audit } = await supabase
      .from('admin_audit_log')
      .select('action, created_at, details')
      .in('action', ['database_backup_success', 'database_backup_failure'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLastAudit(audit as BackupAudit | null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runBackup = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('backup-database');
      if (error) throw error;
      toast.success('Backup completo', { description: `${data.filename} criado.` });
      await load();
    } catch (e) {
      toast.error('Falha no backup', {
        description: e instanceof Error ? e.message : 'Erro desconhecido',
      });
    } finally {
      setRunning(false);
    }
  };

  const downloadFile = async (name: string) => {
    const { data, error } = await supabase.storage.from('backups').download(name);
    if (error || !data) {
      toast.error('Download falhou', { description: error?.message });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const lastBackupAt = lastAudit ? new Date(lastAudit.created_at) : null;
  const hoursSince = lastBackupAt ? (Date.now() - lastBackupAt.getTime()) / 36e5 : Infinity;
  const stale = hoursSince > 48;
  const success = lastAudit?.action === 'database_backup_success';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">
            Backups
          </h2>
          <p className="text-sm text-muted-foreground font-['Josefin_Sans'] mt-1">
            Cópias diárias automáticas da base de dados (02:00 UTC), retidas por 90 dias.
          </p>
        </div>
        <Button onClick={runBackup} disabled={running}>
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Executar agora
        </Button>
      </div>

      {/* Last backup status */}
      <div className="border border-border rounded-lg p-5 bg-card">
        <div className="flex items-center gap-3">
          {success ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          )}
          <div className="flex-1">
            <div className="font-['Josefin_Sans'] text-sm font-medium text-foreground">
              {lastAudit
                ? success ? 'Último backup bem-sucedido' : 'Último backup falhou'
                : 'Nenhum backup registado ainda'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {lastBackupAt ? formatDate(lastBackupAt.toISOString()) : '—'}
            </div>
          </div>
        </div>
      </div>

      {stale && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhum backup foi executado nas últimas 48 horas. Verifica o agendamento ou executa manualmente.
          </AlertDescription>
        </Alert>
      )}

      {/* File list */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ficheiro</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">A carregar…</TableCell></TableRow>
            ) : files.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sem backups ainda.</TableCell></TableRow>
            ) : (
              files.map((f) => (
                <TableRow key={f.name}>
                  <TableCell className="font-mono text-sm">{f.name}</TableCell>
                  <TableCell>{formatSize(f.size)}</TableCell>
                  <TableCell>{formatDate(f.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(f.name)}>
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
