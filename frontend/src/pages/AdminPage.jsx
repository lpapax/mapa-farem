// frontend/src/pages/AdminPage.jsx
// Admin panel pro MapaFarem.cz — správa farem, schvalování, přehledy
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import FARMS_DATA from '../data/farms.json';

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  cream: '#F5EDE0',
  terra: '#BF5B3D',
  green: '#3A5728',
  dark:  '#1A2D18',
  gold:  '#C8973A',
  white: '#FFFFFF',
  red:   '#9B2226',
  muted: '#7A6A5A',
  border:'rgba(191,91,61,0.13)',
};

const font = { heading: "'Playfair Display', serif", body: "'DM Sans', sans-serif" };

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_PENDING = [
  { id: 'p1', name: 'Farma Novák',        region: 'Jihomoravský kraj',  type: 'maso, vejce',  added: 'dnes' },
  { id: 'p2', name: 'Ekofarm Zelená',     region: 'Středočeský kraj',   type: 'bio',          added: 'včera' },
  { id: 'p3', name: 'Mlékárna Bílý Dvůr', region: 'Olomoucký kraj',     type: 'mléčné',       added: 'před 2 dny' },
];

const INITIAL_REPORTED = [
  { id: 'r1', name: 'Zahrádkářství Hora',  region: 'Moravskoslezský kraj', reason: 'Nesprávné kontaktní údaje' },
  { id: 'r2', name: 'Sady u Lesa',         region: 'Jihočeský kraj',        reason: 'Duplicitní záznam' },
];

const CHART_DATA = [
  { month: 'Říj', value: 18 },
  { month: 'Lis', value: 24 },
  { month: 'Pro', value: 14 },
  { month: 'Led', value: 31 },
  { month: 'Úno', value: 27 },
  { month: 'Bře', value: 39 },
];
const CHART_MAX = Math.max(...CHART_DATA.map(d => d.value));

const TYPE_LABELS = {
  veggie: 'Zelenina', bio: 'BIO', meat: 'Maso', dairy: 'Mléko',
  honey: 'Med', wine: 'Víno', herbs: 'Bylinky', market: 'Trh',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function btn(bg, color = '#fff', extra = {}) {
  return {
    background: bg, color, border: 'none', borderRadius: 8,
    fontFamily: font.body, fontWeight: 700, fontSize: 13,
    padding: '7px 16px', cursor: 'pointer', transition: 'opacity .15s',
    ...extra,
  };
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: font.heading, fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 16 }}>
      {children}
    </h2>
  );
}

// ─── Access-denied page ───────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'grid', placeItems: 'center', fontFamily: font.body }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <h1 style={{ fontFamily: font.heading, fontSize: 28, color: C.dark, marginBottom: 10 }}>Přístup odepřen</h1>
        <p style={{ color: C.muted, marginBottom: 24 }}>Tato stránka je přístupná pouze administrátorům.</p>
        <Link to="/" style={{ ...btn(C.green), textDecoration: 'none', display: 'inline-block' }}>
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub }) {
  return (
    <div style={{
      background: C.dark, borderRadius: 16, padding: '22px 24px',
      boxShadow: '0 4px 20px rgba(26,45,24,.18)',
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: font.heading, fontSize: 36, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── Verification queue ───────────────────────────────────────────────────────
function VerificationQueue() {
  const [items, setItems] = useState(INITIAL_PENDING);
  const [fading, setFading] = useState(new Set());

  function dismiss(id) {
    setFading(prev => new Set([...prev, id]));
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 350);
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionTitle>Ceka na schvaleni ({items.length})</SectionTitle>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          Fronta schvalování je prázdná
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(farm => (
          <div key={farm.id} style={{
            background: C.white, borderRadius: 14, padding: '18px 22px',
            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
            transition: 'opacity .3s, transform .3s',
            opacity: fading.has(farm.id) ? 0 : 1,
            transform: fading.has(farm.id) ? 'translateX(30px)' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{farm.name}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                {farm.region} &middot; {farm.type} &middot; přidáno {farm.added}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button style={btn(C.green)} onClick={() => dismiss(farm.id)}>
                Schvalit
              </button>
              <button style={btn(C.red)} onClick={() => dismiss(farm.id)}>
                Zamítnout
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Reported farms ───────────────────────────────────────────────────────────
function ReportedFarms() {
  const [items, setItems] = useState(INITIAL_REPORTED);
  const [fading, setFading] = useState(new Set());

  function dismiss(id) {
    setFading(prev => new Set([...prev, id]));
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 350);
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionTitle>Nahlasene farmy ({items.length})</SectionTitle>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          Žádné nahlášené farmy
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(farm => (
          <div key={farm.id} style={{
            background: C.white, borderRadius: 14, padding: '18px 22px',
            boxShadow: '0 2px 10px rgba(0,0,0,.06)',
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
            transition: 'opacity .3s, transform .3s',
            opacity: fading.has(farm.id) ? 0 : 1,
            transform: fading.has(farm.id) ? 'translateX(30px)' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{farm.name}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                {farm.region} &middot; {farm.reason}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button style={btn('#5B7FBF')} onClick={() => {}}>
                Zkontrolovat
              </button>
              <button style={btn(C.green)} onClick={() => dismiss(farm.id)}>
                Vyresit
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── All farms table ──────────────────────────────────────────────────────────
function FarmsTable() {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState(new Set());

  const TABLE_FARMS = FARMS_DATA.slice(0, 20);

  const visible = useMemo(() => {
    return TABLE_FARMS.filter(f => {
      const matchSearch = !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.loc || '').toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'all'       ? true :
        filter === 'verified'  ? f.verified :
        filter === 'unverified'? !f.verified :
        filter === 'premium'   ? f.bio :
        true;
      return matchSearch && matchFilter;
    });
  }, [search, filter, TABLE_FARMS]);

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map(f => f.id)));
    }
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    if (window.confirm(`Smazat ${selected.size} farem? (pouze mock)`)) {
      setSelected(new Set());
    }
  }

  function exportCSV() {
    const header = 'ID,Název,Kraj,Typ,Hodnocení,Ověřená\n';
    const rows = TABLE_FARMS.map(f =>
      [f.id, `"${f.name}"`, `"${f.loc || ''}"`, f.type || '', f.rating || '', f.verified ? 'Ano' : 'Ne'].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farmy.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const FILTERS = [
    { key: 'all',        label: 'Všechny' },
    { key: 'verified',   label: 'Ověřené' },
    { key: 'unverified', label: 'Neověřené' },
    { key: 'premium',    label: 'Prémiové (BIO)' },
  ];

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionTitle>Všechny farmy</SectionTitle>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hledat farmu nebo kraj..."
          style={{
            flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 9,
            border: `1.5px solid ${C.border}`, fontFamily: font.body, fontSize: 14,
            outline: 'none', background: C.white,
          }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={btn(
                filter === f.key ? C.dark : C.white,
                filter === f.key ? '#fff' : C.dark,
                { border: `1.5px solid ${C.border}`, fontSize: 12 }
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} style={btn(C.gold, C.dark, { marginLeft: 'auto' })}>
          Exportovat CSV
        </button>
        {selected.size > 0 && (
          <button onClick={deleteSelected} style={btn(C.red)}>
            Smazat vybrané ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: C.white, borderRadius: 14, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: C.dark, color: '#fff' }}>
              <th style={th()}>
                <input type="checkbox" checked={selected.size === visible.length && visible.length > 0} onChange={toggleAll} />
              </th>
              <th style={th()}>#</th>
              <th style={th(true)}>Název</th>
              <th style={th()}>Kraj</th>
              <th style={th()}>Typ</th>
              <th style={th()}>Hodnocení</th>
              <th style={th()}>Ověřená</th>
              <th style={th()}>Akce</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((farm, idx) => (
              <tr
                key={farm.id}
                style={{
                  background: selected.has(farm.id) ? 'rgba(200,151,58,.08)' : (idx % 2 === 0 ? C.white : '#faf7f3'),
                  transition: 'background .15s',
                }}
              >
                <td style={td()}>
                  <input type="checkbox" checked={selected.has(farm.id)} onChange={() => toggleSelect(farm.id)} />
                </td>
                <td style={td()}><span style={{ color: C.muted, fontSize: 12 }}>{farm.id}</span></td>
                <td style={td(true)}>
                  <span style={{ fontWeight: 600, color: C.dark }}>{farm.name}</span>
                </td>
                <td style={td()}><span style={{ fontSize: 13 }}>{farm.loc || '—'}</span></td>
                <td style={td()}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50,
                    background: 'rgba(58,87,40,.1)', color: C.green,
                  }}>
                    {TYPE_LABELS[farm.type] || farm.type || '—'}
                  </span>
                </td>
                <td style={td()}>
                  <span style={{ color: C.gold, fontWeight: 700 }}>
                    {farm.rating ? farm.rating.toFixed(1) : '—'}
                  </span>
                </td>
                <td style={td()}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 50,
                    background: farm.verified ? 'rgba(58,87,40,.12)' : 'rgba(155,34,38,.08)',
                    color: farm.verified ? C.green : C.red,
                  }}>
                    {farm.verified ? 'Ano' : 'Ne'}
                  </span>
                </td>
                <td style={td()}>
                  <button style={btn(C.terra, '#fff', { fontSize: 11, padding: '4px 10px' })}>
                    Upravit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
        Zobrazeno {visible.length} z {TABLE_FARMS.length} farem
      </div>
    </section>
  );
}

function th(wide = false) {
  return {
    padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700,
    letterSpacing: '.04em', textTransform: 'uppercase', fontFamily: font.body,
    whiteSpace: 'nowrap', width: wide ? 'auto' : '1%',
  };
}
function td(wide = false) {
  return {
    padding: '11px 14px', fontSize: 13, fontFamily: font.body,
    borderTop: '1px solid rgba(0,0,0,.04)', width: wide ? 'auto' : '1%',
  };
}

// ─── Analytics chart ──────────────────────────────────────────────────────────
function AnalyticsChart() {
  return (
    <section style={{ marginBottom: 40 }}>
      <SectionTitle>Nové registrace (posledních 6 měsíců)</SectionTitle>
      <div style={{
        background: C.white, borderRadius: 16, padding: '28px 28px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,.07)',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 160 }}>
          {CHART_DATA.map(d => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{d.value}</span>
              <div
                title={`${d.month}: ${d.value} registrací`}
                style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${Math.round((d.value / CHART_MAX) * 120)}px`,
                  background: `linear-gradient(180deg, ${C.gold} 0%, ${C.terra} 100%)`,
                  transition: 'height .4s',
                  minHeight: 6,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {CHART_DATA.map(d => (
            <div key={d.month} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: C.muted, fontWeight: 500 }}>
              {d.month}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const user = useAuthStore(s => s.user);

  // Auth guard
  if (!user || user.role !== 'ADMIN') {
    return <AccessDenied />;
  }

  const totalFarms   = FARMS_DATA.length;
  const verifiedCount = FARMS_DATA.filter(f => f.verified).length;
  const premiumCount  = FARMS_DATA.filter(f => f.bio).length;

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: font.body }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      {/* Header */}
      <header style={{
        background: 'rgba(245,237,224,.97)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`, padding: '0 28px',
        height: 62, display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ color: C.muted, textDecoration: 'none', fontSize: 20, lineHeight: 1 }}>←</Link>
        <span style={{ fontFamily: font.heading, fontSize: 18, fontWeight: 700, color: C.dark, flex: 1 }}>
          Admin Panel — MapaFarem.cz
        </span>
        <span style={{
          fontSize: 11, background: C.dark, color: C.gold,
          borderRadius: 20, padding: '3px 10px', fontWeight: 700,
        }}>
          ADMIN
        </span>
        <span style={{ fontSize: 13, color: C.muted }}>{user.email}</span>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 44 }}>
          <StatCard icon="🏡" value={totalFarms}    label="Celkem farem"       sub={`${verifiedCount} ověřených`} />
          <StatCard icon="✨" value="47"            label="Nových tento týden" sub="meziměsíčně +12 %" />
          <StatCard icon="⭐" value={premiumCount}  label="Prémiových farem"   sub="BIO certifikát" />
          <StatCard icon="💰" value="28 400 Kč"     label="Tržby tento měsíc"  sub="průměr 604 Kč / objednávka" />
        </div>

        {/* Verification queue */}
        <VerificationQueue />

        {/* Reported farms */}
        <ReportedFarms />

        {/* All farms table */}
        <FarmsTable />

        {/* Analytics chart */}
        <AnalyticsChart />

      </main>
    </div>
  );
}
