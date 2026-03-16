// frontend/src/pages/DashboardPage.jsx
// Farmer dashboard — real data from Supabase
//
// Supabase tables needed:
//   farms_submitted  (already exists)
//   farm_products:
//     create table farm_products (
//       id uuid primary key default gen_random_uuid(),
//       farm_id uuid references farms_submitted(id) on delete cascade,
//       name text not null,
//       emoji text default '🌿',
//       price numeric default 0,
//       unit text default 'kg',
//       description text,
//       active boolean default true,
//       created_at timestamptz default now()
//     );
//     alter table farm_products enable row level security;
//     create policy "farmers manage own products" on farm_products
//       using (farm_id in (select id from farms_submitted where user_id = auth.uid()))
//       with check (farm_id in (select id from farms_submitted where user_id = auth.uid()));
//
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useOrdersStore } from '../store/index.js';
import toast, { Toaster } from 'react-hot-toast';

const TYPE_LABELS = {
  veggie: '🥕 Zelenina & ovoce', bio: '🌱 BIO', meat: '🥩 Maso & uzeniny',
  dairy: '🥛 Mléčné výrobky', honey: '🍯 Med & včely', wine: '🍷 Víno & nápoje',
  herbs: '🌿 Bylinky & kosmetika', market: '🏪 Farmářský trh',
};
const STATUS_MAP = {
  pending:  { bg: '#FFF3CD', color: '#856404', label: '⏳ Čeká na schválení' },
  approved: { bg: '#D4EDDA', color: '#155724', label: '✅ Schválena a aktivní' },
  rejected: { bg: '#F8D7DA', color: '#721C24', label: '✗ Zamítnuta' },
};
const ORDER_STATUS = {
  PENDING: ['⏳ Čeká', '#FFF3CD', '#856404'],
  CONFIRMED: ['✓ Potvrzena', '#D4EDDA', '#155724'],
  PREPARING: ['🔧 Připravuje se', '#D1ECF1', '#0C5460'],
  READY: ['📦 Připravena', '#E8F0E4', '#3A5728'],
  DELIVERED: ['✅ Doručena', '#D4EDDA', '#155724'],
  CANCELLED: ['✗ Zrušena', '#F8D7DA', '#721C24'],
};
const T = { bg: '#F4EDD8', card: 'white', green: '#3A5728', brown: '#1E120A', sub: '#666', border: 'rgba(0,0,0,.08)' };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { orders } = useOrdersStore();
  const [user, setUser] = useState(null);
  const [farm, setFarm] = useState(null);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  const [farmForm, setFarmForm] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', emoji: '🌿', price: '', unit: 'kg', description: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [noTable, setNoTable] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const loadFarm = useCallback(async (uid) => {
    const { data } = await supabase
      .from('farms_submitted')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setFarm(data);
      setFarmForm({ name: data.name, type: data.type, loc: data.loc, phone: data.phone || '', email: data.email || '', website: data.website || '', hours: data.hours || '', description: data.description || '', bio: data.bio || false, eshop: data.eshop || false, delivery: data.delivery || false });
    }
    setLoading(false);
  }, []);

  const loadProducts = useCallback(async (farmId) => {
    setProductsLoading(true);
    const { data, error } = await supabase
      .from('farm_products')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: true });
    if (error?.code === '42P01') { setNoTable(true); }
    else if (data) { setProducts(data); }
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadFarm(user.id);
  }, [user, loadFarm]);

  useEffect(() => {
    if (farm?.id) loadProducts(farm.id);
  }, [farm?.id, loadProducts]);

  async function saveFarmProfile() {
    setSavingFarm(true);
    const { error } = await supabase.from('farms_submitted').update({ ...farmForm }).eq('id', farm.id);
    if (error) { toast.error('Chyba při ukládání: ' + error.message); }
    else { toast.success('Profil farmy uložen!'); setFarm(f => ({ ...f, ...farmForm })); }
    setSavingFarm(false);
  }

  async function saveProduct() {
    if (!productForm.name.trim()) { toast.error('Zadejte název produktu'); return; }
    const payload = { ...productForm, farm_id: farm.id, price: parseFloat(productForm.price) || 0 };
    if (editingProduct) {
      const { error } = await supabase.from('farm_products').update(payload).eq('id', editingProduct);
      if (!error) { setProducts(prev => prev.map(p => p.id === editingProduct ? { ...p, ...payload } : p)); toast.success('Produkt uložen'); }
    } else {
      const { data, error } = await supabase.from('farm_products').insert(payload).select().single();
      if (!error && data) { setProducts(prev => [...prev, data]); toast.success('Produkt přidán!'); }
      else if (error) { toast.error('Chyba: ' + error.message); }
    }
    setProductForm({ name: '', emoji: '🌿', price: '', unit: 'kg', description: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  }

  async function deleteProduct(id) {
    if (!confirm('Smazat produkt?')) return;
    await supabase.from('farm_products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produkt smazán');
  }

  async function toggleProductActive(id, active) {
    await supabase.from('farm_products').update({ active: !active }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  }

  function startEditProduct(p) {
    setProductForm({ name: p.name, emoji: p.emoji, price: String(p.price), unit: p.unit, description: p.description || '' });
    setEditingProduct(p.id);
    setShowProductForm(true);
  }

  const farmOrders = orders.filter(o => farm && String(o.farmId) === String(farm.id));

  if (!user) return (
    <Shell title="Dashboard farmáře" onBack={() => navigate('/')}>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48 }}>🌾</div>
        <div style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 8px' }}>Pro přístup se přihlaste</div>
        <button onClick={() => navigate('/prihlaseni')} style={btn(T.green)}>Přihlásit se</button>
      </div>
    </Shell>
  );

  if (loading) return (
    <Shell title="Dashboard farmáře" onBack={() => navigate('/')}>
      <div style={{ textAlign: 'center', padding: 60, color: T.sub }}>Načítám data...</div>
    </Shell>
  );

  if (!farm) return (
    <Shell title="Dashboard farmáře" onBack={() => navigate('/')}>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Nemáte registrovanou farmu</div>
        <p style={{ color: T.sub, marginBottom: 20 }}>Přidejte svou farmu a začněte ji spravovat.</p>
        <button onClick={() => navigate('/pridat-farmu')} style={btn(T.green)}>+ Přidat farmu</button>
      </div>
    </Shell>
  );

  return (
    <Shell title="Dashboard farmáře" onBack={() => navigate('/')}>
      <Toaster position="top-right"/>

      {/* Farm header */}
      <div style={{ background: T.green, borderRadius: 16, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{farm.name}</div>
            <div style={{ fontSize: 13, opacity: .85 }}>📍 {farm.loc}</div>
          </div>
          <div style={{ ...STATUS_MAP[farm.status], ...{ borderRadius: 50, padding: '5px 14px', fontWeight: 700, fontSize: 12 } }}>
            {STATUS_MAP[farm.status]?.label}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'rgba(0,0,0,.05)', borderRadius: 12, padding: 4 }}>
        {[['overview', '📊 Přehled'], ['products', '🌿 Produkty'], ['profile', '✏️ Profil farmy']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .15s', background: tab === key ? 'white' : 'transparent', color: tab === key ? T.brown : T.sub, boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,.08)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
            {[
              ['📦', farmOrders.length, 'Objednávek', '#2980B9'],
              ['🌿', products.filter(p => p.active).length, 'Aktivních produktů', T.green],
              ['⭐', TYPE_LABELS[farm.type] || farm.type, 'Zaměření', '#C99B30'],
              ['📅', new Date(farm.created_at).toLocaleDateString('cs-CZ'), 'Registrována', '#7D3C98'],
            ].map(([icon, val, label, color]) => (
              <div key={label} style={{ background: T.card, borderRadius: 14, padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: val?.toString().length > 10 ? 16 : 26, fontWeight: 700, color, lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: T.card, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Rychlé akce</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                ['🌿 Přidat produkt', T.green, () => { setTab('products'); setShowProductForm(true); }],
                ['✏️ Upravit profil', '#5F8050', () => setTab('profile')],
                ['🗺️ Zobrazit na mapě', '#2980B9', () => navigate('/mapa')],
                ['+ Přidat další farmu', '#C99B30', () => navigate('/pridat-farmu')],
              ].map(([label, color, onClick]) => (
                <button key={label} onClick={onClick} style={btn(color, { padding: '9px 18px', fontSize: 13 })}>{label}</button>
              ))}
            </div>
          </div>

          {farmOrders.length > 0 && (
            <div style={{ background: T.card, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Poslední objednávky</div>
              {farmOrders.slice(0, 5).map(o => {
                const [statusLabel, statusBg, statusColor] = ORDER_STATUS[o.status] || ORDER_STATUS.PENDING;
                return (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #EDE5D0' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</div>
                      <div style={{ fontSize: 12, color: T.sub }}>{Array.isArray(o.items) ? o.items.join(', ') : o.items}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{o.total}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: statusBg, color: statusColor }}>{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── PRODUCTS ── */}
      {tab === 'products' && (
        <>
          {noTable && (
            <div style={{ background: '#FFF3CD', border: '1px solid #FDE047', borderRadius: 12, padding: 18, marginBottom: 16, fontSize: 13 }}>
              <strong>⚠️ Tabulka farm_products neexistuje.</strong> Vytvořte ji v Supabase SQL Editor:
              <pre style={{ marginTop: 10, background: '#1E120A', color: '#F4EDD8', padding: 12, borderRadius: 8, fontSize: 11, overflowX: 'auto' }}>{`create table farm_products (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid references farms_submitted(id) on delete cascade,
  name text not null,
  emoji text default '🌿',
  price numeric default 0,
  unit text default 'kg',
  description text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table farm_products enable row level security;
create policy "farmers manage own products" on farm_products
  using (farm_id in (select id from farms_submitted where user_id = auth.uid()))
  with check (farm_id in (select id from farms_submitted where user_id = auth.uid()));`}</pre>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700 }}>
              Moje produkty <span style={{ color: T.sub, fontSize: 14 }}>({products.length})</span>
            </div>
            <button onClick={() => { setEditingProduct(null); setProductForm({ name: '', emoji: '🌿', price: '', unit: 'kg', description: '' }); setShowProductForm(v => !v); }} style={btn(T.green, { padding: '9px 18px', fontSize: 13 })}>
              {showProductForm && !editingProduct ? '✕ Zavřít' : '+ Přidat produkt'}
            </button>
          </div>

          {/* Product form */}
          {showProductForm && (
            <div style={{ background: T.card, borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>{editingProduct ? '✏️ Upravit produkt' : '+ Nový produkt'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12, marginBottom: 12 }}>
                <input value={productForm.emoji} onChange={e => setProductForm(f => ({ ...f, emoji: e.target.value }))} style={inputStyle} placeholder="🌿" />
                <input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Název produktu *" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} placeholder="Cena (Kč)" type="number" min="0" />
                <input value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} style={inputStyle} placeholder="Jednotka (kg, ks, l...)" />
              </div>
              <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', minHeight: 60, width: '100%', marginBottom: 12 }} placeholder="Popis produktu (volitelné)" />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveProduct} style={btn(T.green, { padding: '9px 20px', fontSize: 13 })}>
                  {editingProduct ? '💾 Uložit změny' : '✅ Přidat produkt'}
                </button>
                <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} style={{ padding: '9px 20px', background: 'none', border: '1px solid #ccc', borderRadius: 9, cursor: 'pointer', fontSize: 13 }}>
                  Zrušit
                </button>
              </div>
            </div>
          )}

          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.sub }}>Načítám produkty...</div>
          ) : products.length === 0 && !noTable ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: T.card, borderRadius: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Zatím žádné produkty</div>
              <p style={{ color: T.sub, fontSize: 14 }}>Přidejte první produkt a zákazníci ho uvidí na detailu vaší farmy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: T.card, borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', gap: 14, alignItems: 'center', opacity: p.active ? 1 : 0.55 }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: T.sub }}>{p.price} Kč / {p.unit}</div>
                    {p.description && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{p.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => toggleProductActive(p.id, p.active)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #ddd', background: p.active ? '#E8F0E4' : '#F8D7DA', color: p.active ? T.green : '#721C24', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {p.active ? '✓ Aktivní' : '✗ Skryto'}
                    </button>
                    <button onClick={() => startEditProduct(p)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                    <button onClick={() => deleteProduct(p.id)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 12, color: '#9B2226' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PROFILE EDIT ── */}
      {tab === 'profile' && farmForm && (
        <div style={{ background: T.card, borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Upravit profil farmy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldGroup label="Název farmy *">
              <input value={farmForm.name} onChange={e => setFarmForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            </FieldGroup>
            <FieldGroup label="Adresa *">
              <input value={farmForm.loc} onChange={e => setFarmForm(f => ({ ...f, loc: e.target.value }))} style={inputStyle} />
            </FieldGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldGroup label="Telefon">
                <input value={farmForm.phone} onChange={e => setFarmForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="+420 ..." />
              </FieldGroup>
              <FieldGroup label="Email">
                <input value={farmForm.email} onChange={e => setFarmForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="farma@email.cz" />
              </FieldGroup>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldGroup label="Web / e-shop">
                <input value={farmForm.website} onChange={e => setFarmForm(f => ({ ...f, website: e.target.value }))} style={inputStyle} placeholder="https://..." />
              </FieldGroup>
              <FieldGroup label="Otevírací doba">
                <input value={farmForm.hours} onChange={e => setFarmForm(f => ({ ...f, hours: e.target.value }))} style={inputStyle} placeholder="Po-Pá 8-17, So 8-12" />
              </FieldGroup>
            </div>
            <FieldGroup label="Popis farmy">
              <textarea value={farmForm.description} onChange={e => setFarmForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
            </FieldGroup>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['bio', '🌱 BIO certifikát'], ['eshop', '🛒 Máme e-shop'], ['delivery', '🚚 Nabízíme rozvoz']].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={farmForm[key]} onChange={e => setFarmForm(f => ({ ...f, [key]: e.target.checked }))} style={{ width: 16, height: 16, accentColor: T.green }} />
                  {label}
                </label>
              ))}
            </div>
            <button onClick={saveFarmProfile} disabled={savingFarm} style={btn(T.green, { marginTop: 8 })}>
              {savingFarm ? '⏳ Ukládám...' : '💾 Uložit změny'}
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ title, children, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F5EDE0', fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; }`}</style>
      <header style={{ background: 'rgba(245,237,224,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(191,91,61,.1)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6B4F3A', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>←</button>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#2C1810', flex: 1 }}>{title}</span>
        <span onClick={() => window.location.href='/'} style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 900, color: '#2C1810', cursor: 'pointer' }}>
          🐓 Mapa<span style={{ color: '#BF5B3D' }}>Farem</span>
        </span>
      </header>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>{children}</div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid rgba(0,0,0,.12)',
  borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif",
  outline: 'none', background: 'white', color: '#1E120A',
};

function btn(bg, extra = {}) {
  return {
    padding: '11px 22px', background: bg, color: 'white', border: 'none',
    borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
    fontSize: 14, cursor: 'pointer', transition: 'opacity .15s', ...extra,
  };
}
