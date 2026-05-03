import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import ProfileSetup from '@/components/ProfileSetup';
import PendingParentalConsent from '@/components/PendingParentalConsent';
import BottomNav from '@/components/BottomNav';
import AppHeader from '@/components/AppHeader';
import LibraryScreen from '@/components/LibraryScreen';
import AddBookScreen from '@/components/AddBookScreen';
import BookDetail from '@/components/BookDetail';
import ProfileScreen from '@/components/ProfileScreen';
import ProcurarLivroScreen from '@/components/ProcurarLivroScreen';
import ListasScreen from '@/components/ListasScreen';
import PublicLibraryDetail from '@/components/PublicLibraryDetail';
import OwlLoader from '@/components/OwlLoader';

type Tab = 'library' | 'lists' | 'find' | 'profile' | 'add';

interface PublicLibraryView {
  libraryId: string;
  libraryName: string;
  ownerUserId: string;
  ownerUsername: string | null;
}

export default function Index() {
  const { t } = useTranslation();
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [publicLibView, setPublicLibView] = useState<PublicLibraryView | null>(null);
  const [routingReady, setRoutingReady] = useState(false);

  // 200ms grace period after auth/profile resolves to avoid flash
  useEffect(() => {
    if (loading) { setRoutingReady(false); return; }
    const t = setTimeout(() => setRoutingReady(true), 200);
    return () => clearTimeout(t);
  }, [loading, user, profile]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('folium-active-tab', { detail: { tab: activeTab } }));
  }, [activeTab]);

  useEffect(() => {
    const handler = (event: Event) => {
      const tab = (event as CustomEvent).detail?.tab as Tab | undefined;
      if (tab) { setSelectedBookId(null); setPublicLibView(null); setActiveTab(tab); }
    };
    window.addEventListener('folium-tutorial-navigate', handler);
    return () => window.removeEventListener('folium-tutorial-navigate', handler);
  }, []);

  if (loading || (user && !routingReady)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <OwlLoader />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  // Suspended account screen
  if (profile?.suspended) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-foreground mb-2">
            {t('app.accountSuspended')}
          </h1>
          <p className="text-muted-foreground text-sm font-['Josefin_Sans']">
            {t('app.accountSuspendedDesc')}
          </p>
        </div>
      </div>
    );
  }

  // Profile-based routing
  if (!profile || profile.account_status === 'pending_setup' || !profile.profile_completed) {
    return <ProfileSetup />;
  }

  if (profile.account_status === 'pending_parental_consent') {
    return <PendingParentalConsent />;
  }

  if (profile.account_status === 'blocked_underage') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-['Cormorant_Garamond'] text-2xl text-foreground mb-2">Codex</h1>
          <p className="text-muted-foreground text-sm font-['Josefin_Sans']">
            {t('app.underageBlocked')}
          </p>
        </div>
      </div>
    );
  }

  // Public library detail view
  if (publicLibView) {
    return (
      <>
        <PublicLibraryDetail
          libraryId={publicLibView.libraryId}
          libraryName={publicLibView.libraryName}
          ownerUserId={publicLibView.ownerUserId}
          ownerUsername={publicLibView.ownerUsername}
          onBack={() => setPublicLibView(null)}
        />
        <BottomNav active={activeTab === 'add' ? 'library' : activeTab} onChange={(tab) => { setPublicLibView(null); setActiveTab(tab); }} />
      </>
    );
  }

  // Book detail view
  if (selectedBookId) {
    return (
      <>
        <BookDetail bookId={selectedBookId} onBack={() => setSelectedBookId(null)} />
        <BottomNav active={activeTab === 'add' ? 'library' : activeTab} onChange={(tab) => { setSelectedBookId(null); setActiveTab(tab); }} />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main id="main-content" tabIndex={-1}>
        {activeTab === 'library' && (
          <LibraryScreen
            onBookSelect={setSelectedBookId}
            onAddBook={() => setActiveTab('add')}
            onWishlist={() => setActiveTab('lists')}
            onGoToProfile={() => setActiveTab('profile')}
          />
        )}
        {activeTab === 'add' && (
          <AddBookScreen onDone={() => setActiveTab('library')} />
        )}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'find' && (
          <ProcurarLivroScreen
            onGoToProfile={() => setActiveTab('profile')}
            onOpenLibrary={(lib) => setPublicLibView(lib)}
          />
        )}
        {activeTab === 'lists' && (
          <ListasScreen onGoToSearchReadingLists={() => { localStorage.setItem('folium_procurar_tab', 'readingLists'); setActiveTab('find'); }} />
        )}
      </main>
      <BottomNav active={activeTab === 'add' ? 'library' : activeTab} onChange={setActiveTab} />
    </>
  );
}
