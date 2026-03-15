// frontend/src/pages/SeasonalGuidePage.jsx
import { useNavigate } from 'react-router-dom';

const SEASONS = {
  jaro: {
    label: 'Jaro', months: 'Březen – Květen', emoji: '🌱', color: '#5F8050',
    items: [
      { name: 'Jahody', emoji: '🍓', tip: 'Hledej u zelinářů od května. Lokální jahody jsou mnohem sladší než dovozové.' },
      { name: 'Chřest', emoji: '🌿', tip: 'Česká sezóna trvá jen 6–8 týdnů. Nejlepší je bílý chřest z jižní Moravy.' },
      { name: 'Špenát', emoji: '🥬', tip: 'Jarní špenát je jemnější než podzimní. Skvělý čerstvý i dušený.' },
      { name: 'Ředkvičky', emoji: '🔴', tip: 'Jedny z prvních jarních plodin. Vydrží až do léta.' },
      { name: 'Pažitka', emoji: '🌿', tip: 'Začíná růst jako jedna z prvních – signál, že jaro je tady.' },
      { name: 'Vejce', emoji: '🥚', tip: 'Jarní vejce od slepic s výběhem mají výraznější žloutek díky čerstvé trávě.' },
    ],
  },
  leto: {
    label: 'Léto', months: 'Červen – Srpen', emoji: '☀️', color: '#C99B30',
    items: [
      { name: 'Rajčata', emoji: '🍅', tip: 'Lokální rajčata dozrávají přirozeně – mají úplně jinou chuť než skleníková.' },
      { name: 'Okurky', emoji: '🥒', tip: 'Ideální čas na nakládání. Hledej malé okurčičky u farmářů.' },
      { name: 'Borůvky', emoji: '🫐', tip: 'Lesní borůvky z Vysočiny a Šumavy jsou sezónní hit. Mraz je na celý rok.' },
      { name: 'Meruňky', emoji: '🍑', tip: 'Moravské meruňky jsou světoznámé. Sezóna trvá jen 2–3 týdny!' },
      { name: 'Maliny', emoji: '🫐', tip: 'Červencové maliny jsou ideální na džemy a mražené dezerty.' },
      { name: 'Cukety', emoji: '🥬', tip: 'Letní přebytek cuket – farmáři je prodávají za hubičku. Ideální na grilování.' },
    ],
  },
  podzim: {
    label: 'Podzim', months: 'Září – Listopad', emoji: '🍂', color: '#C0392B',
    items: [
      { name: 'Dýně', emoji: '🎃', tip: 'Česká dýně Hokkaido je nejlepší na polévku. Prodává se od září.' },
      { name: 'Jablka', emoji: '🍎', tip: 'Přes 200 odrůd v ČR. Hledej starší odrůdy jako Strýmka nebo Boskoopské.' },
      { name: 'Brambory', emoji: '🥔', tip: 'Podzimní sklizeň je ideální čas na nákup ve větším množství na zimu.' },
      { name: 'Houby', emoji: '🍄', tip: 'Na farmářských trzích najdeš čerstvé i sušené houby z českých lesů.' },
      { name: 'Zelí', emoji: '🥬', tip: 'Čas na kysané zelí – lokální farmáři nabízí celé hlávky i nakvašené.' },
      { name: 'Hroznové víno', emoji: '🍇', tip: 'Moravská vinobraní se konají v září. Navštiv vinařství přímo.' },
    ],
  },
  zima: {
    label: 'Zima', months: 'Prosinec – Únor', emoji: '❄️', color: '#2980B9',
    items: [
      { name: 'Med', emoji: '🍯', tip: 'Zimní nákup medu přímo od včelaře. Akáciový, pohankový nebo jarní.' },
      { name: 'Kořenová zelenina', emoji: '🥕', tip: 'Mrkev, petržel, celer, pastinák – základ zimní kuchyně.' },
      { name: 'Kysané zelí', emoji: '🥬', tip: 'Bohatý na vitamín C. Tradiční domácí recept od farmářů.' },
      { name: 'Jablečný mošt', emoji: '🥤', tip: 'Lisovaný přímo z jablek. Hledej u sadařů nebo na farmářských trzích.' },
      { name: 'Sýry', emoji: '🧀', tip: 'Zimní sýry z mlékáren – farmářský eidam, niva nebo hermelín.' },
      { name: 'Zvěřina', emoji: '🦌', tip: 'Podzim a zima jsou sezónou zvěřiny. Přímý prodej od myslivců.' },
    ],
  },
};

const month = new Date().getMonth() + 1;
const currentSeason = month >= 3 && month <= 5 ? 'jaro'
  : month >= 6 && month <= 8 ? 'leto'
  : month >= 9 && month <= 11 ? 'podzim' : 'zima';

export default function SeasonalGuidePage() {
  const navigate = useNavigate();
  const season = SEASONS[currentSeason];

  return (
    <div style={{ minHeight:'100vh', background:'#FAFAF7', fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; }`}</style>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${season.color}ee, ${season.color}88)`, padding:'20px 24px 40px', color:'white' }}>
        <button onClick={() => navigate('/mapa')} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:50, padding:'7px 16px', color:'white', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, marginBottom:24 }}>
          ← Zpět na mapu
        </button>
        <div style={{ fontSize:56, marginBottom:8 }}>{season.emoji}</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,5vw,44px)', fontWeight:900, marginBottom:8 }}>
          Co roste teď — {season.label}
        </h1>
        <p style={{ fontSize:16, opacity:.85 }}>{season.months} · Co je právě v sezóně a kde to sehnat</p>
      </div>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 20px' }}>

        {/* Seasonal items */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:40 }}>
          {season.items.map(item => (
            <div key={item.name} style={{ background:'white', borderRadius:16, padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,.06)', border:`1px solid ${season.color}22` }}>
              <div style={{ fontSize:36, marginBottom:10 }}>{item.emoji}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:6 }}>{item.name}</div>
              <p style={{ fontSize:13, color:'#666', lineHeight:1.6 }}>{item.tip}</p>
            </div>
          ))}
        </div>

        {/* Other seasons */}
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:16, color:'#1E120A' }}>
          Ostatní sezóny
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:40 }}>
          {Object.entries(SEASONS).filter(([k]) => k !== currentSeason).map(([key, s]) => (
            <div key={key} onClick={() => navigate(`/sezona/${key}`)}
              style={{ background:'white', borderRadius:12, padding:'16px', cursor:'pointer', border:`2px solid ${s.color}33`,
                transition:'all .15s', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor=`${s.color}33`}>
              <div style={{ fontSize:28, marginBottom:6 }}>{s.emoji}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{s.label}</div>
              <div style={{ fontSize:12, color:'#888' }}>{s.months}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background:`linear-gradient(135deg, ${season.color}22, ${season.color}11)`, borderRadius:20, padding:'28px 32px', textAlign:'center', border:`1px solid ${season.color}33` }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🗺️</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>
            Najdi farmu se sezónními produkty
          </h2>
          <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>Filtruj farmy v okolí a nakupuj přímo od farmáře</p>
          <button onClick={() => navigate('/mapa')} style={{ padding:'12px 32px', background:season.color, color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer' }}>
            Otevřít mapu
          </button>
        </div>
      </div>
    </div>
  );
}
