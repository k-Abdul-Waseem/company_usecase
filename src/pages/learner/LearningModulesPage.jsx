import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Bot,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SearchInput, Select } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { MODULE_CATEGORY_TABS } from '@/constants/modules';
import { LEARNING_ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentTitle } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { moduleService } from '@/services/modules/moduleService';
import { formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';

/** Learner catalogue with category tabs, status filters, search and bookmarks. */
export function LearningModulesPage() {
  useDocumentTitle('Learning Modules');
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [bookmarkBusy, setBookmarkBusy] = useState(null);
  const debouncedSearch = useDebounce(search, 220);

  const { data, status, error, reload, setData } = useAsync(() => moduleService.list({}), []);

  const items = useMemo(() => data?.items ?? [], [data]);
  const summary = data?.summary ?? { total: 0, completed: 0, inProgress: 0, notStarted: 0, percent: 0, bookmarks: 0 };

  const counts = useMemo(() => {
    const map = { all: items.length, common: 0, developer: 0, tester: 0 };
    items.forEach((module) => {
      map[module.category] = (map[module.category] ?? 0) + 1;
    });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return items.filter((module) => {
      if (category !== 'all' && module.category !== category) return false;
      if (statusFilter !== 'all' && module.progress?.status !== statusFilter) return false;
      if (bookmarkedOnly && !module.progress?.bookmarked) return false;
      if (!needle) return true;
      return `${module.title} ${module.summary} ${module.description}`.toLowerCase().includes(needle);
    });
  }, [bookmarkedOnly, category, debouncedSearch, items, statusFilter]);

  const filtersActive = category !== 'all' || statusFilter !== 'all' || bookmarkedOnly || search;

  const toggleBookmark = async (module) => {
    setBookmarkBusy(module.id);
    try {
      const progress = await moduleService.toggleBookmark(module.id);
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === module.id ? { ...item, progress } : item,
        ),
        summary: {
          ...current.summary,
          bookmarks: current.items.reduce((count, item) => {
            const nextBookmarked =
              item.id === module.id ? progress.bookmarked : item.progress?.bookmarked;
            return count + (nextBookmarked ? 1 : 0);
          }, 0),
        },
      }));
      toast.success(
        progress.bookmarked ? 'Module bookmarked' : 'Bookmark removed',
        module.title,
      );
    } catch (caught) {
      toast.error('Could not update bookmark', caught?.message ?? 'Please try again.');
    } finally {
      setBookmarkBusy(null);
    }
  };

  const resetFilters = () => {
    setCategory('all');
    setStatusFilter('all');
    setBookmarkedOnly(false);
    setSearch('');
  };

  const tabs = MODULE_CATEGORY_TABS.map((tab) => ({ ...tab, count: counts[tab.id] ?? 0 }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={`${LEARNING_ROLE_LABELS[user?.learningRole] ?? 'Learner'} path`}
        title="Learning Modules"
        description="Work through your role-aware induction path. Progress is saved as you read, and completed modules unlock their knowledge checks."
        actions={
          <Link to={ROUTES.aiAssistant} className={buttonStyles({ variant: 'outline', size: 'sm' })}>
            <Bot className="h-4 w-4" aria-hidden="true" />
            Ask the assistant
          </Link>
        }
      />

      <div className="grid-dashboard">
        <StatCard
          label="Path completion"
          value={formatPercent(summary.percent)}
          icon={BookOpen}
          tone="brand"
          footer={
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                style={{ width: `${summary.percent}%` }}
              />
            </div>
          }
          hint={`${summary.completed} of ${summary.total} modules complete`}
        />
        <StatCard label="Completed" value={summary.completed} icon={CheckCircle2} tone="success" hint="Readiness evidence recorded" />
        <StatCard label="In progress" value={summary.inProgress} icon={PlayCircle} tone="warning" hint="Pick up where you left off" />
        <StatCard label="Bookmarked" value={summary.bookmarks} icon={BookmarkCheck} tone="accent" hint="Saved for quick reference" />
      </div>

      <Card className="p-4">
        <Tabs tabs={tabs} value={category} onChange={setCategory} ariaLabel="Module categories" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_auto_auto]">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search modules by title or topic…"
            label="Search modules"
          />
          <Select
            aria-label="Filter by completion status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'not_started', label: 'Not started' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <Button
            variant={bookmarkedOnly ? 'secondary' : 'outline'}
            size="md"
            onClick={() => setBookmarkedOnly((current) => !current)}
            aria-pressed={bookmarkedOnly}
            iconLeft={
              bookmarkedOnly ? (
                <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )
            }
          >
            Bookmarked
          </Button>
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
        <LoadingState label="Loading your learning path" description="Fetching modules and progress." />
      ) : error ? (
        <ErrorState title="Could not load learning modules" error={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No modules match these filters"
            description="Try another category or clear the search and status filters."
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
              <span className="font-semibold text-ink">{items.length}</span> assigned modules
            </p>
            <Badge tone="neutral" size="sm" className={cn(bookmarkedOnly && 'hidden')}>
              {summary.notStarted} not started
            </Badge>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onBookmark={toggleBookmark}
                bookmarkBusy={bookmarkBusy === module.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
