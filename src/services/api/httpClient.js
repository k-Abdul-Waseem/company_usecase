import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/constants/app';
import { normalizeError } from './errors';
import { sessionStore } from './session';

/**
 * The only axios instance in the application. Pages never import this module;
 * they call a domain service, which delegates to the active adapter.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const session = sessionStore.get();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  config.headers['X-Client'] = 'induction-platform-web';
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

/** Unwraps the conventional `{ data, meta }` REST envelope. */
export function unwrap(response) {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
}
