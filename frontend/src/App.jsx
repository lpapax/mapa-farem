// frontend/src/App.jsx
// Přidána routa / → LandingPage, mapa přesunuta na /mapa
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/index.js';
import BottomNav from './components/BottomNav';
import PrivateRoute from './components/PrivateRoute';

// All pages lazy-loaded for optimal code splitting
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const MapPage           = lazy(() => import('./pages/MapPage'));
const FarmDetailPage    = lazy(() => import('./pages/FarmDetailPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const RegisterFarmPage  = lazy(() => import('./pages/RegisterFarmPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage     = lazy(() => import('./pages/FavoritesPage'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage'));
const DashboardPage     = lazy(() => import('./pages/DashboardPage'));
const SeasonalGuidePage = lazy(() => import('./pages/SeasonalGuidePage'));
const AdminPage         = lazy(() => import('./pages/AdminPage'));
const AboutPage         = lazy(() => import('./pages/AboutPage'));
const PricingPage       = lazy(() => import('./pages/PricingPage'));
const ProfileSetupPage  = lazy(() => import('./pages/ProfileSetupPage'));
const NotFoundPageLazy  = lazy(() => import('./pages/OtherPages').then(m => ({ default: m.NotFoundPage })));
const BlogPage          = lazy(() => import('./pages/BlogPage'));
const BlogPostPage      = lazy(() => import('./pages/BlogPostPage'));
const MarketsPage       = lazy(() => import('./pages/MarketsPage'));
const LeaderboardPage   = lazy(() => import('./pages/LeaderboardPage'));

export default function App() {
  useEffect(() => { useAuthStore.getState().init(); }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div style={{ display:'grid', placeItems:'center', height:'100vh', background:'#F5EDE0', fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🌾</div>
            <div style={{ color:'#3A5728', fontWeight:600, fontSize:16 }}>Načítám…</div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/farma/:id" element={<FarmDetailPage />} />
          <Route path="/prihlaseni" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/prihlaseni" replace />} />
          <Route path="/registrace" element={<RegisterPage />} />
          <Route path="/pridat-farmu" element={<PrivateRoute role="FARMER"><RegisterFarmPage /></PrivateRoute>} />
          <Route path="/profil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profil-setup" element={<PrivateRoute><ProfileSetupPage /></PrivateRoute>} />
          <Route path="/oblibene" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
          <Route path="/pokladna" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/objednavky" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute role="FARMER"><DashboardPage /></PrivateRoute>} />
          <Route path="/sezona" element={<SeasonalGuidePage />} />
          <Route path="/sezona/:season" element={<SeasonalGuidePage />} />
          <Route path="/o-nas" element={<AboutPage />} />
          <Route path="/cenik" element={<PricingPage />} />
          <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminPage /></PrivateRoute>} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/trhy" element={<MarketsPage />} />
          {/* Stará URL přesměruje na mapu */}
          <Route path="/zeměplocha" element={<Navigate to="/mapa" replace />} />
          <Route path="*" element={<NotFoundPageLazy />} />
        </Routes>
        <BottomNav />
      </Suspense>
    </BrowserRouter>
  );
}
