import owlLogo from '@/assets/owl_logo.png';
import { useTheme } from '@/hooks/useTheme';

export default function AppHeader() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme.id !== 'claro';
  const goldColor = isDark ? '#D4A843' : '#A8832A';

  return (
    <div className="px-4 pt-3 pb-1 max-w-lg mx-auto flex items-center gap-[10px]">
      <img src={owlLogo} alt="Bibliotheca" className="h-7" />
      <h1
        className="font-serif leading-none"
        style={{
          fontWeight: 600,
          fontSize: '20px',
          letterSpacing: '0.12em',
          color: goldColor,
        }}
      >
        Bibliotheca
      </h1>
    </div>
  );
}
