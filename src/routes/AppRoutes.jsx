import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATTERNS, ROUTES } from '@/constants/routes';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { AssistantPage } from '@/pages/learner/AssistantPage';
import { LearningModulesPage } from '@/pages/learner/LearningModulesPage';
import { ModuleDetailPage } from '@/pages/learner/ModuleDetailPage';
import { ProgressPage } from '@/pages/learner/ProgressPage';
import { QuizAttemptPage } from '@/pages/learner/QuizAttemptPage';
import { QuizCenterPage } from '@/pages/learner/QuizCenterPage';
import { QuizResultsPage } from '@/pages/learner/QuizResultsPage';
import { ContentLibraryPage } from '@/pages/manager/ContentLibraryPage';
import { EnrollmentPage } from '@/pages/manager/EnrollmentPage';
import { ReportsPage } from '@/pages/manager/ReportsPage';

const MANAGER_ROLES = ['manager'];
const LEARNER_ROLES = ['learner'];

/** Sends visitors to the dashboard or the sign-in screen depending on session. */
function RootRedirect() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Preparing workspace" description="Restoring your session." />;
  }

  return <Navigate to={isAuthenticated ? ROUTES.dashboard : ROUTES.login} replace />;
}

/**
 * The complete route table for the platform.
 *
 * Public screens live outside `PublicOnlyRoute` so that a signed-in visitor can
 * still reach the 403 and 404 pages, and the catch-all route sits at the top
 * level so unknown URLs render a 404 instead of bouncing through the login
 * screen.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.root} element={<RootRedirect />} />

      <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />
      <Route path={ROUTES.notFound} element={<NotFoundPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />

          <Route element={<RoleRoute allowedRoles={MANAGER_ROLES} />}>
            <Route path={ROUTES.enrollment} element={<EnrollmentPage />} />
            <Route path={ROUTES.contentLibrary} element={<ContentLibraryPage />} />
            <Route path={ROUTES.reports} element={<ReportsPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={LEARNER_ROLES} />}>
            <Route path={ROUTES.learningModules} element={<LearningModulesPage />} />
            <Route
              path={ROUTE_PATTERNS.learningModuleDetail}
              element={<ModuleDetailPage />}
            />
            <Route path={ROUTES.aiAssistant} element={<AssistantPage />} />
            <Route path={ROUTES.quizCenter} element={<QuizCenterPage />} />
            <Route
              path={ROUTE_PATTERNS.quizResults}
              element={<QuizResultsPage />}
            />
            <Route path={ROUTE_PATTERNS.quizAttempt} element={<QuizAttemptPage />} />
            <Route path={ROUTES.progressTracker} element={<ProgressPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
