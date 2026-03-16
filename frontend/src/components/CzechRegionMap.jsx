// frontend/src/components/CzechRegionMap.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/osmlab/click-that-hood@master/public/data/czech-republic.geojson';

const PALETTE = [
  '#C8973A', '#2A6B3A', '#8B3A2C', '#1A5C7A', '#6B3A8B',
  '#2A7A5C', '#7A4A1A', '#3A5C8B', '#7A5C2A', '#5C2A7A',
  '#3A7A5C', '#8B2A4A', '#2A7A8B', '#5C7A2A',
];

// Approximate bounding boxes [minLat, minLng, maxLat, maxLng]
export const KRAJ_BOUNDS = {
  'Praha':                  [49.94, 14.22, 50.18, 14.71],
  'Středočeský kraj':       [49.55, 13.55, 50.85, 15.35],
  'Jihočeský kraj':         [48.55, 13.45, 49.75, 15.85],
  'Plzeňský kraj':          [49.10, 12.60, 50.10, 13.95],
  'Karlovarský kraj':       [50.05, 12.35, 50.65, 13.45],
  'Ústecký kraj':           [50.25, 13.15, 51.05, 14.65],
  'Liberecký kraj':         [50.65, 14.55, 51.05, 15.60],
  'Královéhradecký kraj':   [50.05, 15.55, 50.85, 16.60],
  'Pardubický kraj':        [49.70, 15.60, 50.45, 16.75],
  'Kraj Vysočina':          [49.30, 15.25, 49.95, 16.45],
  'Jihomoravský kraj':      [48.55, 15.75, 49.55, 17.45],
  'Olomoucký kraj':         [49.45, 16.65, 50.25, 17.75],
  'Zlínský kraj':           [48.85, 17.35, 49.65, 18.45],
  'Moravskoslezský kraj':   [49.45, 17.60, 50.05, 18.85],
};

export default function CzechRegionMap() {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const colorMapRef = useRef({});

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(data => {
        let i = 0;
        data.features.forEach(f => {
          const name = f.properties?.name || f.properties?.NAM_1 || String(i);
          if (!colorMapRef.current[name]) {
            colorMapRef.current[name] = PALETTE[i % PALETTE.length];
            i++;
          }
        });
        setGeoData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStyle = (feature) => {
    const name = feature.properties?.name || feature.properties?.NAM_1;
    return {
      fillColor: colorMapRef.current[name] || '#3A5728',
      fillOpacity: 0.55,
      color: 'rgba(200,151,58,.45)',
      weight: 1.5,
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature.properties?.name || feature.properties?.NAM_1 || '';

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.82, weight: 2.5, color: '#C8973A' });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.55, weight: 1.5, color: 'rgba(200,151,58,.45)' });
      },
      click: () => {
        navigate(`/mapa?kraj=${encodeURIComponent(name)}`);
      },
    });

    if (name) {
      layer.bindTooltip(name, {
        sticky: true,
        className: 'kraj-tooltip',
      });
    }
  };

  return (
    <div style={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(200,151,58,.2)' }}>
      <style>{`
        .kraj-tooltip {
          background: rgba(17,29,16,.96) !important;
          border: 1px solid rgba(200,151,58,.35) !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,.5) !important;
          color: #F5EDE0 !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          padding: 5px 10px !important;
        }
        .kraj-tooltip::before { display: none !important; }
        .leaflet-container { background: #1A2D18 !important; cursor: pointer !important; }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-control-zoom { display: none !important; }
      `}</style>

      {loading && (
        <div style={{ height:460, background:'#1A2D18', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(245,237,224,.3)', fontSize:14 }}>
          Načítám mapu krajů…
        </div>
      )}

      {!loading && !geoData && (
        <div style={{ height:460, background:'#1A2D18', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(245,237,224,.3)', fontSize:14 }}>
          Mapa není dostupná
        </div>
      )}

      {geoData && (
        <MapContainer
          center={[49.8, 15.5]}
          zoom={7}
          style={{ height:460, width:'100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <GeoJSON
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      )}

      <div style={{ position:'absolute', bottom:12, left:12, zIndex:1000, pointerEvents:'none', background:'rgba(17,29,16,.85)', backdropFilter:'blur(8px)', borderRadius:2, padding:'5px 12px', fontSize:11, color:'rgba(245,237,224,.45)', border:'1px solid rgba(200,151,58,.12)', letterSpacing:.5 }}>
        Klikni na kraj → farmy v okolí
      </div>
    </div>
  );
}
