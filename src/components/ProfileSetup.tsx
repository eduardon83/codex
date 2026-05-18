import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Check, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import owlGold from '@/assets/codex-owl-gold.png';
import { applyTheme, THEMES, useTheme, getThemeDescription } from '@/hooks/useTheme';
import { fetchCurrentLegalDocument, LegalDocumentRecord } from '@/lib/legalDocuments';
import UserAvatar from '@/components/UserAvatar';
import { uploadFileToStorage } from '@/lib/storage';

type Step = 'terms' | 'basics' | 'photo' | 'theme';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'error';

interface District { id: string; name: string }

const STORAGE_KEY = 'codex_profile_setup_state';
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1920;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 13;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

type PersistedState = {
  step?: Step;
  firstName?: string;
  lastName?: string;
  username?: string;
  countryCode?: string;
  districtId?: string;
  birthYear?: number;
  themeId?: string;
};

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch { return {}; }
}

const COUNTRIES = [
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'España' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'United States' },
];

export default function ProfileSetup() {
  const { t, i18n } = useTranslation();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { currentTheme } = useTheme();
  const persisted = useRef<PersistedState>(loadPersisted()).current;

  const [step, setStep] = useState<Step>(persisted.step || (profile?.terms_accepted_at ? 'basics' : 'terms'));
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(persisted.firstName ?? profile?.first_name ?? '');
  const [lastName, setLastName] = useState(persisted.lastName ?? profile?.last_name ?? '');
  const [username, setUsername] = useState(persisted.username ?? profile?.username ?? '');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const [countryCode, setCountryCode] = useState<string>(persisted.countryCode ?? (profile as any)?.country_code ?? 'PT');
  const [districtId, setDistrictId] = useState<string>(persisted.districtId ?? (profile as any)?.district_id ?? '');
  const [districts, setDistricts] = useState<District[]>([]);
  const [birthYear, setBirthYear] = useState<number | undefined>(
    persisted.birthYear ?? (profile as any)?.birth_year ?? undefined,
  );

  // Photo
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    /^https?:/.test(profile?.avatar_url || '') ? (profile?.avatar_url as string) : null,
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legal
  const [termsDocument, setTermsDocument] = useState<LegalDocumentRecord | null>(null);
  const [privacyDocument, setPrivacyDocument] = useState<LegalDocumentRecord | null>(null);
  const [loadingLegal, setLoadingLegal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Theme
  const [themeId, setThemeId] = useState(persisted.themeId ?? currentTheme.id);
  const selectedTheme = THEMES.find(th => th.id === themeId) || THEMES[0];
  const originalThemeRef = useRef<string>(currentTheme.id);

  // Wilderness Hearth palette overrides — matches the landing page across
  // the pre-completion onboarding flow (before the user picks their app theme).
  const wildernessVars = {
    ['--background' as any]: '140 16% 14%',
    ['--foreground' as any]: '42 50% 90%',
    ['--card' as any]: '132 13% 21%',
    ['--card-foreground' as any]: '42 50% 90%',
    ['--popover' as any]: '132 13% 21%',
    ['--popover-foreground' as any]: '42 50% 90%',
    ['--primary' as any]: '44 55% 54%',
    ['--primary-foreground' as any]: '140 16% 14%',
    ['--secondary' as any]: '132 13% 21%',
    ['--secondary-foreground' as any]: '42 50% 90%',
    ['--muted' as any]: '132 13% 21%',
    ['--muted-foreground' as any]: '43 26% 75%',
    ['--accent' as any]: '44 55% 54%',
    ['--accent-foreground' as any]: '140 16% 14%',
    ['--border' as any]: '44 30% 30%',
    ['--input' as any]: '44 30% 30%',
    ['--ring' as any]: '44 55% 54%',
  } as React.CSSProperties;

  // Persist setup progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step, firstName, lastName, username, countryCode, districtId, birthYear, themeId,
      }));
    } catch { /* ignore */ }
  }, [step, firstName, lastName, username, countryCode, districtId, birthYear, themeId]);

  // Re-hydrate when profile arrives
  useEffect(() => {
    if (profile?.first_name && !firstName) setFirstName(profile.first_name);
    if (profile?.last_name && !lastName) setLastName(profile.last_name);
    if (profile?.username && !username) setUsername(profile.username);
    if (/^https?:/.test(profile?.avatar_url || '') && !photoUrl) setPhotoUrl(profile?.avatar_url || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.first_name, profile?.last_name, profile?.username, profile?.avatar_url]);

  // Username check
  useEffect(() => {
    const trimmed = username.trim();
    if (step !== 'basics') return;
    if (!trimmed) { setUsernameStatus('idle'); setUsernameMessage(''); return; }
    if (!/^[a-z0-9_.]{3,}$/.test(trimmed)) {
      setUsernameStatus('error');
      setUsernameMessage(t('profileSetup.usernameInvalid'));
      return;
    }
    setUsernameStatus('checking');
    setUsernameMessage(t('profileSetup.usernameChecking'));
    const id = window.setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles').select('user_id').eq('username', trimmed).maybeSingle();
      if (error) { setUsernameStatus('error'); setUsernameMessage(t('profileSetup.usernameCheckError')); return; }
      if (data && data.user_id !== user?.id) {
        setUsernameStatus('error'); setUsernameMessage(t('profileSetup.usernameTaken')); return;
      }
      setUsernameStatus('available'); setUsernameMessage(t('profileSetup.usernameAvailable'));
    }, 600);
    return () => clearTimeout(id);
  }, [step, username, user?.id, t]);

  // Load legal docs on terms step
  useEffect(() => {
    if (step !== 'terms') return;
    let active = true;
    setLoadingLegal(true);
    const supported = ['pt', 'en', 'es', 'fr'];
    const uiLang = (i18n.language || 'pt').slice(0, 2).toLowerCase();
    const language = supported.includes(uiLang) ? uiLang : 'pt';
    Promise.all([
      fetchCurrentLegalDocument('terms', language),
      fetchCurrentLegalDocument('privacy', language),
    ]).then(([terms, privacy]) => {
      if (!active) return;
      setTermsDocument(terms); setPrivacyDocument(privacy);
    }).finally(() => { if (active) setLoadingLegal(false); });
    return () => { active = false; };
  }, [step, i18n.language]);

  // Load districts when country selected
  useEffect(() => {
    if (!countryCode) { setDistricts([]); return; }
    supabase.from('districts')
      .select('id, name')
      .eq('country_code', countryCode)
      .order('name')
      .then(({ data }) => setDistricts((data || []) as District[]));
  }, [countryCode]);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    if (user) {
      await supabase.from('profiles').update({ language: lang } as any).eq('user_id', user.id);
      try { await supabase.auth.updateUser({ data: { language: lang } }); } catch { /* ignore */ }
    }
  };

  const submitTerms = async () => {
    if (!user || !acceptedTerms || !acceptedPrivacy) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      terms_accepted_at: new Date().toISOString(),
      terms_version: termsDocument?.version || 'pending',
    } as any).eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    setStep('basics');
  };

  const submitBasics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !username.trim() || !countryCode || !birthYear) {
      toast.error(t('profileSetup.requiredFields'));
      return;
    }
    if (usernameStatus !== 'available') { usernameInputRef.current?.focus(); return; }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      username: username.trim(),
      country_code: countryCode,
      district_id: districtId || null,
      birth_year: birthYear,
    } as any).eq('user_id', user.id);
    setSaving(false);
    if (error) {
      const msg = (error as any)?.message || '';
      if (msg.toLowerCase().includes('username')) {
        setUsernameStatus('error'); setUsernameMessage(t('profileSetup.usernameTaken'));
      } else { toast.error(msg); }
      return;
    }
    setStep('photo');
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) { toast.error(t('profileSetup.photoMustBeImage', 'Carrega uma imagem')); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(t('profileSetup.photoTooLarge', 'Imagem demasiado grande (máx 5MB)')); return; }
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const url = await uploadFileToStorage('profile-photos', path, file);
    if (!url) { toast.error(t('profileSetup.photoUploadError', 'Não foi possível enviar a foto')); setUploadingPhoto(false); return; }
    await supabase.from('profiles').update({ avatar_url: url } as any).eq('user_id', user.id);
    setPhotoUrl(url);
    setUploadingPhoto(false);
    await refreshProfile();
  };

  const removePhoto = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_url: null } as any).eq('user_id', user.id);
    setPhotoUrl(null);
    await refreshProfile();
  };

  const previewTheme = (id: string) => {
    const theme = THEMES.find(th => th.id === id);
    if (!theme) return;
    setThemeId(id);
    applyTheme(theme);
  };

  const enterThemeStep = () => {
    originalThemeRef.current = currentTheme.id;
    const theme = THEMES.find(th => th.id === themeId);
    if (theme) applyTheme(theme);
    setStep('theme');
  };

  const backFromTheme = () => {
    const theme = THEMES.find(th => th.id === originalThemeRef.current);
    if (theme) applyTheme(theme);
    setStep('photo');
  };

  const finalize = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      theme: themeId,
      profile_completed: true,
      account_status: 'active',
    } as any).eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    await refreshProfile();
  };

  const LANGS = [
    { code: 'pt', label: 'PT' }, { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }, { code: 'fr', label: 'FR' },
  ];
  const currentLang = (i18n.language || 'pt').slice(0, 2).toLowerCase();

  const Header = ({ onBack }: { onBack?: () => void }) => (
    <div className="flex flex-col items-center mb-6">
      <div className="w-full flex items-center justify-between mb-2 min-h-[18px]">
        {onBack ? (
          <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> {t('profileSetup.back')}
          </button>
        ) : <span />}
        <div className="flex items-center gap-1" role="group" aria-label="Language">
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLanguage(l.code)}
              aria-pressed={currentLang === l.code}
              className={`px-1.5 py-0.5 text-[10px] tracking-widest font-['Josefin_Sans'] border-b transition-colors ${
                currentLang === l.code
                  ? 'text-foreground border-foreground'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >{l.label}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <img src={owlGold} alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
        <span
          className="font-['Cormorant_Garamond'] italic text-3xl leading-none"
          style={{ color: '#C9A84C' }}
        >
          Codex
        </span>
      </div>
      <h1 className="font-['Cormorant_Garamond'] text-3xl text-foreground text-center">
        {t('profileSetup.welcomeCodex')}
      </h1>
      <p className="text-sm text-muted-foreground text-center mt-1 font-['Josefin_Sans']">
        {t('profileSetup.tellUs')}
      </p>
    </div>
  );

  if (step === 'terms') {
    return (
      <div className="profile-setup min-h-screen bg-background flex items-center justify-center px-6 py-10" style={wildernessVars}>
        <div className="w-full max-w-sm">
          <Header />
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-['Josefin_Sans']">{t('profileSetup.termsIntro')}</p>
            <div className="max-h-[320px] overflow-y-auto rounded-md border border-border bg-card p-3 text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">
              {loadingLegal ? t('app.loading') : (termsDocument?.content || t('legal.documentPreparing'))}
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={acceptedTerms} onCheckedChange={v => setAcceptedTerms(!!v)} className="mt-0.5" />
              <span>{t('profileSetup.acceptTerms')}</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={acceptedPrivacy} onCheckedChange={v => setAcceptedPrivacy(!!v)} className="mt-0.5" />
              <span>
                {t('profileSetup.acceptPrivacyPrefix')}{' '}
                <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-foreground underline underline-offset-2">
                  {t('profileSetup.privacyPolicy')}
                </button>
              </span>
            </label>
            <Button onClick={submitTerms} disabled={saving || loadingLegal || !acceptedTerms || !acceptedPrivacy} className="w-full h-11">
              {saving ? t('profileSetup.saving') : t('profileSetup.continue')}
            </Button>
            <button onClick={signOut} className="w-full text-xs text-muted-foreground hover:text-foreground">
              {t('profile.signOut')}
            </button>
          </div>
          <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
            <DialogContent className="bg-background border-border max-w-lg">
              <DialogHeader><DialogTitle className="font-serif">{t('legal.privacyTitle')}</DialogTitle></DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border p-3 text-sm leading-relaxed whitespace-pre-wrap">
                {privacyDocument?.content || t('legal.documentPreparing')}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (step === 'photo') {
    return (
      <div className="profile-setup min-h-screen bg-background flex items-center justify-center px-6 py-10" style={wildernessVars}>
        <div className="w-full max-w-sm">
          <Header onBack={() => setStep('basics')} />
          <div className="space-y-5 text-center">
            <p className="text-sm text-muted-foreground font-['Josefin_Sans']">
              {t('profileSetup.photoIntro', 'Adiciona uma foto de perfil (opcional)')}
            </p>
            <div className="flex justify-center">
              <UserAvatar photoUrl={photoUrl} firstName={firstName} lastName={lastName} username={username} size={112} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoUpload(f);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button" variant="outline" className="flex-1 h-11"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {photoUrl ? t('profileSetup.changePhoto', 'Alterar foto') : t('profileSetup.uploadPhoto', 'Enviar foto')}
              </Button>
              {photoUrl && (
                <Button type="button" variant="ghost" className="h-11" onClick={removePhoto}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button onClick={enterThemeStep} className="w-full h-11">
              {t('profileSetup.continue')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'theme') {
    return (
      <div className="profile-setup min-h-screen bg-background flex items-center justify-center px-6 py-10" style={wildernessVars}>
        <div className="w-full max-w-md">
          <Header onBack={() => setStep('photo')} />
          <p className="text-sm text-muted-foreground font-['Josefin_Sans'] mb-3 text-center">{t('profileSetup.chooseTheme')}</p>
          <div className="grid grid-cols-2 gap-2 mb-6 max-h-[50vh] overflow-y-auto">
            {THEMES.map(th => {
              const isSelected = themeId === th.id;
              return (
                <button key={th.id} onClick={() => previewTheme(th.id)}
                  className="relative min-h-[92px] p-2 border rounded text-left bg-card text-card-foreground transition-colors hover:border-accent"
                  style={{ borderColor: isSelected ? selectedTheme.colors[2] : undefined }}>
                  {isSelected && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="flex h-5 rounded overflow-hidden mb-1.5 border border-border">
                    {th.colors.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}
                  </div>
                  <p className="text-xs text-foreground pr-6">{th.name}</p>
                  {(() => { const d = getThemeDescription(th, i18n.language); return d ? <p className="mt-0.5 text-[10px] leading-tight italic text-muted-foreground line-clamp-2">{d}</p> : null; })()}
                </button>
              );
            })}
          </div>
          <Button onClick={finalize} disabled={saving} className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? t('profileSetup.finishing') : t('profileSetup.enterCodex')}
          </Button>
        </div>
      </div>
    );
  }

  // STEP: basics
  const districtsForCountry = districts;
  return (
    <div className="profile-setup min-h-screen bg-background flex items-center justify-center px-6 py-10" style={wildernessVars}>
      <div className="w-full max-w-sm">
        <Header onBack={profile?.terms_accepted_at ? undefined : () => setStep('terms')} />
        <form onSubmit={submitBasics} className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder={t('profileSetup.firstName')} value={firstName}
              onChange={e => setFirstName(e.target.value)} required className="h-11 text-sm" />
            <Input placeholder={t('profileSetup.lastName')} value={lastName}
              onChange={e => setLastName(e.target.value)} className="h-11 text-sm" />
          </div>
          <div className="space-y-1">
            <Input ref={usernameInputRef} placeholder={t('profileSetup.username')} value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              required className="h-11 text-sm" />
            {usernameMessage && (
              <p className={`flex items-center gap-1.5 text-xs font-['Josefin_Sans'] ${
                usernameStatus === 'available' ? 'text-green-600'
                  : usernameStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {usernameStatus === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {usernameStatus === 'available' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {usernameStatus === 'error' && <XCircle className="w-3.5 h-3.5" />}
                <span>{usernameMessage}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('profileSetup.country', 'País')}</Label>
            <Select value={countryCode} onValueChange={(v) => { setCountryCode(v); setDistrictId(''); }}>
              <SelectTrigger className="h-11 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {districtsForCountry.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('profileSetup.district')}</Label>
              <Select value={districtId} onValueChange={setDistrictId}>
                <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t('profileSetup.selectDistrict')} /></SelectTrigger>
                <SelectContent>
                  {districtsForCountry.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('profileSetup.birthYear', 'Ano de nascimento')}</Label>
            <Select value={birthYear ? String(birthYear) : ''} onValueChange={(v) => setBirthYear(parseInt(v, 10))}>
              <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t('profileSetup.selectYear', 'Escolhe um ano')} /></SelectTrigger>
              <SelectContent className="max-h-[260px]">
                {BIRTH_YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={saving || usernameStatus !== 'available'} className="w-full h-11">
            {saving ? t('profileSetup.saving') : t('profileSetup.continue')}
          </Button>
        </form>
      </div>
    </div>
  );
}
