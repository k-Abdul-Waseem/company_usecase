import { unwrap, httpClient as client } from './httpClient';

/**
 * REST adapter. It implements exactly the same contract as the mock provider,
 * which is why swapping backends never requires a page or component change.
 * Endpoint paths below are the suggested backend contract; adjust only this
 * file when the real API differs.
 */
async function request(method, url, data, config) {
  const response = await client.request({ method, url, data, ...config });
  return unwrap(response);
}

export const restProvider = {
  name: 'rest',

  auth: {
    login: (credentials) => request('post', '/auth/login', credentials),
    loginWithMicrosoft: () => request('post', '/auth/microsoft'),
    getSession: () => request('get', '/auth/session'),
    switchIdentity: (email) => request('post', '/auth/switch', { email }),
  },

  users: {
    list: () => request('get', '/users'),
    getById: (userId) => request('get', `/users/${encodeURIComponent(userId)}`),
    getCurrent: () => request('get', '/users/me'),
    listProjects: () => request('get', '/projects'),
  },

  enrollments: {
    list: (params = {}) => request('get', '/enrollments', undefined, { params }),
    getById: (id) => request('get', `/enrollments/${encodeURIComponent(id)}`),
    create: (input) => request('post', '/enrollments', input),
    update: (id, input) => request('patch', `/enrollments/${encodeURIComponent(id)}`, input),
    remove: (id) => request('delete', `/enrollments/${encodeURIComponent(id)}`),
  },

  content: {
    list: (params = {}) => request('get', '/documents', undefined, { params }),
    upload: (input) => {
      const formData = new FormData();
      Object.entries(input).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((entry) => formData.append(`${key}[]`, entry));
        } else {
          formData.append(key, value);
        }
      });
      return request('post', '/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    retry: (id) => request('post', `/documents/${encodeURIComponent(id)}/retry`),
    remove: (id) => request('delete', `/documents/${encodeURIComponent(id)}`),
  },

  modules: {
    list: (params = {}) => request('get', '/modules', undefined, { params }),
    getById: (id) => request('get', `/modules/${encodeURIComponent(id)}`),
    updateProgress: (id, patch) =>
      request('patch', `/modules/${encodeURIComponent(id)}/progress`, patch),
    toggleBookmark: (id) =>
      request('post', `/modules/${encodeURIComponent(id)}/bookmark`),
    listBookmarks: () => request('get', '/modules/bookmarks'),
  },

  assistant: {
    ask: ({ question }) => request('post', '/assistant/query', { question }),
    suggestions: () => request('get', '/assistant/suggestions'),
  },

  quizzes: {
    list: () => request('get', '/quizzes'),
    get: (quizId) => request('get', `/quizzes/${encodeURIComponent(quizId)}`),
    getQuestions: (quizId) =>
      request('get', `/quizzes/${encodeURIComponent(quizId)}/questions`),
    submit: (quizId, input) =>
      request('post', `/quizzes/${encodeURIComponent(quizId)}/attempts`, input),
    getAttempt: (quizId, attemptId) =>
      request(
        'get',
        `/quizzes/${encodeURIComponent(quizId)}/attempts/${encodeURIComponent(attemptId)}`,
      ),
  },

  progress: {
    getSummary: () => request('get', '/progress'),
    getTimeline: () => request('get', '/progress/timeline'),
    getModuleProgress: () => request('get', '/progress/modules'),
  },

  reports: {
    getAnalytics: () => request('get', '/reports'),
  },

  notifications: {
    list: () => request('get', '/notifications'),
    markRead: (id) => request('patch', `/notifications/${encodeURIComponent(id)}`, { read: true }),
    markAllRead: () => request('post', '/notifications/read-all'),
  },
};
