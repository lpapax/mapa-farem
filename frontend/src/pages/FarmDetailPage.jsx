// frontend/src/pages/FarmDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, MapPin, Clock, Phone, Globe, Truck, Store, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useCartStore, useFavoritesStore } from '../store/index.js';
import FARMS_DATA from '../data/farms.json';

const COLORS = { bio:'#C99B30', veggie:'#3A5728', meat:'#9B2226', dairy:'#2980B9', honey:'#D4A017', wine:'#7D3C98', herbs:'#5F8050', market:'#5D4037' };

export default function FarmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem, farmId: cartFarm } = useCartStore();
  const { toggle: toggleFavorite, has: isFavorited } = useFavoritesStore();
  const [tab, setTab] = useState('products');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Find farm in local data (in production this would be API call)
  const farm = FARMS_DATA.find(f => String(f.id) === String(id));

  useEffect(() => {
    window.scrollTo(0, 0);
    if (farm) document.title = `${farm.name} — MapaFarem.cz`;
    return () => { document.title = 'MapaFarem.cz — Lokální farmy v České republice'; };
  }, [id, farm]);

  if (!farm) return (
    <div style={{ display:'grid', placeItems:'center', height:'100vh', fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48 }}>😕</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, marginTop:12 }}>Farma nenalezena</div>
        <button onClick={() => navigate('/')} style={{ marginTop:16, padding:'10px 24px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer' }}>← Zpět na mapu</button>
      </div>
    </div>
  );

  const color = COLORS[farm.type] || '#5F8050';

  // Deterministic hash so prices never change between renders / page visits
  const hash = (s) => String(s).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const basePrices = { bio:85, veggie:45, meat:180, dairy:55, honey:120, wine:250, herbs:65, market:40 };
  const basePrice = basePrices[farm.type] || 60;

  const demoProducts = farm.products?.map((p, i) => ({
    id: `${farm.id}-prod-${i}`,
    name: p.replace(/[^\w\sáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/gu, '').trim(),
    emoji: p.match(/\p{Emoji}/u)?.[0] || '🌿',
    price: Math.round(basePrice * (0.5 + (hash(String(farm.id) + i) % 100) / 100)),
    unit: ['kg','l','ks','balení'][i % 4],
    stock: 5 + (hash(String(farm.id) + i + 'stock') % 45),
    farmId: String(farm.id),
  }));

  const demoReviews = [
    { id:1, user:{name:'Jana Nováková',avatar:null}, rating:5, text:'Skvělé produkty, vždy čerstvé a kvalitní. Doporučuji všem!', createdAt:'2026-02-15' },
    { id:2, user:{name:'Pavel Dvořák',avatar:null}, rating:4, text:'Výborná farma, příjemný personál. Mléčné výrobky jsou vynikající.', createdAt:'2026-01-28' },
    { id:3, user:{name:'Kateřina Svobodová',avatar:null}, rating:5, text:'Nejlepší med co jsem kdy ochutnal. Určitě se vrátím.', createdAt:'2026-01-10' },
  ];

  const demoSeasonal = [
    { id:1, emoji:'🍓', title:'Čerstvé jahody', description:'Právě sklizené, limitované množství', validTo: new Date(Date.now() + 14*24*3600*1000).toISOString(), discount:10 },
    { id:2, emoji:'🌿', title:'Jarní bylinky', description:'Nová sklizeň pažitky, kopru a petrželky', validTo: new Date(Date.now() + 30*24*3600*1000).toISOString() },
  ];

  const avgRating = (demoReviews.reduce((s, r) => s + r.rating, 0) / demoReviews.length).toFixed(1);

  const handleAddToCart = (product) => {
    if (!user) { toast.error('Pro objednání se přihlaste'); navigate('/prihlaseni'); return; }
    addItem(product, String(farm.id));
    toast.success(`${product.emoji} ${product.name} přidáno do košíku`);
  };

  const handleFavorite = () => {
    if (!user) { toast.error('Pro ukládání se přihlaste'); navigate('/prihlaseni'); return; }
    const wasFav = isFavorited(farm.id);
    toggleFavorite(farm.id);
    toast.success(wasFav ? 'Odebráno z oblíbených' : '❤️ Přidáno do oblíbených');
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Pro hodnocení se přihlaste'); return; }
    toast.success('⭐ Hodnocení odesláno!');
    setReviewText('');
  };

  const TABS = ['products','seasonal','reviews','info'];
  const TAB_LABELS = { products:'Produkty', seasonal:'Sezónní nabídka', reviews:'Recenze', info:'O farmě' };

  return (
    <div style={{ minHeight:'100vh', background:'#F4EDD8', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${color}ee, ${color}88)`, padding:'0 0 0 0', position:'relative', overflow:'hidden' }}>
        {/* Back + actions */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px' }}>
          <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:50, padding:'7px 14px', color:'white', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13 }}>
            <ArrowLeft size={14} /> Zpět
          </button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleFavorite} style={{ background: isFavorited(farm.id) ? '#C0392B' : 'rgba(255,255,255,0.2)', border:'none', borderRadius:50, padding:'7px 12px', color:'white', cursor:'pointer', fontSize:14 }}>
              {isFavorited(farm.id) ? '❤️' : '🤍'}
            </button>
            <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(farm.name+' '+farm.loc)}`, '_blank')}
              style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:50, padding:'7px 12px', color:'white', cursor:'pointer', fontSize:14 }}>
              🗺
            </button>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ padding:'0 24px 28px', display:'flex', gap:20, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div style={{ fontSize:72, lineHeight:1 }}>{farm.emoji}</div>
          <div style={{ flex:1, color:'white' }}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
              {farm.bio && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.25)', borderRadius:50, padding:'2px 10px' }}>🌱 BIO</span>}
              {farm.open ? <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.25)', borderRadius:50, padding:'2px 10px' }}>✓ Otevřeno</span>
                         : <span style={{ fontSize:11, fontWeight:700, background:'rgba(0,0,0,0.2)', borderRadius:50, padding:'2px 10px' }}>✗ Zavřeno</span>}
              {farm.delivery && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.25)', borderRadius:50, padding:'2px 10px' }}>🚚 Dovoz</span>}
              {farm.eshop && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.25)', borderRadius:50, padding:'2px 10px' }}>🛒 E-shop</span>}
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(22px,4vw,32px)', fontWeight:900, marginBottom:4 }}>{farm.name}</h1>
            <div style={{ fontSize:14, opacity:.9 }}>📍 {farm.loc}</div>
            <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ fontSize:16, color:'#F39C12' }}>{'★'.repeat(Math.round(farm.rating))}</span>
                <span style={{ fontWeight:700, fontSize:16 }}>{avgRating}</span>
                <span style={{ opacity:.7, fontSize:13 }}>({demoReviews.length} recenzí)</span>
              </div>
              {farm.hectares && <span style={{ opacity:.8, fontSize:13 }}>🌾 {farm.hectares} ha</span>}
              {farm.founded && <span style={{ opacity:.8, fontSize:13 }}>📅 Zal. {farm.founded}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick info strip */}
      <div style={{ background:'white', padding:'12px 24px', display:'flex', gap:20, overflowX:'auto', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', scrollbarWidth:'none' }}>
        {[
          farm.hours && ['🕐', farm.hours],
          farm.phone && ['📞', farm.phone],
          ['📏', farm.dist + ' od vás'],
        ].filter(Boolean).map(([icon, val]) => (
          <div key={val} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#555', whiteSpace:'nowrap', flexShrink:0 }}>
            <span>{icon}</span><span>{val}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background:'white', borderBottom:'2px solid #EDE5D0', display:'flex', padding:'0 24px', gap:0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'12px 18px', border:'none', background:'none',
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight: tab===t ? 700 : 500,
            color: tab===t ? color : '#888', cursor:'pointer',
            borderBottom: tab===t ? `2.5px solid ${color}` : '2.5px solid transparent',
            marginBottom:-2, transition:'all 0.15s',
          }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 20px' }}>

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
              {demoProducts?.map(p => (
                <div key={p.id} style={{ background:'white', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'; }}>
                  <div style={{ height:90, background:`linear-gradient(135deg,${color}22,${color}11)`, display:'grid', placeItems:'center', fontSize:40 }}>{p.emoji}</div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'#888', marginBottom:10 }}>Skladem: {p.stock} {p.unit}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:color }}>{p.price.toFixed(0)}</span>
                        <span style={{ fontSize:12, color:'#888' }}> Kč/{p.unit}</span>
                      </div>
                      <button onClick={() => handleAddToCart(p)} style={{ padding:'6px 12px', background:color, color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                        <ShoppingCart size={12} /> Přidat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEASONAL */}
        {tab === 'seasonal' && (
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, marginBottom:16 }}>Sezónní nabídka 🌱</div>
            <div style={{ display:'grid', gap:12 }}>
              {demoSeasonal.map(offer => (
                <div key={offer.id} style={{ background:'white', borderRadius:12, padding:'16px 18px', display:'flex', gap:14, alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize:40, flexShrink:0 }}>{offer.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{offer.title}</div>
                    <div style={{ fontSize:13, color:'#666', marginBottom:6 }}>{offer.description}</div>
                    <div style={{ fontSize:12, color:'#888' }}>Platí do: {new Date(offer.validTo).toLocaleDateString('cs-CZ')}</div>
                  </div>
                  {offer.discount && (
                    <div style={{ background:'#C99B30', color:'white', borderRadius:8, padding:'6px 12px', fontWeight:700, fontSize:14, flexShrink:0 }}>
                      -{offer.discount}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div>
            {/* Summary */}
            <div style={{ background:'white', borderRadius:12, padding:'20px', marginBottom:20, display:'flex', gap:24, alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:900, color:color }}>{avgRating}</div>
                <div style={{ fontSize:20, color:'#E6A817' }}>{'★'.repeat(Math.round(Number(avgRating)))}</div>
                <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{demoReviews.length} recenzí</div>
              </div>
              <div style={{ flex:1 }}>
                {[5,4,3,2,1].map(n => {
                  const count = demoReviews.filter(r => r.rating === n).length;
                  const pct = (count / demoReviews.length * 100).toFixed(0);
                  return (
                    <div key={n} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:12, width:8 }}>{n}</span>
                      <span style={{ color:'#E6A817', fontSize:12 }}>★</span>
                      <div style={{ flex:1, height:6, background:'#EDE5D0', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:pct+'%', background:'#E6A817', borderRadius:3, transition:'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize:12, color:'#888', width:24, textAlign:'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add review */}
            <div style={{ background:'white', borderRadius:12, padding:'16px 18px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, marginBottom:12 }}>Napsat recenzi</div>
              <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} onClick={() => setReviewRating(n)} style={{ fontSize:24, cursor:'pointer', color: n <= reviewRating ? '#E6A817' : '#ddd', transition:'color 0.1s' }}>★</span>
                ))}
              </div>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Popište vaši zkušenost s touto farmou…"
                style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #EDE5D0', fontFamily:"'DM Sans',sans-serif", fontSize:13, resize:'vertical', minHeight:80, outline:'none', background:'#FDFAF4' }} />
              <button onClick={handleReview} style={{ marginTop:10, padding:'9px 20px', background:color, color:'white', border:'none', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Odeslat hodnocení
              </button>
            </div>

            {/* Reviews list */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {demoReviews.map(r => (
                <div key={r.id} style={{ background:'white', borderRadius:12, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:color, display:'grid', placeItems:'center', color:'white', fontWeight:700, fontSize:13 }}>
                        {r.user.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{r.user.name}</div>
                        <div style={{ fontSize:11, color:'#888' }}>{new Date(r.createdAt).toLocaleDateString('cs-CZ')}</div>
                      </div>
                    </div>
                    <div style={{ color:'#E6A817', fontSize:15 }}>{'★'.repeat(r.rating)}</div>
                  </div>
                  <div style={{ fontSize:13, color:'#555', lineHeight:1.5 }}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INFO */}
        {tab === 'info' && (
          <div style={{ display:'grid', gap:16 }}>
            <div style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:12 }}>O farmě</div>
              <p style={{ fontSize:14, color:'#555', lineHeight:1.7 }}>{farm.description || `Rodinná farma ${farm.name} hospodaří v regionu ${farm.loc}. Nabízíme čerstvé, lokální produkty přímo ze dvora bez zbytečných zprostředkovatelů.`}</p>
            </div>
            <div style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Kontakt & informace</div>
              <div style={{ display:'grid', gap:10 }}>
                {[
                  ['📍 Adresa', farm.loc],
                  ['🕐 Otevírací doba', farm.hours],
                  ['📞 Telefon', farm.phone],
                  farm.website && ['🌐 Web', farm.website],
                  farm.founded && ['📅 Rok založení', farm.founded],
                  farm.hectares && ['🌾 Rozloha', farm.hectares + ' ha'],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label} style={{ display:'flex', gap:8 }}>
                    <span style={{ fontSize:13, color:'#888', minWidth:120 }}>{label}:</span>
                    {label === '🌐 Web'
                      ? <a href={val} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#3A5728', fontWeight:500, wordBreak:'break-all' }}>{val}</a>
                      : <span style={{ fontSize:13, color:'#333', fontWeight:500 }}>{val}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Certifikace & vlastnosti</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {farm.bio && <span style={{ padding:'6px 14px', background:'#FFF3CD', color:'#856404', borderRadius:50, fontSize:13, fontWeight:600 }}>🌱 BIO certifikát</span>}
                {farm.delivery && <span style={{ padding:'6px 14px', background:'#E3F2FD', color:'#1565C0', borderRadius:50, fontSize:13, fontWeight:600 }}>🚚 Rozvoz domů</span>}
                {farm.eshop && <span style={{ padding:'6px 14px', background:'#E8F0E4', color:'#3A5728', borderRadius:50, fontSize:13, fontWeight:600 }}>🛒 Online objednávky</span>}
                <span style={{ padding:'6px 14px', background:'#EDE5D0', color:'#3A2210', borderRadius:50, fontSize:13, fontWeight:600 }}>🤝 Přímý prodej</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      {farm.eshop && tab === 'products' && (
        <div style={{ position:'sticky', bottom:0, background:'white', padding:'12px 20px', boxShadow:'0 -4px 20px rgba(0,0,0,0.1)', display:'flex', gap:10, alignItems:'center', zIndex:100 }}>
          <div style={{ flex:1, fontSize:13, color:'#888' }}>
            <strong style={{ color:'#1E120A' }}>{demoProducts?.length || 0} produktů</strong> dostupných k objednání
          </div>
          <button onClick={() => navigate('/pokladna')} style={{ padding:'10px 24px', background:color, color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <ShoppingCart size={16} /> Přejít do košíku
          </button>
        </div>
      )}
    </div>
  );
}
