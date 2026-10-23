import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/constants/routes';

/** Restricts a branch to the listed platform roles. */
export function RoleRoute({ allowedRoles = [] }) {
  const { role, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Restoring session" description="Checking permissions." />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.unauthorized} replace />;
  }

  return <Outlet />;
}
