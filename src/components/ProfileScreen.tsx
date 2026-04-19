import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Check, Camera, User, BookOpen, CalendarDays } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import i18n from '@/i18n';
import AboutScreen from '@/components/AboutScreen';
import LocationSelector from '@/components/LocationSelector';
import ProfileStats from '@/components/ProfileStats';
import ReadingHistoryScreen from '@/components/ReadingHistoryScreen';
import CalendarScreen from '@/components/CalendarScreen';
import FavouritesSection from '@/components/profile/FavouritesSection';
import CurrentlyReadingSection from '@/components/profile/CurrentlyReadingSection';
import LibraryCardsSection from '@/components/profile/LibraryCardsSection';
import HelpButton from '@/components/tutorial/HelpButton';

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
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    await supabase.from('profiles').update(form as any).eq('user_id', user!.id);
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

  if (showAbout) return <AboutScreen onBack={() => setShowAbout(false)} />;
  if (showReadingHistory) return <ReadingHistoryScreen onBack={() => setShowReadingHistory(false)} />;
  if (showCalendar) return <CalendarScreen onBack={() => setShowCalendar(false)} />;

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
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            <div className="mt-1">
              <LocationSelector currentName={profile?.location || null} onSave={saveLocation} />
            </div>
            {profile?.bio && (
              <p className="text-xs text-foreground mt-2">{profile.bio}</p>
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
            <LocationSelector currentName={profile?.location || null} onSave={saveLocation} />
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
