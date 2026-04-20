import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, MapPin, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';

interface District { id: string; name: string; }
interface School {
  id: string;
  name: string;
  concelho: string | null;
  district_id: string;
}

interface Country { code: string; label: string; available: boolean; }

const COUNTRIES: Country[] = [
  { code: 'PT', label: 'Portugal', available: true },
  { code: 'BR', label: 'Brasil', available: false },
  { code: 'ES', label: 'Espanha', available: false },
  { code: 'FR', label: 'França', available: false },
];

const EDUCATION_LEVELS = [
  'Pré-escolar', '1º Ciclo', '2º Ciclo', '3º Ciclo', 'Secundário', 'Profissional', 'Superior',
];

interface CurrentSelection {
  country_code: string | null;
  district_id: string | null;
  school_id: string | null;
}

interface Props {
  current: CurrentSelection;
  onSaved: () => void;
}

export default function SchoolSelector({ current, onSaved }: Props) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [savedSchool, setSavedSchool] = useState<School | null>(null);
  const [savedDistrict, setSavedDistrict] = useState<District | null>(null);

  // Form state
  const [country, setCountry] = useState<string>(current.country_code || 'PT');
  const [districtId, setDistrictId] = useState<string | null>(current.district_id);
  const [schoolId, setSchoolId] = useState<string | null>(current.school_id);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<School[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  // Submit-school modal
  const [submitOpen, setSubmitOpen] = useState(false);

  // Load districts for selected country
  useEffect(() => {
    supabase
      .from('districts')
      .select('id, name')
      .eq('country_code', country)
      .order('name')
      .then(({ data }) => setDistricts((data || []) as District[]));
  }, [country]);

  // Resolve current school + district names for read-only display
  useEffect(() => {
    if (current.school_id) {
      supabase.from('schools').select('id, name, concelho, district_id').eq('id', current.school_id).maybeSingle()
        .then(({ data }) => setSavedSchool(data as School | null));
    } else {
      setSavedSchool(null);
    }
    if (current.district_id) {
      supabase.from('districts').select('id, name').eq('id', current.district_id).maybeSingle()
        .then(({ data }) => setSavedDistrict(data as District | null));
    } else {
      setSavedDistrict(null);
    }
  }, [current.school_id, current.district_id]);

  // Search schools (debounced)
  useEffect(() => {
    if (!editing || !districtId) {
      setSchoolResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const t = setTimeout(async () => {
      let q = supabase
        .from('schools')
        .select('id, name, concelho, district_id')
        .eq('district_id', districtId)
        .order('name')
        .limit(20);
      if (schoolQuery.trim()) {
        q = q.ilike('name', `%${schoolQuery.trim()}%`);
      }
      const { data } = await q;
      if (active) {
        setSchoolResults((data || []) as School[]);
        setSearching(false);
      }
    }, 200);
    return () => { active = false; clearTimeout(t); };
  }, [editing, districtId, schoolQuery]);

  const selectedSchool = useMemo(
    () => schoolResults.find((s) => s.id === schoolId) || savedSchool,
    [schoolResults, schoolId, savedSchool]
  );

  const startEdit = () => {
    setCountry(current.country_code || 'PT');
    setDistrictId(current.district_id);
    setSchoolId(current.school_id);
    setSchoolQuery('');
    setEditing(true);
  };

  const save = async () => {
    if (!user || !districtId || !schoolId) {
      toast.error('Selecciona distrito e escola');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      country_code: country,
      district_id: districtId,
      school_id: schoolId,
    } as any).eq('user_id', user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Localização guardada');
    setEditing(false);
    onSaved();
  };

  // ---- Read-only display ----
  if (!editing) {
    if (!savedSchool || !savedDistrict) {
      return (
        <button
          onClick={startEdit}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MapPin size={12} /> Definir escola
        </button>
      );
    }
    return (
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin size={12} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <span className="text-foreground">Escola:</span>{' '}
          <span>{savedSchool.name}</span>
          {(savedSchool.concelho || savedDistrict.name) && (
            <span> · {[savedSchool.concelho, savedDistrict.name].filter(Boolean).join(', ')}</span>
          )}
          {' '}
          <button
            onClick={startEdit}
            className="underline hover:text-foreground transition-colors ml-1"
          >
            Alterar
          </button>
        </div>
      </div>
    );
  }

  // ---- Editing UI ----
  return (
    <div className="space-y-3 border border-border rounded-md p-3 bg-card">
      {/* Step 1 — País */}
      <div className="space-y-1">
        <Label className="text-xs">País</Label>
        <Select value={country} onValueChange={(v) => { setCountry(v); setDistrictId(null); setSchoolId(null); }}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code} disabled={!c.available}>
                {c.label}{!c.available && ' — em breve'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2 — Distrito */}
      <div className="space-y-1">
        <Label className="text-xs">Distrito</Label>
        <Select
          value={districtId || ''}
          onValueChange={(v) => { setDistrictId(v); setSchoolId(null); setSchoolQuery(''); }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Selecciona distrito…" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 3 — Escola */}
      <div className="space-y-1">
        <Label className="text-xs">Escola</Label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={schoolQuery}
            onChange={(e) => { setSchoolQuery(e.target.value); setSchoolId(null); }}
            placeholder={districtId ? 'Procurar escola…' : 'Selecciona primeiro o distrito'}
            disabled={!districtId}
            className="h-9 text-sm pl-7"
          />
        </div>

        {districtId && (
          <div className="border border-border rounded-md max-h-48 overflow-y-auto bg-background">
            {searching ? (
              <div className="flex items-center justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : schoolResults.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">Sem resultados.</p>
            ) : (
              schoolResults.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setSchoolId(s.id); setSchoolQuery(s.name); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                    schoolId === s.id ? 'bg-muted/40' : ''
                  }`}
                >
                  <div className="text-foreground">{s.name}</div>
                  {s.concelho && <div className="text-xs text-muted-foreground">{s.concelho}</div>}
                </button>
              ))
            )}
          </div>
        )}

        {districtId && (
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="text-xs underline text-muted-foreground hover:text-foreground transition-colors"
          >
            Não encontrei a minha escola
          </button>
        )}

        {selectedSchool && schoolId && (
          <p className="text-xs text-foreground">
            Seleccionada: <span className="font-medium">{selectedSchool.name}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={save} disabled={saving || !districtId || !schoolId} className="flex-1">
          {saving ? 'A guardar…' : 'Guardar'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="flex-1">
          Cancelar
        </Button>
      </div>

      <SubmitSchoolDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        districtId={districtId}
        districtName={districts.find((d) => d.id === districtId)?.name || ''}
        onSubmitted={(school) => {
          setSubmitOpen(false);
          setSchoolId(school.id);
          setSchoolQuery(school.name);
          setSchoolResults((prev) => [school, ...prev.filter((s) => s.id !== school.id)]);
        }}
      />
    </div>
  );
}

// ============================================================
// Submit-school modal
// ============================================================

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  districtId: string | null;
  districtName: string;
  onSubmitted: (school: School) => void;
}

function SubmitSchoolDialog({ open, onOpenChange, districtId, districtName, onSubmitted }: SubmitDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [concelho, setConcelho] = useState('');
  const [schoolType, setSchoolType] = useState<'public' | 'private'>('public');
  const [levels, setLevels] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(''); setConcelho(''); setSchoolType('public'); setLevels([]);
    }
  }, [open]);

  const toggleLevel = (lvl: string) => {
    setLevels((prev) => prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]);
  };

  const submit = async () => {
    if (!user || !districtId) return;
    if (!name.trim() || !concelho.trim()) {
      toast.error('Preenche nome e concelho');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from('schools').insert({
      name: name.trim(),
      concelho: concelho.trim(),
      district_id: districtId,
      school_type: schoolType,
      education_levels: levels,
      is_verified: false,
      submitted_by_user_id: user.id,
    } as any).select('id, name, concelho, district_id').single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success('Escola submetida. Vai ser revista em breve.');
    onSubmitted(data as School);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-2xl">Submeter nova escola</DialogTitle>
          <DialogDescription>
            Distrito: <span className="text-foreground">{districtName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Nome da escola *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Escola Secundária …" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Concelho *</Label>
            <Input value={concelho} onChange={(e) => setConcelho(e.target.value)} placeholder="Ex: Sintra" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="schoolType" checked={schoolType === 'public'} onChange={() => setSchoolType('public')} />
                Pública
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="schoolType" checked={schoolType === 'private'} onChange={() => setSchoolType('private')} />
                Privada
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Níveis de ensino</Label>
            <div className="flex flex-wrap gap-2">
              {EDUCATION_LEVELS.map((lvl) => {
                const active = levels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => toggleLevel(lvl)}
                    className={`text-xs px-3 py-1 border rounded-full transition-colors ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'A submeter…' : 'Submeter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
