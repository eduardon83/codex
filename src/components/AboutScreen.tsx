import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import leafIcon from '@/assets/folium-icon.svg';
import { aboutLegalContent, buildYear } from '@/config/about';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const { t, i18n } = useTranslation();
  const language = ['pt', 'en', 'es', 'fr'].includes(i18n.language) ? i18n.language : 'pt';
  const blocks = aboutLegalContent[language] || aboutLegalContent.pt;

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

        <header className="flex flex-col items-center mb-10">
          <span
            className="h-16 w-12 bg-gold"
            style={{ mask: `url(${leafIcon}) center / contain no-repeat`, WebkitMask: `url(${leafIcon}) center / contain no-repeat` }}
            aria-hidden="true"
          />
          <h1 className="font-serif text-4xl text-foreground mt-3">Folium</h1>
        </header>

        <article className="space-y-5 font-sans">
          {blocks.map((block, index) => {
            if (block.type === 'eyebrow') {
              return <p key={index} className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{block.text}</p>;
            }
            if (block.type === 'lead') {
              return <p key={index} className="text-base leading-relaxed text-foreground">{block.text}</p>;
            }
            if (block.type === 'heading') {
              return <h2 key={index} className="pt-3 font-serif text-2xl text-foreground">{block.text}</h2>;
            }
            return <p key={index} className="text-sm leading-relaxed text-foreground">{block.text}</p>;
          })}
        </article>

        {/* Version footer */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          Folium · {buildYear}
        </p>
      </div>
    </div>
  );
}
