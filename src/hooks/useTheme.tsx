import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeOption {
  id: string;
  name: string;
  tree: 'claro' | 'olmo' | 'carvalho' | 'betula' | 'oliveira';
  description?: string;
  description_en?: string;
  description_es?: string;
  description_fr?: string;
  // [deepest, deep, accent, highlight]
  colors: [string, string, string, string];
}

export function getThemeDescription(theme: ThemeOption, language?: string): string {
  const lang = (language || 'pt').slice(0, 2).toLowerCase();
  if (lang === 'en' && theme.description_en) return theme.description_en;
  if (lang === 'es' && theme.description_es) return theme.description_es;
  if (lang === 'fr' && theme.description_fr) return theme.description_fr;
  return theme.description ?? '';
}

/* ==========================================================
   FOLIUM PALETTE LIBRARY — from folium_12_palettes.html
   Organised by "tree" mood. Each palette is 4 tones:
   deepest → deep → accent → highlight
   ========================================================== */
export const THEMES: ThemeOption[] = [
  // Light default
  { id: 'claro', name: 'Claro', tree: 'claro', colors: ['#FAFAF8', '#F0EDE8', '#6B8E7F', '#2C2A26'] },

  // Olmo · scholarly, tall — ink skies + warm gold
  { id: 'idanha',         name: 'Idanha-a-Velha',  tree: 'olmo',     description: 'Vila romana com 2000 anos. Ruínas, oliveiras e uma catedral visigótica.', description_en: 'A 2000-year-old Roman town. Ruins, olive trees and an ancient Visigothic cathedral.', description_es: 'Ciudad romana de 2000 años. Ruinas, olivos y una catedral visigótica.', description_fr: 'Ville romaine vieille de 2000 ans. Ruines, oliviers et une cathédrale wisigothique.', colors: ['#0B2545', '#1B3A6B', '#4A90C7', '#FFD166'] },
  { id: 'marialva',       name: 'Marialva',        tree: 'olmo',     description: 'Aldeia em ruínas sobre o vale do Côa. Lenda, silêncio e vinhas.', description_en: 'A ruined village above the Côa valley. Legend, silence and vineyards.', description_es: 'Pueblo en ruinas sobre el valle del Côa. Leyenda, silencio y viñedos.', description_fr: 'Village en ruines au-dessus de la vallée du Côa. Légende, silence et vignes.', colors: ['#1A2E2A', '#2A4742', '#6B8E7F', '#F5E6C0'] },
  { id: 'piodao',         name: 'Piódão',          tree: 'olmo',     description: 'Aldeia de xisto escuro com portas azuis, encravada na Serra do Açor.', description_en: 'A dark schist village with blue doors, nestled in the Serra do Açor mountains.', description_es: 'Pueblo de pizarra oscura con puertas azules, enclavado en la Sierra del Açor.', description_fr: 'Village de schiste sombre aux portes bleues, niché dans la Serra do Açor.', colors: ['#1A1F28', '#1F3347', '#D4A556', '#EDDAAE'] },

  // Carvalho · warm, grand
  { id: 'almeida',        name: 'Almeida',         tree: 'carvalho', description: 'Fortaleza em forma de estrela, a maior do seu tipo em Portugal.', description_en: 'A star-shaped fortress, the largest of its kind in Portugal.', description_es: 'Fortaleza en forma de estrella, la mayor de su tipo en Portugal.', description_fr: 'Forteresse en étoile, la plus grande du genre au Portugal.', colors: ['#1E1A2E', '#2D2445', '#7A5B9A', '#F0B27A'] },
  { id: 'trancoso',       name: 'Trancoso',        tree: 'carvalho', description: 'Cidade-muralha onde D. Dinis se casou. Judiarias, lendas e Bandarra.', description_en: 'A walled town where King Dinis married. Jewish quarters, legends and Bandarra.', description_es: 'Ciudad amurallada donde se casó el rey Dinis. Juderías, leyendas y Bandarra.', description_fr: "Ville fortifiée où le roi Dinis s'est marié. Quartiers juifs, légendes et Bandarra.", colors: ['#1A0B2E', '#3B1552', '#9B4DCA', '#FFB627'] },
  { id: 'castelo-rod',    name: 'Castelo Rodrigo', tree: 'carvalho', description: 'Aldeia fortificada no alto, rodeada de oliveiras centenárias e amendoeiras.', description_en: 'A hilltop fortified village surrounded by centuries-old olive trees and almond groves.', description_es: 'Pueblo fortificado en lo alto, rodeado de olivos centenarios y almendros.', description_fr: "Village fortifié en hauteur entouré d'oliviers centenaires et d'amandiers.", colors: ['#231708', '#402811', '#D19C45', '#F5D789'] },

  // Bétula · delicate, light
  { id: 'belmonte',       name: 'Belmonte',        tree: 'betula',   description: 'Terra de Pedro Álvares Cabral e de uma antiga comunidade judaica.', description_en: 'Birthplace of Pedro Álvares Cabral and home to an ancient Jewish community.', description_es: 'Tierra de Pedro Álvares Cabral y de una antigua comunidad judía.', description_fr: "Terre de Pedro Álvares Cabral et d'une ancienne communauté juive.", colors: ['#2B1D24', '#4A2F38', '#C98A82', '#F4DFC5'] },
  { id: 'monsanto',       name: 'Monsanto',        tree: 'betula',   description: 'Casas construídas entre e sob enormes rochedos e um castelo imponente.', description_en: 'Houses built between and beneath enormous boulders, below an imposing castle.', description_es: 'Casas construidas entre y bajo enormes rocas y un imponente castillo.', description_fr: "Maisons construites entre et sous d'énormes rochers, sous un château imposant.", colors: ['#2A1F3D', '#3E2D52', '#D66F93', '#FFC9B5'] },
  { id: 'sortelha',       name: 'Sortelha',        tree: 'betula',   description: 'Castelo medieval perfeitamente preservado, envolto em muralha de granito.', description_en: 'A perfectly preserved medieval castle enclosed by granite walls.', description_es: 'Castillo medieval perfectamente conservado, rodeado de murallas de granito.', description_fr: 'Château médiéval parfaitement conservé, entouré de murailles en granite.', colors: ['#1E2A22', '#2F3E33', '#B5704A', '#F0B860'] },

  // Oliveira · poetry, elevation
  { id: 'castelo-mendo',  name: 'Castelo Mendo',   tree: 'oliveira', description: 'Aldeia esquecida no tempo. Um javali de pedra guarda a porta principal.', description_en: 'A village forgotten by time. A stone boar guards the main gate.', description_es: 'Pueblo olvidado en el tiempo. Un jabalí de piedra guarda la puerta principal.', description_fr: 'Village oublié dans le temps. Un sanglier de pierre garde la porte principale.', colors: ['#1A2320', '#2C3830', '#8BA18B', '#E8DCC4'] },
  { id: 'castelo-novo',   name: 'Castelo Novo',    tree: 'oliveira', description: 'Granito imponente e nascentes termais, ao pé da Serra da Gardunha.', description_en: 'Imposing granite and thermal springs at the foot of the Serra da Gardunha.', description_es: 'Granito imponente y manantiales termales al pie de la Sierra de la Gardunha.', description_fr: 'Granite imposant et sources thermales au pied de la Serra da Gardunha.', colors: ['#1F1A15', '#3A2D20', '#BA8554', '#F1E2BC'] },
  { id: 'linhares',       name: 'Linhares da Beira', tree: 'oliveira', description: 'Aldeia suspensa entre o céu e a Serra da Estrela. Ponto de parapente.', description_en: 'A village suspended between sky and the Serra da Estrela. Paragliding capital.', description_es: 'Pueblo suspendido entre el cielo y la Sierra de la Estrella. Punto de parapente.', description_fr: 'Village suspendu entre ciel et Serra da Estrela. Haut lieu du parapente.', colors: ['#16192E', '#262B47', '#7C88B5', '#E0DCEA'] },
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

export function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;
  const [bgPrimary, bgSecondary, accent, textPrimary] = theme.colors.map(hexToHSL);
  // Derive a muted-foreground that always passes WCAG AA contrast against card bg.
  // We start from textPrimary and shift its lightness toward 65% (for dark themes)
  // or 38% (for light themes) so muted text retains >=4.5:1 contrast on card surfaces.
  const parseHSL = (s: string) => { const [h, sat, l] = s.split(' '); return { h: parseFloat(h), s: parseFloat(sat), l: parseFloat(l) }; };
  const bgL = parseHSL(bgSecondary).l;
  const tp = parseHSL(textPrimary);
  const mutedL = bgL < 50 ? 72 : 35;
  const mutedFg = `${tp.h} ${Math.min(tp.s, 15)}% ${mutedL}%`;

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
  root.style.setProperty('--muted-foreground', mutedFg);
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

  const profileTheme = (profile as any)?.theme || null;
  useEffect(() => {
    if (profileTheme) {
      const exists = THEMES.find(t => t.id === profileTheme);
      setThemeIdState(exists ? profileTheme : 'claro');
    }
  }, [profileTheme]);

  const currentTheme = useMemo(
    () => THEMES.find(t => t.id === themeId) || THEMES[0],
    [themeId]
  );

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
