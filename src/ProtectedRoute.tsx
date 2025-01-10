import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticationStatus } from '@nhost/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signup');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show a loading spinner while checking authentication status
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render children only if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
