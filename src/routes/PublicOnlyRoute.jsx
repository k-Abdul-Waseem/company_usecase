import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/constants/routes';

/** Prevents authenticated users from visiting public-only screens (e.g. login). */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Preparing workspace" description="Initialising the session." />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
}
