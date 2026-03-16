// frontend/src/pages/PricingPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  dark: '#1A2D18', darkDeep: '#111D10', gold: '#C8973A', goldLight: '#DDB04E',
  cream: '#F5EDE0', green: '#3A5728', brown: '#2C1810',
};

const PLANS = [
  {
    id: 'free',
    name: 'Zdarma',
    price: 0,
    priceYear: 0,
    badge: null,
    desc: 'Pro malé farmáře a zahrádkáře',
    features: [
      { ok: true,  text: 'Profil na mapě' },
      { ok: true,  text: 'Základní kontaktní info' },
      { ok: true,  text: 'Až 3 fotografie' },
      { ok: true,  text: 'Recenze zákazníků' },
      { ok: false, text: 'Zvýraznění na mapě' },
      { ok: false, text: 'Statistiky návštěvnosti' },
      { ok: false, text: 'Sezónní nabídky (max 1)' },
      { ok: false, text: 'Prioritní podpora' },
    ],
    cta: 'Přidat farmu zdarma',
    ctaPath: '/pridat-farmu',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299,
    priceYear: 1990,
    badge: '🌟 Nejpopulárnější',
    desc: 'Pro farmáře, kteří chtějí více zákazníků',
    features: [
      { ok: true, text: 'Vše ze Zdarma' },
      { ok: true, text: 'Zvýraznění zlatým rámem na mapě' },
      { ok: true, text: 'Až 20 fotografií' },
      { ok: true, text: 'Statistiky prohlédnutí profilu' },
      { ok: true, text: 'Neomezené sezónní nabídky' },
      { ok: true, text: 'Prioritní podpora (do 24h)' },
      { ok: true, text: 'Badge "Ověřená farma"' },
      { ok: false, text: 'Reklamní banner na mapě' },
    ],
    cta: 'Vyzkoušet Premium',
    ctaPath: '/pridat-farmu',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 799,
    priceYear: 5990,
    badge: '🏆 Pro velké farmy',
    desc: 'Kompletní marketingové řešení',
    features: [
      { ok: true, text: 'Vše z Premium' },
      { ok: true, text: 'Reklamní banner na mapě' },
      { ok: true, text: 'Top pozice ve výsledcích' },
      { ok: true, text: 'Neomezené fotografie' },
      { ok: true, text: 'Vlastní e-shop na platformě' },
      { ok: true, text: 'API přístup' },
      { ok: true, text: 'Dedikovaný account manager' },
      { ok: true, text: 'Custom doména (farma.cz → profil)' },
    ],
    cta: 'Kontaktovat nás',
    ctaPath: '/o-nas',
    highlight: false,
  },
];

const FAQ = [
  { q: 'Je přidání farmy opravdu zdarma?', a: 'Ano, základní profil na mapě je a vždy bude zdarma. Platíte jen pokud chcete prémiové funkce.' },
  { q: 'Jak funguje roční platba?', a: 'Při ročním předplatném ušetříte 2 měsíce — Premium vychází na 165 Kč/měsíc místo 299 Kč.' },
  { q: 'Jak zaplatit?', a: 'Přijímáme platby kartou přes Stripe a GoPay. Po platbě se Premium aktivuje okamžitě.' },
  { q: 'Mohu kdykoliv zrušit?', a: 'Ano, předplatné můžete zrušit kdykoliv. Premium zůstane aktivní do konce zaplaceného období.' },
  { q: 'Co je "zvýraznění na mapě"?', a: 'Premium farmy mají zlatý rámeček pinu a zobrazují se výše ve výsledcích hledání.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: C.dark, color: C.cream, overflowX: 'hidden', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @media(max-width:900px){.plans-grid{grid-template-columns:1fr!important;}}
        @media(max-width:600px){.nav-links{display:none!important;}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 300, background: 'rgba(26,45,24,.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(200,151,58,.12)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 19, color: C.cream }}>
            Mapa<span style={{ color: C.gold }}>Farem</span>
          </div>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[['Mapa', '/mapa'], ['O nás', '/o-nas'], ['Farmáři', '/pridat-farmu']].map(([l, h]) => (
            <button key={l} onClick={() => navigate(h)}
              style={{ padding: '8px 15px', background: 'none', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: 'rgba(245,237,224,.65)', fontFamily: "'DM Sans',sans-serif", borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = C.cream}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,237,224,.65)'}>{l}</button>
          ))}
          <button onClick={() => navigate('/pridat-farmu')}
            style={{ padding: '10px 22px', background: C.gold, color: 'white', border: 'none', borderRadius: 2, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginLeft: 12 }}>
            Přidat farmu
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 40px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(200,151,58,.05) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,58,.12)', border: '1px solid rgba(200,151,58,.3)', padding: '5px 16px', borderRadius: 2, fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 24, letterSpacing: 2, textTransform: 'uppercase' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
            Jednoduché ceny, žádné skryté poplatky
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, lineHeight: 1.1, color: C.cream, marginBottom: 20 }}>
            Dostaňte vaši farmu<br/>
            <em style={{ color: C.gold, fontStyle: 'italic' }}>k tisícům zákazníků</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(245,237,224,.6)', lineHeight: 1.8, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Začněte zdarma. Upgradujte, až budete chtít více viditelnosti.
          </p>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(200,151,58,.15)', borderRadius: 2, padding: '6px 6px 6px 18px', marginBottom: 60 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: !yearly ? C.cream : 'rgba(245,237,224,.4)', transition: 'color .2s' }}>Měsíčně</span>
            <div onClick={() => setYearly(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, background: yearly ? C.gold : 'rgba(255,255,255,.15)', cursor: 'pointer', position: 'relative', transition: 'background .3s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: yearly ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: yearly ? C.cream : 'rgba(245,237,224,.4)', transition: 'color .2s' }}>Ročně</span>
            {yearly && <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, background: 'rgba(200,151,58,.15)', borderRadius: 2, padding: '3px 8px' }}>−2 měsíce zdarma</span>}
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section style={{ padding: '0 40px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
            {PLANS.map((plan) => (
              <div key={plan.id} style={{
                background: plan.highlight ? 'rgba(200,151,58,.08)' : 'rgba(255,255,255,.03)',
                border: plan.highlight ? `1px solid rgba(200,151,58,.4)` : '1px solid rgba(255,255,255,.06)',
                padding: '40px 32px',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 2, whiteSpace: 'nowrap', letterSpacing: 1 }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: plan.price === 0 ? 40 : 42, fontWeight: 900, color: C.cream, lineHeight: 1 }}>
                    {plan.price === 0 ? 'Zdarma' : (
                      <>
                        {yearly ? Math.round(plan.priceYear / 12) : plan.price}
                        <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(245,237,224,.5)' }}> Kč/měsíc</span>
                      </>
                    )}
                  </div>
                  {plan.price > 0 && yearly && (
                    <div style={{ fontSize: 12, color: C.gold, marginTop: 4 }}>
                      Účtováno {plan.priceYear} Kč/rok
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: 'rgba(245,237,224,.4)', marginTop: 10, lineHeight: 1.6 }}>{plan.desc}</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(200,151,58,.1)', paddingTop: 24, marginTop: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: f.ok ? 'rgba(245,237,224,.85)' : 'rgba(245,237,224,.25)' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{f.ok ? '✓' : '·'}</span>
                      {f.text}
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate(plan.ctaPath)}
                  style={{
                    padding: '14px', border: plan.highlight ? 'none' : '1px solid rgba(200,151,58,.3)',
                    background: plan.highlight ? C.gold : 'transparent',
                    color: plan.highlight ? 'white' : C.gold,
                    borderRadius: 2, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif", letterSpacing: .5, transition: 'all .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = plan.highlight ? C.goldLight : 'rgba(200,151,58,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = plan.highlight ? C.gold : 'transparent'; }}>
                  {plan.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES COMPARISON */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(200,151,58,.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: C.gold, textTransform: 'uppercase', marginBottom: 12 }}>Proč Premium?</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: C.cream }}>Víc viditelnosti, víc zákazníků</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
            {[
              { icon: '📈', title: 'Více prohlídek', desc: 'Premium farmy mají v průměru 3× více prohlídek díky zvýraznění na mapě.' },
              { icon: '🥇', title: 'Top pozice', desc: 'Zobrazíte se výše ve výsledcích hledání před ostatními farmami.' },
              { icon: '📸', title: 'Více fotek', desc: 'Ukažte svou farmu naplno — 20 fotografií místo 3.' },
              { icon: '📊', title: 'Statistiky', desc: 'Víte, kolik lidí si prohlédlo váš profil, odkud přicházejí a co hledají.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(200,151,58,.1)', padding: '28px 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.cream, marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: 14, color: 'rgba(245,237,224,.5)', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid rgba(200,151,58,.08)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: C.gold, textTransform: 'uppercase', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: C.cream }}>Časté otázky</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQ.map((f, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(200,151,58,.1)', cursor: 'pointer', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: C.cream }}>{f.q}</span>
                  <span style={{ color: C.gold, fontSize: 18, flexShrink: 0, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', fontSize: 14, color: 'rgba(245,237,224,.6)', lineHeight: 1.8 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid rgba(200,151,58,.08)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: C.cream, marginBottom: 16 }}>
            Připraveni začít?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(245,237,224,.55)', lineHeight: 1.8, marginBottom: 36 }}>
            Přidejte svou farmu zdarma a oslovte zákazníky ve vašem okolí.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/pridat-farmu')}
              style={{ padding: '15px 38px', background: C.gold, color: 'white', border: 'none', borderRadius: 2, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              Přidat farmu zdarma →
            </button>
            <button onClick={() => navigate('/mapa')}
              style={{ padding: '15px 38px', background: 'transparent', color: C.cream, border: '1px solid rgba(245,237,224,.25)', borderRadius: 2, fontWeight: 500, fontSize: 15, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              Prozkoumat mapu
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER mini */}
      <footer style={{ background: C.darkDeep, padding: '28px 40px', textAlign: 'center', borderTop: '1px solid rgba(200,151,58,.08)' }}>
        <p style={{ fontSize: 12, color: 'rgba(245,237,224,.2)' }}>© 2026 MapaFarem.cz · Ceník se může změnit · Vždy s předchozím upozorněním 🌱</p>
      </footer>
    </div>
  );
}
