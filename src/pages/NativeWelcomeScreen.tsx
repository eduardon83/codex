import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import owlIcon from '@/assets/codex-owl-gold.png';

export default function NativeWelcomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-8 py-12"
      style={{ backgroundColor: '#1E2A22' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <img src={owlIcon} alt="Codex" style={{ width: 80, height: 80 }} />
        <h1
          className="italic"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            color: '#C9A84C',
            fontSize: '3rem',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          Codex
        </h1>
        <p
          className="text-center"
          style={{
            fontFamily: '"Josefin Sans", sans-serif',
            color: '#E8E4DD',
            fontSize: '1rem',
            opacity: 0.85,
          }}
        >
          {t('native.tagline')}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 max-w-sm">
        <button
          onClick={() => navigate('/auth?mode=login')}
          className="w-full py-3 rounded-md transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#C9A84C',
            color: '#1E2A22',
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {t('native.sign_in')}
        </button>
        <button
          onClick={() => navigate('/auth?mode=signup')}
          className="w-full py-3 rounded-md transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: '#C9A84C',
            border: '1px solid #C9A84C',
            fontFamily: '"Josefin Sans", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {t('native.create_account')}
        </button>
      </div>
    </div>
  );
}
