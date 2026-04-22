import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppToastProvider } from "@/components/ToastNotification";
import { CelebrationProvider } from "@/components/CelebrationOverlay";
import TreeBackground from "@/components/TreeBackground";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import PublicList from "./pages/PublicList.tsx";
import NotFound from "./pages/NotFound.tsx";
import ParentalConsent from "./pages/ParentalConsent.tsx";

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

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <AppToastProvider>
          <CelebrationProvider>
            <TooltipProvider>
              
              <Sonner />
              <TreeBackground />
              <div className="relative z-[1]">
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/lista/:libraryId" element={<PublicList />} />
                    <Route path="/parental-consent" element={<ParentalConsent />} />
                    <Route path="/consent" element={<ParentalConsent />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
            </TooltipProvider>
          </CelebrationProvider>
        </AppToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
