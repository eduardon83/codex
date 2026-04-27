import { useEffect, useRef } from 'react';
import type { LegalBlock } from '@/config/landingLegal';

const GOLD = '#C9A84C';
const BG = '#1E2A22';
const BG2 = '#2F3E33';
const TEXT = '#F0E8D8';
const MUTED = '#CFC6B0';

interface LandingInfoModalProps {
  open: boolean;
  title: string;
  blocks: LegalBlock[];
  onClose: () => void;
  closeLabel?: string;
}

export default function LandingInfoModal({ open, title, blocks, onClose, closeLabel = 'Close' }: LandingInfoModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 22, 18, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        animation: 'folium-modal-fade 0.2s ease',
      }}
    >
      <style>{`
        @keyframes folium-modal-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes folium-modal-rise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .folium-modal-scroll::-webkit-scrollbar { width: 8px; }
        .folium-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .folium-modal-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 4px; }
        .folium-modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.45); }
        .folium-modal-close:hover { color: ${GOLD} !important; border-color: ${GOLD} !important; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          background: BG,
          border: `0.5px solid rgba(201,168,76,0.3)`,
          borderRadius: 4,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Josefin Sans', sans-serif",
          color: TEXT,
          animation: 'folium-modal-rise 0.28s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem',
          borderBottom: '0.5px solid rgba(139,161,139,0.2)',
          background: `linear-gradient(to bottom, ${BG2} 0%, ${BG} 100%)`,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '1.6rem',
            color: GOLD,
            letterSpacing: '0.01em',
          }}>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="folium-modal-close"
            style={{
              background: 'transparent',
              border: '0.5px solid rgba(160,152,128,0.35)',
              color: MUTED,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: 2,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              transition: 'color 0.2s, border-color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>{closeLabel}</span>
          </button>
        </div>

        {/* Body */}
        <div
          className="folium-modal-scroll"
          style={{
            overflowY: 'auto',
            padding: '2rem 2rem 2.5rem',
          }}
        >
          {blocks.map((b, i) => {
            if (b.type === 'eyebrow') {
              return (
                <p key={i} style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: '0 0 1rem',
                  fontWeight: 600,
                }}>{b.text}</p>
              );
            }
            if (b.type === 'lead') {
              return (
                <p key={i} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: '1.15rem',
                  lineHeight: 1.6,
                  color: TEXT,
                  margin: '0 0 1.75rem',
                }}>{b.text}</p>
              );
            }
            if (b.type === 'h2') {
              return (
                <h3 key={i} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: '1.5rem',
                  color: GOLD,
                  margin: '2.25rem 0 1rem',
                  paddingTop: '1rem',
                  borderTop: '0.5px solid rgba(201,168,76,0.18)',
                }}>{b.text}</h3>
              );
            }
            if (b.type === 'h3') {
              return (
                <h4 key={i} style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: TEXT,
                  margin: '1.5rem 0 0.5rem',
                }}>{b.text}</h4>
              );
            }
            return (
              <p key={i} style={{
                fontSize: '0.85rem',
                fontWeight: 300,
                lineHeight: 1.75,
                color: MUTED,
                margin: '0 0 0.85rem',
              }}>{b.text}</p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
