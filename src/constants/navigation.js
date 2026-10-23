import {
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

/**
 * A navigation entry rendered by the sidebar.
 * @typedef {Object} NavigationItem
 * @property {string} id
 * @property {string} label
 * @property {string} path
 * @property {import('lucide-react').LucideIcon} icon
 * @property {Array<'manager'|'learner'>} roles
 * @property {string} description
 */

/** The primary application navigation, filtered by role at render time. */
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['manager', 'learner'],
    description: 'Programme overview and personal learning status',
  },
  {
    id: 'enrollment',
    label: 'Enrollment',
    path: '/enrollment',
    icon: Users,
    roles: ['manager'],
    description: 'Enroll, edit and remove learners from a project',
  },
  {
    id: 'content-library',
    label: 'Content Library',
    path: '/content-library',
    icon: FileText,
    roles: ['manager'],
    description: 'Upload and manage approved onboarding content',
  },
  {
    id: 'learning-modules',
    label: 'Learning Modules',
    path: '/learning-modules',
    icon: BookOpen,
    roles: ['learner'],
    description: 'Role-aware modules, reading view and bookmarks',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    path: '/ai-assistant',
    icon: Bot,
    roles: ['learner'],
    description: 'Ask questions grounded in approved project content',
  },
  {
    id: 'quiz-center',
    label: 'Quiz Center',
    path: '/quiz-center',
    icon: GraduationCap,
    roles: ['learner'],
    description: 'Attempt module quizzes and review explanations',
  },
  {
    id: 'progress-tracker',
    label: 'Progress Tracker',
    path: '/progress-tracker',
    icon: ShieldCheck,
    roles: ['learner'],
    description: 'Completion, quiz average and readiness score',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['manager'],
    description: 'Completion rate, department progress and quiz trends',
  },
];

/** Secondary navigation rendered at the bottom of the sidebar. */
export const SECONDARY_NAVIGATION_ITEMS = [
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['manager', 'learner'],
    description: 'Workspace preferences',
  },
];

/** Branding used in the sidebar and the login hero. */
export const BRAND = {
  name: 'AI Assisted Project Induction Platform',
  shortName: 'Induction Platform',
  tagline: 'A Secure, Role-Aware Learning Experience for Faster Project Onboarding',
  organization: 'HCLTech',
};

/** Points surfaced on the authentication hero panel. */
export const LOGIN_HERO_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    text: 'SSO-backed access with project-scoped, role-scoped content.',
  },
  {
    icon: Users,
    title: 'Role-aware paths',
    text: 'Common foundations plus a developer or tester specialisation.',
  },
  {
    icon: Bot,
    title: 'Grounded assistance',
    text: 'Every answer cites the approved source it was drawn from.',
  },
];
