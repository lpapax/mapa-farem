// frontend/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/index.js';

import MapPage        from './pages/MapPage.jsx';
import FarmDetailPage from './pages/FarmDetailPage.jsx';
import LoginPage      from './pages/LoginPage.jsx';
import RegisterPage   from './pages/RegisterPage.jsx';
import ProfilePage    from './pages/ProfilePage.jsx';
import FavoritesPage  from './pages/FavoritesPage.jsx';
import OrdersPage     from './pages/OrdersPage.jsx';
import CheckoutPage   from './pages/CheckoutPage.jsx';
import DashboardPage  from './pages/DashboardPage.jsx';
import RegisterFarmPage from './pages/RegisterFarmPage.jsx';
import NotFoundPage   from './pages/NotFoundPage.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: '10px',
            background: '#1E120A',
            color: '#F4EDD8',
          },
          success: { iconTheme: { primary: '#7DB05A', secondary: '#F4EDD8' } },
          error:   { iconTheme: { primary: '#C0392B', secondary: '#F4EDD8' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/"              element={<MapPage />} />
        <Route path="/farma/:id"     element={<FarmDetailPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/registrace"    element={<RegisterPage />} />

        {/* Customer protected */}
        <Route path="/profil"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/oblibene"      element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/objednavky"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/pokladna"      element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

        {/* Farmer protected */}
        <Route path="/dashboard"     element={<ProtectedRoute roles={['FARMER','ADMIN']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/registrace-farmy" element={<ProtectedRoute roles={['FARMER']}><RegisterFarmPage /></ProtectedRoute>} />

        <Route path="*"              element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
