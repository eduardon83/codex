import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, Square, X } from 'lucide-react';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  formatClock,
  formatHumanDuration,
  saveReadingSession,
  type SelectedBookForSession,
  type SessionMode,
} from '@/lib/readingSessions';
import { getReadingBackground, getParticleColors } from '@/lib/readingBackgrounds';
import { WindParticles, ReadingBird, AmbientParticles } from './ReadingParticles';

interface Props {
  book: SelectedBookForSession;
  mode: SessionMode;
  targetSeconds?: number;
  keepScreenOn: boolean;
  onClose: (saved: { durationSeconds: number } | null) => void;
}

export default function ReadingModeScreen({ book, mode, targetSeconds, keepScreenOn, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeDef = THEMES.find(th => th.id === theme);
  const accent = themeDef?.colors[2] || '#C9A84C';
  const bg = themeDef?.colors[0] || '#1E2A22';
  const text = themeDef?.colors[3] || '#F0E8D8';
  const bgSrc = getReadingBackground(themeDef?.id ?? 'claro');
  const particles = getParticleColors(themeDef?.id ?? 'claro');


  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const startedAtRef = useRef<Date>(new Date());
  const wakeLockRef = useRef<any>(null);
  const inactivityRef = useRef<number | null>(null);


  useEffect(() => {
    if (!keepScreenOn) return;
    let cancelled = false;
    const request = async () => {
      try {
        if (navigator.wakeLock?.request) {
          const lock = await navigator.wakeLock.request('screen');
          if (!cancelled) wakeLockRef.current = lock;
        }
      } catch { }
    };
    request();
    const onVis = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      try { wakeLockRef.current?.release?.(); } catch { }
      wakeLockRef.current = null;
    };
  }, [keepScreenOn]);

  useEffect(() => {
    if (paused || completed) return;
    const id = window.setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (mode === 'timer' && targetSeconds && next >= targetSeconds) {
          window.clearInterval(id);
          setCompleted(true);
          return targetSeconds;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused, completed, mode, targetSeconds]);

  const resetInactivity = () => {
    setControlsHidden(false);
    if (inactivityRef.current) window.clearTimeout(inactivityRef.current);
    inactivityRef.current = window.setTimeout(() => setControlsHidden(true), 5000);
  };

  useEffect(() => {
    resetInactivity();
    return () => { if (inactivityRef.current) window.clearTimeout(inactivityRef.current); };
  }, []);

  const elapsedRef = useRef(0);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  useEffect(() => {
    if (!completed) return;
    persistAndClose(true);
    const t = window.setTimeout(() => onClose({ durationSeconds: elapsedRef.current }), 3000);
    return () => window.clearTimeout(t);
  }, [completed]);

  const persistAndClose = async (auto: boolean) => {
    if (!user) return;
    const dur = elapsedRef.current;
    if (dur < 5) return;
    await saveReadingSession({
      userId: user.id,
      book,
      startedAt: startedAtRef.current,
      endedAt: new Date(),
      durationSeconds: dur,
      mode,
      timerTargetSeconds: targetSeconds ?? null,
      completed: mode === 'timer' ? !!auto && dur >= (targetSeconds || 0) : true,
    });
  };

  const display = useMemo(() => {
    if (mode === 'timer' && targetSeconds) return formatClock(Math.max(0, targetSeconds - elapsed));
    return formatClock(elapsed);
  }, [mode, targetSeconds, elapsed]);

  const handleEndConfirmed = async () => {
    setConfirmEnd(false);
    await persistAndClose(false);
    onClose({ durationSeconds: elapsedRef.current });
  };

  const handleAbandonConfirmed = () => {
    setConfirmAbandon(false);
    onClose(null);
  };



  const burst = useMemo(
    () => Array.from({ length: 26 }).map((_, i) => {
      const angle = (i / 26) * Math.PI * 2;
      const dist = 180 + Math.random() * 120;
      return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, delay: Math.random() * 0.2 };
    }),
    [completed]
  );

  return (
    <div
      onMouseMove={resetInactivity}
      onTouchStart={resetInactivity}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: bg, color: text,
        fontFamily: "'Josefin Sans', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes sceneBreathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes reading-leaf-float {
          0% { transform: translateY(20px) translateX(0); opacity: 0; }
          15% { opacity: .7; }
          100% { transform: translateY(-110vh) translateX(40px); opacity: 0; }
        }
        @keyframes reading-bg-pulse { 0% { filter: brightness(1); } 50% { filter: brightness(1.25); } 100% { filter: brightness(1); } }
        @keyframes reading-burst {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(.4); opacity: 0; }
        }
      `}</style>

      {/* Background layer: village landscape */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${bgSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transformOrigin: 'center center',
          animation: completed
            ? 'reading-bg-pulse 0.8s ease-out forwards'
            : 'sceneBreathe 18s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Legibility overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.15)',
          pointerEvents: 'none',
        }}
      />


      {!completed && (
        <>
          <WindParticles leafColor={particles.leaf} />
          <ReadingBird color={particles.glow} />
          <AmbientParticles themeId={themeDef?.id ?? 'claro'} glowColor={particles.glow} />
        </>
      )}

      <button
        onClick={() => setConfirmAbandon(true)}
        aria-label={t('reading_mode.abandon', 'Abandonar sessão?')}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 2,
          background: 'transparent', border: 'none', color: text, opacity: controlsHidden ? 0 : 0.6,
          transition: 'opacity 0.4s', cursor: 'pointer', padding: 8,
        }}
      >
        <X size={20} />
      </button>

      <div
        style={{
          position: 'relative', zIndex: 1,
          height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px', textAlign: 'center', gap: 18,
        }}
      >
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt=""
            style={{
              width: 160, height: 224, objectFit: 'cover',
              borderRadius: 6, boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              opacity: paused ? 0.45 : 1, transition: 'opacity 0.3s',
            }}
          />
        ) : (
          <div
            style={{
              width: 160, height: 224, borderRadius: 6,
              background: accent, color: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              fontSize: 48, fontWeight: 600,
              opacity: paused ? 0.45 : 1, transition: 'opacity 0.3s',
            }}
          >
            {book.title.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div style={{ maxWidth: 480 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            fontSize: '1.5rem', margin: 0, color: text, lineHeight: 1.2,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{book.title}</h2>
          {book.author && (
            <p style={{ fontSize: '0.8rem', color: text, opacity: 0.6, marginTop: 6 }}>{book.author}</p>
          )}
        </div>

        {!completed ? (
          <div style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '3rem', color: accent, letterSpacing: '0.02em',
            opacity: paused ? 0.6 : 1, transition: 'opacity 0.3s',
          }}>
            {display}
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '3.5rem', color: accent, letterSpacing: '0.02em',
              textShadow: `0 0 20px ${accent}`,
            }}>
              {formatHumanDuration(elapsedRef.current, i18n.language)}
            </div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              fontSize: '1.2rem', color: text, opacity: 0.85,
            }}>
              {formatHumanDuration(elapsedRef.current, i18n.language)}{' '}
              {t('reading_mode.celebration', 'de leitura. Bem lido.')}
            </p>
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {burst.map((p, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 10, height: 10, marginLeft: -5, marginTop: -5,
                    borderRadius: '50% 0 50% 50%', background: accent,
                    ['--dx' as any]: `${p.dx}px`, ['--dy' as any]: `${p.dy}px`,
                    animation: `reading-burst 2s ease-out ${p.delay}s forwards`,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {!completed && (
        <div
          style={{
            position: 'absolute', bottom: 36, left: 0, right: 0, zIndex: 2,
            display: 'flex', justifyContent: 'center', gap: 14,
            opacity: controlsHidden ? 0 : 1, transition: 'opacity 0.4s',
          }}
        >
          <button
            onClick={() => { setPaused(p => !p); resetInactivity(); }}
            aria-label={paused ? 'Continuar' : 'Pausar'}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.25)', border: `1px solid ${accent}40`,
              color: text, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {paused ? <Play size={22} /> : <Pause size={22} />}
          </button>
          <button
            onClick={() => setConfirmEnd(true)}
            aria-label="Terminar"
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.25)', border: `1px solid ${accent}40`,
              color: text, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Square size={20} />
          </button>
        </div>
      )}

      <AlertDialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reading_mode.end_confirm', 'Terminar a sessão?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {formatHumanDuration(elapsed, i18n.language)} {t('reading_mode.end_recorded', 'registados.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('reading_mode.continue_reading', 'Continuar')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndConfirmed}>{t('reading_mode.end_action', 'Terminar')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAbandon} onOpenChange={setConfirmAbandon}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reading_mode.abandon', 'Abandonar sessão?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reading_mode.abandon_desc', 'A sessão não será guardada.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('reading_mode.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbandonConfirmed}>{t('reading_mode.abandon_action', 'Abandonar')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
