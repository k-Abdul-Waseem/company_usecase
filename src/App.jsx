import { AuthProvider } from '@/contexts/AuthContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppRoutes } from '@/routes/AppRoutes';

/**
 * Application root.
 *
 * Provider order matters: theme and toasts must be available to every route,
 * authentication must resolve before a route renders role-aware content, and
 * preferences need an authenticated session to derive the effective identity.
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PreferencesProvider>
            <AppRoutes />
          </PreferencesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
