// frontend/src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

const TOP_FARMS = FARMS_DATA
  .filter(f => f.rating >= 4.8 && f.reviews >= 20 && f.lat && f.lng)
  .slice(0, 6);

const TICKER = ['🥕 Zelenina','🥩 Maso','🥛 Sýry','🍯 Med','🍷 Víno','🌱 BIO','🌿 Bylinky','🏪 Trhy','🐓 Drůbež','🫙 Zavařeniny','🫐 Ovoce','🧀 Sýrárny'];

const CATS = [
  { emoji:'🥕', label:'Zelenina', filter:'veggie' },
  { emoji:'🥩', label:'Maso', filter:'meat' },
  { emoji:'🥛', label:'Mléko & sýry', filter:'dairy' },
  { emoji:'🍯', label:'Med', filter:'honey' },
  { emoji:'🍷', label:'Víno', filter:'wine' },
  { emoji:'🌱', label:'BIO', filter:'bio' },
  { emoji:'🌿', label:'Bylinky', filter:'herbs' },
  { emoji:'🏪', label:'Trhy', filter:'market' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);
  const observerRefs = useRef({});
  const [visible, setVisible] = useState({});

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const setRef = (key) => (el) => {
    if (!el || observerRefs.current[key]) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(v => ({ ...v, [key]: true }));
    }, { threshold: 0.08 });
    obs.observe(el);
    observerRefs.current[key] = obs;
  };

  const fade = (key, delay = 0) => ({
    ref: setRef(key),
    style: {
      opacity: visible[key] ? 1 : 0,
      transform: visible[key] ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ${delay}s, transform 0.6s ${delay}s`,
    },
  });

  const goMap = (f) => navigate(f ? `/mapa?filter=${f}` : '/mapa');

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FAFAF7', color:'#1E120A', overflowX:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::selection{background:#3A5728;color:white;}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fade-word{0%,15%{opacity:0;transform:translateY(8px)}20%,80%{opacity:1;transform:translateY(0)}85%,100%{opacity:0;transform:translateY(-8px)}}
        .farm-card{background:white;border-radius:16px;overflow:hidden;border:1px solid rgba(58,87,40,.08);box-shadow:0 2px 12px rgba(0,0,0,.05);cursor:pointer;transition:transform .2s,box-shadow .2s;}
        .farm-card:hover{transform:translateY(-4px);box-shadow:0 10px 30px rgba(0,0,0,.1);}
        .cat-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:50px;cursor:pointer;background:white;border:1.5px solid rgba(58,87,40,.15);font-size:14px;font-weight:600;color:#1E120A;white-space:nowrap;transition:all .15s;font-family:'DM Sans',sans-serif;}
        .cat-btn:hover{background:#3A5728;color:white;border-color:#3A5728;}
        @media(max-width:768px){
          .hero-num{font-size:100px!important;}
          .hero-sub{font-size:28px!important;}
          .two-col{grid-template-columns:1fr!important;}
          .three-col{grid-template-columns:1fr!important;}
          .footer-cols{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:200,
        background:'rgba(250,250,247,.92)',backdropFilter:'blur(14px)',
        borderBottom:'1px solid rgba(58,87,40,.1)',
        padding:'0 32px',height:60,
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,cursor:'pointer' }}>
          <span style={{ color:'#3A5728' }}>Mapa</span>Farem<span style={{ color:'#3A5728' }}>.cz</span>
        </div>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <button onClick={() => navigate('/sezona')} style={{ padding:'7px 14px',background:'none',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',color:'#555',fontFamily:"'DM Sans',sans-serif" }}>Sezóna</button>
          <button onClick={() => navigate('/mapa')} style={{ padding:'7px 14px',background:'none',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',color:'#555',fontFamily:"'DM Sans',sans-serif" }}>Mapa</button>
          <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'8px 18px',background:'#3A5728',color:'white',border:'none',borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 2px 10px rgba(58,87,40,.25)' }}>
            + Přidat farmu
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop:60,background:'#F4EDD8',overflow:'hidden' }}>

        {/* Top strip */}
        <div style={{ padding:'48px 32px 0',maxWidth:1200,margin:'0 auto' }}>
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:24,marginBottom:32 }}>
            <div style={{ flex:'1 1 520px' }}>
              {/* Eyebrow */}
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:18 }}>
                <span style={{ display:'inline-block',width:8,height:8,borderRadius:'50%',background:'#7DB05A',animation:'float 2s ease-in-out infinite' }}/>
                <span style={{ fontSize:13,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#3A5728' }}>
                  {FARMS_DATA.length.toLocaleString('cs-CZ')} farem · 14 krajů · ČR
                </span>
              </div>

              {/* Big number */}
              <div className="hero-num" style={{ fontFamily:"'Playfair Display',serif",fontSize:140,fontWeight:900,lineHeight:.9,color:'#1E120A',letterSpacing:-4,marginBottom:8 }}>
                {FARMS_DATA.length}
              </div>
              <div className="hero-sub" style={{ fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:700,color:'#3A5728',marginBottom:20 }}>
                lokálních farem
              </div>
              <p style={{ fontSize:16,color:'#666',lineHeight:1.75,maxWidth:440,marginBottom:28 }}>
                Zelenina, maso, sýry, med, víno, bylinky — vše čerstvé, přímo od farmáře, bez mezičlánků.
              </p>

              {/* Search */}
              <form onSubmit={e=>{e.preventDefault();navigate(search?`/mapa?q=${encodeURIComponent(search)}`:'/mapa')}}
                style={{ display:'flex',maxWidth:460,borderRadius:12,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.1)',marginBottom:20 }}>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Hledat obec, kraj nebo produkt..."
                  style={{ flex:1,padding:'13px 18px',border:'none',fontSize:14,outline:'none',background:'white',color:'#1E120A',fontFamily:"'DM Sans',sans-serif" }}/>
                <button type="submit" style={{ padding:'13px 22px',background:'#3A5728',color:'white',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:"'DM Sans',sans-serif' " }}>
                  Hledat →
                </button>
              </form>

              <button onClick={() => navigate('/mapa')} style={{ padding:'13px 28px',background:'#1E120A',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:.3 }}>
                🗺️ Otevřít mapu
              </button>
            </div>

            {/* Right — rotating word + visual */}
            <div style={{ flex:'0 0 auto',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:16,paddingTop:12 }}>
              {/* Rotating category */}
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12,color:'#aaa',marginBottom:4,textTransform:'uppercase',letterSpacing:2 }}>Teď hledáme</div>
                <div style={{ height:44,overflow:'hidden',position:'relative',width:160 }}>
                  {TICKER.map((t,i) => (
                    <div key={t} style={{
                      position:'absolute',top:0,left:0,right:0,
                      fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,
                      color:'#3A5728',textAlign:'right',
                      opacity: tick % TICKER.length === i ? 1 : 0,
                      transform: tick % TICKER.length === i ? 'translateY(0)' : 'translateY(8px)',
                      transition:'opacity .4s, transform .4s',
                    }}>{t}</div>
                  ))}
                </div>
              </div>

              {/* Stats card */}
              <div style={{ background:'#3A5728',borderRadius:20,padding:'24px 28px',color:'white',minWidth:220 }}>
                <div style={{ fontSize:11,textTransform:'uppercase',letterSpacing:2,opacity:.65,marginBottom:16 }}>Přehled</div>
                {[
                  ['⭐','Průměrné hodnocení','4.7'],
                  ['🌱','BIO farem',`${FARMS_DATA.filter(f=>f.bio).length}`],
                  ['🚚','S rozvozu',`${FARMS_DATA.filter(f=>f.delivery).length}`],
                ].map(([e,l,v]) => (
                  <div key={l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,paddingBottom:10,borderBottom:'1px solid rgba(255,255,255,.1)' }}>
                    <span style={{ fontSize:13,opacity:.75 }}>{e} {l}</span>
                    <span style={{ fontWeight:800,fontSize:15 }}>{v}</span>
                  </div>
                ))}
                <button onClick={() => navigate('/mapa')} style={{ width:'100%',marginTop:4,padding:'10px',background:'rgba(255,255,255,.12)',color:'white',border:'1px solid rgba(255,255,255,.2)',borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                  Zobrazit vše →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div style={{ borderTop:'1px solid rgba(58,87,40,.15)',borderBottom:'1px solid rgba(58,87,40,.15)',background:'#EBE3C8',overflow:'hidden',padding:'12px 0' }}>
          <div style={{ display:'flex',gap:0,animation:'ticker 22s linear infinite',width:'max-content' }}>
            {[...TICKER,...TICKER,...TICKER,...TICKER].map((t,i) => (
              <span key={i} style={{ padding:'0 28px',fontSize:13,fontWeight:600,color:'#3A5728',whiteSpace:'nowrap',borderRight:'1px solid rgba(58,87,40,.15)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── KATEGORIE ── */}
      <section style={{ padding:'64px 32px 56px',background:'white' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div {...fade('cats')} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:12,...fade('cats').style }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700 }}>Co hledáš?</h2>
            <button onClick={() => navigate('/mapa')} style={{ fontSize:13,color:'#3A5728',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontFamily:"'DM Sans',sans-serif" }}>
              Zobrazit vše na mapě →
            </button>
          </div>
          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c.filter} className="cat-btn" onClick={() => goMap(c.filter)}>
                <span style={{ fontSize:18 }}>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FARMY ── */}
      {TOP_FARMS.length > 0 && (
        <section style={{ padding:'16px 32px 80px',background:'white' }}>
          <div style={{ maxWidth:1100,margin:'0 auto' }}>
            <div {...fade('farms-h')} style={{ display:'flex',alignItems:'baseline',gap:16,marginBottom:32,...fade('farms-h').style }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:700 }}>Nejlépe hodnocené</h2>
              <span style={{ fontSize:13,color:'#aaa' }}>— skutečné farmy, skutečná hodnocení</span>
            </div>
            <div className="three-col" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }}>
              {TOP_FARMS.slice(0,3).map((farm,i) => {
                const color = {veggie:'#3A5728',meat:'#9B2226',dairy:'#2980B9',honey:'#C99B30',wine:'#7D3C98',bio:'#27AE60',herbs:'#5D8A52',market:'#E67E22'}[farm.type]||'#5F8050';
                return (
                  <div key={farm.id} className="farm-card" onClick={() => navigate(`/farma/${farm.id}`)}
                    {...fade(`f${i}`,i*.1)} style={{ ...fade(`f${i}`,i*.1).style }}>
                    <div style={{ padding:'20px 20px 0',background:`linear-gradient(135deg,${color}18,${color}08)`,borderBottom:`3px solid ${color}` }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                        <span style={{ fontSize:36 }}>{farm.emoji}</span>
                        <span style={{ background:color,color:'white',borderRadius:8,padding:'2px 10px',fontSize:12,fontWeight:700 }}>⭐ {farm.rating}</span>
                      </div>
                      <div style={{ fontWeight:700,fontSize:16,marginBottom:4 }}>{farm.name}</div>
                      <div style={{ fontSize:12,color:'#888',marginBottom:14 }}>📍 {farm.loc||'Česká republika'}</div>
                    </div>
                    <div style={{ padding:'14px 20px' }}>
                      {farm.description && <p style={{ fontSize:13,color:'#555',lineHeight:1.6,marginBottom:12 }}>{farm.description.slice(0,95)}…</p>}
                      <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                        {farm.bio&&<span style={{ fontSize:10,background:'#E8F5E4',color:'#3A5728',borderRadius:6,padding:'2px 8px',fontWeight:700 }}>🌱 BIO</span>}
                        {farm.eshop&&<span style={{ fontSize:10,background:'#EDE5D0',color:'#5F4320',borderRadius:6,padding:'2px 8px',fontWeight:700 }}>🛒 E-shop</span>}
                        {farm.delivery&&<span style={{ fontSize:10,background:'#E3EEF8',color:'#1A5276',borderRadius:6,padding:'2px 8px',fontWeight:700 }}>🚚 Rozvoz</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── JAK TO FUNGUJE ── */}
      <section id="jak-to-funguje" style={{ padding:'80px 32px',background:'#F4EDD8' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div {...fade('how')} style={{ marginBottom:52,...fade('how').style }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:3,color:'#7DB05A',textTransform:'uppercase',marginBottom:10 }}>Jak to funguje</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,maxWidth:400 }}>
              Od mapy k čerstvé zelenině za 3 minuty
            </h2>
          </div>

          <div className="three-col" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2 }}>
            {[
              { n:'01', title:'Otevři mapu', desc:'Farmy ve tvém okolí. Filtruj podle kategorie, vzdálenosti nebo otevírací doby.', bg:'#1E120A', color:'white' },
              { n:'02', title:'Vyber farmu', desc:'Detail farmy — telefon, hodnocení, otevírací doba, e-shop, rozvoz.', bg:'#3A5728', color:'white' },
              { n:'03', title:'Nakup přímo', desc:'Žádné mezičlánky. Osobní návštěva, zavolej nebo nakup online.', bg:'#7DB05A', color:'white' },
            ].map((s,i) => (
              <div key={i} {...fade(`s${i}`,i*.12)} style={{
                background:s.bg,color:s.color,
                padding:'40px 32px',
                borderRadius: i===0?'20px 0 0 20px': i===2?'0 20px 20px 0':'0',
                ...fade(`s${i}`,i*.12).style,
              }}>
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:56,fontWeight:900,opacity:.2,lineHeight:1,marginBottom:16 }}>{s.n}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,marginBottom:12 }}>{s.title}</h3>
                <p style={{ fontSize:14,lineHeight:1.75,opacity:.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div {...fade('how-cta')} style={{ marginTop:40,...fade('how-cta').style }}>
            <button onClick={() => navigate('/mapa')} style={{ padding:'14px 32px',background:'#1E120A',color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
              🗺️ Otevřít mapu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── PRO FARMÁŘE ── */}
      <section style={{ padding:'80px 32px',background:'#3A5728',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:-80,right:-80,width:400,height:400,borderRadius:'50%',border:'1px solid rgba(255,255,255,.06)',pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div className="two-col" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center' }}>
            <div {...fade('farm-l')} style={{ ...fade('farm-l').style }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:3,color:'#A8C97A',textTransform:'uppercase',marginBottom:12 }}>Pro farmáře & producenty</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:700,color:'white',lineHeight:1.15,marginBottom:20 }}>
                Přidej farmu.<br/>
                <em style={{ color:'#A8C97A' }}>Zdarma, navždy.</em>
              </h2>
              <p style={{ color:'rgba(255,255,255,.7)',fontSize:16,lineHeight:1.8,marginBottom:32 }}>
                2 minuty, formulář, tisíce zákazníků. Bez poplatků, bez smluv.
              </p>
              <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'14px 30px',background:'white',color:'#3A5728',border:'none',borderRadius:10,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 16px rgba(0,0,0,.15)' }}>
                + Přidat farmu zdarma
              </button>
            </div>
            <div {...fade('farm-r')} style={{ display:'flex',flexDirection:'column',gap:3,...fade('farm-r').style }}>
              {[
                { n:'15 000+', label:'návštěvníků měsíčně' },
                { n:'2 min', label:'přidání farmy' },
                { n:'0 Kč', label:'navždy zdarma' },
              ].map((f,i) => (
                <div key={i} style={{ padding:'22px 28px',background: i===0?'rgba(255,255,255,.12)': i===1?'rgba(255,255,255,.08)':'rgba(255,255,255,.05)', borderRadius:14,border:'1px solid rgba(255,255,255,.08)' }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:'white',marginBottom:4 }}>{f.n}</div>
                  <div style={{ fontSize:14,color:'rgba(255,255,255,.6)' }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0F1A09',padding:'48px 32px 32px' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div className="footer-cols" style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:40 }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20,color:'white',marginBottom:12 }}>
                <span style={{ color:'#7DB05A' }}>Mapa</span>Farem<span style={{ color:'#7DB05A' }}>.cz</span>
              </div>
              <p style={{ fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.7,maxWidth:220 }}>
                Největší mapa lokálních farem a přírodních produktů v České republice.
              </p>
            </div>
            {[
              { title:'Procházet', links:[['🗺️ Mapa','/mapa'],['🌿 Sezóna','/sezona'],['🥩 Carnivore','/mapa']] },
              { title:'Farmáři', links:[['+Přidat farmu','/pridat-farmu'],['Dashboard','/dashboard'],['Profil','/profil']] },
              { title:'Účet', links:[['Přihlásit se','/prihlaseni'],['Registrace','/registrace'],['Oblíbené','/oblibene']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700,fontSize:12,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:2,marginBottom:14 }}>{col.title}</div>
                <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                  {col.links.map(([l,h]) => (
                    <span key={l} onClick={() => navigate(h)} style={{ fontSize:13,color:'rgba(255,255,255,.4)',cursor:'pointer',transition:'color .15s' }}
                      onMouseEnter={e=>e.target.style.color='#7DB05A'}
                      onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.4)'}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:24,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.25)' }}>© 2026 MapaFarem.cz · Data: OpenStreetMap contributors</p>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.25)' }}>Podpora lokálního zemědělství v ČR</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
