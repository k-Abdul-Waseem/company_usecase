import { apiProvider } from '@/services/api';

/**
 * Grounded assistant facade. The page only depends on this contract, so a RAG
 * backend (or any other provider) can be introduced by replacing the adapter.
 */
export const assistantService = {
  ask: (question) => apiProvider.assistant.ask({ question }),
  suggestions: () => apiProvider.assistant.suggestions(),
};
