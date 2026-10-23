/**
 * Application route paths. Route constants live here so that navigation
 * components, guards and page components never hard-code URL strings.
 */
export const ROUTES = {
  root: '/',
  login: '/login',
  unauthorized: '/unauthorized',
  notFound: '/404',
  dashboard: '/dashboard',
  enrollment: '/enrollment',
  contentLibrary: '/content-library',
  learningModules: '/learning-modules',
  learningModuleDetail: (moduleId) => `/learning-modules/${moduleId}`,
  aiAssistant: '/ai-assistant',
  quizCenter: '/quiz-center',
  quizAttempt: (quizId) => `/quiz-center/${quizId}`,
  quizResults: (quizId, attemptId) => `/quiz-center/${quizId}/results/${attemptId}`,
  progressTracker: '/progress-tracker',
  reports: '/reports',
  settings: '/settings',
};

/**
 * Route path patterns used when declaring routes. Parameters are prefixed with
 * `:` and map one-to-one onto the builders above.
 */
export const ROUTE_PATTERNS = {
  learningModuleDetail: '/learning-modules/:moduleId',
  quizAttempt: '/quiz-center/:quizId',
  quizResults: '/quiz-center/:quizId/results/:attemptId',
};

/** Route path constants as a flat record, useful for tests and assertions. */
export const ROUTE_PATHS = {
  login: ROUTES.login,
  dashboard: ROUTES.dashboard,
  enrollment: ROUTES.enrollment,
  contentLibrary: ROUTES.contentLibrary,
  learningModules: ROUTES.learningModules,
  aiAssistant: ROUTES.aiAssistant,
  quizCenter: ROUTES.quizCenter,
  progressTracker: ROUTES.progressTracker,
  reports: ROUTES.reports,
  settings: ROUTES.settings,
  unauthorized: ROUTES.unauthorized,
};
