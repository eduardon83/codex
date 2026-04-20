import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Search, Loader2 } from 'lucide-react';

interface School {
  id: string;
  me_code: string | null;
  name: string;
  district_id: string;
  concelho: string | null;
  address: string | null;
  school_type: string;
  education_levels: string[];
  is_active: boolean;
  is_verified: boolean;
  submitted_by_user_id: string | null;
  created_at: string;
}

interface District {
  id: string;
  name: string;
}

interface Submitter {
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
}

export default function AdminSchools() {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<Record<string, District>>({});
  const [submitters, setSubmitters] = useState<Record<string, Submitter>>({});
  const [search, setSearch] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<null | {
    total_fetched: number;
    total_upserted: number;
    total_failed: number;
    per_district: Record<string, { fetched: number; upserted: number; failed: number; error?: string }>;
  }>(null);

  const runImport = async () => {
    setImporting(true);
    setImportSummary(null);
    try {
      const { data, error } = await supabase.functions.invoke('seed-schools-from-gesedu');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha na importação');
      setImportSummary(data.summary);
      toast.success(`Importação concluída: ${data.summary.total_upserted} escolas atualizadas`);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const [sRes, dRes] = await Promise.all([
      supabase.from('schools').select('*').order('created_at', { ascending: false }),
      supabase.from('districts').select('id, name').order('name'),
    ]);
    if (sRes.error) toast.error(sRes.error.message);
    if (dRes.error) toast.error(dRes.error.message);

    const dMap: Record<string, District> = {};
    (dRes.data || []).forEach((d) => (dMap[d.id] = d));
    setDistricts(dMap);

    const allSchools = (sRes.data || []) as School[];
    setSchools(allSchools);

    // Load submitter profiles for pending schools
    const submitterIds = Array.from(
      new Set(allSchools.filter((s) => !s.is_verified && s.submitted_by_user_id).map((s) => s.submitted_by_user_id!))
    );
    if (submitterIds.length) {
      const { data: profs } = await supabase
        .from('public_profiles')
        .select('user_id, username, first_name, last_name')
        .in('user_id', submitterIds);
      const sMap: Record<string, Submitter> = {};
      (profs || []).forEach((p: any) => p.user_id && (sMap[p.user_id] = p));
      setSubmitters(sMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const verified = useMemo(
    () =>
      schools
        .filter((s) => s.is_verified)
        .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase())),
    [schools, search]
  );

  const pending = useMemo(() => schools.filter((s) => !s.is_verified), [schools]);

  const approve = async (id: string) => {
    setActingId(id);
    const { error } = await supabase.from('schools').update({ is_verified: true }).eq('id', id);
    setActingId(null);
    if (error) return toast.error(error.message);
    toast.success('Escola aprovada');
    load();
  };

  const reject = async (id: string) => {
    if (!confirm('Rejeitar e eliminar esta escola?')) return;
    setActingId(id);
    const { error } = await supabase.from('schools').delete().eq('id', id);
    setActingId(null);
    if (error) return toast.error(error.message);
    toast.success('Escola rejeitada');
    load();
  };

  const submitterLabel = (uid: string | null) => {
    if (!uid) return '—';
    const s = submitters[uid];
    if (!s) return uid.slice(0, 8);
    return s.username || [s.first_name, s.last_name].filter(Boolean).join(' ') || uid.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">Escolas</h1>
        <p className="text-sm text-muted-foreground font-['Josefin_Sans'] mt-1">
          Gerir escolas verificadas e submissões pendentes.
        </p>
      </div>

      <Tabs defaultValue="verified">
        <TabsList>
          <TabsTrigger value="verified">
            Verificadas <Badge variant="secondary" className="ml-2">{verified.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes <Badge variant="secondary" className="ml-2">{pending.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verified" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Procurar escola…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <div className="border border-border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Concelho</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Código ME</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verified.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sem resultados.</TableCell></TableRow>
                  ) : verified.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{districts[s.district_id]?.name || '—'}</TableCell>
                      <TableCell>{s.concelho || '—'}</TableCell>
                      <TableCell className="capitalize">{s.school_type}</TableCell>
                      <TableCell className="font-mono text-xs">{s.me_code || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <div className="border border-border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead>Submetida por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma submissão pendente.</TableCell></TableRow>
                  ) : pending.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{districts[s.district_id]?.name || '—'}</TableCell>
                      <TableCell>{submitterLabel(s.submitted_by_user_id)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={actingId === s.id}
                          onClick={() => approve(s.id)}
                        >
                          <Check className="w-4 h-4 mr-1" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actingId === s.id}
                          onClick={() => reject(s.id)}
                        >
                          <X className="w-4 h-4 mr-1" /> Rejeitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
