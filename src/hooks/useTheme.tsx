import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeOption {
  id: string;
  name: string;
  colors: [string, string, string, string]; // bg-primary, bg-secondary, accent, text-primary
}

export const THEMES: ThemeOption[] = [
  { id: 'claro', name: 'Claro', colors: ['#FAFAF8', '#F0EDE8', '#6B8E7F', '#2C2A26'] },
  { id: 'mauve_night', name: 'Mauve Night', colors: ['#331D2C', '#3F2E3E', '#A78295', '#EFE1D1'] },
  { id: 'deep_ocean', name: 'Deep Ocean', colors: ['#000B58', '#003161', '#006A67', '#FFF4B7'] },
  { id: 'cosmic', name: 'Cosmic', colors: ['#090040', '#471396', '#B13BFF', '#FFCC00'] },
  { id: 'forest_lodge', name: 'Forest Lodge', colors: ['#2C3930', '#3F4F44', '#A27B5C', '#DCD7C9'] },
  { id: 'charcoal_linen', name: 'Charcoal Linen', colors: ['#222831', '#393E46', '#948979', '#DFD0B8'] },
];

function hexToHSL(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;
  const [bgPrimary, bgSecondary, accent, textPrimary] = theme.colors.map(hexToHSL);

  root.style.setProperty('--background', bgPrimary);
  root.style.setProperty('--foreground', textPrimary);
  root.style.setProperty('--card', bgSecondary);
  root.style.setProperty('--card-foreground', textPrimary);
  root.style.setProperty('--popover', bgSecondary);
  root.style.setProperty('--popover-foreground', textPrimary);
  root.style.setProperty('--primary', textPrimary);
  root.style.setProperty('--primary-foreground', bgPrimary);
  root.style.setProperty('--secondary', bgSecondary);
  root.style.setProperty('--secondary-foreground', textPrimary);
  root.style.setProperty('--muted', bgSecondary);
  root.style.setProperty('--muted-foreground', accent);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-foreground', bgPrimary);
  root.style.setProperty('--gold', accent);
  root.style.setProperty('--gold-foreground', textPrimary);
  root.style.setProperty('--border', bgSecondary);
  root.style.setProperty('--input', bgSecondary);
  root.style.setProperty('--ring', textPrimary);
  root.style.setProperty('--destructive', '0 60% 50%');
  root.style.setProperty('--destructive-foreground', bgPrimary);

  root.style.setProperty('--sidebar-background', bgPrimary);
  root.style.setProperty('--sidebar-foreground', textPrimary);
  root.style.setProperty('--sidebar-primary', textPrimary);
  root.style.setProperty('--sidebar-primary-foreground', bgPrimary);
  root.style.setProperty('--sidebar-accent', bgSecondary);
  root.style.setProperty('--sidebar-accent-foreground', textPrimary);
  root.style.setProperty('--sidebar-border', bgSecondary);
  root.style.setProperty('--sidebar-ring', textPrimary);
}

interface ThemeContextType {
  theme: string;
  currentTheme: ThemeOption;
  availableThemes: ThemeOption[];
  setTheme: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [themeId, setThemeIdState] = useState('claro');

  useEffect(() => {
    if (profile) {
      const th = (profile as any).theme || 'claro';
      setThemeIdState(th);
    }
  }, [profile]);

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = async (id: string) => {
    setThemeIdState(id);
    if (user) {
      await supabase.from('profiles').update({ theme: id } as any).eq('user_id', user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themeId, currentTheme, availableThemes: THEMES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
