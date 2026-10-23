import { MOCK_SEED_VERSION, STORAGE_KEYS } from '@/constants/storage';
import { clone, createId, nowIso } from '@/utils';
import { getInitials, formatFileSize, percentOf } from '@/utils/format';
import usersSeed from '@/mocks/users.json';
import projectsSeed from '@/mocks/projects.json';
import modulesSeed from '@/mocks/modules.json';
import quizzesSeed from '@/mocks/quizzes.json';
import questionsSeed from '@/mocks/quizQuestions.json';
import progressSeed from '@/mocks/progress.json';
import enrollmentsSeed from '@/mocks/enrollments.json';
import documentsSeed from '@/mocks/documents.json';
import reportsSeed from '@/mocks/reports.json';
import activitySeed from '@/mocks/activity.json';
import assistantSeed from '@/mocks/assistantResponses.json';
import notificationsSeed from '@/mocks/notifications.json';
import { readJson, readString, removeKey, writeJson, writeString } from '@/utils/storage';
import { mockRequest } from './mockClient';
import { ApiError } from './errors';
import { sessionStore } from './session';

const MODULES = modulesSeed.modules;
const QUIZZES = quizzesSeed.quizzes;
const QUESTIONS = questionsSeed.questions;
const PROJECTS = projectsSeed.projects;
const USERS = usersSeed.users;
const CREDENTIALS = usersSeed.credentials;

/** Clears mutable demo data whenever the seed contract changes. */
function bootSeed() {
  const storedVersion = readString(STORAGE_KEYS.mockSeedVersion, null);
  if (storedVersion !== MOCK_SEED_VERSION) {
    [
      STORAGE_KEYS.enrollmentOverrides,
      STORAGE_KEYS.moduleProgress,
      STORAGE_KEYS.quizAttempts,
      STORAGE_KEYS.documents,
      STORAGE_KEYS.notifications,
      STORAGE_KEYS.assistantConversations,
    ].forEach(removeKey);
    writeString(STORAGE_KEYS.mockSeedVersion, MOCK_SEED_VERSION);
  }
}
bootSeed();

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function requireUser() {
  const user = sessionStore.getUser();
  if (!user) {
    throw new ApiError('Your session has expired. Sign in again to continue.', {
      status: 401,
      code: 'unauthenticated',
    });
  }
  return user;
}

function findProject(projectId) {
  return PROJECTS.find((project) => project.id === projectId);
}

function assignedModulesFor(user) {
  if (!user || user.role !== 'learner') return [];
  return MODULES.filter(
    (module) => module.category === 'common' || module.category === user.learningRole,
  ).sort((a, b) => a.order - b.order);
}

function assignedModuleCount(role) {
  return role === 'tester' ? 7 : 6;
}

/* -------------------------------------------------------------------------- */
/* Local persistence                                                          */
/* -------------------------------------------------------------------------- */

function loadEnrollments() {
  const stored = readJson(STORAGE_KEYS.enrollmentOverrides, null);
  return stored ?? clone(enrollmentsSeed.enrollments);
}

function saveEnrollments(enrollments) {
  writeJson(STORAGE_KEYS.enrollmentOverrides, enrollments);
  return enrollments;
}

function defaultProgress(userId, moduleId) {
  return {
    userId,
    moduleId,
    status: 'not_started',
    percent: 0,
    bookmarked: false,
  };
}

function loadProgressMap() {
  const stored = readJson(STORAGE_KEYS.moduleProgress, null);
  if (stored) return stored;
  const map = {};
  progressSeed.moduleProgress.forEach((entry) => {
    if (!map[entry.userId]) map[entry.userId] = [];
    map[entry.userId].push(clone(entry));
  });
  return map;
}

function saveProgressMap(map) {
  writeJson(STORAGE_KEYS.moduleProgress, map);
  return map;
}

function ensureUserProgress(user) {
  if (!user || user.role !== 'learner') return [];
  const map = loadProgressMap();
  const existing = map[user.id] ?? [];
  const byId = new Map(existing.map((entry) => [entry.moduleId, entry]));
  let changed = !map[user.id];

  const next = assignedModulesFor(user).map((module) => {
    if (byId.has(module.id)) return byId.get(module.id);
    changed = true;
    return defaultProgress(user.id, module.id);
  });

  map[user.id] = next;
  if (changed) saveProgressMap(map);
  return next;
}

function loadAttemptsMap() {
  const stored = readJson(STORAGE_KEYS.quizAttempts, null);
  if (stored) return stored;
  const map = {};
  progressSeed.quizAttempts.forEach((attempt) => {
    if (!map[attempt.userId]) map[attempt.userId] = [];
    map[attempt.userId].push(clone(attempt));
  });
  return map;
}

function saveAttemptsMap(map) {
  writeJson(STORAGE_KEYS.quizAttempts, map);
  return map;
}

function attemptsFor(user) {
  const map = loadAttemptsMap();
  return [...(map[user.id] ?? [])].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );
}

function loadDocuments() {
  const stored = readJson(STORAGE_KEYS.documents, null);
  return stored ?? clone(documentsSeed.documents);
}

function saveDocuments(documents) {
  writeJson(STORAGE_KEYS.documents, documents);
  return documents;
}

/* -------------------------------------------------------------------------- */
/* Derived selectors                                                          */
/* -------------------------------------------------------------------------- */

function quizzesFor(user) {
  const assignedIds = new Set(assignedModulesFor(user).map((module) => module.id));
  return QUIZZES.filter((quiz) => assignedIds.has(quiz.moduleId));
}

function decorateQuiz(quiz, attempts) {
  const quizAttempts = attempts
    .filter((attempt) => attempt.quizId === quiz.id)
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  const latest = quizAttempts[quizAttempts.length - 1] ?? null;
  const best = quizAttempts.reduce(
    (winner, attempt) => (!winner || attempt.score > winner.score ? attempt : winner),
    null,
  );
  return {
    ...quiz,
    attemptCount: quizAttempts.length,
    attemptsRemaining: Math.max(0, quiz.attemptsAllowed - quizAttempts.length),
    bestScore: best?.score ?? null,
    lastScore: latest?.score ?? null,
    passed: quizAttempts.some((attempt) => attempt.passed),
    lastAttemptAt: latest?.completedAt ?? null,
  };
}

function buildQuizStats(user, attempts) {
  const quizzes = quizzesFor(user);
  const decorated = quizzes.map((quiz) => decorateQuiz(quiz, attempts));
  const completed = decorated.filter((quiz) => quiz.attemptCount > 0);
  const passed = decorated.filter((quiz) => quiz.passed);
  return {
    decorated,
    stats: {
      available: decorated.length,
      completed: completed.length,
      passed: passed.length,
      averageScore: completed.length
        ? round(average(completed.map((quiz) => quiz.lastScore ?? 0)), 1)
        : 0,
      totalAttempts: attempts.length,
    },
  };
}

function readinessBand(score) {
  if (score >= 90) {
    return { band: 'ready', label: 'Ready' };
  }
  if (score >= 70) {
    return { band: 'on_track', label: 'On track' };
  }
  if (score >= 40) {
    return { band: 'building', label: 'Building' };
  }
  return { band: 'not_ready', label: 'Not ready' };
}

function computeReadiness(user, progressEntries, attempts, quizStats) {
  const total = progressEntries.length || 1;
  const averagePercent = average(progressEntries.map((entry) => entry.percent));
  const completedModules = progressEntries.filter((entry) => entry.status === 'completed').length;

  const securityProgress = progressEntries.find(
    (entry) => entry.moduleId === 'mod-security-guidelines',
  );
  const securityQuizPassed = attempts.some(
    (attempt) => attempt.quizId === 'quiz-security-guidelines' && attempt.passed,
  );
  const securityAchieved = Math.round(
    (securityProgress?.percent ?? 0) * 0.6 + (securityQuizPassed ? 40 : 0),
  );

  const engaged = progressEntries.filter((entry) => entry.percent > 0).length;
  const consistencyAchieved = Math.round((engaged / total) * 100);

  const factors = [
    {
      id: 'modules',
      label: 'Module completion',
      description: 'Average completion across every module assigned to your role.',
      weight: 40,
      achieved: Math.round(averagePercent),
      maximum: 100,
    },
    {
      id: 'quizzes',
      label: 'Assessment performance',
      description: 'Latest quiz score averaged across the assessments you have attempted.',
      weight: 30,
      achieved: Math.round(quizStats.stats.averageScore),
      maximum: 100,
    },
    {
      id: 'compliance',
      label: 'Mandatory compliance',
      description: 'Security & Guidelines module completion plus the enforced assessment.',
      weight: 15,
      achieved: securityAchieved,
      maximum: 100,
    },
    {
      id: 'momentum',
      label: 'Sustained engagement',
      description: 'Share of your assigned modules that have been opened and progressed.',
      weight: 15,
      achieved: consistencyAchieved,
      maximum: 100,
    },
  ];

  const score = Math.round(
    factors.reduce((sum, factor) => sum + factor.achieved * factor.weight, 0) / 100,
  );
  const band = readinessBand(score);

  const inProgress = progressEntries.find((entry) => entry.status === 'in_progress');
  const inProgressModule = inProgress
    ? MODULES.find((module) => module.id === inProgress.moduleId)
    : null;

  let recommendation;
  if (!progressEntries.length) {
    recommendation = 'Start with Client & Domain to establish the shared programme vocabulary.';
  } else if (securityProgress?.status !== 'completed' || !securityQuizPassed) {
    recommendation =
      'Complete Security & Guidelines and pass its assessment - compliance is mandatory on this project.';
  } else if (completedModules < total && inProgressModule) {
    recommendation = `Continue ${inProgressModule.title} to move your readiness forward.`;
  } else if (quizStats.stats.completed < quizStats.stats.available) {
    recommendation =
      'Attempt the quizzes attached to your completed modules to evidence your understanding.';
  } else if (completedModules === total) {
    recommendation =
      'All assigned modules and assessments are complete. Your induction evidence is ready for review.';
  } else {
    recommendation = 'Open the next module in your path to keep your momentum.';
  }

  return { score, band: band.band, bandLabel: band.label, factors, recommendation };
}

function buildSummary(user) {
  const progressEntries = ensureUserProgress(user);
  const attempts = attemptsFor(user);
  const quizStats = buildQuizStats(user, attempts);
  const completedModules = progressEntries.filter((entry) => entry.status === 'completed').length;
  const inProgressModules = progressEntries.filter(
    (entry) => entry.status === 'in_progress',
  ).length;
  const totalModules = progressEntries.length;
  const completionPercentage = percentOf(completedModules, totalModules);
  const readiness = computeReadiness(user, progressEntries, attempts, quizStats);
  const completedMinutes = progressEntries.reduce((sum, entry) => {
    const module = MODULES.find((item) => item.id === entry.moduleId);
    if (!module) return sum;
    return sum + Math.round((module.durationMinutes * entry.percent) / 100);
  }, 0);

  return {
    userId: user.id,
    completionPercentage,
    quizAverage: quizStats.stats.averageScore,
    completedModules,
    totalModules,
    inProgressModules,
    notStartedModules: Math.max(0, totalModules - completedModules - inProgressModules),
    readinessScore: readiness.score,
    readinessBand: readiness.band,
    readinessLabel: readiness.bandLabel,
    totalLearningMinutes: completedMinutes,
    quizAttempts: attempts.length,
    bookmarks: progressEntries.filter((entry) => entry.bookmarked).length,
    quizStats: quizStats.stats,
    readiness,
  };
}

function buildTimeline(user) {
  const progressEntries = ensureUserProgress(user);
  const attempts = attemptsFor(user);
  const events = [];

  const enrollment = loadEnrollments().find(
    (item) => item.email.toLowerCase() === user.email.toLowerCase(),
  );
  if (enrollment) {
    events.push({
      id: `tl-enrollment-${enrollment.id}`,
      type: 'enrollment',
      title: 'Induction assigned',
      description: `${enrollment.projectName} - ${enrollment.role === 'developer' ? 'Developer' : 'Tester'} learning path`,
      occurredAt: enrollment.enrolledAt,
    });
  }

  progressEntries.forEach((entry) => {
    const module = MODULES.find((item) => item.id === entry.moduleId);
    if (!module) return;
    if (entry.startedAt) {
      events.push({
        id: `tl-start-${entry.moduleId}`,
        type: 'module_started',
        title: `Started ${module.title}`,
        description: `${module.durationMinutes} minute module - ${module.category === 'common' ? 'Common foundation' : 'Role specialisation'}`,
        occurredAt: entry.startedAt,
        moduleId: module.id,
      });
    }
    if (entry.status === 'completed' && entry.completedAt) {
      events.push({
        id: `tl-complete-${entry.moduleId}`,
        type: 'module_completed',
        title: `Completed ${module.title}`,
        description: 'Module marked complete and added to your readiness evidence.',
        occurredAt: entry.completedAt,
        moduleId: module.id,
      });
    }
  });

  attempts.forEach((attempt) => {
    events.push({
      id: `tl-quiz-${attempt.id}`,
      type: attempt.passed ? 'quiz_passed' : 'quiz_attempt',
      title: `${attempt.passed ? 'Passed' : 'Attempted'} ${attempt.quizTitle}`,
      description: `${attempt.score}% - ${attempt.correctCount} of ${attempt.questionCount} correct`,
      occurredAt: attempt.completedAt,
      moduleId: attempt.moduleId,
      score: attempt.score,
    });
  });

  const completedCommon = progressEntries.filter((entry) => {
    const module = MODULES.find((item) => item.id === entry.moduleId);
    return module?.category === 'common' && entry.status === 'completed';
  }).length;
  if (completedCommon === 4) {
    events.push({
      id: 'tl-badge-common',
      type: 'badge',
      title: 'Common foundation complete',
      description: 'All four common foundation modules are complete.',
      occurredAt: new Date().toISOString(),
    });
  }

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function buildSession(user, provider) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  return {
    accessToken: `mock.${user.id}.${Date.now().toString(36)}`,
    refreshToken: `mock-refresh.${user.id}`,
    expiresAt,
    provider,
    user: clone(user),
  };
}

function sourceIsAllowed(source, allowedModuleIds) {
  if (source.type === 'module') return allowedModuleIds.has(source.moduleId);
  return true;
}

function scoreAssistantResponse(question, response) {
  const lower = question.toLowerCase();
  const tokens = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  let score = 0;
  response.keywords.forEach((keyword) => {
    const normalised = keyword.toLowerCase();
    if (normalised.includes(' ')) {
      if (lower.includes(normalised)) score += 6;
    } else if (tokens.includes(normalised)) {
      score += 3;
    } else if (tokenStemMatch(tokens, normalised)) {
      score += 1;
    }
  });
  return score;
}

function tokenStemMatch(tokens, keyword) {
  if (keyword.length < 5) return false;
  return tokens.some((token) => token.startsWith(keyword) || keyword.startsWith(token));
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export const mockProvider = {
  name: 'mock',

  auth: {
    async login({ email, password }) {
      return mockRequest(() => {
        const normalised = String(email ?? '').trim().toLowerCase();
        const credential = CREDENTIALS.find(
          (item) => item.email.toLowerCase() === normalised,
        );
        if (!credential || credential.password !== password) {
          throw new ApiError('Email or password is incorrect.', {
            status: 401,
            code: 'invalid_credentials',
          });
        }
        const user = USERS.find((item) => item.id === credential.userId);
        return buildSession(user, 'email');
      });
    },

    async loginWithMicrosoft() {
      return mockRequest(() => {
        const user = USERS.find((item) => item.id === 'u-mgr-001');
        return buildSession(user, 'microsoft');
      });
    },

    async getSession() {
      return mockRequest(() => sessionStore.get(), { latency: false });
    },

    async switchIdentity(email) {
      return mockRequest(() => {
        const user = USERS.find(
          (item) => item.email.toLowerCase() === String(email).toLowerCase(),
        );
        if (!user) {
          throw new ApiError('Demo identity not found.', { status: 404, code: 'not_found' });
        }
        return buildSession(user, 'email');
      });
    },
  },

  users: {
    async list() {
      return mockRequest(() => clone(USERS));
    },
    async getById(userId) {
      return mockRequest(() => {
        const user = USERS.find((item) => item.id === userId);
        if (!user) throw new ApiError('User not found.', { status: 404, code: 'not_found' });
        return clone(user);
      });
    },
    async getCurrent() {
      return mockRequest(() => clone(requireUser()));
    },
    async listProjects() {
      return mockRequest(() => clone(PROJECTS));
    },
  },

  enrollments: {
    async list(params = {}) {
      return mockRequest(() => {
        requireUser();
        const search = String(params.search ?? '').trim().toLowerCase();
        const status = params.status ?? 'all';
        const projectId = params.projectId ?? 'all';
        return loadEnrollments()
          .filter((item) => {
            if (status !== 'all' && item.status !== status) return false;
            if (projectId !== 'all' && item.projectId !== projectId) return false;
            if (!search) return true;
            return [
              item.employeeId,
              item.employeeName,
              item.email,
              item.projectName,
              item.department,
              item.role,
              item.title,
            ]
              .join(' ')
              .toLowerCase()
              .includes(search);
          })
          .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
      });
    },

    async getById(id) {
      return mockRequest(() => {
        requireUser();
        const enrollment = loadEnrollments().find((item) => item.id === id);
        if (!enrollment) {
          throw new ApiError('Enrollment not found.', { status: 404, code: 'not_found' });
        }
        return clone(enrollment);
      });
    },

    async create(input) {
      return mockRequest(() => {
        const current = requireUser();
        const enrollments = loadEnrollments();
        const email = String(input.email ?? '').trim().toLowerCase();
        const employeeId = String(input.employeeId ?? '').trim().toUpperCase();
        if (enrollments.some((item) => item.email.toLowerCase() === email)) {
          throw new ApiError('A learner with this email is already enrolled.', {
            status: 409,
            code: 'duplicate_email',
          });
        }
        if (enrollments.some((item) => item.employeeId.toUpperCase() === employeeId)) {
          throw new ApiError('This employee ID is already enrolled.', {
            status: 409,
            code: 'duplicate_employee',
          });
        }
        const project = findProject(input.projectId);
        if (!project) {
          throw new ApiError('Select a valid project.', { status: 422, code: 'invalid_project' });
        }
        const role = input.role === 'tester' ? 'tester' : 'developer';
        const enrolledAt = nowIso();
        const enrollment = {
          id: createId('enr'),
          employeeId,
          employeeName: String(input.employeeName ?? '').trim(),
          email,
          projectId: project.id,
          projectName: project.name,
          role,
          status: input.status ?? 'pending',
          department: input.department?.trim() || 'Unassigned',
          title: input.title?.trim() || 'Learner',
          assignedModules: assignedModuleCount(role),
          completedModules: 0,
          averageScore: 0,
          managerId: current.id,
          enrolledAt,
          startDate: input.startDate ? new Date(input.startDate).toISOString() : enrolledAt,
        };
        saveEnrollments([enrollment, ...enrollments]);
        return clone(enrollment);
      });
    },

    async update(id, input) {
      return mockRequest(() => {
        requireUser();
        const enrollments = loadEnrollments();
        const index = enrollments.findIndex((item) => item.id === id);
        if (index < 0) {
          throw new ApiError('Enrollment not found.', { status: 404, code: 'not_found' });
        }
        const existing = enrollments[index];
        const email = String(input.email ?? existing.email).trim().toLowerCase();
        const employeeId = String(input.employeeId ?? existing.employeeId).trim().toUpperCase();
        if (
          enrollments.some(
            (item) => item.id !== id && item.email.toLowerCase() === email,
          )
        ) {
          throw new ApiError('A learner with this email is already enrolled.', {
            status: 409,
            code: 'duplicate_email',
          });
        }
        if (
          enrollments.some(
            (item) => item.id !== id && item.employeeId.toUpperCase() === employeeId,
          )
        ) {
          throw new ApiError('This employee ID is already enrolled.', {
            status: 409,
            code: 'duplicate_employee',
          });
        }
        const project = findProject(input.projectId ?? existing.projectId) ?? findProject(existing.projectId);
        const role = input.role ?? existing.role;
        const next = {
          ...existing,
          ...input,
          email,
          employeeId,
          role,
          projectId: project?.id ?? existing.projectId,
          projectName: project?.name ?? existing.projectName,
          assignedModules:
            role !== existing.role ? assignedModuleCount(role) : existing.assignedModules,
          completedModules:
            role !== existing.role
              ? 0
              : Math.min(existing.completedModules, assignedModuleCount(role)),
          startDate: input.startDate
            ? new Date(input.startDate).toISOString()
            : existing.startDate,
        };
        enrollments[index] = next;
        saveEnrollments(enrollments);
        return clone(next);
      });
    },

    async remove(id) {
      return mockRequest(() => {
        requireUser();
        const enrollments = loadEnrollments();
        const next = enrollments.filter((item) => item.id !== id);
        if (next.length === enrollments.length) {
          throw new ApiError('Enrollment not found.', { status: 404, code: 'not_found' });
        }
        saveEnrollments(next);
        return { id };
      });
    },
  },

  content: {
    async list(params = {}) {
      return mockRequest(() => {
        requireUser();
        const search = String(params.search ?? '').trim().toLowerCase();
        const status = params.status ?? 'all';
        const projectId = params.projectId ?? 'all';
        return loadDocuments()
          .filter((document) => {
            if (status !== 'all' && document.status !== status) return false;
            if (projectId !== 'all' && document.projectId !== projectId) return false;
            if (!search) return true;
            return `${document.name} ${document.version} ${document.uploadedBy}`
              .toLowerCase()
              .includes(search);
          })
          .sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
          );
      });
    },

    async upload(input) {
      return mockRequest(() => {
        const current = requireUser();
        const documents = loadDocuments();
        const file = input.file;
        const project = findProject(input.projectId ?? current.projectId) ?? PROJECTS[0];
        const size = file?.size ?? input.size ?? 512000;
        const document = {
          id: createId('doc'),
          projectId: project.id,
          name: input.name?.trim() || file?.name?.replace(/\.[^.]+$/, '') || 'Untitled document',
          version: input.version?.trim() || 'v1.0',
          size,
          sizeLabel: formatFileSize(size),
          mimeType: file?.type || input.mimeType || 'application/pdf',
          uploadedAt: nowIso(),
          uploadedBy: current.name,
          status: 'processing',
          pageCount: 0,
          chunkCount: 0,
          moduleIds: input.moduleIds ?? [],
        };
        saveDocuments([document, ...documents]);

        window.setTimeout(() => {
          const latest = loadDocuments();
          const index = latest.findIndex((item) => item.id === document.id);
          if (index < 0 || latest[index].status !== 'processing') return;
          const pages = Math.max(1, Math.round(size / 90000));
          latest[index] = {
            ...latest[index],
            status: 'indexed',
            pageCount: pages,
            chunkCount: pages * 8,
          };
          saveDocuments(latest);
        }, 2800);

        return clone(document);
      });
    },

    async retry(id) {
      return mockRequest(() => {
        requireUser();
        const documents = loadDocuments();
        const index = documents.findIndex((item) => item.id === id);
        if (index < 0) {
          throw new ApiError('Document not found.', { status: 404, code: 'not_found' });
        }
        documents[index] = {
          ...documents[index],
          status: 'processing',
          errorMessage: undefined,
        };
        saveDocuments(documents);
        const document = documents[index];

        window.setTimeout(() => {
          const latest = loadDocuments();
          const latestIndex = latest.findIndex((item) => item.id === id);
          if (latestIndex < 0 || latest[latestIndex].status !== 'processing') return;
          const pages = latest[latestIndex].pageCount || Math.max(1, Math.round(latest[latestIndex].size / 90000));
          latest[latestIndex] = {
            ...latest[latestIndex],
            status: 'indexed',
            pageCount: pages,
            chunkCount: pages * 8,
            errorMessage: undefined,
          };
          saveDocuments(latest);
        }, 2200);

        return clone(document);
      });
    },

    async remove(id) {
      return mockRequest(() => {
        requireUser();
        const documents = loadDocuments();
        const next = documents.filter((item) => item.id !== id);
        if (next.length === documents.length) {
          throw new ApiError('Document not found.', { status: 404, code: 'not_found' });
        }
        saveDocuments(next);
        return { id };
      });
    },
  },

  modules: {
    async list(params = {}) {
      return mockRequest(() => {
        const user = requireUser();
        const progressEntries = ensureUserProgress(user);
        const progressByModule = new Map(
          progressEntries.map((entry) => [entry.moduleId, entry]),
        );
        const category = params.category ?? 'all';
        const status = params.status ?? 'all';
        const search = String(params.search ?? '').trim().toLowerCase();
        const bookmarkedOnly = Boolean(params.bookmarked);
        const all = assignedModulesFor(user).map((module) => ({
          ...clone(module),
          progress: progressByModule.get(module.id) ?? defaultProgress(user.id, module.id),
        }));

        const items = all.filter((module) => {
          if (category !== 'all' && module.category !== category) return false;
          if (status !== 'all' && module.progress.status !== status) return false;
          if (bookmarkedOnly && !module.progress.bookmarked) return false;
          if (!search) return true;
          return `${module.title} ${module.summary} ${module.description}`
            .toLowerCase()
            .includes(search);
        });

        const completed = all.filter((module) => module.progress.status === 'completed').length;
        const inProgress = all.filter(
          (module) => module.progress.status === 'in_progress',
        ).length;
        const percent = all.length
          ? Math.round(average(all.map((module) => module.progress.percent)))
          : 0;

        return {
          items,
          summary: {
            total: all.length,
            completed,
            inProgress,
            notStarted: all.length - completed - inProgress,
            percent,
            bookmarks: all.filter((module) => module.progress.bookmarked).length,
          },
        };
      });
    },

    async getById(moduleId) {
      return mockRequest(() => {
        const user = requireUser();
        const assigned = assignedModulesFor(user);
        const index = assigned.findIndex((module) => module.id === moduleId);
        if (index < 0) {
          throw new ApiError('This module is not part of your assigned learning path.', {
            status: 403,
            code: 'not_assigned',
          });
        }
        const module = clone(assigned[index]);
        const progressEntries = ensureUserProgress(user);
        const progress =
          progressEntries.find((entry) => entry.moduleId === moduleId) ??
          defaultProgress(user.id, moduleId);
        const quiz = QUIZZES.find((item) => item.id === module.quizId) ?? null;
        const documents = loadDocuments().filter((document) =>
          module.documentIds.includes(document.id),
        );
        return {
          module,
          progress,
          quiz,
          documents,
          previous: index > 0 ? clone(assigned[index - 1]) : null,
          next: index < assigned.length - 1 ? clone(assigned[index + 1]) : null,
        };
      });
    },

    async updateProgress(moduleId, patch) {
      return mockRequest(() => {
        const user = requireUser();
        const progressEntries = ensureUserProgress(user);
        const current =
          progressEntries.find((entry) => entry.moduleId === moduleId) ??
          defaultProgress(user.id, moduleId);
        const timestamp = nowIso();
        const percent = Math.max(
          0,
          Math.min(100, Math.round(patch.percent ?? current.percent)),
        );
        const status =
          percent >= 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started';
        const updated = {
          ...current,
          percent,
          status,
          lastActivityAt: timestamp,
          startedAt: status === 'not_started' ? current.startedAt : current.startedAt ?? timestamp,
          completedAt: status === 'completed' ? current.completedAt ?? timestamp : undefined,
        };
        const map = loadProgressMap();
        map[user.id] = progressEntries.map((entry) =>
          entry.moduleId === moduleId ? updated : entry,
        );
        saveProgressMap(map);
        return clone(updated);
      });
    },

    async toggleBookmark(moduleId) {
      return mockRequest(() => {
        const user = requireUser();
        const progressEntries = ensureUserProgress(user);
        const current =
          progressEntries.find((entry) => entry.moduleId === moduleId) ??
          defaultProgress(user.id, moduleId);
        const updated = { ...current, bookmarked: !current.bookmarked };
        const map = loadProgressMap();
        map[user.id] = progressEntries.map((entry) =>
          entry.moduleId === moduleId ? updated : entry,
        );
        saveProgressMap(map);
        return clone(updated);
      });
    },

    async listBookmarks() {
      return mockRequest(() => {
        const user = requireUser();
        const progressEntries = ensureUserProgress(user);
        const bookmarked = new Map(
          progressEntries
            .filter((entry) => entry.bookmarked)
            .map((entry) => [entry.moduleId, entry]),
        );
        return assignedModulesFor(user)
          .filter((module) => bookmarked.has(module.id))
          .map((module) => ({ ...clone(module), progress: bookmarked.get(module.id) }));
      });
    },
  },

  assistant: {
    async ask({ question }) {
      return mockRequest(() => {
        const user = requireUser();
        const allowedModuleIds = new Set(assignedModulesFor(user).map((module) => module.id));
        const cleanQuestion = String(question ?? '').trim();
        if (cleanQuestion.length < 2) {
          throw new ApiError('Ask a question with at least two characters.', {
            status: 422,
            code: 'question_too_short',
          });
        }

        const candidates = assistantSeed.responses
          .map((response) => {
            const allowed = response.sources.some(
              (source) => source.type !== 'module' || allowedModuleIds.has(source.moduleId),
            );
            return { response, allowed, score: scoreAssistantResponse(cleanQuestion, response) };
          })
          .filter((candidate) => candidate.allowed)
          .sort((a, b) => b.score - a.score);

        const winner = candidates[0];
        if (!winner || winner.score < 2) {
          return {
            messageId: createId('msg'),
            content: assistantSeed.noAnswer.answer,
            sources: [],
            suggestedQuestions: assistantSeed.noAnswer.suggestedQuestions,
            noAnswer: true,
            intent: 'no_answer',
          };
        }

        const sources = winner.response.sources.filter((source) =>
          sourceIsAllowed(source, allowedModuleIds),
        );

        return {
          messageId: createId('msg'),
          content: winner.response.answer,
          sources: clone(sources),
          suggestedQuestions: winner.response.suggestedQuestions,
          noAnswer: false,
          intent: winner.response.intent,
        };
      });
    },

    async suggestions() {
      return mockRequest(() => clone(assistantSeed.suggestedQuestions), { latency: false });
    },
  },

  quizzes: {
    async list() {
      return mockRequest(() => {
        const user = requireUser();
        const attempts = attemptsFor(user);
        const { decorated, stats } = buildQuizStats(user, attempts);
        return {
          quizzes: decorated.map((quiz) => ({
            ...clone(quiz),
            bestScore: quiz.bestScore,
            lastScore: quiz.lastScore,
            attemptCount: quiz.attemptCount,
            attemptsRemaining: quiz.attemptsRemaining,
            passed: quiz.passed,
            lastAttemptAt: quiz.lastAttemptAt,
          })),
          stats,
        };
      });
    },

    async get(quizId) {
      return mockRequest(() => {
        const user = requireUser();
        const quiz = quizzesFor(user).find((item) => item.id === quizId);
        if (!quiz) {
          throw new ApiError('Quiz not found in your learning path.', {
            status: 404,
            code: 'not_found',
          });
        }
        const attempts = attemptsFor(user)
          .filter((attempt) => attempt.quizId === quizId)
          .sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
          );
        const decorated = decorateQuiz(quiz, attemptsFor(user));
        return {
          quiz: clone(quiz),
          attempts: clone(attempts),
          bestScore: decorated.bestScore,
          passed: decorated.passed,
          attemptsRemaining: decorated.attemptsRemaining,
        };
      });
    },

    async getQuestions(quizId) {
      return mockRequest(() => {
        const user = requireUser();
        const quiz = quizzesFor(user).find((item) => item.id === quizId);
        if (!quiz) {
          throw new ApiError('Quiz not found in your learning path.', {
            status: 404,
            code: 'not_found',
          });
        }
        return QUESTIONS.filter((question) => question.quizId === quizId).map((question) => ({
          id: question.id,
          quizId: question.quizId,
          prompt: question.prompt,
          topic: question.topic,
          difficulty: question.difficulty,
          options: clone(question.options),
        }));
      });
    },

    async submit(quizId, input) {
      return mockRequest(() => {
        const user = requireUser();
        const quiz = quizzesFor(user).find((item) => item.id === quizId);
        if (!quiz) {
          throw new ApiError('Quiz not found in your learning path.', {
            status: 404,
            code: 'not_found',
          });
        }
        const attemptMap = loadAttemptsMap();
        const existingAttempts = attemptMap[user.id] ?? [];
        const quizAttempts = existingAttempts.filter((attempt) => attempt.quizId === quizId);
        if (quizAttempts.length >= quiz.attemptsAllowed) {
          throw new ApiError('You have used all attempts for this quiz.', {
            status: 409,
            code: 'attempts_exhausted',
          });
        }

        const questions = QUESTIONS.filter((question) => question.quizId === quizId);
        const submitted = new Map(
          (input.answers ?? []).map((answer) => [answer.questionId, answer.selectedOptionId]),
        );
        const answers = questions.map((question) => {
          const selectedOptionId = submitted.get(question.id) ?? null;
          return {
            questionId: question.id,
            selectedOptionId,
            isCorrect: selectedOptionId === question.correctOptionId,
          };
        });
        const correctCount = answers.filter((answer) => answer.isCorrect).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const completedAt = nowIso();
        const durationSeconds = Math.max(0, Math.round(input.durationSeconds ?? 0));
        const attempt = {
          id: createId('att'),
          quizId,
          quizTitle: quiz.title,
          moduleId: quiz.moduleId,
          userId: user.id,
          answers,
          correctCount,
          questionCount: questions.length,
          score,
          passed: score >= quiz.passingScore,
          durationSeconds,
          startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
          completedAt,
        };

        attemptMap[user.id] = [...existingAttempts, attempt];
        saveAttemptsMap(attemptMap);

        const progressEntries = ensureUserProgress(user);
        const map = loadProgressMap();
        map[user.id] = progressEntries.map((entry) => {
          if (entry.moduleId !== quiz.moduleId) return entry;
          return {
            ...entry,
            score: Math.max(entry.score ?? 0, score),
            lastActivityAt: completedAt,
            startedAt: entry.startedAt ?? attempt.startedAt,
          };
        });
        saveProgressMap(map);

        return clone(attempt);
      });
    },

    async getAttempt(quizId, attemptId) {
      return mockRequest(() => {
        const user = requireUser();
        const attempt = attemptsFor(user).find(
          (item) => item.id === attemptId && item.quizId === quizId,
        );
        if (!attempt) {
          throw new ApiError('Attempt not found.', { status: 404, code: 'not_found' });
        }
        const quiz = QUIZZES.find((item) => item.id === quizId);
        if (!quiz) {
          throw new ApiError('Quiz not found.', { status: 404, code: 'not_found' });
        }
        const questions = QUESTIONS.filter((question) => question.quizId === quizId).map(
          (question) => {
            const answer = attempt.answers.find((item) => item.questionId === question.id);
            return {
              ...clone(question),
              selectedOptionId: answer?.selectedOptionId ?? null,
              isCorrect: Boolean(answer?.isCorrect),
            };
          },
        );
        return { attempt: clone(attempt), quiz: clone(quiz), questions };
      });
    },
  },

  progress: {
    async getSummary() {
      return mockRequest(() => {
        const user = requireUser();
        return buildSummary(user);
      });
    },

    async getTimeline() {
      return mockRequest(() => {
        const user = requireUser();
        return buildTimeline(user);
      });
    },

    async getModuleProgress() {
      return mockRequest(() => {
        const user = requireUser();
        const progressEntries = ensureUserProgress(user);
        return assignedModulesFor(user).map((module) => {
          const progress =
            progressEntries.find((entry) => entry.moduleId === module.id) ??
            defaultProgress(user.id, module.id);
          return {
            moduleId: module.id,
            title: module.title,
            category: module.category,
            icon: module.icon,
            level: module.level,
            status: progress.status,
            percent: progress.percent,
            score: progress.score,
            bookmarked: progress.bookmarked,
            durationMinutes: module.durationMinutes,
            lastActivityAt: progress.lastActivityAt,
            quizId: module.quizId,
          };
        });
      });
    },
  },

  reports: {
    async getAnalytics() {
      return mockRequest(() => {
        requireUser();
        return {
          ...clone(reportsSeed),
          activity: clone(activitySeed.events),
          generatedAt: nowIso(),
          totalDocumentsIndexed: loadDocuments().filter(
            (document) => document.status === 'indexed',
          ).length,
        };
      });
    },
  },

  notifications: {
    async list() {
      return mockRequest(() => {
        const user = requireUser();
        const readState = readJson(STORAGE_KEYS.notifications, {});
        const readIds = new Set(readState[user.id] ?? []);
        return clone(notificationsSeed.notifications)
          .filter((item) => !item.audience || item.audience === user.role)
          .map((item) => ({ ...item, read: readIds.has(item.id) }))
          .sort(
            (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
          );
      });
    },

    async markRead(id) {
      return mockRequest(() => {
        const user = requireUser();
        const readState = readJson(STORAGE_KEYS.notifications, {});
        const current = new Set(readState[user.id] ?? []);
        current.add(id);
        readState[user.id] = Array.from(current);
        writeJson(STORAGE_KEYS.notifications, readState);
        return this.list();
      });
    },

    async markAllRead() {
      return mockRequest(() => {
        const user = requireUser();
        const readState = readJson(STORAGE_KEYS.notifications, {});
        readState[user.id] = notificationsSeed.notifications
          .filter((item) => !item.audience || item.audience === user.role)
          .map((item) => item.id);
        writeJson(STORAGE_KEYS.notifications, readState);
        return this.list();
      });
    },
  },
};

/** Exported for UI convenience without coupling to a service. */
export const getInitialsForUser = (user) => getInitials(user?.name);
