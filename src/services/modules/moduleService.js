import { apiProvider } from '@/services/api';

/** Role-aware learning module facade. */
export const moduleService = {
  list: (params = {}) => apiProvider.modules.list(params),
  getById: (moduleId) => apiProvider.modules.getById(moduleId),
  updateProgress: (moduleId, patch) => apiProvider.modules.updateProgress(moduleId, patch),
  toggleBookmark: (moduleId) => apiProvider.modules.toggleBookmark(moduleId),
  listBookmarks: () => apiProvider.modules.listBookmarks(),

  async getContinueLearning() {
    const { items } = await apiProvider.modules.list({});
    const inProgress = items
      .filter((module) => module.progress.status === 'in_progress')
      .sort(
        (a, b) =>
          new Date(b.progress.lastActivityAt ?? 0).getTime() -
          new Date(a.progress.lastActivityAt ?? 0).getTime(),
      );
    if (inProgress.length) return inProgress[0];
    return items.find((module) => module.progress.status === 'not_started') ?? items[0] ?? null;
  },
};
