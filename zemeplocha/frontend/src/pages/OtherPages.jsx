// frontend/src/pages/DashboardPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const stats = [
    { label:'Celkem objednávek', value:28, icon:'📦', color:'#2980B9' },
    { label:'Čeká na potvrzení', value:3, icon:'⏳', color:'#C99B30' },
    { label:'Celkové tržby', value:'14 850 Kč', icon:'💰', color:'#3A5728' },
    { label:'Oblíbení zákazníci', value:47, icon:'❤️', color:'#C0392B' },
  ];

  return (
    <PageShell title="Dashboard farmáře" onBack={() => navigate('/')}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, marginBottom:4 }}>
          Vítejte, {user?.name} 👋
        </h2>
        <p style={{ color:'#888', fontSize:14 }}>Přehled vaší farmy za posledních 30 dní</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:13, color:'#888', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:16 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Rychlé akce</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[['🌿 Přidat produkt','#3A5728'],['📅 Sezónní nabídka','#C99B30'],['📦 Zobrazit objednávky','#2980B9'],['✏️ Upravit profil farmy','#5F8050']].map(([label, color]) => (
            <button key={label} style={{ padding:'9px 18px', background:color, color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Poslední objednávky</div>
        {[
          { id:'#1024', customer:'Jana N.', total:'320 Kč', status:'PENDING', items:'Mléko, Máslo' },
          { id:'#1023', customer:'Pavel D.', total:'850 Kč', status:'CONFIRMED', items:'Hovězí 2kg' },
          { id:'#1022', customer:'Kateřina S.', total:'125 Kč', status:'DELIVERED', items:'Med 500g' },
        ].map(o => (
          <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #EDE5D0' }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{o.id} — {o.customer}</div>
              <div style={{ fontSize:12, color:'#888' }}>{o.items}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontWeight:700 }}>{o.total}</div>
              <StatusBadge status={o.status} />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── CHECKOUT ──────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, removeItem, updateQty, clearCart, farmId } = require('../store/index.js').useCartStore();
  const { user } = useAuthStore();
  const [delivery, setDelivery] = useState('pickup');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    alert('✅ Objednávka odeslána!\n\nV produkční verzi by bylo zpracování přes Stripe.\nFarmář bude notifikován.');
    clearCart();
    navigate('/objednavky');
  };

  if (items.length === 0) return (
    <PageShell title="Košík" onBack={() => navigate(-1)}>
      <div style={{ textAlign:'center', padding:'60px 20px' }}>
        <div style={{ fontSize:48 }}>🛒</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, margin:'12px 0 6px' }}>Košík je prázdný</div>
        <p style={{ color:'#888', fontSize:14, marginBottom:20 }}>Přidejte produkty z vaší oblíbené farmy</p>
        <button onClick={() => navigate('/')} style={{ padding:'10px 24px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer' }}>Prozkoumat farmy</button>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="Pokladna" onBack={() => navigate(-1)}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>
        <div>
          {/* Cart items */}
          <div style={{ background:'white', borderRadius:12, padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Položky ({items.length})</div>
            {items.map(({ product, quantity }) => (
              <div key={product.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom:'1px solid #EDE5D0' }}>
                <div style={{ fontSize:32 }}>{product.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{product.name}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{product.price} Kč/{product.unit}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={() => updateQty(product.id, quantity-1)} style={{ width:28, height:28, borderRadius:50, border:'1px solid #ddd', background:'white', cursor:'pointer', fontSize:16 }}>−</button>
                  <span style={{ fontWeight:700, minWidth:20, textAlign:'center' }}>{quantity}</span>
                  <button onClick={() => updateQty(product.id, quantity+1)} style={{ width:28, height:28, borderRadius:50, border:'1px solid #ddd', background:'white', cursor:'pointer', fontSize:16 }}>+</button>
                </div>
                <div style={{ fontWeight:700, minWidth:60, textAlign:'right' }}>{(product.price*quantity).toFixed(0)} Kč</div>
                <button onClick={() => removeItem(product.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:16 }}>✕</button>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <div style={{ background:'white', borderRadius:12, padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Způsob doručení</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[['pickup','🏪 Osobní odběr','Vyzvednu na farmě, zdarma'],['delivery','🚚 Doručení domů','+ 79 Kč k objednávce']].map(([val, label, sub]) => (
                <div key={val} onClick={() => setDelivery(val)} style={{ padding:'12px', borderRadius:10, border:`2px solid ${delivery===val?'#3A5728':'#EDE5D0'}`, background: delivery===val ? '#E8F0E4' : 'white', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{label}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{sub}</div>
                </div>
              ))}
            </div>
            {delivery === 'delivery' && (
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Doručovací adresa"
                style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid #EDE5D0', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none', marginBottom:10 }} />
            )}
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Poznámka k objednávce (volitelné)"
              style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid #EDE5D0', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none', resize:'vertical', minHeight:60 }} />
          </div>
        </div>

        {/* Summary */}
        <div style={{ background:'white', borderRadius:12, padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', position:'sticky', top:20 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Shrnutí</div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}>
            <span>Produkty</span><span>{total.toFixed(0)} Kč</span>
          </div>
          {delivery === 'delivery' && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}><span>Doprava</span><span>79 Kč</span></div>}
          <div style={{ borderTop:'2px solid #EDE5D0', marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16 }}>
            <span>Celkem</span><span style={{ color:'#3A5728' }}>{(total + (delivery==='delivery' ? 79 : 0)).toFixed(0)} Kč</span>
          </div>
          <button onClick={handleOrder} style={{ width:'100%', marginTop:16, padding:'12px', background:'#3A5728', color:'white', border:'none', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer' }}>
            ✓ Odeslat objednávku
          </button>
          <p style={{ fontSize:11, color:'#aaa', textAlign:'center', marginTop:10, lineHeight:1.5 }}>Platba je zpracována přes Stripe. Farmář bude ihned notifikován.</p>
        </div>
      </div>
    </PageShell>
  );
}

// ── FAVORITES ─────────────────────────────────────────────────────────────
export function FavoritesPage() {
  const navigate = useNavigate();
  return (
    <PageShell title="❤️ Oblíbené farmy" onBack={() => navigate('/')}>
      <div style={{ textAlign:'center', padding:'60px 20px', color:'#888' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>❤️</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1E120A', marginBottom:6 }}>Žádné oblíbené farmy</div>
        <p style={{ fontSize:14, marginBottom:20 }}>Přidejte farmy do oblíbených kliknutím na srdíčko na detailu farmy</p>
        <button onClick={() => navigate('/')} style={{ padding:'10px 24px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer' }}>Prozkoumat farmy</button>
      </div>
    </PageShell>
  );
}

// ── ORDERS ────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const navigate = useNavigate();
  const demoOrders = [
    { id:'#1022', farm:'Biofarma Šimánek', total:'320 Kč', status:'DELIVERED', date:'2026-02-20', items:['🥕 Mrkev', '🥛 Mléko'] },
    { id:'#1015', farm:'Včelí farma Kratochvíl', total:'280 Kč', status:'DELIVERED', date:'2026-01-15', items:['🍯 Med 500g'] },
  ];

  return (
    <PageShell title="📦 Moje objednávky" onBack={() => navigate('/')}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {demoOrders.map(o => (
          <div key={o.id} style={{ background:'white', borderRadius:12, padding:'16px 18px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{o.id}</div>
                <div style={{ fontSize:13, color:'#888' }}>{o.farm} · {o.date}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700 }}>{o.total}</div>
                <StatusBadge status={o.status} />
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {o.items.map(i => <span key={i} style={{ fontSize:12, background:'#EDE5D0', padding:'2px 8px', borderRadius:6 }}>{i}</span>)}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── REGISTER FARM ─────────────────────────────────────────────────────────
export function RegisterFarmPage() {
  const navigate = useNavigate();
  return (
    <PageShell title="🌾 Registrovat farmu" onBack={() => navigate('/')}>
      <div style={{ background:'white', borderRadius:12, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <p style={{ color:'#888', fontSize:14, marginBottom:20 }}>Zaregistrujte svou farmu a začněte prodávat přímo zákazníkům.</p>
        {[['Název farmy','text','Např. Biofarma Novák'],['Adresa','text','Ulice, město, PSČ'],['Telefon','tel','+420 xxx xxx xxx'],['E-mail farmy','email','farma@email.cz'],['Webové stránky','url','https://mojefarma.cz']].map(([label, type, ph]) => (
          <div key={label} style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>{label}</label>
            <input type={type} placeholder={ph} style={{ width:'100%', padding:'10px 14px', borderRadius:9, border:'1.5px solid #EDE5D0', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none' }} />
          </div>
        ))}
        <button style={{ width:'100%', padding:'12px', background:'#3A5728', color:'white', border:'none', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', marginTop:8 }}>
          Registrovat farmu
        </button>
      </div>
    </PageShell>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────
export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  return (
    <PageShell title="👤 Profil" onBack={() => navigate('/')}>
      <div style={{ background:'white', borderRadius:12, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:16 }}>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'#3A5728', display:'grid', placeItems:'center', fontWeight:700, color:'white', fontSize:22 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'#888' }}>{user?.email}</div>
            <div style={{ fontSize:11, background:'#E8F0E4', color:'#3A5728', borderRadius:50, padding:'2px 8px', marginTop:4, display:'inline-block', fontWeight:700 }}>
              {user?.role === 'FARMER' ? '🌾 Farmář' : '🛒 Zákazník'}
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} style={{ padding:'9px 20px', background:'#F8D7DA', color:'#721C24', border:'none', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
          🚪 Odhlásit se
        </button>
      </div>
    </PageShell>
  );
}

// ── NOT FOUND ─────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', fontFamily:"'DM Sans',sans-serif", background:'#F4EDD8' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:64 }}>🌾</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, marginTop:16 }}>404 — Stránka nenalezena</h1>
        <p style={{ color:'#888', marginTop:8, marginBottom:24 }}>Tato stránka zřejmě utekla na pole.</p>
        <button onClick={() => navigate('/')} style={{ padding:'11px 28px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer' }}>Zpět na mapu</button>
      </div>
    </div>
  );
}

// ── SHARED HELPERS ─────────────────────────────────────────────────────────
import { useState } from 'react';
import { useAuthStore } from '../store/index.js';

function PageShell({ title, children, onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:'#F4EDD8', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <header style={{ background:'#1E120A', padding:'12px 20px', display:'flex', alignItems:'center', gap:14 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#B8A882', cursor:'pointer', fontSize:20, padding:4, lineHeight:1 }}>←</button>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#F4EDD8' }}>{title}</span>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:900, color:'#F4EDD8', marginLeft:'auto', cursor:'pointer' }}>Zem<span style={{ color:'#7DB05A' }}>ě</span>plocha</span>
      </header>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 20px' }}>{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { PENDING:['⏳ Čeká','#FFF3CD','#856404'], CONFIRMED:['✓ Potvrzena','#D4EDDA','#155724'], PREPARING:['🔧 Připravuje se','#D1ECF1','#0C5460'], READY:['📦 Připravena','#E8F0E4','#3A5728'], DELIVERED:['✅ Doručena','#D4EDDA','#155724'], CANCELLED:['✗ Zrušena','#F8D7DA','#721C24'] };
  const [label, bg, color] = map[status] || map.PENDING;
  return <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:50, background:bg, color }}>{label}</span>;
}
