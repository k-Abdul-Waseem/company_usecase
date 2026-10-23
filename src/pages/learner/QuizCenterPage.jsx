import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  RotateCcw,
  Target,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { QuizCard } from '@/components/quiz/QuizCard';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SearchInput, Select } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { ROUTES } from '@/constants/routes';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentTitle } from '@/hooks/useUi';
import { formatPercent } from '@/utils/format';
import { quizService } from '@/services/quiz/quizService';

/** Quiz catalogue with filters, attempts summary and readiness-linked assessments. */
export function QuizCenterPage() {
  useDocumentTitle('Quiz Center');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 220);

  const { data, status, error, reload } = useAsync(() => quizService.list({}), []);

  const quizzes = useMemo(() => data?.quizzes ?? [], [data]);
  const stats = data?.stats ?? {
    total: 0,
    completed: 0,
    passed: 0,
    averageBestScore: 0,
    attemptsUsed: 0,
  };

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All', count: quizzes.length },
      {
        id: 'module',
        label: 'Module checks',
        count: quizzes.filter((quiz) => quiz.type === 'module').length,
      },
      {
        id: 'project',
        label: 'Project assessments',
        count: quizzes.filter((quiz) => quiz.type === 'project').length,
      },
      {
        id: 'compliance',
        label: 'Compliance',
        count: quizzes.filter((quiz) => quiz.type === 'compliance').length,
      },
    ],
    [quizzes],
  );

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      if (category !== 'all' && quiz.type !== category) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'passed' && !quiz.passed) return false;
        if (statusFilter === 'failed' && !(quiz.attemptCount > 0 && quiz.passed === false)) return false;
        if (statusFilter === 'not_attempted' && quiz.attemptCount > 0) return false;
        if (statusFilter === 'attempts_left' && quiz.attemptsRemaining <= 0) return false;
      }
      if (!needle) return true;
      return `${quiz.title} ${quiz.description} ${quiz.moduleTitle ?? ''}`.toLowerCase().includes(needle);
    });
  }, [category, debouncedSearch, quizzes, statusFilter]);

  const filtersActive = category !== 'all' || statusFilter !== 'all' || search;

  const resetFilters = () => {
    setCategory('all');
    setStatusFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Assessments"
        title="Quiz Center"
        description="Take module knowledge checks and project assessments. Track attempts, best scores and pass status."
        actions={
          <Link to={ROUTES.progressTracker} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-elevated">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            View progress tracker
          </Link>
        }
      />

      <div className="grid-dashboard">
        <StatCard label="Available quizzes" value={stats.total} icon={FileQuestion} tone="brand" hint="Assigned to your path" />
        <StatCard label="Passed" value={stats.passed} icon={CheckCircle2} tone="success" hint="Meeting pass criteria" />
        <StatCard label="Completed" value={stats.completed} icon={GraduationCap} tone="accent" hint="At least one attempt" />
        <StatCard
          label="Average best score"
          value={formatPercent(stats.averageBestScore ?? 0)}
          icon={TrendingUp}
          tone="info"
          hint="Across passed/completed"
        />
      </div>

      <Card className="p-4">
        <Tabs tabs={tabs} value={category} onChange={setCategory} ariaLabel="Quiz categories" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_auto]">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search quizzes by title or module…"
            label="Search quizzes"
          />
          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'not_attempted', label: 'Not attempted' },
              { value: 'passed', label: 'Passed' },
              { value: 'failed', label: 'Failed (attempted)' },
              { value: 'attempts_left', label: 'Attempts remaining' },
            ]}
          />
          <Button
            variant="ghost"
            size="md"
            onClick={resetFilters}
            disabled={!filtersActive}
            iconLeft={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
          >
            Reset
          </Button>
        </div>
      </Card>

      {status === 'loading' ? (
        <LoadingState label="Loading assessments" description="Fetching quizzes and attempt history." />
      ) : error ? (
        <ErrorState title="Could not load quizzes" error={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileQuestion}
            title="No quizzes match these filters"
            description="Try adjusting filters or check back after completing related modules."
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of{' '}
              <span className="font-semibold text-ink">{quizzes.length}</span> quizzes
            </p>
            <Badge tone="neutral" size="sm" icon={<Target className="h-3 w-3" />}>
              Pass mark varies by assessment
            </Badge>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
