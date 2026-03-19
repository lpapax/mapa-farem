// frontend/src/pages/DashboardPage.jsx
// Farmer dashboard — MapaFarem.cz
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import {
  Eye, ShoppingBag, Heart, Star,
  PlusCircle, Leaf, Edit, Package, Camera,
} from 'lucide-react';
import { supabase } from '../supabase.js';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  cream:  '#FAF7F2',
  creamDark: '#F5EDE0',
  terra:  '#BF5B3D',
  green:  '#2D5016',
  dark:   '#1A1A1A',
  gold:   '#C8963E',
  brown:  '#2C1810',
  white:  '#FFFFFF',
  sub:    '#7A6A58',
  border: 'rgba(44,24,16,.10)',
  shadow: '0 2px 12px rgba(26,45,24,.08)',
  shadowMd: '0 4px 24px rgba(26,45,24,.12)',
};

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, emoji: '🥕', name: 'Mrkev (1 kg)', season: ['Srp','Říj'], active: true },
  { id: 2, emoji: '🥔', name: 'Brambory (5 kg)', season: ['Čvc','Říj'], active: true },
  { id: 3, emoji: '🍅', name: 'Rajčata Cherry', season: ['Čvc','Srp'], active: true },
  { id: 4, emoji: '🥬', name: 'Špenát (svazek)', season: ['Dub','Kvě'], active: false },
  { id: 5, emoji: '🍯', name: 'Med lipový (0,5 l)', season: ['Čvc','Srp'], active: true },
];

const MOCK_ACTIVITY = [
  { id: 1, icon: '🔍', text: 'Nová návštěva z Brna', time: 'před 2 hodinami' },
  { id: 2, icon: '❤️', text: 'Jana K. přidala vaši farmu do oblíbených', time: 'včera' },
  { id: 3, icon: '⭐', text: 'Nová recenze (5★) od Petra M.', time: 'před 3 dny' },
  { id: 4, icon: '🔍', text: 'Nová návštěva z Prahy', time: 'před 4 dny' },
  { id: 5, icon: '❤️', text: 'Martin V. přidal vaši farmu do oblíbených', time: 'před týdnem' },
];

const MOCK_ORDERS = [
  { id: 'OBJ-001', customer: 'Jana Nováková', items: 'Mrkev × 2, Brambory × 1', total: '180 Kč', status: 'nova',      date: '15. 3. 2026' },
  { id: 'OBJ-002', customer: 'Pavel Šimánek', items: 'Med lipový × 1',           total:  '95 Kč', status: 'potvrzena', date: '14. 3. 2026' },
  { id: 'OBJ-003', customer: 'Lucie Marková',  items: 'Rajčata Cherry × 3',       total: '210 Kč', status: 'dokoncena', date: '12. 3. 2026' },
  { id: 'OBJ-004', customer: 'Tomáš Blažek',   items: 'Špenát × 2, Mrkev × 1',   total: '140 Kč', status: 'nova',      date: '11. 3. 2026' },
];

const MOCK_SEASONAL = [
  { id: 1, emoji: '🌱', title: 'Jarní zelenina',     range: 'Dub – Kvě 2026', discount: '−15%' },
  { id: 2, emoji: '🍓', title: 'Letní jahody',        range: 'Čvn – Čvc 2026', discount: null   },
  { id: 3, emoji: '🎃', title: 'Podzimní dýně',       range: 'Zář – Říj 2026', discount: '−10%' },
  { id: 4, emoji: '🍎', title: 'Jablečná sklizeň',    range: 'Říj – Lis 2026', discount: null   },
];

const CHART_DATA = [
  { day: 'Po', views: 18 },
  { day: 'Út', views: 24 },
  { day: 'St', views: 31 },
  { day: 'Čt', views: 22 },
  { day: 'Pá', views: 41 },
  { day: 'So', views: 55 },
  { day: 'Ne', views: 43 },
];

const EMOJI_OPTIONS = ['🌿', '🥕', '🥔', '🍅', '🥬', '🍯', '🥛', '🧀', '🥚', '🍎', '🌽', '🫑'];
const MONTHS = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function calcCompletion(user, products) {
  const fields = [
    { key: 'name',     label: '+ Přidat název',      done: !!(user?.name) },
    { key: 'email',    label: '+ Přidat email',       done: !!(user?.email) },
    { key: 'phone',    label: '+ Přidat telefon',     done: false },
    { key: 'website',  label: '+ Přidat web',         done: false },
    { key: 'desc',     label: '+ Přidat popis',       done: false },
    { key: 'products', label: '+ Přidat produkt',     done: products.length > 0 },
    { key: 'photo',    label: '+ Přidat foto',        done: false },
  ];
  const done = fields.filter(f => f.done).length;
  const pct = Math.round((done / fields.length) * 100);
  const missing = fields.filter(f => !f.done);
  return { pct, missing };
}

const maxViews = Math.max(...CHART_DATA.map(d => d.views));

// ── Styles helpers ───────────────────────────────────────────────────────────
const inputSt = {
  width: '100%', padding: '10px 13px', border: `1.5px solid ${C.border}`,
  borderRadius: 9, fontSize: 14, fontFamily: "'Inter',sans-serif",
  outline: 'none', background: C.white, color: C.brown, boxSizing: 'border-box',
};

function Btn({ children, color = C.green, onClick, style = {}, variant = 'filled' }) {
  const base = {
    padding: '10px 20px', borderRadius: 10,
    fontFamily: "'Inter',sans-serif", fontWeight: 700,
    fontSize: 14, cursor: 'pointer', transition: 'opacity .15s',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  };

  let variantStyles = {};
  if (variant === 'filled') {
    variantStyles = { background: color, color: C.white, border: 'none' };
  } else if (variant === 'outlined-gold') {
    variantStyles = { background: 'transparent', color: C.gold, border: `2px solid ${C.gold}` };
  } else if (variant === 'outlined-white') {
    variantStyles = { background: 'transparent', color: C.dark, border: `2px solid ${C.border}` };
  }

  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variantStyles, ...style }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: '20px 22px',
      boxShadow: C.shadow, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700,
      color: C.dark, marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

// Status badge for orders
const ORDER_STATUS = {
  nova:       { label: 'Nová',      bg: 'rgba(200,150,62,.15)', color: C.gold  },
  potvrzena:  { label: 'Potvrzená', bg: 'rgba(45,80,22,.13)',   color: C.green },
  dokoncena:  { label: 'Dokončena', bg: 'rgba(0,0,0,.07)',       color: '#6B7280' },
};

function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.nova;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 11px', borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 700, fontFamily: "'Inter',sans-serif",
      letterSpacing: '.02em',
    }}>
      {s.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Products state
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', emoji: '🌿', season: [],
  });

  // Seasonal offers state
  const [seasonalOffers, setSeasonalOffers] = useState(MOCK_SEASONAL);

  // Farm photos state
  const [farmPhotos, setFarmPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const photoInputRef = useRef(null);

  // Derive a stable farm ID from the logged-in user's id
  const farmId = user?.farmId || user?.id || 'demo';

  // Load existing photos from Supabase Storage on mount / when farmId changes
  useEffect(() => {
    async function loadPhotos() {
      try {
        const { data, error } = await supabase.storage
          .from('farm-photos')
          .list(`farm-${farmId}/`);
        if (error) throw error;
        if (data) {
          setFarmPhotos(
            data
              .filter(f => f.name && f.name !== '.emptyFolderPlaceholder')
              .map(f =>
                supabase.storage
                  .from('farm-photos')
                  .getPublicUrl(`farm-${farmId}/${f.name}`).data.publicUrl
              )
          );
        }
      } catch (err) {
        // Silently ignore load errors — bucket may not exist yet
      }
    }
    loadPhotos();
  }, [farmId]);

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (farmPhotos.length + files.length > 12) {
      setUploadError('Maximálně 12 fotek. Nejdříve smažte stávající fotky.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Update progress label via a temporary state trick — we reuse uploadError as progress text
        setUploadError(`Nahrávám ${i + 1}/${files.length}…`);
        const path = `farm-${farmId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('farm-photos')
          .upload(path, file, { upsert: false });
        if (error) throw error;
      }
      setUploadError('');
      // Reload the photo list
      const { data, error: listErr } = await supabase.storage
        .from('farm-photos')
        .list(`farm-${farmId}/`);
      if (listErr) throw listErr;
      if (data) {
        setFarmPhotos(
          data
            .filter(f => f.name && f.name !== '.emptyFolderPlaceholder')
            .map(f =>
              supabase.storage
                .from('farm-photos')
                .getPublicUrl(`farm-${farmId}/${f.name}`).data.publicUrl
            )
        );
      }
    } catch (err) {
      setUploadError(err.message || 'Nahrávání selhalo. Zkuste to znovu.');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after a failure
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  async function deletePhoto(photoUrl) {
    // Extract the storage path from the public URL
    const marker = `/farm-photos/`;
    const idx = photoUrl.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(photoUrl.slice(idx + marker.length));
    try {
      const { error } = await supabase.storage
        .from('farm-photos')
        .remove([path]);
      if (error) throw error;
      setFarmPhotos(prev => prev.filter(u => u !== photoUrl));
    } catch (err) {
      setUploadError(err.message || 'Smazání selhalo.');
    }
  }

  const { pct, missing } = calcCompletion(user, products);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function toggleMonth(month) {
    setNewProduct(p => ({
      ...p,
      season: p.season.includes(month)
        ? p.season.filter(m => m !== month)
        : [...p.season, month],
    }));
  }

  function addProduct() {
    if (!newProduct.name.trim()) return;
    if (editingId !== null) {
      setProducts(prev => prev.map(p =>
        p.id === editingId ? { ...p, ...newProduct } : p
      ));
      setEditingId(null);
    } else {
      setProducts(prev => [...prev, { ...newProduct, id: Date.now(), active: true }]);
    }
    setNewProduct({ name: '', emoji: '🌿', season: [] });
    setShowAddForm(false);
  }

  function startEdit(p) {
    setNewProduct({ name: p.name, emoji: p.emoji, season: [...p.season] });
    setEditingId(p.id);
    setShowAddForm(true);
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  function toggleActive(id) {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  }

  function deleteSeasonalOffer(id) {
    setSeasonalOffers(prev => prev.filter(o => o.id !== id));
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Inter',sans-serif" }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(191,91,61,.3); border-radius: 99px; }
        @media(max-width:480px){
          .dash-photo-grid{grid-template-columns:repeat(2,1fr)!important;}
          .dash-stats-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>

      {/* ── 1. Header / Nav ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,247,242,.96)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        height: 62, display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: 16,
      }}>
        <span
          onClick={() => navigate('/')}
          style={{
            fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 900,
            color: C.dark, cursor: 'pointer', flex: 1, userSelect: 'none',
          }}
        >
          🌾 Mapa<span style={{ color: C.terra }}>Farem</span>
        </span>
        <span style={{ fontSize: 14, color: C.sub, fontWeight: 500 }}>
          {user?.name || 'Farmář'}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '7px 16px', background: 'none', border: `1.5px solid ${C.border}`,
            borderRadius: 9, fontSize: 13, fontWeight: 600, color: C.terra, cursor: 'pointer',
            fontFamily: "'Inter',sans-serif",
          }}
        >
          Odhlásit
        </button>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900,
            color: C.dark, lineHeight: 1.2, marginBottom: 4,
          }}>
            Dashboard farmáře
          </h1>
          <p style={{ color: C.sub, fontSize: 14 }}>
            Spravujte svůj profil, produkty a sledujte statistiky.
          </p>
        </div>

        {/* ── 2. Profile Completion Progress Bar ──────────────────────── */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionTitle>Dokončenost profilu</SectionTitle>
            <span style={{
              fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700,
              color: pct >= 80 ? C.green : pct >= 50 ? C.gold : C.terra,
            }}>
              {pct}%
            </span>
          </div>
          {/* Bar track */}
          <div style={{
            height: 10, background: 'rgba(0,0,0,.07)', borderRadius: 99,
            overflow: 'hidden', marginBottom: 14,
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${pct}%`,
              background: pct >= 80
                ? `linear-gradient(90deg, ${C.green}, #5F8050)`
                : pct >= 50
                  ? `linear-gradient(90deg, ${C.gold}, #D4A84B)`
                  : `linear-gradient(90deg, ${C.terra}, #D4745A)`,
              transition: 'width .6s ease',
            }} />
          </div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>
            Profil dokončen z {pct}% — doplňte zbývající informace pro lepší viditelnost
          </div>
          {/* Missing chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {missing.map(item => (
              <button
                key={item.key}
                onClick={() => navigate('/dashboard/profil')}
                style={{
                  padding: '5px 13px', background: 'rgba(200,151,58,.12)',
                  border: `1.5px solid rgba(200,151,58,.4)`, borderRadius: 99,
                  fontSize: 12, fontWeight: 600, color: C.gold, cursor: 'pointer',
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        {/* ── 3. Stats Cards Row ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          {[
            {
              Icon: Eye,
              value: '247',
              label: 'Zobrazení',
              trend: '+12%',
            },
            {
              Icon: ShoppingBag,
              value: '12',
              label: 'Objednávky',
              trend: '+8%',
            },
            {
              Icon: Heart,
              value: '38',
              label: 'Oblíbení',
              trend: '+5%',
            },
            {
              Icon: Star,
              value: '4.8',
              label: 'Hodnocení',
              trend: '+0.3',
            },
          ].map(card => (
            <div key={card.label} style={{
              background: C.cream,
              border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '24px',
              boxShadow: C.shadow,
            }}>
              <div style={{ marginBottom: 12 }}>
                <card.Icon size={22} color={C.gold} strokeWidth={2} />
              </div>
              <div style={{
                fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700,
                color: C.gold, lineHeight: 1,
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 6, fontWeight: 500 }}>
                {card.label}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: C.green, marginTop: 10,
                display: 'inline-block',
              }}>
                {card.trend} oproti minulému měsíci
              </div>
            </div>
          ))}
        </div>

        {/* ── 4. Quick Actions Row ───────────────────────────────────────── */}
        <Card style={{ marginBottom: 24 }}>
          <SectionTitle>Rychlé akce</SectionTitle>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Btn
              variant="filled"
              color={C.green}
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setNewProduct({ name: '', emoji: '🌿', season: [] });
                // Scroll to products section
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <PlusCircle size={16} />
              Přidat produkt
            </Btn>
            <Btn
              variant="outlined-gold"
              onClick={() => {
                document.getElementById('seasonal-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <Leaf size={16} color={C.gold} />
              Nová sezónní nabídka
            </Btn>
            <Btn
              variant="outlined-white"
              onClick={() => navigate('/dashboard/profil')}
            >
              <Edit size={16} color={C.dark} />
              Upravit profil farmy
            </Btn>
          </div>
        </Card>

        {/* ── 5. Recent Orders Table ─────────────────────────────────────── */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Poslední objednávky</SectionTitle>
            {MOCK_ORDERS.length > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: C.sub,
                background: 'rgba(0,0,0,.05)', padding: '4px 10px', borderRadius: 99,
              }}>
                {MOCK_ORDERS.filter(o => o.status === 'nova').length} nové
              </span>
            )}
          </div>

          {MOCK_ORDERS.length === 0 ? (
            /* Empty state */
            <div style={{
              textAlign: 'center', padding: '48px 20px',
              color: C.sub,
            }}>
              <div style={{ marginBottom: 12, opacity: .4 }}>
                <Package size={48} color={C.sub} strokeWidth={1.5} />
              </div>
              <div style={{
                fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700,
                color: C.dark, marginBottom: 8,
              }}>
                Zatím žádné objednávky
              </div>
              <div style={{ fontSize: 13, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
                Přidejte produkty, aby vás zákazníci mohli snáze najít a objednat.
              </div>
              <Btn
                variant="filled"
                color={C.green}
                onClick={() => {
                  setShowAddForm(true);
                  setEditingId(null);
                  setNewProduct({ name: '', emoji: '🌿', season: [] });
                }}
              >
                <PlusCircle size={16} />
                Přidat produkt
              </Btn>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 1fr 90px 100px',
                gap: 12, padding: '8px 14px',
                borderBottom: `1.5px solid ${C.border}`,
                fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: '.05em',
              }}>
                <div>ČÍSLO</div>
                <div>ZÁKAZNÍK</div>
                <div>POLOŽKY</div>
                <div style={{ textAlign: 'right' }}>CELKEM</div>
                <div style={{ textAlign: 'center' }}>STAV</div>
              </div>

              {MOCK_ORDERS.map((order, i) => (
                <div
                  key={order.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr 1fr 90px 100px',
                    gap: 12, padding: '13px 14px', alignItems: 'center',
                    background: i % 2 === 0 ? C.cream : C.white,
                    borderBottom: i < MOCK_ORDERS.length - 1 ? `1px solid ${C.border}` : 'none',
                    borderRadius: i === 0 ? '8px 8px 0 0' : i === MOCK_ORDERS.length - 1 ? '0 0 8px 8px' : 0,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: 'monospace' }}>
                    {order.id}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{order.customer}</div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{order.date}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.sub }}>{order.items}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, textAlign: 'right' }}>{order.total}</div>
                  <div style={{ textAlign: 'center' }}>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── 6. Products Management Table ──────────────────────────────── */}
        <Card style={{ marginBottom: 24 }} id="products-section">
          <div id="products-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Moje produkty</SectionTitle>
            <Btn
              variant="filled"
              color={showAddForm && !editingId ? C.sub : C.green}
              onClick={() => {
                if (showAddForm && !editingId) {
                  setShowAddForm(false);
                } else {
                  setEditingId(null);
                  setNewProduct({ name: '', emoji: '🌿', season: [] });
                  setShowAddForm(true);
                }
              }}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {showAddForm && !editingId ? '✕ Zavřít' : '+ Přidat produkt'}
            </Btn>
          </div>

          {/* Inline add / edit form */}
          {showAddForm && (
            <div style={{
              background: C.cream, borderRadius: 12, padding: 18,
              marginBottom: 18, border: `1.5px solid rgba(200,151,58,.25)`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: C.dark }}>
                {editingId ? 'Upravit produkt' : '+ Nový produkt'}
              </div>

              {/* Emoji selector */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Emoji</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      onClick={() => setNewProduct(p => ({ ...p, emoji: em }))}
                      style={{
                        width: 40, height: 40, fontSize: 20, border: '2px solid',
                        borderColor: newProduct.emoji === em ? C.gold : C.border,
                        borderRadius: 9, background: newProduct.emoji === em ? 'rgba(200,151,58,.12)' : C.white,
                        cursor: 'pointer',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Název produktu *</div>
                <input
                  value={newProduct.name}
                  onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  placeholder="Např. Mrkev (1 kg)"
                  style={inputSt}
                  onKeyDown={e => e.key === 'Enter' && addProduct()}
                />
              </div>

              {/* Season checkboxes */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Sezóna dostupnosti</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MONTHS.map(m => (
                    <label
                      key={m}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', userSelect: 'none',
                        background: newProduct.season.includes(m) ? C.green : 'rgba(0,0,0,.06)',
                        color: newProduct.season.includes(m) ? C.white : C.sub,
                        border: '1.5px solid',
                        borderColor: newProduct.season.includes(m) ? C.green : 'transparent',
                        transition: 'all .15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={newProduct.season.includes(m)}
                        onChange={() => toggleMonth(m)}
                        style={{ display: 'none' }}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="filled" color={C.green} onClick={addProduct} style={{ padding: '9px 20px', fontSize: 13 }}>
                  {editingId ? 'Uložit' : 'Přidat'}
                </Btn>
                <button
                  onClick={() => { setShowAddForm(false); setEditingId(null); }}
                  style={{
                    padding: '9px 20px', background: 'none', border: `1.5px solid ${C.border}`,
                    borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: "'Inter',sans-serif",
                    color: C.sub,
                  }}
                >
                  Zrušit
                </button>
              </div>
            </div>
          )}

          {/* Products table */}
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🌿</div>
              <div style={{ fontWeight: 700 }}>Zatím žádné produkty</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 160px 100px 80px',
                gap: 12, padding: '8px 12px',
                borderBottom: `1.5px solid ${C.border}`,
                fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: '.05em',
              }}>
                <div></div>
                <div>NÁZEV</div>
                <div>SEZÓNA</div>
                <div>STAV</div>
                <div style={{ textAlign: 'right' }}>AKCE</div>
              </div>

              {products.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr 160px 100px 80px',
                    gap: 12, padding: '12px 12px', alignItems: 'center',
                    background: i % 2 === 0 ? C.cream : C.white,
                    borderBottom: i < products.length - 1 ? `1px solid ${C.border}` : 'none',
                    opacity: p.active ? 1 : 0.5, transition: 'opacity .2s',
                  }}
                >
                  <div style={{ fontSize: 26, textAlign: 'center' }}>{p.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.season.length > 0
                      ? p.season.map(m => (
                          <span
                            key={m}
                            style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 6px',
                              borderRadius: 99, background: 'rgba(45,80,22,.10)', color: C.green,
                            }}
                          >
                            {m}
                          </span>
                        ))
                      : <span style={{ fontSize: 12, color: C.sub }}>—</span>
                    }
                  </div>
                  <div>
                    <button
                      onClick={() => toggleActive(p.id)}
                      style={{
                        padding: '4px 12px', borderRadius: 99, border: 'none',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'Inter',sans-serif",
                        background: p.active ? 'rgba(45,80,22,.12)' : 'rgba(191,91,61,.12)',
                        color: p.active ? C.green : C.terra,
                      }}
                    >
                      {p.active ? '● aktivní' : '○ skryto'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => startEdit(p)}
                      title="Upravit"
                      style={{
                        width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 7,
                        background: C.white, cursor: 'pointer', fontSize: 14, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      title="Smazat"
                      style={{
                        width: 30, height: 30, border: `1px solid rgba(191,91,61,.25)`, borderRadius: 7,
                        background: 'rgba(191,91,61,.06)', cursor: 'pointer', fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.terra,
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── 7. Seasonal Offers Section ────────────────────────────────── */}
        <Card style={{ marginBottom: 24 }} id="seasonal-section">
          <div id="seasonal-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Sezónní nabídky</SectionTitle>
            <Btn
              variant="outlined-gold"
              onClick={() => {
                const title = window.prompt('Název nové sezónní nabídky:');
                if (title && title.trim()) {
                  setSeasonalOffers(prev => [...prev, {
                    id: Date.now(),
                    emoji: '🌿',
                    title: title.trim(),
                    range: 'Brzy',
                    discount: null,
                  }]);
                }
              }}
              style={{ padding: '7px 14px', fontSize: 13 }}
            >
              <PlusCircle size={15} color={C.gold} />
              Přidat nabídku
            </Btn>
          </div>

          {seasonalOffers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Zatím žádné sezónní nabídky</div>
              <div style={{ fontSize: 13 }}>Přidejte sezónní nabídku pro lepší viditelnost na mapě.</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 14,
            }}>
              {seasonalOffers.map(offer => (
                <div
                  key={offer.id}
                  style={{
                    background: C.cream,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: '18px 16px',
                    position: 'relative',
                  }}
                >
                  {/* Discount badge */}
                  {offer.discount && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      background: C.green, color: C.white,
                      fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 99,
                    }}>
                      {offer.discount}
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => deleteSeasonalOffer(offer.id)}
                    title="Odstranit"
                    style={{
                      position: 'absolute', bottom: 10, right: 12,
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: C.sub, opacity: 0.5,
                      padding: 2,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  >
                    🗑
                  </button>

                  <div style={{ fontSize: 32, marginBottom: 10 }}>{offer.emoji}</div>
                  <div style={{
                    fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700,
                    color: C.dark, marginBottom: 6, lineHeight: 1.3,
                    paddingRight: offer.discount ? 44 : 0,
                  }}>
                    {offer.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: C.sub, fontWeight: 500,
                  }}>
                    {offer.range}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── 8. Farm Photos ─────────────────────────────────────────────── */}
        <Card style={{ marginBottom: 24 }}>
          <SectionTitle>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Camera size={18} color={C.gold} strokeWidth={2} />
              Fotky farmy
            </span>
          </SectionTitle>

          {/* Max-photo warning */}
          {farmPhotos.length >= 12 && (
            <div style={{
              marginBottom: 14, padding: '8px 14px',
              background: 'rgba(191,91,61,.10)', borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: C.terra,
            }}>
              Maximálně 12 fotek — smažte stávající foto, abyste mohli přidat nové.
            </div>
          )}

          {/* Drop zone */}
          {farmPhotos.length < 12 && (
            <div style={{
              border: `2px dashed ${C.gold}`, borderRadius: 12,
              padding: '32px 20px', textAlign: 'center',
              marginBottom: 16,
              background: 'rgba(200,150,62,.04)',
            }}>
              <Camera size={32} color={C.gold} strokeWidth={1.5} style={{ marginBottom: 12, opacity: .7 }} />
              <div style={{ fontSize: 14, color: C.sub, marginBottom: 14 }}>
                Přetáhněte fotky sem nebo
              </div>
              <Btn
                variant="filled"
                color={C.gold}
                onClick={() => photoInputRef.current && photoInputRef.current.click()}
                style={{ fontSize: 13, padding: '9px 22px' }}
              >
                Vybrat soubory
              </Btn>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>
          )}

          {/* Progress / error pill */}
          {(uploadError || uploading) && (
            <div style={{
              display: 'inline-block', marginBottom: 16,
              padding: '6px 16px', borderRadius: 99,
              background: uploading
                ? 'rgba(45,80,22,.10)'
                : 'rgba(191,91,61,.12)',
              color: uploading ? C.green : C.terra,
              fontSize: 13, fontWeight: 600,
            }}>
              {uploading && !uploadError ? 'Nahrávám…' : uploadError}
            </div>
          )}

          {/* Photo grid */}
          {farmPhotos.length > 0 && (
            <div className="dash-photo-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}>
              {farmPhotos.map((url, i) => (
                <div key={url} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                  <img
                    src={url}
                    alt={`Fotka farmy ${i + 1}`}
                    style={{
                      width: '100%', height: 120,
                      objectFit: 'cover', display: 'block',
                    }}
                  />
                  {/* Delete button */}
                  <button
                    onClick={() => deletePhoto(url)}
                    title="Smazat fotku"
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(191,91,61,.90)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13, fontWeight: 700,
                      lineHeight: 1,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.terra}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(191,91,61,.90)'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {farmPhotos.length === 0 && !uploading && (
            <div style={{ textAlign: 'center', color: C.sub, fontSize: 13, paddingTop: 4 }}>
              Zatím žádné fotky. Nahrajte první fotografii vaší farmy.
            </div>
          )}
        </Card>

        {/* ── 9. Recent Activity Feed ─────────────────────────────────────── */}
        <Card style={{ marginBottom: 24 }}>
          <SectionTitle>Nedávná aktivita</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {MOCK_ACTIVITY.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '12px 0',
                  borderBottom: i < MOCK_ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 99, flexShrink: 0,
                  background: 'rgba(200,151,58,.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 9. Premium Upsell Banner ───────────────────────────────────── */}
        <div style={{
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
          background: `linear-gradient(135deg, ${C.gold} 0%, #A07020 100%)`,
          color: C.white, position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', right: -40, top: -40, width: 180, height: 180,
            borderRadius: '50%', background: 'rgba(255,255,255,.08)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 40, bottom: -60, width: 140, height: 140,
            borderRadius: '50%', background: 'rgba(255,255,255,.06)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900,
              marginBottom: 8,
            }}>
              Získejte 10× více zákazníků s prémiovým profilem
            </div>
            <div style={{ fontSize: 14, opacity: .9, marginBottom: 16 }}>
              Prémiový profil vám přináší:
            </div>
            <ul style={{
              display: 'flex', gap: 10, flexWrap: 'wrap', listStyle: 'none',
              marginBottom: 20,
            }}>
              {[
                'Prioritní zobrazení na mapě',
                'Fotogalerie až 20 fotek',
                'Vlastní sezónní nabídky',
                'Statistiky návštěv',
                'Odznak "Prémiová farma"',
              ].map(feat => (
                <li key={feat} style={{
                  fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,.15)',
                  padding: '4px 12px', borderRadius: 99,
                }}>
                  ✓ {feat}
                </li>
              ))}
            </ul>
            <Btn
              variant="filled"
              color={C.dark}
              onClick={() => navigate('/cenik')}
              style={{ fontSize: 15, padding: '12px 28px', background: C.dark }}
            >
              Upgradovat za 299 Kč/měsíc
            </Btn>
          </div>
        </div>

        {/* ── 10. Mini Analytics Chart ─────────────────────────────────────── */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <SectionTitle>Návštěvnost tento měsíc</SectionTitle>
              <div style={{ fontSize: 13, color: C.sub }}>
                Posledních 7 dní — počet zobrazení profilu
              </div>
            </div>
            <Btn
              variant="outlined-gold"
              onClick={() => {
                alert('Tato funkce je dostupná pouze v tarifech Professional a Enterprise. Upgradujte svůj profil pro odemčení.');
                navigate('/cenik');
              }}
              style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8 }}
            >
              Exportovat do PDF
            </Btn>
          </div>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            height: 120, padding: '0 4px',
          }}>
            {CHART_DATA.map((d) => {
              const barH = Math.round((d.views / maxViews) * 100);
              const isMax = d.views === maxViews;
              return (
                <div
                  key={d.day}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6, height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Value label on top of bar */}
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: isMax ? C.gold : C.sub,
                    opacity: isMax ? 1 : 0.7,
                  }}>
                    {d.views}
                  </div>
                  {/* Bar */}
                  <div style={{
                    width: '100%', maxWidth: 44,
                    height: `${barH}%`, minHeight: 6,
                    borderRadius: '6px 6px 3px 3px',
                    background: isMax
                      ? `linear-gradient(180deg, ${C.gold}, #A07020)`
                      : `linear-gradient(180deg, rgba(45,80,22,.55), rgba(45,80,22,.35))`,
                    transition: 'height .4s ease',
                    position: 'relative',
                  }} />
                  {/* Day label */}
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: C.sub,
                    letterSpacing: '.02em',
                  }}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis line */}
          <div style={{
            height: 1, background: C.border, marginTop: 4,
          }} />
          <div style={{ marginTop: 12, fontSize: 12, color: C.sub }}>
            Celkem za 7 dní: <strong style={{ color: C.dark }}>
              {CHART_DATA.reduce((s, d) => s + d.views, 0)} zobrazení
            </strong>
          </div>
        </Card>

      </div>
    </div>
  );
}
