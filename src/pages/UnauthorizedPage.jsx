import { ShieldAlert } from 'lucide-react';
import { StatusPage } from '@/components/common/StatusPage';
import { ROUTES } from '@/constants/routes';

/** 403 screen shown when a signed-in user opens a route their role cannot reach. */
export function UnauthorizedPage() {
  return (
    <StatusPage
      code="403"
      icon={ShieldAlert}
      title="You do not have access to this area"
      description="Your account does not include the role required for this page. If you believe this is a mistake, ask your learning program manager to review your access."
      primaryTo={ROUTES.dashboard}
      primaryLabel="Back to dashboard"
    />
  );
}
