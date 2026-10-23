import { apiProvider } from '@/services/api';

/** Quiz catalogue, attempt submission and result review facade. */
export const quizService = {
  list: () => apiProvider.quizzes.list(),
  get: (quizId) => apiProvider.quizzes.get(quizId),
  getQuestions: (quizId) => apiProvider.quizzes.getQuestions(quizId),
  submit: (quizId, input) => apiProvider.quizzes.submit(quizId, input),
  getAttempt: (quizId, attemptId) => apiProvider.quizzes.getAttempt(quizId, attemptId),

  async getStats() {
    const { stats } = await apiProvider.quizzes.list();
    return stats;
  },
};
