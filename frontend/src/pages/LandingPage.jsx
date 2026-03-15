// frontend/src/pages/LandingPage.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

// Project lat/lng to SVG coords (viewBox 0 0 600 320)
const toSVG = (lat, lng) => ({
  x: (lng - 12.0) / 7.0 * 580 + 10,
  y: (51.1 - lat) / 2.6 * 300 + 10,
});

const TYPE_COLOR = {
  veggie:'#3A5728', meat:'#9B2226', dairy:'#2980B9',
  honey:'#C99B30', wine:'#7D3C98', bio:'#27AE60',
  herbs:'#5D8A52', market:'#E67E22',
};

// Top farms for map pins — limit to well-rated with coords
const MAP_PINS = FARMS_DATA
  .filter(f => f.lat && f.lng && f.rating >= 4.5 && f.lat > 48.5 && f.lat < 51.1 && f.lng > 12.0 && f.lng < 19.0)
  .sort((a,b) => b.rating - a.rating)
  .slice(0, 60);

function CZMap({ onPinClick, navigate }) {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const handlePin = useCallback((e, farm) => {
    e.stopPropagation();
    const rect = e.currentTarget.closest('svg').getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setTooltip({ farm, px, py });
    setHovered(farm.id);
  }, []);

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <svg
        viewBox="0 0 600 320"
        style={{ width:'100%', height:'auto', cursor:'pointer' }}
        onClick={() => { setTooltip(null); setHovered(null); }}
      >
        {/* CZ outline — Čechy (west) */}
        <path
          d="M 18,130 L 28,108 L 45,88 L 72,62 L 100,48 L 132,32 L 155,18 L 178,14 L 198,22 L 218,18 L 248,12 L 272,20 L 295,30 L 315,38 L 338,50 L 358,58 L 380,58 L 405,65 L 428,70 L 452,78 L 478,82 L 505,92 L 530,105 L 555,122 L 568,138 L 560,158 L 548,175 L 535,192 L 518,210 L 502,228 L 485,248 L 468,262 L 448,274 L 422,282 L 398,290 L 372,296 L 345,300 L 318,298 L 290,294 L 265,292 L 238,290 L 210,288 L 182,286 L 158,282 L 135,274 L 112,262 L 90,248 L 70,232 L 50,212 L 32,192 L 18,168 Z"
          fill="#c8dab2"
          stroke="#3A5728"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Moravia/Silesia division line */}
        <line x1="378" y1="58" x2="390" y2="300" stroke="#3A5728" strokeWidth="1" strokeDasharray="4,3" opacity="0.3"/>
        {/* Bohemia region label */}
        <text x="190" y="175" textAnchor="middle" fontSize="11" fill="#3A5728" fontWeight="600" opacity="0.5" fontFamily="DM Sans, sans-serif">Čechy</text>
        {/* Moravia region label */}
        <text x="468" y="195" textAnchor="middle" fontSize="11" fill="#3A5728" fontWeight="600" opacity="0.5" fontFamily="DM Sans, sans-serif">Morava</text>

        {/* Farm pins */}
        {MAP_PINS.map(farm => {
          const { x, y } = toSVG(farm.lat, farm.lng);
          if (x < 5 || x > 595 || y < 5 || y > 315) return null;
          const color = TYPE_COLOR[farm.type] || '#5F8050';
          const isHov = hovered === farm.id;
          return (
            <g key={farm.id} onClick={e => handlePin(e, farm)} style={{ cursor:'pointer' }}>
              <circle cx={x} cy={y} r={isHov ? 7 : 4.5} fill={color} stroke="white" strokeWidth={isHov ? 2 : 1.5} opacity={isHov ? 1 : 0.8}
                style={{ transition:'r .15s,opacity .15s' }}
                onMouseEnter={e => handlePin(e, farm)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:'absolute',
          left: Math.min(tooltip.px, 320),
          top: tooltip.py - 10,
          transform: 'translate(-50%, -100%)',
          background:'white', borderRadius:12, padding:'12px 16px',
          boxShadow:'0 8px 28px rgba(44,24,16,.18)',
          minWidth:160, maxWidth:220, zIndex:10,
          border:'1px solid rgba(58,87,40,.12)',
          pointerEvents:'none',
        }}>
          <div style={{ fontSize:16, marginBottom:4 }}>{tooltip.farm.emoji}</div>
          <div style={{ fontWeight:700, fontSize:13, color:'#2C1810', marginBottom:2 }}>{tooltip.farm.name}</div>
          <div style={{ fontSize:11, color:'#888', marginBottom:8 }}>📍 {tooltip.farm.loc} · ⭐ {tooltip.farm.rating}</div>
          <div onClick={() => navigate(`/farma/${tooltip.farm.id}`)}
            style={{ background:'#3A5728', color:'white', borderRadius:6, padding:'4px 10px', fontSize:11, textAlign:'center', fontWeight:700, cursor:'pointer' }}>
            Profil místa →
          </div>
          {/* Arrow */}
          <div style={{ position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)', width:14, height:7, overflow:'hidden' }}>
            <div style={{ width:14, height:14, background:'white', border:'1px solid rgba(58,87,40,.12)', transform:'rotate(45deg)', transformOrigin:'0 0', marginLeft:0, marginTop:-7 }}/>
          </div>
        </div>
      )}

      {/* Stats overlay bottom */}
      <div style={{
        position:'absolute', bottom:4, left:'50%', transform:'translateX(-50%)',
        background:'rgba(44,24,16,.82)', backdropFilter:'blur(8px)',
        borderRadius:10, padding:'8px 20px',
        display:'flex', gap:24,
      }}>
        {[[MAP_PINS.length+'+','zobrazeno'],['14','krajů'],['4.7★','průměr']].map(([n,l]) => (
          <div key={l} style={{ textAlign:'center' }}>
            <div style={{ fontWeight:800, fontSize:13, color:'#A8C97A' }}>{n}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TOP_FARMS = FARMS_DATA
  .filter(f => f.rating >= 4.8 && f.reviews >= 20 && f.lat && f.lng)
  .slice(0, 3);

const CAT_PHOTOS = [
  { label:'Čerstvá zelenina a ovoce', filter:'veggie', emoji:'🥕',
    img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80&fit=crop' },
  { label:'Domácí mléčné výrobky a sýry', filter:'dairy', emoji:'🥛',
    img:'https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=600&q=80&fit=crop' },
  { label:'Poctivé maso a uzeniny', filter:'meat', emoji:'🥩',
    img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80&fit=crop' },
  { label:'Med a včelí produkty', filter:'honey', emoji:'🍯',
    img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80&fit=crop' },
  { label:'Víno a nápoje', filter:'wine', emoji:'🍷',
    img:'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80&fit=crop' },
  { label:'BIO produkty', filter:'bio', emoji:'🌱',
    img:'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=600&q=80&fit=crop' },
];

const FEATURED_FARMERS = [
  { name:'Rodina Procházkových', region:'Jihomoravský kraj', desc:'Pěstujeme zeleninu a ovoce tradičními metodami již třetí generaci. Navštivte nás na farmě nebo nakupte online.', emoji:'👨‍👩‍👧', img:'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&q=80&fit=crop&crop=faces' },
  { name:'Sýrárna Kratochvíl', region:'Vysočina', desc:'Ruční výroba tradičních českých sýrů z mléka vlastních krav. Každý sýr je originál.', emoji:'🧀', img:'https://images.unsplash.com/photo-1559181567-c3190bfbf97f?w=400&q=80&fit=crop' },
];

// Leaf SVG decoration
const Leaf = ({ style }) => (
  <svg viewBox="0 0 80 120" fill="none" style={{ ...style, pointerEvents:'none' }}>
    <path d="M40 10 C20 30 5 55 10 80 C15 105 35 115 40 110 C45 115 65 105 70 80 C75 55 60 30 40 10Z" fill="currentColor" opacity=".6"/>
    <path d="M40 10 L40 110" stroke="currentColor" strokeWidth="1.5" opacity=".4"/>
  </svg>
);

// Terracotta blob
const Blob = ({ style }) => (
  <svg viewBox="0 0 200 200" style={{ ...style, pointerEvents:'none' }}>
    <path d="M47.5,-57.2C59.9,-45.3,67.4,-28.5,68.8,-11.3C70.2,5.9,65.4,23.5,55.3,37.1C45.2,50.7,29.8,60.3,12.5,65.1C-4.8,69.9,-24,69.9,-39.5,62.2C-55,54.5,-66.8,39.1,-70.4,22.1C-74,5.1,-69.4,-13.5,-60.1,-28.8C-50.8,-44.1,-36.8,-56.1,-21.9,-63.3C-7,-70.5,8.8,-72.9,23.3,-69.5C37.8,-66.1,35.1,-69.1,47.5,-57.2Z" transform="translate(100 100)" fill="currentColor"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const obsRefs = useRef({});
  const [vis, setVis] = useState({});

  const setRef = (k) => (el) => {
    if (!el || obsRefs.current[k]) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(v => ({...v,[k]:true})); }, {threshold:.08});
    o.observe(el); obsRefs.current[k] = o;
  };
  const fade = (k, d=0) => ({
    ref: setRef(k),
    style: { opacity: vis[k]?1:0, transform: vis[k]?'translateY(0)':'translateY(28px)', transition:`opacity .6s ${d}s,transform .6s ${d}s` },
  });

  const goMap = (f) => navigate(f ? `/mapa?filter=${f}` : '/mapa');

  const C = { cream:'#F5EDE0', terra:'#BF5B3D', green:'#3A5728', brown:'#2C1810', mid:'#7A4F3A' };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream, color:C.brown, overflowX:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::selection{background:${C.terra};color:white;}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .cat-card{border-radius:20px;overflow:hidden;cursor:pointer;position:relative;transition:transform .2s,box-shadow .2s;}
        .cat-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(44,24,16,.18);}
        .cat-card img{width:100%;height:220px;object-fit:cover;display:block;transition:transform .4s;}
        .cat-card:hover img{transform:scale(1.05);}
        .farm-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:50px;background:white;border:1.5px solid rgba(58,87,40,.15);font-size:13px;font-weight:600;color:${C.brown};cursor:pointer;white-space:nowrap;transition:all .15s;font-family:'DM Sans',sans-serif;}
        .farm-pill:hover{background:${C.green};color:white;border-color:${C.green};}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important;}
          .hero-img{display:none!important;}
          .cat-grid{grid-template-columns:repeat(2,1fr)!important;}
          .footer-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:300,
        background:'rgba(245,237,224,.95)',backdropFilter:'blur(12px)',
        borderBottom:`1px solid rgba(191,91,61,.12)`,
        padding:'0 32px',height:62,
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
          <span style={{ fontSize:22 }}>🐓</span>
          <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,lineHeight:1.1 }}>
            <div style={{ color:C.brown }}>Mapa<span style={{ color:C.terra }}>Farem</span></div>
          </div>
        </div>
        <div style={{ display:'flex',gap:6,alignItems:'center' }}>
          {[['Produkty','/mapa'],['O nás','/'],['Farmáři','/pridat-farmu'],['Sezóna','/sezona']].map(([l,h]) => (
            <button key={l} onClick={() => navigate(h)} style={{ padding:'7px 14px',background:'none',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',color:'#555',fontFamily:"'DM Sans',sans-serif" }}>{l}</button>
          ))}
          <button onClick={() => navigate('/prihlaseni')} style={{ padding:'9px 20px',background:C.green,color:'white',border:'none',borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginLeft:8,boxShadow:`0 2px 10px rgba(58,87,40,.25)` }}>
            Přihlásit se / Registrace
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh',background:C.cream,paddingTop:62,position:'relative',overflow:'hidden',display:'flex',alignItems:'center' }}>
        {/* Terracotta blob BG */}
        <Blob style={{ position:'absolute',top:-60,left:-80,width:340,color:C.terra,opacity:.12 }}/>
        <Blob style={{ position:'absolute',bottom:-80,right:-60,width:280,color:C.terra,opacity:.1,transform:'rotate(120deg)' }}/>

        {/* Leaf decorations */}
        <Leaf style={{ position:'absolute',top:90,right:460,width:50,height:75,color:C.green,opacity:.35,transform:'rotate(-20deg)' }}/>
        <Leaf style={{ position:'absolute',bottom:100,left:30,width:38,height:57,color:C.green,opacity:.3,transform:'rotate(40deg)' }}/>

        <div style={{ maxWidth:1200,margin:'0 auto',width:'100%',padding:'48px 32px' }}>
          <div className="hero-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center' }}>

            {/* LEFT */}
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(191,91,61,.1)',border:`1px solid rgba(191,91,61,.25)`,padding:'5px 14px',borderRadius:50,fontSize:12,fontWeight:700,color:C.terra,marginBottom:20 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:C.terra }}/>
                {FARMS_DATA.length.toLocaleString('cs-CZ')} farem po celé ČR
              </div>

              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:54,fontWeight:900,lineHeight:1.1,color:C.brown,marginBottom:18 }}>
                Čerstvé, místní,<br/>
                <em style={{ color:C.green,fontStyle:'italic' }}>poctivé farmářské</em><br/>
                produkty přímo<br/>z České republiky!
              </h1>

              <p style={{ fontSize:16,color:'#6B4F3A',lineHeight:1.75,marginBottom:32,maxWidth:440 }}>
                Podpořte své sousedy a objevte chuť venkova. {FARMS_DATA.length} lokálních farem, zelinářů, sýrařů a výrobců medu na jedné mapě.
              </p>

              <div style={{ display:'flex',gap:12,flexWrap:'wrap',marginBottom:28 }}>
                <button onClick={() => navigate('/mapa')} style={{ padding:'14px 32px',background:C.green,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:`0 4px 20px rgba(58,87,40,.3)`,transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#2d4420';e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.transform='none';}}>
                  Objevovat místní jídlo
                </button>
                <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'14px 32px',background:'transparent',color:C.green,border:`2px solid ${C.green}`,borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.green;e.currentTarget.style.color='white';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.green;}}>
                  Přidat farmu →
                </button>
              </div>

              {/* Quick category pills */}
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {CAT_PHOTOS.slice(0,4).map(c => (
                  <button key={c.filter} className="farm-pill" onClick={() => goMap(c.filter)}>
                    {c.emoji} {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — CZ mapa */}
            <div className="hero-img" style={{ position:'relative' }}>
              {/* Map card */}
              <div style={{
                background:'white', borderRadius:24,
                padding:'20px 20px 8px',
                boxShadow:'0 20px 60px rgba(44,24,16,.15), 0 0 0 1px rgba(58,87,40,.08)',
                position:'relative',
              }}>
                <div style={{ fontSize:11,fontWeight:700,letterSpacing:2,color:C.terra,textTransform:'uppercase',marginBottom:10,paddingLeft:4 }}>
                  🗺️ Farmy v České republice
                </div>
                <CZMap navigate={navigate} />
              </div>

              {/* Floating farmer card */}
              <div style={{ position:'absolute',top:16,right:-20,background:'white',borderRadius:14,padding:'12px 16px',boxShadow:'0 8px 24px rgba(44,24,16,.14)',minWidth:170,border:`1px solid rgba(58,87,40,.1)` }}>
                <div style={{ fontSize:11,color:'#aaa',marginBottom:6,textTransform:'uppercase',letterSpacing:1 }}>Nejbližší farma</div>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:'#E8F0E4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>
                    {TOP_FARMS[0]?.emoji || '🥕'}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:C.brown,lineHeight:1.2 }}>{TOP_FARMS[0]?.name?.slice(0,18) || 'Farma Novákových'}</div>
                    <div style={{ fontSize:11,color:'#888' }}>⭐ {TOP_FARMS[0]?.rating || '4.9'}</div>
                  </div>
                </div>
                <button onClick={() => navigate('/mapa')} style={{ width:'100%',marginTop:10,padding:'6px',background:C.green,color:'white',border:'none',borderRadius:7,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                  Přihlásit se →
                </button>
              </div>

              {/* Terracotta circle */}
              <div style={{ position:'absolute',top:-20,left:-20,width:64,height:64,borderRadius:'50%',background:`${C.terra}18`,border:`2px solid ${C.terra}35`,animation:'spin-slow 22s linear infinite' }}/>

              {/* Dots */}
              <div style={{ position:'absolute',bottom:-10,left:-16,display:'flex',flexDirection:'column',gap:5 }}>
                {[0,1,2].map(r=>(
                  <div key={r} style={{ display:'flex',gap:5 }}>
                    {[0,1,2].map(c=><div key={c} style={{ width:4,height:4,borderRadius:'50%',background:C.terra,opacity:.25 }}/>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORIE (photo cards) ── */}
      <section style={{ padding:'80px 32px',background:'white' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div {...fade('cat-h')} style={{ textAlign:'center',marginBottom:48,...fade('cat-h').style }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:10 }}>Co nabízíme</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:C.brown }}>Vyberte si z čerstvých produktů</h2>
          </div>

          <div className="cat-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }}>
            {CAT_PHOTOS.slice(0,3).map((c,i) => (
              <div key={c.filter} className="cat-card" onClick={() => goMap(c.filter)}
                {...fade(`cat${i}`,i*.1)} style={{ ...fade(`cat${i}`,i*.1).style }}>
                <img src={c.img} alt={c.label} loading="lazy"/>
                <div style={{ padding:'16px 20px',background:`linear-gradient(135deg,${C.cream},white)`,borderTop:`3px solid ${C.terra}` }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown }}>{c.label}</div>
                  <div style={{ fontSize:12,color:'#888',marginTop:4 }}>Zobrazit na mapě →</div>
                </div>
              </div>
            ))}
          </div>

          {/* Second row — smaller */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginTop:20 }}>
            {CAT_PHOTOS.slice(3).map((c,i) => (
              <div key={c.filter} className="cat-card" onClick={() => goMap(c.filter)}
                {...fade(`cat2${i}`,i*.1)} style={{ ...fade(`cat2${i}`,i*.1).style }}>
                <img src={c.img} alt={c.label} loading="lazy" style={{ height:160 }}/>
                <div style={{ padding:'12px 16px',background:'white' }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:C.brown }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PŘEDSTAVUJEME FARMÁŘE ── */}
      <section style={{ padding:'80px 32px',background:C.cream,position:'relative',overflow:'hidden' }}>
        <Leaf style={{ position:'absolute',top:40,right:60,width:60,color:C.green,opacity:.2,transform:'rotate(-30deg)' }}/>
        <Blob style={{ position:'absolute',bottom:-60,left:-40,width:240,color:C.terra,opacity:.08 }}/>

        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div {...fade('farmer-h')} style={{ marginBottom:48,...fade('farmer-h').style }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:10 }}>Naši farmáři</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:C.brown }}>Představujeme naše farmáře</h2>
            <p style={{ fontSize:15,color:'#6B4F3A',marginTop:8 }}>Digital marketplace connecting consumers in České republice</p>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:28 }}>
            {FEATURED_FARMERS.map((f,i) => (
              <div key={i} {...fade(`fr${i}`,i*.15)} style={{
                background:'white',borderRadius:20,overflow:'hidden',
                boxShadow:'0 4px 20px rgba(44,24,16,.08)',
                display:'flex',gap:0,...fade(`fr${i}`,i*.15).style,
              }}>
                <img src={f.img} alt={f.name} style={{ width:140,objectFit:'cover',flexShrink:0 }}/>
                <div style={{ padding:'24px 24px' }}>
                  <div style={{ fontSize:11,fontWeight:700,letterSpacing:2,color:C.terra,textTransform:'uppercase',marginBottom:6 }}>{f.region}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown,marginBottom:8 }}>{f.name}</div>
                  <p style={{ fontSize:13,color:'#6B4F3A',lineHeight:1.65,marginBottom:14 }}>{f.desc}</p>
                  <button onClick={() => navigate('/mapa')} style={{ fontSize:13,fontWeight:700,color:C.green,background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0 }}>
                    Přihlásit se →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div {...fade('farmer-cta')} style={{ textAlign:'center',marginTop:44,...fade('farmer-cta').style }}>
            <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'14px 36px',background:C.terra,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:`0 4px 20px rgba(191,91,61,.3)` }}>
              + Přidat svou farmu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── JAK TO FUNGUJE ── */}
      <section style={{ padding:'80px 32px',background:'white' }}>
        <div style={{ maxWidth:1000,margin:'0 auto' }}>
          <div {...fade('how-h')} style={{ textAlign:'center',marginBottom:52,...fade('how-h').style }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:10 }}>Jak to funguje</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:C.brown }}>Tři kroky k čerstvým potravinám</h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32 }}>
            {[
              { n:'01', emoji:'🗺️', title:'Otevři mapu', desc:'Zobraz farmy ve svém okolí, filtruj podle kategorie nebo vzdálenosti.', color:C.green },
              { n:'02', emoji:'📍', title:'Najdi farmu', desc:'Zobraz detail — telefon, hodnocení, otevírací dobu, e-shop, rozvoz.', color:C.terra },
              { n:'03', emoji:'🛒', title:'Nakup přímo', desc:'Kontaktuj farmáře osobně nebo nakup přes e-shop bez mezičlánků.', color:C.mid },
            ].map((s,i) => (
              <div key={i} {...fade(`how${i}`,i*.12)} style={{ textAlign:'center',...fade(`how${i}`,i*.12).style }}>
                <div style={{ width:64,height:64,borderRadius:'50%',background:`${s.color}15`,border:`2px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px' }}>
                  {s.emoji}
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:11,fontWeight:900,color:`${s.color}60`,letterSpacing:2,marginBottom:6 }}>{s.n}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown,marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:14,color:'#6B4F3A',lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div {...fade('how-btn')} style={{ textAlign:'center',marginTop:44,...fade('how-btn').style }}>
            <button onClick={() => navigate('/mapa')} style={{ padding:'14px 36px',background:C.green,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:`0 4px 20px rgba(58,87,40,.25)` }}>
              🗺️ Otevřít mapu zdarma
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#2C1810',padding:'52px 32px 32px' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div className="footer-grid" style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:40 }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                <span style={{ fontSize:20 }}>🐓</span>
                <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,color:'white' }}>
                  Mapa<span style={{ color:C.terra }}>Farem</span>.cz
                </div>
              </div>
              <p style={{ fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.7,maxWidth:220 }}>
                Největší mapa lokálních farem a přírodních produktů v České republice.
              </p>
            </div>
            {[
              { title:'Produkty', links:[['Čerstvá zelenina','/mapa'],['Mléčné výrobky','/mapa'],['Poctivé maso','/mapa']] },
              { title:'Farmáři', links:[['+Přidat farmu','/pridat-farmu'],['Dashboard','/dashboard'],['Kontakt','/prihlaseni']] },
              { title:'O nás', links:[['Jak to funguje','#jak-to-funguje'],['Sezónní průvodce','/sezona'],['Přihlásit se','/prihlaseni']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700,fontSize:12,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:2,marginBottom:14 }}>{col.title}</div>
                {col.links.map(([l,h]) => (
                  <div key={l} onClick={() => navigate(h)} style={{ fontSize:13,color:'rgba(255,255,255,.38)',cursor:'pointer',marginBottom:8,transition:'color .15s' }}
                    onMouseEnter={e=>e.target.style.color=C.terra}
                    onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.38)'}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:24,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.22)' }}>© 2026 MapaFarem.cz · Data: OpenStreetMap contributors</p>
            <p style={{ fontSize:12,color:'rgba(255,255,255,.22)' }}>Podpora lokálního zemědělství v ČR</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
