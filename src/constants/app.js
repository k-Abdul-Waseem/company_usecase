/** Application metadata exposed to the browser bundle. */
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME ?? 'AI Assisted Project Induction Platform',
  shortName: import.meta.env.VITE_APP_SHORT_NAME ?? 'Induction Platform',
  organization: 'HCLTech',
  copyright: `Copyright © ${new Date().getFullYear()} HCLTech | Confidential`,
};

/** Simulated latency bounds for the mock providers, in milliseconds. */
export const MOCK_LATENCY = {
  min: Number(import.meta.env.VITE_MOCK_LATENCY_MIN ?? 250),
  max: Number(import.meta.env.VITE_MOCK_LATENCY_MAX ?? 700),
};

/** Probability (0-1) that a mock request fails, used to exercise error states. */
export const MOCK_FAILURE_RATE = Number(import.meta.env.VITE_MOCK_FAILURE_RATE ?? 0);

/** Maximum length accepted by the assistant composer. */
export const MAX_MESSAGE_LENGTH = 1200;

/** Backend transport selected at build time. */
export const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';

/** REST base URL used by the remote adapter. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/** Request timeout in milliseconds for the remote adapter. */
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 30000);
