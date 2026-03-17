// frontend/src/pages/MarketsPage.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Navigation, ChevronLeft, Share2 } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

function getNextWeekday(dow) {
  const d = new Date();
  const diff = (dow - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

const MARKETS = [
  { id: 1, name: 'Manifesto Market Anděl', city: 'Praha', region: 'Hlavní město Praha', lat: 50.0700, lng: 14.4030, schedule: 'Každou sobotu', time: '8:00–14:00', vendors: 45, tags: ['BIO', 'Farmářský', 'Řemeslný'], photo: '1488459716781-31db52582fe9', nextDate: getNextWeekday(6) },
  { id: 2, name: 'Farmářské trhy Jiřák', city: 'Praha', region: 'Hlavní město Praha', lat: 50.0756, lng: 14.4600, schedule: 'Sobota a neděle', time: '8:00–14:00', vendors: 80, tags: ['Farmářský', 'BIO'], photo: '1416879595882-3373a0480b5b', nextDate: getNextWeekday(6) },
  { id: 3, name: 'Zelný trh', city: 'Brno', region: 'Jihomoravský kraj', lat: 49.1935, lng: 16.6096, schedule: 'Denně (pondělí–sobota)', time: '6:00–18:00', vendors: 30, tags: ['Farmářský', 'Tradiční'], photo: '1523741543316-beb7fc7023d8', nextDate: new Date() },
  { id: 4, name: 'Farmářský trh Olomouc', city: 'Olomouc', region: 'Olomoucký kraj', lat: 49.5938, lng: 17.2509, schedule: 'Každou sobotu', time: '7:00–12:00', vendors: 25, tags: ['BIO', 'Farmářský'], photo: '1625246333195-cbfcaabedf55', nextDate: getNextWeekday(6) },
  { id: 5, name: 'Farmářský trh Ostrava', city: 'Ostrava', region: 'Moravskoslezský kraj', lat: 49.8209, lng: 18.2625, schedule: 'Každou sobotu', time: '8:00–13:00', vendors: 20, tags: ['Farmářský'], photo: '1464226184884-fa280b87c399', nextDate: getNextWeekday(6) },
  { id: 6, name: 'Plzeňský farmářský trh', city: 'Plzeň', region: 'Plzeňský kraj', lat: 49.7384, lng: 13.3736, schedule: 'Každou sobotu', time: '7:00–12:00', vendors: 18, tags: ['BIO', 'Farmářský'], photo: '1500595046743-cd271d694d30', nextDate: getNextWeekday(6) },
  { id: 7, name: 'Budějovický farmářský trh', city: 'České Budějovice', region: 'Jihočeský kraj', lat: 48.9745, lng: 14.4746, schedule: 'Každou sobotu', time: '8:00–12:00', vendors: 22, tags: ['Farmářský', 'BIO'], photo: '1558642452-9d2a7deb7f62', nextDate: getNextWeekday(6) },
  { id: 8, name: 'Liberecký trh', city: 'Liberec', region: 'Liberecký kraj', lat: 50.7663, lng: 15.0543, schedule: 'Každou sobotu', time: '8:00–13:00', vendors: 15, tags: ['Farmářský'], photo: '1444681961742-3aef9e307b37', nextDate: getNextWeekday(6) },
  { id: 9, name: 'Farmářský trh Hradec Králové', city: 'Hradec Králové', region: 'Královéhradecký kraj', lat: 50.2092, lng: 15.8328, schedule: 'Každou sobotu', time: '7:30–12:00', vendors: 20, tags: ['BIO', 'Farmářský'], photo: '1416879595882-3373a0480b5b', nextDate: getNextWeekday(6) },
  { id: 10, name: 'Pardubický farmářský trh', city: 'Pardubice', region: 'Pardubický kraj', lat: 50.0343, lng: 15.7812, schedule: 'Každou sobotu', time: '8:00–12:00', vendors: 16, tags: ['Farmářský'], photo: '1488459716781-31db52582fe9', nextDate: getNextWeekday(6) },
  { id: 11, name: 'Jihlava — Farmářský trh', city: 'Jihlava', region: 'Kraj Vysočina', lat: 49.3961, lng: 15.5910, schedule: 'Každou sobotu', time: '8:00–12:00', vendors: 14, tags: ['BIO', 'Řemeslný'], photo: '1625246333195-cbfcaabedf55', nextDate: getNextWeekday(6) },
  { id: 12, name: 'Farmářský trh Zlín', city: 'Zlín', region: 'Zlínský kraj', lat: 49.2247, lng: 17.6671, schedule: 'Každou sobotu', time: '8:00–13:00', vendors: 18, tags: ['Farmářský'], photo: '1500595046743-cd271d694d30', nextDate: getNextWeekday(6) },
  { id: 13, name: 'Karlovarský farmářský trh', city: 'Karlovy Vary', region: 'Karlovarský kraj', lat: 50.2314, lng: 12.8715, schedule: 'Každou sobotu', time: '8:00–12:00', vendors: 12, tags: ['BIO'], photo: '1523741543316-beb7fc7023d8', nextDate: getNextWeekday(6) },
  { id: 14, name: 'Ústecký farmářský trh', city: 'Ústí nad Labem', region: 'Ústecký kraj', lat: 50.6607, lng: 14.0323, schedule: 'Každou sobotu', time: '8:00–13:00', vendors: 15, tags: ['Farmářský'], photo: '1464226184884-fa280b87c399', nextDate: getNextWeekday(6) },
  { id: 15, name: 'Bio trh Vinohrady', city: 'Praha', region: 'Hlavní město Praha', lat: 50.0778, lng: 14.4437, schedule: 'Každou neděli', time: '9:00–14:00', vendors: 35, tags: ['BIO', 'Farmářský'], photo: '1416879595882-3373a0480b5b', nextDate: getNextWeekday(0) },
  { id: 16, name: 'Farmářský trh Brno-Líšeň', city: 'Brno', region: 'Jihomoravský kraj', lat: 49.2101, lng: 16.6882, schedule: 'Každou sobotu', time: '8:00–12:00', vendors: 20, tags: ['Farmářský', 'BIO'], photo: '1558642452-9d2a7deb7f62', nextDate: getNextWeekday(6) },
  { id: 17, name: 'Havlíčkobrodský trh', city: 'Havlíčkův Brod', region: 'Kraj Vysočina', lat: 49.6063, lng: 15.5798, schedule: 'Každou sobotu', time: '7:00–12:00', vendors: 12, tags: ['Farmářský'], photo: '1625246333195-cbfcaabedf55', nextDate: getNextWeekday(6) },
  { id: 18, name: 'Opavský farmářský trh', city: 'Opava', region: 'Moravskoslezský kraj', lat: 49.9381, lng: 17.9027, schedule: 'Každou sobotu', time: '8:00–13:00', vendors: 16, tags: ['BIO', 'Farmářský'], photo: '1444681961742-3aef9e307b37', nextDate: getNextWeekday(6) },
  { id: 19, name: 'Brněnský Bio trh', city: 'Brno', region: 'Jihomoravský kraj', lat: 49.1960, lng: 16.6093, schedule: 'Každou neděli', time: '9:00–13:00', vendors: 28, tags: ['BIO', 'Řemeslný'], photo: '1416879595882-3373a0480b5b', nextDate: getNextWeekday(0) },
  { id: 20, name: 'Farmářský trh Kladno', city: 'Kladno', region: 'Středočeský kraj', lat: 50.1435, lng: 14.1015, schedule: 'Každou sobotu', time: '8:00–12:00', vendors: 14, tags: ['Farmářský'], photo: '1488459716781-31db52582fe9', nextDate: getNextWeekday(6) },
];

const ALL_REGIONS = [
  'Všechny kraje',
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

const TIME_FILTERS = [
  { id: 'weekend', label: 'Tento víkend' },
  { id: 'week', label: 'Tento týden' },
  { id: 'month', label: 'Tento měsíc' },
  { id: 'all', label: 'Vše' },
];

function getCountdown(nextDate) {
  const now = new Date();
  const diff = nextDate - now;
  const days = Math.floor(diff / 86400000);
  if (diff < 0) return { text: 'Skoncil', color: '#6B7280' };
  if (days === 0) return { text: 'Probiha nyni', color: '#16A085' };
  if (days === 1) return { text: 'Zítra', color: '#C8963E' };
  return { text: `Za ${days} dní`, color: '#2D5016' };
}

function generateICS(market) {
  const d = market.nextDate;
  const pad = (n) => String(n).padStart(2, '0');
  const dt = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MapaFarem//CS',
    'BEGIN:VEVENT',
    `DTSTART:${dt}T080000`,
    `DTEND:${dt}T140000`,
    `SUMMARY:${market.name}`,
    `DESCRIPTION:${market.schedule} · ${market.vendors} prodejcu`,
    `LOCATION:${market.city}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${market.name}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getTagStyle(tag) {
  if (tag === 'BIO') return { background: '#E8F5E9', color: '#2D5016', border: '1px solid #A5D6A7' };
  if (tag === 'Farmářský') return { background: '#FFF8E1', color: '#C8963E', border: '1px solid #FFE082' };
  if (tag === 'Řemeslný') return { background: '#FBE9E7', color: '#8D4E2A', border: '1px solid #FFAB91' };
  if (tag === 'Tradiční') return { background: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' };
  return { background: '#F5F5F5', color: '#555', border: '1px solid #DDD' };
}

export default function MarketsPage() {
  useSEO({
    title: 'Farmářské trhy v ČR',
    description: 'Přehled farmářských trhů v České republice. Najděte trh ve svém městě.',
  });

  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('Všechny kraje');
  const [shareToast, setShareToast] = useState(null);

  const now = new Date();

  const filteredMarkets = useMemo(() => {
    let list = MARKETS;

    if (regionFilter !== 'Všechny kraje') {
      list = list.filter((m) => m.region === regionFilter);
    }

    if (timeFilter === 'weekend') {
      const sat = getNextWeekday(6);
      const sun = getNextWeekday(0);
      const satStr = sat.toDateString();
      const sunStr = sun.toDateString();
      list = list.filter((m) => {
        const nd = m.nextDate.toDateString();
        return nd === satStr || nd === sunStr;
      });
    } else if (timeFilter === 'week') {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);
      list = list.filter((m) => m.nextDate >= now && m.nextDate <= weekEnd);
    } else if (timeFilter === 'month') {
      const monthEnd = new Date(now);
      monthEnd.setDate(now.getDate() + 30);
      list = list.filter((m) => m.nextDate >= now && m.nextDate <= monthEnd);
    }

    return list;
  }, [timeFilter, regionFilter]);

  function handleShare(market) {
    const text = `${market.name} — ${market.schedule} ${market.time} v ${market.city}`;
    if (navigator.share) {
      navigator.share({ title: market.name, text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShareToast(market.id);
        setTimeout(() => setShareToast(null), 2000);
      });
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: '#2D5016',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: 8,
            color: '#FAF7F2',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            fontSize: 14,
          }}
        >
          <ChevronLeft size={16} />
          Zpět
        </button>

        <h1
          style={{
            flex: 1,
            color: '#FAF7F2',
            fontFamily: "'Playfair Display',serif",
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
          }}
        >
          Farmářské trhy
        </h1>

        <div
          style={{
            background: '#C8963E',
            color: 'white',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {filteredMarkets.length} trhů
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E8E0D0',
          padding: '12px 20px',
          position: 'sticky',
          top: 56,
          zIndex: 90,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
        }}
      >
        {/* Time filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TIME_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1.5px solid',
                borderColor: timeFilter === f.id ? '#C8963E' : '#E8E0D0',
                background: timeFilter === f.id ? '#C8963E' : 'white',
                color: timeFilter === f.id ? 'white' : '#1A1A1A',
                fontSize: 13,
                fontWeight: timeFilter === f.id ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Region dropdown */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            border: '1.5px solid #E8E0D0',
            background: 'white',
            fontSize: 13,
            color: '#1A1A1A',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {ALL_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Kolem me button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {});
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1.5px solid #2D5016',
            background: 'white',
            color: '#2D5016',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <Navigation size={14} />
          Kolem mě
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          paddingTop: 16,
          paddingBottom: 40,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 20px 40px',
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Map placeholder LEFT */}
        <div style={{ flex: '0 0 42%', minWidth: 300 }}>
          <div
            style={{
              background: 'linear-gradient(135deg,#2D5016,#4A7A28)',
              borderRadius: 14,
              height: 420,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(45,80,22,0.25)',
            }}
          >
            {/* Background grid pattern */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />

            <div
              style={{
                color: 'rgba(250,247,242,0.5)',
                fontFamily: "'Playfair Display',serif",
                fontSize: 18,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 10 }}>🗺️</div>
              <div>Interaktivní mapa trhů</div>
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>
                Zobrazuje {filteredMarkets.length} trhů
              </div>
            </div>

            {/* Floating pin cards */}
            {filteredMarkets.slice(0, 4).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  position: 'absolute',
                  background: 'white',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  top: 55 + i * 75,
                  left: 16 + (i % 2) * 185,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  zIndex: 2,
                  maxWidth: 160,
                  cursor: 'pointer',
                  borderLeft: '3px solid #2D5016',
                }}
              >
                <span>🏪</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.name.split(' ').slice(0, 3).join(' ')}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Summary stats below map */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              { label: 'Trhů celkem', value: MARKETS.length },
              { label: 'Krajů', value: new Set(MARKETS.map((m) => m.region)).size },
              { label: 'Prodejců', value: MARKETS.reduce((s, m) => s + m.vendors, 0) + '+' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  background: 'white',
                  border: '1px solid #E8E0D0',
                  borderRadius: 10,
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#2D5016',
                    fontFamily: "'Playfair Display',serif",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market list RIGHT */}
        <div style={{ flex: '1 1 400px', minWidth: 300 }}>
          <AnimatePresence mode="popLayout">
            {filteredMarkets.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6B7280',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 600 }}>Žádné trhy neodpovídají filtru</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Zkuste jiný kraj nebo časové období</div>
              </motion.div>
            ) : (
              filteredMarkets.map((market, index) => {
                const countdown = getCountdown(market.nextDate);
                return (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.04 }}
                    style={{
                      background: 'white',
                      border: '1px solid #E8E0D0',
                      borderRadius: 14,
                      overflow: 'hidden',
                      marginBottom: 16,
                      display: 'flex',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Photo */}
                    <img
                      src={`https://images.unsplash.com/photo-${market.photo}?w=160&h=160&fit=crop&q=80`}
                      alt={market.name}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        flexShrink: 0,
                        alignSelf: 'stretch',
                        minHeight: 120,
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />

                    {/* Content */}
                    <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
                      {/* Name + tags */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginBottom: 6,
                        }}
                      >
                        <h3
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#1A1A1A',
                            margin: 0,
                            flex: '1 1 auto',
                            lineHeight: 1.3,
                          }}
                        >
                          {market.name}
                        </h3>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                        {market.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              ...getTagStyle(tag),
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 10,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* City + region */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          color: '#6B7280',
                          marginBottom: 5,
                        }}
                      >
                        <MapPin size={12} />
                        {market.city} · {market.region}
                      </div>

                      {/* Schedule */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          color: '#1A1A1A',
                          marginBottom: 4,
                        }}
                      >
                        <Calendar size={12} color="#2D5016" />
                        {market.schedule} · {market.time}
                      </div>

                      {/* Vendors */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          color: '#1A1A1A',
                          marginBottom: 10,
                        }}
                      >
                        <Users size={12} color="#C8963E" />
                        {market.vendors} prodejců
                        <span
                          style={{
                            marginLeft: 8,
                            fontWeight: 700,
                            color: countdown.color,
                            fontSize: 12,
                          }}
                        >
                          · {countdown.text}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => generateICS(market)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            borderRadius: 7,
                            border: '1.5px solid #2D5016',
                            background: 'white',
                            color: '#2D5016',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Calendar size={11} />
                          Přidat do kalendáře
                        </button>

                        <button
                          onClick={() => handleShare(market)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            borderRadius: 7,
                            border: '1.5px solid #E8E0D0',
                            background: 'white',
                            color: '#6B7280',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                        >
                          <Share2 size={11} />
                          {shareToast === market.id ? 'Zkopírováno!' : 'Sdílet'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
