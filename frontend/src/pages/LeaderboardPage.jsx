import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star } from 'lucide-react';
import FARMS_DATA from '../data/farms.json';
import { useSEO } from '../hooks/useSEO';

const C = {
  green: '#2D5016',
  gold: '#C8963E',
  cream: '#FAF7F2',
  dark: '#1A1A1A',
  silver: '#9E9E9E',
  bronze: '#CD7F32',
};

function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 40;
    const step = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value }) {
  const count = useCounter(value);
  return (
    <div style={{ textAlign: 'center', padding: '0 24px' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: C.green }}>{count}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#6B7280', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= Math.round(rating) ? C.gold : 'none'} stroke={C.gold} />
      ))}
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#6B7280', marginLeft: 4 }}>{rating ? rating.toFixed(1) : '—'}</span>
    </span>
  );
}

const TABS = [
  { id: 'rating', label: '⭐ Hodnocení', filter: () => true, sort: (a, b) => (b.rating || 0) - (a.rating || 0) },
  { id: 'delivery', label: '🚚 Rozvoz', filter: f => f.delivery, sort: (a, b) => (b.rating || 0) - (a.rating || 0) },
  { id: 'eshop', label: '🛒 E-shop', filter: f => f.eshop, sort: (a, b) => (b.rating || 0) - (a.rating || 0) },
  { id: 'bio', label: '🌱 BIO', filter: f => f.bio, sort: (a, b) => (b.rating || 0) - (a.rating || 0) },
];

function rankMedal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function FarmRow({ farm, rank, onClick }) {
  const [hovered, setHovered] = useState(false);
  const medal = rankMedal(rank);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        borderRadius: 10, cursor: 'pointer', backgroundColor: hovered ? C.cream : 'transparent',
        transition: 'background-color 0.18s',
      }}
    >
      <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
        {medal
          ? <span style={{ fontSize: 20 }}>{medal}</span>
          : <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.silver, fontWeight: 600 }}>{rank}</span>
        }
      </div>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{farm.emoji || '🌾'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{farm.name}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#6B7280', marginTop: 2 }}>{farm.loc}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <StarRating rating={farm.rating} />
        {farm.type && (
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.green,
            backgroundColor: '#E8F0D8', borderRadius: 99, padding: '2px 8px', fontWeight: 500,
          }}>{farm.type}</span>
        )}
      </div>
    </motion.div>
  );
}

function RegionLeaderboard() {
  const regionMap = {};
  FARMS_DATA.forEach(f => {
    if (!f.loc) return;
    if (!regionMap[f.loc]) regionMap[f.loc] = { total: 0, count: 0 };
    regionMap[f.loc].total += f.rating || 0;
    regionMap[f.loc].count += 1;
  });
  const regions = Object.entries(regionMap)
    .map(([name, { total, count }]) => ({ name, avg: count ? total / count : 0, count }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div style={{ marginTop: 48, padding: '32px 16px', maxWidth: 760, margin: '48px auto 0' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: C.dark, marginBottom: 20, textAlign: 'center' }}>
        Nejlepší kraj
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {regions.map((r, i) => (
          <div key={r.name} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: i === 0 ? C.green : '#F3EFE9',
            color: i === 0 ? '#fff' : C.dark,
            borderRadius: 99, padding: '7px 16px',
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            boxShadow: i === 0 ? '0 2px 8px rgba(45,80,22,0.18)' : 'none',
          }}>
            {i === 0 && <span>🏆</span>}
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span style={{ opacity: 0.75 }}>{r.avg.toFixed(2)} ★</span>
            <span style={{ opacity: 0.55, fontSize: 11 }}>({r.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  useSEO({ title: 'Žebříčky farem | MapaFarem.cz', description: 'Nejlépe hodnocené farmy v ČR.' });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rating');

  const totalFarms = FARMS_DATA.length;
  const bioFarms = FARMS_DATA.filter(f => f.bio).length;
  const deliveryFarms = FARMS_DATA.filter(f => f.delivery).length;

  const tab = TABS.find(t => t.id === activeTab);
  const ranked = FARMS_DATA.filter(tab.filter).sort(tab.sort).slice(0, 20);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F1EB', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        backgroundColor: C.green, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: 4 }}>
          <ChevronLeft size={24} />
        </button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>Žebříčky farem</span>
        <div style={{ width: 32 }} />
      </div>

      {/* Hero */}
      <div style={{ backgroundColor: C.cream, padding: 'clamp(40px, 8vw, 80px) 16px', textAlign: 'center', borderBottom: '1px solid #E8E0D0' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 700, color: C.dark, margin: '0 0 12px' }}>
          Nejlepší farmy České republiky
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: '#6B7280', margin: '0 0 36px' }}>
          Hodnocení, oblíbenost a přímý prodej
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
          <StatCard label="Celkem farem" value={totalFarms} />
          <div style={{ width: 1, backgroundColor: '#E0D8CC', margin: '8px 0' }} />
          <StatCard label="BIO farmy" value={bioFarms} />
          <div style={{ width: 1, backgroundColor: '#E0D8CC', margin: '8px 0' }} />
          <StatCard label="S rozvozu" value={deliveryFarms} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E8E0D0', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '14px 20px', fontFamily: "'Inter', sans-serif",
              fontSize: 14, fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? C.green : '#6B7280',
              borderBottom: activeTab === t.id ? `2px solid ${C.gold}` : '2px solid transparent',
              transition: 'all 0.18s', whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div style={{ maxWidth: 760, margin: '28px auto 0', padding: '0 12px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            {ranked.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontFamily: "'Inter', sans-serif" }}>Žádné farmy nenalezeny.</div>
            )}
            {ranked.map((farm, i) => (
              <div key={farm.id}>
                <FarmRow farm={farm} rank={i + 1} onClick={() => navigate(`/farma/${farm.id}`)} />
                {i < ranked.length - 1 && <div style={{ height: 1, backgroundColor: '#F3EDE3', margin: '0 16px' }} />}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Region leaderboard */}
      <RegionLeaderboard />

      <div style={{ height: 48 }} />
    </div>
  );
}
