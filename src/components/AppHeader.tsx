import foliumIcon from '@/assets/folium-icon.svg';
import { useTheme } from '@/hooks/useTheme';

// Old gold for dark themes, deeper gold for the light "Claro" theme
const OLD_GOLD_DARK = '#C9A24A';
const OLD_GOLD_LIGHT = '#A8832A';

export default function AppHeader() {
  const { currentTheme } = useTheme();
  const isClaro = currentTheme.id === 'claro';
  const goldColor = isClaro ? OLD_GOLD_LIGHT : OLD_GOLD_DARK;

  return (
    <div className="px-4 pt-3 pb-1 max-w-lg mx-auto flex items-center gap-[10px]">
      <img
        src={foliumIcon}
        alt="Folium"
        className="h-7 w-auto"
        style={{ color: goldColor, filter: 'none' }}
      />
      <h1
        className="font-serif italic leading-none"
        style={{
          fontWeight: 500,
          fontSize: '24px',
          letterSpacing: '-0.01em',
          color: goldColor,
        }}
      >
        Folium
      </h1>
    </div>
  );
}
