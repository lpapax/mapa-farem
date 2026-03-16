// frontend/src/pages/SeasonalGuidePage.jsx
import { useNavigate, useParams } from 'react-router-dom';

const SEASONS = {
  jaro: {
    label: 'Jaro', months: 'Březen – Květen', emoji: '🌱',
    color: '#5F8050', light: '#EEF4E8', gradient: 'linear-gradient(135deg,#3A5728,#5F8050)',
    heroImg: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1400&q=85&fit=crop',
    items: [
      { name:'Jahody', emoji:'🍓', tip:'Lokální jahody jsou mnohem sladší než dovozové. Hledej od května.',
        img:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80&fit=crop' },
      { name:'Chřest', emoji:'🌿', tip:'Česká sezóna trvá jen 6–8 týdnů. Nejlepší je bílý chřest z jižní Moravy.',
        img:'https://images.unsplash.com/photo-1537025338873-8438ffbf9d9e?w=400&q=80&fit=crop' },
      { name:'Špenát', emoji:'🥬', tip:'Jarní špenát je jemnější než podzimní. Skvělý čerstvý i dušený.',
        img:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80&fit=crop' },
      { name:'Ředkvičky', emoji:'🔴', tip:'Jedny z prvních jarních plodin. Vydrží až do léta.',
        img:'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400&q=80&fit=crop' },
      { name:'Pažitka', emoji:'🌿', tip:'Začíná růst jako jedna z prvních – signál, že jaro je tady.',
        img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80&fit=crop' },
      { name:'Vejce', emoji:'🥚', tip:'Jarní vejce od slepic s výběhem mají výraznější žloutek díky čerstvé trávě.',
        img:'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&q=80&fit=crop' },
    ],
  },
  leto: {
    label: 'Léto', months: 'Červen – Srpen', emoji: '☀️',
    color: '#C99B30', light: '#FEF9E7', gradient: 'linear-gradient(135deg,#B8860B,#C99B30)',
    heroImg: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=1400&q=85&fit=crop',
    items: [
      { name:'Rajčata', emoji:'🍅', tip:'Lokální rajčata dozrávají přirozeně – mají úplně jinou chuť než skleníková.',
        img:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80&fit=crop' },
      { name:'Okurky', emoji:'🥒', tip:'Ideální čas na nakládání. Hledej malé okurčičky u farmářů.',
        img:'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&q=80&fit=crop' },
      { name:'Borůvky', emoji:'🫐', tip:'Lesní borůvky z Vysočiny a Šumavy jsou sezónní hit.',
        img:'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80&fit=crop' },
      { name:'Meruňky', emoji:'🍑', tip:'Moravské meruňky jsou světoznámé. Sezóna trvá jen 2–3 týdny!',
        img:'https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?w=400&q=80&fit=crop' },
      { name:'Maliny', emoji:'🫐', tip:'Červencové maliny jsou ideální na džemy a mražené dezerty.',
        img:'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=400&q=80&fit=crop' },
      { name:'Cukety', emoji:'🥬', tip:'Letní přebytek cuket – farmáři je prodávají za hubičku. Na grilování.',
        img:'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80&fit=crop' },
    ],
  },
  podzim: {
    label: 'Podzim', months: 'Září – Listopad', emoji: '🍂',
    color: '#BF5B3D', light: '#FDF0EB', gradient: 'linear-gradient(135deg,#8B2500,#BF5B3D)',
    heroImg: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&q=85&fit=crop',
    items: [
      { name:'Dýně', emoji:'🎃', tip:'Česká dýně Hokkaido je nejlepší na polévku. Prodává se od září.',
        img:'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80&fit=crop' },
      { name:'Jablka', emoji:'🍎', tip:'Přes 200 odrůd v ČR. Hledej starší odrůdy jako Strýmka nebo Boskoopské.',
        img:'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80&fit=crop' },
      { name:'Brambory', emoji:'🥔', tip:'Podzimní sklizeň je ideální čas na nákup ve větším množství na zimu.',
        img:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop' },
      { name:'Houby', emoji:'🍄', tip:'Na farmářských trzích najdeš čerstvé i sušené houby z českých lesů.',
        img:'https://images.unsplash.com/photo-1552825897-bb26b0ceff48?w=400&q=80&fit=crop' },
      { name:'Zelí', emoji:'🥬', tip:'Čas na kysané zelí – lokální farmáři nabízí celé hlávky i nakvašené.',
        img:'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80&fit=crop' },
      { name:'Hroznové víno', emoji:'🍇', tip:'Moravská vinobraní v září. Navštiv vinařství přímo.',
        img:'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&q=80&fit=crop' },
    ],
  },
  zima: {
    label: 'Zima', months: 'Prosinec – Únor', emoji: '❄️',
    color: '#2980B9', light: '#EBF5FB', gradient: 'linear-gradient(135deg,#1a5276,#2980B9)',
    heroImg: 'https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?w=1400&q=85&fit=crop',
    items: [
      { name:'Med', emoji:'🍯', tip:'Zimní nákup medu přímo od včelaře. Akáciový, pohankový nebo jarní.',
        img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80&fit=crop' },
      { name:'Kořenová zelenina', emoji:'🥕', tip:'Mrkev, petržel, celer, pastinák – základ zimní kuchyně.',
        img:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80&fit=crop' },
      { name:'Kysané zelí', emoji:'🥬', tip:'Bohatý na vitamín C. Tradiční domácí recept od farmářů.',
        img:'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80&fit=crop' },
      { name:'Jablečný mošt', emoji:'🥤', tip:'Lisovaný přímo z jablek. Hledej u sadařů nebo na farmářských trzích.',
        img:'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80&fit=crop' },
      { name:'Sýry', emoji:'🧀', tip:'Zimní sýry z mlékáren – farmářský eidam, niva nebo hermelín.',
        img:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80&fit=crop' },
      { name:'Zvěřina', emoji:'🦌', tip:'Podzim a zima jsou sezónou zvěřiny. Přímý prodej od myslivců.',
        img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80&fit=crop' },
    ],
  },
};

const month = new Date().getMonth() + 1;
const currentSeason = month >= 3 && month <= 5 ? 'jaro'
  : month >= 6 && month <= 8 ? 'leto'
  : month >= 9 && month <= 11 ? 'podzim' : 'zima';

export default function SeasonalGuidePage() {
  const navigate = useNavigate();
  const { season: seasonParam } = useParams();
  const activeSeason = SEASONS[seasonParam] ? seasonParam : currentSeason;
  const season = SEASONS[activeSeason];
  const C = { cream:'#F5EDE0', terra:'#BF5B3D', green:'#3A5728', brown:'#2C1810' };

  return (
    <div style={{ minHeight:'100vh', background:C.cream, fontFamily:"'DM Sans',sans-serif", color:C.brown }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .item-card{border-radius:18px;overflow:hidden;background:white;cursor:pointer;transition:transform .2s,box-shadow .2s;}
        .item-card:hover{transform:translateY(-5px);box-shadow:0 16px 36px rgba(44,24,16,.15);}
        .item-card img{width:100%;height:160px;object-fit:cover;display:block;transition:transform .4s;}
        .item-card:hover img{transform:scale(1.06);}
        .season-tab{border-radius:14px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;position:relative;}
        .season-tab:hover{transform:translateY(-4px);box-shadow:0 12px 28px rgba(44,24,16,.18);}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(245,237,224,.96)',backdropFilter:'blur(14px)',borderBottom:'1px solid rgba(191,91,61,.1)',padding:'0 40px',height:62,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div onClick={() => navigate('/')} style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
          <span style={{ fontSize:22 }}>🌾</span>
          <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,color:C.brown }}>
            Mapa<span style={{ color:C.terra }}>Farem</span>
          </div>
        </div>
        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <button onClick={() => navigate('/mapa')} style={{ padding:'8px 20px',background:'none',border:`1.5px solid ${C.green}`,color:C.green,borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
            🗺️ Otevřít mapu
          </button>
          <button onClick={() => navigate('/prihlaseni')} style={{ padding:'8px 20px',background:C.green,color:'white',border:'none',borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
            Přihlásit se
          </button>
        </div>
      </nav>

      {/* ── HERO HEADER ── */}
      <div style={{ position:'relative',height:320,overflow:'hidden' }}>
        <img src={season.heroImg} alt={season.label} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%' }}/>
        <div style={{ position:'absolute',inset:0,background:`linear-gradient(to bottom, ${season.color}cc 0%, ${season.color}99 60%, rgba(245,237,224,1) 100%)` }}/>
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 40px',maxWidth:700 }}>
          <div style={{ fontSize:52,marginBottom:8 }}>{season.emoji}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(30px,5vw,48px)',fontWeight:900,color:'white',lineHeight:1.1,marginBottom:8,textShadow:'0 2px 12px rgba(0,0,0,.2)' }}>
            Co roste teď — <em style={{ fontStyle:'italic' }}>{season.label}</em>
          </h1>
          <p style={{ fontSize:16,color:'rgba(255,255,255,.88)',fontWeight:500 }}>{season.months} · Co je právě v sezóně a kde to sehnat</p>
        </div>
      </div>

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'48px 40px' }}>

        {/* ── SEASON TABS ── */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:56 }}>
          {Object.entries(SEASONS).map(([key, s]) => {
            const active = key === activeSeason;
            return (
              <div key={key} className="season-tab" onClick={() => navigate(`/sezona/${key}`)}
                style={{ background: active ? s.gradient : 'white', boxShadow: active ? `0 8px 24px ${s.color}44` : '0 2px 8px rgba(44,24,16,.07)', border: active ? 'none' : `1.5px solid rgba(44,24,16,.08)` }}>
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ fontSize:26,marginBottom:6 }}>{s.emoji}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color: active ? 'white' : C.brown,marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:12,color: active ? 'rgba(255,255,255,.75)' : '#aaa' }}>{s.months}</div>
                  {active && <div style={{ marginTop:8,fontSize:11,fontWeight:700,color:'rgba(255,255,255,.9)',textTransform:'uppercase',letterSpacing:1 }}>Právě teď</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SECTION TITLE ── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:8 }}>Co sklízíme</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:C.brown }}>
            Sezónní produkty — {season.label}
          </h2>
        </div>

        {/* ── ITEMS GRID ── */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:18,marginBottom:60 }}>
          {season.items.map(item => (
            <div key={item.name} className="item-card" onClick={() => navigate('/mapa')}>
              <img src={item.img} alt={item.name}/>
              <div style={{ padding:'16px 18px 20px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:22 }}>{item.emoji}</span>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:C.brown }}>{item.name}</div>
                </div>
                <p style={{ fontSize:13,color:'#6B4F3A',lineHeight:1.65 }}>{item.tip}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA BANNER ── */}
        <div style={{ borderRadius:24,overflow:'hidden',position:'relative',minHeight:180,display:'flex',alignItems:'center' }}>
          <img src={season.heroImg} alt="" style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 30%' }}/>
          <div style={{ position:'absolute',inset:0,background:`linear-gradient(to right, ${season.color}ee 0%, ${season.color}88 60%, transparent 100%)` }}/>
          <div style={{ position:'relative',padding:'36px 48px',maxWidth:520 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:'white',marginBottom:10,textShadow:'0 2px 8px rgba(0,0,0,.2)' }}>
              Najdi farmu se sezónními produkty
            </h2>
            <p style={{ color:'rgba(255,255,255,.85)',fontSize:14,marginBottom:22 }}>Filtruj farmy v okolí a nakupuj přímo od farmáře — bez mezičlánků.</p>
            <button onClick={() => navigate('/mapa')} style={{ padding:'13px 32px',background:'white',color:season.color,border:'none',borderRadius:50,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,.15)' }}>
              🗺️ Otevřít mapu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
