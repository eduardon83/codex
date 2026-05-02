import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingInfoModal from '@/components/LandingInfoModal';
import { LANDING_LEGAL, type LandingLegalLang } from '@/config/landingLegal';
import kendirStudiosLogo from '@/assets/kendir-studios-logo.png';
import owlGold from '@/assets/codex-owl-gold.png';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C97A';
const BG = '#1E2A22';
const BG2 = '#2F3E33';
const TEXT = '#F0E8D8';
const MUTED = '#CFC6B0';
const ACCENT = '#8BA18B';

const VILLAGES = [
  'Idanha-a-Velha','Marialva','Piódão','Almeida','Trancoso','Castelo Rodrigo',
  'Belmonte','Monsanto','Sortelha','Castelo Mendo','Castelo Novo','Linhares da Beira',
];

const LANDING_COPY = {
  pt: {
    nav_about: 'Sobre',
    nav_enter: 'Entrar',
    eyebrow: 'Para jovens leitores · Portugal',
    hero_title_1: 'Cada livro é uma',
    hero_title_2: 'folha nova.',
    hero_sub: 'O Codex é a tua biblioteca pessoal. Guarda os livros que tens, descobre o que os teus colegas estão a ler, empresta e pede emprestado — tudo num só lugar.',
    cta_primary: 'Criar conta gratuita',
    cta_secondary: 'Já tenho conta',
    scroll: 'Explorar',
    villages_label: 'Temas inspirados nas Aldeias Históricas de Portugal',
    features_label: 'O que podes fazer',
    feat1_title: 'Biblioteca pessoal',
    feat1_desc: 'Organiza os teus livros em estantes. Regista o que leste, o que estás a ler, e o que ainda queres ler. Pesquisa por ISBN ou manualmente.',
    feat2_title: 'Empréstimos entre colegas',
    feat2_desc: 'Descobre quem tem o livro que procuras na tua escola ou distrito. Pede emprestado, empresta, e acompanha as devoluções.',
    feat3_title: 'Planos de leitura',
    feat3_desc: 'Cria um plano mensal de leituras. Importa listas do Plano Nacional de Leitura ou das tuas professoras. Acompanha o teu progresso.',
    feat4_title: 'Eventos de leitura',
    feat4_desc: 'Clubes de leitura, concursos de escrita, feiras do livro, simpósios. Os teus professores e bibliotecas publicam eventos aqui.',
    feat5_title: 'Biblioteca pública',
    feat5_desc: 'Encontra bibliotecas públicas perto de ti num raio de 5 a 50 km. Guarda as tuas favoritas e consulta os horários.',
    feat6_title: 'Temas históricos',
    feat6_desc: '12 temas visuais inspirados nas Aldeias Históricas de Portugal, cada um com a sua árvore animada e história. Sem publicidade, sem distrações.',
    loan_eyebrow: 'Empréstimos',
    loan_title: 'Os livros que amas merecem circular.',
    loan_desc: 'Quando um livro fica numa prateleira, só uma pessoa o lê. O Codex cria uma rede de leitores na tua escola e distrito para que os livros passem de mão em mão — com total controlo de quem pediu, quando, e quando devolve.',
    loan_available: 'Disponível',
    loan_pending: 'Pedido pendente · devolução em 12 dias',
    cta_title_1: 'Pronto para plantar',
    cta_title_2: 'a tua estante?',
    cta_sub: 'Gratuito. Sem publicidade. Feito em Portugal.',
    badge1: 'Para 12-21 anos',
    badge2: 'RGPD compliant',
    badge3: 'Alinhado com PNL 2027',
    badge4: 'Sem anúncios',
    footer_terms_privacy: 'Termos e Privacidade',
    footer_about: 'Sobre',
    footer_close: 'Fechar',
    footer_kendir_alt: 'Kendir Studios — abrir em nova janela',
  },
  en: {
    nav_about: 'About',
    nav_enter: 'Sign in',
    eyebrow: 'For young readers · Portugal',
    hero_title_1: 'Every book is a',
    hero_title_2: 'new leaf.',
    hero_sub: 'Codex is your personal library. Keep track of the books you own, discover what your classmates are reading, lend and borrow — all in one place.',
    cta_primary: 'Create free account',
    cta_secondary: 'I already have an account',
    scroll: 'Explore',
    villages_label: "Themes inspired by Portugal's Historic Villages",
    features_label: 'What you can do',
    feat1_title: 'Personal library',
    feat1_desc: "Organise your books into shelves. Track what you've read, what you're reading, and what's still on the list. Search by ISBN or manually.",
    feat2_title: 'Peer lending',
    feat2_desc: "Find out who has the book you're looking for at your school or district. Borrow, lend, and track returns.",
    feat3_title: 'Reading plans',
    feat3_desc: 'Create a monthly reading plan. Import lists from the National Reading Plan or your teachers. Track your progress.',
    feat4_title: 'Reading events',
    feat4_desc: 'Book clubs, writing competitions, book fairs, symposiums. Your teachers and libraries post events here.',
    feat5_title: 'Public libraries',
    feat5_desc: 'Find public libraries near you within a 5 to 50 km radius. Save your favourites and check opening hours.',
    feat6_title: 'Historic themes',
    feat6_desc: "12 visual themes inspired by Portugal's Historic Villages, each with an animated tree and story. No ads, no distractions.",
    loan_eyebrow: 'Book lending',
    loan_title: 'The books you love deserve to travel.',
    loan_desc: "When a book sits on one shelf, only one person reads it. Codex builds a reader network at your school and district so books pass from hand to hand — with full tracking of who borrowed what and when it's due back.",
    loan_available: 'Available',
    loan_pending: 'Requested · due back in 12 days',
    cta_title_1: 'Ready to plant',
    cta_title_2: 'your shelf?',
    cta_sub: 'Free. No ads. Made in Portugal.',
    badge1: 'Ages 12–21',
    badge2: 'GDPR compliant',
    badge3: 'Aligned with PNL 2027',
    badge4: 'No ads',
    footer_terms_privacy: 'Terms & Privacy',
    footer_about: 'About',
    footer_close: 'Close',
    footer_kendir_alt: 'Kendir Studios — open in new window',
  },
  es: {
    nav_about: 'Sobre',
    nav_enter: 'Entrar',
    eyebrow: 'Para jóvenes lectores · Portugal',
    hero_title_1: 'Cada libro es una',
    hero_title_2: 'hoja nueva.',
    hero_sub: 'Codex es tu biblioteca personal. Guarda los libros que tienes, descubre lo que leen tus compañeros, presta y pide prestado — todo en un solo lugar.',
    cta_primary: 'Crear cuenta gratuita',
    cta_secondary: 'Ya tengo una cuenta',
    scroll: 'Explorar',
    villages_label: 'Temas inspirados en las Aldeas Históricas de Portugal',
    features_label: 'Qué puedes hacer',
    feat1_title: 'Biblioteca personal',
    feat1_desc: 'Organiza tus libros en estantes. Registra lo que has leído, lo que estás leyendo y lo que quieres leer. Busca por ISBN o manualmente.',
    feat2_title: 'Préstamos entre compañeros',
    feat2_desc: 'Descubre quién tiene el libro que buscas en tu escuela o distrito. Pide prestado, presta y controla las devoluciones.',
    feat3_title: 'Planes de lectura',
    feat3_desc: 'Crea un plan mensual de lecturas. Importa listas del Plan Nacional de Lectura o de tus profesores. Sigue tu progreso.',
    feat4_title: 'Eventos de lectura',
    feat4_desc: 'Clubs de lectura, concursos de escritura, ferias del libro, simposios. Tus profesores y bibliotecas publican eventos aquí.',
    feat5_title: 'Bibliotecas públicas',
    feat5_desc: 'Encuentra bibliotecas públicas cerca de ti en un radio de 5 a 50 km. Guarda tus favoritas y consulta los horarios.',
    feat6_title: 'Temas históricos',
    feat6_desc: '12 temas visuales inspirados en las Aldeas Históricas de Portugal, cada uno con su árbol animado e historia. Sin publicidad, sin distracciones.',
    loan_eyebrow: 'Préstamos',
    loan_title: 'Los libros que amas merecen circular.',
    loan_desc: 'Cuando un libro se queda en una estantería, solo una persona lo lee. Codex crea una red de lectores en tu escuela y distrito para que los libros pasen de mano en mano — con control total de quién pidió, cuándo y cuándo devuelve.',
    loan_available: 'Disponible',
    loan_pending: 'Solicitud pendiente · devolución en 12 días',
    cta_title_1: '¿Listo para plantar',
    cta_title_2: 'tu estante?',
    cta_sub: 'Gratuito. Sin publicidad. Hecho en Portugal.',
    badge1: 'Para 12-21 años',
    badge2: 'RGPD compliant',
    badge3: 'Alineado con PNL 2027',
    badge4: 'Sin anuncios',
    footer_terms_privacy: 'Términos y Privacidad',
    footer_about: 'Sobre',
    footer_close: 'Cerrar',
    footer_kendir_alt: 'Kendir Studios — abrir en nueva ventana',
  },
  fr: {
    nav_about: 'À propos',
    nav_enter: 'Se connecter',
    eyebrow: 'Pour les jeunes lecteurs · Portugal',
    hero_title_1: 'Chaque livre est une',
    hero_title_2: 'nouvelle feuille.',
    hero_sub: 'Codex est ta bibliothèque personnelle. Garde une trace des livres que tu possèdes, découvre ce que lisent tes camarades, prête et emprunte — tout en un seul endroit.',
    cta_primary: 'Créer un compte gratuit',
    cta_secondary: "J'ai déjà un compte",
    scroll: 'Explorer',
    villages_label: 'Thèmes inspirés des Villages Historiques du Portugal',
    features_label: 'Ce que tu peux faire',
    feat1_title: 'Bibliothèque personnelle',
    feat1_desc: 'Organise tes livres en étagères. Note ce que tu as lu, ce que tu lis et ce que tu veux lire. Recherche par ISBN ou manuellement.',
    feat2_title: 'Prêts entre camarades',
    feat2_desc: 'Découvre qui a le livre que tu cherches dans ton école ou ton district. Emprunte, prête et suis les retours.',
    feat3_title: 'Plans de lecture',
    feat3_desc: 'Crée un plan mensuel de lecture. Importe des listes du Plan National de Lecture ou de tes professeurs. Suis ta progression.',
    feat4_title: 'Événements de lecture',
    feat4_desc: "Clubs de lecture, concours d'écriture, salons du livre, symposiums. Tes professeurs et bibliothèques publient des événements ici.",
    feat5_title: 'Bibliothèques publiques',
    feat5_desc: 'Trouve des bibliothèques publiques près de toi dans un rayon de 5 à 50 km. Sauvegarde tes favorites et consulte les horaires.',
    feat6_title: 'Thèmes historiques',
    feat6_desc: '12 thèmes visuels inspirés des Villages Historiques du Portugal, chacun avec son arbre animé et son histoire. Sans publicité, sans distraction.',
    loan_eyebrow: 'Prêts',
    loan_title: 'Les livres que tu aimes méritent de circuler.',
    loan_desc: "Quand un livre reste sur une étagère, une seule personne le lit. Codex crée un réseau de lecteurs dans ton école et ton district pour que les livres passent de main en main — avec un suivi complet de qui a demandé, quand et quand il doit être rendu.",
    loan_available: 'Disponible',
    loan_pending: 'Demande en attente · retour dans 12 jours',
    cta_title_1: 'Prêt à planter',
    cta_title_2: 'ton étagère?',
    cta_sub: 'Gratuit. Sans publicité. Fabriqué au Portugal.',
    badge1: 'Pour 12-21 ans',
    badge2: 'Conforme RGPD',
    badge3: 'Aligné avec PNL 2027',
    badge4: 'Sans publicité',
    footer_terms_privacy: 'Conditions et Confidentialité',
    footer_about: 'À propos',
    footer_close: 'Fermer',
    footer_kendir_alt: 'Kendir Studios — ouvrir dans une nouvelle fenêtre',
  },
} as const;

type LandingLang = keyof typeof LANDING_COPY;

const LANG_OPTIONS: { code: LandingLang; flag: string; name: string }[] = [
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
];

const FoliumLeafSVG = ({ size = 28, strokeWidth = 2, minimal = false }: { size?: number; strokeWidth?: number; minimal?: boolean }) => (
  <svg viewBox="0 0 200 260" width={size} height={size * 1.3} fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} aria-hidden="true">
    <path d="M 100,20 Q 158,70 160,135 Q 160,195 100,210 Q 40,195 40,135 Q 42,70 100,20 Z" />
    <line x1="100" y1="22" x2="100" y2="208" />
    {!minimal && <line x1="100" y1="210" x2="100" y2="240" strokeWidth={strokeWidth + 0.4} />}
    {!minimal && <>
      <path d="M 100,50 Q 80,58 58,66" />
      <path d="M 100,78 Q 75,88 50,100" />
      <path d="M 100,108 Q 72,120 46,135" />
      <path d="M 100,138 Q 74,148 52,162" />
      <line x1="105" y1="50" x2="142" y2="50" />
      <line x1="105" y1="70" x2="150" y2="70" />
    </>}
    <line x1="105" y1="90" x2="145" y2="90" />
    <line x1="105" y1="110" x2="153" y2="110" />
    {!minimal && <>
      <line x1="105" y1="130" x2="148" y2="130" />
      <line x1="105" y1="150" x2="152" y2="150" />
    </>}
  </svg>
);

const TreeBranches = () => (
  <svg viewBox="0 0 600 700" fill="none" stroke={ACCENT} strokeLinecap="round" strokeLinejoin="round" style={{ width: 'min(90vw, 700px)', height: 'auto' }} aria-hidden="true">
    {[
      { d: 'M295,700 Q310,620 290,550 Q270,490 300,430', w: 9 },
      { d: 'M300,460 Q320,420 295,370 Q280,340 310,310', w: 6 },
      { d: 'M300,400 Q220,370 150,360', w: 4 },
      { d: 'M310,350 Q240,310 170,280', w: 3.5 },
      { d: 'M305,330 Q260,270 220,220', w: 3 },
      { d: 'M310,310 Q305,240 310,180', w: 3 },
      { d: 'M310,400 Q390,365 460,350', w: 4 },
      { d: 'M310,350 Q380,305 440,270', w: 3.5 },
      { d: 'M315,325 Q360,265 400,210', w: 3 },
      { d: 'M150,360 L90,370', w: 2 },
      { d: 'M150,360 L110,320', w: 2 },
      { d: 'M170,280 L100,250', w: 2 },
      { d: 'M170,280 L140,220', w: 1.8 },
      { d: 'M220,220 L180,170', w: 1.8 },
      { d: 'M310,180 L280,130', w: 1.6 },
      { d: 'M310,180 L340,130', w: 1.6 },
      { d: 'M460,350 L520,360', w: 2 },
      { d: 'M440,270 L500,240', w: 2 },
      { d: 'M400,210 L430,160', w: 1.8 },
    ].map((b, i) => (
      <path key={i} className="branch" d={b.d} strokeWidth={b.w} style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
  </svg>
);

interface FeatProps { icon: React.ReactNode; title: string; desc: string; }
const Feat = ({ icon, title, desc }: FeatProps) => (
  <div className="feat" style={{ background: BG, padding: '2.5rem 2rem', transition: 'background 0.2s' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = BG2)}
    onMouseLeave={(e) => (e.currentTarget.style.background = BG)}>
    <div style={{ width: 40, height: 40, marginBottom: '1.25rem', color: GOLD }}>{icon}</div>
    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 500, color: TEXT, marginBottom: '0.75rem' }}>{title}</h3>
    <p style={{ fontSize: '0.8rem', fontWeight: 300, lineHeight: 1.75, color: MUTED }}>{desc}</p>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState<LandingLang>(() => {
    if (typeof window === 'undefined') return 'pt';
    const stored = localStorage.getItem('folium_landing_lang') as LandingLang | null;
    return stored && stored in LANDING_COPY ? stored : 'pt';
  });
  const [langOpen, setLangOpen] = useState(false);
  const [modal, setModal] = useState<null | 'about' | 'termsPrivacy'>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const t = LANDING_COPY[lang];
  const legal = LANDING_LEGAL[lang as LandingLegalLang] ?? LANDING_LEGAL.pt;
  const activeDoc = modal ? legal[modal] : null;

  const setLang = (next: LandingLang) => {
    setLangState(next);
    try { localStorage.setItem('folium_landing_lang', next); } catch {}
    setLangOpen(false);
  };

  useEffect(() => {
    document.title = 'Codex — A tua biblioteca de leituras';
    const prev = document.body.style.background;
    document.body.style.background = BG;
    return () => { document.body.style.background = prev; };
  }, []);

  // Keep <html lang> in sync with the landing-page language (WCAG 3.1.1)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [langOpen]);

  const goSignup = () => navigate('/auth?mode=signup');
  const goLogin = () => navigate('/auth?mode=login');
  const currentOpt = LANG_OPTIONS.find((o) => o.code === lang) ?? LANG_OPTIONS[0];

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "'Josefin Sans', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes folium-fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes folium-floatLeaf { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes folium-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes folium-drawBranch { to { stroke-dashoffset: 0; } }
        @keyframes folium-scrollPulse { 0%,100% { opacity:0.4; transform: scaleY(1); } 50% { opacity:1; transform: scaleY(1.1); } }
        .folium-landing .branch { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: folium-drawBranch 3s ease forwards; }
        .folium-landing .villages-track { animation: folium-marquee 30s linear infinite; }
        .folium-landing a.btn-primary:hover, .folium-landing button.btn-primary:hover { background: ${GOLD_LIGHT} !important; transform: translateY(-1px); }
        .folium-landing a.btn-hero:hover, .folium-landing button.btn-hero:hover { background: ${GOLD_LIGHT} !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,168,76,0.35) !important; }
        .folium-landing a.btn-hero-ghost:hover, .folium-landing button.btn-hero-ghost:hover { color: ${TEXT} !important; border-color: rgba(240,232,216,0.4) !important; }
        .folium-landing a.btn-ghost:hover, .folium-landing button.btn-ghost:hover { color: ${GOLD} !important; }
        .folium-landing a.footer-link:hover { color: ${GOLD} !important; }
        .folium-landing .loan-card:hover { transform: translateX(4px); border-color: rgba(201,168,76,0.3) !important; }
        .folium-landing .lang-btn:hover { color: ${TEXT} !important; border-color: rgba(240,232,216,0.4) !important; }
        .folium-landing .lang-item:hover { background: rgba(201,168,76,0.1) !important; color: ${TEXT} !important; }
        .folium-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1px; background: rgba(139,161,139,0.12); border: 1px solid rgba(139,161,139,0.12); border-radius: 4px; overflow: hidden; }
        .folium-loan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; max-width: 900px; margin: 0 auto; padding: 7rem 2rem; }
        @media (max-width: 640px) { .folium-loan-grid { grid-template-columns: 1fr; gap: 3rem; padding: 5rem 1.5rem; } }
        @media (max-width: 480px) {
          .folium-nav { padding: 1rem 1.25rem !important; }
          .folium-hero { padding: 6rem 1.25rem 3rem !important; }
          .folium-features { padding: 4rem 1.25rem !important; }
          .folium-cta { padding: 5rem 1.25rem !important; }
          .folium-footer { padding: 2rem 1.25rem !important; }
        }
      `}</style>

      <div className="folium-landing">
        {/* NAV */}
        <nav className="folium-nav" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 2.5rem',
          background: 'linear-gradient(to bottom, rgba(30,42,34,0.95) 0%, transparent 100%)',
          backdropFilter: 'blur(4px)',
        }}>
          <a href="/" aria-label="Codex" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={owlGold} alt="Codex" style={{ height: 36, width: 'auto', display: 'block' }} />
          </a>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="button" onClick={() => setModal('about')} className="btn-ghost" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 2, transition: 'color 0.2s' }}>{t.nav_about}</button>
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="lang-btn"
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={langOpen}
                aria-label={`${currentOpt.name} — ${currentOpt.code.toUpperCase()}`}
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
                <span style={{ fontSize: '1rem', lineHeight: 1 }} aria-hidden="true">{currentOpt.flag}</span>
                <span aria-hidden="true">{currentOpt.code.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div
                  role="menu"
                  aria-label="Language"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    minWidth: 180,
                    background: BG2,
                    border: '0.5px solid rgba(160,152,128,0.3)',
                    borderRadius: 4,
                    padding: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    zIndex: 110,
                  }}
                >
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={opt.code === lang}
                      aria-label={opt.name}
                      className="lang-item"
                      onClick={() => setLang(opt.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        background: opt.code === lang ? 'rgba(201,168,76,0.12)' : 'transparent',
                        color: opt.code === lang ? TEXT : MUTED,
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px 10px',
                        borderRadius: 3,
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: '0.8rem',
                        letterSpacing: '0.04em',
                        textAlign: 'left',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '1.05rem', lineHeight: 1 }} aria-hidden="true">{opt.flag}</span>
                      <span aria-hidden="true" style={{ fontWeight: 600, width: 22 }}>{opt.code.toUpperCase()}</span>
                      <span aria-hidden="true" style={{ opacity: 0.85 }}>{opt.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={goLogin} className="btn-primary" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: BG, background: GOLD, border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 2, transition: 'background 0.2s, transform 0.1s' }}>{t.nav_enter}</button>
          </div>
        </nav>

        {/* HERO */}
        <section id="main-content" tabIndex={-1} className="folium-hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 2rem 4rem', overflow: 'hidden', outline: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.12, pointerEvents: 'none', overflow: 'hidden' }}>
            <TreeBranches />
          </div>
          <div style={{ content: '', position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(30,42,34,0.6) 100%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: 680 }}>
            <div style={{ animation: 'folium-floatLeaf 4s ease-in-out infinite' }}>
              <img src={owlGold} alt="" aria-hidden="true" style={{ height: 64, width: 'auto', display: 'block' }} />
            </div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, animation: 'folium-fadeUp 0.8s 0.3s ease both' }}>{t.eyebrow}</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.4rem, 7vw, 5rem)', fontWeight: 500, lineHeight: 1.05, color: TEXT, animation: 'folium-fadeUp 0.8s 0.5s ease both', margin: 0 }}>
              {t.hero_title_1} <em style={{ fontStyle: 'italic', color: GOLD }}>{t.hero_title_2}</em>
            </h1>
            <p style={{ fontSize: '0.9rem', fontWeight: 300, letterSpacing: '0.05em', color: MUTED, lineHeight: 1.8, maxWidth: 480, opacity: 0, animation: 'folium-fadeUp 0.8s 0.7s ease forwards' }}>
              {t.hero_sub}
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem', animation: 'folium-fadeUp 0.8s 0.9s ease both' }}>
              <button onClick={goSignup} className="btn-hero" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', background: GOLD, color: BG, border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: 2, transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s', boxShadow: '0 4px 24px rgba(201,168,76,0.25)' }}>{t.cta_primary}</button>
              <button onClick={goLogin} className="btn-hero-ghost" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, background: 'transparent', cursor: 'pointer', padding: '14px 24px', borderRadius: 2, border: '0.5px solid rgba(160,152,128,0.3)', transition: 'color 0.2s, border-color 0.2s' }}>{t.cta_secondary}</button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: MUTED, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', animation: 'folium-fadeUp 1s 1.2s ease forwards', opacity: 0 }}>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, animation: 'folium-scrollPulse 2s ease-in-out infinite' }} />
            <span>{t.scroll}</span>
          </div>
        </section>

        {/* VILLAGES */}
        <div style={{ padding: '4rem 2rem', borderTop: '1px solid rgba(139,161,139,0.1)', borderBottom: '1px solid rgba(139,161,139,0.1)', overflow: 'hidden' }}>
          <p style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: '2rem' }}>{t.villages_label}</p>
          <div style={{ display: 'flex', overflow: 'hidden' }}>
            <div className="villages-track" style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: 'max-content' }}>
              {[...VILLAGES, ...VILLAGES].map((v, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', color: MUTED, whiteSpace: 'nowrap' }}>{v}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: GOLD, opacity: 0.4, flexShrink: 0 }} />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="folium-features" style={{ padding: '6rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: '3.5rem', marginTop: 0 }}>{t.features_label}</h2>
          <div className="folium-features-grid">
            <Feat title={t.feat1_title} desc={t.feat1_desc} icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            } />
            <Feat title={t.feat2_title} desc={t.feat2_desc} icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            } />
            <Feat title={t.feat3_title} desc={t.feat3_desc} icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            } />
            <Feat title={t.feat4_title} desc={t.feat4_desc} icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            } />
            <Feat title={t.feat5_title} desc={t.feat5_desc} icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            } />
            <Feat title={t.feat6_title} desc={t.feat6_desc} icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            } />
          </div>
        </section>

        {/* LOAN */}
        <section style={{ background: BG2, padding: '0 0 2px' }}>
          <div className="folium-loan-grid">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: '1rem' }}>{t.loan_eyebrow}</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 500, lineHeight: 1.15, color: TEXT, marginBottom: '1.25rem' }}>{t.loan_title}</h2>
              <p style={{ fontSize: '0.82rem', fontWeight: 300, lineHeight: 1.8, color: MUTED }}>{t.loan_desc}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { dot: '#5DCAA5', title: 'O Senhor dos Anéis', sub: `${t.loan_available} · @mariana_s · Escola Sec. Valongo` },
                { dot: GOLD, title: 'O Nome do Vento', sub: t.loan_pending },
                { dot: '#85B7EB', title: 'Ensaio sobre a Cegueira', sub: `${t.loan_available} · @rui_fonseca · Escola EB Ermesinde` },
                { dot: '#5DCAA5', title: 'Harry Potter e a Pedra Filosofal', sub: `${t.loan_available} · @beatriz_m · Escola Sec. Valongo` },
              ].map((c, i) => (
                <div key={i} className="loan-card" style={{ background: BG2, border: '0.5px solid rgba(139,161,139,0.2)', borderRadius: 6, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.2s, border-color 0.2s' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: c.dot }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>{c.title}</div>
                    <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 1 }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="folium-cta" style={{ padding: '7rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 500, color: TEXT, marginBottom: '1rem', lineHeight: 1.1 }}>
              {t.cta_title_1}<br />{t.cta_title_2}
            </h2>
            <p style={{ fontSize: '0.82rem', fontWeight: 300, color: MUTED, marginBottom: '2.5rem' }}>{t.cta_sub}</p>
            <button onClick={goSignup} className="btn-hero" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', background: GOLD, color: BG, border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: 2, transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s', boxShadow: '0 4px 24px rgba(201,168,76,0.25)' }}>{t.cta_primary}</button>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
              {[t.badge1, t.badge2, t.badge3, t.badge4].map((b) => (
                <span key={b} style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, padding: '5px 12px', border: '0.5px solid rgba(160,152,128,0.25)', borderRadius: 20 }}>{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="folium-footer" style={{ borderTop: '1px solid rgba(139,161,139,0.1)', padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={owlGold} alt="Codex" style={{ height: 26, width: 'auto', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setModal('termsPrivacy')} className="footer-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, padding: 0, transition: 'color 0.2s' }}>{t.footer_terms_privacy}</button>
            <button type="button" onClick={() => setModal('about')} className="footer-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, padding: 0, transition: 'color 0.2s' }}>{t.footer_about}</button>
            <a href="mailto:folium@kendirstudios.pt" className="footer-link" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, textDecoration: 'none', transition: 'color 0.2s' }}>folium@kendirstudios.pt</a>
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.68rem', color: MUTED, margin: 0 }}>© 2026 Worlds4Education — Kendir Studios · Vila Nova de Gaia · Portugal</p>
            <a
              href="https://www.kendirstudios.pt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer_kendir_alt}
              style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.75, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
            >
              <img src={kendirStudiosLogo} alt="" aria-hidden="true" style={{ height: 18, width: 'auto', display: 'block' }} />
            </a>
          </div>
        </footer>
      </div>

      <LandingInfoModal
        open={!!activeDoc}
        title={activeDoc?.title ?? ''}
        blocks={activeDoc?.blocks ?? []}
        onClose={() => setModal(null)}
        closeLabel={t.footer_close}
      />
    </div>
  );
}
