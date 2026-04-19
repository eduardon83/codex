import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastItem {
  id: number;
  message: string;
}

interface AppToastContextType {
  showToast: (message: string) => void;
}

const AppToastContext = createContext<AppToastContextType | undefined>(undefined);

let toastId = 0;

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, duration?: number) => {
    const id = ++toastId;
    setTimeout(() => {
      setToasts(prev => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration ?? 3000);
    }, 200);
  }, []);

  return (
    <AppToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto px-5 py-3 rounded-xl border text-sm font-sans"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                background: 'hsl(var(--secondary) / 0.85)',
                borderColor: 'hsl(var(--accent) / 0.3)',
                color: 'hsl(var(--foreground))',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
              }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  const ctx = useContext(AppToastContext);
  if (!ctx) throw new Error('useAppToast must be used within AppToastProvider');
  return ctx;
}
