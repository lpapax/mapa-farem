// frontend/src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

/* ─── Mapbox Static map ─── */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TOP_MAP_FARMS = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.8
    && f.lat > 48.5 && f.lat < 51.1
    && f.lng > 12.0 && f.lng < 19.0)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 14);

const MAP_PINS_STR = TOP_MAP_FARMS
  .map(f => {
    const lng = parseFloat(f.lng);
    const lat = parseFloat(f.lat);
    if (!isNaN(lng) && !isNaN(lat)) return `pin-s+3a5728(${lng.toFixed(4)},${lat.toFixed(4)})`;
    return '';
  }).filter(Boolean).join(',');

const MAPBOX_IMG = MAPBOX_TOKEN && MAP_PINS_STR
  ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${MAP_PINS_STR}/15.4,49.8,6.05,0,0/1100x460@2x?access_token=${MAPBOX_TOKEN}&logo=false&attribution=false`
  : null;

const BOHEMIA_FARM = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.8 && f.lng < 15.5)
  .sort((a, b) => b.rating - a.rating)[0];
const MORAVIA_FARM = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.8 && f.lng >= 16.0)
  .sort((a, b) => b.rating - a.rating)[0];

/* ─── Design tokens — Premium Organic + Rustic Editorial ─── */
const C = {
  cream: '#F5EDE0',
  light: '#FDFAF4',
  dark: '#1A2D18',
  darkDeep: '#111D10',
  gold: '#C8973A',
  goldLight: '#DDB04E',
  green: '#3A5728',
  brown: '#2C1810',
};

const CAT_PHOTOS = [
  { label:'Zelenina & ovoce',   filter:'veggie', emoji:'🥕',
    img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=80&fit=crop' },
  { label:'Mléčné výrobky',     filter:'dairy',  emoji:'🥛',
    img:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=700&q=80&fit=crop' },
  { label:'Maso & uzeniny',     filter:'meat',   emoji:'🥩',
    img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=700&q=80&fit=crop' },
];

function FarmCard({ farm, navigate, style }) {
  if (!farm) return null;
  return (
    <div style={{
      position:'absolute', background:'rgba(17,29,16,.97)', backdropFilter:'blur(12px)',
      borderRadius:2, padding:'12px 16px',
      boxShadow:'0 12px 40px rgba(0,0,0,.4)',
      minWidth:196, border:'1px solid rgba(200,151,58,.25)', ...style,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ fontSize:10, color:'rgba(245,237,224,.4)', textTransform:'uppercase', letterSpacing:1 }}>Ověřená farma</div>
        <div style={{ fontSize:9, fontWeight:700, color:C.gold, background:'rgba(200,151,58,.12)', borderRadius:2, padding:'2px 7px' }}>🌿 BIO</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(200,151,58,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
          {farm.emoji}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:C.cream, lineHeight:1.2 }}>{farm.name?.slice(0,22)}</div>
          <div style={{ fontSize:11, color:'rgba(245,237,224,.4)' }}>📍 {farm.loc}</div>
        </div>
      </div>
      <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:8 }}>⭐ {farm.rating}</div>
      <button onClick={() => navigate(`/farma/${farm.id}`)} style={{ width:'100%', padding:'6px', background:C.gold, color:'white', border:'none', borderRadius:2, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
        Zobrazit farmu →
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();

  const [farmCount, setFarmCount] = useState(0);
  const statsRef = useRef(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const target = FARMS_DATA.length;
      const dur = 1800;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setFarmCount(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.dark, color:C.cream, overflowX:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        .cat-card{overflow:hidden;cursor:pointer;position:relative;transition:transform .35s;}
        .cat-card:hover{transform:scale(1.015);}
        .cat-card img{width:100%;height:320px;object-fit:cover;display:block;transition:transform .5s,filter .35s;}
        .cat-card:hover img{transform:scale(1.07);filter:brightness(.8);}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(17,29,16,.88) 0%,rgba(17,29,16,.15) 55%,transparent 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:28px;}
        .step-card{background:white;padding:40px 32px;position:relative;border:1px solid rgba(44,24,16,.06);transition:box-shadow .25s,transform .25s;}
        .step-card:hover{box-shadow:0 12px 40px rgba(44,24,16,.12);transform:translateY(-4px);}
        .review-card{background:rgba(255,255,255,.04);border:1px solid rgba(200,151,58,.1);padding:32px;transition:border-color .25s;}
        .review-card:hover{border-color:rgba(200,151,58,.3);}
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;}
          .hero-img{display:none!important;}
          .cat-grid{grid-template-columns:1fr!important;}
          .steps-grid{grid-template-columns:1fr!important;}
          .testimonials-grid{grid-template-columns:1fr!important;}
          .footer-grid{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:600px){.nav-links{display:none!important;}}
        .mobile-cta{display:none!important;}
        @media(max-width:768px){.mobile-cta{display:flex!important;}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:300,
        background:'rgba(26,45,24,.96)', backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(200,151,58,.12)',
        padding:'0 40px', height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <span style={{ fontSize:22 }}>🌾</span>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:19, color:C.cream }}>
            Mapa<span style={{ color:C.gold }}>Farem</span>
          </div>
        </div>
        <div className="nav-links" style={{ display:'flex', gap:4, alignItems:'center' }}>
          {[['Produkty','/mapa'],['O nás','/o-nas'],['Farmáři','/pridat-farmu']].map(([l,h]) => (
            <button key={l} onClick={() => navigate(h)}
              style={{ padding:'8px 15px', background:'none', border:'none', fontSize:14, fontWeight:500, cursor:'pointer', color:'rgba(245,237,224,.65)', fontFamily:"'DM Sans',sans-serif", borderRadius:4, transition:'color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=C.cream}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,237,224,.65)'}>{l}</button>
          ))}
          <button onClick={() => navigate('/mapa')}
            style={{ padding:'10px 22px', background:C.gold, color:'white', border:'none', borderRadius:2, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", marginLeft:12, letterSpacing:.5, transition:'background .15s' }}
            onMouseEnter={e=>e.currentTarget.style.background=C.goldLight}
            onMouseLeave={e=>e.currentTarget.style.background=C.gold}>
            Otevřít mapu
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', background:C.dark, paddingTop:64, position:'relative', overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(200,151,58,.05) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:-100, right:-60, width:500, height:500, background:'radial-gradient(circle, rgba(200,151,58,.07) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-100, left:-80, width:480, height:480, background:'radial-gradient(circle, rgba(58,87,40,.14) 0%, transparent 65%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', padding:'48px 40px' }}>
          <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>

            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(200,151,58,.12)', border:'1px solid rgba(200,151,58,.3)', padding:'5px 16px', borderRadius:2, fontSize:11, fontWeight:700, color:C.gold, marginBottom:28, letterSpacing:2, textTransform:'uppercase' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:C.gold, display:'inline-block' }}/>
                {FARMS_DATA.length.toLocaleString('cs-CZ')} ověřených farem
              </div>

              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(38px,4.2vw,56px)', fontWeight:900, lineHeight:1.08, color:C.cream, marginBottom:24 }}>
                Poctivé jídlo<br/>
                <em style={{ color:C.gold, fontStyle:'italic' }}>přímo od farmáře</em><br/>
                ve tvém okolí
              </h1>

              <p style={{ fontSize:16, color:'rgba(245,237,224,.6)', lineHeight:1.85, marginBottom:40, maxWidth:440 }}>
                {FARMS_DATA.length} lokálních farem na jedné mapě. Zelenina, sýry, maso, med — bez supermarketů, bez mezičlánků.
              </p>

              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:48 }}>
                <button onClick={() => navigate('/mapa')}
                  style={{ padding:'15px 36px', background:C.gold, color:'white', border:'none', borderRadius:2, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", letterSpacing:.5, transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.goldLight;e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background=C.gold;e.currentTarget.style.transform='none';}}>
                  Objevit farmy v okolí
                </button>
                <button onClick={() => navigate('/pridat-farmu')}
                  style={{ padding:'15px 36px', background:'transparent', color:C.cream, border:'1px solid rgba(245,237,224,.25)', borderRadius:2, fontWeight:500, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'border-color .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(245,237,224,.7)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(245,237,224,.25)'}>
                  Přidat svou farmu →
                </button>
              </div>

              <div ref={statsRef} style={{ display:'flex', gap:0, paddingTop:28, borderTop:'1px solid rgba(200,151,58,.15)' }}>
                {[
                  { n:(farmCount||FARMS_DATA.length).toLocaleString('cs-CZ'), l:'ověřených farem' },
                  { n:'14', l:'krajů pokryto' },
                  { n:'4.5★', l:'průměrné hodnocení' },
                ].map(({n,l},i) => (
                  <div key={l} style={{ flex:1, paddingLeft:i>0?28:0, borderLeft:i>0?'1px solid rgba(200,151,58,.15)':undefined }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:C.gold, lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:12, color:'rgba(245,237,224,.35)', marginTop:5, letterSpacing:.5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-img" style={{ position:'relative' }}>
              <div style={{ borderRadius:2, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.5)', aspectRatio:'4/5', position:'relative', border:'1px solid rgba(200,151,58,.15)' }}>
                <img
                  src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=900&q=85&fit=crop&crop=faces,top"
                  alt="Farmářka s čerstvou sklizní"
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 20%' }}
                />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(26,45,24,.55) 0%, transparent 50%)' }}/>
              </div>
              {/* Corner accents */}
              <div style={{ position:'absolute', top:-10, left:-10, width:48, height:48, border:'1.5px solid rgba(200,151,58,.35)', borderRight:'none', borderBottom:'none', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:-10, right:-10, width:48, height:48, border:'1.5px solid rgba(200,151,58,.35)', borderLeft:'none', borderTop:'none', pointerEvents:'none' }}/>
              {/* Social proof chip */}
              <div style={{ position:'absolute', top:24, right:-16, background:'rgba(17,29,16,.96)', backdropFilter:'blur(12px)', borderRadius:2, padding:'11px 18px', boxShadow:'0 8px 32px rgba(0,0,0,.4)', border:'1px solid rgba(200,151,58,.2)', minWidth:160 }}>
                <div style={{ fontSize:10, color:C.gold, textTransform:'uppercase', letterSpacing:2, marginBottom:5 }}>Zlínský kraj</div>
                <div style={{ fontWeight:700, fontSize:13, color:C.cream }}>Ke Kořenům ⭐ 4.9</div>
                <div style={{ fontSize:11, color:'rgba(245,237,224,.4)', marginTop:2 }}>Lokální produkty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORIE — Cream editorial ── */}
      <section style={{ background:C.cream, padding:'80px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 40px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, textTransform:'uppercase', marginBottom:10 }}>Čerstvé produkty</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:700, color:C.brown, lineHeight:1.15 }}>Vyberte kategorii</h2>
            </div>
            <button onClick={() => navigate('/mapa')}
              style={{ padding:'12px 28px', background:'transparent', color:C.green, border:`1.5px solid ${C.green}`, borderRadius:2, fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", letterSpacing:.5, transition:'all .2s', flexShrink:0 }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.color='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.green;}}>
              Zobrazit vše →
            </button>
          </div>
          <div className="cat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3 }}>
            {CAT_PHOTOS.map((c) => (
              <div key={c.filter} className="cat-card" onClick={() => navigate(`/mapa?filter=${c.filter}`)}>
                <img src={c.img} alt={c.label}/>
                <div className="cat-overlay">
                  <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:3, textTransform:'uppercase', marginBottom:6 }}>{c.emoji} {c.filter}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'white', lineHeight:1.2 }}>{c.label}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginTop:6 }}>Zobrazit na mapě →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEZÓNA BANNER — Gold ── */}
      <section style={{ padding:'0 40px', background:C.cream }}>
        <div style={{ maxWidth:1100, margin:'0 auto', paddingBottom:80 }}>
          <div style={{ background:`linear-gradient(135deg, ${C.gold} 0%, #A07228 100%)`, padding:'44px 52px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap', position:'relative', overflow:'hidden', borderRadius:2 }}>
            <div style={{ position:'absolute', right:-20, top:-20, width:200, height:200, border:'1px solid rgba(255,255,255,.08)', borderRadius:'50%', pointerEvents:'none' }}/>
            <div style={{ color:'white', zIndex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, opacity:.7, textTransform:'uppercase', marginBottom:10 }}>Sezónní průvodce</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:8, lineHeight:1.2 }}>Co je teď v sezóně?</h3>
              <p style={{ fontSize:14, opacity:.85, lineHeight:1.75, maxWidth:380 }}>
                {(() => { const m = new Date().getMonth()+1; return m>=3&&m<=5?'Jaro přináší chřest, jahody a špenát. Nakupujte přímo od farmáře.':m>=6&&m<=8?'Léto je čas rajčat, borůvek a hrášku. Využijte sezónu naplno.':m>=9&&m<=11?'Podzim: dýně, jablka, houby. Jezte sezónně a lokálně.':'Zima: kořenová zelenina, kvašené produkty a uchovaná dobrota.'; })()}
              </p>
            </div>
            <button onClick={() => navigate('/sezona')}
              style={{ padding:'14px 32px', background:'white', color:C.gold, border:'none', borderRadius:2, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", flexShrink:0, letterSpacing:.5, transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              Otevřít průvodce →
            </button>
          </div>
        </div>
      </section>

      {/* ── MAPA — Dark section ── */}
      <section style={{ padding:'88px 40px', background:C.dark, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(200,151,58,.04) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, textTransform:'uppercase', marginBottom:12 }}>Naše farmy</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:700, color:C.cream }}>
              {FARMS_DATA.length}+ farmářů na jedné mapě
            </h2>
            <p style={{ fontSize:15, color:'rgba(245,237,224,.4)', marginTop:12 }}>Pokrýváme všech 14 krajů České republiky</p>
          </div>

          <div style={{ border:'1px solid rgba(200,151,58,.15)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ background:'rgba(255,255,255,.03)', padding:'14px 20px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid rgba(200,151,58,.1)' }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:2, textTransform:'uppercase' }}>📍 Farmy v České republice</span>
            </div>
            <div style={{ position:'relative' }}>
              {MAPBOX_IMG ? (
                <img src={MAPBOX_IMG} alt="Mapa farem" style={{ width:'100%', height:'auto', display:'block', filter:'brightness(.88) saturate(.9)' }} loading="lazy"/>
              ) : (
                <div style={{ height:400, background:'rgba(255,255,255,.03)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(245,237,224,.3)', fontSize:14 }}>
                  Mapa se načítá…
                </div>
              )}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top, rgba(17,29,16,.88) 0%, transparent 100%)', padding:'28px 28px 18px', display:'flex', gap:36, alignItems:'flex-end' }}>
                {[[`${FARMS_DATA.length}+`,'farem'],['14','krajů'],['4.5 ⭐','hodnocení']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:C.gold, lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:11, color:'rgba(245,237,224,.45)', marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>
              <FarmCard farm={BOHEMIA_FARM} navigate={navigate} style={{ top:16, left:16 }}/>
              <FarmCard farm={MORAVIA_FARM} navigate={navigate} style={{ top:16, right:16 }}/>
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:40 }}>
            <button onClick={() => navigate('/pridat-farmu')}
              style={{ padding:'14px 38px', background:'transparent', color:C.gold, border:'1px solid rgba(200,151,58,.35)', borderRadius:2, fontWeight:600, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", letterSpacing:.5, transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,151,58,.08)';e.currentTarget.style.borderColor=C.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(200,151,58,.35)';}}>
              + Přidat svou farmu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── JAK TO FUNGUJE — Cream editorial ── */}
      <section style={{ padding:'88px 40px', background:C.cream }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ marginBottom:64 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, textTransform:'uppercase', marginBottom:12 }}>Postup</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:700, color:C.brown, maxWidth:400, lineHeight:1.2 }}>Tři kroky k čerstvým potravinám</h2>
          </div>
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
            {[
              { n:'01', emoji:'🗺️', title:'Otevři mapu', desc:'Zobraz farmy ve svém okolí, filtruj podle kategorie nebo vzdálenosti.', color:C.green },
              { n:'02', emoji:'📍', title:'Najdi farmu',  desc:'Detail s telefonem, hodnocením, otevírací dobou a možností rozvozu.', color:C.gold },
              { n:'03', emoji:'🛒', title:'Nakup přímo', desc:'Kontaktuj farmáře osobně nebo nakup přes e-shop bez mezičlánků.',   color:C.dark },
            ].map((s,i) => (
              <div key={i} className="step-card">
                <div style={{ position:'absolute', top:14, right:18, fontFamily:"'Playfair Display',serif", fontSize:72, fontWeight:900, color:`${s.color}07`, lineHeight:1, userSelect:'none', pointerEvents:'none' }}>{s.n}</div>
                <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>Krok {s.n}</div>
                <div style={{ fontSize:36, marginBottom:16 }}>{s.emoji}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:C.brown, marginBottom:12 }}>{s.title}</h3>
                <p style={{ fontSize:14, color:'#6B4F3A', lineHeight:1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:52 }}>
            <button onClick={() => navigate('/mapa')}
              style={{ padding:'15px 40px', background:C.dark, color:'white', border:'none', borderRadius:2, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", letterSpacing:.5, transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.green}
              onMouseLeave={e=>e.currentTarget.style.background=C.dark}>
              🗺️ Otevřít mapu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── RECENZE — Dark editorial ── */}
      <section style={{ padding:'88px 40px', background:C.dark, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(200,151,58,.04) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:56, flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, textTransform:'uppercase', marginBottom:12 }}>Reference</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:700, color:C.cream }}>Co říkají zákazníci</h2>
            </div>
          </div>

          <div className="testimonials-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }}>
            {[
              { name:'Petra H.', loc:'Zlínský kraj', rating:5, text:'Konečně vím, kde koupit čerstvé mléko a sýr bez chemie. Minimlékárna ZPZ je top — přímo od farmáře, bez mezičlánků.', farm:'Minimlékárna - Farma ZPZ', avatar:'🥛' },
              { name:'Radek M.', loc:'Zlínský kraj', rating:5, text:'Přes mapu jsem objevil výborný med od včelaře kousek od Zlína. Žádný supermarket, žádné přidané věci — jen čistý med.', farm:'MED přímo od včelaře', avatar:'🍯' },
              { name:'Lenka V.', loc:'Zlínský kraj', rating:5, text:'Ke Kořenům je přesně to, co jsem hledala. Bylinky, koření, vše lokální a kvalitní. Chodím tam každý týden.', farm:'Ke Kořenům', avatar:'🌿' },
            ].map((r,i) => (
              <div key={i} className="review-card">
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:52, color:C.gold, lineHeight:.8, marginBottom:16, opacity:.5 }}>"</div>
                <p style={{ fontSize:14, color:'rgba(245,237,224,.65)', lineHeight:1.85, marginBottom:24 }}>{r.text}</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:20, borderTop:'1px solid rgba(200,151,58,.1)' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(200,151,58,.1)', border:'1px solid rgba(200,151,58,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:C.cream }}>{r.name} <span style={{ color:'rgba(245,237,224,.3)', fontWeight:400 }}>· {r.loc}</span></div>
                    <div style={{ fontSize:11, color:C.gold, marginTop:2 }}>{'★'.repeat(r.rating)} <span style={{ color:'rgba(245,237,224,.25)', fontWeight:400 }}>u farmy {r.farm}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust strip */}
          <div style={{ marginTop:64, display:'flex', justifyContent:'center', borderTop:'1px solid rgba(200,151,58,.1)', paddingTop:48 }}>
            {[
              { n:'1 695', l:'ověřených farem' },
              { n:'4.5★', l:'průměrné hodnocení' },
              { n:'14', l:'krajů pokryto' },
              { n:'Zdarma', l:'přidání farmy' },
            ].map(({n,l},i) => (
              <div key={l} style={{ flex:1, textAlign:'center', borderLeft:i>0?'1px solid rgba(200,151,58,.1)':undefined }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, color:C.gold }}>{n}</div>
                <div style={{ fontSize:12, color:'rgba(245,237,224,.3)', marginTop:6, letterSpacing:.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="mobile-cta" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(17,29,16,.97)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(200,151,58,.2)', padding:'10px 16px', gap:10, alignItems:'center' }}>
        <button onClick={() => navigate('/mapa')} style={{ flex:1, padding:'13px', background:C.gold, color:'white', border:'none', borderRadius:2, fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          🗺️ Otevřít mapu
        </button>
        <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'13px 18px', background:'transparent', color:C.cream, border:'1px solid rgba(245,237,224,.25)', borderRadius:2, fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
          + Farma
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:C.darkDeep, padding:'60px 40px 32px', borderTop:'1px solid rgba(200,151,58,.08)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <span style={{ fontSize:20 }}>🌾</span>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:C.cream }}>
                  Mapa<span style={{ color:C.gold }}>Farem</span>.cz
                </div>
              </div>
              <p style={{ fontSize:13, color:'rgba(245,237,224,.28)', lineHeight:1.8, maxWidth:230 }}>
                Největší mapa lokálních farem a přírodních produktů v České republice.
              </p>
            </div>
            {[
              { title:'Produkty', links:[['Zelenina & ovoce','/mapa'],['Mléčné výrobky','/mapa'],['Maso & uzeniny','/mapa']] },
              { title:'O nás',    links:[['Jak to funguje','/'],['Sezónní průvodce','/sezona'],['O projektu','/o-nas']] },
              { title:'Farmáři', links:[['+Přidat farmu','/pridat-farmu'],['Přihlásit se','/prihlaseni'],['Dashboard','/dashboard']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700, fontSize:10, color:'rgba(200,151,58,.55)', textTransform:'uppercase', letterSpacing:3, marginBottom:18 }}>{col.title}</div>
                {col.links.map(([l,h]) => (
                  <div key={l} onClick={() => navigate(h)}
                    style={{ fontSize:14, fontWeight:400, color:'rgba(245,237,224,.3)', cursor:'pointer', marginBottom:12, transition:'color .15s' }}
                    onMouseEnter={e=>e.target.style.color=C.cream}
                    onMouseLeave={e=>e.target.style.color='rgba(245,237,224,.3)'}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(200,151,58,.06)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ fontSize:12, color:'rgba(245,237,224,.12)' }}>© 2026 MapaFarem.cz · Data: OpenStreetMap contributors</p>
            <p style={{ fontSize:12, color:'rgba(245,237,224,.12)' }}>Podpora lokálního zemědělství v ČR 🌱</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
