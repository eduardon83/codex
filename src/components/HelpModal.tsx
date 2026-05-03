import { useEffect, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useContent } from '@/hooks/useContent';

/**
 * Static help button + modal. Replaces the previous interactive tutorial.
 * Content is sourced from the `app_content` table (category: 'help', keys:
 * help.title, help.intro, help.bullet_1 … help.bullet_5) so it can be edited
 * from the backoffice CMS without code changes.
 */
export default function HelpModal({ screen: _screen, autoOnFirstVisit: _a, autoDelay: _b }: {
  screen?: string;
  autoOnFirstVisit?: boolean;
  autoDelay?: number;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const title = useContent('help.title');
  const intro = useContent('help.intro');
  const b1 = useContent('help.bullet_1');
  const b2 = useContent('help.bullet_2');
  const b3 = useContent('help.bullet_3');
  const b4 = useContent('help.bullet_4');
  const b5 = useContent('help.bullet_5');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            aria-label={t('help.button', 'Ajuda')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <HelpCircle size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent>{t('help.button', 'Ajuda')}</TooltipContent>
      </Tooltip>

      {open && (
        <div
          className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-['Cormorant_Garamond'] text-2xl text-foreground italic">{title}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            {intro && <p className="text-sm text-muted-foreground mb-4">{intro}</p>}
            <ul className="space-y-2 text-sm text-foreground">
              {[b1, b2, b3, b4, b5].filter(Boolean).map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
