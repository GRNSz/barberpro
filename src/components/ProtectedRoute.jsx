import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredType }) {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && userType !== requiredType) {
    let redirect = '/cliente';
    if (userType === 'barber') redirect = '/barbeiro';
    if (userType === 'admin') redirect = '/admin';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
