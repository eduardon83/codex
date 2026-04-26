import foliumIcon from '@/assets/folium-icon.svg';
import foliumIconGold from '@/assets/folium-icon-gold.png';
import { useTheme } from '@/hooks/useTheme';
import { isFoliumDarkTheme } from '@/lib/foliumTheme';

export default function AppHeader() {
  const { currentTheme } = useTheme();
  const isDark = isFoliumDarkTheme(currentTheme.id);
  const icon = isDark ? foliumIconGold : foliumIcon;

  return (
    <div className="px-4 pt-3 pb-1 max-w-lg mx-auto flex items-center gap-[10px]">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="h-7 w-auto"
      />
      <div
        className="font-serif italic leading-none"
        style={{
          fontWeight: 500,
          fontSize: '24px',
          color: isDark ? 'hsl(var(--gold))' : 'hsl(var(--foreground))',
        }}
      >
        Folium
      </div>
    </div>
  );
}
