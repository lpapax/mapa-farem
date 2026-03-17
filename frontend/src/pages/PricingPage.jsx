// frontend/src/pages/PricingPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp, Zap, TrendingUp, BarChart2, Image } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const CSS_VARS = `
  :root { --green:#2D5016;--gold:#C8963E;--cream:#FAF7F2;--text:#1A1A1A;--muted:#6B7280;--border:#E8E0D0; }
  *{box-sizing:border-box;margin:0;padding:0;}
  @media(max-width:900px){.plans-grid{grid-template-columns:1fr!important;}.compare-grid{grid-template-columns:repeat(2,1fr)!important;}}
  @media(max-width:600px){.nav-links{display:none!important;}.footer-grid-p{grid-template-columns:1fr!important;}}
`;

const PLANS = [
  {
    id: 'free',
    name: 'Zdarma',
    price: 0,
    priceYear: 0,
    badge: null,
    desc: 'Pro začínající farmáře — zdarma navždy',
    features: [
      { ok: true,  text: '5 produktů v profilu' },
      { ok: true,  text: 'Základní profil na mapě' },
      { ok: true,  text: 'Kontaktní informace' },
      { ok: true,  text: 'Recenze zákazníků' },
      { ok: false, text: 'Prioritní řazení ve výsledcích' },
      { ok: false, text: 'Statistiky návštěvnosti' },
      { ok: false, text: 'SMS notifikace' },
      { ok: false, text: 'Neomezené produkty' },
    ],
    cta: 'Začít zdarma',
    ctaPath: '/pridat-farmu',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299,
    priceYear: 239,
    badge: '⭐ Nejpopulárnější',
    desc: 'Pro farmáře, kteří chtějí růst',
    features: [
      { ok: true, text: 'Neomezené produkty v profilu' },
      { ok: true, text: 'Prioritní řazení na mapě' },
      { ok: true, text: 'Detailní statistiky návštěvnosti' },
      { ok: true, text: 'SMS notifikace o kontaktech' },
      { ok: true, text: 'Badge "Ověřená farma"' },
      { ok: true, text: 'Zvýraznění zlatým rámem' },
      { ok: true, text: 'Sezónní nabídky (neomezené)' },
      { ok: true, text: 'Prioritní podpora (do 24h)' },
    ],
    cta: 'Začít Premium',
    ctaPath: '/pridat-farmu',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 799,
    priceYear: 639,
    badge: '🏆 Pro velké farmy',
    desc: 'Kompletní řešení pro profesionály',
    features: [
      { ok: true, text: 'Vše v Premium' },
      { ok: true, text: 'API přístup pro e-shop napojení' },
      { ok: true, text: 'Dedikovaný account manager' },
      { ok: true, text: 'Vlastní doména (farma.cz → profil)' },
      { ok: true, text: 'Reklamní banner na mapě' },
      { ok: true, text: 'Top pozice ve výsledcích vyhledávání' },
      { ok: true, text: 'Neomezené fotografie' },
      { ok: true, text: 'Podpora SLA do 4h' },
    ],
    cta: 'Kontaktovat',
    ctaPath: '/o-nas',
    highlight: false,
  },
];

const FAQ = [
  { q: 'Je přidání farmy opravdu zdarma?', a: 'Ano, základní profil na mapě je a vždy bude zdarma. Platíte jen pokud chcete prémiové funkce jako prioritní řazení nebo statistiky.' },
  { q: 'Jak funguje roční platba?', a: 'Při ročním předplatném ušetříte 20 % — Premium vychází na 239 Kč/měsíc místo 299 Kč. Business vychází na 639 Kč/měsíc místo 799 Kč.' },
  { q: 'Jak zaplatit?', a: 'Přijímáme platby kartou přes Stripe a GoPay. Po platbě se Premium aktivuje okamžitě.' },
  { q: 'Mohu kdykoliv zrušit?', a: 'Ano, předplatné můžete zrušit kdykoliv. Premium zůstane aktivní do konce zaplaceného období.' },
  { q: 'Co je prioritní řazení na mapě?', a: 'Premium farmy se zobrazují výše ve výsledcích hledání a mají zlatý rámeček pinu na mapě.' },
  { q: 'Nabízíte bezplatnou zkušební dobu?', a: 'Ano, Premium můžete vyzkoušet 14 dní zdarma bez zadání platební karty. Stačí se zaregistrovat.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useSEO({
    title: 'Ceník pro farmáře',
    description: 'Prezentujte svou farmu na MapaFarem.cz. Začněte zdarma, upgradujte na Premium pro více zákazníků.',
    canonical: 'https://mapafarem.cz/cenik',
  });

  return (
    <div style={{ fontFamily: "'Inter','DM Sans',sans-serif", background: '#FAF7F2', color: '#1A1A1A', overflowX: 'hidden', minHeight: '100vh' }}>
      <style>{CSS_VARS}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(45,80,22,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(200,150,62,0.15)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 19, color: '#FAF7F2' }}>
            Mapa<span style={{ color: '#C8963E' }}>Farem</span>.cz
          </div>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[['Mapa','/mapa'],['O nás','/o-nas'],['Farmáři','/pridat-farmu']].map(([l,h]) => (
            <button key={l} onClick={() => navigate(h)}
              style={{ padding: '8px 15px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: 'rgba(250,247,242,0.65)', fontFamily: "'Inter',sans-serif", borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#FAF7F2'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,242,0.65)'}>{l}</button>
          ))}
          <button onClick={() => navigate('/pridat-farmu')}
            style={{ padding: '10px 22px', background: '#C8963E', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginLeft: 12 }}>
            Přidat farmu
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#2D5016', padding: '88px 40px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(200,150,62,0.06) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,150,62,0.15)', border: '1px solid rgba(200,150,62,0.3)', padding: '5px 16px', borderRadius: 9999, fontSize: 11, fontWeight: 700, color: '#C8963E', marginBottom: 24, letterSpacing: 2, textTransform: 'uppercase' }}>
              Jednoduché ceny
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, color: '#FAF7F2', marginBottom: 20 }}>
              Začněte zdarma.<br />
              <em style={{ color: '#C8963E', fontStyle: 'italic' }}>Rostěte s námi.</em>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(250,247,242,0.65)', lineHeight: 1.8, marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}>
              Pomáháme farmářům dostat se k zákazníkům. Začněte bez rizika, upgradujte až budete chtít.
            </p>
          </motion.div>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,150,62,0.2)', borderRadius: 9999, padding: '8px 8px 8px 20px' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: !yearly ? '#FAF7F2' : 'rgba(250,247,242,0.4)', transition: 'color .2s' }}>Měsíčně</span>
            <div onClick={() => setYearly(v => !v)} style={{ width: 48, height: 26, borderRadius: 13, background: yearly ? '#C8963E' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background .3s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 4, left: yearly ? 26 : 4, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: yearly ? '#FAF7F2' : 'rgba(250,247,242,0.4)', transition: 'color .2s' }}>Ročně</span>
            {yearly && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2D5016', background: '#C8963E', borderRadius: 9999, padding: '4px 10px', marginRight: 4 }}>
                Ušetříte 20 %
              </span>
            )}
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section style={{ padding: '0 40px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', transform: 'translateY(-40px)' }}>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {PLANS.map((plan, pi) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: pi * 0.12 }}
                style={{
                  background: plan.highlight ? '#2D5016' : '#FFFFFF',
                  border: plan.highlight ? '2px solid #C8963E' : '1px solid #E8E0D0',
                  borderRadius: 20, padding: '40px 32px',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  boxShadow: plan.highlight ? '0 20px 60px rgba(45,80,22,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#C8963E', color: 'white', fontSize: 11, fontWeight: 700, padding: '5px 18px', borderRadius: 9999, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C8963E', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: plan.price === 0 ? 40 : 44, fontWeight: 700, color: plan.highlight ? '#FAF7F2' : '#1A1A1A', lineHeight: 1 }}>
                    {plan.price === 0 ? '0 Kč' : (
                      <>{yearly ? plan.priceYear : plan.price}<span style={{ fontSize: 16, fontWeight: 400, color: plan.highlight ? 'rgba(250,247,242,0.6)' : '#6B7280' }}> Kč/měs</span></>
                    )}
                  </div>
                  {plan.price > 0 && yearly && (
                    <div style={{ fontSize: 12, color: '#C8963E', marginTop: 4 }}>
                      Účtováno {(plan.priceYear * 12).toLocaleString('cs-CZ')} Kč/rok
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: plan.highlight ? 'rgba(250,247,242,0.55)' : '#6B7280', marginTop: 10, lineHeight: 1.6 }}>{plan.desc}</p>
                </div>

                <div style={{ borderTop: `1px solid ${plan.highlight ? 'rgba(200,150,62,0.2)' : '#E8E0D0'}`, paddingTop: 24, marginTop: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: f.ok ? (plan.highlight ? 'rgba(250,247,242,0.9)' : '#1A1A1A') : 'rgba(107,114,128,0.5)' }}>
                      {f.ok
                        ? <Check size={15} color={plan.highlight ? '#C8963E' : '#2D5016'} style={{ flexShrink: 0 }} />
                        : <X size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />}
                      {f.text}
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate(plan.ctaPath)}
                  style={{
                    padding: '14px 28px', border: plan.highlight ? 'none' : '2px solid #2D5016',
                    background: plan.highlight ? '#C8963E' : 'transparent',
                    color: plan.highlight ? 'white' : '#2D5016',
                    borderRadius: 9999, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif", transition: 'all .2s',
                  }}
                  onMouseEnter={e => { if (plan.highlight) { e.currentTarget.style.background = '#B8853A'; } else { e.currentTarget.style.background = '#2D5016'; e.currentTarget.style.color = 'white'; } }}
                  onMouseLeave={e => { if (plan.highlight) { e.currentTarget.style.background = '#C8963E'; } else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2D5016'; } }}>
                  {plan.cta} →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE COMPARISON */}
      <section style={{ padding: '60px 40px 88px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 12 }}>Proč Premium?</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 700, color: '#1A1A1A' }}>Víc viditelnosti, víc zákazníků</h2>
          </div>
          <div className="compare-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { Icon: TrendingUp, title: '3× více prohlídek', desc: 'Premium farmy mají v průměru 3× více prohlídek díky prioritnímu řazení na mapě.' },
              { Icon: Zap, title: 'Top pozice', desc: 'Zobrazíte se výše ve výsledcích hledání před ostatními farmami v okolí.' },
              { Icon: Image, title: 'Neomezené fotky', desc: 'Ukažte svou farmu naplno — nahrávejte tolik fotografií, kolik chcete.' },
              { Icon: BarChart2, title: 'Statistiky', desc: 'Víte, kolik lidí si prohlédlo váš profil, odkud přicházejí a co hledají.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{ background: '#FAF7F2', border: '1px solid #E8E0D0', borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(45,80,22,0.1)', marginBottom: 16 }}>
                  <f.Icon size={22} color="#2D5016" />
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '88px 40px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#C8963E', textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 700, color: '#1A1A1A' }}>Časté otázky</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((f, i) => (
              <div key={i}
                style={{ background: '#FFFFFF', border: '1px solid #E8E0D0', borderRadius: 16, cursor: 'pointer', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{f.q}</span>
                  {openFaq === i ? <ChevronUp size={18} color="#C8963E" /> : <ChevronDown size={18} color="#6B7280" />}
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 24px 20px', fontSize: 14, color: '#6B7280', lineHeight: 1.8 }}>{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{ padding: '88px 40px', textAlign: 'center', background: '#2D5016', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(200,150,62,0.06) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,3vw,42px)', fontWeight: 700, color: '#FAF7F2', marginBottom: 16 }}>
            Připraveni začít?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(250,247,242,0.6)', lineHeight: 1.8, marginBottom: 40 }}>
            Přidejte svou farmu zdarma a oslovte zákazníky ve vašem okolí.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/pridat-farmu')}
              style={{ padding: '14px 32px', background: '#C8963E', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#B8853A'}
              onMouseLeave={e => e.currentTarget.style.background = '#C8963E'}>
              Přidat farmu zdarma →
            </button>
            <button onClick={() => navigate('/mapa')}
              style={{ padding: '14px 32px', background: 'transparent', color: '#FAF7F2', border: '2px solid rgba(250,247,242,0.3)', borderRadius: 9999, fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,247,242,0.7)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,247,242,0.3)'}>
              Prozkoumat mapu
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER mini */}
      <footer style={{ background: '#1A1A1A', padding: '28px 40px', textAlign: 'center', borderTop: '1px solid rgba(200,150,62,0.06)' }}>
        <p style={{ fontSize: 12, color: 'rgba(250,247,242,0.2)' }}>© 2026 MapaFarem.cz · Ceník se může změnit s předchozím upozorněním 🌱</p>
      </footer>
    </div>
  );
}
