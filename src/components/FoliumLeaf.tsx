interface FoliumLeafProps {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Official Codex leaf mark — shared SVG used in nav, headers, auth, etc.
 * Mirrors src/assets/folium-icon.svg so visuals stay consistent everywhere.
 */
export default function FoliumLeaf({
  width = 28,
  height = 36,
  stroke = '#C9A84C',
  strokeWidth = 2,
  className,
  ariaHidden = true,
}: FoliumLeafProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 260"
      width={width}
      height={height}
      fill="none"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden ? true : undefined}
    >
      <path d="M 100,20 Q 158,70 160,135 Q 160,195 100,210 Q 40,195 40,135 Q 42,70 100,20 Z" />
      <line x1="100" y1="22" x2="100" y2="208" />
      <line x1="100" y1="210" x2="100" y2="240" strokeWidth={strokeWidth * 1.2} />
      <path d="M 100,50 Q 80,58 58,66" />
      <path d="M 100,78 Q 75,88 50,100" />
      <path d="M 100,108 Q 72,120 46,135" />
      <path d="M 100,138 Q 74,148 52,162" />
      <path d="M 100,168 Q 78,175 62,184" />
      <path d="M 100,190 Q 85,194 75,198" />
      <line x1="105" y1="50" x2="142" y2="50" />
      <line x1="105" y1="70" x2="150" y2="70" />
      <line x1="105" y1="90" x2="145" y2="90" />
      <line x1="105" y1="110" x2="153" y2="110" />
      <line x1="105" y1="130" x2="148" y2="130" />
      <line x1="105" y1="150" x2="152" y2="150" />
      <line x1="105" y1="170" x2="140" y2="170" />
      <line x1="105" y1="190" x2="135" y2="190" />
    </svg>
  );
}
