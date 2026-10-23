import { useState } from 'react';
import {
  BarChart3,
  Bot,
  Download,
  FileText,
  GraduationCap,
  ShieldCheck,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Callout } from '@/components/common/Callout';
import { DonutChart } from '@/components/charts/DonutChart';
import { LineChart } from '@/components/charts/LineChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useUi';
import { reportService } from '@/services/reports/reportService';
import { formatDateTime } from '@/utils/date';
import { downloadCsv } from '@/utils/export';
import { formatNumber, formatPercent } from '@/utils/format';

const RISK_TONES = { low: 'success', medium: 'warning', high: 'danger' };
const RISK_LABELS = { low: 'Low risk', medium: 'Watch', high: 'At risk' };

const ENGAGEMENT_ICONS = {
  'eng-weekly': UserCheck,
  'eng-assistant': Bot,
  'eng-source': ShieldCheck,
  'eng-duration': Timer,
  'eng-completion': TrendingUp,
};

function EngagementValue({ item }) {
  if (item.unit === 'percent') return formatPercent(item.value, 0);
  if (item.unit === 'minutes') return `${item.value}m`;
  return formatNumber(item.value);
}

/** Manager analytics with completion, department performance and quiz trends. */
export function ReportsPage() {
  useDocumentTitle('Reports');
  const [exporting, setExporting] = useState(false);
  const { data: analytics, status, error, reload } = useAsync(
    () => reportService.getAnalytics(),
    [],
  );

  if (status === 'loading') {
    return <LoadingState label="Building programme analytics" description="Aggregating completion, assessment and engagement data." />;
  }

  if (error) {
    return <ErrorState title="Could not load reports" error={error} onRetry={reload} />;
  }

  const overview = analytics.overview;
  const inactive = Math.max(0, overview.totalLearners - overview.activeLearners);
  const activePercent = Math.round((overview.activeLearners / overview.totalLearners) * 100);

  const handleExport = () => {
    setExporting(true);
    try {
      downloadCsv(
        `programme-report-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          { key: 'department', label: 'Department' },
          { key: 'learners', label: 'Learners' },
          { key: 'completed', label: 'Completed' },
          { key: 'inProgress', label: 'In progress' },
          { key: 'notStarted', label: 'Not started' },
          { key: 'completionRate', label: 'Completion rate (%)' },
          { key: 'averageScore', label: 'Average quiz score (%)' },
        ],
        analytics.departmentProgress,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Programme intelligence"
        title="Reports"
        description="Understand completion, assessment performance and readiness across the induction programme."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            isLoading={exporting}
            iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}
          >
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-ink-subtle">
        <p className="inline-flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          {formatNumber(overview.totalLearners)} learners · {analytics.projects.length} projects ·{' '}
          {formatNumber(analytics.totalDocumentsIndexed ?? overview.totalDocuments)} indexed documents
        </p>
        <p>Generated {formatDateTime(analytics.generatedAt)}</p>
      </div>

      <div className="grid-dashboard">
        <StatCard
          label="Total learners"
          value={formatNumber(overview.totalLearners)}
          icon={Users}
          tone="brand"
          hint={`${overview.activeLearners} active this period`}
        />
        <StatCard
          label="Completion rate"
          value={formatPercent(overview.completionRate, 1)}
          icon={GraduationCap}
          tone="success"
          hint={`Across ${analytics.projects.length} active projects`}
        />
        <StatCard
          label="Average quiz score"
          value={formatPercent(overview.averageQuizScore, 1)}
          icon={TrendingUp}
          tone="accent"
          hint="Latest score per attempted assessment"
        />
        <StatCard
          label="Readiness rate"
          value={formatPercent(overview.readinessRate, 1)}
          icon={ShieldCheck}
          tone="warning"
          hint={`${overview.averageTimeToReadinessDays} days average to readiness`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Assessment performance trend</h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Average quiz score and pass rate over the last 30 days
              </p>
            </div>
            <Badge tone="success" size="sm" icon={<TrendingUp className="h-3 w-3" />}>
              +8.2 pts
            </Badge>
          </div>
          <LineChart
            data={analytics.quizTrends}
            series={[
              { key: 'value', label: 'Average score', color: '#2563eb', area: true },
              { key: 'secondaryValue', label: 'Pass rate', color: '#6366f1', area: false },
            ]}
            height={250}
            className="mt-4"
            ariaLabel="Average quiz score and pass rate trend over the last 30 days"
          />
        </Card>

        <Card className="p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Learner engagement</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Active participation in the current window</p>
          </div>
          <DonutChart
            segments={[
              { label: 'Active learners', value: overview.activeLearners, color: '#2563eb' },
              { label: 'Not active', value: inactive, color: '#e2e8f0' },
            ]}
            size={172}
            thickness={19}
            centerValue={`${activePercent}%`}
            centerLabel="active"
            className="mt-5"
            ariaLabel={`${overview.activeLearners} active learners out of ${overview.totalLearners}`}
          />
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-2xs uppercase tracking-wide text-ink-subtle">Avg. time to ready</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                {overview.averageTimeToReadinessDays}
                <span className="ml-1 text-xs font-normal text-ink-muted">days</span>
              </p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wide text-ink-subtle">Documents</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                {formatNumber(overview.totalDocuments)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Department progress</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Completion and assessment performance by delivery department
            </p>
          </div>
          <Badge tone="neutral" size="sm">
            {analytics.departmentProgress.length} departments
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table containerClassName="rounded-none border-x-0 border-b-0" caption="Department progress">
            <THead>
              <TR>
                <TH>Department</TH>
                <TH>Learners</TH>
                <TH>Completed</TH>
                <TH>In progress</TH>
                <TH>Not started</TH>
                <TH>Completion</TH>
                <TH>Avg. score</TH>
              </TR>
            </THead>
            <TBody>
              {analytics.departmentProgress.map((department) => (
                <TR key={department.department}>
                  <TD className="font-medium text-ink">{department.department}</TD>
                  <TD className="tabular-nums text-ink-muted">{department.learners}</TD>
                  <TD className="tabular-nums text-ink-muted">{department.completed}</TD>
                  <TD className="tabular-nums text-ink-muted">{department.inProgress}</TD>
                  <TD className="tabular-nums text-ink-muted">{department.notStarted}</TD>
                  <TD className="min-w-[10rem]">
                    <ProgressBar
                      value={department.completionRate}
                      showValue
                      valueLabel={formatPercent(department.completionRate, 1)}
                      size="xs"
                      tone={department.completionRate >= 65 ? 'success' : department.completionRate >= 50 ? 'brand' : 'warning'}
                      ariaLabel={`${department.department} completion`}
                    />
                  </TD>
                  <TD className="tabular-nums text-ink-muted">{formatPercent(department.averageScore, 1)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-ink">Project comparison</h2>
            <p className="mt-0.5 text-xs text-ink-muted">Delivery status across the active portfolio</p>
          </div>
          <div className="overflow-x-auto">
            <Table containerClassName="rounded-none border-x-0 border-b-0" caption="Project comparison">
              <THead>
                <TR>
                  <TH>Project</TH>
                  <TH>Learners</TH>
                  <TH>Completion</TH>
                  <TH>Avg. score</TH>
                  <TH>Risk</TH>
                </TR>
              </THead>
              <TBody>
                {analytics.projects.map((project) => (
                  <TR key={project.id}>
                    <TD>
                      <p className="font-medium text-ink">{project.name}</p>
                      <p className="text-2xs text-ink-subtle">{project.client}</p>
                    </TD>
                    <TD className="tabular-nums text-ink-muted">{project.learners}</TD>
                    <TD className="min-w-[8rem]">
                      <ProgressBar
                        value={project.completionRate}
                        showValue
                        valueLabel={formatPercent(project.completionRate, 1)}
                        size="xs"
                        tone={project.riskLevel === 'high' ? 'warning' : 'brand'}
                      />
                    </TD>
                    <TD className="tabular-nums text-ink-muted">{formatPercent(project.averageScore, 1)}</TD>
                    <TD>
                      <Badge tone={RISK_TONES[project.riskLevel] ?? 'neutral'} size="sm" dot>
                        {RISK_LABELS[project.riskLevel] ?? project.riskLevel}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Engagement signals</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Leading indicators for induction health</p>
          <ul className="mt-4 divide-y divide-line">
            {analytics.engagement.map((item) => {
              const Icon = ENGAGEMENT_ICONS[item.id] ?? BarChart3;
              return (
                <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-muted">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-ink">{item.label}</p>
                      <p className="text-sm font-semibold tabular-nums text-ink">
                        <EngagementValue item={item} />
                        <span
                          className={
                            item.change > 0
                              ? 'ml-1.5 text-2xs font-semibold text-success-600 dark:text-success-400'
                              : 'ml-1.5 text-2xs font-medium text-ink-subtle'
                          }
                        >
                          {item.change > 0 ? `+${item.change}%` : 'stable'}
                        </span>
                      </p>
                    </div>
                    <p className="mt-0.5 text-2xs leading-5 text-ink-subtle">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Callout variant="warning" title="Portfolio attention required">
        Project NIMBUS is tracking at {formatPercent(analytics.projects.find((project) => project.riskLevel === 'high')?.completionRate ?? 0, 1)} completion. Review
        pending activations and follow up with the project learning lead to protect the readiness date.
      </Callout>

      <div className="flex items-center gap-2 text-2xs text-ink-subtle">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        Reports include learners across all projects. Assistant engagement is measured from grounded
        questions only.
      </div>
    </div>
  );
}
