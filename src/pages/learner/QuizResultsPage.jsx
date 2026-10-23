import { Link, useParams } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { QuizReview, QuizScoreSummary } from '@/components/quiz/QuizResults';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/constants/routes';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { quizService } from '@/services/quiz/quizService';
import { formatDateTime } from '@/utils/date';

const LINK_BASE =
  'inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2';

/** Post-assessment review: score summary, per-question explanations and next actions. */
export function QuizResultsPage() {
  const { quizId, attemptId } = useParams();

  const { data, status, error, reload } = useAsync(
    () => quizService.getAttempt(quizId, attemptId),
    [quizId, attemptId],
  );

  const attempt = data?.attempt;
  const quiz = data?.quiz;
  const questions = data?.questions ?? [];

  useDocumentTitle(quiz ? `Results: ${quiz.title}` : 'Assessment results');

  if (status === 'loading') {
    return <LoadingState label="Loading your result" description="Preparing the review." />;
  }

  if (error) {
    return (
      <ErrorState
        title="We could not load this result"
        error={error}
        onRetry={reload}
      />
    );
  }

  if (!attempt) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        breadcrumbs={[
          { label: 'Quiz Center', to: ROUTES.quizCenter },
          { label: quiz?.title ?? 'Assessment' },
        ]}
        eyebrow="Assessment result"
        title={quiz?.title ?? 'Assessment result'}
        description="Your answers are reviewed below with the correct option and an explanation for every question."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={attempt.passed ? 'success' : 'danger'} dot>
              {attempt.passed ? 'Passed' : 'Not passed'}
            </Badge>
            <Link to={ROUTES.quizCenter} className={`${LINK_BASE} border border-line-strong bg-card text-ink hover:bg-elevated`}>
              Back to quiz center
            </Link>
            <Link to={ROUTES.quizAttempt(quizId)} className={`${LINK_BASE} bg-brand-600 text-white shadow-sm hover:bg-brand-700`}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry assessment
            </Link>
          </div>
        }
      />

      <QuizScoreSummary attempt={attempt} quiz={quiz} />

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Answer review</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {questions.length} questions · submitted{' '}
            <time dateTime={attempt.completedAt}>{formatDateTime(attempt.completedAt)}</time>
          </p>
        </div>
        <Link
          to={ROUTES.learningModules}
          className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
        >
          Back to learning path
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Card>

      <QuizReview questions={questions} attempt={attempt} />
    </div>
  );
}
