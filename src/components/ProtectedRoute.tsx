import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loading } from './ui';
import type { Role } from '@shared/types';

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="route-loading"><Loading label="Checking demo session…" /></div>;
  if (!user) return <Navigate to={`/${role}/login`} state={{ from: location.pathname }} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}
