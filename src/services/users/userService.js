import { apiProvider } from '@/services/api';

/** Directory and project lookups. */
export const userService = {
  list: () => apiProvider.users.list(),
  getById: (userId) => apiProvider.users.getById(userId),
  getCurrent: () => apiProvider.users.getCurrent(),
  listProjects: () => apiProvider.users.listProjects(),
};
