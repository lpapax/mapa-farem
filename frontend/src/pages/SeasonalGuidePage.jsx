// frontend/src/pages/SeasonalGuidePage.jsx
import { useNavigate, useParams } from 'react-router-dom';

const SEASONS = {
  jaro: {
    label: 'Jaro', months: 'Březen – Květen', emoji: '🌱',
    color: '#3A5728', light: '#EEF4E8', gradient: 'linear-gradient(135deg,#3A5728,#5F8050)',
    heroImg: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1400&q=85&fit=crop',
    seasonMonths: [3, 4, 5],
    tip: '🌱 Proč kupovat sezónně? Lokální produkty mají až 3× vyšší obsah vitamínů než importované zboží sklizené nezralé. Podpořte českého farmáře a získejte to nejlepší z přírody.',
    topItems: ['Jahody', 'Chřest', 'Vejce'],
    items: [
      { name:'Jahody', emoji:'🍓', best:'Květen–Červen', tip:'Lokální jahody dozrávají přirozeně a jsou mnohem sladší než dovozové. Hledej od května.',
        img:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=85&fit=crop' },
      { name:'Chřest', emoji:'🌿', best:'Duben–Červen', tip:'Česká sezóna trvá jen 6–8 týdnů. Nejlepší je bílý chřest z jižní Moravy.',
        img:'https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=600&q=85&fit=crop' },
      { name:'Špenát', emoji:'🥬', best:'Březen–Duben', tip:'Jarní špenát je jemnější než podzimní. Skvělý čerstvý i dušený.',
        img:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=85&fit=crop' },
      { name:'Ředkvičky', emoji:'🔴', best:'Duben–Červen', tip:'Jedny z prvních jarních plodin. Vydrží až do léta.',
        img:'https://images.unsplash.com/photo-1585462913985-c6c912cd3eb6?w=600&q=85&fit=crop' },
      { name:'Pažitka', emoji:'🌿', best:'Březen–Říjen', tip:'Začíná růst jako jedna z prvních – signál, že jaro je tady.',
        img:'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=600&q=85&fit=crop' },
      { name:'Vejce', emoji:'🥚', best:'Březen–Červen', tip:'Jarní vejce od slepic s výběhem mají výraznější žloutek díky čerstvé trávě.',
        img:'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=85&fit=crop' },
      { name:'Česnek medvědí', emoji:'🧄', best:'Duben–Květen', tip:'Vzácná lesní bylina s intenzivní vůní. Skvělá čerstvá i jako pesto.',
        img:'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&q=85&fit=crop' },
      { name:'Rebarbora', emoji:'🌸', best:'Květen–Červen', tip:'Kyselá rebarbora je skvělá na koláče, džemy i kompoty. Sezóna je krátká!',
        img:'https://images.unsplash.com/photo-1555951015-6da899b5c2cd?w=600&q=85&fit=crop' },
    ],
  },
  leto: {
    label: 'Léto', months: 'Červen – Srpen', emoji: '☀️',
    color: '#B8860B', light: '#FEF9E7', gradient: 'linear-gradient(135deg,#B8860B,#C99B30)',
    heroImg: 'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=1400&q=85&fit=crop',
    seasonMonths: [6, 7, 8],
    tip: '☀️ Léto je zlatá sezóna! Nakupujte v přebytku a zakládejte zásoby – zavařte rajčata, udělejte džemy z meruněk nebo zmrazte borůvky. Ušetříte i peníze.',
    topItems: ['Rajčata', 'Borůvky', 'Meruňky'],
    items: [
      { name:'Rajčata', emoji:'🍅', best:'Červenec–Září', tip:'Lokální rajčata dozrávají přirozeně – mají úplně jinou chuť než skleníková.',
        img:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=85&fit=crop' },
      { name:'Okurky', emoji:'🥒', best:'Červenec–Srpen', tip:'Ideální čas na nakládání. Hledej malé okurčičky u farmářů.',
        img:'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600&q=85&fit=crop' },
      { name:'Borůvky', emoji:'🫐', best:'Červenec–Srpen', tip:'Lesní borůvky z Vysočiny a Šumavy jsou sezónní hit.',
        img:'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&q=85&fit=crop' },
      { name:'Meruňky', emoji:'🍑', best:'Červenec–Srpen', tip:'Moravské meruňky jsou světoznámé. Sezóna trvá jen 2–3 týdny!',
        img:'https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?w=600&q=85&fit=crop' },
      { name:'Maliny', emoji:'🫐', best:'Červen–Červenec', tip:'Červencové maliny jsou ideální na džemy a mražené dezerty.',
        img:'https://images.unsplash.com/photo-1530704757820-bda8d9afe66a?w=600&q=85&fit=crop' },
      { name:'Cukety', emoji:'🥬', best:'Červenec–Září', tip:'Letní přebytek cuket – farmáři je prodávají za hubičku. Na grilování.',
        img:'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=85&fit=crop' },
      { name:'Broskve', emoji:'🍑', best:'Červenec–Srpen', tip:'České broskve z jižní Moravy jsou šťavnaté a plné vůně. Nekupte nikde jinde.',
        img:'https://images.unsplash.com/photo-1595413426-3db5e85b73dc?w=600&q=85&fit=crop' },
      { name:'Kukuřice', emoji:'🌽', best:'Srpen–Září', tip:'Čerstvá sladká kukuřice přimo od farmáře – vařená nebo grilovaná, to je zážitek.',
        img:'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&q=85&fit=crop' },
    ],
  },
  podzim: {
    label: 'Podzim', months: 'Září – Listopad', emoji: '🍂',
    color: '#BF5B3D', light: '#FDF0EB', gradient: 'linear-gradient(135deg,#8B2500,#BF5B3D)',
    heroImg: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1400&q=85&fit=crop',
    seasonMonths: [9, 10, 11],
    tip: '🍂 Podzim je čas sklizně. Nakupte zásoby brambor, jablek a kořenové zeleniny. Přímý nákup od farmáře vám ušetří až 40 % oproti supermarketu a podpoříte místní ekonomiku.',
    topItems: ['Dýně', 'Jablka', 'Hroznové víno'],
    items: [
      { name:'Dýně', emoji:'🎃', best:'Září–Listopadu', tip:'Česká dýně Hokkaido je nejlepší na polévku. Prodává se od září.',
        img:'https://images.unsplash.com/photo-1570462428279-ef18c4bc9261?w=600&q=85&fit=crop' },
      { name:'Jablka', emoji:'🍎', best:'Září–Října', tip:'Přes 200 odrůd v ČR. Hledej starší odrůdy jako Strýmka nebo Boskoopské.',
        img:'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=85&fit=crop' },
      { name:'Brambory', emoji:'🥔', best:'Září–Října', tip:'Podzimní sklizeň je ideální čas na nákup ve větším množství na zimu.',
        img:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=85&fit=crop' },
      { name:'Houby', emoji:'🍄', best:'Září–Října', tip:'Na farmářských trzích najdeš čerstvé i sušené houby z českých lesů.',
        img:'https://images.unsplash.com/photo-1504812842093-20b96fdfe5c5?w=600&q=85&fit=crop' },
      { name:'Zelí', emoji:'🥬', best:'Září–Listopada', tip:'Čas na kysané zelí – lokální farmáři nabízí celé hlávky i nakvašené.',
        img:'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=85&fit=crop' },
      { name:'Hroznové víno', emoji:'🍇', best:'Září–Října', tip:'Moravská vinobraní v září. Navštiv vinařství přímo.',
        img:'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85&fit=crop' },
      { name:'Kdoule', emoji:'🍋', best:'Říjen–Listopad', tip:'Zapomenutý podzimní poklad – z kdoulí vzniká skvělý džem nebo quince paste.',
        img:'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=85&fit=crop' },
      { name:'Řepa', emoji:'🟣', best:'Září–Října', tip:'Červená řepa plná antioxidantů. Skvělá pečená, vařená i jako šťáva.',
        img:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=85&fit=crop' },
    ],
  },
  zima: {
    label: 'Zima', months: 'Prosinec – Únor', emoji: '❄️',
    color: '#1a5276', light: '#EBF5FB', gradient: 'linear-gradient(135deg,#1a5276,#2980B9)',
    heroImg: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1400&q=85&fit=crop',
    seasonMonths: [12, 1, 2],
    tip: '❄️ Zima je čas tradičních chutí. Fermentované potraviny, hutnné polévky a domácí uzeniny – farmáři mají i v zimě co nabídnout. Podpořte je i mimo sezónu.',
    topItems: ['Med', 'Sýry', 'Zvěřina'],
    items: [
      { name:'Med', emoji:'🍯', best:'Celoroční', tip:'Zimní nákup medu přímo od včelaře. Akáciový, pohankový nebo jarní.',
        img:'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=85&fit=crop' },
      { name:'Kořenová zelenina', emoji:'🥕', best:'Říjen–Únor', tip:'Mrkev, petržel, celer, pastinák – základ zimní kuchyně.',
        img:'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=85&fit=crop' },
      { name:'Kysané zelí', emoji:'🥬', best:'Říjen–Únor', tip:'Bohatý na vitamín C. Tradiční domácí recept od farmářů.',
        img:'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=85&fit=crop' },
      { name:'Jablečný mošt', emoji:'🥤', best:'Říjen–Prosinec', tip:'Lisovaný přímo z jablek. Hledej u sadařů nebo na farmářských trzích.',
        img:'https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=600&q=85&fit=crop' },
      { name:'Sýry', emoji:'🧀', best:'Celoroční', tip:'Zimní sýry z mlékáren – farmářský eidam, niva nebo hermelín.',
        img:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=85&fit=crop' },
      { name:'Zvěřina', emoji:'🦌', best:'Říjen–Únor', tip:'Podzim a zima jsou sezónou zvěřiny. Přímý prodej od myslivců.',
        img:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=85&fit=crop' },
      { name:'Zelňačka', emoji:'🍲', best:'Prosinec–Únor', tip:'Tradiční česká polévka ze zelí – hřejivá a plná živin v mrazivých dnech.',
        img:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=85&fit=crop' },
      { name:'Svíčková zelenina', emoji:'🥦', best:'Říjen–Únor', tip:'Čerstvá zelenina na svíčkovou nebo dušení – mrkev, celer, petržel od farmáře.',
        img:'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=600&q=85&fit=crop' },
    ],
  },
};

const MONTHS = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];

const month = new Date().getMonth() + 1;
const currentSeason = month >= 3 && month <= 5 ? 'jaro'
  : month >= 6 && month <= 8 ? 'leto'
  : month >= 9 && month <= 11 ? 'podzim' : 'zima';

export default function SeasonalGuidePage() {
  const navigate = useNavigate();
  const { season: seasonParam } = useParams();
  const activeSeason = SEASONS[seasonParam] ? seasonParam : currentSeason;
  const season = SEASONS[activeSeason];

  const C = {
    cream: '#F5EDE0',
    terra: '#BF5B3D',
    green: '#3A5728',
    dark: '#1A2D18',
    gold: '#C8973A',
    brown: '#2C1810',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans',sans-serif", color: C.brown }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .item-card {
          border-radius: 20px;
          overflow: hidden;
          background: white;
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s;
          box-shadow: 0 2px 12px rgba(44,24,16,0.07);
          animation: fadeInUp 0.5s ease both;
        }
        .item-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 48px rgba(44,24,16,0.16);
        }
        .item-card-img-wrap {
          position: relative;
          overflow: hidden;
          height: 200px;
        }
        .item-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .item-card:hover .item-card-img-wrap img {
          transform: scale(1.08);
        }
        .find-btn {
          display: inline-block;
          margin-top: 14px;
          padding: 9px 20px;
          border: none;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .find-btn:hover { transform: scale(1.05); }
        .season-tab {
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
          position: relative;
        }
        .season-tab:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(44,24,16,0.2) !important; }
        .month-bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(12px);
          animation: heroFloat 3s ease-in-out infinite;
          white-space: nowrap;
        }
        .footer-link {
          color: #6B4F3A;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
        }
        .footer-link:hover { background: rgba(191,91,61,0.1); color: #BF5B3D; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(245,237,224,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(191,91,61,0.12)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: 24 }}>🌾</span>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 19, color: C.brown }}>
            Mapa<span style={{ color: C.terra }}>Farem</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/mapa')} style={{
            padding: '8px 20px', background: 'none',
            border: `1.5px solid ${C.green}`, color: C.green,
            borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            fontFamily: "'DM Sans',sans-serif",
          }}>
            🗺️ Otevřít mapu
          </button>
          <button onClick={() => navigate('/prihlaseni')} style={{
            padding: '8px 20px', background: C.green, color: 'white',
            border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}>
            Přihlásit se
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        <img
          src={season.heroImg}
          alt={season.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        {/* Animated gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(160deg, ${season.color}e8 0%, ${season.color}99 45%, rgba(26,45,24,0.75) 100%)`,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
        }} />
        {/* Hero content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '40px 48px',
        }}>
          {/* Floating item badges */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {season.topItems.map((name, i) => {
              const item = season.items.find(it => it.name === name);
              return (
                <span
                  key={name}
                  className="hero-badge"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    color: 'white',
                    animationDelay: `${i * 0.7}s`,
                  }}
                >
                  {item ? item.emoji : '🌿'} {name}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: 46, marginBottom: 6 }}>{season.emoji}</div>
          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(28px,5vw,52px)',
            fontWeight: 900, color: 'white', lineHeight: 1.1,
            marginBottom: 10, textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            Co roste teď —{' '}
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>{season.label}</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>
            {season.months} · Co je právě v sezóně a kde to sehnat
          </p>
        </div>
      </div>

      {/* MONTH PROGRESS BAR */}
      <div style={{ background: C.dark, padding: '14px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          {MONTHS.map((m, i) => {
            const mNum = i + 1;
            const isActive = season.seasonMonths.includes(mNum);
            const isCurrent = mNum === month;
            return (
              <div key={m} className="month-bar-item" style={{ position: 'relative' }}>
                <div style={{
                  width: '100%', height: 5, borderRadius: 4,
                  background: isActive ? season.color : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s',
                  boxShadow: isActive ? `0 0 8px ${season.color}88` : 'none',
                }} />
                <span style={{
                  fontSize: 10, fontWeight: isCurrent ? 800 : 500,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.35)',
                  fontFamily: "'DM Sans',sans-serif",
                  letterSpacing: 0.3,
                }}>
                  {m}
                </span>
                {isCurrent && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#C8973A',
                    boxShadow: '0 0 6px #C8973A',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px' }}>

        {/* SEASON TABS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 56 }}>
          {Object.entries(SEASONS).map(([key, s]) => {
            const active = key === activeSeason;
            return (
              <div
                key={key}
                className="season-tab"
                onClick={() => navigate(`/sezona/${key}`)}
                style={{
                  background: active ? s.gradient : 'white',
                  boxShadow: active ? `0 10px 32px ${s.color}55` : '0 2px 10px rgba(44,24,16,0.07)',
                  border: active ? 'none' : '1.5px solid rgba(44,24,16,0.08)',
                }}
              >
                <div style={{ padding: '20px 20px' }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{s.emoji}</div>
                  <div style={{
                    fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700,
                    color: active ? 'white' : C.brown, marginBottom: 3,
                  }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.72)' : '#aaa', marginBottom: 6 }}>
                    {s.months}
                  </div>
                  <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.6)' : '#ccc' }}>
                    {s.items.length} produktů
                  </div>
                  {active && (
                    <div style={{
                      marginTop: 10, display: 'inline-block',
                      padding: '3px 10px', borderRadius: 50,
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: 10, fontWeight: 800,
                      color: 'white', textTransform: 'uppercase', letterSpacing: 1.2,
                    }}>
                      Právě teď
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION TITLE */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: C.terra, textTransform: 'uppercase', marginBottom: 8 }}>
            Co sklízíme
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: C.brown }}>
            Sezónní produkty — {season.label}
          </h2>
        </div>

        {/* TIP SEZONY HIGHLIGHT */}
        <div style={{
          borderRadius: 18,
          background: `linear-gradient(135deg, ${season.light} 0%, white 100%)`,
          border: `2px solid ${season.color}33`,
          padding: '22px 28px',
          marginBottom: 44,
          display: 'flex', alignItems: 'flex-start', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(to right, ${season.color}, transparent)`,
            borderRadius: '18px 18px 0 0',
          }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: season.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: `0 4px 16px ${season.color}44`,
          }}>
            {season.emoji}
          </div>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
              color: season.color, textTransform: 'uppercase', marginBottom: 5,
            }}>
              Tip sezóny
            </div>
            <p style={{ fontSize: 15, color: C.brown, lineHeight: 1.7, fontWeight: 400, maxWidth: 700 }}>
              {season.tip}
            </p>
          </div>
        </div>

        {/* ITEMS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
          gap: 22, marginBottom: 72,
        }}>
          {season.items.map((item, idx) => (
            <div
              key={item.name}
              className="item-card"
              style={{ animationDelay: `${idx * 0.07}s` }}
            >
              <div className="item-card-img-wrap">
                <img src={item.img} alt={item.name} onError={e => { e.target.style.display="none"; e.target.parentNode.style.background=season.color+"33"; }} />
                {/* Best badge overlaid on image */}
                <div style={{
                  position: 'absolute', bottom: 10, left: 10,
                  background: `${season.color}dd`,
                  color: 'white',
                  padding: '4px 12px', borderRadius: 50,
                  fontSize: 11, fontWeight: 700,
                  backdropFilter: 'blur(6px)',
                  letterSpacing: 0.3,
                }}>
                  {item.best}
                </div>
              </div>
              <div style={{ padding: '18px 20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <div style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 18, fontWeight: 700, color: C.brown,
                  }}>
                    {item.name}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#6B4F3A', lineHeight: 1.7, marginBottom: 4 }}>
                  {item.tip}
                </p>
                <button
                  className="find-btn"
                  onClick={() => navigate('/mapa')}
                  style={{
                    background: season.light,
                    color: season.color,
                    border: `1.5px solid ${season.color}55`,
                  }}
                >
                  → Najít u farmáře
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA BANNER */}
        <div style={{ borderRadius: 28, overflow: 'hidden', position: 'relative', minHeight: 200, display: 'flex', alignItems: 'center', marginBottom: 48 }}>
          <img src={season.heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${season.color}f0 0%, ${season.color}99 55%, transparent 100%)` }} />
          <div style={{ position: 'relative', padding: '44px 56px', maxWidth: 560 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 3,
              color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: 10,
            }}>
              MapaFarem.cz
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700,
              color: 'white', marginBottom: 12, textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              Najdi farmu se sezónními produkty
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 26, lineHeight: 1.6 }}>
              Filtruj farmy v okolí a nakupuj přímo od farmáře — bez mezičlánků, bez supermaketu, s chutí.
            </p>
            <button
              onClick={() => navigate('/mapa')}
              style={{
                padding: '14px 36px', background: 'white', color: season.color,
                border: 'none', borderRadius: 50,
                fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15,
                cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🗺️ Otevřít mapu
            </button>
          </div>
        </div>

        {/* FOOTER LINKS */}
        <div style={{
          borderTop: '1px solid rgba(44,24,16,0.1)',
          paddingTop: 32, paddingBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: 4,
        }}>
          <span className="footer-link" onClick={() => navigate('/mapa')}>← Zpět na mapu</span>
          <span style={{ color: 'rgba(44,24,16,0.2)', fontSize: 14 }}>|</span>
          <span className="footer-link" onClick={() => navigate('/farmy')}>Všechny farmy</span>
          <span style={{ color: 'rgba(44,24,16,0.2)', fontSize: 14 }}>|</span>
          <span className="footer-link" onClick={() => navigate('/registrace')}>Přidat farmu</span>
          <span style={{ color: 'rgba(44,24,16,0.2)', fontSize: 14 }}>|</span>
          <span className="footer-link" onClick={() => navigate('/o-nas')}>O nás</span>
        </div>
      </div>
    </div>
  );
}
