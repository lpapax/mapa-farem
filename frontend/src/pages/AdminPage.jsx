// frontend/src/pages/AdminPage.jsx
// Admin panel — schvalování farem, přehled registrací
//
// Supabase RLS: farms_submitted musí mít policy "admin can read all"
// Admin = user.email === VITE_ADMIN_EMAIL (nastav v .env a Vercel)
//
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const STATUS_COLORS = {
  pending:  { bg: '#FFF3CD', color: '#856404', label: '⏳ Čeká' },
  approved: { bg: '#D4EDDA', color: '#155724', label: '✅ Schválena' },
  rejected: { bg: '#F8D7DA', color: '#721C24', label: '✗ Zamítnuta' },
};

const TYPE_LABELS = {
  veggie: '🥕 Zelenina', bio: '🌱 BIO', meat: '🥩 Maso', dairy: '🥛 Mléko',
  honey: '🍯 Med', wine: '🍷 Víno', herbs: '🌿 Bylinky', market: '🏪 Trh',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [farms, setFarms] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [search, setSearch] = useState('');
  const [selectedFarm, setSelectedFarm] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      }
    });
  }, []);

  const loadFarms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('farms_submitted')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setFarms(data);
      setStats({
        pending: data.filter(f => f.status === 'pending').length,
        approved: data.filter(f => f.status === 'approved').length,
        rejected: data.filter(f => f.status === 'rejected').length,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadFarms();
  }, [user, loadFarms]);

  async function updateStatus(id, status) {
    setActionLoading(id + status);
    await supabase.from('farms_submitted').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id);
    setFarms(prev => prev.map(f => f.id === id ? { ...f, status, reviewed_at: new Date().toISOString() } : f));
    setStats(prev => {
      const farm = farms.find(f => f.id === id);
      const old = farm?.status;
      return { ...prev, [old]: Math.max(0, prev[old] - 1), [status]: prev[status] + 1 };
    });
    if (selectedFarm?.id === id) setSelectedFarm(f => ({ ...f, status }));
    setActionLoading(null);
  }

  const filtered = farms
    .filter(f => f.status === tab)
    .filter(f => !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.loc?.toLowerCase().includes(search.toLowerCase()));

  const T = { bg: '#F4EDD8', card: 'white', green: '#3A5728', brown: '#1E120A', sub: '#666' };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Přihlaste se</div>
        <button onClick={() => navigate('/prihlaseni')} style={btnStyle(T.green)}>Přihlásit se</button>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Přístup odepřen</div>
        <p style={{ color: T.sub, marginBottom: 16 }}>Tato stránka je dostupná pouze pro administrátory.</p>
        <button onClick={() => navigate('/')} style={btnStyle(T.green)}>Zpět</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Header */}
      <header style={{ background: T.brown, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#B8A882', cursor: 'pointer', fontSize: 18 }}>←</button>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#F4EDD8' }}>
          🛡️ Admin Panel
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#B8A882' }}>{user.email}</span>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            ['⏳ Čeká na schválení', stats.pending, '#C99B30', 'pending'],
            ['✅ Schváleno', stats.approved, '#3A5728', 'approved'],
            ['✗ Zamítnuto', stats.rejected, '#9B2226', 'rejected'],
          ].map(([label, val, color, s]) => (
            <div key={s} onClick={() => setTab(s)} style={{ background: T.card, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.07)', cursor: 'pointer', border: `2px solid ${tab === s ? color : 'transparent'}`, transition: 'border .15s' }}>
              <div style={{ fontSize: 13, color: T.sub, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Search + tab */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Hledat farmu nebo obec..."
            style={{ flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 9, border: '1.5px solid rgba(0,0,0,.12)', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none' }}
          />
          <span style={{ fontSize: 13, color: T.sub }}>{filtered.length} záznamů</span>
        </div>

        {/* Farm list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.sub }}>Načítám...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: T.sub }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === 'pending' ? '🎉' : '📭'}</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {tab === 'pending' ? 'Žádné farmy nečekají na schválení' : 'Žádné záznamy'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(farm => (
              <div key={farm.id} style={{ background: T.card, borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.07)', border: selectedFarm?.id === farm.id ? '2px solid #3A5728' : '2px solid transparent' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{farm.name}</div>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, fontWeight: 700, background: STATUS_COLORS[farm.status]?.bg, color: STATUS_COLORS[farm.status]?.color }}>{STATUS_COLORS[farm.status]?.label}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: '#EDE5D0', color: '#666' }}>{TYPE_LABELS[farm.type] || farm.type}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.sub, marginBottom: 6 }}>📍 {farm.loc}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: T.sub, flexWrap: 'wrap' }}>
                      {farm.phone && <span>📞 {farm.phone}</span>}
                      {farm.email && <span>✉️ {farm.email}</span>}
                      {farm.website && <a href={farm.website} target="_blank" rel="noreferrer" style={{ color: T.green }}>🌐 Web</a>}
                    </div>
                    {farm.description && (
                      <div style={{ marginTop: 8, fontSize: 13, color: '#444', lineHeight: 1.5, maxWidth: 560 }}>
                        {farm.description.length > 200 ? farm.description.slice(0, 200) + '…' : farm.description}
                      </div>
                    )}
                    {farm.products?.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {farm.products.slice(0, 6).map(p => <span key={p} style={{ fontSize: 11, background: '#E8F0E4', color: T.green, borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{p}</span>)}
                      </div>
                    )}
                    <div style={{ marginTop: 6, fontSize: 11, color: '#aaa' }}>
                      Přidáno: {new Date(farm.created_at).toLocaleDateString('cs-CZ')}
                      {farm.bio && ' · 🌱 BIO'}
                      {farm.delivery && ' · 🚚 Rozvoz'}
                      {farm.eshop && ' · 🛒 E-shop'}
                    </div>
                  </div>

                  {/* Actions */}
                  {farm.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      <button
                        disabled={actionLoading === farm.id + 'approved'}
                        onClick={() => updateStatus(farm.id, 'approved')}
                        style={btnStyle('#3A5728', { padding: '8px 18px', fontSize: 13 })}>
                        {actionLoading === farm.id + 'approved' ? '...' : '✅ Schválit'}
                      </button>
                      <button
                        disabled={actionLoading === farm.id + 'rejected'}
                        onClick={() => updateStatus(farm.id, 'rejected')}
                        style={btnStyle('#9B2226', { padding: '8px 18px', fontSize: 13 })}>
                        {actionLoading === farm.id + 'rejected' ? '...' : '✗ Zamítnout'}
                      </button>
                    </div>
                  )}
                  {farm.status !== 'pending' && (
                    <button
                      onClick={() => updateStatus(farm.id, 'pending')}
                      style={{ padding: '7px 14px', background: 'none', border: '1px solid #ccc', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: T.sub, flexShrink: 0 }}>
                      ↩ Vrátit do fronty
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, extra = {}) {
  return {
    padding: '10px 20px', background: bg, color: 'white', border: 'none',
    borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
    fontSize: 14, cursor: 'pointer', transition: 'opacity .15s',
    ...extra,
  };
}
