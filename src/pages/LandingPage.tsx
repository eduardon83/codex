import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C97A';
const BG = '#1E2A22';
const BG2 = '#2F3E33';
const TEXT = '#F0E8D8';
const MUTED = '#A09880';
const ACCENT = '#8BA18B';

const VILLAGES = [
  'Idanha-a-Velha','Marialva','Piódão','Almeida','Trancoso','Castelo Rodrigo',
  'Belmonte','Monsanto','Sortelha','Castelo Mendo','Castelo Novo','Linhares da Beira',
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

  useEffect(() => {
    document.title = 'Folium — A tua biblioteca de leituras';
    const prev = document.body.style.background;
    document.body.style.background = BG;
    return () => { document.body.style.background = prev; };
  }, []);

  const goSignup = () => navigate('/auth?mode=signup');
  const goLogin = () => navigate('/auth?mode=login');

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
        .folium-landing a.btn-primary:hover { background: ${GOLD_LIGHT} !important; transform: translateY(-1px); }
        .folium-landing a.btn-hero:hover { background: ${GOLD_LIGHT} !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,168,76,0.35) !important; }
        .folium-landing a.btn-hero-ghost:hover { color: ${TEXT} !important; border-color: rgba(240,232,216,0.4) !important; }
        .folium-landing a.btn-ghost:hover { color: ${GOLD} !important; }
        .folium-landing a.footer-link:hover { color: ${GOLD} !important; }
        .folium-landing .loan-card:hover { transform: translateX(4px); border-color: rgba(201,168,76,0.3) !important; }
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
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <FoliumLeafSVG size={28} minimal />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 500, color: GOLD, letterSpacing: '0.02em' }}>Folium</span>
          </a>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="#features" className="btn-ghost" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, textDecoration: 'none', padding: '8px 16px', borderRadius: 2, transition: 'color 0.2s' }}>Sobre</a>
            <button onClick={goLogin} className="btn-primary" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: BG, background: GOLD, border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 2, transition: 'background 0.2s, transform 0.1s' }}>Entrar</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="folium-hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 2rem 4rem', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.12, pointerEvents: 'none', overflow: 'hidden' }}>
            <TreeBranches />
          </div>
          <div style={{ content: '', position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(30,42,34,0.6) 100%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: 680 }}>
            <div style={{ animation: 'folium-floatLeaf 4s ease-in-out infinite' }}>
              <FoliumLeafSVG size={52} />
            </div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, opacity: 0, animation: 'folium-fadeUp 0.8s 0.3s ease forwards' }}>Para jovens leitores · Portugal</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.4rem, 7vw, 5rem)', fontWeight: 500, lineHeight: 1.05, color: TEXT, opacity: 0, animation: 'folium-fadeUp 0.8s 0.5s ease forwards', margin: 0 }}>
              Cada livro é uma<br /><em style={{ fontStyle: 'italic', color: GOLD }}>folha nova.</em>
            </h1>
            <p style={{ fontSize: '0.9rem', fontWeight: 300, letterSpacing: '0.05em', color: MUTED, lineHeight: 1.8, maxWidth: 480, opacity: 0, animation: 'folium-fadeUp 0.8s 0.7s ease forwards' }}>
              O Folium é a tua biblioteca pessoal. Guarda os livros que tens, descobre o que os teus colegas estão a ler, empresta e pede emprestado — tudo num só lugar.
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem', opacity: 0, animation: 'folium-fadeUp 0.8s 0.9s ease forwards' }}>
              <button onClick={goSignup} className="btn-hero" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', background: GOLD, color: BG, border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: 2, transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s', boxShadow: '0 4px 24px rgba(201,168,76,0.25)' }}>Criar conta gratuita</button>
              <button onClick={goLogin} className="btn-hero-ghost" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, background: 'transparent', cursor: 'pointer', padding: '14px 24px', borderRadius: 2, border: '0.5px solid rgba(160,152,128,0.3)', transition: 'color 0.2s, border-color 0.2s' }}>Já tenho conta</button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: MUTED, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', animation: 'folium-fadeUp 1s 1.2s ease forwards', opacity: 0 }}>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, animation: 'folium-scrollPulse 2s ease-in-out infinite' }} />
            <span>Explorar</span>
          </div>
        </section>

        {/* VILLAGES */}
        <div style={{ padding: '4rem 2rem', borderTop: '1px solid rgba(139,161,139,0.1)', borderBottom: '1px solid rgba(139,161,139,0.1)', overflow: 'hidden' }}>
          <p style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: '2rem' }}>Temas inspirados nas Aldeias Históricas de Portugal</p>
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
          <p style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: '3.5rem' }}>O que podes fazer</p>
          <div className="folium-features-grid">
            <Feat title="Biblioteca pessoal" desc="Organiza os teus livros em estantes. Regista o que leste, o que estás a ler, e o que ainda queres ler. Pesquisa por ISBN ou manualmente." icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            } />
            <Feat title="Empréstimos entre colegas" desc="Descobre quem tem o livro que procuras na tua escola ou distrito. Pede emprestado, empresta, e acompanha as devoluções." icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            } />
            <Feat title="Planos de leitura" desc="Cria um plano mensal de leituras. Importa listas do Plano Nacional de Leitura ou das tuas professoras. Acompanha o teu progresso." icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            } />
            <Feat title="Eventos de leitura" desc="Clubes de leitura, concursos de escrita, feiras do livro, simpósios. Os teus professores e bibliotecas publicam eventos aqui." icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            } />
            <Feat title="Biblioteca pública" desc="Encontra bibliotecas públicas perto de ti num raio de 5 a 50 km. Guarda as tuas favoritas e consulta os horários." icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            } />
            <Feat title="Temas históricos" desc="12 temas visuais inspirados nas Aldeias Históricas de Portugal, cada um com a sua árvore animada e história. Sem publicidade, sem distrações." icon={
              <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            } />
          </div>
        </section>

        {/* LOAN */}
        <section style={{ background: BG2, padding: '0 0 2px' }}>
          <div className="folium-loan-grid">
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: '1rem' }}>Empréstimos</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 500, lineHeight: 1.15, color: TEXT, marginBottom: '1.25rem' }}>Os livros que amas merecem circular.</h2>
              <p style={{ fontSize: '0.82rem', fontWeight: 300, lineHeight: 1.8, color: MUTED }}>Quando um livro fica numa prateleira, só uma pessoa o lê. O Folium cria uma rede de leitores na tua escola e distrito para que os livros passem de mão em mão — com total controlo de quem pediu, quando, e quando devolve.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { dot: '#5DCAA5', title: 'O Senhor dos Anéis', sub: 'Disponível · @mariana_s · Escola Sec. Valongo' },
                { dot: GOLD, title: 'O Nome do Vento', sub: 'Pedido pendente · devolução em 12 dias' },
                { dot: '#85B7EB', title: 'Ensaio sobre a Cegueira', sub: 'Disponível · @rui_fonseca · Escola EB Ermesinde' },
                { dot: '#5DCAA5', title: 'Harry Potter e a Pedra Filosofal', sub: 'Disponível · @beatriz_m · Escola Sec. Valongo' },
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
              Pronto para plantar<br />a tua <em style={{ fontStyle: 'italic', color: GOLD }}>estante</em>?
            </h2>
            <p style={{ fontSize: '0.82rem', fontWeight: 300, color: MUTED, marginBottom: '2.5rem' }}>Gratuito. Sem publicidade. Feito em Portugal.</p>
            <button onClick={goSignup} className="btn-hero" style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', background: GOLD, color: BG, border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: 2, transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s', boxShadow: '0 4px 24px rgba(201,168,76,0.25)' }}>Criar conta gratuita</button>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
              {['Para 12-21 anos','RGPD compliant','Alinhado com PNL 2027','Sem anúncios'].map((b) => (
                <span key={b} style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, padding: '5px 12px', border: '0.5px solid rgba(160,152,128,0.25)', borderRadius: 20 }}>{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="folium-footer" style={{ borderTop: '1px solid rgba(139,161,139,0.1)', padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FoliumLeafSVG size={18} minimal />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic', color: GOLD }}>Folium</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Termos', href: '#' },
              { label: 'Privacidade', href: '#' },
              { label: 'Sobre', href: '#features' },
              { label: 'folium@kendirstudios.pt', href: 'mailto:folium@kendirstudios.pt' },
            ].map((l) => (
              <a key={l.label} href={l.href} className="footer-link" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, textDecoration: 'none', transition: 'color 0.2s' }}>{l.label}</a>
            ))}
          </div>
          <p style={{ fontSize: '0.68rem', color: 'rgba(160,152,128,0.5)', width: '100%' }}>© 2026 Worlds4Education — Kendir Studios · Vila Nova de Gaia · Portugal</p>
        </footer>
      </div>
    </div>
  );
}
