// frontend/src/pages/RegisterFarmPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const TYPES = [
  { id:'veggie', label:'🥕 Zelenina & ovoce' },
  { id:'bio',    label:'🌱 BIO' },
  { id:'meat',   label:'🥩 Maso & uzeniny' },
  { id:'dairy',  label:'🥛 Mléčné výrobky' },
  { id:'honey',  label:'🍯 Med & včely' },
  { id:'wine',   label:'🍷 Víno & nápoje' },
  { id:'herbs',  label:'🌿 Bylinky & kosmetika' },
  { id:'market', label:'🏪 Farmářský trh' },
  { id:'agroturistika', label:'🏡 Agroturistika' },
];

export default function RegisterFarmPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'veggie', loc: '', phone: '', email: '',
    website: '', hours: '', description: '', products: '', bio: false, eshop: false, delivery: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      if (!user) throw new Error('Pro přidání farmy se musíš přihlásit.');
      if (!form.name.trim()) throw new Error('Zadej název farmy.');
      if (!form.loc.trim()) throw new Error('Zadej adresu farmy.');

      // Geocoding přes Nominatim
      let lat = null, lng = null;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.loc + ', Česká republika')}&format=json&limit=1&countrycodes=cz`);
        const data = await res.json();
        if (data.length > 0) { lat = parseFloat(data[0].lat); lng = parseFloat(data[0].lon); }
      } catch (e) {}

      const { error: dbError } = await supabase.from('farms_submitted').insert({
        user_id: user.id,
        name: form.name.trim(),
        type: form.type,
        loc: form.loc.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        hours: form.hours.trim() || null,
        description: form.description.trim() || null,
        bio: form.bio,
        eshop: form.eshop,
        delivery: form.delivery,
        products: form.products.trim() ? form.products.split(',').map(p => p.trim()).filter(Boolean) : null,
        lat, lng,
        status: 'pending',
      });

      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const T = { bg:'#FAFAF7', green:'#3A5728', border:'rgba(58,87,40,0.2)', text:'#1E120A', sub:'#666' };

  if (success) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, marginBottom:12 }}>Farma přijata!</h1>
        <p style={{ color:T.sub, lineHeight:1.7, marginBottom:24 }}>
          Děkujeme za přidání farmy <strong>{form.name}</strong>. Po ověření se zobrazí na mapě.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/mapa')} style={{ padding:'12px 24px', background:T.green, color:'white', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:15 }}>
            🗺️ Zpět na mapu
          </button>
          <button onClick={() => { setSuccess(false); setForm({ name:'', type:'veggie', loc:'', phone:'', email:'', website:'', hours:'', description:'', products:'', bio:false, eshop:false, delivery:false }); }}
            style={{ padding:'12px 24px', background:'white', color:T.green, border:`2px solid ${T.green}`, borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:15 }}>
            + Přidat další
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:T.bg, padding:'24px 16px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        * { box-sizing:border-box; }
        .fi { width:100%; padding:11px 14px; border:1.5px solid rgba(58,87,40,0.2); border-radius:10px;
          font-size:14px; font-family:'DM Sans',sans-serif; outline:none; background:white; color:#1E120A; transition:border 0.2s; }
        .fi:focus { border-color:#3A5728; box-shadow:0 0 0 3px rgba(58,87,40,0.1); }
        .fl { font-size:13px; font-weight:600; color:#444; margin-bottom:5px; display:block; }
        .fg { display:flex; flex-direction:column; gap:4px; }
        .cb { display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; }
        .cb input { width:16px; height:16px; accent-color:#3A5728; cursor:pointer; }
      `}</style>

      <div style={{ maxWidth:600, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <Link to="/mapa" style={{ color:T.green, textDecoration:'none', fontSize:13, fontWeight:600 }}>← Zpět na mapu</Link>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, margin:'12px 0 4px', color:T.text }}>
            Přidat farmu
          </h1>
          <p style={{ color:T.sub, fontSize:14 }}>Přidej svou farmu na mapu zdarma. Po ověření se zobrazí všem návštěvníkům.</p>
        </div>

        {/* Login warning */}
        {!user && (
          <div style={{ background:'#FEF9C3', border:'1px solid #FDE047', borderRadius:12, padding:'14px 16px', marginBottom:20, fontSize:14 }}>
            ⚠️ Pro přidání farmy se musíš{' '}
            <Link to="/prihlaseni" style={{ color:T.green, fontWeight:700 }}>přihlásit</Link>.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 2px 20px rgba(0,0,0,0.06)', border:`1px solid ${T.border}`, display:'flex', flexDirection:'column', gap:18 }}>

            {/* Název */}
            <div className="fg">
              <label className="fl">Název farmy *</label>
              <input className="fi" type="text" placeholder="např. Biofarma Nováků" value={form.name}
                onChange={e => set('name', e.target.value)} required maxLength={100}/>
            </div>

            {/* Typ */}
            <div className="fg">
              <label className="fl">Zaměření farmy *</label>
              <select className="fi" value={form.type} onChange={e => set('type', e.target.value)}>
                {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Adresa */}
            <div className="fg">
              <label className="fl">Adresa *</label>
              <input className="fi" type="text" placeholder="např. Nová Ves 42, Třebíč" value={form.loc}
                onChange={e => set('loc', e.target.value)} required/>
              <span style={{ fontSize:11, color:T.sub }}>Adresa se použije pro zobrazení na mapě</span>
            </div>

            {/* Kontakty */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="fg">
                <label className="fl">Telefon</label>
                <input className="fi" type="tel" placeholder="+420 123 456 789" value={form.phone}
                  onChange={e => set('phone', e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Email</label>
                <input className="fi" type="email" placeholder="farma@email.cz" value={form.email}
                  onChange={e => set('email', e.target.value)}/>
              </div>
            </div>

            {/* Web + hodiny */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="fg">
                <label className="fl">Web / e-shop</label>
                <input className="fi" type="url" placeholder="https://mojefarma.cz" value={form.website}
                  onChange={e => set('website', e.target.value)}/>
              </div>
              <div className="fg">
                <label className="fl">Otevírací doba</label>
                <input className="fi" type="text" placeholder="Po-Pá 8-17, So 8-12" value={form.hours}
                  onChange={e => set('hours', e.target.value)}/>
              </div>
            </div>

            {/* Produkty */}
            <div className="fg">
              <label className="fl">Produkty (oddělené čárkou)</label>
              <input className="fi" type="text" placeholder="např. Rajčata, Okurky, Jahody, Domácí džem"
                value={form.products} onChange={e => set('products', e.target.value)}/>
              <span style={{ fontSize:11, color:T.sub }}>Co nabízíte — zobrazí se na detailu farmy</span>
            </div>

            {/* Popis */}
            <div className="fg">
              <label className="fl">Popis farmy</label>
              <textarea className="fi" rows={3} placeholder="Pár vět o vaší farmě, co produkujete, jak nakupovat..."
                value={form.description} onChange={e => set('description', e.target.value)}
                style={{ resize:'vertical', minHeight:80 }}/>
            </div>

            {/* Checkboxy */}
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              <label className="cb">
                <input type="checkbox" checked={form.bio} onChange={e => set('bio', e.target.checked)}/>
                🌱 BIO certifikát
              </label>
              <label className="cb">
                <input type="checkbox" checked={form.eshop} onChange={e => set('eshop', e.target.checked)}/>
                🛒 Máme e-shop
              </label>
              <label className="cb">
                <input type="checkbox" checked={form.delivery} onChange={e => set('delivery', e.target.checked)}/>
                🚚 Nabízíme rozvoz
              </label>
            </div>

            {error && (
              <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#991B1B' }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading || !user}
              style={{ padding:'14px', background: user ? T.green : '#ccc', color:'white', border:'none', borderRadius:12,
                fontSize:16, fontWeight:700, cursor: user ? 'pointer' : 'not-allowed',
                boxShadow: user ? '0 4px 16px rgba(58,87,40,0.25)' : 'none',
                transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }}>
              {loading ? '⏳ Ukládám...' : '✅ Přidat farmu na mapu'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
