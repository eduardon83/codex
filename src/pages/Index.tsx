import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/AuthScreen';
import ProfileSetup from '@/components/ProfileSetup';
import BottomNav from '@/components/BottomNav';
import AppHeader from '@/components/AppHeader';
import LibraryScreen from '@/components/LibraryScreen';
import AddBookScreen from '@/components/AddBookScreen';
import BookDetail from '@/components/BookDetail';
import ProfileScreen from '@/components/ProfileScreen';
import FindLibrariesScreen from '@/components/FindLibrariesScreen';
import WishlistScreen from '@/components/WishlistScreen';
import PublicLibraryDetail from '@/components/PublicLibraryDetail';
import OwlLoader from '@/components/OwlLoader';

type Tab = 'library' | 'add' | 'profile' | 'find' | 'wishlist';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <OwlLoader />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  // Suspended account screen
  if (profile?.suspended) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-foreground mb-2">
            {t('app.accountSuspended', 'Account Suspended')}
          </h1>
          <p className="text-muted-foreground text-sm font-['Josefin_Sans']">
            {t('app.accountSuspendedDesc', 'Your account has been suspended. Please contact support for more information.')}
          </p>
        </div>
      </div>
    );
  }

  if (profile && !profile.profile_completed) return <ProfileSetup />;

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
        <BottomNav active={activeTab} onChange={(tab) => { setPublicLibView(null); setActiveTab(tab); }} />
      </>
    );
  }

  // Book detail view
  if (selectedBookId) {
    return (
      <>
        <BookDetail bookId={selectedBookId} onBack={() => setSelectedBookId(null)} />
        <BottomNav active={activeTab} onChange={(tab) => { setSelectedBookId(null); setActiveTab(tab); }} />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      {activeTab === 'library' && (
        <LibraryScreen
          onBookSelect={setSelectedBookId}
          onAddBook={() => setActiveTab('add')}
          onWishlist={() => setActiveTab('wishlist')}
          onGoToProfile={() => setActiveTab('profile')}
        />
      )}
      {activeTab === 'add' && (
        <AddBookScreen onDone={() => setActiveTab('library')} />
      )}
      {activeTab === 'profile' && <ProfileScreen />}
      {activeTab === 'find' && (
        <FindLibrariesScreen
          onGoToProfile={() => setActiveTab('profile')}
          onOpenLibrary={(lib) => setPublicLibView(lib)}
        />
      )}
      {activeTab === 'wishlist' && (
        <WishlistScreen />
      )}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </>
  );
}
