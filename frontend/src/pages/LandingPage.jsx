// frontend/src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

const TOP_FARMS = FARMS_DATA
  .filter(f => f.rating >= 4.8 && f.reviews >= 20 && f.lat && f.lng)
  .slice(0, 6);

const CATEGORIES = [
  { emoji: '🥕', label: 'Zelenina & ovoce', filter: 'veggie', count: FARMS_DATA.filter(f=>f.type==='veggie').length },
  { emoji: '🥩', label: 'Maso & uzeniny', filter: 'meat', count: FARMS_DATA.filter(f=>f.type==='meat').length },
  { emoji: '🥛', label: 'Mléko & sýry', filter: 'dairy', count: FARMS_DATA.filter(f=>f.type==='dairy').length },
  { emoji: '🍯', label: 'Med & včely', filter: 'honey', count: FARMS_DATA.filter(f=>f.type==='honey').length },
  { emoji: '🍷', label: 'Víno & nápoje', filter: 'wine', count: FARMS_DATA.filter(f=>f.type==='wine').length },
  { emoji: '🌱', label: 'BIO produkty', filter: 'bio', count: FARMS_DATA.filter(f=>f.bio).length },
  { emoji: '🏪', label: 'Farmářský trh', filter: 'market', count: FARMS_DATA.filter(f=>f.type==='market').length },
  { emoji: '🌿', label: 'Bylinky & čaje', filter: 'herbs', count: FARMS_DATA.filter(f=>f.type==='herbs').length },
];

const TESTIMONIALS = [
  { name: 'Jana K.', loc: 'Praha', text: 'Konečně vím odkud moje jídlo pochází. Každý týden jezdím na farmu, co jsem tu našla.', emoji: '👩', rating: 5 },
  { name: 'Tomáš M.', loc: 'Brno', text: 'Jako farmář jsem získal desítky nových zákazníků za první měsíc. Doporučuji každému.', emoji: '👨‍🌾', rating: 5 },
  { name: 'Petra V.', loc: 'Olomouc', text: 'Mléčné výrobky z okolní farmy jsou úplně jiná kategorie než supermarket.', emoji: '👩‍🍳', rating: 5 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);
  const observerRefs = useRef({});
  const [visible, setVisible] = useState({});

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const setRef = (key) => (el) => {
    if (!el || observerRefs.current[key]) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(v => ({ ...v, [key]: true }));
    }, { threshold: 0.1 });
    obs.observe(el);
    observerRefs.current[key] = obs;
  };

  const fade = (key, delay = 0) => ({
    ref: setRef(key),
    style: {
      opacity: visible[key] ? 1 : 0,
      transform: visible[key] ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search ? `/mapa?q=${encodeURIComponent(search)}` : '/mapa');
  };

  const goMap = (filter) => navigate(filter ? `/mapa?filter=${filter}` : '/mapa');

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF7', color: '#1E120A', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: #3A5728; color: white; }

        .lp-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          font-weight: 700; font-size: 15px; cursor: pointer;
          border: none; transition: all 0.18s; text-decoration: none;
        }
        .lp-btn-green { background: #3A5728; color: white; box-shadow: 0 4px 16px rgba(58,87,40,.3); }
        .lp-btn-green:hover { background: #2d4420; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(58,87,40,.4); }
        .lp-btn-light { background: white; color: #3A5728; border: 1.5px solid rgba(58,87,40,.25); }
        .lp-btn-light:hover { border-color: #3A5728; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.08); }

        .cat-pill {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 18px 12px; border-radius: 16px; cursor: pointer;
          background: white; border: 1.5px solid rgba(58,87,40,.1);
          transition: all 0.18s; min-width: 90px;
        }
        .cat-pill:hover { border-color: #3A5728; background: #f0f5ec; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(58,87,40,.12); }

        .farm-card {
          background: white; border-radius: 18px; overflow: hidden;
          border: 1px solid rgba(58,87,40,.08);
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;
        }
        .farm-card:hover { transform: translateY(-5px); box-shadow: 0 12px 36px rgba(0,0,0,.12); }

        .testi-card {
          background: white; border-radius: 18px; padding: 28px;
          border: 1px solid rgba(58,87,40,.08);
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
        }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-dot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }

        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .cats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .farms-grid { grid-template-columns: 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
          .farmer-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; text-align: center !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(250,250,247,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(58,87,40,0.1)',
        padding: '0 32px', height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 19, cursor: 'pointer' }}>
          <span style={{ color: '#3A5728' }}>Mapa</span>Farem<span style={{ color: '#3A5728' }}>.cz</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="lp-btn lp-btn-light" onClick={() => navigate('/sezona')} style={{ padding: '8px 16px', fontSize: 13 }}>
            🌿 Sezóna
          </button>
          <button className="lp-btn lp-btn-light" onClick={() => navigate('/mapa')} style={{ padding: '8px 16px', fontSize: 13 }}>
            🗺️ Mapa
          </button>
          <button className="lp-btn lp-btn-green" onClick={() => navigate('/pridat-farmu')} style={{ padding: '9px 20px', fontSize: 13 }}>
            + Přidat farmu
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #1E2D15 0%, #2d4420 40%, #3A5728 100%)',
        display: 'flex', alignItems: 'center',
        padding: '80px 32px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* BG texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 20% 50%, rgba(125,176,90,.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201,155,48,.1) 0%, transparent 40%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 80, right: -60, width: 420, height: 420, borderRadius: '50%', border: '1px solid rgba(125,176,90,.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 130, right: -10, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(125,176,90,.1)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 70, alignItems: 'center' }}>

            {/* LEFT */}
            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(125,176,90,.15)', border: '1px solid rgba(125,176,90,.3)',
                padding: '6px 14px', borderRadius: 50,
                fontSize: 12, fontWeight: 600, color: '#A8C97A',
                marginBottom: 24,
                opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(12px)',
                transition: 'opacity 0.6s 0.1s, transform 0.6s 0.1s',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7DB05A', animation: 'pulse-dot 2s infinite' }} />
                {FARMS_DATA.length.toLocaleString('cs-CZ')} farem aktivních v ČR
              </div>

              <h1 className="hero-title" style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 58, fontWeight: 900, lineHeight: 1.1,
                color: 'white', marginBottom: 22,
                opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.7s 0.2s, transform 0.7s 0.2s',
              }}>
                Lokální farmáři<br />
                <em style={{ color: '#A8C97A', fontStyle: 'italic' }}>přímo u tebe</em>
              </h1>

              <p style={{
                fontSize: 17, color: 'rgba(255,255,255,.7)', lineHeight: 1.75,
                marginBottom: 36, maxWidth: 460,
                opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.7s 0.35s, transform 0.7s 0.35s',
              }}>
                Největší mapa lokálních farem v Česku. Zelenina, maso, sýry, med, víno —
                vše čerstvé, přímo od farmáře, bez mezičlánků.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} style={{
                display: 'flex', gap: 0, marginBottom: 28, maxWidth: 480,
                opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.7s 0.45s, transform 0.7s 0.45s',
              }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Hledat obec, kraj, produkt..."
                  style={{
                    flex: 1, padding: '14px 18px',
                    borderRadius: '12px 0 0 12px', border: 'none',
                    fontSize: 15, outline: 'none',
                    background: 'rgba(255,255,255,.12)', color: 'white',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <button type="submit" className="lp-btn lp-btn-green" style={{
                  borderRadius: '0 12px 12px 0', padding: '14px 22px', fontSize: 14,
                }}>
                  🔍 Hledat
                </button>
              </form>

              {/* Quick links */}
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap',
                opacity: heroVisible ? 1 : 0,
                transition: 'opacity 0.7s 0.6s',
              }}>
                {[
                  { label: '📍 Kolem mě', action: () => navigate('/mapa') },
                  { label: '🌿 Co je teď v sezóně', action: () => navigate('/sezona') },
                  { label: '🛒 Farmářské trhy', action: () => goMap('market') },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action} style={{
                    background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
                    color: 'rgba(255,255,255,.85)', padding: '7px 14px',
                    borderRadius: 50, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.85)'; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — vizuální mapa mockup */}
            <div style={{
              opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateX(30px)',
              transition: 'opacity 0.8s 0.4s, transform 0.8s 0.4s',
              position: 'relative',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #2d4a1e, #4a6e30)',
                borderRadius: 24, overflow: 'hidden',
                aspectRatio: '4/3', position: 'relative',
                boxShadow: '0 32px 80px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.08)',
              }}>
                {/* mapa grid */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.25,
                  backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 38px,rgba(255,255,255,.15) 39px),repeating-linear-gradient(90deg,transparent,transparent 38px,rgba(255,255,255,.15) 39px)` }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 40%, rgba(168,201,122,.2), transparent 65%)' }} />

                {/* Piny */}
                {[
                  { top:'22%', left:'42%', color:'#7DB05A', emoji:'🥕', delay:0 },
                  { top:'38%', left:'62%', color:'#C99B30', emoji:'🌱', delay:.3 },
                  { top:'55%', left:'30%', color:'#C0392B', emoji:'🥩', delay:.6 },
                  { top:'28%', left:'22%', color:'#5DADE2', emoji:'🥛', delay:.9 },
                  { top:'60%', left:'65%', color:'#D4A017', emoji:'🍯', delay:.2 },
                  { top:'45%', left:'50%', color:'#8E44AD', emoji:'🍷', delay:.7 },
                  { top:'18%', left:'68%', color:'#27AE60', emoji:'🌿', delay:.4 },
                ].map((p, i) => (
                  <div key={i} style={{ position:'absolute', top:p.top, left:p.left, animation:`float 3.5s ease-in-out ${p.delay}s infinite`, filter:'drop-shadow(0 4px 8px rgba(0,0,0,.35))' }}>
                    <svg width="30" height="40" viewBox="0 0 52 68" fill="none">
                      <path d="M26 2C14.95 2 6 10.95 6 22C6 36.5 26 66 26 66C26 66 46 36.5 46 22C46 10.95 37.05 2 26 2Z" fill={p.color} stroke="white" strokeWidth="3.5"/>
                      <text x="26" y="29" textAnchor="middle" fontSize="17" dominantBaseline="middle">{p.emoji}</text>
                    </svg>
                  </div>
                ))}

                {/* Popup */}
                <div style={{
                  position:'absolute', top:'12%', left:'44%',
                  background:'white', borderRadius:12, padding:'10px 14px',
                  boxShadow:'0 8px 28px rgba(0,0,0,.25)', fontSize:11, minWidth:130,
                  animation:'float 4.5s ease-in-out .5s infinite',
                }}>
                  <div style={{ fontSize:16, marginBottom:2 }}>🥕</div>
                  <div style={{ fontWeight:700, fontSize:12, color:'#1E120A' }}>Farma Novákových</div>
                  <div style={{ color:'#888', fontSize:10, marginBottom:4 }}>📍 Vysočina · ⭐ 4.9</div>
                  <div style={{ background:'#3A5728', color:'white', borderRadius:6, padding:'2px 8px', fontSize:9, textAlign:'center', fontWeight:700 }}>
                    Detail →
                  </div>
                </div>

                {/* Stats bar */}
                <div style={{
                  position:'absolute', bottom:0, left:0, right:0,
                  background:'rgba(15,25,10,.88)', backdropFilter:'blur(10px)',
                  padding:'12px 20px',
                  display:'flex', justifyContent:'space-around',
                }}>
                  {[[FARMS_DATA.length.toLocaleString('cs-CZ'), 'farem'], ['14', 'krajů'], ['4.7★', 'průměr']].map(([n,l]) => (
                    <div key={l} style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:800, fontSize:15, color:'#A8C97A' }}>{n}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.55)' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div style={{
                position:'absolute', bottom:-16, left:-16,
                background:'white', borderRadius:12, padding:'10px 16px',
                boxShadow:'0 8px 24px rgba(0,0,0,.15)',
                fontSize:12, fontWeight:700, color:'#3A5728',
                border:'1px solid rgba(58,87,40,.12)',
              }}>
                ✅ Schválené farmy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORIE */}
      <section style={{ padding: '72px 32px 60px', background: '#FAFAF7' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div {...fade('cats-title')} style={{ textAlign:'center', marginBottom:40, ...fade('cats-title').style }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'#7DB05A', textTransform:'uppercase', marginBottom:10 }}>Procházet podle kategorie</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700 }}>Co hledáš?</h2>
          </div>

          <div className="cats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:12 }}>
            {CATEGORIES.map((c, i) => (
              <div key={c.filter} {...fade(`cat-${i}`, i * 0.05)} style={{ ...fade(`cat-${i}`, i * 0.05).style }}>
                <div className="cat-pill" onClick={() => goMap(c.filter)}>
                  <span style={{ fontSize: 26 }}>{c.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, textAlign:'center', color:'#1E120A', lineHeight:1.3 }}>{c.label}</span>
                  <span style={{ fontSize: 10, color:'#999' }}>{c.count} míst</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEJLEPŠÍ FARMY */}
      {TOP_FARMS.length > 0 && (
        <section style={{ padding: '60px 32px 80px', background: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div {...fade('farms-title')} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:12, ...fade('farms-title').style }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'#7DB05A', textTransform:'uppercase', marginBottom:8 }}>Nejlépe hodnocené</div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700 }}>Farmy, které stojí za návštěvu</h2>
              </div>
              <button className="lp-btn lp-btn-light" onClick={() => navigate('/mapa')} style={{ flexShrink:0 }}>
                Zobrazit všechny →
              </button>
            </div>

            <div className="farms-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
              {TOP_FARMS.slice(0, 3).map((farm, i) => {
                const color = { veggie:'#5F8050', meat:'#9B2226', dairy:'#2980B9', honey:'#D4A017', wine:'#7D3C98', bio:'#3A5728', herbs:'#27AE60', market:'#E67E22' }[farm.type] || '#5F8050';
                return (
                  <div key={farm.id} className="farm-card" onClick={() => navigate(`/farma/${farm.id}`)}
                    {...fade(`farm-${i}`, i * 0.1)} style={{ ...fade(`farm-${i}`, i * 0.1).style }}>
                    {/* Header */}
                    <div style={{ background:`linear-gradient(135deg,${color},${color}bb)`, padding:'24px 20px 20px', position:'relative' }}>
                      <div style={{ fontSize:36, marginBottom:6 }}>{farm.emoji}</div>
                      <div style={{ fontWeight:700, fontSize:16, color:'white', lineHeight:1.2 }}>{farm.name}</div>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,.75)', marginTop:4 }}>📍 {farm.loc || 'Česká republika'}</div>
                      <div style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,.2)', borderRadius:8, padding:'3px 8px', fontSize:12, color:'white', fontWeight:700 }}>
                        ⭐ {farm.rating}
                      </div>
                    </div>
                    {/* Body */}
                    <div style={{ padding:'16px 20px' }}>
                      {farm.description && (
                        <p style={{ fontSize:13, color:'#555', lineHeight:1.6, marginBottom:12 }}>
                          {farm.description.length > 100 ? farm.description.slice(0,100)+'…' : farm.description}
                        </p>
                      )}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                        {farm.bio && <span style={{ fontSize:10, background:'#E8F5E4', color:'#3A5728', borderRadius:6, padding:'2px 8px', fontWeight:700 }}>🌱 BIO</span>}
                        {farm.eshop && <span style={{ fontSize:10, background:'#EDE5D0', color:'#5F4320', borderRadius:6, padding:'2px 8px', fontWeight:700 }}>🛒 E-shop</span>}
                        {farm.delivery && <span style={{ fontSize:10, background:'#E3EEF8', color:'#1A5276', borderRadius:6, padding:'2px 8px', fontWeight:700 }}>🚚 Rozvoz</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#7DB05A', fontWeight:700 }}>Detail farmy →</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* JAK TO FUNGUJE */}
      <section id="jak-to-funguje" style={{ padding: '80px 32px', background: '#F4EDD8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div {...fade('how-title')} style={{ textAlign:'center', marginBottom:56, ...fade('how-title').style }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'#7DB05A', textTransform:'uppercase', marginBottom:10 }}>Jak to funguje</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:700 }}>
              Od mapy k čerstvé zelenině<br/>za&nbsp;<em style={{ color:'#3A5728' }}>3 minuty</em>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { n:'01', emoji:'🗺️', color:'#3A5728', title:'Otevři mapu', desc:'Zobrazíme ti farmy ve tvém okolí. Filtruj podle kategorie, vzdálenosti nebo otevírací doby.' },
              { n:'02', emoji:'📍', color:'#C99B30', title:'Vyber farmu', desc:'Zobraz detail — otevírací dobu, telefon, hodnocení. Nebo najdi farmu funkcí "Kolem mě".' },
              { n:'03', emoji:'🛒', color:'#9B2226', title:'Nakup přímo', desc:'Navštiv farmáře osobně, zavolej nebo nakup přes e-shop. Žádné mezičlánky.' },
            ].map((s, i) => (
              <div key={i} {...fade(`step-${i}`, i * 0.15)} style={{
                background:'white', borderRadius:20, padding:'32px 28px',
                border:'1px solid rgba(58,87,40,.1)',
                boxShadow:'0 2px 12px rgba(0,0,0,.05)',
                ...fade(`step-${i}`, i * 0.15).style,
              }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:42, fontWeight:900, color:`${s.color}22`, marginBottom:4 }}>{s.n}</div>
                <div style={{ fontSize:32, marginBottom:12 }}>{s.emoji}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, marginBottom:10 }}>{s.title}</h3>
                <p style={{ color:'#666', fontSize:14, lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div {...fade('how-cta')} style={{ textAlign:'center', marginTop:44, ...fade('how-cta').style }}>
            <button className="lp-btn lp-btn-green" onClick={() => navigate('/mapa')} style={{ fontSize:16, padding:'16px 36px' }}>
              🗺️ Otevřít mapu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 32px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div {...fade('testi-title')} style={{ textAlign:'center', marginBottom:48, ...fade('testi-title').style }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'#7DB05A', textTransform:'uppercase', marginBottom:10 }}>Co říkají uživatelé</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:700 }}>Tisíce spokojených zákazníků</h2>
          </div>

          <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card" {...fade(`t-${i}`, i * 0.1)} style={{ ...fade(`t-${i}`, i * 0.1).style }}>
                <div style={{ fontSize:20, marginBottom:12 }}>{'⭐'.repeat(t.rating)}</div>
                <p style={{ fontSize:14, color:'#444', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'#E8F0E4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{t.emoji}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'#888' }}>📍 {t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRO FARMÁŘE */}
      <section style={{
        padding: '80px 32px',
        background: 'linear-gradient(135deg, #1E2D15 0%, #3A5728 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle at 80% 50%, rgba(125,176,90,.12), transparent 55%)`, pointerEvents:'none' }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', position:'relative' }}>
          <div className="farmer-grid" style={{ display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:60, alignItems:'center' }}>
            <div {...fade('farmer-left')} style={{ ...fade('farmer-left').style }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, color:'#A8C97A', textTransform:'uppercase', marginBottom:12 }}>Pro farmáře a producenty</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:700, color:'white', lineHeight:1.2, marginBottom:20 }}>
                Získej nové zákazníky<br/>
                <em style={{ color:'#A8C97A' }}>úplně zdarma</em>
              </h2>
              <p style={{ color:'rgba(255,255,255,.7)', fontSize:16, lineHeight:1.8, marginBottom:32 }}>
                Přidej svou farmu za 2 minuty a dostaň se k tisícům lidí, kteří hledají lokální potraviny
                přímo v tvém kraji.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <button className="lp-btn" onClick={() => navigate('/pridat-farmu')} style={{ background:'#7DB05A', color:'white', fontSize:15, padding:'14px 28px', boxShadow:'0 4px 20px rgba(125,176,90,.35)' }}>
                  + Přidat farmu zdarma
                </button>
                <button className="lp-btn" onClick={() => navigate('/dashboard')} style={{ background:'rgba(255,255,255,.1)', color:'white', border:'1px solid rgba(255,255,255,.25)', fontSize:15, padding:'14px 28px' }}>
                  Dashboard →
                </button>
              </div>
            </div>

            <div {...fade('farmer-right')} style={{ display:'flex', flexDirection:'column', gap:14, ...fade('farmer-right').style }}>
              {[
                { emoji:'👁️', n:'15 000+', title:'měsíčních návštěvníků', desc:'Hledají lokální potraviny právě teď' },
                { emoji:'💰', n:'100% zdarma', title:'základní zápis', desc:'Bez skrytých poplatků, navždy' },
                { emoji:'⚡', n:'2 minuty', title:'přidání farmy', desc:'Jednoduchý formulář, okamžité zobrazení' },
              ].map((f, i) => (
                <div key={i} style={{
                  background:'rgba(255,255,255,.08)', backdropFilter:'blur(8px)',
                  borderRadius:14, padding:'18px 22px',
                  border:'1px solid rgba(255,255,255,.1)',
                  display:'flex', gap:16, alignItems:'center',
                }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{f.emoji}</div>
                  <div>
                    <div style={{ color:'#A8C97A', fontWeight:800, fontSize:16 }}>{f.n}</div>
                    <div style={{ color:'white', fontWeight:600, fontSize:13 }}>{f.title}</div>
                    <div style={{ color:'rgba(255,255,255,.55)', fontSize:12, marginTop:2 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F1A09', padding: '48px 32px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20, color:'white', marginBottom:12 }}>
                <span style={{ color:'#7DB05A' }}>Mapa</span>Farem<span style={{ color:'#7DB05A' }}>.cz</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.7, maxWidth:240 }}>
                Největší mapa lokálních farem a přírodních produktů v České republice.
              </p>
            </div>
            {[
              { title:'Procházet', links:[['🗺️ Otevřít mapu','/mapa'],['🌿 Sezónní průvodce','/sezona'],['🥩 Carnivore','/mapa']] },
              { title:'Farmáři', links:[['+ Přidat farmu','/pridat-farmu'],['📊 Dashboard','/dashboard'],['👤 Profil','/profil']] },
              { title:'Účet', links:[['Přihlásit se','/prihlaseni'],['Registrace','/registrace'],['Oblíbené','/oblibene']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700, fontSize:13, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:2, marginBottom:14 }}>{col.title}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {col.links.map(([l, h]) => (
                    <span key={l} onClick={() => navigate(h)} style={{ fontSize:13, color:'rgba(255,255,255,.45)', cursor:'pointer', transition:'color .15s' }}
                      onMouseEnter={e => e.target.style.color='#7DB05A'}
                      onMouseLeave={e => e.target.style.color='rgba(255,255,255,.45)'}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>© 2026 MapaFarem.cz · Data: OpenStreetMap contributors</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>Podpora lokálního zemědělství v ČR</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
