import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogOut, Check, BookOpen, CalendarDays, History } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import i18n from '@/i18n';
import AboutScreen from '@/components/AboutScreen';
import RoleRequestModal from '@/components/RoleRequestModal';
import ProContentSection from '@/components/profile/ProContentSection';
import ProfileStats from '@/components/ProfileStats';
import { Badge } from '@/components/ui/badge';
import { useUserRoles } from '@/hooks/useUserRoles';
import ReadingHistoryScreen from '@/components/ReadingHistoryScreen';
import CalendarScreen from '@/components/CalendarScreen';
import FavouritesSection from '@/components/profile/FavouritesSection';
import CurrentlyReadingSection from '@/components/profile/CurrentlyReadingSection';
import HelpButton from '@/components/tutorial/HelpButton';

import UserAvatar from '@/components/UserAvatar';
import { uploadFileToStorage } from '@/lib/storage';
import { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, availableThemes, setTheme } = useTheme();
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', bio: '' });
  const [bookCount, setBookCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showRoleRequest, setShowRoleRequest] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'warning' | 'confirm'>('warning');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const activeLoanCount = 0;
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoUrl = /^https?:/.test(profile?.avatar_url || '') ? (profile?.avatar_url as string) : null;
  const hasPasswordProvider = Boolean(
    (user as any)?.identities?.some((identity: any) => identity.provider === 'email') ||
    (user as any)?.app_metadata?.provider === 'email'
  );
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

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) { toast.error(t('profileSetup.photoMustBeImage', 'Carrega uma imagem')); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error(t('profileSetup.photoTooLarge', 'Imagem demasiado grande (máx 5MB)')); return; }
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const url = await uploadFileToStorage('profile-photos', `${user.id}/avatar.${ext}`, file);
    if (!url) { toast.error(t('profileSetup.photoUploadError', 'Não foi possível enviar a foto')); setUploadingPhoto(false); return; }
    await supabase.from('profiles').update({ avatar_url: url } as any).eq('user_id', user.id);
    await refreshProfile();
    setUploadingPhoto(false);
  };

  const removePhoto = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_url: null } as any).eq('user_id', user.id);
    await refreshProfile();
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const openDeleteAccount = () => {
    setDeleteStep('warning');
    setDeletePassword('');
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleteError('');
    setDeletingAccount(true);

    if (hasPasswordProvider) {
      const { error } = await supabase.auth.signInWithPassword({ email: user.email || '', password: deletePassword });
      if (error) {
        setDeleteError(t('profile.deleteAccountPasswordError'));
        setDeletingAccount(false);
        return;
      }
    }

    const { error } = await supabase.functions.invoke('delete-account', { body: { userId: user.id } });
    if (error) {
      setDeleteError(error.message || t('profile.deleteAccountError'));
      setDeletingAccount(false);
      return;
    }

    setDeleteDialogOpen(false);
    await signOut();
    toast.success(t('profile.accountDeleted'));
  };

  if (showAbout) return <AboutScreen onBack={() => setShowAbout(false)} />;
  if (showReadingHistory) return <ReadingHistoryScreen onBack={() => setShowReadingHistory(false)} />;
  if (showCalendar) return <CalendarScreen onBack={() => setShowCalendar(false)} />;
  

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-foreground"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.75rem', color: 'hsl(var(--accent, var(--foreground)))' }}
        >
          {t('profile.title')}
        </h1>
        <HelpButton screen="profile" />
      </div>

      {/* 1. Header block */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 space-y-2 text-center">
          <UserAvatar
            photoUrl={photoUrl}
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            username={profile?.username}
            size={80}
          />
          <input
            ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadPhoto(f);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />
          <div className="flex flex-col gap-1">
            <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px]"
              onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
              <Upload className="w-3 h-3 mr-1" />
              {photoUrl ? t('profile.changePhoto', 'Alterar') : t('profile.uploadPhoto', 'Enviar foto')}
            </Button>
            {photoUrl && (
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={removePhoto}>
                <Trash2 className="w-3 h-3 mr-1" /> {t('profile.removePhoto', 'Remover')}
              </Button>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px' }}>
              {[displayProfile.first_name, displayProfile.last_name].filter(Boolean).join(' ')}
            </p>
            {displayProfile.username && <p className="text-sm text-muted-foreground">@{displayProfile.username}</p>}
            <div className="mt-1" data-tutorial="school-selector">
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
            <div data-tutorial="school-selector">
            <SchoolSelector
              current={{
                country_code: (profile as any)?.country_code ?? null,
                district_id: (profile as any)?.district_id ?? null,
                school_id: (profile as any)?.school_id ?? null,
              }}
              onSaved={refreshProfile}
            />
            </div>
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

      <div className="mt-8 border-t border-border pt-5 space-y-2">
        <p className="text-sm text-muted-foreground mb-3">{t('profile.proRoleSection', 'Conta profissional')}</p>
        <Button variant="outline" className="w-full justify-start" onClick={() => setShowRoleRequest(true)}>
          {t('roleRequest.openButton', 'Pedir conta de Livraria, Autor ou Influencer')}
        </Button>
      </div>

      <ProContentSection />

      <div className="mt-8 border-t border-border pt-5">
        <p className="text-sm text-muted-foreground mb-3">{t('about.title')}</p>
        <Button variant="outline" className="w-full justify-start" onClick={() => setShowAbout(true)}>
          {t('about.title')}
        </Button>
      </div>

      <RoleRequestModal open={showRoleRequest} onOpenChange={setShowRoleRequest} />

      <div className="mt-8 border-t border-border pt-5">
        <button
          onClick={openDeleteAccount}
          className="w-full text-center text-sm text-destructive hover:underline transition-colors"
        >
          {t('profile.deleteAccount')}
        </button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              {deleteStep === 'warning' ? t('profile.deleteAccountWarningTitle') : t('profile.deleteAccountConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <span className="block">
                {deleteStep === 'warning'
                  ? t('profile.deleteAccountWarningBody')
                  : hasPasswordProvider
                    ? t('profile.deleteAccountPasswordBody')
                    : t('profile.deleteAccountOAuthBody')}
              </span>
              {deleteStep === 'warning' && activeLoanCount > 0 && (
                <span className="block text-destructive/80">{t('profile.deleteAccountActiveLoans')}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteStep === 'confirm' && hasPasswordProvider && (
            <div className="space-y-2">
              <Input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder={t('auth.password')}
                className="bg-background border-border"
              />
              {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            </div>
          )}
          {deleteStep === 'confirm' && !hasPasswordProvider && deleteError && (
            <p className="text-xs text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>{t('profile.cancel')}</AlertDialogCancel>
            {deleteStep === 'warning' ? (
              <AlertDialogAction onClick={(e) => { e.preventDefault(); setDeleteStep('confirm'); }}>
                {t('profile.deleteAccountContinue')}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={(e) => { e.preventDefault(); deleteAccount(); }}
                disabled={deletingAccount || (hasPasswordProvider && !deletePassword)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletingAccount ? t('profile.deleteAccountDeleting') : (hasPasswordProvider ? t('profile.deleteAccountPermanent') : t('profile.deleteAccountConfirmOAuth'))}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <button
        onClick={signOut}
        className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive w-full justify-center transition-colors"
      >
        <LogOut size={14} /> {t('profile.signOut')}
      </button>
    </div>
  );
}
