import { STORAGE_KEYS } from '@/constants/storage';
import { readJson, writeJson, removeKey } from '@/utils/storage';

/**
 * Local session persistence. The transport adapter is responsible for what a
 * session contains; this module only stores and expires it on the client.
 */
export const sessionStore = {
  get() {
    const session = readJson(STORAGE_KEYS.session, null);
    if (!session) return null;
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      removeKey(STORAGE_KEYS.session);
      return null;
    }
    return session;
  },

  set(session) {
    writeJson(STORAGE_KEYS.session, session);
    return session;
  },

  clear() {
    removeKey(STORAGE_KEYS.session);
  },

  getUser() {
    return this.get()?.user ?? null;
  },
};
