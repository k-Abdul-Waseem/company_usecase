import { SearchX } from 'lucide-react';
import { StatusPage } from '@/components/common/StatusPage';
import { ROUTES } from '@/constants/routes';

/** 404 screen shown for any route that does not exist. */
export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      icon={SearchX}
      title="We could not find that page"
      description="The address may be out of date, or the page may have moved. Use the navigation to get back on track."
      primaryTo={ROUTES.dashboard}
      primaryLabel="Back to dashboard"
    />
  );
}
