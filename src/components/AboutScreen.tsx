import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import foliumLogoGold from '@/assets/folium-logo-gold.png';
import { landingLegalContent, type LandingLegalLang, type LegalBlock } from '@/config/landingLegal';

// Wilderness Hearth palette — identical to LandingPage / AuthScreen so this screen
// renders consistently regardless of the user's selected in-app theme.
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C97A';
const BG = '#1E2A22';
const BG2 = '#2F3E33';
const TEXT = '#F0E8D8';
const MUTED = '#CFC6B0';

interface AboutScreenProps {
  onBack: () => void;
}

type TabKey = 'about' | 'legal';

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const { t, i18n } = useTranslation();
  const lang = (['pt', 'en', 'es', 'fr'].includes(i18n.language) ? i18n.language : 'pt') as LandingLegalLang;
  const content = landingLegalContent[lang] || landingLegalContent.pt;
  const [tab, setTab] = useState<TabKey>('about');

  // Force the Wilderness Hearth backdrop on the body while this screen is mounted
  // so it looks consistent whether opened from auth (no theme yet) or from profile.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = BG;
    return () => { document.body.style.background = prev; };
  }, []);

  const blocks = tab === 'about' ? content.about.blocks : content.termsPrivacy.blocks;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT,
        fontFamily: "'Josefin Sans', sans-serif",
      }}
    >
      <style>{`
        .folium-about-back:hover { color: ${GOLD} !important; }
        .folium-about-tab:hover { color: ${TEXT} !important; }
        .folium-about-scroll::-webkit-scrollbar { width: 8px; }
        .folium-about-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="folium-about-back"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: MUTED,
            cursor: 'pointer',
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: 0,
            marginBottom: '2rem',
            transition: 'color 0.2s',
          }}
        >
          <ArrowLeft size={14} aria-hidden="true" /> {t('bookDetail.back')}
        </button>

        {/* Header / Logo */}
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <img
            src={foliumLogoGold}
            alt="Folium"
            style={{ height: 56, width: 'auto', display: 'block' }}
          />
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Sobre & Legal"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 0,
            marginBottom: '2.5rem',
            borderBottom: '0.5px solid rgba(201,168,76,0.2)',
          }}
        >
          {([
            { key: 'about' as TabKey, label: content.about.title },
            { key: 'legal' as TabKey, label: content.termsPrivacy.title },
          ]).map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className="folium-about-tab"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${active ? GOLD : 'transparent'}`,
                  color: active ? GOLD : MUTED,
                  cursor: 'pointer',
                  padding: '12px 22px',
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: '0.74rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: active ? 600 : 400,
                  marginBottom: -1,
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <article role="tabpanel">
          {blocks.map((b: LegalBlock, i: number) => {
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
                <h2 key={i} style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: '1.6rem',
                  color: GOLD,
                  margin: '2.25rem 0 1rem',
                  paddingTop: '1rem',
                  borderTop: '0.5px solid rgba(201,168,76,0.18)',
                }}>{b.text}</h2>
              );
            }
            if (b.type === 'h3') {
              return (
                <h3 key={i} style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: TEXT,
                  margin: '1.5rem 0 0.5rem',
                }}>{b.text}</h3>
              );
            }
            return (
              <p key={i} style={{
                fontSize: '0.88rem',
                fontWeight: 300,
                lineHeight: 1.75,
                color: MUTED,
                margin: '0 0 0.85rem',
              }}>{b.text}</p>
            );
          })}
        </article>
      </div>
    </div>
  );
}
