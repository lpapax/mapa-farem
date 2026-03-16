// frontend/src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

/* ─── Mapbox Static map with real farm pins ─── */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TOP_MAP_FARMS = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.8
    && f.lat > 48.5 && f.lat < 51.1
    && f.lng > 12.0 && f.lng < 19.0)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 14);

const MAP_PINS_STR = TOP_MAP_FARMS
  .map(f => `pin-s+3a5728(${parseFloat(f.lng).toFixed(4)},${parseFloat(f.lat).toFixed(4)})`)
  .join(',');

const MAPBOX_IMG = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${MAP_PINS_STR}/15.4,49.8,6.05,0,0/1100x460@2x?access_token=${MAPBOX_TOKEN}&logo=false&attribution=false`
  : null;

/* ─── Featured farms for floating cards ─── */
const BOHEMIA_FARM = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.8 && f.lng < 15.5)
  .sort((a, b) => b.rating - a.rating)[0];
const MORAVIA_FARM = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.8 && f.lng >= 16.0)
  .sort((a, b) => b.rating - a.rating)[0];

/* ─── Decorations ─── */
const Leaf = ({ style }) => (
  <svg viewBox="0 0 80 120" fill="none" style={{ ...style, pointerEvents:'none' }}>
    <path d="M40 10 C20 30 5 55 10 80 C15 105 35 115 40 110 C45 115 65 105 70 80 C75 55 60 30 40 10Z" fill="currentColor" opacity=".65"/>
    <path d="M40 10 L40 110" stroke="currentColor" strokeWidth="1.5" opacity=".4"/>
  </svg>
);
const Blob = ({ style }) => (
  <svg viewBox="0 0 200 200" style={{ ...style, pointerEvents:'none' }}>
    <path d="M47.5,-57.2C59.9,-45.3,67.4,-28.5,68.8,-11.3C70.2,5.9,65.4,23.5,55.3,37.1C45.2,50.7,29.8,60.3,12.5,65.1C-4.8,69.9,-24,69.9,-39.5,62.2C-55,54.5,-66.8,39.1,-70.4,22.1C-74,5.1,-69.4,-13.5,-60.1,-28.8C-50.8,-44.1,-36.8,-56.1,-21.9,-63.3C-7,-70.5,8.8,-72.9,23.3,-69.5C37.8,-66.1,35.1,-69.1,47.5,-57.2Z" transform="translate(100 100)" fill="currentColor"/>
  </svg>
);

/* ─── Category data ─── */
const CAT_PHOTOS = [
  { label:'Čerstvá zelenina a ovoce',    filter:'veggie', emoji:'🥕',
    img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80&fit=crop' },
  { label:'Domácí mléčné výrobky a sýry', filter:'dairy',  emoji:'🥛',
    img:'https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=600&q=80&fit=crop' },
  { label:'Poctivé maso a uzeniny',       filter:'meat',   emoji:'🥩',
    img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80&fit=crop' },
];

/* ─── Floating farm card component ─── */
function FarmCard({ farm, navigate, style }) {
  if (!farm) return null;
  return (
    <div style={{
      position:'absolute', background:'white', borderRadius:16,
      padding:'12px 16px', boxShadow:'0 10px 32px rgba(44,24,16,.22)',
      minWidth:190, border:'1px solid rgba(58,87,40,.08)', ...style,
    }}>
      <div style={{ fontSize:10, color:'#aaa', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Ověřená farma</div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ width:34, height:34, borderRadius:'50%', background:'#F5EDE0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
          {farm.emoji}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:'#2C1810', lineHeight:1.2 }}>{farm.name?.slice(0,22)}</div>
          <div style={{ fontSize:11, color:'#aaa' }}>📍 {farm.loc}</div>
        </div>
      </div>
      <div style={{ fontSize:12, color:'#C5A028', fontWeight:700, marginBottom:8 }}>⭐ {farm.rating}</div>
      <button onClick={() => navigate(`/farma/${farm.id}`)} style={{ width:'100%', padding:'6px', background:'#3A5728', color:'white', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
        Zobrazit farmu →
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const C = { cream:'#F5EDE0', terra:'#BF5B3D', green:'#3A5728', brown:'#2C1810', mid:'#7A4F3A' };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream, color:C.brown, overflowX:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        .cat-card{border-radius:20px;overflow:hidden;cursor:pointer;background:white;transition:transform .22s,box-shadow .22s;}
        .cat-card:hover{transform:translateY(-6px);box-shadow:0 18px 44px rgba(44,24,16,.18);}
        .cat-card img{width:100%;height:220px;object-fit:cover;display:block;transition:transform .4s;}
        .cat-card:hover img{transform:scale(1.06);}
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;}
          .hero-img{display:none!important;}
          .cat-grid{grid-template-columns:1fr!important;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        @media(max-width:600px){.nav-links{display:none!important;}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:300,
        background:'rgba(245,237,224,.96)',backdropFilter:'blur(14px)',
        borderBottom:'1px solid rgba(191,91,61,.1)',
        padding:'0 40px',height:64,
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
          <span style={{ fontSize:24 }}>🐓</span>
          <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:19,color:C.brown }}>
            Mapa<span style={{ color:C.terra }}>Farem</span>
            <span style={{ fontSize:13,fontWeight:400,color:'#7B9A5A',marginLeft:3 }}>🌿</span>
          </div>
        </div>
        <div className="nav-links" style={{ display:'flex',gap:4,alignItems:'center' }}>
          {[['Produkty','/mapa'],['O nás','/'],['Farmáři','/pridat-farmu'],['Kontakt','/prihlaseni']].map(([l,h]) => (
            <button key={l} onClick={() => navigate(h)} style={{ padding:'8px 15px',background:'none',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',color:'#555',fontFamily:"'DM Sans',sans-serif",borderRadius:8 }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(58,87,40,.08)'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>{l}</button>
          ))}
          <button onClick={() => navigate('/prihlaseni')} style={{ padding:'10px 22px',background:C.green,color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginLeft:10,boxShadow:'0 3px 12px rgba(58,87,40,.28)' }}>
            Přihlásit se / Registrace
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh',background:C.cream,paddingTop:64,position:'relative',overflow:'hidden',display:'flex',alignItems:'center' }}>
        <Blob style={{ position:'absolute',top:-80,left:-100,width:380,color:C.terra,opacity:.1 }}/>
        <Blob style={{ position:'absolute',bottom:-120,left:40,width:260,color:C.green,opacity:.12,transform:'rotate(60deg)' }}/>
        <Leaf style={{ position:'absolute',top:100,right:500,width:48,height:72,color:C.green,opacity:.3,transform:'rotate(-25deg)' }}/>
        <Leaf style={{ position:'absolute',bottom:80,left:25,width:36,height:54,color:C.green,opacity:.28,transform:'rotate(45deg)' }}/>

        <div style={{ maxWidth:1200,margin:'0 auto',width:'100%',padding:'48px 40px' }}>
          <div className="hero-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center' }}>

            {/* LEFT */}
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(191,91,61,.1)',border:'1px solid rgba(191,91,61,.25)',padding:'5px 16px',borderRadius:50,fontSize:12,fontWeight:700,color:C.terra,marginBottom:22 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:C.terra,display:'inline-block' }}/>
                {FARMS_DATA.length.toLocaleString('cs-CZ')} farem po celé ČR
              </div>

              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:900,lineHeight:1.12,color:C.brown,marginBottom:20 }}>
                Čerstvé, místní,<br/>
                <em style={{ color:C.green,fontStyle:'italic' }}>poctivé farmářské</em><br/>
                produkty přímo<br/>z České republiky!
              </h1>

              <p style={{ fontSize:16,color:'#6B4F3A',lineHeight:1.8,marginBottom:34,maxWidth:420 }}>
                Podpořte své sousedy a objevte chuť venkova. {FARMS_DATA.length} lokálních farem, zelinářů, sýrařů a výrobců medu na jedné mapě.
              </p>

              <div style={{ display:'flex',gap:14,flexWrap:'wrap',marginBottom:36 }}>
                <button onClick={() => navigate('/mapa')} style={{ padding:'15px 34px',background:C.green,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 5px 22px rgba(58,87,40,.32)',transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#2d4420';e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.transform='none';}}>
                  Objevovat místní jídlo
                </button>
                <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'15px 34px',background:'transparent',color:C.green,border:`2px solid ${C.green}`,borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.color='white';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.green;}}>
                  Přidat farmu →
                </button>
              </div>

              {/* Mini stats row under buttons */}
              <div style={{ display:'flex', gap:28, paddingTop:24, borderTop:'1px solid rgba(58,87,40,.12)' }}>
                {[[FARMS_DATA.length,'farem'],[14,'krajů'],['4.7★','hodnocení']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:C.brown,lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:12,color:'#999',marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — farmer photo */}
            <div className="hero-img" style={{ position:'relative' }}>
              <div style={{ borderRadius:28,overflow:'hidden',boxShadow:'0 24px 64px rgba(44,24,16,.18)',aspectRatio:'4/5',position:'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=900&q=85&fit=crop&crop=faces"
                  alt="Farmářka s čerstvou zeleninou"
                  style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top' }}
                />
                <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top, rgba(44,24,16,.3) 0%, transparent 55%)' }}/>
              </div>

              {/* Floating BIO badge */}
              <div style={{ position:'absolute',bottom:32,left:-24,background:'white',borderRadius:16,padding:'14px 20px',boxShadow:'0 10px 28px rgba(44,24,16,.16)',border:'1px solid rgba(58,87,40,.1)' }}>
                <div style={{ fontSize:11,color:'#aaa',marginBottom:4,textTransform:'uppercase',letterSpacing:1 }}>Ověřená farma</div>
                <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16,color:C.brown }}>🌿 BIO certifikát</div>
                <div style={{ fontSize:12,color:C.green,marginTop:2,fontWeight:600 }}>Bez chemie · Od souseda</div>
              </div>

              <div style={{ position:'absolute',top:-18,right:-18,width:72,height:72,borderRadius:'50%',border:`3px solid rgba(191,91,61,.25)` }}/>
              <Leaf style={{ position:'absolute',top:20,right:-28,width:44,height:66,color:C.terra,opacity:.35,transform:'rotate(25deg)' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORIE ── */}
      <section style={{ padding:'80px 40px',background:'white' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:10 }}>Co nabízíme</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:C.brown }}>Vyberte si z čerstvých produktů</h2>
          </div>

          <div className="cat-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22 }}>
            {CAT_PHOTOS.map((c) => (
              <div key={c.filter} className="cat-card" onClick={() => navigate(`/mapa?filter=${c.filter}`)}>
                <img src={c.img} alt={c.label}/>
                <div style={{ padding:'18px 22px' }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown,marginBottom:4 }}>{c.label}</div>
                  <div style={{ fontSize:12,color:'#999',fontWeight:500 }}>Zobrazit na mapě →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FARMÁŘI — Mapbox Static map ── */}
      <section style={{ padding:'80px 40px',background:C.cream,position:'relative',overflow:'hidden' }}>
        <Leaf style={{ position:'absolute',top:40,right:60,width:64,color:C.green,opacity:.18,transform:'rotate(-35deg)' }}/>
        <Leaf style={{ position:'absolute',bottom:60,left:30,width:52,color:C.green,opacity:.15,transform:'rotate(30deg)' }}/>
        <Blob style={{ position:'absolute',top:-60,right:-80,width:280,color:C.terra,opacity:.07 }}/>

        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:12 }}>
            <span style={{ fontSize:28,opacity:.5 }}>🌾</span>
          </div>
          <div style={{ textAlign:'center',marginBottom:44 }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:10 }}>Představujeme</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:C.brown }}>Představujeme naše farmáře</h2>
            <p style={{ fontSize:15,color:'#6B4F3A',marginTop:10 }}>
              Přes {FARMS_DATA.length} ověřených farmářů napříč celou Českou republikou
            </p>
          </div>

          {/* Map card with Mapbox Static image */}
          <div style={{ background:'white',borderRadius:24,padding:'20px',boxShadow:'0 16px 56px rgba(44,24,16,.12)',position:'relative' }}>
            <div style={{ fontSize:12,fontWeight:700,color:C.terra,letterSpacing:2,textTransform:'uppercase',marginBottom:14,display:'flex',alignItems:'center',gap:8 }}>
              <span>📍</span> Farmy v České republice
            </div>

            <div style={{ position:'relative',borderRadius:16,overflow:'hidden' }}>
              {MAPBOX_IMG ? (
                <img
                  src={MAPBOX_IMG}
                  alt="Mapa farem v České republice"
                  style={{ width:'100%',height:'auto',display:'block' }}
                  loading="lazy"
                />
              ) : (
                <div style={{ height:400,background:'#e8f0e4',display:'flex',alignItems:'center',justifyContent:'center',color:'#888' }}>
                  Mapa se načítá…
                </div>
              )}

              {/* Stats overlay bottom */}
              <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top, rgba(44,24,16,.72) 0%, transparent 100%)',padding:'28px 28px 18px',display:'flex',gap:32,alignItems:'flex-end' }}>
                {[[`${FARMS_DATA.length}+`,'farem v databázi'],['14','krajů pokryto'],['4.7 ⭐','průměrné hodnocení']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:'#C5A028',lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:11,color:'rgba(255,255,255,.65)',marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Floating card — Bohemia */}
              <FarmCard farm={BOHEMIA_FARM} navigate={navigate} style={{ top:16, left:16 }} />

              {/* Floating card — Moravia */}
              <FarmCard farm={MORAVIA_FARM} navigate={navigate} style={{ top:16, right:16 }} />
            </div>
          </div>

          <div style={{ textAlign:'center',marginTop:40 }}>
            <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'14px 38px',background:C.terra,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 5px 22px rgba(191,91,61,.3)',transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              + Přidat svou farmu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── JAK TO FUNGUJE ── */}
      <section style={{ padding:'72px 40px',background:'white' }}>
        <div style={{ maxWidth:960,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:52 }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:10 }}>Jak to funguje</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:C.brown }}>Tři kroky k čerstvým potravinám</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32 }}>
            {[
              { n:'01', emoji:'🗺️', title:'Otevři mapu', desc:'Zobraz farmy ve svém okolí, filtruj podle kategorie nebo vzdálenosti.', color:C.green },
              { n:'02', emoji:'📍', title:'Najdi farmu', desc:'Detail s telefonem, hodnocením, otevírací dobou a možností rozvozu.', color:C.terra },
              { n:'03', emoji:'🛒', title:'Nakup přímo', desc:'Kontaktuj farmáře osobně nebo nakup přes e-shop bez mezičlánků.', color:C.mid },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ width:66,height:66,borderRadius:'50%',background:`${s.color}18`,border:`2px solid ${s.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 18px' }}>
                  {s.emoji}
                </div>
                <div style={{ fontSize:11,fontWeight:900,color:`${s.color}80`,letterSpacing:2,marginBottom:6,fontFamily:"'Playfair Display',serif" }}>{s.n}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown,marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:14,color:'#6B4F3A',lineHeight:1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center',marginTop:44 }}>
            <button onClick={() => navigate('/mapa')} style={{ padding:'14px 36px',background:C.green,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 5px 20px rgba(58,87,40,.25)' }}>
              🗺️ Otevřít mapu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#2C1810',padding:'52px 40px 32px' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:40 }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                <span style={{ fontSize:22 }}>🐓</span>
                <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,color:'white' }}>
                  Mapa<span style={{ color:C.terra }}>Farem</span>.cz
                </div>
              </div>
              <p style={{ fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.75,maxWidth:230 }}>
                Největší mapa lokálních farem a přírodních produktů v České republice.
              </p>
            </div>
            {[
              { title:'Produkty', links:[['Čerstvá zelenina','/mapa'],['Mléčné výrobky','/mapa'],['Poctivé maso','/mapa']] },
              { title:'O nás', links:[['Jak to funguje','/'],['Sezónní průvodce','/sezona'],['Přihlásit se','/prihlaseni']] },
              { title:'Farmáři', links:[['+Přidat farmu','/pridat-farmu'],['Dashboard','/dashboard'],['Kontakt','/prihlaseni']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700,fontSize:12,color:'rgba(255,255,255,.45)',textTransform:'uppercase',letterSpacing:2,marginBottom:14 }}>{col.title}</div>
                {col.links.map(([l,h]) => (
                  <div key={l} onClick={() => navigate(h)} style={{ fontSize:13,color:'rgba(255,255,255,.35)',cursor:'pointer',marginBottom:9,transition:'color .15s' }}
                    onMouseEnter={e=>e.target.style.color=C.terra}
                    onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.35)'}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:24,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.2)' }}>© 2026 MapaFarem.cz · Data: OpenStreetMap contributors</p>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.2)' }}>Podpora lokálního zemědělství v ČR 🌱</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
