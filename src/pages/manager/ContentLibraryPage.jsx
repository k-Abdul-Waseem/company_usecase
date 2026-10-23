import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Layers,
  RefreshCw,
  RotateCw,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Callout } from '@/components/common/Callout';
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
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { STATUS_LABELS, STATUS_TONES } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { useToast } from '@/hooks/useToast';
import { contentService } from '@/services/content/contentService';
import { userService } from '@/services/users/userService';
import { formatDateTime, formatRelativeTime } from '@/utils/date';
import { formatFileSize, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';
import { validators } from '@/utils/validation';

const PAGE_SIZE = 8;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'md', 'png', 'jpg', 'jpeg'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'indexed', label: 'Indexed' },
  { value: 'processing', label: 'Processing' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'failed', label: 'Failed' },
];

function DocumentTypeIcon({ mimeType, className }) {
  const Icon = mimeType?.includes('spreadsheet')
    ? FileSpreadsheet
    : mimeType?.includes('image')
      ? FileImage
      : FileText;
  return <Icon className={className} aria-hidden="true" />;
}

function extensionOf(fileName) {
  return String(fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
}

/** Manager content library for uploading and indexing approved source material. */
export function ContentLibraryPage() {
  useDocumentTitle('Content Library');
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [details, setDetails] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [retryId, setRetryId] = useState(null);

  const { data, status, error, reload } = useAsync(async () => {
    const [documents, projects] = await Promise.all([
      contentService.list(),
      userService.listProjects(),
    ]);
    return { documents, projects };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', version: 'v1.0', projectId: '' },
  });

  const documents = useMemo(() => data?.documents ?? [], [data]);
  const projects = useMemo(() => data?.projects ?? [], [data]);
  const projectName = (id) => projects.find((project) => project.id === id)?.name ?? id;

  const stats = useMemo(() => {
    const indexed = documents.filter((doc) => doc.status === 'indexed');
    return {
      total: documents.length,
      indexed: indexed.length,
      processing: documents.filter((doc) => doc.status === 'processing' || doc.status === 'uploaded').length,
      chunks: documents.reduce((sum, doc) => sum + (doc.chunkCount ?? 0), 0),
    };
  }, [documents]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((doc) => {
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (projectFilter !== 'all' && doc.projectId !== projectFilter) return false;
      if (!needle) return true;
      const project = projects.find((item) => item.id === doc.projectId);
      const projectLabel = project?.name ?? doc.projectId;
      return `${doc.name} ${doc.version} ${doc.uploadedBy} ${projectLabel}`
        .toLowerCase()
        .includes(needle);
    });
  }, [documents, projectFilter, projects, query, statusFilter]);

  // Changing the filters changes the result set, so pagination starts over.
  const filterKey = `${query}|${statusFilter}|${projectFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filtersActive = query || statusFilter !== 'all' || projectFilter !== 'all';

  const closeUpload = () => {
    if (isSubmitting) return;
    setUploadOpen(false);
    setSelectedFile(null);
    setDragging(false);
    setUploadError(null);
    reset({ name: '', version: 'v1.0', projectId: '' });
  };

  const chooseFile = (file) => {
    if (!file) return;
    setUploadError(null);
    const ext = extensionOf(file.name);
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setUploadError(`Unsupported file type ".${ext}". Upload a PDF, Office, text, markdown or image file.`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError('This file is larger than the 10 MB upload limit.');
      return;
    }
    setSelectedFile(file);
    if (!getValues('name')) {
      setValue('name', file.name.replace(/\.[^.]+$/, ''), { shouldValidate: false });
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const onSubmit = async (values) => {
    setUploadError(null);
    if (!selectedFile) {
      setUploadError('Select a file to upload.');
      return;
    }
    try {
      await contentService.upload({
        file: selectedFile,
        name: values.name,
        version: values.version,
        projectId: values.projectId,
      });
      toast.success(
        'Upload accepted',
        `${values.name} is processing. Indexing usually completes within a few seconds.`,
      );
      closeUpload();
      reload();
      window.setTimeout(() => reload(), 3400);
    } catch (caught) {
      setUploadError(caught?.message ?? 'The document could not be uploaded.');
    }
  };

  const handleRetry = async (doc) => {
    setRetryId(doc.id);
    try {
      await contentService.retry(doc.id);
      toast.success('Indexing restarted', `${doc.name} is being processed again.`);
      reload();
      window.setTimeout(() => reload(), 3000);
    } catch (caught) {
      toast.error('Could not retry indexing', caught?.message ?? 'Please try again.');
    } finally {
      setRetryId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await contentService.remove(deleteTarget.id);
      toast.success('Document removed', `${deleteTarget.name} is no longer available to the assistant.`);
      setDeleteTarget(null);
      reload();
    } catch (caught) {
      toast.error('Could not remove document', caught?.message ?? 'Please try again.');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Knowledge governance"
        title="Content Library"
        description="Upload the approved source material that powers learning modules and grounded assistant answers. Indexed documents are immediately discoverable."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              iconLeft={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
            >
              Refresh
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)} iconLeft={<UploadCloud className="h-4 w-4" aria-hidden="true" />}>
              Upload document
            </Button>
          </>
        }
      />

      <div className="grid-dashboard">
        <StatCard label="Documents" value={formatNumber(stats.total)} icon={FileText} tone="brand" hint="Across every project" />
        <StatCard label="Indexed" value={formatNumber(stats.indexed)} icon={FolderOpen} tone="success" hint="Available to the assistant" />
        <StatCard label="In pipeline" value={formatNumber(stats.processing)} icon={RefreshCw} tone="warning" hint="Uploaded or processing" />
        <StatCard label="Indexed chunks" value={formatNumber(stats.chunks)} icon={Layers} tone="accent" hint="Retrievable evidence units" />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search documents, versions or uploaders…"
            label="Search documents"
          />
          <Select
            aria-label="Filter by document status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            aria-label="Filter by project"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            options={[
              { value: 'all', label: 'All projects' },
              ...projects.map((project) => ({ value: project.id, label: project.name })),
            ]}
          />
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
              setProjectFilter('all');
            }}
            disabled={!filtersActive}
          >
            Reset
          </Button>
        </div>
      </Card>

      {status === 'loading' ? (
        <LoadingState label="Loading the content library" description="Fetching approved documents and indexing state." />
      ) : error ? (
        <ErrorState title="Could not load the content library" error={error} onRetry={reload} />
      ) : (
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No documents match these filters"
              description="Clear the filters or upload approved project content to build the knowledge base."
              action={
                filtersActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('');
                      setStatusFilter('all');
                      setProjectFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setUploadOpen(true)}>
                    Upload a document
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table containerClassName="rounded-none border-0" caption="Approved content documents">
                  <THead>
                    <TR>
                      <TH>Document</TH>
                      <TH>Project</TH>
                      <TH>Version</TH>
                      <TH>Size</TH>
                      <TH>Uploaded</TH>
                      <TH>Chunks</TH>
                      <TH>Status</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {pageItems.map((doc) => (
                      <TR key={doc.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-muted">
                              <DocumentTypeIcon mimeType={doc.mimeType} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setDetails(doc)}
                                className="max-w-[18rem] truncate rounded text-left font-medium text-ink transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:hover:text-brand-400"
                              >
                                {doc.name}
                              </button>
                              <p className="truncate text-2xs text-ink-subtle">
                                {doc.uploadedBy} · {extensionOf(doc.name).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </TD>
                        <TD className="whitespace-nowrap text-ink-muted">{projectName(doc.projectId)}</TD>
                        <TD>
                          <Badge tone="outline" size="sm">
                            {doc.version}
                          </Badge>
                        </TD>
                        <TD className="whitespace-nowrap text-ink-muted">
                          {doc.sizeLabel ?? formatFileSize(doc.size)}
                        </TD>
                        <TD className="whitespace-nowrap">
                          <p className="text-ink-muted">{formatRelativeTime(doc.uploadedAt)}</p>
                          <p className="text-2xs text-ink-subtle">{formatDateTime(doc.uploadedAt)}</p>
                        </TD>
                        <TD className="tabular-nums text-ink-muted">
                          {doc.chunkCount ? formatNumber(doc.chunkCount) : '—'}
                        </TD>
                        <TD>
                          <Badge tone={STATUS_TONES[doc.status] ?? 'neutral'} size="sm" dot>
                            {STATUS_LABELS[doc.status] ?? doc.status}
                          </Badge>
                          {doc.status === 'failed' ? (
                            <p className="mt-1 max-w-[14rem] truncate text-2xs text-danger-600" title={doc.errorMessage}>
                              {doc.errorMessage}
                            </p>
                          ) : null}
                        </TD>
                        <TD>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDetails(doc)}
                              aria-label={`View details for ${doc.name}`}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            {doc.status === 'failed' ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRetry(doc)}
                                isLoading={retryId === doc.id}
                                aria-label={`Retry indexing ${doc.name}`}
                                title="Retry indexing"
                              >
                                {retryId === doc.id ? null : <RotateCw className="h-4 w-4" aria-hidden="true" />}
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(doc)}
                              aria-label={`Delete ${doc.name}`}
                              title="Delete document"
                              className="hover:text-danger-600 dark:hover:text-danger-300"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
              <div className="border-t border-line p-4">
                <Pagination
                  page={page}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                  itemLabel="documents"
                />
              </div>
            </>
          )}
        </Card>
      )}

      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title="Upload approved content"
        description="Documents uploaded here are indexed and made available to learning modules and the assistant."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeUpload} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="upload-document-form"
              size="sm"
              isLoading={isSubmitting}
              iconLeft={<UploadCloud className="h-4 w-4" aria-hidden="true" />}
            >
              Upload and index
            </Button>
          </>
        }
      >
        <form id="upload-document-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pb-3">
          {uploadError ? (
            <Callout variant="danger" title="Could not accept this upload">
              {uploadError}
            </Callout>
          ) : null}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'rounded-xl border-2 border-dashed p-6 text-center transition',
              dragging
                ? 'border-brand-400 bg-brand-50/70 dark:bg-brand-600/15'
                : 'border-line-strong bg-elevated/30 hover:border-brand-300 hover:bg-brand-50/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-600/10',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept={ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/15 dark:text-brand-300">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-2 max-w-full truncate text-sm font-semibold text-ink">{selectedFile.name}</p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {formatFileSize(selectedFile.size)} · ready to upload
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-2 rounded text-2xs font-semibold text-danger-600 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-ink-muted shadow-sm">
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-2 text-sm font-semibold text-ink">
                  Drag a file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded text-brand-600 underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-brand-400"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-2xs text-ink-subtle">
                  PDF, Office, CSV, text, markdown or image · up to 10 MB
                </p>
              </div>
            )}
          </div>

          <Input
            label="Document title"
            placeholder="e.g. Environment Setup Guide"
            error={errors.name?.message}
            required
            {...register('name', { validate: validators.required('A document title is required') })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Project"
              placeholder="Select a project"
              error={errors.projectId?.message}
              required
              options={projects.map((project) => ({
                value: project.id,
                label: `${project.name} · ${project.code}`,
              }))}
              {...register('projectId', { validate: validators.required('Select a project') })}
            />
            <Input
              label="Version"
              placeholder="v1.0"
              hint="Use the version printed on the approved source."
              error={errors.version?.message}
              required
              {...register('version', { validate: validators.required('A version is required') })}
            />
          </div>

          <Callout variant="info" title="Indexing and governance">
            Uploading does not publish content directly. The document is chunked and indexed, then
            cited by the assistant with its project scope. Failed uploads can be retried.
          </Callout>
        </form>
      </Modal>

      <Modal
        open={Boolean(details)}
        onClose={() => setDetails(null)}
        title={details?.name}
        description={details ? `${projectName(details.projectId)} · ${details.version}` : undefined}
        size="md"
        footer={
          <>
            {details?.status === 'failed' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleRetry(details);
                  setDetails(null);
                }}
                iconLeft={<RotateCw className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Retry indexing
              </Button>
            ) : null}
            <Button size="sm" onClick={() => setDetails(null)}>
              Close
            </Button>
          </>
        }
      >
        {details ? (
          <div className="space-y-4 pb-3">
            <div className="flex items-start gap-3 rounded-xl border border-line bg-elevated/40 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-ink-muted shadow-sm">
                <DocumentTypeIcon mimeType={details.mimeType} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{details.name}</p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {details.sizeLabel ?? formatFileSize(details.size)} · {extensionOf(details.name).toUpperCase()} ·{' '}
                  {details.version}
                </p>
              </div>
              <Badge tone={STATUS_TONES[details.status] ?? 'neutral'} size="sm" dot className="ml-auto shrink-0">
                {STATUS_LABELS[details.status] ?? details.status}
              </Badge>
            </div>

            {details.errorMessage ? (
              <Callout variant="danger" title="Indexing error">
                {details.errorMessage}
              </Callout>
            ) : null}

            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Project', value: projectName(details.projectId) },
                { label: 'Uploaded by', value: details.uploadedBy },
                { label: 'Uploaded', value: formatDateTime(details.uploadedAt) },
                { label: 'Pages', value: details.pageCount ? formatNumber(details.pageCount) : '—' },
                { label: 'Indexed chunks', value: details.chunkCount ? formatNumber(details.chunkCount) : '—' },
                { label: 'Linked modules', value: details.moduleIds?.length ? details.moduleIds.length : '—' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-card p-3">
                  <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-subtle">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-xs font-medium text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className="text-2xs leading-5 text-ink-subtle">
              {details.status === 'indexed'
                ? 'This document is approved and retrievable by the assistant. Answers that use it include a citation with the source excerpt.'
                : details.status === 'failed'
                  ? 'This document is not retrievable. Export it to a supported format and retry, or re-upload a clean copy.'
                  : 'This document is still being processed. It becomes available to the assistant once indexing completes.'}
            </p>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this document?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be removed from the content library and can no longer be cited by the assistant.`
            : undefined
        }
        confirmLabel="Delete document"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
        isLoading={deleteBusy}
      >
        <p className="rounded-lg bg-elevated/60 p-3 text-xs">
          <span className="font-semibold text-ink">{deleteTarget?.name}</span>
          <span className="block text-ink-subtle">
            {deleteTarget ? `${projectName(deleteTarget.projectId)} · ${deleteTarget.version}` : ''}
          </span>
        </p>
      </ConfirmDialog>
    </div>
  );
}
