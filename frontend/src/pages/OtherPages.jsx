// frontend/src/pages/OtherPages.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuthStore, useCartStore, useFavoritesStore, useOrdersStore } from '../store/index.js';
import FARMS_DATA from '../data/farms.json';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// ── DASHBOARD (re-exports real DashboardPage) ───────────────────────────────
export { default } from './DashboardPage.jsx';

// ── CHECKOUT ──────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, removeItem, updateQty, clearCart, farmId } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useOrdersStore();
  const [delivery, setDelivery] = useState('pickup');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [payStep, setPayStep] = useState('summary'); // 'summary' | 'stripe'
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const farm = FARMS_DATA.find(f => String(f.id) === String(farmId));
  const finalTotal = total + (delivery === 'delivery' ? 79 : 0);

  // Fallback — confirm order without payment (used if Stripe not configured)
  const confirmOrderFallback = () => {
    if (!user) { navigate('/prihlaseni'); return; }
    const orderId = '#' + Math.floor(1000 + Math.random() * 9000);
    addOrder({ id: orderId, farm: farm?.name || 'Farma', farmId: String(farmId), total: finalTotal.toFixed(0) + ' Kč', status: 'PENDING', date: new Date().toISOString().slice(0, 10), deliveryType: delivery, items: items.map(i => i.product.emoji + ' ' + i.product.name) });
    clearCart();
    toast.success('✅ Objednávka odeslána!');
    navigate('/objednavky');
  };

  // Init Stripe Payment Intent via Supabase Edge Function
  const initStripePayment = async () => {
    if (!user) { navigate('/prihlaseni'); return; }
    const fnUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    if (!fnUrl || !stripePromise) { confirmOrderFallback(); return; }
    setStripeLoading(true);
    try {
      const res = await fetch(`${fnUrl}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal, farmName: farm?.name, orderId: '#' + Math.floor(1000 + Math.random() * 9000) }),
      });
      const data = await res.json();
      if (data.clientSecret) { setClientSecret(data.clientSecret); setPayStep('stripe'); }
      else { toast.error('Platba není dostupná. Objednávka odeslána bez platby.'); confirmOrderFallback(); }
    } catch { confirmOrderFallback(); }
    setStripeLoading(false);
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

  // Stripe payment step
  if (payStep === 'stripe' && clientSecret && stripePromise) return (
    <PageShell title="Platba kartou" onBack={() => setPayStep('summary')}>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#3A5728' } } }}>
        <StripePaymentForm
          total={finalTotal}
          farm={farm}
          delivery={delivery}
          items={items}
          farmId={farmId}
          addOrder={addOrder}
          clearCart={clearCart}
          navigate={navigate}
        />
      </Elements>
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
          <div style={{ borderTop:'2px solid #EDE5D0', marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16, marginBottom:16 }}>
            <span>Celkem</span><span style={{ color:'#3A5728' }}>{finalTotal.toFixed(0)} Kč</span>
          </div>
          {/* Pay with card (Stripe) */}
          <button onClick={initStripePayment} disabled={stripeLoading} style={{ width:'100%', padding:'13px', background:'#1E120A', color:'white', border:'none', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {stripeLoading ? '⏳ Načítám...' : '💳 Zaplatit kartou'}
          </button>
          {/* Fallback — order without payment */}
          <button onClick={confirmOrderFallback} style={{ width:'100%', padding:'11px', background:'#3A5728', color:'white', border:'none', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
            ✓ Objednat (platba při převzetí)
          </button>
          <p style={{ fontSize:11, color:'#aaa', textAlign:'center', marginTop:10, lineHeight:1.5 }}>Farmář bude ihned informován o objednávce.</p>
        </div>
      </div>
    </PageShell>
  );
}

// Stripe payment form component
function StripePaymentForm({ total, farm, delivery, items, farmId, addOrder, clearCart, navigate }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError('');
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message);
      setPaying(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      const orderId = '#' + Math.floor(1000 + Math.random() * 9000);
      addOrder({ id: orderId, farm: farm?.name || 'Farma', farmId: String(farmId), total: total.toFixed(0) + ' Kč', status: 'CONFIRMED', date: new Date().toISOString().slice(0, 10), deliveryType: delivery, items: items.map(i => i.product.emoji + ' ' + i.product.name), stripePaymentId: paymentIntent.id });
      clearCart();
      toast.success('✅ Platba proběhla úspěšně!');
      navigate('/objednavky');
    }
    setPaying(false);
  };

  return (
    <form onSubmit={handlePay} style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Platební údaje</div>
        <PaymentElement />
        {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, fontSize: 13 }}>{error}</div>}
      </div>
      <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: '#888' }}>Celková částka</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#3A5728' }}>{total.toFixed(0)} Kč</div>
        </div>
        <button type="submit" disabled={paying || !stripe} style={{ padding: '13px 28px', background: '#3A5728', color: 'white', border: 'none', borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          {paying ? '⏳ Zpracovávám...' : '✅ Zaplatit'}
        </button>
      </div>
    </form>
  );
}

// ── FAVORITES ─────────────────────────────────────────────────────────────
export function FavoritesPage() {
  const navigate = useNavigate();
  const { ids } = useFavoritesStore();
  const favorites = FARMS_DATA.filter(f => ids.includes(String(f.id)));

  if (favorites.length === 0) return (
    <PageShell title="❤️ Oblíbené farmy" onBack={() => navigate('/')}>
      <div style={{ textAlign:'center', padding:'60px 20px', color:'#888' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>❤️</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1E120A', marginBottom:6 }}>Žádné oblíbené farmy</div>
        <p style={{ fontSize:14, marginBottom:20 }}>Přidejte farmy do oblíbených kliknutím na srdíčko na detailu farmy</p>
        <button onClick={() => navigate('/mapa')} style={{ padding:'10px 24px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer' }}>Prozkoumat farmy</button>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="❤️ Oblíbené farmy" onBack={() => navigate('/')}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {favorites.map(farm => (
          <div key={farm.id} onClick={() => navigate(`/farma/${farm.id}`)}
            style={{ background:'white', borderRadius:12, padding:'16px 18px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', display:'flex', gap:14, alignItems:'center', transition:'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform=''}>
            <div style={{ fontSize:40, flexShrink:0 }}>{farm.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{farm.name}</div>
              <div style={{ fontSize:13, color:'#888' }}>📍 {farm.loc}</div>
              <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                {farm.bio && <span style={{ fontSize:11, background:'#FFF3CD', color:'#856404', borderRadius:50, padding:'2px 8px', fontWeight:600 }}>🌱 BIO</span>}
                {farm.delivery && <span style={{ fontSize:11, background:'#E3F2FD', color:'#1565C0', borderRadius:50, padding:'2px 8px', fontWeight:600 }}>🚚 Dovoz</span>}
                {farm.eshop && <span style={{ fontSize:11, background:'#E8F0E4', color:'#3A5728', borderRadius:50, padding:'2px 8px', fontWeight:600 }}>🛒 E-shop</span>}
              </div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ color:'#E6A817', fontSize:14 }}>{'★'.repeat(Math.round(farm.rating))}</div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{farm.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── ORDERS ────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const navigate = useNavigate();
  const { orders } = useOrdersStore();

  if (orders.length === 0) return (
    <PageShell title="📦 Moje objednávky" onBack={() => navigate('/')}>
      <div style={{ textAlign:'center', padding:'60px 20px', color:'#888' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1E120A', marginBottom:6 }}>Žádné objednávky</div>
        <p style={{ fontSize:14, marginBottom:20 }}>Vaše objednávky se zobrazí zde</p>
        <button onClick={() => navigate('/mapa')} style={{ padding:'10px 24px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer' }}>Prozkoumat farmy</button>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="📦 Moje objednávky" onBack={() => navigate('/')}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {orders.map(o => (
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

// ── PROFILE ───────────────────────────────────────────────────────────────
export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { ids: favIds } = useFavoritesStore();
  const { orders } = useOrdersStore();

  if (!user) return (
    <PageShell title="👤 Profil" onBack={() => navigate('/')}>
      <div style={{ textAlign:'center', padding:'60px 20px', color:'#888' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>👤</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1E120A', marginBottom:6 }}>Nejste přihlášeni</div>
        <button onClick={() => navigate('/prihlaseni')} style={{ padding:'10px 24px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer' }}>Přihlásit se</button>
      </div>
    </PageShell>
  );

  return (
    <PageShell title="👤 Profil" onBack={() => navigate('/')}>
      {/* Avatar + info */}
      <div style={{ background:'white', borderRadius:16, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:16, display:'flex', gap:18, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#3A5728,#7DB05A)', display:'grid', placeItems:'center', fontWeight:700, color:'white', fontSize:24, flexShrink:0 }}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700 }}>{user?.name || 'Uživatel'}</div>
          <div style={{ fontSize:13, color:'#888', marginTop:2 }}>{user?.email}</div>
          <span style={{ fontSize:11, background:'#E8F0E4', color:'#3A5728', borderRadius:50, padding:'3px 10px', marginTop:6, display:'inline-block', fontWeight:700 }}>
            {user?.role === 'FARMER' ? '🌾 Farmář' : '🛒 Zákazník'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div onClick={() => navigate('/oblibene')} style={{ background:'white', borderRadius:12, padding:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', textAlign:'center', transition:'transform .15s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform=''}>
          <div style={{ fontSize:32, marginBottom:4 }}>❤️</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#C0392B' }}>{favIds.length}</div>
          <div style={{ fontSize:13, color:'#888' }}>Oblíbených farem</div>
        </div>
        <div onClick={() => navigate('/objednavky')} style={{ background:'white', borderRadius:12, padding:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer', textAlign:'center', transition:'transform .15s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform=''}>
          <div style={{ fontSize:32, marginBottom:4 }}>📦</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#2980B9' }}>{orders.length}</div>
          <div style={{ fontSize:13, color:'#888' }}>Objednávek</div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ background:'white', borderRadius:12, padding:'8px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:16 }}>
        {[
          ['❤️ Oblíbené farmy', '/oblibene'],
          ['📦 Moje objednávky', '/objednavky'],
          ['🗺️ Otevřít mapu', '/mapa'],
          ['+ Přidat farmu', '/pridat-farmu'],
          ...(user?.role === 'FARMER' ? [['🌾 Dashboard farmáře', '/dashboard']] : []),
        ].map(([label, path]) => (
          <div key={path} onClick={() => navigate(path)}
            style={{ padding:'13px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14, fontWeight:500, borderRadius:8, transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#F4EDD8'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            {label}
            <span style={{ color:'#aaa', fontSize:16 }}>›</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={async () => { await logout(); navigate('/'); }}
        style={{ width:'100%', padding:'12px', background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
        🚪 Odhlásit se
      </button>
    </PageShell>
  );
}

// ── NOT FOUND ─────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(150deg,#1E2D15 0%,#2d4420 50%,#3A5728 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes float404{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      `}</style>
      <div style={{ position:'absolute',top:-100,right:-100,width:400,height:400,borderRadius:'50%',border:'1px solid rgba(125,176,90,.12)',pointerEvents:'none' }} />
      <div style={{ position:'absolute',bottom:-60,left:-60,width:280,height:280,borderRadius:'50%',border:'1px solid rgba(201,155,48,.1)',pointerEvents:'none' }} />
      <div style={{ textAlign:'center', maxWidth:500, position:'relative' }}>
        <div style={{ animation:'float404 3.5s ease-in-out infinite', marginBottom:24 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:140, fontWeight:900, color:'rgba(255,255,255,.06)', lineHeight:1, letterSpacing:-4 }}>404</div>
          <div style={{ fontSize:72, marginTop:-60 }}>🌾</div>
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, color:'white', marginBottom:12 }}>
          Tato stránka utekla na pole
        </h1>
        <p style={{ color:'rgba(255,255,255,.6)', fontSize:15, lineHeight:1.7, marginBottom:36 }}>
          Stránka neexistuje nebo byla přesunuta.<br/>Ale farmy na mapě tě čekají!
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/')}
            style={{ padding:'13px 26px', background:'rgba(255,255,255,.1)', color:'white', border:'1px solid rgba(255,255,255,.25)', borderRadius:11, fontWeight:700, cursor:'pointer', fontSize:14 }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}>
            ← Domů
          </button>
          <button onClick={() => navigate('/mapa')}
            style={{ padding:'13px 26px', background:'#7DB05A', color:'white', border:'none', borderRadius:11, fontWeight:700, cursor:'pointer', fontSize:14, boxShadow:'0 4px 16px rgba(125,176,90,.35)' }}
            onMouseEnter={e=>e.currentTarget.style.background='#6a9e4c'}
            onMouseLeave={e=>e.currentTarget.style.background='#7DB05A'}>
            🗺️ Otevřít mapu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SHARED HELPERS ─────────────────────────────────────────────────────────

function PageShell({ title, children, onBack }) {
  return (
    <div style={{ minHeight:'100vh', background:'#F4EDD8', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <header style={{ background:'#1E120A', padding:'12px 20px', display:'flex', alignItems:'center', gap:14 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#B8A882', cursor:'pointer', fontSize:20, padding:4, lineHeight:1 }}>←</button>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#F4EDD8' }}>{title}</span>
        <span onClick={() => window.location.href='/'} style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:900, color:'#F4EDD8', marginLeft:'auto', cursor:'pointer' }}><span style={{ color:'#7DB05A' }}>Mapa</span>Farem<span style={{ color:'#7DB05A' }}>.cz</span></span>
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
