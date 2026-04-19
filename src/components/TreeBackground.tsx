import { useEffect, useRef, useState } from 'react';
import { useTheme, THEMES } from '@/hooks/useTheme';

// Inline SVG raw imports (one per tree species)
const TREE_LOADERS: Record<string, () => Promise<string>> = {
  olmo: () => import('@/assets/tree-olmo.svg?raw').then(m => m.default),
  carvalho: () => import('@/assets/tree-carvalho.svg?raw').then(m => m.default),
  betula: () => import('@/assets/tree-betula.svg?raw').then(m => m.default),
  oliveira: () => import('@/assets/tree-oliveira.svg?raw').then(m => m.default),
};

export default function TreeBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const animatedRef = useRef(false);

  const themeDef = THEMES.find(t => t.id === theme);
  const treeKey = themeDef?.tree && themeDef.tree !== 'claro' ? themeDef.tree : null;

  useEffect(() => {
    if (!treeKey) {
      setSvgContent(null);
      return;
    }
    animatedRef.current = false;
    TREE_LOADERS[treeKey]().then(raw => setSvgContent(raw));
  }, [treeKey]);

  useEffect(() => {
    if (!svgContent || !containerRef.current || animatedRef.current) return;
    animatedRef.current = true;

    const paths = containerRef.current.querySelectorAll('path.branch');
    paths.forEach((path, i) => {
      const p = path as SVGPathElement;
      const length = p.getTotalLength();
      p.style.strokeDasharray = `${length}`;
      p.style.strokeDashoffset = `${length}`;
      p.style.transition = `stroke-dashoffset 1.2s ease-out ${i * 0.06}s`;
      p.getBoundingClientRect();
      p.style.strokeDashoffset = '0';
    });
  }, [svgContent]);

  if (!treeKey || !svgContent) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none flex items-end justify-center overflow-hidden"
      style={{ opacity: 0.18, color: 'hsl(var(--accent))' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
