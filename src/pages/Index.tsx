import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Landing from './Landing';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
};

export default Index;
