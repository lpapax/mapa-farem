// frontend/src/pages/RegisterFarmPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const TYPES = [
  { id:'veggie', emoji:'🥕', label:'Zelenina & ovoce' },
  { id:'meat',   emoji:'🥩', label:'Maso & uzeniny' },
  { id:'dairy',  emoji:'🥛', label:'Mléko & sýry' },
  { id:'honey',  emoji:'🍯', label:'Med & včely' },
  { id:'wine',   emoji:'🍷', label:'Víno & nápoje' },
  { id:'bio',    emoji:'🌱', label:'BIO produkty' },
  { id:'herbs',  emoji:'🌿', label:'Bylinky & kosmetika' },
  { id:'market', emoji:'🏪', label:'Farmářský trh' },
];

const STEPS = ['Základní info', 'Kontakt & web', 'Produkty & popis'];

const T = {
  bg: '#FAFAF7', green: '#3A5728', border: 'rgba(58,87,40,.18)',
  text: '#1E120A', sub: '#666', card: 'white',
};

export default function RegisterFarmPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'veggie', loc: '',
    phone: '', email: '', website: '', hours: '',
    description: '', products: '', bio: false, eshop: false, delivery: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function validateStep() {
    if (step === 0) {
      if (!form.name.trim()) { setError('Zadej název farmy.'); return false; }
      if (!form.loc.trim()) { setError('Zadej adresu farmy.'); return false; }
    }
    setError('');
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep(s => s + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (!user) throw new Error('Pro přidání farmy se musíš přihlásit.');

      let lat = null, lng = null;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.loc + ', Česká republika')}&format=json&limit=1&countrycodes=cz`);
        const data = await res.json();
        if (data.length > 0) { lat = parseFloat(data[0].lat); lng = parseFloat(data[0].lon); }
      } catch (_) {}

      const { error: dbError } = await supabase.from('farms_submitted').insert({
        user_id: user.id,
        name: form.name.trim(), type: form.type, loc: form.loc.trim(),
        phone: form.phone.trim() || null, email: form.email.trim() || null,
        website: form.website.trim() || null, hours: form.hours.trim() || null,
        description: form.description.trim() || null,
        bio: form.bio, eshop: form.eshop, delivery: form.delivery,
        products: form.products.trim() ? form.products.split(',').map(p => p.trim()).filter(Boolean) : null,
        lat, lng, status: 'pending',
      });
      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  if (success) return (
    <div style={{ minHeight:'100vh', background: T.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, marginBottom:12 }}>Farma přijata!</h1>
        <p style={{ color:T.sub, lineHeight:1.8, marginBottom:32, fontSize:15 }}>
          Děkujeme za přidání <strong>{form.name}</strong>.<br/>
          Po ověření se zobrazí na mapě — obvykle do 24 hodin.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/mapa')} style={{ padding:'13px 28px', background:T.green, color:'white', border:'none', borderRadius:11, fontWeight:700, cursor:'pointer', fontSize:15, boxShadow:'0 4px 16px rgba(58,87,40,.25)' }}>
            🗺️ Zpět na mapu
          </button>
          <button onClick={() => { setSuccess(false); setStep(0); setForm({ name:'', type:'veggie', loc:'', phone:'', email:'', website:'', hours:'', description:'', products:'', bio:false, eshop:false, delivery:false }); }}
            style={{ padding:'13px 28px', background:T.card, color:T.green, border:`2px solid ${T.green}`, borderRadius:11, fontWeight:700, cursor:'pointer', fontSize:15 }}>
            + Přidat další farmu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background: T.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .fi { width:100%; padding:12px 15px; border:1.5px solid rgba(58,87,40,.18); border-radius:10px;
          font-size:14px; font-family:'DM Sans',sans-serif; outline:none; background:white; color:#1E120A; transition:border .2s,box-shadow .2s; }
        .fi:focus { border-color:#3A5728; box-shadow:0 0 0 3px rgba(58,87,40,.1); }
        .fi::placeholder { color:#bbb; }
        .fl { font-size:13px; font-weight:600; color:#444; margin-bottom:5px; display:block; }
        .fg { display:flex; flex-direction:column; gap:5px; }
        @media(max-width:600px){ .two-col { grid-template-columns:1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={{ background:'white', borderBottom:`1px solid ${T.border}`, padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/" style={{ textDecoration:'none' }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:T.text }}>
            <span style={{ color:T.green }}>Mapa</span>Farem<span style={{ color:T.green }}>.cz</span>
          </div>
        </Link>
        <Link to="/mapa" style={{ fontSize:13, color:T.sub, textDecoration:'none' }}>← Zpět na mapu</Link>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'40px 24px 60px' }}>

        {/* Title */}
        <div style={{ marginBottom:32, textAlign:'center' }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, color:T.text, marginBottom:8 }}>
            Přidat farmu na mapu
          </h1>
          <p style={{ color:T.sub, fontSize:14 }}>Zdarma · Zobrazí se po ověření · Tisíce zákazníků</p>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:0, marginBottom:36 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
              {i > 0 && <div style={{ position:'absolute', top:14, left:'-50%', right:'50%', height:2, background: i <= step ? T.green : '#E5E7EB' }} />}
              <div style={{
                width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700, zIndex:1,
                background: i < step ? T.green : i === step ? T.green : 'white',
                color: i <= step ? 'white' : '#bbb',
                border: i <= step ? 'none' : `2px solid #E5E7EB`,
                transition:'all .3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize:11, marginTop:5, color: i === step ? T.green : '#aaa', fontWeight: i === step ? 700 : 400, textAlign:'center' }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        {/* Login warning */}
        {!user && (
          <div style={{ background:'#FEF9C3', border:'1px solid #FDE047', borderRadius:12, padding:'14px 16px', marginBottom:24, fontSize:14 }}>
            ⚠️ Pro přidání farmy se musíš{' '}
            <Link to="/prihlaseni" style={{ color:T.green, fontWeight:700 }}>přihlásit</Link>.
          </div>
        )}

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); next(); }}>
          <div style={{ background:T.card, borderRadius:20, padding:32, boxShadow:'0 2px 20px rgba(0,0,0,.06)', border:`1px solid ${T.border}` }}>

            {/* STEP 0 — Základní info */}
            {step === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div className="fg">
                  <label className="fl">Název farmy *</label>
                  <input className="fi" type="text" placeholder="např. Biofarma Nováků" value={form.name}
                    onChange={e => set('name', e.target.value)} required maxLength={100} />
                </div>

                <div className="fg">
                  <label className="fl">Zaměření farmy *</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                    {TYPES.map(t => (
                      <div key={t.id} onClick={() => set('type', t.id)} style={{
                        padding:'12px 8px', borderRadius:12, border:`2px solid ${form.type===t.id ? T.green : T.border}`,
                        background: form.type===t.id ? '#f0f5ec' : 'white',
                        cursor:'pointer', textAlign:'center', transition:'all .15s',
                      }}>
                        <div style={{ fontSize:22 }}>{t.emoji}</div>
                        <div style={{ fontSize:10, fontWeight:700, marginTop:4, color: form.type===t.id ? T.green : '#555', lineHeight:1.2 }}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="fg">
                  <label className="fl">Adresa farmy *</label>
                  <input className="fi" type="text" placeholder="např. Nová Ves 42, Třebíč" value={form.loc}
                    onChange={e => set('loc', e.target.value)} required />
                  <span style={{ fontSize:11, color:'#aaa' }}>Použijeme pro zobrazení pinu na mapě</span>
                </div>
              </div>
            )}

            {/* STEP 1 — Kontakt */}
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div className="two-col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div className="fg">
                    <label className="fl">📞 Telefon</label>
                    <input className="fi" type="tel" placeholder="+420 123 456 789" value={form.phone}
                      onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="fg">
                    <label className="fl">✉️ Email</label>
                    <input className="fi" type="email" placeholder="farma@email.cz" value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </div>
                </div>

                <div className="fg">
                  <label className="fl">🌐 Web / e-shop</label>
                  <input className="fi" type="url" placeholder="https://mojefarma.cz" value={form.website}
                    onChange={e => set('website', e.target.value)} />
                </div>

                <div className="fg">
                  <label className="fl">🕐 Otevírací doba</label>
                  <input className="fi" type="text" placeholder="Po–Pá 8:00–17:00, So 8:00–12:00" value={form.hours}
                    onChange={e => set('hours', e.target.value)} />
                </div>

                <div style={{ display:'flex', gap:20, flexWrap:'wrap', padding:'16px 20px', background:'#F4EDD8', borderRadius:12 }}>
                  {[
                    { key:'bio', emoji:'🌱', label:'BIO certifikát' },
                    { key:'eshop', emoji:'🛒', label:'Máme e-shop' },
                    { key:'delivery', emoji:'🚚', label:'Nabízíme rozvoz' },
                  ].map(c => (
                    <label key={c.key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, fontWeight:500, userSelect:'none' }}>
                      <input type="checkbox" checked={form[c.key]} onChange={e => set(c.key, e.target.checked)}
                        style={{ width:16, height:16, accentColor:T.green, cursor:'pointer' }} />
                      {c.emoji} {c.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — Produkty & popis */}
            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div className="fg">
                  <label className="fl">Produkty (oddělené čárkou)</label>
                  <input className="fi" type="text" placeholder="např. Rajčata, Okurky, Jahody, Domácí džem" value={form.products}
                    onChange={e => set('products', e.target.value)} />
                  <span style={{ fontSize:11, color:'#aaa' }}>Zobrazí se jako tagy na detailu farmy</span>
                </div>

                <div className="fg">
                  <label className="fl">Popis farmy</label>
                  <textarea className="fi" rows={5} placeholder="Pár vět o vaší farmě — co pěstujete, jak nakupovat, co vás odlišuje..."
                    value={form.description} onChange={e => set('description', e.target.value)}
                    style={{ resize:'vertical', minHeight:120 }} />
                </div>

                {/* Shrnutí */}
                <div style={{ background:'#F0F5EC', borderRadius:14, padding:'16px 20px' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.green, marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>Shrnutí</div>
                  <div style={{ fontSize:13, color:'#444', display:'flex', flexDirection:'column', gap:5 }}>
                    <div><strong>Název:</strong> {form.name}</div>
                    <div><strong>Adresa:</strong> {form.loc}</div>
                    <div><strong>Typ:</strong> {TYPES.find(t=>t.id===form.type)?.emoji} {TYPES.find(t=>t.id===form.type)?.label}</div>
                    {form.phone && <div><strong>Telefon:</strong> {form.phone}</div>}
                    {form.website && <div><strong>Web:</strong> {form.website}</div>}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:9, padding:'10px 14px', fontSize:13, color:'#991B1B', marginTop:16 }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display:'flex', gap:12, marginTop:20, justifyContent:'space-between', alignItems:'center' }}>
            <div>
              {step > 0 && (
                <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
                  style={{ padding:'12px 22px', background:T.card, color:T.sub, border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  ← Zpět
                </button>
              )}
            </div>
            <button type="submit" disabled={loading || !user}
              style={{
                padding:'13px 32px', background: user ? T.green : '#ccc',
                color:'white', border:'none', borderRadius:11, fontSize:15, fontWeight:700,
                cursor: user ? 'pointer' : 'not-allowed',
                boxShadow: user ? '0 4px 16px rgba(58,87,40,.25)' : 'none',
                transition:'all .2s',
              }}>
              {loading ? '⏳ Ukládám...' : step < 2 ? `Dál: ${STEPS[step + 1]} →` : '✅ Přidat farmu na mapu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
