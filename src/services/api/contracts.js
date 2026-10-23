/**
 * Adapter contract for the induction platform.
 *
 * Every provider (mock, REST, GraphQL, BFF, ...) implements this object. Domain
 * services in `src/services/*` are thin facades over the active provider, so a
 * backend replacement only requires a new provider that satisfies this shape.
 *
 * @typedef {Object} AuthProviderContract
 * @property {(credentials: {email: string, password: string}) => Promise<Object>} login
 * @property {() => Promise<Object>} loginWithMicrosoft
 * @property {() => Promise<Object|null>} getSession
 * @property {(user: Object) => Promise<Object>} switchIdentity
 *
 * @typedef {Object} UsersProviderContract
 * @property {() => Promise<Object[]>} list
 * @property {(userId: string) => Promise<Object>} getById
 * @property {() => Promise<Object>} getCurrent
 * @property {() => Promise<Object[]>} listProjects
 *
 * @typedef {Object} EnrollmentsProviderContract
 * @property {(params?: Object) => Promise<Object[]>} list
 * @property {(id: string) => Promise<Object>} getById
 * @property {(input: Object) => Promise<Object>} create
 * @property {(id: string, input: Object) => Promise<Object>} update
 * @property {(id: string) => Promise<void>} remove
 *
 * @typedef {Object} ContentProviderContract
 * @property {(params?: Object) => Promise<Object[]>} list
 * @property {(input: Object) => Promise<Object>} upload
 * @property {(id: string) => Promise<Object>} retry
 * @property {(id: string) => Promise<void>} remove
 *
 * @typedef {Object} ModulesProviderContract
 * @property {(params?: Object) => Promise<Object>} list
 * @property {(id: string) => Promise<Object>} getById
 * @property {(id: string, patch: Object) => Promise<Object>} updateProgress
 * @property {(id: string) => Promise<Object>} toggleBookmark
 * @property {() => Promise<Object[]>} listBookmarks
 *
 * @typedef {Object} AssistantProviderContract
 * @property {(input: {question: string}) => Promise<Object>} ask
 * @property {() => Promise<Object[]>} suggestions
 *
 * @typedef {Object} QuizProviderContract
 * @property {() => Promise<Object>} list
 * @property {(quizId: string) => Promise<Object>} get
 * @property {(quizId: string) => Promise<Object[]>} getQuestions
 * @property {(quizId: string, input: Object) => Promise<Object>} submit
 * @property {(quizId: string, attemptId: string) => Promise<Object>} getAttempt
 *
 * @typedef {Object} ProgressProviderContract
 * @property {() => Promise<Object>} getSummary
 * @property {() => Promise<Object[]>} getTimeline
 * @property {() => Promise<Object[]>} getModuleProgress
 *
 * @typedef {Object} ReportsProviderContract
 * @property {() => Promise<Object>} getAnalytics
 *
 * @typedef {Object} NotificationsProviderContract
 * @property {() => Promise<Object[]>} list
 * @property {(id: string) => Promise<Object[]>} markRead
 * @property {() => Promise<Object[]>} markAllRead
 *
 * @typedef {Object} ApiProvider
 * @property {string} name
 * @property {AuthProviderContract} auth
 * @property {UsersProviderContract} users
 * @property {EnrollmentsProviderContract} enrollments
 * @property {ContentProviderContract} content
 * @property {ModulesProviderContract} modules
 * @property {AssistantProviderContract} assistant
 * @property {QuizProviderContract} quizzes
 * @property {ProgressProviderContract} progress
 * @property {ReportsProviderContract} reports
 * @property {NotificationsProviderContract} notifications
 */

export const PROVIDER_METHODS = [
  'auth.login',
  'auth.loginWithMicrosoft',
  'users.list',
  'users.getCurrent',
  'enrollments.list',
  'enrollments.create',
  'enrollments.update',
  'enrollments.remove',
  'content.list',
  'content.upload',
  'modules.list',
  'modules.getById',
  'modules.updateProgress',
  'modules.toggleBookmark',
  'assistant.ask',
  'quizzes.list',
  'quizzes.get',
  'quizzes.submit',
  'progress.getSummary',
  'progress.getTimeline',
  'reports.getAnalytics',
  'notifications.list',
];
