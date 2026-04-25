import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/components/ToastNotification';
import { lovable } from '@/integrations/lovable/index';
import AboutScreen from '@/components/AboutScreen';
import FoliumLeaf from '@/components/FoliumLeaf';

// Wilderness Hearth palette (matches LandingPage)
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C97A';
const BG = '#1E2A22';
const BG2 = '#2F3E33';
const TEXT = '#F0E8D8';
const MUTED = '#B8AE98'; // 4.5:1+ on BG
const BORDER = 'rgba(139,161,139,0.2)';
const INPUT_BORDER = 'rgba(139,161,139,0.3)';

const LANG_OPTIONS = [
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
] as const;

// Folium leaf is provided by the shared <FoliumLeaf /> component for visual consistency.

export default function AuthScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { showToast } = useAppToast();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(() => searchParams.get('mode') === 'signup');
  const [isRecovering, setIsRecovering] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem('authLanguageSelected') && i18n.language !== 'pt') {
      i18n.changeLanguage('pt');
    }
  }, [i18n]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') setIsSignUp(true);
    else if (mode === 'login') setIsSignUp(false);
  }, [searchParams]);

  useEffect(() => {
    document.title = 'Folium — ' + t('auth.heading');
    const prevBg = document.body.style.background;
    document.body.style.background = BG;
    return () => { document.body.style.background = prevBg; };
  }, [isSignUp, t]);

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [langOpen]);

  const handleLanguageChange = (language: string) => {
    sessionStorage.setItem('authLanguageSelected', language);
    i18n.changeLanguage(language);
    setLangOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (isRecovering) {
      const { error } = await resetPassword(email);
      if (error) { setError(error.message); showToast(t('auth.resetError')); }
      else { setMessage(t('auth.resetEmailSent')); showToast(t('auth.resetEmailSent')); }
    } else if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) { setError(error.message); showToast(t('auth.signInError')); }
      else { setMessage(t('auth.checkEmail')); showToast(t('auth.accountCreated')); }
    } else {
      const { error } = await signIn(email, password);
      if (error) { setError(error.message); showToast(t('auth.signInError')); }
      else { showToast(t('auth.welcomeBack')); }
    }
    setLoading(false);
  };

  if (showAbout) {
    return <AboutScreen onBack={() => setShowAbout(false)} />;
  }

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'pt').slice(0, 2);
  const currentOpt = LANG_OPTIONS.find((o) => o.code === currentLang) ?? LANG_OPTIONS[0];

  const eyebrow = isRecovering ? t('auth.eyebrow_recover') : t('auth.eyebrow');
  const heading = isRecovering ? t('auth.h1_recover') : t('auth.heading');
  const submitLabel = loading ? '...' : isRecovering ? t('auth.sendResetLink') : isSignUp ? t('auth.createAccount') : t('auth.signIn');

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: '0.7rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: 8,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 44,
    background: BG,
    border: `1px solid ${INPUT_BORDER}`,
    borderRadius: 4,
    color: TEXT,
    padding: '0 14px',
    fontSize: '0.9rem',
    fontFamily: "'Josefin Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const focusRing = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = GOLD;
    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.25)`;
  };
  const blurRing = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = INPUT_BORDER;
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT,
        fontFamily: "'Josefin Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes folium-floatLeaf { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .folium-auth .float-leaf { animation: folium-floatLeaf 4s ease-in-out infinite; }
        .folium-auth a.brand:hover .brand-text { color: ${GOLD_LIGHT}; }
        .folium-auth .lang-btn:hover { color: ${TEXT} !important; border-color: rgba(240,232,216,0.4) !important; }
        .folium-auth .lang-item:hover { background: rgba(201,168,76,0.1) !important; color: ${TEXT} !important; }
        .folium-auth .btn-primary:hover { background: ${GOLD_LIGHT} !important; }
        .folium-auth .btn-secondary:hover { border-color: ${TEXT} !important; color: ${TEXT} !important; }
        .folium-auth .text-link:hover { color: ${GOLD} !important; }
        .folium-auth input::placeholder { color: rgba(184,174,152,0.55); }
      `}</style>

      <div className="folium-auth" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* NAV */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 2.5rem',
          }}
        >
          <a
            href="/"
            className="brand"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            aria-label="Folium - voltar à página inicial"
          >
            <span className="float-leaf" style={{ display: 'inline-flex' }}><FoliumLeaf width={28} height={36} stroke={GOLD} /></span>
            <span
              className="brand-text"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.5rem',
                fontStyle: 'italic',
                fontWeight: 500,
                color: GOLD,
                letterSpacing: '0.02em',
                transition: 'color 0.2s',
              }}
            >
              Folium
            </span>
          </a>

          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={t('profile.language')}
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: MUTED,
                background: 'transparent',
                border: '0.5px solid rgba(160,152,128,0.3)',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              <span aria-hidden="true">{currentOpt.flag}</span>
              <span>{currentOpt.code.toUpperCase()}</span>
            </button>
            {langOpen && (
              <ul
                role="listbox"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: BG2,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 4,
                  listStyle: 'none',
                  margin: 0,
                  padding: 4,
                  minWidth: 160,
                  zIndex: 20,
                }}
              >
                {LANG_OPTIONS.map((opt) => (
                  <li key={opt.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={opt.code === currentLang}
                      className="lang-item"
                      onClick={() => handleLanguageChange(opt.code)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        color: MUTED,
                        cursor: 'pointer',
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: '0.78rem',
                        textAlign: 'left',
                        borderRadius: 3,
                      }}
                    >
                      <span aria-hidden="true">{opt.flag}</span>
                      <span>{opt.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* MAIN — accessible target for skip link */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem 3rem',
            outline: 'none',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            {/* Heading block */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="float-leaf" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
                <FoliumLeafSVG size={32} />
              </div>
              <p
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: '0.72rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: 0,
                  marginBottom: '0.75rem',
                }}
              >
                {eyebrow}
              </p>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: '2rem',
                  fontWeight: 500,
                  color: TEXT,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {heading}
              </h1>
            </div>

            {/* Form card */}
            <div
              style={{
                background: BG2,
                border: `1px solid rgba(201,168,76,0.18)`,
                borderRadius: 6,
                padding: '32px',
              }}
            >
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="auth-email" style={labelStyle}>
                    {t('auth.email_label')}
                  </label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={focusRing}
                    onBlur={blurRing}
                    style={inputStyle}
                  />
                </div>

                {!isRecovering && (
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="auth-password" style={labelStyle}>
                      {t('auth.password_label')}
                    </label>
                    <input
                      id="auth-password"
                      name="password"
                      type="password"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      required
                      aria-required="true"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={focusRing}
                      onBlur={blurRing}
                      style={inputStyle}
                    />
                  </div>
                )}

                {error && (
                  <p role="alert" style={{ color: '#E89B9B', fontSize: '0.82rem', margin: '0 0 14px' }}>
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" style={{ color: GOLD, fontSize: '0.82rem', margin: '0 0 14px' }}>
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    height: 46,
                    background: GOLD,
                    color: BG,
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontFamily: "'Josefin Sans', sans-serif",
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background 0.2s',
                  }}
                >
                  {submitLabel}
                </button>

                {!isSignUp && !isRecovering && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => { setIsRecovering(true); setError(''); setMessage(''); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      background: 'transparent',
                      border: 'none',
                      color: MUTED,
                      fontSize: '0.78rem',
                      marginTop: 14,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}

                {!isRecovering && (
                  <>
                    <div style={{ position: 'relative', margin: '22px 0 18px' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '100%', borderTop: `1px solid ${BORDER}` }} />
                      </div>
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <span
                          style={{
                            background: BG2,
                            padding: '0 12px',
                            color: MUTED,
                            fontSize: '0.7rem',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {t('auth.or')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={googleLoading}
                      className="btn-secondary"
                      onClick={async () => {
                        setGoogleLoading(true);
                        setError('');
                        const result = await lovable.auth.signInWithOAuth('google', {
                          redirect_uri: window.location.origin,
                        });
                        if (result.error) {
                          setError(result.error.message);
                          setGoogleLoading(false);
                        }
                        if (result.redirected) return;
                        setGoogleLoading(false);
                      }}
                      style={{
                        width: '100%',
                        height: 46,
                        background: 'transparent',
                        color: TEXT,
                        border: `1px solid ${INPUT_BORDER}`,
                        borderRadius: 4,
                        fontSize: '0.82rem',
                        fontFamily: "'Josefin Sans', sans-serif",
                        cursor: googleLoading ? 'not-allowed' : 'pointer',
                        opacity: googleLoading ? 0.7 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        transition: 'border-color 0.2s, color 0.2s',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {googleLoading ? '...' : t('auth.googleSignIn')}
                    </button>
                  </>
                )}
              </form>
            </div>

            {/* Mode toggle */}
            <div style={{ marginTop: 22, textAlign: 'center' }}>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setIsSignUp(isRecovering ? false : !isSignUp);
                  setIsRecovering(false);
                  setError('');
                  setMessage('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: MUTED,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {isRecovering ? t('auth.backToSignIn') : isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => setShowAbout(true)}
                style={{
                  display: 'block',
                  margin: '12px auto 0',
                  background: 'transparent',
                  border: 'none',
                  color: MUTED,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {t('about.title')}
              </button>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer
          style={{
            padding: '1.5rem 2rem 2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
            color: MUTED,
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
          }}
        >
          <span>© 2026 Worlds4Education</span>
          <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
          <a href="/" className="text-link" style={{ color: MUTED, textDecoration: 'none', transition: 'color 0.2s' }}>
            {t('auth.footer_terms')}
          </a>
          <a href="/" className="text-link" style={{ color: MUTED, textDecoration: 'none', transition: 'color 0.2s' }}>
            {t('auth.footer_privacy')}
          </a>
        </footer>
      </div>
    </div>
  );
}
