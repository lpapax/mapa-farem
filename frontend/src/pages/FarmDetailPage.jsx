// frontend/src/pages/FarmDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ExternalLink, MapPin, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore, useFavoritesStore } from '../store/index.js';
import { supabase } from '../supabase';
import FARMS_DATA from '../data/farms.json';
import { useSEO } from '../hooks/useSEO';

const CSS_VARS = `
  :root{--green:#2D5016;--gold:#C8963E;--cream:#FAF7F2;--text:#1A1A1A;--muted:#6B7280;--border:#E8E0D0;}
  *{box-sizing:border-box;margin:0;padding:0;}
  .fi{width:100%;padding:10px 12px;border:1.5px solid #E8E0D0;border-radius:8px;font-size:13px;font-family:'Inter',sans-serif;outline:none;background:#FDFAF4;color:#1A1A1A;transition:border .2s;}
  .fi:focus{border-color:#2D5016;}
  @media(max-width:600px){.action-btns{flex-direction:column!important;}}
`;

const TYPE_HERO = {
  veggie:   'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80&fit=crop',
  meat:     'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&q=80&fit=crop',
  dairy:    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&q=80&fit=crop',
  honey:    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80&fit=crop',
  wine:     'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80&fit=crop',
  herbs:    'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=1200&q=80&fit=crop',
  herb:     'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=1200&q=80&fit=crop',
  market:   'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80&fit=crop',
  bio:      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200&q=80&fit=crop',
  fruit:    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80&fit=crop',
  grain:    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80&fit=crop',
  mushroom: 'https://images.unsplash.com/photo-1504509546545-a91cb1a99747?w=1200&q=80&fit=crop',
};

const GALLERY_IMAGES = {
  veggie:   ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80&fit=crop'],
  meat:     ['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80&fit=crop'],
  dairy:    ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80&fit=crop'],
  honey:    ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80&fit=crop'],
  wine:     ['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80&fit=crop'],
  herbs:    ['https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1466193498717-c5b7cf4ccc55?w=800&q=80&fit=crop'],
  herb:     ['https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1466193498717-c5b7cf4ccc55?w=800&q=80&fit=crop'],
  bio:      ['https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80&fit=crop'],
  market:   ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80&fit=crop'],
  fruit:    ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1440342359983-0e7c98b2e50e?w=800&q=80&fit=crop'],
  grain:    ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1625246333195-cbfcaabedf55?w=800&q=80&fit=crop'],
  mushroom: ['https://images.unsplash.com/photo-1504509546545-a91cb1a99747?w=800&q=80&fit=crop','https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=800&q=80&fit=crop'],
};

/* ─── Parse hours to determine if currently open ─── */
function isCurrentlyOpen(hoursStr) {
  if (!hoursStr) return null;
  const now = new Date();
  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  const todayName = dayNames[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Try to find today's hours in the string
  // Support patterns like "Po-Pa 8:00-17:00" or "Po–Pá 8-17"
  const lines = hoursStr.split(/[\n,;]/);
  for (const line of lines) {
    const lower = line.toLowerCase();
    // Check if today is mentioned
    const dayAbbrevs = {
      'po': 1, 'út': 2, 'ut': 2, 'st': 3, 'čt': 4, 'ct': 4, 'pá': 5, 'pa': 5, 'so': 6, 'ne': 0,
    };
    let dayMatch = false;
    // Range like "Po-Pa" or "Po–Pá"
    const rangeMatch = line.match(/([a-záčďéěíňóřšťúůýž]+)\s*[-–]\s*([a-záčďéěíňóřšťúůýž]+)/i);
    if (rangeMatch) {
      const from = dayAbbrevs[rangeMatch[1].toLowerCase().slice(0, 2)];
      const to = dayAbbrevs[rangeMatch[2].toLowerCase().slice(0, 2)];
      if (from !== undefined && to !== undefined) {
        const todayNum = now.getDay();
        dayMatch = from <= to ? (todayNum >= from && todayNum <= to) : (todayNum >= from || todayNum <= to);
      }
    } else {
      // Single day abbreviation
      const singleDay = dayAbbrevs[lower.slice(0, 2)];
      if (singleDay !== undefined) dayMatch = now.getDay() === singleDay;
    }

    if (!dayMatch) continue;
    if (lower.includes('zavřeno') || lower.includes('zavreno') || lower.includes('closed')) return false;

    // Extract time range like 8:00-17:00 or 8-17
    const timeMatch = line.match(/(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/);
    if (timeMatch) {
      const openMin = parseInt(timeMatch[1]) * 60 + (parseInt(timeMatch[2] || '0'));
      const closeMin = parseInt(timeMatch[3]) * 60 + (parseInt(timeMatch[4] || '0'));
      return currentMinutes >= openMin && currentMinutes < closeMin;
    }
    return true; // Day mentioned, no closing info — assume open
  }
  return null; // Can't determine
}

/* ─── Haversine distance ─── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function FarmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggle: toggleFavorite, has: isFavorited } = useFavoritesStore();

  const [tab, setTab] = useState('products');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTags, setReviewTags] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState({ title:'', description:'', price_czk:'', valid_until:'' });
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  // Feature A — share
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  // Feature B — check-in
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinRating, setCheckinRating] = useState(5);
  const [checkinDone, setCheckinDone] = useState(false);

  const farm = FARMS_DATA.find(f => String(f.id) === String(id));

  useSEO(farm ? {
    title: farm.name,
    description: farm.description || `${farm.name} — lokální farma v ${farm.loc}`,
    canonical: `https://mapafarem.cz/farma/${farm.id}`,
  } : {});

  const galleryImages = farm ? (GALLERY_IMAGES[farm.type] || GALLERY_IMAGES.bio) : [];
  const openStatus = farm ? isCurrentlyOpen(farm.hours) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setGalleryIdx(0);
  }, [id]);

  useEffect(() => {
    if (!farm) return;
    setReviewsLoading(true);
    supabase.from('farm_reviews').select('*').eq('farm_id', String(farm.id)).order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setReviewsLoading(false); });
  }, [farm?.id]);

  useEffect(() => {
    if (!farm) return;
    setOffersLoading(true);
    supabase.from('farm_offers').select('*').eq('farm_id', String(farm.id))
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().split('T')[0]}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOffers(data || []); setOffersLoading(false); });
  }, [farm?.id]);

  if (!farm) return (
    <div style={{ display:'grid', placeItems:'center', height:'100vh', fontFamily:"'Inter',sans-serif", background: '#FAF7F2' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48 }}>😕</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, marginTop:12, color: '#1A1A1A' }}>Farma nenalezena</div>
        <button onClick={() => navigate('/')} style={{ marginTop:16, padding:'10px 24px', background:'#2D5016', color:'white', border:'none', borderRadius:9999, fontFamily:"'Inter',sans-serif", fontWeight:700, cursor:'pointer' }}>← Zpět na mapu</button>
      </div>
    </div>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (farm.rating || 4.5).toFixed(1);
  const reviewCount = reviews.length;

  const mapy_cz_url = `https://mapy.cz/zakladni?x=${farm.lng}&y=${farm.lat}`;
  const googleMapsUrl = farm.place_id
    ? `https://www.google.com/maps/place/?q=place_id:${farm.place_id}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.name + ' ' + farm.loc)}`;

  const handleFavorite = () => {
    if (!user) { toast.error('Pro ukládání se přihlaste'); navigate('/prihlaseni'); return; }
    const wasFav = isFavorited(farm.id);
    toggleFavorite(farm.id);
    toast.success(wasFav ? 'Odebráno z oblíbených' : 'Přidáno do oblíbených');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Pro hodnocení se přihlaste'); navigate('/prihlaseni'); return; }
    if (!reviewText.trim()) { toast.error('Napište text recenze'); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from('farm_reviews').insert({
      farm_id: String(farm.id), user_id: user.id,
      user_name: user.name || user.email?.split('@')[0] || 'Uživatel',
      rating: reviewRating, text: reviewText.trim(),
      tags: reviewTags.length > 0 ? reviewTags : null,
    });
    if (error) { toast.error('Nepodařilo se odeslat recenzi'); }
    else {
      toast.success('Hodnocení odesláno, díky!');
      setReviewText(''); setReviewRating(5); setReviewTags([]);
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
      farm_id: String(farm.id), user_id: user.id,
      title: offerForm.title.trim(), description: offerForm.description.trim() || null,
      price_czk: offerForm.price_czk ? parseInt(offerForm.price_czk) : null,
      valid_until: offerForm.valid_until || null,
    });
    if (error) { toast.error('Nepodařilo se přidat nabídku'); }
    else {
      toast.success('Nabídka přidána!');
      setOfferForm({ title:'', description:'', price_czk:'', valid_until:'' });
      setShowOfferForm(false);
      const { data } = await supabase.from('farm_offers').select('*').eq('farm_id', String(farm.id))
        .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().split('T')[0]}`).order('created_at', { ascending: false });
      setOffers(data || []);
    }
    setSubmittingOffer(false);
  };

  const jsonLd = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
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

  const REVIEW_TAGS = [
    { emoji:'👍', label:'Skvělá kvalita', value:'quality' },
    { emoji:'🚀', label:'Rychlé vyzvednutí', value:'fast' },
    { emoji:'😊', label:'Přátelský farmář', value:'friendly' },
    { emoji:'🌿', label:'Opravdu BIO', value:'bio' },
    { emoji:'💰', label:'Férová cena', value:'price' },
    { emoji:'🔄', label:'Určitě se vrátím', value:'return' },
  ];

  // Similar farms (haversine)
  const similarFarms = farm.lat && farm.lng
    ? FARMS_DATA.filter(f => String(f.id) !== String(farm.id) && f.lat && f.lng)
        .map(f => ({ ...f, _dist: haversine(farm.lat, farm.lng, f.lat, f.lng) }))
        .sort((a, b) => a._dist - b._dist).slice(0, 4)
    : FARMS_DATA.filter(f => String(f.id) !== String(farm.id) && f.loc === farm.loc).slice(0, 4);

  return (
    <div style={{ minHeight:'100vh', background:'#FAF7F2', fontFamily:"'Inter','DM Sans',sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{CSS_VARS}</style>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        {TYPE_HERO[farm.type] && (
          <img src={TYPE_HERO[farm.type]} alt="" aria-hidden loading="eager" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', opacity:.3 }} />
        )}
        {/* Green overlay (design system) */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(45,80,22,0.92) 0%, rgba(45,80,22,0.75) 100%)' }} />

        {/* Top action bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', position:'relative', zIndex:2 }}>
          <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9999, padding:'8px 16px', color:'white', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:13, backdropFilter:'blur(8px)' }}>
            <ArrowLeft size={14} /> Zpět
          </button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleFavorite} style={{ background: isFavorited(farm.id) ? '#C8963E' : 'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9999, padding:'8px 14px', color:'white', cursor:'pointer', fontSize:14, backdropFilter:'blur(8px)', transition:'background .15s' }}>
              {isFavorited(farm.id) ? '❤️' : '🤍'}
            </button>
            <button onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ title: farm.name, text: `${farm.name} — lokální farma v ${farm.loc}`, url });
              else navigator.clipboard?.writeText(url).then(() => toast.success('Odkaz zkopírován!'));
            }} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9999, padding:'8px 14px', color:'white', cursor:'pointer', fontSize:14, backdropFilter:'blur(8px)' }}>
              📤
            </button>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ padding:'8px 24px 32px', display:'flex', gap:20, alignItems:'flex-end', flexWrap:'wrap', position:'relative', zIndex:2 }}>
          <div style={{ fontSize:72, lineHeight:1 }}>{farm.emoji}</div>
          <div style={{ flex:1, color:'white' }}>
            {/* Badges */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
              {/* Live open/closed badge */}
              {openStatus === true && (
                <span style={{ fontSize:11, fontWeight:700, background:'rgba(34,197,94,0.2)', border:'1px solid rgba(34,197,94,0.4)', color:'#86EFAC', borderRadius:9999, padding:'3px 12px' }}>
                  ● Otevřeno
                </span>
              )}
              {openStatus === false && (
                <span style={{ fontSize:11, fontWeight:700, background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', color:'#FCA5A5', borderRadius:9999, padding:'3px 12px' }}>
                  ● Zavřeno
                </span>
              )}
              {farm.bio && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.15)', borderRadius:9999, padding:'3px 10px', border:'1px solid rgba(255,255,255,0.2)' }}>🌱 BIO</span>}
              {farm.delivery && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.15)', borderRadius:9999, padding:'3px 10px', border:'1px solid rgba(255,255,255,0.2)' }}>🚚 Dovoz</span>}
              {farm.eshop && <span style={{ fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.15)', borderRadius:9999, padding:'3px 10px', border:'1px solid rgba(255,255,255,0.2)' }}>🛒 E-shop</span>}
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(22px,4vw,32px)', fontWeight:700, marginBottom:4 }}>{farm.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, opacity:.85, marginBottom:10 }}>
              <MapPin size={13} /> {farm.loc}
            </div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ fontSize:14, color:'#FCD34D' }}>{'★'.repeat(Math.round(Number(avgRating)))}</span>
                <span style={{ fontWeight:700, fontSize:14 }}>{avgRating}</span>
                <span style={{ opacity:.6, fontSize:12 }}>{reviewCount > 0 ? `(${reviewCount} recenzí)` : '(bez recenzí)'}</span>
              </div>
              {farm.hectares && <span style={{ opacity:.7, fontSize:13 }}>🌾 {farm.hectares} ha</span>}
              {farm.founded && <span style={{ opacity:.7, fontSize:13 }}>📅 Zal. {farm.founded}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div style={{ background:'#FFFFFF', padding:'16px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', borderBottom:'1px solid #E8E0D0' }}>
        <div className="action-btns" style={{ display:'flex', gap:10, maxWidth:900, margin:'0 auto', flexWrap:'wrap' }}>
          {farm.phone && (
            <a href={`tel:${farm.phone}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:'#2D5016', color:'white', borderRadius:9999, textDecoration:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, minWidth:120 }}>
              <Phone size={15} /> Zavolat
            </a>
          )}
          {farm.website && (
            <a href={farm.website} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:'#FAF7F2', color:'#2D5016', border:'2px solid #2D5016', borderRadius:9999, textDecoration:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, minWidth:120 }}>
              <ExternalLink size={15} /> Web
            </a>
          )}
          <a href={mapy_cz_url} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:'#FAF7F2', color:'#2D5016', border:'2px solid #2D5016', borderRadius:9999, textDecoration:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, minWidth:120 }}>
            <MapPin size={15} /> Navigovat
          </a>
          {/* Share button */}
          <button onClick={() => setShowShare(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', border:'1.5px solid #E8E0D0', borderRadius:9999, background:'white', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:"'Inter',sans-serif" }}>
            <Share2 size={15} color="#2D5016" /> Sdílet
          </button>
          {/* Check-in button */}
          <button onClick={() => user ? setShowCheckin(true) : navigate('/prihlaseni')}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', border:'none', borderRadius:9999, background:'#C8963E', color:'white', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:"'Inter',sans-serif" }}>
            📍 Byl jsem tu
          </button>
        </div>
      </div>

      {/* Quick info strip */}
      <div style={{ background:'#FFFFFF', padding:'10px 24px', display:'flex', gap:20, overflowX:'auto', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', scrollbarWidth:'none', borderBottom:'1px solid #E8E0D0' }}>
        {[
          farm.hours && ['🕐', farm.hours],
          farm.phone && ['📞', farm.phone],
          farm.dist && ['📏', farm.dist + ' od vás'],
        ].filter(Boolean).map(([icon, val]) => (
          <div key={val} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#6B7280', whiteSpace:'nowrap', flexShrink:0 }}>
            <span>{icon}</span><span>{val}</span>
          </div>
        ))}
      </div>

      {/* Gallery */}
      {galleryImages.length > 1 && (
        <div style={{ position:'relative', background:'#1a1a1a', overflow:'hidden', height:220 }}>
          <div style={{ display:'flex', transition:'transform 0.4s ease', transform:`translateX(-${galleryIdx * 100}%)`, height:'100%' }}>
            {galleryImages.map((img, i) => (
              <div key={i} style={{ minWidth:'100%', height:'100%', flexShrink:0 }}>
                <img src={img} alt={`Foto ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            ))}
          </div>
          <button onClick={() => setGalleryIdx(i => Math.max(0, i-1))} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', color:'white', border:'none', borderRadius:'50%', width:36, height:36, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:galleryIdx===0?0.3:1 }}>‹</button>
          <button onClick={() => setGalleryIdx(i => Math.min(galleryImages.length-1, i+1))} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', color:'white', border:'none', borderRadius:'50%', width:36, height:36, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:galleryIdx===galleryImages.length-1?0.3:1 }}>›</button>
          <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6 }}>
            {galleryImages.map((_, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)} style={{ width:8, height:8, borderRadius:'50%', border:'none', cursor:'pointer', background:i===galleryIdx?'white':'rgba(255,255,255,0.4)', padding:0 }} />
            ))}
          </div>
          <div style={{ position:'absolute', top:10, right:12, background:'rgba(0,0,0,0.5)', color:'white', borderRadius:20, padding:'3px 10px', fontSize:12 }}>{galleryIdx+1}/{galleryImages.length}</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background:'#FFFFFF', borderBottom:'2px solid #E8E0D0', display:'flex', padding:'0 24px', gap:0, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'14px 20px', border:'none', background:'none', fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:tab===t?700:500,
            color:tab===t?'#2D5016':'#6B7280', cursor:'pointer', whiteSpace:'nowrap',
            borderBottom:tab===t?'2.5px solid #2D5016':'2.5px solid transparent', marginBottom:-2, transition:'all 0.15s',
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
            {farm.products?.length > 0 ? (
              <div style={{ background:'#FFFFFF', borderRadius:16, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:20, border:'1px solid #E8E0D0' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:16, color:'#1A1A1A' }}>Co farma nabízí</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {farm.products.map((p, i) => (
                    <span key={i} style={{ padding:'8px 16px', background:'rgba(45,80,22,0.08)', color:'#2D5016', border:'1.5px solid rgba(45,80,22,0.2)', borderRadius:9999, fontSize:14, fontWeight:600 }}>{p}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background:'#FFFFFF', borderRadius:16, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:20, textAlign:'center', color:'#6B7280', border:'1px solid #E8E0D0' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🌾</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:8, color:'#1A1A1A' }}>Nabídka není upřesněna</div>
                <p style={{ fontSize:13 }}>Kontaktujte farmu přímo pro aktuální nabídku.</p>
              </div>
            )}
            <div style={{ background:'#FFFFFF', borderRadius:16, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:16, color:'#1A1A1A' }}>Jak nakoupit</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {farm.phone && (
                  <a href={`tel:${farm.phone}`} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#FAF7F2', borderRadius:12, textDecoration:'none', color:'#1A1A1A', border:'1px solid #E8E0D0' }}>
                    <Phone size={20} color="#2D5016" />
                    <div><div style={{ fontWeight:700, fontSize:14 }}>Zavolat</div><div style={{ fontSize:13, color:'#6B7280' }}>{farm.phone}</div></div>
                  </a>
                )}
                {farm.email && (
                  <a href={`mailto:${farm.email}`} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#FAF7F2', borderRadius:12, textDecoration:'none', color:'#1A1A1A', border:'1px solid #E8E0D0' }}>
                    <span style={{ fontSize:20 }}>✉️</span>
                    <div><div style={{ fontWeight:700, fontSize:14 }}>Napsat email</div><div style={{ fontSize:13, color:'#6B7280' }}>{farm.email}</div></div>
                  </a>
                )}
                {farm.website && (
                  <a href={farm.website} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#FAF7F2', borderRadius:12, textDecoration:'none', color:'#1A1A1A', border:'1px solid #E8E0D0' }}>
                    <ExternalLink size={20} color="#2D5016" />
                    <div><div style={{ fontWeight:700, fontSize:14 }}>Web / e-shop</div><div style={{ fontSize:13, color:'#6B7280', wordBreak:'break-all' }}>{farm.website.replace(/^https?:\/\//, '')}</div></div>
                  </a>
                )}
                <a href={mapy_cz_url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#FAF7F2', borderRadius:12, textDecoration:'none', color:'#1A1A1A', border:'1px solid #E8E0D0' }}>
                  <MapPin size={20} color="#2D5016" />
                  <div><div style={{ fontWeight:700, fontSize:14 }}>Navigovat (Mapy.cz)</div><div style={{ fontSize:13, color:'#6B7280' }}>{farm.loc}</div></div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* SEASONAL OFFERS */}
        {tab === 'seasonal' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#1A1A1A' }}>Sezónní nabídka 🌱</div>
              {user && (
                <button onClick={() => setShowOfferForm(v => !v)} style={{ padding:'7px 16px', background:showOfferForm?'#6B7280':'#2D5016', color:'white', border:'none', borderRadius:9999, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {showOfferForm ? '✕ Zrušit' : '+ Přidat nabídku'}
                </button>
              )}
            </div>
            {showOfferForm && (
              <form onSubmit={handleOffer} style={{ background:'#FFFFFF', borderRadius:16, padding:'18px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0', display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4, color:'#1A1A1A' }}>Nová nabídka</div>
                <input className="fi" placeholder="Název nabídky *" value={offerForm.title} onChange={e => setOfferForm(f => ({...f, title:e.target.value}))} required/>
                <textarea className="fi" placeholder="Popis (nepovinné)" rows={2} value={offerForm.description} onChange={e => setOfferForm(f => ({...f, description:e.target.value}))} style={{resize:'vertical'}}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div><label style={{ fontSize:12, color:'#6B7280', display:'block', marginBottom:4 }}>Cena (Kč)</label><input className="fi" type="number" placeholder="89" value={offerForm.price_czk} onChange={e => setOfferForm(f => ({...f, price_czk:e.target.value}))}/></div>
                  <div><label style={{ fontSize:12, color:'#6B7280', display:'block', marginBottom:4 }}>Platí do</label><input className="fi" type="date" value={offerForm.valid_until} onChange={e => setOfferForm(f => ({...f, valid_until:e.target.value}))}/></div>
                </div>
                <button type="submit" disabled={submittingOffer} style={{ padding:'10px', background:submittingOffer?'#aaa':'#2D5016', color:'white', border:'none', borderRadius:9999, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
                  {submittingOffer ? 'Ukládám…' : 'Přidat nabídku'}
                </button>
              </form>
            )}
            {offersLoading ? <div style={{ textAlign:'center', padding:'32px', color:'#aaa' }}>Načítám…</div>
            : offers.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#6B7280', background:'#FFFFFF', borderRadius:16, border:'1px solid #E8E0D0' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🌿</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, marginBottom:8, color:'#1A1A1A' }}>Zatím žádné nabídky</div>
                <p style={{ fontSize:13 }}>{user ? 'Přidejte aktuální nabídku farmy.' : 'Přihlaste se a přidejte první nabídku.'}</p>
              </div>
            ) : (
              <div style={{ display:'grid', gap:12 }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{ background:'#FFFFFF', borderRadius:16, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
                    <div style={{ fontSize:32 }}>🌱</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'#1A1A1A' }}>{offer.title}</div>
                      {offer.description && <div style={{ fontSize:13, color:'#6B7280', marginBottom:6 }}>{offer.description}</div>}
                      <div style={{ display:'flex', gap:12, fontSize:12, color:'#aaa' }}>
                        {offer.valid_until && <span>Platí do: {new Date(offer.valid_until).toLocaleDateString('cs-CZ')}</span>}
                        <span>Přidáno: {new Date(offer.created_at).toLocaleDateString('cs-CZ')}</span>
                      </div>
                    </div>
                    {offer.price_czk && <div style={{ background:'#2D5016', color:'white', borderRadius:10, padding:'8px 14px', fontWeight:700, fontSize:16 }}>{offer.price_czk} Kč</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div>
            <div style={{ background:'#FFFFFF', borderRadius:16, padding:'20px', marginBottom:20, display:'flex', gap:24, alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
              <div style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:700, color:'#2D5016' }}>{avgRating}</div>
                <div style={{ fontSize:20, color:'#C8963E' }}>{'★'.repeat(Math.round(Number(avgRating)))}</div>
                <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{reviewCount > 0 ? `${reviewCount} recenzí` : 'bez hodnocení'}</div>
              </div>
              {reviewCount > 0 && (
                <div style={{ flex:1 }}>
                  {[5,4,3,2,1].map(n => {
                    const count = reviews.filter(r => r.rating === n).length;
                    const pct = reviewCount > 0 ? (count/reviewCount*100).toFixed(0) : 0;
                    return (
                      <div key={n} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:12, width:8 }}>{n}</span>
                        <span style={{ color:'#C8963E', fontSize:12 }}>★</span>
                        <div style={{ flex:1, height:6, background:'#E8E0D0', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:pct+'%', background:'#C8963E', borderRadius:3 }} />
                        </div>
                        <span style={{ fontSize:12, color:'#6B7280', width:24, textAlign:'right' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ background:'#FFFFFF', borderRadius:16, padding:'16px 18px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
              <div style={{ fontWeight:700, marginBottom:12, color:'#1A1A1A' }}>Napsat recenzi</div>
              {user ? (
                <form onSubmit={handleReview}>
                  <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} onClick={() => setReviewRating(n)} style={{ fontSize:28, cursor:'pointer', color:n<=reviewRating?'#C8963E':'#E8E0D0', transition:'color 0.1s', userSelect:'none' }}>★</span>
                    ))}
                  </div>
                  <textarea className="fi" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Popište vaši zkušenost…" style={{ width:'100%', resize:'vertical', minHeight:80 }} />
                  {/* Feature C — review tags */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1A1A1A', marginBottom:8 }}>Označit recenzi:</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {REVIEW_TAGS.map(tag => {
                        const sel = reviewTags.includes(tag.value);
                        return (
                          <button key={tag.value} type="button"
                            onClick={() => setReviewTags(prev => sel ? prev.filter(t => t !== tag.value) : [...prev, tag.value])}
                            style={{ padding:'6px 12px', borderRadius:9999, border:`1.5px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                              background: sel ? '#2D5016' : 'white', color: sel ? 'white' : '#1A1A1A', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                            {tag.emoji} {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit" disabled={submittingReview} style={{ marginTop:10, padding:'9px 20px', background:submittingReview?'#aaa':'#2D5016', color:'white', border:'none', borderRadius:9999, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    {submittingReview ? 'Odesílám…' : 'Odeslat hodnocení'}
                  </button>
                </form>
              ) : (
                <div style={{ fontSize:13, color:'#6B7280' }}>
                  <button onClick={() => navigate('/prihlaseni')} style={{ color:'#2D5016', fontWeight:700, background:'none', border:'none', cursor:'pointer', fontSize:13 }}>Přihlaste se</button> pro napsání recenze.
                </div>
              )}
            </div>
            {reviewsLoading ? <div style={{ textAlign:'center', padding:'32px', color:'#aaa' }}>Načítám…</div>
            : reviews.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px', color:'#6B7280', fontSize:14 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>💬</div>Zatím žádné recenze. Buďte první!
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background:'#FFFFFF', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'#2D5016', display:'grid', placeItems:'center', color:'white', fontWeight:700, fontSize:13 }}>
                          {(r.user_name||'?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:'#1A1A1A' }}>{r.user_name||'Uživatel'}</div>
                          <div style={{ fontSize:11, color:'#6B7280' }}>{new Date(r.created_at).toLocaleDateString('cs-CZ')}</div>
                        </div>
                      </div>
                      <div style={{ color:'#C8963E', fontSize:15 }}>{'★'.repeat(r.rating)}</div>
                    </div>
                    {r.tags?.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
                        {r.tags.map(t => {
                          const tag = REVIEW_TAGS.find(rt => rt.value === t);
                          return tag ? (
                            <span key={t} style={{ padding:'2px 8px', borderRadius:9999, background:'#FAF7F2', border:'1px solid #E8E0D0', fontSize:11 }}>
                              {tag.emoji} {tag.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.6 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INFO */}
        {tab === 'info' && (
          <div style={{ display:'grid', gap:16 }}>
            <div style={{ background:'#FFFFFF', borderRadius:16, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:12, color:'#1A1A1A' }}>O farmě</div>
              <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.75 }}>{farm.description || `Rodinná farma ${farm.name} hospodaří v regionu ${farm.loc}. Nabízíme čerstvé, lokální produkty přímo ze dvora bez zbytečných zprostředkovatelů.`}</p>
            </div>
            <div style={{ background:'#FFFFFF', borderRadius:16, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14, color:'#1A1A1A' }}>Kontakt & informace</div>
              <div style={{ display:'grid', gap:10 }}>
                {[
                  ['📍 Adresa', farm.loc, null],
                  farm.hours && ['🕐 Otevírací doba', farm.hours, null],
                  farm.phone && ['📞 Telefon', farm.phone, `tel:${farm.phone}`],
                  farm.website && ['🌐 Web', farm.website.replace(/^https?:\/\//, ''), farm.website],
                  farm.founded && ['📅 Rok založení', String(farm.founded), null],
                  farm.hectares && ['🌾 Rozloha', farm.hectares + ' ha', null],
                ].filter(Boolean).map(([label, val, href]) => (
                  <div key={label} style={{ display:'flex', gap:8 }}>
                    <span style={{ fontSize:13, color:'#6B7280', minWidth:130 }}>{label}:</span>
                    {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ fontSize:13, color:'#2D5016', fontWeight:500, wordBreak:'break-all' }}>{val}</a>
                    : <span style={{ fontSize:13, color:'#1A1A1A', fontWeight:500, whiteSpace:'pre-line' }}>{val}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'#FFFFFF', borderRadius:16, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #E8E0D0' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:14, color:'#1A1A1A' }}>Způsob odběru</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <span style={{ padding:'8px 16px', background:'rgba(45,80,22,0.08)', color:'#2D5016', borderRadius:9999, fontSize:13, fontWeight:600, border:'1px solid rgba(45,80,22,0.15)' }}>🤝 Osobní odběr</span>
                {farm.delivery && <span style={{ padding:'8px 16px', background:'rgba(45,80,22,0.08)', color:'#2D5016', borderRadius:9999, fontSize:13, fontWeight:600, border:'1px solid rgba(45,80,22,0.15)' }}>🚚 Rozvoz domů</span>}
                {farm.eshop && <span style={{ padding:'8px 16px', background:'rgba(45,80,22,0.08)', color:'#2D5016', borderRadius:9999, fontSize:13, fontWeight:600, border:'1px solid rgba(45,80,22,0.15)' }}>🛒 Online objednávky</span>}
                {farm.bio && <span style={{ padding:'8px 16px', background:'rgba(200,150,62,0.1)', color:'#C8963E', borderRadius:9999, fontSize:13, fontWeight:600, border:'1px solid rgba(200,150,62,0.2)' }}>🌱 BIO certifikát</span>}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Similar farms */}
      {similarFarms.length > 0 && (
        <div style={{ background:'#FAF7F2', padding:'32px 20px 40px', borderTop:'1px solid #E8E0D0' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#1A1A1A', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <MapPin size={18} color="#C8963E" /> Farmy v okolí
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
              {similarFarms.map(f => {
                const distKm = f._dist != null ? f._dist.toFixed(1) : null;
                return (
                  <div key={f.id} onClick={() => navigate(`/farma/${f.id}`)}
                    style={{ background:'#FFFFFF', borderRadius:16, padding:'16px', cursor:'pointer', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', transition:'all .18s', border:'1px solid #E8E0D0' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.06)'; }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div style={{ fontSize:36 }}>{f.emoji}</div>
                      {distKm && <div style={{ fontSize:11, fontWeight:700, color:'#2D5016', background:'rgba(45,80,22,0.08)', borderRadius:9999, padding:'2px 8px' }}>{distKm} km</div>}
                    </div>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:2, color:'#1A1A1A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={f.name}>{f.name}</div>
                    <div style={{ fontSize:12, color:'#6B7280', marginBottom:8 }}>📍 {f.loc}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ fontSize:12, color:'#C8963E', fontWeight:700 }}>⭐ {f.rating}</div>
                      <div style={{ display:'flex', gap:4 }}>
                        {f.bio && <span style={{ fontSize:10, background:'rgba(200,150,62,0.12)', color:'#C8963E', borderRadius:9999, padding:'2px 6px', fontWeight:600 }}>🌱</span>}
                        {f.delivery && <span style={{ fontSize:10, background:'rgba(45,80,22,0.08)', color:'#2D5016', borderRadius:9999, padding:'2px 6px', fontWeight:600 }}>🚚</span>}
                        {f.eshop && <span style={{ fontSize:10, background:'rgba(45,80,22,0.08)', color:'#2D5016', borderRadius:9999, padding:'2px 6px', fontWeight:600 }}>🛒</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURE A: Share Modal ── */}
      <AnimatePresence>
        {showShare && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setShowShare(false)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              style={{ background:'white', borderRadius:20, padding:32, maxWidth:400, width:'100%' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Sdílet farmu</div>
              <div style={{ fontSize:13, color:'#6B7280', marginBottom:24 }}>{farm.name} · {farm.loc}</div>
              {[
                { label:'WhatsApp', color:'#25D366', icon:'💬', url:`https://wa.me/?text=${encodeURIComponent(farm.name + ' — ' + window.location.href)}` },
                { label:'Facebook', color:'#1877F2', icon:'📘', url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                { label:'Twitter / X', color:'#000', icon:'🐦', url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(farm.name)}&url=${encodeURIComponent(window.location.href)}` },
              ].map(({ label, color, icon, url }) => (
                <a key={label} href={url} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:10, background:color, color:'white', textDecoration:'none', fontWeight:600, marginBottom:8, fontFamily:"'Inter',sans-serif" }}>
                  <span>{icon}</span> Sdílet na {label}
                </a>
              ))}
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:'2px solid #E8E0D0', background:'white', fontWeight:600, cursor:'pointer', marginTop:4, fontFamily:"'Inter',sans-serif", fontSize:14 }}>
                {copied ? '✓ Zkopírováno!' : '🔗 Kopírovat odkaz'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FEATURE B: Check-in Modal ── */}
      <AnimatePresence>
        {showCheckin && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setShowCheckin(false)}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              style={{ background:'white', borderRadius:20, padding:32, maxWidth:440, width:'100%' }}
              onClick={e => e.stopPropagation()}>
              {checkinDone ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:64 }}>🎉</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#2D5016', marginTop:12 }}>Check-in úspěšný!</div>
                  <div style={{ color:'#6B7280', marginTop:8 }}>Byl jsi zaznamenán jako návštěvník</div>
                  <button onClick={() => { setShowCheckin(false); setCheckinDone(false); }}
                    style={{ marginTop:20, padding:'12px 24px', background:'#C8963E', color:'white', border:'none', borderRadius:9999, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:14 }}>
                    Zavřít
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:4 }}>Byl jsem tu!</div>
                  <div style={{ color:'#6B7280', fontSize:13, marginBottom:24 }}>{farm.name}</div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontWeight:600, marginBottom:8, fontFamily:"'Inter',sans-serif" }}>Hodnocení:</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {[1,2,3,4,5].map(n => (
                        <span key={n} onClick={() => setCheckinRating(n)}
                          style={{ fontSize:32, cursor:'pointer', color: n <= checkinRating ? '#C8963E' : '#E8E0D0', transition:'color 0.1s', userSelect:'none' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontWeight:600, marginBottom:8, fontFamily:"'Inter',sans-serif" }}>Poznámka (nepovinné):</div>
                    <textarea value={checkinNote} onChange={e => setCheckinNote(e.target.value)}
                      placeholder="Co jsi koupil? Jak se ti líbilo? 🥕"
                      style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E8E0D0', borderRadius:10, fontSize:14, fontFamily:"'Inter',sans-serif", resize:'vertical', minHeight:80, outline:'none', boxSizing:'border-box' }} />
                  </div>
                  <button onClick={async () => {
                    try {
                      const { data: { user: supaUser } } = await supabase.auth.getUser();
                      if (supaUser) {
                        await supabase.from('checkins').insert({ farm_id: String(farm.id), user_id: supaUser.id, rating: checkinRating, note: checkinNote });
                      }
                    } catch {}
                    setCheckinDone(true);
                  }} style={{ width:'100%', padding:'14px', background:'#C8963E', color:'white', border:'none', borderRadius:9999, fontWeight:700, fontSize:16, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                    ✓ Potvrdit návštěvu
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky bottom CTA */}
      {(farm.phone || farm.website || farm.lat) && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:900, background:'white', borderTop:'1px solid #E8E0D0', padding:'10px 16px', display:'flex', gap:8, justifyContent:'center', boxShadow:'0 -4px 20px rgba(0,0,0,0.08)' }}>
          {farm.phone && (
            <a href={`tel:${farm.phone}`} style={{ flex:1, maxWidth:200, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', background:'#2D5016', color:'white', borderRadius:9999, textDecoration:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13 }}>
              <Phone size={14} /> Zavolat
            </a>
          )}
          {farm.website && (
            <a href={farm.website} target="_blank" rel="noopener noreferrer" style={{ flex:1, maxWidth:200, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', background:'#FAF7F2', color:'#2D5016', borderRadius:9999, textDecoration:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, border:'2px solid #2D5016' }}>
              <ExternalLink size={14} /> Web
            </a>
          )}
          <a href={mapy_cz_url} target="_blank" rel="noopener noreferrer" style={{ flex:1, maxWidth:200, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', background:'#FAF7F2', color:'#2D5016', borderRadius:9999, textDecoration:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, border:'2px solid #2D5016' }}>
            <MapPin size={14} /> Navigovat
          </a>
        </div>
      )}
    </div>
  );
}
