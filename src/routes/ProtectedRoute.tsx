import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { UserRole } from '@/types/common';
import { ROUTES } from './routePaths';

interface ProtectedRouteProps {
  allowedRole: UserRole;
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'WORKER' ? ROUTES.worker.root : ROUTES.admin.root} replace />;
  }

  return <Outlet />;
}
