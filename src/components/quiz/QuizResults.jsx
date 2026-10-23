import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { cn } from '@/utils/cn';
import { formatClock } from '@/utils/date';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Detailed answer review shown on the results screen. */
export function QuizReview({ questions = [], attempt, className }) {
  const answerByQuestion = new Map(
    (attempt?.answers ?? []).map((answer) => [answer.questionId, answer]),
  );

  return (
    <div className={cn('space-y-4', className)}>
      {questions.map((question, index) => {
        const answer = answerByQuestion.get(question.id);
        return (
          <Card key={question.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold leading-6 text-ink">
                <span className="mr-1.5 text-ink-subtle">{index + 1}.</span>
                {question.prompt}
              </p>
              <Badge tone={answer?.isCorrect ? 'success' : 'danger'} size="sm" dot>
                {answer?.isCorrect ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>

            <div className="mt-4 space-y-2">
              {question.options.map((option, optionIndex) => {
                const isCorrect = option.id === question.correctOptionId;
                const isSelected = option.id === answer?.selectedOptionId;
                return (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm',
                      isCorrect
                        ? 'border-success-200 bg-success-50/60 dark:border-success-500/30 dark:bg-success-500/10'
                        : isSelected
                          ? 'border-danger-200 bg-danger-50/60 dark:border-danger-500/30 dark:bg-danger-500/10'
                          : 'border-line bg-card',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-2xs font-semibold',
                        isCorrect
                          ? 'bg-success-600 text-white'
                          : isSelected
                            ? 'bg-danger-600 text-white'
                            : 'bg-elevated text-ink-muted',
                      )}
                      aria-hidden="true"
                    >
                      {LETTERS[optionIndex] ?? optionIndex + 1}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 leading-6',
                        isCorrect
                          ? 'font-medium text-ink'
                          : isSelected
                            ? 'text-ink'
                            : 'text-ink-muted',
                      )}
                    >
                      {option.text}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-label="Correct answer" />
                    ) : isSelected ? (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" aria-label="Your answer" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {question.explanation ? (
              <div className="mt-3.5 rounded-lg bg-elevated/60 p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Explanation
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">{question.explanation}</p>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

/** Score summary block shared by the results page. */
export function QuizScoreSummary({ attempt, quiz, className }) {
  if (!attempt) return null;
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:p-7">
        <ProgressRing
          value={attempt.score}
          size={144}
          strokeWidth={12}
          tone={attempt.passed ? 'success' : 'danger'}
          valueLabel={`${attempt.score}%`}
          label={attempt.passed ? 'Passed' : 'Not passed'}
          ariaLabel={`Score ${attempt.score} percent, ${attempt.passed ? 'passed' : 'not passed'}`}
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <Badge tone={attempt.passed ? 'success' : 'danger'} dot>
            {attempt.passed ? 'Assessment passed' : 'Assessment not passed'}
          </Badge>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">{quiz?.title ?? attempt.quizTitle}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            You answered {attempt.correctCount} of {attempt.questionCount} questions correctly.
            {attempt.passed
              ? ' This result is included in your readiness evidence.'
              : ` The pass mark is ${quiz?.passingScore ?? 70}%. Review the explanations below before retrying.`}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
            <div>
              <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Score</dt>
              <dd className="text-sm font-semibold tabular-nums text-ink">{attempt.score}%</dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Correct</dt>
              <dd className="text-sm font-semibold tabular-nums text-ink">
                {attempt.correctCount}/{attempt.questionCount}
              </dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wide text-ink-subtle">Time taken</dt>
              <dd className="text-sm font-semibold tabular-nums text-ink">
                {formatClock(attempt.durationSeconds ?? 0)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}
