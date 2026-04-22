import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogOut, Check, Camera, User, BookOpen, CalendarDays, History } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import i18n from '@/i18n';
import AboutScreen from '@/components/AboutScreen';
import SchoolSelector from '@/components/SchoolSelector';
import ProfileStats from '@/components/ProfileStats';
import ReadingHistoryScreen from '@/components/ReadingHistoryScreen';
import CalendarScreen from '@/components/CalendarScreen';
import LoanHistoryScreen from '@/components/LoanHistoryScreen';
import FavouritesSection from '@/components/profile/FavouritesSection';
import CurrentlyReadingSection from '@/components/profile/CurrentlyReadingSection';
import LibraryCardsSection from '@/components/profile/LibraryCardsSection';
import PendingRequestsSection from '@/components/profile/PendingRequestsSection';
import ActiveLoansSection from '@/components/profile/ActiveLoansSection';
import HelpButton from '@/components/tutorial/HelpButton';
import { fetchCurrentLegalDocument, LegalDocumentRecord, LegalDocumentType } from '@/lib/legalDocuments';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, availableThemes, setTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', bio: '' });
  const [bookCount, setBookCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLoanHistory, setShowLoanHistory] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalDocumentType | null>(null);
  const [legalDocument, setLegalDocument] = useState<LegalDocumentRecord | null>(null);
  const [loadingLegal, setLoadingLegal] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const displayProfile = {
    first_name: editing ? form.first_name : profile?.first_name || '',
    last_name: editing ? form.last_name : profile?.last_name || '',
    username: editing ? form.username : profile?.username || '',
    bio: editing ? form.bio : profile?.bio || '',
  };

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      });
    }
    if (user) {
      supabase.from('books').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_wishlist', false).then(({ count }) => setBookCount(count || 0));
      supabase.from('libraries').select('id', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => setLibraryCount(count || 0));
    }
  }, [profile, user]);

  const save = async () => {
    if (!user) return;
    await supabase.from('profiles').upsert({ user_id: user.id, ...form } as any, { onConflict: 'user_id' });
    await refreshProfile();
    setEditing(false);
  };

  const saveLocation = async (data: { name: string; lat: number; lng: number }) => {
    if (!user) return;
    await supabase.from('profiles').update({
      location: data.name,
      location_lat: data.lat,
      location_lng: data.lng,
    } as any).eq('user_id', user.id);
    await refreshProfile();
  };

  const changeLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    if (user) {
      await supabase.from('profiles').update({ language: lang } as any).eq('user_id', user.id);
      await refreshProfile();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const url = await uploadFileToStorage('profile-photos', path, file);
    if (url) {
      await supabase.from('profiles').update({ avatar_url: url } as any).eq('user_id', user.id);
      await refreshProfile();
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const openLegalDocument = async (type: LegalDocumentType) => {
    setLegalModal(type);
    setLegalDocument(null);
    setLoadingLegal(true);
    const document = await fetchCurrentLegalDocument(type, profile?.language || 'pt');
    setLegalDocument(document);
    setLoadingLegal(false);
  };

  if (showAbout) return <AboutScreen onBack={() => setShowAbout(false)} />;
  if (showReadingHistory) return <ReadingHistoryScreen onBack={() => setShowReadingHistory(false)} />;
  if (showCalendar) return <CalendarScreen onBack={() => setShowCalendar(false)} />;
  if (showLoanHistory) return <LoanHistoryScreen onBack={() => setShowLoanHistory(false)} />;

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-foreground">{t('profile.title')}</h2>
        <HelpButton screen="profile" />
      </div>

      {/* 1. Header block */}
      <div className="flex items-start gap-4 mb-6">
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <button onClick={() => avatarInputRef.current?.click()} className="relative group flex-shrink-0">
          {(profile as any)?.avatar_url ? (
            <img src={(profile as any).avatar_url} alt="" className="w-20 h-20 rounded-full object-cover group-hover:opacity-80 transition-opacity" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:bg-secondary/70 transition-colors">
              <User size={28} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-accent text-accent-foreground rounded-full p-1">
            <Camera size={12} />
          </div>
        </button>

        {!editing ? (
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px' }}>
              {[displayProfile.first_name, displayProfile.last_name].filter(Boolean).join(' ')}
            </p>
            {displayProfile.username && <p className="text-sm text-muted-foreground">@{displayProfile.username}</p>}
            <div className="mt-1">
              <SchoolSelector
                current={{
                  country_code: (profile as any)?.country_code ?? null,
                  district_id: (profile as any)?.district_id ?? null,
                  school_id: (profile as any)?.school_id ?? null,
                }}
                onSaved={refreshProfile}
              />
            </div>
            {displayProfile.bio && (
              <p className="text-xs text-foreground mt-2">{displayProfile.bio}</p>
            )}
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="mt-3">
              {t('profile.editProfile')}
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex gap-2">
              <Input value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder={t('profile.firstName')} className="bg-background border-border text-sm h-9" />
              <Input value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder={t('profile.lastName')} className="bg-background border-border text-sm h-9" />
            </div>
            <Input value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder={t('profile.username')} className="bg-background border-border text-sm h-9" />
            <SchoolSelector
              current={{
                country_code: (profile as any)?.country_code ?? null,
                district_id: (profile as any)?.district_id ?? null,
                school_id: (profile as any)?.school_id ?? null,
              }}
              onSaved={refreshProfile}
            />
            <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder={t('profile.bio')} className="bg-background border-border text-sm resize-none" rows={2} maxLength={280} />
            <div className="flex gap-2">
              <Button onClick={save} size="sm" className="flex-1">{t('profile.save')}</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="flex-1">{t('profile.cancel')}</Button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Quick stats row */}
      <div data-tutorial="profile-stats" className="flex gap-6 mb-2 text-center justify-center border-y border-border py-4">
        <div>
          <p className="text-2xl font-serif text-foreground">{bookCount}</p>
          <p className="text-xs text-muted-foreground">{t('profile.books')}</p>
        </div>
        <div>
          <p className="text-2xl font-serif text-foreground">{libraryCount}</p>
          <p className="text-xs text-muted-foreground">{t('profile.libraries')}</p>
        </div>
      </div>

      {/* 3. Favourite books */}
      <div data-tutorial="profile-favourites">
        <FavouritesSection />
      </div>

      {/* 4. Currently reading */}
      <CurrentlyReadingSection />

      {/* 4.5 Pending loan requests + active loans (Folium) */}
      <PendingRequestsSection />
      <ActiveLoansSection />

      {/* 5. Reading List button */}
      <Button
        data-tutorial="profile-reading-list"
        variant="outline"
        onClick={() => setShowReadingHistory(true)}
        className="w-full mt-6 flex items-center gap-2"
      >
        <BookOpen size={16} />
        {t('readingHistory.title')}
      </Button>

      {/* 6. Calendar button */}
      <Button
        variant="outline"
        onClick={() => setShowCalendar(true)}
        className="w-full mt-3 flex items-center gap-2"
      >
        <CalendarDays size={16} />
        {t('calendar.title', 'Calendário')}
      </Button>

      {/* 6.6 Loan history */}
      <Button
        variant="outline"
        onClick={() => setShowLoanHistory(true)}
        className="w-full mt-3 flex items-center gap-2"
      >
        <History size={16} />
        {t('loanHistory.title', 'Histórico de empréstimos')}
      </Button>

      {/* 6.5 Library cards */}
      <LibraryCardsSection />

      {/* 7. Stats grid */}
      <ProfileStats />

      {/* 8. Settings */}
      <div className="mt-6" data-tutorial="profile-theme">
        <p className="text-sm text-muted-foreground mb-3">{t('profile.theme')}</p>
        <div className="grid grid-cols-2 gap-3">
          {availableThemes.map(th => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`relative p-3 border rounded transition-colors text-left ${
                theme === th.id ? 'border-foreground' : 'border-border hover:border-foreground'
              }`}
            >
              <div className="flex h-6 rounded overflow-hidden mb-2">
                {th.colors.map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-xs text-foreground">{th.name}</p>
              {theme === th.id && (
                <Check size={14} className="absolute top-2 right-2 text-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-muted-foreground mb-2">{t('profile.language')}</p>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                (profile?.language || i18n.language) === lang.code
                  ? 'border-foreground text-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-5">
        <p className="text-sm text-muted-foreground mb-3">{t('legal.groupTitle')}</p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => openLegalDocument('terms')}>
            {t('legal.termsTitle')}
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => openLegalDocument('privacy')}>
            {t('legal.privacyTitle')}
          </Button>
          <div className="text-xs text-muted-foreground border border-border rounded-md px-3 py-2">
            <span className="text-foreground">{t('legal.acceptedVersion')}</span>{' '}
            {(profile as any)?.terms_version || '—'}
            {(profile as any)?.terms_accepted_at && (
              <span className="block mt-1">{t('legal.acceptedOn', { date: new Date((profile as any).terms_accepted_at).toLocaleDateString(profile?.language || 'pt') })}</span>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!legalModal} onOpenChange={(open) => !open && setLegalModal(null)}>
        <DialogContent className="bg-background border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {legalModal === 'privacy' ? t('legal.privacyTitle') : t('legal.termsTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {loadingLegal ? t('app.loading') : (legalDocument?.content || t('legal.documentPreparing'))}
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={() => setShowAbout(true)}
        className="mt-8 text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors"
      >
        {t('about.title')}
      </button>

      <button
        onClick={signOut}
        className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive w-full justify-center transition-colors"
      >
        <LogOut size={14} /> {t('profile.signOut')}
      </button>
    </div>
  );
}
