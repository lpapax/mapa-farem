// frontend/src/pages/SeasonalGuidePage.jsx
// Requires Supabase table: newsletter_subscribers (id uuid, email text unique, source text, created_at timestamptz default now())
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
const MONTHS_SHORT = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];

const PRODUCTS_BY_MONTH = {
  1: [
    { name:'Kořenová zelenina', emoji:'🥕', photo:'1593105544559-ecb03bf76f82', nutrition:'Vitamín A, Draslík', storage:'Vydrží 2–3 týdny v chladu', months:[10,11,12,1,2], mapFilter:'veggie',
      recipes:[{ name:'Mrkvová polévka s zázvorem', time:'30 min', difficulty:'Snadné', ingredients:['mrkev','zázvor','kokosové mléko','cibule'] },{ name:'Dušená kořenová zelenina', time:'45 min', difficulty:'Snadné', ingredients:['mrkev','petržel','celer','máslo'] }] },
    { name:'Křen', emoji:'🌿', photo:'1592150621744-aca64f7b0b63', nutrition:'Vitamín C, Antibiotické látky', storage:'Vydrží 3 týdny v lednici', months:[1,2,3], mapFilter:'herbs',
      recipes:[{ name:'Křenová omáčka k masu', time:'15 min', difficulty:'Snadné', ingredients:['křen','smetana','citron','sůl'] }] },
    { name:'Zelí', emoji:'🥬', photo:'1598170845058-32b9d6a5da37', nutrition:'Vitamín K, Vitamin C', storage:'Vydrží 1–2 týdny v lednici', months:[10,11,12,1,2], mapFilter:'veggie',
      recipes:[{ name:'Kysané zelí domácí', time:'30 min + 2 týdny', difficulty:'Střední', ingredients:['zelí','sůl','kmín','bobkový list'] }] },
  ],
  2: [
    { name:'Zimní salát', emoji:'🥗', photo:'1540420773420-3366772f4999', nutrition:'Vitamín K, Folát', storage:'Vydrží 5 dní v lednici', months:[1,2,3], mapFilter:'veggie',
      recipes:[{ name:'Zimní salát s ořechy', time:'15 min', difficulty:'Snadné', ingredients:['salát','ořechy','hruška','rokfort'] }] },
    { name:'Pór', emoji:'🧅', photo:'1593105544559-ecb03bf76f82', nutrition:'Vitamín K, Mangan', storage:'Vydrží 1 týden v lednici', months:[11,12,1,2,3], mapFilter:'veggie',
      recipes:[{ name:'Pórová polévka', time:'35 min', difficulty:'Snadné', ingredients:['pór','brambory','vývar','smetana'] }] },
  ],
  3: [
    { name:'Chřest', emoji:'🌱', photo:'1515586000433-45406d8e6662', nutrition:'Folát, Vitamín K', storage:'Vydrží 3–5 dní ve svisle v vodě', months:[3,4,5,6], mapFilter:'veggie',
      recipes:[{ name:'Pečený chřest s parmezánem', time:'20 min', difficulty:'Snadné', ingredients:['chřest','olivový olej','parmezán','citron'] },{ name:'Chřestová risotto', time:'40 min', difficulty:'Střední', ingredients:['chřest','rýže arborio','vývar','máslo','parmazán'] }] },
    { name:'Ředkvičky', emoji:'🔴', photo:'1597362925123-77861d3fbac7', nutrition:'Vitamín C, Folát', storage:'Vydrží 1 týden v lednici', months:[3,4,5,6], mapFilter:'veggie',
      recipes:[{ name:'Ředkvičky s máslem a solí', time:'5 min', difficulty:'Snadné', ingredients:['ředkvičky','máslo','mořská sůl'] }] },
    { name:'Medvědí česnek', emoji:'🌿', photo:'1628689469838-524a4a973b8e', nutrition:'Allicin, Vitamín C', storage:'Vydrží 3 dny v lednici', months:[3,4,5], mapFilter:'herbs',
      recipes:[{ name:'Pesto z medvědího česneku', time:'15 min', difficulty:'Snadné', ingredients:['medvědí česnek','parmezán','piniové oříšky','olivový olej'] }] },
    { name:'Pažitka', emoji:'🌱', photo:'1618512496248-a07fe83aa8cb', nutrition:'Vitamín K, Vitamin A', storage:'Vydrží 1 týden v lednici', months:[3,4,5,6], mapFilter:'herbs',
      recipes:[{ name:'Smetanový dip s pažitkou', time:'10 min', difficulty:'Snadné', ingredients:['smetana','pažitka','česnek','sůl'] }] },
  ],
  4: [
    { name:'Rebarbora', emoji:'🌿', photo:'1590165482129-1b8b27698780', nutrition:'Vitamín K, Vápník', storage:'Vydrží 1 týden v lednici', months:[4,5,6], mapFilter:'veggie',
      recipes:[{ name:'Rebarborový koláč', time:'60 min', difficulty:'Střední', ingredients:['rebarbora','mouka','cukr','vejce','máslo'] },{ name:'Rebarborová marmeláda', time:'45 min', difficulty:'Snadné', ingredients:['rebarbora','cukr','citron'] }] },
    { name:'Špenát', emoji:'🥬', photo:'1540420773420-3366772f4999', nutrition:'Železo, Vitamín A', storage:'Vydrží 3–5 dní v lednici', months:[4,5,9,10], mapFilter:'veggie',
      recipes:[{ name:'Špenátové knedlíčky', time:'40 min', difficulty:'Střední', ingredients:['špenát','tvaroh','vejce','mouka'] }] },
  ],
  5: [
    { name:'Jahody', emoji:'🍓', photo:'1501746877-14128359f516', nutrition:'Vitamín C, Mangan', storage:'Vydrží 2–3 dny v lednici', months:[5,6,7], mapFilter:'veggie',
      recipes:[{ name:'Jahodový dort', time:'90 min', difficulty:'Střední', ingredients:['jahody','smetana','piškoty','cukr'] },{ name:'Jahodový džem', time:'45 min', difficulty:'Snadné', ingredients:['jahody','cukr','citronová šťáva'] }] },
    { name:'Ředkve', emoji:'🔴', photo:'1597362925123-77861d3fbac7', nutrition:'Vitamín C', storage:'Vydrží 1 týden', months:[5,6], mapFilter:'veggie',
      recipes:[{ name:'Ředkvičkový salát', time:'10 min', difficulty:'Snadné', ingredients:['ředkve','cibule','ocet','olej'] }] },
  ],
  6: [
    { name:'Maliny', emoji:'🫐', photo:'1498557850523-fd3d118b962e', nutrition:'Vitamín C, Mangan', storage:'Vydrží 2–3 dny v lednici', months:[6,7,8], mapFilter:'veggie',
      recipes:[{ name:'Malinový sorbet', time:'20 min + 4h mrazák', difficulty:'Snadné', ingredients:['maliny','cukr','citronová šťáva'] }] },
    { name:'Cukety', emoji:'🥒', photo:'1563565375-f3fdfdbefa83', nutrition:'Vitamín A, Draslík', storage:'Vydrží 1 týden v chladu', months:[6,7,8,9], mapFilter:'veggie',
      recipes:[{ name:'Cuketové placičky', time:'30 min', difficulty:'Snadné', ingredients:['cuketa','vejce','sýr','mouka','sůl'] }] },
  ],
  7: [
    { name:'Broskve', emoji:'🍑', photo:'1595743825637-cdafc8ad4173', nutrition:'Vitamín C, Vitamín A', storage:'Vydrží 3–5 dní při pokojové teplotě', months:[7,8], mapFilter:'veggie',
      recipes:[{ name:'Broskvový koláč', time:'60 min', difficulty:'Snadné', ingredients:['broskve','mouka','cukr','máslo'] }] },
    { name:'Kukuřice', emoji:'🌽', photo:'1551754655-cd27e38d2076', nutrition:'Vitamín B6, Hořčík', storage:'Spotřebujte do 1–2 dní', months:[7,8,9], mapFilter:'veggie',
      recipes:[{ name:'Kukuřice na grilu', time:'20 min', difficulty:'Snadné', ingredients:['kukuřice','máslo','sůl','pepř'] }] },
  ],
  8: [
    { name:'Rajčata', emoji:'🍅', photo:'1546554137-cf5a96b4f58', nutrition:'Lykopen, Vitamín C', storage:'Neskladujte v lednici, vydrží 5 dní', months:[7,8,9], mapFilter:'veggie',
      recipes:[{ name:'Rajčatová omáčka', time:'40 min', difficulty:'Snadné', ingredients:['rajčata','česnek','bazalka','olivový olej'] }] },
    { name:'Papriky', emoji:'🫑', photo:'1601004890684-d8cbf643f5f2', nutrition:'Vitamín C, Vitamín B6', storage:'Vydrží 1 týden v lednici', months:[7,8,9], mapFilter:'veggie',
      recipes:[{ name:'Plněné papriky', time:'60 min', difficulty:'Střední', ingredients:['papriky','mleté maso','rýže','rajčata'] }] },
  ],
  9: [
    { name:'Dýně', emoji:'🎃', photo:'1570586437263-ab629fccc818', nutrition:'Beta-karoten, Vitamín E', storage:'Vydrží 3 měsíce v chladnu', months:[9,10,11], mapFilter:'veggie',
      recipes:[{ name:'Dýňová polévka', time:'40 min', difficulty:'Snadné', ingredients:['dýně','vývar','cibule','smetana','muškátový oříšek'] },{ name:'Dýňový koláč', time:'75 min', difficulty:'Střední', ingredients:['dýně','vejce','cukr','skořice','mouka'] }] },
    { name:'Houby', emoji:'🍄', photo:'1504674900247-0877df9cc836', nutrition:'Vitamín D, Selen', storage:'Vydrží 3–5 dní v lednici', months:[8,9,10], mapFilter:'bio',
      recipes:[{ name:'Houbová omáčka', time:'25 min', difficulty:'Snadné', ingredients:['houby','cibule','smetana','česnek','petrželka'] }] },
  ],
  10: [
    { name:'Jablka', emoji:'🍎', photo:'1516912481800-3ab9985c6e40', nutrition:'Vitamín C, Pektin', storage:'Vydrží 1–2 měsíce v chladnu', months:[9,10,11], mapFilter:'veggie',
      recipes:[{ name:'Jablečný závin', time:'60 min', difficulty:'Střední', ingredients:['jablka','závinové těsto','cukr','skořice','rozinky'] }] },
    { name:'Červená řepa', emoji:'🟣', photo:'1593105544559-ecb03bf76f82', nutrition:'Folát, Draslík', storage:'Vydrží 2–3 týdny v lednici', months:[8,9,10,11], mapFilter:'veggie',
      recipes:[{ name:'Pečená řepa se sýrem', time:'50 min', difficulty:'Snadné', ingredients:['řepa','kozí sýr','vlašské ořechy','med'] }] },
  ],
  11: [
    { name:'Zelí', emoji:'🥬', photo:'1598170845058-32b9d6a5da37', nutrition:'Vitamín K, Vitamín C', storage:'Vydrží 2 týdny v lednici', months:[10,11,12], mapFilter:'veggie',
      recipes:[{ name:'Svíčkova se zelím', time:'180 min', difficulty:'Těžké', ingredients:['hovězí maso','zelí','smetana','citron'] }] },
    { name:'Ořechy', emoji:'🌰', photo:'1558642452-9d2a7deb7f62', nutrition:'Omega-3, Vitamín E', storage:'Vydrží 6 měsíců ve vzduchotěsné nádobě', months:[10,11,12], mapFilter:'bio',
      recipes:[{ name:'Ořechový koláč', time:'75 min', difficulty:'Střední', ingredients:['vlašské ořechy','mouka','vejce','cukr','máslo'] }] },
  ],
  12: [
    { name:'Jablečný mošt', emoji:'🍎', photo:'1576673442511-7e39b6545c87', nutrition:'Vitamín C, Antioxidanty', storage:'Vydrží 5 dní po otevření', months:[10,11,12], mapFilter:'wine',
      recipes:[{ name:'Svařený mošt', time:'15 min', difficulty:'Snadné', ingredients:['jablečný mošt','skořice','hřebíček','citron','zázvoru'] }] },
    { name:'Svíčková zelenina', emoji:'🥕', photo:'1598170845058-32b9d6a5da37', nutrition:'Vitamín A, C, K', storage:'Vydrží 1 týden v lednici', months:[10,11,12,1], mapFilter:'veggie',
      recipes:[{ name:'Svíčková na smetaně', time:'240 min', difficulty:'Těžké', ingredients:['hovězí svíčková','kořenová zelenina','smetana','brusinkový džem'] }] },
  ],
};

const C = {
  green: '#2D5016',
  gold: '#C8963E',
  cream: '#FAF7F2',
  text: '#1A1A1A',
  border: '#E8E0D0',
};

function ProductCard({ product, currentMonth, onRecipeClick, navigate }) {
  const [recipesOpen, setRecipesOpen] = useState(false);
  const recipeCount = product.recipes ? product.recipes.length : 0;

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Photo */}
      <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
        <img
          src={`https://images.unsplash.com/photo-${product.photo}?w=600&q=80&fit=crop&auto=format`}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentNode.style.background = '#E8E0D0';
          }}
        />
        {/* Season dots overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.55)',
          padding: '6px 12px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>Sezóna:</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const inSeason = product.months.includes(m);
              const isCurrent = m === currentMonth;
              return (
                <div
                  key={m}
                  title={MONTHS[i]}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isCurrent
                      ? C.gold
                      : inSeason
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.2)',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{product.emoji}</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
          }}>
            {product.name}
          </span>
        </div>

        {/* Nutrition badge */}
        <div style={{
          display: 'inline-block',
          background: '#EEF5E8',
          color: C.green,
          borderRadius: 9999,
          padding: '3px 12px',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          marginBottom: 10,
        }}>
          {product.nutrition}
        </div>

        {/* Storage tip */}
        <div style={{
          background: '#FAF7F2',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13,
          color: '#555',
          fontFamily: "'Inter', sans-serif",
          marginBottom: 14,
        }}>
          🌡️ {product.storage}
        </div>

        {/* Buy button */}
        <button
          onClick={() => navigate(`/mapa?filter=${product.mapFilter}`)}
          style={{
            background: 'transparent',
            border: `1.5px solid ${C.gold}`,
            color: C.gold,
            borderRadius: 9999,
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            marginBottom: recipeCount > 0 ? 14 : 0,
          }}
        >
          Kde koupit →
        </button>

        {/* Recipes toggle */}
        {recipeCount > 0 && (
          <div>
            <button
              onClick={() => setRecipesOpen(o => !o)}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'left',
              }}
            >
              {recipesOpen ? '▲' : '▼'} Recepty ({recipeCount})
            </button>

            <AnimatePresence>
              {recipesOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {product.recipes.map(recipe => (
                      <button
                        key={recipe.name}
                        onClick={() => onRecipeClick(recipe, product)}
                        style={{
                          background: '#FAF7F2',
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: '10px 12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                          {recipe.name}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
                          <span>⏱ {recipe.time}</span>
                          <span>📊 {recipe.difficulty}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SeasonalGuidePage() {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState(null);
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState(null);

  useSEO({
    title: `Sezónní kalendář — ${MONTHS[currentMonth - 1]}`,
    description: 'Co je teď v sezóně v ČR? Recepty, tipy na skladování a kde koupit čerstvé produkty od farmářů.',
  });

  const currentProducts = PRODUCTS_BY_MONTH[selectedMonth] || [];

  function handleRecipeClick(recipe, product) {
    setSelectedRecipe(recipe);
    setSelectedRecipeProduct(product);
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!nlEmail.includes('@')) return;
    setNlStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: nlEmail.trim().toLowerCase(), source: 'sezona' });
      if (error?.code === '23505') { setNlStatus('duplicate'); return; }
      if (error) throw error;
      setNlStatus('success');
      setNlEmail('');
    } catch { setNlStatus('error'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Inter', sans-serif", color: C.text }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* HEADER */}
      <header style={{
        background: C.green,
        padding: '48px 20px',
        textAlign: 'center',
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 28 }}>🌾</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: C.cream,
          }}>
            MapaFarem.cz
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 900,
          color: C.cream,
          marginBottom: 12,
          lineHeight: 1.15,
        }}>
          Co je teď v sezóně — {MONTHS[currentMonth - 1]}
        </h1>

        <p style={{
          fontSize: 16,
          color: 'rgba(250,247,242,0.75)',
          maxWidth: 480,
          margin: '0 auto',
        }}>
          Vyberte měsíc a zjistěte, co právě dozrává
        </p>
      </header>

      {/* 12-MONTH CALENDAR GRID */}
      <div style={{ background: 'white', padding: '32px 20px' }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 8,
        }}>
          {MONTHS.map((name, i) => {
            const m = i + 1;
            const isCurrent = m === currentMonth;
            const isSelected = m === selectedMonth;
            const count = (PRODUCTS_BY_MONTH[m] || []).length;
            const label = MONTHS_SHORT[i];

            let bg, textColor, fontWeight;
            if (isCurrent && isSelected) {
              bg = C.green; textColor = 'white'; fontWeight = 700;
            } else if (isCurrent) {
              bg = C.green; textColor = 'white'; fontWeight = 700;
            } else if (isSelected) {
              bg = C.gold; textColor = 'white'; fontWeight = 700;
            } else {
              bg = C.cream; textColor = C.text; fontWeight = 400;
            }

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                style={{
                  background: bg,
                  color: textColor,
                  fontWeight,
                  border: 'none',
                  borderRadius: 9999,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span style={{
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: 9999,
                    fontSize: 10,
                    padding: '1px 6px',
                    color: textColor === 'white' ? 'rgba(255,255,255,0.85)' : '#888',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div style={{ background: C.cream, padding: '40px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            marginBottom: 28,
          }}>
            V {MONTHS[selectedMonth - 1]} sklízíme:
          </h2>

          {currentProducts.length === 0 ? (
            <p style={{ color: '#888', fontSize: 15 }}>Pro tento měsíc nemáme data.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}>
              {currentProducts.map(product => (
                <ProductCard
                  key={product.name}
                  product={product}
                  currentMonth={selectedMonth}
                  onRecipeClick={handleRecipeClick}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRESERVATION TIPS */}
      <div style={{ background: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            marginBottom: 28,
          }}>
            Jak uchovat sezónní úrodu
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: '🫙',
                title: 'Jak zavařit',
                text: 'Zahřejte sklenice na 150°C, naplňte horkou náplní, zavřete a obraťte dnem vzhůru.',
              },
              {
                icon: '❄️',
                title: 'Jak zmrazit',
                text: 'Zeleninu blanšírujte 2–3 minuty, schovejte do ledové vody, osušte a zmrazte.',
              },
              {
                icon: '☀️',
                title: 'Jak usušit',
                text: 'Nakrájejte na plátky 5mm, sušte v troubě na 60°C nebo v sušičce 6–8 hodin.',
              },
            ].map(({ icon, title, text }) => (
              <div
                key={title}
                style={{
                  background: C.cream,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: '24px 20px',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: 10,
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div style={{
        background: C.green,
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 700,
          color: C.cream,
          marginBottom: 20,
        }}>
          Sezónní tipy každý měsíc
        </h2>

        <form
          onSubmit={handleSubscribe}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <input
            type="email"
            placeholder="váš@email.cz"
            value={nlEmail}
            onChange={e => setNlEmail(e.target.value)}
            required
            style={{
              padding: '12px 20px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 15,
              fontFamily: "'Inter', sans-serif",
              width: 280,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={nlStatus === 'loading'}
            style={{
              background: C.gold,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: nlStatus === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              opacity: nlStatus === 'loading' ? 0.7 : 1,
            }}
          >
            {nlStatus === 'loading' ? 'Přihlašuji...' : 'Přihlásit odběr'}
          </button>
        </form>
        {nlStatus === 'success' && (
          <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: '#4ADE80' }}>Přihlášeno! Těšte se na tipy z farem.</p>
        )}
        {nlStatus === 'duplicate' && (
          <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: C.gold }}>Tento e-mail je již přihlášen.</p>
        )}
        {nlStatus === 'error' && (
          <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: '#F87171' }}>Chyba, zkuste znovu.</p>
        )}
      </div>

      {/* RECIPE MODAL */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 32,
                maxWidth: 480,
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                marginBottom: 16,
                color: C.text,
              }}>
                {selectedRecipe.name}
              </h2>

              <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 14, color: '#555' }}>
                <span>⏱️ {selectedRecipe.time}</span>
                <span>📊 {selectedRecipe.difficulty}</span>
              </div>

              <div style={{ marginBottom: 24 }}>
                <strong style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}>Ingredience:</strong>
                <ul style={{ margin: '8px 0 0 20px', fontSize: 14, lineHeight: 1.8, color: '#444' }}>
                  {selectedRecipe.ingredients.map(ing => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate(`/mapa?filter=${selectedRecipeProduct?.mapFilter || ''}`)}
                style={{
                  background: C.gold,
                  color: 'white',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '10px 20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                }}
              >
                Najít farmu s tímto produktem →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
