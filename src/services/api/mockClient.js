import { MOCK_FAILURE_RATE, MOCK_LATENCY } from '@/constants/app';
import { delay, randomInt } from '@/utils/random';
import { ApiError } from './errors';

/**
 * Every mock adapter call passes through here so that latency, failure
 * injection and error normalisation are consistent across the whole product.
 */
export async function mockRequest(handler, options = {}) {
  const { latency = true, failureRate = MOCK_FAILURE_RATE } = options;

  if (latency) {
    await delay(randomInt(MOCK_LATENCY.min, MOCK_LATENCY.max));
  }

  if (failureRate > 0 && Math.random() < failureRate) {
    throw new ApiError('The demo service is temporarily unavailable. Please retry.', {
      status: 503,
      code: 'mock_unavailable',
    });
  }

  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error?.message ?? 'The mock service could not complete the request.', {
      code: 'mock_error',
      details: error,
    });
  }
}
