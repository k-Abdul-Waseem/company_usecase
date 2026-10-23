import { apiProvider } from '@/services/api';

/** Manager analytics facade. */
export const reportService = {
  getAnalytics: () => apiProvider.reports.getAnalytics(),
};
