// frontend/src/pages/FarmDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore, useCartStore, useFavoritesStore } from '../store/index.js';
import { supabase } from '../supabase';
import FARMS_DATA from '../data/farms.json';

const COLORS = { bio:'#C99B30', veggie:'#3A5728', meat:'#9B2226', dairy:'#2980B9', honey:'#D4A017', wine:'#7D3C98', herbs:'#5F8050', market:'#5D4037' };

export default function FarmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle: toggleFavorite, has: isFavorited } = useFavoritesStore();

  const [tab, setTab] = useState('products');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ title:'', description:'', price_czk:'', valid_until:'' });
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const farm = FARMS_DATA.find(f => String(f.id) === String(id));

  useEffect(() => {
    window.scrollTo(0, 0);
    if (farm) document.title = `${farm.name} — MapaFarem.cz`;
    return () => { document.title = 'MapaFarem.cz — Lokální farmy v České republice'; };
  }, [id, farm]);

  // Load reviews
  useEffect(() => {
    if (!farm) return;
    setReviewsLoading(true);
    supabase.from('farm_reviews')
      .select('*')
      .eq('farm_id', String(farm.id))
      .order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setReviewsLoading(false); });
  }, [farm?.id]);

  // Load offers
  useEffect(() => {
    if (!farm) return;
    setOffersLoading(true);
    supabase.from('farm_offers')
      .select('*')
      .eq('farm_id', String(farm.id))
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().split('T')[0]}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOffers(data || []); setOffersLoading(false); });
  }, [farm?.id]);

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

  // Deterministic prices
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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (farm.rating || 4.5).toFixed(1);
  const reviewCount = reviews.length;

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

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Pro hodnocení se přihlaste'); navigate('/prihlaseni'); return; }
    if (!reviewText.trim()) { toast.error('Napište text recenze'); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from('farm_reviews').insert({
      farm_id: String(farm.id),
      user_id: user.id,
      user_name: user.name || user.email?.split('@')[0] || 'Uživatel',
      rating: reviewRating,
      text: reviewText.trim(),
    });
    if (error) {
      toast.error('Nepodařilo se odeslat recenzi');
    } else {
      toast.success('⭐ Hodnocení odesláno, díky!');
      setReviewText('');
      setReviewRating(5);
      const { data } = await supabase.from('farm_reviews').select('*').eq('farm_id', String(farm.id)).order('created_at', { ascending: false });
      setReviews(data || []);
    }
    setSubmittingReview(false);
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Pro přidání nabídky se přihlaste'); navigate('/prihlaseni'); return; }
    if (!offerForm.title.trim()) { toast.error('Zadejte název nabídky'); return; }
    setSubmittingOffer(true);
    const { error } = await supabase.from('farm_offers').insert({
      farm_id: String(farm.id),
      user_id: user.id,
      title: offerForm.title.trim(),
      description: offerForm.description.trim() || null,
      price_czk: offerForm.price_czk ? parseInt(offerForm.price_czk) : null,
      valid_until: offerForm.valid_until || null,
    });
    if (error) {
      toast.error('Nepodařilo se přidat nabídku');
    } else {
      toast.success('✅ Nabídka přidána!');
      setOfferForm({ title:'', description:'', price_czk:'', valid_until:'' });
      setShowOfferForm(false);
      const { data } = await supabase.from('farm_offers').select('*').eq('farm_id', String(farm.id)).or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().split('T')[0]}`).order('created_at', { ascending: false });
      setOffers(data || []);
    }
    setSubmittingOffer(false);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": farm.name,
    "description": farm.description || `Lokální farma ${farm.name} v regionu ${farm.loc}.`,
    "address": { "@type": "PostalAddress", "addressRegion": farm.loc, "addressCountry": "CZ" },
    "geo": { "@type": "GeoCoordinates", "latitude": farm.lat, "longitude": farm.lng },
    ...(farm.phone && { "telephone": farm.phone }),
    ...(farm.website && { "url": farm.website }),
    ...(farm.hours && { "openingHours": farm.hours }),
    ...(reviewCount > 0 && { "aggregateRating": { "@type": "AggregateRating", "ratingValue": avgRating, "reviewCount": reviewCount } }),
  };

  const TABS = ['products','seasonal','reviews','info'];
  const TAB_LABELS = { products:'Produkty', seasonal:'Sezónní nabídka', reviews:`Recenze${reviewCount > 0 ? ` (${reviewCount})` : ''}`, info:'O farmě' };

  return (
    <div style={{ minHeight:'100vh', background:'#F4EDD8', fontFamily:"'DM Sans',sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}
        .fi{width:100%;padding:10px 12px;border:1.5px solid #EDE5D0;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;background:#FDFAF4;color:#1E120A;transition:border .2s}
        .fi:focus{border-color:${color}}`}</style>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${color}ee, ${color}88)`, position:'relative', overflow:'hidden' }}>
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
                <span style={{ fontSize:16, color:'#F39C12' }}>{'★'.repeat(Math.round(Number(avgRating)))}</span>
                <span style={{ fontWeight:700, fontSize:16 }}>{avgRating}</span>
                <span style={{ opacity:.7, fontSize:13 }}>
                  {reviewCount > 0 ? `(${reviewCount} recenzí)` : '(bez recenzí)'}
                </span>
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
            {demoProducts?.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                {demoProducts.map(p => (
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
            ) : (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#888' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:8 }}>Žádné produkty k zobrazení</div>
                <p style={{ fontSize:13 }}>Kontaktujte farmu přímo pro aktuální nabídku.</p>
              </div>
            )}
          </div>
        )}

        {/* SEASONAL OFFERS */}
        {tab === 'seasonal' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>Sezónní nabídka 🌱</div>
              {user && (
                <button onClick={() => setShowOfferForm(v => !v)} style={{ padding:'7px 16px', background: showOfferForm ? '#888' : color, color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {showOfferForm ? '✕ Zrušit' : '+ Přidat nabídku'}
                </button>
              )}
            </div>

            {/* Add offer form */}
            {showOfferForm && (
              <form onSubmit={handleOffer} style={{ background:'white', borderRadius:12, padding:'18px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Nová nabídka / aktualita</div>
                <input className="fi" placeholder="Název nabídky *  (např. Čerstvé jahody, limitovaně)" value={offerForm.title}
                  onChange={e => setOfferForm(f => ({...f, title: e.target.value}))} required/>
                <textarea className="fi" placeholder="Popis (nepovinné)" rows={2} value={offerForm.description}
                  onChange={e => setOfferForm(f => ({...f, description: e.target.value}))} style={{ resize:'vertical' }}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={{ fontSize:12, color:'#888', display:'block', marginBottom:4 }}>Cena (Kč, nepovinné)</label>
                    <input className="fi" type="number" placeholder="např. 89" value={offerForm.price_czk}
                      onChange={e => setOfferForm(f => ({...f, price_czk: e.target.value}))}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:'#888', display:'block', marginBottom:4 }}>Platí do (nepovinné)</label>
                    <input className="fi" type="date" value={offerForm.valid_until}
                      onChange={e => setOfferForm(f => ({...f, valid_until: e.target.value}))}/>
                  </div>
                </div>
                <button type="submit" disabled={submittingOffer} style={{ padding:'10px', background: submittingOffer ? '#aaa' : color, color:'white', border:'none', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
                  {submittingOffer ? '⏳ Ukládám…' : '✅ Přidat nabídku'}
                </button>
              </form>
            )}

            {offersLoading ? (
              <div style={{ textAlign:'center', padding:'32px', color:'#aaa' }}>Načítám nabídky…</div>
            ) : offers.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#888' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🌿</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:8 }}>Zatím žádné nabídky</div>
                <p style={{ fontSize:13 }}>
                  {user ? 'Buďte první — přidejte aktuální nabídku nebo aktualitu farmy.' : 'Přihlaste se a přidejte první nabídku.'}
                </p>
                {!user && (
                  <button onClick={() => navigate('/prihlaseni')} style={{ marginTop:14, padding:'8px 20px', background:color, color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    Přihlásit se
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display:'grid', gap:12 }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{ background:'white', borderRadius:12, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize:36, flexShrink:0 }}>🌱</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{offer.title}</div>
                      {offer.description && <div style={{ fontSize:13, color:'#666', marginBottom:6 }}>{offer.description}</div>}
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:12, color:'#888' }}>
                        {offer.valid_until && <span>Platí do: {new Date(offer.valid_until).toLocaleDateString('cs-CZ')}</span>}
                        <span>Přidáno: {new Date(offer.created_at).toLocaleDateString('cs-CZ')}</span>
                      </div>
                    </div>
                    {offer.price_czk && (
                      <div style={{ background:color, color:'white', borderRadius:10, padding:'8px 14px', fontWeight:700, fontSize:16, flexShrink:0 }}>
                        {offer.price_czk} Kč
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div>
            {/* Summary */}
            <div style={{ background:'white', borderRadius:12, padding:'20px', marginBottom:20, display:'flex', gap:24, alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:900, color:color }}>{avgRating}</div>
                <div style={{ fontSize:20, color:'#E6A817' }}>{'★'.repeat(Math.round(Number(avgRating)))}</div>
                <div style={{ fontSize:12, color:'#888', marginTop:2 }}>
                  {reviewCount > 0 ? `${reviewCount} recenz${reviewCount === 1 ? 'e' : reviewCount < 5 ? 'e' : 'í'}` : 'bez hodnocení'}
                </div>
              </div>
              {reviewCount > 0 && (
                <div style={{ flex:1 }}>
                  {[5,4,3,2,1].map(n => {
                    const count = reviews.filter(r => r.rating === n).length;
                    const pct = reviewCount > 0 ? (count / reviewCount * 100).toFixed(0) : 0;
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
              )}
            </div>

            {/* Add review form */}
            <div style={{ background:'white', borderRadius:12, padding:'16px 18px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, marginBottom:12 }}>Napsat recenzi</div>
              {user ? (
                <form onSubmit={handleReview}>
                  <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} onClick={() => setReviewRating(n)} style={{ fontSize:28, cursor:'pointer', color: n <= reviewRating ? '#E6A817' : '#ddd', transition:'color 0.1s', userSelect:'none' }}>★</span>
                    ))}
                    <span style={{ fontSize:13, color:'#888', alignSelf:'center', marginLeft:6 }}>{reviewRating}/5</span>
                  </div>
                  <textarea className="fi" value={reviewText} onChange={e => setReviewText(e.target.value)}
                    placeholder="Popište vaši zkušenost s touto farmou…"
                    style={{ width:'100%', resize:'vertical', minHeight:80 }} />
                  <button type="submit" disabled={submittingReview} style={{ marginTop:10, padding:'9px 20px', background: submittingReview ? '#aaa' : color, color:'white', border:'none', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    {submittingReview ? '⏳ Odesílám…' : 'Odeslat hodnocení'}
                  </button>
                </form>
              ) : (
                <div style={{ fontSize:13, color:'#888' }}>
                  <button onClick={() => navigate('/prihlaseni')} style={{ color:color, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontSize:13 }}>Přihlaste se</button> pro napsání recenze.
                </div>
              )}
            </div>

            {/* Reviews list */}
            {reviewsLoading ? (
              <div style={{ textAlign:'center', padding:'32px', color:'#aaa' }}>Načítám recenze…</div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px', color:'#888', fontSize:14 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>💬</div>
                Zatím žádné recenze. Buďte první!
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background:'white', borderRadius:12, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:color, display:'grid', placeItems:'center', color:'white', fontWeight:700, fontSize:13, flexShrink:0 }}>
                          {(r.user_name||'?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{r.user_name || 'Uživatel'}</div>
                          <div style={{ fontSize:11, color:'#888' }}>{new Date(r.created_at).toLocaleDateString('cs-CZ')}</div>
                        </div>
                      </div>
                      <div style={{ color:'#E6A817', fontSize:15, flexShrink:0 }}>{'★'.repeat(r.rating)}</div>
                    </div>
                    <div style={{ fontSize:13, color:'#555', lineHeight:1.6 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}
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
                  farm.hours && ['🕐 Otevírací doba', farm.hours],
                  farm.phone && ['📞 Telefon', farm.phone],
                  farm.website && ['🌐 Web', farm.website],
                  farm.founded && ['📅 Rok založení', farm.founded],
                  farm.hectares && ['🌾 Rozloha', farm.hectares + ' ha'],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label} style={{ display:'flex', gap:8 }}>
                    <span style={{ fontSize:13, color:'#888', minWidth:130 }}>{label}:</span>
                    {label === '🌐 Web'
                      ? <a href={val} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#3A5728', fontWeight:500, wordBreak:'break-all' }}>{val}</a>
                      : <span style={{ fontSize:13, color:'#333', fontWeight:500 }}>{val}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'white', borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Způsob odběru</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <span style={{ padding:'8px 16px', background:'#E8F0E4', color:'#3A5728', borderRadius:50, fontSize:13, fontWeight:600 }}>🤝 Osobní odběr</span>
                {farm.delivery && <span style={{ padding:'8px 16px', background:'#E3F2FD', color:'#1565C0', borderRadius:50, fontSize:13, fontWeight:600 }}>🚚 Rozvoz domů</span>}
                {farm.eshop && <span style={{ padding:'8px 16px', background:'#E8F0E4', color:'#3A5728', borderRadius:50, fontSize:13, fontWeight:600 }}>🛒 Online objednávky</span>}
                {farm.bio && <span style={{ padding:'8px 16px', background:'#FFF3CD', color:'#856404', borderRadius:50, fontSize:13, fontWeight:600 }}>🌱 BIO certifikát</span>}
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
