// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Edit2, Heart, Bell, ChevronRight, ShoppingBag, Award, Leaf } from 'lucide-react';
import { supabase } from '../supabase.js';
import { useAuthStore, useFavoritesStore } from '../store/index.js';
import FARMS_DATA from '../data/farms.json';
import { useSEO } from '../hooks/useSEO';

const STORAGE_KEY = 'mapafarem_profile_setup';

const DIET_LABELS = {
  classic:     { emoji:'🍽️', label:'Klasická strava' },
  pescetarian: { emoji:'🐟', label:'Pescetarián' },
  vegetarian:  { emoji:'🥚', label:'Vegetarián' },
  vegan:       { emoji:'🌱', label:'Vegan' },
  glutenfree:  { emoji:'🌾', label:'Bezlepkový' },
  lactosefree: { emoji:'🥛', label:'Bez laktózy' },
  highprotein: { emoji:'💪', label:'Vysokoproteinová' },
  hearthealthy:{ emoji:'🫀', label:'Srdečně zdravá' },
};

const CERT_LABELS = {
  bio:'BIO certifikace', freerange:'Volný chov', local:'Lokální',
  zerowaste:'Zero waste', fairtrade:'Fair trade',
};

const FREQ_LABELS = {
  weekly:'Každý týden', biweekly:'Každé 2 týdny',
  monthly:'Jednou měsíčně', occasional:'Příležitostně',
};

const CAT_LABELS = {
  veggie:'🥕 Zelenina', meat:'🥩 Maso', dairy:'🧀 Mléčné',
  honey:'🍯 Med', eggs:'🥚 Vejce', wine:'🍷 Víno',
  herbs:'🌿 Bylinky', seasonal:'🍓 Sezónní', bakery:'🥖 Pečivo',
};

const NOTIF_ITEMS = [
  { key:'nearbyFarm',    emoji:'🔔', label:'Nová farma ve mém okolí',      sub:'Do 30 km od mého města' },
  { key:'seasonalProduct',emoji:'🌱', label:'Sezónní produkt k dispozici', sub:'Produkty které mám rád' },
  { key:'favoriteSale',  emoji:'❤️', label:'Akce u oblíbené farmy',        sub:'Slevy a novinky' },
  { key:'newMarket',     emoji:'📅', label:'Nový farmářský trh v kraji',   sub:'Víkendové trhy' },
  { key:'weeklyTip',     emoji:'🗓️', label:'Týdenní tip sezóny',           sub:'Co je právě čerstvé' },
];

const TYPE_COLOR = {
  bio:'#3A5728', veggie:'#5F8050', meat:'#BF5B3D',
  dairy:'#4A90C4', honey:'#C8973A', wine:'#8B3A6B',
  herbs:'#5F8050', market:'#5D4037', eggs:'#D97706',
  seasonal:'#059669', bakery:'#92400E',
};

function computeScore(pd) {
  if (!pd) return 0;
  let s = 0;
  if (pd.avatar) s += 10;
  if (pd.first_name) s += 10;
  if (pd.city) s += 10;
  if (pd.region) s += 10;
  if (pd.diet_type) s += 15;
  if (pd.categories && pd.categories.length > 0) s += 15;
  if (pd.values && pd.values.length > 0) s += 15;
  if (pd.budget_range) s += 15;
  return Math.min(s, 100);
}

function getLoyalty(pct) {
  if (!pct || pct < 30) return { label:'Začátečník', emoji:'🌱', color:'#6B7280' };
  if (pct < 60) return { label:'Fanoušek', emoji:'🌿', color:'#2D5016' };
  if (pct < 90) return { label:'Pravidelný zákazník', emoji:'🌾', color:'#C8963E' };
  return { label:'Ambasador', emoji:'⭐', color:'#FFD700' };
}

function getPersonalizedFarms(profile) {
  if (!profile) return FARMS_DATA.sort(() => Math.random() - 0.5).slice(0, 6);
  return FARMS_DATA
    .map(farm => {
      let score = 0;
      const reasons = [];
      if (profile.region && farm.loc === profile.region) { score += 3; reasons.push('Váš kraj'); }
      if (profile.diet_type === 'vegan' && ['veggie','bio','herbs'].includes(farm.type)) { score += 2; reasons.push('Vegan přátelská'); }
      if (profile.diet_type === 'vegetarian' && ['veggie','bio','dairy','herbs','honey'].includes(farm.type)) { score += 2; reasons.push('Vegetariánská'); }
      if (profile.certifications?.includes('bio') && farm.bio) { score += 2; reasons.push('BIO'); }
      if (profile.categories?.includes(farm.type)) { score += 1; reasons.push('Váš sortiment'); }
      return { ...farm, _score: score, _reasons: reasons };
    })
    .filter(f => f._score > 0)
    .sort((a, b) => b._score - a._score || b.rating - a.rating)
    .slice(0, 6);
}

function FarmCard({ farm, profileData, index }) {
  const navigate = useNavigate();
  const isPersonalized = (farm._score || 0) >= 2;
  const color = TYPE_COLOR[farm.type] || '#5F8050';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => navigate(`/farma/${farm.id}`)}
      style={{
        background: 'white', border: '1px solid #E8E0D0', borderRadius: 16,
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
    >
      <div style={{ height: 4, background: color }} />
      {isPersonalized && (
        <div style={{
          position: 'absolute', top: 12, right: 10,
          background: '#C8963E', color: 'white',
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
        }}>
          Sedí tvé stravě ✓
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>{farm.emoji || '🌾'}</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, lineHeight: 1.3 }}>
          {farm.name}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} /> {farm.loc}
        </div>
        {(farm._reasons || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {farm._reasons.slice(0, 2).map(r => (
              <span key={r} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 50, background: '#F0F7EC', color: '#2D5016' }}>
                {r}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {farm.bio && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 50, background: '#FFF3CD', color: '#856404' }}>🌱 BIO</span>}
          {farm.open && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 50, background: '#D4EDDA', color: '#155724' }}>Otevřeno</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
            <Star size={12} fill="#E6A817" color="#E6A817" />
            <span style={{ fontWeight: 700 }}>{farm.rating}</span>
          </div>
          <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>Detail →</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  useSEO({
    title: 'Můj profil — MapaFarem.cz',
    description: 'Váš profil na MapaFarem.cz — oblíbené farmy, preference a personalizovaná doporučení.',
  });

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { ids: favoriteIds } = useFavoritesStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supaUser, setSupaUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user: su } } = await supabase.auth.getUser();
        if (su) {
          setSupaUser(su);
          const { data } = await supabase.from('profiles').select('*').eq('user_id', su.id).single();
          if (data) { setProfileData(data); setLoading(false); return; }
        }
      } catch {}
      // Fallback to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (stored) {
          setProfileData({
            avatar: stored.avatar,
            first_name: stored.firstName,
            last_name: stored.lastName,
            city: stored.city,
            region: stored.region,
            diet_type: stored.dietType,
            allergies: stored.allergies || [],
            certifications: stored.certifications || [],
            purchase_frequency: stored.frequency,
            categories: stored.categories || [],
            budget_range: stored.budget,
            values: stored.values || [],
            notifications: stored.notifications || {},
            profile_completion_pct: 50,
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const score = computeScore(profileData);
  const loyalty = getLoyalty(score);
  const personalizedFarms = getPersonalizedFarms(profileData);
  const favoriteFarms = FARMS_DATA.filter(f => (favoriteIds || []).includes(String(f.id)));

  const displayName = profileData
    ? [profileData.first_name, profileData.last_name].filter(Boolean).join(' ') || 'Uživatel'
    : (user?.name || 'Uživatel');

  const memberSince = supaUser
    ? new Date(supaUser.created_at).toLocaleDateString('cs-CZ', { year:'numeric', month:'long' })
    : '';

  const diet = profileData?.diet_type ? DIET_LABELS[profileData.diet_type] : null;
  const allergies = profileData?.allergies?.length ? profileData.allergies : [];
  const certs = profileData?.certifications || [];
  const notifications = profileData?.notifications || {};

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#FAF7F2', display:'grid', placeItems:'center', fontFamily:"'Inter',sans-serif" }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
          <div style={{ color:'#2D5016', fontWeight: 600, fontSize: 16 }}>Načítám profil…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FAF7F2', fontFamily:"'Inter',sans-serif", paddingBottom: 80 }}>

      {/* A. HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ background:'#2D5016', padding:'48px 24px 40px', color:'#FAF7F2' }}
      >
        <div style={{ maxWidth: 900, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 32, flexWrap:'wrap' }}>
            {/* Avatar + name */}
            <div style={{ display:'flex', alignItems:'center', gap: 20 }}>
              <div style={{
                width: 88, height: 88, borderRadius:'50%',
                background:'rgba(200,150,62,0.2)', border:'3px solid #C8963E',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 48, flexShrink: 0,
              }}>
                {profileData?.avatar || '🌾'}
              </div>
              <div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28, fontWeight: 700, color:'#FAF7F2', margin:'0 0 4px' }}>
                  {displayName}
                </h1>
                {(profileData?.city || profileData?.region) && (
                  <div style={{ display:'flex', alignItems:'center', gap: 5, fontSize: 13, color:'rgba(250,247,242,0.7)', marginBottom: 4 }}>
                    <MapPin size={13} />
                    {[profileData.city, profileData.region].filter(Boolean).join(', ')}
                  </div>
                )}
                {memberSince && (
                  <div style={{ fontSize: 12, color:'rgba(250,247,242,0.5)' }}>
                    Člen od {memberSince}
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 12, minWidth: 200 }}>
              {/* Loyalty badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap: 8,
                border:'2px solid #C8963E', padding:'8px 20px',
                borderRadius: 9999, color:'#FAF7F2', fontSize: 14, fontWeight: 700,
              }}>
                <span>{loyalty.emoji}</span>
                <span>{loyalty.label}</span>
              </div>

              {/* Completion bar */}
              <div style={{ width: 200 }}>
                <div style={{ height: 6, background:'rgba(250,247,242,0.2)', borderRadius: 3, overflow:'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width:`${score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height:'100%', background:'#C8963E', borderRadius: 3 }}
                  />
                </div>
                <div style={{ fontSize: 12, color:'rgba(250,247,242,0.6)', marginTop: 4, textAlign:'right' }}>
                  {score}% profilu dokončeno
                </div>
              </div>

              <button
                onClick={() => navigate('/profil-setup')}
                style={{
                  display:'inline-flex', alignItems:'center', gap: 6,
                  padding:'10px 20px',
                  background:'transparent', border:'1px solid rgba(250,247,242,0.4)',
                  borderRadius: 9999, color:'#FAF7F2',
                  fontFamily:"'Inter',sans-serif", fontSize: 13, fontWeight: 600,
                  cursor:'pointer', transition:'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <Edit2 size={14} /> Upravit profil
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* B. PREFERENCE SUMMARY */}
      <div style={{ background:'#FAF7F2', padding:'32px 24px' }}>
        <div style={{ maxWidth: 900, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 16 }}>

            {/* Diet card */}
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              style={{ background:'white', border:'1px solid #E8E0D0', borderRadius:16, padding:'20px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
                <Leaf size={16} color="#C8963E" />
                <span style={{ fontSize:12, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:0.5 }}>Stravování</span>
              </div>
              {diet ? (
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap: 8, padding:'8px 14px', borderRadius:9999, background:'#F0F7EC', border:'1px solid #C8D8B8' }}>
                    <span style={{ fontSize: 20 }}>{diet.emoji}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#2D5016' }}>{diet.label}</span>
                  </div>
                  {allergies.length > 0 && (
                    <div style={{ marginTop: 10, fontSize:13, color:'#6B7280' }}>
                      Alergie: {allergies.join(', ')}
                    </div>
                  )}
                  {allergies.length === 0 && (
                    <div style={{ marginTop: 10, fontSize:13, color:'#6B7280' }}>Žádné alergie</div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize:13, color:'#6B7280' }}>Nenastaveno</div>
              )}
            </motion.div>

            {/* Certifications card */}
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              style={{ background:'white', border:'1px solid #E8E0D0', borderRadius:16, padding:'20px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
                <Award size={16} color="#C8963E" />
                <span style={{ fontSize:12, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:0.5 }}>Certifikace</span>
              </div>
              {certs.length > 0 ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
                  {certs.map(c => (
                    <span key={c} style={{ background:'#F0F7EC', color:'#2D5016', border:'1px solid #C8D8B8', borderRadius:9999, padding:'4px 10px', fontSize:12, fontWeight:600 }}>
                      {CERT_LABELS[c] || c}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:13, color:'#6B7280' }}>Bez preferencí</div>
              )}
            </motion.div>

            {/* Shopping habits card */}
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              style={{ background:'white', border:'1px solid #E8E0D0', borderRadius:16, padding:'20px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
                <ShoppingBag size={16} color="#C8963E" />
                <span style={{ fontSize:12, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:0.5 }}>Nákupní zvyky</span>
              </div>
              {profileData?.purchase_frequency && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ background:'#FAF7F2', border:'1px solid #E8E0D0', borderRadius:9999, padding:'4px 10px', fontSize:12, fontWeight:600, color:'#1A1A1A' }}>
                    {FREQ_LABELS[profileData.purchase_frequency] || profileData.purchase_frequency}
                  </span>
                </div>
              )}
              {profileData?.budget_range && (
                <div style={{ fontSize:13, color:'#6B7280', marginBottom: 6 }}>
                  Rozpočet: {profileData.budget_range}
                </div>
              )}
              {(profileData?.categories || []).length > 0 && (
                <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                  {profileData.categories.slice(0, 3).map(c => (
                    <span key={c} style={{ fontSize:13 }}>{CAT_LABELS[c]?.split(' ')[0] || '🛒'}</span>
                  ))}
                </div>
              )}
              {!(profileData?.purchase_frequency || profileData?.budget_range) && (
                <div style={{ fontSize:13, color:'#6B7280' }}>Nenastaveno</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* C. FARMY PRO TEBE */}
      <div style={{ background:'white', padding:'48px 24px', borderTop:'1px solid #E8E0D0' }}>
        <div style={{ maxWidth: 900, margin:'0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 32, fontWeight: 700, color:'#2D5016', margin:'0 0 8px' }}>
              Farmy vybrané jen pro tebe
            </h2>
            <p style={{ color:'#6B7280', fontSize: 14, margin: 0 }}>
              Podle tvého {profileData?.region ? `regionu ${profileData.region}, ` : ''}stravování a preferencí
            </p>
          </div>

          {!profileData ? (
            <div style={{ textAlign:'center', padding:'60px 20px', background:'#FAF7F2', borderRadius:16, border:'1px dashed #E8E0D0' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🌾</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize: 20, color:'#2D5016', margin:'0 0 8px' }}>
                Dokonči profil pro personalizaci
              </h3>
              <p style={{ color:'#6B7280', fontSize: 14, margin:'0 0 20px' }}>
                Nastav své preference a my ti doporučíme farmy šité na míru
              </p>
              <button
                onClick={() => navigate('/profil-setup')}
                style={{ background:'#C8963E', color:'white', borderRadius:9999, padding:'12px 28px', fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:15 }}
              >
                Nastavit profil →
              </button>
            </div>
          ) : (
            <>
              {personalizedFarms.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px', color:'#6B7280' }}>
                  Nebyla nalezena žádná odpovídající farma. Zkus rozšířit své preference.
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                  {personalizedFarms.map((farm, i) => (
                    <FarmCard key={farm.id} farm={farm} profileData={profileData} index={i} />
                  ))}
                </div>
              )}
              <div style={{ textAlign:'center', marginTop: 28 }}>
                <Link to="/mapa" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#2D5016', fontWeight:600, fontSize:14, textDecoration:'none' }}>
                  Zobrazit všechny farmy na mapě <ChevronRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* D. OBLIBENE FARMY */}
      <div style={{ background:'#FAF7F2', padding:'40px 24px', borderTop:'1px solid #E8E0D0' }}>
        <div style={{ maxWidth: 900, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: 24 }}>
            <Heart size={22} color="#C8963E" />
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:'#1A1A1A', margin:0 }}>
              Oblíbené farmy
            </h2>
          </div>

          {favoriteFarms.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px', background:'white', borderRadius:16, border:'1px dashed #E8E0D0' }}>
              <Heart size={40} color="#E8E0D0" style={{ marginBottom: 12 }} />
              <div style={{ fontSize:15, fontWeight:600, color:'#1A1A1A', marginBottom: 6 }}>Zatím žádné oblíbené farmy</div>
              <div style={{ fontSize:13, color:'#6B7280', marginBottom: 20 }}>Přidej farmy na mapě pomocí ikony srdce</div>
              <Link to="/mapa" style={{ display:'inline-block', padding:'10px 24px', background:'#C8963E', color:'white', borderRadius:9999, fontWeight:700, fontSize:14, textDecoration:'none' }}>
                Prozkoumat mapu
              </Link>
            </div>
          ) : (
            <div style={{ overflowX:'auto', paddingBottom: 8 }}>
              <div style={{ display:'flex', gap:16, minWidth:'max-content' }}>
                {favoriteFarms.map(farm => (
                  <motion.div
                    key={farm.id}
                    whileHover={{ y:-3 }}
                    onClick={() => navigate(`/farma/${farm.id}`)}
                    style={{
                      width: 240, background:'white', border:'1px solid #E8E0D0',
                      borderRadius:16, overflow:'hidden', cursor:'pointer',
                      boxShadow:'0 2px 12px rgba(0,0,0,0.06)', flexShrink: 0,
                    }}
                  >
                    <div style={{ height: 4, background: TYPE_COLOR[farm.type] || '#5F8050' }} />
                    <div style={{ padding:'14px 16px' }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{farm.emoji || '🌾'}</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color:'#1A1A1A', marginBottom:4 }}>
                        {farm.name}
                      </div>
                      <div style={{ fontSize:12, color:'#6B7280', display:'flex', alignItems:'center', gap:4 }}>
                        <MapPin size={10} /> {farm.loc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* E. NOTIFIKACE */}
      <div style={{ background:'white', padding:'40px 24px', borderTop:'1px solid #E8E0D0' }}>
        <div style={{ maxWidth: 900, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Bell size={20} color="#2D5016" />
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#1A1A1A', margin:0 }}>
                Notifikace
              </h2>
            </div>
            <button
              onClick={() => navigate('/profil-setup')}
              style={{ display:'flex', alignItems:'center', gap:4, color:'#C8963E', fontWeight:600, fontSize:13, background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}
            >
              Upravit notifikace <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ background:'#FAF7F2', border:'1px solid #E8E0D0', borderRadius:16, overflow:'hidden' }}>
            {NOTIF_ITEMS.map((item, i) => {
              const on = notifications[item.key];
              return (
                <div key={item.key} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
                  borderBottom: i < NOTIF_ITEMS.length - 1 ? '1px solid #E8E0D0' : 'none',
                  background:'white',
                }}>
                  <span style={{ fontSize:20 }}>{item.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1A1A1A' }}>{item.label}</div>
                    <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{item.sub}</div>
                  </div>
                  <div style={{
                    width:40, height:22, borderRadius:11,
                    background: on ? '#2D5016' : '#E8E0D0',
                    position:'relative', flexShrink:0,
                  }}>
                    <div style={{
                      position:'absolute', top:2, left: on ? 19 : 2,
                      width:18, height:18, borderRadius:'50%', background:'white',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 0.2s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* F. BOTTOM CTA */}
      <div style={{ background:'#2D5016', padding:'48px 24px', textAlign:'center' }}>
        <div style={{ maxWidth: 600, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:'#FAF7F2', margin:'0 0 12px' }}>
            Aktualizujte své preference
          </h2>
          <p style={{ color:'rgba(250,247,242,0.7)', fontSize:15, margin:'0 0 28px', lineHeight:1.6 }}>
            Čím více toho o sobě řeknete, tím lépe vám doporučíme správné farmy.
          </p>
          <motion.button
            whileHover={{ scale:1.04 }}
            whileTap={{ scale:0.97 }}
            onClick={() => navigate('/profil-setup')}
            style={{
              background:'#C8963E', color:'white', borderRadius:9999,
              padding:'14px 36px', fontWeight:700, border:'none', cursor:'pointer',
              fontFamily:"'Inter',sans-serif", fontSize:16,
              boxShadow:'0 4px 16px rgba(200,150,62,0.35)',
            }}
          >
            Upravit profil →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
