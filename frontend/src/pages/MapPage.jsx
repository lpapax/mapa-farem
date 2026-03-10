// frontend/src/pages/MapPage.jsx
// Mapbox GL JS + GPS + Clustering + PWA
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShoppingCart, Menu, X, Navigation, Moon, Sun } from 'lucide-react';
import { useAuthStore, useMapStore, useCartStore, useNotificationStore } from '../store/index.js';
import FARMS_DATA from '../data/farms.json';

// ── PWA Service Worker ─────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── CONFIG ─────────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const COLORS = {
  bio:'#C99B30', veggie:'#3A5728', meat:'#9B2226',
  dairy:'#2980B9', honey:'#D4A017', wine:'#7D3C98',
  herbs:'#5F8050', market:'#5D4037',
  zerowaste:'#27AE60', bezobaly:'#16A085', agroturistika:'#E67E22',
};
const LABELS = {
  all:'Vše', bio:'BIO', veggie:'Zelenina & ovoce', meat:'Maso & uzeniny',
  dairy:'Mléčné výrobky', honey:'Med & včelí', wine:'Víno & nápoje',
  herbs:'Bylinky & kosmetika', market:'Farmářský trh',
  zerowaste:'♻️ Zero-waste', bezobaly:'🫙 Bezobalové', agroturistika:'🏡 Agroturistika',
};

// ── VZDÁLENOST (Haversine) ─────────────────────────────────────────────────
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// ── FARM CARD ──────────────────────────────────────────────────────────────
function FarmCard({ farm, selected, onClick, userLocation, dark }) {
  const T = dark ? { cardBg:'#241A0E', cardText:'#F4EDD8', cardSub:'#777' } : { cardBg:'white', cardText:'#1E120A', cardSub:'#999' };
  const color = COLORS[farm.type] || '#5F8050';
  const realDist = userLocation
    ? getDistance(userLocation.lat, userLocation.lng, farm.lat, farm.lng).toFixed(1)
    : null;

  return (
    <div onClick={() => onClick(farm)} style={{
      background:T.cardBg, borderRadius:10, padding:'11px 12px 11px 15px',
      cursor:'pointer', border:`2px solid ${selected ? color : 'transparent'}`,
      boxShadow: selected ? `0 4px 16px ${color}33` : '0 1px 4px rgba(0,0,0,0.06)',
      position:'relative', overflow:'hidden', transition:'all 0.18s',
    }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:color }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, lineHeight:1.3, color:T.cardText }}>
          {farm.emoji} {farm.name}
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:'#3A2210', display:'flex', gap:2, flexShrink:0 }}>
          <span style={{ color:'#E6A817' }}>★</span>{farm.rating}
        </div>
      </div>
      <div style={{ fontSize:11, color:T.cardSub, margin:'3px 0 7px' }}>📍 {farm.loc}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:8 }}>
        {farm.bio && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:50, background:'#FFF3CD', color:'#856404' }}>🌱 BIO</span>}
        {farm.open
          ? <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:50, background:'#D4EDDA', color:'#155724' }}>Otevřeno</span>
          : <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:50, background:'#F8D7DA', color:'#721C24' }}>Zavřeno</span>}
        {farm.eshop && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:50, background:'#E8F0E4', color:'#3A5728' }}>🛒 E-shop</span>}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600 }}>
        {realDist
          ? <span style={{ color: Number(realDist)<10?'#3A5728':Number(realDist)<30?'#C99B30':'#888' }}>
              📍 {realDist} km od vás
            </span>
          : <span style={{ color:'#5F8050' }}>📏 {farm.dist}</span>
        }
        <span style={{ color:'#999' }}>Detail →</span>
      </div>
    </div>
  );
}

// ── MAPBOX MAPA ────────────────────────────────────────────────────────────
function MapboxMap({ farms, selectedId, onSelect, userLocation, radius, dark, mapStyleUrl }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const navigate = useNavigate();

  // Načti Mapbox GL JS
  useEffect(() => {
    const load = () => new Promise(resolve => {
      if (window.mapboxgl) { resolve(); return; }
      if (!document.getElementById('mapbox-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css';
        document.head.appendChild(link);
      }
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    load().then(() => {
      if (mapInstance.current || !mapRef.current) return;
      if (!MAPBOX_TOKEN) return;

      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new window.mapboxgl.Map({
        container: mapRef.current,
        style: mapStyleUrl || 'mapbox://styles/mapbox/light-v11',
        center: [15.5, 49.75],
        zoom: 7.2,
        attributionControl: false,
        // Omezení na ČR + blízké okolí
        maxBounds: [
          [11.5, 47.8],   // SW — západ Čech, jih Moravy
          [19.2, 51.2],   // NE — východ Slovenska, sever Polska
        ],
        minZoom: 6.5,
        maxZoom: 18,
      });
      mapInstance.current = map;

      map.addControl(new window.mapboxgl.NavigationControl({ showCompass:false }), 'top-right');
      map.addControl(new window.mapboxgl.AttributionControl({ compact:true }), 'bottom-left');

      map.on('load', () => {
        // Source s clusteringem
        map.addSource('farms-cluster', {
          type: 'geojson',
          data: { type:'FeatureCollection', features:[] },
          cluster: true,
          clusterMaxZoom: 11,
          clusterRadius: 50,
        });

        // Cluster bublina
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'farms-cluster',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get','point_count'], '#7DB05A', 10, '#C99B30', 50, '#9B2226'],
            'circle-radius': ['step', ['get','point_count'], 20, 10, 28, 50, 36],
            'circle-stroke-width': 3,
            'circle-stroke-color': 'white',
            'circle-opacity': 0.9,
          },
        });

        // Počet v clusteru
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'farms-cluster',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 13,
          },
          paint: { 'text-color': 'white' },
        });

        // Klik na cluster → přiblíž
        map.on('click', 'clusters', e => {
          const features = map.queryRenderedFeatures(e.point, { layers:['clusters'] });
          const clusterId = features[0].properties.cluster_id;
          map.getSource('farms-cluster').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom + 0.5 });
          });
        });
        map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
      });
    });

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  // Změna stylu mapy za běhu
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapStyleUrl) return;
    map.setStyle(mapStyleUrl);
  }, [mapStyleUrl]);

  // Markery farem — načtení hned + velké čitelné ikonky + cluster data
  useEffect(() => {
    const buildMarkers = (map) => {
      // Aktualizuj GeoJSON source pro clustering
      const geojson = {
        type: 'FeatureCollection',
        features: farms.map(f => ({
          type: 'Feature',
          geometry: { type:'Point', coordinates:[f.lng, f.lat] },
          properties: { id: f.id, type: f.type, name: f.name },
        })),
      };
      if (map.getSource('farms-cluster')) {
        map.getSource('farms-cluster').setData(geojson);
      }

      // Individuální markery — lazy: jen při zoom >= 11, jen viditelná oblast
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};

      function createPin(farm) {
        const color = COLORS[farm.type] || '#5F8050';
        const isActive = farm.id === selectedId;
        const el = document.createElement('div');
        el.style.cssText = `cursor:pointer;transition:transform 0.15s;transform:${isActive?'scale(1.2)':'scale(1)'};filter:drop-shadow(0 3px 8px rgba(0,0,0,.25))`;
        el.innerHTML = `<svg width="36" height="47" viewBox="0 0 52 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 2C14.95 2 6 10.95 6 22C6 36.5 26 66 26 66C26 66 46 36.5 46 22C46 10.95 37.05 2 26 2Z" fill="${color}" stroke="white" stroke-width="3"/>
          <text x="26" y="30" text-anchor="middle" font-size="18">${farm.emoji}</text>
        </svg>`;
        el.addEventListener('click', () => onSelect(farm));
        return el;
      }

      function updateMarkers() {
        const zoom = map.getZoom();
        if (zoom < 11) {
          // Skryj všechny piny — clustery jsou aktivní
          Object.values(markersRef.current).forEach(m => m.getElement().style.display = 'none');
          return;
        }
        // Zobraz jen farmy ve viditelné oblasti
        const bounds = map.getBounds();
        farms.forEach(farm => {
          const inBounds = farm.lat >= bounds.getSouth() && farm.lat <= bounds.getNorth()
            && farm.lng >= bounds.getWest() && farm.lng <= bounds.getEast();
          if (!inBounds) {
            if (markersRef.current[farm.id]) markersRef.current[farm.id].getElement().style.display = 'none';
            return;
          }
          if (!markersRef.current[farm.id]) {
            const el = createPin(farm);
            const marker = new window.mapboxgl.Marker({ element: el, anchor:'bottom' }).setLngLat([farm.lng, farm.lat]).addTo(map);
            markersRef.current[farm.id] = marker;
          } else {
            markersRef.current[farm.id].getElement().style.display = 'block';
          }
        });
      }

      map.on('moveend', updateMarkers);
      map.on('zoomend', updateMarkers);
      updateMarkers();
    };

    const tryBuild = () => {
      const map = mapInstance.current;
      if (!map || !window.mapboxgl) { setTimeout(tryBuild, 150); return; }
      if (map.loaded()) buildMarkers(map);
      else map.once('load', () => buildMarkers(map));
    };
    tryBuild();
  }, [farms, selectedId]);

  // Uživatelská poloha
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !window.mapboxgl || !userLocation) return;

    if (userMarkerRef.current) userMarkerRef.current.remove();
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position:relative;width:20px;height:20px">
        <div style="width:20px;height:20px;background:#2980B9;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(41,128,185,.5)"></div>
        <div style="position:absolute;top:-5px;left:-5px;width:30px;height:30px;background:rgba(41,128,185,.2);border-radius:50%;animation:pulse-gps 2s infinite"></div>
      </div>`;
    userMarkerRef.current = new window.mapboxgl.Marker({ element: el, anchor:'center' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    // Kruh okruhu
    const deg = radius / 111;
    const pts = Array.from({ length:64 }, (_, i) => {
      const a = (i/64)*2*Math.PI;
      return [
        userLocation.lng + deg * Math.cos(a) / Math.cos(userLocation.lat * Math.PI / 180),
        userLocation.lat + deg * Math.sin(a),
      ];
    });
    pts.push(pts[0]);

    const run = () => {
      if (map.getSource('radius')) {
        map.getSource('radius').setData({ type:'Feature', geometry:{ type:'Polygon', coordinates:[pts] } });
      } else {
        map.addSource('radius', { type:'geojson', data:{ type:'Feature', geometry:{ type:'Polygon', coordinates:[pts] } } });
        map.addLayer({ id:'radius-fill', type:'fill', source:'radius', paint:{ 'fill-color':'#2980B9', 'fill-opacity':0.07 } });
        map.addLayer({ id:'radius-line', type:'line', source:'radius', paint:{ 'line-color':'#2980B9', 'line-width':2, 'line-dasharray':[5,3] } });
      }
    };
    if (map.loaded()) run(); else map.on('load', run);
    map.flyTo({ center:[userLocation.lng, userLocation.lat], zoom:9.5, duration:1500 });
  }, [userLocation, radius]);

  // Fly to + popup při výběru farmy
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedId || !window.mapboxgl) return;
    const farm = farms.find(f => f.id === selectedId);
    if (!farm) return;
    map.flyTo({ center:[farm.lng, farm.lat], zoom:13, duration:1200 });
    const color = COLORS[farm.type] || '#5F8050';
    new window.mapboxgl.Popup({ offset:46, closeButton:true, maxWidth:'270px' })
      .setLngLat([farm.lng, farm.lat])
      .setHTML(`
        <div style="font-family:'DM Sans',sans-serif">
          <div style="padding:14px 16px 10px;background:linear-gradient(135deg,${color}ee,${color}88);color:white">
            <div style="font-size:26px">${farm.emoji}</div>
            <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;margin-top:3px">${farm.name}</div>
            <div style="font-size:11px;opacity:.85;margin-top:2px">📍 ${farm.loc}</div>
            <div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">
              <span style="font-size:10px;font-weight:700;background:rgba(255,255,255,.22);border-radius:50px;padding:1px 7px">${farm.open?'✓ Otevřeno':'✗ Zavřeno'}</span>
              ${farm.bio?'<span style="font-size:10px;font-weight:700;background:rgba(255,255,255,.22);border-radius:50px;padding:1px 7px">🌱 BIO</span>':''}
              <span style="font-size:10px;font-weight:700;background:rgba(255,255,255,.22);border-radius:50px;padding:1px 7px">⭐ ${farm.rating}</span>
            </div>
          </div>
          <div style="padding:10px 14px;background:white">
            <div style="font-size:11px;color:#555;margin-bottom:8px">🕐 ${farm.hours}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
              ${(farm.products||[]).slice(0,3).map(p=>`<span style="font-size:10px;background:#EDE5D0;padding:2px 6px;border-radius:5px">${p}</span>`).join('')}
            </div>
            <button onclick="window.__goToFarm('${farm.id}')"
              style="width:100%;padding:8px;background:${color};color:white;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif">
              📋 Detail farmy
            </button>
          </div>
        </div>`)
      .addTo(map);
  }, [selectedId]);

  useEffect(() => {
    window.__goToFarm = (id) => navigate(`/farma/${id}`);
    return () => { delete window.__goToFarm; };
  }, [navigate]);

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center', background:'#F4EDD8' }}>
        <div style={{ textAlign:'center', padding:32, maxWidth:400 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🗺️</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:12 }}>Chybí Mapbox token</div>
          <p style={{ color:'#666', fontSize:14, lineHeight:1.7, marginBottom:20 }}>
            Pro zobrazení mapy potřebuješ bezplatný API klíč z <strong>mapbox.com</strong>.
          </p>
          <div style={{ background:'#1E120A', color:'#7DB05A', padding:'12px 16px', borderRadius:10, fontFamily:'monospace', fontSize:13, textAlign:'left', marginBottom:16 }}>
            # Vytvoř soubor frontend/.env<br/>
            VITE_MAPBOX_TOKEN=pk.eyJ1...
          </div>
          <a href="https://account.mapbox.com" target="_blank" rel="noreferrer"
            style={{ display:'inline-block', padding:'10px 24px', background:'#3A5728', color:'white', borderRadius:50, textDecoration:'none', fontWeight:700, fontSize:14 }}>
            Získat token zdarma →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse-gps { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.6);opacity:0} }
        .mapboxgl-popup-content { padding:0!important; border-radius:14px!important; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,.18)!important; }
        .mapboxgl-popup-tip { display:none!important; }
        .mapboxgl-popup-close-button { top:8px!important; right:10px!important; color:rgba(255,255,255,.9)!important; font-size:18px!important; background:none!important; }
      `}</style>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
    </>
  );
}

// ── HLAVNÍ KOMPONENTA ──────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { filter, search, selectedFarmId, showSidebar, setFilter, setSearch, selectFarm, toggleSidebar } = useMapStore();
  const { count: cartCount } = useCartStore();
  const { unreadCount, fetch: fetchNotifs } = useNotificationStore();

  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [radius, setRadius] = useState(25);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [showRadiusPanel, setShowRadiusPanel] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('mf-dark') === '1');
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('mf-style') || 'light');
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  const MAP_STYLES = [
    { id:'light',    label:'Světlá',    emoji:'☀️', url:'mapbox://styles/mapbox/light-v11' },
    { id:'outdoors', label:'Příroda',   emoji:'🌿', url:'mapbox://styles/mapbox/outdoors-v12' },
    { id:'streets',  label:'Ulice',     emoji:'🏙️', url:'mapbox://styles/mapbox/streets-v12' },
    { id:'satellite',label:'Satelit',   emoji:'🛰️', url:'mapbox://styles/mapbox/satellite-streets-v12' },
    { id:'dark',     label:'Tmavá',     emoji:'🌙', url:'mapbox://styles/mapbox/dark-v11' },
  ];
  const currentStyle = MAP_STYLES.find(s => s.id === mapStyle) || MAP_STYLES[0];

  // Téma barvy
  const T = dark ? {
    // Dark mode
    headerBg: '#0F0A05', headerBorder: 'rgba(255,255,255,.06)',
    filterBg: '#1A0F07', sidebarBg: '#1A1208', sidebarBorder: 'rgba(255,255,255,.08)',
    cardBg: '#241A0E', cardText: '#F4EDD8', cardSub: '#888', cardBorder: 'rgba(255,255,255,.08)',
    inputBg: 'rgba(255,255,255,.07)', inputColor: '#F4EDD8', inputBorder: 'rgba(255,255,255,.12)',
    mapStyle: 'mapbox://styles/mapbox/dark-v11',
    bannerBg: '#C99B30', bannerColor: '#1E120A',
    statsBg: 'rgba(255,255,255,.07)', statsColor: '#F4EDD8',
  } : {
    // Light mode
    headerBg: '#1E120A', headerBorder: 'transparent',
    filterBg: '#3A2210', sidebarBg: '#EDE5D0', sidebarBorder: 'rgba(0,0,0,.08)',
    cardBg: 'white', cardText: '#1E120A', cardSub: '#999', cardBorder: 'transparent',
    inputBg: 'rgba(255,255,255,.08)', inputColor: '#F4EDD8', inputBorder: 'rgba(255,255,255,.12)',
    mapStyle: 'mapbox://styles/mapbox/light-v11',
    bannerBg: '#C99B30', bannerColor: '#1E120A',
    statsBg: '#1E120A', statsColor: '#F4EDD8',
  };

  const toggleDark = () => setDark(d => {
    localStorage.setItem('mf-dark', d ? '0' : '1');
    return !d;
  });

  useEffect(() => { if (user) fetchNotifs(); }, [user]);

  const handleLocate = useCallback(() => {
    if (nearbyMode) {
      setNearbyMode(false);
      setUserLocation(null);
      setShowRadiusPanel(false);
      return;
    }
    if (!navigator.geolocation) { alert('GPS není podporováno ve vašem prohlížeči.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyMode(true);
        setShowRadiusPanel(true);
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); alert('Nepodařilo se získat polohu. Povolte přístup v prohlížeči.'); },
      { timeout:10000, enableHighAccuracy:true }
    );
  }, [nearbyMode]);

  const filtered = useMemo(() => {
    let data = FARMS_DATA;
    if (nearbyMode && userLocation) {
      data = data
        .map(f => ({ ...f, _dist: getDistance(userLocation.lat, userLocation.lng, f.lat, f.lng) }))
        .filter(f => f._dist <= radius)
        .sort((a, b) => a._dist - b._dist);
    }
    if (filter !== 'all') data = data.filter(f => f.type === filter);
    const q = search.toLowerCase();
    if (q) data = data.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.loc.toLowerCase().includes(q) ||
      (f.products||[]).some(p => p.toLowerCase().includes(q))
    );
    return data;
  }, [filter, search, nearbyMode, userLocation, radius]);

  const handleSelect = useCallback(farm => {
    selectFarm(farm.id);
    setTimeout(() => document.getElementById('card-'+farm.id)?.scrollIntoView({ behavior:'smooth', block:'nearest' }), 100);
  }, [selectFarm]);

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#B8A882; border-radius:2px; }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      {/* HEADER */}
      <header style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 16px', background:T.headerBg, flexShrink:0, boxShadow:'0 2px 12px rgba(0,0,0,.3)', zIndex:1000 }}>
        <button onClick={toggleSidebar} style={{ background:'none', border:'none', color:'#B8A882', cursor:'pointer', padding:4, display:'flex' }}>
          {showSidebar ? <X size={18}/> : <Menu size={18}/>}
        </button>
        <div onClick={() => navigate('/')} style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:'#F4EDD8', cursor:'pointer', whiteSpace:'nowrap' }}>
          Mapa<span style={{ color:'#7DB05A' }}>Farem</span>.cz
        </div>

        <div style={{ flex:1, maxWidth:360, position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#B8A882' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hledat farmu, produkt, obec…"
            style={{ width:'100%', padding:'8px 14px 8px 34px', borderRadius:50, border:'1.5px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.08)', color:'#F4EDD8', fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:'none' }}/>
        </div>

        {/* GPS tlačítko */}
        <button onClick={handleLocate} style={{
          display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:50,
          background: nearbyMode ? '#3A5728' : 'rgba(255,255,255,.1)',
          border: nearbyMode ? 'none' : '1.5px solid rgba(255,255,255,.2)',
          color: nearbyMode ? 'white' : '#B8A882',
          fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s', whiteSpace:'nowrap',
        }}>
          {gpsLoading
            ? <div style={{ width:14, height:14, border:'2px solid currentColor', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
            : <Navigation size={14}/>
          }
          {nearbyMode ? `📍 ${radius} km` : 'Kolem mě'}
        </button>

        {/* Dark mode přepínač */}
        <button onClick={toggleDark} title={dark ? 'Světlý režim' : 'Tmavý režim'} style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          width:34, height:34, borderRadius:'50%',
          background: dark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.08)',
          border:'1.5px solid rgba(255,255,255,.18)',
          color:'#F4EDD8', cursor:'pointer', transition:'all .2s', flexShrink:0,
        }}>
          {dark ? <Sun size={15}/> : <Moon size={15}/>}
        </button>

        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => navigate('/pokladna')} style={{ position:'relative', background:'none', border:'none', color:'#B8A882', cursor:'pointer', padding:6, display:'flex' }}>
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span style={{ position:'absolute', top:0, right:0, background:'#C99B30', color:'white', fontSize:9, fontWeight:700, borderRadius:50, padding:'1px 5px' }}>{cartCount}</span>}
          </button>
          {user ? (
            <div style={{ position:'relative' }}>
              <div onClick={() => setUserMenuOpen(v => !v)} style={{ width:34, height:34, borderRadius:'50%', background:'#5F8050', display:'grid', placeItems:'center', fontWeight:700, color:'white', fontSize:13, cursor:'pointer' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              {userMenuOpen && (
                <div style={{ position:'absolute', top:42, right:0, background:'white', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,.15)', minWidth:180, zIndex:9999, overflow:'hidden' }}>
                  <div style={{ padding:'10px 14px', borderBottom:'1px solid #EDE5D0' }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{user.name}</div>
                    <div style={{ fontSize:11, color:'#888' }}>{user.email}</div>
                  </div>
                  {[['👤 Profil','/profil'],['❤️ Oblíbené','/oblibene'],['📦 Objednávky','/objednavky'],
                    ...(user.role==='FARMER'?[['🌾 Dashboard','/dashboard']]:[])
                  ].map(([l,p]) => (
                    <div key={p} onClick={() => { navigate(p); setUserMenuOpen(false); }}
                      style={{ padding:'10px 14px', fontSize:13, cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F4EDD8'}
                      onMouseLeave={e=>e.currentTarget.style.background='white'}>{l}</div>
                  ))}
                  <div onClick={() => { logout(); setUserMenuOpen(false); }}
                    style={{ padding:'10px 14px', fontSize:13, cursor:'pointer', color:'#C0392B', borderTop:'1px solid #EDE5D0' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#FFF5F5'}
                    onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    🚪 Odhlásit se
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding:'7px 14px', background:'#C99B30', color:'#1E120A', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Přihlásit se
            </button>
          )}
          <button onClick={() => navigate('/registrace')} style={{ padding:'7px 14px', background:'#3A5728', color:'white', border:'none', borderRadius:50, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <Plus size={13}/> Přidat farmu
          </button>
        </div>
      </header>

      {/* FILTRY */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:T.filterBg, overflowX:'auto', flexShrink:0, scrollbarWidth:'none' }}>
        {nearbyMode && (
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(41,128,185,.2)', border:'1px solid #2980B9', borderRadius:50, padding:'4px 12px', flexShrink:0 }}>
            <span style={{ fontSize:11, color:'#89CFF0', fontWeight:700 }}>📍 {filtered.length} farem do {radius} km</span>
            <button onClick={() => setShowRadiusPanel(v => !v)} style={{ background:'none', border:'none', color:'#89CFF0', cursor:'pointer', fontSize:13, padding:0, lineHeight:1 }}>⚙️</button>
          </div>
        )}
        {Object.entries(LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding:'5px 12px', borderRadius:50,
            border:`1.5px solid ${filter===key ? (COLORS[key]||'#7DB05A') : 'rgba(255,255,255,.15)'}`,
            background: filter===key ? (COLORS[key]||'#7DB05A') : 'transparent',
            color: filter===key ? 'white' : 'rgba(255,255,255,.7)',
            fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight: filter===key?700:500,
            cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s', display:'flex', alignItems:'center', gap:5,
          }}>
            {key!=='all' && <span style={{ width:7, height:7, borderRadius:'50%', background:filter===key?'rgba(255,255,255,.5)':COLORS[key], display:'inline-block' }}/>}
            {label}
          </button>
        ))}
        <div style={{ marginLeft:'auto', fontSize:12, color:'rgba(255,255,255,.4)', whiteSpace:'nowrap', flexShrink:0 }}>
          {filtered.length} farem
        </div>
      </div>

      {/* TĚLO */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Sidebar */}
        {showSidebar && (
          <aside style={{ width:310, flexShrink:0, background:T.sidebarBg, borderRight:`1px solid ${T.sidebarBorder}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {nearbyMode && (
              <div style={{ padding:'7px 12px', background:'linear-gradient(135deg,#2980B9,#5DADE2)', color:'white', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                <Navigation size={12}/> Seřazeno dle vzdálenosti od vás
              </div>
            )}
            <div style={{ flex:1, overflowY:'auto', padding:10, display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'#999', fontSize:13 }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>{nearbyMode?'📍':'😕'}</div>
                  {nearbyMode ? `Žádné farmy do ${radius} km. Zkuste zvýšit radius.` : 'Žádné farmy neodpovídají filtru.'}
                </div>
              ) : filtered.map(farm => (
                <div key={farm.id} id={'card-'+farm.id}>
                  <FarmCard farm={farm} selected={selectedFarmId===farm.id} onClick={handleSelect} userLocation={userLocation} dark={dark}/>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Mapa */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <MapboxMap farms={filtered} selectedId={selectedFarmId} onSelect={handleSelect} userLocation={userLocation} radius={radius} dark={dark} mapStyleUrl={currentStyle.url}/>

          {/* Radius panel */}
          {showRadiusPanel && nearbyMode && (
            <div style={{ position:'absolute', top:16, right:56, zIndex:500, background:'white', borderRadius:14, padding:'14px 18px', boxShadow:'0 4px 24px rgba(0,0,0,.15)', minWidth:200 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:700 }}>Okruh hledání</span>
                <button onClick={() => setShowRadiusPanel(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:16, padding:0 }}>✕</button>
              </div>
              <div style={{ fontSize:12, color:'#888', marginBottom:8 }}>
                Radius: <strong style={{ color:'#3A5728' }}>{radius} km</strong>
              </div>
              <input type="range" min="5" max="100" step="5" value={radius} onChange={e => setRadius(Number(e.target.value))}
                style={{ width:'100%', accentColor:'#3A5728' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#aaa', marginTop:4 }}>
                <span>5 km</span><span>50 km</span><span>100 km</span>
              </div>
            </div>
          )}

          {/* Sezónní banner */}
          <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', background:'#C99B30', color:'#1E120A', padding:'5px 16px', borderRadius:50, fontSize:12, fontWeight:700, boxShadow:'0 2px 10px rgba(0,0,0,.15)', zIndex:500, whiteSpace:'nowrap', pointerEvents:'none' }}>
            🌱 Jaro 2026 — sezóna: jahody, chřest, špenát
          </div>

          {/* Přepínač stylů mapy */}
          <div style={{ position:'absolute', bottom:90, left:10, zIndex:500 }}>
            <button
              onClick={() => setStylePickerOpen(v => !v)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background:'white', border:'none', borderRadius:10,
                padding:'7px 12px', cursor:'pointer',
                boxShadow:'0 2px 12px rgba(0,0,0,.18)',
                fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, color:'#1E120A',
              }}>
              <span style={{ fontSize:15 }}>{currentStyle.emoji}</span>
              {currentStyle.label}
              <span style={{ fontSize:10, color:'#aaa', marginLeft:2 }}>{stylePickerOpen ? '▲' : '▼'}</span>
            </button>
            {stylePickerOpen && (
              <div style={{
                position:'absolute', bottom:42, left:0,
                background:'white', borderRadius:12, overflow:'hidden',
                boxShadow:'0 4px 24px rgba(0,0,0,.18)', minWidth:140,
              }}>
                {MAP_STYLES.map(s => (
                  <button key={s.id} onClick={() => {
                    setMapStyle(s.id);
                    localStorage.setItem('mf-style', s.id);
                    setStylePickerOpen(false);
                  }} style={{
                    display:'flex', alignItems:'center', gap:8,
                    width:'100%', padding:'9px 14px', border:'none', cursor:'pointer',
                    background: s.id === mapStyle ? '#F0EAD6' : 'white',
                    fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight: s.id===mapStyle ? 700 : 500,
                    color:'#1E120A', textAlign:'left',
                    borderLeft: s.id===mapStyle ? '3px solid #3A5728' : '3px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#F8F4EC'}
                  onMouseLeave={e => e.currentTarget.style.background = s.id===mapStyle ? '#F0EAD6' : 'white'}
                  >
                    <span style={{ fontSize:16 }}>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Statistiky */}
          <div style={{ position:'absolute', bottom:32, right:10, background:T.statsBg, color:T.statsColor, borderRadius:14, padding:'10px 16px', display:'flex', gap:16, zIndex:500, boxShadow:'0 4px 20px rgba(0,0,0,.2)', pointerEvents:'none' }}>
            {[
              [filtered.length, nearbyMode?`do ${radius} km`:'zobrazeno'],
              [200,'celkem v ČR'],
              ['14','krajů'],
            ].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color: nearbyMode&&l.includes('km')?'#5DADE2':'#7DB05A' }}>{n}</div>
                <div style={{ fontSize:10, color:'#B8A882', marginTop:1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
