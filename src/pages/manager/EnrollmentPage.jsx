import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Callout } from '@/components/common/Callout';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, SearchInput, Select } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { LEARNING_ROLE_LABELS, LEARNING_ROLES } from '@/constants/roles';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { enrollmentService } from '@/services/users/enrollmentService';
import { userService } from '@/services/users/userService';
import { formatDate, toDateInputValue } from '@/utils/date';
import { getInitials } from '@/utils/format';
import { validators } from '@/utils/validation';

const PAGE_SIZE = 8;

const BLANK_ENROLLMENT = {
  employeeName: '',
  employeeId: '',
  email: '',
  projectId: '',
  role: 'developer',
  department: '',
  title: '',
  startDate: toDateInputValue(new Date().toISOString()),
  status: 'pending',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

/** Manager workflow for enrolling, editing and removing project learners. */
export function EnrollmentPage() {
  useDocumentTitle('Enrollment');
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [projectId, setProjectId] = useState('all');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const { data, status: loadStatus, error, reload } = useAsync(async () => {
    const [enrollments, projects] = await Promise.all([
      enrollmentService.list(),
      userService.listProjects(),
    ]);
    return { enrollments, projects };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: BLANK_ENROLLMENT });

  const enrollments = useMemo(() => data?.enrollments ?? [], [data]);
  const projects = useMemo(() => data?.projects ?? [], [data]);

  const stats = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter((item) => item.status === 'active').length;
    const pending = enrollments.filter((item) => item.status === 'pending').length;
    const completed = enrollments.filter((item) => item.status === 'completed').length;
    return { total, active, pending, completed };
  }, [enrollments]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return enrollments.filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (projectId !== 'all' && item.projectId !== projectId) return false;
      if (role !== 'all' && item.role !== role) return false;
      if (!needle) return true;
      return [
        item.employeeName,
        item.employeeId,
        item.email,
        item.projectName,
        item.department,
        item.title,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [enrollments, projectId, query, role, status]);

  // Changing the filters changes the result set, so pagination starts over.
  const filterKey = `${query}|${status}|${projectId}|${role}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filtersActive = query || status !== 'all' || projectId !== 'all' || role !== 'all';
  const takenEmails = enrollments
    .filter((item) => item.id !== editing?.id)
    .map((item) => item.email);
  const takenEmployeeIds = enrollments
    .filter((item) => item.id !== editing?.id)
    .map((item) => item.employeeId);

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setProjectId('all');
    setRole('all');
  };

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    reset(BLANK_ENROLLMENT);
    setFormOpen(true);
  };

  const openEdit = (enrollment) => {
    setEditing(enrollment);
    setFormError(null);
    reset({
      employeeName: enrollment.employeeName,
      employeeId: enrollment.employeeId,
      email: enrollment.email,
      projectId: enrollment.projectId,
      role: enrollment.role,
      department: enrollment.department ?? '',
      title: enrollment.title ?? '',
      startDate: toDateInputValue(enrollment.startDate),
      status: enrollment.status,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      if (editing) {
        await enrollmentService.update(editing.id, values);
        toast.success('Enrollment updated', `${values.employeeName} · ${values.email}`);
      } else {
        await enrollmentService.create(values);
        toast.success('Learner enrolled', `${values.employeeName} has been added to the programme.`);
      }
      setFormOpen(false);
      setEditing(null);
      reload();
    } catch (caught) {
      setFormError(caught?.message ?? 'The enrollment could not be saved.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setMutationBusy(true);
    try {
      await enrollmentService.remove(deleteTarget.id);
      toast.success('Enrollment removed', `${deleteTarget.employeeName} was removed from the programme.`);
      setDeleteTarget(null);
      reload();
    } catch (caught) {
      toast.error('Could not remove enrollment', caught?.message ?? 'Please try again.');
    } finally {
      setMutationBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Programme administration"
        title="Enrollment"
        description="Add learners to the programme, assign a learning path and keep activation status current."
        actions={
          <Button size="sm" onClick={openCreate} iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Enroll learner
          </Button>
        }
      />

      <div className="grid-dashboard">
        <StatCard label="Total learners" value={stats.total} icon={Users} tone="brand" hint="Enrolled across all projects" />
        <StatCard label="Active" value={stats.active} icon={UserCheck} tone="success" hint="Learning path in progress" />
        <StatCard label="Pending activation" value={stats.pending} icon={UserPlus} tone="warning" hint="Awaiting learner sign-in" />
        <StatCard label="Completed" value={stats.completed} icon={UserX} tone="accent" hint="Induction fully completed" />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto]">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search name, email, employee ID, department…"
            label="Search enrollments"
          />
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            aria-label="Filter by project"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            options={[
              { value: 'all', label: 'All projects' },
              ...projects.map((project) => ({ value: project.id, label: project.name })),
            ]}
          />
          <Select
            aria-label="Filter by learning role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            options={[
              { value: 'all', label: 'All roles' },
              ...LEARNING_ROLES.map((item) => ({ value: item, label: LEARNING_ROLE_LABELS[item] })),
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

      {loadStatus === 'loading' ? (
        <LoadingState label="Loading enrollments" description="Fetching the programme roster." />
      ) : error ? (
        <ErrorState title="Could not load enrollments" error={error} onRetry={reload} />
      ) : (
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No learners match these filters"
              description="Adjust the filters or enroll a new learner to get started."
              action={
                filtersActive ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={openCreate}>
                    Enroll the first learner
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table containerClassName="rounded-none border-0" caption="Enrolled learners">
                  <THead>
                    <TR>
                      <TH>Learner</TH>
                      <TH>Project</TH>
                      <TH>Learning role</TH>
                      <TH>Module progress</TH>
                      <TH>Avg. score</TH>
                      <TH>Start date</TH>
                      <TH>Status</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {pageItems.map((enrollment) => {
                      const progress = enrollment.assignedModules
                        ? Math.round((enrollment.completedModules / enrollment.assignedModules) * 100)
                        : 0;
                      return (
                        <TR key={enrollment.id}>
                          <TD>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={enrollment.employeeName} initials={getInitials(enrollment.employeeName)} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">{enrollment.employeeName}</p>
                                <p className="truncate text-2xs text-ink-subtle">
                                  {enrollment.employeeId} · {enrollment.email}
                                </p>
                              </div>
                            </div>
                          </TD>
                          <TD>
                            <p className="font-medium text-ink">{enrollment.projectName}</p>
                            <p className="text-2xs text-ink-subtle">{enrollment.department}</p>
                          </TD>
                          <TD>
                            <Badge tone={enrollment.role === 'developer' ? 'accent' : 'info'} size="sm">
                              {LEARNING_ROLE_LABELS[enrollment.role] ?? enrollment.role}
                            </Badge>
                            <p className="mt-1 text-2xs text-ink-subtle">{enrollment.title}</p>
                          </TD>
                          <TD className="min-w-[9rem]">
                            <ProgressBar
                              value={progress}
                              showValue
                              size="xs"
                              tone={progress >= 80 ? 'success' : 'brand'}
                              ariaLabel={`${enrollment.employeeName} module progress`}
                            />
                            <p className="mt-1 text-2xs text-ink-subtle">
                              {enrollment.completedModules} of {enrollment.assignedModules} modules
                            </p>
                          </TD>
                          <TD className="whitespace-nowrap tabular-nums text-ink-muted">
                            {enrollment.averageScore ? `${enrollment.averageScore}%` : '—'}
                          </TD>
                          <TD className="whitespace-nowrap text-ink-muted">
                            {formatDate(enrollment.startDate)}
                          </TD>
                          <TD>
                            <Badge tone={STATUS_TONES[enrollment.status] ?? 'neutral'} size="sm" dot>
                              {STATUS_LABELS[enrollment.status] ?? enrollment.status}
                            </Badge>
                          </TD>
                          <TD>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(enrollment)}
                                aria-label={`Edit ${enrollment.employeeName}`}
                                title="Edit enrollment"
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteTarget(enrollment)}
                                aria-label={`Remove ${enrollment.employeeName}`}
                                title="Remove enrollment"
                                className="hover:text-danger-600 dark:hover:text-danger-300"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>
              <div className="border-t border-line p-4">
                <Pagination
                  page={page}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                  itemLabel="learners"
                />
              </div>
            </>
          )}
        </Card>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit enrollment' : 'Enroll a learner'}
        description={
          editing
            ? 'Update the learner profile or learning path. Role changes reset module progress.'
            : 'Add a learner to a project and assign the developer or tester learning path.'
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="enrollment-form" size="sm" isLoading={isSubmitting}>
              {editing ? 'Save changes' : 'Enroll learner'}
            </Button>
          </>
        }
      >
        <form id="enrollment-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pb-3">
          {formError ? (
            <Callout variant="danger" title="Could not save this enrollment">
              {formError}
            </Callout>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="e.g. Ananya Rao"
              error={errors.employeeName?.message}
              required
              autoComplete="name"
              {...register('employeeName', {
                validate: validators.required('Full name is required'),
              })}
            />
            <Input
              label="Employee ID"
              placeholder="e.g. EMP20481"
              hint="4–10 letters, numbers or dashes."
              error={errors.employeeId?.message}
              required
              {...register('employeeId', {
                validate: (value) => {
                  const basic = validators.employeeId()(value);
                  if (basic !== true) return basic;
                  const duplicate = takenEmployeeIds.some(
                    (id) => id.toUpperCase() === String(value).trim().toUpperCase(),
                  );
                  return duplicate ? 'This employee ID is already enrolled' : true;
                },
              })}
            />
          </div>

          <Input
            label="Work email"
            type="email"
            placeholder="name@hcltech.com"
            error={errors.email?.message}
            required
            autoComplete="email"
            {...register('email', {
              validate: (value) => {
                const basic = validators.corporateEmail()(value);
                if (basic !== true) return basic;
                return validators.uniqueEmail(takenEmails)(value);
              },
            })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Project"
              error={errors.projectId?.message}
              required
              placeholder="Select a project"
              options={projects.map((project) => ({
                value: project.id,
                label: `${project.name} · ${project.code}`,
              }))}
              {...register('projectId', { validate: validators.required('Select a project') })}
            />
            <Select
              label="Learning role"
              error={errors.role?.message}
              required
              options={LEARNING_ROLES.map((item) => ({
                value: item,
                label: LEARNING_ROLE_LABELS[item],
              }))}
              hint="Determines the specialisation modules and assessments."
              {...register('role', { validate: validators.required('Select a learning role') })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Department"
              placeholder="e.g. Retail Banking"
              error={errors.department?.message}
              {...register('department')}
            />
            <Input
              label="Job title"
              placeholder="e.g. Software Engineer"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              error={errors.startDate?.message}
              required
              {...register('startDate', { validate: validators.required('Start date is required') })}
            />
            <Select
              label="Activation status"
              error={errors.status?.message}
              options={STATUS_OPTIONS.filter((option) => option.value !== 'all')}
              hint={editing ? undefined : 'New enrollments start as pending until first sign-in.'}
              {...register('status')}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this enrollment?"
        description={
          deleteTarget
            ? `${deleteTarget.employeeName} will lose access to ${deleteTarget.projectName} and their induction evidence will be removed from the programme.`
            : undefined
        }
        confirmLabel="Remove learner"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        isLoading={mutationBusy}
      >
        <p className="rounded-lg bg-elevated/60 p-3 text-xs">
          <span className="font-semibold text-ink">{deleteTarget?.employeeName}</span>
          <span className="block text-ink-subtle">
            {deleteTarget?.employeeId} · {deleteTarget?.email}
          </span>
        </p>
      </ConfirmDialog>
    </div>
  );
}
