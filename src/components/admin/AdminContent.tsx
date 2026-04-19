import { useEffect, useMemo, useState } from 'react';
import { Search, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { invalidateContentCache } from '@/hooks/useContent';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type Row = {
  id: string;
  key: string;
  category: string;
  value_pt: string | null;
  value_en: string | null;
  value_fr: string | null;
  value_es: string | null;
  updated_at: string;
};

type LangCol = 'value_pt' | 'value_en' | 'value_fr' | 'value_es';
const LANGS: { col: LangCol; label: string }[] = [
  { col: 'value_pt', label: 'PT' },
  { col: 'value_en', label: 'EN' },
  { col: 'value_fr', label: 'FR' },
  { col: 'value_es', label: 'ES' },
];

export default function AdminContent() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [editing, setEditing] = useState<{ id: string; col: LangCol } | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_content')
      .select('id, key, category, value_pt, value_en, value_fr, value_es, updated_at')
      .order('category')
      .order('key');
    if (error) {
      toast.error('Failed to load content', { description: error.message });
    } else {
      setRows((data as Row[]) || []);
    }
    setLoading(false);
  }

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category));
    return ['all', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (!q) return true;
      return (
        r.key.toLowerCase().includes(q) ||
        (r.value_pt || '').toLowerCase().includes(q) ||
        (r.value_en || '').toLowerCase().includes(q) ||
        (r.value_fr || '').toLowerCase().includes(q) ||
        (r.value_es || '').toLowerCase().includes(q)
      );
    });
  }, [rows, search, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    }
    return map;
  }, [filtered]);

  function startEdit(row: Row, col: LangCol) {
    setEditing({ id: row.id, col });
    setDraft(row[col] ?? '');
  }

  async function commitEdit(row: Row, col: LangCol) {
    if (!editing || editing.id !== row.id || editing.col !== col) return;
    const newValue = draft;
    const oldValue = row[col] ?? '';
    setEditing(null);
    if (newValue === oldValue) return;

    setSaving(`${row.id}:${col}`);
    const update: Record<string, unknown> = { [col]: newValue, updated_by_admin_id: user?.id ?? null };
    const { error } = await supabase
      .from('app_content')
      .update(update as never)
      .eq('id', row.id);

    if (error) {
      toast.error('Save failed', { description: error.message });
      setSaving(null);
      return;
    }

    // Audit log
    await supabase.from('admin_audit_log').insert({
      admin_user_id: user!.id,
      action: 'content_edit',
      affected_record_id: row.id,
      details: `${row.key} [${col.replace('value_', '').toUpperCase()}]: "${oldValue}" → "${newValue}"`,
    });

    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, [col]: newValue } : r)));
    invalidateContentCache();
    setSaving(null);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-3xl text-foreground mb-1">Conteúdo</h1>
        <p className="text-sm text-muted-foreground font-['Josefin_Sans']">
          Edite todos os textos da aplicação sem alterar o código. Clique numa célula para editar; pressione Enter para guardar ou Escape para cancelar.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por chave ou texto..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs font-['Josefin_Sans'] uppercase tracking-wider border rounded transition-colors ${
                category === c
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
              }`}
            >
              {c === 'all' ? 'Todas' : c.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          A carregar...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground font-['Josefin_Sans']">
          Nenhuma entrada corresponde à pesquisa.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-xs font-['Josefin_Sans'] uppercase tracking-wider text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                {cat.replace('_', ' ')} <span className="text-muted-foreground/60">· {items.length}</span>
              </h2>
              <div className="border border-border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-3 py-2 font-['Josefin_Sans'] text-xs uppercase tracking-wider text-muted-foreground w-[18%]">Chave</th>
                      {LANGS.map((l) => (
                        <th key={l.col} className="text-left px-3 py-2 font-['Josefin_Sans'] text-xs uppercase tracking-wider text-muted-foreground">
                          {l.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row.id} className="border-t border-border align-top">
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground break-all">
                          {row.key}
                        </td>
                        {LANGS.map((l) => {
                          const isEditing = editing?.id === row.id && editing.col === l.col;
                          const isSaving = saving === `${row.id}:${l.col}`;
                          return (
                            <td
                              key={l.col}
                              className="px-3 py-2 cursor-text relative group"
                              onClick={() => !isEditing && startEdit(row, l.col)}
                            >
                              {isEditing ? (
                                <Textarea
                                  autoFocus
                                  value={draft}
                                  onChange={(e) => setDraft(e.target.value)}
                                  onBlur={() => commitEdit(row, l.col)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      void commitEdit(row, l.col);
                                    } else if (e.key === 'Escape') {
                                      cancelEdit();
                                    }
                                  }}
                                  className="min-h-[60px] text-sm"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap text-foreground/90 group-hover:text-foreground min-h-[1.5rem]">
                                  {row[l.col] || (
                                    <span className="text-muted-foreground/50 italic">vazio</span>
                                  )}
                                  {isSaving && (
                                    <Save className="inline w-3 h-3 ml-1 text-muted-foreground animate-pulse" />
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
