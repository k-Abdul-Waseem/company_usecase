/**
 * Normalised error type surfaced by every service adapter.
 * UI components only ever depend on this shape, never on axios or fetch errors.
 */
export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 500;
    this.code = options.code ?? 'api_error';
    this.details = options.details ?? null;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

/** Converts an unknown thrown value into an ApiError. */
export function normalizeError(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError) return error;
  if (error?.response) {
    const payload = error.response.data;
    return new ApiError(payload?.message ?? error.message ?? fallbackMessage, {
      status: error.response.status,
      code: payload?.code ?? 'http_error',
      details: payload?.details ?? null,
    });
  }
  if (error instanceof Error) {
    return new ApiError(error.message || fallbackMessage, { code: 'network_error' });
  }
  return new ApiError(fallbackMessage, { code: 'unknown_error' });
}
