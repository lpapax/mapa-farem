// frontend/src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState({});
  const refs = useRef({});

  useEffect(() => {
    const observers = {};
    Object.entries(refs.current).forEach(([key, el]) => {
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [key]: true }));
      }, { threshold: 0.15 });
      obs.observe(el);
      observers[key] = obs;
    });
    return () => Object.values(observers).forEach(o => o.disconnect());
  }, []);

  const setRef = (key) => (el) => { refs.current[key] = el; };

  const anim = (key, delay = 0) => ({
    style: {
      opacity: visible[key] ? 1 : 0,
      transform: visible[key] ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    },
    ref: setRef(key),
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF7', color: '#1E120A', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: #3A5728; color: white; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #3A5728; color: white;
          padding: 16px 32px; border-radius: 50px;
          font-weight: 700; font-size: 16px; text-decoration: none;
          border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(58,87,40,0.3);
        }
        .btn-primary:hover { background: #2d4420; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(58,87,40,0.4); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #3A5728;
          padding: 14px 28px; border-radius: 50px;
          font-weight: 700; font-size: 15px; text-decoration: none;
          border: 2px solid #3A5728; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: #3A5728; color: white; transform: translateY(-2px); }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-slow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(58,87,40,0.1); border: 1px solid rgba(58,87,40,0.2);
          padding: 6px 16px; border-radius: 50px; font-size: 13px; font-weight: 500;
          color: #3A5728; margin-bottom: 24px;
        }
        .hero-badge span { width:8px;height:8px;background:#7DB05A;border-radius:50%;animation:pulse-slow 2s infinite; }

        .stat-card {
          background: white; border-radius: 20px;
          padding: 28px 32px; text-align: center;
          border: 1px solid rgba(58,87,40,0.1);
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.1); }

        .feature-card {
          background: white; border-radius: 20px; padding: 32px;
          border: 1px solid rgba(58,87,40,0.08);
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }

        .step-num {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #3A5728, #7DB05A);
          color: white; font-weight: 900; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(58,87,40,0.3);
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 40px !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .farmer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(250,250,247,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(58,87,40,0.1)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20 }}>
          <span style={{ color: '#3A5728' }}>Mapa</span>Farem<span style={{ color: '#3A5728' }}>.cz</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => navigate('/mapa')} style={{ padding: '8px 20px', fontSize: 14 }}>
            Otevřít mapu
          </button>
          <button className="btn-primary" onClick={() => navigate('/pridat-farmu')} style={{ padding: '8px 20px', fontSize: 14 }}>
            + Přidat farmu
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '80px 24px 60px',
        background: 'linear-gradient(160deg, #F4EDD8 0%, #EBF0E4 50%, #FAFAF7 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekorativní kruhy */}
        <div style={{ position:'absolute', top: -100, right: -100, width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,176,90,0.15), transparent 70%)',
          pointerEvents: 'none' }} />
        <div style={{ position:'absolute', bottom: -50, left: -80, width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,155,48,0.1), transparent 70%)',
          pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

            {/* Levá strana */}
            <div>
              <div className="hero-badge" style={{ opacity: 0, animation: 'none', transition: 'opacity 0.6s 0.1s', ...(true ? { opacity: 1 } : {}) }}>
                <span />
                {FARMS_DATA.length} farem po celé ČR
              </div>

              <h1 className="hero-title" style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 56, fontWeight: 900, lineHeight: 1.1,
                marginBottom: 24, color: '#1E120A',
                opacity: 0, animation: 'none',
                transition: 'opacity 0.7s 0.2s, transform 0.7s 0.2s',
                transform: 'translateY(20px)',
              }}
              ref={el => {
                if (el && !visible['hero']) {
                  requestAnimationFrame(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                  });
                }
              }}>
                Najdi <em style={{ color: '#3A5728', fontStyle: 'italic' }}>čerstvé</em> potraviny<br/>
                přímo od farmáře
              </h1>

              <p style={{
                fontSize: 18, color: '#555', lineHeight: 1.7, marginBottom: 36,
                maxWidth: 460,
                opacity: 0, transform: 'translateY(16px)',
                transition: 'opacity 0.7s 0.35s, transform 0.7s 0.35s',
              }}
              ref={el => {
                if (el) setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 350);
              }}>
                Mapa lokálních farem, zelinářů, sýrařů, vinařů a výrobců medu.
                Nakupuj přímo u zdroje — čerstvé, lokální, bez zbytečných mezičlánků.
              </p>

              <div style={{
                display: 'flex', gap: 12, flexWrap: 'wrap',
                opacity: 0, transform: 'translateY(16px)',
                transition: 'opacity 0.7s 0.5s, transform 0.7s 0.5s',
              }}
              ref={el => {
                if (el) setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 500);
              }}>
                <button className="btn-primary" onClick={() => navigate('/mapa')} style={{ fontSize: 17, padding: '16px 36px' }}>
                  🗺️ Otevřít mapu
                </button>
                <button className="btn-outline" onClick={() => document.getElementById('jak-to-funguje').scrollIntoView({ behavior:'smooth' })}
                  style={{ fontSize: 16 }}>
                  Jak to funguje?
                </button>
              </div>

              {/* Mini kategorie */}
              <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28,
                opacity: 0, transition: 'opacity 0.7s 0.7s',
              }}
              ref={el => {
                if (el) setTimeout(() => { el.style.opacity = '1'; }, 700);
              }}>
                {['🌱 BIO', '🥕 Zelenina', '🥩 Maso', '🥛 Mléko', '🍯 Med', '🍷 Víno', '🌿 Bylinky'].map(c => (
                  <span key={c} onClick={() => navigate('/mapa')} style={{
                    background: 'white', border: '1px solid rgba(58,87,40,0.2)',
                    padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 500,
                    color: '#3A5728', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.background='#3A5728'; e.target.style.color='white'; }}
                  onMouseLeave={e => { e.target.style.background='white'; e.target.style.color='#3A5728'; }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Pravá strana — mapa preview */}
            <div style={{
              position: 'relative',
              opacity: 0, transform: 'translateX(30px)',
              transition: 'opacity 0.8s 0.4s, transform 0.8s 0.4s',
            }}
            ref={el => {
              if (el) setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; }, 400);
            }}>
              {/* Mapa mockup */}
              <div style={{
                width: '100%', aspectRatio: '4/3',
                background: 'linear-gradient(135deg, #EBF0E4, #D4E4C4)',
                borderRadius: 24, overflow: 'hidden', position: 'relative',
                boxShadow: '0 24px 80px rgba(58,87,40,0.2), 0 4px 16px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.8)',
              }}>
                {/* Simulovaná mapa */}
                <div style={{ position:'absolute', inset:0, opacity:0.4,
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(58,87,40,0.1) 39px, rgba(58,87,40,0.1) 40px),
                    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(58,87,40,0.1) 39px, rgba(58,87,40,0.1) 40px)` }} />
                <div style={{ position:'absolute', inset:0,
                  background: 'radial-gradient(ellipse at 60% 40%, rgba(125,176,90,0.2), transparent 60%)' }} />

                {/* Fake piny */}
                {[
                  { top:'25%', left:'45%', color:'#3A5728', emoji:'🥕', delay:0 },
                  { top:'40%', left:'60%', color:'#C99B30', emoji:'🌱', delay:0.2 },
                  { top:'55%', left:'35%', color:'#9B2226', emoji:'🥩', delay:0.4 },
                  { top:'30%', left:'25%', color:'#2980B9', emoji:'🥛', delay:0.6 },
                  { top:'60%', left:'65%', color:'#D4A017', emoji:'🍯', delay:0.8 },
                  { top:'45%', left:'50%', color:'#7D3C98', emoji:'🍷', delay:1.0 },
                  { top:'20%', left:'65%', color:'#5F8050', emoji:'🌿', delay:0.3 },
                  { top:'70%', left:'45%', color:'#3A5728', emoji:'🥕', delay:0.7 },
                ].map((pin, i) => (
                  <div key={i} style={{
                    position:'absolute', top:pin.top, left:pin.left,
                    animation: `float 3s ease-in-out ${pin.delay}s infinite`,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  }}>
                    <svg width="32" height="42" viewBox="0 0 52 68" fill="none">
                      <path d="M26 2C14.95 2 6 10.95 6 22C6 36.5 26 66 26 66C26 66 46 36.5 46 22C46 10.95 37.05 2 26 2Z"
                        fill={pin.color} stroke="white" strokeWidth="3"/>
                      <text x="26" y="29" textAnchor="middle" fontSize="17" dominantBaseline="middle">{pin.emoji}</text>
                    </svg>
                  </div>
                ))}

                {/* Popup mockup */}
                <div style={{
                  position:'absolute', top:'15%', left:'48%',
                  background:'white', borderRadius:12, padding:'10px 14px',
                  boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
                  fontSize:11, minWidth:130,
                  animation: 'float 4s ease-in-out 0.5s infinite',
                }}>
                  <div style={{ fontSize:18, marginBottom:2 }}>🥕</div>
                  <div style={{ fontWeight:700, fontSize:12 }}>Farma Nováků</div>
                  <div style={{ color:'#666', fontSize:10 }}>📍 Vysočina</div>
                  <div style={{ marginTop:4, background:'#3A5728', color:'white', borderRadius:6, padding:'2px 6px', fontSize:9, textAlign:'center' }}>
                    📋 Detail →
                  </div>
                </div>

                {/* Stats overlay */}
                <div style={{
                  position:'absolute', bottom:16, left:16, right:16,
                  background:'rgba(30,18,10,0.85)', backdropFilter:'blur(8px)',
                  borderRadius:12, padding:'10px 16px',
                  display:'flex', justifyContent:'space-between',
                  color:'white',
                }}>
                  {[[FARMS_DATA.length, 'farem'], ['14', 'krajů'], ['200+', 'obcí']].map(([n, l]) => (
                    <div key={l} style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:700, fontSize:16, color:'#7DB05A' }}>{n}</div>
                      <div style={{ fontSize:10, opacity:0.7 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dekorativní prvky */}
              <div style={{
                position:'absolute', top:-20, right:-20, width:80, height:80,
                borderRadius:'50%', border:'3px solid rgba(125,176,90,0.3)',
                animation: 'spin-slow 20s linear infinite',
              }}/>
              <div style={{
                position:'absolute', bottom:-10, left:-15,
                background:'white', borderRadius:12, padding:'10px 16px',
                boxShadow:'0 4px 20px rgba(0,0,0,0.1)',
                fontSize:13, fontWeight:600, color:'#3A5728',
                border:'1px solid rgba(58,87,40,0.1)',
              }}>
                🌱 Čerstvé každý den
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JAK TO FUNGUJE */}
      <section id="jak-to-funguje" style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div {...anim('how-title')} style={{ textAlign:'center', marginBottom:60, ...anim('how-title').style }}>
            <div style={{ fontSize:13, fontWeight:700, letterSpacing:3, color:'#7DB05A', textTransform:'uppercase', marginBottom:12 }}>
              Jak to funguje
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:700, color:'#1E120A' }}>
              Tři kroky k čerstvým potravinám
            </h2>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            {[
              { n:'1', emoji:'🗺️', title:'Otevři mapu', desc:'Zobrazíme ti všechny farmy, zelinářství, sýrárny a farmářské trhy ve tvém okolí. Filtruj podle kategorie nebo vzdálenosti.' },
              { n:'2', emoji:'📍', title:'Najdi farmu', desc:'Klikni na pin a zjistíš vše potřebné — otevírací dobu, telefon, web, e-shop. Nebo použij "Kolem mě" a nastav vzdálenost.' },
              { n:'3', emoji:'🛒', title:'Nakup přímo', desc:'Kontaktuj farmáře přímo, navštiv ho osobně, nebo nakup přes e-shop. Žádné zbytečné mezičlánky.' },
            ].map((step, i) => (
              <div key={i} {...anim(`step-${i}`, i * 0.15)} style={{
                display:'flex', gap:24, alignItems:'flex-start',
                padding:28, borderRadius:20,
                background:'#FAFAF7', border:'1px solid rgba(58,87,40,0.08)',
                ...anim(`step-${i}`, i * 0.15).style,
              }}>
                <div className="step-num">{step.n}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{step.emoji}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>{step.title}</h3>
                  <p style={{ color:'#666', lineHeight:1.7, fontSize:15 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div {...anim('how-cta')} style={{ textAlign:'center', marginTop:48, ...anim('how-cta').style }}>
            <button className="btn-primary" onClick={() => navigate('/mapa')} style={{ fontSize:17, padding:'16px 40px' }}>
              🗺️ Otevřít mapu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* SEKCE PRO FARMÁŘE */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #3A5728 0%, #2d4420 60%, #1E2D15 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400,
          borderRadius:'50%', background:'rgba(125,176,90,0.1)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-50, left:-50, width:300, height:300,
          borderRadius:'50%', background:'rgba(201,155,48,0.08)', pointerEvents:'none' }}/>

        <div style={{ maxWidth: 900, margin: '0 auto', position:'relative' }}>
          <div className="farmer-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
            <div {...anim('farmer-text')} style={{ ...anim('farmer-text').style }}>
              <div style={{ fontSize:13, fontWeight:700, letterSpacing:3, color:'#7DB05A', textTransform:'uppercase', marginBottom:12 }}>
                Pro farmáře
              </div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:700, color:'white', marginBottom:20, lineHeight:1.2 }}>
                Přidej svou farmu<br/>
                <em style={{ color:'#A8C97A', fontStyle:'italic' }}>úplně zdarma</em>
              </h2>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:16, lineHeight:1.8, marginBottom:32 }}>
                Dostaneš se k tisícům lidí, kteří hledají lokální potraviny přímo u tebe v kraji.
                Přidání trvá 2 minuty, je zdarma a pomůžeš místnímu zemědělství.
              </p>
              <button className="btn-primary" onClick={() => navigate('/pridat-farmu')}
                style={{ background:'#7DB05A', boxShadow:'0 4px 20px rgba(125,176,90,0.4)', fontSize:16, padding:'16px 32px' }}>
                + Přidat farmu zdarma
              </button>
            </div>

            <div {...anim('farmer-cards')} style={{ display:'flex', flexDirection:'column', gap:16, ...anim('farmer-cards').style }}>
              {[
                { emoji:'👁️', title:'Větší viditelnost', desc:'Tisíce lidí hledají lokální potraviny každý měsíc' },
                { emoji:'💰', title:'Zdarma navždy', desc:'Základní zápis je a vždy bude zdarma' },
                { emoji:'⚡', title:'Rychlé přidání', desc:'Formulář zabere 2 minuty, zápis je okamžitý' },
              ].map((f, i) => (
                <div key={i} style={{
                  background:'rgba(255,255,255,0.08)', backdropFilter:'blur(8px)',
                  borderRadius:16, padding:'20px 24px',
                  border:'1px solid rgba(255,255,255,0.12)',
                  display:'flex', gap:16, alignItems:'center',
                }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{f.emoji}</div>
                  <div>
                    <div style={{ color:'white', fontWeight:700, marginBottom:4 }}>{f.title}</div>
                    <div style={{ color:'rgba(255,255,255,0.65)', fontSize:13 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#1E120A', color: 'rgba(255,255,255,0.5)',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:'white', marginBottom:8 }}>
          <span style={{ color:'#7DB05A' }}>Mapa</span>Farem<span style={{ color:'#7DB05A' }}>.cz</span>
        </div>
        <p style={{ fontSize:13, marginBottom:16 }}>Mapa lokálních farem a přírodních produktů v ČR</p>
        <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap' }}>
          {[['🗺️ Otevřít mapu', '/mapa'], ['🌱 Co je v sezóně', '/sezona'], ['+ Přidat farmu', '/pridat-farmu']].map(([l, h]) => (
            <span key={l} onClick={() => navigate(h)}
              style={{ color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13,
                transition:'color 0.15s' }}
              onMouseEnter={e => e.target.style.color='#7DB05A'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.6)'}>
              {l}
            </span>
          ))}
        </div>
        <p style={{ marginTop:24, fontSize:11 }}>© 2026 MapaFarem.cz · Data: OpenStreetMap</p>
      </footer>
    </div>
  );
}
