import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

const TREE_THEMES: Record<string, string> = {
  deep_ocean: '/src/assets/tree-elm.svg',
  cosmic: '/src/assets/tree-oak.svg',
  mauve_night: '/src/assets/tree-birch.svg',
};

// We load SVG inline for stroke-dashoffset animation
const TREE_URLS: Record<string, () => Promise<string>> = {
  deep_ocean: () => import('@/assets/tree-elm.svg?raw').then(m => m.default),
  cosmic: () => import('@/assets/tree-oak.svg?raw').then(m => m.default),
  mauve_night: () => import('@/assets/tree-birch.svg?raw').then(m => m.default),
};

export default function TreeBackground() {
  const { theme, currentTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const animatedRef = useRef(false);

  const isTreeTheme = theme in TREE_URLS;

  useEffect(() => {
    if (!isTreeTheme) {
      setSvgContent(null);
      return;
    }
    animatedRef.current = false;
    TREE_URLS[theme]().then(raw => {
      // Replace stroke color with current accent
      setSvgContent(raw);
    });
  }, [theme, isTreeTheme]);

  // Animate paths on mount
  useEffect(() => {
    if (!svgContent || !containerRef.current || animatedRef.current) return;
    animatedRef.current = true;

    const paths = containerRef.current.querySelectorAll('path.branch');
    paths.forEach((path, i) => {
      const p = path as SVGPathElement;
      const length = p.getTotalLength();
      p.style.strokeDasharray = `${length}`;
      p.style.strokeDashoffset = `${length}`;
      p.style.transition = `stroke-dashoffset 1.2s ease-out ${i * 0.08}s`;
      // Force reflow
      p.getBoundingClientRect();
      p.style.strokeDashoffset = '0';
    });
  }, [svgContent]);

  if (!isTreeTheme || !svgContent) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none flex items-end justify-center overflow-hidden"
      style={{ opacity: 0.18 }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
