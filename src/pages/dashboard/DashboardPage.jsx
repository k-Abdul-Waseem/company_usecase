import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useUi';
import { ManagerDashboard } from './ManagerDashboard';
import { LearnerDashboard } from './LearnerDashboard';

/** Role-aware dashboard dispatcher. */
export function DashboardPage() {
  const { user, role } = useAuth();
  useDocumentTitle('Dashboard');

  if (role === 'manager') return <ManagerDashboard user={user} />;
  return <LearnerDashboard user={user} />;
}
