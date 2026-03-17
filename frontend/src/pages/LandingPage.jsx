// frontend/src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Search, Navigation, MapPin, ShoppingBag, Heart, Carrot,
  Milk, Leaf, Sprout, Wine, Star, ExternalLink, Instagram, Facebook, Check
} from 'lucide-react';
import FARMS_DATA from '../data/farms.json';
import CzechRegionMap from '../components/CzechRegionMap';
import { useSEO } from '../hooks/useSEO';

/* ─── CSS variables & design tokens ─── */
const CSS_VARS = `
  :root {
    --green: #2D5016;
    --gold: #C8963E;
    --cream: #FAF7F2;
    --text: #1A1A1A;
    --muted: #6B7280;
    --border: #E8E0D0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', 'DM Sans', sans-serif; }
  :focus-visible { outline: 2px solid #C8963E; outline-offset: 3px; border-radius: 2px; }

  .skip-link { position: absolute; top: -100px; left: 16px; z-index: 9999; padding: 8px 16px;
    background: #C8963E; color: white; font-weight: 700; font-size: 14px; border-radius: 4px; transition: top .15s; }
  .skip-link:focus { top: 8px; }

  @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.45} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }

  .ticker-track { display: flex; animation: ticker 40s linear infinite; width: max-content; }
  .ticker-track:hover { animation-play-state: paused; }

  .cat-card { cursor: pointer; background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 200ms ease, box-shadow 200ms ease; overflow: hidden; }
  .cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

  .farm-card { cursor: pointer; background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 200ms ease, box-shadow 200ms ease; overflow: hidden; position: relative; }
  .farm-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
  .farm-card-overlay { position: absolute; inset: 0; background: rgba(45,80,22,0.85); display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 200ms ease; border-radius: 16px; }
  .farm-card:hover .farm-card-overlay { opacity: 1; }

  .step-card { background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 200ms ease, box-shadow 200ms ease; padding: 40px 32px; position: relative; }
  .step-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

  .testimonial-card { background: #FFFFFF; border: 1px solid #E8E0D0; border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); padding: 32px; transition: transform 200ms ease, box-shadow 200ms ease; }
  .testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

  .footer-link { color: rgba(250,247,242,0.5); cursor: pointer; font-size: 14px; margin-bottom: 10px; display: block;
    transition: color 200ms ease; text-decoration: none; }
  .footer-link:hover { color: #C8963E; }

  @media (max-width: 900px) {
    .hero-grid { grid-template-columns: 1fr !important; }
    .hero-img-col { display: none !important; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .farms-grid { grid-template-columns: repeat(2,1fr) !important; }
    .testimonials-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 600px) {
    .nav-links { display: none !important; }
    .cat-grid { grid-template-columns: repeat(3,1fr) !important; }
    .farms-grid { grid-template-columns: 1fr !important; }
    .stats-row { flex-direction: column !important; gap: 24px !important; }
  }
`;

/* ─── Ticker farms ─── */
const TICKER_FARMS = FARMS_DATA
  .filter(f => f.rating >= 4.7)
  .sort(() => Math.random() - 0.5)
  .slice(0, 24)
  .map(f => `${f.emoji || '🌿'} ${f.name}`);

/* ─── Season helper ─── */
const getSeason = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return { label: 'Jaro', emoji: '🌱', path: '/sezona/jaro', items: ['Chřest','Ředkvičky','Pažitka','Česnek medvědí'], img: 'photo-1490750967868-88df5691cc55' };
  if (m >= 6 && m <= 8) return { label: 'Léto', emoji: '☀️', path: '/sezona/leto', items: ['Rajčata','Okurky','Borůvky','Maliny'], img: 'photo-1500595046743-cd271d694d30' };
  if (m >= 9 && m <= 11) return { label: 'Podzim', emoji: '🍂', path: '/sezona/podzim', items: ['Dýně','Jablka','Houby','Švestky'], img: 'photo-1509048191080-d2984bad6ae5' };
  return { label: 'Zima', emoji: '❄️', path: '/sezona/zima', items: ['Zelí','Mrkev','Petržel','Červená řepa'], img: 'photo-1491466424936-e304919aada7' };
};
const CURRENT_SEASON = getSeason();

/* ─── Featured farms ─── */
const FEATURED_FARMS = FARMS_DATA
  .filter(f => f.rating >= 4.8)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 6);

// Pool of diverse farm/field photos — assigned by index so every card looks different
const FARM_PHOTO_POOL = [
  '1500595046743-cd271d694d30', // rolling green hills farm
  '1416879595882-3373a0480b5b', // farmers market vegetables
  '1464226184884-fa280b87c399', // countryside field aerial
  '1523741543316-beb7fc7023d8', // fresh harvest vegetables
  '1550583724-b2692b85b150', // rustic farm stand
  '1488459716781-31db52582fe9', // fresh produce colorful
  '1592150621744-aca64f7b0b63', // mushrooms forest floor
  '1444681961742-3aef9e307b37', // vineyard rows
  '1508361001754-c570fa45e7c5', // beehive honey
  '1562517520-1d5e3c7543ed', // farm cattle meadow
  '1440342359983-0e7c98b2e50e', // orchard apple trees
  '1574943320219-553eb213f72d', // sunflower field
];

/* ─── Category grid data ─── */
const CATEGORIES = [
  { label: 'Zelenina & ovoce', filter: 'veggie', Icon: Carrot,  color: '#2D5016' },
  { label: 'Maso & uzeniny',   filter: 'meat',   Icon: Leaf,    color: '#9B2226' },
  { label: 'Mléčné výrobky',   filter: 'dairy',  Icon: Milk,    color: '#2980B9' },
  { label: 'Med & včelí',      filter: 'honey',  Icon: Leaf,    color: '#C8963E' },
  { label: 'BIO produkty',     filter: 'bio',    Icon: Sprout,  color: '#2D5016' },
  { label: 'Víno & nápoje',    filter: 'wine',   Icon: Wine,    color: '#7D3C98' },
];

/* ─── Counter component ─── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString('cs-CZ')}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterOk, setNewsletterOk] = useState(false);

  useSEO({
    title: 'Lokální farmy v České republice',
    description: 'Největší databáze lokálních farem v České republice. Přes 1 695 ověřených farem na jedné mapě — zelenina, mléčné výrobky, maso, med a BIO produkty přímo od farmáře.',
    canonical: 'https://mapafarem.cz/',
    ogImage: 'https://mapafarem.cz/og-image.jpg',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/mapa?search=${encodeURIComponent(searchQ.trim())}`);
    else navigate('/mapa');
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) setNewsletterOk(true);
  };

  return (
    <div style={{ fontFamily: "'Inter','DM Sans',sans-serif", background: '#FAF7F2', color: '#1A1A1A', overflowX: 'hidden' }}>
      <a href="#main-content" className="skip-link">Přeskočit na obsah</a>
      <style>{CSS_VARS}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        background: 'rgba(45,80,22,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(200,150,62,0.15)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 19, color: '#FAF7F2' }}>
            Mapa<span style={{ color: '#C8963E' }}>Farem</span>.cz
          </div>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[['Produkty','/mapa'],['O nás','/o-nas'],['Ceník','/cenik'],['Farmáři','/pridat-farmu']].map(([l,h]) => (
            <button key={l} onClick={() => navigate(h)}
              style={{ padding: '8px 15px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                color: 'rgba(250,247,242,0.65)', fontFamily: "'Inter',sans-serif", borderRadius: 4, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FAF7F2'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,242,0.65)'}>{l}</button>
          ))}
          <button onClick={() => navigate('/mapa')}
            style={{ padding: '10px 22px', background: '#C8963E', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginLeft: 12, transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#B8853A'}
            onMouseLeave={e => e.currentTarget.style.background = '#C8963E'}>
            Otevřít mapu
          </button>
        </div>
      </nav>

      {/* ═══ A. HERO ═══ */}
      <section id="main-content" style={{
        minHeight: '100vh', background: '#2D5016', paddingTop: 64,
        position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        {/* Grain texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }} />
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: -100, right: -60, width: 500, height: 500, background: 'radial-gradient(circle, rgba(200,150,62,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -80, width: 480, height: 480, background: 'radial-gradient(circle, rgba(45,80,22,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '48px 40px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 64, alignItems: 'center' }}>

            {/* LEFT */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8963E', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#1A1A1A', marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A1A1A', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
                🌱 {FARMS_DATA.length.toLocaleString('cs-CZ')} ověřených farem
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(38px,4.5vw,64px)', fontWeight: 700, lineHeight: 1.08, color: '#FAF7F2', marginBottom: 20 }}
              >
                Čerstvé od farmáře,<br />
                <em style={{ fontStyle: 'italic', color: '#C8963E' }}>přímo k vám</em>
              </motion.h1>

              <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 20, color: '#C8963E', marginBottom: 32, lineHeight: 1.5 }}>
                Spojujeme lokální farmy s lidmi, kteří hledají pravé chutě
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} style={{ marginBottom: 20, maxWidth: 480 }}>
                <div style={{ position: 'relative', display: 'flex', background: '#FAF7F2', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', border: '2px solid transparent', transition: 'border-color .2s' }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = '#C8963E'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 16, flexShrink: 0 }}>
                    <Search size={18} color="#6B7280" />
                  </div>
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Hledat farmu, region nebo produkt..."
                    style={{ flex: 1, padding: '14px 12px', border: 'none', outline: 'none', fontSize: 15, fontFamily: "'Inter',sans-serif", background: 'transparent', color: '#1A1A1A' }}
                  />
                  <button type="submit"
                    style={{ padding: '12px 20px', background: '#C8963E', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'background .15s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#B8853A'}
                    onMouseLeave={e => e.currentTarget.style.background = '#C8963E'}>
                    Hledat
                  </button>
                </div>
              </form>

              {/* GPS button */}
              <button onClick={() => navigate('/mapa')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'transparent', border: '2px solid rgba(250,247,242,0.35)', color: '#FAF7F2', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'border-color .2s', marginBottom: 40 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,247,242,0.7)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,247,242,0.35)'}>
                <Navigation size={14} /> Kolem mě
              </button>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(200,150,62,0.2)', paddingTop: 28 }}>
                {[
                  { n: FARMS_DATA.length.toLocaleString('cs-CZ'), l: 'farem v ČR' },
                  { n: '14', l: 'krajů' },
                  { n: '4.8★', l: 'průměr' },
                ].map(({ n, l }, i) => (
                  <div key={l} style={{ flex: 1, paddingLeft: i > 0 ? 24 : 0, borderLeft: i > 0 ? '1px solid rgba(200,150,62,0.2)' : undefined }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#C8963E', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'rgba(250,247,242,0.5)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Farm photo card */}
            <div className="hero-img-col" style={{ position: 'relative' }}>
              <div style={{ transform: 'rotate(2deg)', borderRadius: 16, overflow: 'hidden', border: '4px solid white', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', aspectRatio: '4/5', position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80&fit=crop"
                  alt="Lokální farma — zelené kopce"
                  fetchpriority="high"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Bottom overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px', background: 'linear-gradient(to top, rgba(26,26,26,0.8) 0%, transparent 100%)' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: "'Inter',sans-serif" }}>
                    Farma Zeleného kopce · Jihomoravský kraj
                  </div>
                  <div style={{ color: '#C8963E', fontSize: 12, marginTop: 4 }}>⭐ 4.9 · Přímý prodej</div>
                </div>
              </div>
              {/* Floating badge */}
              <div style={{ position: 'absolute', top: 24, right: -12, background: 'rgba(26,26,26,0.96)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(200,150,62,0.2)', minWidth: 150 }}>
                <div style={{ fontSize: 10, color: '#C8963E', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Nová farma</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#FAF7F2' }}>Ekofarma Jeseníky ⭐ 4.8</div>
                <div style={{ fontSize: 11, color: 'rgba(250,247,242,0.4)', marginTop: 2 }}>Olomoucký kraj</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ B. TICKER STRIP ═══ */}
      <div aria-hidden="true" style={{ background: '#C8963E', overflow: 'hidden', padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="ticker-track">
          {[...TICKER_FARMS, ...TICKER_FARMS].map((name, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap', padding: '0 28px', fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>
              {name} <span style={{ opacity: 0.4, marginLeft: 14 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ C. JAK TO FUNGUJE ═══ */}
      <section style={{ background: '#FFFFFF', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 12 }}>Postup</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3vw,40px)', fontWeight: 700, color: '#1A1A1A' }}>Jak to funguje?</h2>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { num: '01', Icon: MapPin, iconColor: '#2D5016', title: 'Najdi farmu', desc: 'Prohledej mapu 1 695 lokálních farem v celé ČR. Filtruj podle produktu, regionu nebo vzdálenosti.' },
              { num: '02', Icon: ShoppingBag, iconColor: '#C8963E', title: 'Objednej online', desc: 'Přímý kontakt s farmářem. Žádní prostředníci, férové ceny, čerstvé produkty.' },
              { num: '03', Icon: Heart, iconColor: '#2D5016', title: 'Podpoř lokální', desc: 'Každý nákup podporuje lokální zemědělce a udržitelné hospodaření v ČR.' },
            ].map((s, i) => (
              <motion.div
                key={i} className="step-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                {/* Big number background */}
                <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: "'Playfair Display',serif", fontSize: 80, fontWeight: 900, color: 'rgba(45,80,22,0.05)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{s.num}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: s.iconColor === '#2D5016' ? 'rgba(45,80,22,0.1)' : 'rgba(200,150,62,0.12)', marginBottom: 20 }}>
                  <s.Icon size={24} color={s.iconColor} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ D. CATEGORY GRID ═══ */}
      <section style={{ background: '#FAF7F2', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 12 }}>Kategorie</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3vw,40px)', fontWeight: 700, color: '#1A1A1A' }}>Co hledáš?</h2>
          </div>
          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
            {CATEGORIES.map((c, i) => {
              const count = FARMS_DATA.filter(f => f.type === c.filter).length;
              return (
                <motion.div
                  key={c.filter}
                  className="cat-card"
                  onClick={() => navigate(`/mapa?filter=${c.filter}`)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  style={{ padding: '28px 16px', textAlign: 'center' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: c.iconColor === '#2D5016' ? 'rgba(45,80,22,0.1)' : c.iconColor === '#C8963E' ? 'rgba(200,150,62,0.1)' : 'rgba(155,34,38,0.08)', marginBottom: 12 }}>
                    <c.Icon size={24} color={c.iconColor} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{count} farem</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ E. STATS COUNTER ═══ */}
      <section style={{ background: '#2D5016', padding: '88px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="stats-row" style={{ display: 'flex', gap: 0, justifyContent: 'center' }}>
            {[
              { target: FARMS_DATA.length, label: 'farem v ČR', suffix: '' },
              { target: 14, label: 'krajů pokrytých', suffix: '' },
              { target: 48, label: 'průměrné hodnocení', suffix: '★', divisor: 10 },
            ].map(({ target, label, suffix, divisor }, i) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(200,150,62,0.2)' : undefined, padding: '0 32px' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(36px,4vw,56px)', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                  {divisor
                    ? <><AnimatedCounter target={target} />{suffix}</>
                    : <AnimatedCounter target={target} suffix={suffix} />}
                </div>
                <div style={{ fontSize: 15, color: 'rgba(250,247,242,0.6)', marginTop: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ F. FEATURED FARMS ═══ */}
      <section style={{ background: '#FFFFFF', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 12 }}>Nejlepší farmy</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3vw,40px)', fontWeight: 700, color: '#1A1A1A' }}>Doporučené farmy</h2>
            </div>
            <button onClick={() => navigate('/mapa')}
              style={{ padding: '12px 28px', background: 'transparent', border: '2px solid #2D5016', color: '#2D5016', borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2D5016'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2D5016'; }}>
              Zobrazit vše →
            </button>
          </div>
          <div className="farms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {FEATURED_FARMS.map((farm, i) => {
              const photoId = FARM_PHOTO_POOL[i % FARM_PHOTO_POOL.length];
              return (
                <motion.div
                  key={farm.id}
                  className="farm-card"
                  onClick={() => navigate(`/farma/${farm.id}`)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className="farm-card-overlay">
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: "'Inter',sans-serif" }}>Zobrazit farmu →</span>
                  </div>
                  <div style={{ position: 'relative', height: 180 }}>
                    <img
                      src={`https://images.unsplash.com/photo-${photoId}?w=400&q=80&fit=crop`}
                      alt={farm.name}
                      loading="lazy"
                      onError={e => { e.currentTarget.src = `https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80&fit=crop`; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: 12, left: 12, background: '#2D5016', color: 'white', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                      {farm.emoji} {farm.type}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{farm.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Star size={14} color="#C8963E" fill="#C8963E" />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{farm.rating}</span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>(hodnocení)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="#6B7280" />
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{farm.loc}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ G. SEASONAL BANNER ═══ */}
      <section style={{ background: '#FAF7F2', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 340 }}>
            {/* Left content */}
            <div style={{ background: '#2D5016', padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8963E', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: '#1A1A1A', marginBottom: 20, width: 'fit-content' }}>
                {CURRENT_SEASON.emoji} {CURRENT_SEASON.label.toUpperCase()}
              </div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 700, color: 'white', marginBottom: 24, lineHeight: 1.2 }}>
                Co je teď v sezóně — {CURRENT_SEASON.label} {CURRENT_SEASON.emoji}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {CURRENT_SEASON.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#C8963E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} color="white" />
                    </div>
                    <span style={{ fontSize: 15, color: 'rgba(250,247,242,0.85)', fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(CURRENT_SEASON.path)}
                style={{ padding: '12px 28px', background: '#C8963E', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter',sans-serif", width: 'fit-content', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#B8853A'}
                onMouseLeave={e => e.currentTarget.style.background = '#C8963E'}>
                Prozkoumat sezónní nabídku →
              </button>
            </div>
            {/* Right photo */}
            <div style={{ position: 'relative', minHeight: 280 }}>
              <img
                src={`https://images.unsplash.com/${CURRENT_SEASON.img}?w=600&q=80&fit=crop`}
                alt={`Sezóna ${CURRENT_SEASON.label}`}
                loading="lazy"
                onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80&fit=crop'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(45,80,22,0.3) 0%, transparent 50%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ H. TESTIMONIALS ═══ */}
      <section style={{ background: '#FFFFFF', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 12 }}>Hodnocení</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3vw,40px)', fontWeight: 700, color: '#1A1A1A' }}>Co říkají zákazníci</h2>
          </div>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { name: 'Jana K.', city: 'Praha', quote: 'Nejlepší zelenina, co jsem kdy ochutnala. Farmář vždy připraví čerstvou sklizeň přímo na moji objednávku.', stars: 5, avatar: 'Jana+K.' },
              { name: 'Tomáš M.', city: 'Brno', quote: 'Konečně vím, odkud pochází moje maso. Transparentní, čerstvé, férové. Doporučuji každému!', stars: 5, avatar: 'Tomas+M.' },
              { name: 'Petra N.', city: 'Ostrava', quote: 'Skvělá aplikace! Každý týden objednávám od tří různých farem v okolí. Nikdy nebyl nákup tak jednoduchý.', stars: 5, avatar: 'Petra+N.' },
            ].map((t, i) => (
              <motion.div
                key={i} className="testimonial-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div style={{ color: '#C8963E', fontSize: 48, fontFamily: "'Playfair Display',serif", lineHeight: 0.8, marginBottom: 16, opacity: 0.5 }}>"</div>
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 24 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid #E8E0D0' }}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${t.avatar}&background=2D5016&color=FAF7F2&size=48`}
                    alt={t.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{t.name} <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 12 }}>· {t.city}</span></div>
                    <div style={{ fontSize: 13, color: '#C8963E', marginTop: 2 }}>{'★'.repeat(t.stars)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ I. NEWSLETTER ═══ */}
      <section style={{ background: '#2D5016', padding: '88px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, background: 'radial-gradient(circle, rgba(200,150,62,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 16 }}>Newsletter</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 700, color: '#FAF7F2', marginBottom: 14, lineHeight: 1.2 }}>
            Dostávejte tipy na sezónní produkty
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(250,247,242,0.6)', lineHeight: 1.75, marginBottom: 40 }}>
            Každý týden newsletter s tím, co právě dozrává ve vašem regionu.
          </p>
          <AnimatePresence mode="wait">
            {newsletterOk ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 32px', background: 'rgba(200,150,62,0.15)', border: '1px solid rgba(200,150,62,0.4)', borderRadius: 12 }}
              >
                <Check size={20} color="#C8963E" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#FAF7F2' }}>Děkujeme! Brzy se ozveme.</span>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleNewsletter} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', gap: 0, maxWidth: 460, margin: '0 auto 12px' }}>
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="váš@email.cz"
                    required
                    style={{ flex: 1, padding: '14px 18px', background: '#FAF7F2', border: 'none', borderRadius: '9999px 0 0 9999px', fontSize: 14, color: '#1A1A1A', fontFamily: "'Inter',sans-serif", outline: 'none' }}
                  />
                  <button type="submit"
                    style={{ padding: '14px 24px', background: '#C8963E', color: 'white', border: 'none', borderRadius: '0 9999px 9999px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap', transition: 'background .15s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#B8853A'}
                    onMouseLeave={e => e.currentTarget.style.background = '#C8963E'}>
                    Odebírat zdarma
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(250,247,242,0.35)' }}>Žádný spam. Odhlásit se lze kdykoliv.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ J. FOOTER ═══ */}
      <footer style={{ background: '#1A1A1A', padding: '60px 40px 32px', borderTop: '1px solid rgba(200,150,62,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🌾</span>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#FAF7F2' }}>
                  Mapa<span style={{ color: '#C8963E' }}>Farem</span>.cz
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(250,247,242,0.3)', lineHeight: 1.8, maxWidth: 230, marginBottom: 20 }}>
                Největší mapa lokálních farem a přírodních produktů v České republice.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[Instagram, Facebook].map((Icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(250,247,242,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,150,62,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(250,247,242,0.06)'}>
                    <Icon size={16} color="rgba(250,247,242,0.5)" />
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Průzkum', links: [['Mapa farem','/mapa'],['Sezónní průvodce','/sezona'],['Blog','/o-nas']] },
              { title: 'Pro farmáře', links: [['Registrace farmy','/pridat-farmu'],['Ceník','/cenik'],['Dashboard','/dashboard']] },
              { title: 'Pomoc', links: [['O nás','/o-nas'],['Kontakt','/o-nas'],['Podmínky','/o-nas']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 700, fontSize: 10, color: 'rgba(200,150,62,0.55)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 18 }}>{col.title}</div>
                {col.links.map(([l, h]) => (
                  <div key={l} className="footer-link" onClick={() => navigate(h)}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(200,150,62,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: 'rgba(250,247,242,0.15)' }}>© 2026 MapaFarem.cz — Podporujeme lokální zemědělství v ČR</p>
            <p style={{ fontSize: 12, color: 'rgba(250,247,242,0.15)' }}>Data: OpenStreetMap contributors 🌱</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
