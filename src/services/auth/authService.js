import { apiProvider, sessionStore } from '@/services/api';

/**
 * Authentication facade. The UI never talks to an identity provider directly;
 * swapping the adapter changes token acquisition without touching any page.
 */
export const authService = {
  async login(credentials) {
    const session = await apiProvider.auth.login(credentials);
    sessionStore.set(session);
    return session;
  },

  async loginWithMicrosoft() {
    const session = await apiProvider.auth.loginWithMicrosoft();
    sessionStore.set(session);
    return session;
  },

  async switchDemoIdentity(email) {
    const session = await apiProvider.auth.switchIdentity(email);
    sessionStore.set(session);
    return session;
  },

  async restore() {
    return sessionStore.get();
  },

  async logout() {
    sessionStore.clear();
  },

  getSession() {
    return sessionStore.get();
  },

  getCurrentUser() {
    return sessionStore.getUser();
  },

  isAuthenticated() {
    return Boolean(sessionStore.get());
  },
};
