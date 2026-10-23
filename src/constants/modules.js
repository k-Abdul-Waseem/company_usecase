import {
  Bug,
  Building2,
  Database,
  FlaskConical,
  GitBranch,
  KeyRound,
  LayoutGrid,
  ShieldCheck,
  Target,
} from 'lucide-react';

/** Tabs available on the learning modules page. */
export const MODULE_CATEGORY_TABS = [
  { id: 'all', label: 'All modules', description: 'Every module assigned to your learning path' },
  { id: 'common', label: 'Common', description: 'Foundation modules shared by every learner' },
  {
    id: 'developer',
    label: 'Developer',
    description: 'Modules specific to the developer learning path',
  },
  { id: 'tester', label: 'Tester', description: 'Modules specific to the tester learning path' },
];

/** Display labels for the module categories. */
export const MODULE_CATEGORY_LABELS = {
  common: 'Common',
  developer: 'Developer',
  tester: 'Tester',
};

/** Display labels for the module levels. */
export const MODULE_LEVEL_LABELS = {
  1: 'Foundation',
  2: 'Intermediate',
  3: 'Advanced',
};

/** Icon registry keyed by the icon name delivered by the content service. */
export const MODULE_ICONS = {
  'building-2': Building2,
  'key-round': KeyRound,
  'layout-grid': LayoutGrid,
  'shield-check': ShieldCheck,
  'git-branch': GitBranch,
  'flask-conical': FlaskConical,
  target: Target,
  database: Database,
  bug: Bug,
};

/** Fallback icon used when a module references an unknown icon. */
export const DEFAULT_MODULE_ICON = LayoutGrid;

/** Resource type labels used in the module reader. */
export const RESOURCE_TYPE_LABELS = {
  pdf: 'PDF',
  doc: 'Document',
  link: 'Link',
  video: 'Video',
  repository: 'Repository',
};
