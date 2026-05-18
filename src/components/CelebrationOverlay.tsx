import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type CelebrationType = 'library' | 'book' | 'loan';

interface CelebrationContextType {
  celebrate: (type: CelebrationType) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

const LABELS: Record<CelebrationType, string> = {
  library: 'New library created.',
  book: 'Added to your library.',
  loan: 'Loaned with care.',
};

function OwlSVG() {
  return (
    <motion.svg
      width="80" height="80" viewBox="0 0 80 80" fill="none"
      stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ scale: { type: 'spring', stiffness: 200, damping: 12 }, rotate: { duration: 1.5, ease: 'easeInOut' } }}
    >
      <circle cx="40" cy="36" r="22" />
      <circle cx="32" cy="32" r="6" />
      <circle cx="48" cy="32" r="6" />
      <circle cx="32" cy="32" r="2" />
      <circle cx="48" cy="32" r="2" />
      <path d="M36 42 L40 46 L44 42" />
      <path d="M18 30 L12 18" />
      <path d="M62 30 L68 18" />
      <path d="M30 58 L40 68 L50 58" />
    </motion.svg>
  );
}

function BookSVG() {
  return (
    <motion.svg
      width="80" height="80" viewBox="0 0 80 80" fill="none"
      stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <rect x="16" y="12" width="48" height="56" rx="2" />
      <path d="M24 12 L24 68" />
      <motion.path
        d="M32 20 L56 20"
        animate={{ d: ['M32 20 L56 20', 'M30 18 L54 22', 'M32 20 L56 20'] }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />
      <motion.path
        d="M32 28 L52 28"
        animate={{ d: ['M32 28 L52 28', 'M30 26 L50 30', 'M32 28 L52 28'] }}
        transition={{ duration: 0.8, delay: 0.7 }}
      />
      <motion.path
        d="M32 36 L48 36"
        animate={{ d: ['M32 36 L48 36', 'M30 34 L46 38', 'M32 36 L48 36'] }}
        transition={{ duration: 0.8, delay: 0.8 }}
      />
    </motion.svg>
  );
}

function HeartSVG() {
  return (
    <motion.svg
      width="80" height="80" viewBox="0 0 80 80" fill="none"
      stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      animate={{
        scale: [1, 1.3, 1, 1.2, 1],
        y: [0, 0, 0, 0, -40],
        opacity: [1, 1, 1, 1, 0],
      }}
      transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 1] }}
    >
      <path d="M40 68 C20 50 8 38 8 26 C8 16 16 8 26 8 C32 8 37 11 40 16 C43 11 48 8 54 8 C64 8 72 16 72 26 C72 38 60 50 40 68Z" />
    </motion.svg>
  );
}

const SVG_MAP: Record<CelebrationType, () => JSX.Element> = {
  library: OwlSVG,
  book: BookSVG,
  loan: HeartSVG,
};

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<CelebrationType | null>(null);

  const celebrate = useCallback((type: CelebrationType) => {
    setActive(type);
    setTimeout(() => setActive(null), 2500);
  }, []);

  const dismiss = () => setActive(null);
  const SVGComponent = active ? SVG_MAP[active] : null;

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            {SVGComponent && <SVGComponent />}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-base italic"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'hsl(var(--accent))',
              }}
            >
              {LABELS[active]}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebration must be used within CelebrationProvider');
  return ctx;
}
