import { useMemo, useEffect, useState } from 'react';

/* ---------------- WindParticles ---------------- */
export function WindParticles({ leafColor }: { leafColor: string }) {
  const particles = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => {
      const size = 3 + Math.random() * 3;
      const startX = Math.random() * 115 - 5;
      const duration = 10 + Math.random() * 12;
      const delay = -(Math.random() * 22);
      const driftX = Math.random() * 120 - 40;
      const wobble = Math.random() * 30 - 15;
      const rotate = Math.random() * 540 - 270;
      const opacity = 0.25 + Math.random() * 0.4;
      const isLeaf = Math.random() > 0.35;
      return { size, startX, duration, delay, driftX, wobble, rotate, opacity, isLeaf, id: i };
    });
  }, []);

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`
        @keyframes particleFall {
          0%   { opacity: 0; transform: translateY(-10px) translateX(0) rotate(0deg); }
          4%   { opacity: 1; }
          30%  { transform: translateY(28vh) translateX(var(--drift-x-30)) rotate(var(--rot-30)); }
          55%  { transform: translateY(52vh) translateX(var(--drift-x-55)) rotate(var(--rot-55)); }
          80%  { transform: translateY(78vh) translateX(var(--drift-x-80)) rotate(var(--rot-80)); }
          94%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(108vh) translateX(var(--drift-final)) rotate(var(--rot-final)); }
        }
      `}</style>
      {particles.map(p => {
        const d30 = `${p.wobble * 0.3}px`;
        const d55 = `${p.driftX * 0.55 + p.wobble}px`;
        const d80 = `${p.driftX * 0.8}px`;
        const dF = `${p.driftX}px`;
        const style: React.CSSProperties = {
          position: 'absolute',
          top: 0,
          left: `${p.startX}%`,
          width: p.size,
          height: p.size,
          opacity: p.opacity,
          animation: `particleFall ${p.duration}s linear ${p.delay}s infinite`,
          ['--drift-x-30' as any]: d30,
          ['--drift-x-55' as any]: d55,
          ['--drift-x-80' as any]: d80,
          ['--drift-final' as any]: dF,
          ['--rot-30' as any]: `${p.rotate * 0.3}deg`,
          ['--rot-55' as any]: `${p.rotate * 0.55}deg`,
          ['--rot-80' as any]: `${p.rotate * 0.8}deg`,
          ['--rot-final' as any]: `${p.rotate}deg`,
        };
        return p.isLeaf ? (
          <span
            key={p.id}
            style={{
              ...style,
              background: leafColor,
              borderRadius: '50% 0 50% 50%',
            }}
          />
        ) : (
          <span
            key={p.id}
            style={{
              ...style,
              background: leafColor,
              borderRadius: '50%',
              opacity: p.opacity * 0.6,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- ReadingBird ---------------- */
function SingleBird({ heightPct, delaySec, durationSec }: { heightPct: number; delaySec: number; durationSec: number }) {
  const scale = heightPct < 20 ? 22 : 32;
  const opacity = heightPct < 20 ? 0.35 : 0.55;
  return (
    <svg
      viewBox="0 0 64 32"
      width={scale}
      height={scale * 0.5}
      aria-hidden
      style={{
        position: 'absolute',
        top: `${heightPct}%`,
        left: '-10%',
        opacity,
        animation: `birdFly ${durationSec}s linear ${delaySec}s 1`,
      }}
    >
      <path
        d="M2 18 Q12 6 22 18 Q32 6 42 18 Q52 6 62 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animate
          attributeName="d"
          values="
            M2 18 Q12 6 22 18 Q32 6 42 18 Q52 6 62 18;
            M2 14 Q12 22 22 14 Q32 22 42 14 Q52 22 62 14;
            M2 18 Q12 6 22 18 Q32 6 42 18 Q52 6 62 18"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function ReadingBird({ color }: { color: string }) {
  const [flights, setFlights] = useState<{ id: number; heightPct: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    let timer: number;
    let id = 0;

    const schedule = () => {
      // Random interval between flights: 18–40s
      const next = 18000 + Math.random() * 22000;
      timer = window.setTimeout(() => {
        const heightPct = 8 + Math.random() * 30; // 8–38%
        const duration = 14 + Math.random() * 8;
        const first = { id: id++, heightPct, delay: 0, duration };
        const pair: typeof flights = [first];
        if (Math.random() < 0.3) {
          const offset = (Math.random() * 10 - 5);
          pair.push({
            id: id++,
            heightPct: Math.max(2, Math.min(45, heightPct + offset)),
            delay: 0.8 + Math.random() * 0.7,
            duration: duration + (Math.random() * 2 - 1),
          });
        }
        setFlights(pair);
        // Clear after flight ends
        const maxLife = (pair[pair.length - 1].delay + pair[pair.length - 1].duration + 1) * 1000;
        window.setTimeout(() => setFlights([]), maxLife);
        schedule();
      }, next);
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', color, overflow: 'hidden' }}>
      <style>{`
        @keyframes birdFly {
          0% { transform: translateX(0); }
          100% { transform: translateX(120vw); }
        }
      `}</style>
      {flights.map(f => (
        <SingleBird key={f.id} heightPct={f.heightPct} delaySec={f.delay} durationSec={f.duration} />
      ))}
    </div>
  );
}

/* ---------------- AmbientParticles (fireflies / dust motes) ---------------- */
export const NOCTURNAL_THEMES = ['marialva', 'sortelha', 'idanha', 'trancoso', 'linhares', 'castelo-mendo'];

export function AmbientParticles({ themeId, glowColor }: { themeId: string; glowColor: string }) {
  const isNight = NOCTURNAL_THEMES.includes(themeId);
  const count = 12;

  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 20 + Math.random() * 55,
        size: isNight ? 1.5 + Math.random() * 2 : 1 + Math.random() * 1.5,
        pulseDuration: 2.5 + Math.random() * 3,
        pulseDelay: -(Math.random() * 5),
        driftDuration: 15 + Math.random() * 20,
        driftDelay: -(Math.random() * 20),
        driftX: Math.random() * 40 - 20,
        driftY: Math.random() * 20 - 10,
      })),
    [isNight]
  );

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes fireflyPulse {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.4); }
        }
        @keyframes fireflyDrift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(var(--drift-x), var(--drift-y)); }
          66% { transform: translate(calc(var(--drift-x) * -0.5), calc(var(--drift-y) * 0.8)); }
        }
      `}</style>
      {dots.map(dot => (
        <span
          key={dot.id}
          style={{
            position: 'absolute',
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            animation: `fireflyDrift ${dot.driftDuration}s ease-in-out ${dot.driftDelay}s infinite`,
            ['--drift-x' as any]: `${dot.driftX}px`,
            ['--drift-y' as any]: `${dot.driftY}px`,
          }}
        >
          <span
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: glowColor,
              boxShadow: isNight
                ? `0 0 ${dot.size * 4}px ${dot.size}px ${glowColor}`
                : 'none',
              opacity: isNight ? 0.7 : 0.35,
              animation: `fireflyPulse ${dot.pulseDuration}s ease-in-out ${dot.pulseDelay}s infinite`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
