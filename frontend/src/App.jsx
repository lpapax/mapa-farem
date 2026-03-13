// frontend/src/App.jsx
// Přidána routa / → LandingPage, mapa přesunuta na /mapa
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import FarmDetailPage from './pages/FarmDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterFarmPage from './pages/RegisterFarmPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';
import { NotFoundPage } from './pages/OtherPages';
import { useAuthStore } from './store/index.js';

export default function App() {
  useEffect(() => { useAuthStore.getState().init(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/farma/:id" element={<FarmDetailPage />} />
        <Route path="/prihlaseni" element={<LoginPage />} />
        <Route path="/registrace" element={<RegisterPage />} />
        <Route path="/pridat-farmu" element={<RegisterFarmPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/oblibene" element={<FavoritesPage />} />
        <Route path="/pokladna" element={<CheckoutPage />} />
        <Route path="/objednavky" element={<OrdersPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Stará URL přesměruje na mapu */}
        <Route path="/zeměplocha" element={<Navigate to="/mapa" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
