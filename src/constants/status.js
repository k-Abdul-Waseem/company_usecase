/** Visual tone applied to a status badge. */
export const STATUS_TONES = {
  // Document statuses
  uploaded: 'info',
  processing: 'warning',
  indexed: 'success',
  failed: 'danger',
  // Enrollment statuses
  active: 'success',
  pending: 'warning',
  completed: 'brand',
  // Module statuses
  not_started: 'neutral',
  in_progress: 'warning',
  // Quiz / result states
  passed: 'success',
  not_passed: 'danger',
};

/** Label overrides where the raw status is not presentation friendly. */
export const STATUS_LABELS = {
  not_started: 'Not started',
  in_progress: 'In progress',
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  uploaded: 'Uploaded',
  processing: 'Processing',
  indexed: 'Indexed',
  failed: 'Failed',
  passed: 'Passed',
  not_passed: 'Not passed',
};

/** Minimum score (%) required to pass a module quiz. */
export const PASS_MARK_PERCENT = 70;

/** Readiness bands keyed by the composite readiness score. */
export const READINESS_BANDS = [
  { max: 40, band: 'not_ready', label: 'Not ready' },
  { max: 70, band: 'building', label: 'Building' },
  { max: 90, band: 'on_track', label: 'On track' },
  { max: 101, band: 'ready', label: 'Ready' },
];

/** Tone used by the readiness badge for each band. */
export const READINESS_TONES = {
  not_ready: 'danger',
  building: 'warning',
  on_track: 'info',
  ready: 'success',
};
