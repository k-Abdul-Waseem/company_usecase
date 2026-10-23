import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/auth/authService';

export const AuthContext = createContext(null);

/**
 * Provides the authenticated session and identity operations. The provider is
 * transport-agnostic: it only knows the authService contract.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;
    authService
      .restore()
      .then((restored) => {
        if (active) setSession(restored);
      })
      .finally(() => {
        if (active) setIsBootstrapping(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const next = await authService.login(credentials);
    setSession(next);
    return next;
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    const next = await authService.loginWithMicrosoft();
    setSession(next);
    return next;
  }, []);

  const switchDemoIdentity = useCallback(async (email) => {
    const next = await authService.switchDemoIdentity(email);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      learningRole: session?.user?.learningRole ?? null,
      isAuthenticated: Boolean(session),
      isBootstrapping,
      login,
      loginWithMicrosoft,
      switchDemoIdentity,
      logout,
    }),
    [session, isBootstrapping, login, loginWithMicrosoft, switchDemoIdentity, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
