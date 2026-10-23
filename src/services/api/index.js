import { API_MODE } from '@/constants/app';
import { mockProvider } from './mockProvider';
import { restProvider } from './restProvider';

/**
 * The active backend adapter. Only this module knows which transport is in use.
 * Change VITE_API_MODE to `remote` to run against the REST contract with no
 * changes to services, pages or components.
 */
export const apiProvider = API_MODE === 'remote' ? restProvider : mockProvider;

/** True when the in-browser demo provider is active. */
export const isMockMode = apiProvider.name === 'mock';

export { sessionStore } from './session';
export { ApiError, normalizeError } from './errors';
export { httpClient } from './httpClient';
