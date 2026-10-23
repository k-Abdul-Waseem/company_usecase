import { apiProvider } from '@/services/api';

/** Learner progress, readiness model and timeline facade. */
export const progressService = {
  getSummary: () => apiProvider.progress.getSummary(),
  getTimeline: () => apiProvider.progress.getTimeline(),
  getModuleProgress: () => apiProvider.progress.getModuleProgress(),
};
