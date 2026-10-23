import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { QuestionNavigator } from '@/components/quiz/QuestionNavigator';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ROUTES } from '@/constants/routes';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { quizService } from '@/services/quiz/quizService';

const LINK_BASE =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-card px-3.5 text-sm font-semibold text-ink transition hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';

/** Sits the learner through a single assessment attempt and records the result. */
export function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittedRef = useRef(false);

  const quizState = useAsync(() => quizService.get(quizId), [quizId]);
  const questionsState = useAsync(() => quizService.getQuestions(quizId), [quizId]);

  const quiz = quizState.data?.quiz;
  const attemptsRemaining = quizState.data?.attemptsRemaining;
  const questions = useMemo(() => questionsState.data ?? [], [questionsState.data]);

  useDocumentTitle(quiz ? `Assessment: ${quiz.title}` : 'Assessment');

  const currentQuestion = questions[currentIndex] ?? null;
  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, questions],
  );
  const unansweredCount = questions.length - answeredCount;

  const handleSelect = useCallback((optionId) => {
    setAnswers((current) => {
      const questionId = questions[currentIndex]?.id;
      if (!questionId) return current;
      return { ...current, [questionId]: optionId };
    });
  }, [currentIndex, questions]);

  const handleToggleFlag = useCallback((questionId) => {
    setFlagged((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  }, []);

  const submitAttempt = useCallback(
    async (auto = false) => {
      if (submitting || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);

      const totalSeconds = (quiz?.durationMinutes ?? 0) * 60;
      const durationSeconds = Math.max(0, totalSeconds - (remainingSeconds ?? totalSeconds));

      try {
        const attempt = await quizService.submit(quizId, {
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedOptionId: answers[question.id] ?? null,
          })),
          durationSeconds,
        });
        toast.success(
          auto ? 'Time expired - attempt submitted' : 'Assessment submitted',
          `You scored ${attempt.score}%.`,
        );
        navigate(ROUTES.quizResults(quizId, attempt.id), { replace: true });
      } catch (error) {
        submittedRef.current = false;
        setSubmitting(false);
        toast.error(
          'We could not submit your attempt',
          error?.message ?? 'Please try again.',
        );
      }
    },
    [answers, navigate, questions, quiz, quizId, remainingSeconds, submitting, toast],
  );

  const handleExpire = useCallback(() => {
    submitAttempt(true);
  }, [submitAttempt]);

  const handleSubmitClick = useCallback(() => {
    if (unansweredCount > 0) {
      setConfirmOpen(true);
      return;
    }
    submitAttempt(false);
  }, [submitAttempt, unansweredCount]);

  if (quizState.status === 'loading' || questionsState.status === 'loading') {
    return <LoadingState label="Opening assessment" description="Preparing your questions." />;
  }

  if (quizState.error) {
    return (
      <ErrorState
        title="We could not open this assessment"
        error={quizState.error}
        onRetry={quizState.reload}
      />
    );
  }

  if (questionsState.error) {
    return (
      <ErrorState
        title="We could not load the questions"
        error={questionsState.error}
        onRetry={questionsState.reload}
      />
    );
  }

  if (!quiz) return null;

  if (attemptsRemaining === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          breadcrumbs={[
            { label: 'Quiz Center', to: ROUTES.quizCenter },
            { label: quiz.title },
          ]}
          eyebrow="Assessment"
          title={quiz.title}
          description={quiz.description}
        />
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-300">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-ink">No attempts remaining</h2>
          <p className="max-w-md text-sm leading-6 text-ink-muted">
            You have used all {quiz.attemptsAllowed} attempts for this assessment. Speak to your
            project manager if you need another attempt.
          </p>
          <Link to={ROUTES.quizCenter} className={LINK_BASE}>
            Back to quiz center
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        breadcrumbs={[
          { label: 'Quiz Center', to: ROUTES.quizCenter },
          { label: quiz.title },
        ]}
        eyebrow="Assessment in progress"
        title={quiz.title}
        description={quiz.description}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="neutral" size="sm">
              Pass mark {quiz.passingScore}%
            </Badge>
            <QuizTimer
              durationMinutes={quiz.durationMinutes}
              onExpire={handleExpire}
              onTimeChange={setRemainingSeconds}
            />
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <QuizQuestion
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            selectedOptionId={currentQuestion ? answers[currentQuestion.id] : undefined}
            onSelect={handleSelect}
            flagged={currentQuestion ? flagged.includes(currentQuestion.id) : false}
            onToggleFlag={handleToggleFlag}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitClick}
                iconLeft={<Send className="h-4 w-4" aria-hidden="true" />}
              >
                Submit assessment
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink">Your progress</h2>
              <span className="text-xs font-semibold tabular-nums text-ink-muted">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            <div className="mt-3">
              <ProgressBar
                value={answeredCount}
                max={questions.length}
                tone="brand"
                showValue
                valueLabel={`${answeredCount}/${questions.length}`}
                ariaLabel="Questions answered"
              />
            </div>

            <QuestionNavigator
              className="mt-4"
              questions={questions}
              answers={answers}
              flagged={flagged}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />

            {flagged.length > 0 ? (
              <p className="mt-3 text-2xs text-ink-subtle">
                {flagged.length} question{flagged.length === 1 ? '' : 's'} flagged for review.
              </p>
            ) : null}

            <Button
              type="button"
              className="mt-5 w-full"
              size="sm"
              onClick={handleSubmitClick}
              isLoading={submitting}
              iconLeft={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Submit assessment
            </Button>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Assessment rules</h2>
            <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-ink-muted">
              <li>You need {quiz.passingScore}% to pass this assessment.</li>
              <li>
                {attemptsRemaining} of {quiz.attemptsAllowed} attempts remaining.
              </li>
              <li>The timer keeps running once the assessment starts.</li>
              <li>Flag any question to come back to it later.</li>
            </ul>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit with unanswered questions?"
        description={`${unansweredCount} of ${questions.length} questions have no answer. Unanswered questions are marked incorrect.`}
        confirmLabel="Submit anyway"
        cancelLabel="Keep working"
        variant="primary"
        onConfirm={() => {
          setConfirmOpen(false);
          submitAttempt(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
