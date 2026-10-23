import { apiProvider } from '@/services/api';
import { STORAGE_KEYS } from '@/constants/storage';
import { readJson } from '@/utils/storage';

/** Baseline notification preferences used when nothing has been customised. */
const DEFAULT_NOTIFICATIONS = {
  deadlineReminders: true,
  assessmentResults: true,
  contentUpdates: true,
};

/** Maps a notification type onto the preference that governs it. */
const TYPE_PREFERENCE = {
  deadline: 'deadlineReminders',
  quiz: 'assessmentResults',
  report: 'assessmentResults',
  content: 'contentUpdates',
  enrollment: 'contentUpdates',
};

/**
 * Returns the notifications the user has chosen to see. The filtering happens
 * here rather than in the provider so that a backend replacement inherits the
 * same behaviour without any change to the adapter contract.
 */
async function listVisible() {
  const items = await apiProvider.notifications.list();
  const preferences = readJson(STORAGE_KEYS.settingsNotifications, DEFAULT_NOTIFICATIONS) ?? DEFAULT_NOTIFICATIONS;

  return items.filter((item) => {
    const key = TYPE_PREFERENCE[item.type];
    if (!key) return true;
    return preferences[key] !== false;
  });
}

/** Notification inbox facade used by the application header. */
export const notificationService = {
  list: () => listVisible(),

  async markRead(id) {
    await apiProvider.notifications.markRead(id);
    return listVisible();
  },

  async markAllRead() {
    await apiProvider.notifications.markAllRead();
    return listVisible();
  },
};
