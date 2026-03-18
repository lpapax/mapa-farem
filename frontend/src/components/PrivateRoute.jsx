// frontend/src/components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';

/**
 * Wraps a route so it requires authentication.
 * - If not logged in  → redirect to /prihlaseni?from=<current-path>
 * - If `role` given and user's role doesn't match → redirect to /
 */
export default function PrivateRoute({ children, role }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/prihlaseni?from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
