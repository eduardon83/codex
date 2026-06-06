import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppToastProvider } from "@/components/ToastNotification";
import { CelebrationProvider } from "@/components/CelebrationOverlay";
import { FoliumTutorialProvider } from "@/components/tutorial/FoliumTutorialProvider";
import TreeBackground from "@/components/TreeBackground";
import Index from "./pages/Index.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import NativeWelcomeScreen from "./pages/NativeWelcomeScreen.tsx";
import { isNative } from "@/lib/platform";
import { handleAuthCallbackUrl } from "@/lib/nativeAuth";

export { isNative };
import Admin from "./pages/Admin.tsx";
import PublicList from "./pages/PublicList.tsx";
import PublicReadingList from "./pages/PublicReadingList.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import NotFound from "./pages/NotFound.tsx";
import ParentalConsent from "./pages/ParentalConsent.tsx";
import ResetPasswordScreen from "./components/ResetPasswordScreen.tsx";
import AuthScreen from "./components/AuthScreen.tsx";
import { useAuth } from "@/hooks/useAuth";
import OwlLoader from "@/components/OwlLoader";

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <OwlLoader />
      </div>
    );
  }
  if (!user) return isNative() ? <NativeWelcomeScreen /> : <LandingPage />;
  return <Index />;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <OwlLoader />
      </div>
    );
  }
  if (user) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && redirect.startsWith('/')) {
      return <Navigate to={redirect} replace />;
    }
    return <Index />;
  }
  return <AuthScreen />;
}

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Josefin+Sans:wght@400;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Native deep-link handling: when the OS reopens the app via
  // pt.kendirstudios.codex://auth/callback#access_token=...&refresh_token=...
  // (or ?code=...), establish the Supabase session inside the app so the
  // user lands on the authenticated screens instead of being sent to the web.
  useEffect(() => {
    if (!isNative()) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        const handle = await CapApp.addListener('appUrlOpen', (event: { url: string }) => {
          if (!event?.url) return;
          if (event.url.includes('access_token') || event.url.includes('code=')) {
            void handleAuthCallbackUrl(event.url);
          }
        });
        cleanup = () => { void handle.remove(); };
      } catch {
        // @capacitor/app not available — ignore
      }
    })();
    return () => { cleanup?.(); };
  }, []);


  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <AppToastProvider>
          <CelebrationProvider>
            <FoliumTutorialProvider>
            <TooltipProvider>
              
              <Sonner />
              <TreeBackground />
              <div className="relative z-[1]">
{(() => {
                  const Router = isNative() ? HashRouter : BrowserRouter;
                  return (
                <Router>
                  <Routes>
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/auth" element={<AuthRoute />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/lista/:libraryId" element={<PublicList />} />
                    <Route path="/reading-list/:listId" element={<PublicReadingList />} />
                    <Route path="/u/:username" element={<PublicProfile />} />
                    <Route path="/reset-password" element={<ResetPasswordScreen />} />
                    <Route path="/parental-consent" element={<ParentalConsent />} />
                    <Route path="/consent" element={<ParentalConsent />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
                  );
                })()}
              </div>
            </TooltipProvider>
            </FoliumTutorialProvider>
          </CelebrationProvider>
        </AppToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
