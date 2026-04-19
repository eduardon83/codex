import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import logoLight from '@/assets/bibliotheca-line-lightmode.png';
import logoDark from '@/assets/bibliotheca-line-darkmode.png';
import { useTheme } from '@/hooks/useTheme';
import {
  appVersion,
  buildYear,
  authorBio,
  intention,
  termsAndConditions,
  termsLastUpdated,
} from '@/config/about';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const logo = theme === 'claro' ? logoLight : logoDark;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} /> {t('bookDetail.back')}
        </button>

        {/* App identity */}
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="Bibliotheca" className="w-60 min-w-[240px] mb-4" />
          <p className="text-sm text-muted-foreground">
            {t('about.version', { version: appVersion })}
          </p>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {t('about.description')}
          </p>
        </div>

        {/* About */}
        <section className="mb-8">
          <h2 className="font-serif text-xl text-foreground mb-3">{t('about.aboutHeading')}</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{authorBio}</p>
        </section>

        {/* Our intention */}
        <section className="mb-8">
          <h2 className="font-serif text-xl text-foreground mb-3">{t('about.intentionHeading')}</h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{intention}</p>
        </section>

        {/* Terms & Conditions */}
        <section className="mb-10">
          <h2 className="font-serif text-xl text-foreground mb-1">{t('about.termsHeading')}</h2>
          <p className="text-xs text-muted-foreground mb-3">
            {t('about.lastUpdated', { date: termsLastUpdated })}
          </p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {termsAndConditions}
          </p>
        </section>

        {/* Version footer */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          Bibliotheca v{appVersion} · {buildYear}
        </p>
      </div>
    </div>
  );
}
