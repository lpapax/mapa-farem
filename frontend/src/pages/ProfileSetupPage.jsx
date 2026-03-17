// frontend/src/pages/ProfileSetupPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../supabase.js';

const STORAGE_KEY = 'mapafarem_profile_setup';

const defaultProfile = {
  avatar: '',
  firstName: '', lastName: '',
  city: '', zip: '', region: '',
  dietType: '',
  allergies: [],
  certifications: [],
  frequency: '',
  categories: [],
  budget: '',
  values: [],
  howFound: '',
  notifications: { nearbyFarm: true, seasonalProduct: true, favoriteSale: true, newMarket: true, weeklyTip: true },
};

const REGIONS = [
  'Hlavní město Praha','Středočeský kraj','Jihočeský kraj','Plzeňský kraj',
  'Karlovarský kraj','Ústecký kraj','Liberecký kraj','Královéhradecký kraj',
  'Pardubický kraj','Kraj Vysočina','Jihomoravský kraj','Olomoucký kraj',
  'Zlínský kraj','Moravskoslezský kraj',
];

const AVATARS = ['🐄','🐓','🐑','🐝','🦊','🐇','🐖','🌾'];

const DIETS = [
  {emoji:'🍽️', label:'Klasická strava', value:'classic'},
  {emoji:'🐟', label:'Pescetarián', value:'pescetarian'},
  {emoji:'🥚', label:'Vegetarián', value:'vegetarian'},
  {emoji:'🌱', label:'Vegan', value:'vegan'},
  {emoji:'🌾', label:'Bezlepkový', value:'glutenfree'},
  {emoji:'🥛', label:'Bez laktózy', value:'lactosefree'},
  {emoji:'💪', label:'Vysokoproteinová', value:'highprotein'},
  {emoji:'🫀', label:'Srdečně zdravá', value:'hearthealthy'},
];

const ALLERGENS = ['Ořechy','Lepek','Laktóza','Vejce','Sója','Ryby','Korýši','Hořčice','Celer'];

const CERTS = [
  {emoji:'🌿', label:'BIO certifikace', value:'bio'},
  {emoji:'🐄', label:'Volný chov', value:'freerange'},
  {emoji:'🌍', label:'Lokální (do 50 km)', value:'local'},
  {emoji:'♻️', label:'Zero waste', value:'zerowaste'},
  {emoji:'🤝', label:'Fair trade', value:'fairtrade'},
];

const FREQUENCIES = [
  {label:'Každý týden', sublabel:'Jsem pravidelný zákazník', value:'weekly', emoji:'🗓️'},
  {label:'Každé 2 týdny', sublabel:'Nakupuji pravidelně', value:'biweekly', emoji:'📅'},
  {label:'Jednou měsíčně', sublabel:'Příležitostně navštívím', value:'monthly', emoji:'🌙'},
  {label:'Příležitostně', sublabel:'Když se naskytne možnost', value:'occasional', emoji:'🎲'},
];

const CATEGORIES = [
  {emoji:'🥕', label:'Zelenina a ovoce', value:'veggie'},
  {emoji:'🥩', label:'Maso a uzeniny', value:'meat'},
  {emoji:'🧀', label:'Mléčné výrobky', value:'dairy'},
  {emoji:'🍯', label:'Med a včelí', value:'honey'},
  {emoji:'🥚', label:'Vejce', value:'eggs'},
  {emoji:'🍷', label:'Víno a nápoje', value:'wine'},
  {emoji:'🌿', label:'Bylinky a koření', value:'herbs'},
  {emoji:'🍓', label:'Sezónní ovoce', value:'seasonal'},
  {emoji:'🥖', label:'Pečivo', value:'bakery'},
];

const BUDGETS = ['Do 500 Kč','500–1 000 Kč','1 000–2 000 Kč','2 000+ Kč'];

const VALUES = [
  {emoji:'🌱', label:'Podpora lokálních farmářů', desc:'Každý nákup pomáhá místní komunitě', value:'local'},
  {emoji:'🐾', label:'Welfare zvířat', desc:'Farmy s etickým chovem', value:'welfare'},
  {emoji:'🌍', label:'Ekologická stopa', desc:'Méně transportu, méně emisí', value:'eco'},
  {emoji:'💚', label:'Zdravý životní styl', desc:'Čerstvé, přirozené potraviny', value:'health'},
  {emoji:'👨‍👩‍👧', label:'Rodinné farmy', desc:'Malé farmy s osobním přístupem', value:'family'},
  {emoji:'🔬', label:'Transparentnost původu', desc:'Vím, odkud jídlo pochází', value:'transparency'},
  {emoji:'💰', label:'Férová cena pro farmáře', desc:'Bez prostředníků, přímý prodej', value:'fairprice'},
];

const HOW_OPTIONS = [
  'Google vyhledávání','Sociální sítě (Instagram/Facebook)',
  'Doporučení od přítele','Článek nebo blog','Farmářský trh','Jinak',
];

const NOTIF_OPTIONS = [
  {key:'nearbyFarm', emoji:'🔔', label:'Nová farma ve mém okolí', sub:'Do 30 km od mého města'},
  {key:'seasonalProduct', emoji:'🌱', label:'Sezónní produkt k dispozici', sub:'Produkty které mám rád'},
  {key:'favoriteSale', emoji:'❤️', label:'Akce u oblíbené farmy', sub:'Slevy a novinky'},
  {key:'newMarket', emoji:'📅', label:'Nový farmářský trh v kraji', sub:'Víkendové trhy'},
  {key:'weeklyTip', emoji:'🗓️', label:'Týdenní tip sezóny', sub:'Co je právě čerstvé'},
];

const STEP_LABELS = ['Identita','Stravování','Nákupy','Hodnoty','Notifikace'];

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        background: checked ? '#2D5016' : '#D1D5DB',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1.5px solid #E8E0D0',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'Inter',sans-serif",
  color: '#1A1A1A',
  background: 'white',
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

export default function ProfileSetupPage() {
  useSEO({
    title: 'Nastavení profilu — MapaFarem.cz',
    description: 'Personalizujte své preference pro lepší doporučení farem.',
  });

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);

  const [profile, setProfile] = useState(() => {
    try {
      return { ...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const update = (key, value) => setProfile(p => ({ ...p, [key]: value }));

  const toggleArray = (key, value) => {
    setProfile(p => {
      const arr = p[key] || [];
      return { ...p, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] };
    });
  };

  const toggleNotif = (key) => {
    setProfile(p => ({ ...p, notifications: { ...p.notifications, [key]: !p.notifications[key] } }));
  };

  const completionPct = () => {
    let s = 0;
    if (profile.avatar) s += 10;
    if (profile.firstName && profile.lastName) s += 10;
    if (profile.city) s += 10;
    if (profile.region) s += 10;
    if (profile.dietType) s += 15;
    if ((profile.categories || []).length > 0) s += 15;
    if ((profile.values || []).length > 0) s += 15;
    if (profile.budget) s += 15;
    return Math.min(s, 100);
  };

  function goNext() { setDirection(1); setStep(s => s + 1); }
  function goBack() { setDirection(-1); setStep(s => s - 1); }

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
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
          profile_completion_pct: completionPct(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }
      navigate('/profil');
    } catch (err) {
      console.error('Profile save error:', err);
      navigate('/profil');
    } finally {
      setSaving(false);
    }
  };

  const pct = completionPct();
  const circumference = 2 * Math.PI * 40; // ~251
  const strokeDashoffset = circumference * (1 - pct / 100);
  const circleColor = pct < 40 ? '#EF4444' : pct < 80 ? '#F59E0B' : '#2D5016';
  const completionMsg = pct < 40
    ? 'Dokonči profil pro lepší doporučení'
    : pct <= 80
      ? 'Skoro tam! Ještě pár kroků'
      : 'Perfektní profil!';
  const completionMsgColor = pct < 40 ? '#EF4444' : pct <= 80 ? '#F59E0B' : '#2D5016';

  // ---- STEP CONTENT ----

  function Step1() {
    return (
      <div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2D5016', margin: '0 0 6px' }}>
          Kdo jsi?
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 28px' }}>
          Pomůžeš nám doporučit správné farmy pro tebe
        </p>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Tvůj avatar</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {AVATARS.map(a => (
            <motion.div
              key={a}
              whileTap={{ scale: 0.9 }}
              onClick={() => update('avatar', a)}
              style={{
                width: '100%', aspectRatio: '1', fontSize: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 16, cursor: 'pointer',
                background: profile.avatar === a ? 'rgba(200,150,62,0.1)' : '#FAF7F2',
                border: profile.avatar === a ? '2px solid #C8963E' : '2px solid transparent',
                transform: profile.avatar === a ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            >
              {a}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Jméno</label>
            <input style={inputStyle} value={profile.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Jana" />
          </div>
          <div>
            <label style={labelStyle}>Příjmení</label>
            <input style={inputStyle} value={profile.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Nováková" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Město</label>
            <input style={inputStyle} value={profile.city} onChange={e => update('city', e.target.value)} placeholder="Praha" />
          </div>
          <div>
            <label style={labelStyle}>PSČ</label>
            <input style={inputStyle} value={profile.zip} onChange={e => update('zip', e.target.value)} placeholder="110 00" />
          </div>
        </div>

        <div style={{ position: 'relative', marginBottom: 8 }}>
          <label style={labelStyle}>Kraj</label>
          <select
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 40 }}
            value={profile.region}
            onChange={e => update('region', e.target.value)}
          >
            <option value="">Vyberte kraj</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: 38, color: '#6B7280', pointerEvents: 'none' }} />
        </div>
      </div>
    );
  }

  function Step2() {
    return (
      <div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2D5016', margin: '0 0 6px' }}>
          Stravování
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
          Jak se stravuješ?
        </p>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Typ stravování</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
          {DIETS.map(opt => {
            const sel = profile.dietType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => update('dietType', opt.value)}
                style={{
                  padding: '14px 8px', border: `2px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  background: sel ? '#2D5016' : '#FAFAFA',
                  color: sel ? 'white' : '#1A1A1A',
                  fontFamily:"'Inter',sans-serif", transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Alergie</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {ALLERGENS.map(a => {
            const sel = (profile.allergies || []).includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleArray('allergies', a)}
                style={{
                  padding: '8px 16px', borderRadius: 9999, cursor: 'pointer',
                  border: `1.5px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                  background: sel ? '#2D5016' : 'white',
                  color: sel ? 'white' : '#1A1A1A',
                  fontFamily:"'Inter',sans-serif", fontSize: 13,
                  transition: 'all 0.15s',
                }}
              >{a}</button>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Preferované certifikace</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {CERTS.map(opt => {
            const sel = (profile.certifications || []).includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleArray('certifications', opt.value)}
                style={{
                  padding: '14px 8px', border: `2px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  background: sel ? '#2D5016' : '#FAFAFA',
                  color: sel ? 'white' : '#1A1A1A',
                  fontFamily:"'Inter',sans-serif", transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function Step3() {
    return (
      <div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2D5016', margin: '0 0 6px' }}>
          Nákupní zvyky
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
          Jak rád nakupuješ od farmářů?
        </p>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Jak často nakupuji</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {FREQUENCIES.map(opt => {
            const sel = profile.frequency === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => update('frequency', opt.value)}
                style={{
                  padding: 20, border: `2px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  background: sel ? 'rgba(45,80,22,0.08)' : '#FAFAFA',
                  fontFamily:"'Inter',sans-serif", transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: sel ? '#2D5016' : '#1A1A1A' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: sel ? '#2D5016' : '#6B7280', marginTop: 2 }}>{opt.sublabel}</div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Co nejčastěji kupuji</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {CATEGORIES.map(opt => {
            const sel = (profile.categories || []).includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleArray('categories', opt.value)}
                style={{
                  padding: '12px 8px', border: `2px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  background: sel ? '#2D5016' : '#FAFAFA',
                  color: sel ? 'white' : '#1A1A1A',
                  fontFamily:"'Inter',sans-serif", transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{opt.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Průměrný měsíční rozpočet</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {BUDGETS.map(b => {
            const sel = profile.budget === b;
            return (
              <button
                key={b}
                onClick={() => update('budget', b)}
                style={{
                  padding: '10px 20px', borderRadius: 9999, cursor: 'pointer',
                  border: `1.5px solid ${sel ? '#C8963E' : '#E8E0D0'}`,
                  background: sel ? '#C8963E' : 'white',
                  color: sel ? 'white' : '#1A1A1A',
                  fontFamily:"'Inter',sans-serif", fontSize: 14, fontWeight: sel ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >{b}</button>
            );
          })}
        </div>
      </div>
    );
  }

  function Step4() {
    return (
      <div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2D5016', margin: '0 0 6px' }}>
          Hodnoty
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
          Co je pro tebe při nakupování důležité?
        </p>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Vyber vše, co ti záleží</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {VALUES.map(opt => {
            const sel = (profile.values || []).includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleArray('values', opt.value)}
                style={{
                  padding: 16,
                  border: `2px solid ${sel ? '#2D5016' : '#E8E0D0'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: sel ? 'rgba(45,80,22,0.06)' : '#FAFAFA',
                  fontFamily:"'Inter',sans-serif", transition: 'all 0.15s',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sel ? '#2D5016' : '#1A1A1A' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Jak jsi se dozvěděl o MapaFarem</div>
        <div style={{ position: 'relative' }}>
          <select
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 40 }}
            value={profile.howFound}
            onChange={e => update('howFound', e.target.value)}
          >
            <option value="">Vyberte možnost</option>
            {HOW_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: 14, color: '#6B7280', pointerEvents: 'none' }} />
        </div>
      </div>
    );
  }

  function Step5() {
    return (
      <div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2D5016', margin: '0 0 6px' }}>
          Notifikace
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
          Kdy chceš být upozorněn?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {NOTIF_OPTIONS.map(item => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              border: '1px solid #E8E0D0',
              borderRadius: 12, background: '#FAFAFA',
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{item.sub}</div>
              </div>
              <Toggle
                checked={!!profile.notifications[item.key]}
                onChange={val => setProfile(p => ({ ...p, notifications: { ...p.notifications, [item.key]: val } }))}
              />
            </div>
          ))}
        </div>

        {/* Circular progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <svg width={100} height={100} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={40} fill="none" stroke="#E8E0D0" strokeWidth={8} />
            <circle
              cx={50} cy={50} r={40} fill="none"
              stroke={circleColor} strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text x="50" y="50" textAnchor="middle" dy="0.35em"
              style={{ fontSize: 18, fontWeight: 700, fill: circleColor, fontFamily:"'Inter',sans-serif" }}>
              {pct}%
            </text>
          </svg>
          <div style={{ fontSize: 13, color: completionMsgColor, fontWeight: 600, marginTop: 8, textAlign: 'center' }}>
            {completionMsg}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px 28px',
            background: saving ? '#aaa' : '#C8963E',
            color: 'white', borderRadius: 9999, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily:"'Inter',sans-serif", fontSize: 16, fontWeight: 700,
            boxShadow: '0 4px 16px rgba(200,150,62,0.35)',
            transition: 'all 0.15s',
          }}
        >
          {saving ? 'Ukládám...' : 'Dokončit a zobrazit moje farmy →'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily:"'Inter',sans-serif", display: 'flex' }}>

      {/* LEFT COLUMN */}
      <div style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '32px 24px 60px', display: 'flex', flexDirection: 'column' }}>

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, userSelect: 'none' }}
        >
          <span style={{ fontSize: 24 }}>🌾</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#2D5016' }}>MapaFarem.cz</span>
        </div>

        {/* Step progress bar */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const isDone = num < step;
              const isActive = num === step;
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: isDone ? '#2D5016' : isActive ? '#C8963E' : '#E8E0D0',
                      color: isDone || isActive ? 'white' : '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, transition: 'all 0.3s', flexShrink: 0,
                    }}>
                      {isDone ? '✓' : num}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: isActive ? 700 : 400,
                      color: isActive ? '#C8963E' : isDone ? '#2D5016' : '#6B7280',
                      whiteSpace: 'nowrap',
                    }}>{label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: isDone ? '#2D5016' : '#E8E0D0',
                      marginTop: 15, transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Animated step content */}
        <div style={{
          background: 'white', border: '1px solid #E8E0D0', borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, flex: 1,
        }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {step === 1 && <Step1 />}
              {step === 2 && <Step2 />}
              {step === 3 && <Step3 />}
              {step === 4 && <Step4 />}
              {step === 5 && <Step5 />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons (not on step 5, which has its own save) */}
          {step < 5 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 32, paddingTop: 24, borderTop: '1px solid #E8E0D0',
            }}>
              <button
                onClick={step > 1 ? goBack : () => navigate('/profil')}
                style={{
                  padding: '12px 24px', border: '1px solid #E8E0D0', borderRadius: 9999,
                  background: 'white', color: '#6B7280', fontFamily:"'Inter',sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {step === 1 ? 'Zrušit' : '← Zpět'}
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={goNext}
                  style={{
                    padding: '12px 28px', border: 'none', borderRadius: 9999,
                    background: '#C8963E', color: 'white', fontFamily:"'Inter',sans-serif",
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(200,150,62,0.3)',
                  }}
                >
                  Pokračovat →
                </button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #E8E0D0' }}>
              <button
                onClick={goBack}
                style={{
                  padding: '12px 24px', border: '1px solid #E8E0D0', borderRadius: 9999,
                  background: 'white', color: '#6B7280', fontFamily:"'Inter',sans-serif",
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ← Zpět
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT DECORATIVE COLUMN - hidden on mobile */}
      <div style={{
        width: 380, background: '#2D5016', padding: '60px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        position: 'sticky', top: 0, height: '100vh',
        '@media (max-width: 768px)': { display: 'none' },
      }} className="profile-setup-deco">
        <style>{`
          @media (max-width: 860px) { .profile-setup-deco { display: none !important; } }
          @keyframes floatFarm1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
          @keyframes floatFarm2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
          @keyframes floatFarm3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
            <span style={{ fontSize: 48, animation: 'floatFarm1 3s ease-in-out infinite' }}>🌾</span>
            <span style={{ fontSize: 56, animation: 'floatFarm2 2.5s ease-in-out infinite', animationDelay: '0.5s' }}>🐄</span>
            <span style={{ fontSize: 44, animation: 'floatFarm3 3.5s ease-in-out infinite', animationDelay: '1s' }}>🌻</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 30 }}>
            <span style={{ fontSize: 36, animation: 'floatFarm2 4s ease-in-out infinite', animationDelay: '0.3s' }}>🍎</span>
            <span style={{ fontSize: 40, animation: 'floatFarm1 2.8s ease-in-out infinite', animationDelay: '0.8s' }}>🥕</span>
            <span style={{ fontSize: 34, animation: 'floatFarm3 3.2s ease-in-out infinite', animationDelay: '0.2s' }}>🍯</span>
          </div>
        </div>

        <blockquote style={{
          fontFamily:"'Playfair Display',serif",
          fontStyle: 'italic',
          fontSize: 18,
          color: '#FAF7F2',
          textAlign: 'center',
          lineHeight: 1.6,
          margin: 0,
          opacity: 0.9,
        }}>
          "Každý nákup u lokálního farmáře je krok k lepší budoucnosti"
        </blockquote>
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(250,247,242,0.5)', letterSpacing: 1 }}>
          MapaFarem.cz
        </div>
      </div>
    </div>
  );
}
