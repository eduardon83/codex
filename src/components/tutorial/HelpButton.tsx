import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TutorialOverlay from './TutorialOverlay';
import { TutorialScreen, isTutorialSeen, markTutorialSeen } from './tutorialSteps';

interface HelpButtonProps {
  screen: TutorialScreen;
  /** When true, the tutorial opens automatically the first time the user sees the screen. */
  autoOnFirstVisit?: boolean;
  /** Optional delay (ms) before auto-opening, to let layout settle. */
  autoDelay?: number;
}

export default function HelpButton({ screen, autoOnFirstVisit = false, autoDelay = 600 }: HelpButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoOnFirstVisit) return;
    if (isTutorialSeen(screen)) return;
    const id = window.setTimeout(() => setOpen(true), autoDelay);
    return () => window.clearTimeout(id);
  }, [autoOnFirstVisit, autoDelay, screen]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            aria-label={t('tutorial.help')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <HelpCircle size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent>{t('tutorial.help')}</TooltipContent>
      </Tooltip>
      <TutorialOverlay
        screen={screen}
        open={open}
        onClose={() => {
          markTutorialSeen(screen);
          setOpen(false);
        }}
      />
    </>
  );
}
