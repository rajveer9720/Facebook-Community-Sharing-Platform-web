import { Navigate, Outlet } from 'react-router-dom';
import { useAbility } from '@/casl/AbilityContext';
import { ROUTES } from './routePaths';

interface PermissionRouteProps {
  action: string;
  subject: string;
}

export function PermissionRoute({ action, subject }: PermissionRouteProps) {
  const ability = useAbility();

  if (!ability.can(action, subject)) {
    return <Navigate to={ROUTES.admin.root} replace />;
  }

  return <Outlet />;
}
