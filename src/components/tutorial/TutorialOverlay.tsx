import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  TUTORIALS,
  TutorialScreen,
  markTutorialSeen,
} from './tutorialSteps';
import { useContent } from '@/hooks/useContent';

function TutorialText({ stepKey, fallback, className, style }: { stepKey: string; fallback?: string; className?: string; style?: React.CSSProperties }) {
  const text = useContent(stepKey);
  return <span className={className} style={style}>{text || fallback || ''}</span>;
}

interface TutorialOverlayProps {
  screen: TutorialScreen;
  open: boolean;
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const CARD_WIDTH = 320;
const CARD_GAP = 16;

export default function TutorialOverlay({ screen, open, onClose }: TutorialOverlayProps) {
  const tHelp = useContent('tutorial.help');
  const tPrev = useContent('tutorial.previous');
  const tNext = useContent('tutorial.next');
  const tClose = useContent('tutorial.close');
  const tNotVisible = useContent('tutorial.notVisibleHint');
  const steps = TUTORIALS[screen];
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  // Reset index whenever it (re)opens
  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open, screen]);

  const measure = useCallback(() => {
    if (!open) return;
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    const step = steps[stepIndex];
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    // Bring it into view first.
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    // Wait for scroll then measure (rAF a couple of times).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top - PADDING,
          left: r.left - PADDING,
          width: r.width + PADDING * 2,
          height: r.height + PADDING * 2,
        });
      });
    });
  }, [open, steps, stepIndex]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!open) return;
    const handler = () => measure();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [open, measure]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleClose = useCallback(() => {
    markTutorialSeen(screen);
    onClose();
  }, [screen, onClose]);

  if (!open) return null;

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  // Compute card position
  let cardTop: number;
  let cardLeft: number;
  let centered = false;
  if (rect) {
    // Prefer below the highlight; fall back to above; else center.
    const spaceBelow = viewport.h - (rect.top + rect.height);
    const cardHeight = 180; // estimate
    if (spaceBelow > cardHeight + CARD_GAP + 24) {
      cardTop = rect.top + rect.height + CARD_GAP;
    } else if (rect.top > cardHeight + CARD_GAP + 24) {
      cardTop = rect.top - cardHeight - CARD_GAP;
    } else {
      cardTop = Math.max(16, viewport.h / 2 - cardHeight / 2);
    }
    cardLeft = Math.min(
      Math.max(16, rect.left + rect.width / 2 - CARD_WIDTH / 2),
      viewport.w - CARD_WIDTH - 16
    );
  } else {
    centered = true;
    cardTop = Math.max(40, viewport.h / 2 - 90);
    cardLeft = Math.max(16, viewport.w / 2 - CARD_WIDTH / 2);
  }

  const overlay = (
    <div className="fixed inset-0 z-[100] animate-fade-in" role="dialog" aria-modal="true" aria-label="Tutorial">
      {/* SVG mask for true cut-out */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={handleClose}
      >
        <defs>
          <mask id={`tutorial-mask-${screen}`}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={8}
                ry={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.72)"
          mask={`url(#tutorial-mask-${screen})`}
        />
        {/* Subtle highlight ring */}
        {rect && (
          <rect
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx={8}
            ry={8}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        className="absolute bg-background border border-border rounded-lg shadow-xl p-5 animate-scale-in"
        style={{
          top: cardTop,
          left: cardLeft,
          width: CARD_WIDTH,
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label={tClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X size={16} />
        </button>

        <h3
          className="text-foreground mb-2 pr-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', lineHeight: 1.2 }}
        >
          <TutorialText stepKey={step.titleKey} />
        </h3>
        <p
          className="text-muted-foreground text-sm leading-relaxed mb-4"
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          <TutorialText stepKey={step.descriptionKey} />
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
            {stepIndex + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={() => setStepIndex(i => Math.max(0, i - 1))}
                className="text-xs px-3 py-1.5 border border-border rounded text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {tPrev}
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))}
                className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90 transition-opacity"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {tNext}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90 transition-opacity"
                style={{ fontFamily: "'Josefin Sans', sans-serif" }}
              >
                {tClose}
              </button>
            )}
          </div>
        </div>
        {centered && (
          <p className="text-[10px] text-muted-foreground mt-3 italic" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
            {tNotVisible}
          </p>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
