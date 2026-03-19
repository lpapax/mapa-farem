// frontend/src/components/BottomNav.jsx
import { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Store, Heart, User } from 'lucide-react';
import { useAuthStore } from '../store/index.js';

const NAV_ITEMS = [
  { label: 'Domů',     Icon: Home,  path: '/' },
  { label: 'Mapa',     Icon: Map,   path: '/mapa' },
  { label: 'Trhy',     Icon: Store, path: '/trhy' },
  { label: 'Oblíbené', Icon: Heart, path: '/oblibene' },
  { label: 'Profil',   Icon: User,  path: null }, // resolved dynamically
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // resolvedItems only changes when the user logs in/out — stable between route changes
  const resolvedItems = useMemo(() => NAV_ITEMS.map(item => ({
    ...item,
    path: item.path === null ? (user ? '/profil' : '/prihlaseni') : item.path,
    resolvedLabel: item.label === 'Profil' && !user ? 'Přihlásit' : item.label,
  })), [user]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (!isMobile) return null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 999, background: '#FFFFFF',
      borderTop: '1px solid #E8E0D0',
      display: 'flex', alignItems: 'stretch',
      boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {resolvedItems.map(({ label, resolvedLabel, Icon, path }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '8px 4px 6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: active ? '#C8963E' : '#6B7280',
              transition: 'color 150ms ease',
              fontFamily: "'Inter','DM Sans',sans-serif",
              minWidth: 0,
              position: 'relative',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#2D5016'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#6B7280'; }}
            aria-label={resolvedLabel || label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              color={active ? '#C8963E' : '#6B7280'}
              aria-hidden="true"
            />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              marginTop: 3, lineHeight: 1,
              color: active ? '#C8963E' : '#6B7280',
              whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: '100%',
            }}>
              {resolvedLabel || label}
            </span>
            {active && (
              <div aria-hidden="true" style={{
                position: 'absolute', top: 0,
                width: 32, height: 2,
                background: '#C8963E', borderRadius: '0 0 2px 2px',
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// React.memo: BottomNav has no parent props — its only inputs are router location
// and the auth store user. memo prevents re-renders triggered by unrelated parent state.
export default memo(BottomNav);
