/** Human readable labels for platform roles. */
export const ROLE_LABELS = {
  manager: 'Manager',
  learner: 'Learner',
};

/** Human readable labels for learning roles. */
export const LEARNING_ROLE_LABELS = {
  developer: 'Developer',
  tester: 'Tester',
};

/** Short descriptions surfaced in the UI to explain the role split. */
export const ROLE_DESCRIPTIONS = {
  manager: 'Enroll learners, manage approved content and read programme analytics.',
  learner: 'Follow your role-aware learning path and track your readiness.',
};

/** Learning roles selectable by a manager during enrolment. */
export const LEARNING_ROLES = ['developer', 'tester'];

/** Platform roles recognised by the route guards. */
export const PLATFORM_ROLES = ['manager', 'learner'];

/** Demo accounts surfaced on the login screen for evaluators. */
export const DEMO_ACCOUNTS = [
  {
    id: 'manager',
    label: 'Manager',
    email: 'manager@hcltech.com',
    password: 'Manager@123',
    description: 'Enrollment, content library and analytics',
    initials: 'PM',
  },
  {
    id: 'developer',
    label: 'Developer',
    email: 'learner@hcltech.com',
    password: 'Learner@123',
    description: 'Developer learning path',
    initials: 'LI',
  },
  {
    id: 'tester',
    label: 'Tester',
    email: 'tester@hcltech.com',
    password: 'Tester@123',
    description: 'Tester learning path',
    initials: 'AR',
  },
];
