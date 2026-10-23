/** Number of rows shown on a single page of a data table. */
export const DEFAULT_PAGE_SIZE = 8;

/** Options exposed by the rows-per-page selector. */
export const PAGE_SIZE_OPTIONS = [8, 16, 32];

/** Number of days in the reporting window used by the manager trends. */
export const REPORT_TREND_WINDOW_DAYS = 12;

/** Report range options exposed on the analytics page. */
export const REPORT_RANGES = [
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last quarter' },
  { id: 'all', label: 'Programme to date' },
];
