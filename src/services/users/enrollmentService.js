import { apiProvider } from '@/services/api';
import { percentOf } from '@/utils/format';

/**
 * Enrollment facade for the manager experience. All mutations flow through the
 * active adapter, so switching to a REST backend requires no page changes.
 */
export const enrollmentService = {
  list: (params = {}) => apiProvider.enrollments.list(params),
  getById: (id) => apiProvider.enrollments.getById(id),
  create: (input) => apiProvider.enrollments.create(input),
  update: (id, input) => apiProvider.enrollments.update(id, input),
  remove: (id) => apiProvider.enrollments.remove(id),

  async getStats() {
    const enrollments = await apiProvider.enrollments.list({});
    const total = enrollments.length;
    const completed = enrollments.filter((item) => item.status === 'completed').length;
    const active = enrollments.filter((item) => item.status === 'active').length;
    const pending = enrollments.filter((item) => item.status === 'pending').length;
    const assignedModules = enrollments.reduce(
      (sum, item) => sum + item.assignedModules,
      0,
    );
    const scored = enrollments.filter((item) => item.averageScore > 0);
    const averageQuizScore = scored.length
      ? scored.reduce((sum, item) => sum + item.averageScore, 0) / scored.length
      : 0;
    const completedModules = enrollments.reduce(
      (sum, item) => sum + item.completedModules,
      0,
    );

    return {
      total,
      active,
      pending,
      completed,
      assignedModules,
      completedModules,
      averageQuizScore: Math.round(averageQuizScore * 10) / 10,
      completionRate: percentOf(completed, total),
    };
  },

  async getRecent(limit = 5) {
    const enrollments = await apiProvider.enrollments.list({});
    return enrollments.slice(0, limit);
  },
};
