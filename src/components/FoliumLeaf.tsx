import owlGold from '@/assets/codex-owl-gold.png';
import owlDark from '@/assets/codex-owl-dark.png';

interface FoliumLeafProps {
  width?: number;
  height?: number;
  /** Stroke colour hint — '#C9A84C' (gold) → gold owl, anything else → dark owl. */
  stroke?: string;
  /** Force a specific variant. Overrides stroke heuristic. */
  variant?: 'gold' | 'dark';
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Codex owl mark — replaces the original Folium leaf.
 * Component name kept for backwards compatibility with existing imports.
 */
export default function FoliumLeaf({
  width = 28,
  height = 36,
  stroke = '#C9A84C',
  variant,
  className,
  ariaHidden = true,
}: FoliumLeafProps) {
  const useGold = variant ? variant === 'gold' : stroke?.toUpperCase() === '#C9A84C';
  const src = useGold ? owlGold : owlDark;
  // Keep visual size similar to the leaf: prefer max(width, height) so square owl reads correctly.
  const size = Math.max(width, height);
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden={ariaHidden ? true : undefined}
      style={{ display: 'inline-block', objectFit: 'contain' }}
    />
  );
}
