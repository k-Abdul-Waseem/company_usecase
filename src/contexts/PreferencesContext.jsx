import { createContext, useCallback, useMemo } from 'react';
import { STORAGE_KEYS } from '@/constants/storage';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const PreferencesContext = createContext(null);

/** Baseline profile preferences applied when nothing has been customised. */
export const DEFAULT_PROFILE = {
  displayName: '',
  contactEmail: '',
  department: '',
  location: '',
  timezone: 'Asia/Kolkata',
};

/** Baseline notification preferences applied when nothing has been customised. */
export const DEFAULT_NOTIFICATIONS = {
  deadlineReminders: true,
  assessmentResults: true,
  contentUpdates: true,
};

/**
 * Holds the preferences that belong to a device rather than to the organisation
 * record: how the workspace looks, how the user is addressed and which
 * notifications they want to receive.
 */
export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const [storedProfile, setStoredProfile] = useLocalStorage(
    STORAGE_KEYS.settingsProfile,
    DEFAULT_PROFILE,
  );
  const [storedNotifications, setStoredNotifications] = useLocalStorage(
    STORAGE_KEYS.settingsNotifications,
    DEFAULT_NOTIFICATIONS,
  );

  const profile = useMemo(
    () => ({ ...DEFAULT_PROFILE, ...storedProfile }),
    [storedProfile],
  );
  const notifications = useMemo(
    () => ({ ...DEFAULT_NOTIFICATIONS, ...storedNotifications }),
    [storedNotifications],
  );

  const displayName = profile.displayName.trim() || user?.name || '';
  const contactEmail = profile.contactEmail.trim() || user?.email || '';

  const effectiveUser = useMemo(
    () => (user ? { ...user, name: displayName } : null),
    [user, displayName],
  );

  const updateProfile = useCallback(
    (patch) => {
      setStoredProfile((current) => ({ ...DEFAULT_PROFILE, ...current, ...patch }));
    },
    [setStoredProfile],
  );

  const updateNotifications = useCallback(
    (patch) => {
      setStoredNotifications((current) => ({ ...DEFAULT_NOTIFICATIONS, ...current, ...patch }));
    },
    [setStoredNotifications],
  );

  const resetProfile = useCallback(
    () => setStoredProfile(DEFAULT_PROFILE),
    [setStoredProfile],
  );

  const resetNotifications = useCallback(
    () => setStoredNotifications(DEFAULT_NOTIFICATIONS),
    [setStoredNotifications],
  );

  const value = useMemo(
    () => ({
      profile,
      notifications,
      displayName,
      contactEmail,
      effectiveUser,
      updateProfile,
      updateNotifications,
      resetProfile,
      resetNotifications,
    }),
    [
      profile,
      notifications,
      displayName,
      contactEmail,
      effectiveUser,
      updateProfile,
      updateNotifications,
      resetProfile,
      resetNotifications,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
