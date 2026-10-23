import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CornerDownLeft,
  FileText,
  FolderKanban,
  GraduationCap,
  Search,
  UserRound,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { NAVIGATION_ITEMS, SECONDARY_NAVIGATION_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { moduleService } from '@/services/modules/moduleService';
import { quizService } from '@/services/quiz/quizService';
import { enrollmentService } from '@/services/users/enrollmentService';
import { contentService } from '@/services/content/contentService';
import { userService } from '@/services/users/userService';
import { cn } from '@/utils/cn';

const GROUP_ORDER = ['Pages', 'Modules', 'Assessments', 'Learners', 'Documents', 'Projects'];

function ResultIcon({ kind }) {
  const icons = {
    page: BookOpen,
    module: BookOpen,
    quiz: GraduationCap,
    learner: UserRound,
    document: FileText,
    project: FolderKanban,
  };
  const Icon = icons[kind] ?? BookOpen;
  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

/** Command-palette style search over navigation and role-scoped workspace data. */
export function GlobalSearch({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef(null);
  const debounced = useDebounce(query, 120);

  const pages = useMemo(
    () =>
      [...NAVIGATION_ITEMS, ...SECONDARY_NAVIGATION_ITEMS]
        .filter((item) => item.roles.includes(user?.role))
        .map((item) => ({
          id: `page-${item.id}`,
          title: item.label,
          subtitle: item.description,
          path: item.path,
          group: 'Pages',
          kind: 'page',
        })),
    [user?.role],
  );

  // Reset the palette when it closes so that the next search starts clean.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      setRecords([]);
      setLoaded(false);
    }
  }

  const loading = open && !loaded;

  useEffect(() => {
    if (!open) return undefined;
    if (loaded) return undefined;
    let active = true;

    const load = async () => {
      try {
        if (user?.role === 'learner') {
          const [modules, quizzes] = await Promise.all([
            moduleService.list({}),
            quizService.list(),
          ]);
          const moduleRecords = modules.items.map((module) => ({
            id: `module-${module.id}`,
            title: module.title,
            subtitle: `${module.category} · ${module.durationMinutes} min`,
            path: ROUTES.learningModuleDetail(module.id),
            group: 'Modules',
            kind: 'module',
          }));
          const quizRecords = quizzes.quizzes.map((quiz) => ({
            id: `quiz-${quiz.id}`,
            title: quiz.title,
            subtitle: quiz.moduleTitle,
            path: ROUTES.quizAttempt(quiz.id),
            group: 'Assessments',
            kind: 'quiz',
          }));
          if (active) setRecords([...moduleRecords, ...quizRecords]);
        } else {
          const [enrollments, documents, projects] = await Promise.all([
            enrollmentService.list({}),
            contentService.list({}),
            userService.listProjects(),
          ]);
          const enrollmentRecords = enrollments.map((enrollment) => ({
            id: `enrollment-${enrollment.id}`,
            title: enrollment.employeeName,
            subtitle: `${enrollment.employeeId} · ${enrollment.projectName} · ${enrollment.role}`,
            path: ROUTES.enrollment,
            group: 'Learners',
            kind: 'learner',
          }));
          const documentRecords = documents.map((document) => ({
            id: `document-${document.id}`,
            title: document.name,
            subtitle: `${document.version} · ${document.sizeLabel} · ${document.status}`,
            path: ROUTES.contentLibrary,
            group: 'Documents',
            kind: 'document',
          }));
          const projectRecords = projects.map((project) => ({
            id: `project-${project.id}`,
            title: project.name,
            subtitle: `${project.client} · ${project.learnerCount} learners`,
            path: ROUTES.reports,
            group: 'Projects',
            kind: 'project',
          }));
          if (active) setRecords([...enrollmentRecords, ...documentRecords, ...projectRecords]);
        }
      } catch {
        if (active) setRecords([]);
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [open, loaded, user?.role]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const results = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    const pool = [...pages, ...records];
    if (!term) return pool;
    return pool.filter((record) =>
      `${record.title} ${record.subtitle}`.toLowerCase().includes(term),
    );
  }, [pages, records, debounced]);

  const indexedResults = useMemo(() => results.slice(0, 18), [results]);

  const groups = useMemo(() => {
    const map = new Map();
    indexedResults.forEach((record, index) => {
      if (!map.has(record.group)) map.set(record.group, []);
      map.get(record.group).push({ ...record, flatIndex: index });
    });
    return [...map.entries()].sort(
      ([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
    );
  }, [indexedResults]);

  const goTo = (record) => {
    if (!record) return;
    onClose();
    navigate(record.path);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (indexedResults.length ? (current + 1) % indexedResults.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        indexedResults.length ? (current - 1 + indexedResults.length) % indexedResults.length : 0,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      goTo(indexedResults[activeIndex]);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search workspace"
      description="Jump to a page, module, assessment, learner or approved document."
      size="lg"
      bodyClassName="px-0 pb-0 sm:px-0"
    >
      <div className="border-y border-line">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            data-autofocus
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="global-search-results"
            aria-activedescendant={
              indexedResults[activeIndex] ? `search-result-${indexedResults[activeIndex].id}` : undefined
            }
            className="h-12 w-full bg-transparent pl-12 pr-4 text-sm text-ink outline-none placeholder:text-ink-subtle"
          />
        </div>
      </div>

      <div
        id="global-search-results"
        role="listbox"
        className="max-h-[55vh] min-h-[12rem] overflow-y-auto scrollbar-thin py-2"
      >
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-elevated" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-elevated" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        ) : indexedResults.length ? (
          groups.map(([group, items]) => (
            <div key={group} className="mb-2">
              <p className="px-5 pb-1 pt-2 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                {group}
              </p>
              {items.map((record) => {
                const active = record.flatIndex === activeIndex;
                return (
                  <button
                    key={record.id}
                    id={`search-result-${record.id}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(record.flatIndex)}
                    onClick={() => goTo(record)}
                    className={cn(
                      'flex w-full items-center gap-3 px-5 py-2.5 text-left transition',
                      active ? 'bg-brand-50 dark:bg-brand-600/15' : 'hover:bg-elevated/60',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        active
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-600/25 dark:text-brand-200'
                          : 'bg-elevated text-ink-muted',
                      )}
                    >
                      <ResultIcon kind={record.kind} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{record.title}</span>
                      <span className="block truncate text-2xs text-ink-subtle">{record.subtitle}</span>
                    </span>
                    {active ? (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-ink">No results for “{query}”</p>
            <p className="mt-1 text-xs text-ink-muted">
              Try a module title, an employee name, a document name or a page.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-2.5 text-2xs text-ink-subtle">
        <span>↑↓ to navigate · Enter to open · Esc to close</span>
        <span>{indexedResults.length} results</span>
      </div>
    </Modal>
  );
}
