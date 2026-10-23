/**
 * Keys used for values persisted in `localStorage`.
 * Centralised so that storage access is auditable and safe to change.
 */
export const STORAGE_KEYS = {
  theme: 'aipip.theme',
  session: 'aipip.session',
  sidebarCollapsed: 'aipip.sidebar.collapsed',
  moduleProgress: 'aipip.module.progress',
  bookmarks: 'aipip.module.bookmarks',
  quizAttempts: 'aipip.quiz.attempts',
  assistantConversations: 'aipip.assistant.conversations',
  enrollmentOverrides: 'aipip.enrollment.overrides',
  documents: 'aipip.content.documents',
  notifications: 'aipip.notifications.read',
  settingsProfile: 'aipip.settings.profile',
  settingsNotifications: 'aipip.settings.notifications',
  mockSeedVersion: 'aipip.mock.seed.version',
};

/** Supported colour themes. */
export const THEMES = ['light', 'dark'];

/** Default theme applied when the OS preference is unknown. */
export const DEFAULT_THEME = 'light';

/** Current seed version. Bumping this refreshes demo data on next load. */
export const MOCK_SEED_VERSION = '1.0.0';
