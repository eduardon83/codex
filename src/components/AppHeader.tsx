import owlGold from '@/assets/codex-owl-gold.png';
import owlDark from '@/assets/codex-owl-dark.png';
import { useTheme } from '@/hooks/useTheme';
import { isFoliumDarkTheme } from '@/lib/foliumTheme';
import { LoanBellBadge } from '@/components/loans/LoanNotifications';

export default function AppHeader() {
  const { currentTheme } = useTheme();
  const isDark = isFoliumDarkTheme(currentTheme.id);
  const owl = isDark ? owlGold : owlDark;

  return (
    <div className="px-4 pt-3 pb-1 max-w-lg mx-auto flex items-center gap-2">
      <img src={owl} alt="Codex" className="h-9 w-9 object-contain" />
      <span className="font-serif text-2xl" style={{ color: 'hsl(var(--foreground))', letterSpacing: '0.02em' }}>
        Codex
      </span>
      <div className="ml-auto"><LoanBellBadge /></div>
    </div>
  );
}

