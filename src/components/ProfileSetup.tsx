import { useMemo, useRef, useState } from 'react';
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
import { useEffect } from 'react';
import { Loader2, Search, ArrowLeft, CheckCircle2, XCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FALLBACK_SCHOOLS_BY_DISTRICT } from '@/config/fallbackSchools';
import foliumLogo from '@/assets/folium-logo.svg';
import foliumLogoGold from '@/assets/folium-logo-gold.png';
import { applyTheme, THEMES, useTheme } from '@/hooks/useTheme';
import { isFoliumDarkTheme } from '@/lib/foliumTheme';
import { fetchCurrentLegalDocument, LegalDocumentRecord } from '@/lib/legalDocuments';
import AvatarPickerDialog from '@/components/AvatarPickerDialog';
import { AVATARS, AvatarId, getAvatarById, resolveAvatarSrc } from '@/lib/avatars';

type Step = 'age_gate' | 'terms' | 'basics' | 'underage_block' | 'parental_consent' | 'school' | 'avatar' | 'theme';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'error';

interface District { id: string; name: string; }
interface School { id: string; name: string; concelho: string | null; me_code?: string | null; }

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function ProfileSetup() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { currentTheme } = useTheme();
  const [step, setStep] = useState<Step>('age_gate');
  const [saving, setSaving] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Step 1: basics
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [dob, setDob] = useState('');

  // Legal acceptance
  const [termsDocument, setTermsDocument] = useState<LegalDocumentRecord | null>(null);
  const [privacyDocument, setPrivacyDocument] = useState<LegalDocumentRecord | null>(null);
  const [loadingLegal, setLoadingLegal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Step 3a: parental consent
  const [parentEmail, setParentEmail] = useState('');
  const [consentAge, setConsentAge] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  // Step 4: school
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string>('');
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState<string>('');
  const [searching, setSearching] = useState(false);

  // Step 5: theme
  const [themeId, setThemeId] = useState(currentTheme.id);
  const [avatarId, setAvatarId] = useState<AvatarId>((profile?.avatar_url as AvatarId) || AVATARS[0].id);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const selectedTheme = THEMES.find(th => th.id === themeId) || THEMES[0];
  const logo = isFoliumDarkTheme(themeId) ? foliumLogoGold : foliumLogo;

  const age = useMemo(() => calculateAge(dob), [dob]);

  const showUsernameTaken = () => {
    setUsernameStatus('error');
    setUsernameMessage(t('profileSetup.usernameTaken'));
    setStep('basics');
    window.setTimeout(() => {
      usernameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      usernameInputRef.current?.focus();
    }, 50);
  };

  const isUsernameConflict = (error: unknown) => {
    const err = error as { code?: string; message?: string; details?: string; constraint?: string } | null;
    const text = `${err?.constraint || ''} ${err?.message || ''} ${err?.details || ''}`.toLowerCase();
    return err?.code === '23505' && text.includes('username');
  };

  const handleProfileSaveError = (error: unknown) => {
    if (isUsernameConflict(error)) {
      showUsernameTaken();
      return true;
    }
    toast.error((error as { message?: string })?.message || t('profileSetup.saveError'));
    return true;
  };

  useEffect(() => {
    const trimmed = username.trim();
    if (step !== 'basics') return;
    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (!/^[a-z0-9_.]{3,}$/.test(trimmed)) {
      setUsernameStatus('error');
      setUsernameMessage(t('profileSetup.usernameInvalid'));
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage(t('profileSetup.usernameChecking'));
    const debounceId = window.setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', trimmed)
        .maybeSingle();

      if (error) {
        setUsernameStatus('error');
        setUsernameMessage(t('profileSetup.usernameCheckError'));
        return;
      }

      if (data && data.user_id !== user?.id) {
        setUsernameStatus('error');
        setUsernameMessage(t('profileSetup.usernameTaken'));
        return;
      }

      setUsernameStatus('available');
      setUsernameMessage(t('profileSetup.usernameAvailable'));
    }, 600);

    return () => clearTimeout(debounceId);
  }, [step, username, user?.id]);

  useEffect(() => {
    if (step !== 'terms') return;
    let active = true;
    setLoadingLegal(true);
    const language = profile?.language || 'pt';
    Promise.all([
      fetchCurrentLegalDocument('terms', language),
      fetchCurrentLegalDocument('privacy', language),
    ]).then(([terms, privacy]) => {
      if (!active) return;
      setTermsDocument(terms);
      setPrivacyDocument(privacy);
    }).finally(() => {
      if (active) setLoadingLegal(false);
    });
    return () => { active = false; };
  }, [step, profile?.language]);

  // Load districts when reaching school step
  useEffect(() => {
    if (step !== 'school') return;
    supabase.from('districts').select('id, name').eq('country_code', 'PT').order('name')
      .then(({ data }) => setDistricts((data || []) as District[]));
  }, [step]);

  // Search schools
  useEffect(() => {
    if (step !== 'school' || !districtId) { setSchoolResults([]); return; }
    let active = true;
    setSearching(true);
    const t = setTimeout(async () => {
      let q = supabase.from('schools').select('id, name, concelho').eq('district_id', districtId).order('name').limit(20);
      if (schoolQuery.trim()) q = q.ilike('name', `%${schoolQuery.trim()}%`);
      const { data } = await q;
      const districtName = districts.find(d => d.id === districtId)?.name;
      const fallback = districtName
        ? (FALLBACK_SCHOOLS_BY_DISTRICT[districtName] || [])
            .filter(s => !schoolQuery.trim() || s.name.toLowerCase().includes(schoolQuery.trim().toLowerCase()))
            .slice(0, 20)
            .map((s, i) => ({ id: `${districtId}-fallback-${s.me_code || i}`, name: s.name, concelho: s.concelho, me_code: s.me_code }))
        : [];
      if (active) {
        setSchoolResults(((data && data.length > 0 ? data : fallback) || []) as School[]);
        setSearching(false);
      }
    }, 200);
    return () => { active = false; clearTimeout(t); };
  }, [step, districtId, schoolQuery, districts]);

  const submitAgeGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      toast.error(t('profileSetup.requiredFields'));
      return;
    }
    if (age < 13) { setStep('underage_block'); return; }
    setStep(profile?.terms_accepted_at ? 'basics' : 'terms');
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

  // ---- Basics → next ----
  const submitBasics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !username.trim()) {
      toast.error(t('profileSetup.requiredFields'));
      return;
    }
    if (usernameStatus !== 'available') {
      usernameInputRef.current?.focus();
      return;
    }
    if (age >= 13 && age < 18) { setStep('parental_consent'); return; }
    setStep('school');
  };

  // ---- Step 3a → submit consent ----
  const submitConsent = async () => {
    if (!user) return;
    if (!parentEmail.trim() || !consentAge || !consentTerms) {
      toast.error(t('profileSetup.consentRequired'));
      return;
    }
    setSaving(true);
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName,
        username,
        date_of_birth: dob,
        parent_email: parentEmail.trim(),
        parent_consent_token: token,
        parent_consent_expires_at: expiresAt,
        parent_consent_sent_at: new Date().toISOString(),
        account_status: 'pending_parental_consent',
        profile_completed: true,
        age_group: 'under_18',
      } as any).eq('user_id', user.id);
      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke('send-parental-consent-email', {
        body: {
          parent_email: parentEmail.trim(),
          child_name: firstName,
          child_age: age,
          child_language: profile?.language || 'pt',
          consent_token: token,
          consent_expires_at: expiresAt,
        },
      });
      if (emailError) throw emailError;
    } catch (error) {
      handleProfileSaveError(error);
      setSaving(false);
      return;
    }

    setSaving(false);
    await refreshProfile();
  };

  // ---- Step 4 → next ----
  const submitSchool = async () => {
    if (!user || !districtId || !schoolId) { toast.error(t('profileSetup.schoolRequired')); return; }
    setSaving(true);

    let resolvedSchoolId = schoolId;
    if (schoolId.includes('-fallback-')) {
      const sel = schoolResults.find(s => s.id === schoolId);
      if (sel) {
        const { data: created, error: cErr } = await supabase.from('schools').insert({
          name: sel.name, concelho: sel.concelho, district_id: districtId,
          me_code: sel.me_code ?? null, school_type: 'public', education_levels: [],
          is_verified: false, submitted_by_user_id: user.id,
        } as any).select('id').single();
        if (cErr) { toast.error(cErr.message); setSaving(false); return; }
        resolvedSchoolId = created.id;
      }
    }

    try {
      const { error } = await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName,
        username,
        date_of_birth: dob,
        country_code: 'PT',
        district_id: districtId,
        school_id: resolvedSchoolId,
        age_group: age < 18 ? 'under_18' : 'over_18',
      } as any).eq('user_id', user.id);
      if (error) throw error;
    } catch (error) {
      handleProfileSaveError(error);
      setSaving(false);
      return;
    }
    setSaving(false);
    setStep('avatar');
  };

  const saveSetupAvatar = async (nextAvatarId: AvatarId) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ avatar_url: nextAvatarId } as any).eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setAvatarId(nextAvatarId);
    setAvatarPickerOpen(false);
    await refreshProfile();
  };

  const continueFromAvatar = async () => {
    if (!profile?.avatar_url) await saveSetupAvatar(avatarId);
    setStep('theme');
  };

  // ---- Step 5 → finalize ----
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
    await refreshProfile();
  };

  const previewTheme = (id: string) => {
    const theme = THEMES.find(th => th.id === id);
    if (!theme) return;
    setThemeId(id);
    applyTheme(theme);
  };

  const Header = ({ onBack }: { onBack?: () => void }) => (
    <div className="flex flex-col items-center mb-6">
      {onBack && (
        <button onClick={onBack} className="self-start text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> {t('profileSetup.back')}
        </button>
      )}
      <img src={logo} alt="Folium" className="w-40 mb-4" />
      <h1 className="font-['Cormorant_Garamond'] text-3xl text-foreground text-center">{t('profileSetup.welcomeFolium')}</h1>
      <p className="text-sm text-muted-foreground text-center mt-1 font-['Josefin_Sans']">{t('profileSetup.tellUs')}</p>
    </div>
  );

  // ===== STEP RENDERS =====

  if (step === 'age_gate') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Header />
          <form onSubmit={submitAgeGate} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('profileSetup.dateOfBirth')}</Label>
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} required
                max={new Date().toISOString().slice(0, 10)} className="h-11 text-sm" />
            </div>
            <Button type="submit" className="w-full h-11">{t('profileSetup.continue')}</Button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'underage_block') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <img src={logo} alt="Folium" className="w-40 mx-auto mb-6" />
          <h1 className="font-['Cormorant_Garamond'] text-2xl text-foreground mb-3">
            {t('profileSetup.underageTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {t('profileSetup.underageSubtitle')}
          </p>
          <Button onClick={signOut} variant="outline" className="w-full h-11">{t('profile.signOut')}</Button>
        </div>
      </div>
    );
  }

  if (step === 'terms') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Header onBack={() => setStep('age_gate')} />
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
          </div>
          <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
            <DialogContent className="bg-background border-border max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif">{t('legal.privacyTitle')}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border p-3 text-sm leading-relaxed whitespace-pre-wrap">
                {privacyDocument?.content || t('legal.documentPreparing')}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (step === 'parental_consent') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Header onBack={() => setStep('basics')} />
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-['Josefin_Sans']">
              {t('profileSetup.parentalIntro')}
            </p>
            <div className="space-y-1">
              <Label className="text-xs">{t('profileSetup.parentEmail')}</Label>
              <Input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)}
                placeholder="email@exemplo.pt" className="h-11 text-sm" />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={consentAge} onCheckedChange={v => setConsentAge(!!v)} className="mt-0.5" />
              <span>{t('profileSetup.confirmAge')}</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={consentTerms} onCheckedChange={v => setConsentTerms(!!v)} className="mt-0.5" />
              <span>{t('profileSetup.confirmConsentEmail')}</span>
            </label>
            <Button onClick={submitConsent} disabled={saving} className="w-full h-11">
              {saving ? t('profileSetup.sending') : t('profileSetup.sendConsent')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'school') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Header onBack={() => setStep('basics')} />
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-['Josefin_Sans']">{t('profileSetup.yourSchool')}</p>
            <div className="space-y-1">
              <Label className="text-xs">{t('profileSetup.district')}</Label>
              <Select value={districtId} onValueChange={v => { setDistrictId(v); setSchoolId(''); setSchoolQuery(''); }}>
                <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t('profileSetup.selectDistrict')} /></SelectTrigger>
                <SelectContent>
                  {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('profileSetup.school')}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input value={schoolQuery} onChange={e => { setSchoolQuery(e.target.value); setSchoolId(''); }}
                  placeholder={districtId ? t('profileSetup.searchSchool') : t('profileSetup.selectDistrictFirst')}
                  disabled={!districtId} className="h-11 text-sm pl-7" />
              </div>
              {districtId && (
                <div className="border border-border rounded-md max-h-48 overflow-y-auto bg-background">
                  {searching ? (
                    <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                  ) : schoolResults.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">{t('profileSetup.noResults')}</p>
                  ) : schoolResults.map(s => (
                    <button key={s.id} type="button" onClick={() => { setSchoolId(s.id); setSchoolQuery(s.name); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-b border-border last:border-0 ${schoolId === s.id ? 'bg-muted/40' : ''}`}>
                      <div className="text-foreground">{s.name}</div>
                      {s.concelho && <div className="text-xs text-muted-foreground">{s.concelho}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={submitSchool} disabled={saving || !districtId || !schoolId} className="w-full h-11">
              {saving ? t('profileSetup.saving') : t('profileSetup.continue')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'theme') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Header />
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
                  {th.description && <p className="mt-0.5 text-[10px] leading-tight italic text-muted-foreground line-clamp-2">{th.description}</p>}
                </button>
              );
            })}
          </div>
          <Button onClick={finalize} disabled={saving} className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? t('profileSetup.finishing') : t('profileSetup.enterFolium')}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'avatar') {
    const selectedAvatar = getAvatarById(avatarId);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Header onBack={() => setStep('school')} />
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground font-['Josefin_Sans']">{t('avatars.setupIntro')}</p>
            <img
              src={resolveAvatarSrc(avatarId)}
              alt={selectedAvatar?.name || t('avatars.defaultAlt')}
              className="mx-auto h-28 w-28 rounded-full border border-border object-cover"
            />
            <p className="text-sm text-foreground">{selectedAvatar?.name}</p>
            <Button type="button" variant="outline" onClick={() => setAvatarPickerOpen(true)} className="w-full h-11">
              {t('avatars.choose')}
            </Button>
            <Button onClick={continueFromAvatar} disabled={saving} className="w-full h-11">
              {t('profileSetup.continue')}
            </Button>
          </div>
          <AvatarPickerDialog
            open={avatarPickerOpen}
            value={avatarId}
            onOpenChange={setAvatarPickerOpen}
            onConfirm={saveSetupAvatar}
          />
        </div>
      </div>
    );
  }

  // STEP: basics
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Header />
        <form onSubmit={submitBasics} className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder={t('profileSetup.firstName')} value={firstName} onChange={e => setFirstName(e.target.value)} required className="h-11 text-sm" />
            <Input placeholder={t('profileSetup.lastName')} value={lastName} onChange={e => setLastName(e.target.value)} className="h-11 text-sm" />
          </div>
          <div className="space-y-1">
            <Input ref={usernameInputRef} placeholder={t('profileSetup.username')} value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              required className="h-11 text-sm" />
            {usernameMessage && (
              <p className={`flex items-center gap-1.5 text-xs font-['Josefin_Sans'] ${
                usernameStatus === 'available' ? 'text-green-600' : usernameStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {usernameStatus === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {usernameStatus === 'available' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {usernameStatus === 'error' && <XCircle className="w-3.5 h-3.5" />}
                <span>{usernameMessage}</span>
              </p>
            )}
          </div>
          <Button type="submit" disabled={usernameStatus !== 'available'} className="w-full h-11">{t('profileSetup.continue')}</Button>
        </form>
      </div>
    </div>
  );
}
