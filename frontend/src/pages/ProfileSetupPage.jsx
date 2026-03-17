// frontend/src/pages/ProfileSetupPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../supabase.js';

const CZECH_REGIONS = [
  'Hlavní město Praha',
  'Středočeský kraj',
  'Jihočeský kraj',
  'Plzeňský kraj',
  'Karlovarský kraj',
  'Ústecký kraj',
  'Liberecký kraj',
  'Královéhradecký kraj',
  'Pardubický kraj',
  'Kraj Vysočina',
  'Jihomoravský kraj',
  'Olomoucký kraj',
  'Zlínský kraj',
  'Moravskoslezský kraj',
];

const DIET_OPTIONS = [
  { emoji: '🍽️', label: 'Klasická strava', value: 'classic' },
  { emoji: '🐟', label: 'Pescetarián', value: 'pescetarian' },
  { emoji: '🥚', label: 'Vegetarián', value: 'vegetarian' },
  { emoji: '🌱', label: 'Vegan', value: 'vegan' },
  { emoji: '🌾', label: 'Bezlepkový', value: 'glutenfree' },
  { emoji: '🥛', label: 'Bez laktózy', value: 'lactosefree' },
  { emoji: '💪', label: 'Vysokoproteinová', value: 'highprotein' },
  { emoji: '🫀', label: 'Srdečně zdravá', value: 'hearthealthy' },
];

const ALLERGY_OPTIONS = [
  'Ořechy', 'Lepek', 'Laktóza', 'Vejce', 'Sója', 'Ryby', 'Korýši', 'Hořčice', 'Celer',
];

const CERT_OPTIONS = [
  { emoji: '🌿', label: 'BIO certifikace', value: 'bio' },
  { emoji: '🐄', label: 'Volný chov', value: 'freerange' },
  { emoji: '🌍', label: 'Lokální (do 50km)', value: 'local' },
  { emoji: '♻️', label: 'Zero waste', value: 'zerowaste' },
  { emoji: '🤝', label: 'Fair trade', value: 'fairtrade' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Každý týden', value: 'weekly' },
  { label: 'Každé 2 týdny', value: 'biweekly' },
  { label: 'Jednou měsíčně', value: 'monthly' },
  { label: 'Příležitostně', value: 'occasional' },
];

const CATEGORY_OPTIONS = [
  { emoji: '🥕', label: 'Zelenina a ovoce', value: 'veggie' },
  { emoji: '🥩', label: 'Maso a uzeniny', value: 'meat' },
  { emoji: '🧀', label: 'Mléčné výrobky', value: 'dairy' },
  { emoji: '🍯', label: 'Med a včelí', value: 'honey' },
  { emoji: '🥚', label: 'Vejce', value: 'eggs' },
  { emoji: '🍷', label: 'Víno a nápoje', value: 'wine' },
  { emoji: '🌿', label: 'Bylinky a koření', value: 'herbs' },
  { emoji: '🍓', label: 'Sezónní ovoce', value: 'seasonal' },
  { emoji: '🥖', label: 'Pečivo', value: 'bakery' },
];

const BUDGET_OPTIONS = [
  { label: 'Do 500 Kč', value: 'under500' },
  { label: '500–1000 Kč', value: '500-1000' },
  { label: '1000–2000 Kč', value: '1000-2000' },
  { label: '2000+ Kč', value: 'over2000' },
];

const VALUES_OPTIONS = [
  { emoji: '🌱', label: 'Podpora lokálních farmářů', value: 'local' },
  { emoji: '🐾', label: 'Welfare zvířat', value: 'welfare' },
  { emoji: '🌍', label: 'Ekologická stopa', value: 'eco' },
  { emoji: '💚', label: 'Zdravý životní styl', value: 'health' },
  { emoji: '👨‍👩‍👧', label: 'Rodinné farmy', value: 'family' },
  { emoji: '🔬', label: 'Transparentnost původu', value: 'transparency' },
  { emoji: '💰', label: 'Férová cena', value: 'fairprice' },
];

const HOW_FOUND_OPTIONS = [
  'Google',
  'Sociální sítě',
  'Doporučení od přítele',
  'Článek v médiích',
  'Jinak',
];

const AVATARS = ['🐄', '🐓', '🐑', '🐝', '🦊', '🐇', '🐖', '🌾'];

const NOTIF_ITEMS = [
  { key: 'nearbyFarm', emoji: '📍', label: 'Nová farma ve mém okolí (do 30km)' },
  { key: 'seasonalProduct', emoji: '🌿', label: 'Sezónní produkt který mám rád je dostupný' },
  { key: 'favoriteSale', emoji: '❤️', label: 'Farma z oblíbených má akci' },
  { key: 'newMarket', emoji: '🏪', label: 'Nový farmářský trh v mém kraji' },
  { key: 'weeklyTip', emoji: '💡', label: 'Týdenní tip "Co je teď v sezóně"' },
];

const STEP_LABELS = ['Základní info', 'Preference', 'Nákupní zvyky', 'Hodnoty', 'Notifikace'];

export default function ProfileSetupPage() {
  useSEO({
    title: 'Nastavení profilu',
    description: 'Personalizujte své preference pro lepší doporučení farem.',
  });

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    avatar: '🐄',
    firstName: '',
    lastName: '',
    city: '',
    zip: '',
    region: '',
    dietType: '',
    allergies: [],
    certifications: [],
    frequency: '',
    categories: [],
    budget: '',
    values: [],
    howFound: '',
    notifications: {
      nearbyFarm: true,
      seasonalProduct: true,
      favoriteSale: true,
      newMarket: true,
      weeklyTip: true,
    },
  });

  const update = (key, value) => setProfile(p => ({ ...p, [key]: value }));

  const toggleArray = (key, value) => {
    setProfile(p => {
      const arr = p[key];
      return { ...p, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  const toggleNotif = (key) => {
    setProfile(p => ({
      ...p,
      notifications: { ...p.notifications, [key]: !p.notifications[key] },
    }));
  };

  const completionScore = () => {
    let score = 0;
    if (profile.avatar) score += 10;
    if (profile.firstName) score += 10;
    if (profile.city) score += 10;
    if (profile.region) score += 10;
    if (profile.dietType) score += 15;
    if (profile.categories.length > 0) score += 15;
    if (profile.values.length > 0) score += 15;
    if (profile.budget) score += 15;
    return score;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/prihlaseni'); return; }

      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        avatar: profile.avatar,
        first_name: profile.firstName,
        last_name: profile.lastName,
        city: profile.city,
        zip: profile.zip,
        region: profile.region,
        diet_type: profile.dietType,
        allergies: profile.allergies,
        certifications: profile.certifications,
        purchase_frequency: profile.frequency,
        categories: profile.categories,
        budget_range: profile.budget,
        values: profile.values,
        how_found: profile.howFound,
        notifications: profile.notifications,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) console.error('Profile save error:', error);
    } catch (err) {
      console.error('Profile save failed:', err);
    } finally {
      setSaving(false);
      navigate('/profil');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E8E0D0',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Inter',sans-serif",
    color: '#1A1A1A',
    background: '#FAFAFA',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#6B7280',
    marginBottom: 6,
    display: 'block',
  };

  const sectionTitle = (text) => (
    <h3 style={{
      fontFamily: "'Playfair Display',serif",
      fontSize: 18,
      fontWeight: 700,
      color: '#2D5016',
      margin: '0 0 14px',
    }}>{text}</h3>
  );

  const score = completionScore();
  const completionMsg = score <= 40
    ? 'Dokonči profil pro lepší doporučení'
    : score <= 80
      ? 'Skoro tam! Ještě pár kroků'
      : 'Perfektní profil! 🎉';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F2',
      fontFamily: "'Inter',sans-serif",
      paddingBottom: 60,
    }}>
      {/* Progress bar header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const isDone = num < step;
              const isActive = num === step;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isDone ? '#2D5016' : isActive ? '#C8963E' : '#E8E0D0',
                      color: isDone || isActive ? 'white' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      transition: 'all 0.3s',
                      flexShrink: 0,
                    }}>
                      {isDone ? '✓' : num}
                    </div>
                    <span style={{
                      fontSize: 9,
                      color: isActive ? '#C8963E' : isDone ? '#2D5016' : '#6B7280',
                      fontWeight: isActive ? 700 : 400,
                      whiteSpace: 'nowrap',
                      display: window.innerWidth < 480 ? 'none' : 'block',
                    }}>{label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: 2,
                      background: isDone ? '#2D5016' : '#E8E0D0',
                      margin: '0 4px',
                      marginBottom: 16,
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Gold progress bar */}
          <div style={{ height: 4, background: '#E8E0D0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((step - 1) / 4) * 100}%`,
              background: '#C8963E',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 16px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E0D0',
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              padding: 32,
            }}
          >
            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 24px' }}>
                  Základní informace
                </h2>

                {sectionTitle('Váš avatar')}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => update('avatar', a)}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        border: profile.avatar === a ? '2px solid #C8963E' : '2px solid #E8E0D0',
                        background: profile.avatar === a ? '#FFF8EE' : '#FAFAFA',
                        fontSize: 28,
                        cursor: 'pointer',
                        transform: profile.avatar === a ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >{a}</button>
                  ))}
                </div>

                {sectionTitle('Vaše jméno')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div>
                    <label style={labelStyle}>Jméno</label>
                    <input
                      style={inputStyle}
                      value={profile.firstName}
                      onChange={e => update('firstName', e.target.value)}
                      placeholder="Jana"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Příjmení</label>
                    <input
                      style={inputStyle}
                      value={profile.lastName}
                      onChange={e => update('lastName', e.target.value)}
                      placeholder="Nováková"
                    />
                  </div>
                </div>

                {sectionTitle('Kde bydlíte')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Město</label>
                    <input
                      style={inputStyle}
                      value={profile.city}
                      onChange={e => update('city', e.target.value)}
                      placeholder="Praha"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>PSČ</label>
                    <input
                      style={inputStyle}
                      value={profile.zip}
                      onChange={e => update('zip', e.target.value)}
                      placeholder="110 00"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Kraj</label>
                  <select
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    value={profile.region}
                    onChange={e => update('region', e.target.value)}
                  >
                    <option value="">Vyberte kraj</option>
                    {CZECH_REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 24px' }}>
                  Stravovací preference
                </h2>

                {sectionTitle('Typ stravování')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                  {DIET_OPTIONS.map(opt => {
                    const selected = profile.dietType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('dietType', opt.value)}
                        style={{
                          padding: '12px 14px',
                          border: selected ? '2px solid #C8963E' : '1px solid #E8E0D0',
                          borderRadius: 12,
                          background: selected ? '#2D5016' : '#FAFAFA',
                          color: selected ? 'white' : '#1A1A1A',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: 13,
                          fontWeight: selected ? 700 : 400,
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {sectionTitle('Alergie')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 28 }}>
                  {ALLERGY_OPTIONS.map(a => {
                    const checked = profile.allergies.includes(a);
                    return (
                      <label key={a} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        padding: '8px 10px',
                        border: checked ? '1px solid #2D5016' : '1px solid #E8E0D0',
                        borderRadius: 8,
                        background: checked ? '#F0F7EC' : '#FAFAFA',
                        fontSize: 13,
                        transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: checked ? 'none' : '2px solid #E8E0D0',
                          background: checked ? '#2D5016' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}>
                          {checked && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArray('allergies', a)}
                          style={{ display: 'none' }}
                        />
                        {a}
                      </label>
                    );
                  })}
                </div>

                {sectionTitle('Preferované certifikace')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CERT_OPTIONS.map(opt => {
                    const checked = profile.certifications.includes(opt.value);
                    return (
                      <label key={opt.value} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        padding: '12px 14px',
                        border: checked ? '1px solid #2D5016' : '1px solid #E8E0D0',
                        borderRadius: 12,
                        background: checked ? '#F0F7EC' : '#FAFAFA',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: checked ? 'none' : '2px solid #E8E0D0',
                          background: checked ? '#2D5016' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArray('certifications', opt.value)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                        <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: checked ? 600 : 400 }}>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 24px' }}>
                  Nákupní zvyky
                </h2>

                {sectionTitle('Jak často nakupuji')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                  {FREQUENCY_OPTIONS.map(opt => {
                    const selected = profile.frequency === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('frequency', opt.value)}
                        style={{
                          padding: '10px 20px',
                          border: selected ? '2px solid #C8963E' : '1px solid #E8E0D0',
                          borderRadius: 9999,
                          background: selected ? '#C8963E' : '#FAFAFA',
                          color: selected ? 'white' : '#1A1A1A',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: 14,
                          fontWeight: selected ? 700 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >{opt.label}</button>
                    );
                  })}
                </div>

                {sectionTitle('Co nejčastěji kupuji')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 28 }}>
                  {CATEGORY_OPTIONS.map(opt => {
                    const checked = profile.categories.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleArray('categories', opt.value)}
                        style={{
                          padding: '10px 8px',
                          border: checked ? '2px solid #2D5016' : '1px solid #E8E0D0',
                          borderRadius: 12,
                          background: checked ? '#F0F7EC' : '#FAFAFA',
                          color: '#1A1A1A',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: 12,
                          fontWeight: checked ? 700 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.emoji}</div>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {sectionTitle('Průměrný měsíční rozpočet')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {BUDGET_OPTIONS.map(opt => {
                    const selected = profile.budget === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => update('budget', opt.value)}
                        style={{
                          padding: '10px 20px',
                          border: selected ? '2px solid #C8963E' : '1px solid #E8E0D0',
                          borderRadius: 9999,
                          background: selected ? '#C8963E' : '#FAFAFA',
                          color: selected ? 'white' : '#1A1A1A',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: 14,
                          fontWeight: selected ? 700 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >{opt.label}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 24px' }}>
                  Hodnoty a zájem
                </h2>

                {sectionTitle('Co je pro mě důležité')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                  {VALUES_OPTIONS.map(opt => {
                    const checked = profile.values.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleArray('values', opt.value)}
                        style={{
                          padding: '12px 14px',
                          border: checked ? '2px solid #2D5016' : '1px solid #E8E0D0',
                          borderRadius: 12,
                          background: checked ? '#F0F7EC' : '#FAFAFA',
                          color: '#1A1A1A',
                          fontFamily: "'Inter',sans-serif",
                          fontSize: 13,
                          fontWeight: checked ? 700 : 400,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {sectionTitle('Jak jsem se dozvěděl o MapaFarem')}
                <select
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  value={profile.howFound}
                  onChange={e => update('howFound', e.target.value)}
                >
                  <option value="">Vyberte možnost</option>
                  {HOW_FOUND_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
                  Notifikace
                </h2>
                <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
                  Kdy vás chceme upozornit?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                  {NOTIF_ITEMS.map(item => {
                    const on = profile.notifications[item.key];
                    return (
                      <div key={item.key} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        border: '1px solid #E8E0D0',
                        borderRadius: 12,
                        background: '#FAFAFA',
                      }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                        <span style={{ flex: 1, fontSize: 14, color: '#1A1A1A', lineHeight: 1.4 }}>{item.label}</span>
                        {/* Toggle */}
                        <div
                          onClick={() => toggleNotif(item.key)}
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 12,
                            background: on ? '#2D5016' : '#E8E0D0',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.25s',
                            flexShrink: 0,
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            left: on ? 22 : 2,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'white',
                            transition: 'left 0.25s',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Completion card */}
                <div style={{
                  background: '#F0F7EC',
                  border: '1px solid #C8D8B8',
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#2D5016' }}>Kompletnost profilu</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#C8963E' }}>{score}%</span>
                  </div>
                  <div style={{ height: 8, background: '#D4E8C8', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{
                      height: '100%',
                      width: `${score}%`,
                      background: '#C8963E',
                      borderRadius: 4,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#2D5016', fontWeight: 500 }}>{completionMsg}</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid #E8E0D0',
            }}>
              <button
                onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/profil')}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #E8E0D0',
                  borderRadius: 9999,
                  background: 'white',
                  color: '#6B7280',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {step === 1 ? 'Zrušit' : '← Zpět'}
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  style={{
                    padding: '12px 28px',
                    border: 'none',
                    borderRadius: 9999,
                    background: '#C8963E',
                    color: 'white',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(200,150,62,0.3)',
                  }}
                >
                  Pokračovat →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '12px 28px',
                    border: 'none',
                    borderRadius: 9999,
                    background: saving ? '#aaa' : '#C8963E',
                    color: 'white',
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(200,150,62,0.3)',
                  }}
                >
                  {saving ? 'Ukládám...' : 'Uložit profil ✓'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
