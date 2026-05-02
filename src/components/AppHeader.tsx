import foliumLogo from '@/assets/folium-logo.svg';
import foliumLogoGold from '@/assets/folium-logo-gold.png';
import { useTheme } from '@/hooks/useTheme';
import { isCodexDarkTheme } from '@/lib/foliumTheme';

export default function AppHeader() {
  const { currentTheme } = useTheme();
  const isDark = isCodexDarkTheme(currentTheme.id);
  const logo = isDark ? foliumLogoGold : foliumLogo;

  return (
    <div className="px-4 pt-3 pb-1 max-w-lg mx-auto flex items-center">
      <img
        src={logo}
        alt="Codex"
        className="h-9 w-auto"
      />
    </div>
  );
}
