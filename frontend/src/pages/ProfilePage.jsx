// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Edit2, Heart, Bell, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase.js';
import { useAuthStore, useFavoritesStore } from '../store/index.js';
import FARMS_DATA from '../data/farms.json';
import { useSEO } from '../hooks/useSEO';

const DIET_LABELS = {
  classic: { emoji: '🍽️', label: 'Klasická strava' },
  pescetarian: { emoji: '🐟', label: 'Pescetarián' },
  vegetarian: { emoji: '🥚', label: 'Vegetarián' },
  vegan: { emoji: '🌱', label: 'Vegan' },
  glutenfree: { emoji: '🌾', label: 'Bezlepkový' },
  lactosefree: { emoji: '🥛', label: 'Bez laktózy' },
  highprotein: { emoji: '💪', label: 'Vysokoproteinová' },
  hearthealthy: { emoji: '🫀', label: 'Srdečně zdravá' },
};

const CERT_LABELS = {
  bio: 'BIO',
  freerange: 'Volný chov',
  local: 'Lokální',
  zerowaste: 'Zero waste',
  fairtrade: 'Fair trade',
};

const NOTIF_ITEMS = [
  { key: 'nearbyFarm', emoji: '📍', label: 'Nová farma ve mém okolí' },
  { key: 'seasonalProduct', emoji: '🌿', label: 'Sezónní produkt dostupný' },
  { key: 'favoriteSale', emoji: '❤️', label: 'Akce oblíbené farmy' },
  { key: 'newMarket', emoji: '🏪', label: 'Nový farmářský trh v kraji' },
  { key: 'weeklyTip', emoji: '💡', label: 'Týdenní sezónní tip' },
];

function computeScore(pd) {
  if (!pd) return 0;
  let score = 0;
  if (pd.avatar) score += 10;
  if (pd.first_name) score += 10;
  if (pd.city) score += 10;
  if (pd.region) score += 10;
  if (pd.diet_type) score += 15;
  if (pd.categories && pd.categories.length > 0) score += 15;
  if (pd.values && pd.values.length > 0) score += 15;
  if (pd.budget_range) score += 15;
  return score;
}

function getLoyaltyBadge(score) {
  if (score < 40) return { label: 'Začátečník', emoji: '🌱' };
  if (score < 70) return { label: 'Fanoušek', emoji: '🌿' };
  if (score < 90) return { label: 'Pravidelný zákazník', emoji: '⭐' };
  return { label: 'Ambasador', emoji: '🏆' };
}

function getRecommendedFarms(profileData) {
  if (!profileData) return FARMS_DATA.slice(0, 6);

  const { diet_type, categories = [], certifications = [], region } = profileData;

  let farms = [...FARMS_DATA];

  // Filter based on diet
  if (diet_type === 'vegan' || diet_type === 'vegetarian') {
    const veggieTypes = ['veggie', 'bio', 'herbs', 'honey'];
    if (diet_type === 'vegetarian') veggieTypes.push('dairy');
    farms = farms.filter(f => veggieTypes.includes(f.type));
  }

  // Filter for meat lovers
  if (categories.includes('meat')) {
    const meatFarms = FARMS_DATA.filter(f => f.type === 'meat');
    farms = [...new Map([...farms, ...meatFarms].map(f => [f.id, f])).values()];
  }

  // Prioritize bio if cert includes bio
  if (certifications.includes('bio')) {
    farms = farms.sort((a, b) => (b.bio ? 1 : 0) - (a.bio ? 1 : 0));
  }

  // Sort region match first
  if (region) {
    farms = farms.sort((a, b) => {
      const aMatch = a.loc === region ? 1 : 0;
      const bMatch = b.loc === region ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  return farms.slice(0, 6);
}

function countFarmMatches(farm, profileData) {
  if (!profileData) return 0;
  let score = 0;
  if (profileData.region && farm.loc === profileData.region) score++;
  if (profileData.diet_type === 'vegan' && ['veggie', 'bio', 'herbs'].includes(farm.type)) score++;
  if (profileData.diet_type === 'vegetarian' && ['veggie', 'bio', 'dairy', 'herbs', 'honey'].includes(farm.type)) score++;
  if (profileData.certifications?.includes('bio') && farm.bio) score++;
  if (profileData.categories?.includes(farm.type)) score++;
  return score;
}

const TYPE_COLOR = {
  bio: '#3A5728', veggie: '#5F8050', meat: '#BF5B3D',
  dairy: '#4A90C4', honey: '#C8973A', wine: '#8B3A6B',
  herbs: '#5F8050', market: '#5D4037',
};

function FarmCard({ farm, profileData }) {
  const navigate = useNavigate();
  const isPersonalized = countFarmMatches(farm, profileData) >= 2;
  const color = TYPE_COLOR[farm.type] || '#5F8050';

  return (
    <div
      onClick={() => navigate(`/farma/${farm.id}`)}
      style={{
        background: 'white',
        border: '1px solid #E8E0D0',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
    >
      {/* Color top bar */}
      <div style={{ height: 4, background: color }} />

      {isPersonalized && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 10,
          background: '#C8963E',
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 9999,
        }}>
          Pro tebe ✓
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>{farm.emoji || '🌾'}</div>
        <div style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 15,
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: 4,
          lineHeight: 1.3,
        }}>{farm.name}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} /> {farm.loc}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {farm.bio && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 50, background: '#FFF3CD', color: '#856404' }}>
              🌱 BIO
            </span>
          )}
          {farm.open && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 50, background: '#D4EDDA', color: '#155724' }}>
              Otevřeno
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
            <Star size={12} fill="#E6A817" color="#E6A817" />
            <span style={{ fontWeight: 700 }}>{farm.rating}</span>
          </div>
          <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>Detail →</span>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  useSEO({
    title: 'Můj profil',
    description: 'Váš profil na MapaFarem.cz — oblíbené farmy, preference a doporučení.',
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
        if (!su) { navigate('/prihlaseni'); return; }
        setSupaUser(su);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', su.id)
          .single();
        if (error) console.error('Profile fetch error:', error);
        if (data) setProfileData(data);
      } catch (err) {
        console.error('Profile load failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const score = computeScore(profileData);
  const badge = getLoyaltyBadge(score);
  const recommendedFarms = getRecommendedFarms(profileData);
  const favoriteFarms = FARMS_DATA.filter(f => favoriteIds.includes(String(f.id)));

  const displayName = profileData
    ? [profileData.first_name, profileData.last_name].filter(Boolean).join(' ')
    : (user?.name || 'Uživatel');

  const memberSince = supaUser
    ? new Date(supaUser.created_at).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long' })
    : '';

  const diet = profileData?.diet_type ? DIET_LABELS[profileData.diet_type] : null;
  const allergies = profileData?.allergies?.length ? profileData.allergies.join(', ') : 'Žádné';
  const certs = profileData?.certifications || [];
  const notifications = profileData?.notifications || {};

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FAF7F2',
        display: 'grid',
        placeItems: 'center',
        fontFamily: "'Inter',sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
          <div style={{ color: '#2D5016', fontWeight: 600 }}>Načítám profil…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F2',
      fontFamily: "'Inter',sans-serif",
      paddingBottom: 80,
    }}>

      {/* A. Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: '#2D5016', padding: '40px 24px 32px', color: '#FAF7F2' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#C8963E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              {profileData?.avatar || '🌾'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 28,
                fontWeight: 700,
                color: '#FAF7F2',
                margin: '0 0 6px',
              }}>{displayName}</h1>

              {(profileData?.city || profileData?.region) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#D4C5A0', marginBottom: 6 }}>
                  <MapPin size={14} />
                  {[profileData.city, profileData.region].filter(Boolean).join(', ')}
                </div>
              )}

              {memberSince && (
                <div style={{ fontSize: 13, color: '#B5A880', marginBottom: 12 }}>
                  Člen od {memberSince}
                </div>
              )}

              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(200,150,62,0.25)',
                border: '1px solid rgba(200,150,62,0.5)',
                borderRadius: 9999,
                padding: '4px 14px',
                fontSize: 13,
                fontWeight: 700,
                color: '#FFDD99',
                marginBottom: 16,
              }}>
                {badge.emoji} {badge.label}
              </div>

              {/* Completion bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#B5A880', marginBottom: 6 }}>
                  <span>Kompletnost profilu</span>
                  <span style={{ fontWeight: 700, color: '#C8963E' }}>{score}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${score}%`,
                    background: '#C8963E',
                    borderRadius: 3,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              <button
                onClick={() => navigate('/profil-setup')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 9999,
                  color: '#FAF7F2',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              >
                <Edit2 size={14} /> Upravit profil
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* B. Preference Summary Cards */}
      <div style={{ background: '#FAF7F2', padding: '32px 24px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Diet card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'white',
                border: '1px solid #E8E0D0',
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stravování</div>
              {diet ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                  <span style={{ fontSize: 24 }}>{diet.emoji}</span>
                  {diet.label}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#6B7280' }}>Nenastaveno</div>
              )}
            </motion.div>

            {/* Allergies card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                background: 'white',
                border: '1px solid #E8E0D0',
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Alergie</div>
              <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.5 }}>{allergies}</div>
            </motion.div>

            {/* Certifications card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'white',
                border: '1px solid #E8E0D0',
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Certifikace</div>
              {certs.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {certs.map(c => (
                    <span key={c} style={{
                      background: '#F0F7EC',
                      color: '#2D5016',
                      border: '1px solid #C8D8B8',
                      borderRadius: 9999,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {CERT_LABELS[c] || c}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#6B7280' }}>Nenastaveno</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* C. Farmy pro tebe */}
      <div style={{ background: '#FAF7F2', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 6px',
            }}>Farmy pro tebe</h2>
            <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>
              Doporučeno na základě tvých preferencí
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {recommendedFarms.map((farm, i) => (
              <motion.div
                key={farm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <FarmCard farm={farm} profileData={profileData} />
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link
              to="/mapa"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#2D5016',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Zobrazit všechny farmy na mapě <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* D. Favorite Farms */}
      <div style={{ background: 'white', padding: '40px 24px', borderTop: '1px solid #E8E0D0', borderBottom: '1px solid #E8E0D0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Heart size={20} color="#C8963E" />
            <h2 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#1A1A1A',
              margin: 0,
            }}>Oblíbené farmy</h2>
          </div>

          {favoriteFarms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6B7280',
              fontSize: 14,
              background: '#FAF7F2',
              borderRadius: 16,
              border: '1px dashed #E8E0D0',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💚</div>
              Zatím nemáte žádné oblíbené farmy. Přidejte je na mapě!
              <div style={{ marginTop: 16 }}>
                <Link
                  to="/mapa"
                  style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    background: '#C8963E',
                    color: 'white',
                    borderRadius: 9999,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Prozkoumat mapu
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {favoriteFarms.map((farm, i) => (
                <motion.div
                  key={farm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <FarmCard farm={farm} profileData={profileData} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* E. Notification Settings */}
      <div style={{ background: '#FAF7F2', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={20} color="#2D5016" />
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#1A1A1A',
                margin: 0,
              }}>Notifikace</h2>
            </div>
            <button
              onClick={() => navigate('/profil-setup')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#C8963E',
                fontWeight: 600,
                fontSize: 13,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Upravit notifikace <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #E8E0D0',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            {NOTIF_ITEMS.map((item, i) => {
              const on = notifications[item.key];
              return (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    borderBottom: i < NOTIF_ITEMS.length - 1 ? '1px solid #F0EBE3' : 'none',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, color: '#1A1A1A' }}>{item.label}</span>
                  <div style={{
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    background: on ? '#2D5016' : '#E8E0D0',
                    position: 'relative',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 2,
                      left: on ? 19 : 2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* F. Edit Preferences CTA */}
      <div style={{ padding: '0 24px 40px', textAlign: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/profil-setup')}
          style={{
            padding: '14px 36px',
            background: '#C8963E',
            color: 'white',
            border: 'none',
            borderRadius: 9999,
            fontFamily: "'Inter',sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(200,150,62,0.35)',
          }}
        >
          Upravit mé preference
        </motion.button>
      </div>
    </div>
  );
}
